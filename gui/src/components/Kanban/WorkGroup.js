import React, { useState, useEffect, useRef, useCallback} from "react";
import ListGroup from "react-bootstrap/ListGroup";
import { Droppable } from "react-beautiful-dnd";
import "./WorkGroup.css";
import Item from "./WorkItem";
import axios from "axios";
import authorizationValue from './Authorization'

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
  const lastItem = useCallback(node => {

    if(Loading) return
    if(Observer.current) Observer.current.disconnect()
      Observer.current = new IntersectionObserver(entries =>{
        if(entries[0].isIntersecting && hasMore){
          // console.log(props.info.value + 'End Element Visible' + List.length)
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
          axios.get('https://qa3.eoxvantage.com:9080/app/454a1ec4-eeab-4dc2-8a3f-6a4255ffaee1/file/search?filter='+ JSON.stringify(params),
            {headers:{
              authorization : authorizationValue
            }
          })
        .then((res) =>{ 
            setList( List => {
              return [...List, ...res.data.data]
            })
            setHasMore(res.data.data.length > 0)
            setLoading(false)
          })
          .catch(()=> setError(true))
        }
      })
      if(node) Observer.current.observe(node)

  },[Loading, hasMore])

  useEffect(() => {
    setList([])
  }, [Query])

  useEffect(() => {

    console.log(props.filter)
    console.log(List.length)

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
    axios.get('https://qa3.eoxvantage.com:9080/app/454a1ec4-eeab-4dc2-8a3f-6a4255ffaee1/file/search?filter='+ JSON.stringify(params),
    {headers:{
      authorization :authorizationValue
    }
  })
    .then((res) =>{ 
        console.log(res.data)
        setList(res.data.data)
        setGroupCount(res.data.total)
        setHasMore(res.data.data.length > 0)
        setLoading(false)
        
      })
      .catch(()=> setError(true))
      
  },[props])

  // console.log(props)

  return (
    <>
      <ListGroup.Item>
        <Droppable droppableId={props.info.value} key={props.index}>
          {(provided, snapshot) => {
            return (
              <ListGroup
                {...provided.droppableProps}
                ref={provided.innerRef}
                style={{
                  background: snapshot.isDraggingOver ? "lightblue" : "white",
                  padding: 0,
                  width: 200,
                  minHeight: 400,
                }}
              >
                <ListGroup.Item
                  className="itemCard"
                  style={{ border: "0", borderBottom: '2px solid black' }}
                >
                  <p >
                    <b>  
                      {props.info.label} ({Count})
                    </b>
                  </p>
                </ListGroup.Item>

                <div className="listDiv">
                  {List != undefined ? 
                        List.map((listItem, index) => {
                          if(List.length === index+1){
                            return (
                              <div ref={lastItem}>
                                <Item
                                  cardInfo={listItem}
                                  index={index}
                                  key={index}
                                />
                                </div>
                            );
                          }else{
                            // console.log(" Inside else")
                            return (
                              <Item
                                cardInfo={listItem}
                                index={index}
                                key={index}
                              />
                            );
                          }
                          
                        })
                      
                        // console.log(List)                        
                        : console.log("false") }
                        <div>{Loading && 'Loading...'}</div>
                        <div>{Error && 'Error'}</div>
                        
                </div>
              </ListGroup>
            );
          }}
        </Droppable>
      </ListGroup.Item>
    </>
  );
}
