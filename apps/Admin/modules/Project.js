import { React, EOXGrid } from "oxziongui";
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
      add: {
        type: "button",
        api: "account/add",
        icon: "fad fa-user-plus",
        text: "ADD",
        title: "Add Users to Account",
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
      (this.state = {
        isLoading: true,
        accountData: [],

        selectedOrg: this.props.userProfile.accountId,

        permission: {
          canAdd: this.props.userProfile.privileges.MANAGE_PROJECT_WRITE,
          canEdit: this.props.userProfile.privileges.MANAGE_PROJECT_WRITE,
          canDelete: this.props.userProfile.privileges.MANAGE_PROJECT_WRITE,
        },
        // userInEdit: undefined,
      }),
      this.api = "account/" + this.state.selectedOrg + "/projects";
      this.editApi = "project";
      this.createApi="account/" + this.state.selectedOrg+ "/project";
      this.deleteApi="account/" + this.state.selectedOrg+ "/project";
      this.addConfig= {
        title: "Add Members",
        mainList: "account/"+this.state.selectedOrg +"/users/list", 
        subList: "account/" + this.state.selectedOrg +"/project",
        members:"Users",
        prefetch:false,
      }
    }

 
  orgChange = (event) => {
    this.setState({selectedOrg: event.target.value, isLoading : true}, () => {
      this.api = "account/" + this.state.selectedOrg + "/projects";
      this.createApi="account/" + this.state.selectedOrg+ "/project";
        GetData(this.api).then((data) => {
            this.setState({
                accountData : data.status === "success" && data?.data || [],
                isLoading: false
            })
        })
    })
  };

  componentDidMount() {
    console.log(this.api);
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
          title: "Name",
          field: "name",
        },
        {
          title: "Description",
          field: "description",
        },
      ],
    };
    return (
      <div style={{ height: "inherit" }}>
        {/* <Notification ref={this.notif} /> */}
        <TitleBar
          title="Manage Projects"
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
                addConfig={this.addConfig}
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

export default Project;
