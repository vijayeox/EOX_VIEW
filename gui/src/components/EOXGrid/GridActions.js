import React from "react";
import ReactDOM from "react-dom";
import Requests from "../../Requests";
import FormRender from "../App/FormRender";
import Swal from "sweetalert2";
import MultiSelect from "../../MultiSelect";
export default class GridActions extends React.Component {
  constructor(props) {
    super(props);
    this.core = this.props.core;
    this.actionItems = this.props.actionItems;
    this.dataItems = this.props.dataItem;
    this.api = this.props.api;
    this.permission = this.props.permission;
    this.editForm = this.props.editForm;
    this.editApi = this.props.editApi;
    this.createApi = this.props.createApi;
    this.deleteApi = this.props.deleteApi;
    this.gridId = this.props.gridId;
    this.addConfig = this.props.addConfig;
    this.isReactComponent = this.props.isReactComponent;
    this.onUpdate = this.props.onUpdate.bind(this);
    this.state = {
      visible: false,
    };
    this.toggleDialog = this.toggleDialog.bind(this);
    this.permissionMap = {
      canEdit: "edit",
      canDelete: "delete",
      canCreate: "create",
      canAdd: "add",
      canReset: "reset",
    };
  }

  //Delete Entry
  delete = (data, index) => {
    Requests.DeleteEntry(this.core, this.deleteApi, data.uuid).then(
      (response) => {
        response.status === "success"
          ? (this.onUpdate({ crudType: "DELETE", index }),
            Swal.fire({
              icon: "success",
              title: response.status,
              showConfirmButton: true,
            }))
          : Swal.fire({
            icon: "error",
            title: response.message,
            showConfirmButton: true,
          });
      }
    );
  };

  //Retry -ErrorLogs
  // retry = (data, index) => {
  //   Requests.retryCall(this.core, this.api, data).then((response) => {
  //     response.status == "success"
  //       ? (this.onUpdate({ crudType: "RETRY", index }),
  //         Swal.fire({
  //           icon: "success",
  //           title: response.status,
  //           showConfirmButton: true,
  //         }))
  //       : Swal.fire({
  //         icon: "error",
  //         title: response.status,
  //         showConfirmButton: true,
  //       });
  //   });
  // };

  //Reset Password-Users
  resetPassword = (data, index) => {
    Requests.resetPasswordCall(this.core, data.username).then((response) => {
      response.status === "success"
        ? (this.onUpdate({ crudType: "RESET", index }),
          Swal.fire({
            icon: "success",
            title: response.status,
            showConfirmButton: true,
          }))
        : Swal.fire({
          icon: "error",
          title: response.status + "(" + response.message + ")",
          showConfirmButton: true,
        });
    });
  };

  async handleSubmit(formData, index, createFlag) {
    if (formData) {
      this.props.appendAttachments?.(formData);
      Requests.editFormPushData(this.core, this.editApi, this.props.getCustomPayload?.(formData, 'put') || formData, formData, this.props.createCrudType).then(
        (response) => {
          if (response.status == "success") {
            this.onUpdate({ crudType: "EDIT", index, data: response.data });
            Swal.fire({
              icon: "success",
              title: response.status,
              showConfirmButton: true,
            });
            this.edit(null);
          } else {
            this.edit(null);
            Swal.fire({
              icon: "error",
              title: response.status,
              showConfirmButton: true,
            });
          }
        }
      );
    } else {
      this.edit(null);
    }
  }

  edit = async (data, form, api, index) => {
    let gridsId = document.getElementsByClassName("eox-grids")[0].parentNode.id;
    if (data) {
      document.getElementById(gridsId).classList.add("display-none");
      document.getElementById("eox-grid").style.marginTop = "-40px";
      document.getElementById("titlebar-admin").style.zIndex = "10";
      // document.getElementById("dash-manager-button").classList.add("display-none");
    } else {
      document.getElementById(gridsId).classList.remove("display-none");
      document.getElementById("eox-grid").style.marginTop = "-35px";
      // document.getElementById("dash-manager-button").classList.remove("display-none");
    }
    // let changedAccountId = this.api.split("/")[1]; 
    // data ? data.changedAccountId = changedAccountId : "";
    let formRenderProps = { data };
    if (this.props.prepareFormData) {
      formRenderProps = await this.props.prepareFormData(data);
    }
    const RoleFormComponent = this.isReactComponent ? this.editForm : null
    RoleFormComponent ?
      ReactDOM.render(
        <RoleFormComponent
          args={this.core}
          dataItem={data}
          formAction={"put"}
          editApi={this.editApi}
          cancel={this.toggleDialog(gridsId)}
          selectedOrg={this.props.selectedOrg}
          // edit={this.edit(null)}
          gridsId={gridsId}
          isReactComponent={this.isReactComponent}
          index={index}
          onUpdate={this.onUpdate}
        />, document.getElementById("eox-grid-form")
      ) ? (document.getElementById("eox-grid-form").style.overflow = "scroll")
        : (document.getElementById("eox-grid-form").style.overflow = "auto") :
      ReactDOM.render(
        data ? (

          <div
            style={{
              position: "absolute",
              left: "0",
              top: "0",
              width: "100%",
              height: "100%",
              zIndex: "10",
            }}
          >
            <FormRender
              key={"abc"}
              core={this.core}
              {...formRenderProps}
              updateFormData={true}
              getAttachment={true}
              postSubmitCallback={(formData) =>
                this.handleSubmit(formData, api, index, false)
              }
              content={form}
              appId={data.uuid}
            // route= {this.api}
            />
          </div>
        ) : null,
        document.getElementById("eox-grid-form")
      )
        ? (document.getElementById("eox-grid-form").style.overflow = "scroll")
        : (document.getElementById("eox-grid-form").style.overflow = "auto");
  };

  async fetchCurrentEntries(route) {
    let helper = this.core.make("oxzion/restClient");
    let currentItems = await helper.request("v1", route, {}, "get");
    return currentItems;
  }

  replaceParams(route, params) {
    var regex = /\{\{.*?\}\}/g;
    let m;
    while ((m = regex.exec(route)) !== null) {
      m.index === regex.lastIndex ? regex.lastIndex++ : null;
      m.forEach((match) => {
        route = route.replace(match, params[match.replace(/\{\{|\}\}/g, "")]);
      });
    }
    return route;
  }

  add = (data, config) => {
    let addUsersTemplate;
    // this.setState({
    //   visible: !this.state.visible,
    // });

    if (config.addAnnouncementFlag) {
      this.setState({
        visible: !this.state.visible,
      });
      // this.loader.show(this.adminWindow);
      Requests.getAnnouncementTeams(this.core, data.uuid).then((response) => {
        this.addUsersTemplate = React.createElement(MultiSelect, {
          args: this.core,
          config: {
            dataItem: data,
            title: this.addConfig.title,
            mainList: this.addConfig.mainList,
            subList: response.data,
            members: this.addConfig.members,
          },
          manage: {
            postSelected: this.sendTheData,
            closeDialog: this.toggleDialog,
          },
        });
        ReactDOM.render(
          this.addUsersTemplate,
          document.getElementById("eox-grid-form")
        );
        this.setState(
          {
            visible: !this.state.visible,
          }
          // this.loader.destroy()
        );
      });
    } else if (config) {
      this.setState({
        visible: !this.state.visible,
      });
      var multiselectElement = React.createElement(MultiSelect, {
        args: this.core,
        config: {
          dataItem: data,
          title: config.title,
          mainList: this.addConfig.mainList,
          subList: this.addConfig.subList,
          members: config.members,
        },
        manage: {
          postSelected: this.sendTheData,
          closeDialog: this.toggleDialog,
        },
      });
      if (config.prefetch) {
        this.fetchCurrentEntries(
          this.replaceParams(config.route, dataItem)
        ).then((response) => {
          if (response === "success") {
            this.addUsersTemplate = multiselectElement;
            ReactDOM.render(
              this.addUsersTemplate,
              document.getElementById("eox-grid-form")
            );
          } else {
            return null;
          }
        });
      } else {
        this.addUsersTemplate = multiselectElement;
        ReactDOM.render(
          this.addUsersTemplate,
          document.getElementById("eox-grid-form")
        );
      }
    } else {
      this.setState({
        visible: !this.state.visible,
      });
      let addUsersTemplate = React.createElement(MultiSelect, {
        args: this.core,
        config: {
          dataItem: data,
          title: this.addConfig.title,
          mainList: this.addConfig.mainList,
          subList: this.addConfig.subList,
          members: this.addConfig.members,
        },
        manage: {
          postSelected: this.sendTheData,
          closeDialog: this.toggleDialog,
        },
      });
      ReactDOM.render(
        addUsersTemplate,
        document.getElementById("eox-grid-form")
      );
    }
  };

  toggleDialog(gridsId) {
    if (this.isReactComponent) {
      document.getElementById(gridsId).classList.remove("display-none")
      document.getElementById("eox-grid").style.marginTop = "-35px";
      document.getElementById("dash-manager-button").classList.remove("display-none")
    }
    ReactDOM.unmountComponentAtNode(
      document.getElementById("eox-grid-form")
    );
    this.setState({
      visible: !this.state.visible,
    });
  }

  sendTheData = (selectedUsers, dataItem) => {
    var temp2 = [];
    for (var i = 0; i <= selectedUsers.length - 1; i++) {
      var uid = { uuid: selectedUsers[i].uuid };
      temp2.push(uid);
    }
    if (this.addConfig.addAnnouncementFlag) {
      Requests.pushAnnouncementTeams(
        this.core,
        this.createApi,
        dataItem,
        temp2
      ).then((response) => {
        if (response.status == "success") {
          Swal.fire({
            icon: "success",
            title: response.status,
            showConfirmButton: true,
          });
        } else {
          // this.add(null);
          Swal.fire({
            icon: "error",
            title: response.status,
            showConfirmButton: true,
          });
        }
        ReactDOM.unmountComponentAtNode(
          document.getElementById("eox-grid-form")
        );
      });
    } else {
      Requests.pushOrgUsers(
        this.core,
        dataItem,
        temp2,
        this.addConfig.subList
      ).then((response) => {
        // this.child.current.refreshHandler(response);
        if (response.status == "success") {
          Swal.fire({
            icon: "success",
            title: response.status,
            showConfirmButton: true,
          });
          // this.onUpdate({
          //   crudType: "ADD",
          //   // index: index,
          //   // addTemplate: multiselectElement,
          //   visible: this.state.visible,
          // });
          // `$("#eox-grid").data("kendoGrid").dataSource.read();`
        } else {
          // this.add(null);
          Swal.fire({
            icon: "error",
            title: response.status,
            showConfirmButton: true,
          });
        }
        ReactDOM.unmountComponentAtNode(
          document.getElementById("eox-grid-form")
        );
      });
    }
    this.toggleDialog();
  };

  // getFilteredActions = (obj) => {
  //   let permissions = this.permission;

  //   Object.keys(obj).forEach(key => {
  //     if ((key === "delete") && ((permissions.canDelete != true) || (!permissions.canDelete))) {
  //       obj = delete obj[`${key}`];
  //     } else if ((key === "edit") && ((permissions.canEdit != true) || (!permissions.canEdit))) {
  //       obj = delete obj[`${key}`];
  //     }
  //     //we dont have create action inside the list view -actions 
  //     //  if(key === "create" && ((permissions.canAdd !== true )|| (permissions.canAdd === undefined ))){
  //     //   obj=  delete obj[`${key}`];
  //     //  }
  //   })
  //   return obj;
  // }

  showConfirm(actionFunction, args, text, confirmButtonText) {
    Swal.fire({
      title: "Are you sure?",
      text: text,
      // imageUrl:
      //   "https://image.flaticon.com/icons/svg/1632/1632714.svg",
      icon: "question",
      imageWidth: 75,
      imageHeight: 75,
      confirmButtonText: confirmButtonText,
      confirmButtonColor: "#d33",
      showCancelButton: true,
      cancelButtonColor: "#3085d6",
      target: ".Window_Admin",
    })
      .then((result) => {
        if (result.value) {
          actionFunction?.(...args)
        }
      })
  }
  render() {
    return <td>{
      Object.entries(this.permission)
        .filter(([, flag]) => flag)
        .map((v) => v[0])
        .map((permissionType) => {
          const actions = this.actionItems[this.permissionMap[permissionType]];
          return (
            <abbr title={actions.title} key={permissionType}>
              {(actions.text !== "CREATE") ?
                <button
                  type={actions.type}
                  key={permissionType}
                  className="btn btn-primary m-2 align-right EOXGrids"
                  onClick={(e) => {
                    var tr = e.target.closest("tr");
                    let index = tr.getAttribute("data-grid-row-index");
                    {
                      actions.text === "DELETE"
                        ? this.showConfirm(
                          this.delete,
                          [
                            this.dataItems.data
                              ? this.dataItems.data[index]
                              : this.dataItems[index],
                            index,
                          ],
                          "Do you really want to delete the record? This cannot be undone.",
                          "Delete"
                        )
                        : "";
                    }
                    {
                      actions.text === "RESET"
                        ? this.showConfirm(
                          this.resetPassword,
                          [
                            this.dataItems.data
                              ? this.dataItems.data[index]
                              : this.dataItems[index],
                            index,
                          ],
                          "Do you really want to reset your password",
                          "Reset"
                        )
                        : "";
                    }

                    {
                      actions.text === "ADD"
                        ? (this.add(
                          this.dataItems.data
                            ? this.dataItems.data[index]
                            : this.dataItems[index],
                          this.addConfig
                        ),
                          this.state.visible)
                        : " ";
                    }
                    {
                      actions.text === "EDIT"
                        ? this.edit(
                          this.dataItems.data
                            ? this.dataItems.data[index]
                            : this.dataItems[index],
                          this.editForm,
                          index
                        )
                        : " ";
                    }
                  }}
                >
                  <i className={actions.icon}></i>
                </button> : ""
              }
            </abbr>
          )
        }
        )}
    </td>
  }
}
