import { Card, Container, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faHistory } from '@fortawesome/fontawesome-free-solid';
import './ColumnCount.scss';
import colorHandler from './ColorCodes'
import React, { useState } from 'react';
import Requests from '../../Requests';
// //import  apiForCount from './ApiAcess'

function ColumnCard(props) {

    const [Count, setCount] = useState('0');

    function apiForCount() {
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

        let url = "/app/" + props.appId + "/file/search?filter=" + JSON.stringify(params);
        Requests.doRestRequest(
            props.core,
            url,
            {},
            'get',
            function (res) {
                setCount(res.total)
            },
            function (error) {
                setError(true);
            });

        return Count
    }
    return (
        <Container fluid>
            <Card style={{
                border: '0',
                boxShadow: '0px 3px 2px lightgrey',
                width: "18vw"
            }}>

                <Card.Body>
                    <Row>
                        <Col lg="auto" sm="auto" md="auto" style={{ float: 'left' }}>
                            <FontAwesomeIcon
                                className="cardIcon k_cardIcon"
                                style={{ color: colorHandler(props.statusCardId) }}
                                size='small'
                                icon={['fal', 'history']} />
                        </Col>
                        <Col lg="auto" sm="auto" md="auto" style={{ float: 'left' }}>
                            <p>{apiForCount()}</p>
                        </Col>
                        <Col lg="auto" sm="auto" md="auto" style={{ float: 'left' }}>
                            <h2>{props.statusInfo.label}</h2>
                        </Col>
                    </Row>
                    {/* <Row></Row> */}
                </Card.Body>
            </Card>
        </Container>
    )
}

export default ColumnCard;