import { React, EOXGrid, Helpers } from "oxziongui";
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
        icon: "fas fa-pencil",
        text: "EDIT",
        title: "Edit User",
      },
      delete: {
        type: "button",
        icon: "fas fa-trash",
        text: "DELETE",
        title: "Delete User",
      },
      create: {
        type: "button",
        icon: " fas fa-plus",
        text: "CREATE",
        title: "Create New",
      },
      reset: {
        type: "button",
        icon: "fas fa-redo",
        text: "RESET",
        title: "Reset Password",
      },
    }),
      (this.config = {
        height: "100%",
        width: "100%",
        filterable: true,
        reorderable: true,
        sortable: true,
        // sort:true,
        pageSize: 10,
        pageable: {
          skip: 0,
          buttonCount: 3,
          info: true,
          pageSizes: [10, 20, 50]
        },
        groupable: true,
        resizable: true,
        isDrillDownTable: true,
        column: [
          {
            title: "Image",
            field: "icon",
            filterable: false,
            width: "60px"
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
            title: "Phone Number",
            field: "phone",
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
      }),
      (this.state = {
        skip: 0,
        isLoading: true,
        accountData: [],
        selectedOrg: this.props.userProfile.accountId,
        permission: {
          canCreate: this.props.userProfile.privileges.MANAGE_USER_CREATE,
          canEdit: this.props.userProfile.privileges.MANAGE_USER_WRITE,
          canDelete: this.props.userProfile.privileges.MANAGE_USER_DELETE,
          canReset:this.props.userProfile.privileges.MANAGE_USER_WRITE,
          canAdd:false,
        },
      }),
      (this.api = "account/" + this.state.selectedOrg + "/user");
    this.editApi = "user";
    this.createApi = "account/" + this.state.selectedOrg + "/user";
    this.deleteApi = "account/" + this.state.selectedOrg + "/user";
  }

  orgChange = (event) => {
    this.setState({ selectedOrg: event.target.value, isLoading: true }, () => {
      this.api = "account/" + this.state.selectedOrg + "/user";
      this.createApi = "account/" + this.state.selectedOrg + "/user";
      this.deleteApi = "account/" + this.state.selectedOrg + "/user";
      GetData(this.api).then((data) => {
        this.setState({
          accountData: (data.status === "success" && data?.data) || [],
          isLoading: false,
        });
      });
    });
  };

  componentDidMount() {
    GetData(Helpers.Utils.getFilterParams(this.api, this.config.pageSize, 0))
      .then((data) => {
        this.setState({
          accountData:
            data?.status === "success" ? data : { data: [], total: 0 },
          isLoading: false,
        });
      })
      .catch(() => {
        this.setState({
          accountData: { data: [], total: 0 },
          isLoading: false,
        });
      });
  }

  dataStateChanged({ dataState: { filter, group, skip, sort, take } }) {
    this.setState({ isLoading: true });
    this.config.pageSize = take;
    GetData(
      this.api +
        `?filter=[{"skip":${skip},"take":${
          this.config.pageSize
        }, "filter" : ${JSON.stringify(filter)}}]`
    )
      .then((data) => {
        this.setState({
          accountData:
            data?.status === "success" ? data : { data: [], total: 0 },
          skip,
          isLoading: false,
        });
      })
      .catch(() => {
        this.setState({
          accountData: { data: [], total: 0 },
          isLoading: false,
        });
      });
  }

  render() {
    return (
      <div style={{ height: "inherit" }}>
        <TitleBar
          title="Manage Users"
          menu={this.props.menu}
          args={this.core}
          orgChange={this.orgChange}
          selectedOrgId={this.props.userProfile.active_account.name}
          orgSwitch={
            this.props.userProfile.privileges.MANAGE_ACCOUNT_WRITE
              ? true
              : false
          }
        />
        <React.Suspense fallback={<div>Loading...</div>}>
          <EOXGrid
            configuration={this.config}
            data={this.state.accountData}
            core={this.core}
            isDrillDownTable={this.props.drillDownRequired}
            actionItems={this.actionItems}
            api={this.api}
            permission={this.state.permission}
            editForm={form}
            editApi={this.editApi}
            createApi={this.createApi}
            deleteApi={this.deleteApi}
            // key={Math.random()}
            skip={this.state.skip}
            dataStateChanged={this.dataStateChanged.bind(this)}
            isLoading={this.state.isLoading}
          />
        </React.Suspense>
      </div>
    );
  }
}

export default User;
