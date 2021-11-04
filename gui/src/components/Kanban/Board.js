import React, { useEffect, useState } from "react";
import Work from "./WorkGroup";
import { ListGroup, Button, Badge } from "react-bootstrap";
import { DragDropContext } from "react-beautiful-dnd";
import StatusCard from "./ColumnCounts";
import "./WorkGroup.css";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
//import {faUserAlt, faEye,} from "@fortawesome/fontawesome-free-solid";
import CalenderDropDown from "./CalendarDropdown";
import authorizationValue from "./Authorization";

const onDragEnd = (result, setRefresh, setReload) => {
  if (!result.destination) return;

  console.log(result);
  const { draggableId, destination } = result;

  axios
    .put(
      "https://qa3.eoxvantage.com:9080/app/454a1ec4-eeab-4dc2-8a3f-6a4255ffaee1/file/crud/" +
        draggableId,
      { status: destination.droppableId },
      {
        headers: {
          Authorization: authorizationValue,
        },
      }
    )
    .then(() => {
      setReload(true);
      setRefresh(true);
    })
    .catch((e) => console.log("Error Couldn't update the File " + e));
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
    axios
      .get(
        "https://qa3.eoxvantage.com:9080/app/454a1ec4-eeab-4dc2-8a3f-6a4255ffaee1/field/b0fd5ad1-607b-11eb-a441-06a328860aa2",
        {
          headers: {
            authorization: authorizationValue,
          },
        }
      )
      .then((res) => {
        var tempField;
        tempField = JSON.parse(res.data.data.options);
        setFieldset([]);
        // console.log(tempField.values)
        setFields(tempField.values);
        setFieldset(tempField.values);

      })
      .catch((error) => console.log("error " + error));
  }, [Refresh]);

  const dateRangeHandler = (mindatevalue, maxdatevalue) => {
    if (mindatevalue === null || mindatevalue === 0) return;
    if (maxdatevalue === null || maxdatevalue === 0) return;

    setFilter([
      { field: "start_date", operator: "gte", value: mindatevalue },
      { field: "end_date", operator: "lte", value: maxdatevalue },
    ]);
  };

  const filterMaker = (status) => {
    var tempArray = [];

    tempArray.push({ field: "status", operator: "eq", value: status });

    if (Filter.length > 0) {
      console.log("inside if");

      tempArray = tempArray.concat(Filter);
    }

    return tempArray;
  };
  console.log("In board component")

  return (
    <div>
      <div className="expense-item">

        <Button variant="link" style={{ color: "black" }}>
        <Badge>
            <CalenderDropDown onDateRange={dateRangeHandler} />
          </Badge>
           <Badge>
                  <div>
                     <FontAwesomeIcon   size = 'sm' icon={['fal', 'user-friends']}  /> Users
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
                     <FontAwesomeIcon   size = 'sm' icon={['fal', 'eye']}  /> Views
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
        </Button>
      </div>
      <ListGroup horizontal>
        {fields.map((dataItem, index) => {
          return (
            <StatusCard
               statusInfo={dataItem}
               filter={filterMaker(dataItem.value)}
               key={index}
               index={index}
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
                info={dataItem}
                filter={filterMaker(dataItem.value)}
                index={index}
                key={index}
              /> 
            );
          })}
        </ListGroup>
      </DragDropContext>
    </div>
  );
}
