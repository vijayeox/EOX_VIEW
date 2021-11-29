import React from "react";
import Board from "./Board";
import { Container } from "react-bootstrap";

const KanbanView = (props) => {
  const BoardData = { tasks: 6 };
  return (
    <Container style={{backgroundColor: "#f7f9fd"}} fluid>
      <Board dataset={BoardData} key="dummy-boardId-237" core={props.core} appId={props.appId} />
      {/* <h1>Kanban view</h1> */}
    </Container>
  );
};

export default KanbanView;
