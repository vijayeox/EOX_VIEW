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
        icon: "fad fa-pencil",
        text: "EDIT",
        title: "Edit Announcement",
      },
      delete: {
        type: "button",
        icon: "fad fa-trash",
        text: "DELETE",
        title: "Delete Announcement",
      },
      add: {
        type: "button",
        icon: "fad fa-user-plus",
        text: "ADD",
        title: "Add Teams to announcement",
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
        skip: 0,
        isLoading: true,
      }),
      (this.api = "account/" + this.state.selectedOrg + "/announcements");
    this.editApi = "announcement";
    this.createApi = "account/" + this.state.selectedOrg + "/announcement";
    this.deleteApi = "account/" + this.state.selectedOrg + "/announcement";
    this.addConfig = {
      title: "Announcement",
      mainList: "account/" + this.state.selectedOrg + "/teams/list",
      members: "Teams",
      addAnnouncementFlag: true,
    };
  }
  
  appendAttachments = (formData) => {
    if(formData._attachments.length > 0){
      const attachmentFilename = formData._attachments[0][0].filename[0];
      formData.media = attachmentFilename;
    }
  }

  fetchAttachments = async (data) => {
    console.log(data)
    // const api = "attachment/" + data.media;
    // const response = await GetData(api);
    // data.upload = response.data[0].path;
  }

  orgChange = (event) => {
    this.setState({ selectedOrg: event.target.value, isLoading: true }, () => {
      this.api = "account/" + this.state.selectedOrg + "/announcements";
      this.createApi = "account/" + this.state.selectedOrg + "/announcement";
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

  render = () => {
    return (
      <div style={{ height: "auto" }}>
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
              appendAttachments={this.appendAttachments}
              fetchAttachments={this.fetchAttachments}
              // key={Math.random()}
            />
          </div>
        </React.Suspense>
      </div>
    );
  };
}

export default Announcement;
