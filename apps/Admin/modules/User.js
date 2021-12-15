import { React, EOXGrid } from "oxziongui";
import { TitleBar } from "./components/titlebar";
import { GetData } from "./components/apiCalls";
import form from "../modules/forms/editCreateUser.json";

class User extends React.Component {
  constructor(props) {
    super(props);
    this.core = this.props.args;
    this.drillDownRequired = false;
    (this.actionItems = {
      edit: {
        type: "button",
        api: "account/edit",
        icon: "fad fa-pencil",
        text: "EDIT",
        title: "Edit User",
        isPopup: true,
      },
      delete: {
        type: "button",
        api: "account",
        icon: "fad fa-trash",
        text: "DELETE",
        title: "Delete User",
        isPopup: true,
      },
      create: {
        type: "button",
        api: "account/add",
        icon: " fad fa-plus",
        text: "CREATE",
        title: "Create New",
        isPopup: true,
      },
      resetPassword: {
        type: "button",
        api: "account/users",
        icon: "fad fa-redo",
        text: "RESET",
        title: "Reset Password",
        ispopup: true,
      },
    }),
      (this.state = {
        isLoading: true,
        accountData: [],

        selectedOrg: this.props.userProfile.accountId,

        permission: {
          canAdd: this.props.userProfile.privileges.MANAGE_USER_CREATE,
          canEdit: this.props.userProfile.privileges.MANAGE_USER_WRITE,
          canDelete: this.props.userProfile.privileges.MANAGE_USER_DELETE,
        },
        // userInEdit: undefined,
      }),
      this.api = "account/" + this.state.selectedOrg + "/users";
      this.editApi = "user";
      this.createApi="account/" + this.state.selectedOrg+ "/user"; 
      this.deleteApi="account/" + this.state.selectedOrg+ "/user"; 
    }

  orgChange = (event) => {
    this.setState({selectedOrg: event.target.value, isLoading : true}, () => {
      this.api = "account/" + this.state.selectedOrg + "/users";
      this.createApi="account/" + this.state.selectedOrg+ "/user"; 
      GetData(this.api).then((data) => {
          this.setState({
              accountData : data.status === "success" && data?.data || [],
              isLoading: false
          })
      })
  })
  };
  componentDidMount() {
    GetData(this.api).then((data) => {
      this.setState({
        accountData: (data.status === "success" && data.data) || [],
        isLoading: false,
      });
    });
  }

  render() {
    let config = {
      height: "100%",
      width: "100%",
      filterable: true,
      reorderable: true,
      sortable: true,
      // sort:true,
      pageSize: 10,
      // pageable:true,
      pageable: {
        skip: 0,
        // pageSize: 10,
        buttonCount: 3,
      },
      groupable: true,
      resizable: true,

      isDrillDownTable: true,

      column: [
        {
          title: "Image",
          field: "icon",
        },
        {
          title: "Name",
          field: "name",
        },
        {
          title: "Email",
          field: "email",
        },
        {
          title: "Designation",
          field: "designation",
        },
        {
          title: "Country",
          field: "country",
        },
      ],
    };

    return (
      <div style={{ height: "inherit" }}>
        <TitleBar
          title="Manage Users"
          menu={this.props.menu}
          args={this.core}
          orgChange={this.orgChange}
          orgSwitch={
            this.props.userProfile.privileges.MANAGE_ACCOUNT_WRITE
              ? true
              : false
          }
        />
        <React.Suspense fallback={<div>Loading...</div>}>
          <div>
            {!this.state.isLoading && (
              <EOXGrid
                configuration={config}
                data={this.state.accountData}
                core={this.core}
                isDrillDownTable={this.props.drillDownRequired}
                actionItems={this.actionItems}
                api={this.api}
                permission={this.state.permission}
                editForm={form}
                editApi= {this.editApi}
                createApi={this.createApi}
                deleteApi={this.deleteApi}
                // key={Math.random()}
              />
            )}
          </div>
        </React.Suspense>
        {/* {this.state.userInEdit && this.inputTemplate} */}
      </div>
    );
  }
}

export default User;
//add switch account for users
