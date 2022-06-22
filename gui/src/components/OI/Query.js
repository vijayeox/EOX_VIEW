import React from "react";
import dashboardJson from "../../../metadata.json";
// import { query as section } from '../metadata.json';
import { Form, Row, Col, Button, Tabs, Tab } from "react-bootstrap";
import OX_Grid from "./OX_Grid";
import Notification from "../../Notification";
import Switch from "react-switch";
import QueryModal from "../Modals/QueryModal";
import QueryResult from "../Query/QueryResult";
// import { FormSchema } from "./components/Modals/QueryModalSchema.json"
import querySchemaJson from "../Modals/QueryModalSchema.json";
import JSONFormRenderer from "../../JSONFormRenderer";
import ReactDOM from "react-dom";
import "../../public/css/query.scss";

class Query extends React.Component {
  constructor(props) {
    super(props);
    this.core = this.props.args;
    this.ref = React.createRef();
    this.props.setTitle(dashboardJson.query.title.en_EN);
    this.notif = React.createRef();
    this.state = {
      dataSourceOptions: [],
      inputs: {},
      errors: {},
      showQueryModal: false,
      modalType: "",
      modalContent: {},
      checked: {},
      activeTab: "querylist",
      queryResult: null,
      queryColumns: null,
      queryName: "",
      elapsedTime: 0,
    };
    this.refresh = React.createRef();
    this.handleSwitch = this.handleSwitch.bind(this);
    this.renderButtons = this.renderButtons.bind(this);
    this.checkedList = {};
    this.loader = this.core.make("oxzion/splash");
  }

  handleSwitch(checked, event, id) {
    let toggleList = { ...this.state.checked };
    toggleList[id] = checked;
    this.setState({ checked: toggleList });
  }

  async fetchDataSource() {
    let helper = this.core.make("oxzion/restClient");
    let response = await helper.request("v1", 'analytics/datasource?filter=[{"sort":[{"field":"name","dir":"asc"}],"skip":0,"take":10000}]', {}, "get");
    this.setState({ dataSourceOptions: response.data });
  }

  handleChange(e, instance) {
    let name = "";
    let value = "";
    let errors = this.state.errors;
    errors[e.target.name] = "";
    if (e.target.name === "datasourcename") {
      const selectedIndex = e.target.options.selectedIndex;
      let uuid = e.target.options[selectedIndex].getAttribute("data-key");
      name = e.target.name;
      value = [e.target.value, uuid];
      errors["datasourcename"] = "";
    } else {
      name = e.target.name;
      value = e.target.value;
      errors["configuration"] = "";
    }
    instance.setState({ inputs: { ...instance.state.inputs, [name]: value, errors: errors } });
  }

  componentDidMount() {
    this.fetchDataSource();
    this.setState({ checked: this.checkedList });
  }

  validateform() {
    let validForm = true;
    let errors = {};
    if (!this.state.inputs["datasourcename"]) {
      validForm = false;
      errors["datasourcename"] = "*Please select the datasource";
    }
    if (!this.ref.current.getFormConfig(false)) {
      errors["configuration"] = "*Please enter the query";
      validForm = false;
    }
    this.setState({ errors: errors });
    return validForm;
  }

  onsaveQuery() {
    if (this.validateform()) {
      let inputsCopy = { ...this.state.inputs };
      inputsCopy["configuration"] = this.ref.current.getFormConfig(false);
      this.setState({ inputs: inputsCopy }, () => {
        this.setState({ showQueryModal: true, modalContent: "", modalType: "Save" });
      });
    }
  }

  renderEmpty() {
    return [<React.Fragment key={1} />];
  }

  replaceParams(route, params) {
    if (!params) {
      return route;
    }
    var regex = /\{\{.*?\}\}/g;
    let m;
    while ((m = regex.exec(route)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === regex.lastIndex) {
        regex.lastIndex++;
      }
      // The result can be accessed through the `m`-variable.
      m.forEach((match, groupIndex) => {
        route = route.replace(match, params[match.replace(/\{\{|\}\}/g, "")]);
      });
    }
    return route;
  }

  renderButtons(e, action) {
    var actionButtons = [];
    let that = this;
    Object.keys(action).map(function (key, index) {
      var string = that.replaceParams(action[key].rule, e);
      var showButton = eval(string);
      if (action[key].name === "toggleActivate") {
        that.checkedList[e.name] = showButton; //check if the datasource is deleted or not
        showButton = true; //always show the button
      }
      var buttonStyles = action[key].icon
        ? {
            width: "auto",
          }
        : {
            width: "auto",
            // paddingTop: "5px",
            color: "white",
            fontWeight: "600",
          };
      showButton
        ? action[key].name === "toggleActivate"
          ? actionButtons.push(
              <abbr className={that.checkedList[e.name] ? "deactivateDash mx-3 px-3" : "activateDash mx-3 px-3"} title={that.checkedList[e.name] ? "Deactivate" : "Activate"} key={index}>
                <Switch id={e.name} onChange={() => that.buttonAction(action[key], e)} checked={that.state.checked[e.name] ? that.state.checked[e.name] : false} onClick={() => that.buttonAction(action[key], e)} onColor='#86d3ff' onHandleColor='#2693e6' handleDiameter={10} uncheckedIcon={false} checkedIcon={false} boxShadow='0px 1px 5px rgba(0, 0, 0, 0.6)' activeBoxShadow='0px 0px 1px 10px rgba(0, 0, 0, 0.2)' height={20} width={33} className='react-switch' />
              </abbr>
            )
          : actionButtons.push(
              <abbr title={action[key].name} key={index} className={action[key].classNames}>
                <Button key={"manage" + action[key].name} className='btn manage-btn k-grid-edit-command' variant='primary' onClick={() => that.buttonAction(action[key], e)} style={buttonStyles}>
                  {action[key].icon ? <i className={action[key].icon + " manageIcons"}></i> : action[key].name}
                </Button>
              </abbr>
            )
        : actionButtons.push(
            <Button key={"space-btn"} style={{ visibility: "hidden" }}>
              <i className='fa fa-user'></i>
            </Button>
          );
    });
    return actionButtons;
  }

  buttonAction(action, item) {
    if (action.name !== undefined) {
      if (action.name === "toggleActivate" && item.isdeleted == "0") this.setState({ showQueryModal: true, modalContent: item, modalType: "Delete" });
      else if (action.name === "toggleActivate" && item.isdeleted == "1") this.setState({ showQueryModal: true, modalContent: item, modalType: "Activate" });
      else if (action.name === "execute" && item.isdeleted == "0") this.setState({ showQueryModal: true, modalContent: item, modalType: "Execute" });
      else if (action.name === "edit" && item.isdeleted == "0") this.setState({ showQueryModal: true, modalContent: item, modalType: "Edit" });
    }
  }

  toggleQueryForm(mode) {
    let element = document.getElementById("query-form");
    let btn = document.getElementById("add-query-btn");
    if (element !== undefined) {
      if (mode === "hide") {
        element.classList.add("disappear");
        btn.classList.remove("disappear");
        this.setState({ inputs: {} });
      } else {
        element.classList.remove("disappear");
        btn.classList.add("disappear");
      }
    }
  }

  async runQuery(e) {
    let that = this;
    this.loader.show();
    let helper = this.core.make("oxzion/restClient");
    let formData = {};
    let queryname = "";
    if (e !== undefined) {
      //executing stored queries
      formData["configuration"] = JSON.stringify(e.configuration);
      formData["datasource_id"] = e.datasource_uuid;
      if (e.name) queryname = e.name;
    } else {
      //executing queries from form
      formData["configuration"] = that.ref.current.getFormConfig(false);
      formData["datasource_id"] = this.state.inputs["datasourcename"][1];
    }
    try {
      var start = window.performance.now();
      let response = await helper.request("v1", "analytics/query/preview", formData, "filepost");
      var end = window.performance.now();
      var runtime = end - start;
      if (response.status === "success") {
        let columnNames;
        let columnNameObj = [];
        if (response.data !== undefined) {
          //if response is a array show OX_GRID
          if (Array.isArray(response.data.result)) {
            columnNames = Object.keys(response.data.result[0]);
          }
          // prepare column names for OX_Grid
          if (columnNames != undefined) {
            columnNames.map((name) => {
              columnNameObj.push({ title: name, field: name });
            });
          }
          this.setState({ queryResult: response.data.result, queryColumns: columnNameObj, elapsedTime: runtime, queryName: queryname, activeTab: "results" });
          if (document.getElementById("result-tab-div") !== null) {
            this.destroyResult();
            this.setState({ queryResult: response.data.result, queryColumns: columnNameObj, elapsedTime: runtime, queryName: queryname, activeTab: "results" });
            this.renderResult();
          } else {
            this.setState({ queryResult: response.data.result, queryColumns: columnNameObj, elapsedTime: runtime, queryName: queryname, activeTab: "results" });
            this.renderResult();
          }
        } else {
          this.setState({ queryResult: response.data.result, elapsedTime: runtime, queryName: queryname, activeTab: "results" });
        }
        this.notif.current.notify("Query Executed ", "Operation succesfully completed", "success");
      } else {
        this.loader.destroy();
        this.notif.current.notify("Error", "Operation failed " + response.message, "danger");
      }
    } catch (err) {
      console.log(err);
      this.loader.destroy();
      this.notif.current.notify("Error", "Operation failed", "danger");
    }
  }

  destroyResult() {
    this.setState({ queryResult: null, queryColumns: null });
    ReactDOM.unmountComponentAtNode(document.getElementById("result-tab-div"));
  }

  renderResult() {
    ReactDOM.render(<QueryResult queryResult={this.state.queryResult} elapsedTime={this.state.elapsedTime} queryName={this.state.queryName} core={this.core} loader={this.loader} columns={this.state.queryColumns} />, document.getElementById("result-tab-div"));
  }

  render() {
    return (
      <div className='query full-height'>
        <Notification ref={this.notif} />
        <Row>
          <Button id='add-query-btn' onClick={() => this.toggleQueryForm("display")}>
            <i className='fa fa-plus' aria-hidden='true'></i>
            Add/Run Query
          </Button>
        </Row>
        <div id='query-form' className='query-form disappear'>
          <Form>
            <Form.Group as={Row}>
              <button type='button' style={{ width: "100%" }} className='close' aria-label='Close' onClick={() => this.toggleQueryForm("hide")}>
                <span aria-hidden='true' className='query-form-close-btn'>
                  &times;
                </span>
              </button>
            </Form.Group>
            <Form.Group as={Row}>
              <Form.Label column lg='3'>
                Data Source Name
              </Form.Label>
              <Col lg='9'>
                <Form.Control as='select' onChange={(e) => this.handleChange(e, this)} value={this.state.inputs["datasourcename"] !== undefined ? this.state.inputs["datasourcename"][0] : -1} name='datasourcename'>
                  <option disabled value={-1} key={-1}></option>
                  {this.state.dataSourceOptions &&
                    this.state.dataSourceOptions.map((option, index) => (
                      <option key={option.uuid} data-key={option.uuid} value={option.name}>
                        {option.name}
                      </option>
                    ))}
                </Form.Control>
                <Form.Text className='text-muted errorMsg'>{this.state.errors["datasourcename"]}</Form.Text>
              </Col>
            </Form.Group>
            <Form.Group as={Row}>
              <Form.Label column lg='3'>
                Configuration:
              </Form.Label>
              <Col lg='9'>
                {/* <Form.Control
                  placeholder="Enter your Query here"
                  as="textarea"
                  row="2"
                  name="configuration"
                  value={this.state.inputs["configuration"] || ''}
                  onChange={(e) => this.handleChange(e, this)}
                /> */}
                <JSONFormRenderer formSchema={querySchemaJson.FormSchema["_DEFAULT_OPTIONAL_FIELDS"]} values={this.ref.current ? JSON.parse(this.ref.current.getFormConfig(false)) : {}} subForm={true} ref={this.ref} />
                <Form.Text className='text-muted errorMsg'>{this.state.errors["configuration"]}</Form.Text>
              </Col>
            </Form.Group>
            <Button className='' onClick={() => (this.validateform() ? this.runQuery() : null)}>
              <i className='fa fa-gear'></i> Run Query
            </Button>
            <Button onClick={() => this.onsaveQuery()}>Save Query</Button>
          </Form>
        </div>
        <div className='query-result-div'>
          <Tabs defaultActiveKey='querylist' id='controlled-tab' activeKey={this.state.activeTab} onSelect={(k) => this.setState({ activeTab: k })}>
            <Tab eventKey='querylist' title='All Queries'>
              <div className='col=md-12 querylist-div'>
                <OX_Grid
                  ref={this.refresh}
                  osjsCore={this.core}
                  data={"analytics/query?show_deleted=true"}
                  filterable={true}
                  reorderable={true}
                  sortable={true}
                  pageable={true}
                  columnConfig={[
                    {
                      title: "Name",
                      field: "name",
                    },
                    {
                      title: "Actions",
                      cell: (e) =>
                        this.renderButtons(e, [
                          {
                            name: "execute",
                            rule: "{{isdeleted}}==0",
                            icon: "fa fa-gear",
                            classNames: "mr-3"
                          },
                          {
                            name: "edit",
                            rule: "{{isdeleted}}==0",
                            icon: "fa fa-edit",
                            classNames: "mx-3"
                          },
                          {
                            name: "toggleActivate",
                            rule: "{{isdeleted}}==0",
                            icon: "fa fa-trash",
                          },
                        ]),
                      filterCell: (e) => this.renderEmpty(),
                    },
                  ]}
                />
              </div>
            </Tab>
            <Tab eventKey='results' title='Result'>
              <div id='result-tab-div'></div>
            </Tab>
          </Tabs>
        </div>
        {this.state.showQueryModal && (
          <QueryModal
            runQuery={(content) => this.runQuery(content)}
            osjsCore={this.core}
            modalType={this.state.modalType}
            show={this.state.showQueryModal}
            refreshGrid={this.refresh}
            content={this.state.modalContent}
            hideQueryForm={() => this.toggleQueryForm("hide")}
            onHide={() => this.setState({ showQueryModal: false })}
            configuration={this.state.inputs["configuration"]}
            datasourcename={this.state.inputs["datasourcename"] != undefined ? this.state.inputs["datasourcename"][0] : ""}
            datasourceuuid={this.state.inputs["datasourcename"] != undefined ? this.state.inputs["datasourcename"][1] : ""}
            dataSourceOptions={this.state.dataSourceOptions}
            notification={this.notif}
            resetInput={() => this.setState({ inputs: {} })}
          />
        )}
      </div>
    );
  }
}

export default Query;
