import { React, EOXGrid, Helpers } from "oxziongui";
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
        icon: "fas fa-pencil",
        text: "EDIT",
        title: "Edit Goal",
      },
      delete: {
        type: "button",
        icon: "fas fa-trash",
        text: "DELETE",
        title: "Delete Goal",
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
        ],
      }),
      (this.state = {
        skip: 0,
        isLoading: true,
        accountData: [],
        selectedOrg: this.props.userProfile.accountId,
        permission: {
          canAdd: this.props.userProfile.privileges.MANAGE_KRA_CREATE,
          canEdit: this.props.userProfile.privileges.MANAGE_KRA_WRITE,
          canDelete: this.props.userProfile.privileges.MANAGE_KRA_DELETE,
        },
      }),
      (this.api = "account/" + this.state.selectedOrg + "/kra");
    this.editApi = "account/" + this.state.selectedOrg + "/kra";
    this.createApi = "account/" + this.state.selectedOrg + "/kra";
    this.deleteApi = "account/" + this.state.selectedOrg + "/kra";
  }

  orgChange = (event) => {
    this.setState({ selectedOrg: event.target.value, isLoading: true }, () => {
      this.api = "account/" + this.state.selectedOrg + "/kra";
      this.editApi = "account/" + this.state.selectedOrg + "/kra";
      this.createApi = "account/" + this.state.selectedOrg + "/kra";
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

export default Goal;
