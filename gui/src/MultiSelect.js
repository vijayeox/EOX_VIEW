import React from "react";
import { MultiSelect as MSelect } from "@progress/kendo-react-dropdowns";
import Notification from "./Notification";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { Grid, GridColumn, GridCell } from "@progress/kendo-react-grid";
import Swal from "sweetalert2";
import $ from "jquery";

class MultiSelect extends React.Component {
  constructor(props) {
    super(props);
    this.core = this.props.args;
    this.state = {
      userList: [],
      selectedUsers: [],
      filterValue: false,
    };
    this.helper = this.core.make("oxzion/restClient");
    this.notif = React.createRef();
    this.handleChange = this.handleChange.bind(this);
    this.getMainList = this.getMainList.bind(this);
  }
  async ExcludeUsers(api, excludeList, term, size) {
    if (term) {
      var query = {
        filter: {
          logic: "and",
          filters: [{ field: "name", operator: "contains", value: term }],
        },
        skip: 0,
        take: size,
      };
    } else {
      var query = {
        skip: 0,
        take: size,
      };
    }

    let response = await this.helper.request(
      "v1",
      "/" + api,
      { exclude: excludeList, filter: "[" + JSON.stringify(query) + "]" },
      "post"
    );
    return response;
  }
  async ExistingUsers(api, selectedEntity) {
    let response = await this.helper.request(
      "v1",
      "/" + api + "/" + selectedEntity + "/users",
      {},
      "get"
    );
    return response;
  }

  componentDidMount() {
    let loader = this.core.make("oxzion/splash");
    loader.show();

    if (typeof this.props.config.subList == "object") {
      this.setState({
        selectedUsers: this.props.config.subList,
      });
      let loader = this.core.make("oxzion/splash");
      loader.destroy();
    } else {
      this.ExistingUsers(
        this.props.config.subList,
        this.props.config.dataItem.uuid
      ).then((response) => {
        var tempUsers = [];
        for (var i = 0; i <= response.data.length - 1; i++) {
          var userName = response.data[i].name;
          var userid = response.data[i].uuid;
          var is_manager =
            response.data[i].is_manager || response.data[i].is_admin;
          tempUsers.push({
            uuid: userid,
            name: userName,
            is_manager: is_manager,
          });
        }
        this.setState({
          selectedUsers: tempUsers,
        });
        let loader = this.core.make("oxzion/splash");
        loader.destroy();
      });
    }
  }

  getMainList = (query, size) => {
    var excludeUsersList = [];
    this.state.selectedUsers.map((dataItem) => {
      excludeUsersList.push(dataItem.uuid);
    });
    this.ExcludeUsers(
      this.props.config.mainList,
      excludeUsersList,
      query,
      size
    ).then((response) => {
      var tempUsers = [];
      for (var i = 0; i <= response.data.length - 1; i++) {
        var userName = response.data[i].name;
        var userid = response.data[i].uuid;
        tempUsers.push({ uuid: userid, name: userName });
      }
      this.setState({
        userList: tempUsers,
      });
    });
  };

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  filterChange = (e) => {
    this.setState({
      filterValue: e.filter.value.length > 0,
    });
    if (e.filter.value.length > 0) {
      this.getMainList(e.filter.value, 20);
    } else {
      this.setState({
        userList: [],
      });
    }
  };

  handleChange(e) {
    if (this.state.filterValue) {
      // this.notif.current.notify(
      //   "Success",
      //   e.target.value[e.target.value.length - 1].name + " Added",
      //   "success"
      // )
      this.setState({
        selectedUsers: e.target.value,
      });
    }
  }

  listNoDataRender = (element) => {
    const noData = (
      <h4 style={{ fontSize: "1em" }}>
        <span style={{ fontSize: "2.5em" }}>
          <i className="fa fa-search"></i>
        </span>
        <br />
        <br />
        Please type a name to search.
      </h4>
    );

    return React.cloneElement(element, { ...element.props }, noData);
  };

  tagRender = () => {
    $(document).ready(function (item) {
      $(".k-searchbar")
        .children()
        .attr({
          placeholder: "Search - Type The Name",
        })
        .css("min-width", "387px");
    });
  };

  deleteRecord = (item) => {
    const selectedUsers = this.state.selectedUsers.slice();
    const index = selectedUsers.findIndex((p) => p.uuid === item.uuid);
    if (index !== -1) {
      selectedUsers.splice(index, 1);
      this.setState({
        selectedUsers: selectedUsers,
      });
    }
  };

  render() {
    return (
      <div className="multiselectWindow">
        <Dialog onClose={this.props.manage.toggleDialog}>
          <Notification ref={this.notif} />
          <nav className="navbar bg-dark">
            <h6 style={{ color: "white", paddingTop: "3px" }}>
              {this.props.config.title} &nbsp; -&nbsp;&nbsp;
              {this.props.config.dataItem.name}
              &nbsp;&nbsp; <i className="fa fa-arrow-right"></i> &nbsp; Manage
              {" " + this.props.config.members}
            </h6>
          </nav>
          <div
            className="col-10 justify-content-center"
            style={{ margin: "auto" }}
          >
            <div style={{ margin: "auto", width: "85%", padding: "10px 0px" }}>
              <MSelect
                data={this.state.userList}
                onChange={this.handleChange}
                value={this.state.selectedUsers}
                filterable={true}
                onFilterChange={this.filterChange}
                onOpen={this.tagRender}
                onClose={this.tagRender}
                autoClose={true}
                clearButton={false}
                textField="name"
                dataItemKey="uuid"
                tagRender={this.tagRender}
                listNoDataRender={this.listNoDataRender}
                validationMessage={this.props.validationMessage}
                placeholder={"Click to add " + this.props.config.members}
              />
            </div>
          </div>
          {this.state.selectedUsers.length > 0 && (
            <div
              className="col-10 justify-content-center"
              style={{ margin: "auto" }}
            >
              <Grid data={this.state.selectedUsers} scrollable={"scrollable"}>
                <GridColumn
                  field="name"
                  title={"Selected " + this.props.config.members}
                  headerCell={this.columnTitle}
                />
                <GridColumn
                  title="Manage"
                  width="110px"
                  cell={cellWithEditing(
                    this.deleteRecord,
                    this.props.config.title
                  )}
                />
              </Grid>
            </div>
          )}

          <DialogActionsBar>
            <button
              className="k-button k-primary"
              onClick={() =>
                this.props.manage.postSelected(
                  this.state.selectedUsers,
                  this.props.config.dataItem.uuid
                )
              }
            >
              Save
            </button>
            <button
              className="k-button"
              onClick={this.props.manage.closeDialog}
            >
              Cancel
            </button>
          </DialogActionsBar>
        </Dialog>
      </div>
    );
  }
}

function cellWithEditing(remove, title) {
  return class extends React.Component {
    render() {
      return (
        <td>
          {this.props.dataItem.is_manager !== "1" ? (
            <center>
              <button
                className="k-primary k-button k-grid-edit-command"
                onClick={() => {
                  remove(this.props.dataItem);
                  // Swal.fire({
                  //   title: "Are you sure?",
                  //   text:
                  //     "You are about to remove " +
                  //     this.props.dataItem.name +
                  //     ".",
                  //   imageUrl:
                  //     "https://image.flaticon.com/icons/svg/1006/1006115.svg",
                  //   imageWidth: 75,
                  //   imageHeight: 75,
                  //   confirmButtonText: "OK",
                  //   confirmButtonColor: "#d33",
                  //   showCancelButton: true,
                  //   cancelButtonColor: "#3085d6",
                  //   target: ".Window_Admin"
                  // }).then((result) => {
                  //   if (result.value) {
                  //   }
                  // });
                }}
              >
                Remove
              </button>
            </center>
          ) : title == "Account" ? (
            <center>
              <b>Admin</b>
            </center>
          ) : (
            <center>
              <b>Manager</b>
            </center>
          )}
        </td>
      );
    }
  };
}

export default MultiSelect;
