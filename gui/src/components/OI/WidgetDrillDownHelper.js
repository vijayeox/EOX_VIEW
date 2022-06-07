class WidgetDrillDownHelper {
  static OXZION_DRILL_DOWN_CONTEXT_ATTRIBUTE = "data-oxzion-drilldownctx";
  static OXZION_WIDGET_ID_ATTRIBUTE = "data-oxzion-widget-id";
  static OXZION_ELEMENT_ID_ATTRIBUTE = "id";
  static ACTION_DRILL_DOWN = "oxzion-widget-drillDown";
  static ACTION_ROLL_UP = "oxzion-widget-rollUp";
  static MSG_PROP_ACTION = "action";
  static MSG_PROP_ELEMENT_ID = "elementId";
  static MSG_PROP_TARGET = "target";
  static MSG_PROP_WIDGET_ID = "widgetId";
  static MSG_PROP_NEXT_WIDGET_ID = "nextWidgetId";
  static MSG_PROP_FILTER = "filter";
  static MSG_PROP_WIDGET_TITLE = "widgetTitle";
  static MSG_PROP_WIDGET_FOOTER = "widgetFooter";
  static MSG_PROP_DASHBOARD_TITLE = "dashboardTitle";
  static CTX_PROP_WIDGET_ID = WidgetDrillDownHelper.MSG_PROP_WIDGET_ID;
  static CTX_PROP_NEXT_WIDGET_ID = WidgetDrillDownHelper.MSG_PROP_NEXT_WIDGET_ID;
  static CTX_PROP_TARGET = WidgetDrillDownHelper.MSG_PROP_TARGET;
  static CTX_PROP_FILTER = WidgetDrillDownHelper.MSG_PROP_FILTER;
  static CTX_PROP_WIDGET_TITLE = WidgetDrillDownHelper.MSG_PROP_WIDGET_TITLE;
  static CTX_PROP_WIDGET_FOOTER = WidgetDrillDownHelper.MSG_PROP_WIDGET_FOOTER;
  static CTX_PROP_DASHBOARD_TITLE = WidgetDrillDownHelper.MSG_PROP_DASHBOARD_TITLE;
  static CTX_PROP_IS_BOUND = "isBound";
  static CTX_PROP_MAX_DEPTH = "maxDepth";
  static CTX_DASHBOARD_ID = "dashboard-uuid"
  static CTX_LISTENERS = {};
  
  //instead of adding window listeners in each OI related component use this static listener
  /**
   * No need to remove this listener in unmount callback
   * @param {string} id specific uuid with respect to that component
   * @param {function} callback 
   * @returns {void}
   */ 
  static initializeListener = (id, callback) => {
    if(Object.keys(this.CTX_LISTENERS).length === 0){
      this.CTX_LISTENERS[id] = callback;
      window.addEventListener("message", (e) => {
        const { data } = e;
        if(data[this.CTX_DASHBOARD_ID] && this.CTX_LISTENERS[data[this.CTX_DASHBOARD_ID]]){
          this.CTX_LISTENERS[data[this.CTX_DASHBOARD_ID]](e);
        }else{
          for(let i in this.CTX_LISTENERS){
            this.CTX_LISTENERS[i](e);
          }
        }
      }, false)
      return;
    }
    this.CTX_LISTENERS[id] = callback;
  }
  
  static bindDrillDownDataContext(templateString, dataContext) {
    if (!templateString || "" === templateString || !dataContext) {
      return templateString;
    } else {
      let regex = /\${.*?}/;
      while (true) {
        let hits = regex.exec(templateString);
        if (!hits) {
          break;
        }
        templateString = templateString.replace(regex, function (matchedSubstring, offset, string) {
          let key = matchedSubstring.substring(2, matchedSubstring.length - 1); //Extract string between ${ and }
          let value = dataContext[key];
          if (!value) {
            console.error("Filter string:", templateString);
            console.error("Event data context:", dataContext);
            throw `Value for key "${key}" not found in the event data context logged above.`;
          }
          return value;
        });
      }
      return templateString;
    }
  }

  static drillDownClicked(widgetElement, dataContext) {
    function bindProperty(context, messageContent, propName) {
      let property = context ? context[propName] : null;
      if (property) {
        let boundProperty = WidgetDrillDownHelper.bindDrillDownDataContext(property, dataContext);
        messageContent[propName] = boundProperty;
        context[propName] = boundProperty;
      }
    }

    let widgetId = widgetElement.getAttribute(WidgetDrillDownHelper.OXZION_WIDGET_ID_ATTRIBUTE);
    if (!widgetElement.hasAttribute(WidgetDrillDownHelper.OXZION_DRILL_DOWN_CONTEXT_ATTRIBUTE)) {
      throw `Drill down conetxt attribute is not found for widget id ${widgetId}.`;
    }

    let elementId = widgetElement.getAttribute(WidgetDrillDownHelper.OXZION_ELEMENT_ID_ATTRIBUTE);
    let messageContent = {};
    messageContent[WidgetDrillDownHelper.MSG_PROP_ACTION] = WidgetDrillDownHelper.ACTION_DRILL_DOWN;
    messageContent[WidgetDrillDownHelper.MSG_PROP_WIDGET_ID] = widgetId;
    messageContent[WidgetDrillDownHelper.MSG_PROP_ELEMENT_ID] = elementId;

    let strAttribute = widgetElement.getAttribute(WidgetDrillDownHelper.OXZION_DRILL_DOWN_CONTEXT_ATTRIBUTE);
    let drillDownContext = JSON.parse(strAttribute);
    if (!drillDownContext || 0 === drillDownContext.length) {
      throw `Drill down context is not found for widget id ${widgetId}.`;
    }
    let context = drillDownContext[drillDownContext.length - 1];

    let target = context[WidgetDrillDownHelper.CTX_PROP_TARGET];
    if (!target || "" === target) {
      target = "widget"; //Default to widget target.
    }
    messageContent[WidgetDrillDownHelper.MSG_PROP_TARGET] = target;

    switch (target) {
      case "widget":
        let nextWidgetId = context[WidgetDrillDownHelper.CTX_PROP_NEXT_WIDGET_ID];
        if (!nextWidgetId) {
          nextWidgetId = widgetId; //Drill down will render the same widget with filter.
        }
        messageContent[WidgetDrillDownHelper.MSG_PROP_NEXT_WIDGET_ID] = nextWidgetId;
        widgetElement.setAttribute(WidgetDrillDownHelper.OXZION_WIDGET_ID_ATTRIBUTE, nextWidgetId);
        break;

      case "dashboard":
        messageContent["dashboard"] = context.nextWidgetId;
        messageContent["dashboardTitle"] = context.dashboardTitle;
        break;

      case "file":
        messageContent["uuid"] = context.uuid;
        messageContent["appName"] = context.appName;
        messageContent["name"] = context.name;

        break;

      default:
        throw `Unknown drill down target ${target}`;
    }

    bindProperty(context, messageContent, WidgetDrillDownHelper.MSG_PROP_FILTER);
    bindProperty(context, messageContent, WidgetDrillDownHelper.MSG_PROP_WIDGET_TITLE);
    bindProperty(context, messageContent, WidgetDrillDownHelper.MSG_PROP_WIDGET_FOOTER);
    bindProperty(context, messageContent, WidgetDrillDownHelper.MSG_PROP_DASHBOARD_TITLE);

    context[WidgetDrillDownHelper.CTX_PROP_IS_BOUND] = true;
    //Update the widget element attribute containing drill down context stack.
    widgetElement.setAttribute(WidgetDrillDownHelper.OXZION_DRILL_DOWN_CONTEXT_ATTRIBUTE, JSON.stringify(drillDownContext));

    console.log("Posting drillDown message to window.", messageContent);
    messageContent[this.CTX_DASHBOARD_ID] = widgetElement.getAttribute(this.CTX_DASHBOARD_ID)
    window.postMessage(messageContent);
  }

  static findWidgetElement(element) {
    if (element.topParent) {
      element = element.topParent.htmlContainer;
    }
    while (true) {
      element = element.parentElement;
      if (!element) {
        throw "Did not find widget element when moving up the node hierarchy of chart click event.";
      }
      if (element.hasAttribute(WidgetDrillDownHelper.OXZION_WIDGET_ID_ATTRIBUTE)) {
        return element;
      }
    }
  }

  static getAmchartsDataContext(dataItem, propertyList) {
    let obj = {};
    propertyList.forEach(function (prop, index, array) {
      if (dataItem[prop]) {
        obj[prop] = dataItem[prop];
      }
    });
    return obj;
  }

  static setupAmchartsEventHandlers(series) {
    if (!series) {
      return;
    }

    series.forEach(function (ser) {
      switch (ser.type) {
        case "ColumnSeries":
          if (!ser["columns"]) {
            ser["columns"] = {};
          }
          let columns = ser["columns"];
          if (!columns["events"]) {
            columns["events"] = {};
          }
          let columnEvts = columns["events"];
          columnEvts["hit"] = function (evt) {
            let dataContext = WidgetDrillDownHelper.getAmchartsDataContext(evt.target.dataItem, ["valueX", "valueY", "dateX", "dateY", "categoryX", "categoryY", "openValueX", "openValueY", "openDateX", "openDateY", "openCategoryX", "openCategoryY"]);
            WidgetDrillDownHelper.drillDownClicked(WidgetDrillDownHelper.findWidgetElement(evt.event ? evt.event.target : evt.target), dataContext);
          };
          break;
        case "PieSeries":
          if (!ser["slices"]) {
            ser["slices"] = {};
          }
          let slices = ser["slices"];
          if (!slices["template"]) {
            slices["template"] = {};
          }
          let template = slices["template"];
          if (!template["events"]) {
            template["events"] = {};
          }
          let events = template["events"];
          events["hit"] = function (evt) {
            let dataContext = evt.target.dataItem.dataContext;
            WidgetDrillDownHelper.drillDownClicked(WidgetDrillDownHelper.findWidgetElement(evt.event ? evt.event.target : evt.target), dataContext);
          };
          break;
        case "LineSeries":
          if (!ser["segments"]) {
            ser["segments"] = {};
          }
          let segments = ser["segments"];
          segments["interactionsEnabled"] = true;
          if (!segments["events"]) {
            segments["events"] = {};
          }
          let segmentEvts = segments["events"];
          segmentEvts["hit"] = function (evt) {
            let dataContext = evt.target.dataItem.component.tooltipDataItem.dataContext;
            WidgetDrillDownHelper.drillDownClicked(WidgetDrillDownHelper.findWidgetElement(evt.event ? evt.event.target : evt.target), dataContext);
          };

          if (!ser["bullets"]) {
            ser["bullets"] = [];
          }
          let bullets = ser["bullets"];
          bullets.forEach(function (bul) {
            if (!bul["events"]) {
              bul["events"] = {};
            }
            let bulletEvts = bul["events"];
            bulletEvts["hit"] = function (evt) {
              let dataContext = evt.target.dataItem.dataContext;
              WidgetDrillDownHelper.drillDownClicked(WidgetDrillDownHelper.findWidgetElement(evt.event ? evt.event.target : evt.target), dataContext);
            };
          });
          break;
        case "FunnelSeries":
          if (!ser["events"]) {
            ser["events"] = {};
          }
          let evts = ser["events"];
          evts["hit"] = function (evt) {
            console.log("Hit function", evt);
          };
          break;
      }
    });
  }

  static setupDrillDownContextStack(element, configuration, applyingDashboardFilter) {
    let meta = configuration["oxzion-meta"];
    if (!meta) {
      return false;
    }
    let drillDown = meta["drillDown"];
    if (!drillDown) {
      return false;
    }

    let maxDepth = drillDown[WidgetDrillDownHelper.CTX_PROP_MAX_DEPTH];
    let context = JSON.parse(JSON.stringify(drillDown)); //Clone drillDown context.
    delete context[WidgetDrillDownHelper.CTX_PROP_MAX_DEPTH];
    context[WidgetDrillDownHelper.CTX_PROP_WIDGET_ID] = element.getAttribute(WidgetDrillDownHelper.OXZION_WIDGET_ID_ATTRIBUTE);
    context[WidgetDrillDownHelper.CTX_PROP_IS_BOUND] = false;

    let drillDownContext = null;
    if (element.hasAttribute(WidgetDrillDownHelper.OXZION_DRILL_DOWN_CONTEXT_ATTRIBUTE)) {
      let strAttribute = element.getAttribute(WidgetDrillDownHelper.OXZION_DRILL_DOWN_CONTEXT_ATTRIBUTE);
      drillDownContext = JSON.parse(strAttribute);
    }

    if (!drillDownContext) {
      drillDownContext = [];
    }
    if (maxDepth) {
      if (drillDownContext.length >= maxDepth) {
        return false;
      }
    }
    !applyingDashboardFilter && drillDownContext.push(context);

    let jsonString = JSON.stringify(drillDownContext);
    element.setAttribute(WidgetDrillDownHelper.OXZION_DRILL_DOWN_CONTEXT_ATTRIBUTE, jsonString);
    return true;
  }

  static isDrilledDown(element) {
    if (!element.hasAttribute(WidgetDrillDownHelper.OXZION_DRILL_DOWN_CONTEXT_ATTRIBUTE)) {
      return false;
    }

    let strAttribute = element.getAttribute(WidgetDrillDownHelper.OXZION_DRILL_DOWN_CONTEXT_ATTRIBUTE);
    let drillDownContext = JSON.parse(strAttribute);
    for (let i = 0; i < drillDownContext.length; i++) {
      let context = drillDownContext[i];
      if (context[WidgetDrillDownHelper.CTX_PROP_IS_BOUND]) {
        return true;
      }
    }
    return false;
  }

  static _assignIfDefined(map, property, value) {
    if (!value || "" === value) {
      return;
    }
    map[property] = value;
  }

  static rollUpClicked(widgetElement) {
    let widgetId = widgetElement.getAttribute(WidgetDrillDownHelper.OXZION_WIDGET_ID_ATTRIBUTE);
    if (!widgetElement.hasAttribute(WidgetDrillDownHelper.OXZION_DRILL_DOWN_CONTEXT_ATTRIBUTE)) {
      throw `Drill down conetxt attribute is not found for widget id ${widgetId}.`;
    }

    let context = WidgetDrillDownHelper.unwindDrillDownContextStack(widgetElement);
    let elementId = widgetElement.getAttribute(WidgetDrillDownHelper.OXZION_ELEMENT_ID_ATTRIBUTE);
    let messageContent = {};
    messageContent[WidgetDrillDownHelper.MSG_PROP_ACTION] = WidgetDrillDownHelper.ACTION_ROLL_UP;
    messageContent[WidgetDrillDownHelper.MSG_PROP_WIDGET_ID] = widgetId;
    messageContent[WidgetDrillDownHelper.MSG_PROP_ELEMENT_ID] = elementId;

    WidgetDrillDownHelper._assignIfDefined(messageContent, WidgetDrillDownHelper.MSG_PROP_FILTER, context[WidgetDrillDownHelper.CTX_PROP_FILTER]);
    WidgetDrillDownHelper._assignIfDefined(messageContent, WidgetDrillDownHelper.MSG_PROP_WIDGET_TITLE, context[WidgetDrillDownHelper.CTX_PROP_WIDGET_TITLE]);
    WidgetDrillDownHelper._assignIfDefined(messageContent, WidgetDrillDownHelper.MSG_PROP_WIDGET_FOOTER, context[WidgetDrillDownHelper.CTX_PROP_WIDGET_FOOTER]);
    WidgetDrillDownHelper._assignIfDefined(messageContent, WidgetDrillDownHelper.MSG_PROP_DASHBOARD_TITLE, context[WidgetDrillDownHelper.CTX_PROP_DASHBOARD_TITLE]);

    let nextWidgetId = context[WidgetDrillDownHelper.CTX_PROP_WIDGET_ID];
    if (nextWidgetId !== widgetId) {
      messageContent[WidgetDrillDownHelper.MSG_PROP_NEXT_WIDGET_ID] = nextWidgetId;
      widgetElement.setAttribute(WidgetDrillDownHelper.OXZION_WIDGET_ID_ATTRIBUTE, nextWidgetId);
    }

    console.log("Posting rollUp message to window.", messageContent);
    messageContent[this.CTX_DASHBOARD_ID] = widgetElement.getAttribute(this.CTX_DASHBOARD_ID)
    window.postMessage(messageContent);
  }

  static unwindDrillDownContextStack(widgetElement) {
    let widgetId = widgetElement.getAttribute(WidgetDrillDownHelper.OXZION_WIDGET_ID_ATTRIBUTE);
    if (!widgetElement.hasAttribute(WidgetDrillDownHelper.OXZION_DRILL_DOWN_CONTEXT_ATTRIBUTE)) {
      throw `Drill down conetxt attribute is not found for widget id ${widgetId}.`;
    }

    let strAttribute = widgetElement.getAttribute(WidgetDrillDownHelper.OXZION_DRILL_DOWN_CONTEXT_ATTRIBUTE);
    let drillDownContext = JSON.parse(strAttribute);
    if (!drillDownContext || 0 === drillDownContext.length) {
      throw `Drill down conetxt is not found for widget id ${widgetId}.`;
    }

    let context = drillDownContext.pop();
    if (!context[WidgetDrillDownHelper.CTX_PROP_IS_BOUND]) {
      context = drillDownContext.pop();
    }
    if (!context[WidgetDrillDownHelper.CTX_PROP_IS_BOUND]) {
      throw `Unbound context not found neither at top nor at 2nd position from top of drill down stack for widget id ${widgetId}.`;
    }
    //Update the widget element attribute containing drill down context stack.
    widgetElement.setAttribute(WidgetDrillDownHelper.OXZION_DRILL_DOWN_CONTEXT_ATTRIBUTE, JSON.stringify(drillDownContext));

    //Clone the context.
    context = JSON.parse(JSON.stringify(context));
    //Filter, widget title and widget footer should be picked up from the context at the top of the drill down stack.
    delete context[WidgetDrillDownHelper.CTX_PROP_FILTER];
    delete context[WidgetDrillDownHelper.CTX_PROP_WIDGET_TITLE];
    delete context[WidgetDrillDownHelper.CTX_PROP_WIDGET_FOOTER];
    delete context[WidgetDrillDownHelper.CTX_PROP_DASHBOARD_TITLE];

    //Filter, widget title and widget footer should be picked up from the context at the top of the drill down stack.
    if (drillDownContext.length > 0) {
      let tempContext = drillDownContext[drillDownContext.length - 1];
      WidgetDrillDownHelper._assignIfDefined(context, WidgetDrillDownHelper.CTX_PROP_FILTER, tempContext[WidgetDrillDownHelper.CTX_PROP_FILTER]);
      WidgetDrillDownHelper._assignIfDefined(context, WidgetDrillDownHelper.CTX_PROP_WIDGET_TITLE, tempContext[WidgetDrillDownHelper.CTX_PROP_WIDGET_TITLE]);
      WidgetDrillDownHelper._assignIfDefined(context, WidgetDrillDownHelper.CTX_PROP_WIDGET_FOOTER, tempContext[WidgetDrillDownHelper.CTX_PROP_WIDGET_FOOTER]);
      WidgetDrillDownHelper._assignIfDefined(context, WidgetDrillDownHelper.CTX_PROP_DASHBOARD_TITLE, tempContext[WidgetDrillDownHelper.CTX_PROP_DASHBOARD_TITLE]);
    }

    return context;
  }
}

export default WidgetDrillDownHelper;
