import { Button } from "@progress/kendo-react-buttons";
import moment from "moment";
import React from "react";
import { Dropdown } from "react-bootstrap";
import Swal from "sweetalert2";
import * as OxzionGUIComponents from "../../../index";
import Dashboard from "../../components/OI/Dashboard";
import DashboardManager from "../../components/OI/DashboardManager";
import OX_Grid from "../../components/OI/OX_Grid";
import DocumentViewer from "../../DocumentViewer";
import Helpers from '../../helpers';
import CustomGoogleMapComponent from "../googlemapfinal/App";
import KanbanView from "../Kanban/KanbanRoutes";
import PageNavigation from "../PageNavigation";
import UploadArtifact from "../UploadArtifact";
import ActivityLog from "./ActivityLog";
import CommentsView from "./CommentsView";
import DynamicTemplateViewer from "./DynamicTemplateViewer";
import EntityViewer from "./EntityViewer";
import FormRender from "./FormRender";
import HTMLViewer from "./HTMLViewer";
import Page from "./Page";
import ReactComponent from "./ReactComponent";
import RenderButtons from "./RenderButtons";
import SearchPage from "./SearchPage";
import "./Styles/PageComponentStyles.scss";
import TabSegment from "./TabSegment";
class PageContent extends React.Component {
  constructor(props) {
    super(props);
    this.core = this.props.core;
    this.appId = this.props.appId;
    this.proc = this.props.proc;
    this.pageId = this.props.pageId;
    this.contentRef = React.createRef();
    this.params = this.props.params;
    this.notif = this.props.notif;
    this.userprofile = this.props.core.make("oxzion/profile").get().key;
    this.restClient = this.core.make("oxzion/restClient")
    this.isTab = this.props.isTab;
    this.parentPage = this.props.parentPage ? this.props.parentPage : null;
    this.loader = this.core.make("oxzion/splash");
    this.parentPageData = props.parentRowData;
    this.fetchExternalComponents().then((response) => {
      this.extGUICompoents = response.guiComponent ? response.guiComponent : undefined;
      this.setState({
        showLoader: false,
      });
    });
    this.contentDivID = "content_" + this.appId + "_" + (this.pageId ? this.pageId : Helpers.Utils.generateUUID());
    this.state = {
      pageContent: this.props.pageContent ? this.props.pageContent : [],
      pageId: this.props.pageId,
      submission: this.props.submission,
      showLoader: false,
      fileData: this.props.fileData ? this.props.fileData : {},
      fileId: this.props.fileId ? this.props.fileId : null,
      isMenuOpen: false,
      currentRow: this.props.currentRow ? this.props.currentRow : {},
      title: "",
      notif: this.notif,
      displaySection: "DB",
      sectionData: null,
    };
  }

  async fetchExternalComponents() {
    return await import("../../externals/" + this.appId + "/index.js");
  }

  componentWillUnmount(){
    this.restClient.clearMemoizedData(this.appId, 'FILE')
  }

  componentDidUpdate(prevProps) {
    if (this.props.pageContent !== prevProps.pageContent) {
      var PageRenderDiv = document.querySelector(".PageRender");
      this.loader.show(PageRenderDiv);
      this.fetchExternalComponents().then((response) => {
        this.extGUICompoents = response.guiComponent ? response.guiComponent : undefined;
      });
      this.setState({ pageContent: this.props.pageContent });
    }
  }

  componentDidMount() {
    document.getElementById(this.contentDivID) ? document.getElementById(this.contentDivID).addEventListener("clickAction", (e) => this.buttonAction(e.detail, {}), false) : null;
  }

  renderButtons(e, action) {
    var actionButtons = [];
    const onActionClick = (action) => {
      action.confirmationMessage
        ? Swal.fire({
            title: action.confirmationMessage,
            confirmButtonText: "Agree",
            confirmButtonColor: "#275362",
            showCancelButton: true,
            cancelButtonColor: "#7b7878",
            target: ".PageRender",
          }).then((result) => {
            result.value ? this.buttonAction(action, e) : null;
          })
        : action.details
        ? this.buttonAction(action, e)
        : null;
    };
    const showAction = (action) => {
      try {
        const row = e;
        const _moment = moment;
        const profile = this.userprofile;
        const string = Helpers.Helpers.ParameterHandler.replaceParams(this.appId, action[key].rule, e).replace(/moment/g, "_moment");
        return eval(string);
      } catch (e) {
        return true;
      }
    };
    Object.keys(action)
      .slice(0, 3)
      .map(function (key, index) {
        var showButton = showAction(action[key]);
        var buttonStyles = action[key].icon
          ? {
              width: "auto",
            }
          : {
              width: "auto",
              color: "white",
              fontWeight: "600",
            };
        showButton
          ? actionButtons.push(
              <abbr title={action[key].name} key={index}>
                <Button primary={true} className=' btn manage-btn k-grid-edit-command render-operation-btn' onClick={() => onActionClick(action[key])} style={buttonStyles}>
                  {action[key].icon ? <i className={action[key].icon + " manageIcons"}></i> : action[key].name}
                </Button>
              </abbr>
            )
          : null;
      }, this);
    if (action.length > 3) {
      const validActions = action
        .slice(3)
        .filter(showAction)
        .map(({ name, icon }, index) => {
          return (
            <Dropdown.Item key={name}>
              <div id={`actions-${name}-${index + 3}`} style={{ padding: "5px", fontWeight: "500" }} text={name} onClick={() => onActionClick(action)}>
                <i style={{ marginRight: "5px" }} className={icon + " manageIcons"}></i>
                {name}
              </div>
            </Dropdown.Item>
          );
        });
      if (validActions.length > 0) {
        actionButtons.push(
          <Dropdown className='show-more-action'>
            <Dropdown.Toggle className='show-more-actions'>...</Dropdown.Toggle>
            <Dropdown.Menu
              popperConfig={{ strategy: "fixed" }}
              onClick={(e) => {
                const a = action[e.nativeEvent?.target?.id?.split("-")?.[2]];
                if (a) onActionClick(a);
              }}>
              {validActions}
            </Dropdown.Menu>
          </Dropdown>
        );
      }
    }

    return actionButtons;
  }

  renderRow(e, config) {
    var url = config[0].content.route;
    var dataString = this.prepareDataRoute(url, e);
    return <OX_Grid appId={this.appId} osjsCore={this.core} data={dataString} pageId={this.pageId} gridToolbar={config[0].content.toolbarTemplate} columnConfig={config[0].content.columnConfig} />;
  }

  async buttonAction(actionCopy, rowData) {
    var action = actionCopy;
    if (action.content) {
      action.details = action.content;
    }
    var mergeRowData = this.props.currentRow ? { ...this.props.currentRow, ...rowData } : rowData;
    if (action.page_id) {
      PageNavigation.loadPage(this.appId, this.pageId, action.page_id);
    } else if (action.details) {
      var pageDetails = this.state.pageContent;
      var that = this;
      var copyPageContent = [];
      if (rowData.rygRule) {
        copyPageContent.push({ type: "HTMLViewer", content: rowData.rygRule, className: "rygBadge" });
      }
      var checkForTypeUpdate = false;
      var updateBreadcrumb = true;
      var pageId = null;
      if (action.details.length > 0) {
        action.details.every(async (item, index) => {
          if (item.type == "Update") {
            var PageRenderDiv = document.getElementById(this.contentDivID);
            this.loader.show(PageRenderDiv ? PageRenderDiv : null);
            checkForTypeUpdate = true;
            const response = await that.updateActionHandler(item, mergeRowData);
            if (response.status == "success") {
              this.loader.destroy();
              if (item.successMessage) {
                Swal.fire({ icon: "success", title: item.successMessage, showConfirmButton: true });
              }
              item.params.successNotification ? that.notif.current.notify("Success", item.params.successNotification.length > 0 ? item.params.successNotification : "Update Completed", "success") : null;
              this.postSubmitCallback();
              this.setState({ showLoader: false });
            } else {
              this.loader.destroy();
              Swal.fire({ icon: "error", title: response.message, showConfirmButton: true });
              that.setState({ pageContent: pageDetails, showLoader: false });
              return false;
            }
          } else {
            if (item.params && item.params.page_id) {
              pageId = item.params.page_id;
              if (item.params.params && typeof item.params.params === "string") {
                var newParams = Helpers.ParameterHandler.replaceParams(this.appId, item.params.params, mergeRowData);
                mergeRowData = { ...newParams, ...mergeRowData };
              } else if (item.params.params && typeof item.params.params === "object") {
                var params = {};
                Object.keys(item.params.params).map((i) => {
                  params[i] = Helpers.ParameterHandler.replaceParams(this.appId, item.params.params[i], mergeRowData);
                });
                mergeRowData = { ...params, ...mergeRowData };
              }
              copyPageContent = [];
            } else {
              var pageContentObj = {};
              pageContentObj = Helpers.ParameterHandler.replaceParams(this.appId, item, mergeRowData);
              copyPageContent.push(pageContentObj);
            }
          }
        });
        action.updateOnly ? null : PageNavigation.loadPage(this.appId, this.pageId, pageId, action.icon, true, action.name, mergeRowData, copyPageContent, undefined, action.popupConfig, mergeRowData);
      }
    }
  }

  updateActionHandler(details, rowData) {
    var that = this;
    return new Promise((resolve) => {
      var queryRoute = Helpers.ParameterHandler.replaceParams(that.appId, details.params.url, rowData);
      var postData = {};
      try {
        if (details.params.postData) {
          Object.keys(details.params.postData).map((i) => {
            postData[i] = Helpers.ParameterHandler.replaceParams(that.appId, details.params.postData[i], rowData);
          });
        } else {
          Object.keys(details.params).map((i) => {
            postData[i] = Helpers.ParameterHandler.replaceParams(that.appId, details.params[i], rowData);
          });
          postData = rowData;
        }
      } catch (error) {
        postData = rowData;
      }
      Helpers.ParameterHandler.updateCall(this.core, this.appId, queryRoute, postData, details.params.disableAppId, details.method).then((response) => {
        if (details.params.downloadFile && response.status == 200) {
          Helpers.ParameterHandler.downloadFile(response).then((result) => {
            that.setState({ showLoader: false });
            var downloadStatus = result ? "success" : "failed";
            resolve({ status: downloadStatus });
          });
        } else {
          that.setState({ showLoader: false });
          resolve(response);
        }
      });
    });
  }

  prepareDataRoute(route, params, disableAppId) {
    if (typeof route == "string") {
      if (!params) {
        params = {};
      }
      var result = Helpers.ParameterHandler.replaceParams(this.appId, route, params);
      result = disableAppId ? result : "app/" + this.appId + "/" + result;
      return result;
    } else {
      return route;
    }
  }

  setTitle = (title) => {
    this.setState({ title: title });
  };

  hideMenu = () => {
    this.setState({ isMenuOpen: false });
  };

  switchSection = (section, data) => {
    this.hideMenu();
    this.setState({
      displaySection: section,
      sectionData: data,
    });
  };
  editDashboard = (data) => {
    this.switchSection("EDB", data);
  };

  postSubmitCallback() {
    let ev = new CustomEvent("handleGridRefresh", {
      detail: { hideLoader: true },
      bubbles: true,
    });
    if (document.getElementById("navigation_" + this.appId)) {
      document.getElementById("navigation_" + this.appId).dispatchEvent(ev);
    }
  }

  renderContent(data) {
    var content = [];
    data.map((item, i) => {
      if (item.type == "Form") {
        var dataString = this.prepareDataRoute(item.url, this.state.currentRow);
        // This workflow instance id corresponds to completed workflow instance
        var workflowInstanceId = Helpers.ParameterHandler.replaceParams(this.appId, item.workflowInstanceId, this.state.currentRow);
        var workflowId = Helpers.ParameterHandler.replaceParams(this.appId, item.workflowId, this.state.currentRow);
        var activityInstanceId = Helpers.ParameterHandler.replaceParams(this.appId, item.activityInstanceId, this.state.currentRow);
        var cacheId = Helpers.ParameterHandler.replaceParams(this.appId, item.cacheId, this.state.currentRow);
        var urlPostParams = Helpers.ParameterHandler.replaceParams(this.appId, item.urlPostParams, this.state.currentRow);
        var fileId = Helpers.ParameterHandler.replaceParams(this.appId, item.fileId, this.state.currentRow);
        content.push(
          <FormRender
            {...item}
            key={i}
            url={item.url == "" ? undefined : dataString}
            urlPostParams={urlPostParams}
            core={this.core}
            proc={this.proc}
            appId={this.appId}
            postSubmitCallback={this.postSubmitCallback}
            fileId={fileId}
            formId={item.form_id}
            notif={this.notif}
            workflowId={workflowId}
            cacheId={cacheId}
            pageId={this.state.pageId}
            activityInstanceId={activityInstanceId}
            parentWorkflowInstanceId={workflowInstanceId}
            dataUrl={item.dataUrl ? this.prepareDataRoute(item.dataUrl, this.state.currentRow, true) : undefined}
          />
        );
      } else if (item.type == "List") {
        var itemContent = item.gridContent ? item.gridContent : item.content;
        var columnConfig = itemContent.columnConfig;
        if (itemContent.actions && itemContent.disableContextAction) {
          if (columnConfig[columnConfig.length - 1].title == "Actions") {
            null;
          } else {
            columnConfig.push({
              title: "Actions",
              // width:  itemContent.actions?.length > 3 && "250px" || null,
              cell: (e) => this.renderButtons(e, itemContent.actions),
              filterCell: {
                type: "empty",
              },
            });
          }
        }
        var mergeRowData = this.props.params ? { ...this.props.params, ...this.state.currentRow } : this.state.currentRow;
        var dataString = this.prepareDataRoute(itemContent.route, mergeRowData, itemContent.disableAppId);
        var urlPostParams = Helpers.ParameterHandler.replaceParams(this.appId, item.urlPostParams, mergeRowData);
        var listOptions = itemContent.listOptions;
        var reorderable = false;
        if (listOptions && listOptions.reorderable == "true") {
          reorderable = true;
        } else {
          reorderable = false;
        }
        var sortable = false;
        if (listOptions && listOptions.sortable == "true") {
          sortable = true;
        } else {
          sortable = false;
        }
        var resizable = false;
        if (listOptions && listOptions.resizable == "true") {
          resizable = true;
        } else {
          resizable = false;
        }
        var that = this;
        if (itemContent.operations) {
          if (itemContent.operations.actions) {
            itemContent.operations.actions.map((action, j) => {
              var act = action;
              if (Array.isArray(act.details)) {
                act.details.map((detail, k) => {
                  if (detail.params) {
                    Object.keys(detail.params).map(function (key, index) {
                      detail.params[key] = Helpers.ParameterHandler.replaceParams(that.appId, detail.params[key], mergeRowData);
                    });
                  }
                });
              }
            });
          }
        }
        var operations = Helpers.ParameterHandler.replaceParams(this.appId, itemContent.operations, mergeRowData);
        content.push(
          <OX_Grid
            rowTemplate={itemContent.expandable ? (e) => this.renderRow(e, itemContent.rowConfig) : null}
            appId={this.appId}
            key={i}
            parentDiv={this.contentDivID}
            osjsCore={this.core}
            data={dataString}
            postSubmitCallback={this.postSubmitCallback}
            pageId={this.state.pageId}
            sortable={sortable}
            resizable={resizable}
            reorderable={reorderable}
            customActions={this.props.customActions}
            parentData={this.state.currentRow}
            notif={this.notif}
            urlPostParams={urlPostParams}
            gridDefaultFilters={itemContent.defaultFilters ? (typeof itemContent.defaultFilters == "string" ? JSON.parse(Helpers.ParameterHandler.replaceParams(this.appId, itemContent.defaultFilters, mergeRowData)) : JSON.parse(Helpers.ParameterHandler.replaceParams(this.appId, JSON.stringify(itemContent.defaultFilters), mergeRowData))) : undefined}
            gridOperations={operations}
            gridToolbar={itemContent.toolbarTemplate}
            columnConfig={columnConfig}
            {...itemContent}
          />
        );
      } else if (item.type == "Search") {
        var placeholder = item.content.placeholder;
        var columnConfig = item.content.columnConfig;
        if (item.content.actions) {
          if (columnConfig[columnConfig.length - 1].title == "Actions") {
            null;
          } else {
            columnConfig.push({
              title: "Actions",
              cell: (e) => this.renderButtons(e, item.content.actions),
              filterCell: {
                type: "empty",
              },
            });
          }
        }
        content.push(<SearchPage key={i} core={this.core} notif={this.notif} content={item.content} filterColumns={item.content.filterColumns} appId={this.appId} entityId={item.content.entityId} columnConfig={columnConfig} placeholder={placeholder} {...item.content} />);
      } else if (item.type == "DocumentViewer") {
        var url;
        if (item.url) {
          url = Helpers.ParameterHandler.replaceParams(this.appId, item.url, this.state.currentRow);
        }
        if (item.content) {
          url = Helpers.ParameterHandler.replaceParams(this.appId, item.content, this.state.currentRow);
        }
        content.push(<DocumentViewer appId={this.appId} key={i} core={this.core} url={url} />);
      } else if (item.type == "RenderButtons") {
        content.push(<RenderButtons appId={this.appId} key={i} ref={this.contentRef} core={this.core} pageId={this.state.pageId} notif={this.notif} currentRow={this.state.currentRow} {...item} />);
      } else if (item.type == "Comment") {
        var url;
        if (item.content) {
          url = Helpers.ParameterHandler.replaceParams(this.appId, item.content, this.state.currentRow);
        } else {
          if (item.url) {
            url = Helpers.ParameterHandler.replaceParams(this.appId, item.url, this.state.currentRow);
          }
        }
        var fileId;
        if (item.fileId) {
          fileId = item.fileId;
        }
            
        content.push(<CommentsView pageId={this.state.pageId} appId={this.appId} key={i} core={this.core} url={url} notif={this.notif} fileId={fileId} currentRow={this.state.currentRow} />);
      } else if (item.type == "TabSegment") {
        content.push(<TabSegment appId={this.appId} core={this.core} notif={this.notif} proc={this.props.proc} fileId={fileId} tabs={item.content.tabs} pageId={this.state.pageId} currentRow={this.state.currentRow} />);
      } else if (item.type == "Dashboard") {
        content.push(<Dashboard appId={this.appId} key={i} core={this.core} notif={this.notif} content={item.content} proc={this.proc} />);
      } else if (item.type == "DashboardManager") {
        var itemContent = item.gridContent ? item.gridContent : item.content;
        if (itemContent.dashboardoperations) {
          if (itemContent.dashboardoperations.dashboardactions) {
            itemContent.dashboardoperations.dashboardactions.map((action, j) => {
              var act = action;
              if (Array.isArray(act.details)) {
                act.details.map((detail, k) => {
                  if (detail.params) {
                    Object.keys(detail.params).map(function (key, index) {
                      detail.params[key] = Helpers.ParameterHandler.replaceParams(this.appId, detail.params[key], mergeRowData);
                    });
                  }
                });
              }
            });
          }
        }
        var dashboardoperations = Helpers.ParameterHandler.replaceParams(this.appId, itemContent.dashboardoperations);
        var uuid = item.content ? (item.content.uuid ? item.content.uuid : null) : null;
        content.push(<DashboardManager appId={this.appId} uuid={uuid} content={item.content} notif={this.notif} args={this.core} key={i} setTitle={() => {}} proc={this.proc} editDashboard='EDB' hideEdit={true} dashboardoperations={dashboardoperations} parentDiv={this.contentDivID} customActions={this.props.customActions} />);
      } else if (item.type == "Page") {
        var mergeRowData = this.props.params ? { ...this.props.params, ...item.params } : item.params;
        var params = Helpers.ParameterHandler.replaceParams(this.appId, mergeRowData, this.state.currentRow);
        content.push(<Page key={item.page_id} config={this.props.config} proc={this.props.proc} isTab={this.isTab} parentPage={this.parentPage} app={this.props.appId} notif={this.notif} currentRow={this.state.currentRow} pageId={item.page_id} core={this.core} {...params} />);
      } else if (item.type == "Document" || item.type == "HTMLViewer") {
        var fileData = this.state.fileData ? this.state.fileData : this.state.currentRow;
        var fileId = item.fileId ? item.fileId : item.uuid;
        if (item.useRowData) {
          item.content = Helpers.ParameterHandler.replaceParams(this.appId, item.content, this.state.currentRow);
        }
        content.push(<HTMLViewer key={i} core={this.core} appId={this.appId} url={item.url ? Helpers.ParameterHandler.replaceParams(this.appId, item.url, this.state.currentRow) : undefined} fileId={fileId} content={item.content ? item.content : ""} fileData={fileData} notif={this.notif} className={item.className} item={item} currentRow={this.state.currentRow} />);
      } else if (item.type == "EntityViewer") {
        var fileId = this.props.fileId ? this.props.fileId : this.state.currentRow.uuid;
        content.push(<EntityViewer pageId={this.state.pageId} key={i} core={this.core} appId={this.appId} proc={this.props.proc} fileId={fileId} notif={this.notif} fileData={this.state.currentRow} className={item.className} />);
      } else if (item.type == "History") {
        var fileId = this.props.fileId ? this.props.fileId : this.state.currentRow.uuid;
        content.push(<ActivityLog appId={this.appId} fileId={fileId} core={this.core} disableControls={item?.disableControls} />);
      } else if (item.type === "CustomPage") {
        var fileId = this.props.fileId ? this.props.fileId : this.state.currentRow.uuid;
        return content.push(<DynamicTemplateViewer appId={this.appId} fileId={fileId} core={this.core} data={item.content} rowData={this.state.currentRow} />);
      } else if (item.type == "KanbanViewer") {
        content.push(<KanbanView core={this.core} appId={this.appId} filters={item.content.filters} url={item.content.url} options={item.content.options} ymlData={item.content.ymlData} />);
      } else if (item.type == "GoogleMapViewer") {
        content.push(<CustomGoogleMapComponent core={this.core} appId={this.appId} />);
      } else if (item.type == "ReactComponent") {
        var fileId = this.props.fileId ? this.props.fileId : this.state.currentRow.uuid;
        content.push(<ReactComponent fileId={fileId} parentPageData={this.parentPageData} core={this.core} appId={this.appId} data={item.content} componentProps={this} />);
      } else if (item.type == "UploadArtifact") {
        item.params = Helpers.ParameterHandler.replaceParams(this.appId, item.params, this.state.currentRow);
        content.push(<UploadArtifact {...item} key={i} components={OxzionGUIComponents} appId={this.appId} notif={this.notif} core={this.core} refresh={this.postSubmitCallback}></UploadArtifact>);
      } else {
        if (this.extGUICompoents && this.extGUICompoents[item.type]) {
          this.externalComponent = this.extGUICompoents[item.type];
          item.params = Helpers.ParameterHandler.replaceParams(this.appId, item.params, this.state.currentRow);
          let guiComponent = this.extGUICompoents && this.extGUICompoents[item.type] ? <this.externalComponent {...item} key={i} components={OxzionGUIComponents} appId={this.appId} notif={this.notif} core={this.core} refresh={this.postSubmitCallback}></this.externalComponent> : <h3 key={i}>The component used is not available.</h3>;
          content.push(guiComponent);
        } else {
          content.push(<h3 key={i}>The component used is not available.</h3>);
        }
      }
    });
    if (content.length > 0) {
      this.loader.destroy();
    } else {
      content.push(<h2>No Content Available</h2>);
      this.loader.destroy();
    }
    return content;
  }

  render() {
    if (this.state.pageContent && this.state.pageContent.length > 0 && !this.state.showLoader) {
      this.loader.destroy();
      var pageRender = this.renderContent(this.state.pageContent);
      return (
        <div id={this.contentDivID} className='contentDiv'>
          {pageRender}
        </div>
      );
    } else {
      return <div id={this.contentDivID}></div>;
    }
  }
}

export default PageContent;
