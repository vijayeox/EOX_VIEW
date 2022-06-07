import React from "react";
import ReactDOM, { render } from "react-dom";
var numeral = require("numeral");
import WidgetGrid from "./WidgetGrid";
import WidgetGridNew from "./WidgetGridNew";
import Parser from "html-react-parser";
import WidgetDrillDownHelper from "./WidgetDrillDownHelper";
import * as am4core from "../../../amcharts/core";
import * as am4charts from "../../../amcharts/charts";
import * as am4maps from "../../../amcharts/maps";
import am4geodata_usaAlbersLow from "@amcharts/amcharts4-geodata/usaAlbersLow";
import am4themes_animated from "../../../amcharts/themes/animated";
// import am4themes_kelly from '../amcharts/themes/kelly';
import WidgetTransformer from "./WidgetTransformer";
import * as am4plugins_forceDirected from "../../../amcharts/plugins/forceDirected";
import am4geodata_worldLow from "@amcharts/amcharts4-geodata/worldLow";
am4core.useTheme(am4themes_animated);
am4core.options.commercialLicense = true;
// import Mapbox from './components/Custom/Mapbox';
import ComponentIndex from "../Custom/ComponentIndex";
// import WidgetcustomReport from './components/Custom/WidgetCustom'
// import WidgetCustom from './components/Custom/WidgetCustom';

class WidgetRenderer {
  // static render(element, widget, props,hasDashboardFilters,dashboardMode) {
  static render(renderpropertiesObject, widgetUUId, filterParams, core, uuid) {
    let { element, widget, props, hasDashboardFilters, dashboardEditMode } = {
      ...renderpropertiesObject,
    };
    // am4core.options.queue = true //reduces load on the browser
    let widgetTagName = element.tagName.toUpperCase();
    let widgetReturnParams = {};
    // let renderer = 'Report';
    console.log(widget.renderer);
    switch (widget.renderer) {
      case "JsAggregate":
        if (widgetTagName !== "SPAN" && widgetTagName !== "DIV") {
          throw `Unexpected inline aggregate value widget tag "${widgetTagName}"`;
        }
        widgetReturnParams = WidgetRenderer.renderAggregateValue(element, widget.configuration, props, widget.data, hasDashboardFilters, dashboardEditMode, widget);
        break;
      case "amCharts":
        if (widgetTagName !== "FIGURE" && widgetTagName !== "DIV") {
          throw `Unexpected chart widget tag "${widgetTagName}"`;
        }
        try {
          widgetReturnParams = WidgetRenderer.renderAmCharts(element, widget.configuration, props, widget.data, hasDashboardFilters);
        } catch (e) {
          console.error(e);
          return null;
        }
        break;

      case "JsTable":
        if (widgetTagName !== "FIGURE" && widgetTagName !== "DIV") {
          throw `Unexpected table widget tag "${widgetTagName}"`;
        }
        try {
          widgetReturnParams = WidgetRenderer.renderTable(element, widget.configuration, widget.data, hasDashboardFilters, "WidgetGrid", undefined, undefined, core);
          break;
        } catch (e) {
          console.error(e);
          return null;
        }

      case "jsGrid":
        if (widgetTagName !== "FIGURE" && widgetTagName !== "DIV") {
          throw `Unexpected table widget tag "${widgetTagName}"`;
        }
        try {
          widgetReturnParams = WidgetRenderer.renderTable(element, widget.configuration, widget.data, hasDashboardFilters, "WidgetGridNew", widget.uuid, filterParams, core, widget["total_count"]);
          break;
        } catch (e) {
          console.error(e);
          return null;
        }

      case "HTML":
        if (widgetTagName !== "SPAN" && widgetTagName !== "DIV") {
          throw `Unexpected inline aggregate value widget tag "${widgetTagName}"`;
        }
        widgetReturnParams = WidgetRenderer.renderhtml(element, widget.configuration, props, widget.data);
        break;

      case "Profile":
        if (widgetTagName !== "SPAN" && widgetTagName !== "DIV") {
          throw `Unexpected inline aggregate value widget tag "${widgetTagName}"`;
        }
        widgetReturnParams = WidgetRenderer.renderProfile(element, widget.configuration, core, widget.data);
        break;

      case "Report":
        if (widgetTagName !== "SPAN" && widgetTagName !== "DIV") {
          console.log(`Unexpected inline Report value widget tag "${widgetTagName}"`);
          // throw (`Unexpected inline aggregate value widget tag "${widgetTagName}"`);
        }
        widgetReturnParams = WidgetRenderer.renderReport(element, widget.configuration, core, widget.data);
        break;
      // add a case for jsGrid for the server grid loading
      default:
        throw `Unexpected widget renderer "${widget.renderer}"`;
    }
    //append uuid of dashboard to keep tracking post invoking events
    element.setAttribute(WidgetDrillDownHelper.CTX_DASHBOARD_ID, uuid)
    return widgetReturnParams;
  }

  static renderReport(element, config, core, data) {
    let ComponentType = config["report"];
    // let reportInfo = Components.renderReport(ComponentType)
    let canvasElement = document.getElementById(element.id);
    ReactDOM.render(<ComponentIndex element={element} config={config} core={core} data={data} canvasElement={canvasElement} />, canvasElement);
  }

  static renderAggregateValue(element, configuration, props, data, hasDashboardFilters, dashboardEditMode, widget) {
    let displayValue = null;
    let isDrillDownChart = false;
    if (configuration) {
      if (configuration.numberFormat) {
        let format = configuration.numberFormat;
        let num = numeral(data);
        displayValue = num.format(format);
      } else if (configuration.dateFormat) {
        let format = configuration.dateFormat;
        displayValue = dayjs(data).format(format);
      } else {
        displayValue = data;
      }
    }
    element.innerHTML = displayValue ? displayValue : "" + data;
    element.innerHTML = displayValue ? displayValue : "" + data;
    element.classList.remove("red");
    element.classList.remove("yellow");
    element.classList.remove("green");
    if (widget && widget.targets) {
      element.classList.add(widget.targets.color);
    }
    if (!dashboardEditMode && WidgetDrillDownHelper.setupDrillDownContextStack(element, configuration, hasDashboardFilters)) {
      //adding relevant css for drilldown aggregate value
      element.classList.add("oxzion-widget-aggregate-drilldown");
      //    attaching event to the aggregate value
      element.addEventListener("click", (evt) => {
        let aggregateValue = evt.target.innerHTML;
        let parsedAggregateValue = 0;
        if (typeof aggregateValue == "string") {
          //assuming the value is going to be a formatted numeric value
          aggregateValue = aggregateValue.replace(/\,/g, "");
          aggregateValue = aggregateValue.replace("$", "");
          if ((aggregateValue = parseFloat(aggregateValue))) {
            WidgetDrillDownHelper.drillDownClicked(element, {
              aggregatevalue: parsedAggregateValue,
            });
          } else {
            throw "Unxepected value passed as dilldownvalue";
          }
        }
      });
      isDrillDownChart = true;
    }
    return null;
  }

  static renderProfile(element, configuration, core, data) {
    let displayValue = null;
    let imageHtml = "";
    if (configuration) {
      if (configuration.uuid) {
        let format = configuration.uuid;
        let uuid = data;
        let encodedKey = btoa("wrapper.url");
        let imageUrl = "";
        const imageSrcTag = '<img alt="" title="Profile Picture" width="140px" height="100px" src="';

        displayValue = data[0][format];

        if (core !== undefined) {
          imageUrl = core.config("wrapper.url") + "user/profile/" + displayValue;
          if (window.localStorage.getItem(encodedKey) == null) {
            let encodedVal = btoa(core.config("wrapper.url"));
            window.localStorage.setItem(encodedKey, encodedVal);
          }
        } else {
          let encodedVal = window.localStorage.getItem(encodedKey);
          imageUrl = atob(encodedVal) + "user/profile/" + displayValue;
        }
        imageHtml = imageSrcTag + imageUrl + '">';
      } else {
        displayValue = data;
      }
    }
    element.innerHTML = imageHtml;
    return null;
  }

  static renderhtml(element, configuration, props, data) {
    let displayValue = null;
    if (configuration) {
      if (configuration.numberFormat) {
        let format = configuration.numberFormat;
        let num = numeral(data);
        displayValue = num.format(format);
      } else if (configuration.dateFormat) {
        let format = configuration.dateFormat;
        displayValue = dayjs(data).format(format);
      } else {
        displayValue = data;
      }
    }
    element.innerHTML = displayValue ? displayValue : "" + data;
    return null;
  }

  static overrideConfigurationProps(configuration, props) {
    if (!configuration || !props) {
      return configuration;
    }
    let widgetTitle = props["widgetTitle"];
    if (widgetTitle && "" !== widgetTitle) {
      let configTitles = configuration["titles"];
      if (configTitles && configTitles.length > 0) {
        let title = configTitles[0];
        title["text"] = widgetTitle;
      }
    }
    let widgetFooter = props["widgetFooter"];
    if (widgetFooter && "" !== widgetFooter) {
      let chContainer = configuration["chartContainer"];
      if (chContainer) {
        let footers = chContainer["children"];
        if (footers && footers.length > 0) {
          let footer = footers[0];
          footer["text"] = widgetFooter;
        }
      }
    }
    return configuration;
  }

  static renderAmCharts(element, configuration, props, data, hasDashboardFilters) {
    let isDrillDownChart = false;
    let transformedConfig = WidgetTransformer.transform(configuration, data);
    configuration = transformedConfig.chartConfiguration;
    data = transformedConfig.chartData;
    configuration = WidgetRenderer.overrideConfigurationProps(configuration, props);

    let series = configuration.series;

    //if (!Array.isArray(series)) {
    //    throw 'Chart series should be array.';
    //}
    //if (0 === series.length) {
    //    throw 'Chart series is empty.';
    //}

    let type = null;
    if (Array.isArray(series) && series.length > 0) {
      type = series[0].type;
    }
    let am4ChartType;
    if (type) {
      switch (type) {
        case "LineSeries":
          am4ChartType = am4charts.XYChart;
          break;
        case "ColumnSeries":
          am4ChartType = am4charts.XYChart;
          break;
        case "PieSeries":
          am4ChartType = am4charts.PieChart;
          break;
        case "FunnelSeries":
        case "PyramidSeries":
          am4ChartType = am4charts.SlicedChart;
          break;
        case "ForceDirectedSeries":
          am4ChartType = am4plugins_forceDirected.ForceDirectedSeries;
          break;
        case "ForceDirectedLink":
          am4ChartType = am4plugins_forceDirected.ForceDirectedLink;
          break;
        case "ForceDirectedNode":
          am4ChartType = am4plugins_forceDirected.ForceDirectedNode;
          break;
        case "ForceDirectedTree":
          am4ChartType = am4plugins_forceDirected.ForceDirectedTree;
          break;
        default:
          throw `Unhandled am4charts type: ${type}`;
      }
    } else {
      let meta = configuration["oxzion-meta"];
      let chartType = meta ? meta["type"] : null;
      if (chartType) {
        switch (chartType) {
          case "map":
            am4ChartType = "amCharts-map";
            break;
          case "worldmaplow":
            am4ChartType = am4geodata_worldLow;
            break;
          default:
            throw `Unhandled oxzion-meta chart type : ${chartType}`;
        }
      } else {
        console.error("Failed to detect chart type (specify chart type in oxzion-meta property of chart configuration JSON).", configuration);
        throw "Specify chart type in oxzion-meta property.";
      }
    }

    let elementTagName = element.tagName.toUpperCase();
    let canvasElement = null;
    switch (elementTagName) {
      case "DIV":
        canvasElement = element;
        break;
      case "FIGURE":
        canvasElement = element.querySelector("div.oxzion-widget-content");
        break;
      default:
        throw `Unexpected chart element "${elementTagName}"`;
    }
    if (!canvasElement) {
      throw "Canvas element not found for drawing the chart.";
    }

    let chart = null;
    if ("amCharts-map" === am4ChartType || am4geodata_worldLow === am4ChartType) {
      if (WidgetDrillDownHelper.setupDrillDownContextStack(element, configuration, hasDashboardFilters)) {
        WidgetDrillDownHelper.setupAmchartsEventHandlers(series);
        isDrillDownChart = true;
      }
      chart = WidgetRenderer.renderAmMap(configuration, canvasElement, data);
      if (isDrillDownChart) {
        canvasElement.insertAdjacentHTML("beforeend", '<div class="oxzion-widget-drilldown-icon right" title="Drilldown Chart">' + '<i class="fas fa-angle-double-down fa-lg"></i>' + "</div>");
      }
    } else {
      if (data && data.length > 0) {
        if (data[0].green_limit || data[0].yellow_limit || data[0].red_limit) {
          configuration["series"][0]["columns"] = {
            adapter: {
              fill: function (fill, target) {
                if (target.dataItem && target.dataItem.valueY < 0) {
                  return am4core.color("#EE4424");
                } else if (target.dataItem && target.dataItem.valueY > 0 && target.dataItem.valueY < target.dataItem._dataContext.red_limit) {
                  return am4core.color("#EE4424");
                } else if (target.dataItem && target.dataItem.valueY >= target.dataItem._dataContext.red_limit && target.dataItem.valueY < target.dataItem._dataContext.yellow_limit) {
                  return am4core.color("#F3BA1D");
                } else if (target.dataItem && target.dataItem.valueY >= target.dataItem._dataContext.yellow_limit && target.dataItem.valueY < target.dataItem._dataContext.green_limit) {
                  return am4core.color("#A3C53A");
                } else if (target.dataItem && target.dataItem.valueY > target.dataItem._dataContext.green_limit) {
                  return am4core.color("#A3C53A");
                } else {
                  return fill;
                }
              },
            },
          };
          // configuration["series"][0]["bullets"] = {
          //     "adapter": {
          //         "fill": function (fill, target) {
          //             if (target.dataItem && (target.dataItem.valueY < 0)) {
          //                 return am4core.color('#EE4424');
          //             } else if (target.dataItem && (target.dataItem.valueY > 0 && target.dataItem.valueY < target.dataItem._dataContext.red_limit)) {
          //                 return am4core.color('#EE4424');
          //             } else if (target.dataItem && (target.dataItem.valueY >= target.dataItem._dataContext.red_limit && target.dataItem.valueY < target.dataItem._dataContext.yellow_limit)) {
          //                 return am4core.color('#F3BA1D');
          //             } else if (target.dataItem && (target.dataItem.valueY >= target.dataItem._dataContext.yellow_limit && target.dataItem.valueY < target.dataItem._dataContext.green_limit)) {
          //                 return am4core.color('#A3C53A');
          //             } else if (target.dataItem && (target.dataItem.valueY > target.dataItem._dataContext.green_limit)) {
          //                 return am4core.color('#A3C53A');
          //             } else {
          //                 return fill;
          //             }
          //         }
          //     }
          // };
        }
      }
      if (WidgetDrillDownHelper.setupDrillDownContextStack(element, configuration, hasDashboardFilters)) {
        WidgetDrillDownHelper.setupAmchartsEventHandlers(series);
        isDrillDownChart = true;
      }
      chart = am4core.createFromConfig(configuration, canvasElement, am4ChartType);
      chart.responsive.enabled = true;
      if (chart && data) {
        chart.data = data;
      }
      if (isDrillDownChart) {
        chart.cursorOverStyle = am4core.MouseCursorStyle.pointer;
        canvasElement.insertAdjacentHTML("beforeend", '<div class="oxzion-widget-drilldown-icon" title="Drilldown Chart">' + '<i class="fas fa-angle-double-down fa-lg"></i>' + "</div>");
      }
    }

    if (WidgetDrillDownHelper.isDrilledDown(element)) {
      let rollUpElements = element.getElementsByClassName("oxzion-widget-roll-up-button");
      let buttonElement = rollUpElements && rollUpElements.length > 0 ? rollUpElements[0] : null;
      element.cursorOverStyle = am4core.MouseCursorStyle.pointer;
      if (!buttonElement) {
        element.insertAdjacentHTML("beforeend", '<div class="oxzion-widget-roll-up-button" title="Back">' + '<i class="fa fa-arrow-circle-left" aria-hidden="true"></i>' + "</div>");
        rollUpElements = element.getElementsByClassName("oxzion-widget-roll-up-button");
        buttonElement = rollUpElements && rollUpElements.length > 0 ? rollUpElements[0] : null;
        buttonElement.addEventListener("clickGraphItem", (event) => {
          let target = event.target;
          WidgetDrillDownHelper.rollUpClicked(WidgetDrillDownHelper.findWidgetElement(target));
        });
      }
    } else {
      let rollUpElements = element.getElementsByClassName("oxzion-widget-roll-up-button");
      let buttonElement = rollUpElements && rollUpElements.length > 0 ? rollUpElements[0] : null;
      if (buttonElement) {
        buttonElement.remove();
      }
    }
    return chart;
  }

  static renderAmMap(configuration, canvasElement, data) {
    let meta = configuration["oxzion-meta"];
    function findWidgetElement(element) {
      if ("MapPolygon" !== element.className) {
        throw "Unexpected element type.";
      }
      element = element.htmlContainer;
      while (true) {
        element = element.parentElement;
        if (!element) {
          throw "Did not find widget element when moving up the node hierarchy of map chart click event.";
        }
        if (element.hasAttribute(WidgetDrillDownHelper.OXZION_WIDGET_ID_ATTRIBUTE)) {
          return element;
        }
      }
    }

    function processData(data, configuration) {
      let meta = configuration["oxzion-meta"];
      if (!meta) {
        throw 'Configuration should have "oxzion-meta" element.';
      }
      let country = meta["countryCode"];
      if (country) {
        country = country + "-";
      }
      let dataKeys = meta["dataKeys"];
      if (!dataKeys) {
        throw 'oxzion-meta configuration should have "dataKeys" element.';
      }
      let stateKey = dataKeys["state"];
      let valueKey = dataKeys["value"];

      let newData = [];
      let min = Number.MAX_VALUE;
      let max = Number.MIN_VALUE;
      data.forEach(function (item, index, array) {
        let key = item[stateKey];
        let value = item[valueKey];
        newData.push({
          id: country + key,
          value: value,
        });
        max = Math.max(max, value);
        min = Math.min(min, value);
      });
      return {
        data: newData,
        max: max,
        min: min,
      };
    }

    //-----------------------------------------------------------------------------------------
    // Code is based on https://codepen.io/team/amcharts/pen/5ae84826c9e2ab4772c9ef85021835c7
    //-----------------------------------------------------------------------------------------
    let chart = am4core.create(canvasElement, am4maps.MapChart);
    chart.geodata = am4geodata_usaAlbersLow;
    chart.projection = new am4maps.projections.Mercator();
    let polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());

    //Set min/max fill color for each area
    polygonSeries.heatRules.push({
      property: "fill",
      target: polygonSeries.mapPolygons.template,
      min: chart.colors.getIndex(1).brighten(1),
      max: chart.colors.getIndex(1).brighten(-0.3),
    });

    // Make map load polygon data (state shapes and names) from GeoJSON
    polygonSeries.useGeodata = true;

    let processedData = processData(data, configuration);
    polygonSeries.data = processedData["data"];

    // Set up heat legend
    let heatLegend = chart.createChild(am4maps.HeatLegend);
    heatLegend.series = polygonSeries;
    heatLegend.align = "right";
    heatLegend.width = am4core.percent(25);
    heatLegend.marginRight = am4core.percent(4);
    heatLegend.minValue = processedData["min"];
    heatLegend.maxValue = processedData["max"];

    // let meta = configuration['oxzion-meta'];
    let legend = null;
    if (meta) {
      legend = meta["legend"];
    }
    if (legend) {
      let labels = legend["labels"];
      if (labels) {
        let min = labels["min"];
        if (min) {
          let minRange = heatLegend.valueAxis.axisRanges.create();
          minRange.value = heatLegend.minValue;
          minRange.label.text = min;
        }
        let max = labels["max"];
        if (max) {
          let maxRange = heatLegend.valueAxis.axisRanges.create();
          maxRange.value = heatLegend.maxValue;
          maxRange.label.text = max;
        }
      }
    }

    // Blank out internal heat legend value axis labels
    heatLegend.valueAxis.renderer.labels.template.adapter.add("text", function (labelText) {
      return "";
    });

    // Configure series tooltip
    let polygonTemplate = polygonSeries.mapPolygons.template;
    polygonTemplate.nonScalingStroke = true;
    polygonTemplate.strokeWidth = 0.5;
    let tooltipText = meta["tooltipText"];
    if (tooltipText) {
      polygonTemplate.tooltipText = tooltipText;
    }

    // Create hover state and set alternative fill color
    let hs = polygonTemplate.states.create("hover");
    hs.properties.fill = am4core.color("#3c5bdc");

    // Show tooltips only if the state has a value
    // (A tooltip will appear if tooltipText is not empty.)
    polygonTemplate.adapter.add("tooltipText", function (tooltipText, polygon) {
      if (isNaN(polygon.dataItem.dataContext.value)) {
        return "";
      }
      return tooltipText;
    });

    // When clicking a US State, if it has a numeric value:
    // 1. hide tooltip (use hit event handler)
    // 2. open URL if available (use url property, property binding, and adapter)
    polygonTemplate.events.on("hit", function (event) {
      let dataContext = {
        code: event.target.dataItem.dataContext.id.substring(3),
        name: event.target.dataItem.dataContext.name,
      };
      WidgetDrillDownHelper.drillDownClicked(findWidgetElement(event.target), dataContext);

      // The original logic was if this state has a numeric value,
      // but a tooltip will only show if that's the case,
      // so we can just hide it regardless.

      // All these are ways to hide the tooltip, the actual tooltip
      // object is on the series, not the individual mapPolygons:
      // polygonSeries.tooltip.hide();
      // polygonSeries.hideTooltip();
      event.target.hideTooltip();
    });

    polygonTemplate.propertyFields.url = "modalUrl";
    polygonTemplate.urlTarget = "_self";
    // We can either now parse data before it's processed and prevent modalUrl
    // from being applied if the value DNE or isNaN,
    // OR!
    // We can use an adapter for url, reset it as needed, and override the cursor style.

    // This adapter will trigger on hit
    polygonTemplate.adapter.add("url", function (url, polygon) {
      // if data isn't ready, or value isn't a number, kill the url if it has one
      if (!polygon.dataItem || !polygon.dataItem.dataContext || isNaN(polygon.dataItem.dataContext.value)) {
        return "";
      }
      return url;
    });
    // When url is applied, hover cursor is changed to pointer
    polygonSeries.events.on("datavalidated", function () {
      polygonSeries.mapPolygons.each(function (polygon) {
        // Since we only set url via property binding, if it has an url
        // already, then it definitely has the dataItem.dataContext,
        // but maybe not a value.
        if (polygon.properties.url && isNaN(polygon.dataItem.dataContext.value)) {
          polygon.cursorOverStyle = am4core.MouseCursorStyle.default;
        }
      });
    });

    if (meta["showStateName"]) {
      // To create labels for our mapPolygons, we'll need a MapImageSeries.
      // The MapImage will serve as a container for our labels and is able
      // to be positioned on the map according to geographic coordinates.
      // (It is important to make an actual MapImageSeries, not attempt
      // to make a MapImage as a child of a MapPolygon.)
      let imageSeries = chart.series.push(new am4maps.MapImageSeries());
      let mapImageTemplate = imageSeries.mapImages.template;
      mapImageTemplate.propertyFields.latitude = "latitude";
      mapImageTemplate.propertyFields.longitude = "longitude";

      let labelTemplate = mapImageTemplate.createChild(am4core.Label);
      labelTemplate.text = "{id}";
      labelTemplate.horizontalCenter = "middle";
      labelTemplate.verticalCenter = "middle";
      labelTemplate.textAlign = "middle";
      labelTemplate.interactionsEnabled = false; // let hover pass through, this way a country's hover effect is maintained

      // Once a mapPolygon is loaded, it will calculate a rough, center coordinate,
      // and assign values to its immediate latitude and longitude properties.
      //
      // For States whose calculations are off, provide your own center coordinate,
      // e.g. for Idaho, Florida, etc.
      let longitude = {
        // polygonSeries.getPolygonById('US-TX').longitude
        // -100.0994
        "US-TX": -99,
        "US-FL": -81.65,
      };
      let latitude = {
        // polygonSeries.getPolygonById('US-ID').latitude
        // 45.496849999999995
        "US-ID": 43.6,
      };
      polygonSeries.events.once("datavalidated", function () {
        let imageData = [];
        polygonSeries.mapPolygons.each(function (polygon) {
          let stateData = polygon.dataItem.dataContext;
          let stateLabelData = {
            latitude: latitude[stateData.id] || polygon.latitude,
            longitude: longitude[stateData.id] || polygon.longitude,
            id: stateData.id.substr(3), // stateData.id.replace(/US-/, '')
          };
          imageData.push(stateLabelData);
        });
        imageSeries.data = imageData;
      });
    }
  }

  static renderTable(element, configuration, data, hasDashboardFilters, widgetGridType, widgetUUId = null, filterParams = null, core, total_count = null) {
    let elementTagName = element.tagName.toUpperCase();
    let canvasElement = null;
    let isDrillDownTable = false;
    switch (elementTagName) {
      case "DIV":
        canvasElement = element;
        break;
      case "FIGURE":
        canvasElement = element.querySelector("div.oxzion-widget-content");
        break;
      default:
        throw `Unexpected table element "${elementTagName}"`;
    }
    if (!canvasElement) {
      throw "Canvas element not found for drawing the table/grid.";
    } else {
      //repainting the table if dashboard filter is applied
      hasDashboardFilters && ReactDOM.unmountComponentAtNode(canvasElement);
    }
    if (WidgetDrillDownHelper.setupDrillDownContextStack(element, configuration, hasDashboardFilters)) {
      // WidgetDrillDownHelper.setupAmchartsEventHandlers(series);
      isDrillDownTable = true;
    }
    if (WidgetDrillDownHelper.isDrilledDown(element)) {
      let rollUpElements = element.getElementsByClassName("oxzion-widget-roll-up-button");
      let buttonElement = rollUpElements && rollUpElements.length > 0 ? rollUpElements[0] : null;

      if (!buttonElement) {
        element.insertAdjacentHTML("beforeend", '<div class="oxzion-widget-roll-up-button" title="Back">' + '<i class="fa fa-arrow-circle-left" aria-hidden="true"></i>' + "</div>");
        rollUpElements = element.getElementsByClassName("oxzion-widget-roll-up-button");
        buttonElement = rollUpElements && rollUpElements.length > 0 ? rollUpElements[0] : null;
        buttonElement.addEventListener("click", (event) => {
          ReactDOM.unmountComponentAtNode(canvasElement);
          let target = event.target;
          WidgetDrillDownHelper.rollUpClicked(WidgetDrillDownHelper.findWidgetElement(target));
        });
      }
    } else {
      let rollUpElements = element.getElementsByClassName("oxzion-widget-roll-up-button");
      let buttonElement = rollUpElements && rollUpElements.length > 0 ? rollUpElements[0] : null;
      if (buttonElement) {
        buttonElement.remove();
      }
    }

    if (widgetGridType == "WidgetGridNew") {
      ReactDOM.render(<WidgetGridNew configuration={configuration} data={data} isDrillDownTable={isDrillDownTable} canvasElement={canvasElement} uuid={widgetUUId} filterParams={filterParams} core={core} totalcount={total_count} />, canvasElement);
    } else if (widgetGridType == "WidgetGrid") {
      ReactDOM.render(<WidgetGrid configuration={configuration} data={data} isDrillDownTable={isDrillDownTable} canvasElement={canvasElement} core={core} />, canvasElement);
    }
  }
}

export default WidgetRenderer;
