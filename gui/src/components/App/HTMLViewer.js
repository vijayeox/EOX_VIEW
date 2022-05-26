import React from "react";
import JsxParser from "react-jsx-parser";
import moment from "moment";
import Requests from "../../Requests";
import Swal from "sweetalert2";
import "../../public/css/ckeditorStyle.css";
import WidgetRenderer from "../../components/OI/WidgetRenderer";
import WidgetDrillDownHelper from "../../components/OI/WidgetDrillDownHelper";
import ReactDOMServer from "react-dom/server";
import "../../components/OI/WidgetStyles.css";
import helpers from "../../helpers";
class HTMLViewer extends React.Component {
  constructor(props) {
    super(props);
    this.core = this.props.core;
    this.profileAdapter = this.core.make("oxzion/profile");
    this.profile = this.profileAdapter.get();
    this.appId = this.props.appId;
    this.fileDivID = "file_" + helpers.Utils.generateUUID();
    this.renderedWidgets = {};
    this.helper = this.core.make("oxzion/restClient");
    this.loader = this.core.make("oxzion/splash");
    this.state = {
      content: this.props.content,
      fileData: this.props.fileData,
      outputHtml: null,
      fileId: this.props.fileId,
      widgetCounter: 0,
      preparedDashboardFilter: null,
      dataReady: this.props.fileId ? (this.props.url ? false : true) : true,
      dataReady: this.props.url ? false : true,
    };
    var that = this;
    this.observer = new MutationObserver(function (mutationsList) {
      mutationsList.forEach((mutation, key) => {
        if (mutation.attributeName === "class" && mutation.target.classList.contains("page-active") && key == 0) {
          that.updateGraph();
        }
      });
    });
  }
  formatDate = (dateTime, dateTimeFormat) => {
    let userTimezone,
      userDateTimeFomat = null;
    userTimezone = this.profile.key.preferences.timezone ? this.profile.key.preferences.timezone : moment.tz.guess();
    userDateTimeFomat = this.profile.key.preferences.dateformat ? this.profile.key.preferences.dateformat : "YYYY-MM-DD";
    dateTimeFormat ? (userDateTimeFomat = dateTimeFormat) : null;
    return moment(dateTime).utc(dateTime, "MM/dd/yyyy HH:mm:ss").clone().tz(userTimezone).format(userDateTimeFomat);
  };
  formatDateWithoutTimezone = (dateTime, dateTimeFormat) => {
    let userDateTimeFomat = null;
    userDateTimeFomat = this.profile.key.preferences.dateformat ? this.profile.key.preferences.dateformat : "YYYY-MM-DD";
    dateTimeFormat ? (userDateTimeFomat = dateTimeFormat) : null;
    return moment(dateTime).format(userDateTimeFomat);
  };

  async getFileDetails(fileId) {
    let fileContent = await this.helper.request("v1", "/app/" + this.appId + "/file/" + fileId + "/data", {}, "get");
    return fileContent;
  }
  async getURL(url) {
    let fileContent = await this.helper.request("v1", url, {}, "get");
    return fileContent;
  }

  componentDidMount() {
    var that = this;
    if (this.state.fileId != undefined) {
      this.getFileDetails(this.state.fileId).then((response) => {
        if (response.status == "success") {
          this.setState({ fileData: response.data.data });
          that.preRender();
        }
      });
    } else if (this.props.url != undefined) {
      this.getURL(this.props.url).then((response) => {
        if (response.status == "success") {
          this.setState({ fileData: response.data });
          that.preRender();
        }
      });
    } else {
      that.preRender();
    }
    window.removeEventListener("message", this.widgetDrillDownMessageHandler, false); //avoids dupliacte event handalers to be registered
    window.addEventListener("message", this.widgetDrillDownMessageHandler, false);
  }

  widgetDrillDownMessageHandler = (event) => {
    let eventData = event.data;
    let action = eventData[WidgetDrillDownHelper.MSG_PROP_ACTION];
    if (action !== WidgetDrillDownHelper.ACTION_DRILL_DOWN && action !== WidgetDrillDownHelper.ACTION_ROLL_UP) {
      return;
    }
    let target = eventData[WidgetDrillDownHelper.MSG_PROP_TARGET];
    if (target && target !== "widget") {
      return;
    }
    var thiz = this;
    function cleanup(elementId) {
      let widget = thiz.renderedWidgets[elementId];
      if (widget) {
        if (widget.dispose) {
          widget.dispose();
        }
        delete thiz.renderedWidgets[elementId];
      }
    }
    let elementId = eventData[WidgetDrillDownHelper.MSG_PROP_ELEMENT_ID];
    let widgetId = eventData[WidgetDrillDownHelper.MSG_PROP_WIDGET_ID];
    cleanup(elementId);
    let nextWidgetId = eventData[WidgetDrillDownHelper.MSG_PROP_NEXT_WIDGET_ID];
    if (nextWidgetId) {
      widgetId = nextWidgetId;
    }
    let url = `analytics/widget/${widgetId}?data=true`;
    //starting spinner
    if (eventData.elementId) {
      var widgetDiv = document.getElementById(eventData.elementId);
      this.loader.show(widgetDiv);
    }
    var self = this;
    let element = document.getElementById(elementId);
    this.helper
      .request("v1", url, null, "get")
      .then((response) => {
        let renderproperties = { element: element, widget: response.data.widget, props: eventData, dashboardEditMode: false };
        let widgetObject = WidgetRenderer.render(renderproperties);
        if (widgetObject) {
          self.renderedWidgets[elementId] = widgetObject;
        }
        this.loader.destroy(element);
      })
      .catch((response) => {
        this.loader.destroy(element);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Could not fetch the widget data. Please try after some time.",
        });
      });
  };

  componentDidUpdate(prevProps) {
    if (this.props.content !== prevProps.content) {
      this.setState({ content: this.props.content });
    }
  }
  componentWillUnmount() {
    for (let elementId in this.renderedWidgets) {
      let widget = this.renderedWidgets[elementId];
      if (widget) {
        if (widget.dispose) {
          widget.dispose();
        }
        delete this.renderedWidgets[elementId];
      }
    }
    window.removeEventListener("message", this.widgetDrillDownMessageHandler, false);
  }
  isHTML(str) {
    var a = document.createElement("div");
    a.innerHTML = str;
    for (var c = a.childNodes, i = c.length; i--; ) {
      if (c[i].nodeType == 1) return true;
    }
    return false;
  }
  searchAndReplaceParams(content, params) {
    var regex = /\{data\.(.*)?\}/g;
    let m;
    var matches = [];
    do {
      m = regex.exec(content);
      if (m) {
        if (m.index === regex.lastIndex) {
          regex.lastIndex++;
        }
        matches.push(m);
      }
    } while (m);
    matches.forEach((match, groupIndex) => {
      if (params[match[1]] != undefined && this.isHTML(params[match[1]])) {
        content = content.replace(match[0], params[match[1]]);
      }
    });
    content = this.getXrefFields(content);
    return content;
  }
  preRender() {
    var that = this;
    var fileData = {};
    for (const [key, value] of Object.entries(this.state.fileData)) {
      fileData[key] = value;
    }
    var content = this.searchAndReplaceParams(this.state.content, fileData);
    this.setState({ content: content, fileData: fileData });
    var rawHTML = ReactDOMServer.renderToString(
      <JsxParser
        autoCloseVoidElements
        className={this.props.className}
        jsx={this.state.content}
        bindings={{
          data: this.state.fileData ? this.state.fileData : {},
          item: this.state.fileData ? this.state.fileData : {},
          moment: moment,
          formatDate: this.formatDate,
          formatDateWithoutTimezone: this.formatDateWithoutTimezone,
          profile: this.profile.key,
        }}
      />
    );
    this.setState({ outputHtml: rawHTML, dataReady: true }, () => {
      that.updateGraph();
      var viewerElement = document.getElementById(this.fileDivID);
      if (viewerElement && viewerElement.parentNode && viewerElement.parentNode.parentNode) {
        that.observer.observe(viewerElement.parentNode.parentNode, { attributes: true });
      }
    });
  }
  getXrefFields(content) {
    var regex = /\{file\.(.*)?\}/g;
    let m;
    var editContent = content;
    var matches = [];
    do {
      m = regex.exec(content);
      if (m) {
        if (m.index === regex.lastIndex) {
          regex.lastIndex++;
        }
        matches.push(m);
      }
    } while (m);
    matches.forEach((match, groupIndex) => {
      var field = match[1].split(":");
      this.getFileDetails(field[0]).then((response) => {
        if (response.status == "success") {
          var fileData = response.data;
          if (field[1] && fileData.data && fileData.data[field[1]]) {
            content = content.replace(match[0], fileData.data[field[1]]);
          }
        }
      });
    });
    return editContent;
  }

  updateGraph = async (filterParams) => {
    if (false === this.state.dataReady) {
      return;
    }
    let root = document.getElementById(this.fileDivID);
    var widgets = root.getElementsByClassName("oxzion-widget");
    let thiz = this;
    // this.loader.show();
    let errorFound = false;
    for (let elementId in this.renderedWidgets) {
      let widget = this.renderedWidgets[elementId];
      if (widget) {
        if (widget.dispose) {
          widget.dispose();
        }
        delete this.renderedWidgets[elementId];
      }
    }
    if (widgets.length == 0) {
      this.loader.destroy();
    } else {
      for (let widget of widgets) {
        var attributes = widget.attributes;
        //dispose
        var that = this;
        var widgetUUId = attributes[WidgetDrillDownHelper.OXZION_WIDGET_ID_ATTRIBUTE].value;
        Requests.getWidgetByUuid(that.core, widgetUUId, filterParams).then((response) => {
          if (response.status == "success") {
            that.setState({ widgetCounter: that.state.widgetCounter + 1 });
            if ("error" === response.status) {
              console.error("Could not load widget.", response);
              errorFound = true;
            } else {
              //dispose if widget exists
              let hasDashboardFilters = that.state.preparedDashboardFilter ? true : false;
              let renderproperties = { element: widget, widget: response.data.widget, hasDashboardFilters: hasDashboardFilters, dashboardEditMode: false };
              let widgetObject = WidgetRenderer.render(renderproperties);
              if (widgetObject) {
                that.renderedWidgets[widgetUUId] = widgetObject;
              }
            }
            if (that.state.widgetCounter >= widgets.length) {
              that.loader.destroy();
            }
          } else {
            that.setState({ widgetCounter: that.state.widgetCounter + 1 });
            if (that.state.widgetCounter >= widgets.length) {
              that.loader.destroy();
            }
          }
        });
      }
    }
    if (errorFound) {
      Swal.fire({
        type: "error",
        title: "Oops ...",
        text: "Could not load one or more widget(s). Please try after some time.",
      });
      return;
    }
  };

  render() {
    if (this.state.dataReady) {
      return <div id={this.fileDivID} dangerouslySetInnerHTML={{ __html: this.state.outputHtml ? this.state.outputHtml : "" }} />;
    } else {
      return <div id={this.fileDivID}></div>;
    }
  }
}

export default HTMLViewer;
