import React from "react";
import Board from "./Board";
import { Container } from "react-bootstrap";

const KanbanView = (props) => {
  const BoardData = { tasks: 6 };
  return (
    <Container style={{ backgroundColor: "#f7f9fd", padding:"5px"}} fluid>
      {/* height:"auto" */}
      <Board
        dataset={BoardData}
        key="dummy-boardId-237"
        core={props.core}
        appId={props.appId}
        filters = {props.filters}
      />
    </Container>
  );
};

export default KanbanView;
