import "../../public/css/formstyles.scss";
import { Formio } from "formiojs";
import Notification from "../../Notification";
import { getComponent , flattenComponents , eachComponent } from "formiojs/utils/formUtils";
import React from "react";
import merge from "deepmerge";
import $ from "jquery";
import Swal from "sweetalert2";
import scrollIntoView from "scroll-into-view-if-needed";
import ConvergePayCheckoutComponent from "./Form/Payment/ConvergePayCheckoutComponent";
import DocumentComponent from "./Form/DocumentComponent";
import { countryList } from "./Form/Country.js";
import { phoneList } from "./Form/Phonelist.js";
import SliderComponent from "./Form/SliderComponent";
import FortePayCheckoutComponent from "./Form/Payment/FortePayCheckoutComponent";
import DocumentViewerComponent from "./Form/DocumentViewerComponent";
import RadioCardComponent from "./Form/RadioCardComponent";

class FormRender extends React.Component {
  constructor(props) {
    super(props);
    this.core = this.props.core;
    var userprofile = this.core.make("oxzion/profile").get();
    this.privileges = userprofile.key.privileges;
    this.userprofile = userprofile.key;
    this.loader = this.core.make("oxzion/splash");
    this.state = {
      form: null,
      showLoader: false,
      appId: this.props.appId,
      workflowId: null,
      cacheId: null,
      workflowInstanceId: this.props.workflowInstanceId,
      parentWorkflowInstanceId: this.props.parentWorkflowInstanceId,
      activityInstanceId: this.props.activityInstanceId,
      activityId: this.props.activityId,
      instanceId: this.props.instanceId,
      formId: this.props.formId,
      paymentDetails: null,
      hasPayment: false,
      content: this.props.content,
      data: this.addAddlData(this.props.data),
      page: this.props.page,
      currentForm: null,
      formLevelDelegateCalled: false
    };
    this.helper = this.core.make("oxzion/restClient");
    this.notif = React.createRef();
    var formID = this.props.formId ? this.props.formId : "123";
    if (this.props.cacheId) {
      this.setState({ cacheId: this.props.cacheId });
    }
    this.formDivID = "formio_" + formID;
    this.loaderDivID = "formio_loader_"+formID;
    this.formErrorDivId = "formio_error_"+formID;
  }
  showFormLoader(state=true,init=0){
    if(state){
      this.loader.show(document.getElementById(this.loaderDivID));
      if(init == 1){
        document.getElementById(this.formDivID).style.display = "none";
      }
    } else {
      this.loader.destroy();
      if(init == 1){
        document.getElementById(this.formDivID).style.display = "block";
      }
      this.showFormError(false);
    }
  }
  showFormError(state=true){
    if(state){
      document.getElementById(this.formErrorDivId).style.display = "block";
      document.getElementById(this.formDivID).style.display = "none";
    } else {
      document.getElementById(this.formErrorDivId).style.display = "none";
      document.getElementById(this.formDivID).style.display = "block";
    }
  }
  async callDelegate(delegate, params) {
    let delegateData = await this.helper.request("v1","/app/" + this.state.appId + "/delegate/" + delegate,params,"post");
    return delegateData;
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
    let delegateData = await this.helper.request("v1","/app/" + this.state.appId + "/pipeline",params,"post");
    return delegateData;
  }
  async callPayment(params) {
    let delegateData = await this.helper.request("v1","/app/" + this.state.appId + "/paymentgateway/initiate",params,"post");
    return delegateData;
  }
  async storePayment(params) {
    let delegateData = await this.helper.request("v1","/app/"+this.state.appId+"/transaction/"+params.transaction_id+"/status",params.data,"post");
    return delegateData;
  }
  async getCacheData() {
    let cacheData = await this.helper.request("v1","/app/" + this.state.appId + "/cache",{},"get");
    return cacheData;
  }

  async storeCache(params) {
    if (this.state.page) {
      params.page = this.state.page;
    }
    var route = "/app/" + this.state.appId + "/storecache";
    if (this.state.cacheId) {
      route = route + "/" + this.state.cacheId;
    }
    params.formId = this.state.formId;
    await this.helper.request("v1", route, params, "post").then(response => {
      this.setState({ cacheId: response.data.id });
      return response;
    });
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
    let response = await this.helper.request("v1","/app/" + this.state.appId + "/errorlog",params,"post");
    return;
  }
  async deleteCacheData() {
    var route = "/app/" + this.state.appId + "/deletecache";
    if (this.state.cacheId) {
      route = route + "/" + this.state.cacheId;
    }
    let cacheData = await this.helper.request("v1", route, {}, "delete").then(response => {
      this.setState({ cacheId: null });
      return response;
    });
    return cacheData;
  }

  async getPayment() {
    let delegateData = await this.helper.request("v1","/app/" + this.state.appId + "/paymentgateway",{},"get");
    return delegateData;
  }
  async getWorkflow() {
    // call to api using wrapper
    let pageContent = await this.helper.request("v1","/app/" + this.state.appId + "/form/" + this.state.formId + "/workflow",{},"get");
    return pageContent;
  }
  async getForm() {
    // call to api using wrapper
    let form = await this.helper.request("v1","/app/" + this.state.appId + "/form/" + this.state.formId,{},"get");
    return form;
  }

  async getFileData() {
    // call to api using wrapper
    let fileData = await this.helper.request("v1","/app/"+this.state.appId+"/workflowInstance/"+this.props.parentWorkflowInstanceId,{},"get");
    return fileData;
  }

  async getActivity() {
    // call to api using wrapper
    let formContent = await this.helper.request("v1","/activity/" + this.state.activityInstanceId + "/form",{},"get");
    return formContent;
  }
  async getActivityInstance() {
    // call to api using wrapper
    let formContent = await this.helper.request("v1","/app/" +this.state.appId + "/workflowinstance/" + this.state.workflowInstanceId + "/activityinstance/" + this.state.activityInstanceId + "/form",{},"get");
    return formContent;
  }
  async saveForm(form, data) {
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
      var that = this;
      await this.callPipeline(form._form["properties"]["submission_commands"], this.cleanData(form.submission.data)).then(async response => {
          that.showFormLoader(false,0);
          if (response.status == "success") {
            if (response.data) {
              form.setSubmission({data:this.formatFormData(response.data)}).then(function (){
                that.processProperties(form);
              });
              form.triggerChange();
            }
            await this.deleteCacheData().then(response2 => {
              if (response2.status == "success") {
                this.props.postSubmitCallback();
              }
              return response;
            });
          } else {
            if (response.errors) {
              await this.storeError(data, response.errors, "pipeline");
              this.notif.current.notify("Error",response.errors[0].message, "danger");
              return response;
            } else {
              await this.storeCache(data);
              this.notif.current.notify("Error", "Form Submission Failed", "danger");
            }
          }
        });
      } else {
        let route = "";
        let method = "post";
        if (this.state.workflowId) {
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
          route = "/app/" + this.state.appId + "/form/" + this.state.formId + "/file";
          method = "post";
          if (this.state.instanceId) {
            route ="/app/" + this.state.appId + "/form/" +this.state.formId + "/file/" + this.state.instanceId;
            method = "put";
          }
        }
        var response = await that.helper.request("v1", route, this.cleanData(data), method).then(async response => {
          that.showFormLoader(false,0);
          if (response.status == "success") {
            var cache = await this.deleteCacheData().then(response2 => {
              if (response2.status == "success") {
                this.props.postSubmitCallback();
              }
            });
            return response;
          } else {
            var storeCache = await this.storeCache(data).then(
            async cacheResponse => {
              if (response.data.errors) {
                var storeError = await this.storeError(data,response.data.errors,route).then(storeErrorResponse => {
                  this.notif.current.notify("Error","Form Submission Failed","danger");
                  return storeErrorResponse;
                });
              } else {
                return storeErrorResponse;
              }
            });
          }
          return response;
        });
        return response;
      }
    }

    formatFormData(data){
      var formData = this.parseResponseData(this.addAddlData(data));
      var ordered_data = {};
      Object.keys(formData).sort().forEach(function(key) {
        ordered_data[key] = formData[key];
      });
      return ordered_data;
    }

    cleanData(formData) {
      formData.privileges = undefined;
      formData.userprofile = undefined;
      formData.countryList = undefined;
      formData.phoneList = undefined;
      formData.orgId = this.userprofile.orgid;
      var ordered_data = {};
      Object.keys(formData).sort().forEach(function(key) {
        ordered_data[key] = formData[key];
      });
      return ordered_data;
    }

    addAddlData(data) {
      data = data ? data : {};
      return merge(data, {
        privileges: this.privileges,
        userprofile: this.userprofile,
        countryList: countryList,
        phoneList: phoneList
      });
    }

    async getFormContents(url) {
      let formData = await this.helper.request("v1", url, {}, "get");
      return formData;
    }

    processProperties(form){
      if (form._form["properties"]) {
        this.runDelegates(form, form._form["properties"]);
        this.runProps(form._form,form,form._form["properties"],this.formatFormData(form.submission.data));
      } else {
        if (form.originalComponent["properties"]) {
          this.runDelegates(form, form.originalComponent["properties"]);
          this.runProps(form.originalComponent,form,form.originalComponent["properties"],this.formatFormData(form.submission.data));
        }
      }
    }

    loadWorkflow(form) {
      let that = this;
      if (this.state.parentWorkflowInstanceId) {
        this.getFileData().then(response => {
          if (response.status == "success") {
            let fileData = JSON.parse(response.data.data);
            fileData.parentWorkflowInstanceId =
            that.props.parentWorkflowInstanceId;
            fileData.workflowInstanceId = undefined;
            fileData.activityId = undefined;
            that.setState({ data: this.formatFormData(fileData) });
            that.setState({ formDivID: "formio_" + that.state.formId });
            if(form){
              form.setSubmission({data:that.state.data}).then(function (){
                that.processProperties(form);
              });
            } else {
              this.createForm();
            }
          }
        });
      } else  if (this.state.activityInstanceId && this.state.workflowInstanceId) {
        this.getActivityInstance().then(response => {
          if (response.status == "success") {
            that.setState({ workflowInstanceId: response.data.workflow_instance_id });
            that.setState({ workflowId: response.data.workflow_id });
            that.setState({ activityId: response.data.activity_id });
            that.setState({ data: that.formatFormData(JSON.parse(response.data.data)) });
            that.setState({ content: JSON.parse(response.data.template) });
            if(form){
              form.setSubmission({data:that.state.data}).then(function (){
                that.processProperties(form);
              });
            } else {
              this.createForm();
            }
          }
        });
      } else if (this.state.formId) {
        this.getWorkflow().then(response => {
          if (response.status == "success" && response.data.workflow_id) {
            that.setState({ workflowId: response.data.workflow_id });
            if (response.data.activity_id) {
              that.setState({ activityId: response.data.activity_id });
            }
            if (!that.state.content) {
              that.setState({ content: JSON.parse(response.data.template) });
            }
            if(form){
              that.processProperties(form);
            }
          } else {
            this.getForm().then(response => {
              if (response.status == "success") {
                if (response.data.workflow_id) {
                  that.setState({ workflowId: response.data.workflow_id });
                }
                if (response.data.activity_id) {
                  that.setState({ activityId: response.data.activity_id });
                }
                if (!that.state.content) {
                  that.setState({ content: JSON.parse(response.data.template) });
                }
                if(form){
                   that.processProperties(form);
                }else{
                	setTimeout(function(){ that.createForm().then(form=> {
						        that.processProperties(form);
                	}) }, 2000);
                }
              }
            });
          }
          that.setState({ formDivID: "formio_" + that.state.formId });
        });
      } else if (this.state.instanceId) {
        this.getInstanceData().then(response => {
          if (response.status == "success" && response.data.workflow_id) {
            that.setState({ workflowInstanceId: response.data.workflow_instance_id });
            that.setState({ workflowId: response.data.workflow_id });
            that.setState({ activityId: response.data.activity_id });
            that.setState({ data: this.addAddlData(JSON.parse(response.data.data)) });
            that.setState({ content: response.data.template });
            if(form){
              form.setSubmission({data:that.state.data}).then(function (){
                that.processProperties(form);
              });
            } else {
              this.createForm();
            }
          }
        });
      } else {
        if(form){
          that.processProperties(form);
        }
      }
    }
    createForm() {
      let that = this;
      Formio.registerComponent("slider", SliderComponent);
      Formio.registerComponent("convergepay", ConvergePayCheckoutComponent);
      Formio.registerComponent("document", DocumentComponent);
      Formio.registerComponent("fortepay", FortePayCheckoutComponent);
      Formio.registerComponent("documentviewer", DocumentViewerComponent);
      Formio.registerComponent("radiocard", RadioCardComponent);
      if (this.state.content && !this.state.form) {
        var options = {};
        if (this.state.content["properties"]) {
          if (this.state.content["properties"]["clickable"]) {
            options.breadcrumbSettings = {
              clickable: eval(this.state.content["properties"]["clickable"])
            };
          }
          if (this.state.content["properties"]["showPrevious"]) {
            options.buttonSettings = {
              showPrevious: eval(this.state.content["properties"]["showPrevious"])
            };
          }
          if (this.state.content["properties"]["showNext"]) {
            options.buttonSettings = {
              showNext: eval(this.state.content["properties"]["showNext"])
            };
          }
          if (this.state.content["properties"]["showCancel"]) {
            options.buttonSettings = {
              showCancel: eval(this.state.content["properties"]["showCancel"])
            };
          }
        }
        var hooks = {
          beforeNext: (currentPage, submission, next) => {
            var form_data = JSON.parse(JSON.stringify(submission.data));
            // storeCache has to be fixed: For CSR if storeCache called, startForm will be loaded once we reload.
            that.storeCache(that.cleanData(form_data));
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
              target:".AppBuilderPage"
            }).then(result => {
              if (result.value) {
                that.props.postSubmitCallback();
              }
            });
          }
        };
        options.hooks = hooks;
        var formCreated = Formio.createForm(document.getElementById(this.formDivID),this.state.content,options).then(function (form) {
          if (that.state.page && form.wizard) {
            if (form.wizard && form.wizard.display == "wizard") {
              form.setPage(parseInt(that.state.page));
              var breadcrumbs = document.getElementById(form.wizardKey + "-header");
              if (breadcrumbs) {
                // breadcrumbs.style.display = "none";
              }
            }
          }
          if(that.state.data !=  undefined){
            form.setSubmission({ data: that.state.data });
          }
          form.on("submit", async function (submission) {
            var form_data = that.cleanData(submission.data);
            var response_data = await that.saveForm(null, form_data);
            console.log(response_data);
            // Not able to get the returned response here from saveForm (Bharat)
            // if (response_data.status == "success") {
            //   form.emit("submitDone", response_data);
            // } else {
            //   form.emit("error", response_data);
            // }
          });
          form.on("prevPage", changed => {
            form.emit("render");
            that.setState({ page: changed.page });
          });
          form.on("nextPage", changed => {
            form.emit("render");
            that.runDelegates(form, form.pages[changed.page].originalComponent['properties']);
            that.setState({ page: changed.page });
            if (form.pages[changed.page]["properties"]["delegate"]) {
              if (form.pages[changed.page]["properties"]["delegate"]) {
                var form_data = that.cleanData(form.submission.data);
                that.callDelegate(form.pages[changed.page]["properties"]["delegate"], form_data).then(response => {
                  if (response) {
                    that.showFormLoader(false,0);
                    if (response.data) {
                      form.setSubmission({ data: that.formatFormData(response.data) });
                    }
                  }
                });
              }
            }
          });

          form.on("change", function (changed) {
            // for (var dataItem in form.submission.data) {
            //   if (typeof form.submission.data[dataItem] == "object") {
            //     if (form.submission.data[dataItem]) {
            //       var checkComponent = form.getComponent(dataItem);
            //       if (checkComponent && checkComponent.type == "datagrid") {
            //         for (var rowItem in Object.keys(form.submission.data[dataItem])) {
            //           if (Array.isArray(form.submission.data[dataItem][rowItem])) {
            //             if(Object.keys(form.submission.data[dataItem][rowItem]).length == 0){
            //               console.log(form.submission.data[dataItem][rowItem])
            //               form.submission.data[dataItem][rowItem] = Object.assign({}, form.submission.data[dataItem][rowItem]);
            //             }
            //           }
            //         }
            //       }
            //     }
            //   }
            // }
            console.log(changed);
            if (changed && changed.changed) {
              var component = changed.changed.component;
              var instance = changed.changed.instance;
              var properties = component.properties;
              if (properties && (Object.keys(properties).length > 0)) {
                if (component != undefined) {
                  that.runProps(component, form, properties, changed.data,instance);
                } else {
                  if (changed.changed != undefined) {
                    that.runProps(changed.changed, form, changed.changed.properties, changed.data);
                  }
                }
              }
            }
          });
          form.on("render", function () {
            if (form.wizard && form.wizard.display == "wizard") {
              var breadcrumbs = document.getElementById(form.wizardKey + "-header");
              if (breadcrumbs) {
                // breadcrumbs.style.display = "none";
              }
            }
            eachComponent(form.root.components, function (component) {
              if (component) {
                if (component.component.properties && component.component.properties.custom_list) {
                  var targetComponent = form.getComponent(component.component.key);
                  if (targetComponent) {
                    switch (component.component.properties.custom_list) {
                      case "user_list":
                        var commands = { commands: [{ command: "getuserlist" }] };
                        that.callPipeline(commands, form.submission).then(response => {
                          that.showFormLoader(false,0);
                          if (response.data) {
                            component.setValue(response.data.userlist);
                          }
                        });
                        break;
                      default:
                        break;
                    }
                  }
                }
              }
            },true);
            var elm = document.getElementsByClassName(that.state.appId + "_breadcrumbParent");
            if (elm.length > 0) {
              scrollIntoView(elm[0], { scrollMode: "if-needed",block: "center",behavior: "smooth",inline: "nearest" });
            }
            if (that.state.formLevelDelegateCalled == false) {
              that.setState({formLevelDelegateCalled: true});
            }
          });
          form.on("customEvent", function (event) {
            var changed = event.data;
            if (event.type == "callDelegate") {
              var component = event.component;
              if (component) {
                that.showFormLoader(true,0);
                var properties = component.properties;
                if (properties) {
                  if (properties["delegate"]) {
                    if (properties["sourceDataKey"] && properties["destinationDataKey"]) {
                      var paramData = {};
                      paramData[properties["valueKey"]] = changed[properties["sourceDataKey"]];
                      paramData['orgId'] = changed['orgId'];
                      that.showFormLoader(true,0);
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
                                if(changed[properties["destinationDataKey"]].length > 1){
                                  changed[properties["destinationDataKey"]].push(valueArray);
                                } else {
                                  if(changed[properties["destinationDataKey"]].length == 1){
                                    if(changed[properties["destinationDataKey"]] && Object.getOwnPropertyNames(changed[properties["destinationDataKey"]][0]).length === 0){
                                      changed[properties["destinationDataKey"]][0] = valueArray;
                                    } else {
                                      changed[properties["destinationDataKey"]].push(valueArray);
                                    }
                                  } else {
                                    changed[properties["destinationDataKey"]].push(valueArray);
                                  }
                                }
                              }
                              if (properties["clearSource"]) {
                                changed[properties["sourceDataKey"]] = "";
                              }
                            }
                            form.setSubmission({ data: that.formatFormData(changed) }).then(response2 => {
                              destinationComponent.triggerRedraw();
                            });
                          }
                        }
                        that.showFormLoader(false,0);
                      });
                    } else if (properties["sourceDataKey"]) {
                      var paramData = {};
                      paramData[properties["valueKey"]] = changed[properties["sourceDataKey"]];
                      that.showFormLoader(true,0);
                      that.callDelegate(properties["delegate"], paramData).then(response => {
                        var responseArray = [];
                        for (var responseDataItem in response.data) {
                          if (response.data.hasOwnProperty(responseDataItem)) {
                            responseArray[responseDataItem] = response.data[responseDataItem];
                          }
                        }
                        if (response.data) {
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
                          form.setSubmission({ data: that.formatFormData(changed) });
                          destinationComponent.triggerRedraw();
                        }
                        that.showFormLoader(false,0);
                      });
                    } else {
                      that.callDelegate(properties["delegate"], that.cleanData(changed)).then(response => {
                        that.showFormLoader(false,0);
                        if (response.data) {
                          form.setSubmission({ data: that.formatFormData(response.data) });
                        }
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
                that.showFormLoader(true,0);
                var properties = component.properties;
                if (properties["commands"]) {
                  that.callPipeline(properties["commands"], that.cleanData(changed)).then(response => {
                    that.showFormLoader(false,0);
                    if (response.data) {
                      try {
                        var formData = that.formatFormData(response.data);
                        form.setSubmission({ data: formData }).then(response2 => {
                          that.runProps(component, form, properties, that.formatFormData(form.submission.data));
                        });
                      } catch (e) {
                        console.log(e);
                      }
                    }
                  });
                }
              }
            }
          });
          form.formReady.then(() => {
            console.log("formReady");
            that.showFormLoader(false,1);
          });
          form.submissionReady.then(() => {
            console.log("submissionReady");
            form.element.addEventListener("getAppDetails", function (e) {
              e.preventDefault();
              e.stopPropagation();
              e.stopImmediatePropagation();
              var evt = new CustomEvent("appDetails", { detail: { core: that.core, appId: that.state.appId, uiUrl: that.core.config("ui.url"), wrapperUrl: that.core.config("wrapper.url") } });
                form.element.dispatchEvent(evt);
              }, true);
            form.emit("render");
          });
          that.setState({ currentForm: form });
          return form;
        });
      }
      return formCreated;
}
triggerComponent(form,targetProperties){
  var targetList = targetProperties.split(',');
  targetList.map(item => {
    var targetComponent = form.getComponent(item);
    setTimeout(function(){
      if(targetComponent.type == 'datagrid'){
        targetComponent.triggerRedraw();
      }
    },3000);
  });
};

postDelegateRefresh(form,properties){
  var targetList = properties["post_delegate_refresh"].split(',');
  targetList.map(item => {
    var targetComponent = form.getComponent(item);
    console.log(targetComponent);
    if(targetComponent.component && targetComponent.component["properties"]){
      if(targetComponent.type == 'datagrid' || targetComponent.type == 'selectboxes'){
        targetComponent.triggerRedraw();
      }
      if(targetComponent.component['properties']){
        this.runProps(targetComponent,form,targetComponent.component['properties'],form.submission.data);
      } else {
        if(targetComponent.component && targetComponent.component.properties){
          this.runProps(targetComponent,form,targetComponent.component.properties,form.submission.data);
        } 
      }
    }
  });
}
runProps(component,form,properties,formdata,instance=null){
  if(formdata.data){
    formdata = formdata.data;
  }
  var that =this;
  if(properties && (Object.keys(properties).length > 0)){
    if (properties["delegate"]) {
      that.showFormLoader(true,0);
      this.callDelegate(properties["delegate"],this.cleanData(formdata)).then(response => {
        if (response) {
          if (response.data) {
            var formData = { data: this.formatFormData(response.data) };
            form.setSubmission(formData).then(response2 =>{
              if (properties["post_delegate_refresh"]) {
                this.postDelegateRefresh(form,properties);
              }
              form.setPristine(true);
            });
          }
          that.showFormLoader(false,0);
        }
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
        } else if(formdata[component.dataValue] != undefined){
          value = formdata[component.dataValue];
        } else {
          value = component.dataValue;
        }
        if(value == undefined){
          if(formdata[formdata[component.key]]){
            value = formdata[component.key];
          }
        }
        if(value != undefined){
          targetComponent.setValue(value);
          form.submission.data[targetComponent.key] = value; 
        }
      } else {
        if (component != undefined && targetComponent != undefined) {
          if (component.value != undefined && component.value.value != undefined && formdata[component.value.value] != undefined) {
            value = formdata[component.value.value];
          } else  if (component.value != undefined && component.value.value != undefined) {
            value = component.value.value;
          } else if(formdata[component.value] != undefined){
            value = formdata[component.value];
          } else if(formdata[formdata[component.key]] != undefined){
            value = formdata[formdata[component.key]];
          } else if(formdata[formdata[component.key]] != undefined){
            value = formdata[formdata[component.key]];
          } else if(formdata[formdata[component.key].value] != undefined){
            value = formdata[formdata[component.key].value];
          }else if(formdata[component.key] != undefined){
            value = formdata[component.key];
          } else {
            value = component.value;
          }
          if(value == undefined){
            if(formdata[formdata[component.key]]){
              value = formdata[component.key];
            }
          }
          if(value != undefined){
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
            } else if(formdata[formdata[component.key]] != undefined){
              value = formdata[formdata[component.key]];
            } else if(formdata[component.key] != undefined){
              value = formdata[component.key];
            } else {
              if (component.value != undefined && component.value.value != undefined) {
                value = component.value.value;
              } else {
                value = component.value;
              }
            }
            if(value == undefined){
              if(formdata[formdata[component.key]]){
                value = formdata[component.key];
              }
            }
            document.getElementById(properties["target"]).value  = value;
          }
        }
      }
      if(targetComponent && targetComponent.component && targetComponent.component.properties){
        that.runProps(targetComponent.component,form,targetComponent.component.properties,form.submission.data);
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
          if(formdata[component.key]){
            targetComponent.setValue(!formdata[component.key]);
          }
        }
      } 

       if (properties["clear_field"]) {
        var processed = false;
        if(instance){
          if(instance.rowIndex != null){            
            var instancePath = instance.path.split('.');
            var instanceRowindex = instance.rowIndex;
            formdata[instancePath[0]][instanceRowindex][properties["clear_field"]] = "";
            form.setSubmission({data : formdata});
            processed = true;
          }
        } 
        if(!processed){
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
         if(targetComponent && targetComponent.component && targetComponent.component.properties){
            that.runProps(targetComponent.component,form,targetComponent.component.properties,form.submission.data);
            console.log(targetComponent);
            that.runDelegates(form, targetComponent.component["properties"]);
         }
       });
    }
    form.setPristine(true);
  }
}
runDelegates(form, properties) {
  if (properties) {
    if (properties["delegate"]) {
      this.callDelegate(properties["delegate"],this.cleanData(form.submission.data)).then(response => {
        this.showFormLoader(false,0);
        if (response.data) {
          form.setSubmission({data:this.formatFormData(response.data)});
        }
      });
    }
    if (properties["commands"]) {
      var that = this;
      this.callPipeline(properties["commands"],this.cleanData(form.submission.data)).then(response => {
        that.showFormLoader(false,0);
        if (response.status == "success") {
          if (response.data) {
             form.setSubmission({data:that.formatFormData(response.data)}).then(response2 =>{
              if (properties["post_delegate_refresh"]) {
                this.postDelegateRefresh(form,properties);
              }else{
                that.runProps(null,form,properties,that.formatFormData(form.submission.data)); 
              }  
            });
          }
        }
      });
    }
    if (properties["payment_confirmation_page"]) {
      var elements = document.getElementsByClassName("btn-wizard-nav-submit");
      this.getPayment(form.submission.data).then(response => {
        var responseArray = [];
        if (response.data) {
          var evt = new CustomEvent("paymentDetails", { cancelable: true,detail: response.data[0] });
          form.element.dispatchEvent(evt);
        }
      });
      var that = this;
      form.element.removeEventListener("requestPaymentToken",function(e) { that.requestPaymentToken(that,form, e)},false);
      form.element.addEventListener("requestPaymentToken",function(e) { that.requestPaymentToken(that,form, e)},false);
      form.element.addEventListener("paymentSuccess", function(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        that.showFormLoader(true,0);
        var transactionIdComponent = form.getComponent("transaction_id");
        that.storePayment({transaction_id: transactionIdComponent.getValue(),data: e.detail.data,status: e.detail.status}).then(response => {
          that.notif.current.notify("Payment has been Successfully completed!","Please wait while we get things ready!","success");
          var formsave = that.saveForm(form,that.state.currentForm.submission.data);
          var transactionStatusComponent = form.getComponent("transaction_status");
          transactionStatusComponent.setValue(e.detail.status);
          if (formsave) {
            that.notif.current.notify("Success","Application Has been Successfully Submitted","success");
          } else {
            that.notif.current.notify("Error",e.detail.message,"danger");
          }
          that.showFormLoader(false,0);
        });
      },false);
      form.element.addEventListener("tokenFailure",function(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        if(e.detail.error){
          that.notif.current.notify("Error", e.detail.message, "danger");
        }
      },false);
      form.element.addEventListener("paymentDeclined",function(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        var transactionIdComponent = form.getComponent("transaction_id");
        that.storePayment({transaction_id: transactionIdComponent.getValue(),data: e.detail.data}).then(response => {
          that.notif.current.notify("Error", e.detail.message, "danger");
          that.showFormLoader(false,0);
        });
      },false);
      form.element.addEventListener("paymentCancelled",function(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        that.notif.current.notify("Warning", e.detail.message, "danger");
        that.showFormLoader(false,0);
      },false);
      form.element.addEventListener("paymentError", function(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        var transactionIdComponent = form.getComponent("transaction_id");
        that.storePayment({transaction_id: transactionIdComponent.getValue(),data: e.detail.data}).then(response => {
          that.notif.current.notify("Error", e.detail.message, "danger");
          that.showFormLoader(false,0);
        });
      },false);
      form.element.addEventListener("paymentPending", function(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        that.showFormLoader(true,0);
        that.notif.current.notify("Information",e.detail.message,"default");
      },false);
    }
  }
}
requestPaymentToken(that,form,e){
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  that.showFormLoader(true,0);
  let requestbody = {firstname: e.detail.firstname,lastname: e.detail.lastname,amount: e.detail.amount};
  that.callPayment(e.detail).then(response => {
    var transactionIdComponent = form.getComponent("transaction_id");
    if (response.data.transaction.id && response.data.token) {
      transactionIdComponent.setValue(response.data.transaction.id);
      var evt = new CustomEvent("getPaymentToken", { detail: response.data });
      form.element.dispatchEvent(evt);
    } else {
      that.notif.current.notify("Error","Transaction Token Failed!","danger");
    }
    that.showFormLoader(false,0);
  });
}
parseResponseData = data => {
  var parsedData = {};
  Object.keys(data).forEach(key => {
    try {
      parsedData[key] = data[key] ? JSON.parse(data[key]) : "";
    } catch (error) {
      if(data[key] != undefined){
        parsedData[key] = data[key];
      }
    }
  });
  return parsedData;
};

  componentDidMount() {
    this.showFormLoader(true,1);
    if (this.props.url) {
      this.getFormContents(this.props.url).then(response => {
        if(response.status == 'success'){
          var parsedData = {};
          var template;
          if (response.data) {
            try{
              parsedData = this.formatFormData(JSON.parse(response.data));
            } catch(e){
              parsedData = this.formatFormData(response.data);
            }
          }
          try {
            template = JSON.parse(parsedData.template);
          } catch(e){
            template = parsedData.template;
          }
          parsedData.workflow_uuid ? (parsedData.workflow_uuid = parsedData.workflow_uuid) : null;
          this.setState({
            content: template,
            workflowInstanceId: parsedData.workflow_instance_id,
            activityInstanceId: parsedData.activity_instance_id,
            workflowId: parsedData.workflow_uuid,
            formId: parsedData.form_id
          });
          this.createForm().then(form => {
            if(Object.keys(parsedData).length > 1){//to account for only workflow_uuid
              var that = this;
              form.setSubmission({data: parsedData}).then(respone=> {
                that.processProperties(form);
              });
            }else{
              this.loadWorkflow(form);
            }
          });
        } else {
          this.showFormError(true);
        }
      });
    } else if (this.props.pipeline) {
      this.loadFormWithCommands(this.props.pipeline).then(response=>{
        this.createForm().then(form => {
          this.loadWorkflow(form);
        });
      });
    } else {
      if(this.state.content){
        this.createForm().then(form => {
          this.loadWorkflow(form);
        });
      } else {
        this.loadWorkflow();
      }
    }
  }
  componentWillUnmount(){
    if(this.state.currentForm != undefined || this.state.currentForm != null){
      console.log('destroy form object')
      this.state.currentForm.destroy();
    }
  }
  async loadFormWithCommands(commands) {
    await this.callPipeline(commands, commands).then(response => {
      if (response.status == "success") {
        if (response.data.data && response.data.form_data) {
          var data = response.data.data;
          this.setState({
            content: JSON.parse(data.template),
            data: this.addAddlData(response.data.form_data),
            formId: data.id,
            workflowId: response.data.workflow_id
          });
        }
      }
    });
  }
  async PushDataPOST(api, method, item, body) {
    if (method == "put") {
      let response = await helper.request("v1","/" + api + "/" + item,body,"filepost");
      return response;
    } else if (method == "post") {
      let response = await helper.request("v1", "/" + api, body, "filepost");
      return response;
    }
  }
  render() {
    return (<div>
      <Notification ref={this.notif} />
      <div id={this.loaderDivID}></div>
      <div id={this.formErrorDivId} style={{display:"none"}}><h3>Form seems to have an error while loading ,Please Try Again.</h3></div>
        <div className="form-render" id={this.formDivID}></div>
        </div>);
  }
}
export default FormRender;