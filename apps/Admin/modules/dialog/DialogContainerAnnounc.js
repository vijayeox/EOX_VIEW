import React from "react";
import { Window } from "@progress/kendo-react-dialogs";
import TextareaAutosize from "react-textarea-autosize";
import scrollIntoView from "scroll-into-view-if-needed";
import { FileUploader, Notification } from "../../GUIComponents";
import { SaveCancel, DateComponent } from "../components/index";
import Moment from "moment";
export default class DialogContainer extends React.Component {
  constructor(props) {
    super(props);
    this.core = this.props.args;
    this.url = this.core.config("wrapper.url");
    this.state = {
      ancInEdit: this.props.dataItem || null
    };
    this.fUpload = React.createRef();
    this.notif = React.createRef();
    this.loader = this.core.make("oxzion/splash");
  }

  valueChange = (field, event) => {
    let ancInEdit = { ...this.state.ancInEdit };
    ancInEdit[field] = event.target.value;
    this.setState({ ancInEdit: ancInEdit });
  };

  async pushFile(event) {
    var files = this.fUpload.current.state.selectedFile[0].getRawFile();
    let helper = this.core.make("oxzion/restClient");

    let ancFile = await helper.request(
      "v1",
      "/attachment",
      {
        type: "ANNOUNCEMENT",
        files: files
      },
      "filepost"
    );
    return ancFile;
  }

  async pushData(fileCode) {
    let helper = this.core.make("oxzion/restClient");
    let ancAddData = await helper.request(
      "v1",
      "organization/" + this.props.selectedOrg + "/announcement",
      {
        name: this.state.ancInEdit.name,
        media: fileCode,
        status: "1",
        description: this.state.ancInEdit.description,
        media_type: this.state.ancInEdit.media_type,
        start_date: new Moment(this.state.ancInEdit.start_date).format(
          "YYYY-MM-DD"
        ),
        end_date: new Moment(this.state.ancInEdit.end_date).format("YYYY-MM-DD")
      },
      "post"
    );
    return ancAddData;
  }

  async editAnnouncements(fileCode) {
    let helper = this.core.make("oxzion/restClient");
    let orgEditData = await helper.request(
      "v1",
      "/announcement/" + this.state.ancInEdit.uuid,
      {
        name: this.state.ancInEdit.name,
        media: fileCode,
        status: "1",
        description: this.state.ancInEdit.description,
        media_type: this.state.ancInEdit.media_type,
        start_date: new Moment(this.state.ancInEdit.start_date).format(
          "YYYY-MM-DD"
        ),
        end_date: new Moment(this.state.ancInEdit.end_date).format("YYYY-MM-DD")
      },
      "put"
    );
    return orgEditData;
  }

  sendTheData = () => {
    var temp1 = this.state.selectedGroups;
    var temp2 = [];
    for (var i = 0; i <= temp1.length - 1; i++) {
      var gid = { id: temp1[i] };
      temp2.push(gid);
    }
    this.pushAnnouncementGroups(this.state.ancInEdit.id, JSON.stringify(temp2));

    this.setState({
      visible: !this.state.visible,
      groupsList: [],
      value: [],
      pushAnnouncementGroups: []
    });
  };

  media_typeChange = value => {
    let ancInEdit = { ...this.state.ancInEdit };
    ancInEdit.media_type = value;
    this.setState({ ancInEdit: ancInEdit });
  };

  editTriggerFunction(file) {
    this.editAnnouncements(file).then(response => {
       this.loader.destroy();
      if (response.status == "success") {
        this.props.action(response);
        this.props.cancel();
      } else {
        this.notif.current.notify("Error",response.message ? response.message : null,"danger")
      }
    });
  }

  onDialogInputChange = event => {
    let target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.props ? target.props.name : target.name;

    const edited = this.state.ancInEdit;
    edited[name] = value;

    this.setState({
      ancInEdit: edited
    });
  };

  handleSubmit = event => {
    this.loader.show();
    event.preventDefault();
    if (this.props.formAction == "put") {
      if (this.fUpload.current.state.selectedFile.length == 0) {
        this.editTriggerFunction(this.props.dataItem.media);
      } else {
        this.pushFile().then(response => {
          var addResponse = response.data.filename[0];
          this.editTriggerFunction(addResponse);
        });
      }
    } else {
      if (this.fUpload.current.state.selectedFile.length == 0) {
        var elm = document.getElementsByClassName("ancBannerUploader")[0];
        scrollIntoView(elm, {
          scrollMode: "if-needed",
          block: "center",
          behavior: "smooth",
          inline: "nearest"
        });
      
        this.notif.current.notify(
          "No Media Selected",
          "Please select a banner for the Announcement.",
          "warning"
        )
      } else {
        this.pushFile().then(response => {
          var addResponse = response.data.filename[0];
          this.pushData(addResponse).then(response => {
             this.loader.destroy();
            if (response.status == "success") {
              this.props.action(response);
              this.props.cancel();
            } else {
              this.notif.current.notify(
                "Error",
                response.message ? response.message : null,
                "danger"
              )
            }
          });
        });
      }
    }
  };

  render() {
    return (
      <Window onClose={this.props.cancel}>
        <Notification ref={this.notif} />
        <div className="container-fluid">
          <form onSubmit={this.handleSubmit} id="ancForm">
            {this.props.diableField ? (
              <div className="read-only-mode">
                <h5>(READ ONLY MODE)</h5>
                <i className="fa fa-lock"></i>
              </div>
            ) : null}
            <div className="form-group">
              <label className="required-label">Announcement Title</label>
              <input
                type="text"
                className="form-control"
                name="name"
                value={this.state.ancInEdit.name || ""}
                maxLength="100"
                onChange={this.onDialogInputChange}
                placeholder="Enter Announcement Title"
                required={true}
                readOnly={this.props.diableField ? true : false}
              />
            </div>
            <div className="form-group text-area-custom">
              <label className="required-label">Description</label>
              <TextareaAutosize
                type="text"
                className="form-control"
                name="description"
                maxLength="2000"
                value={this.state.ancInEdit.description || ""}
                onChange={this.onDialogInputChange}
                placeholder="Enter Announcement Description"
                style={{ marginTop: "5px", minHeight: "100px" }}
                required={true}
                readOnly={this.props.diableField ? true : false}
              />
            </div>

            <div className="form-group">
              <div className="form-row">
                <div className="col-4 ">
                  <label className="required-label">Start Data</label>
                  <div>
                    <DateComponent
                      format={this.props.userPreferences.dateformat}
                      value={this.state.ancInEdit.start_date}
                      min={new Date()}
                      max={
                        new Date(
                          new Date().getTime() + 365 * 24 * 60 * 60 * 1000
                        )
                      }
                      change={e => this.valueChange("start_date", e)}
                      required={true}
                      disabled={this.props.diableField ? true : false}
                    />
                  </div>
                </div>
                <div className="col-4">
                  <label className="required-label">End Date</label>
                  <div>
                    <DateComponent
                      format={this.props.userPreferences.dateformat}
                      value={this.state.ancInEdit.end_date}
                      min={new Date()}
                      max={
                        new Date(
                          new Date().getTime() + 365 * 24 * 60 * 60 * 1000
                        )
                      }
                      change={e => this.valueChange("end_date", e)}
                      required={true}
                      disabled={this.props.diableField ? true : false}
                    />
                  </div>
                </div>
              </div>
            </div>
            {this.props.diableField ? (
              <div style={{ margin: "50px" }} />
            ) : (
              <div className="ancBannerUploader">
                <FileUploader
                  ref={this.fUpload}
                  media_URL={
                    this.props.dataItem.media
                      ? this.url + "resource/" + this.props.dataItem.media
                      : undefined
                  }
                  acceptFileTypes={"image/*, video/mp4"}
                  media_typeChange={this.media_typeChange}
                  media_type={this.state.ancInEdit.media_type}
                  title={"Upload Announcement Banner"}
                  uploadID={"announcementLogo"}
                />
              </div>
            )}
          </form>
        </div>
        <SaveCancel
          save="ancForm"
          cancel={this.props.cancel}
          hideSave={this.props.diableField}
        />
      </Window>
    );
  }
}
