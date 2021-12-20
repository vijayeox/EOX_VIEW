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
        icon: "fad fa-pencil",
        text: "EDIT",
        title: "Edit Account",
      },
      delete: {
        type: "button",
        icon: "fad fa-trash",
        text: "DELETE",
        title: "Delete Account",
      },
      add: {
        type: "button",
        icon: "fad fa-user-plus",
        text: "ADD",
        title: "Add Users to Account",
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
        pageSize: 20,
        // pageable:true,
        pageable: {
          skip: 0,
          pageSize: 20,
          buttonCount: 3,
          // info: true
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
      });
    this.state = {
      isLoading: true,
      accountData: [],
      permission: {
        canAdd: this.props.userProfile.privileges.MANAGE_USER_CREATE,
        canEdit: this.props.userProfile.privileges.MANAGE_USER_WRITE,
        canDelete: this.props.userProfile.privileges.MANAGE_USER_DELETE,
      },
      total: 0,
      skip: 0,
    };
    this.api = "account";
    this.editApi = "account";
    this.createApi = "account";
    this.deleteApi = "account";
    this.addConfig = {
      title: "Account",
      mainList: "users/list",
      subList: "account",
      members: "Users",
    };
  }

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
  render() {
    return (
      <div style={{ height: "inherit" }}>
        <TitleBar
          title="Manage Account"
          menu={this.props.menu}
          args={this.core}
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

export default Organization;
