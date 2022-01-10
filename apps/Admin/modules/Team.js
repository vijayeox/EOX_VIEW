import { React, EOXGrid } from "oxziongui";
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
        icon: "fad fa-pencil",
        text: "EDIT",
        title: "Edit Team",
      },
      delete: {
        type: "button",
        icon: "fad fa-trash",
        text: "DELETE",
        title: "Delete Team",
      },
      add: {
        type: "button",
        icon: "fad fa-users",
        text: "ADD",
        title: "Add Members",
      },
      create: {
        type: "button",
        icon: " fad fa-plus",
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
      // pageable:true,
      pageable: {
        skip: 0,
        // pageSize: 10,
        buttonCount: 3,
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
        canAdd: this.props.userProfile.privileges.MANAGE_TEAM_WRITE,
        canEdit: this.props.userProfile.privileges.MANAGE_TEAM_WRITE,
        canDelete: this.props.userProfile.privileges.MANAGE_TEAM_WRITE,
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

  renderRow(e, rowConfig) {
    let subRoute = this.replaceParams(rowConfig.subRoute, e);
    return (
      <EOXGrid
        configuration={this.config}
        data={this.state.displayChildGrid}
        core={this.core}
        isDrillDownTable={this.props.drillDownRequired}
        actionItems={this.actionItems}
        api={subRoute}
        permission={this.state.permission}
        editForm={form}
        editApi={this.editApi}
        createApi={this.createApi}
        deleteApi={this.deleteApi}
        addConfig={this.addConfig}
        expandableApi={(callback) => {
          GetData(subRoute).then((response) => {
            callback?.((response.status === "success" && response.data) || []);
          });
        }}
        noCreateAction={this.noCreateAction}
        dataStateChanged={this.dataStateChanged.bind(this)}
        // key={Math.random()}
      />
    );
  }

  render() {
    return (
      <div style={{ height: "inherit" }}>
        <TitleBar
          title="Manage Teams"
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
            addConfig={this.addConfig}
            rowTemplate={(e) => this.renderRow(e, this.config)}
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
