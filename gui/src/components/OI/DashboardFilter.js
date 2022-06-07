import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import dashboardFilterJson from "../../../metadata.json";
import { Form, Row, Button } from "react-bootstrap";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select/creatable";
import { MultiSelect } from "react-multi-select-component";
// import "./FilterFields";
// import Multiselect from 'multiselect-react-dropdown';

const customStyles = {
  control: (base) => ({
    ...base,
    height: 38,
    minHeight: 38,
  }),
  valueContainer: (base) => ({
    ...base,
    height: "inherit",
    minHeight: "inherit",
  }),
};

const FilterFields = function (props) {
  const { filters, multiFilters, filterIndex, index, fieldType, dataType, onUpdate, removeField, field, filterName, filterQuery, filterMode, dateFormat, dataSourceOptions, isDefault, disableDateField, onSelect, onRemove } = props;
  const [isFilterIndexLoading, setIsFilterIndexLoading] = useState(false);
  const [isFilterNameLoading, setIsFilterNameLoading] = useState(false);
  const [isFilterValueLoading, setIsFilterValueLoading] = useState(false);

  const [filterIndexOption, setFilterIndexOption] = useState([]);
  const [filterNameOption, setFilterNameOption] = useState([]);
  const [filterValueOption, setFilterValueOption] = useState([]);
  const [filterQueryValue, setfilterQueryValue] = useState([]);

  const filtersOptions = {
    dateoperator: [{ Between: "gte&&lte" }, { "Less Than": "<" }, { "Greater Than": ">" }, { "This Month": "monthly" }, { "This Year": "yearly" }, { MTD: "mtd" }, { YTD: "ytd" }, { Today: "today" }],
    textoperator: [{ Contains: "LIKE" }, { "Does Not Contain": "NOT LIKE" }],
    numericoperator: [{ "Less Than": "<" }, { "Greater Than": ">" }, { Equals: "==" }, { "Not Equals": "!=" }],
    selectoperator: [{ Equals: "==" }, { "Not Equals": "NOT LIKE" }],
  };

  let startDateSet = new Date();
  startDateSet.setDate(['ytd', 'mtd'].includes(filters[index]["operator"]) && 1 || startDateSet.getDate()); // set date to 1st of the current month if mtd/ytd filter is applied
  filters[index]["operator"] == "ytd" && startDateSet.setMonth(0); // sets month to January if YTD is applied

  useEffect(() => {
    //set index value if datasource is set previously
    if (filters[index]["filterDataSource"]) {
      setFilterIndexList(filters[index]["filterDataSource"]);
      // set filter values if filter index is set previously
      if (filters[index]["filterIndex"]) {
        setFilterNameList(filters[index]["filterIndex"]);
        filters[index]["field"] && setFilterValueList(filters[index]["field"]);
      }
    }
  }, []);

  const removeValue = (e, value, name) => {
    //remove the filter value on click
    let filterCopy = filters;
    let values = filters[index][name];
    let filteredValues = values.filter((item) => item.value !== value);
    filterCopy[index][name] = filteredValues;
    props.setFilterValues(filterCopy);
  };

  async function setFilterNameList(filter_index) {
    setIsFilterNameLoading(true);
    let datasource_id = filters[index]["filterDataSource"];
    const response = await props.restClient.request("v1", "analytics/datasource/" + datasource_id + "/getdetails?type=fields&index=" + filter_index, {}, "get");
    if (response.status === "success") {
      //preparing options for react-select component
      if (response.data && typeof response.data == "object" && Object.keys(response.data).length > 0) {
        let preparedFilterOption = [];
        Object.keys(response.data).map((filterName) => {
          preparedFilterOption.push({ value: filterName, label: filterName });
        });
        setFilterNameOption(preparedFilterOption);
        // setIsLoading(false)
      }
    }
    setIsFilterNameLoading(false);
  }

  async function setFilterValueList(filter_field) {
    setIsFilterValueLoading(true);
    setFilterValueOption([]);
    let datasource_id = filters[index]["filterDataSource"];
    let filter_index = filters[index]["filterIndex"];
    let filterQuery = filters[index]["filterQuery"];
    const response = await props.restClient.request("v1", `analytics/datasource/${datasource_id}/getdetails?type=values&index=${filter_index}&field=${filter_field}&filter=${filterQuery}`, {}, "get");
    if (response.status === "success") {
      //preparing options for react-select component
      if (response.data && typeof response.data == "object" && response.data.length > 0) {
        let preparedFilterOption = [];
        response.data.map((filterName) => {
          preparedFilterOption.push({ value: filterName, label: filterName });
        });
        setFilterValueOption(preparedFilterOption);
      }
    }
    setIsFilterValueLoading(false);
  }

  async function setFilterQueryList(filterQuery) {
    setfilterQueryValue([]);
    let preparedFilterOption = [];
    preparedFilterOption.push({ value: filterQuery, label: filterQuery });
    setfilterQueryValue(preparedFilterOption);
  }

  const changeIndex = async (e, Index, type) => {
    // setIsLoading(true)
    onUpdate(e, Index, type);
    let filter_index = e.value;
    setFilterNameList(filter_index);
  };

  const changeName = async (e, Index, type) => {
    onUpdate(e, Index, type);
    let filter_name = e.value;
    setFilterValueList(filter_name);
  };

  const changeFilterQuery = async (e, Index, type) => {
    onUpdate(e, Index, type);
    let filter_query = e.target.value;
    setFilterQueryList(filter_query);
  };

  async function setFilterIndexList(datasource_id) {
    setIsFilterIndexLoading(true);
    const response = await props.restClient.request("v1", "analytics/datasource/" + datasource_id + "/getdetails", {}, "get");
    if (response.status === "success") {
      //preparing options for react-select component
      if (response.data && response.data.length > 0) {
        let preparedFilterOption = [];
        response.data.map((filterIndex) => {
          preparedFilterOption.push({ value: filterIndex, label: filterIndex });
        });
        setFilterIndexOption(preparedFilterOption);
        setIsFilterIndexLoading(false);
      }
    }
  }

  async function changeDataSource(e, Index, type) {
    setFilterIndexOption([]);
    // setIsLoading(true)
    onUpdate(e, Index, type);
    const datasource_id = e.value;
    setFilterIndexList(datasource_id);
  }

  const CustomOption = (props) => {
    const { children, className, cx, getStyles, isDisabled, isFocused, isSelected, innerRef, innerProps } = props;
    const { onClick } = innerProps;
    innerProps.onClick = (e) => {
      if (e.target.tagName !== "I") {
        onClick(e);
      }
    };
    return (
      <div ref={innerRef} className="custom-react-select-container" {...innerProps}>
        {/* DONOT CHANGE THE TAGS SPECIFIED BELOW */}
        <span>{children}</span>
        <i className="far fa-times-circle" onClick={(e) => removeValue(e, children, name)}></i>
      </div>
    );
  };

  const disabledFields = filterMode == "APPLY";
  const visibility = filterMode == "CREATE";
  return (
    <Form.Row className={"filterFields" + (visibility ? "" : "filter")}>
      {!visibility && (
        <div className="filterFieldsfilter-section-one">
          <h2 className="dashboard-filter-name">{filterName}</h2>
          <Form.Group className="dashboard-filter-field">
            {" "}
            {/*  View Mode : Filter Operator */}
            {dataType === "date" || dataType === "text" || dataType === "numeric" || dataType === "select" ? (
              <Form.Control className="dashboardTextField" as="select" name={"operator"} onChange={(e) => onUpdate(e, index)} value={filters[index] !== undefined ? filters[index]["operator"] : ""}>
                <option disabled key="-1" value=""></option>
                {filtersOptions[dataType + "operator"].map((item, mapindex) => {
                  return (
                    <option key={mapindex} value={Object.values(item)[0]}>
                      {Object.keys(item)[0]}
                    </option>
                  );
                })}
              </Form.Control>
            ) : (
              <Form.Control className="dashboardTextField field-width-75" as="select" name={"operator"} onChange={(e) => onUpdate(e, index)} value={filters[index] !== undefined ? filters[index]["operator"] : ""}>
                <option disabled key="-1" value=""></option>
              </Form.Control>
            )}
          </Form.Group>
          <Form.Group className="dash-manager-buttons" style={{ marginLeft: "auto", marginRight: "0.5rem" }}>
            {!filters[index]["isParentFilter"] && (
              <Button className="filter_remove_button_view" onClick={(e) => removeField(index, fieldType)}>
                <i className="fa fa-minus" aria-hidden="true"></i>
              </Button>
            )}
          </Form.Group>
        </div>
      )}

      {visibility && (
        <div className="dashboard-filter-field" style={{ minWidth: "auto" }}>
          <Form.Group className="dashboard-filter-field">
            <Form.Label>Filter DataSource</Form.Label>
            <Select
              selected={filters[index]["filterDataSource"] || ""}
              name="filterDataSource"
              id="filterDataSource"
              onChange={(e) => changeDataSource(e, index, "filterDataSource")}
              value={dataSourceOptions ? dataSourceOptions.filter((option) => option.value == filters[index]["filterDataSource"]) : ""}
              // selected={filterIndex}
              options={dataSourceOptions}
              styles={customStyles}
            />
          </Form.Group>
        </div>
      )}
      {visibility && (
        <div className="dashboard-filter-field" style={{ minWidth: "auto" }}>
          <Form.Group className="dashboard-filter-field">
            <Form.Label>Filter Index</Form.Label>
            <Select selected={filters[index]["filterIndex"] || ""} name="filterIndex" id="filterIndex" onChange={(e) => changeIndex(e, index, "filterIndex")} value={filterIndexOption ? filterIndexOption.filter((option) => option.value == filters[index]["filterIndex"]) : ""} selected={filterIndex} options={filterIndexOption} styles={customStyles} isLoading={isFilterIndexLoading} isDisabled={filters[index]["filterDataSource"] === undefined || filters[index]["filterDataSource"] == "" ? true : false} />
          </Form.Group>
        </div>
      )}
      {visibility && (
        <div className="dashboard-filter-field" id="" style={{ minWidth: "auto" }}>
          <Form.Group className="dashboard-filter-field">
            <Form.Label>Field Description</Form.Label>
            <Form.Control className="dashboardTextField" style={{ width: "100%" }} type="text" name="filterName" title={disabledFields ? "*The entered description will bdisplayed in dashboard viewer as filter name" : null} value={filterName} disabled={disabledFields} onChange={(e) => onUpdate(e, index)} />
          </Form.Group>
        </div>
      )}
      {visibility && (
        <div className="dashboard-filter-field" id="" style={{ minWidth: "auto" }}>
          <Form.Group className="dashboard-filter-field">
            <Form.Label>Filter Query</Form.Label>
            <Form.Control className="dashboardTextField" style={{ width: "100%" }} type="text" name="filterQuery" title={disabledFields ? "*The entered description will bdisplayed in dashboard viewer as filter name" : null} value={filters[index]["filterQuery"]} disabled={disabledFields} onChange={(e) => changeFilterQuery(e, index)} />
          </Form.Group>
        </div>
      )}
      {visibility && (
        <div className="dashboard-filter-field" style={{ minWidth: "auto" }}>
          <Form.Group className="dashboard-filter-field">
            <Form.Label>Field Name</Form.Label>
            {<Select selected={filters[index]["field"] || ""} name="field" id="field" onChange={(e) => changeName(e, index, "field")} value={filterNameOption ? filterNameOption.filter((option) => option.value == filters[index]["field"]) : ""} selected={filterName} options={filterNameOption} styles={customStyles} isLoading={isFilterNameLoading} isDisabled={filters[index]["filterIndex"] === undefined || filters[index]["filterIndex"] == "" ? true : false} className="" />}
          </Form.Group>
        </div>
      )}
      {visibility && (
        <div className="dashboard-filter-field" style={{ minWidth: "auto" }}>
          <Form.Group className="dashboard-filter-field">
            <Form.Label>Data Type</Form.Label>
            <Form.Control className="dashboardTextField" style={{ width: "100%" }} type="text" value={fieldType} disabled />
          </Form.Group>
        </div>
      )}
      {visibility && (
        <div className="dashboard-filter-field" style={{ minWidth: "auto" }}>
          <Form.Group className="dashboard-filter-field">
            <Form.Label>Operator</Form.Label>
            {dataType === "date" || dataType === "text" || dataType === "numeric" || dataType === "select" ? (
              <Form.Control className="dashboardTextField" as="select" name={"operator"} onChange={(e) => onUpdate(e, index)} value={filters[index] !== undefined ? filters[index]["operator"] : ""}>
                <option disabled key="-1" value=""></option>
                {filtersOptions[dataType + "operator"].map((item, mapindex) => {
                  return (
                    <option key={mapindex} value={Object.values(item)[0]}>
                      {Object.keys(item)[0]}
                    </option>
                  );
                })}
              </Form.Control>
            ) : (
              <Form.Control className="dashboardTextField" as="select" name={"operator"} onChange={(e) => onUpdate(e, index)} value={filters[index] !== undefined ? filters[index]["operator"] : ""}>
                <option disabled key="-1" value=""></option>
              </Form.Control>
            )}
          </Form.Group>
        </div>
      )}
      <div className="dashboard-filter-field filterFieldsfilter-section-two" style={{ minWidth: "auto" }}>
        <Form.Group className="dashboard-filter-field" id="formGridPassword">
          {/* <Form.Label>Default Value</Form.Label><br /> */}
          {dataType === "date" ? (
            filters[index]["operator"] !== "gte&&lte" && filters[index]["operator"] !== "mtd" && filters[index]["operator"] !== "ytd" && filters[index]["dateRange"] === false ? (
              <DatePicker
                className="dashboardTextField"
                // key={index}
                dateFormat={dateFormat}
                selected={Date.parse(filters[index]["startDate"])}
                showMonthDropdown
                showYearDropdown
                disabled={disableDateField}
                dropdownMode="select"
                popperPlacement="bottom"
                popperModifiers={{
                  flip: {
                    behavior: ["bottom"], // don't allow it to flip to be above
                  },
                  preventOverflow: {
                    enabled: false, // tell it not to try to stay within the view (this prevents the popper from covering the element you clicked)
                  },
                  hide: {
                    enabled: false, // turn off since needs preventOverflow to be enabled
                  },
                }}
                onChange={(date) => onUpdate(date, index, "startDate")}
                name="startDate"
              />
            ) : (
              <div className="dates-container">
                <DatePicker
                  className="dashboardTextField"
                  selected={Date.parse(startDateSet || filters[index]["startDate"])}
                  dateFormat={dateFormat}
                  onChange={(date) => onUpdate(date, index, "startDate")}
                  selectsStart
                  enabled={false}
                  // key={index}
                  disabled={disableDateField}
                  startDate={startDateSet || Date.parse(filters[index]["startDate"])}
                  endDate={filters[index]["operator"] == "mtd" || filters[index]["operator"] == "ytd" ? new Date() : Date.parse(filters[index]["endDate"])}
                  showMonthDropdown
                  showYearDropdown
                  popperPlacement="bottom"
                  popperModifiers={{
                    flip: {
                      behavior: ["bottom"], // don't allow it to flip to be above
                    },
                    preventOverflow: {
                      enabled: false, // tell it not to try to stay within the view (this prevents the popper from covering the element you clicked)
                    },
                    hide: {
                      enabled: false, // turn off since needs preventOverflow to be enabled
                    },
                  }}
                  dropdownMode="select"
                />
                <DatePicker
                  className="dashboardTextField "
                  selected={filters[index]["operator"] == "mtd" || filters[index]["operator"] == "ytd" ? new Date() : Date.parse(filters[index]["endDate"])}
                  dateFormat={dateFormat}
                  onChange={(date) => onUpdate(date, index, "endDate")}
                  selectsEnd
                  // key={index}
                  enabled={false}
                  disabled={disableDateField}
                  startDate={Date.parse(filters[index]["startDate"])}
                  endDate={filters[index]["operator"] == "mtd" || filters[index]["operator"] == "ytd" ? new Date() : Date.parse(filters[index]["endDate"])}
                  minDate={Date.parse(filters[index]["startDate"])}
                  showMonthDropdown
                  showYearDropdown
                  popperPlacement="bottom"
                  popperModifiers={{
                    flip: {
                      behavior: ["bottom"], // don't allow it to flip to be above
                    },
                    preventOverflow: {
                      enabled: false, // tell it not to try to stay within the view (this prevents the popper from covering the element you clicked)
                    },
                    hide: {
                      enabled: false, // turn off since needs preventOverflow to be enabled
                    },
                  }}
                  dropdownMode="select"
                />
              </div>
            )
          ) : // filterMode == "CREATE" ?
            dataType === "select" && multiFilters ? (
              // <Select
              //     className="dashboardTextField"
              //     selected={filters[index]["value"] || ""}
              //     name="value"
              //     id="value"
              //     placeholder="Select an option"
              //     style={{ flex: "1 1 100%" }}
              //     onChange={(e) => {
              //         onUpdate(e, index, "value");
              //         var x = document.getElementById("select_notif" + index);
              //         x.className = "toastHide"
              //     }}
              //     value={filterValueOption ? filterValueOption.filter(option => option.value == filters[index]["value"]) : ""}
              //     options={filterValueOption}
              //     styles={customStyles}
              //     isLoading={isFilterValueLoading}
              // />
              <div>
                {/* <pre>{JSON.stringify(((multiFilters[index]) ? (Array.isArray(multiFilters[index]["value"]) ? multiFilters[index]["value"] : []) : []))}</pre> */}
                <MultiSelect
                  className="dashboardTextField field-width-300"
                  name="value"
                  value={multiFilters[index] ? (Array.isArray(multiFilters[index]["value"]) ? multiFilters[index]["value"] : []) : []}
                  id="value"
                  key={index}
                  displayValue="value"
                  placeholder="Select an option"
                  options={filterValueOption}
                  style={{
                    width: "50px",
                  }}
                  styles={customStyles}
                  isLoading={isFilterValueLoading}
                  onChange={(e) => onSelect(e, index, "")} // create onSelect function where it assigns the value array
                  onRemove={(e) => onRemove(e, index, "")}
                />
              </div>
            ) : (
              <Form.Control className="dashboardTextField field-width-150" id="value" type="text" placeholder="Enter the keyword" value={filters[index]["value"]} name="value" styles={customStyles} onChange={(e) => onUpdate(e, index, "value")} key={index} />
            )}
        </Form.Group>
      </div>

      {visibility && (
        <div className="dashboard-filter-field dash-manager-buttons">
          <Form.Group className="dashboard-filter-field">
            <Form.Control
              type="checkbox"
              name="isDefault"
              className="form-checkbox filter_remove_button"
              value={isDefault}
              defaultChecked={isDefault}
              onChange={(e) => onUpdate(e, index)}
              style={{
                cursor: "pointer",
                float: "left",
                verticalAlign: "middle",
                position: "relative",
                width: "50px",
                margin: "5px 2px",
              }}
            />
            {!filters[index]["isParentFilter"] && (
              <Button
                className=""
                style={{
                  cursor: "pointer",
                  float: "left",
                  verticalAlign: "middle",
                  position: "relative",
                }}
                onClick={(e) => removeField(index, fieldType)}>
                <i className="fa fa-minus" aria-hidden="true"></i>
              </Button>
            )}
          </Form.Group>
        </div>
      )}
    </Form.Row>
  );
};

class DashboardFilter extends React.Component {
  constructor(props) {
    super(props);
    this.core = this.props.core;
    this.userProfile = this.core.make("oxzion/profile").get();
    this.handleChange = this.handleChange.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.createField = this.createField.bind(this);
    this.removeField = this.removeField.bind(this);
    this.restClient = this.props.core.make("oxzion/restClient");
    this.state = {
      input: {},
      focused: null,
      inputFields: [],
      startDate: new Date(),
      createFilterOption: [
        { value: "text", label: "Text" },
        { value: "date", label: "Date" },
        { value: "numeric", label: "Number" },
        { value: "select", label: "Dropdown" },
      ],
      applyFilterOption: this.props.applyFilterOption ? [...this.props.applyFilterOption] : [],
      filters: this.props.filterConfiguration ? [...this.props.filterConfiguration] : [],
      filterConfiguration: this.props.filterConfiguration ? [...this.props.filterConfiguration] : [],
      defaultFilters: [],
      applyFilters: [],
      dateFormat: undefined,
      dateTimeFormat: dashboardFilterJson.dateTimeFormat.title.en_EN,
      showDefaultValue: true,
      dataSourceOptions: [],
      disableDateField: null,
      multiFilters: this.props.filterConfiguration ? [...this.props.filterConfiguration] : [],
      uuid: this.props.dashboardUuid,
    };
  }

  async getDataSourceOptions() {
    let dataSourceResponse = await this.restClient.request("v1", 'analytics/datasource?filter=[{"sort":[{"field":"name","dir":"asc"}],"skip":0,"take":10000}]', {}, "get");
    let options = [];
    if (dataSourceResponse.status == "success" && dataSourceResponse.data.length > 0) {
      dataSourceResponse.data.map((datasource) => {
        options.push({ label: datasource.name, value: datasource.uuid });
      });
    }
    this.setState({ dataSourceOptions: options });
  }

  componentDidUpdate(prevProps, prevState) {
    let dashboardUuid = this.props.dashboardStack ? this.props.dashboardStack[this.props.dashboardStack.length - 1]["data"]["uuid"] : this.props.dashboardId;
    if (prevProps.filterConfiguration != this.props.filterConfiguration || prevProps.applyFilterOption != this.props.applyFilterOption) {
      this.props.filterMode != "CREATE" && this.props.dashboardStack.length == 1
        ? this.displayDefaultFilters()
        : this.setState({
          filterConfiguration: this.props.filterConfiguration,
          filters: this.props.filterConfiguration,
          multiFilters: this.props.filterConfiguration,
          applyFilterOption: this.props.applyFilterOption,
          uuid: dashboardUuid,
        });
    }
    if (this.props.filterMode == "APPLY" && prevProps.applyFilterOption !== this.props.applyFilterOption) {
      this.setState({
        applyFilterOption: this.props.applyFilterOption.length == 0 ? this.state.applyFilterOption : this.props.applyFilterOption,
        uuid: dashboardUuid,
      });
    }
    if (this.props.filterMode == "APPLY" && prevProps.filterConfiguration !== this.props.filterConfiguration) {
      this.setState({
        filters: this.props.filterConfiguration,
        filterConfiguration: this.props.filterConfiguration,
        multiFilters: this.props.filterConfiguration,
        uuid: dashboardUuid,
      });
    }
  }

  componentDidMount(props) {
    this.getDataSourceOptions();
    this.displayDefaultFilters();
  }

  //showing only default filters on load
  displayDefaultFilters() {
    let filters = [];
    this.props.filterConfiguration &&
      this.props.filterConfiguration.map((filter, index) => {
        if (filter.isDefault) {
          filters.push(filter);
        }
      });
    this.setState({ filters: filters });
  }

  removeField(index, field) {
    var availableOptions = [...this.state.createFilterOption];
    let filters = [...this.state.filters];
    if (index > -1) {
      if (this.props.filterMode === "CREATE") {
        filters.splice(index, 1);
        this.setState({ filters: filters }, (state) => state);
      } else if (this.props.filterMode === "APPLY") {
        let applyFilterOption = [...this.state.applyFilterOption];
        applyFilterOption.push({
          label: this.state.filters[index]["filterName"],
          value: this.state.filters[index],
        });
        filters.splice(index, 1);
        this.setState({
          filters: filters,
          applyFilterOption: applyFilterOption,
        });
      }
    }
  }

  createField(fieldType) {
    var availableOptions = [...this.state.createFilterOption];
    let filters = [...this.state.filters];
    let newoption = null;
    let length = filters !== undefined ? filters.length : 0;
    if (fieldType === "date") {
      filters.push({
        filterName: "",
        field: "",
        fieldType: fieldType,
        dataType: "date",
        operator: "",
        value: new Date(this.state.dateFormat),
        key: length,
      });
    } else if (fieldType === "text") {
      filters.push({
        filterName: "",
        field: "",
        fieldType: fieldType,
        dataType: "text",
        operator: "",
        value: "",
        key: length,
        filterIndex: "",
      });
    } else if (fieldType === "select") {
      filters.push({
        filterName: "",
        field: "",
        fieldType: fieldType,
        dataType: "select",
        operator: "",
        value: "",
        key: length,
        filterIndex: "",
      });
    } else if (fieldType === "numeric") {
      filters.push({
        filterName: "",
        field: "",
        fieldType: fieldType,
        dataType: "numeric",
        operator: "",
        value: "",
        key: length,
      });
    } else {
      filters.push({
        filterName: "",
        field: "",
        fieldType: fieldType,
        dataType: "",
        operator: "",
        value: "",
        key: length,
      });
    }
    this.setState({ filters: filters });
  }

  handleChange(e) {
    let name = e.target.name;
    let value = e.target.value;
    this.setState({ input: { ...this.state.input, [name]: value } });
  }

  updateFilterRow(e, index, type) {
    this.setState({ showing: true });
    let name;
    let value;
    let date = new Date();
    this.setState({ showing: false });
    this.setState({ disableDateField: null });
    //deep cloning react state to avoid mutation
    let filters = JSON.parse(JSON.stringify(this.state.filters));
    if (type === "startDate" || type === "endDate") {
      name = type;
      value = e;
    } else if (type == "value") {
      name = type;
      value = e.value ? e.value : e.target.value;
    } else if (type == "filterIndex" || type == "field" || type == "filterDataSource" || type == "value") {
      name = type;
      value = e.value ? e.value : e.target.value;
    } else if (e.target.value === "today") {
      name = e.target.name;
      value = e.target.value;
      const date = new Date();
      filters[index]["startDate"] = date;
      filters[index][name] = value;
      filters[index]["dateRange"] = false;
      this.setState({ showing: false });
      this.setState({ disableDateField: "disabled" });
    } else if (e.target.value === "monthly") {
      name = e.target.name;
      value = e.target.value;
      let date = new Date();
      let firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      let lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      filters[index]["startDate"] = firstDay;
      filters[index]["endDate"] = lastDay;
      filters[index][name] = value;
      filters[index]["dateRange"] = true;
      this.setState({ showing: false });
      this.setState({ disableDateField: "disabled" });
    } else if (e.target.value === "yearly") {
      name = e.target.name;
      value = e.target.value;
      let date = new Date();
      let firstDay = new Date(date.getFullYear(), 0, 1);
      let lastDay = new Date(date.getFullYear(), 11, 31);
      filters[index]["startDate"] = firstDay;
      filters[index]["endDate"] = lastDay;
      filters[index][name] = value;
      filters[index]["dateRange"] = true;
      this.setState({ showing: false });
      this.setState({ disableDateField: "disabled" });
    } else if (e.target.value === "mtd") {
      name = e.target.name;
      value = e.target.value;
      let date = new Date();
      let firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      let lastDay = date;
      filters[index]["startDate"] = firstDay;
      filters[index]["endDate"] = lastDay;
      filters[index][name] = value;
      filters[index]["dateRange"] = true;
      this.setState({ showing: false });
      this.setState({ disableDateField: "disabled" });
    } else if (e.target.value === "ytd") {
      name = e.target.name;
      value = e.target.value;
      let date = new Date();
      let firstDay = new Date(date.getFullYear(), 0, 1);
      let lastDay = date;
      filters[index]["startDate"] = firstDay;
      filters[index]["endDate"] = lastDay;
      filters[index][name] = value;
      filters[index]["dateRange"] = true;
      this.setState({ showing: false });
      this.setState({ disableDateField: "disabled " });
    } else if (e.target.name === "isDefault") {
      name = e.target.name;
      value = e.target.checked;
    } else {
      name = e.target.name;
      value = e.target.value;
      filters[index]["dateRange"] = false;
      this.setState({ showing: true });
    }
    filters[index][name] = value;
    this.setState({ filters });
  }

  multiselectFilterRow(e, index, type) {
    let multiFilter = this.state.multiFilters; // getting empty because filterconfig is empty;
    let itemFilter = [];
    let name = "value";
    e.map((item, key) => {
      itemFilter.push({ key: { label: item.value, value: item.value } });
      itemFilter[key] = { label: item.value, value: item.value };
      multiFilter.push(itemFilter);
    });
    if (multiFilter[index]) {
      multiFilter[index][name] = itemFilter;
      let filters = JSON.parse(JSON.stringify(this.state.filters));
      this.setState({ multiFilters: multiFilter });
      filters[index][name] = multiFilter[index][name];
      this.setState({ filters });
    }
  }

  multiremoveFilterRow(e, index, type) {
    var value = [];
    e.map((item) => value.push(item.value));
    this.setState({ showing: true });
    let name = "value";
    //deep cloning react state to avoid mutation
    let filters = JSON.parse(JSON.stringify(this.state.filters));
    filters[index][name] = value;
    this.setState({ filters });
  }

  handleSelect(e) {
    let name = e.value;
    let value = e.label;
    if (this.props.filterMode === "CREATE") {
      if (e.__isNew__) {
        let filters = [...this.state.filters];
        let length = filters !== undefined ? filters.length : 0;
        filters.push({
          filterName: "",
          field: "",
          fieldType: name,
          dataType: "",
          operator: "",
          value: "",
          key: Math.floor(Math.random() * 1000),
        });
        this.setState({
          input: { ...this.state.input, filtertype: "" },
          filters,
        });
      } else {
        this.createField(e.value);
        this.setState({ input: { ...this.state.input, filtertype: "" } });
      }
    } else if (this.props.filterMode === "APPLY") {
      let filters = [...this.state.filters];
      let applyFilterOption = [...this.state.applyFilterOption];
      filters.push(e.value);
      //removing selected option from the list
      let newoption = applyFilterOption.filter(function (obj) {
        return obj.label !== e.label;
      });
      applyFilterOption = newoption;
      this.setState({ applyFilterOption: newoption, filters: filters });
    }
  }

  hideFilterDiv() {
    let filterContainer = "filter-form-container-" + this.props.dashboardUuid;
    var element = document.getElementById(filterContainer);
    element && element.classList.add("disappear");
    element = document.getElementById("filtereditor-form-container");
    element && element.classList.add("disappear");
    element = document.getElementById("dash-manager-buttons");
    element && element.classList.remove("disappear");
    this.props.hideFilterDiv();
    document.getElementById("dashboard-container") && document.getElementById("dashboard-container").classList.remove("disappear");
    document.getElementById("dashboard-filter-btn") && (document.getElementById("dashboard-filter-btn").disabled = false);
  }

  saveFilter() {
    let filters;
    if (this.state.filters !== undefined) {
      this.state.filters
        .filter((obj) => obj !== undefined)
        .map((filterRow, index) => {
          if (filterRow.fieldType == "date") {
            if (filterRow.operator == "ytd" || filterRow.operator == "mtd") {
              this.state.filters[index]["endDate"] = new Date();
            }
            //else if (filterRow.operator == "==" || filterRow.operator == ">" || filterRow.operator == "<") {
            //  this.state.filters[index]["endDate"] = null;
            //}
        }
        });
      filters = this.state.filters.filter(function (obj) {
        return obj !== undefined && obj.value !== undefined;
      });
    }

    let formData = {};
    formData["dashboard_type"] = "html";
    formData["version"] = this.props.dashboardVersion;
    formData["filters"] = filters;
    if (this.props.filterMode === "CREATE") {
      this.props.setFilter(filters);
      this.hideFilterDiv();
      this.props.notif.current.notify("Filter Applied Successfully", "Please save the OI in order to keep the changes", "success");
    } else if (this.props.filterMode === "APPLY") {
      this.props.setDashboardFilter(filters);
      this.hideFilterDiv();
    }
  }

  setFilterValues(filters) {
    this.setState({ filters });
  }

  render() {
    return (
      <div className="dashboard-filter-wrapper">
        <div className="filter-header-panel">
          <h2 className="filter-header-text">Filter By</h2>
          <div className="dash-manager-buttons" style={{ marginLeft: "auto" }}>
            <Button
              type="button"
              className="close"
              style={{
                fontSize: "1.5rem",
                padding: "2px 7px",
                boxShadow: "none",
                color: "#345561",
              }}
              aria-label="Close"
              onClick={() => this.hideFilterDiv()}>
              <i className="fa fa-close" aria-hidden="true"></i>
            </Button>
          </div>
        </div>
        <Form.Row className="create-filter-form">
          {this.state.filters
            .filter((obj) => obj !== undefined)
            .map((filterRow, index) => {
              return <FilterFields index={index} dateFormat={this.state.dateFormat} filters={this.state.filters} multiFilters={this.state.multiFilters} setFilterValues={(filter) => this.setFilterValues(filter)} input={this.state.input} key={filterRow.key} dataType={filterRow.dataType || ""} value={filterRow.value || this.state.input[filterRow.fieldType + "value"]} removeField={this.removeField} fieldType={filterRow.fieldType} isDefault={filterRow.isDefault} field={filterRow.field} filterName={filterRow.filterName} onUpdate={(e, index, type) => this.updateFilterRow(e, index, type)} onChange={(e) => this.handleChange(e)} filterMode={this.props.filterMode} dataSourceOptions={this.state.dataSourceOptions} restClient={this.restClient} disableDateField={this.state.disableDateField} onSelect={(e, index, type) => this.multiselectFilterRow(e, index, type)} onRemove={(e, index, type) => this.multiremoveFilterRow(e, index, type)} />;
            })}
          {this.props.filterMode === "CREATE" ? (
            // Rendered on dashboard Edtior
            <Form.Group>
              <Form.Label> Choose/Create Filters </Form.Label>
              <Select placeholder="Choose filters" name="filtertype" id="filtertype" onChange={(e) => this.handleSelect(e)} value={this.state.input["filtertype"]} options={this.state.createFilterOption} />
            </Form.Group>
          ) : (
            // Rendered on dashboard Viewer
            this.state.applyFilterOption.length !== 0 && (
              <Form.Group style={{ marginTop: "20px" }}>
                <Form.Label> Choose/Apply Filters </Form.Label>
                <Select placeholder="Choose filters" name="applyfiltertype" id="applyfiltertype" onChange={(e) => this.handleSelect(e)} value={this.state.input["applyfiltertype"]} options={this.state.applyFilterOption} style={{ marginleft: "0px" }} />
              </Form.Group>
            )
          )}
        </Form.Row>
        <div className="apply-filter-btn-wrapper">
          <Button className="apply-filter-btn" onClick={() => this.saveFilter()}>
            Apply Filters
          </Button>
        </div>
      </div>
    );
  }
}
export default React.memo(DashboardFilter);
