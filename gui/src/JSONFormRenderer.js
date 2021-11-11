import React, { useState, useEffect, useImperativeHandle, forwardRef, useRef } from "react";
import { Form, Col, Row, Button, Tab, Tabs, InputGroup } from "react-bootstrap";
import PropTypes from "prop-types";
import "./public/css/JSONFormRenderer.scss";

const JSONFormRenderer = forwardRef((props, ref) => {
  const [input, setInput] = useState({});
  const [formValues, setFormValues] = useState("{}");
  const [formFields, setFormFields] = useState(props.formSchema!=undefined ? props.formSchema : {})
  const [optionalFields, setOptionalFields] = useState(null);
  const el = useRef(null);
  useEffect(() => {
    //set fetched values from database if any exists
    setDefaultValues();
    
  }, [props.values]);

  useEffect(() => {
    setFormFields(props.formSchema!=undefined ? props.formSchema : {})
  }, [props.formSchema]);

  useEffect(() => {
    generateOptionalFieldsDropDown()
    scrollToBottom()
  }, [formFields])

  useImperativeHandle(ref, () => ({
    getFormConfig(embedData) {
      let parsedConfig = JSON.parse(formValues)
      let preparedConfig = parsedConfig
      if(embedData){
        preparedConfig = { "data": parsedConfig }
      }
      return JSON.stringify(preparedConfig)
    }
  }))

  let values = props.values;
  let subForm = props.subForm != undefined ? props.subForm : false;

  const scrollToBottom = () => {
    const divContainer = document.getElementById("json-form-renderer-container")
    if (divContainer) {
      el.current.scrollIntoView({ block: 'end', behavior: 'smooth' });
      // divContainer.scrollTop=divContainer.scrollHeight
      divContainer.scrollIntoView({ "behaviour": "smooth" })
      divContainer.scrollTop = divContainer.scrollHeight

    }
  }
  const generateOptionalFieldsDropDown = () => {
    let options = formFields["optionalFields"] && Object.keys(formFields["optionalFields"]).map((element) => {
      if(formFields["optionalFields"][element]){
        return <option key={element} value={formFields["optionalFields"][element].control.name}>{element}</option>
      }
    })
    setOptionalFields(options)
  }
  const setDefaultValues = () => {
    let inputCopy = { ...input };
    for (const property in values) {
      inputCopy[property] = values[property];
    }
    setInput(inputCopy);
    setFormValues(JSON.stringify(props.values, null, 1))
  };

  const handleChange = (e) => {
    let name = e.target.name;
    let value = e.target.value;
    if (name == "formValues") {
      setFormValues(value)
    } else if (name === "optionalFields") {
      addFormFields(e.target.options[e.target.selectedIndex].text)
      value="-1" //setting to default on selecting from dropdown
    } else {
      let formValuesCopy = {...JSON.parse(formValues)}
      formValuesCopy[name] = value
      setInput({ ...input, [name]: value });
      setFormValues(JSON.stringify(formValuesCopy,null,1))
    }
  };

  const removeFormField = (obj,field) => {
    let formFieldsCopy = { ...formFields }
    let formValuesCopy = JSON.parse(formValues)
    let inputCopy = {...input}
    formFieldsCopy["optionalFields"][field] = formFieldsCopy["defaultFields"][field]
    delete formFieldsCopy["defaultFields"][field]
    delete formValuesCopy[obj.control.name]
    // delete inputCopy[obj.control.name]
    setFormFields(formFieldsCopy)
    setFormValues(JSON.stringify(formValuesCopy, null, 1))
    // setInput(inputCopy)
  }

  const addFormFields = (field) => {
    let formFieldsCopy = { ...formFields }
    let formValuesCopy = JSON.parse(formValues)
    if(typeof(formValuesCopy)!=="object"){
      formValuesCopy={}
    }
    formFieldsCopy["defaultFields"][field] = formFieldsCopy["optionalFields"][field]
    let fieldName = formFieldsCopy["defaultFields"][field]["control"]["name"]
    formValuesCopy[fieldName]=input[fieldName]
    delete formFieldsCopy["optionalFields"][field]
    setFormFields(formFieldsCopy)
    setFormValues(JSON.stringify(formValuesCopy,null,1))
    
  }

  const renderFormElement = (field, key) => {
    if(field){
      return (
        <Form.Group key={field.control.name + "_group"} as={Row}>
          <Form.Label key={field.control.name + "_label"} column lg="3">
            {field.label}
          </Form.Label>
          <Col lg="8">
            <Form.Control
              key={field.control.name + "_control"}
              {...field.control}
              onChange={handleChange}
              value={input[field.control.name]?typeof(input[field.control.name])=="object"?JSON.stringify(input[field.control.name]):input[field.control.name]:""}
            />
          </Col>
          <Col lg="1" style={{ "padding": "0" }}>
            <Button onClick={() => removeFormField(field,key)}>-</Button>
          </Col>
        </Form.Group>
      );
    }
  };

  return (
    <div>
      <Tabs defaultActiveKey="form" id="uncontrolled-tab-example">
        <Tab eventKey="form" title={<i className="fa fa-file-text" aria-hidden="true" title="View Form"></i>}>
          {!subForm ?
            <Form >
              {formFields["defaultFields"] && Object.keys(formFields["defaultFields"]).map((element) => {
                return renderFormElement(formFields["defaultFields"][element], element);
              })}
              <select id="optionalFields" name="optionalFields" className="form-control form-control-sm" value={input["optionalFields"]} placeholder="Select Fields" onChange={handleChange} >
                <option key="" value="-1" >--Select Fields--</option>
                {optionalFields}
              </select>
            </Form>
            :
            <div className="json-form-renderer-container" id="json-form-renderer-container" ref={el}>
              {formFields["defaultFields"] && Object.keys(formFields["defaultFields"]).map((element) => {
                return renderFormElement(formFields["defaultFields"][element], element);
              })}
              {
                formFields["optionalFields"] && Object.keys(formFields["optionalFields"]).map((element)=>{
                  if(formFields["optionalFields"][element]){
                    let name=formFields["optionalFields"][element].control.name
                    let formValue=JSON.parse(formValues)
                    if(formValue.hasOwnProperty(name))
                    addFormFields(element)
                  }
                  }
                 )
              }
              <select id="optionalFields" name="optionalFields" className="form-control form-control-sm" value={input["optionalFields"]} placeholder="Select Fields" onChange={handleChange} >
              <option key="" value="-1" >--Select Fields--</option>
              {optionalFields}
              </select>
            </div>
          }

        </Tab>
        <Tab eventKey="json" title={<i aria-hidden="true" title="View JSON">{"{ }"}</i>} >
          <Form.Control as="textarea" rows="10" name="formValues" value={formValues} onChange={handleChange} disabled />

          {/* <Form.Text className="text-muted errorMsg">
                {errors["configuration"]}
              </Form.Text>  */}
        </Tab>
      </Tabs>
    </div>
  );
})


//validation for props
JSONFormRenderer.propTypes = {
  formSchema: PropTypes.object,
  values: PropTypes.string,
};
export default JSONFormRenderer;
