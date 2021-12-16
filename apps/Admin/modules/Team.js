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
        api: "account/edit",
        icon: "fad fa-pencil",
        text: "EDIT",
        title: "Edit Team",
        isPopup: true,
      },
      delete: {
        type: "button",
        api: "account",
        icon: "fad fa-trash",
        text: "DELETE",
        title: "Delete Team",
        isPopup: true,
      },
      add: {
        type: "button",
        api: "account/add",
        icon: "fad fa-users",
        text: "ADD",
        title: "Add Members",
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
    }),
    this.noCreateAction= true,
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
      // teamInEdit: undefined,
    }),
    this.api = "account/" + this.state.selectedOrg + "/teams";
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
    GetData(this.api).then((data) => {
      this.setState({
        accountData: (data.status === "success" && data.data) || [],
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
    // if(this.state.isChildGrid){
      // GetData(subRoute).then((data) => {
      //   this.setState({
      //     displayChildGrid: (data.status === "success" && data.data) || [],
      //     // isLoading: false,
      //     isChildGrid:false,
      //   });
      // });
      return (
        // <React.Suspense fallback={<div>Loading...</div>}>
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
                 callback?.((response.status === "success" && response.data) || [])
                })
              }}
              noCreateAction={this.noCreateAction}
              // key={Math.random()}
            />
        
        
        // </React.Suspense>
      );
    // }
    // else{
    //   return null;
    // }
    
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
          <div>
            {!this.state.isLoading && (
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
                rowTemplate={
                  // this.config
                    // ? (e) => (this.state.isChildGrid) ? this.renderRow(e, this.config) : <h1>hello</h1>
                    (e) => this.renderRow(e, this.config) 
                    // : undefined
                }
                key={Math.random()}
              />
            )}
          </div>
        </React.Suspense>
        {/* {this.state.userInEdit && this.inputTemplate} */}
      </div>
    );
  }
}

export default Team;
