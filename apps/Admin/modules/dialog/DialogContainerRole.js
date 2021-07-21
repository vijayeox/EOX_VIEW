import {React,Notification,KendoDataQuery,KendoReactGrid,KendoReactWindow,KendoReactInput,KendoReactRipple} from "oxziongui";
// import TextareaAutosize from "react-textarea-autosize";
import { SaveCancel } from "../components/index";

export default class DialogContainer extends React.Component {
  constructor(props) {
    super(props);
    this.core = this.props.args;
    this.state = {
      roleInEdit: this.props.dataItem || null,
      masterList: [],
      privilegeData: [],
      sort: [{ field: "name", dir: "desc" }],
      isAdmin: null
    };
    this.onChangeCheckbox = this.onChangeCheckbox.bind(this);
    this.vals = {
      read: ["0", "1"],
      write: ["1", "3"],
      create: ["3", "7"],
      delete: ["7", "15"]
    };
    this.notif = React.createRef();
  }

  UNSAFE_componentWillMount() {
    this.props.formAction == "put"
      ? this.getPrivilegeData().then(response => {
          this.setState({
            masterList: response.data.masterPrivilege
          });
          let temp = [];
          Object.keys(response.data.rolePrivilege).map(currentValue => {
            temp[response.data.rolePrivilege[currentValue].privilege_name] =
              response.data.rolePrivilege[currentValue].permission;
          });
          this.setState({
            privilegeData: temp,
            isAdmin:
              this.state.roleInEdit.name.toUpperCase() == "ADMIN"
                ? true
                : this.props.diableField
          });
        })
      : this.masterList().then(response => {
          this.setState({
            masterList: response.data.masterPrivilege,
            isAdmin: false
          });
        });
  }

  async getPrivilegeData() {
    let helper2 = this.core.make("oxzion/restClient");
    let privilegedata = await helper2.request(
      "v1",
      "account/" +
        this.props.selectedOrg +
        "/masterprivilege/" +
        this.props.dataItem.uuid,
      {},
      "get"
    );
    return privilegedata;
  }

  async masterList() {
    let helper2 = this.core.make("oxzion/restClient");
    let masterData = await helper2.request(
      "v1",
      "account/" + this.props.selectedOrg + "/masterprivilege",
      {},
      "get"
    );
    return masterData;
  }

  async pushData() {
    let helper = this.core.make("oxzion/restClient");
    let table = [];
    Object.keys(this.state.privilegeData).map(currentValue => {
      table.push({
        privilege_name: currentValue,
        permission: this.state.privilegeData[currentValue]
      });
    });
    if (this.props.formAction == "post") {
      let roleAddData = await helper.request(
        "v1",
        "account/" + this.props.selectedOrg + "/role",
        {
          name: this.state.roleInEdit.name,
          description: this.state.roleInEdit.description,
          privileges: table
        },
        "post"
      );
      return roleAddData;
    } else if (this.props.formAction == "put") {
      let roleAddData = await helper.request(
        "v1",
        "account/" +
          this.props.selectedOrg +
          "/role/" +
          this.props.dataItem.uuid,
        {
          name: this.state.roleInEdit.name,
          description: this.state.roleInEdit.description,
          privileges: table
        },
        "put"
      );
      return roleAddData;
    }
  }

  onChangeCheckbox = e => {
    var value = e.target.props;
    let privilegeData = { ...this.state.privilegeData };
    const index = value.checked ? 0 : 1;
    privilegeData[value.id.slice(0, -1)] = this.vals[value.refs][index];
    this.setState({ privilegeData: privilegeData });
  };

  onDialogInputChange = event => {
    let target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.props ? target.props.name : target.name;

    const edited = this.state.roleInEdit;
    edited[name] = value;

    this.setState({
      roleInEdit: edited
    });
  };

  submitData = event => {
    event.preventDefault();
    this.notif.current.notify(
      "Uploading Data",
      "Please wait for a few seconds.",
      "default"
    );
    this.pushData().then(response => {
      if (response.status == "success") {
        this.props.cancel();
        this.props.action(response);
      } else {
        this.notif.current.notify(
          "Error",
          response.message ? response.message : null,
          "danger"
        );
      }
    });
  };

  render() {
    return (
      <KendoReactWindow.Window onClose={this.props.cancel}>
        <div>
          <Notification ref={this.notif} />
          <form id="roleForm" onSubmit={this.submitData}>
            {this.props.diableField ? (
              <div className="read-only-mode">
                <h5>(READ ONLY MODE)</h5>
                <i class="fa fa-lock"></i>
              </div>
            ) : null}
            <div className="form-group">
              <label className="required-label">Role Name</label>
              <input
                id="Name"
                type="text"
                className="form-control validate"
                name="name"
                value={this.state.roleInEdit.name || ""}
                maxLength="25"
                onChange={this.onDialogInputChange}
                placeholder="Enter Role Name"
                required={true}
                disabled={
                  this.state.roleInEdit.is_system_role == "1" ||
                  this.props.diableField
                    ? true
                    : false
                }
              />
            </div>

            <div className="form-group text-area-custom">
              <label className="required-label">Role Description</label>
              <textarea
                type="text"
                className="form-control"
                name="description"
                value={this.state.roleInEdit.description || ""}
                maxLength="200"
                onChange={this.onDialogInputChange}
                required={true}
                disabled={this.props.diableField ? true : false}
                placeholder="Enter Role Description"
                style={{ marginTop: "5px" }}
              />
            </div>
          </form>

          <KendoReactRipple.Ripple>
            <div className="col-11 pt-3" style={{ margin: "auto" }}>
              <div className="privilegeGrid">
                <KendoReactGrid.Grid
                  data={KendoDataQuery.orderBy(this.state.masterList, this.state.sort)}
                  resizable={true}
                  sortable
                  sort={this.state.sort}
                  onSortChange={e => {
                    this.setState({
                      sort: e.sort
                    });
                  }}
                >
                  <KendoReactGrid.GridToolbar>
                    <div>
                      <div
                        style={{
                          fontSize: "20px"
                        }}
                      >
                        Configure Privileges
                        {this.state.isAdmin ? (
                          <React.Fragment>
                            &nbsp; (READ ONLY MODE)
                            <i
                              className="fa fa-lock"
                              style={{
                                fontSize: "2.4rem",
                                right: "2%",
                                top: "2px",
                                position: "absolute"
                              }}
                            ></i>
                          </React.Fragment>
                        ) : null}
                      </div>
                    </div>
                  </KendoReactGrid.GridToolbar>
                  <KendoReactGrid.GridColumn title="App Name" field="name" width="100px" />
                  <KendoReactGrid.GridColumn
                    title="Privilege Name"
                    width="250px"
                    cell={props => (
                      <td>
                        <label>{props.dataItem.privilege_name.slice(7)}</label>
                      </td>
                    )}
                  />

                  <KendoReactGrid.GridColumn
                    title="Read"
                    width="80px"
                    cell={props =>
                      props.dataItem.permission & 1 ? (
                        <td>
                          <div className="privelegeGridcellFix">
                            <KendoReactInput.Input
                              type="checkbox"
                              refs="read"
                              id={props.dataItem.privilege_name + "R"}
                              className="k-checkbox"
                              onChange={
                                this.state.isAdmin
                                  ? null
                                  : this.onChangeCheckbox
                              }
                              checked={
                                this.state.privilegeData[
                                  props.dataItem.privilege_name
                                ] & 1
                                  ? true
                                  : false
                              }
                            />
                            <label
                              className="k-checkbox-label"
                              htmlFor={props.dataItem.privilege_name + "R"}
                            />
                          </div>
                        </td>
                      ) : (
                        <td />
                      )
                    }
                  />
                  <KendoReactGrid.GridColumn
                    title="Write"
                    width="80px"
                    cell={props =>
                      props.dataItem.permission & 2 ? (
                        <td>
                          <div className="privelegeGridcellFix">
                            <KendoReactInput.Input
                              type="checkbox"
                              refs="write"
                              id={props.dataItem.privilege_name + "W"}
                              className="k-checkbox"
                              onChange={
                                this.state.isAdmin
                                  ? null
                                  : this.onChangeCheckbox
                              }
                              checked={
                                this.state.privilegeData[
                                  props.dataItem.privilege_name
                                ] & 2
                                  ? true
                                  : false
                              }
                            />
                            <label
                              className="k-checkbox-label"
                              htmlFor={props.dataItem.privilege_name + "W"}
                            />
                          </div>
                        </td>
                      ) : (
                        <td />
                      )
                    }
                  />
                  <KendoReactGrid.GridColumn
                    title="Create"
                    width="80px"
                    cell={props =>
                      props.dataItem.permission & 4 ? (
                        <td>
                          <div className="privelegeGridcellFix">
                            <KendoReactInput.Input
                              type="checkbox"
                              refs="create"
                              id={props.dataItem.privilege_name + "C"}
                              className="k-checkbox"
                              onChange={
                                this.state.isAdmin
                                  ? null
                                  : this.onChangeCheckbox
                              }
                              checked={
                                this.state.privilegeData[
                                  props.dataItem.privilege_name
                                ] & 4
                                  ? true
                                  : false
                              }
                            />
                            <label
                              className="k-checkbox-label"
                              htmlFor={props.dataItem.privilege_name + "C"}
                            />
                          </div>
                        </td>
                      ) : (
                        <td />
                      )
                    }
                  />
                  <KendoReactGrid.GridColumn
                    title="Delete"
                    width="80px"
                    cell={props =>
                      props.dataItem.permission & 8 ? (
                        <td>
                          <div className="privelegeGridcellFix">
                            <KendoReactInput.Input
                              type="checkbox"
                              refs="delete"
                              id={props.dataItem.privilege_name + "D"}
                              className="k-checkbox"
                              onChange={
                                this.state.isAdmin
                                  ? null
                                  : this.onChangeCheckbox
                              }
                              checked={
                                this.state.privilegeData[
                                  props.dataItem.privilege_name
                                ] & 8
                                  ? true
                                  : false
                              }
                            />
                            <label
                              className="k-checkbox-label"
                              htmlFor={props.dataItem.privilege_name + "D"}
                            />
                          </div>
                        </td>
                      ) : (
                        <td />
                      )
                    }
                  />
                </KendoReactGrid.Grid>
              </div>
              <div style={{ margin: "75px" }} />
            </div>
          </KendoReactRipple.Ripple>
        </div>
        <SaveCancel save="roleForm" cancel={this.props.cancel} />
      </KendoReactWindow.Window>
    );
  }
}
