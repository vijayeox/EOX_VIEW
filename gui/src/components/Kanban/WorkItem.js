import React from "react";
import "./WorkGroup.scss";
import { Container, ListGroup } from "react-bootstrap";
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
              <Card className="taskcards k_taskcards" style={{ border: "0" }}>
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
                        margin: "5px",
                        padding: "auto",
                        borderRadius: "50%",
                      }}
                      className="img k_img"
                      src="https://source.unsplash.com/user/c_v_r/100x100"
                    />
                    {/*<FontAwesomeIcon
                    size="1.5x"
                    icon={['fal', 'user-circle']}
                     /> */}

                    <p className="k_taskcard-p">{CardInfo.created_by}</p>
                  </div>
                  <div>
                    <label className="k_taskcard-label">
                      <label className="k_taskcard-sublabel"> Due:</label>{" "}
                      {CardInfo.date_created.substring(0, 10)}
                    </label>
                    <FontAwesomeIcon
                      style={{
                        color: CardInfo.rygStatus,
                        float: "right",
                        fontWeight: 'bold'
                      }}
                      size="1x"
                      icon={['fal', 'history']}
                    />
                  </div>
                </CardBody>
              </Card>
            </ListGroup.Item>
          );
        }}
      </Draggable>
  );
}
