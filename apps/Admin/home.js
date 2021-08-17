import { React, ReactDOM } from "oxziongui";
import Organization from "./modules/Organization";
import Project from "./modules/Project";
import User from "./modules/User";
import Team from "./modules/Team";
import Goal from "./modules/Goal";
import Role from "./modules/Roles";
import Announcement from "./modules/Announcement";
import Errorlog from "./modules/Errorlog";
import SideNav, {
  Toggle,
  Nav,
  NavItem,
  NavIcon,
  NavText,
} from "@trendmicro/react-sidenav";
import "@trendmicro/react-sidenav/dist/react-sidenav.css";
import Menu from "./modules/Menu";

export default class Home extends React.Component {
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
      displaySection: "Menu",
    };
    this.resizeEvent = this.resizeEvent.bind(this);
    document
      .getElementsByClassName("Window_Admin")[0]
      .addEventListener("windowResize", this.resizeEvent, false);
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

  onSelect = (selected) => {
    this.setState({
      displaySection: selected,
    });
  };

  launchExternalApp = (appName) => {
    this.core.run(appName);
    let name = document.getElementsByClassName("Window_Admin");
    if (onClick(name)) {
      this.state.displaySection = "Menu";
    }
  };

  render() {
    let sectionContent;
    switch (this.state.displaySection) {
      case "Menu":
        sectionContent = (
          <Menu
            args={this.core}
            setTitle={this.setTitle}
            userProfile={this.userProfile}
            name="Menu"
            key={"Menu"}
          />
        );
        break;
      case "Account":
        if (this.userProfile.privileges["MANAGE_ACCOUNT_WRITE"]) {
          sectionContent = (
            <Organization
              args={this.core}
              setTitle={this.setTitle}
              key={""}
              userProfile={this.userProfile}
              name="Account"
              key="Account"
            />
          );
        }
        break;
      case "User":
        if (this.userProfile.privileges["MANAGE_USER_WRITE"]) {
          sectionContent = (
            <User
              args={this.core}
              setTitle={this.setTitle}
              userProfile={this.userProfile}
              name="Users"
              key="Users"
            />
          );
        }
        break;
      case "Role":
        if (this.userProfile.privileges["MANAGE_ROLE_WRITE"]) {
          sectionContent = (
            <Role
              args={this.core}
              setTitle={this.setTitle}
              userProfile={this.userProfile}
              name="Roles"
              key="Roles"
            />
          );
        }
        break;
      case "Team":
        if (this.userProfile.privileges["MANAGE_TEAM_WRITE"]) {
          sectionContent = (
            <Team
              args={this.core}
              setTitle={this.setTitle}
              userProfile={this.userProfile}
              name="Teams"
              key="Teams"
            />
          );
        }
        break;
      case "Goal":
        if (this.userProfile.privileges["MANAGE_KRA_WRITE"]) {
          sectionContent = (
            <Goal
              args={this.core}
              setTitle={this.setTitle}
              userProfile={this.userProfile}
              name="Kras"
              key="Kras"
            />
          );
        }
        break;
      case "Project":
        if (this.userProfile.privileges["MANAGE_PROJECT_WRITE"]) {
          sectionContent = (
            <Project
              args={this.core}
              setTitle={this.setTitle}
              userProfile={this.userProfile}
              name="Projects"
              key="Projects"
            />
          );
        }
        break;
      case "Announcement":
        if (this.userProfile.privileges["MANAGE_ANNOUNCEMENT_WRITE"]) {
          sectionContent = (
            <Announcement
              args={this.core}
              setTitle={this.setTitle}
              userProfile={this.userProfile}
              name="Announcement"
              key="Announcement"
            />
          );
        }
        break;
      case "Errorlog":
        if (this.userProfile.privileges["MANAGE_ERROR_WRITE"]) {
          sectionContent = (
            <Errorlog
              args={this.core}
              setTitle={this.setTitle}
              userProfile={this.userProfile}
              name="Errorlog"
              key="Errorlog"
            />
          );
        }
        break;
    }

    return (
      <div
        id="admin-outer-container"
        style={{
          backgroundColor: "#ffffff",
          backgroundSize: "cover",
          height: this.state.windowSize || "32rem",
        }}
      >
        <SideNav
          onSelect={this.onSelect}
          style={({ overflowY: "scroll" }, { overflowX: "hidden" })}
        >
          <SideNav.Toggle />
          <SideNav.Nav defaultSelected={this.state.displaySection}>
            <NavItem eventKey="Menu" key="Menu">
              <NavIcon>
                <i className="fas fa-home" aria-hidden="true"></i>
              </NavIcon>
              <NavText>Home</NavText>
            </NavItem>

            <NavItem eventKey="Account" key="Account">
              <NavIcon>
                <i className="fad fa-users-cog" aria-hidden="true"></i>
              </NavIcon>
              <NavText>Account</NavText>
            </NavItem>

            <NavItem eventKey="User" key="User">
              <NavIcon>
                <i className="fas fa-user" aria-hidden="true"></i>
              </NavIcon>
              <NavText>Users</NavText>
            </NavItem>

            <NavItem eventKey="Role" key="Role">
              <NavIcon>
                <i className="fas fa-person-sign" aria-hidden="true"></i>
              </NavIcon>
              <NavText>Roles</NavText>
            </NavItem>

            <NavItem eventKey="Team" key="Team">
              <NavIcon>
                <i className="fas fa-users" aria-hidden="true"></i>
              </NavIcon>
              <NavText>Teams</NavText>
            </NavItem>

            <NavItem eventKey="Errorlog" key="Errorlog">
              <NavIcon>
                <i
                  className="far fa-bug faa-bug animated-hover"
                  aria-hidden="true"
                ></i>
              </NavIcon>
              <NavText>Errorlog</NavText>
            </NavItem>

            <NavItem eventKey="Goal" key="Goal">
              <NavIcon>
                <i className="fas fa-bullseye-arrow" aria-hidden="true"></i>
              </NavIcon>
              <NavText>Goals</NavText>
            </NavItem>

            <NavItem eventKey="Project" key="Project">
              <NavIcon>
                <i className="fad fa-cogs" aria-hidden="true"></i>
              </NavIcon>
              <NavText>Projects</NavText>
            </NavItem>

            <NavItem eventKey="Announcement" key="Announcement">
              <NavIcon>
                <i className="fad fa-bullhorn" aria-hidden="true"></i>
              </NavIcon>
              <NavText>Announcement</NavText>
            </NavItem>

            <NavItem
              eventKey={this.userProfile.privileges.MANAGE_MAILADMIN_WRITE}
              key={this.userProfile.privileges.MANAGE_MAILADMIN_WRITE}
              onClick={() => this.launchExternalApp("MailAdmin")}
            >
              <NavIcon>
                <i className="fad fa-mail-bulk" aria-hidden="true"></i>
              </NavIcon>
              <NavText>Mail Admin</NavText>
            </NavItem>

            <NavItem
              eventKey={this.userProfile.privileges.MANAGE_CRMADMIN_WRITE}
              key={this.userProfile.privileges.MANAGE_CRMADMIN_WRITE}
              onClick={() => this.launchExternalApp("CRMAdmin")}
            >
              <NavIcon>
                <i className="fad fa-user-tie" aria-hidden="true"></i>
              </NavIcon>
              <NavText>CRM Admin</NavText>
            </NavItem>

            <NavItem
              eventKey={this.userProfile.privileges.MANAGE_TASKADMIN_WRITE}
              key={this.userProfile.privileges.MANAGE_TASKADMIN_WRITE}
              onClick={() => this.launchExternalApp("TaskAdmin")}
            >
              <NavIcon>
                <i className="fas fa-project-diagram" aria-hidden="true"></i>
              </NavIcon>
              <NavText>PM Admin</NavText>
            </NavItem>

            <NavItem
              eventKey={this.userProfile.privileges.MANAGE_APPBUILDER_READ}
              key={this.userProfile.privileges.MANAGE_APPBUILDER_READ}
              onClick={() => this.launchExternalApp("EOXAppBuilder")}
            >
              <NavIcon>
                <i className="far fa-desktop-alt" aria-hidden="true"></i>
              </NavIcon>
              <NavText>App Builder</NavText>
            </NavItem>

            <NavItem
              eventKey={this.userProfile.privileges.MANAGE_OIBUILDER_READ}
              key={this.userProfile.privileges.MANAGE_OIBUILDER_READ}
              onClick={() => this.launchExternalApp("Analytics")}
            >
              <NavIcon>
                <i className="fad fa-database" aria-hidden="true"></i>
              </NavIcon>
              <NavText>OI Studio</NavText>
            </NavItem>
          </SideNav.Nav>
        </SideNav>

        <div
          className="DashBG"
          style={({ height: "100%" }, { paddingLeft: "65px" })}
          id="admin-page-wrap"
        >
          {sectionContent}
        </div>
      </div>
    );
  }
}
