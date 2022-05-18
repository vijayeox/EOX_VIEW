import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Form, Button } from 'react-bootstrap'
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
} from "reactstrap";
import "./WorkGroup.scss";
import Moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const DateRangePickerCustom = (props) => {
  const cardParameters = JSON.parse(props.ymlData.cardParameters); //start_date, end_date => cardParameters.start.name; cardParameters.end.name
  const dateFilter = props.dateFilter;
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState("lte"); //get *all* items (i.e. that have dates less than or equal to current date)
  const [ready, setReady] = useState(0);

  const toggle = () => setDropdownOpen((prevState) => !prevState);

  // Convert selected date to get MTD and YTD values
  const convertDate = (date, valueSelected) => {
    if (valueSelected === "MTD") {
      const day = 1;
      const month = date.getMonth();
      const year = date.getFullYear();
      return (new Date(year, month, day));
    } else if (valueSelected === "YTD") {
      const day = 1;
      const month = 0;
      const year = date.getFullYear();
      return (new Date(year, month, day));
    }
  }

  // trigger when Select option is changed
  const onValueChange = () => {

    switch (selectedValue) {
      case "MTD":
        let mtdmindatevalue = convertDate(endDate, "MTD");
        setStartDate(mtdmindatevalue);
        setEndDate(new Date());
        break;

      case "YTD":
        let ytdmindatevalue = convertDate(endDate, "YTD");
        setStartDate(ytdmindatevalue);
        setEndDate(new Date());
        break;

      case "Today":
        setEndDate(new Date());
        break;
    }
  }

  const updateFilter = () => {
    let filter = null;
    let mindatevalue = Moment(startDate).format("YYYY-MM-DD")
    let maxdatevalue = Moment(endDate).format("YYYY-MM-DD")

    switch (selectedValue) {
      case "Between":
        filter = [
          { field: cardParameters.start.name, operator: "gte", value: mindatevalue },
          { field: cardParameters.end.name, operator: "lte", value: maxdatevalue },
        ]
        break;

      case "MTD":
        filter = [
          { field: cardParameters.start.name, operator: "gte", value: mindatevalue },
          { field: cardParameters.end.name, operator: "lte", value: maxdatevalue },
        ]
        break;

      case "YTD":
        filter = [
          { field: cardParameters.start.name, operator: "gte", value: mindatevalue },
          { field: cardParameters.end.name, operator: "lte", value: maxdatevalue },
        ]
        break;

      case "Today":
        filter = [
          { field: cardParameters.end.name, operator: "eq", value: maxdatevalue },
        ]
        break;

    }
    props.onChildFilter("dateFilter", filter)
  }

  useEffect(() => {
    if (!ready) {
      setReady(1);
      return;
    }
    updateFilter();
  }, [startDate, endDate]);

  useEffect(() => {
    onValueChange();
  }, [selectedValue]);

  return (
    <Dropdown
      isOpen={dropdownOpen}
      toggle={toggle}
    >
      <DropdownToggle
        caret
        style={{
          backgroundColor: "transparent",
          border: "none",
          color: "black",
          fontSize: "small",
          paddingTop: "10px",
          fontWeight: "bold",
        }}
      >
        <FontAwesomeIcon
          style={{ marginRight: "5px" }}
          size='sm'
          icon={['fal', 'calendar-alt']} />
          Date Range
        </DropdownToggle>
      <DropdownMenu
        style={{
          margin: "15px",
          padding: "15px"
        }}>

        <div
          style={{
            margin: "0",
            padding: "0",
          }}
        >
          <div className="dashboard-filter-field" id="" style={{ minWidth: "auto" }}>
            <Form.Group className="dashboard-filter-field">
              <Form.Label>Date</Form.Label>
              <Form.Control className="dashboardTextField field-width-150" as="select" name="date" value={selectedValue} onChange={(e) => setSelectedValue(e.target.value)} required>
                {
                  Object.keys(dateFilter).map((item, index) => {
                    return (<option key={index} value={item}>{item}</option>)
                  })
                }
              </Form.Control>
            </Form.Group>
          </div>

          {selectedValue !== "Between" && selectedValue !== "MTD" && selectedValue !== "YTD" ?

            <div className="dashboard-filter-field" id="" style={{ minWidth: "auto" }}>
              <Form.Group className="dashboard-filter-field">
                <Form.Label className="mr-1"><small>Date</small></Form.Label>
                <DatePicker className="dashboardTextField"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  dateFormat="yyyy-MM-dd" selected={endDate} onChange={(date) => setEndDate(date)} disabled={selectedValue === "Today" ? true : false} />
              </Form.Group>
            </div>

            :

            <div className="dates-container">
              <div className="dashboard-filter-field" id="" style={{ minWidth: "auto" }}>
                <Form.Group className="dashboard-filter-field">
                  <Form.Label className="mr-1"><small>From</small></Form.Label>
                  <DatePicker className="dashboardTextField"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    dateFormat="yyyy-MM-dd" selected={startDate} onChange={(date) => setStartDate(date)} disabled={((selectedValue === "MTD") || (selectedValue === "YTD")) ? true : false} />
                </Form.Group>
              </div>
              <div className="dashboard-filter-field" id="" style={{ minWidth: "auto" }}>
                <Form.Group className="dashboard-filter-field">
                  <Form.Label className="mr-1"><small>To</small></Form.Label>
                  <DatePicker className="dashboardTextField"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    dateFormat="yyyy-MM-dd" selected={endDate} onChange={(date) => setEndDate(date)} disabled={((selectedValue === "MTD") || (selectedValue === "YTD")) ? true : false} />
                </Form.Group>
              </div>
            </div>
          }
          <div><Button id="k_button" onClick={() => props.setFilterFromProps()} disabled={(startDate > endDate) ? true : false}> Submit </Button></div>
        </div>
      </DropdownMenu>
    </Dropdown>
  );
};

export default DateRangePickerCustom;