import { React, EOXGrid } from "oxziongui";
import { TitleBar } from "./components/titlebar";
import { GetData } from "./components/apiCalls";
import form from "../modules/forms/editCreateGoal.json";

class Goal extends React.Component {
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
        isPopup: true,
      },
      delete: {
        type: "button",
        api: "account",
        icon: "fad fa-trash",
        text: "DELETE",
        isPopup: true,
      },
      create: {
        type: "button",
        api: "account/add",
        icon: " fad fa-plus",
        text: "CREATE",
        isPopup: true,
      },
    }),
    (this.state = {
      isLoading: true,
      accountData: [],

      selectedOrg: this.props.userProfile.accountId,

      permission: {
          canAdd: this.props.userProfile.privileges.MANAGE_TEAM_CREATE,
          canEdit: this.props.userProfile.privileges.MANAGE_TEAM_WRITE,
          canDelete: this.props.userProfile.privileges.MANAGE_TEAM_DELETE,
        },
        // teamInEdit: undefined,
    }),
    (this.api = "account/"+this.state.selectedOrg+"/kra")
    this.editApi="kra";

  
  }
  orgChange = (event) => {
    this.setState({ selectedOrg: event.target.value });
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
          title: "Name",
          field: "name",
        }
      ],
    };

    return (
      <div style={{ height: "inherit" }}>
       <TitleBar
          title="Manage Goals"
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
          <div >
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

export default Goal;