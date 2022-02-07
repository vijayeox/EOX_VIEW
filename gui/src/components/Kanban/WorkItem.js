import React from "react";
import "./WorkGroup.scss";
import { ListGroup } from "react-bootstrap";
import { Draggable } from "react-beautiful-dnd";
import { Card, CardImg, CardBody } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
//import { faHistory } from "@fortawesome/fontawesome-free-solid";

const dateConvert = date => {
  const myDate = new Date(date * 1000);
  return myDate.toLocaleDateString("en-Us", {
    month: "long",
    day: "2-digit",
    year: "numeric",
  });
};

export default function WorkItem(props) {
  const CardInfo = props.cardInfo;
  return (
    <Draggable
      key={CardInfo.myId}
      draggableId={CardInfo.uuid}
      index={props.index}
    >
      {(provided, snapshot) => {
        return (
          <ListGroup.Item
            variant="dark"
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={{
              userSelect: "none",
              minHeight: "50px",
              padding: "0",
              border: "0",
              backgroundColor: snapshot.isDragging ? "white" : "white",
              ...provided.draggableProps.style,
            }}
          >
            <Card className="taskcards k_taskcards" style={{ border: "1px solid #d5d5d5", margin: "5px 0 5px 0" }}>
              <CardBody
                style={{
                  width: "100%",
                  top: "1rem",
                  padding: "0",
                  border: "0",
                }}
              >
                <div className="k_taskcardDisplay">
                  <CardImg
                    style={{
                      margin: "5px 5px 0 5px",
                      padding: "auto",
                      borderRadius: "50%",
                      backgroundColor: CardInfo.rygStatus
                    }}
                    className="img k_img"
                  />
                   <a eoxapplication="TaskApp1" file-id={CardInfo.uuid} className="k_taskcard-p">{CardInfo.name}</a>
                </div>
                <div className="mt-0 mb-0">
                  <label className="k_taskcard-label mt-0 mb-0">
                    <label className="k_taskcard-sublabel">
                      <small><strong>Created By:</strong> {CardInfo.created_by + " "}</small>
                      |
                      <small><strong> Assigned To:</strong> {CardInfo.assignedToName}</small>
                      <br />
                      <small><strong> Start:</strong> {CardInfo.start_date}</small> | 
                      <small><strong> End:</strong> {CardInfo.end_date}</small> |
                      <small><strong> Due:</strong> {CardInfo.next_action_date}</small>
                      {/* {CardInfo.status === "Completed" ?
                        <small><strong> Due:</strong> - </small>
                        :
                        <small><strong> Due:</strong> {CardInfo.date_created.substring(0, 10)}</small> | 
                        <small><strong> Start:</strong> {CardInfo.start_date}</small> | 
                        <small><strong> End:</strong> {CardInfo.end_date}</small>
                      } */}
                    </label>
                  </label>
                  {/* <FontAwesomeIcon
                    style={{
                      color: CardInfo.rygStatus,
                      float: "right",
                      fontWeight: 'bold',
                      marginRight:"5px"
                    }}
                    size="1x"
                    icon={['fal', 'history']}
                  /> */}
                </div>
              </CardBody>
            </Card>
          </ListGroup.Item>
        );
      }}
    </Draggable>
  );
}
