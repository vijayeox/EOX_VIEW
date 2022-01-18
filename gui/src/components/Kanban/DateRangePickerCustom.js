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

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState("lte"); //get *all* items (i.e. that have dates less than or equal to current date)

  const toggle = () => setDropdownOpen((prevState) => !prevState);

  // Convert selected date to get MTD and YTD values
  const convertDate = (date, valueSelected) => {
    if (valueSelected === "mtd") {
      const day = 1;
      const month = date.getMonth();
      const year = date.getFullYear();
      return (new Date(year, month, day));
    } else {
      const day = 1;
      const month = 0;
      const year = date.getFullYear();
      return (new Date(year, month, day));
    }
  }

  // trigger when Select option is changed
  const onValueChange = () => {

    switch (selectedValue) {
      case "mtd":
        let mtdmindatevalue = convertDate(endDate, "mtd");
        setStartDate(mtdmindatevalue);
        setEndDate(new Date());
        break;

      case "ytd":
        let ytdmindatevalue = convertDate(endDate, "ytd");
        setStartDate(ytdmindatevalue);
        setEndDate(new Date());
        break;

      case "today":
        setEndDate(new Date());
        break;
    }
  }

  // When Submit is clicked
  const buttonClick = () => {
    let filter = null;
    let mindatevalue = Moment(startDate).format("YYYY-MM-DD")
    let maxdatevalue = Moment(endDate).format("YYYY-MM-DD")

    switch (selectedValue) {
      case "between":
        filter = [
          { field: "start_date", operator: "gte", value: mindatevalue },
          { field: "end_date", operator: "lte", value: maxdatevalue },
        ]
        break;

      case "lte":
        filter = [
          { field: "end_date", operator: "lte", value: maxdatevalue },
        ]
        break;

      case "gte":
        filter = [
          { field: "end_date", operator: "gte", value: maxdatevalue },
        ]
        break;

      case "mtd":
        filter = [
          { field: "start_date", operator: "gte", value: mindatevalue },
          { field: "end_date", operator: "lte", value: maxdatevalue },
        ]
        break;

      case "ytd":
        filter = [
          { field: "start_date", operator: "gte", value: mindatevalue },
          { field: "end_date", operator: "lte", value: maxdatevalue },
        ]
        break;

      case "today":
        filter = [
          { field: "end_date", operator: "eq", value: maxdatevalue },
        ]
        break;

    }
    props.onDateRange(filter);
  };

  const filtersOptions = {
    "dateoperator": [{ "Between": "between" }, { "Less Than": "lte" }, { "Greater Than": "gte" }, { "MTD": "mtd" }, { "YTD": "ytd" }, { "Today": "today" }]
  };

  useEffect(() => {
    buttonClick();
  }, []);

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
              <Form.Control className="dashboardTextField field-width-150" as="select" name="date" onChange={(e) => { setSelectedValue(e.target.value); onValueChange(); }} required>
                {filtersOptions['dateoperator'].map((item, mapindex) => {
                  return (<option key={mapindex} value={Object.values(item)[0]}>{Object.keys(item)[0]}</option>)
                })}

              </Form.Control>
            </Form.Group>
          </div>

          {selectedValue !== "between" && selectedValue !== "mtd" && selectedValue !== "ytd" ?

            <div className="dashboard-filter-field" id="" style={{ minWidth: "auto" }}>
              <Form.Group className="dashboard-filter-field">
                <DatePicker className="dashboardTextField"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  dateFormat="yyyy-MM-dd" selected={endDate} onChange={(date) => setEndDate(date)} disabled={selectedValue === "today" ? true : false} />
              </Form.Group>
            </div>

            :

            <div className="dates-container">
              <div className="dashboard-filter-field" id="" style={{ minWidth: "auto" }}>
                <Form.Group className="dashboard-filter-field">
                  <DatePicker className="dashboardTextField"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    dateFormat="yyyy-MM-dd" selected={startDate} onChange={(date) => setStartDate(date)} disabled={((selectedValue === "mtd") || (selectedValue === "ytd")) ? true : false} />
                </Form.Group>
              </div>
              <div className="dashboard-filter-field" id="" style={{ minWidth: "auto" }}>
                <Form.Group className="dashboard-filter-field">
                  <DatePicker className="dashboardTextField"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    dateFormat="yyyy-MM-dd" selected={endDate} onChange={(date) => setEndDate(date)} disabled={((selectedValue === "mtd") || (selectedValue === "ytd")) ? true : false} />
                </Form.Group>
              </div>
            </div>

          }
          <div><Button id="k_button" onClick={() => { buttonClick() }}> Submit </Button></div>
        </div>
      </DropdownMenu>
    </Dropdown>
  );
};

export default DateRangePickerCustom;