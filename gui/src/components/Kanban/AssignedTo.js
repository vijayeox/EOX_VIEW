import React, { useEffect, useState } from "react";
import { Button, Badge } from "react-bootstrap";
import Requests from "../../Requests";

function AssignedTo(props) {
    const [key, setKey] = useState("");
    const [users, setusers] = useState([]);
    const selectAssignedTo = (value) => {
        setKey(value);
        let filter = null;
        let callTimeout = null;
        callTimeout ? clearTimeout(callTimeout) : null;
        callTimeout = setTimeout(() => {
            filter = [
                { field: "assignedToName", operator: "contains", value: key }
            ];
            props.getAssignedToFilter(filter);
        }, 2000);
    }

    useEffect(() => {
        selectAssignedTo();
        let url = "/user?filter=[{%22skip%22:0,%22take%22:10000}]"
        Requests.doRestRequest(
            props.core,
            url,
            {},
            'get',
            function (response) {
                let userObj = Object.values(response).map(({name}) => name);
                setusers(userObj);
            },
            function (error) {
                console.log("error " + error)
            });
    }, []);


    return (
        <Button variant="link"
            style={{
                color: "black",
                fontWeight: 400
            }}
            className="mt-2"
        >
            <Badge>
                <div>Assigned To</div>
            </Badge>
            <Badge>
                <select
                    className="form-control"
                    style={{
                        fontSize: "small",
                        borderColor: "transparent",
                        outlineColor: "transparent",
                        background: "transparent",
                    }}
                    name="assignedTo"
                    onChange={(e) => {
                        selectAssignedTo(e.target.value);
                    }}
                >
                    <option value="-1"> Select</option>
                    {users.map((name) => {
                        return <option key={name} value={name}>{name}</option>;
                    })}
                </select>
            </Badge>
        </Button>
    )
}

export default AssignedTo;