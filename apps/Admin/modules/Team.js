import { React, Notification, MultiSelect, OX_Grid } from "oxziongui";
import { DeleteEntry } from "./components/apiCalls";
import { TitleBar } from "./components/titlebar";
import Swal from "sweetalert2";
import config from "./moduleConfig";

class Team extends React.Component {
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
        ],
      },
      selectedOrg: this.props.userProfile.accountId,
    };

    this.notif = React.createRef();
    this.OX_Grid = React.createRef();
    this.toggleDialog = this.toggleDialog.bind(this);
    this.renderButtons = this.renderButtons.bind(this);
  }

  async fetchCurrentEntries(route) {
    let helper = this.core.make("oxzion/restClient");
    let currentItems = await helper.request("v1", route, {}, "get");
    return currentItems;
  }

  async pushTeamUsers(dataItem, dataObject) {
    let helper = this.core.make("oxzion/restClient");
    let addTeamUsers = await helper.request(
      "v1",
      "account/" +
        this.state.selectedOrg +
        "/team/" +
        dataItem +
        "/save",
      {
        userIdList: dataObject,
      },
      "post"
    );
    return addTeamUsers;
  }

  sendTheData = (selectedUsers, item) => {
    var temp1 = selectedUsers;
    var temp2 = [];
    for (var i = 0; i <= temp1.length - 1; i++) {
      var uid = { uuid: temp1[i].uuid };
      temp2.push(uid);
    }
    this.pushTeamUsers(item, temp2).then((response) => {
      if(response.status == 'success'){
        this.notif.current.notify(
          "Success",
          "Operation succesfully completed",
          "success"
        )
      }else{
        this.notif.current.notify(
          "Error",
          "Operation Failed",
          "danger"
        )
      }   
      this.OX_Grid.current.refreshHandler(response);   
    });
    this.toggleDialog();
  };

  toggleDialog() {
    this.setState({
      visible: !this.state.visible,
    });
  }

  orgChange = (event) => {
    this.setState({ selectedOrg: event.target.value });
  };

  createAddButton() {
    if (this.state.permission.canAdd && this.listConfig.addButton) {
      return (
        <button
          key={2}
          onClick={this.insert}
          className="k-button"
          style={{
            position: "absolute",
            top: "1px",
            right: "10px",
            fontSize: "14px",
            padding: "5px 8px",
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

  insert = () => {
    this.setState({ itemInEdit: {} });
    this.inputTemplate = React.createElement(this.moduleConfig.dialogWindow, {
      args: this.core,
      dataItem: [],
      selectedOrg: this.state.selectedOrg,
      cancel: this.cancel,
      formAction: "post",
      action: this.OX_Grid.current.refreshHandler,
      userPreferences: this.props.userProfile.preferences,
    });
  };

  edit = (dataItem, required) => {
    dataItem = this.cloneItem(dataItem);
    this.setState({
      itemInEdit: dataItem,
    });
    this.inputTemplate = React.createElement(this.moduleConfig.dialogWindow, {
      args: this.core,
      dataItem: dataItem,
      selectedOrg: this.state.selectedOrg,
      cancel: this.cancel,
      formAction: "put",
      action: this.OX_Grid.current.refreshHandler,
      userPreferences: this.props.userProfile.preferences,
      diableField: required.diableField,
    });
  };

  remove = (dataItem, config) => {
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
      target: this.adminWindow,
    }).then((result) => {
      if (result.value) {
        DeleteEntry(
          "account/" + this.state.selectedOrg + config.route,
          dataItem.uuid
        ).then((response) => {
          if (response.message == "Team has subteams") {
            Swal.fire({
              title: "Are you sure?",
              text:
                "The following action will delete the team and its subteams",
              imageUrl: "https://image.flaticon.com/icons/svg/1632/1632714.svg",
              imageWidth: 75,
              imageHeight: 75,
              confirmButtonText: "Delete",
              confirmButtonColor: "#d33",
              showCancelButton: true,
              cancelButtonColor: "#3085d6",
              target: this.adminWindow,
            }).then((result) => {
              if (result.value) {
                DeleteEntry(
                  "account/" + this.state.selectedOrg + config.route,
                  dataItem.uuid + "/true"
                ).then((response) => {
                  response.status == "success"
                    ? (this.OX_Grid.current.refreshHandler(response),
                      this.notif.current.notify(
                        "Operation succesfully completed",
                        response.message,
                        "success"
                      ))
                    : this.notif.current.notify(
                        "Operation Failed",
                        response.message,
                        "danger"
                      );
                });
              }
            });
          } else if (response.status == "success") {
            this.OX_Grid.current.refreshHandler(response);
            this.notif.current.notify(
              "Operation succesfully completed",
              response.message,
              "success"
            );
          } else {
            this.notif.current.notify(
              "Operation Failed",
              response.message,
              "danger"
            );
          }
        });
      }
    });
  };

  addUsersToEntity = (dataItem, config) => {
    this.setState({
      visible: !this.state.visible,
    });
    var multiselectElement = React.createElement(MultiSelect, {
      args: this.core,
      config: {
        dataItem: dataItem,
        title: config.title,
        mainList: "account/" + this.state.selectedOrg + config.mainList,
        subList: "account/" + this.state.selectedOrg + config.subList,
        members: config.members,
      },
      manage: {
        postSelected: this.sendTheData,
        closeDialog: this.toggleDialog,
      },
    });
    if (config.prefetch) {
      this.fetchCurrentEntries(this.replaceParams(config.route, dataItem)).then(
        (response) => {
          this.addUsersTemplate = multiselectElement;
        }
      );
    } else {
      this.addUsersTemplate = multiselectElement;
    }
  };

  cancel = (mode) => {
    this.setState({ itemInEdit: undefined });
    if(mode && (mode == 'save')){
      this.notif.current.notify(
        "Success",
        "Operation succesfully completed",
        "success"
      );
    }
  };

  cloneItem(dataItem) {
    return Object.assign({}, dataItem);
  }

  prepareColumnData(configData) {
    var columnInfo = [];
    columnInfo = JSON.parse(JSON.stringify(configData.columnConfig));
    columnInfo.push({
      title: "Actions",
      cell: (e) => this.renderButtons(e, configData.actions),
      filterCell: {
        type: "empty",
      },
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
                  that.addUsersToEntity(e, action[key]);
                  break;
                case "delete":
                  that.remove(e, action[key]);
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

  renderRow(e, rowConfig) {
    let subRoute = this.replaceParams(rowConfig.subRoute, e);
    return (
      <OX_Grid
        osjsCore={this.core}
        data={subRoute}
        parentData={e}
        gridToolbar={rowConfig.toolbarTemplate}
        rowTemplate={
          this.listConfig.expandable
            ? (e) => this.renderRow(e, this.listConfig.expandable)
            : undefined
        }
        filterable={true}
        gridDefaultFilters={this.listConfig.defaultFilters}
        reorderable={true}
        resizable={true}
        sortable={true}
        columnMenuFilter={false}
        defaultToolBar={true}
        expandable={this.listConfig.expandable ? true : undefined}
        columnConfig={this.prepareColumnData(this.listConfig)}
      />
    );
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

  render() {
    return (
      <div style={{ height: "inherit" }}>
        <Notification ref={this.notif} />
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
          <OX_Grid
            osjsCore={this.core}
            ref={this.OX_Grid}
            rowTemplate={
              this.listConfig.expandable
                ? (e) => this.renderRow(e, this.listConfig.expandable)
                : undefined
            }
            expandable={this.listConfig.expandable ? true : undefined}
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
              top: "5px",
            }}
            onRowClick={(e) => this.edit(e.dataItem, false)}
            filterable={true}
            gridDefaultFilters={this.listConfig.defaultFilters}
            reorderable={true}
            resizable={true}
            sortable={true}
            columnMenuFilter={false}
            defaultToolBar={true}
            pageable={{ buttonCount: 3, pageSizes: [10, 20, 30], info: true }}
            columnConfig={this.prepareColumnData(this.listConfig)}
            gridToolbar={[
              this.listConfig.toolbarTemplate,
              this.createAddButton(),
            ]}
          />
        {this.state.itemInEdit && this.inputTemplate}
        {this.state.visible && this.addUsersTemplate}
      </div>
    );
  }
}

export default Team;
