import {React,GridTemplate} from "oxziongui";
import { TitleBar } from "./components/titlebar";
import { DeleteEntry } from "./components/apiCalls";
import DialogContainer from "./dialog/DialogContainerRole";

class Role extends React.Component {
  constructor(props) {
    super(props);
    this.core = this.props.args;
    this.state = {
      roleInEdit: undefined,
      roleToBeEdited: [],
      permission: {
        canAdd: this.props.userProfile.privileges.MANAGE_ROLE_WRITE,
        canEdit: this.props.userProfile.privileges.MANAGE_ROLE_WRITE,
        canDelete: this.props.userProfile.privileges.MANAGE_ROLE_WRITE
      },
      selectedOrg: this.props.userProfile.accountId
    };
    this.child = React.createRef();
  }

  edit = (dataItem, required) => {
    dataItem = this.cloneItem(dataItem);
    this.setState({
      roleInEdit: dataItem
    });
    this.inputTemplate = React.createElement(DialogContainer, {
      args: this.core,
      dataItem: dataItem || null,
      selectedOrg: this.state.selectedOrg,
      cancel: this.cancel,
      formAction: "put",
      action: this.child.current.refreshHandler,
      diableField: required.diableField
    });
  };

  cloneItem(item) {
    return Object.assign({}, item);
  }

  orgChange = event => {
    this.setState({ selectedOrg: event.target.value });
  };

  remove = dataItem => {
    DeleteEntry(
      "account/" + this.state.selectedOrg + "/role",
      dataItem.uuid
    ).then(response => {
      this.child.current.refreshHandler(response);
    });
  };

  cancel = () => {
    this.setState({ roleInEdit: undefined });
  };

  insert = () => {
    this.setState({ roleInEdit: {} });
    this.inputTemplate = React.createElement(DialogContainer, {
      args: this.core,
      dataItem: [],
      cancel: this.cancel,
      formAction: "post",
      action: this.child.current.refreshHandler,
      selectedOrg: this.state.selectedOrg
    });
  };

  render() {
    return (
      <div style={{ height: "inherit" }}>
        <TitleBar
          title="Manage User Roles"
          menu={this.props.menu}
          args={this.core}
          orgChange={this.orgChange}
          orgSwitch={
            this.props.userProfile.privileges.MANAGE_ACCOUNT_WRITE
              ? true
              : false
          }
        />
        <GridTemplate
          args={this.core}
          ref={this.child}
          config={{
            showToolBar: true,
            title: "Role",
            api: "role",
            api: "account/" + this.state.selectedOrg + "/roles",
            column: [
              {
                title: "Name",
                field: "name"
              },

              {
                title: "Description",
                field: "description"
              },
              {
                title: "App Name",
                field: "appName"
              }
            ],
            sortMode: [{ field: "is_system_role", dir: "desc" }]
          }}
          manageGrid={{
            add: this.insert,
            edit: this.edit,
            remove: this.remove
          }}
          permission={this.state.permission}
        />
        {this.state.roleInEdit && this.inputTemplate}
      </div>
    );
  }
}

export default Role;
