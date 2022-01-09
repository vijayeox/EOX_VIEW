import React, { useEffect, useState } from "react";
import Work from "./WorkGroup";
import { ListGroup, Button, Badge, Container } from "react-bootstrap";
import { DragDropContext } from "react-beautiful-dnd";
import StatusCard from "./ColumnCounts";
import "./WorkGroup.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
//import {faUserAlt, faEye,} from "@fortawesome/fontawesome-free-solid";
import CalenderDropDown from "./CalendarDropdown";
import Requests from "../../Requests";

import DateRangePickerCustom from "./DateRangePickerCustom";

const onDragEnd = (result, setRefresh, setReload, props) => {
  if (!result.destination) return;
  const { draggableId, destination } = result;

  let url = "/app/" + props.appId + "/file/crud"
  Requests.doRestRequest(
    props.core,
    url,
    {},
    'put',
    function () {
      setReload(true);
      setRefresh(true);
    },
    function (e) {
      console.log("Error Couldn't update the File " + e);
    });
};

export default function Board(props) {
  const [fields, setFields] = useState([]);
  const [fieldset, setFieldset] = useState([]);
  const [Refresh, setRefresh] = useState(false);
  const [Reload, setReload] = useState(false);
  const [priority, setPriority] = useState("All");
  const [minDate, setMinDate] = useState(null);
  const [maxDate, setMaxDate] = useState(null);
  const [Filter, setFilter] = useState([]);

  useEffect(() => {
    let url = "/app/" + props.appId + "/field/b0fd5ad1-607b-11eb-a441-06a328860aa2"
    Requests.doRestRequest(
      props.core,
      url,
      {},
      'get',
      function (response) {
        var tempField;
        tempField = JSON.parse(response.options);
        setFieldset([]);
        setFields(tempField.values);
        setFieldset(tempField.values);
      },
      function (error) {
        console.log("error " + error)
      });

  }, [Refresh]);

  const filterMaker = (status) => {
    var tempArray = [];

    tempArray.push({ field: "status", operator: "eq", value: status });

    if (Filter.length > 0) {
      tempArray = tempArray.concat(Filter);
    }

    return tempArray;
  };

  // DateRangePickerCustom - onDateRange
  const setFilterFromProps = (filter) => {
    if (filter === null || filter === 0) return;
    setFilter(filter);
  };

  return (
    <Container fluid>
      <div className="expense-item k_expense-item">
        <Badge>
          <DateRangePickerCustom onDateRange={setFilterFromProps} />
        </Badge>

        <Button variant="link"
          style={{
            color: "black",
            fontWeight: 400
          }}>
          <Badge>
            <div>Status</div>
          </Badge>
          <Badge>
            <select
              className="form-control"
              style={{
                fontSize: "small",
                borderColor: "transparent",
                outlineColor: "transparent",
                background: "transparent",
              }}
              name="Status"
              onChange={(e) => {
                setPriority(e.target.value);
              }}
            >
              <option value="All"> ALL</option>
              {/* Dynamic values */}
              {fields.map((e) => {
                return <option key={e.value} value={e.value}>{e.label}</option>;
              })}
            </select>
          </Badge>
        </Button>

        {/* <Button variant="link" style={{ color: "black" }}>
          <Badge>
            <div>
              <FontAwesomeIcon size='sm' icon={['fal', 'user-friends']} /> Users
            </div>
          </Badge>

          <Badge>
            <select
              className="form-control"
              style={{
                fontSize: "small",
                borderColor: "transparent",
                outlineColor: "transparent",
                background: "transparent",
              }}
              name="priority"
              onChange={(e) => {
                setPriority(e.target.value);
              }}
            >
              <option value="All"> ALL</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </Badge>
        </Button>
        <Button variant="link" style={{ color: "black", fontWeight: 400 }}>
          <Badge>
            <div>Priority</div>
          </Badge>

          <Badge>
            <select
              className="form-control"
              style={{
                fontSize: "small",
                borderColor: "transparent",
                outlineColor: "transparent",
                background: "transparent",
              }}
              name="priority"
              onChange={(e) => {
                setPriority(e.target.value);
              }}
            >
              <option value="All"> ALL</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </Badge>
        </Button>
                
        <Button variant="link" style={{ color: "black", fontWeight: 400 }}>
          <Badge>
            <div>
              <FontAwesomeIcon size='sm' icon={['fal', 'eye']} /> Views
                  </div>
          </Badge>

          <Badge>
            <select
              className="form-control"
              style={{
                fontSize: "small",
                borderColor: "transparent",
                background: "transparent",
                outlineColor: "transparent",
              }}
              name="priority"
            >
              <option value="All"> </option>
            </select>
          </Badge>
        </Button> */}

      </div>
      <ListGroup horizontal>
        {fields.map((dataItem, index) => {
          return (
            <StatusCard
              statusInfo={dataItem}
              filter={filterMaker(dataItem.value)}
              key={index}
              index={index}
              core={props.core}
              appId={props.appId}
            />
          );
        })}
      </ListGroup>

      <br />
      <DragDropContext
        onDragEnd={(result) => onDragEnd(result, setRefresh, setReload)}
      >
        <ListGroup horizontal >
          {fieldset.map((dataItem, index) => {
            return (
              <Work
                core={props.core}
                appId={props.appId}
                info={dataItem}
                filter={filterMaker(dataItem.value)}
                index={index}
                key={index}
              />
            );
          })}
        </ListGroup>
      </DragDropContext>
    </Container>
  );
}
