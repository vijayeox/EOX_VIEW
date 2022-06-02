import { EOXGrid, Helpers, React } from "oxziongui";
import { GetData } from "./components/apiCalls";
import { TitleBar } from "./components/titlebar";
// import form from "../modules/forms/editCreateRole.json";
import EditCreateRole from "./forms/editCreateRole";

class Role extends React.Component {
  constructor(props) {
    super(props);
    this.core = this.props.args;
    this.drillDownRequired = false;
    (this.actionItems = {
      edit: {
        type: "button",
        icon: "fas fa-pencil",
        text: "EDIT",
        title: "Edit Role",
      },
      delete: {
        type: "button",
        icon: "fas fa-trash",
        text: "DELETE",
        title: "Delete Role",
      },
      create: {
        type: "button",
        icon: " fas fa-plus",
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
        isReactComponent :true,
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
          canCreate: this.props.userProfile.privileges.MANAGE_ROLE_CREATE,
          canEdit: this.props.userProfile.privileges.MANAGE_ROLE_WRITE,
          canDelete: this.props.userProfile.privileges.MANAGE_ROLE_DELETE,
          canAdd:false,
          canReset:false,
        },
      }),
      (this.api = "account/" + this.state.selectedOrg + "/roles");
    // this.editApi =  "/role";
    this.editApi = "account/" + this.state.selectedOrg + "/role";
    this.createApi = "account/" + this.state.selectedOrg + "/role";
    this.deleteApi = "account/" + this.state.selectedOrg + "/role";
  }

  orgChange = (event) => {
    this.setState({ selectedOrg: event.target.value, isLoading: true }, () => {
      this.api = "account/" + this.state.selectedOrg + "/roles";
      this.createApi = "account/" + this.state.selectedOrg + "/role";
      this.editApi = "account/" + this.state.selectedOrg + "/role";
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
      `?filter=[{"skip":${skip},"take":${this.config.pageSize
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

  // fetchPrivilegesCreate = () => {
  //   return new Promise(resolve => {
  //     let masterPrivilege = this.core.make("oxzion/restClient").request(
  //       "v1",
  //       "/account/" + this.props.userProfile.accountId + "/masterprivilege",
  //       {},
  //       "get"
  //     );
  //     masterPrivilege.then((response) => {
  //       let privilegeList = response.data.masterPrivilege;
  //       const set = new Set()
  //       const privilegesSet = privilegeList.filter(v => {
  //         if (set.has(v.name)) return;
  //         set.add(v.name);
  //         return v;
  //       })
  //       resolve({ data: { privilege: privilegesSet } })
  //     })
  //   })
  // }

  // fetchPrivileges = (data) => {
  //   return new Promise(resolve => {
  //     let masterPrivilege = this.core.make("oxzion/restClient").request(
  //       "v1",
  //       "/account/" + this.props.userProfile.accountId + "/masterprivilege/" + data?.uuid,
  //       {},
  //       "get"
  //     );
  //     if (!data) {
  //       return resolve({ data });
  //     }
  //     masterPrivilege.then((response) => {
  //       let privilegeList = (response.data.rolePrivilege.length > 0) ? response.data.rolePrivilege : response.data.masterPrivilege;
  //       const set = new Set()
  //       const privilegesSet = privilegeList.filter(v => {
  //         if (set.has(v.name)) return;
  //         set.add(v.name);
  //         return v;
  //       })
  //       resolve({ data: { privilege: privilegesSet, ...data } })
  //     })
  //   })
  // }

  getCustomPayload = (formData, type) => {
    const privilege = formData.privilege.map(v => {
      let permissionValue = Object.entries(v.permission).filter(([k, v]) => v).slice(-1)?.[0]?.[0]
      return { ...v, permission: permissionValue ? permissionValue.toString() : "" }
    })
    formData.privileges = privilege;
    return formData;
  }

  render() {
    return (
      <div style={{ height: "inherit" }}>
        <TitleBar
          title="Manage User Roles"
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
            editForm={EditCreateRole}
            editApi={this.editApi}
            createApi={this.createApi}
            deleteApi={this.deleteApi}
            skip={this.state.skip}
            dataStateChanged={this.dataStateChanged.bind(this)}
            isLoading={this.state.isLoading}
            // key={Math.random()}
            // prepareFormData={this.fetchPrivileges}
            // prepareCreateFormData={this.fetchPrivilegesCreate}
            getCustomPayload={this.getCustomPayload}
            selectedOrg = {this.state.selectedOrg}
          />
        </React.Suspense>
      </div>
    );
  }
}

export default Role;
