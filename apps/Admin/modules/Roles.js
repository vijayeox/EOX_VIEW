import { React, EOXGrid } from "oxziongui";
import { TitleBar } from "./components/titlebar";
import { GetData } from "./components/apiCalls";
import form from "../modules/forms/editCreateRole.json";

class Role extends React.Component {
  constructor(props) {
    super(props);
    this.core = this.props.args;
    this.drillDownRequired = false;
    (this.actionItems = {
      edit: {
        type: "button",
        icon: "fad fa-pencil",
        text: "EDIT",
        title: "Edit Role",
      },
      delete: {
        type: "button",
        icon: "fad fa-trash",
        text: "DELETE",
        title: "Delete Role",
      },
      create: {
        type: "button",
        icon: " fad fa-plus",
        text: "CREATE",
        title: "Create New",
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
            title: "Name",
            field: "name",
          },

          {
            title: "Description",
            field: "description",
          },
          {
            title: "App Name",
            field: "appName",
          },
        ],
      }),
      (this.state = {
        skip: 0,
        isLoading: true,
        accountData: [],
        selectedOrg: this.props.userProfile.accountId,
        permission: {
          canAdd: this.props.userProfile.privileges.MANAGE_ROLE_WRITE,
          canEdit: this.props.userProfile.privileges.MANAGE_ROLE_WRITE,
          canDelete: this.props.userProfile.privileges.MANAGE_ROLE_WRITE,
        },
      }),
      (this.api = "account/" + this.state.selectedOrg + "/roles");
    this.editApi = "role";
    this.createApi = "account/" + this.state.selectedOrg + "/role";
    this.deleteApi = "account/" + this.state.selectedOrg + "/role";
  }

  orgChange = (event) => {
    this.setState({ selectedOrg: event.target.value, isLoading: true }, () => {
      this.api = "account/" + this.state.selectedOrg + "/roles";
      this.createApi = "account/" + this.state.selectedOrg + "/role";
      GetData(this.api).then((data) => {
        this.setState({
          accountData: (data.status === "success" && data?.data) || [],
          isLoading: false,
        });
      });
    });
  };

  componentDidMount() {
    GetData(this.api + `?filter=[{"skip":0,"take":${this.config.pageSize}}]`)
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
            skip={this.state.skip}
            dataStateChanged={this.dataStateChanged.bind(this)}
            isLoading={this.state.isLoading}
            // key={Math.random()}
          />
        </React.Suspense>
      </div>
    );
  }
}

export default Role;
