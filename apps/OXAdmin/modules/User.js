import React, { Component } from "react";
import { FaArrowLeft, FaPlusCircle } from "react-icons/fa";
import {
  Grid,
  GridColumn as Column,
  GridToolbar
} from "@progress/kendo-react-grid";

import ReactNotification from "react-notifications-component";

import DialogContainer from "./dialog/DialogContainerUser";
import cellWithEditing from "./cellWithEditing";
import { orderBy } from "@progress/kendo-data-query";

class User extends React.Component {
  constructor(props) {
    super(props);
    this.core = this.props.args;

    this.state = {
      userInEdit: undefined,
      sort: [],
      products: [],
      action: ""
    };

    this.addNotification = this.addNotification.bind(this);
    this.notificationDOMRef = React.createRef();

    this.getUserData().then(response => {
      this.setState({ products: response.data });
    });
  }

  addDataNotification(serverResponse) {
    this.notificationDOMRef.current.addNotification({
      title: "Operation Successful",
      message: "Entry created with ID:" + serverResponse,
      type: "success",
      insert: "top",
      container: "bottom-right",
      animationIn: ["animated", "bounceIn"],
      animationOut: ["animated", "bounceOut"],
      dismiss: { duration: 5000 },
      dismissable: { click: true }
    });
  }

  addNotification(serverResponse) {
    this.notificationDOMRef.current.addNotification({
      title: "All Done!!!  👍",
      message: "Operation succesfully completed.",
      type: "success",
      insert: "top",
      container: "bottom-right",
      animationIn: ["animated", "bounceIn"],
      animationOut: ["animated", "bounceOut"],
      dismiss: { duration: 5000 },
      dismissable: { click: true }
    });
  }

  handler = serverResponse => {
    this.getUserData().then(response => {
      this.setState({ products: response.data });
      this.addDataNotification(serverResponse);
    });
  };

  async getUserData() {
    let helper = this.core.make("oxzion/restClient");
    let userData = await helper.request("v1", "/user", {}, "get");
    return userData;
  }

  async deleteUserData(dataItem) {
    let helper = this.core.make("oxzion/restClient");
    let delUser = helper.request("v1", "/user/" + dataItem, {}, "delete");
    return delUser;
  }

  edit = dataItem => {
    this.setState({
      userInEdit: this.cloneProduct(dataItem),
      action: "edit"
    });
  };

  remove = dataItem => {
    this.deleteUserData(dataItem.id).then(response => {});
    this.handler();

    const products = this.state.products;
    const index = products.findIndex(p => p.id === dataItem.id);
    if (index !== -1) {
      products.splice(index, 1);
      this.setState({
        products: products
      });
    }
  };

  save = () => {
    const dataItem = this.state.userInEdit;
    const products = this.state.products.slice();

    if (dataItem.id === undefined) {
      products.unshift(this.newProduct(dataItem));
    } else {
      const index = products.findIndex(p => p.id === dataItem.id);
      products.splice(index, 1, dataItem);
    }

    this.setState({
      products: products,
      userInEdit: undefined
    });
  };

  cancel = () => {
    this.setState({ userInEdit: undefined });
  };

  insert = () => {
    this.setState({ userInEdit: {}, action: "add" });
  };

  render() {
    return (
      <div id="userPage">
        <ReactNotification ref={this.notificationDOMRef} />
        <div style={{ margin: "10px 0px 10px 0px" }} className="row">
          <div className="col s3">
            <a className="waves-effect waves-light btn goBack">
              <FaArrowLeft />
            </a>
          </div>
          <center>
            <div className="col s6" id="pageTitle">
              Manage Users
            </div>
          </center>
        </div>

        <Grid
          data={orderBy(this.state.products, this.state.sort)}
          sortable
          sort={this.state.sort}
          onSortChange={e => {
            this.setState({
              sort: e.sort
            });
          }}
        >
          <GridToolbar>
            <div>
              <div style={{ fontSize: "20px" }}>Users List</div>
              <button
                onClick={this.insert}
                className="k-button"
                style={{ position: "absolute", top: "8px", right: "16px" }}
              >
                <FaPlusCircle style={{ fontSize: "20px" }} />
                <p style={{ margin: "0px", paddingLeft: "10px" }}>Add User</p>
              </button>
            </div>
          </GridToolbar>
          <Column field="id" title="User ID" width="90px" />
          <Column field="name" title="Name" />
          <Column field="role" title="Role" />
          <Column field="status" title="Status" />
          <Column
            title="Edit"
            width="150px"
            cell={cellWithEditing(this.edit, this.remove)}
          />
        </Grid>

        {this.state.userInEdit && (
          <DialogContainer
            args={this.core}
            dataItem={this.state.userInEdit}
            save={this.save}
            cancel={this.cancel}
            formAction={this.state.action}
            action={this.handler}
          />
        )}
      </div>
    );
  }

  dialogTitle() {
    return `${this.state.userInEdit.id === undefined ? "Add" : "Edit"} product`;
  }
  cloneProduct(product) {
    return Object.assign({}, product);
  }

  newProduct(source) {
    const newProduct = {
      id: "",
      gamelevel: "",
      username: "",
      firstname: "",
      lastname: "",
      name: "",
      role: "",
      email: "",
      dob: "",
      designation: "",
      sex: "",
      managerid: "",
      level: "",
      doj: "",
      listtoggle: "",
      mission_link: ""
    };

    return Object.assign(newProduct, source);
  }
}

export default User;