import "../../public/css/formstyles.scss";
import { Formio } from "formiojs";

import { getComponent, flattenComponents, eachComponent } from "formiojs/utils/formUtils";
import SliderComponent from "./Form/SliderComponent";
import Notification from "../../Notification";
import JavascriptLoader from '../javascriptLoader';
import scrollIntoView from "scroll-into-view-if-needed";
import ConvergePayCheckoutComponent from "./Form/Payment/ConvergePayCheckoutComponent";
import DocumentComponent from "./Form/DocumentComponent";
import FortePayCheckoutComponent from "./Form/Payment/FortePayCheckoutComponent";
import DocumentViewerComponent from "./Form/DocumentViewerComponent";
import DocumentSignerComponent from "./Form/DocumentSignerComponent"
import RadioCardComponent from "./Form/RadioCardComponent";
import PhoneNumberComponent from "./Form/PhoneNumberComponent";
import CountryComponent from "./Form/CountryComponent";
import FileComponent from "./Form/FileComponent";
import SelectComponent from "./Form/SelectComponent.js";
import TextAreaComponent from "./Form/TextAreaComponent.js";

import DateFormats from '../../public/js/DateFormats'
import React from 'react'
import Swal from "sweetalert2";
import axios from 'axios'
import * as MomentTZ from "moment-timezone";
import { countryList } from "./Form/Country.js";
import { phoneList } from "./Form/Phonelist.js";
import merge from "deepmerge";


class BaseFormRenderer extends React.Component {
    constructor(props) {
        super(props)
        this.core = this.props.core;
        this.state = {
            form: null,
            showLoader: false,
            formId: this.props.formId,
            fileId: this.props.fileId,
            appId: this.props.appId,
            content: this.props.content,
            currentForm: null,
            formErrorMessage: 'Form seems to have an error while loading ,Please Try Again.'
        };
        //set the base url from config file
        axios.defaults.baseURL="http://localhost:8080"
        var formID = this.props.formId ? this.props.formId : "123";
        this.notif = React.createRef();
        this.hasCore = this.props.core ? true : false
        this.helper=null
        if (this.props.cacheId) {
            this.setState({ cacheId: this.props.cacheId });
        }
        if(this.hasCore){
            this.helper = this.core.make("oxzion/restClient");
            this.loader = this.core.make("oxzion/splash");
            var userprofile = this.core.make("oxzion/profile").get();
            this.privileges = userprofile.key.privileges;
            this.userprofile = userprofile.key;
        }
        this.appUrl = "/app/" + this.state.appId;
        this.formDivID = "formio_" + formID;
        this.loaderDivID = "formio_loader_" + formID;
        this.formErrorDivId = "formio_error_" + formID;
        JavascriptLoader.loadScript([{
            'name': 'ckEditorJs',
            'url': './ckeditor/ckeditor.js',
            'onload': function () { },
            'onerror': function () { }
        }]);
    }

    componentDidMount() {
        this.createForm()
    }

    stepDownPage() {
        let ev = new CustomEvent("stepDownPage", {
            detail: {},
            bubbles: true
        });
        if (document.getElementById("navigation_" + this.state.appId)) {
            document.getElementById("navigation_" + this.state.appId).dispatchEvent(ev);
        }
        if (this.props) {
            try {
                this.props.postSubmitCallback();
            } catch (e) {
                console.log("Unable to Handle Callback");
            }
        }
    }

    createHook() {
        let that = this;
        let hook = {
            beforeNext: (currentPage, submission, next) => {
                var form_data = JSON.parse(JSON.stringify(submission.data));
                if (currentPage.component["properties"]["set_property"]) {
                    var property = JSON.parse(currentPage.component["properties"]["set_property"]);
                    submission.data[property.property] = property.value;
                }
                // storeCache has to be fixed: For CSR if storeCache called, startForm will be loaded once we reload.
                that.storeCache(this.cleanData(form_data));
                next(null);
            },
            beforeCancel: () => {
                Swal.fire({
                    title: "Are you sure?",
                    text: "Do you really want to cancel the submission? This action cannot be undone!",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#d33",
                    cancelButtonColor: "#3085d6",
                    cancelButtonText: "No",
                    confirmButtonText: "Yes",
                    target: ".AppBuilderPage"
                }).then(result => {
                    if (result.value) {
                        that.stepDownPage();
                    }
                });
            },
            beforeSubmit: async (submission, next) => {
                var submitErrors = [];
                if (that.state.currentForm.isValid(submission.data, true) == false) {
                    that.state.currentForm.checkValidity(submission.data, true, submission.data);
                    that.state.currentForm.errors.forEach((error) => {
                        submitErrors.push(error.message);
                    });
                    if (submitErrors.length > 0) {
                        next([]);
                    } else {
                        if (this.props.customSaveForm && typeof this.props.customSaveForm == 'function') {
                            this.props.customSaveForm(that.cleanData(submission.data));
                            next(null);
                        }
                        var response = await that.saveForm(null, that.cleanData(submission.data)).then(function (response) {
                            if (response.status == 'success') {
                                next(null);
                            } else {
                                next([response.errors[0].message]);
                            }
                        });
                    }
                } else {
                    if (this.props.customSaveForm && typeof this.props.customSaveForm == 'function') {
                        this.props.customSaveForm(that.cleanData(submission.data));
                        next(null);
                    }
                    var response = await that.saveForm(null, that.cleanData(submission.data)).then(function (response) {
                        if (response.status == 'success') {
                            next(null);
                        } else {
                            if (that.props.route) {
                                next([response.message]);
                            }
                            next([response.errors[0].message]);
                        }
                    });
                }
            }
        }
        return hook

    }

    cleanData(formData) {
        // Remove Protected fields from being sent to server
        this.state.currentForm.everyComponent(function (comp) {
            var protectedFields = comp.component.protected;
            if (protectedFields) {
                delete formData[comp.component.key];
            }
            if (comp.component.persistent == false) {
                delete formData[comp.component.key];
            }
        });
        formData = JSON.parse(JSON.stringify(formData));// Cloning the formdata to avoid original data being removed
        formData.privileges = undefined;
        formData.userprofile = undefined;
        formData.countryList = undefined;
        formData.phoneList = undefined;
        formData.timezones = undefined;
        formData.dateFormats = undefined;
        formData.parentData = undefined;
        formData.orgId = this.hasCore?this.userprofile.orgid:undefined;
        var ordered_data = {};
        var componentList = flattenComponents(this.state.currentForm._form.components, true);
        for (var componentKey in componentList) {
            var componentItem = componentList[componentKey];
            if (componentItem && componentItem && componentItem.protected == true) {
                if (formData[componentKey]) {
                    delete formData[componentKey];
                }
            } else if (componentItem && componentItem && componentItem.persistent == false) {
                if (formData[componentKey]) {
                    delete formData[componentKey];
                }
            } else { }
        }
        Object.keys(formData).sort().forEach(function (key) {
            ordered_data[key] = formData[key];
        });
        if (this.state.currentForm._form["properties"] && this.state.currentForm._form["properties"]["clearVariables"]) {
            delete ordered_data[this.state.currentForm._form["properties"]["clearVariables"]];
        }
        return ordered_data;
    }

    addAddlData(data) {
        data = data ? data : {};
        return merge(data, {
          privileges: this.privileges,
          userprofile: this.userprofile,
          countryList: countryList,
          phoneList: phoneList,
          timezones: MomentTZ.tz.names(),
          dateFormats: DateFormats
        });
      }

    parseResponseData = data => {
        var parsedData = {};
        Object.keys(data).forEach(key => {
          try {
            parsedData[key] = (typeof data[key] === 'string') ? JSON.parse(data[key]) :
              (data[key] == undefined || data[key] == null) ? "" : data[key];
            if (parsedData[key] === "" && data[key] && parsedData[key] != data[key]) {
              parsedData[key] = data[key];
            }
          } catch (error) {
            if (data[key] != undefined) {
              parsedData[key] = data[key];
            }
          }
        });
        return parsedData;
      };
    

    // Setting empty and null fields to form setsubmission are making unfilled fields dirty and triggeres validation issue
    formatFormData(data) {
        var formData = this.parseResponseData(this.addAddlData(data));
        var ordered_data = {};
        Object.keys(formData)
            .sort()
            .forEach(function (key) {
                if (
                    !(
                        formData[key] == "" ||
                        formData[key] == null ||
                        formData[key] == []
                    )
                ) {
                    ordered_data[key] = formData[key];
                }
            });
        return ordered_data;
    }

    hideBreadCrumb(state = true) {
        if (this.state.currentForm && this.state.currentForm.wizard) {
            if (this.state.currentForm.wizard && this.state.currentForm.wizard.display == "wizard") {
                var breadcrumbs = document.getElementById(this.state.currentForm.wizardKey + "-header");
                if (breadcrumbs) {
                    // breadcrumbs.style.display = "none";
                }
            }
        }
    }

    async deleteCacheData() {
        var route = this.appUrl + "/deletecache";
        if (this.state.cacheId) {
            route = route + "/" + this.state.cacheId;
        }
        if (this.hasCore) {
            return await this.helper.request("v1", route, {}, "delete").then(response => {
                this.setState({ cacheId: null });
                return response;
            });
        } else {
            return await axios.delete(route, {}).then(response => {
                this.setState({ cacheId: null });
                return response;
            });
        }

    }

    showFormError(state = true, errorMessage) {
        errorMessage ? this.setState({
          formErrorMessage: errorMessage
        }) : null;
        if (state) {
          if (document.getElementById(this.formErrorDivId)) {
            document.getElementById(this.formErrorDivId).style.display = "block";
          }
          if (document.getElementById(this.formDivID)) {
            document.getElementById(this.formDivID).style.display = "none";
          }
        } else {
          if (document.getElementById(this.formErrorDivId)) {
            document.getElementById(this.formErrorDivId).style.display = "none";
          }
          if (document.getElementById(this.formDivID)) {
            document.getElementById(this.formDivID).style.display = "block";
          }
        }
        this.hasCore && this.loader.destroy();
      }

    showFormLoader(state = true, init = 0) {
        var loaderDiv = document.getElementById(this.loaderDivID);
        if (loaderDiv) {
            if (document.getElementById(this.formDivID).clientHeight > 0) {
                loaderDiv.style.height = document.getElementById(this.formDivID).clientHeight + " px";
            } else {
                loaderDiv.style.height = "100%";
            }
        }
        if (state) {
            if (loaderDiv) {
                loaderDiv.style.display = "flex";
            }
            this.hasCore && this.loader.show(loaderDiv);
            if (init == 1) {
                document.getElementById(this.formDivID).style.display = "none";
            }
        } else {
            this.hasCore && this.loader.destroy();
            if (loaderDiv) {
                loaderDiv.style.display = "none";
            }
            if (init == 1) {
                document.getElementById(this.formDivID).style.display = "block";
            }
            this.showFormError(false);
        }
    }

    async storeCache(params) {
        if (this.state.page) {
            params.page = this.state.page;
        }
        var route = this.appUrl + "/storecache";
        if (this.state.cacheId) {
            route = route + "/" + this.state.cacheId;
        }
        params.formId = this.state.formId;
        params.workflowInstanceId = this.state.workflowInstanceId;
        params.activityInstanceId = this.state.activityInstanceId;
        params.workflowId = this.state.workflowId;
        params.page = this.state.page;

        if (this.hasCore) {
            await this.helper.request("v1", route, params, "post").then(response => {
                this.setState({ cacheId: response.data.cacheId });
                return response;
            });
        } else {
            await axios.post(route, params).then(response => {
                this.setState({ cacheId: response.data.cacheId });
                return response;
            });
        }
    }

    async callPipeline(commands, submission) {
        var params = [];
        params = submission;
        try {
            params["commands"] = JSON.parse(commands);
        } catch (e) {
            if (commands["commands"]) {
                params["commands"] = commands["commands"];
            } else {
                params["commands"] = commands;
            }
        }
        if (this.hasCore) {
            return await this.helper.request("v1", this.appUrl + "/pipeline", params, "post");
        } else {
            return await axios.post(this.appUrl + "/pipeline", params)
        }
    }
    async getPayment() {
        if(this.hasCore){
            return await this.helper.request("v1", this.appUrl + "/paymentgateway", {}, "get");
        }else{
            return axios.get(this.appUrl + "/paymentgateway", {});
        }
      }

    handleError(e) {
        this.showFormLoader(false, 0);
        console.log("ERROR" + e);
        this.notif.current.notify("Error", "Unexpected Error! Please try later", "danger");
    }

    async storeError(data, error, route) {
        let params = {};
        params.type = "form";
        params.errorTrace = JSON.stringify(error);
        params.params = JSON.stringify({
            cache_id: this.state.cacheId,
            app_id: this.state.appId,
            formId: this.state.formId,
            workflowId: this.state.workflowId,
            route: route
        });
        if (this.hasCore) {
            return await this.helper.request("v1", this.appUrl + "/errorlog", params, "post");
        } else {
            return await axios.post(this.appUrl + "/errorlog", params);
        }
    }

    async callDelegate(delegate, params) {
        if (this.hasCore) {
            return await this.helper.request("v1", this.appUrl + "/command/delegate/" + delegate, { ...params, bos: this.getBOSData() }, "post");
        } else {
            return await axios.post(this.appUrl + "/command/delegate/" + delegate, { ...params, bos: this.getBOSData() });
        }
    }

    getBOSData() {
        return {
            ...this.props,
            core: undefined,
            proc: undefined,
            postSubmitCallback: undefined,
        };
        // We can add few other fields along with props as needed.
        // JS Objects must be unset here
    }

    async saveForm(form, data) {
        this.showFormLoader(true, 0);
        var that = this;
        if (!form) {
            form = this.state.currentForm;
        }
        var componentList = flattenComponents(form._form.components, true);
        for (var componentKey in componentList) {
            var componentItem = componentList[componentKey];
            if (componentItem && componentItem && componentItem.protected == true) {
                if (data[componentKey]) {
                    delete data[componentKey];
                }
            } else if (componentItem && componentItem && componentItem.persistent == false) {
                if (data[componentKey]) {
                    delete data[componentKey];
                }
            } else {
                // console.log(componentItem);
            }
        }
        if (form._form["properties"] && form._form["properties"]["submission_commands"]) {
            if (this.state.workflowId) {
                form.data["workflowId"] = this.state.workflowId;
            }
            if (this.state.workflowInstanceId) {
                form.submission.data["workflowInstanceId"] = this.state.workflowInstanceId;
                if (this.state.activityInstanceId) {
                    form.submission.data["activityInstanceId"] = this.state.activityInstanceId;
                    if (this.state.instanceId) {
                        form.submission.data["instanceId"] = $this.state.instanceId;
                    }
                }
            }
            if (this.props.fileId) {
                form.submission.data.fileId = this.state.fileId;
                form.submission.data["workflow_instance_id"] = undefined;
            }
            if (this.props.parentFileId) {
                form.submission.data.fileId = undefined;
                form.submission.data["workflow_instance_id"] = undefined;
                form.submission.data.bos ? null : (form.submission.data.bos = {});
                form.submission.data.bos.assoc_id = this.props.parentFileId;
            }
            return await this.callPipeline(form._form["properties"]["submission_commands"], this.cleanData(form.submission.data)).then(async response => {
                if (response.status == "success") {
                    await this.deleteCacheData().then(response2 => {
                        that.showFormLoader(false, 0);
                        if (response2.status == "success") {
                            this.stepDownPage();
                        }
                    }).catch(e => {
                        that.handleError(e);
                    });
                    return response;
                } else {
                    if (response.errors) {
                        await this.storeError(data, response.errors, "pipeline");
                        that.showFormLoader(false, 0);
                        this.notif.current.notify("Error", response.errors[0].message, "danger");
                        return response;
                    } else {
                        await this.storeCache(data);
                        that.showFormLoader(false, 0);
                        this.notif.current.notify("Error", "Form Submission Failed", "danger");
                    }
                }
            }).catch(e => {
                that.handleError(e);
            });
        } else {
            let route = "";
            let method = "post";
            if (form._form["properties"] && form._form["properties"]["submission_api"]) {
                var postParams = JSON.parse(form._form["properties"]["submission_api"]);
                route = ParameterHandler.replaceParams(this.state.appId, postParams.api.url, form.submission.data);
                delete data.orgId;
                method = postParams.api.method;
            } else if (this.state.workflowId) {
                route = "/workflow/" + this.state.workflowId;
                if (this.state.activityInstanceId) {
                    route = "/workflow/" + this.state.workflowId + "/activity/" + this.state.activityInstanceId;
                    method = "post";
                    if (this.state.instanceId) {
                        route = "/workflow/" + this.state.workflowId + "/activity/" + this.state.activityId + "/instance/" + this.state.instanceId;
                        method = "put";
                    }
                }
            } else if (this.state.workflowInstanceId) {
                route = "/workflowinstance/" + this.state.workflowInstanceId;
                if (this.state.activityInstanceId) {
                    route = "/workflowinstance/" + this.state.workflowInstanceId + "/activity/" + this.state.activityInstanceId;
                    method = "post";
                }
                route = route + "/submit";
            } else {
                route = this.appUrl + "/form/" + this.state.formId + "/file";
                method = "post";

                if (this.props.route) {
                    route = this.props.route;
                    method = "post"
                }
                if (this.state.instanceId) {
                    route = this.appUrl + "/form/" + this.state.formId + "/file/" + this.state.instanceId;
                    method = "put";
                }
            }
            return await this.hasCore?this.helper.request("v1", route, this.cleanData(data), method):axios({method:method,url:route,data:this.cleanData(data)}).then(async response => {
                if (response.status == "success") {
                    if (this.props.route) {
                        that.showFormLoader(false, 0);
                        this.props.postSubmitCallback();
                    }
                    var cache = await this.deleteCacheData().then(response2 => {
                        that.showFormLoader(false, 0);
                        if (response2.status == "success") {
                            this.stepDownPage();
                        }
                    });
                    return response;
                } else {
                    if (this.props.route) {
                        console.log(response)
                        that.showFormLoader(false, 0);

                    }
                    else {
                        var storeCache = await this.storeCache(this.cleanData(data)).then(
                            async cacheResponse => {
                                if (response.data.errors) {
                                    var storeError = await this.storeError(this.cleanData(data), response.data.errors, route).then(storeErrorResponse => {
                                        that.showFormLoader(false, 0);
                                        this.notif.current.notify("Error", "Form Submission Failed", "danger");
                                        return storeErrorResponse;
                                    });
                                } else {
                                    that.showFormLoader(false, 0);
                                    return storeErrorResponse;
                                }
                            });
                    }
                }
                return response;
            });
        }
    }

    async storePayment(params) {
        if(this.hasCore){
            return await this.helper.request("v1", this.appUrl + "/transaction/" + params.transaction_id + "/status", params.data, "post");
        }else{
            return await axios.post(this.appUrl + "/transaction/" + params.transaction_id + "/status", params.data);
        }
    }

    postDelegateRefresh(form, properties) {
        var targetList = properties["post_delegate_refresh"].split(',');
        targetList.map(item => {
          var targetComponent = form.getComponent(item);
          if (targetComponent && targetComponent.component && targetComponent.component["properties"]) {
            if (targetComponent.type == 'datagrid' || targetComponent.type == 'selectboxes') {
              targetComponent.triggerRedraw();
            }
            if (targetComponent.component['properties']) {
              this.runProps(targetComponent, form, targetComponent.component['properties'], form.submission.data);
            } else {
              if (targetComponent.component && targetComponent.component.properties) {
                this.runProps(targetComponent, form, targetComponent.component.properties, form.submission.data);
              }
            }
          }
        });
    }

    runProps(component, form, properties, formdata, instance = null) {
        if (formdata.data) {
            formdata = formdata.data;
        }
        var that = this;
        if (properties && (Object.keys(properties).length > 0)) {
            if (properties["delegate"]) {
                that.showFormLoader(true, 0);
                this.callDelegate(properties["delegate"], this.cleanData(formdata)).then(response => {
                    if (response && response.status == "success") {
                        if (response.data) {
                            var formData = { data: this.formatFormData(response.data) };
                            form.setSubmission(formData).then(response2 => {
                                if (properties["post_delegate_refresh"]) {
                                    this.postDelegateRefresh(form, properties);
                                }
                                that.showFormLoader(false, 0);
                                form.setPristine(true);
                            });
                        }
                    } else {
                        that.showFormLoader(false, 0);
                    }
                }).catch(e => {
                    that.handleError(e);
                });
            }
            if (properties["target"]) {
                var targetComponent = form.getComponent(properties["target"]);
                var value;
                if (component.dataValue != undefined && targetComponent != undefined) {
                    value = formdata[component.dataValue];
                    if (component.dataValue != undefined && component.dataValue.value != undefined && formdata[component.dataValue.value] != undefined) {
                        formdata[component.key] = formdata[component.dataValue.value];
                    } else if (component.dataValue.value != undefined) {
                        value = component.dataValue.value;
                    } else if (formdata[component.dataValue] != undefined) {
                        value = formdata[component.dataValue];
                    } else {
                        value = component.dataValue;
                    }
                    if (value == undefined) {
                        if (formdata[formdata[component.key]]) {
                            value = formdata[component.key];
                        }
                    }
                    if (value != undefined) {
                        targetComponent.setValue(value);
                        form.submission.data[targetComponent.key] = value;
                    }
                } else {
                    if (component != undefined && targetComponent != undefined) {
                        if (component.value != undefined && component.value.value != undefined && formdata[component.value.value] != undefined) {
                            value = formdata[component.value.value];
                        } else if (component.value != undefined && component.value.value != undefined) {
                            value = component.value.value;
                        } else if (formdata[component.value] != undefined) {
                            value = formdata[component.value];
                        } else if (formdata[formdata[component.key]] != undefined) {
                            value = formdata[formdata[component.key]];
                        } else if (formdata[component.key] && formdata[formdata[component.key]] != undefined) {
                            value = formdata[formdata[component.key]];
                        } else if (formdata[component.key] && formdata[formdata[component.key].value] != undefined) {
                            value = formdata[formdata[component.key].value];
                        } else if (formdata[component.key] != undefined) {
                            value = formdata[component.key];
                        } else {
                            value = component.value;
                        }
                        if (value == undefined) {
                            if (formdata[formdata[component.key]]) {
                                value = formdata[component.key];
                            }
                        }
                        if (value != undefined) {
                            targetComponent.setValue(value);
                            form.submission.data[targetComponent.key] = value;
                        }
                    } else {
                        if (document.getElementById(properties["target"])) {
                            value = formdata[component.value];
                            if (component.value != undefined && component.value.value != undefined) {
                                value = formdata[component.value.value];
                            } else if (value && value != undefined) {
                                value = value;
                            } else if (formdata[formdata[component.key]] != undefined) {
                                value = formdata[formdata[component.key]];
                            } else if (formdata[component.key] != undefined) {
                                value = formdata[component.key];
                            } else {
                                if (component.value != undefined && component.value.value != undefined) {
                                    value = component.value.value;
                                } else {
                                    value = component.value;
                                }
                            }
                            if (value == undefined) {
                                if (formdata[formdata[component.key]]) {
                                    value = formdata[component.key];
                                }
                            }
                            document.getElementById(properties["target"]).value = value;
                        }
                    }
                }
                if (targetComponent && targetComponent.component && targetComponent.component.properties) {
                    that.runProps(targetComponent.component, form, targetComponent.component.properties, form.submission.data);
                    form.setPristine(true);
                }
            }
            if (properties["negate"]) {
                var targetComponent = form.getComponent(properties["negate"]);
                if (component.value && targetComponent) {
                    if (component.value.value) {
                        targetComponent.setValue(!component.value.value);
                    } else {
                        targetComponent.setValue(!component.value);
                    }
                } else {
                    if (formdata[component.key]) {
                        targetComponent.setValue(!formdata[component.key]);
                    }
                }
            }
            if (properties["clear_field"]) {
                var processed = false;
                if (instance) {
                    var instancePath = instance.path.split('.');
                    instancePath.pop();
                    var tempPath = "formdata." + (instancePath.join(".")) + "." + properties["clear_field"] + ' = ""';
                    eval(tempPath);
                    form.submission = { data: formdata };
                    processed = true;
                }
                if (!processed) {
                    var targetComponent = form.getComponent(properties["clear_field"]);
                    if (targetComponent) {
                        targetComponent.setValue("");
                    }
                }
            }

            if (properties["render"]) {
                var targetList = properties["render"].split(',');
                targetList.map(item => {
                    var targetComponent = form.getComponent(item);
                    if (targetComponent && targetComponent.component && targetComponent.component.properties) {
                        that.runProps(targetComponent.component, form, targetComponent.component.properties, form.submission.data);
                        that.runDelegates(form, targetComponent.component["properties"]);
                    }
                });
            }
            if (properties["redraw"]) {
                var targetList = properties["redraw"].split(",");
                targetList.map((item) => {
                    var targetComponent = form.getComponent(item);
                    targetComponent.redraw();
                });
            }
            form.setPristine(true);
        }
    }

    formSendEvent(eventName, params) {
        var evt = new CustomEvent(eventName, params);
        if (this.state.currentForm) {
          this.state.currentForm.element.dispatchEvent(evt);
        }
    }
    async callPayment(params) {
        if(this.hasCore){
            return await this.helper.request("v1", this.appUrl + "/paymentgateway/initiate", params, "post");
        }else{
            return await axios.post( this.appUrl + "/paymentgateway/initiate", params);
        }
      }

    requestPaymentToken(that, form, e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        that.showFormLoader(true, 0);
        that.callPayment(e.detail).then(response => {
          var transactionIdComponent = form.getComponent("transaction_id");
          if (response.data) {
            if (response.data.transaction.id && response.data.token) {
              transactionIdComponent.setValue(response.data.transaction.id);
              that.formSendEvent("getPaymentToken", { detail: response.data });
            } else {
              that.notif.current.notify("Error", "Transaction Token Failed!", "danger");
            }
          }
          that.showFormLoader(false,0);
        }).catch(e => {
            that.handleError(e);
        });
      }

    runDelegates(form, properties) {
        if (properties) {
            if (properties["delegate"]) {
                this.callDelegate(properties["delegate"], this.cleanData(form.submission.data)).then(response => {
                    if (response.status == "success") {
                        if (response.data) {
                            form.setSubmission({ data: this.formatFormData(response.data) }).then(respone => {
                                this.showFormLoader(false, 0);
                            });
                        }
                    } else {
                        this.showFormLoader(false, 0);
                    }
                }).catch(e => {
                    that.handleError(e);
                });
            }
            if (properties["commands"]) {
                var that = this;
                that.showFormLoader(true, 0);
                if (form.submission.data && form.submission.data['fileId']) {
                    this.setState({ fileId: form.submission.data['fileId'] });
                }
                var form_data = {
                    ...form.submission.data,
                    fileId: this.state.fileId ? this.state.fileId : null
                };
                this.callPipeline(properties["commands"], this.cleanData(form_data)).then(response => {
                    if (response.status == "success") {
                        if (response.data) {
                            form.setSubmission({ data: that.formatFormData(response.data) }).then(response2 => {
                                if (properties["post_delegate_refresh"]) {
                                    this.postDelegateRefresh(form, properties);
                                } else {
                                    that.runProps(null, form, properties, that.formatFormData(form.submission.data));
                                }
                                that.showFormLoader(false, 0);
                            });
                        }
                    } else {
                        that.showFormLoader(false, 0);
                    }
                }).catch(e => {
                    that.handleError(e);
                });
            }
            if (properties["payment_confirmation_page"]) {
                var elements = document.getElementsByClassName("btn-wizard-nav-submit");
                this.getPayment(form.submission.data).then(response => {
                    var responseArray = [];
                    if (response.data) {
                        this.formSendEvent("paymentDetails", { cancelable: true, detail: response.data[0] });
                    }
                }).catch(e => {
                    that.handleError(e);
                });
                var that = this;
                form.element.removeEventListener("requestPaymentToken", function (e) { that.requestPaymentToken(that, form, e) }, false);
                form.element.addEventListener("requestPaymentToken", function (e) { that.requestPaymentToken(that, form, e) }, false);
                form.element.addEventListener("paymentSuccess", function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    that.showFormLoader(true, 0);
                    var transactionIdComponent = form.getComponent("transaction_id");
                    that.storePayment({ transaction_id: transactionIdComponent.getValue(), data: e.detail.data, status: e.detail.status }).then(response => {
                        that.notif.current.notify("Payment has been Successfully completed!", "Please wait while we get things ready!", "success");
                        var transactionStatusComponent = form.getComponent("transaction_status");
                        var transactionReferenceComponent = form.getComponent("transaction_reference_number");
                        transactionStatusComponent.setValue(e.detail.status);
                        if (transactionReferenceComponent != undefined) {
                            transactionReferenceComponent.setValue(e.detail.transaction_reference_number);
                        }
                        if (form.getNextPage() == -1) {
                            var formsave = that.saveForm(form, that.state.currentForm.submission.data);
                            if (formsave) {
                                that.notif.current.notify("Success", "Application Has been Successfully Submitted", "success");
                            } else {
                                that.notif.current.notify("Error", e.detail.message, "danger");
                            }
                        } else {
                            form.nextPage();
                        }
                        that.showFormLoader(false, 0);
                    }).catch(e => {
                        that.handleError(e);
                    });
                }, false);
                form.element.addEventListener("tokenFailure", function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    if (e.detail.error) {
                        that.notif.current.notify("Error", e.detail.message, "danger");
                    }
                }, false);
                form.element.addEventListener("paymentDeclined", function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    var transactionIdComponent = form.getComponent("transaction_id");
                    that.storePayment({ transaction_id: transactionIdComponent.getValue(), data: e.detail.data }).then(response => {
                        that.notif.current.notify("Error", e.detail.message, "danger");
                        that.showFormLoader(false, 0);
                    }).catch(e => {
                        that.handleError(e);
                    });
                }, false);
                form.element.addEventListener("paymentCancelled", function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    that.notif.current.notify("Warning", e.detail.message, "danger");
                    that.showFormLoader(false, 0);
                }, false);
                form.element.addEventListener("paymentError", function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    var transactionIdComponent = form.getComponent("transaction_id");
                    that.storePayment({ transaction_id: transactionIdComponent.getValue(), data: e.detail.data }).then(response => {
                        that.notif.current.notify("Error", e.detail.message, "danger");
                        that.showFormLoader(false, 0);
                    }).catch(e => {
                        that.handleError(e);
                    });
                }, false);
                form.element.addEventListener("paymentPending", function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    that.showFormLoader(true, 0);
                    that.notif.current.notify("Information", e.detail.message, "default");
                }, false);
            }
        }
    }

    async PushDataPOST(api, method, item, body) {
        if(this.hasCore){
            if (method == "put") {
                return await this.helper.request("v1", "/" + api + "/" + item, body, "filepost");
                } else if (method == "post") {
                return await this.helper.request("v1", "/" + api, body, "post");
                }
        }else{

        }
      
    }

    async importCSS(theme){
    try{
        await import(theme);
    } catch(Exception){
        console.log("Unable to import "+theme);
    }
    }
    createForm() {
        let that = this;

        Formio.registerComponent("slider", SliderComponent);
        Formio.registerComponent("convergepay", ConvergePayCheckoutComponent);
        Formio.registerComponent("document", DocumentComponent);
        Formio.registerComponent("fortepay", FortePayCheckoutComponent);
        Formio.registerComponent("documentviewer", DocumentViewerComponent);
        Formio.registerComponent("documentsigner", DocumentSignerComponent);
        Formio.registerComponent("radiocard", RadioCardComponent);
        Formio.registerComponent("phonenumber", PhoneNumberComponent);
        Formio.registerComponent("selectcountry", CountryComponent);
        Formio.registerComponent("file", FileComponent);
        Formio.registerComponent("select", SelectComponent);
        Formio.registerComponent("textarea", TextAreaComponent);


        if (this.props.proc && this.props.proc.metadata && this.props.proc.metadata.formio_endpoint) {
            this.props.proc.metadata.formio_endpoint ? Formio.setProjectUrl(this.props.proc.metadata.formio_endpoint) : null;
        }
        if (this.state.content && !this.state.form) {
            var options = {};
            if (this.state.content["properties"]) {
                if (this.state.content["properties"]["clickable"]) {
                    options.breadcrumbSettings = { clickable: eval(this.state.content["properties"]["clickable"]) };
                }
                if (this.state.content["properties"]["hideBreadcrumbs"]) {
                    if (eval(this.state.content.properties.showBreadcrumbs)) {
                        document.getElementById(this.formDivID).classList.add("hideBredcrumb");
                    }
                }
                if (this.state.content["properties"]["showPrevious"]) {
                    options.buttonSettings = { showPrevious: eval(this.state.content["properties"]["showPrevious"]) };
                }
                if (this.state.content["properties"]["showNext"]) {
                    options.buttonSettings = { showNext: eval(this.state.content["properties"]["showNext"]) };
                }
                if (this.state.content["properties"]["showCancel"]) {
                    options.buttonSettings = { showCancel: eval(this.state.content["properties"]["showCancel"]) };
                }
                if (this.state.content["properties"]["theme"]) {
                    importCSS(this.state.content["properties"]["theme"]);
                }
            }
            var hooks = this.createHook()
            options.hooks = hooks;
            var formCreated = Formio.createForm(document.getElementById(this.formDivID), this.state.content, options).then(function (form) {
                if (that.state.page && form.wizard) {
                    if (form.wizard && form.wizard.display == "wizard") {
                        form.setPage(parseInt(that.state.page));
                        that.hideBreadCrumb(true);
                    }
                }
                if (that.state.data != undefined) {

                    form.setSubmission({ data: that.state.data });
                }
                form.on("submit", async function (submission) {
                    form.emit('submitDone', submission);
                });
                form.on("prevPage", changed => {
                    form.emit("render");
                    that.setState({ page: changed.page });
                    var elm = document.getElementsByClassName(that.state.appId + "_breadcrumbParent");
                    if (elm.length > 0) {
                        scrollIntoView(elm[0], { scrollMode: "if-needed", block: "center", behavior: "smooth", inline: "nearest" });
                    }
                });
                form.on("nextPage", changed => {
                    form.emit("render");
                    that.runDelegates(form, form.pages[changed.page].originalComponent['properties']);
                    that.setState({ page: changed.page });
                    var elm = document.getElementsByClassName(that.state.appId + "_breadcrumbParent");
                    if (elm.length > 0) {
                        scrollIntoView(elm[0], { scrollMode: "if-needed", block: "center", behavior: "smooth", inline: "nearest" });
                    }
                });

                form.on("change", function (changed) {
                    if (changed && changed.changed) {
                        var component = changed.changed.component;
                        var instance = changed.changed.instance;
                        var properties = component.properties;
                        if (properties && (Object.keys(properties).length > 0)) {
                            if (component != undefined) {
                                that.runProps(component, form, properties, changed.data, instance);
                            } else {
                                if (changed.changed != undefined) {
                                    that.runProps(changed.changed, form, changed.changed.properties, changed.data);
                                }
                            }
                        }
                    }
                });
                form.on("render", function () {
                    that.hideBreadCrumb(true);
                    var nextButton = document.getElementsByClassName("btn-wizard-nav-next");
                    var elm = document.getElementsByClassName(that.state.appId + "_breadcrumbParent");
                    if (nextButton.length > 0) {
                        if (nextButton[0].getAttribute("errorScrollEventAdded") !== "true") {
                            nextButton[0].setAttribute("errorScrollEventAdded", "true");
                            nextButton[0].addEventListener("click", () => {
                                var submitErrors = [...document.querySelectorAll('[ref="errorRef"]')];
                                if (elm.length > 0 && submitErrors.length > 0) {
                                    scrollIntoView(elm[0], {
                                        scrollMode: "if-needed",
                                        block: "center",
                                        behavior: "smooth",
                                        inline: "nearest"
                                    });
                                }
                            });
                        }
                    }
                    if (that.state.formLevelDelegateCalled == false) {
                        that.setState({ formLevelDelegateCalled: true });
                    }
                });
                form.on("customEvent", function (event) {
                    var changed = event.data;
                    if (event.type == "callDelegate") {
                        var component = event.component;
                        if (component) {
                            that.showFormLoader(true, 0);
                            var properties = component.properties;
                            if (properties) {
                                if (properties["delegate"]) {
                                    if (properties["sourceDataKey"] && properties["destinationDataKey"]) {
                                        var paramData = {};
                                        paramData[properties["valueKey"]] = changed[properties["sourceDataKey"]];
                                        paramData['orgId'] = changed['orgId'];
                                        if (properties['additionalKey']) {
                                            paramData[properties["additionalKey"]] = changed[properties["additionalKeyValue"]];
                                        }
                                        that.showFormLoader(true, 0);
                                        that.callDelegate(properties["delegate"], paramData).then(response => {
                                            var responseArray = [];
                                            for (var responseDataItem in response.data) {
                                                if (response.data.hasOwnProperty(responseDataItem)) {
                                                    responseArray[responseDataItem] = response.data[responseDataItem];
                                                }
                                            }
                                            if (response.data) {
                                                if (response.data) {
                                                    var destinationComponent = form.getComponent(properties["destinationDataKey"]);
                                                    if (properties["validationKey"]) {
                                                        if (properties["validationKey"] && response.data[properties["validationKey"]]) {
                                                            var componentList = flattenComponents(destinationComponent.componentComponents, false);
                                                            var valueArray = [];
                                                            for (var componentKey in componentList) {
                                                                valueArray[componentKey] = response.data[componentKey];
                                                            }
                                                            valueArray = Object.assign({}, valueArray);
                                                            if (changed[properties["destinationDataKey"]].length > 1) {
                                                                changed[properties["destinationDataKey"]].unshift(valueArray);
                                                            } else {
                                                                if (changed[properties["destinationDataKey"]].length == 1) {
                                                                    //Please dont remove the below commented line
                                                                    // if(changed[properties["destinationDataKey"]] && Object.getOwnPropertyNames(changed[properties["destinationDataKey"]][0]).length === 0){
                                                                    if (changed[properties["destinationDataKey"]] && changed[properties["destinationDataKey"]][0].length === 0) {
                                                                        changed[properties["destinationDataKey"]][0] = valueArray;
                                                                    } else {
                                                                        changed[properties["destinationDataKey"]].unshift(valueArray);
                                                                    }
                                                                } else {
                                                                    changed[properties["destinationDataKey"]].unshift(valueArray);
                                                                }
                                                            }
                                                        }
                                                        if (properties["clearSource"]) {
                                                            changed[properties["sourceDataKey"]] = "";
                                                        }
                                                    }
                                                    changed[properties["validationKey"]] = response.data[properties["validationKey"]];
                                                    form.setSubmission({ data: that.formatFormData(changed) }).then(response2 => {
                                                        destinationComponent.triggerRedraw();
                                                    });
                                                }
                                            }
                                            that.showFormLoader(false, 0);
                                        }).catch(e => {
                                            that.handleError(e);
                                        });
                                    } else if (properties["sourceDataKey"]) {
                                        var paramData = {};
                                        paramData[properties["valueKey"]] = changed[properties["sourceDataKey"]];
                                        that.showFormLoader(true, 0);
                                        that.callDelegate(properties["delegate"], paramData).then(response => {
                                            var responseArray = [];
                                            if (response.data) {
                                                for (var responseDataItem in response.data) {
                                                    if (response.data.hasOwnProperty(responseDataItem)) {
                                                        responseArray[responseDataItem] = response.data[responseDataItem];
                                                    }
                                                }
                                                if (properties["validationKey"]) {
                                                    if (properties["validationKey"] && response.data[properties["validationKey"]]) {
                                                        var valueArray = [];
                                                        for (var item in response.data) {
                                                            changed[item] = response.data[item];
                                                        }
                                                    }
                                                    if (properties["clearSource"]) {
                                                        changed[properties["sourceDataKey"]] = "";
                                                    }
                                                }
                                                form.setSubmission({ data: that.formatFormData(changed) }).then(response => {
                                                    destinationComponent.triggerRedraw();
                                                });
                                            }
                                            that.showFormLoader(false, 0);
                                        }).catch(e => {
                                            that.handleError(e);
                                        });
                                    } else {
                                        that.callDelegate(properties["delegate"], that.cleanData(changed)).then(response => {
                                            if (response.status == 'success') {
                                                if (response.data) {
                                                    form.setSubmission({ data: that.formatFormData(response.data) }).then(result => {
                                                        that.showFormLoader(false, 0);
                                                    });
                                                }
                                            } else {
                                                that.showFormLoader(false, 0);
                                            }
                                        }).catch(e => {
                                            that.handleError(e);
                                        });
                                    }
                                }
                            }
                        }
                    }
                    if (event.type == "triggerFormChange") {
                        form.triggerChange();
                    }
                    if (event.type == "callPipeline") {
                        var component = event.component;
                        if (component) {
                            that.showFormLoader(true, 0);
                            var properties = component.properties;
                            if (properties["commands"]) {
                                that.callPipeline(properties["commands"], that.cleanData(changed)).then(response => {
                                    if (response.status == "success") {
                                        if (response.data) {
                                            try {
                                                var formData = that.formatFormData(response.data);
                                                form.setSubmission({ data: formData }).then(response2 => {
                                                    that.runProps(component, form, properties, that.formatFormData(form.submission.data));
                                                    that.showFormLoader(false, 0);
                                                });
                                            } catch (e) {
                                                console.log(e);
                                            }
                                        }
                                    } else {
                                        that.showFormLoader(false, 0);
                                    }
                                });
                            }
                        }
                    }

                    if (event.type == "callApi") {
                        var component = event.component;
                        if (component) {
                            var properties = component.properties;
                            if (properties) {
                                if (properties["api"]) {
                                    var postParams = JSON.parse(properties["api"]);
                                    var data = that.cleanData(changed);
                                    delete data.orgId;
                                    that.PushDataPOST(postParams['api']['url'], postParams['api']['method'], null, data).then(response => {
                                        console.log(response);
                                        if (response.status == "success") {
                                            if (response.data) {
                                                try {
                                                    var formData = that.formatFormData(response.data);
                                                    form.setSubmission({ data: formData }).then(response2 => {
                                                        that.showFormLoader(false, 0);
                                                    });
                                                } catch (e) {
                                                    console.log(e);
                                                }
                                            }
                                        } else {
                                            that.showFormLoader(false, 0);
                                            that.notif.current.notify("Error", response.message, "danger");
                                        }
                                    }).catch(e => {
                                        that.handleError(e);
                                    });
                                }
                            }
                        }
                    }

                });
                form.formReady.then(() => {
                    that.showFormLoader(false, 1);
                });
                form.submissionReady.then(() => {
                    form.element.addEventListener("getAppDetails", function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                        that.formSendEvent("appDetails", { detail: { core: that.core, appId: that.state.appId, uiUrl: that.hasCore?that.core.config("ui.url"):undefined, wrapperUrl: that.hasCore?that.core.config("wrapper.url"):undefined } });
                    }, true);
                    form.emit("render");
                });
                that.setState({ currentForm: form });
                return form;
            });
        }
        return formCreated
    }
    render() {
        return (
            <div>
                <Notification ref={this.notif} />
                <div id={this.loaderDivID}></div>
                <div id={this.formErrorDivId} style={{ display: "none" }}>
                    <h3>{this.state.formErrorMessage}</h3>
                </div>
                <div className="form-render" id={this.formDivID}></div>
            </div>
        );
    }
}

export default BaseFormRenderer;