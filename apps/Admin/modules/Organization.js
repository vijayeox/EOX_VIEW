import { React, EOXGrid } from "oxziongui";
import { TitleBar } from "./components/titlebar";
import { GetData } from "./components/apiCalls";
import form from "../modules/forms/editCreateAccount.json";

class Organization extends React.Component {
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
        title: "Edit Account",
        isPopup: true,
      },
      delete: {
        type: "button",
        api: "account",
        icon: "fad fa-trash",
        text: "DELETE",
        title: "Delete Account",
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

        permission: {
          canAdd: this.props.userProfile.privileges.MANAGE_USER_CREATE,
          canEdit: this.props.userProfile.privileges.MANAGE_USER_WRITE,
          canDelete: this.props.userProfile.privileges.MANAGE_USER_DELETE,
        },
      });
    this.api = "account";
    this.editApi = "account";
    this.createApi = "account";
    this.addConfig={
      title: "Account",
      mainList: "users/list",
      subList: "account",
      members: "Users",
    };
  }

  componentDidMount() {
    GetData(this.api).then((data) => {
      this.setState({
        accountData: (data.status === "success" && data.data) || [],
        isLoading: false,
      });
    });
  }

  render = () => {
    let config = {
      height: "100%",
      width: "100%",
      filterable: true,
      reorderable: true,
      sortable: true,
      // sort:true,
      pageSize: 5,
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
          field: "logo",
        },

        {
          title: "Name",
          field: "name",
        },
        {
          title: "State",
          field: "state",
        },
        {
          title: "Zip Code",
          field: "zip",
        },
      ],
    };
    return (
      <div style={{ height: "inherit" }}>
        <TitleBar
          title="Manage Account"
          menu={this.props.menu}
          args={this.core}
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
                editApi={this.editApi}
                createApi={this.createApi}
                addConfig={this.addConfig}
                // key={Math.random()}
              />
            )}
          </div>
        </React.Suspense>
      </div>
    );
  };
}

export default Organization;
