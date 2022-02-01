import React, { useEffect, useState } from "react";
import Work from "./WorkGroup";
import { ListGroup, Button, Badge, Container } from "react-bootstrap";
import { DragDropContext } from "react-beautiful-dnd";
import "./WorkGroup.scss";
import Requests from "../../Requests";
import DateRangePickerCustom from "./DateRangePickerCustom";
import Searchbar from './Searchbar';
import AssignedTo from "./AssignedTo";
// import StatusCard from "./ColumnCounts";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Board(props) {
  const dateFilter = props.filters.dateFilter;
  const [fields, setFields] = useState([]);
  const [fieldset, setFieldset] = useState([]);
  const [Refresh, setRefresh] = useState(true);
  const [Reload, setReload] = useState(false);
  const [priority, setPriority] = useState("All");
  const [Filter, setFilter] = useState([]);
  var tempArray = [];

  const onDragEnd = (result, setRefresh, setReload, props) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    let url = "/app/" + props.appId + "/file/crud/" + draggableId // also add entity_ID
    let rygColor;
    if (destination.droppableId === "Delayed") rygColor = "Red";
    else if (destination.droppableId === "In Progress") rygColor = "Yellow";
    else if (destination.droppableId === "Completed" || destination.droppableId === "Open") rygColor = "Green";

    Requests.doRestRequest(
      props.core,
      url,
      { uuid: draggableId, status: destination.droppableId, rygStatus: rygColor }, //set particular status for this particular UUID
      'put',
      function () { },
      function (e) {
        console.log("Error Couldn't update the File " + e);
      });
    setReload(true);
    setRefresh(true);
  };

  useEffect(() => {
    if (Refresh) {
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
          setRefresh(false);
        },
        function (error) {
          console.log("error " + error)
        });
    }
  }, [Refresh]);

  const filterMaker = (status) => {
    tempArray = [];
    tempArray.push({ field: "status", operator: "eq", value: status }); // if status = all, call 4 api
    console.log("In filtermaker",tempArray,Filter,Filter.length,);
    if (Filter.length > 0) {
      tempArray = tempArray.concat(Filter);
    }
    return tempArray;
  };

  // DateRangePickerCustom - onDateRange, Search
  const setFilterFromProps = (filterFromProps) => {
    console.log("filterFromProps",filterFromProps);
    if (filterFromProps === null || filterFromProps === 0) return;
    setFilter(filterFromProps);
  };

  return (
    <Container fluid>
      <div className="expense-item k_expense-item">
        <div style={{ display: "flex", alignItems: "center" }}>
          {/* Date Filter hidden because it should get populated from Apppbuilder */}
          <Badge>
            <DateRangePickerCustom dateFilter={dateFilter} onDateRange={setFilterFromProps} />
          </Badge>
          {/* <Badge>
            <AssignedTo getAssignedToFilter={setFilterFromProps} core={props.core}/>
          </Badge> */}

          <Button variant="link"
            style={{
              color: "black",
              fontWeight: 400
            }}
            className="mt-2"
          >
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
                  setRefresh(true);
                }}
              >
                <option value="All"> ALL</option>
                {fields.map((e) => {
                  return <option key={e.value} value={e.value}>{e.label}</option>;
                })}
              </select>
            </Badge>
          </Button>
        </div>
        <div style={{ display: "flex", alignItems: "center", marginLeft: "auto" }}>
          <Badge>
            <Searchbar getSearchFilter={setFilterFromProps} core={props.core} />
          </Badge>
        </div>
      </div>

      <DragDropContext
        onDragEnd={(result) => onDragEnd(result, setRefresh, setReload, props)}
      >
        <ListGroup horizontal className="mt-1 mb-1">
          {fieldset.map((dataItem, index) => {
            return (
              <Work
                core={props.core}
                appId={props.appId}
                info={dataItem}
                filter={filterMaker(dataItem.value)}
                index={index}
                key={index}
                priority={priority}
              />
            );
          })}
        </ListGroup>
      </DragDropContext>
    </Container>
  );
}
