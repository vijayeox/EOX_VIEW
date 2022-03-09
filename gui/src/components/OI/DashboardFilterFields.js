import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
// import dashboardFilterJson from "../metadata.json";
import { Form, Row, Button } from "react-bootstrap";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select/creatable";
import { MultiSelect } from "react-multi-select-component";

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
      <div ref={innerRef} className='custom-react-select-container' {...innerProps}>
        {/* DONOT CHANGE THE TAGS SPECIFIED BELOW */}
        <span>{children}</span>
        <i className='far fa-times-circle' onClick={(e) => removeValue(e, children, name)}></i>
      </div>
    );
  };

  const disabledFields = filterMode == "APPLY";
  const visibility = filterMode == "CREATE";
  return (
    <Form.Row className={"filterFields" + (visibility ? "" : "filter")}>
      {!visibility && (
        <div className='filterFieldsfilter-section-one'>
          <h2 className='dashboard-filter-name'>{filterName}</h2>
          <Form.Group className='dashboard-filter-field'>
            {" "}
            {/*  View Mode : Filter Operator */}
            {dataType === "date" || dataType === "text" || dataType === "numeric" || dataType === "select" ? (
              <Form.Control className='dashboardTextField' as='select' name={"operator"} onChange={(e) => onUpdate(e, index)} value={filters[index] !== undefined ? filters[index]["operator"] : ""}>
                <option disabled key='-1' value=''></option>
                {filtersOptions[dataType + "operator"].map((item, mapindex) => {
                  return (
                    <option key={mapindex} value={Object.values(item)[0]}>
                      {Object.keys(item)[0]}
                    </option>
                  );
                })}
              </Form.Control>
            ) : (
              <Form.Control className='dashboardTextField field-width-75' as='select' name={"operator"} onChange={(e) => onUpdate(e, index)} value={filters[index] !== undefined ? filters[index]["operator"] : ""}>
                <option disabled key='-1' value=''></option>
              </Form.Control>
            )}
          </Form.Group>
          <Form.Group className='dash-manager-buttons' style={{ marginLeft: "auto", marginRight: "0.5rem" }}>
            {!filters[index]["isParentFilter"] && (
              <Button className='filter_remove_button_view' onClick={(e) => removeField(index, fieldType)}>
                <i className='fa fa-minus' aria-hidden='true'></i>
              </Button>
            )}
          </Form.Group>
        </div>
      )}

      {visibility && (
        <div className='dashboard-filter-field' style={{ minWidth: "auto" }}>
          <Form.Group className='dashboard-filter-field'>
            <Form.Label>Filter DataSource</Form.Label>
            <Select
              selected={filters[index]["filterDataSource"] || ""}
              name='filterDataSource'
              id='filterDataSource'
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
        <div className='dashboard-filter-field' style={{ minWidth: "auto" }}>
          <Form.Group className='dashboard-filter-field'>
            <Form.Label>Filter Index</Form.Label>
            <Select
              selected={filters[index]["filterIndex"] || ""}
              name='filterIndex'
              id='filterIndex'
              onChange={(e) => changeIndex(e, index, "filterIndex")}
              value={filterIndexOption ? filterIndexOption.filter((option) => option.value == filters[index]["filterIndex"]) : ""}
              selected={filterIndex}
              options={filterIndexOption}
              styles={customStyles}
              isLoading={isFilterIndexLoading}
              isDisabled={filters[index]["filterDataSource"] === undefined || filters[index]["filterDataSource"] == "" ? true : false}
            />
          </Form.Group>
        </div>
      )}
      {visibility && (
        <div className='dashboard-filter-field' id='' style={{ minWidth: "auto" }}>
          <Form.Group className='dashboard-filter-field'>
            <Form.Label>Field Description</Form.Label>
            <Form.Control className='dashboardTextField' style={{ width: "100%" }} type='text' name='filterName' title={disabledFields ? "*The entered description will bdisplayed in dashboard viewer as filter name" : null} value={filterName} disabled={disabledFields} onChange={(e) => onUpdate(e, index)} />
          </Form.Group>
        </div>
      )}
      {visibility && (
        <div className='dashboard-filter-field' id='' style={{ minWidth: "auto" }}>
          <Form.Group className='dashboard-filter-field'>
            <Form.Label>Filter Query</Form.Label>
            <Form.Control className='dashboardTextField' style={{ width: "100%" }} type='text' name='filterQuery' title={disabledFields ? "*The entered description will bdisplayed in dashboard viewer as filter name" : null} value={filters[index]["filterQuery"]} disabled={disabledFields} onChange={(e) => changeFilterQuery(e, index)} />
          </Form.Group>
        </div>
      )}
      {visibility && (
        <div className='dashboard-filter-field' style={{ minWidth: "auto" }}>
          <Form.Group className='dashboard-filter-field'>
            <Form.Label>Field Name</Form.Label>
            {<Select selected={filters[index]["field"] || ""} name='field' id='field' onChange={(e) => changeName(e, index, "field")} value={filterNameOption ? filterNameOption.filter((option) => option.value == filters[index]["field"]) : ""} selected={filterName} options={filterNameOption} styles={customStyles} isLoading={isFilterNameLoading} isDisabled={filters[index]["filterIndex"] === undefined || filters[index]["filterIndex"] == "" ? true : false} className='' />}
          </Form.Group>
        </div>
      )}
      {visibility && (
        <div className='dashboard-filter-field' style={{ minWidth: "auto" }}>
          <Form.Group className='dashboard-filter-field'>
            <Form.Label>Data Type</Form.Label>
            <Form.Control className='dashboardTextField' style={{ width: "100%" }} type='text' value={fieldType} disabled />
          </Form.Group>
        </div>
      )}
      {visibility && (
        <div className='dashboard-filter-field' style={{ minWidth: "auto" }}>
          <Form.Group className='dashboard-filter-field'>
            <Form.Label>Operator</Form.Label>
            {dataType === "date" || dataType === "text" || dataType === "numeric" || dataType === "select" ? (
              <Form.Control className='dashboardTextField' as='select' name={"operator"} onChange={(e) => onUpdate(e, index)} value={filters[index] !== undefined ? filters[index]["operator"] : ""}>
                <option disabled key='-1' value=''></option>
                {filtersOptions[dataType + "operator"].map((item, mapindex) => {
                  return (
                    <option key={mapindex} value={Object.values(item)[0]}>
                      {Object.keys(item)[0]}
                    </option>
                  );
                })}
              </Form.Control>
            ) : (
              <Form.Control className='dashboardTextField' as='select' name={"operator"} onChange={(e) => onUpdate(e, index)} value={filters[index] !== undefined ? filters[index]["operator"] : ""}>
                <option disabled key='-1' value=''></option>
              </Form.Control>
            )}
          </Form.Group>
        </div>
      )}
      <div className='dashboard-filter-field filterFieldsfilter-section-two' style={{ minWidth: "auto" }}>
        <Form.Group className='dashboard-filter-field' id='formGridPassword'>
          {/* <Form.Label>Default Value</Form.Label><br /> */}
          {dataType === "date" ? (
            filters[index]["operator"] !== "gte&&lte" && filters[index]["operator"] !== "mtd" && filters[index]["operator"] !== "ytd" && filters[index]["dateRange"] === false ? (
              <DatePicker
                className='dashboardTextField'
                // key={index}
                dateFormat={dateFormat}
                selected={Date.parse(filters[index]["startDate"])}
                showMonthDropdown
                showYearDropdown
                disabled={disableDateField}
                dropdownMode='select'
                popperPlacement='bottom'
                popperModifiers={{
                  flip: {
                    behavior: ["bottom"], // don't allow it to flip to be above
                  },
                  preventOverflow: {
                    enabled: false, // tell it not to try to stay within the view (this prevents the popper from covering the element you clicked)
                  },
                  fn: () => undefined,
                  hide: {
                    enabled: false, // turn off since needs preventOverflow to be enabled
                  },
                }}
                onChange={(date) => onUpdate(date, index, "startDate")}
                name='startDate'
              />
            ) : (
              <div className='dates-container'>
                <DatePicker
                  className='dashboardTextField'
                  selected={Date.parse(filters[index]["startDate"])}
                  dateFormat={dateFormat}
                  onChange={(date) => onUpdate(date, index, "startDate")}
                  selectsStart
                  enabled={false}
                  // key={index}
                  disabled={disableDateField}
                  startDate={Date.parse(filters[index]["startDate"])}
                  endDate={filters[index]["operator"] == "mtd" || filters[index]["operator"] == "ytd" ? new Date() : Date.parse(filters[index]["endDate"])}
                  showMonthDropdown
                  showYearDropdown
                  popperPlacement='bottom'
                  popperModifiers={{
                    flip: {
                      behavior: ["bottom"], // don't allow it to flip to be above
                    },
                    preventOverflow: {
                      enabled: false, // tell it not to try to stay within the view (this prevents the popper from covering the element you clicked)
                    },
                    fn: () => undefined,
                    hide: {
                      enabled: false, // turn off since needs preventOverflow to be enabled
                    },
                  }}
                  dropdownMode='select'
                />
                <DatePicker
                  className='dashboardTextField '
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
                  popperPlacement='bottom'
                  popperModifiers={{
                    flip: {
                      behavior: ["bottom"], // don't allow it to flip to be above
                    },
                    preventOverflow: {
                      enabled: false, // tell it not to try to stay within the view (this prevents the popper from covering the element you clicked)
                    },
                    fn: () => undefined,
                    hide: {
                      enabled: false, // turn off since needs preventOverflow to be enabled
                    },
                  }}
                  dropdownMode='select'
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
                className='dashboardTextField field-width-300'
                name='value'
                value={multiFilters[index] ? (Array.isArray(multiFilters[index]["value"]) ? multiFilters[index]["value"] : []) : []}
                id='value'
                key={index}
                displayValue='value'
                placeholder='Select an option'
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
            <Form.Control className='dashboardTextField field-width-150' id='value' type='text' placeholder='Enter the keyword' value={filters[index]["value"]} name='value' styles={customStyles} onChange={(e) => onUpdate(e, index, "value")} key={index} />
          )}
        </Form.Group>
      </div>

      {visibility && (
        <div className='dashboard-filter-field dash-manager-buttons'>
          <Form.Group className='dashboard-filter-field'>
            <Form.Control
              type='checkbox'
              name='isDefault'
              className='form-checkbox filter_remove_button'
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
                className=''
                style={{
                  cursor: "pointer",
                  float: "left",
                  verticalAlign: "middle",
                  position: "relative",
                }}
                onClick={(e) => removeField(index, fieldType)}>
                <i className='fa fa-minus' aria-hidden='true'></i>
              </Button>
            )}
          </Form.Group>
        </div>
      )}
    </Form.Row>
  );
};
