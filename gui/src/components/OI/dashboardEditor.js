import React from "react";
import { Overlay, Tooltip, Button, Form } from "react-bootstrap";
import dashboardJson from "../../../metadata.json";
import JavascriptLoader from "../javascriptLoader";
import WidgetRenderer from "./WidgetRenderer";
import DashboardFilter from "./DashboardFilter";
import DashboardExportModal from "../Modals/DashbordExportModal";
import Swal from "sweetalert2";
import "../../public/css/sweetalert.css";
import "../widget/editor/widgetEditorApp.scss";
import "../../public/css/dashboardEditor.scss";
import "@progress/kendo-theme-bootstrap/dist/all.css";
import { ckeditorConfig } from "./CkEditorConfig";

class DashboardEditor extends React.Component {
  constructor(props) {
    super(props);
    this.core = this.props.args;
    this.state = {
      dashboardId: props.dashboardId ? props.dashboardId : null,
      dashboardName: "",
      dashboardDescription: "",
      version: 1,
      contentChanged: false,
      editorMode: "initial",
      errors: {},
      filterConfiguration: [],
      dashboardVisibility: -1,
      dashboardExportModal: false,
    };
    this.initialState = { ...this.state };
    this.renderedCharts = {};
    this.props.setTitle(dashboardJson.dashboardEditor.title.en_EN);
    this.restClient = this.core.make("oxzion/restClient");
    this.editor = null;
    this.dashboardName = React.createRef();
    this.dashboardVisibility = React.createRef();
    this.dashboardDescription = React.createRef();
    this.exportModalRef = React.createRef();
    let thisInstance = this;

    this.editorDialogMessageHandler = function (event) {
      let editorDialog = event.source;
      let eventData = event.data;
      switch (eventData.action) {
        case "data":
          thisInstance.doRestRequest(
            eventData.url,
            eventData.params,
            eventData.method ? eventData.method : "get",
            function (response) {
              //Successful response
              editorDialog.postMessage(response, "*");
            },
            function (response) {
              //Failure response
              editorDialog.postMessage(response, "*");
            }
          );
          break;
        case "permissions":
          thisInstance.userProfile = thisInstance.core.make("oxzion/profile").get();
          let permissions = thisInstance.userProfile.key.privileges;
          let preparedData = {
            permissions: permissions,
            corrid: eventData.params["OX_CORR_ID"],
          };
          editorDialog.postMessage({ data: preparedData }, "*");
          break;
        default:
          console.warn(`Unhandled editor dialog message action:${eventData.action}`);
      }
    };
  }

  widgetDrillDownMessageHandler = (event) => {
    let data = event["data"];
    //only drill down widget matching current dashboard uuid
    if(data.hasOwnProperty(WidgetDrillDownHelper.CTX_DASHBOARD_ID) && data[WidgetDrillDownHelper.CTX_DASHBOARD_ID] !== this.props.dashboardId) return;
    if (data["action"] !== "oxzion-widget-drillDown") {
      return;
    }
    let elementId = data["elementId"];
    let widgetId = data["widgetId"];
    let chart = this.renderedCharts[elementId];
    if (chart) {
      if (chart.dispose) {
        chart.dispose();
      }
      this.renderedCharts[elementId] = null;
    }
    let replaceWidgetId = data["replaceWith"];
    if (replaceWidgetId) {
      widgetId = replaceWidgetId;
      let iframeElement = document.querySelector("iframe.cke_wysiwyg_frame");
      let iframeWindow = iframeElement.contentWindow;
      let iframeDocument = iframeWindow.document;
      let widgetElement = iframeDocument.querySelector("#" + elementId);
      widgetElement.setAttribute("data-oxzion-widget-id", replaceWidgetId);
    }
    this.updateWidget(elementId, widgetId);
  };

  inputChanged = (e) => {
    let thiz = this;
    let name = e.target.name;
    let value = e.target.value;
    var error = this.state.errors;
    if (Object.keys(error).length > 0) {
      name == "dashboardName" && (error.dashboardName = null);
      name == "dashboardDescription" && (error.dashboardDescription = null);
      name == "dashboardVisibility" && (error.dashboardVisibility = null);
    }
    this.setState({
      [name]: value,
      contentChanged: true,
      errors: error,
    });
  };

  //---------------------------------------------------------------------------------------
  //jsLibraryList is done this way to avoid utility functions modifying the list.
  //---------------------------------------------------------------------------------------
  getJsLibraryList = () => {
    let self = this;
    return [
      {
        name: "ckEditorJs",
        url: "./ckeditor/ckeditor.js",
        onload: function () {
          self.setupCkEditor();
        },
        onerror: function () {},
      },
    ];
  };

  setupCkEditor = () => {
    //Without this setting CKEditor removes empty inline widgets (which is <span></span> tag).
    CKEDITOR.dtd.$removeEmpty["span"] = false;
    let editor = CKEDITOR.appendTo("ckEditorInstance", ckeditorConfig);
    //Kendo theme CSS is added like this for rendering Kendo grid inside a widget displayed within ckeditor.
    editor.addContentsCss("/apps/Analytics/kendo-theme-default-all.css");
    this.editor = editor;
    let thisInstance = this;
    editor.on("instanceReady", function (event) {
      thisInstance.getDashboard(editor);
    });
    editor.on("oxzionWidgetInitialization", function (event) {
      try {
        let elementId = event.data.elementId;
        let widgetId = event.data.widgetId;
        thisInstance.updateWidget(elementId, widgetId);
      } catch (error) {
        console.error(error);
      }
    });
    editor.on("oxzionWidgetPrepareToDowncast", function (event) {
      try {
        let elementId = event.data.elementId;
        let chart = thisInstance.renderedCharts[elementId];
        if (chart) {
          if (chart.dispose) {
            chart.dispose();
          }
          thisInstance.renderedCharts[elementId] = null;
          console.info(`Disposed the chart of element id ${elementId} for downcasting it.`);
        }
      } catch (error) {
        console.error(error);
      }
    });
    //editor.on('key', function(event) {
    //    if (thisInstance.state.editorMode === 'source') {
    //        thisInstance.setState({
    //            contentChanged:true
    //        });
    //    }
    //});
    editor.on("oxzionWidgetResized", function (event) {
      thisInstance.setState({
        contentChanged: true,
      });
      try {
        let elementId = event.data.elementId;
        let widgetId = event.data.widgetId;
        thisInstance.updateWidget(elementId, widgetId);
      } catch (error) {
        console.error(error);
      }
    });
    editor.on("change", function (event) {
      thisInstance.setState({
        contentChanged: true,
      });
    });
    editor.on("mode", function (event) {
      thisInstance.setState({
        editorMode: this.mode,
      });
    });
  };

  saveDashboard = () => {
    //save only if no errors are found
    if (this.isValidDashboard()) {
      let params = {
        content: this.editor.getData(),
        version: this.state.version,
        name: this.state.dashboardName,
        description: this.state.dashboardDescription,
        dashboard_type: "html",
        filter_configuration: JSON.stringify(this.state.filterConfiguration),
        ispublic: this.state.dashboardVisibility,
        export_configuration: typeof this.state.selectQuery === "object" ? JSON.stringify(this.state.selectQuery) : this.state.selectQuery,
      };
      let url = "analytics/dashboard";
      let method = "";
      if (this.state.dashboardId) {
        url = url + "/" + this.state.dashboardId;
        method = "put";
      } else {
        method = "post";
      }
      let thisInstance = this;
      this.doRestRequest(
        url,
        params,
        method,
        function (response) {
          thisInstance.props.flipCard("Saved");
          let updateState = {
            contentChanged: false,
          };
          if (thisInstance.state.dashboardId) {
            //Case of updating existing dashboard.
            updateState.version = response.dashboard.version;
          }
          if (!thisInstance.state.dashboardId) {
            updateState.version = 0;
            updateState.dashboardId = response.dashboard.uuid;
          }
          thisInstance.setState(updateState);
        },
        function (response) {
          let versionChanged = false;
          if (response.data && response.data.reasonCode) {
            if (response.data.reasonCode === "VERSION_CHANGED") {
              versionChanged = true;
            }
          }
          Swal.fire({
            type: "error",
            title: "Oops...",
            text: versionChanged ? "Dashboard has been modified by another user. Please reload the data and try again." : "Could not save dashboard. Please try after some time.",
          });
        }
      );
    }
  };

  getDashboard = (editor) => {
    var thisInstance = this;
    if (this.state.dashboardId) {
      this.doRestRequest(
        "analytics/dashboard/" + this.state.dashboardId,
        {},
        "get",
        function (response) {
          let dashboard = response.dashboard;
          thisInstance.setState({
            version: dashboard.version,
            dashboardName: dashboard.name ? dashboard.name : "",
            dashboardDescription: dashboard.description ? dashboard.description : "",
            filterConfiguration: dashboard.filter_configuration != "" ? JSON.parse(dashboard.filter_configuration) : [],
            dashboardVisibility: parseInt(dashboard.ispublic),
            selectQuery: dashboard.export_configuration != undefined ? dashboard.export_configuration : "",
          });
          editor.setData(response.dashboard.content);
        },
        function (response) {
          Swal.fire({
            type: "error",
            title: "Oops...",
            text: "Could not fetch dashboard. Please try after some time.",
          });
        }
      );
    }
  };

  doRestRequest = (url, params, method, successHandler, failureHandler) => {
    if (!this.loader) {
      this.loader = this.core.make("oxzion/splash");
    }
    this.loader.show();
    let thisInstance = this;
    let restResponse = thisInstance.restClient.request("v1", url, params ? params : {}, method ? method : "get");
    function handleNonSuccessResponse(response) {
      console.info(`Received a non-success status from server for URL ${url}. JSON:${JSON.stringify(response)}.`);
      if (thisInstance.loader) {
        thisInstance.loader.destroy();
      }
      if (failureHandler) {
        response.url = url;
        response.params = params;
        try {
          failureHandler(response);
        } catch (e) {
          console.error(response);
        }
      } else {
        Swal.fire({
          type: "error",
          title: "Oops...",
          text: "Unexpected error occurred. Please try after some time.",
        });
      }
    }
    restResponse
      .then(function (response) {
        if (response.status !== "success") {
          handleNonSuccessResponse(response);
        } else {
          if (successHandler) {
            let responseObject = {
              url: url,
              params: params,
              status: "success",
            };
            let dataContent = response.data;
            for (let property in dataContent) {
              if (property === "url" || property === "params" || property === "status") {
                throw `Reserved property name ${property} used in REST response. Modify the server side controller to use some other property name.`;
              }
              responseObject[property] = dataContent[property];
            }
            try {
              successHandler(responseObject);
            } catch (e) {
              console.error(e);
            }
          }
        }
      })
      .catch(function (response) {
        handleNonSuccessResponse(response);
      })
      .finally(function (response) {
        if (thisInstance.loader) {
          thisInstance.loader.destroy();
        }
      });
  };

  updateWidget = (elementId, widgetId) => {
    //Dispose and cleanup if this chart had been painted previously.
    let existingChart = this.renderedCharts[elementId];
    if (existingChart) {
      if (existingChart.dispose) {
        existingChart.dispose();
        this.renderedCharts[elementId] = null;
      }
    }

    let iframeElement = document.querySelector("iframe.cke_wysiwyg_frame");
    let iframeWindow = iframeElement.contentWindow;
    let iframeDocument = iframeWindow.document;
    let widgetElement = iframeDocument.querySelector("#" + elementId);
    if (!widgetId) {
      let widgetIdAttribute = widgetElement.attributes.getNamedItem("data-oxzion-widget-id");
      if (widgetIdAttribute) {
        widgetId = widgetIdAttribute.nodeValue;
      }
    }

    var thisInstance = this;
    this.doRestRequest(
      `analytics/widget/${widgetId}?data=true`,
      {},
      "get",
      function (response) {
        let renderProperties = {};
        renderProperties["element"] = widgetElement;
        renderProperties["widget"] = response.widget;
        renderProperties["dashboardEditMode"] = true;
        let chart = WidgetRenderer.render(renderProperties, undefined, undefined, thisInstance.core, this.props.dashboardId);
        thisInstance.renderedCharts[elementId] = chart;
      },
      function (response) {
        Swal.fire({
          type: "error",
          title: "Oops...",
          text: "Could not fetch contents of a widget. Please try after some time.",
        });
      }
    );
  };

  componentDidUpdate(prevProps) {
    if (this.props.dashboardId !== prevProps.dashboardId) {
      if (this.props.dashboardId === "") {
        this.editor.setData("");
        this.setState({ ...this.initialState });
      } else {
        this.setState({ dashboardId: this.props.dashboardId }, () => this.getDashboard(this.editor));
      }
    }
  }

  componentDidMount() {
    if (this.state.dashboardId == null) {
      let loader = this.core.make("oxzion/splash");
      loader.destroy();
    }
    window.addEventListener("message", this.editorDialogMessageHandler, false);
    window.addEventListener("message", this.widgetDrillDownMessageHandler, false);
    JavascriptLoader.loadScript(this.getJsLibraryList());
  }

  componentWillUnmount() {
    for (let elementId in this.renderedCharts) {
      let chart = this.renderedCharts[elementId];
      if (chart) {
        if (chart.dispose) {
          chart.dispose();
        }
        this.renderedCharts[elementId] = null;
      }
    }
    window.removeEventListener("message", this.editorDialogMessageHandler, false);
    window.removeEventListener("message", this.widgetDrillDownMessageHandler, false);
    if (this.editor) {
      this.editor.destroy();
    }
    JavascriptLoader.unloadScript(this.getJsLibraryList());
  }

  displayFilterDiv() {
    var element = document.getElementById("filtereditor-form-container");
    element.classList.remove("disappear");
    var element = document.getElementById("dash-manager-buttons");
    element.classList.add("disappear");
    document.getElementById("dashboard-container").classList.add("disappear");
    document.getElementById("dashboard-filter-btn").disabled = true;
  }

  setFilter(filter) {
    this.setState({ filterConfiguration: filter });
  }

  isValidDashboard() {
    let errors = {};
    // let helper = this.core.make('oxzion/restClient');
    // let response = await helper.request('v1', `analytics/dashboard/byName?name=${this.state.dashboardName}`, {}, 'get');
    this.state.dashboardName == "" && (errors.dashboardName = "*Name shouldnt be blank");
    this.state.dashboardDescription == "" && (errors.dashboardDescription = "*Description should not be blank");
    this.state.dashboardVisibility == -1 && (errors.dashboardVisibility = "*Please choose a dashboard visibility");
    this.setState({ errors: errors });
    return Object.keys(errors).length == 0;
  }
  showExportModal(showModal) {
    this.setState({ showExportModal: showModal });
  }

  setExportQueryUUID() {}

  render() {
    return (
      <form className='dashboard-editor-form' style={{ marginleft: "10px", width: "98%" }}>
        <div id='dash-manager-buttons' className='dash-manager-buttons'>
          <Button id='dashboard-export-settings-btn' onClick={() => this.showExportModal(true)}>
            <i className='fas fa-file-export' title='Set Export OI Query'></i>
          </Button>
          <Button id='dashboard-filter-btn' onClick={() => this.displayFilterDiv()}>
            <i className='fa fa-filter' aria-hidden='true' title='Filter OI'></i>
          </Button>
          <Button onClick={this.saveDashboard} disabled={!this.state.contentChanged}>
            <i className='fa fa-save' aria-hidden='true' title='Save OI'></i>
          </Button>
          <Button onClick={() => this.props.flipCard("")}>
            <i className='fa fa-close' aria-hidden='true' title='Go back'></i>
          </Button>
        </div>
        <div id='filtereditor-form-container' style={{ marginTop: "0px", width: "98%" }} className='disappear'>
          {this.state.filterConfiguration && <DashboardFilter hideFilterDiv={() => this.setState({ showFilterDiv: false })} setFilter={(filter) => this.setFilter(filter)} notif={this.props.notif} filterMode='CREATE' dashboardId={this.props.dashboardId} dashboardVersion={this.state.version} filterConfiguration={this.state.filterConfiguration} core={this.core} />}
        </div>
        {this.state.showExportModal && <DashboardExportModal show={this.state.showExportModal} queryOptions={[]} onHide={() => this.showExportModal(false)} core={this.core} notification={this.props.notif} inputChanged={(e) => this.inputChanged(e)} selectedExportQuery={this.state.selectQuery || ""} />}
        <div id='dashboard-container'>
          <div className='form-group row'>
            <label htmlFor='dashboardName' className='col-form-label form-control-sm'>
              Name
            </label>
            <div className='col-2'>
              <>
                <input type='text' id='dashboardName' name='dashboardName' ref={this.dashboardName} className='form-control form-control-sm' onChange={this.inputChanged} value={this.state.dashboardName} disabled={false} />
                <Overlay target={this.dashboardName} show={this.state.errors.dashboardName != null} placement='bottom'>
                  {(props) => (
                    <Tooltip id='dashboardName-tooltip' {...props} className='error-tooltip'>
                      {this.state.errors.dashboardName}
                    </Tooltip>
                  )}
                </Overlay>
              </>
            </div>
            <label htmlFor='dashboardDescription' className='col-form-label form-control-sm'>
              Description
            </label>
            <div className='col-4'>
              <>
                <input type='text' id='dashboardDescription' name='dashboardDescription' ref={this.dashboardDescription} className='form-control form-control-sm' onChange={this.inputChanged} value={this.state.dashboardDescription} onBlur={this.isDescriptionValid} disabled={false} />
                <Overlay target={this.dashboardDescription} show={this.state.errors.dashboardDescription != null} placement='bottom'>
                  {(props) => (
                    <Tooltip id='dashboardDescription-tooltip' {...props} className='error-tooltip'>
                      {this.state.errors.dashboardDescription}
                    </Tooltip>
                  )}
                </Overlay>
              </>
            </div>
            <label htmlFor='dashboardVisibility' className='col-form-label form-control-sm'>
              Visibility
            </label>
            <div className='col-2'>
              <>
                <select id='dashboardVisibility' ref={this.dashboardVisibility} name='dashboardVisibility' className='form-control form-control-sm' placeholder='Select Visibility' value={this.state.dashboardVisibility != null ? this.state.dashboardVisibility : -1} onChange={this.inputChanged}>
                  <option disabled value={-1} key='-1'>
                    Select Visibility
                  </option>
                  <option key='1' value={1}>
                    Public
                  </option>
                  <option key='2' value={0}>
                    Private
                  </option>
                </select>
                <Overlay target={this.dashboardVisibility} show={this.state.errors.dashboardVisibility != null} placement='bottom'>
                  {(props) => (
                    <Tooltip id='dashboardVisibility-tooltip' {...props} className='error-tooltip'>
                      {this.state.errors.dashboardVisibility}
                    </Tooltip>
                  )}
                </Overlay>
              </>
            </div>
          </div>
          <div className='dashboard'>
            <div id='ckEditorInstance' style={{ height: "calc(100%)" }}></div>
          </div>
          <div id='gridArea' style={{ height: "200px", width: "98%" }}>
            <div className='oxzion-widget-content'></div>
          </div>
        </div>
      </form>
    );
  }
}

export default DashboardEditor;
