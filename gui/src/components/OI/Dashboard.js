import React, { Component } from "react";
import WidgetRenderer from "./WidgetRenderer";
import WidgetDrillDownHelper from "./WidgetDrillDownHelper";
import { scrollDashboardToTop, preparefilter, overrideCommonFilters, extractFilterValues, prepareMultiFilter } from "./DashboardUtils";
import Swal from "sweetalert2";
import "./WidgetStyles.css";

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.core = this.props.core;
    this.state = {
      htmlData: this.props.htmlData ? this.props.htmlData : null,
      dashboardFilter: this.props.dashboardFilter,
      preparedDashboardFilter: null,
      drilldownDashboardFilter: [],
      widgetCounter: 0,
    };
    this.content = this.props.content;
    this.renderedWidgets = {};
    var uuid = "";
    if (this.props.uuid) {
      uuid = this.props.uuid;
    }
    if (this.props.content) {
      var content = this.props.content;
      if (content && content.uuid) {
        uuid = content.uuid;
      }
    }
    this.uuid = uuid;
    this.dashboardDivId = "dashboard_" + this.uuid;
    this.loader = this.core.make("oxzion/splash");
    this.helper = this.core.make("oxzion/restClient");
    this.props.proc.on("destroy", () => {
      this.removeScriptsFromDom();
    });
    this.myRef = React.createRef();
  }

  async getDashboardHtmlDataByUuid(uuid) {
    let response = await this.helper.request("v1", "analytics/dashboard/" + uuid, {}, "get");
    return response;
  }

  async getWidgetByUuid(uuid, filterParams) {
    let filterParameter = filterParams && filterParams != [] && filterParams.length != 0 ? "&filter=" + JSON.stringify(filterParams) : "";
    // send this filters to widgets as well so that we can append those to the url that we are trying to create
    let response = await this.helper.request("v1", "analytics/widget/" + uuid + "?data=true" + filterParameter, {}, "get");
    return response;
  }

  extractFilter() {
    let stack = this.props.dashboardStack;
    let filter = stack[stack.length - 1].drilldownDashboardFilter;
    let filterText = "";
    for (let i = 0; i < filter.length; i++) {
      filterText != "" && (filterText += " ");
      filterText += filter[i];
    }
    return filterText;
  }

  appendToDashboardContainer(htmlData) {
    let backButton = "";
    let dashboardFilterDescription = "";
    if (this.props.dashboardStack && this.props.dashboardStack.length > 1) {
      //rendering back button for drilled down dashboard
      let dashboardTitle = this.props.dashboardStack[this.props.dashboardStack.length - 1]["drilldownDashboardTitle"];
      let finalDashboardTitle = dashboardTitle ? dashboardTitle : " ";
      backButton = `<div id='dashboard-rollup-button' title="Previous OI" class='dashboard-rollup-button'><i class='fa fa-arrow-circle-left'  aria-hidden='true'></i></div>`;
      dashboardFilterDescription = "<div class='badge badge-info dashboard-filter-description' id='dashboard-drilldown-title'>" + finalDashboardTitle + "</div>";
    }

    let container = "<div id='dasboard-viewer-wrapper' class='dasboard-viewer-wrapper'>" + "<div id='dashboard-drilldown-info-wrapper' class='dashboard-drilldown-info-wrapper'>" + dashboardFilterDescription + backButton + "</div>" + "<div id='dasboard-viewer-content' class='dasboard-viewer-content'>" + htmlData + "</div>" + "</div>";
    return container;
  }

  setupDrillDownListeners() {
    if (document.getElementById("dashboard-rollup-button")) {
      let backbutton = document.getElementById("dashboard-rollup-button");
      backbutton.addEventListener("click", (event) => {
        this.props.rollupToDashboard();
      });
    }
  }

  componentDidMount() {
    if (this.uuid) {
      this.getDashboardHtmlDataByUuid(this.uuid)
        .then((response) => {
          if (response.status == "success") {
            this.setState(
              {
                htmlData: response.data.dashboard.content ? response.data.dashboard.content : null,
              },
              () => {
                this.setupDrillDownListeners();
              }
            );
            let extractedFilterValues = extractFilterValues(this.props.dashboardFilter, this.props.dashboardStack, this.props.loadDefaultFilters ? "default" : undefined);
            let drilldownDashboardFilter = extractedFilterValues.length == 1 ? extractedFilterValues[0] : extractedFilterValues;
            if (extractedFilterValues && extractedFilterValues.length > 1) {
              drilldownDashboardFilter = extractedFilterValues[0];
              drilldownDashboardFilter = prepareMultiFilter(drilldownDashboardFilter);
              for (let i = 1; i < extractedFilterValues.length; i++) {
                drilldownDashboardFilter = preparefilter(drilldownDashboardFilter, extractedFilterValues[i]);
              }
            }
            this.props.drilldownDashboardFilter && this.props.drilldownDashboardFilter.length > 0 ? this.updateGraph(this.props.drilldownDashboardFilter) : this.updateGraph(drilldownDashboardFilter);
          } else {
            this.setState({ htmlData: `<p>No Data</p>` });
          }
        })
        .catch(function (response) {
          console.error("Could not load widget.", response);
          Swal.fire({
            type: "error",
            title: "Oops ...",
            text: "Could not load widget. Please try after some time.",
          });
        });
    } else if (this.state.htmlData != null) {
      this.props.drilldownDashboardFilter.length > 0 ? this.updateGraph(this.props.drilldownDashboardFilter) : this.updateGraph();
    }
    window.removeEventListener("message", this.widgetDrillDownMessageHandler, false); //avoids dupliacte event handalers to be registered
    window.addEventListener("message", this.widgetDrillDownMessageHandler, false);
    scrollDashboardToTop();
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

  updateGraphWithFilterChanges() {
    let filterParams = extractFilterValues(this.props.dashboardFilter, this.props.dashboardStack);
    let preparedFilter;
    if (filterParams && filterParams.length > 0) {
      preparedFilter = filterParams[0];
      preparedFilter = prepareMultiFilter(preparedFilter);
      if (filterParams.length > 1) {
        for (let i = 1; i < filterParams.length; i++) {
          preparedFilter = preparefilter(preparedFilter, filterParams[i]);
        }
      }
    }
    if (filterParams) {
      if (filterParams.length == 0) {
        //if no dashboard filter exists
        if (this.props.dashboardStack.length > 0) {
          //adding drildowndashboardfilter to the dashboard filter if it exists
          let drilldownDashboardFilter = this.props.dashboardStack[this.props.dashboardStack.length - 1]["drilldownDashboardFilter"];
          if (drilldownDashboardFilter && drilldownDashboardFilter.length > 0) {
            this.updateGraph(drilldownDashboardFilter);
          } else {
            this.setState(
              {
                preparedDashboardFilter: [],
              },
              () => {
                this.updateGraph();
              }
            );
          }
        } else {
          this.setState(
            {
              preparedDashboardFilter: [],
            },
            () => {
              this.updateGraph();
            }
          );
        }
      } else if (filterParams.length >= 1) {
        if (this.props.dashboardStack.length > 1) {
          //adding drildowndashboardfilter to the dashboard filter if it exists
          let parentFilter = this.props.dashboardStack[this.props.dashboardStack.length - 2]["filterConfiguration"];
          let currentFilter = this.props.dashboardFilter;
          let widgetFilter = this.props.dashboardStack[this.props.dashboardStack.length - 2]["widgetFilter"];
          let combinedFilter = overrideCommonFilters(parentFilter, currentFilter);
          for (let combinedindex = combinedFilter.length - 1; combinedindex >= 0; combinedindex--) {
            if (combinedFilter[combinedindex].field == widgetFilter[0]) {
              combinedFilter[combinedindex].value == widgetFilter[2];
              widgetFilter = [];
            }
          }
          let extractedFilterValues = extractFilterValues(combinedFilter, this.props.dashboardStack);
          let preapredExtractedFilterValue = extractedFilterValues.length == 1 ? extractedFilterValues[0] : extractedFilterValues;
          if (extractedFilterValues && extractedFilterValues.length > 1) {
            preapredExtractedFilterValue = extractedFilterValues[0];
            preapredExtractedFilterValue = prepareMultiFilter(preapredExtractedFilterValue);
            for (let i = 1; i < extractedFilterValues.length; i++) {
              preapredExtractedFilterValue = preparefilter(preapredExtractedFilterValue, extractedFilterValues[i]);
            }
          }
          if (widgetFilter.length > 0) {
            preparedFilter = preparefilter(widgetFilter, preapredExtractedFilterValue);
          }
        }
        this.setState(
          {
            preparedDashboardFilter: preparedFilter,
          },
          () => {
            this.updateGraph(preparedFilter);
          }
        );
      } else {
        //adding drildowndashboardfilter to the dashboard filter if it exists
        preparedFilter = filterParams;
        let drilldownDashboardFilter = this.props.dashboardStack[this.props.dashboardStack.length - 1]["drilldownDashboardFilter"];
        if (this.props.dashboardStack.length != 1 && drilldownDashboardFilter.length > 1) {
          preparedFilter = preparefilter(drilldownDashboardFilter, filterParams);
        } else {
          preparedFilter = filterParams;
        }
        this.setState(
          {
            preparedDashboardFilter: preparedFilter,
          },
          () => {
            this.updateGraph(preparedFilter);
          }
        );
      }
    } else {
      this.updateGraph();
    }
  }

  componentDidUpdate(prevProps) {
    //update component when filter is changed
    if (prevProps.dashboardFilter != this.props.dashboardFilter) {
      this.updateGraphWithFilterChanges();
    }
  }

  updateGraph = async (filterParams) => {
    if (null === this.state.htmlData) {
      return;
    }
    let root = document;
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
        //only update widget matching uuid of current dashboard component
        if(widget.hasAttribute(WidgetDrillDownHelper.CTX_DASHBOARD_ID) && widget.getAttribute(WidgetDrillDownHelper.CTX_DASHBOARD_ID) !== this.uuid) continue;
        var attributes = widget.attributes;
        //dispose
        var that = this;
        var widgetUUId = attributes[WidgetDrillDownHelper.OXZION_WIDGET_ID_ATTRIBUTE].value;
        this.getWidgetByUuid(widgetUUId, filterParams).then((response) => {
          if (response.status == "success") {
            response.data.widget && console.timeEnd("analytics/widget/" + response.data.widget.uuid + "?data=true");
            that.setState({
              widgetCounter: that.state.widgetCounter + 1,
            });
            if ("error" === response.status) {
              console.error("Could not load widget.", response);
              errorFound = true;
            } else {
              //dispose if widget exists
              let hasDashboardFilters = this.state.preparedDashboardFilter ? true : false;
              let renderproperties = {
                element: widget,
                widget: response.data.widget,
                hasDashboardFilters: hasDashboardFilters,
                dashboardEditMode: false,
              };
              let widgetObject = WidgetRenderer.render(renderproperties, widgetUUId, filterParams, this.core, this.uuid, this.props);
              if (widgetObject) {
                this.renderedWidgets[widgetUUId] = widgetObject;
              }
            }
            if (that.state.widgetCounter >= widgets.length) {
              this.loader.destroy();
            }
          } else {
            that.setState({
              widgetCounter: that.state.widgetCounter + 1,
            });
            if (this.state.widgetCounter >= widgets.length) {
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

  async drillDownToDashboard(data) {
    let event = {};
    let elementId = data.elementId;
    //starting spinner
    if (elementId) {
      var widgetDiv = document.getElementById(elementId);
      this.loader.show(widgetDiv);
    }
    let dashboardData = await this.getDashboardHtmlDataByUuid(data.dashboard);
    let dashboardStack = this.props.dashboardStack ? JSON.parse(JSON.stringify(this.props.dashboardStack)) : [];
    let dashboardStackDrilldownFilter = dashboardStack.length > 0 ? dashboardStack[dashboardStack.length - 1]["drilldownDashboardFilter"] : null;
    let dashboardFilter = dashboardStackDrilldownFilter != null && dashboardStackDrilldownFilter.length > 0 ? dashboardStackDrilldownFilter : [];
    let widgetFilter = JSON.parse(data.filter);
    let drilldownDashboardFilter = widgetFilter;
    let drilldownDashboardTitle = data.dashboardTitle;
    event.value = JSON.stringify(dashboardData.data.dashboard);
    if (this.state.preparedDashboardFilter !== null) {
      //combining dashboardfilter with
      if (this.state.preparedDashboardFilter.length > 0 && widgetFilter.length > 0) drilldownDashboardFilter = preparefilter(widgetFilter, this.state.preparedDashboardFilter);
      else drilldownDashboardFilter = widgetFilter;
      event.dashboardFilter = this.state.preparedDashboardFilter;
    } else if (dashboardFilter.length > 0) {
      //combining dashboardfilter with widgetfilter
      drilldownDashboardFilter = preparefilter(widgetFilter, dashboardFilter);
      event.dashboardFilter = dashboardFilter;
    }
    event.drilldownDashboardFilter = drilldownDashboardFilter;
    event.drilldownDashboardTitle = drilldownDashboardTitle;
    event.widgetFilter = widgetFilter;
    if (elementId) {
      var widgetDiv = document.getElementById(elementId);
      this.loader.destroy(widgetDiv);
    }
    this.props.drilldownToDashboard(event, "dashname");
  }

  widgetDrillDownMessageHandler = (event) => {
    let eventData = event.data;
    //only drill down widget matching current dashboard uuid
    if(eventData.hasOwnProperty(WidgetDrillDownHelper.CTX_DASHBOARD_ID) && eventData[WidgetDrillDownHelper.CTX_DASHBOARD_ID] !== this.uuid) return;
    if (eventData.target == "dashboard") {
      this.drillDownToDashboard(eventData);
    }
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
    let filter = eventData[WidgetDrillDownHelper.MSG_PROP_FILTER];

    // console.log("Printing Filter: " + this.state.preparedDashboardFilter)
    //apply dashboard filter if exists
    if (this.state.preparedDashboardFilter) {
      let preparedFilter;
      if (this.state.preparedDashboardFilter.length > 0) {
        //combining dashboardfilter with widgetfilter
        preparedFilter = filter ? preparefilter(this.state.preparedDashboardFilter, JSON.parse(filter)) : this.state.preparedDashboardFilter;
      } else {
        preparedFilter = filter ? JSON.parse(filter) : "";
      }
      filter = preparedFilter;
      if (filter && "" !== filter) {
        url = url + "&filter=" + JSON.stringify(filter);
      } else {
        url = url;
      }
    } else if (this.props.dashboardStack && this.props.dashboardStack.length > 0) {
      let dashFilter = this.props.dashboardStack[this.props.dashboardStack.length - 1]["drilldownDashboardFilter"];
      let preparedFilter = null;
      if (filter) {
        if (dashFilter && dashFilter.length > 0) {
          preparedFilter = preparefilter(dashFilter, JSON.parse(filter));
        } else {
          preparedFilter = JSON.parse(filter);
        }
      } else {
        preparedFilter = dashFilter;
      }
      filter = preparedFilter;
      url = url + "&filter=" + JSON.stringify(filter);
    } else if (filter && "" !== filter) {
      url = url + "&filter=" + encodeURIComponent(filter);
    } else {
      url = url;
    }
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
        let renderproperties = {
          element: element,
          widget: response.data.widget,
          props: eventData,
          dashboardEditMode: false,
        };
        let widgetObject = WidgetRenderer.render(renderproperties, undefined, undefined, this.core, this.uuid);
        if (widgetObject) {
          self.renderedWidgets[elementId] = widgetObject;
        }
        if (eventData.elementId) {
          var widgetDiv = document.getElementById(eventData.elementId);
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
        if (eventData.elementId) {
          var widgetDiv = document.getElementById(eventData.elementId);
        }
      });
  };

  render() {
    return (
      <div
        ref={this.myRef}
        id={this.dashboardDivId}
        dangerouslySetInnerHTML={{
          __html: this.appendToDashboardContainer(this.state.htmlData ? this.state.htmlData : ""),
        }}
      />
    );
  }
}

export default Dashboard;
