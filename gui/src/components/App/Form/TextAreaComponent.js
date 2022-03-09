import TextArea from "formiojs/components/textarea/TextArea";
import * as _utils from "formiojs/utils/utils";
import { Formio } from "formiojs";
import * as _lodash from "lodash";
import * as _nativePromiseOnly from "native-promise-only";
import Swal from "sweetalert2";
import Requests from "../../../Requests";
import { ckeditorConfig } from "../../../components/OI/CkEditorConfig";
import "../../../public/css/ckeditorStyle.css";
import WidgetRenderer from "../../../components/OI/WidgetRenderer";

export default class TextAreaComponent extends TextArea {
  constructor(component, options, data) {
    var formOptions = Formio.getPlugin("optionsPlugin");
    var customOptions = _lodash.default.merge(options, formOptions.options);
    if (customOptions.appId == null || customOptions.appId == undefined) {
      if (customOptions.root && customOptions.root.options && customOptions.root.options.appId) {
        customOptions.appId = customOptions.root.options.appId;
        customOptions.formDivID = customOptions.root.options.formDivID;
      } else if (customOptions.root && customOptions.root.options && customOptions.root.root.options && customOptions.root.root.options.appId) {
        customOptions.appId = customOptions.root.root.options.appId;
        customOptions.formDivID = customOptions.root.root.options.formDivID;
      } else {
        console.log(customOptions);
      }
    }
    super(component, customOptions, data);
    component.core = customOptions.core;
    component.uiUrl = customOptions.uiUrl;
    component.wrapperUrl = customOptions.wrapperUrl;
    component.loader = null;
    component.ckeditorInstance = null;
    this.renderedCharts = {};
    this.core = customOptions.core;
    if (component.core && this.component.editor == "ckeditor") {
      this.editorDialogMessageHandler = function (event) {
        let editorDialog = event.source;
        let eventData = event.data;
        switch (eventData.action) {
          case "data":
            Requests.doRestRequest(
              component.core,
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
              },
              component.loader
            );
            break;
          case "permissions":
            component.userProfile = component.core.make("oxzion/profile").get();
            let permissions = component.userProfile.key.privileges;
            let preparedData = {
              permissions: permissions,
              corrid: eventData.params["OX_CORR_ID"],
            };
            editorDialog.postMessage({ data: preparedData }, "*");
          default:
            return event;
        }
      };
    }
  }
  attachElement(element, index) {
    var _this2 = this;
    if (this.component.editor != "ckeditor") {
      return super.attachElement(element, index);
    } else {
      window.addEventListener("message", this.editorDialogMessageHandler, false);
      window.addEventListener("message", this.widgetDrillDownMessageHandler, false);
      var editor = _this2.setupCkEditor(_this2, element, index);
      this.editorsReady[index] = editor;
      return element;
    }
  }
  setValueAt(index, value) {
    if (this.component.editor == "ckeditor") {
      var _this2 = this;
      if (value == "" || value == null) {
        if (_this2._data[_this2.path]) {
          value = _this2._data[_this2.path];
        }
      }
      if (_this2.editorsReady[index]) {
        _this2.editorsReady[index].setData(_this2.setConvertedValue(value, index));
      }
      CKEDITOR.instances[this.ckeditorInstance].setData(value, {
        callback: function () {
          _this2.updateEditorValue(index, value);
        },
      });
    } else {
      super.setValueAt(index, value);
    }
  }
  detach() {
    window.removeEventListener("message", this.editorDialogMessageHandler, false);
    window.removeEventListener("message", this.widgetDrillDownMessageHandler, false);
    if (this.editor) {
      this.editor.destroy();
    }
    var instance = CKEDITOR.instances[this.ckeditorInstance];
    if (instance) {
      CKEDITOR.remove(instance);
    }
    super.detach();
  }

  setupCkEditor = (_this2, element, index) => {
    var editor = null;
    try {
      CKEDITOR.dtd.$removeEmpty["span"] = false;
      editor = CKEDITOR.appendTo(element, ckeditorConfig);
      this.ckeditorInstance = editor.name;
      var isReadOnly = _this2.options.readOnly || _this2.disabled;
      var numRows = parseInt(_this2.component.rows, 10);
      if (_lodash.default.isFinite(numRows) && _lodash.default.has(editor, "ui.view.editable.editableElement")) {
        // Default height is 21px with 10px margin + a 14px top margin.
        var editorHeight = numRows * 31 + 14;
        editor.ui.view.editable.editableElement.style.height = "".concat(editorHeight, "px");
      }
      editor.isReadOnly = isReadOnly;
      editor.addContentsCss("/css/ckeditorStyle.css");
      editor.on("instanceReady", function () {
        var dataValue = _this2.dataValue;
        dataValue = _this2.component.multiple && Array.isArray(dataValue) ? dataValue[index] : dataValue;
        var value = _this2.setConvertedValue(dataValue, index);
        if (value == "" || value == null) {
          if (_this2._data[_this2.path]) {
            value = _this2._data[_this2.path];
          }
        }
        editor.setData(value);
      });
      editor.on("oxzionWidgetInitialization", function (event) {
        try {
          let elementId = event.data.elementId;
          let widgetId = event.data.widgetId;
          _this2.updateWidget(elementId, widgetId);
        } catch (error) {
          console.error(error);
        }
      });
      editor.on("oxzionWidgetPrepareToDowncast", function (event) {
        try {
          let elementId = event.data.elementId;
          let chart = _this2.renderedCharts[elementId];
          if (chart) {
            if (chart.dispose) {
              chart.dispose();
            }
            _this2.renderedCharts[elementId] = null;
            console.info(`Disposed the chart of element id ${elementId} for downcasting it.`);
          }
        } catch (error) {
          console.error(error);
        }
      });
      editor.on("oxzionWidgetResized", function (event) {
        try {
          let elementId = event.data.elementId;
          let widgetId = event.data.widgetId;
          _this2.updateWidget(elementId, widgetId);
        } catch (error) {
          console.error(error);
        }
      });
      editor.on("change", function (event) {
        return _this2.updateEditorValue(index, event.editor.getData());
      });
      return editor;
    } catch (Exception) {
      console.log(Exception);
      console.log("Failed to create CK Editor");
    }
  };
  widgetDrillDownMessageHandler = (event) => {
    let data = event["data"];
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

  updateWidget = (elementId, widgetId) => {
    var _this2 = this;
    //Dispose and cleanup if this chart had been painted previously.
    let existingChart = _this2.renderedCharts[elementId];
    if (existingChart) {
      if (existingChart.dispose) {
        existingChart.dispose();
        _this2.renderedCharts[elementId] = null;
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
    Requests.doRestRequest(
      _this2.core,
      `analytics/widget/${widgetId}?data=true`,
      {},
      "get",
      function (response) {
        let renderProperties = {};
        renderProperties["element"] = widgetElement;
        renderProperties["widget"] = response.widget;
        renderProperties["dashboardEditMode"] = true;
        let chart = WidgetRenderer.render(renderProperties);
        _this2.renderedCharts[elementId] = chart;
      },
      function (response) {
        Swal.fire({
          type: "error",
          title: "Oops...",
          text: "Could not fetch contents of a widget. Please try after some time.",
        });
      },
      _this2.loader
    );
  };
}
