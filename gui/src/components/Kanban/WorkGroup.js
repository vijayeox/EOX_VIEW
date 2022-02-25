import React, { useState, useEffect, useRef, useCallback } from "react";
import ListGroup from "react-bootstrap/ListGroup";
import { Droppable } from "react-beautiful-dnd";
import "./WorkGroup.scss";
import Item from "./WorkItem";

export default function Work(props) {
  const [Query, setQuery] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [Loading, setLoading] = useState(true);
  const [Error, setError] = useState(false);
  const [List, setList] = useState([]);
  const [Count, setGroupCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [filters, setFilters] = useState(props.filter);


  const Observer = useRef()

  const doRestRequestCall = async (url) => {
    const helper = props.core.make("oxzion/restClient");
    let response = await helper.request("v1", url, {}, "get");
    return response;
  }

  const lastItem = useCallback(node => {

    if (Loading) return
    if (Observer.current) Observer.current.disconnect()
    Observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        var params = [{
          "filter": {
            "logic": "and",
            "filters": props.filter
          },
          "sort": [{
            "field": "next_action_date",
            "dir": "desc"
          }],
          "skip": List.length,

          "take": 10
        }]
        setLoading(true)
        setError(false)

        let url = props.url + JSON.stringify(params)
        doRestRequestCall(url)
          .then((res) => {
            setList(List => {
              return [...List, ...res.data]
            })
            setHasMore(res.data.length > 0)
            setLoading(false)
          })
          .catch(() => setError(true))
      }
    })
    if (node) Observer.current.observe(node)

  }, [Loading, hasMore])

  useEffect(() => {
    setList([])
  }, [Query])

  useEffect(() => {
    var params = [{
      "filter": {
        "logic": "and",
        "filters": props.filter
      },
      "sort": [{
        "field": "next_action_date",
        "dir": "desc"
      }],
      "skip": 0,
      "take": 10
    }]

    setLoading(true)
    setError(false)

    let url = props.url + JSON.stringify(params)
    doRestRequestCall(url)
      .then((res) => {
        setList(res.data)
        setGroupCount(res.total)
        setHasMore(res.data.length > 0)
        setLoading(false)

      })
      .catch(() => setError(true))

  }, [props])

  return (
    <>
      <ListGroup.Item
        style={{
          minWidth: "22vw",
          minHeight: "75vh",
          margin: "0 5px 0 5px",
          padding: "0 5px 0 5px",
        }}>
        <Droppable
          droppableId={props.info.value}
          key={props.index}
          style={{ width: "100% !important" }}>
          {(provided, snapshot) => {
            return (
              <ListGroup
                {...provided.droppableProps}
                ref={provided.innerRef}
                style={{
                  background: snapshot.isDraggingOver ? "lightblue" : "white",
                  padding: 0,
                  width: "100%",
                  // height: "100%",
                  minHeight: "30vh",
                  top: "50%"
                }}
              >
                <ListGroup.Item
                  className="itemCard k_itemCard"
                  style={{
                    border: "0",
                    borderBottom: '2px solid black',
                    width: "100%"
                  }}
                >
                    <h3>
                      <b>{props.info.label}</b><small> ({Count})</small>
                    </h3>
                </ListGroup.Item>

                { (props.priority === "All") || (props.priority === props.info.value) ?
                  <div className="listDiv k_listDiv">
                    {List != undefined ?
                      List.map((listItem, index) => {
                        if (List.length === index + 1) {
                          return (
                            <div ref={lastItem}>
                              <Item
                                cardInfo={listItem}
                                ymlData={props.ymlData}
                                index={index}
                                key={index}
                              />
                            </div>
                          );
                        } else {
                          return (
                            <Item
                              cardInfo={listItem}
                              ymlData={props.ymlData}
                              index={index}
                              key={index}
                            />
                          );
                        }

                      })

                      : console.log("false")}
                    <div>{Loading && 'Loading...'}</div>
                    <div>{Error && 'Error'}</div>

                  </div>
                  :
                  <div></div>
                }
              </ListGroup>
            );
          }}
        </Droppable>
      </ListGroup.Item>
    </>
  );
}
