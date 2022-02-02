import React, { useEffect, useState } from "react";
import { Form, InputGroup, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function Searchbar(props) {

    const [key, setKey] = useState("");

    const filter = (value) => {
        setKey(value);
        if(value.trim().length>0){
            props.onChildFilter("searchFilter",[
                {
                    "logic": "or",
                    "filters": [
                        { field: "name", operator: "contains", value },
                        { field: "created_by", operator: "contains", value },
                        { field: "date_created", operator: "contains", value },
                        { field: "assignedToName", operator: "contains", value }]
                }
            ])
        } else {
            props.onChildFilter("searchFilter",[]) // if search is empty
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