import React, { useState, useEffect } from "react";

import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file

import { DateRangePicker } from 'react-date-range';
// // import "react-calendar/dist/Calendar.css";
import "./WorkGroup.scss";
import Moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  Collapse,
  Button,
  CardBody,
  Row,
  Col,
  Label,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import { Container } from "react-bootstrap";
// // import "./Css/kunbun.css";
// // import { faCalendarAlt } from "@fortawesome/fontawesome-free-solid";

function CalenderDropDown(props) {
  const [value, setValue] = useState(new Date());
  const [value1, setValue1] = useState(new Date());

  const [start, setStart] = useState();
  const [end, setEnd] = useState();

  const [lowerRange, setlowerRange] = useState(null);
  const [higherRange, sethigherRange] = useState(null);

  const [Open, setOpen] = useState(false);
  const [range, setRange] = useState(null);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dates, setDates] = useState([]);
  const [apiDate, setApiDates] = useState([]);

  const toggle = () => setDropdownOpen((prevState) => !prevState);
  const droptoggle = () => setOpen((prevState) => !prevState);

  const onChange = (date) => {
    let date1 = date.range1.startDate
    let date11 = Moment(date1).format("YYYY-MM-DD")
    let date2 = date.range1.endDate
    let date21 = Moment(date2).format("YYYY-MM-DD")
    setlowerRange(date11);
    sethigherRange(date21);
    //setValue(date);
  };

  const onChange1 = (date) => {
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    const newDate = new Date(year, month - 1, day);

    setValue(newDate);

    setValue1(date);
  };

  useEffect(() => {
    const day = value.getDate();
    const month = value.getMonth();
    const year = value.getFullYear();
    const newDate = new Date(year, month + 1, day);

    setValue1(newDate);
  }, [value]);

  const onSelectRange = (range) => {
    const day = value.getDate();
    const month = value.getMonth();
    const year = value.getFullYear();
    var newDate = new Date();

    if (range === "30") {
      newDate = new Date(year, month + 1, day);
    } else if (range === "-30") {
      newDate = new Date(year, month - 1, day);
    } else if (range === "-7") {
      newDate = new Date(year, month, day - 7);
    } else if (range === "7") {
      newDate = new Date(year, month, day + 7);
    }

    setValue1(newDate);
    const date2 = Moment.utc(value).format("YYYY-MM-DD");


    const date1 = Moment(newDate).format("YYYY-MM-DD");

    switch (range) {
      case "-7":
      case "-30":
        setlowerRange(date1);
        sethigherRange(date2);
        setStart(newDate);
        setEnd(value);

        break;
      case "7":
      case "30":
        setlowerRange(date2);
        setStart(value);
        setEnd(newDate);
        sethigherRange(date1);

        break;
      default:
        alert("");
        break;
    }
  };
  const DateConv = (dateValue) => {
    const myDate = new Date(dateValue);

    const myEpoch = myDate.getTime() / 1000.0;

    return myEpoch;
  };
  const buttonClick = () => {
    const mindateRanges = DateConv(lowerRange);
    const maxdateRanges = DateConv(higherRange);

    props.onDateRange(lowerRange, higherRange);
    const apidateRange = [
      {
        filters: {
          filter: {
            logic: "and",
            filters: [
              { field: "status", operator: "eq", value: "Completed" },
              {
                field: "start_date",
                operetor: "gte",
                value: lowerRange,
              },
              { field: "end_date", operetor: "lte", value: higherRange },
            ],
          },
        },
      },
    ];

    setApiDates(apidateRange);

  };


  const disabledDates = [];

  if (start && end) {
    var dt = new Date(start);

    while (dt <= end) {
      disabledDates.push(new Date(dt));

      dt.setDate(dt.getDate() + 1);
    }

    while (dt >= end) {
      disabledDates.push(new Date(dt));

      dt.setDate(dt.getDate() - 1);
    }
  }
  useEffect(() => {
    buttonClick();
  }, []);

  return (
    <Dropdown
      isOpen={dropdownOpen}
      toggle={toggle}
      style={{ display: "flex", flexDirection: "row" }}
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
        <FontAwesomeIcon style={{ marginRight: "5px" }} size='sm' icon={['fal', 'calendar-alt']} />
          Date Range
        </DropdownToggle>
      <DropdownMenu style={{ margin: "0", padding: "0" }}>
        <DropdownItem
          style={{
            display: "flex",
            flexDirection: "row",
            margin: "0",
            padding: "0",
          }}
          toggle={false}
          className="hover"
        >
          {/* <div className="containerbox"> */}
          <DateRangePicker
            onChange={onChange}
            //showDoubleView={true}
            /*tileDisabled={({ date, view }) =>
               view === "month" && // Block day tiles only
              disabledDates.some(
                (disabledDate) =>
                  date.getFullYear() === disabledDate.getFullYear() &&
                  date.getMonth() === disabledDate.getMonth() &&
                  date.getDate() === disabledDate.getDate()
              )
            }*/
            //value={value}
            showSelectionPreview={false}
            ranges={[disabledDates]}
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", flexDirection: "row" }}>
              <label className="label-calendar k_label-calendar">Select Range</label>

              <select
                className="select-input"
                id="calendarSelect"
                style={{
                  width: "40%",
                  padding: "2px",
                  height: "35px",
                  marginLeft: "0px",
                  border: "none",
                  backgroundColor: "white",
                  fontSize: "medium",
                  marginTop: "2.5rem",
                }}
                name="range"
                onChange={(e) => {
                  setRange(e.target.value);
                  onSelectRange(e.target.value);
                }}
              >
                <option value="select" selected>
                  Select
                </option>
                <option value="-7">Last Week</option>
                <option value="-30">Last Month</option>
                <option value="7">Next Week</option>
                <option value="30">Next Month</option>
              </select>
            </div>

            <br />
            <br />

            <div style={{ display: "flex", flexDirection: "row" }}>
              <input
                id="cal_start_inp"
                type="date"
                value={lowerRange}
                disabled
                className="input k_input"
              />

              <p
                style={{
                  fontWeight: "bold",
                  marginLeft: "0",
                  display: "block",
                  paddingLeft: "1rem",
                }}
              >
                -
              </p>

              <input
                id="cal_end_inp"
                type="date"
                value={higherRange}
                disabled
                className="input k_input"
                style={{ marginRight: "1rem" }}
              />
            </div>
            <br />

            <Button
              id="k_button"
              onClick={() => {
                buttonClick();
                toggle();
              }}
            >
              Submit
            </Button>
          </div>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
export default CalenderDropDown;
