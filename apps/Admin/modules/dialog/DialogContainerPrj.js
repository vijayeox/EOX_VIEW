import { React, FileUploader, Notification, KendoReactWindow, KendoReactInput } from "oxziongui";
// import TextareaAutosize from "react-textarea-autosize";
import { GetSingleEntityData, PushData } from "../components/apiCalls";
import { SaveCancel, DropDown } from "../components/index";
import Swal from "sweetalert2";

export default class DialogContainer extends React.Component {
  constructor(props) {
    super(props);
    this.core = this.props.args;
    this.state = {
      prjInEdit: this.props.dataItem || null,
      managerName: undefined,
      parentProject: this.props.dataItem.parentId,
      projectFlag: false,
    };
    this.notif = React.createRef();
  }

  UNSAFE_componentWillMount() {
    if (this.props.formAction == "put") {
      GetSingleEntityData("account/" + this.props.selectedOrg + "/user/" + this.props.dataItem.managerId + "/profile").then((response) => {
        this.setState({
          managerName: {
            id: "111",
            name: response.data.name,
          },
        });
      });
    }
  }
  activateProject(tempData) {
    Swal.fire({
      title: "Project already exists",
      text: "Do you want to reactivate the Project?",
      imageUrl: "apps/Admin/091-email-1.svg",
      imageWidth: 75,
      imageHeight: 75,
      confirmButtonText: "Reactivate",
      confirmButtonColor: "#d33",
      showCancelButton: true,
      cancelButtonColor: "#66bb6a",
      target: ".Window_Admin",
    }).then((result) => {
      if (result.value) {
        tempData.reactivate = "1";
        PushData("project", this.props.formAction, this.state.prjInEdit.uuid, tempData).then((response) => {
          if (response.status == "success") {
            this.props.action(response);
            this.props.cancel();
          } else {
            this.notif.current.notify("Error", response.message ? response.message : null, "danger");
          }
        });
      }
    });
  }

  onDialogInputChange = (event) => {
    let target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.props ? target.props.name : target.name;

    const edited = this.state.prjInEdit;
    edited[name] = value;

    this.setState({
      prjInEdit: edited,
    });
  };

  listOnChange = (event, item) => {
    const edited = this.state.prjInEdit;
    edited[item] = event.target.value;
    this.setState({
      prjInEdit: edited,
    });
    item == "managerId"
      ? this.setState({
          managerName: event.target.value,
        })
      : null;
    item == "parentId"
      ? this.setState({
          parentProject: event.target.value,
        })
      : null;
  };

  sendData = (e) => {
    e.preventDefault();
    this.notif.current.notify("Uploading Data", "Please wait for a few seconds.", "default");
    let tempData = {
      name: this.state.prjInEdit.name,
      description: this.state.prjInEdit.description,
      managerId: this.state.prjInEdit.managerId,
      parentId: this.state.projectFlag ? null : this.state.prjInEdit.parentId,
    };
    PushData("project", this.props.formAction, this.props.dataItem.uuid, tempData, this.props.selectedOrg).then((response) => {
      if (response.status == "success") {
        this.props.action(response);
        this.props.cancel("save");
      } else if (response.status == "error" && response.errorCode == 406) {
        this.activateProject(tempData);
      } else {
        this.notif.current.notify("Error", response.message ? response.message : null, "danger");
      }
    });
    this.setState({ projectFlag: false });
  };

  render() {
    return (
      <KendoReactWindow.Window onClose={this.props.cancel}>
        <Notification ref={this.notif} />
        <div>
          <form id='prjForm' onSubmit={this.sendData}>
            {this.props.diableField ? (
              <div className='read-only-mode'>
                <h5>(READ ONLY MODE)</h5>
                <i className='fa fa-lock'></i>
              </div>
            ) : null}
            <div className='form-group'>
              <label className='required-label'>Project Name</label>
              <KendoReactInput.Input type='text' className='form-control' name='name' maxLength='50' value={this.state.prjInEdit.name || ""} onChange={this.onDialogInputChange} placeholder='Enter Project Name' readOnly={this.props.diableField ? true : false} required={true} />
            </div>
            <div className='form-group text-area-custom'>
              <label className='required-label'>Project Description</label>
              <textarea type='text' className='form-control' name='description' maxLength='200' value={this.state.prjInEdit.description || ""} onChange={this.onDialogInputChange} placeholder='Enter Project Description' style={{ marginTop: "5px" }} readOnly={this.props.diableField ? true : false} required={true} />
            </div>
            <div className='form-group'>
              <div className='form-row'>
                <div className='col-4'>
                  <label className='required-label'>Project Manager</label>
                  <div>
                    <DropDown args={this.core} mainList={"account/" + this.props.selectedOrg + "/users"} selectedItem={this.state.managerName} preFetch={true} onDataChange={(event) => this.listOnChange(event, "managerId")} required={true} disableItem={this.props.diableField} validationMessage={"Please select a Project Manager."} />
                  </div>
                </div>
                <div className='col-4'>
                  <label>Parent Project</label>
                  <div className='parentProjectDropdown'>
                    <DropDown args={this.core} mainList={"account/" + this.props.selectedOrg + "/projects"} selectedItem={this.state.parentProject} preFetch={true} onDataChange={(event) => this.listOnChange(event, "parentId")} excludeItem={this.state.prjInEdit} disableItem={this.props.diableField} validationMessage={"Please select the Parent project."} />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        this.setState({ parentProject: null, projectFlag: true });
                      }}>
                      <i className='fa fa-times-circle' aria-hidden='true'></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
        <SaveCancel save='prjForm' cancel={this.props.cancel} hideSave={this.props.diableField} />
      </KendoReactWindow.Window>
    );
  }
}
