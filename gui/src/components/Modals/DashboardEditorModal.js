import React, { useState, useEffect } from "react";
import { Button, Modal, Form, Row, Col } from "react-bootstrap";

// import DashboardEditor from "../../dashboardEditor"
import "../../public/css/dashboardEditor.scss";
function DashboardEditorModal(props) {
  const [input, setInput] = useState({});
  const allowedOperation = {
    ACTIVATE: "Activated",
    CREATE: "Created",
    EDIT: "Edited",
    DELETE: "Deleted",
    DEFAULT: "SetDefault",
  };
  useEffect(() => {
    if (props.content !== undefined) {
      var { name, description } = props.content;
      setInput({ ...input, ["name"]: name, ["description"]: description });
    } else {
      //clear all inputs
      setInput({ ["name"]: "", ["type"]: "" });
    }
  }, [props.content]);

  function notify(response, operation) {
    if (response.status == "success") props.notification.current.notify("Dashboard " + operation, "Operation succesfully completed", "success");
    else {
      props.notification.current.notify("Error", "Operation failed " + response.message, "danger");
    }
  }

  function dashboardOperation(operation) {
    let helper = props.osjsCore.make("oxzion/restClient");
    let requestUrl = "";
    let method = "";
    let formData = {};

    if (operation !== undefined && operation !== allowedOperation.DELETE) {
      formData["name"] = input["name"];
      formData["description"] = input["description"];

      if (operation === allowedOperation.EDIT || operation === allowedOperation.ACTIVATE) {
        //pass additional form inputs required for edit operation
        formData["uuid"] = props.content.uuid;
        formData["version"] = props.content.version;
        requestUrl = "analytics/dashboard/" + props.content.uuid;
        operation === "Activated" ? (formData["isdeleted"] = "0") : null;
        method = "put";
      } else if (operation === allowedOperation.DEFAULT) {
        formData["uuid"] = props.content.uuid;
        formData["version"] = props.content.version;
        requestUrl = "analytics/dashboard/" + props.content.uuid;
        formData["isdefault"] = "1";
        method = "put";
      } else {
        requestUrl = "analytics/dashboard";
        method = "filepost";
      }
    } else if (operation === allowedOperation.DELETE) {
      requestUrl = "analytics/dashboard/" + props.content.uuid + "?version=" + props.content.version;
      method = "delete";
    }

    helper
      .request("v1", requestUrl, formData, method)
      .then((response) => {
        notify(response, operation);
        props.onHide();
        props.refreshDashboard();
        operation === allowedOperation.DELETE ? props.deleteDashboard() : null;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function handleChange(e) {
    let name = e.target.name;
    let value = e.target.value;
    setInput({ ...input, [name]: value });
  }
  function setTitle(title) {}

  var Footer = null;
  var DisabledFields = true;
  var modalBody = null;

  if (props.modalType === "Edit") {
    // console.log(props)
    // Footer = (<Button variant="primary" onClick={() => dashboardOperation(allowedOperation.EDIT)}>Save</Button>)
    // modalBody = (<DashboardEditor
    //     args={props.osjsCore}
    //     setTitle={setTitle}
    //     dashboardId={props.content.uuid} />)
    // DisabledFields = false
  } else if (props.modalType === "Delete") {
    Footer = (
      <Button variant='danger' onClick={() => dashboardOperation(allowedOperation.DELETE)}>
        Delete
      </Button>
    );
    DisabledFields = true;
  } else if (props.modalType === "Create") {
    Footer = (
      <Button variant='primary' onClick={() => dashboardOperation(allowedOperation.CREATE)}>
        Create
      </Button>
    );
    DisabledFields = false;
  } else if (props.modalType === "SetDefault") {
    Footer = (
      <Button variant='primary' onClick={() => dashboardOperation(allowedOperation.DEFAULT)}>
        Set as Default Dashboard
      </Button>
    );
    DisabledFields = true;
  } else if (props.modalType === "Activate") {
    Footer = (
      <Button variant='success' onClick={() => dashboardOperation(allowedOperation.ACTIVATE)}>
        Activate
      </Button>
    );
    DisabledFields = true;
  }

  return (
    <Modal onHide={() => props.onHide()} show={props.show} size='xl' aria-labelledby='contained-modal-title-vcenter' centered className='dashboardEditor-modal'>
      <Modal.Header>
        <Modal.Title id='contained-modal-title-vcenter'>{props.modalType} Dashboard</Modal.Title>
      </Modal.Header>
      <Modal.Body className='modal-body'>
        {modalBody !== null ? (
          modalBody
        ) : (
          <Form>
            <Form.Group as={Row}>
              <Form.Label column lg='3'>
                Name
              </Form.Label>
              <Col lg='9'>
                <Form.Control type='text' name='name' value={input["name"] ? input["name"] : ""} onChange={handleChange} disabled={DisabledFields} />
              </Col>
            </Form.Group>
            <Form.Group as={Row}>
              <Form.Label column lg='3'>
                Description
              </Form.Label>
              <Col lg='9'>
                <Form.Control type='text' name='description' value={input["description"] ? input["description"] : ""} onChange={handleChange} disabled={DisabledFields} />
              </Col>
            </Form.Group>
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant='secondary'
          onClick={() => {
            props.onHide();
          }}>
          Cancel
        </Button>
        {Footer}
      </Modal.Footer>
    </Modal>
  );
}

export default DashboardEditorModal;
