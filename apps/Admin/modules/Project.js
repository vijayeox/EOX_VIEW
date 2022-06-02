import { React, EOXGrid, ChildEOXGrid, Helpers } from "oxziongui";
import { TitleBar } from "./components/titlebar";
import { GetData } from "./components/apiCalls";
import form from "../modules/forms/editCreateProject.json";
class Project extends React.Component {
  constructor(props) {
    super(props);
    this.core = this.props.args;
    this.drillDownRequired = false;
    (this.actionItems = {
      edit: {
        type: "button",
        icon: "fas fa-pencil",
        text: "EDIT",
        title: "Edit Project",
      },
      delete: {
        type: "button",
        icon: "fas fa-trash",
        text: "DELETE",
        title: "Delete Project",
      },
      add: {
        type: "button",
        icon: "fas fa-user-plus",
        text: "ADD",
        title: "Add Members to Project",
      },
      create: {
        type: "button",
        api: "account/add",
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
        subRoute: "project/{{uuid}}/subproject",
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
      }),
      (this.state = {
        skip: 0,
        isLoading: true,
        accountData: [],
        displayChildGrid: [],
        selectedOrg: this.props.userProfile.accountId,

        permission: {
          canCreate: this.props.userProfile.privileges.MANAGE_PROJECT_CREATE,
          canEdit: this.props.userProfile.privileges.MANAGE_PROJECT_WRITE,
          canDelete: this.props.userProfile.privileges.MANAGE_PROJECT_DELETE,
          canAdd:this.props.userProfile.privileges.MANAGE_PROJECT_WRITE,
          canReset:false,
        },
      }),
    this.api = "account/" + this.state.selectedOrg + "/projects";
    this.editApi = "project";
    this.createApi = "account/" + this.state.selectedOrg + "/project";
    this.deleteApi = "account/" + this.state.selectedOrg + "/project";
    this.addConfig = {
      title: "Add Members",
      mainList: "account/" + this.state.selectedOrg + "/users/list",
      subList: "account/" + this.state.selectedOrg + "/project",
      members: "Users",
      prefetch: false,
    };
  }

  orgChange = (event) => {
    this.setState({ selectedOrg: event.target.value, isLoading: true }, () => {
      this.api = "account/" + this.state.selectedOrg + "/projects";
      this.createApi = "account/" + this.state.selectedOrg + "/project";
      this.deleteApi = "account/" + this.state.selectedOrg + "/project";
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

  prepareFormData = (data) => {
    if(data) data['accountId'] = this.state.selectedOrg;
    return {data};
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
        prepareFormData={this.prepareFormData}
      />
    );
  }

  render() {
    return (
      <div style={{ height: "inherit" }}>
        {/* <Notification ref={this.notif} /> */}
        <TitleBar
          title="Manage Projects"
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
            // key={Math.random()}
            rowTemplate={(e) => <ChildEOXGrid instance={this} e={e} form={form} GetData={GetData} prepareFormData={this.prepareFormData}/>}
            // rowTemplate={(e) => this.renderRow(e, this.config)}
            skip={this.state.skip}
            dataStateChanged={this.dataStateChanged.bind(this)}
            isLoading={this.state.isLoading}
            prepareFormData={this.prepareFormData}
          />
        </React.Suspense>
      </div>
    );
  }
}

export default Project;
