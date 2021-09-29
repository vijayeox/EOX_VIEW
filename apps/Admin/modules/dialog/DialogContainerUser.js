import {
  React,
  ReactDOM,
  Notification,
  KendoReactDropDowns,
  countryStateList,
  KendoReactInput,
  KendoReactRipple,
  KendoReactWindow,
  Moment,
} from "oxziongui";
import { MultiSelect } from "@progress/kendo-react-dropdowns";
import { PushData } from "../components/apiCalls";
import { DateComponent, SaveCancel, DropDown } from "../components/index";
import ReactTooltip from "react-tooltip";

export default class DialogContainer extends React.Component {
  constructor(props) {
    super(props);
    this.core = this.props.args;
    let countryList = countryStateList.map((item) => item.country);
    console.log(countryList);

    this.state = {
      userInEdit: [],
      roleList: [],
      projectList: [],
      countryList: countryList,
      stateList: [],
    };
    this.notif = React.createRef();
    this.loader = this.core.make("oxzion/splash");
    this.adminWindow = document.getElementsByClassName("Window_Admin")[0];
  }

  UNSAFE_componentWillMount() {
    if (this.props.formAction == "put") {
      this.loader.show(this.adminWindow);
      this.getData(
        "account/" +
          this.props.selectedOrg +
          "/user/" +
          this.props.dataItem.uuid +
          "/profile"
      ).then((response) => {
        var apiResponse = response.data;
        this.getData(
          "account/" +
            this.props.selectedOrg +
            "/user/" +
            this.props.dataItem.uuid +
            "/pr"
        ).then((response2) => {
          var tempProjects = [];
          var userPrjList = response2.data.projects;
          for (var i = 0; i <= userPrjList.length - 1; i++) {
            var prjName = userPrjList[i].name;
            var prjId = userPrjList[i].uuid;
            tempProjects.push({ uuid: prjId, name: prjName });
          }
          apiResponse.project = tempProjects;
          apiResponse.manager_name = {
            id: apiResponse.managerId,
            name: apiResponse.manager_name,
          };
          this.setState({
            userInEdit: apiResponse,
          });
        });
      });
      this.loader.destroy();
    }
    this.loader.show(this.adminWindow);

    this.getData("account/" + this.props.selectedOrg + "/roles").then(
      (response) => {
        var tempUsers = [];
        for (var i = 0; i <= response.data.length - 1; i++) {
          var userName = response.data[i].name;
          var userid = response.data[i].uuid;
          tempUsers.push({ uuid: userid, name: userName });
        }
        this.setState({
          roleList: tempUsers,
        });
      }
    );

    this.getData("account/" + this.props.selectedOrg + "/projects").then(
      (response) => {
        var tempProjects = [];
        for (var i = 0; i <= response.data.length - 1; i++) {
          var prjName = response.data[i].name;
          var prjId = response.data[i].uuid;
          tempProjects.push({ uuid: prjId, name: prjName });
        }
        this.setState({
          projectList: tempProjects,
        });
        this.loader.destroy();
      }
    );
  }

  componentDidMount() {
    if (this.props.formAction == "put") {
      ReactDOM.render(
        <ReactTooltip
          place="bottom"
          type="error"
          effect="solid"
          delayHide={100}
          delayShow={100}
          html={true}
        />,
        document.getElementById("tooltip")
      );
    }
  }

  async getData(route) {
    let helper2 = this.core.make("oxzion/restClient");
    let rolesList = await helper2.request("v1", route, {}, "get");
    return rolesList;
  }

  managerValueChange = (field, event) => {
    let userInEdit = { ...this.state.userInEdit };
    userInEdit[field] = event.target.value;
    userInEdit["manager_name"] = event.target.value;
    this.setState({ userInEdit: userInEdit });
  };

  valueChange = (field, event) => {
    if (field == "role") {
      let userInEdit = { ...this.state.userInEdit };
      userInEdit[field] = event.target.value;
      this.setState({ userInEdit: userInEdit });
    } else if (field == "project") {
      let userInEdit = { ...this.state.userInEdit };
      userInEdit[field] = event.target.value;
      this.setState({ userInEdit: userInEdit });
    } else if (field == "country") {
      let userInEdit = { ...this.state.userInEdit };
      userInEdit[field] = event.target.value;
      userInEdit["state"] = "";
      this.setState({ userInEdit: userInEdit });
    } else {
      let userInEdit = { ...this.state.userInEdit };
      userInEdit[field] = event.target.value;
      this.setState({ userInEdit: userInEdit });
    }
  };

  onDialogInputChange = (event) => {
    let target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.props ? target.props.name : target.name;

    const edited = this.state.userInEdit;
    edited[name] = value;

    this.setState({
      userInEdit: edited,
    });
  };

  validateEmail(emailText) {
    var pattern =
      /^[a-zA-Z0-9\-_]+(\.[a-zA-Z0-9\-_]+)*@[a-z0-9]+(\-[a-z0-9]+)*(\.[a-z0-9]+(\-[a-z0-9]+)*)*\.[a-z]{2,4}$/;
    if (!pattern.test(emailText)) {
      this.notif.current.notify(
        "Invalid Email ID",
        "Please enter a valid email address.",
        "warning"
      );
      return true;
    }
  }

  validateUserName(username) {
    var pattern =
      /^[a-zA-Z0-9\-_]+(\.[a-zA-Z0-9\-_]+)*@[a-z0-9]+(\-[a-z0-9]+)*(\.[a-z0-9]+(\-[a-z0-9]+)*)*\.[a-z]{2,4}$/;
    if (!pattern.test(username)) {
      this.notif.current.notify(
        "Invalid Email ID",
        "Please enter a valid email address.",
        "warning"
      );
      return true;
    }
  }

  handleSubmit = (event) => {
    event.preventDefault();
    if (this.validateEmail(document.getElementById("email-id").value)) {
      return;
    }
    this.loader.show(this.adminWindow);
    var userRoles = [];
    for (var i = 0; i <= this.state.userInEdit.role.length - 1; i++) {
      var uid = { uuid: this.state.userInEdit.role[i].uuid };
      userRoles.push(uid);
    }
    if (this.props.formAction == "post") {
      PushData(
        "account/" + this.props.selectedOrg + "/user",
        this.props.formAction,
        this.props.dataItem.uuid,
        {
          username: this.state.userInEdit.username,
          firstname: this.state.userInEdit.firstname,
          lastname: this.state.userInEdit.lastname,
          email: this.state.userInEdit.email,
          date_of_birth: new Moment(this.state.userInEdit.date_of_birth).format(
            "YYYY-MM-DD"
          ),
          designation: this.state.userInEdit.designation,
          gender: this.state.userInEdit.gender,
          managerId: this.state.userInEdit.managerId,
          role: userRoles,
          project: this.state.userInEdit.project,
          date_of_join: new Moment(this.state.userInEdit.date_of_join).format(
            "YYYY-MM-DD"
          ),
          address1: this.state.userInEdit.address1,
          city: this.state.userInEdit.city,
          state: this.state.userInEdit.state,
          zip: this.state.userInEdit.zip,
          country: this.state.userInEdit.country,
        }
      ).then((response) => {
        this.loader.destroy();
        if (response.status == "success") {
          this.props.action(response);
          this.props.cancel();
        } else {
          this.notif.current.notify(
            "Error",
            response.message ? response.message : null,
            "danger"
          );
        }
      });
    } else if (this.props.formAction == "put") {
      PushData("user", this.props.formAction, this.props.dataItem.uuid, {
        firstname: this.state.userInEdit.firstname,
        lastname: this.state.userInEdit.lastname,
        username: this.state.userInEdit.username,
        email: this.state.userInEdit.email,
        date_of_birth: new Moment(this.state.userInEdit.date_of_birth).format(
          "YYYY-MM-DD"
        ),
        designation: this.state.userInEdit.designation,
        gender: this.state.userInEdit.gender,
        managerId: this.state.userInEdit.managerId,
        role: userRoles,
        project: this.state.userInEdit.project,
        date_of_join: new Moment(this.state.userInEdit.date_of_join).format(
          "YYYY-MM-DD"
        ),
        address1: this.state.userInEdit.address1,
        city: this.state.userInEdit.city,
        state: this.state.userInEdit.state,
        zip: this.state.userInEdit.zip,
        country: this.state.userInEdit.country,
      }).then((response) => {
        this.loader.destroy();
        if (response.status == "success") {
          this.props.action(response);
          this.props.cancel();
        } else {
          this.notif.current.notify(
            "Error",
            response.message ? response.message : null,
            "danger"
          );
        }
      });
    }
  };

  prepareStateData = () => {
    if (this.state.userInEdit.country) {
      let obj = countryStateList.find(
        (o) => o.country === this.state.userInEdit.country
      );
      if (obj) {
        return obj.states;
      }
    } else {
      return [];
    }
    return [];
  };

  render() {
    return (
      <KendoReactWindow onClose={this.props.cancel}>
        <Notification ref={this.notif} />
        <div id="tooltip" />
        <div className="container-fluid">
          <form onSubmit={this.handleSubmit} id="userForm">
            {this.props.diableField ? (
              <div className="read-only-mode">
                <h5>(READ ONLY MODE)</h5>
                <i class="fa fa-lock"></i>
              </div>
            ) : null}

            <div className="form-group">
              <div className="form-row">
                <div className="col-sm-6">
                  <label className="required-label">First Name</label>
                  <KendoReactInput
                    type="text"
                    className="form-control"
                    name="firstname"
                    value={this.state.userInEdit.firstname || ""}
                    onChange={this.onDialogInputChange}
                    placeholder="Enter First Name"
                    maxLength="50"
                    required={true}
                    readOnly={this.props.diableField ? true : false}
                    validationMessage={"Please enter a valid First Name"}
                  />
                </div>
                <div className="col-sm-6">
                  <label className="required-label">Last Name</label>
                  <KendoReactInput
                    type="text"
                    className="form-control"
                    name="lastname"
                    value={this.state.userInEdit.lastname || ""}
                    onChange={this.onDialogInputChange}
                    placeholder="Enter Last Name"
                    maxLength="50"
                    required={true}
                    readOnly={this.props.diableField ? true : false}
                    validationMessage={"Please enter a valid Last Name"}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <div className="form-row">
                <div className="col-sm-6">
                  <label className="required-label">Email</label>
                  <KendoReactInput
                    type="text"
                    className="form-control"
                    id="email-id"
                    name="email"
                    value={this.state.userInEdit.email || ""}
                    onChange={this.onDialogInputChange}
                    placeholder="Enter User Email Address"
                    maxLength="254"
                    required={true}
                    readOnly={this.props.diableField ? true : false}
                    validationMessage={"Please enter a valid Email Address"}
                  />
                </div>

                <div className="col-sm-6">
                  <label className="required-label">User Name</label>
                  <KendoReactInput
                    type="text"
                    className="form-control"
                    name="username"
                    value={this.state.userInEdit.username || ""}
                    onChange={this.onDialogInputChange}
                    placeholder="Enter User Name"
                    maxLength="50"
                    required={true}
                    readOnly={this.props.diableField ? true : false}
                    validationMessage={"Please enter a valid User Name"}
                    data-tip="Changing the username will reset the User's chat history."
                  />
                </div>
              </div>
            </div>
            <div className="form-group">
              <div className="form-row">
                <div className="col-sm-6">
                  <label>Manager Assigned</label>
                  <div>
                    <DropDown
                      args={this.core}
                      mainList={"account/" + this.props.selectedOrg + "/users"}
                      preFetch={true}
                      selectedItem={this.state.userInEdit.manager_name}
                      selectedEntityType={"object"}
                      onDataChange={(e) =>
                        this.managerValueChange("managerId", e)
                      }
                      disableItem={this.props.diableField}
                    />
                  </div>
                </div>
                <div className="col-sm-6">
                  <label className="required-label">Designation</label>
                  <KendoReactInput
                    type="text"
                    className="form-control"
                    name="designation"
                    value={this.state.userInEdit.designation || ""}
                    onChange={this.onDialogInputChange}
                    placeholder="Enter Designation"
                    maxLength="50"
                    required={true}
                    readOnly={this.props.diableField ? true : false}
                    validationMessage={"Please enter a valid User Name"}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <div className="form-row">
                <div className="col-sm-6">
                  <label className="required-label">Country</label>
                  <div>
                    <DropDown
                      args={this.core}
                      rawData={this.state.countryList}
                      selectedItem={this.state.userInEdit.country}
                      preFetch={true}
                      onDataChange={(e) => this.valueChange("country", e)}
                      required={true}
                      validationMessage={
                        "Please select a country from the list."
                      }
                      disableItem={this.props.diableField}
                    />
                  </div>
                </div>
                <div className="col-sm-6">
                  <label className="required-label">State</label>
                  <div>
                    <DropDown
                      args={this.core}
                      rawData={this.prepareStateData()}
                      selectedItem={this.state.userInEdit.state}
                      preFetch={true}
                      onDataChange={(e) => this.valueChange("state", e)}
                      required={true}
                      validationMessage={"Please select a state from the list."}
                      disableItem={this.props.diableField}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="form-group">
              <div className="form-row">
                <div className="col-sm-6">
                  <label className="required-label">Gender</label>
                  <div>
                    <KendoReactRipple>
                      <span className="col-sm-6">
                        <input
                          type="radio"
                          id="mRadio"
                          name="gender"
                          value="male"
                          className="k-radio"
                          onChange={(e) => this.valueChange("gender", e)}
                          checked={this.state.userInEdit.gender == "male"}
                          disabled={this.props.diableField ? true : false}
                          required
                        />
                        <label
                          className="k-radio-label pl-4 radioLabel"
                          htmlFor="mRadio"
                        >
                          Male
                        </label>
                      </span>
                      <span className="col-sm-6">
                        <input
                          type="radio"
                          id="fRadio"
                          name="gender"
                          value="female"
                          className="k-radio pl-2"
                          onChange={(e) => this.valueChange("gender", e)}
                          checked={this.state.userInEdit.gender == "female"}
                          disabled={this.props.diableField ? true : false}
                          required
                        />
                        <label
                          className="k-radio-label pl-4 radioLabel"
                          htmlFor="fRadio"
                        >
                          Female
                        </label>
                      </span>
                    </KendoReactRipple>
                  </div>
                </div>

                <div className="col-sm-3">
                  <label className="required-label">Date Of Birth</label>
                  <div>
                    <DateComponent
                      format={this.props.userPreferences.dateformat}
                      value={this.state.userInEdit.date_of_birth}
                      change={(e) => this.valueChange("date_of_birth", e)}
                      required={true}
                      disabled={this.props.diableField ? true : false}
                    />
                  </div>
                </div>
                <div className="col-sm-3">
                  <label className="required-label">Date Of Join</label>
                  <div>
                    <DateComponent
                      format={this.props.userPreferences.dateformat}
                      value={this.state.userInEdit.date_of_join}
                      min={
                        this.state.userInEdit.date_of_birth
                          ? this.state.userInEdit.date_of_birth
                          : undefined
                      }
                      change={(e) => this.valueChange("date_of_join", e)}
                      required={true}
                      disabled={this.props.diableField ? true : false}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="form-group">
              <div className="form-row">
                <div className="col-6">
                  <label className="required-label">Role</label>
                  <MultiSelect
                    data={this.state.roleList}
                    onChange={(e) => {
                      this.valueChange("role", e);
                    }}
                    value={this.state.userInEdit.role}
                    clearButton={false}
                    textField="name"
                    dataItemKey="uuid"
                    placeholder={"Select User Roles"}
                    disabled={this.props.diableField ? true : false}
                    validationMessage={
                      "Please assign atleast one of role to the user."
                    }
                    validityStyles={false}
                    required={true}
                  />
                </div>

                <div className="col-6">
                  <label>Add User To Projects</label>
                  <MultiSelect
                    data={this.state.projectList}
                    onChange={(e) => {
                      this.valueChange("project", e);
                    }}
                    value={this.state.userInEdit.project}
                    clearButton={false}
                    textField="name"
                    dataItemKey="uuid"
                    placeholder={"Select User Projects"}
                    disabled={this.props.diableField ? true : false}
                    validityStyles={false}
                  />
                </div>
              </div>
            </div>

            <div style={{ margin: "75px" }} />
          </form>
        </div>
        <SaveCancel save="userForm" cancel={this.props.cancel} />
      </KendoReactWindow>
    );
  }
}
