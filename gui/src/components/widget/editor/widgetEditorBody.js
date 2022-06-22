import WidgetRenderer from "../../OI/WidgetRenderer";
import AbstractEditor from "./abstractEditor";
import JSONHtmlForm from "./JSONtoHTMLForm";
import React from "react";
import ReactDOM from "react-dom";
import Swal from "sweetalert2";
import Select from "react-select";
import { Tabs, Tab, Overlay, Tooltip, Form, Row, Col, Button, Dropdown, Spinner } from "react-bootstrap";
import { array } from "prop-types";
var SINGLELEVEL = "singleLevel";
var MULTILEVEL = "multiLevel";
class WidgetEditorBody extends AbstractEditor {
  constructor(props) {
    super(props);
    console.log("widget body===>", this.props);
    this.type = props.type === "inline" || props.type === "html" ? "widget" : props.type;
    this.state.selectedTab = this.type;
    this.state.widgetType = this.type;
    // this.helper = this.core.make("oxzion/restClient");
    this.amChart = null;
    this.state.selectableWidgetOptions = props.selectableWidgetOptions;
    this.state.selectableDashboardOptions = props.selectableDashboardOptions;
    this.state.selectableAppOptions = props.selectableAppOptions;
    this.state.singleTarget = true;
    this.state.disabledTargetForm = false;
    this.state.targetTypeValue = "1";
    this.state.selectedJsonOption = null;
    this.state.isJsonLoading = false;
    this.ERRORS = {
      CHART_CONFIGURATION_NEEDED: "Chart configuration is needed",
      TABLE_CONFIGURATION_NEEDED: "Table configuration is needed",
      CHART_CONFIGURATION_INVALID_JSON: "Chart configuration JSON is invalid",
      TABLE_CONFIGURATION_INVALID_JSON: "Table configuration JSON is invalid",
      WIDGET_CONFIGURATION_INVALID_JSON: "Widget configuration JSON is invalid",
      QUERY_NEEDED: "Query should be selected",
      EXPRESSION_INVALID_JSON: "Expression JSON is invalid",
    };
    this.state.singleLimit = [];
    this.state.multiLimit = {};
    this.state.targetFields = [];
    this.state.targetType = [
      { label: "Single", value: "single" },
      { label: "Multiple", value: "multiple" },
    ];
    console.log(this.state.drillDownWidgetType);
    this.handleFormChange = this.handleFormChange.bind(this);
    this.state.optionData = [];
  }

  getTargetFieldList() {
    let targetColumn = this.props.widget.configuration.series;
    let targetFieldValue = this.props.widget.data;
    let targetFieldsCopy = [...this.state.targetFields];
    if (targetColumn) {
      targetColumn.map((item, index) => {
        targetFieldsCopy.push({
          label: item.dataFields.categoryX,
          value: item.dataFields.valueY,
        });
      });
      this.setState({ targetFields: targetFieldsCopy });
    }
    console.log(targetFieldsCopy);
  }

  configurationChanged = (evt) => {
    let thiz = this;
    let value = evt.target.value;
    this.setState((state) => {
      state.configuration = value;
      state.errors.configuration = "" === value ? thiz.ERRORS.CHART_CONFIGURATION_NEEDED : null;
      return state;
    });
    //IMPORTANT: Don't refresh chart preview when configurationChanged method is called.
    //           It is too much to update preview for every key stroke when the user is typing the configuration.
    //           Therefore chart preview is updated when the configuration field loses focus OR when the "chart" tab comes back to focus.
  };

  expressionBlurred = (evt) => {
    this.props.syncWidgetState("expression", this.state.expression, this.data);
    if (this.validateExpression()) {
      this.loadData(this.refreshQueryPreview());
    }
  };

  refreshWidgetPreview = () => {
    console.log("widget type====>", this.state.widgetType, this.data);
    let cardBody = document.querySelector("div#previewBox div.card-body");
    let errorMessage = null;
    let config = this.state.configuration;
    if ((this.state.widgetType === "table" || this.state.widgetType === "widget" || this.state.widgetType === "profile") && (!config || 0 === config.length)) {
      this.state.widgetType === "widget" ? (config = {}) : (errorMessage = this.ERRORS.TABLE_CONFIGURATION_NEEDED);
    } else {
      try {
        //Make sure chart configuratio is valid JSON
        config = this.state.configuration != "" ? JSON.parse(this.state.configuration) : "{}";
      } catch (jsonParseError) {
        console.error(jsonParseError);
        errorMessage = this.ERRORS.CHART_CONFIGURATION_INVALID_JSON;
      }
    }
    if (!errorMessage) {
      let previewElement = null;
      console.log("Preview element---->", "div#" + this.state.widgetType + "Preview");
      previewElement = document.querySelector("div#" + this.state.widgetType + "Preview");
      if (this.state.widgetType === "table" && previewElement) {
        //Remove and cleanup ReactJS rendered DOM nodes.
        ReactDOM.unmountComponentAtNode(previewElement);
        //Remove child nodes under previewElement.
        let children = previewElement.children;
        for (let i = 0; i < children.length; i++) {
          children[i].remove();
        }
      } else if (this.state.widgetType === "chart") {
        //Chart must be disposed (if exists) before repainting it.
        if (this.amChart) {
          this.amChart.dispose();
          this.amChart = null;
        }
      }
      previewElement.style.height = cardBody.offsetHeight - 40 + "px"; //-40px for border and margin around preview area.
      try {
        let props = {}; // Props is the property list to override things like widget title, footer etc.
        if (this.state.widgetType === "chart") {
          this.amChart = WidgetRenderer.renderAmCharts(previewElement, config, props, this.data);
        } else if (this.state.widgetType === "table") {
          previewElement.style.width = cardBody.offsetWidth - 40 + "px"; //-40px for border and margin around preview area.
          WidgetRenderer.renderTable(previewElement, config, this.data);
        } else if (this.state.widgetType === "profile") {
          WidgetRenderer.renderProfile(previewElement, config, undefined, this.data);
        } else if (this.state.widgetType === "widget") {
          WidgetRenderer.renderAggregateValue(previewElement, config, props, this.data);
        } else if (this.state.widgetType === "report") {
          WidgetRenderer.renderReport(previewElement, config, props, this.data);
        }
      } catch (renderError) {
        console.error(renderError);
        errorMessage = "" + renderError;
      }
    }
    this.setState((state) => {
      state.errors.configuration = state.readOnly ? null : errorMessage;
      return state;
    });
  };

  refreshQueryPreview = () => {
    let cardBody = document.querySelector("div#previewBox div.card-body");
    let textArea = document.querySelector("textarea#queryPreviewText");
    textArea.style.height = cardBody.offsetHeight - 40 + "px"; //-40px for border and margin around textarea.
    let value = "";
    if (this.data) {
      value = JSON.stringify(this.data, null, "    ");
    }
    textArea.value = value;
  };

  refreshViews = () => {
    if (this.state.selectedTab !== "") {
      this.refreshWidgetPreview();
    }
    let configuration = JSON.parse(this.state.configuration);
    let hasDrillDown = configuration && configuration["oxzion-meta"] && configuration["oxzion-meta"]["drillDown"] ? true : false;
    if (hasDrillDown) {
      this.initializeDrillDownValues(configuration);
    } else {
      this.setState({
        drillDownFilter: "",
        drillDownWidget: "",
        drillDownWidgetTitle: "",
        drillDownWidgetFooter: "",
        hasMaxDepth: false,
        drillDownMaxDepth: -1,
      });
    }
  };

  refreshDrillDownPreview = () => {
    let configuration = JSON.parse(this.state.configuration);
    let hasDrillDown = configuration && configuration["oxzion-meta"] && configuration["oxzion-meta"]["drillDown"] ? true : false;
    if (hasDrillDown) {
      this.initializeDrillDownValues(configuration);
    }
  };

  isConfigurationTabValid = (state, setErrorState = true) => {
    let isValid = true;
    if (this.state.widgetType === "chart" || this.state.widgetType === "table" || this.state.widgetType === "profile" || this.state.widgetType === "report") {
      let configuration = state.configuration;
      let errorMessage = null;
      if ("" === configuration) {
        isValid = false;
        errorMessage = this.ERRORS.TABLE_CONFIGURATION_NEEDED;
      } else {
        try {
          //Make sure table configuratio is valid JSON
          JSON.parse(configuration);
        } catch (jsonParseError) {
          isValid = false;
          console.error(jsonParseError);
          errorMessage = this.ERRORS.TABLE_CONFIGURATION_INVALID_JSON;
        }
      }
      if (setErrorState) {
        state.errors.configuration = state.readOnly ? null : errorMessage;
      }
    }
    return isValid;
  };

  isQueryTabValid = (state, setErrorState = true) => {
    let queryErrors = state.errors.queries;
    let queries = state.queries;
    let isValid = true;
    for (let i = 0; i < queries.length; i++) {
      if (queries[i].uuid === "") {
        if (setErrorState) {
          queryErrors[i] = state.readOnly ? null : this.ERRORS.QUERY_NEEDED;
        }
        isValid = false;
      }
    }
    return isValid;
  };

  isExpressionTabValid = (state, setErrorState = true) => {
    let isValid = true;
    let errorMessage = null;
    let expression = state.expression;
    if (expression) {
      try {
        //Make sure expression is valid JSON
        JSON.parse(expression);
      } catch (jsonParseError) {
        isValid = false;
        console.error(jsonParseError);
        errorMessage = this.ERRORS.EXPRESSION_INVALID_JSON;
      }
    }

    if (setErrorState) {
      state.errors.expression = errorMessage;
    }
    return isValid;
  };

  areAllFieldsValid = () => {
    function findInvalidTab(tabs) {
      let foundTab = null;
      tabs.forEach(function (tab) {
        let tabName = Object.keys(tab)[0];
        if (!tab[tabName]) {
          foundTab = tabName;
        }
      });
      return foundTab;
    }

    let isConfigurationTabValid = this.isConfigurationTabValid(this.state, false);
    let isQueryTabValid = this.isQueryTabValid(this.state, false);
    let isExpressionTabValid = this.isExpressionTabValid(this.state, false);
    let thiz = this;
    let switchToTab = null;
    switch (this.state.selectedTab) {
      case "chart":
      case "table":
        if (!isConfigurationTabValid) {
          this.setState((state) => {
            thiz.isConfigurationTabValid(state);
          });
        } else {
          switchToTab = findInvalidTab([{ query: isQueryTabValid }, { expression: isExpressionTabValid }]);
        }
        break;
      case "widget":
        if (!isConfigurationTabValid) {
          this.setState((state) => {
            thiz.isConfigurationTabValid(state);
          });
        } else {
          switchToTab = findInvalidTab([{ widget: isConfigurationTabValid }, { expression: isExpressionTabValid }]);
        }
        break;

      case "query":
        if (!isQueryTabValid) {
          this.setState((state) => {
            thiz.isQueryTabValid(state);
          });
        } else {
          switchToTab = findInvalidTab([{ expression: isExpressionTabValid }, { [this.state.widgetType]: isConfigurationTabValid }]);
        }
        break;
      case "expression":
        if (!isExpressionTabValid) {
          this.setState((state) => {
            thiz.isExpressionTabValid(state);
          });
        } else {
          switchToTab = findInvalidTab([{ [this.state.widgetType]: isConfigurationTabValid }, { query: isQueryTabValid }]);
        }
        break;
      case "profile":
        if (!isConfigurationTabValid) {
          this.setState((state) => {
            thiz.isConfigurationTabValid(state);
          });
        } else {
          switchToTab = findInvalidTab([{ profile: isConfigurationTabValid }, { expression: isExpressionTabValid }]);
        }
        break;
      case "report":
        if (!isConfigurationTabValid) {
          this.setState((state) => {
            thiz.isConfigurationTabValid(state);
          });
        } else {
          switchToTab = findInvalidTab([{ report: isConfigurationTabValid }, { expression: isExpressionTabValid }]);
        }
        break;
    }
    if (switchToTab) {
      this.configurationTabSelected(switchToTab, null);
    }
    return isConfigurationTabValid && isQueryTabValid && isExpressionTabValid;
  };

  configurationTabSelected = (eventKey, event) => {
    if (eventKey != "chart") {
      if (this.amChart) {
        this.amChart.dispose();
        this.amChart = null;
      }
    }
    let cardBody = null;
    let textArea = null;
    switch (eventKey) {
      case "chart":
      case "table":
      case "widget":
      case "profile":
      case "report":
        cardBody = document.querySelector("div#propertyBox div.card-body");
        textArea = document.querySelector("textarea#configuration");
        // textArea.style.height = (cardBody !== null) ? (cardBody.offsetHeight - 80) + 'px' : "500px"; //-80px for border and margin around textarea.
        // console.log(textArea.style.height)
        break;
      case "expression":
        cardBody = document.querySelector("div#propertyBox div.card-body");
        textArea = document.querySelector("textarea#expression");
        // textArea.style.height = (cardBody.offsetHeight - 80) + 'px'; //-80px for border and margin around textarea.
        break;
      case "template":
        this.getTemplateSelection();
        break;
    }
    let thiz = this;
    this.clearAllErrors().then(function () {
      thiz.setState(
        (state) => {
          state.selectedTab = eventKey;
          switch (eventKey) {
            case "chart":
            case "table":
            case "widget":
            case "profile":
            case "report":
              thiz.isConfigurationTabValid(state);
              break;
            case "query":
              thiz.isQueryTabValid(state);
              break;
            case "expression":
              thiz.isExpressionTabValid(state);
              break;
          }
          return state;
        },
        () => {
          switch (eventKey) {
            case "chart":
            case "table":
            case "widget":
            case "profile":
            case "report":
            case "jsGrid":
            case "HTML":
              thiz.refreshWidgetPreview();
              break;
            case "query":
            case "expression":
              thiz.refreshQueryPreview();
              break;
          }
        }
      );
    });
  };

  componentWillUnmount() {
    if (this.amChart) {
      this.amChart.dispose();
      this.amChart = null;
    }
  }

  componentDidMount() {
    // if (this.state.widgetType == 'report') this.setState({ configuration: '{"report":"custom"}' })
    let thiz = this;
    this.loadQueries(function () {
      thiz.configurationTabSelected(thiz.type);
    });
    let widgetUuid = this.props.widget.uuid;
    this.getTargetData(widgetUuid);
    this.props.widget.configuration && this.getTargetFieldList();

    // if(this.state.drillDownWidgetType) {
    //     this.setState({ drillDownFilter: 'dashboar'});
    // }
    // this.setState((state) => {
    //     state.drillDownWidgetType.value = drillDownWidgetType.value ? drillDownWidgetType.value  : "dashboard";
    //     return state;
    // });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.widget.type != this.props.widget.type) {
      console.log("selectedOption", this.state.selectedJsonOption);
      this.setState({ isJsonLoading: true });
      setTimeout(() => {
        this.setState({
          widgetVisualType: this.props.widget.type,
          selectedTab: this.props.type != "html" ? this.props.type : "widget",
          widgetType: this.props.type != "html" ? this.props.type : "widget",
          configuration: this.props.widget.type === "report" ? '{"report":"custom"}' : null,
          isJsonLoading: false,
        });
      }, 1000);
    }
  }

  async getTargetData(widgetUuid) {
    let that = this;
    let data = {};
    window.postDataRequest(`analytics/target/getwidgettarget/widgetId/` + widgetUuid).then(function (response) {
      data = response["data"];
      let multiLimit = {};
      for (var i in data) {
        if (data[i]["type"] == "1") {
          that.setState({ singleLimit: data[i] }, () => {
            console.log(that.state.singleLimit);
          });
        } else {
          multiLimit = that.state.multiLimit;
          multiLimit[data[i]["group_value"]] = {};
          multiLimit[data[i]["group_value"]] = data[i];
          that.setState({ multiLimit: multiLimit }, () => {
            console.log(that.state.multiLimit);
          });
        }
      }
    });
  }

  refreshPreview() {
    if (this.state.selectedTab === "chart" || this.state.selectedTab === "table" || this.state.selectedTab === "widget" || this.state.selectedTab === "inline" || this.state.selectedTab === "html" || this.state.selectedTab === "profile" || this.state.selectedTab === "report") {
      //refresh preview
      this.refreshWidgetPreview();
    } else if (this.state.selectedTab === "query") {
      this.refreshQueryPreview();
    } else if (this.state.selectedTab === "expression") {
      this.expressionBlurred();
    }
  }

  handleTargetSelectChange = (e) => {
    let targetType = event.target.value;
    this.setState({ targetTypeValue: targetType });
    let targetValue = true;
    if (targetType === "1") {
      targetValue = true;
    } else {
      targetValue = false;
    }
    this.setState({
      singleTarget: targetValue,
    });
  };

  applyTarget = () => {
    let errors = this.validateTargetInput();
    if (Object.keys(errors.target[SINGLELEVEL]).length > 0 || Object.keys(errors.target[SINGLELEVEL]).length > 0) {
      //rdonot proceed if error exists
      return;
    }
    let target = "";
    let targetFieldName = this.state.targetFields[0] ? this.state.targetFields[0].label : "aggregate";
    let targetVal;
    if (!this.state.singleTarget) {
      let multiLimit = this.state.multiLimit;
      for (var i in multiLimit) {
        let params = {
          type: this.state.targetTypeValue,
          widgetUuid: this.props.widget.uuid,
        };
        let targetParams = {
          group_key: targetFieldName,
          widget_uuid: this.props.widget.uuid,
          trigger_query_id: "",
        };
        let val = multiLimit[i];
        params = { ...params, ...val };
        params["version"] = params["version"] ? params["version"] : 1;
        if (params["target_id"]) {
          //Check if the target already exist
          params["id"] = params["target_id"];
          params["uuid"] = params["target_uuid"];
          targetParams["target_id"] = params["target_id"];
          targetParams["widget_id"] = params["widget_id"];
          targetParams["group_value"] = params["group_value"];
          window.postDataRequest("analytics/target/" + params["uuid"], params, "put").then(function (response) {
            console.log(response);
            window.postDataRequest("analytics/target/createwidgettarget", targetParams, "put");
          });
        } else {
          // Create a new target value
          target = window.postDataRequest("analytics/target", params, "post").then(function (response) {
            console.log(response);
            targetParams["target_uuid"] = response["uuid"];
            targetParams["group_value"] = params["group_value"];
            window.postDataRequest("analytics/target/createwidgettarget", targetParams, "post");
          });
        }
      }
    } else {
      let singleLimit = this.state.singleLimit;
      let params = {
        type: this.state.targetTypeValue,
        version: 1,
        widgetUuid: this.props.widget.uuid,
        id: this.state.singleLimit.target_id,
      };
      let targetParams = {
        group_key: targetFieldName,
        widget_uuid: this.props.widget.uuid,
        trigger_query_id: "",
      };
      for (var i in singleLimit) {
        params[i] = singleLimit[i];
      }
      if (this.state.singleLimit.target_id) {
        window.postDataRequest("analytics/target/" + this.state.singleLimit.target_uuid, params, "put").then((response) => {
          targetParams["target_uuid"] = this.state.singleLimit.target_id;
          console.log(response);
          window.postDataRequest("analytics/target/createwidgettarget", targetParams, "put");
        });
      } else {
        target = window.postDataRequest("analytics/target", params, "post").then(function (response) {
          targetParams["target_uuid"] = response["uuid"];
          targetParams["group_value"] = params["group_value"];
          console.log(response);
          window.postDataRequest("analytics/target/createwidgettarget", targetParams, "post");
        });
      }
    }
    this.getTargetData(this.props.widget.uuid);
    this.setState({ disabledTargetForm: true });
  };

  async saveTargetData(targetParams) {
    targetVal = window.postDataRequest("analytics/target/createwidgettarget", targetParams, "post").then(function (response) {
      console.log(response);
    });
    return targetVal;
  }

  handleTargetInputChange = (e) => {
    let errors = this.validateTargetInput(e);
    let multiLimit = this.state.multiLimit;
    if (!this.state.singleTarget) {
      if (this.state.multiLimit[e.target.name]) {
        multiLimit = this.state.multiLimit;
        multiLimit[e.target.name][e.target.id] = e.target.value;
      } else {
        multiLimit[e.target.name] = {};
        multiLimit[e.target.name][e.target.id] = e.target.value;
        multiLimit[e.target.name]["group_name"] = this.state.targetFields[0].label;
        multiLimit[e.target.name]["group_value"] = e.target.name;
      }
      console.log(multiLimit);
      this.setState({ multiLimit: multiLimit, errors: errors });
      console.log(this.state.multiLimit);
    } else if (this.state.singleTarget) {
      let singleLimit = this.state.singleLimit;
      singleLimit[e.target.name] = e.target.value;
      this.setState({ singleLimit: singleLimit, errors: errors });
    }
  };

  validateTargetInput = (e) => {
    let errors = JSON.parse(JSON.stringify(this.state.errors));
    if (e) {
      const { name, value, id } = e.target;
      let limit = id == "" ? SINGLELEVEL : MULTILEVEL;
      if (value != "") {
        var regex_condition = /^[0-9]+$/;
        if (limit == SINGLELEVEL) {
          !regex_condition.test(value) ? (errors["target"][SINGLELEVEL][name] = "*Please enter decimal values") : delete errors["target"][SINGLELEVEL][name];
        } else {
          !regex_condition.test(value) ? (errors["target"][MULTILEVEL][`${name}_${id}`] = "*Please enter decimal values") : delete errors["target"][MULTILEVEL][`${name}_${id}`];
        }
      } else {
        if (limit == SINGLELEVEL) {
          delete errors["target"][limit][name];
        } else {
          delete errors["target"][limit][`${name}_${id}`];
        }
      }
      return errors;
    } else {
      //checking if all fields are entered in single target
      this.state.singleLimit.red_limit == "" && (errors["target"][SINGLELEVEL]["red_limit"] = "*Field cannot be empty");
      this.state.singleLimit.yellow_limit == "" && (errors["target"][SINGLELEVEL]["yellow_limit"] = "*Field cannot be empty");
      this.state.singleLimit.green_limit == "" && (errors["target"][SINGLELEVEL]["green_limit"] = "*Field cannot be empty");
      //checking if all fields are entered in multiple target
      Array.isArray(this.props.widget.data) &&
        this.props.widget.data.map((item, index) => {
          let value = this.state.multiLimit[this.state.targetFields[0].label + "_" + index];
          if (value == undefined || (value != undefined && value.red_limit == "")) {
            errors.target[MULTILEVEL][`${this.state.targetFields[0].label}_${index}_red_limit`] = "*Field cannot be empty";
          }
          if (value == undefined || (value != undefined && value.green_limit == "")) {
            errors.target[MULTILEVEL][`${this.state.targetFields[0].label}_${index}_green_limit`] = "*Field cannot be empty";
          }
          if (value == undefined || (value != undefined && value.yellow_limit == "")) {
            errors.target[MULTILEVEL][`${this.state.targetFields[0].label}_${index}_yellow_limit`] = "*Field cannot be empty";
          }
        });
      this.setState({ errors: errors });
      return errors;
    }
  };

  getTemplateListOptions = (templateList) => {
    let templateOptions = [];
    templateList.map((temp) => templateOptions.push({ value: temp, label: temp.split(".")[0] }));
    return templateOptions;
  };
  handleDropDown = (key) => {
    this.setState({ selectedJsonOption: key.label });
    var json = require(`../../../public/json/${key.value}.json`);
    this.setState({ configuration: JSON.stringify(json, undefined, 3) }, this.refreshWidgetPreview());
  };

  handleFormChange(keys, evt) {
    const updatedValue = evt.target.value;
    let configurationChart = { ...JSON.parse(this.state.configuration) };

    let result = (keys || []).reduce((result, targetKey, index) => {
      if (index === keys.length - 1) {
        result[targetKey] = updatedValue;
        return result[targetKey];
      }

      return result[targetKey] || {};
    }, configurationChart);

    this.setState((state) => {
      state.configuration = JSON.stringify(configurationChart, null, "    ");
      state.errors.configuration = "" === configurationChart ? thiz.ERRORS.CHART_CONFIGURATION_NEEDED : null;
      return state;
    });
  }
  getOptions() {
    console.log("calling", this.state.selectedOption);
    var options = [];
    if (this.widgetJson[this.state.widgetVisualType] != undefined) {
      this.widgetJson[this.state.widgetVisualType].map((item) => options.push({ label: item.name, value: item.value }));
    }

    return options;
  }

  render() {
    let thiz = this;
    let parentKeys = [];
    const { widgetVisualType, isTemplateLoading, templateList, selectedTemplate } = this.state;

    function getFormChart() {
      try {
        return <JSONHtmlForm data={{ ...JSON.parse(thiz.state.configuration) }} handleFormChange={thiz.handleFormChange} stack={parentKeys} />;
      } catch (error) {
        console.log(error);
        return <div>Error in JSON</div>;
      }
    }

    function getQuerySelectOptoins(keyPrefix) {
      let i = 0;
      let options = [
        <option value='' key={keyPrefix + "00000000-0000-0000-0000-000000000000"}>
          -Select query-
        </option>,
      ];
      thiz.queryList.map((item, index) => {
        // options.push(<option key={keyPrefix + item.uuid} value={item.uuid}>{item.name}</option>);
        options.push({ value: item.uuid, label: item.name });
      });
      return options;
    }

    function getQuerySelections() {
      console.log("calling.. query..");
      let querySelections = [];
      let count = thiz.state.queries.length;
      if (0 === count) {
        thiz.addQueryToGivenState(thiz.state, null); //Render at least one query selection box.
        count = 1;
      }
      for (let i = 0; i < count; i++) {
        querySelections.push(
          <div className='form-group row' key={"qs-00-" + i}>
            <div className='col-7' key={"qs-01-" + i}>
              <Select
                key={"qs-02-" + i}
                id={"query" + i}
                name={"query" + i}
                ref={"query" + i}
                onChange={(e) => {
                  thiz.querySelectionChanged(e, i);
                }}
                isDisabled={thiz.state.readOnly}
                value={thiz.state.queries[i] ? getQuerySelectOptoins("qs-03-" + i).filter((option) => option.value == thiz.state.queries[i]["uuid"]) : ""}
                options={getQuerySelectOptoins("qs-03-" + i)}
              />
              <Overlay id={"query-overlay" + i} target={thiz.refs["query" + i]} show={thiz.state.errors.queries[i] != null} placement='right'>
                {(props) => (
                  <Tooltip id={"query-" + i + "-tooltip"} {...props} className='error-tooltip'>
                    {thiz.state.errors.queries[i]}
                  </Tooltip>
                )}
              </Overlay>
            </div>
            <div className='dash-manager-buttons'>
              {/* <div className="col-1" key={'qs-04-' + i}> */}
              <button type='button' className='btn btn-primary widget-action-btn' title='Apply filter to query' onClick={() => thiz.applyFilterToQuery(i)} key={"qs-05-" + i} disabled={thiz.state.queries[i] ? (thiz.state.queries[i].uuid ? thiz.state.readOnly : true) : true}>
                <span className='fa fa-filter' aria-hidden='true' key={"qs-06-" + i}></span>
              </button>
              {/* </div> */}
              {/* <div className="col-1" key={'qs-07-' + i}> */}
              <button type='button' className='btn btn-primary widget-action-btn' title='Apply grouping to query' onClick={() => thiz.applyGroupingToQuery(i)} key={"qs-08-" + i} disabled={thiz.state.queries[i] ? (thiz.state.queries[i].uuid ? thiz.state.readOnly : true) : true}>
                <span className='fa fa-users' aria-hidden='true' key={"qs-09-" + i}></span>
              </button>
              {/* </div> */}
              {/* <div className="col-1" key={'qs-10-' + i}> */}
              <button type='button' className='btn btn-primary widget-action-btn' title='Sort query result' onClick={() => thiz.applySortingToQuery(i)} key={"qs-11-" + i} disabled={thiz.state.queries[i] ? (thiz.state.queries[i].uuid ? thiz.state.readOnly : true) : true}>
                <span className='fa fa-sort' aria-hidden='true' key={"qs-12-" + i}></span>
              </button>
              {/* </div> */}
              {
                thiz.state.queries.length > 1 && (
                  // <div className="col-1" key={'qs-13-' + i}>
                  <button type='button' className='btn btn-primary widget-action-btn' title='Delete query' onClick={() => thiz.deleteQuery(i)} key={"qs-14-" + i} disabled={thiz.state.readOnly}>
                    <span className='fa fa-minus' aria-hidden='true' key={"qs-15-" + i}></span>
                  </button>
                )
                // </div>
              }
            </div>
          </div>
        );
      }
      return querySelections;
    }

    function capitalizeFirstLetter(input) {
      var string = input;
      return string[0].toUpperCase() + string.slice(1);
    }

    const DropdownComponent = <Select options={this.getOptions()} onChange={(e) => this.handleDropDown(e)} defaultValue={this.state.selectedJsonOption ? this.state.selectedJsonOption : ""}></Select>;
    const SpinnerComponent = (
      <div style={{ marginLeft: "50%", marginTop: "35%" }}>
        <Spinner animation='border' role='status' size='sm' style={{ marginRight: "50%" }}></Spinner>
      </div>
    );

    return (
      <>
        <div className='form-group col'>
          <div className='card' id='propertyBox'>
            <div className='card-header'>Configuration</div>
            <div className='card-body'>
              <div className='form-group row' style={{ marginBottom: "0px" }}>
                {this.state.widgetType == "report" ? (
                  <Tabs activeKey={this.state.selectedTab} onSelect={this.configurationTabSelected}>
                    <Tab eventKey={this.state.widgetType} title={capitalizeFirstLetter(this.state.widgetType)}>
                      <div className='form-group row' style={{ marginLeft: "0px", marginRight: "0px" }}>
                        <div className='col-12 no-left-padding no-right-padding'>
                          <textarea id='report' name='report' ref='report' className='form-control form-control-sm' style={{ fontFamily: "Monospace" }} value={this.state.configuration} onChange={this.configurationChanged} disabled={this.state.readOnly} />
                        </div>
                      </div>
                    </Tab>
                    <Tab eventKey='query' title='Query'>
                      <br />
                      {getQuerySelections()}
                      <div className='col-1 dash-manager-buttons' style={{ paddingLeft: "0px", float: "left" }}>
                        <button type='button' className='btn btn-primary widget-action-btn add-query-button' title='Add query' onClick={() => this.addQuery()} disabled={this.state.readOnly}>
                          <span className='fa fa-plus' aria-hidden='true'></span>
                        </button>
                      </div>
                    </Tab>
                  </Tabs>
                ) : (
                  <Tabs activeKey={this.state.selectedTab} onSelect={this.configurationTabSelected}>
                    <Tab eventKey={this.state.widgetType} title={capitalizeFirstLetter(this.state.widgetType)}>
                      {!this.state.isJsonLoading ? (
                        this.state.widgetType != "widget" ? (
                          <div className='form-group row' style={{ marginLeft: "0px", marginRight: "0px" }}>
                            <div className='col-12 no-left-padding no-right-padding'>
                              {!this.state.readOnly && (
                                <div
                                  style={{
                                    padding: "5px 5px 5px 0px",
                                    maxWidth: "300px",
                                  }}>
                                  {DropdownComponent}
                                </div>
                              )}
                              {this.state.configuration != null ? (
                                !this.state.readOnly ? (
                                  <>
                                    <Tabs defaultActiveKey='form'>
                                      <Tab eventKey='form' title='Form'>
                                        <Form
                                          style={{
                                            border: "1px solid lightgray",
                                            overflowY: "scroll",
                                            height: "340px",
                                          }}>
                                          {getFormChart()}
                                        </Form>
                                      </Tab>
                                      <Tab eventKey='json' title='Json'>
                                        <Form.Control
                                          as='textarea'
                                          rows='10'
                                          name='chartConfiguration'
                                          value={this.state.configuration}
                                          onChange={this.configurationChanged}
                                          onBlur={() => {
                                            this.props.syncWidgetState("configuration", this.state.configuration, this.data);
                                            this.refreshWidgetPreview();
                                          }}
                                          disabled={this.state.readOnly}
                                        />
                                      </Tab>
                                    </Tabs>
                                  </>
                                ) : (
                                  <Form.Control
                                    as='textarea'
                                    rows='10'
                                    name='chartConfiguration'
                                    value={this.state.configuration}
                                    onChange={this.configurationChanged}
                                    onBlur={() => {
                                      this.props.syncWidgetState("configuration", this.state.configuration, this.data);
                                      this.refreshWidgetPreview();
                                    }}
                                    disabled={this.state.readOnly}
                                  />
                                )
                              ) : null}
                            </div>
                          </div>
                        ) : (
                          <div className='form-group row' style={{ marginLeft: "0px", marginRight: "0px" }}>
                            <div className='col-12 no-left-padding no-right-padding'>
                              <textarea
                                id='configuration'
                                name='configuration'
                                ref='configuration'
                                className='form-control form-control-sm'
                                style={{ fontFamily: "Monospace" }}
                                onChange={this.configurationChanged}
                                value={this.state.configuration}
                                onBlur={() => {
                                  this.props.syncWidgetState("configuration", this.state.configuration, this.data);
                                  this.refreshWidgetPreview();
                                }}
                                disabled={this.state.readOnly}
                              />
                              <Overlay id='configuration-overlay' target={this.refs.configuration} show={this.state.errors.configuration != null} placement='top'>
                                {(props) => (
                                  <Tooltip id='configuration-tooltip' {...props} className='error-tooltip'>
                                    {this.state.errors.configuration}
                                  </Tooltip>
                                )}
                              </Overlay>
                            </div>
                          </div>
                        )
                      ) : (
                        <>{SpinnerComponent}</>
                      )}
                    </Tab>
                    <Tab eventKey='query' title='Query'>
                      <br />
                      {getQuerySelections()}
                      <div className='col-1 dash-manager-buttons' style={{ paddingLeft: "0px", float: "left" }}>
                        <button type='button' className='btn btn-primary widget-action-btn add-query-button' title='Add query' onClick={() => this.addQuery()} disabled={this.state.readOnly}>
                          <span className='fa fa-plus' aria-hidden='true'></span>
                        </button>
                      </div>
                    </Tab>
                    <Tab eventKey='expression' title='Expression'>
                      <div className='form-group row' style={{ marginLeft: "0px", marginRight: "0px" }}>
                        <div className='col-12 no-left-padding no-right-padding'>
                          <textarea id='expression' name='expression' ref='expression' className='form-control form-control-sm' style={{ fontFamily: "Monospace" }} onChange={this.expressionChanged} value={this.state.expression} onBlur={this.expressionBlurred} disabled={this.state.readOnly} />
                          <Overlay id='expression-overlay' target={this.refs.expression} show={this.state.errors.expression != null} placement='top'>
                            {(props) => (
                              <Tooltip id='expression-tooltip' {...props} className='error-tooltip'>
                                {this.state.errors.expression}
                              </Tooltip>
                            )}
                          </Overlay>
                        </div>
                      </div>
                    </Tab>
                    <Tab eventKey='drilldown' title='Drill Down'>
                      <div className='drilldown-div'>
                        <Form.Group as={Row}>
                          <Form.Label column lg='3'>
                            Filter
                          </Form.Label>
                          <Col lg='9'>
                            <Form.Control as='textarea' name='drillDownFilter' onChange={(e) => this.handleDrillDownInputChange(e)} value={this.state.drillDownFilter} disabled={this.state.readOnly} />
                            <Form.Text className=' errorMsg'>{this.state.errors.drillDown["drillDownFilter"]}</Form.Text>
                          </Col>
                        </Form.Group>
                        <Form.Group as={Row}>
                          <Form.Label column md='3' lg='3'>
                            Widget
                          </Form.Label>
                          <Col md='3' lg='3'>
                            <Select placeholder='Type' name='drillDownWidgetType' id='drillDownWidgetType' onChange={(e) => this.handleSelect(e, "drillDownWidgetType")} value={this.state.drillDownWidgetType ? this.state.drillDownWidgetType : ""} options={this.widgetTypes} isDisabled={this.state.readOnly} />
                          </Col>
                          <Col md='3' lg='6'>
                            <Select
                              placeholder={this.state.drillDownWidgetType.value == "dashboard" ? "Choose Dashboard" : this.state.drillDownWidgetType.value == "file" ? "Choose App" : "Choose Widget"}
                              name='drillDownWidget'
                              id='drillDownWidget'
                              isDisabled={this.state.readOnly}
                              onChange={(e) => this.handleSelect(e, "drillDownWidget")}
                              value={this.state.drillDownWidgetType.value == "dashboard" ? this.props.selectableDashboardOptions.filter((option) => option.value == this.state.drillDownWidget) : this.state.drillDownWidgetType.value == "file" ? this.props.selectableAppOptions.filter((option) => option.value == this.state.drillDownWidget) : this.props.selectableWidgetOptions.filter((option) => option.value == this.state.drillDownWidget)}
                              options={this.state.drillDownWidgetType.value == "dashboard" ? this.props.selectableDashboardOptions : this.state.drillDownWidgetType.value == "file" ? this.props.selectableAppOptions : this.props.selectableWidgetOptions}
                            />
                            <Form.Text className='errorMsg'>{this.state.errors.drillDown["drillDownWidget"]}</Form.Text>
                          </Col>
                        </Form.Group>
                        {this.state.drillDownWidgetType.value == "dashboard" && (
                          <Form.Group as={Row}>
                            <Form.Label column lg='3'>
                              Dashboard Header
                            </Form.Label>
                            <Col lg='9'>
                              <Form.Control type='text' name='drillDownDashboardTitle' onChange={(e) => this.handleDrillDownInputChange(e)} value={this.state.drillDownDashboardTitle || ""} disabled={this.state.readOnly} />
                            </Col>
                          </Form.Group>
                        )}
                        <Form.Group as={Row}>
                          <Form.Label column lg='3'>
                            Title
                          </Form.Label>
                          <Col lg='9'>
                            <Form.Control type='text' name='drillDownWidgetTitle' onChange={(e) => this.handleDrillDownInputChange(e)} value={this.state.drillDownWidgetTitle || ""} disabled={this.state.readOnly} />
                          </Col>
                        </Form.Group>
                        <Form.Group as={Row}>
                          <Form.Label column lg='3'>
                            Footer
                          </Form.Label>
                          <Col lg='9'>
                            <Form.Control type='text' name='drillDownWidgetFooter' onChange={(e) => this.handleDrillDownInputChange(e)} value={this.state.drillDownWidgetFooter || ""} disabled={this.state.readOnly} />
                          </Col>
                        </Form.Group>
                        {this.state.hasMaxDepth && (
                          <Form.Group as={Row}>
                            <Form.Label column lg='3'>
                              Max Depth
                            </Form.Label>
                            <Col lg='9'>
                              <Form.Control as='select' name='drillDownMaxDepth' value={this.state.drillDownMaxDepth ? this.state.drillDownMaxDepth : -1} onChange={(e) => this.handleDrillDownInputChange(e)} disabled={this.state.readOnly}>
                                <option key='-1' value={-1}></option>
                                <option key='2' value={2}>
                                  2
                                </option>
                                <option key='3' value={3}>
                                  3
                                </option>
                                <option key='4' value={4}>
                                  4
                                </option>
                              </Form.Control>
                              <Form.Text className='errorMsg'>{this.state.errors.drillDown["drillDownMaxDepth"]}</Form.Text>
                            </Col>
                          </Form.Group>
                        )}
                        <Button
                          variant='primary'
                          type='button'
                          disabled={this.state.readOnly}
                          onClick={() => {
                            this.ApplyDrillDown(this.state.widgetType);
                          }}>
                          Apply DrillDown
                        </Button>
                      </div>
                    </Tab>
                    {this.props.widget && this.props.widget.configuration && (this.props.widget.configuration.series || this.props.widget.type == "inline") && (
                      <Tab eventKey='target_sla' title='Target'>
                        <div className='form-group row' style={{ marginTop: "10px", marginRight: "0px" }}>
                          <div className='col-12'>
                            <Form.Group as={Row}>
                              <Form.Label column lg='3'>
                                Target Type
                              </Form.Label>
                              <Col lg='9'>
                                <Form.Control as='select' placeholder='Choose Target Type' name='target_type' id='target_type' disabled={this.state.readOnly || this.state.disabledTargetForm} onChange={(e) => this.handleTargetSelectChange(e)} value={this.state.targetTypeValue} options={this.state.targetType}>
                                  {/* <option key="-1" value={-1}>Choose Target Type</option> */}
                                  <option key='1' value='1'>
                                    Single
                                  </option>
                                  <option key='2' value='2'>
                                    Multiple
                                  </option>
                                </Form.Control>
                              </Col>
                            </Form.Group>

                            {!this.state.readOnly && this.state.singleTarget && (
                              <>
                                <Form.Group as={Row}>
                                  <Form.Label column lg='3'>
                                    Red Limit
                                  </Form.Label>
                                  <Col lg='4'>
                                    <Form.Control placeholder={"Red Limit"} type='text' name='red_limit' disabled={this.state.readOnly || this.state.disabledTargetForm} value={this.state.singleLimit.red_limit || ""} onChange={(e) => this.handleTargetInputChange(e)} />
                                    <Form.Text className='errorMsg'>{this.state.errors.target[SINGLELEVEL]["red_limit"]}</Form.Text>
                                  </Col>
                                  <Col lg='4'>
                                    <Form.Control placeholder={"WorkflowId"} type='text' name='red_workflow_id' disabled={this.state.readOnly || this.state.disabledTargetForm} value={this.state.singleLimit.red_workflow_id} onChange={(e) => this.handleTargetInputChange(e)} />
                                  </Col>
                                </Form.Group>
                                <Form.Group as={Row}>
                                  <Form.Label column lg='3'>
                                    Yellow Limit
                                  </Form.Label>
                                  <Col lg='4'>
                                    <Form.Control placeholder={"Yellow Limit"} type='text' name='yellow_limit' disabled={this.state.readOnly || this.state.disabledTargetForm} value={this.state.singleLimit.yellow_limit || ""} onChange={(e) => this.handleTargetInputChange(e)} />
                                    <Form.Text className='errorMsg'>{this.state.errors.target[SINGLELEVEL]["yellow_limit"]}</Form.Text>
                                  </Col>
                                  <Col lg='4'>
                                    <Form.Control placeholder={"WorkflowId"} type='text' name='yellow_workflow_id' disabled={this.state.readOnly || this.state.disabledTargetForm} value={this.state.singleLimit.yellow_workflow_id} onChange={(e) => this.handleTargetInputChange(e)} />
                                  </Col>
                                </Form.Group>
                                <Form.Group as={Row}>
                                  <Form.Label column lg='3'>
                                    Green Limit
                                  </Form.Label>
                                  <Col lg='4'>
                                    <Form.Control placeholder={"Green Limit"} type='text' name='green_limit' disabled={this.state.readOnly || this.state.disabledTargetForm} value={this.state.singleLimit.green_limit || ""} onChange={(e) => this.handleTargetInputChange(e)} />
                                    <Form.Text className='errorMsg'>{this.state.errors.target[SINGLELEVEL]["green_limit"]}</Form.Text>
                                  </Col>
                                  <Col lg='4'>
                                    <Form.Control placeholder={"WorkflowId"} type='text' name='green_workflow_id' disabled={this.state.readOnly || this.state.disabledTargetForm} value={this.state.singleLimit.green_workflow_id} onChange={(e) => this.handleTargetInputChange(e)} />
                                  </Col>
                                </Form.Group>
                              </>
                            )}
                            {!this.state.readOnly && !this.state.singleTarget && !(this.props.widget.type == "inline") && (
                              // this.props.widget.data
                              <div className='col-12'>
                                {this.props.widget.data.map((item, index) => {
                                  {
                                    /* return (<div key={item[this.state.targetFields[0].label]}>{item[this.state.targetFields[0].label]}</div>) */
                                  }
                                  return (
                                    <>
                                      <div>{item[this.state.targetFields[0].label]}</div>
                                      <Form.Group
                                        as={Row}
                                        style={{
                                          marginLeft: "5px",
                                          fontSize: "14px",
                                        }}>
                                        <Form.Label column lg='3'>
                                          Red Limit
                                        </Form.Label>
                                        <Col lg='4'>
                                          <Form.Control
                                            placeholder={"Red Limit"}
                                            type='text'
                                            name={this.state.targetFields[0].label + "_" + index}
                                            id={"red_limit"}
                                            disabled={this.state.readOnly}
                                            value={this.state.multiLimit[this.state.targetFields[0].label + "_" + index] ? this.state.multiLimit[this.state.targetFields[0].label + "_" + index].red_limit : ""}
                                            onChange={(e) => this.handleTargetInputChange(e)}
                                            style={{
                                              height: "25px",
                                              fontSize: "14px",
                                              margin: "0px",
                                            }}
                                          />
                                          <Form.Text className='errorMsg'>{this.state.errors.target[MULTILEVEL][`${this.state.targetFields[0].label}_${index}_red_limit`]}</Form.Text>
                                        </Col>
                                        <Col lg='4'>
                                          <Form.Control
                                            placeholder={"WorkflowId"}
                                            type='text'
                                            name={this.state.targetFields[0].label + "_" + index}
                                            id={"red_workflow_id"}
                                            disabled={this.state.readOnly}
                                            value={this.state.multiLimit[this.state.targetFields[0].label + "_" + index] ? this.state.multiLimit[this.state.targetFields[0].label + "_" + index].red_workflow_id : ""}
                                            onChange={(e) => this.handleTargetInputChange(e)}
                                            style={{
                                              height: "25px",
                                              fontSize: "14px",
                                              margin: "0px",
                                            }}
                                          />
                                        </Col>

                                        <Form.Label column lg='3'>
                                          Yellow Limit
                                        </Form.Label>
                                        <Col lg='4'>
                                          <Form.Control
                                            placeholder={"Yellow Limit"}
                                            type='text'
                                            name={this.state.targetFields[0].label + "_" + index}
                                            id={"yellow_limit"}
                                            disabled={this.state.readOnly}
                                            value={this.state.multiLimit[this.state.targetFields[0].label + "_" + index] ? this.state.multiLimit[this.state.targetFields[0].label + "_" + index].yellow_limit : ""}
                                            onChange={(e) => this.handleTargetInputChange(e)}
                                            style={{
                                              height: "25px",
                                              fontSize: "14px",
                                              margin: "0px",
                                            }}
                                          />
                                          <Form.Text className='errorMsg'>{this.state.errors.target[MULTILEVEL][`${this.state.targetFields[0].label}_${index}_yellow_limit`]}</Form.Text>
                                        </Col>
                                        <Col lg='4'>
                                          <Form.Control
                                            placeholder={"WorkflowId"}
                                            type='text'
                                            name={this.state.targetFields[0].label + "_" + index}
                                            id={"yellow_workflow_id"}
                                            disabled={this.state.readOnly}
                                            value={this.state.multiLimit[this.state.targetFields[0].label + "_" + index] ? this.state.multiLimit[this.state.targetFields[0].label + "_" + index].yellow_workflow_id : ""}
                                            onChange={(e) => this.handleTargetInputChange(e)}
                                            style={{
                                              height: "25px",
                                              fontSize: "14px",
                                              margin: "0px",
                                            }}
                                          />
                                        </Col>

                                        <Form.Label column lg='3'>
                                          Green Limit
                                        </Form.Label>
                                        <Col lg='4'>
                                          <Form.Control
                                            placeholder={"Green Limit"}
                                            type='text'
                                            name={this.state.targetFields[0].label + "_" + index}
                                            id={"green_limit"}
                                            disabled={this.state.readOnly}
                                            value={this.state.multiLimit[this.state.targetFields[0].label + "_" + index] ? this.state.multiLimit[this.state.targetFields[0].label + "_" + index].green_limit : ""}
                                            onChange={(e) => this.handleTargetInputChange(e)}
                                            style={{
                                              height: "25px",
                                              fontSize: "14px",
                                              margin: "0px",
                                            }}
                                          />
                                          <Form.Text className='errorMsg'>{this.state.errors.target[MULTILEVEL][`${this.state.targetFields[0].label}_${index}_green_limit`]}</Form.Text>
                                        </Col>
                                        <Col lg='4'>
                                          <Form.Control
                                            placeholder={"WorkflowId"}
                                            type='text'
                                            name={this.state.targetFields[0].label + "_" + index}
                                            id={"green_workflow_id"}
                                            disabled={this.state.readOnly}
                                            value={this.state.multiLimit[this.state.targetFields[0].label + "_" + index] ? this.state.multiLimit[this.state.targetFields[0].label + "_" + index].green_workflow_id : ""}
                                            onChange={(e) => this.handleTargetInputChange(e)}
                                            style={{
                                              height: "25px",
                                              fontSize: "14px",
                                              margin: "0px",
                                            }}
                                          />
                                        </Col>
                                      </Form.Group>
                                    </>
                                  );
                                })}
                              </div>
                            )}
                            <Button
                              variant='primary'
                              type='button'
                              disabled={this.state.readOnly || Object.keys(this.state.errors["target"][SINGLELEVEL]).length != 0 || Object.keys(this.state.errors["target"][MULTILEVEL]).length != 0}
                              onClick={(e) => {
                                this.applyTarget();
                              }}>
                              Apply Target
                            </Button>

                            <Overlay id='target_sla-overlay' target={this.refs.target_sla} show={this.state.errors.target_sla != null} placement='top'>
                              {(props) => (
                                <Tooltip id='target_sla-tooltip' {...props} className='error-tooltip'>
                                  {this.state.errors.target_sla}
                                </Tooltip>
                              )}
                            </Overlay>
                          </div>
                        </div>
                      </Tab>
                    )}
                    {widgetVisualType == "html" && (
                      <Tab eventKey='template' title='Template'>
                        {isTemplateLoading ? (
                          <p>loading.....</p>
                        ) : (
                          <div className='form-group row' style={{ marginTop: "30px" }}>
                            <div className='col-7'>
                              <Select
                                placeholder='Select Template'
                                onChange={(e) => {
                                  this.templateSelectionChanged(e);
                                }}
                                value={selectedTemplate ? selectedTemplate : ""}
                                options={this.getTemplateListOptions(templateList)}
                              />
                            </div>
                          </div>
                        )}
                      </Tab>
                    )}
                  </Tabs>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className='form-group col'>
          <div className='card' id='previewBox'>
            <div className='card-header'>
              Preview{" "}
              <span id='chartRefreshBtn' title='Refresh' style={{ cursor: "pointer" }} onClick={() => this.refreshPreview()}>
                <i className='fas fa-sync'></i>
              </span>
            </div>
            <div className='card-body'>
              {this.state.selectedTab === "chart" && (
                <div id='chartPreview'>
                  <b>Chart preview</b>
                </div>
              )}
              {this.state.selectedTab === "table" && (
                <div id='tablePreview'>
                  <b>Table preview</b>
                </div>
              )}
              {(this.state.selectedTab === "widget" || this.state.selectedTab === "template") && (
                <div id='widgetPreview'>
                  <b>Widget preview</b>
                </div>
              )}
              {this.state.selectedTab === "profile" && (
                <div id='profilePreview'>
                  <b>Profile preview</b>
                </div>
              )}
              {this.state.selectedTab === "report" && (
                <div id='reportPreview'>
                  <b>Report preview</b>
                </div>
              )}
              {(this.state.selectedTab === "query" || this.state.selectedTab === "expression") && (
                <div id='queryPreview'>
                  <textarea id='queryPreviewText' name='queryPreviewText' className='form-control form-control-sm' style={{ fontFamily: "Monospace" }} value='' disabled={true} />
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default WidgetEditorBody;
