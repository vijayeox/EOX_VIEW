import React from "react";
import Board from "./Board";
import { Container } from "react-bootstrap";

const KanbanView = (props) => {
  const BoardData = { tasks: 6 };
  return (
    <Container style={{ backgroundColor: "#f7f9fd", padding:"1px"}} fluid>
      {/* height:"auto" */}
      <Board
        dataset={BoardData}
        key="dummy-boardId-237"
        core={props.core}
        appId={props.appId}
        filters = {props.filters}
        url={props.url}
        options={props.options}
        ymlData={props.ymlData}
      />
    </Container>
  );
};

export default KanbanView;
