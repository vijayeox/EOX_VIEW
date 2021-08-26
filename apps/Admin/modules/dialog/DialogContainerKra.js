import {React,Notification,KendoReactWindow,KendoReactInput} from "oxziongui";
import { PushData, GetSingleEntityData } from "../components/apiCalls";
import { DropDown, SaveCancel } from "../components/index";
import Swal from "sweetalert2";

export default class DialogContainer extends React.Component {
  constructor(props) {
    super(props);
    this.core = this.props.args;
    this.state = {
      kraInEdit: this.props.dataItem || null,
      userName: null,
      targetName: null,
      queryName: null,
      teamName: null,
      targetId: null,
      redLimit: null,
      greenLimit: null,
      yellowLimit: null,
    };
    this.notif = React.createRef();
  }

  UNSAFE_componentWillMount() {
    var kraInEdit = {};
    kraInEdit.uuid = this.props.dataItem?this.props.dataItem.uuid:null;
    kraInEdit.name = this.props.dataItem?this.props.dataItem.name:null;
    if (this.props.formAction == "put") {
      this.props.dataItem.userId ? GetSingleEntityData( "account/" + this.props.selectedOrg + "/user/" + this.props.dataItem.userId + "/profile" ).then(response => {
        this.setState({
          userName: { id: "111", name: response.data.name }
        });
      }): null;
      this.props.dataItem.queryId ? GetSingleEntityData("analytics/query/" + this.props.dataItem.queryId ).then(response => {
            this.setState({
              queryName: { id: "111", name: response.data.query.name }
            });
      }) : null;

      this.props.dataItem.teamId ? GetSingleEntityData( "account/" + this.props.selectedOrg + "/team/" + this.props.dataItem.teamId).then(response => {
            this.setState({
              teamName: {
                id: "111",
                name: response.data.name
              }
        });
      }) : null;
    }
      this.props.dataItem.targetId ? GetSingleEntityData( "analytics/target/" + this.props.dataItem.targetId ).then(response => {
        kraInEdit.yellowLimit= response.data.yellow_limit;
        kraInEdit.greenLimit= response.data.green_limit;
        kraInEdit.redLimit= response.data.red_limit;
        kraInEdit.targetId = this.props.dataItem.targetId;
        kraInEdit.targetVersion = response.data.version;
        this.setState({kraInEdit:kraInEdit,targetId:this.props.dataItem.targetId});
      }) : null;
  }

  listOnChange = (event, item) => {
    const edited = this.state.kraInEdit;
    edited[item] = event.target.value;
    this.setState({
      kraInEdit: edited
    });
    item == "userId"
      ? this.setState({
          userName: event.target.value
        }) : (item=="queryId"?this.setState({
          queryName: event.target.value,
          queryId: event.target.value
        }):this.setState({
          teamName: event.target.value
        }));
  };

  onDialogInputChange = event => {
    let target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.props ? target.props.name : target.name;

    const edited = this.state.kraInEdit;
    edited[name] = value;
    this.setState({
      kraInEdit: edited
    });
  };

  handleSubmit = e => {
    e.preventDefault();
    this.notif.current.notify( "Uploading Data", "Please wait for a few seconds.", "default" )
    let tempData = {
      name : this.state.kraInEdit.name,
      userId : this.state.kraInEdit.userId,
      teamId : this.state.kraInEdit.teamId,
      queryId : this.state.kraInEdit.queryId,
      targetId: this.state.kraInEdit.targetId,
      description: this.state.kraInEdit.description
    };

    for (var i = 0; i <= Object.keys(tempData).length; i++) {
      let propertyName = Object.keys(tempData)[i];
      if (tempData[propertyName] == undefined) {
        delete tempData[propertyName];
      }
    }
    var targetData= {yellow_limit:this.state.kraInEdit.yellowLimit,red_limit:this.state.kraInEdit.redLimit,green_limit:this.state.kraInEdit.greenLimit};
    if(this.props.formAction == 'post'){
    PushData( "analytics/target", this.props.formAction, this.state.targetId, targetData ).then(response => {
      if (response.status != "success") {
        this.notif.current.notify("Error",response.message ? response.message : null,"danger");
      } else {
        this.saveKra(response.data.uuid,tempData)
      }
    });
    } else {
      targetData.version = this.state.kraInEdit.targetVersion;
      PushData(
      "analytics/target",
      this.props.formAction,
      this.state.targetId,
      targetData
    ).then(response => {
      if (response.status != "success") {
        this.notif.current.notify("Error",response.message ? response.message : null,"danger");
      } else {
        this.saveKra(response.data.uuid,tempData)
      }
    });
    }
  };
  saveKra(targetId,tempData){
    tempData.targetId = targetId;
    PushData("account/" + this.props.selectedOrg + "/kra", this.props.formAction, this.state.kraInEdit.uuid, tempData).then(response => {
      if (response.status == "success") {
        this.props.action(response);
        this.props.cancel();
      } else if (response.status == 'error' && response.errorCode == 406) {
        this.activateKra(tempData);
      } else {
        this.notif.current.notify("Error", response.message ? response.message : null, "danger")
      }
    });
  }
  activateKra(tempData) {
    Swal.fire({
      title: "Kra already exists",
      text: "Do you want to reactivate the Kra?",
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
        PushData("kra",this.props.formAction,this.state.kraInEdit.uuid,tempData).then((response) => {
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
          <form id="kraForm" onSubmit={this.handleSubmit}>
            {this.props.diableField ? (
              <div className="read-only-mode">
                <h5>(READ ONLY MODE)</h5>
                <i className="fa fa-lock"></i>
              </div>
            ) : null}
            <div className="form-group">
              <label className="required-label">Kra Name</label>
              <KendoReactInput.Input
                type="text"
                className="form-control"
                name="name"
                maxLength="50"
                value={this.state.kraInEdit.name || ""}
                onChange={this.onDialogInputChange}
                placeholder="Enter Kra Name"
                required={true}
                validationMessage={"Please enter the Kra name."}
                readOnly={this.props.diableField ? true : false}
              />
            </div>
            <div className="form-group">
              <div className="form-row">
                <div className="col-4">
                  <label>User</label>
                  <div>
                    <DropDown
                      args={this.core}
                      mainList={
                        "account/" + this.props.selectedOrg + "/users"
                      }
                      selectedItem={this.state.userName}
                      selectedEntityType={"text"}
                      preFetch={true}
                      onDataChange={event =>
                        this.listOnChange(event, "userId")
                      }
                      disableItem={this.props.diableField}
                      required={false}
                    />
                  </div>
                </div>
                <div className="col-4">
                  <label>Team</label>
                  <div>
                    <DropDown
                      args={this.core}
                      mainList={
                        "account/" + this.props.selectedOrg + "/teams"
                      }
                      selectedItem={this.state.teamName}
                      selectedEntityType={"text"}
                      preFetch={true}
                      onDataChange={event =>
                        this.listOnChange(event, "teamId")
                      }
                      disableItem={this.props.diableField}
                      required={false}
                    />
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-4">
                  <label className="required-label">Query</label>
                  <div>
                    <DropDown
                      args={this.core}
                      mainList={
                        "analytics/query"
                      }
                      selectedItem={this.state.queryName}
                      selectedEntityType={"text"}
                      preFetch={true}
                      onDataChange={event =>
                        this.listOnChange(event, "queryId")
                      }
                      disableItem={this.props.diableField}
                      required={true}
                    />
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-4">
                  <label>Red Limit</label>
                  <div>
                    <KendoReactInput.Input
                      type="text"
                      className="form-control"
                      name="redLimit"
                      maxLength="50"
                      value={this.state.kraInEdit.redLimit
                          ? this.state.kraInEdit.redLimit
                          : ""}
                      onChange={this.onDialogInputChange}
                      placeholder="Enter Red Limit"
                      required={true}
                      validationMessage={"Please enter the Red Limit."}
                    />
                  </div>
                </div>
                <div className="col-4">
                  <label>Green Limit</label>
                  <div>
                    <KendoReactInput.Input
                      type="text"
                      className="form-control"
                      name="greenLimit"
                      maxLength="50"
                      value={this.state.kraInEdit.greenLimit
                          ? this.state.kraInEdit.greenLimit
                          : ""}
                      onChange={this.onDialogInputChange}
                      placeholder="Enter Green Limit"
                      required={true}
                      validationMessage={"Please enter the Green Limit."}
                    />
                  </div>
                </div>
                <div className="col-4">
                  <label>Yellow Limit</label>
                  <div>
                    <KendoReactInput.Input
                      type="text"
                      className="form-control"
                      name="yellowLimit"
                      maxLength="50"
                      value={this.state.kraInEdit.yellowLimit
                          ? this.state.kraInEdit.yellowLimit
                          : ""}
                      onChange={this.onDialogInputChange}
                      placeholder="Enter Yellow Limit"
                      required={true}
                      validationMessage={"Please enter the Red Limit."}
                    />
                  </div>
                </div>
                </div>
            </div>
          </form>
        </div>
        <SaveCancel
          save="kraForm"
          cancel={this.props.cancel}
          hideSave={this.props.diableField}
        />
      </KendoReactWindow.Window>
    );
  }
}
