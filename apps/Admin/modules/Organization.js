import React from "react";
import { TitleBar } from "./components/titlebar";
import { GridTemplate, MultiSelect } from "@oxzion/gui";
import { DeleteEntry } from "./components/apiCalls";
import DialogContainer from "./dialog/DialogContainerOrg";

import orders from "./data/orders.json";

class Organization extends React.Component {
  constructor(props) {
    super(props);
    this.core = this.props.args;
    this.state = {
      orgInEdit: undefined,
      orgToBeEdited: [],
      action: "",
      visible: false,
      permission: "15"
    };
    this.toggleDialog = this.toggleDialog.bind(this);
    this.child = React.createRef();
  }

  async pushOrgUsers(dataItem, dataObject) {
    let helper = this.core.make("oxzion/restClient");
    let addProjectUsers = await helper.request(
      "v1",
      "/organization/" + dataItem + "/adduser/" + dataObject,
      {},
      "get"
    );
    return addProjectUsers;
  }

  addOrgUsers = dataItem => {
    this.setState({
      visible: !this.state.visible
    });
    this.addUsersTemplate = React.createElement(MultiSelect, {
      args: this.core,
      config: {
        dataItem: dataItem.id,
        mainList: "user",
        subList: "organization"
      },
      manage: {
        postSelected: this.sendTheData,
        closeDialog: this.toggleDialog
      }
    });
  };

  sendTheData = (dataItem, selectedUsers) => {
    for (var i = 0; i <= selectedUsers.length - 1; i++) {
      this.pushOrgUsers(dataItem, selectedUsers[i]);
    }
    this.toggleDialog();
  };

  toggleDialog() {
    this.setState({
      visible: !this.state.visible
    });
  }

  edit = dataItem => {
    this.setState({
      orgInEdit: this.cloneItem(dataItem)
    });
    this.inputTemplate = React.createElement(DialogContainer, {
      args: this.core,
      dataItem: dataItem || null,
      cancel: this.cancel,
      formAction: "put",
      action: this.child.current.refreshHandler
    });
  };

  cloneItem(item) {
    return Object.assign({}, item);
  }

  remove = dataItem => {
    DeleteEntry("organization", dataItem.id).then(response => {
      this.child.current.refreshHandler(response.status);
    });
  };

  cancel = () => {
    this.setState({ orgInEdit: undefined });
  };

  insert = () => {
    this.setState({ orgInEdit: {} });
    this.inputTemplate = React.createElement(DialogContainer, {
      args: this.core,
      dataItem: [],
      cancel: this.cancel,
      formAction: "post",
      action: this.child.current.refreshHandler
    });
  };

  render = () => {
    return (
      <div style={{ height: "inherit" }}>
        {this.state.visible && this.addUsersTemplate}
        <TitleBar title="Manage Organizations" />
        <GridTemplate
          gridData={orders}
          args={this.core}
          ref={this.child}
          config={{
            showToolBar: true,
            title: "organization",
            column: ["logo", "name", "state", "zip"]
          }}
          manageGrid={{
            add: this.insert,
            edit: this.edit,
            remove: this.remove,
            addUsers: this.addOrgUsers
          }}
          permission={this.state.permission}
        />
        {this.state.orgInEdit && this.inputTemplate}
      </div>
    );
  };
}

export default Organization;
