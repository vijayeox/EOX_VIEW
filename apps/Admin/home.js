import { React, ReactDOM } from "oxziongui";
import $ from "jquery";
import Organization from "./modules/Organization";
import Project from "./modules/Project";
import User from "./modules/User";
import Team from "./modules/Team";
import Kra from "./modules/Kra";
import Role from "./modules/Roles";
import Announcement from "./modules/Announcement";
import Errorlog from "./modules/Errorlog";
// import { slide as Menu } from "react-burger-menu";

class Home extends React.Component {
  showSettings(event) {
    event.preventDefault();
  }

  constructor(props) {
    super(props);
    this.core = this.props.args;
    this.userProfile = this.core.make("oxzion/profile").get();
    this.userProfile = this.userProfile.key;
    this.state = {
      windowSize: undefined,
      showMenu: false
    };
    this.resizeEvent = this.resizeEvent.bind(this);
    document
      .getElementsByClassName("Window_Admin")[0]
      .addEventListener("windowResize", this.resizeEvent, false);
    this.hideMenu = this.hideMenu.bind(this);
  }

  resizeEvent = () => {
    let that = this;
    window.setTimeout(() => {
      var screen = document
        .querySelector(".Window_Admin")
        .querySelector(".osjs-window-content").clientHeight;
      that.setState({ windowSize: screen });
    }, 100);
  };

  componentDidMount() {
    $(document).ready(function () {
      $("#componentsBox").hide();

      $(document).on("click", ".moduleBtn", function () {
        $(".DashBG").fadeOut(), $("#componentsBox").show();
      });

      $(document).on("click", ".moduleBtn", function () {
        $(".DashBG").fadeOut(), $("#componentsBox").show();
      });
    });
    this.resizeEvent();
  }

  showMainPage = () => {
    this.hideMenu();
    $("#componentsBox").hide(), $(".DashBG").show();
    ReactDOM.render(<div />, document.getElementById("componentsBox"));
  };

  hideMenu = () => {
    this.setState({
      showMenu: false
    });
  };

  showMenu = () => {
    this.setState({
      showMenu: true
    });
  };

  createBlock = () => {
    var appsList = [
      {
        name: "Account",
        api: "ACCOUNT",
        icon: "apps/Admin/org.svg",
        component: Organization
      },
      {
        name: "Users",
        api: "USER",
        icon: "apps/Admin/115-manager.svg",
        component: User
      },
      {
        name: "Roles",
        api: "ROLE",
        icon: "apps/Admin/005-workflow.svg",
        component: Role
      },
      {
        name: "Teams",
        api: "TEAM",
        icon: "apps/Admin/group.svg",
        component: Team
      },
      {
        name: "Kras",
        api: "KRA",
        icon: "apps/Admin/icons8-target-100.png",
        component: Kra
      },
      {
        name: "Projects",
        api: "PROJECT",
        icon: "apps/Admin/101-project.svg",
        component: Project
      },
      {
        name: "Announcement",
        api: "ANNOUNCEMENT",
        icon: "apps/Admin/131-laptop.svg",
        component: Announcement
      }
    ];
    let table = [];

    appsList.map((currentValue, index) => {
      table.push(
        this.userProfile.privileges["MANAGE_" + currentValue.api + "_WRITE"] ? (
          <div
            key={index}
            className="moduleBtn"
            onClick={() => {
              this.hideMenu();
              ReactDOM.render(
                React.createElement(currentValue.component, {
                  args: this.core,
                  userProfile: this.userProfile,
                  menu: this.showMenu,
                  name: currentValue.name
                }),
                document.getElementById("componentsBox")
              );
            }}
          >
            <div className="block d1">
              <img src={currentValue.icon} />
            </div>
            <div className="titles">{currentValue.name}</div>
          </div>
        ) : null
      );
    });
    table.push(
      <React.Fragment key={15}>
        {this.userProfile.privileges.MANAGE_ERROR_WRITE ? (
          <div onClick={this.errorLogAdminClick} className="moduleBtn">
            <div className="block d1">
              <img src="apps/Admin/org.svg" />
            </div>
            <div className="titles">Errorlog</div>
          </div>
        ) : null}
        {this.userProfile.privileges.MANAGE_MAILADMIN_WRITE ? (
          <div key={10} onClick={() => this.launchExternalApp("MailAdmin")}>
            <div className="block d1">
              <img src="apps/Admin/091-email-1.svg" />
            </div>
            <div className="titles">Mail Admin</div>
          </div>
        ) : null}

        {this.userProfile.privileges.MANAGE_CRMADMIN_WRITE ? (
          <div onClick={() => this.launchExternalApp("CRMAdmin")}>
            <div className="block d1">
              <img src="apps/Admin/crm-icon.svg" />
            </div>
            <div className="titles">CRM Admin</div>
          </div>
        ) : null}

        {this.userProfile.privileges.MANAGE_TASKADMIN_WRITE ? (
          <div onClick={() => this.launchExternalApp("TaskAdmin")}>
            <div className="block d1">
              <img src="apps/Admin/008-development-2.svg" />
            </div>
            <div className="titles">PM Admin</div>
          </div>
        ) : null}
        {this.userProfile.privileges.MANAGE_APPBUILDER_READ ? (
          <div onClick={() => this.launchExternalApp("EOXAppBuilder")}>
            <div className="block d1">
              <img src="apps/Admin/008-development-2.svg" />
            </div>
            <div className="titles">App Builder</div>
          </div>
        ) : null}

        {this.userProfile.privileges.MANAGE_OIBUILDER_READ ? (
          <div onClick={() => this.launchExternalApp("Analytics")}>
            <div className="block d1">
              <img src="apps/Admin/014-analytics.svg" />
            </div>
            <div className="titles">OI Studio</div>
          </div>
        ) : null}
      </React.Fragment>
    );
    return table;
  };

  launchExternalApp = appName => {
    this.hideMenu();
    this.core.run(appName);
  };

  errorLogAdminClick = e => {
    this.hideMenu();
    ReactDOM.render(
      React.createElement(Errorlog, {
        args: this.core,
        userProfile: this.userProfile,
        menu: this.showMenu
      }),
      document.getElementById("componentsBox")
    );
  };

  render() {
    return (
      <div
        id="admin-outer-container"
        style={{
          backgroundColor: "#ffffff",
          backgroundSize: "cover",
          height: this.state.windowSize || "32rem"
        }}
      >
        {/* <Menu
          width={"15rem"}
          isOpen={this.state.showMenu}
          disableAutoFocus
          pageWrapId={"admin-page-wrap"}
          outerContainerId={"admin-outer-container"}
          customBurgerIcon={false}
          onStateChange={e => {
            this.setState({
              showMenu: e.isOpen
            });
          }}
          styles={{
            bmOverlay: {
              height: this.state.windowSize,
              display: this.state.showMenu ? "flex" : "none"
            },
            bmMenu: { height: this.state.windowSize }
          }}
        >
          <div
            onClick={this.showMainPage}
            style={{ padding: "0.5rem 0 0.5rem 0px", outline: "none" }}
          >
            <div className="titles">Main Page</div>
          </div>

          <div className="dashIcons">{this.createBlock()}</div>
        </Menu> */}

        <div className="DashBG" style={{ height: "100%" }} id="admin-page-wrap">
          <div className="dashIcons">{this.createBlock()}</div>
        </div>
        <div id="componentsBox" style={{ height: "inherit" }} />
      </div>
    );
  }
}
export default Home;
