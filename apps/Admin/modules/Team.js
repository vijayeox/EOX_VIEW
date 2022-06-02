import { React, EOXGrid, ChildEOXGrid, Helpers } from "oxziongui";
import { TitleBar } from "./components/titlebar";
import { GetData } from "./components/apiCalls";
import form from "../modules/forms/editCreateTeam.json";

class Team extends React.Component {
  constructor(props) {
    super(props);
    this.core = this.props.args;
    this.drillDownRequired = false;
    (this.actionItems = {
      edit: {
        type: "button",
        icon: "fas fa-pencil",
        text: "EDIT",
        title: "Edit Team",
      },
      delete: {
        type: "button",
        icon: "fas fa-trash",
        text: "DELETE",
        title: "Delete Team",
      },
      add: {
        type: "button",
        icon: "fas fa-users",
        text: "ADD",
        title: "Add Members",
      },
      create: {
        type: "button",
        icon: " fas fa-plus",
        text: "CREATE",
        title: "Create New",
      },
    }),
    (this.noCreateAction = true),
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
      subRoute: "team/{{uuid}}/subteam",
      column: [
        {
          title: "Name",
          field: "name",
        },
        {
          title: "Description",
          field: "description",
        },
      ],
    });

    (this.state = {
      skip: 0,
      isLoading: true,
      accountData: [],
      displayChildGrid: [],
      selectedOrg: this.props.userProfile.accountId,
      isChildGrid: true,
      permission: {
        canCreate: this.props.userProfile.privileges.MANAGE_TEAM_CREATE,
        canEdit: this.props.userProfile.privileges.MANAGE_TEAM_WRITE,
        canDelete: this.props.userProfile.privileges.MANAGE_TEAM_DELETE,
        canAdd:this.props.userProfile.privileges.MANAGE_TEAM_WRITE,
        canReset:false,
      },
    }),
      (this.api = "account/" + this.state.selectedOrg + "/teams");
    this.editApi = "team";
    this.createApi = "account/" + this.state.selectedOrg + "/team";
    this.deleteApi = "account/" + this.state.selectedOrg + "/team";
    this.addConfig = {
      title: "Add Members",
      mainList: "account/" + this.state.selectedOrg + "/users/list",
      subList: "account/" + this.state.selectedOrg + "/team",
      members: "Users",
      prefetch: false,
    };
  }

  orgChange = (event) => {
    this.setState({ selectedOrg: event.target.value, isLoading: true }, () => {
      this.api = "account/" + this.state.selectedOrg + "/teams";
      this.createApi = "account/" + this.state.selectedOrg + "/team";
      this.deleteApi = "account/" + this.state.selectedOrg + "/team";
      //this.addConfig.mainList= "account/" + this.state.selectedOrg + "/users/list",
      //this.addConfig.subList="account/" + this.state.selectedOrg + "/team",
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

  replaceParams(route, params) {
    var regex = /\{\{.*?\}\}/g;
    let m;
    while ((m = regex.exec(route)) !== null) {
      m.index === regex.lastIndex ? regex.lastIndex++ : null;
      m.forEach((match) => {
        route = route.replace(match, params[match.replace(/\{\{|\}\}/g, "")]);
      });
    }
    return route;
  }

  

  render() {
    return (
      <div style={{ height: "inherit" }}>
        <TitleBar
          title="Manage Teams"
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
            addConfig={this.addConfig}
            rowTemplate={(e) => <ChildEOXGrid instance={this} e={e} form={form} GetData={GetData} dataStateChanged={this.dataStateChanged.bind(this)}/>}
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
export default Team;
