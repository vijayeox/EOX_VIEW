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
    (this.actionItems = this.props.actionItems),
      (this.dataItems = this.props.dataItem),
      (this.api = this.props.api);
    this.permission = this.props.permission;
    this.editForm = this.props.editForm;
    this.editApi = this.props.editApi;
    this.createApi = this.props.createApi;
    this.deleteApi = this.props.deleteApi;
    this.gridId = this.props.gridId;
    this.addConfig = this.props.addConfig;
    this.onUpdate = this.props.onUpdate.bind(this);
    this.state = {
      visible: false,
    };
    this.toggleDialog = this.toggleDialog.bind(this);
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
              title: response.status,
              showConfirmButton: true,
            });
      }
    );
  };

  //Retry -ErrorLogs
  retry = (data, index) => {
    Requests.retryCall(this.core, this.api, data).then((response) => {
      response.status == "success"
        ? (this.onUpdate({ crudType: "RETRY", index }),
          Swal.fire({
            icon: "success",
            title: response.status,
            showConfirmButton: true,
          }))
        : Swal.fire({
            icon: "error",
            title: response.status,
            showConfirmButton: true,
          });
    });
  };

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
      Requests.editFormPushData(this.core, this.editApi, formData).then(
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

  edit = (data, form, api, index) => {
    let gridsId= document.getElementsByClassName("eox-grids")[0].parentNode.id;
    if (data) {
      document.getElementById(gridsId).classList.add("display-none");
    } else {
      document.getElementById(gridsId).classList.remove("display-none");
    }
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
            data={data}
            updateFormData={true}
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
    this.setState({
      visible: !this.state.visible,
    });

    if (config.addAnnouncementFlag) {
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

  toggleDialog() {
    ReactDOM.unmountComponentAtNode(document.getElementById("eox-grid-form"));
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

  render() {
    return (
      <td>
        {/* {this.state.visible} */}
        {Object["values"](this.actionItems).map((actions, key) =>
          !(actions.text === "CREATE") ? (
            <abbr title={actions.title} key={key}>
              <button
                type={actions.type}
                key={key}
                className="btn btn-primary EOXGrids"
                onClick={(e) => {
                  var tr = e.target.closest("tr");
                  let index = tr.getAttribute("data-grid-row-index");
                  // console.log(this.dataItems.data[index]);
                  {
                    actions.text === "DELETE" && this.permission.canDelete
                      ? Swal.fire({
                          title: "Are you sure?",
                          text: "Do you really want to delete the record? This cannot be undone.",
                          // imageUrl:
                          //   "https://image.flaticon.com/icons/svg/1632/1632714.svg",
                          icon: "question",
                          imageWidth: 75,
                          imageHeight: 75,
                          confirmButtonText: "Delete",
                          confirmButtonColor: "#d33",
                          showCancelButton: true,
                          cancelButtonColor: "#3085d6",
                          target: ".Window_Admin",
                        }).then((result) => {
                          if (result.value) {
                            this.delete(this.dataItems.data[index], index);
                          }
                        })
                      : " ";
                  }
                  {
                    actions.text === "RETRY"
                      ? this.retry(this.dataItems.data[index], index)
                      : " ";
                  }
                  {
                    actions.text === "RESET"
                      ? Swal.fire({
                          title: "Are you sure?",
                          text: "Do you really want to reset your password",
                          // imageUrl:
                          //   "https://image.flaticon.com/icons/svg/1632/1632714.svg",
                          icon: "question",
                          imageWidth: 75,
                          imageHeight: 75,
                          confirmButtonText: "Reset",
                          confirmButtonColor: "#d33",
                          showCancelButton: true,
                          cancelButtonColor: "#3085d6",
                          target: ".Window_Admin",
                        }).then((result) => {
                          if (result.value) {
                            this.resetPassword(
                              this.dataItems.data[index],
                              index
                            );
                          }
                        })
                      : " ";
                  }

                  {
                    actions.text === "ADD" && this.permission.canAdd
                      ? (this.add(this.dataItems.data[index], this.addConfig),
                        this.state.visible)
                      : " ";
                  }
                  {
                    actions.text === "EDIT" && this.permission.canEdit
                      ? this.edit(
                          this.dataItems.data[index],
                          this.editForm,
                          index
                        )
                      : " ";
                  }
                }}
              >
                <i className={actions.icon}></i>
              </button>
            </abbr>
          ) : (
            ""
          )
        )}
      </td>
    );
  }
}
