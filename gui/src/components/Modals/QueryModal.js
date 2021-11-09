import React, { useState, useEffect, useRef } from 'react'
import { Button, Modal, Form, Row, Col } from 'react-bootstrap'
import JSONFormRenderer from "../../JSONFormRenderer"
import FormSchema from "./QueryModalSchema.json"

function QueryModal(props) {
  const [input, setInput] = useState({})
  const [errors, setErrors] = useState({})
  const [formValues, setFormValues] = useState("")
  const [formSchema, setFormSchema] = useState(FormSchema.FormSchema["_DEFAULT_OPTIONAL_FIELDS"])

  const formBuilderRef = useRef(null)

  const helper = props.osjsCore.make("oxzion/restClient");
  var string_configuration = ""

  useEffect(() => {
    if (props.content !== undefined) {
      if (props.content.length !== 0) {
        var { name, ispublic, configuration, uuid, version } = props.content;
        string_configuration = JSON.stringify(configuration)
        let datasourcename = setDataSourceDefaultValue()
        setFormValues(props.content.configuration || {})
        setInput({ ...input, ["queryname"]: name, ["visibility"]: ispublic, ["configuration"]: string_configuration, uuid, version, ["datasourcename"]: datasourcename })
      }
      else {
        setFormValues(JSON.parse(props.configuration) || {})
        setInput({ ["queryname"]: "", ["datasourcename"]: props.datasourcename, ["datasourceuuid"]: props.datasourceuuid })
      }
    }
  }, [props.content])

  function setDataSourceDefaultValue() {
    let dataSourceName = []
    props.dataSourceOptions && props.dataSourceOptions.map((option, index) => (
      option.uuid == props.content.datasource_uuid ? dataSourceName = [option.name, option.uuid] : null
    ))
    return dataSourceName
  }


  function notify(response, operation) {
    if (response.status == "success") {
      props.notification.current.notify(
        "Data Source " + operation,
        "Operation succesfully completed",
        "success"
      )
      setInput({})
      props.resetInput()
    }
    else {
      // props.notification.current.notify(
      //   "Error",
      //   "Operation failed " + response.message,
      //   "danger"
      // )
    }
  }


  function handleChange(e) {
    let name = "";
    let value = "";
    if (e.target.name === "datasourcename") {
      const selectedIndex = e.target.options.selectedIndex;
      let uuid = e.target.options[selectedIndex].getAttribute('data-key')
      name = e.target.name
      value = [e.target.value, uuid];
      errors["datasourcename"] = ""
    }
    else {
      name = e.target.name;
      value = e.target.value;
    }
    let error = errors
    error[e.target.name] = ""
    setErrors({ ...error })
    setInput({ ...input, [name]: value });
  }

  var Footer = null
  var DisabledFields = true


  if (props.modalType === "Delete") {
    Footer = (<Button variant="danger" onClick={() => queryOperation("Deleted")}>Delete</Button>)
    DisabledFields = true
  }
  else if (props.modalType === "Save") {
    Footer = (<Button variant="primary" onClick={() => queryOperation("Created")}>Create</Button>)
    DisabledFields = false
  }
  else if (props.modalType === "Activate") {
    Footer = (<Button variant="success" onClick={() => queryOperation("Activated")}>Activate</Button>)
    DisabledFields = true
  }
  else if (props.modalType === "Execute") {
    Footer = (<Button variant="success" onClick={() => queryOperation("Executed")}>Execute</Button>)
  }
  else if (props.modalType === "Edit") {
    Footer = (<Button variant="success" onClick={() => queryOperation("Edited")}>Edit</Button>)
    var DisabledFields = false
  }
  async function validateForm(operation) {
    let formValid = true
    var error = errors
    if (operation && operation === "Created" && input["queryname"]) {
      let response = await helper.request(
        "v1",
        `analytics/query?show_deleted=true&filter=[{"filter":{"logic":"and","filters":[{"field":"name","operator":"eq","value":"${input["queryname"]}"}]},"skip":0}]`,
        {},
        "get"
      )
      let result = response.data.data
      if (result.length !== 0) {
        formValid = false
        error["queryname"] = "* Query name already exists, please choose a different one"
      }

    }
    if (!input["queryname"]) {
      formValid = false
      error["queryname"] = "* Please enter the query name"
    }
    if (!input["visibility"]) {
      formValid = false
      error["visibility"] = "* Please choose the visibility"
    }
    setErrors({ ...error })
    return formValid
  }

  async function queryOperation(operation) {
    let formValid = await validateForm(operation)
    if (formValid === true) {
      let requestUrl = ""
      let method = ""
      let formData = {}
      if (operation === "Executed") {
        props.onHide()
        props.runQuery(props.content);
      }
      else if (operation === "Created" || operation === "Activated" || operation === "Edited") {


        formData["name"] = input["queryname"]
        formData["datasource_id"] = input["datasourceuuid"]
        formData["configuration"] = formBuilderRef.current.getFormConfig(false);
        formData["ispublic"] = input["visibility"]
        if (operation === "Activated" || operation === "Edited") {
          formData["configuration"] = formBuilderRef.current.getFormConfig(false);
          formData["version"] = input["version"]
          formData["isdeleted"] = "0"
          requestUrl = "analytics/query/" + input["uuid"]
          if (operation === "Edited") {
            formData["datasource_id"] = input["datasourcename"][1]
          }
          method = "put"
        }
        else {
          requestUrl = "analytics/query"
          method = "filepost"
        }
      }
      else if (operation === "Deleted") {
        requestUrl = "analytics/query/" + input["uuid"] + "?version=" + input["version"]
        method = "delete"
      }

      helper.request(
        "v1",
        requestUrl,
        formData,
        method
      )
        .then(response => {
          if (response.status == "success") {
            props.refreshGrid.current.child.current ? props.refreshGrid.current.child.current.triggerGetCall() : props.refreshGrid.current.child.triggerGetCall();
            notify(response, operation)
            props.resetInput()
            props.hideQueryForm()
            props.onHide()
          }
          else if (response.status == "error") {
            alert("error")
          }
        })
        .catch(err => {
          console.log(err)
        })
    }
  }

  return (
    <Modal
      show={props.show}
      onHide={() => {
        setInput({})
        props.onHide()
      }
      }
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      className="datasource-modal"
    >
      <Modal.Header >
        <Modal.Title id="contained-modal-title-vcenter">
          {props.modalType} Query
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-body">
        <Form>
          <Form.Group as={Row}>
            <Form.Label column lg="3">Query Name</Form.Label>
            <Col lg="9">
              <Form.Control type="text" name="queryname" onChange={handleChange} disabled={DisabledFields} value={input["queryname"] !== undefined ? input["queryname"] : ""} />
              <Form.Text className="text-muted errorMsg">
                {errors["queryname"]}
              </Form.Text>
            </Col>

          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column lg="3">Visibility</Form.Label>
            <Col lg="9">
              <Form.Control
                as="select"
                name="visibility"
                onChange={handleChange}
                value={input["visibility"] !== undefined ? input["visibility"] : -1}
                disabled={DisabledFields}
              >
                <option disabled value={-1} key={-1}></option>
                <option value="0">Private</option>
                <option value="1">Public</option>
              </Form.Control>
              <Form.Text className="text-muted errorMsg">
                {errors["visibility"]}
              </Form.Text>
            </Col>
          </Form.Group>
          <>
            {props.modalType === "Save" &&
              <Form.Group as={Row}>
                <Form.Label column lg="3">Data Source Name</Form.Label>
                <Col lg="9">
                  <Form.Control type="text" name="datasourcename" value={props.datasourcename} disabled />
                </Col>
              </Form.Group>
            }
            {props.modalType === "Edit" &&
              <Form.Group as={Row}>
                <Form.Label column lg="3">Data Source Name</Form.Label>
                <Col lg="9">
                  <Form.Control
                    as="select"
                    onChange={(e) => handleChange(e)}
                    value={input["datasourcename"] !== undefined ? input["datasourcename"][0] : -1}
                    name="datasourcename">
                    <option disabled value={-1} key={-1}></option>
                    {props.dataSourceOptions && props.dataSourceOptions.map((option, index) => (
                      <option key={option.uuid} data-key={option.uuid} value={option.name}>{option.name}</option>
                    ))}
                  </Form.Control>
                </Col>
              </Form.Group>
            }
            <Form.Group as={Row}>
              <Form.Label column lg="3">Configuration</Form.Label>
              <Col lg="9">
                {/* {props.modalType !== "Save" ? */}
                <JSONFormRenderer formSchema={formSchema != undefined ? formSchema : {}} values={formValues} subForm={true} ref={formBuilderRef} />
                {/* : */}
                {/* <Form.Control as="textarea" name="configuration" value={input["configuration"] !== undefined ? input["configuration"] : props.configuration} onChange={handleChange} disabled={DisabledFields} /> */}
                {/* } */}
              </Col>
            </Form.Group>
          </>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        {Footer}
      </Modal.Footer>
    </Modal>
  );
}

export default QueryModal