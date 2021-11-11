import React, { useState, useEffect, useRef } from 'react'
import { Button, Modal, Form, Row, Col } from 'react-bootstrap'
import JSONFormRenderer from "../../JSONFormRenderer"
import FormSchema from "./DataSourceModalSchema.json"

const schemaForm = JSON.parse(JSON.stringify(FormSchema));

function DataSourceModal(props) {
  const [input, setInput] = useState({})
  const [errors, setErrors] = useState({})
  const [formConfiguration, setFormConfiguration] = useState("") //contains values
  const [formSchema, setFormSchema] = useState(getFormSchema()) //contains Keys
  const ref = useRef(null)
  const allowedOperation = {
    ACTIVATE: "Activated",
    CREATE: "Created",
    EDIT: "Edited",
    DELETE: "Deleted"
  }

  function getFormSchema() {

    // // Previous Code
    // if (props.content && FormSchema.FormSchema[props.content.type]) {
    //   let type = props.content.type;
    //   return FormSchema.FormSchema[`"`, type, `"`];
    // } else {
    //   // return FormSchema["_DEFAULT_OPTIONAL_FIELDS"] 
    //   return FormSchema.FormSchema._DEFAULT_OPTIONAL_FIELDS //working
    // }

    // Create button clicked
    if(props.modalType === "Create"){
      const defaultOptionalFields = schemaForm.FormSchema._DEFAULT_OPTIONAL_FIELDS;
      defaultOptionalFields.optionalFields = { ...defaultOptionalFields.optionalFields, ...defaultOptionalFields.defaultFields };
      defaultOptionalFields.defaultFields = {};
      return defaultOptionalFields;
    } 

    // Edit button clicked
    if(props.modalType === "Edit"){
      const defaultOptionalFields = schemaForm.FormSchema._DEFAULT_OPTIONAL_FIELDS;
      const newFormSchema = Object.keys(defaultOptionalFields.defaultFields).map((data, index) => {
        Object.keys(formConfiguration).forEach((config) => {
          if (data.toLowerCase().trim() !== config.toLowerCase().trim()){
            delete defaultOptionalFields.defaultFields[`${data}`]; 
            defaultOptionalFields.optionalFields[`${data}`] = FormSchema.FormSchema._DEFAULT_OPTIONAL_FIELDS.optionalFields[`${data}`];
          }
        })
      })
    }

  }

  useEffect(() => {
    if (props.content !== undefined) {
      var { name, type } = props.content;
      var configuration = JSON.stringify(props.content.configuration)
      setInput({ ...input, ["name"]: name, ["type"]: type, ["configuration"]: configuration })
      setFormConfiguration(props.content.configuration.data || {})
      if (formSchema == {} || formSchema == undefined) {
        let schema = schemaForm.FormSchema["_DEFAULT_OPTIONAL_FIELDS"]
        if (schema) {
          setFormSchema(schema)
        }
      }
    }
    else {
      //clear all inputs
      setInput({ ["name"]: "", ["type"]: "", ["configuration"]: "" })
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
        `analytics/datasource?show_deleted=true&filter=[{"filter":{"logic":"and","filters":[{"field":"name","operator":"eq","value":"${input["name"]}"}]},"skip":0}]`,
        {},
        "get"
      )
      let result = response.data
      //edit modal can have the same
      if ((operation === "Created" && result.length !== 0)) {
        formValid = false
        error["name"] = "* Datasource name already exists, please choose a different one"
      }
      else if (operation === "Edited" && result.length !== 0) {
        if ((props.content.name).toLowerCase() !== (input["name"]).toLowerCase()) {
          formValid = false
          error["name"] = "* Datasource name already exists, please choose a different one"
        }
      }
    }
    if (!input["name"]) {
      formValid = false
      error["name"] = "* Please enter the datasource name"
    }
    if (!input["type"]) {
      formValid = false
      error["type"] = "* Please enter the datasource type"
    }
    if (!ref.current.getFormConfig(true)) {
      formValid = false
      error["configuration"] = "* Please enter the configuration"
    }
    setErrors({ ...error })
    return formValid
  }
  async function dataSourceOperation(operation) {
    let formValid = await validateForm(operation)
    if (formValid === true) {
      let helper = props.osjsCore.make("oxzion/restClient");
      let requestUrl = ""
      let method = ""
      let formData = {}

      if (operation !== undefined && operation !== allowedOperation.DELETE) {
        formData["name"] = input["name"];
        formData["type"] = input["type"];
        formData["configuration"] = ref.current.getFormConfig(true)
        if (operation === allowedOperation.EDIT || operation === allowedOperation.ACTIVATE) {
          //pass additional form inputs required for edit operation
          formData["uuid"] = props.content.uuid
          formData["version"] = props.content.version;
          requestUrl = "analytics/datasource/" + props.content.uuid;
          operation === "Activated" ? formData["isdeleted"] = "0" : null
          method = "put"
        }
        else {
          requestUrl = "analytics/datasource";
          method = "filepost"
        }
      }
      else if (operation === allowedOperation.DELETE) {
        requestUrl = "analytics/datasource/" + props.content.uuid + "?version=" + props.content.version
        method = "delete"
      }

      helper.request(
        "v1",
        requestUrl,
        formData,
        method
      )
        .then(response => {
          // props.refreshGrid.current.child.current.triggerGetCall()
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
    setInput({ ...input, [name]: value });
  }
  var Footer = null
  var DisabledFields = true

  if (props.modalType === "Edit") {
    //set to none if no content is changed else set to block
    Footer = (<Button variant="primary" onClick={() => dataSourceOperation("Edited")} >Save Changes</Button>)
    DisabledFields = false
  }
  else if (props.modalType === "Delete") {
    Footer = (<Button variant="danger" onClick={() => dataSourceOperation("Deleted")}>Delete</Button>)
    DisabledFields = true
  }
  else if (props.modalType === "Create") {
    Footer = (<Button variant="primary" onClick={() => dataSourceOperation("Created")}>Create</Button>)
    DisabledFields = false
  }
  else if (props.modalType === "Activate") {
    Footer = (<Button variant="success" onClick={() => dataSourceOperation("Activated")}>Activate</Button>)
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
          {props.modalType} Data Source
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
              <Form.Control type="text" name="type" value={input["type"] ? input["type"] : ""} onChange={handleChange} disabled={DisabledFields} />

              {/* <Form.Control type="text" name="type" value={props.datasourcename} disabled /> */}
              <Form.Text className="text-muted errorMsg">

                {errors["type"]}
              </Form.Text>
            </Col>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column lg="3">Configuration</Form.Label>
            <Col lg="9" >
              <JSONFormRenderer formSchema={formSchema != undefined ? formSchema : {}} values={formConfiguration} subForm={true} ref={ref} />
              {/* <Form.Control as="textarea" rows="10" name="configuration" value={input["configuration"] ? input["configuration"] : ""} onChange={handleChange} disabled={DisabledFields} />
              <Form.Text className="text-muted errorMsg">
                {errors["configuration"]}
              </Form.Text> */}
            </Col>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        {/* <Button variant="secondary" onClick={()=>ref.current.getFormConfig()}>REF</Button> */}
        <Button variant="secondary" onClick={() => { props.onHide() }}>Cancel</Button>
        {Footer}
      </Modal.Footer>
    </Modal>
  );
}

export default DataSourceModal