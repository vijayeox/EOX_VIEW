import React, { useState, useEffect } from 'react'
import { Button, Modal, Form, Row, Col } from 'react-bootstrap'
import visualization from '../../../metadata.json';


function VisualizationModal(props) {

  const [input, setInput] = useState({})
  const [errors, setErrors] = useState({})
  const allowedOperation = {
    ACTIVATE: "Activated",
    CREATE: "Created",
    EDIT: "Edited",
    DELETE: "Deleted"
  }
  useEffect(() => {
    if (props.content !== undefined) {
      var { name, type, renderer } = props.content;
      var configuration = JSON.stringify(props.content.configuration)
      setInput({ ...input, ["name"]: name, ["type"]: type, ["configuration"]: configuration, ["renderer"]: renderer })
    }
    else {
      //clear all inputs
      setInput({ ["name"]: "", ["type"]: "", ["configuration"]: "", ["renderer"]: "" })
    }
  }, [props.content])


  function notify(response, operation) {

    if (response.status == "success")
      props.notification.current.notify(
        "Data Source " + operation,
        "Operation succesfully completed",
        "success"
      )
    else {
      props.notification.current.notify(
        "Error",
        "Operation failed " + response.message,
        "danger"
      )
    }
  }

  async function validateForm(operation) {
    let formValid = true
    var error = errors
    if (operation && (operation === "Created" || operation === "Edited") && input["name"]) {
      let helper = props.osjsCore.make("oxzion/restClient");
      let response = await helper.request(
        "v1",
        `analytics/visualization?show_deleted=true&filter=[{"filter":{"logic":"and","filters":[{"field":"name","operator":"eq","value":"${input["name"]}"}]},"skip":0}]`,
        {},
        "get"
      )
      let result = response.data.data
      //edit modal can have the same
      if ((operation === "Created" && result && result.length !== 0)) {
        formValid = false
        error["name"] = "* Visualization name already exists, please choose a different one"
      }
      else if (operation === "Edited" && result.length !== 0) {
        if ((props.content.name).toLowerCase() !== (input["name"]).toLowerCase()) {
          formValid = false
          error["name"] = "* Visualization name already exists, please choose a different one"
        }
      }
    }
    if (!input["name"]) {
      formValid = false
      error["name"] = "* Please enter the Visualization name"
    }
    if (!input["type"]) {
      formValid = false
      error["type"] = "* Please enter the Visualization type"
    }
    if (input["type"] && !input["renderer"]) {
      formValid = false
      console.error("Could not set Renderer . Please check the metadata section.")
    }
    // }
    // if (!input["configuration"]) {
    //   formValid = false
    //   error["configuration"] = "* Please enter the configuration"
    // }
    setErrors({ ...error })
    return formValid
  }
  async function visualizationOperation(operation) {
    let formValid = await validateForm(operation)
    if (formValid === true) {
      let helper = props.osjsCore.make("oxzion/restClient");
      let requestUrl = ""
      let method = ""
      let formData = {}

      if (operation !== undefined && operation !== allowedOperation.DELETE) {
        formData["name"] = input["name"];
        formData["type"] = input["type"];
        formData["configuration"] = input["configuration"];
        formData["renderer"] = input["renderer"]

        if (operation === allowedOperation.EDIT || operation === allowedOperation.ACTIVATE) {
          //pass additional form inputs required for edit operation
          formData["uuid"] = props.content.uuid
          formData["version"] = props.content.version;
          requestUrl = "analytics/visualization/" + props.content.uuid;
          operation === "Activated" ? formData["isdeleted"] = "0" : null
          method = "put"
        }
        else {
          requestUrl = "analytics/visualization";
          method = "filepost"
        }
      }
      else if (operation === allowedOperation.DELETE) {
        requestUrl = "analytics/visualization/" + props.content.uuid + "?version=" + props.content.version
        method = "delete"
      }

      helper.request(
        "v1",
        requestUrl,
        formData,
        method
      )
        .then(response => {
          props.refreshGrid.current.child.current ? props.refreshGrid.current.child.current.triggerGetCall() : props.refreshGrid.current.child.triggerGetCall();
          notify(response, operation)
          props.onHide()
        })
        .catch(err => {
          console.log(err)
        })
    }
  }

  function handleChange(e) {
    let name = e.target.name;
    let value = e.target.value;
    let error = errors
    error[e.target.name] = ""
    setErrors({ ...error })
    if (name === "type") {
      //set renderer when type is set
      let renderer = visualization.renderer[value]
      setInput({ ...input, [name]: value, ["renderer"]: renderer });
    } else {
      setInput({ ...input, [name]: value });
    }
  }
  var Footer = null
  var DisabledFields = true

  if (props.modalType === "Edit") {
    //set to none if no content is changed else set to block
    Footer = (<Button variant="primary" onClick={() => visualizationOperation("Edited")} >Save Changes</Button>)
    DisabledFields = false
  }
  else if (props.modalType === "Delete") {
    Footer = (<Button variant="danger" onClick={() => visualizationOperation("Deleted")}>Delete</Button>)
    DisabledFields = true
  }
  else if (props.modalType === "Create") {
    Footer = (<Button variant="primary" onClick={() => visualizationOperation("Created")}>Create</Button>)
    DisabledFields = false
  }
  else if (props.modalType === "Activate") {
    Footer = (<Button variant="success" onClick={() => visualizationOperation("Activated")}>Activate</Button>)
    DisabledFields = true
  }

  return (
    <Modal
      show={props.show}
      onHide={() => props.onHide()}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      className="datasource-modal"
    >
      <Modal.Header >
        <Modal.Title id="contained-modal-title-vcenter">
          {props.modalType} Visualization
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-body">
        <Form>
          <Form.Group as={Row}>
            <Form.Label column lg="3">Name</Form.Label>
            <Col lg="9">
              <Form.Control type="text" name="name" value={input["name"] ? input["name"] : ""} onChange={handleChange} disabled={DisabledFields} />
              <Form.Text className="text-muted errorMsg">
                {errors["name"]}
              </Form.Text>
            </Col>

          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column lg="3">Type</Form.Label>
            <Col lg="9">
              <Form.Control
                as="select"
                name="type"
                onChange={handleChange}
                value={input["type"] !== undefined ? input["type"] : -1}
                disabled={DisabledFields}
              >
                <option disabled value={-1} key={-1}></option>
                {visualization.type.map(type => {
                  return (
                    <option key={type.value} value={type.value}>{type.text}</option>
                  )
                })
                }
              </Form.Control>
              <Form.Text className="text-muted errorMsg">
                {errors["type"]}
              </Form.Text>
            </Col>
          </Form.Group>

          <Form.Group as={Row}>
            <Form.Label column lg="3">Configuration</Form.Label>
            <Col lg="9">
              <Form.Control as="textarea" rows="7" name="configuration" value={input["configuration"] ? input["configuration"] : ""} onChange={handleChange} disabled={DisabledFields} />
              <Form.Text className="text-muted errorMsg">
                {errors["configuration"]}
              </Form.Text>
            </Col>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => { props.onHide() }}>Cancel</Button>
        {Footer}
      </Modal.Footer>
    </Modal>
  );
}

export default VisualizationModal