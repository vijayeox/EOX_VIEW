import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Col, Form, Row, Button } from 'react-bootstrap'
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import "./WorkGroup.scss";
import Moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// CSS Modules, react-datepicker-cssmodules.css
// import 'react-datepicker/dist/react-datepicker-cssmodules.css';

const customStyles = {
  control: base => ({
    ...base,
    height: 38,
    minHeight: 38
  }),
  valueContainer: base => ({
    ...base,
    height: 'inherit',
    minHeight: 'inherit'
  })

};

const DateRangePickerCustom = (props) => {

  let dateDisabled = false;

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState();

  const toggle = () => setDropdownOpen((prevState) => !prevState);

  // Convert selected date to get MTD and YTD values
  const convertDate = (date, valueSelected) => {
    if (valueSelected === "mtd") {
      const day = 1;
      const month = date.getMonth();
      const year = date.getFullYear();
      return (Moment(new Date(year, month, day)).format("YYYY-MM-DD"));
    } else {
      const day = 1;
      const month = 0;
      const year = date.getFullYear();
      return (Moment(new Date(year, month, day)).format("YYYY-MM-DD"));
    }
  }

  
  const buttonClick = () => {
    let filter = null;
    let mindatevalue = Moment(startDate).format("YYYY-MM-DD")
    let maxdatevalue = Moment(endDate).format("YYYY-MM-DD")

    switch (selectedValue) {
      case "between":
        dateDisabled = false;
        filter = [
          { field: "start_date", operator: "gte", value: mindatevalue },
          { field: "end_date", operator: "lte", value: maxdatevalue },
        ]
        break;

      case "lte":
        dateDisabled = false;
        filter = [
          { field: "end_date", operator: "lte", value: maxdatevalue },
        ]

      case "gte":
        dateDisabled = false;
        filter = [
          { field: "end_date", operator: "gte", value: maxdatevalue },
        ]

      case "mtd":
        dateDisabled = true;
        let mtdmindatevalue = convertDate(endDate, "mtd");
        setStartDate(mtdmindatevalue);
        setEndDate(new Date());
        filter = [
          { field: "start_date", operator: "gte", value: mtdmindatevalue },
          { field: "end_date", operator: "lte", value: maxdatevalue },
        ]

      case "ytd":
        dateDisabled = true;
        let ytdmindatevalue = convertDate(endDate, "ytd");
        setStartDate(ytdmindatevalue);
        setEndDate(new Date());
        filter = [
          { field: "start_date", operator: "gte", value: ytdmindatevalue },
          { field: "end_date", operator: "lte", value: maxdatevalue },
        ]

      case "today":
        dateDisabled = true;
        // today's date
        setEndDate(new Date());
        filter = [
          { field: "end_date", operator: "eq", value: maxdatevalue },
        ]

      default:
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
              <Form.Control className="dashboardTextField field-width-150" as="select" name="date" onChange={(e) => setSelectedValue(e.target.value)} required>
                <option key="-1" value="-1" defaultValue>Select Filter</option>

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
                  dateFormat="yyyy-MM-dd" selected={endDate} onChange={(date) => setEndDate(date)} disabled={dateDisabled}/>
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
                    dateFormat="yyyy-MM-dd" selected={startDate} onChange={(date) => setStartDate(date)} disabled={dateDisabled} />
                </Form.Group>
              </div>
              <div className="dashboard-filter-field" id="" style={{ minWidth: "auto" }}>
                <Form.Group className="dashboard-filter-field">
                  <DatePicker className="dashboardTextField"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    dateFormat="yyyy-MM-dd" selected={endDate} onChange={(date) => setEndDate(date)} disabled={dateDisabled} />
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