import {React,Notification,KendoReactWindow,KendoReactInput} from "oxziongui";
// import TextareaAutosize from "react-textarea-autosize";
import { PushData, GetSingleEntityData } from "../components/apiCalls";
import { DropDown, SaveCancel } from "../components/index";
import Swal from "sweetalert2";

export default class DialogContainer extends React.Component {
  constructor(props) {
    super(props);
    this.core = this.props.args;
    this.state = {
      teamInEdit: this.props.dataItem || null,
      managerName: null,
      parentTeamName: null
    };
    this.notif = React.createRef();
  }

  UNSAFE_componentWillMount() {
    if (this.props.formAction == "put") {
      GetSingleEntityData(
        "account/" +
          this.props.selectedOrg +
          "/user/" +
          this.props.dataItem.managerId +
          "/profile"
      ).then(response => {
        this.setState({
          managerName: {
            id: "111",
            name: response.data.name
          }
        });
      });
      this.props.dataItem.parent_id
        ? GetSingleEntityData(
            "account/" +
              this.props.selectedOrg +
              "/team/" +
              this.props.dataItem.parent_id
          ).then(response => {
            this.setState({
              parentTeamName: {
                id: "111",
                name: response.data.name
              }
            });
          })
        : null;
    }
  }

  listOnChange = (event, item) => {
    console.log(event.target.value);

    const edited = this.state.teamInEdit;
    edited[item] = event.target.value;
    this.setState({
      teamInEdit: edited
    });
    item == "managerId"
      ? this.setState({
          managerName: event.target.value
        })
      : this.setState({
          parentTeamName: event.target.value
        });
  };

  onDialogInputChange = event => {
    let target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.props ? target.props.name : target.name;

    const edited = this.state.teamInEdit;
    edited[name] = value;

    this.setState({
      teamInEdit: edited
    });
  };

  handleSubmit = e => {
    e.preventDefault();
    this.notif.current.notify(
      "Uploading Data",
      "Please wait for a few seconds.",
      "default"
    )
    let tempData = {
      name: this.state.teamInEdit.name,
      parentId: this.state.teamInEdit.parentId,
      managerId: this.state.teamInEdit.managerId,
      description: this.state.teamInEdit.description
    };

    for (var i = 0; i <= Object.keys(tempData).length; i++) {
      let propertyName = Object.keys(tempData)[i];
      if (tempData[propertyName] == undefined) {
        delete tempData[propertyName];
      }
    }
    PushData(
      "account/" + this.props.selectedOrg + "/team",
      this.props.formAction,
      this.state.teamInEdit.uuid,
      tempData
    ).then(response => {
      if (response.status == "success") {
        this.props.action(response);
        this.props.cancel();
      } else if (response.status == 'error' && response.errorCode == 406) {
        this.activateTeam(tempData);
      } else {
        this.notif.current.notify(
          "Error",
          response.message ? response.message : null,
          "danger"
        )
      }
    });
  };
  activateTeam(tempData) {
    Swal.fire({
      title: "Team already exists",
      text: "Do you want to reactivate the Team?",
      imageUrl: "apps/Admin/091-email-1.svg",
      imageWidth: 75,
      imageHeight: 75,
      confirmButtonText: "Reactivate",
      confirmButtonColor: "#d33",
      showCancelButton: true,
      cancelButtonColor: "#66bb6a",
      target: ".Window_Admin"
    }).then((result) => {
      if (result.value) {
        tempData.reactivate = "1";
        PushData("team",this.props.formAction,this.state.teamInEdit.uuid,tempData).then((response) => {
          if (response.status == "success") {
            this.props.action(response);
            this.props.cancel();
          } else {
            this.notif.current.notify("Error",response.message ? response.message : null,"danger");
          }
        });
      }
    });
  }

  render() {
    return (
      <KendoReactWindow.Window onClose={this.props.cancel}>
        <Notification ref={this.notif} />
        <div>
          <form id="teamForm" onSubmit={this.handleSubmit}>
            {this.props.diableField ? (
              <div className="read-only-mode">
                <h5>(READ ONLY MODE)</h5>
                <i className="fa fa-lock"></i>
              </div>
            ) : null}
            <div className="form-group">
              <label className="required-label">Team Name</label>
              <KendoReactInput.Input
                type="text"
                className="form-control"
                name="name"
                maxLength="50"
                value={this.state.teamInEdit.name || ""}
                onChange={this.onDialogInputChange}
                placeholder="Enter Team Name"
                required={true}
                validationMessage={"Please enter the Team name."}
                readOnly={this.props.diableField ? true : false}
              />
            </div>
            <div className="form-group text-area-custom">
              <label className="required-label">Description</label>
              <textarea
                type="text"
                className="form-control"
                name="description"
                maxLength="200"
                value={this.state.teamInEdit.description || ""}
                onChange={this.onDialogInputChange}
                placeholder="Enter Team Description"
                required={true}
                readOnly={this.props.diableField ? true : false}
              />
            </div>
            <div className="form-group">
              <div className="form-row">
                <div className="col-4">
                  <label className="required-label">Team Manager</label>
                  <div>
                    <DropDown
                      args={this.core}
                      mainList={
                        "account/" + this.props.selectedOrg + "/users"
                      }
                      selectedItem={this.state.managerName}
                      selectedEntityType={"text"}
                      preFetch={true}
                      onDataChange={event =>
                        this.listOnChange(event, "managerId")
                      }
                      disableItem={this.props.diableField}
                      required={true}
                    />
                  </div>
                </div>
                <div className="col-4">
                  <label>Parent Team</label>
                  <div>
                    <DropDown
                      args={this.core}
                      mainList={
                        "account/" + this.props.selectedOrg + "/teams"
                      }
                      selectedItem={this.state.parentTeamName}
                      selectedEntityType={"text"}
                      preFetch={true}
                      onDataChange={event =>
                        this.listOnChange(event, "parentId")
                      }
                      disableItem={this.props.diableField}
                      required={false}
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
        <SaveCancel
          save="teamForm"
          cancel={this.props.cancel}
          hideSave={this.props.diableField}
        />
      </KendoReactWindow.Window>
    );
  }
}
