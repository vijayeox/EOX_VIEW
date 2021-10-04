import React from "react";
import PageContent from "./PageContent";
import TabSegment from "./TabSegment";
import { Button, DropDownButton } from "@progress/kendo-react-buttons";
import PrintPdf from "./../print/printpdf";
import ActivityLog from "./ActivityLog";
import moment from "moment";
class EntityViewer extends React.Component {
  constructor(props) {
    super(props);
    this.core = this.props.core;
    this.profileAdapter = this.core.make("oxzion/profile");
    this.profile = this.profileAdapter.get();
    this.appId = this.props.appId;
    this.fileId = this.props.fileId;
    this.proc = this.props.proc;
    this.state = {
      content: this.props.content,
      fileData: this.props.fileData,
      entityId: null,
      showAuditLog: false,
      showPDF: false,
      dataReady: false,
      editButton: null,
      entityConfig: null,
      filePanelUuid: this.uuidv4(),
      tabPanel: 'tabpanel-',
    };
  }

  async getFileDetails(fileId) {
    let helper = this.core.make("oxzion/restClient");
    let fileContent = await helper.request(
      "v1",
      "/app/" + this.appId + "/file/" + fileId + "/data",
      {},
      "get"
    );
    return fileContent;
  }
  async getEntityPage() {
    let helper = this.core.make("oxzion/restClient");
    let fileContent = await helper.request(
      "v1",
      "/app/" + this.appId + "/entity/" + this.state.entityId + "/page",
      {},
      "get"
    );
    return fileContent;
  }
  updatePageContent = (config) => {
    let eventDiv = document.getElementById("navigation_" + this.appId);
    let ev2 = new CustomEvent("addPage", {
      detail: config,
      bubbles: true,
    });
    eventDiv.dispatchEvent(ev2);
  };
  callPrint() {
    this.setState({ showPDF: true });
  }
  callAuditLog() {
    this.setState({ showAuditLog: true });
  }
  generateEditButton(enableComments, enableAuditLog, fileData) {
    var fileId;
    let gridToolbarContent = [];
    var filePage;
    const toolbarButtons = [];
    if (this.props.fileId) {
      fileId = this.props.fileId;
    } else {
      if (this.state.fileId) {
        fileId = this.state.fileId;
      }
    }
    // const isTaskApp = this.appId === "454a1ec4-eeab-4dc2-8a3f-6a4255ffaee1" || this.appId === "ff1ecbb7-3a45-4966-b38c-bf203f171423";
    const isTaskApp = [ "f4b323b6-c60d-42a6-98db-1b9a711ce5b5" ,"454a1ec4-eeab-4dc2-8a3f-6a4255ffaee1", "af6056c1-be46-4266-b83c-4b2177bcc7ca" ].includes(this.appId);
    console.log('FileData', this.appId, this.state);
    
    if (isTaskApp) {
      gridToolbarContent.push(this.getTaskHeader(fileData, this.appId === "454a1ec4-eeab-4dc2-8a3f-6a4255ffaee1"));
      setTimeout(() => {
        const appDescription = document.getElementById(`${this.appId}_description`);
        if (appDescription && this.appId === "454a1ec4-eeab-4dc2-8a3f-6a4255ffaee1" ) {
          appDescription.innerHTML = fileData?.data?.data?.description;
          this.setState({ filePanelUuid: `${this.appId}_description`, tabPanel: '' })
        }
        else if(this.appId === "f4b323b6-c60d-42a6-98db-1b9a711ce5b5"){
          const innerHtml = `<div class="pto"> <div class="pto-data"> <b>Employee Name</b> <p>${fileData?.data?.data.name}</p> </div> <div class="pto-data"> <b>Type of leave</b> <p>${fileData?.data?.data.leaveType}</p> </div> <div class="pto-data"> <b>Status</b> <p>${fileData?.data?.data.status}</p> </div> <div class="pto-data"> <b>Leave Start Date</b> <p>${fileData?.data?.data.leaveStartDatePto}</p> </div> <div class="pto-data"> <b>Leave End Date</b> <p>${fileData?.data?.data.leaveEndDatePto}</p> </div> <div class="pto-data"> <b>Observer</b> <p>${fileData?.data?.data.HRname}</p> </div> </div> <div class="pto-data padding-top-20"> <b>Description</b> <p>${fileData?.data?.data.description}</p> </div>`
          appDescription.innerHTML = innerHtml;
          this.setState({ filePanelUuid: `${this.appId}_description`, tabPanel: '' })
        }
      })
    }
    if (this.state.entityConfig && !this.state.entityConfig.has_workflow) {
      filePage = [
        {
          type: "Form",
          form_id: this.state.entityConfig.form_uuid,
          name: this.state.entityConfig.form_name,
          fileId: fileId,
        },
      ];
      let pageContent = {
        pageContent: filePage,
        title: "Edit",
        icon: "far fa-pencil",
      };
      toolbarButtons.push(
        <Button
          title={"Edit"}
          className={"btn btn-primary"}
          primary={true}
          onClick={(e) => this.updatePageContent(pageContent)}
        >
          <i className={"fa fa-pencil"}></i>
        </Button>
      );
    }
    toolbarButtons.push(
      <Button
        title={"Print"}
        className={"btn btn-primary"}
        primary={true}
        onClick={(e) => this.callPrint()}
      >
        <i className={"fa fa-print"}></i>
      </Button>
    );
    if (enableAuditLog) {
      toolbarButtons.push(
        <Button
          title={"Audit Log"}
          className={"btn btn-primary"}
          primary={true}
          onClick={(e) => this.callAuditLog()}
        >
          <i className={"fa fa-history"}></i>
        </Button>
      );
    }
    if (enableComments != "0") {
      var commentPage = {
        title: "Comments",
        icon: "far fa-comment",
        pageContent: [{ type: "Comment", fileId: fileId }],
      };
      toolbarButtons.push(
        <Button
          title={"Comments"}
          className={"btn btn-primary"}
          primary={true}
          onClick={(e) => this.updatePageContent(commentPage)}
        >
          <i className={"fa fa-comment"}></i>
        </Button>
      );
    }
    toolbarButtons.push(
      <Button
        title={"Generate Link"}
        className={"btn btn-primary"}
        primary={true}
        onClick={(e) =>
          this.core
            .make("oxzion/link")
            .copyToClipboard(
              '<a eoxapplication="' +
              this.state.entityConfig.app_name +
              '" file-id="' +
              fileId +
              '" href="' +
              this.core.config("ui.url") +
              "?app=" +
              this.state.entityConfig.app_name +
              "&fileId=" +
              fileId +
              '" >Link</a>'
            )
        }
      >
        <i className={"fa fa-share-alt"}></i>
      </Button>
    );
    gridToolbarContent.push(
      <div className={`display-flex ${isTaskApp ? "task-header-pos-abs" : ""}`}>
        {toolbarButtons}
      </div>
    );
    let ev = new CustomEvent("addcustomActions", {
      detail: { customActions: gridToolbarContent },
      bubbles: true,
    });
    document.getElementById(this.appId + "_breadcrumbParent").dispatchEvent(ev);
  }

  getTaskHeader(fileData, isTask) {
    // const ptoJsx = <>
    // <div class="pto"> <div class="pto-data"> 
    // <b>Employee Name</b> 
    // <p>{fileData?.data?.name}</p> </div> <div class="pto-data"> <b>Type of leave</b> <p>{fileData?.data?.leaveType}</p> </div> <div class="pto-data"> <b>Status</b> <p>{fileData?.data?.status}</p> </div> <div class="pto-data"> <b>Leave Start Date</b> <p>{fileData?.data?.leaveStartDatePto}</p> </div> <div class="pto-data"> <b>Leave End Date</b> <p>{data.leaveEndDatePto}</p> </div> <div class="pto-data"> <b>Observer</b> <p>{data.HRname}</p> </div> </div> <div class="pto-data padding-top-20"> <b>Description</b> <p dangerouslySetInnerHTML={{ __html: fileData?.data?.description }}></p> </div></>
    const breadCrumb = document.getElementById(
      this.appId + "_breadcrumbParent"
    );
    const breadCrumbClassList = breadCrumb?.children[0]?.classList;
    breadCrumbClassList?.add("display-flex");
    breadCrumbClassList?.add("width-100");
    const {
      data: {
        title,
        data: { status, start_date, next_action_date, username, assignedto, ownerid, end_date , exitHireDate , exitTerminationDate, exitStatus, pipCommencementDate, pipCompletionDate, pipStatus, transportationStartDate, transportationEndDate, transportStatus, startDate, endDate, statusResignationForm},
        // Apologies for adding this additional field name. Due to lack of time in hand, we are adding these.
        // These will be cleared up in the next release. 
        ownerId
      },
    } = fileData;
    var imageAssigned = this.core.config("wrapper.url") + "user/profile/" + assignedto;
    var imageOwner = this.core.config("wrapper.url") + "user/profile/" + ownerId;
    const goBack = () => {
      const activeBreadcrumbs = document.getElementsByClassName('activeBreadcrumb');
      if(activeBreadcrumbs && activeBreadcrumbs?.length > 0){
        activeBreadcrumbs?.[activeBreadcrumbs.length-1]?.children?.[0]?.click()
      }
    }
    let completedHours = 0;
    let remainingHours = 0;
    let finishedPercentage = 0;
    try{
      const start = new Date(start_date).getTime(); //WHEN WORK STARTED
      const today = Date.now() + (5.3 * 60 * 60 * 1000); // NOW + UTC
      const end = new Date(end_date).getTime(); //END DATE
      if(status.toLowerCase() !== 'completed'){
        if(start <= today && today <= end){
          completedHours = moment.duration(moment(today).diff(moment(start))).asHours();
          remainingHours = moment.duration(moment(end).diff(moment(today))).asHours();
        }
        else{
          remainingHours = moment.duration(moment(start).diff(moment(end))).asHours();
        }
      }else{
        finishedPercentage = 100;
        completedHours = moment.duration(moment(end).diff(moment(start))).asHours();
      }
      remainingHours = Math.floor(Math.abs(remainingHours))
      completedHours = Math.floor(Math.abs(completedHours))
      finishedPercentage = Math.floor(completedHours/(completedHours+remainingHours)*100);
    }catch(e){
      console.error(`Time cal error : ${e}`)
    }

    return (

      <div className="task-header width-100">
        <i className="fa fa-arrow-from-left go-back" onClick={goBack}></i>
        <div className="task-header_taskname">
          {title
            .split(" ")
            .slice(0, 2)
            .map((v) => v[0].toUpperCase())
            .join("")}
        </div>
        <div className="task-header_info width-100">
          <div className="task-header_name" title={title}>
            {title}
          </div>
          <div className="task-header_details">
            <div>
              <p>Status</p> <span className="task-status"></span>{" "}
              <p>{(status || exitStatus || pipStatus || statusResignationForm || transportStatus).toUpperCase()}</p>
            </div>
            <div>
              <p>Created On</p> <p>{(start_date || exitHireDate || pipCommencementDate || startDate || transportationStartDate).substring(0,10)}</p>
            </div>
            <div>
              <p>Due On</p> <p>{(end_date || exitTerminationDate || pipCompletionDate || endDate || transportationEndDate).substring(0,10)}</p>
            </div>
            <div className="owner-assignee">
              Assigned To {(imageAssigned) ? <div className='msg-img' style={{ background: `url(${imageAssigned})`, backgroundSize: "contain", height: "20px", width: "20px", borderRadius: "50%" }}></div> : <i className="fad fa-user owner-assignee-dp"></i>}
              {/* <div className='msg-img' style={{ background: `url(${imageAssigned})`, backgroundSize: "contain" }}></div> */}
              {/* <p>{username}</p> */}
            </div>
            <div className="owner-assignee">
              Owner {(imageOwner != null) ? <div className='msg-img' style={{ background: `url(${imageOwner})`, backgroundSize: "contain", height: "20px", width: "20px", borderRadius: "50%"  }}></div> : <i className="fad fa-user owner-assignee-dp"></i>}
              {/* <div className='msg-img' style={{ background: `url(${image})`, backgroundSize: "contain" }}></div> */}
              {/* <p>{assignedToName}</p> */}
            </div>
            {isTask && <div className="task-header_progress">
              <div className="task-header_progress--data">
                <div>
                  <span>
                    <strong>{completedHours}H</strong> Done
                  </span>
                  <span>
                    <strong>{remainingHours}H</strong> To do
                  </span>
                </div>
                <div>
                  <div
                    style={{
                      width: `${Math.floor(completedHours/(completedHours+remainingHours) * 100)}%`,
                      background: "green",
                      padding: "1.5px",
                      margin: 0,
                    }}
                  ></div>
                  <div
                    style={{
                      width: `${Math.floor(remainingHours/(completedHours+remainingHours) * 100).toFixed(0)}%`,
                      background: "red",
                      padding: "1.5px",
                      margin: 0,
                    }}
                  ></div>
                </div>
              </div>
              <p className="display-flex">
                <strong>{Math.floor(completedHours/(completedHours+remainingHours) * 100)}%</strong>
                <p>Done</p>
              </p>
            </div>}
          </div>
        </div>
      </div>
    );
  }

  componentDidMount() {
    this.getFileDetails(this.props.fileId).then((fileData) => {
      if (
        fileData.status == "success" &&
        fileData.data &&
        fileData.data.entity_id
      ) {
        var file = fileData.data.data ? fileData.data.data : fileData.data;
        this.setState({ entityId: fileData.data.entity_id, fileData: file });
        this.getEntityPage().then((entityPage) => {
          console.log(`fileData-`, fileData)
          if (!fileData?.data?.data?.uuid) {
            fileData.data.data.uuid = fileData?.data?.uuid;
          }
          this.setState({ entityConfig: entityPage.data });
          this.generateEditButton(
            entityPage.data.enable_documents,
            entityPage.data.enable_auditlog,
            fileData
          );
          var content = this.constructTabs(
            entityPage.data,
            entityPage.data.enable_documents,
            entityPage.data.enable_view
          );
          this.setState({ content: content });
          this.setState({ dataReady: true });
        });
      }
    });
  }
  uuidv4() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0,
          v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }
  constructTabs(page, enableDocuments, enableView) {
    var tabs = [];
    var that = this;
    var content = page.content ? page.content : null;
    var finalContentArray = [];
    if (content && content.length > 0) {
      content.map(function (key, index) {
        content[index]["fileId"] = that.fileId;
        finalContentArray.push(content[index]);
      });
    }
    if (finalContentArray && enableView) {
      tabs.push({
        name: "View",
        uuid: that.state.filePanelUuid,
        content: finalContentArray,
      });
    }
    if (enableDocuments != "0") {
      tabs.push({
        name: "Attachments",
        uuid: this.uuidv4(),
        content: [
          { type: "DocumentViewer", url: "file/" + this.fileId + "/document" },
        ],
      });
    }
    return (
      <TabSegment
        appId={this.appId}
        core={this.core}
        appId={this.appId}
        proc={this.proc}
        fileId={this.state.fileId}
        tabs={tabs}
        pageId={this.uuidv4()}
        currentRow={this.state.fileData}
      />
    );
  }
  closePDF = () => {
    this.setState({ showPDF: false });
  };
  closeAuditLog = () => {
    this.setState({ showAuditLog: false });
  };

  render() {
    if (this.state.dataReady) {
      return (
        <div className="contentDiv">
          {this.state.showPDF ? (
            <PrintPdf
              cancel={this.closePDF}
              idSelector={this.state.tabPanel + "" + this.state.filePanelUuid}
              osjsCore={this.core}
            />
          ) : null}
          {this.state.content}
          {this.state.showAuditLog ? (
            <ActivityLog
              cancel={this.closeAuditLog}
              appId={this.appId}
              fileId={this.fileId}
              core={this.core}
            />
          ) : null}
        </div>
      );
    } else {
      return <div></div>;
    }
  }
}

export default EntityViewer;
