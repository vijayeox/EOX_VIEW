import $ from "jquery";

import BaseFormRenderer from "./BaseFormRenderer";
class FormRender extends BaseFormRenderer {
  constructor(props) {
    super(props);
    this.core = this.props.core;
    var userprofile = this.props.userprofile ? this.props.userprofile : this.core.make("oxzion/profile").get();
    this.privileges = userprofile.key.privileges;
    this.userprofile = userprofile.key;
    this.loader = this.core.make("oxzion/splash");
    this.state = {
      appId: this.props.appId,
      entityId: this.props.entityId ? this.props.entityId : null,
      workflowId: this.props.workflowId ? this.props.workflowId : null,
      cacheId: this.props.cacheId ? this.props.cacheId : null,
      isDraft: this.props.isDraft ? this.props.isDraft : false,
      workflowInstanceId: this.props.workflowInstanceId,
      parentWorkflowInstanceId: this.props.parentWorkflowInstanceId,
      activityInstanceId: this.props.activityInstanceId,
      activityId: this.props.activityId,
      instanceId: this.props.instanceId,
      paymentDetails: null,
      hasPayment: false,
      data: this.addAddlData(this.props.data),
      page: this.props.page,
      formLevelDelegateCalled: false,
      formId: this.props.formId,
      fileId: this.props.fileId,
      content: this.props.content,
      readOnly: this.props.readOnly ? this.props.readOnly : false,
    };
  }

  async getCacheData() {
    return await this.helper.request("v1", this.appUrl + "/cache/" + this.state.cacheId, {}, "get");
  }
  async checkCacheData(parsedData) {
    let params = '';
    if (parsedData.workflow_uuid) {
      params = '/workflowId/' + parsedData.workflow_uuid;
    }
    if (parsedData.formName) {
      params = '/formId/' + parsedData.id;
    }
    return await this.helper.request("v1", this.appUrl + "/formCache" + params, {}, "get");
  }

  async getWorkflow() {
    // call to api using wrapper
    return await this.helper.request("v1", this.appUrl + "/form/" + this.state.formId + "/workflow", {}, "get");
  }
  async getForm() {
    // call to api using wrapper
    return await this.helper.request("v1", this.appUrl + "/form/" + this.state.formId, {}, "get");
  }

  async getFileData() {
    // call to api using wrapper
    if (this.props.parentWorkflowInstanceId != "null") {
      return await this.helper.request("v1", this.appUrl + "/workflowInstance/" + this.props.parentWorkflowInstanceId, {}, "get");
    }
    return;
  }

  async getFileDataById() {
    // call to api using wrapper
    return await this.helper.request("v1", this.appUrl + "/file/" + (this.props.fileId ? this.props.fileId : this.props.parentFileId) + "/data", {}, "get");
  }

  async getDataByUrl() {
    // call to api using wrapper
    return await this.helper.request("v1", this.props.dataUrl, {}, "get");
  }

  async getStartFormWorkflow() {
    // call to api using wrapper
    return await this.helper.request("v1", this.appUrl + "/workflow/" + this.state.workflowId + "/startform", {}, "get");
  }

  async getActivityInstance() {
    // call to api using wrapper
    return await this.helper.request("v1", this.appUrl + "/workflowinstance/" + this.state.workflowInstanceId + "/activityinstance/" + this.state.activityInstanceId + "/form", {}, "get");
  }

  async getFormContents(url) {
    return this.props.urlPostParams ? await this.helper.request("v1", url, this.props.urlPostParams, "post") : await this.helper.request("v1", url, {}, "get");
  }

  processProperties(form,action = null) {
    if (form._form.properties || form.originalComponent.properties) {
      this.runDelegates(form, form._form.properties ? form._form.properties : form.originalComponent.properties,action);
      // Should'nt run both runDelegates and runProps func on form initializaton as it creates duplicate delegate calls
    }
  }

  loadWorkflow(form) {
    let that = this;
    if (this.state.parentWorkflowInstanceId && !this.state.isDraft) {
      this.getFileData().then((response) => {
        if (response.status == "success") {
          let fileData = JSON.parse(response.data.data);
          fileData.parentWorkflowInstanceId = that.props.parentWorkflowInstanceId;
          fileData.workflowInstanceId = undefined;
          fileData.activityId = undefined;
          that.setState({ data: this.formatFormData(fileData) });
          that.setState({ formDivID: "formio_" + that.state.formId });
          if (form) {
            form.setSubmission({ data: that.state.data }).then(function () {
              that.processProperties(form,'loadWorkflow');
            });
          } else {
            this.createForm();
          }
        }else{
          that.stepDownPage();
        }
      }).catch((e) => {
        that.handleError(null, 'loadWorkflow');
      });
    } else if (this.state.workflowId && this.state.workflowId != null && this.state.isDraft) {
      this.getStartFormWorkflow().then((response) => {
        var parsedData = {};
        var template;
        if (response.data) {
          try {
            parsedData = this.formatFormData(JSON.parse(response.data));
          } catch (e) {
            parsedData = this.formatFormData(response.data);
          }
        }
        try {
          template = JSON.parse(parsedData.template);
        } catch (e) {
          template = parsedData.template;
        }
        parsedData.workflow_uuid ? (parsedData.workflow_uuid = parsedData.workflow_uuid) : null;
        this.setState({
          content: template,
          workflowInstanceId: parsedData.workflow_instance_id,
          activityInstanceId: parsedData.activity_instance_id,
          workflowId: parsedData.workflow_uuid,
          formId: parsedData.form_id,
        });
        that.createForm().then((form) => {
          this.getCacheData().then((cacheResponse) => {
            if (Object.keys(cacheResponse.data).length > 1) {
              //to account for only workflow_uuid
              var that = this;
              if (cacheResponse.data) {
                form.setSubmission({ data: this.formatFormData(cacheResponse.data) }).then((respone) => {
                  that.processProperties(form,'loadWorkflow');
                  if (cacheResponse.data.page && form.wizard) {
                    if (form.wizard && form.wizard.display == "wizard") {
                      form.setPage(parseInt(cacheResponse.data.page));
                      that.hideBreadCrumb(true);
                    }
                  }
                });
              }
            }
          }).catch((e) => {
            that.handleError(null, 'loadWorkflow');
          });
        });
      }).catch((e) => {
        that.handleError(null, 'loadWorkflow');
      });
    } else if (this.state.activityInstanceId && this.state.workflowInstanceId && this.state.isDraft) {
      this.getActivityInstance().then((response) => {
        var parsedData = {};
        var template;
        if (response.data) {
          try {
            parsedData = this.formatFormData(JSON.parse(response.data));
          } catch (e) {
            parsedData = this.formatFormData(response.data);
          }
        }
        try {
          template = JSON.parse(parsedData.template);
        } catch (e) {
          template = parsedData.template;
        }
        parsedData.workflow_uuid ? (parsedData.workflow_uuid = parsedData.workflow_uuid) : null;
        this.setState({
          content: template,
          workflowInstanceId: parsedData.workflow_instance_id,
          activityInstanceId: parsedData.activity_instance_id,
          workflowId: parsedData.workflow_uuid,
          formId: parsedData.form_id,
        });
        that.createForm().then((form) => {
          this.getCacheData().then((cacheResponse) => {
            if (Object.keys(cacheResponse.data).length > 1) {
              //to account for only workflow_uuid
              var that = this;
              if (cacheResponse.data) {
                form.setSubmission({ data: this.formatFormData(cacheResponse.data) }).then((respone) => {
                  that.processProperties(form,'loadWorkflow');
                  if (cacheResponse.data.page && form.wizard) {
                    if (form.wizard && form.wizard.display == "wizard") {
                      form.setPage(parseInt(cacheResponse.data.page));
                      that.hideBreadCrumb(true);
                    }
                  }
                });
              }
            }
          }).catch((e) => {
            that.handleError(null, 'loadWorkflow');
          });
        });
      }).catch((e) => {
        that.handleError(null, 'loadWorkflow');
      });
    } else if (this.state.fileId || this.props.parentFileId) {
      this.getFileDataById().then((response) => {
        if (response.status == "success") {
          this.setState(
            {
              data: this.state.fileId
                ? this.formatFormData(response.data.data)
                : {
                    ...this.state.data,
                    parentData: this.formatFormData(response.data.data, true),
                  },
              entityId: response.data.entity_id,
            },
            () => {
              form || this.state.currentForm
                ? form
                  ? form.setSubmission({ data: this.state.data }).then(function () {
                      that.processProperties(form,'loadWorkflow');
                    })
                  : this.state.currentForm.setSubmission({ data: this.state.data }).then(function () {
                      that.processProperties(that.state.currentForm,'loadWorkflow');
                    })
                : null;
            }
          );
        }
      }).catch((e) => {
        that.handleError(null, 'loadWorkflow');
      });
    } else if (this.props.dataUrl) {
      this.getDataByUrl().then((response) => {
        if (response.status == "success") {
          this.setState(
            {
              data: this.formatFormData(response.data),
            },
            () => {
              form || this.state.currentForm
                ? form
                  ? form.setSubmission({ data: this.state.data }).then(function () {
                      that.processProperties(form,'loadWorkflow');
                    })
                  : this.state.currentForm.setSubmission({ data: this.state.data }).then(function () {
                      that.processProperties(that.state.currentForm,'loadWorkflow');
                    })
                : null;
            }
          );
        }
      }).catch((e) => {
        that.handleError(null, 'loadWorkflow');
      });
    } else if (this.state.activityInstanceId && this.state.workflowInstanceId && !this.state.cacheId) {
      this.getActivityInstance().then((response) => {
        if (response.status == "success") {
          that.setState({ workflowInstanceId: response.data.workflow_instance_id });
          that.setState({ workflowId: response.data.workflow_id });
          that.setState({ activityId: response.data.activity_id });
          that.setState({ data: that.formatFormData(JSON.parse(response.data.data)) });
          that.setState({ content: JSON.parse(response.data.template) });
          if (form) {
            form.setSubmission({ data: that.state.data }).then(function () {
              that.processProperties(form,'loadWorkflow');
            });
          } else {
            this.createForm();
          }
        }
      }).catch((e) => {
        that.handleError(null, 'loadWorkflow');
      });
    } else if (this.state.instanceId) {
      this.getInstanceData().then((response) => {
        if (response.status == "success" && response.data.workflow_id) {
          that.setState({ workflowInstanceId: response.data.workflow_instance_id });
          that.setState({ workflowId: response.data.workflow_id });
          that.setState({ activityId: response.data.activity_id });
          that.setState({ data: this.addAddlData(JSON.parse(response.data.data)) });
          that.setState({ content: response.data.template });
          if (form) {
            form.setSubmission({ data: that.state.data }).then(function () {
              that.processProperties(form,'loadWorkflow');
            });
          } else {
            this.createForm();
          }
        }
      }).catch((e) => {
        that.handleError(null, 'loadWorkflow');
      });
    } else {
      if (form) {
        that.processProperties(form,'loadWorkflow');
      }
    }
  }

  triggerComponent(form, targetProperties) {
    var targetList = targetProperties.split(",");
    targetList.map((item) => {
      var targetComponent = form.getComponent(item);
      setTimeout(function () {
        if (targetComponent.type == "datagrid") {
          targetComponent.triggerRedraw();
        }
      }, 3000);
    });
  }

  componentDidMount() {
    this.showFormLoader(true, 1);
    this.toggleFormLoader(true)
    if (this.props.url) {
      this.getFormContents(this.props.url).then((response) => {
        if (response.status == "success") {
          var parsedData = {};
          var template;
          if (response.data) {
            try {
              parsedData = this.formatFormData(JSON.parse(response.data));
            } catch (e) {
              parsedData = this.formatFormData(response.data);
            }
          }
          try {
            template = JSON.parse(parsedData.template);
          } catch (e) {
            template = parsedData.template;
          }
          parsedData.workflow_uuid ? (parsedData.workflow_uuid = parsedData.workflow_uuid) : null;
          this.setState({
            content: template,
            workflowInstanceId: parsedData.workflow_instance_id,
            activityInstanceId: parsedData.activity_instance_id,
            workflowId: parsedData.workflow_uuid,
            formId: parsedData.form_id,
          });
          this.createForm().then((form) => {
            this.checkCacheData(parsedData).then(cacheResponse => {
              if (cacheResponse.status == "success" && Object.keys(cacheResponse.data).length > 1) {
                this.setState({
                  isDraft: true,
                  cacheId: cacheResponse.data.cacheId,
                });
                parsedData.data = cacheResponse.data;
              }
              if (Object.keys(parsedData).length > 1) {
                //to account for only workflow_uuid
                var that = this;
                if (parsedData.data) {
                  form.setSubmission({ data: this.formatFormData(parsedData.data) }).then((respone) => {
                    that.processProperties(form,'loadForm');
                  });
                } else {
                  this.loadWorkflow(form);
                }
              } else {
                this.loadWorkflow(form);
              }
            });
          });
        } else {
          var errorMessage = "";
          if (response.errors && response.errors[0] && response.errors[0]["message"]) {
            errorMessage = response.errors[0]["message"];
          }
          if (response.message) {
            errorMessage = response.errors[0]["message"];
          }
          this.handleError(errorMessage,'loadForm');
        }
      });
    } else if (this.props.pipeline) {
      this.loadFormWithCommands(this.props.pipeline).then((response) => {
        this.createForm().then((form) => {
          this.loadWorkflow(form);
        });
      });
    } else if (this.props.formId) {
      this.getForm().then((response) => {
        if (response.status == "success") {
          if (!this.state.content) {
            this.setState({ content: JSON.parse(response.data.template), entity_name: response.data.entity_name });
          }
          this.createForm().then((form) => {
            var that = this;
            that.setState({ currentForm: form });
            that.processProperties(form,'loadForm');
          });
        }
      });
    } else {
      if (this.state.content) {
        this.createForm().then((form) => {
          this.loadWorkflow(form);
        });
      } else {
        this.loadWorkflow();
      }
    }
    if (this.props.fileId || this.props.dataUrl) {
      this.loadWorkflow();
    }
    $("#" + this.loaderDivID).off("customButtonAction");
    document.getElementById(this.loaderDivID).addEventListener("customButtonAction", (e) => this.customButtonAction(e), false);
    if (this.state.fileId) {
      this.generateViewButton();
    }
  }

  async loadFormWithCommands(commands) {
    await this.callPipeline(commands, commands)
      .then((response) => {
        if (response.status == "success") {
          if (response.data.data) {
            var data = response.data;
            var tempdata = null;
            if (data.data) {
              tempdata = data.data;
            } else if (data.form_data) {
              tempdata = data.form_data;
            }
            this.setState({
              content: JSON.parse(data.template),
              data: this.addAddlData(tempdata),
              formId: data.id,
              workflowId: response.data.workflow_id,
            });
          }
        }
      })
      .catch((e) => {
        this.handleError(e);
      });
  }
}
export default FormRender;
