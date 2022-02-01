import React, { useEffect, useState } from "react";
import { Form, InputGroup, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function Searchbar(props) {

    const [key, setKey] = useState("");

    const searchKeyword = () => {

        let filter = null;
        let callTimeout = null;
        callTimeout ? clearTimeout(callTimeout) : null;
        callTimeout = setTimeout(() => {
            filter = [
                {
                    "logic": "or",
                    "filters": [
                        { field: "name", operator: "contains", value: key },
                        { field: "created_by", operator: "contains", value: key },
                        { field: "date_created", operator: "contains", value: key },
                        { field: "assignedToName", operator: "contains", value: key }]
                }
            ];
            props.getSearchFilter(filter);
        }, 2000);
    }

    useEffect(() => {
        searchKeyword();
    }, []);

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
                        onChange={e => { setKey(e.target.value) }}
                    />
                    
                    <Button variant="primary" size="sm" onClick={searchKeyword}>
                        <FontAwesomeIcon icon={['fal', 'search']} />
                    </Button>
                </InputGroup>
            </Form.Group>
        </Form.Row>
    )
}

export default Searchbar;