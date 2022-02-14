import React, { useEffect, useState } from "react";
import { Form, InputGroup, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function Searchbar(props) {
    const [key, setKey] = useState("");
    const cardParameters = JSON.parse(props.ymlData.cardParameters);

    const filter = (value) => {
        setKey(value);
        if (value.trim().length > 0) {
            props.onChildFilter("searchFilter", [
                {
                    "logic": "or",
                    "filters": [
                        { field: cardParameters.title.name, operator: "contains", value },
                        { field: cardParameters.user1.name, operator: "contains", value },
                        { field: cardParameters.user2.name, operator: "contains", value }, // comment this when AssignedTo filter is functional
                        // { field: cardParameters.date_created.name, operator: "contains", value }
                    ]
                }
            ])
        } else {
            props.onChildFilter("searchFilter", []) // if search is empty
        }
    }

    return (
        <Form.Row
            style={{
                marginRight: "5px",
                fontSize: "small",
                paddingTop: "10px",
                fontWeight: "bold",
            }}>
            <Form.Group>
                <InputGroup>
                    <Form.Control
                        type="text"
                        value={key}
                        placeholder="Search here.."
                        onChange={e => { filter(e.target.value) }}
                    />

                    <Button variant="primary" size="sm" onClick={props.setFilterFromProps}>
                        <FontAwesomeIcon icon={['fal', 'search']} />
                    </Button>
                </InputGroup>
            </Form.Group>
        </Form.Row>
    )
}

export default Searchbar;