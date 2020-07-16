import React from 'react';
import ReactDOM from 'react-dom';
import { dashboard as section } from '../metadata.json';
import Swal from "sweetalert2";
// import { Notification, DashboardViewer, DashboardFilter } from ''
import Notification from './Notification'
import DashboardViewer from './Dashboard'
import DashboardFilter from './DashboardFilter'

import { Button, Form, Col, Row } from 'react-bootstrap'
import '../../gui/src/public/css/sweetalert.css';
import Flippy, { FrontSide, BackSide } from 'react-flippy';
import DashboardEditorModal from './components/Modals/DashboardEditorModal'
import DashboardEditor from "./dashboardEditor"
import Select from 'react-select'
import ReactToPrint from 'react-to-print'

class DashboardManager extends React.Component {
  constructor(props) {
    super(props);
    this.core = this.props.args;
    this.userProfile = this.core.make("oxzion/profile").get();
    this.props.setTitle(section.title.en_EN);
    this.state = {
      showModal: false,
      modalType: "",
      modalContent: {},
      flipped: false,
      uuid: this.props.uuid,
      dashList: [],
      inputs: {},
      dashboardBody: "",
      loadEditor: false,
      filterConfiguration: [],
      showFilter: false,
      dashboardFilter: [],
      drilldownDashboardFilter: [],
      hideEdit: this.props.hideEdit,
      dashboardStack: []
    };
    this.appId = this.props.app;
    this.proc = this.props.proc;
    this.refresh = React.createRef();
    this.notif = React.createRef();
    this.restClient = this.core.make('oxzion/restClient');
    this.deleteDashboard = this.deleteDashboard.bind(this)
  }

  componentDidMount() {
    if (this.props.uuid && this.props.uuid != "" && this.props.uuid != 0) {
      this.getDashboardHtmlDataByUuid(this.props.uuid)
    } else {
      this.fetchDashboards(false)
    }
  }

  async getUserDetails(uuid) {
    let rolesList = await this.restClient.request(
      "v1",
      "organization/" + this.props.selectedOrg + "/user/" + uuid + "/profile",
      {},
      "get"
    );
    return rolesList;
  }

  dashboardOperation = (e, operation) => {
    if (operation === "Delete" || operation === "Activate" || operation === "SetDefault") {
      this.setState({ showModal: true, modalContent: e, modalType: operation })
    }
    else {
      this.setState({ showModal: true, modalContent: e, modalType: operation, uuid: e.uuid })
    }
  }

  async getDashboardHtmlDataByUuid(uuid) {
    let helper = this.restClient;
    let dashboardStack = this.state.dashboardStack
    let inputs = this.state.inputs !== undefined ? this.state.inputs : undefined;
    let dashData = [];
    let response = await helper.request(
      "v1",
      "analytics/dashboard/" + uuid,
      {},
      "get"
    );
    let dash = response.data.dashboard;
    dashData.push({ dashData: response.data });
    inputs["dashname"] = dash
    dashboardStack.push({ data: dash, drilldownDashboardFilter: [] })
    this.setState({ dashboardBody: "", inputs, uuid: uuid, dashList: dashData, filterConfiguration: dash.filter_configuration, dashboardStack: dashboardStack })
  }
  async fetchDashboards(isRefreshed) {
    let that = this
    let helper = this.restClient;
    let inputs = this.state.inputs !== undefined ? this.state.inputs : undefined;
    let dashboardStack=this.state.dashboardStack

    let response = await helper.request('v1', '/analytics/dashboard?filter=[{"sort":[{"field":"name","dir":"asc"}],"skip":0,"take":0}]', {}, 'get');
    if (response.data.length > 0) {
      that.setState({ dashList: response.data, uuid: '' })
      if (inputs["dashname"] != undefined) {
        //setting value of the dropdown after fetch
        response.data.map(dash => {
          if(dash.name === inputs["dashname"]["name"]){
            inputs["dashname"] = dash
            !isRefreshed && dashboardStack.push({ data: dash, drilldownDashboardFilter: [] }) 
            that.setState({ inputs, dashList: response.data, uuid: dash.uuid, filterConfiguration: dash.filter_configuration,dashboardStack:dashboardStack })
          } else {
              that.setState({ inputs: this.state.inputs })
          }

        })
      } else {
        //setting default dashboard on page load
        response.data.map(dash => {
          if (dash.isdefault === "1") {
            inputs["dashname"] = dash
            !isRefreshed && dashboardStack.push({ data: dash, drilldownDashboardFilter: [] }) 
            that.setState({ dashboardBody: "", inputs, dashList: response.data, uuid: dash.uuid, filterConfiguration: dash.filter_configuration ,dashboardStack:dashboardStack})
          }
        })
      }
    } else {
      this.setState({ dashboardBody: "NO OI FOUND" })
    }
  }

  setTitle(title) { }

  deleteDashboard() {
    let inputs = { ...this.state.inputs }
    if (inputs["dashname"] != undefined) {
      inputs["dashname"] = undefined
      this.setState({ inputs: {} })
    }
  }

  editDashboard() {
    var element = document.getElementById("dashboard-editor-div");
    element != undefined && element.classList.remove("hide-dash-editor") //fixes dropdown bug in mozilla firefox cused due to charts
    this.setState({ flipped: true, uuid: this.state.uuid, loadEditor: true })
  }

  createDashboard() {
    var element = document.getElementById("dashboard-editor-div");
    element != undefined &&
      element.classList.remove("hide-dash-editor") //fixes dropdown bug in mozilla firefox cused due to charts
    let inputs = { ...this.state.inputs }
    inputs["dashname"] !== undefined && delete inputs.dashname
    this.setState({ flipped: true, uuid: "", inputs: inputs, loadEditor: true })
  }

  showFilter() {
    this.setState({ showFilter: true }, state => {
      var element = document.getElementById("filter-form-container");
      element.classList.remove("disappear");
      var element = document.getElementById("dashboard-preview-container");
      element.classList.add("disappear");
    })
  }

  hideFilter() {
    this.setState({ showFilter: false })
    var element = document.getElementById("dashboard-preview-container");
    element.classList.remove("disappear");
  }

  applyDashboardFilter(filter) {
    this.setState({ dashboardFilter: filter })
    this.hideFilter()
  }

  getDashboardFilters() {
    if (this.state.filterConfiguration) {
      try {
        let validJson = JSON.parse(this.state.filterConfiguration)
        return validJson
      }
      catch (e) {
        console.error("Invalid json filter found in the database");
        return []
      }
    }
    else {
      return []
    }
  }

  drilldownToDashboard(e, type) {
    //pushing next dashboard details into dashboard stack
    let dashboardStack = this.state.dashboardStack
    let value = JSON.parse(e.value)
    dashboardStack.push({ data: value, drilldownDashboardFilter: e.drilldownDashboardFilter })
    this.setState({ dashboardStack: dashboardStack }, () => { this.changeDashboard(e) })
  }


  changeDashboard(event) {
    //defining change dashboard explicitly to support reset dashboard on handle change
    let inputs = {}
    inputs = { ...this.state.inputs }
    let name
    let value
    var element = document.getElementById("dashboard-editor-div");

    value = JSON.parse(event.value)
    element != undefined && element.classList.add("hide-dash-editor")
    inputs["dashname"] = value
    this.setState({ inputs: inputs, uuid: value["uuid"], filterConfiguration: value["filter_configuration"], showFilter: false, drilldownDashboardFilter: event.drilldownDashboardFilter })
  }

  handleChange(event, inputName) {
    let inputs = {}
    inputs = { ...this.state.inputs }
    let name
    let value
    // resetting stack on manual change of dashboard
    let dashboardStack = []
    value = JSON.parse(event.value)
    dashboardStack.push({ data: value, drilldownDashboardFilter: [] })
    if (inputName && inputName == "dashname") {
      var element = document.getElementById("dashboard-editor-div");
      name = inputName
      value = JSON.parse(event.value)
      element != undefined && element.classList.add("hide-dash-editor")
    } else {
      name = event.target.name
      value = event.target.value
    }
    inputs[name] = value
    this.setState({ inputs: inputs, uuid: value["uuid"], filterConfiguration: value["filter_configuration"], showFilter: false, drilldownDashboardFilter: event.drilldownDashboardFilter, dashboardStack: dashboardStack })
  }

  rollupToDashboard() {
    let stack = this.state.dashboardStack
    //removing the last dashboard from stack
    stack.pop()
    if (stack && stack.length > 0) {
      let dashboard = stack[stack.length - 1]
      let event = {}
      event.value = JSON.stringify(dashboard.data)
      event.drilldownDashboardFilter = dashboard.drilldownDashboardFilter
      this.setState({ dashboardStack: stack }, () => { this.changeDashboard(event) })

    }
  }

  render() {
    return (
      <div className="dashboard">
        <Notification ref={this.notif} />
        <Flippy
          flipDirection="horizontal" // horizontal or vertical
          isFlipped={this.state.flipped}
          flipOnClick={false}
          style={{ width: '100%', height: '100vh' }} /// these are optional style, it is not necessary
        >
          <FrontSide>
            {
              !this.props.hideEdit && this.userProfile.key.privileges.MANAGE_DASHBOARD_WRITE &&
              <div className="row">
                <Button className="create-dash-btn" onClick={() => this.createDashboard()} title="Add New OI"><i className="fa fa-plus" aria-hidden="true"></i> Create OI</Button>
              </div>
            }

            <div className="filterDiv">
              {this.state.showFilter &&
                <DashboardFilter
                  core={this.core}
                  filterMode="APPLY"
                  hideFilterDiv={() => this.hideFilter()}
                  filterConfiguration={this.getDashboardFilters()}
                  setDashboardFilter={(filter) => this.applyDashboardFilter(filter)}
                />
              }
            </div>

            {(this.state.dashList != undefined && this.state.dashList.length > 0) ?
              <div id="dashboard-preview-container">
                <div className="dash-manager-bar">
                  <Form className="dashboard-manager-items">
                    <Row>
                      <Col lg="4" md="4" sm="4">
                        {
                          !this.props.hideEdit && this.userProfile.key.privileges.MANAGE_DASHBOARD_WRITE &&
                          <Form.Group as={Row} >
                            <Col>
                              <Select
                                name="dashname"
                                className="react-select-container"
                                placeholder="Select OI"
                                id="dashname"
                                onChange={(e) => this.handleChange(e, "dashname")}
                                value={JSON.stringify(this.state.inputs["dashname"]) != undefined ? { value: this.state.inputs["dashname"], label: this.state.inputs["dashname"]["name"] } : ""}
                                options={this.state.dashList &&
                                  this.state.dashList.map((option, index) => {
                                    return {
                                      value: JSON.stringify(option),
                                      label: option.name,
                                      key: option.uuid
                                    }
                                  })
                                }
                              />
                            </Col>
                          </Form.Group>
                        }
                      </Col>
                      <div className="dash-manager-buttons">
                        {(this.state.uuid !== "" && this.state.inputs["dashname"] != undefined) &&
                          <>
                            <ReactToPrint
                              trigger={() => {
                                return <Button title="Print OI">
                                  <i className="fa fa-print" aria-hidden="true"></i>
                                </Button>
                              }}
                              content={() => this.dashboardViewerRef}
                            />
                            <Button onClick={() => this.showFilter()} title="Filter OI">
                              <i className="fa fa-filter" aria-hidden="true"></i>
                            </Button>
                            {!this.props.hideEdit && this.userProfile.key.privileges.MANAGE_DASHBOARD_WRITE &&
                              <Button onClick={() => this.editDashboard()} title="Edit OI">
                                <i className="fa fa-edit" aria-hidden="true"></i>
                              </Button>
                            }
                            {
                              (this.userProfile.key.privileges.MANAGE_DASHBOARD_DELETE &&
                                this.state.inputs["dashname"]["isdefault"] == "0") &&
                              <Button onClick={() => this.dashboardOperation(this.state.inputs["dashname"], "Delete")} title="Delete OI">
                                <i className="fa fa-trash" aria-hidden="true"></i>
                              </Button>
                            }
                            {this.userProfile.key.privileges.MANAGE_DASHBOARD_WRITE &&
                              (this.state.inputs["dashname"] != undefined && this.state.inputs["dashname"]["isdefault"] == "0") ?
                              (this.props.hideEdit == false &&
                                <Button
                                  onClick={() => this.dashboardOperation(this.state.inputs["dashname"], "SetDefault")}
                                  title="Make current OI as default OI"
                                >MAKE DEFAULT
                                </Button>
                              )
                              : (this.props.hideEdit == false &&
                                <span style={{ color: "white", fontWeight: "bolder" }}>Default OI</span>
                              )

                            }
                          </>
                        }
                      </div>

                    </Row>
                  </Form>
                </div>

                <div className="dashboard-viewer-div">
                  {
                    !this.props.hideEdit &&
                    <div className="dashboard-preview-tab">
                      <span>OI Previewer</span>
                    </div>
                  }
                  {
                    this.state.uuid !== "" &&
                    <DashboardViewer
                      drilldownToDashboard={(e, type) => this.drilldownToDashboard(e, type)}
                      ref={el => (this.dashboardViewerRef = el)}
                      key={this.state.uuid}
                      uuid={this.state.uuid}
                      core={this.core}
                      setTitle={this.props.setTitle}
                      proc={this.props.proc}
                      dashboardFilter={this.state.dashboardFilter}
                      applyDashboardFilter={filter => this.applyDashboardFilter(filter)}
                      drilldownDashboardFilter={this.state.drilldownDashboardFilter}
                      dashboardStack={this.state.dashboardStack}
                      rollupToDashboard={() => this.rollupToDashboard()}
                    />
                  }

                </div>
              </div>
              :
              <div className="dashboard-viewer-div" style={{ textAlign: "center", fontWeight: "bolder", fontSize: "20px" }}>
                {this.state.dashboardBody}
              </div>
            }
          </FrontSide>
          <BackSide>
            {this.state.flipped &&
              <div id="dashboard-editor-div">
                {
                  this.state.loadEditor &&
                  <DashboardEditor
                    args={this.core}
                    notif={this.notif}
                    setTitle={this.setTitle}
                    key={this.state.uuid}
                    dashboardId={this.state.uuid}
                    flipCard={(status) => {
                      if (status === "Saved") {
                        //refreshing the dashboardData
                        this.fetchDashboards(true)

                      }
                      else if (status === "") {
                        var element = document.getElementById("dashboard-editor-div");
                        element.classList.add("hide-dash-editor");
                      }
                      this.setState({ flipped: false, loadEditor: false })
                    }}
                  />
                }
              </div>
            }
          </BackSide>
        </Flippy>

        <DashboardEditorModal
          osjsCore={this.core}
          modalType={this.state.modalType}
          show={this.state.showModal}
          onHide={() => { this.setState({ showModal: false }) }}
          content={this.state.modalContent}
          notification={this.notif}
          refreshDashboard={() => this.fetchDashboards(true)}
          deleteDashboard={this.deleteDashboard}
        />
      </div>
    );
  }
}

export default DashboardManager;

