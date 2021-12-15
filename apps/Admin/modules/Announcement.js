import { React, EOXGrid } from "oxziongui";
import { TitleBar } from "./components/titlebar";
import { GetData } from "./components/apiCalls";
import form from "../modules/forms/editCreateAnnouncement.json";
class Announcement extends React.Component {
  constructor(props) {
    super(props);
    this.core = this.props.args;
    this.drillDownRequired = false;
    (this.actionItems = {
      edit: {
        type: "button",
        api: "announcement",
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
          canAdd: this.props.userProfile.privileges.MANAGE_ANNOUNCEMENT_WRITE,
          canEdit: this.props.userProfile.privileges.MANAGE_ANNOUNCEMENT_WRITE,
          canDelete:
            this.props.userProfile.privileges.MANAGE_ANNOUNCEMENT_WRITE,
        },
        // userInEdit: undefined,
      }),
      this.api = "account/" + this.state.selectedOrg + "/announcements";
      this.editApi="announcement";
      this.createApi="account/" + this.state.selectedOrg+ "/announcement";
      this.deleteApi="account/" + this.state.selectedOrg+ "/announcement";
      this.addConfig={
        title: "Announcement",
        mainList: "account/" + this.state.selectedOrg + "/teams/list",
        // subList: "account",
        members: "Teams",
        addAnnouncementFlag:true,
      };
    }

  orgChange = (event) => {
    this.setState({selectedOrg: event.target.value, isLoading : true}, () => {
      this.api = "account/" + this.state.selectedOrg + "/announcements";
      this.createApi="account/" + this.state.selectedOrg+ "/announcement";
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

  render = () => {
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
          //should be converted to logo
          title: "Banner",
          field: "media",
        },
        {
          title: "Name",
          field: "name",
        },
        {
          title: "Description",
          field: "description",
        },
        {
          title: "Type",
          field: "type",
        },
      ],
    };
    return (
      <div style={{ height: "auto" }}>
        {/* <Notification ref={this.notif} /> */}
        <TitleBar
          title="Manage Announcements"
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
                editApi={this.editApi}
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
  };
}

export default Announcement;
