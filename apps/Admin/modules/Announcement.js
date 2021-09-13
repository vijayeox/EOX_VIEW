import { React, ReactDOM, MultiSelect, OX_Grid, Notification } from "oxziongui";
import { TitleBar } from "./components/titlebar";
import { DeleteEntry } from "./components/apiCalls";
import Swal from "sweetalert2";
import config from "./moduleConfig";

class Announcement extends React.Component {
  constructor(props) {
    super(props);
    this.core = this.props.args;
    this.loader = this.core.make("oxzion/splash");
    this.adminWindow = document.getElementsByClassName("Window_Admin")[0];
    this.moduleConfig = config[this.props.name];
    this.listConfig = this.moduleConfig.listConfig;
    this.state = {
      itemInEdit: undefined,
      visible: false,
      permission: {
        canAdd: this.props.userProfile.privileges[
          this.moduleConfig.permission.canAdd
        ],
        canEdit: this.props.userProfile.privileges[
          this.moduleConfig.permission.canEdit
        ],
        canDelete: this.props.userProfile.privileges[
          this.moduleConfig.permission.canDelete
        ]
      },
      selectedOrg: this.props.userProfile.accountId
    };

    this.notif = React.createRef();
    this.OX_Grid = React.createRef();
    this.toggleDialog = this.toggleDialog.bind(this);
    this.renderButtons = this.renderButtons.bind(this);
  }

  insert = () => {
    this.setState({ itemInEdit: {} });
    this.inputTemplate = React.createElement(this.moduleConfig.dialogWindow, {
      args: this.core,
      dataItem: [],
      selectedOrg: this.state.selectedOrg,
      cancel: this.cancel,
      formAction: "post",
      action: this.OX_Grid.current.refreshHandler,
      userPreferences: this.props.userProfile.preferences
    });
  };

  async pushAnnouncementTeams(dataItem, dataObject) {
    let helper = this.core.make("oxzion/restClient");
    let addTeams = await helper.request(
      "v1",
      "account/" +
        this.state.selectedOrg +
        "/announcement/" +
        dataItem +
        "/save",
      {
        teams: dataObject
      },
      "post"
    );
    return addTeams;
  }

  async getAnnouncementTeams(dataItem) {
    let helper = this.core.make("oxzion/restClient");
    let groupUsers = await helper.request(
      "v1",
      "/announcement/" + dataItem + "/teams",
      {},
      "get"
    );
    return groupUsers;
  }

  addUsersToEntity = (dataItem) => {
    this.loader.show(this.adminWindow);
    this.getAnnouncementTeams(dataItem.uuid).then((response) => {
      this.addUsersTemplate = React.createElement(MultiSelect, {
        args: this.core,
        config: {
          dataItem: dataItem,
          title: "Announcement",
          mainList: "account/" + this.state.selectedOrg + "/teams/list",
          subList: response.data,
          members: "Teams"
        },
        manage: {
          postSelected: this.sendTheData,
          closeDialog: this.toggleDialog
        }
      });
      this.setState(
        {
          visible: !this.state.visible
        },
        this.loader.destroy()
      );
    });
  };

  sendTheData = (selectedUsers, dataItem) => {
    var temp2 = [];
    for (var i = 0; i <= selectedUsers.length - 1; i++) {
      var uid = { uuid: selectedUsers[i].uuid };
      temp2.push(uid);
    }
    this.pushAnnouncementTeams(dataItem, temp2).then((response) => {
      this.OX_Grid.current.refreshHandler(response);
    });
    this.toggleDialog();
  };

  toggleDialog() {
    this.setState({
      visible: !this.state.visible
    });
  }

  edit = (dataItem, required) => {
    dataItem = this.cloneItem(dataItem);
    this.setState({
      itemInEdit: dataItem
    });
    this.inputTemplate = React.createElement(this.moduleConfig.dialogWindow, {
      args: this.core,
      dataItem: dataItem,
      selectedOrg: this.state.selectedOrg,
      cancel: this.cancel,
      formAction: "put",
      action: this.OX_Grid.current.refreshHandler,
      userPreferences: this.props.userProfile.preferences,
      diableField: required.diableField
    });
  };

  cloneItem(item) {
    return Object.assign({}, item);
  }

  orgChange = (event) => {
    this.setState({ selectedOrg: event.target.value });
  };

  remove = (dataItem) => {
    var adminWindow = document.querySelector(".Window_Admin");
    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete the record? This cannot be undone.",
      imageUrl: "https://image.flaticon.com/icons/svg/1632/1632714.svg",
      imageWidth: 75,
      imageHeight: 75,
      confirmButtonText: "Delete",
      confirmButtonColor: "#d33",
      showCancelButton: true,
      cancelButtonColor: "#3085d6",
      target: adminWindow
    }).then((result) => {
      if (result.value) {
        DeleteEntry(
          "account/" + this.state.selectedOrg + "/announcement",
          dataItem.uuid
        ).then((response) => {
          this.OX_Grid.current.refreshHandler(response);
        });
      }
    });
  };

  cancel = () => {
    this.setState({ itemInEdit: undefined });
  };

  prepareColumnData() {
    var columnInfo = [];
    columnInfo = JSON.parse(JSON.stringify(this.listConfig.columnConfig));
    columnInfo.push({
      title: "Actions",
      cell: (e) => this.renderButtons(e, this.listConfig.actions),
      filterCell: {
        type: "empty"
      }
    });
    return columnInfo;
  }

  renderButtons(e, action) {
    var actionButtons = [];
    var that = this;
    Object.keys(action).map(function (key, index) {
      actionButtons.push(
        <abbr title={action[key].title} key={index}>
          <button
            type="button"
            className="btn manage-btn"
            onClick={() => {
              switch (action[key].type) {
                case "edit":
                  that.edit(e, false);
                  break;
                case "assignEntity":
                  that.addUsersToEntity(e);
                  break;
                case "delete":
                  that.remove(e);
                  break;
              }
            }}
          >
            <i className={action[key].icon + " manageIcons"}></i>
          </button>
        </abbr>
      );
    });
    return actionButtons;
  }

  createAddButton() {
    if (this.state.permission.canAdd && this.listConfig.addButton) {
      return (
        <button
          key={2}
          onClick={this.insert}
          className="k-button"
          style={{
            position: "absolute",
            top: "7px",
            right: "10px",
            fontSize: "14px",
            padding: "5px 8px"
          }}
        >
          <i className="fa fa-plus-circle" style={{ fontSize: "20px" }}></i>
          <p style={{ margin: "0px", paddingLeft: "10px" }}>
            {this.listConfig.addButton.title}
          </p>
        </button>
      );
    }
  }

  render = () => {
    return (
      <div style={{ height: "inherit" }}>
        <Notification ref={this.notif} />
        <TitleBar
          title={this.moduleConfig.title}
          menu={this.props.menu}
          args={this.core}
          orgChange={this.orgChange}
          orgSwitch={
            this.props.userProfile.privileges.MANAGE_ACCOUNT_WRITE
              ? true
              : false
          }
        />
        <OX_Grid
          osjsCore={this.core}
          ref={this.OX_Grid}
          data={
            "account/" +
            this.state.selectedOrg +
            "/" +
            this.listConfig.route
          }
          wrapStyle={{
            height: "calc(100% - 72px)",
            margin: "15px",
            position: "relative",
            top: "5px"
          }}
          onRowClick={(e) => this.edit(e.dataItem, false)}
          filterable={true}
          reorderable={true}
          resizable={true}
          defaultToolBar={true}
          columnMenuFilter={false}
          sortable={true}
          pageable={{ buttonCount: 3, pageSizes: [10, 20, 30], info: true }}
          columnConfig={this.prepareColumnData()}
          gridToolbar={[
            this.listConfig.toolbarTemplate,
            this.createAddButton()
          ]}
        />
        {this.state.visible && this.addUsersTemplate}
        {this.state.itemInEdit && this.inputTemplate}
      </div>
    );
  };
}

export default Announcement;
