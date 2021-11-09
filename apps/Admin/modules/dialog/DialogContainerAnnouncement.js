import {React,Notification,KendoReactWindow,KendoReactInput,Moment} from "oxziongui";
import { Editor, EditorTools, EditorUtils } from '@progress/kendo-react-editor';
import scrollIntoView from "scroll-into-view-if-needed";
import { SaveCancel, DateComponent, FileUploader } from "../components/index";
export default class DialogContainerAnnouncement extends React.Component {
  constructor(props) {
    super(props);
    this.core = this.props.args;
    this.url = this.core.config("wrapper.url");
    this.state = {
      ancInEdit: this.props.dataItem || null,
      disableSave: false
    };
    this.editor = null;
    this.fUpload = {};
    this.notif = React.createRef();
    this.loader = this.core.make("oxzion/splash");
  }
  valueChange = (field, event) => {
    let ancInEdit = { ...this.state.ancInEdit };
    ancInEdit[field] = event.target.value;
    this.setState({ ancInEdit: ancInEdit });
  };

  async pushFile(event) {
    var files = this.fUpload.state.selectedFile[0].getRawFile();
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
    this.state.ancInEdit['description'] = EditorUtils.getHtml(this.editor.view.state);

    let helper = this.core.make("oxzion/restClient");
    let ancAddData = await helper.request(
      "v1",
      "account/" + this.props.selectedOrg + "/announcement",
      {
        name: this.state.ancInEdit.name,
        media: fileCode,
        status: "1",
        description: this.state.ancInEdit.description,
        link: this.state.ancInEdit.link,
        type: this.state.ancInEdit.type,
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
    this.state.ancInEdit['description'] = EditorUtils.getHtml(this.editor.view.state);

    let helper = this.core.make("oxzion/restClient");
    let orgEditData = await helper.request(
      "v1",
      "/announcement/" + this.state.ancInEdit.uuid,
      {
        name: this.state.ancInEdit.name,
        media: fileCode,
        status: "1",
        description: this.state.ancInEdit.description,
        link: this.state.ancInEdit.link,
        type: this.state.ancInEdit.type,
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
    var temp1 = this.state.selectedTeams;
    var temp2 = [];
    for (var i = 0; i <= temp1.length - 1; i++) {
      var gid = { id: temp1[i] };
      temp2.push(gid);
    }
    this.pushAnnouncementTeams(this.state.ancInEdit.id, JSON.stringify(temp2));

    this.setState({
      visible: !this.state.visible,
      groupsList: [],
      value: [],
      pushAnnouncementTeams: []
    });
  };

  media_typeChange = (value) => {
    let ancInEdit = { ...this.state.ancInEdit };
    ancInEdit.media_type = value;
    this.setState({ ancInEdit: ancInEdit });
  };

  editTriggerFunction(file) {
    this.editAnnouncements(file).then((response) => {
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

  onDialogInputChange = (event) => {
    let target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.props ? target.props.name : target.name;

    const edited = this.state.ancInEdit;
    edited[name] = value;

    this.setState({
      ancInEdit: edited
    });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    
    let ancInEdit = { ...this.state.ancInEdit };
    ancInEdit['description'] = EditorUtils.getHtml(this.editor.view.state);
    this.setState({ ancInEdit: ancInEdit });

    if (this.props.formAction == "put") {
      this.setState({
        disableSave: true
      });
      this.loader.show();
      if (this.fUpload.state.selectedFile.length == 0) {
        this.editTriggerFunction(this.props.dataItem.media);
      } else {
        this.pushFile().then((response) => {
          var addResponse = response.data.filename[0];
          this.editTriggerFunction(addResponse);
        });
      }
    } else {
      if (this.fUpload.state.selectedFile.length == 0) {
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
        );
      } else {
        this.setState({
          disableSave: true
        });
        this.loader.show();
        this.pushFile().then((response) => {
          var addResponse = response.data.filename[0];
          this.pushData(addResponse).then((response) => {
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
        });
      }
    }
    this.core.emit("admin/announcement:modified");
  };

  render() {
    return (
      <KendoReactWindow.Window onClose={this.props.cancel}>
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
              <KendoReactInput.Input
                type="text"
                className="form-control"
                name="name"
                value={this.state.ancInEdit.name || ""}
                maxLength="100"
                onChange={this.onDialogInputChange}
                placeholder="Enter Announcement Title"
                required={true}
                validationMessage={"Please give a Title for the Announcement"}
                readOnly={this.props.diableField ? true : false}
              />
            </div>
            <div className="form-group text-area-custom">
              <label>Description</label>
              <Editor

            tools={[
                     EditorTools.Bold, EditorTools.Italic, EditorTools.Underline, EditorTools.Strikethrough,EditorTools.Subscript, EditorTools.Superscript,EditorTools.AlignLeft, EditorTools.AlignCenter, EditorTools.AlignRight, EditorTools.AlignJustify,EditorTools.Indent, EditorTools.Outdent,EditorTools.OrderedList ,
                     EditorTools.UnorderedList,EditorTools.Undo, EditorTools.Redo,EditorTools.Link,EditorTools.Unlink,EditorTools.AddRowBefore, EditorTools.AddRowAfter, EditorTools.AddColumnBefore,EditorTools.AddColumnAfter,EditorTools.DeleteRow, EditorTools.DeleteColumn, EditorTools.DeleteTable,EditorTools.MergeCells, EditorTools.SplitCell

                ]}
                ref={editor => this.editor = editor}
                 type="text"
                 className="form-control"
                 name="description"
                 maxLength="2000"
                 value={this.state.ancInEdit.description}
                 onChange={this.onDialogInputChange}
                 placeholder="Enter Announcement Description"
                 style={{ marginTop: "20px", minHeight: "200px", maxHeight: "250px" ,height:"250px" }}
                 readOnly={this.props.diableField ? true : false}
              />
            </div>
            <div className="form-group">
     
              <label>External Link</label>
              <KendoReactInput.Input
                type="url"
                pattern="^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$"
                className="form-control"
                name="link"
                value={this.state.ancInEdit.link || ""}
                maxLength="2048"
                onChange={this.onDialogInputChange}
                placeholder="Enter External Link"
                readOnly={this.props.diableField ? true : false}
                validationMessage={
                  "Please enter a valid URL starting with https://"
                }
              />
            </div>

            <div className="form-group">
              <div className="form-row">
                <div className="col-3 ">
                  <label className="required-label">Start Date</label>
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
                      change={(e) => this.valueChange("start_date", e)}
                      required={true}
                      validationMessage={
                        "Please select the start date for the Announcement"
                      }
                      disabled={this.props.diableField ? true : false}
                    />
                  </div>
                </div>
                <div className="col-3">
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
                      change={(e) => this.valueChange("end_date", e)}
                      required={true}
                      validationMessage={
                        "Please select the end date for the Announcement"
                      }
                      disabled={this.props.diableField ? true : false}
                    />
                  </div>
                </div>
                <div className="col-6">
                  <label className="required-label">Announcement Type</label>
                  <div>
                    <span className="col-sm-6">
                      <input
                        type="radio"
                        id="hRadio"
                        name="type"
                        value="HOMESCREEN"
                        className="k-radio"
                        onChange={(e) => this.valueChange("type", e)}
                        checked={this.state.ancInEdit.type == "HOMESCREEN"}
                        disabled={this.props.diableField ? true : false}
                        required
                      />
                      <label
                        className="k-radio-label pl-4 radioLabel"
                        htmlFor="hRadio"
                      >
                        Homescreen
                      </label>
                    </span>
                    <span className="col-sm-6">
                      <input
                        type="radio"
                        id="aRadio"
                        name="type"
                        value="ANNOUNCEMENT"
                        className="k-radio pl-2"
                        onChange={(e) => this.valueChange("type", e)}
                        checked={this.state.ancInEdit.type == "ANNOUNCEMENT"}
                        disabled={this.props.diableField ? true : false}
                        required
                      />
                      <label
                        className="k-radio-label pl-4 radioLabel"
                        htmlFor="aRadio"
                      >
                        Announcement
                      </label>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {this.props.diableField ? (
              <div style={{ margin: "50px" }} />
            ) : (
              <div className="ancBannerUploader">
                <FileUploader
                  tempref={e => this.fUpload = e}
                  media_URL={
                    this.props.dataItem.media
                      ? this.url + "resource/" + this.props.dataItem.media
                      : undefined
                  }
                  enableVideo={true}
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
          disableSave={this.state.disableSave}
        />
      </KendoReactWindow.Window>
    );
  }
}
