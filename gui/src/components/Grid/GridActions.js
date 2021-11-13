import React from "react";
// import { GridCell } from "@progress/kendo-react-grid";

import Swal from "sweetalert2";

export default function GridActions(
  title,
  edit,
  remove,
  addUsers,
  permission,
  fullConfig
) {
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.core = this.props.args;
    }

    deleteButton() {
      return permission.canDelete ? (
        <abbr title={"Delete " + title}>
          <button
            type="button"
            className="btn btn-primary manage-btn k-grid-remove-command"
            onClick={(e) => {
              e.preventDefault();
              Swal.fire({
                title: "Are you sure?",
                text: "Do you really want to delete the record? This cannot be undone.",
                // imageUrl:
                //   "https://image.flaticon.com/icons/svg/1632/1632714.svg",
                icon: 'question',
                imageWidth: 75,
                imageHeight: 75,
                confirmButtonText: "Delete",
                confirmButtonColor: "#d33",
                showCancelButton: true,
                cancelButtonColor: "#3085d6",
                target: ".Window_Admin",
              }).then((result) => {
                if (result.value) {
                  remove(this.props.dataItem);
                }
              });
            }}
          >
            <i className="fa fa-trash manageIcons"></i>
          </button>
        </abbr>
      ) : null;
    }

    async passwordReset(username) {
      let helper = fullConfig.core.make("oxzion/restClient");
      let response = await helper.request(
        "v1",
        "user/me/forgotpassword",
        { username: username },
        "post"
      );
      return response;
    }

    triggerPasswordReset = (dataItem) => {
      console.log(dataItem);
      this.passwordReset(dataItem.username).then((response) => {
        response.status == "success"
          ? fullConfig.notification.current.notify(
              "Success",
              "Password reset mail has been sent to " +
                dataItem.name +
                " ( " +
                response.data.username +
                " )",
              "success"
            )
          : fullConfig.notification.current.notify(
              "Failed",
              response.message ? response.message : "Operation Failed",
              "danger"
            );
      });
    };

    render() {
      let editButton = (
        <React.Fragment>
          <abbr title={"Edit " + title + " Details"}>
            <button
              type="button"
              className=" btn btn-primary manage-btn k-grid-edit-command"
              onClick={() => {
                edit(this.props.dataItem, { diableField: false });
              }}
            >
              <i className="fa fa-pencil manageIcons"></i>
            </button>
          </abbr>
          {addUsers && (
            <React.Fragment>
              &nbsp; &nbsp;
              <abbr
                title={
                  "Add " +
                  (title == "Announcement" ? "Groups" : "Users") +
                  " to " +
                  title
                }
              >
                <button
                  type="button"
                  className="btn btn-primary manage-btn"
                  onClick={() => {
                    addUsers(this.props.dataItem);
                  }}
                >
                  {title == "Announcement" ? (
                    <i className="fa fa-users manageIcons"></i>
                  ) : (
                    <i className="fa fa-user-plus manageIcons"></i>
                  )}
                </button>
              </abbr>
            </React.Fragment>
          )}
        </React.Fragment>
      );

      return (
        <td>
          <center>
            {this.props.dataItem.hasOwnProperty("is_system_role")
              ? this.props.dataItem.type === "2"
                ? null
                : permission.canEdit
                ? editButton
                : null
              : permission.canEdit
              ? editButton
              : null}
            &nbsp; &nbsp;
            {this.props.dataItem.is_system_role || this.props.dataItem.is_admin
              ? (this.props.dataItem.is_system_role == "0" ||
                  this.props.dataItem.is_admin == "0") &&
                this.deleteButton()
              : this.deleteButton()}
            {fullConfig.resetPassword ? (
              <React.Fragment>
                &nbsp; &nbsp;
                <abbr title={"Reset Password"}>
                  <button
                    type="button"
                    className="btn btn-primary manage-btn"
                    onClick={() =>
                      this.triggerPasswordReset(this.props.dataItem)
                    }
                  >
                    <i className={fullConfig.resetPassword.icon}></i>
                  </button>
                </abbr>
              </React.Fragment>
            ) : null}
          </center>
        </td>
      );
    }
  };
}
