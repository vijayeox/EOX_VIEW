import React from "react";
import ReactDOM from "react-dom";
import Requests from "../../Requests";
import FormRender from "../App/FormRender";
import countryStateList from "../data/country-state-codes";
// import MultiSelect  from "../../MultiSelect";
export default class GridActions extends React.Component {
  constructor(props) {
    console.log("gridactions");
    super(props);
    this.core = this.props.core;
    (this.actionItems = this.props.actionItems),
      (this.dataItems = this.props.dataItem),
      (this.api = this.props.api);
    this.permission = this.props.permission;
    this.editForm = this.props.editForm;
    this.editApi = this.props.editApi;
    this.gridId = this.props.gridId;
    this.addConfig = this.props.addConfig;
    this.onUpdate = this.props.onUpdate.bind(this);
    let countryList = countryStateList.map((item) => item.country);
    this.state = {
      visible: false,
      countryList: countryList,
    };
  }

  //Delete Entry
  delete = (data, index) => {
    Requests.DeleteEntry(this.core, this.api, data.uuid).then((response) => {
      console.log(response);
      response.status == "success"
        ? this.onUpdate({ crudType: "DELETE", index })
        : console.log("not deleted");
    });
  };

  //Retry -ErrorLogs
  retry = (data, index) => {
    console.log(data);
    Requests.retryCall(this.core, this.api, data).then((response) => {
      console.log(response);
      console.log("retry in actions");
      this.onUpdate({ crudType: "RETRY", index });
      // grid.refresh();
    });
  };

  //Reset Password-Users
  resetPassword = (data, index) => {
    console.log(data);
    Requests.resetPasswordCall(this.core, data.username).then((response) => {
      response.status == "success"
        ? console.log(
            "Success  Password reset mail has been sent to " +
              data.name +
              "(" +
              response.data.username +
              ")" +
              "success"
          )
        : console.log("Failed" + response.message);

      this.onUpdate({ crudType: "RESET", index });
    });
  };

  async handleSubmit(formData, index, createFlag) {
    console.log("on submittt----------------");
    console.log(formData);
    if (formData) {
      Requests.editFormPushData(this.core, this.editApi, formData).then(
        (response) => {
          if (response.status == "success") {
            this.onUpdate({ crudType: "EDIT", index, data: response.data });
          }
          this.edit(null);
        }
      );
    } else {
      this.edit(null);
    }
  }

  edit = (data, form, index) => {
    if (data) {
      document.getElementById(this.gridId).classList.add("display-none");
    } else {
      document.getElementById(this.gridId).classList.remove("display-none");
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
              this.handleSubmit(formData, index, false)
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

  render() {
    return (
      <td>
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
                  console.log(this.dataItems);
                  console.log(this.dataItems.data[index]);
                  {
                    actions.text === "DELETE" && this.permission.canDelete
                      ? this.delete(this.dataItems.data[index], index)
                      : console.log("Not Deleted");
                  }
                  {
                    actions.text === "RETRY"
                      ? this.retry(this.dataItems.data[index], index)
                      : console.log("not retry");
                  }
                  {
                    actions.text === "RESET"
                      ? this.resetPassword(this.dataItems.data[index], index)
                      : console.log(" not reset");
                  }

                  {
                    actions.text === "ADD" && this.permission.canAdd
                      ?   console.log("Not added")
                          // this.add(this.dataItems.data[index], index)
                      : console.log("Not added");
                  }
                  {
                    actions.text === "EDIT" && this.permission.canEdit
                      ? // console.log("edited")
                        this.edit(
                          this.dataItems.data[index],
                          this.editForm,
                          index
                        )
                      : console.log("Not edited");
                  }
                  // {
                  //   actions.text === "CREATE"
                  //     ? console.log("Create")
                  //     : console.log("Not Created");
                  // }
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
