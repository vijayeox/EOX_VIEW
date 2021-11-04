import { Card, Container, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faHistory } from '@fortawesome/fontawesome-free-solid';
import './ColumnCount.css';
import colorHandler from './ColorCodes'
import axios from'axios';
import React,{ useState } from 'react';
// //import  apiForCount from './ApiAcess'
import authorizationValue from './Authorization'

 function ColumnCard(props){

     const [Count, setCount] = useState('0');

//     // console.log(props)
    
     function apiForCount(){
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

         axios.get('https://qa3.eoxvantage.com:9080/app/454a1ec4-eeab-4dc2-8a3f-6a4255ffaee1/file/search?filter='+ JSON.stringify(params),{headers:{
             authorization :authorizationValue
         }})
         .then((res)=> {setCount(res.data.total)})
         .catch((error) =>{console.log(error)})

         return Count
     }
    console.log(Count)

     return (
             <Card  style={{border:'0', boxShadow: '0px 3px 2px lightgrey'}}>
                
                 <Card.Body style={{padding:'0.5em',}}>
                     <Container fluid>
                         <Row>
                             <Col lg="auto" sm="auto" md="auto" >
                                 <FontAwesomeIcon className="cardIcon" style={{color: colorHandler(props.statusCardId)}}  size = 'small' icon={['fal', 'history']} />
                             </Col>
                             <Col lg="auto" sm="auto" md="auto" style={{padding: '0'}}>
                                 <p>{apiForCount()}</p>
                             </Col>
                         </Row>   
                         <Row>
                             <Col lg="12"><h2>{props.statusInfo.label}</h2></Col>
                         </Row>
                     </Container>
                 </Card.Body>
             </Card>
     )
 }

 export default ColumnCard;