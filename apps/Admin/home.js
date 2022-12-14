import { React, ReactDOM } from "oxziongui";
import Organization from "./modules/Organization";
import Project from "./modules/Project";
import User from "./modules/User";
import Team from "./modules/Team";
// import Goal from "./modules/Goal";
import Role from "./modules/Roles";
import Announcement from "./modules/Announcement";
// import Errorlog from "./modules/Errorlog";
import SideNav, { Toggle, Nav, NavItem, NavIcon, NavText } from "@trendmicro/react-sidenav";
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
    document.getElementsByClassName("Window_Admin")[0].addEventListener("windowResize", this.resizeEvent, false);
  }

  resizeEvent = () => {
    let that = this;
    window.setTimeout(() => {
      var screen = document.querySelector(".Window_Admin").querySelector(".osjs-window-content").clientHeight;
      that.setState({ windowSize: screen });
    }, 100);
  };

  onSelect = (selected) => {
    this.setState({
      displaySection: selected,
    });
  };

  onIconClickHandler = (content) => {
    document.querySelector(`div[title=${content}]`)?.click(); // Applies the necessary classes to indicate it is clicked.
    this.onSelect(content);
  };

  launchExternalApp = (appName) => {
    this.core.run(appName);
    let name = document.getElementsByClassName("Window_Admin");
    if (onClick(name)) {
      this.state.displaySection = "Menu";
    }
  };

  externalLink = (linkName) => {
    window.open(linkName, "_blank");
  };

  render() {
    let sectionContent;
    switch (this.state.displaySection) {
      case "Menu":
        sectionContent = <Menu args={this.core} setTitle={this.setTitle} userProfile={this.userProfile} name='Menu' key={"Menu"} onIconClick={this.onIconClickHandler} />;
        break;
      case "Accounts":
        if (this.userProfile.privileges["MANAGE_ACCOUNT_READ"]) {
          sectionContent = <Organization args={this.core} setTitle={this.setTitle} userProfile={this.userProfile} name='Accounts' key='Accounts' />;
        }
        break;
      case "Users":
        if (this.userProfile.privileges["MANAGE_USER_READ"]) {
          sectionContent = <User args={this.core} setTitle={this.setTitle} userProfile={this.userProfile} name='Users' key='Users' />;
        }
        break;
      case "Roles":
        if (this.userProfile.privileges["MANAGE_ROLE_READ"]) {
          sectionContent = <Role args={this.core} setTitle={this.setTitle} userProfile={this.userProfile} name='Roles' key='Roles' />;
        }
        break;
      case "Teams":
        if (this.userProfile.privileges["MANAGE_TEAM_READ"]) {
          sectionContent = <Team args={this.core} setTitle={this.setTitle} userProfile={this.userProfile} name='Teams' key='Teams' />;
        }
        break;
      // case "Goal":
      //   if (this.userProfile.privileges["MANAGE_KRA_WRITE"]) {
      //     sectionContent = (
      //       <Goal
      //         args={this.core}
      //         setTitle={this.setTitle}
      //         userProfile={this.userProfile}
      //         name="Kras"
      //         key="Kras"
      //       />
      //     );
      //   }
      //   break;
      case "Projects":
        if (this.userProfile.privileges["MANAGE_PROJECT_READ"]) {
          sectionContent = <Project args={this.core} setTitle={this.setTitle} userProfile={this.userProfile} name='Projects' key='Projects' />;
        }
        break;
      case "Announcements":
        if (this.userProfile.privileges["MANAGE_ANNOUNCEMENT_READ"]) {
          sectionContent = <Announcement args={this.core} setTitle={this.setTitle} userProfile={this.userProfile} name='Announcements' key='Announcements' />;
        }
        break;
      // case "Errorlog":
      //   if (this.userProfile.privileges["MANAGE_ERROR_WRITE"]) {
      //     sectionContent = (
      //       <Errorlog
      //         args={this.core}
      //         setTitle={this.setTitle}
      //         userProfile={this.userProfile}
      //         name="Errorlog"
      //         key="Errorlog"
      //       />
      //     );
      //   }
      //   break;
    }

    return (
      <div
        id='admin-outer-container'
        style={{
          backgroundColor: "#ffffff",
          backgroundSize: "cover",
          height: this.state.windowSize || "32rem",
        }}>
        <SideNav onSelect={this.onSelect} style={({ overflowY: "scroll" }, { overflowX: "hidden" })}>
          <SideNav.Toggle />
          <SideNav.Nav defaultSelected={this.state.displaySection}>
            <NavItem eventKey='Menu' key='Menu' title='Home'>
              <NavIcon>
                <i className='fas fa-home' aria-hidden='true'></i>
              </NavIcon>
              <NavText>Home</NavText>
            </NavItem>

            {this.userProfile.privileges.MANAGE_ACCOUNT_WRITE || this.userProfile.privileges.MANAGE_ACCOUNT_READ ? (
              <NavItem eventKey='Accounts' key='Accounts' title='Accounts'>
                <NavIcon>
                  <i className='fas fa-users-cog' aria-hidden='true'></i>
                </NavIcon>
                <NavText>Account</NavText>
              </NavItem>
            ) : (
              ""
            )}
            {this.userProfile.privileges.MANAGE_USER_WRITE || this.userProfile.privileges.MANAGE_USER_READ ? (
              <NavItem eventKey='Users' key='Users' title='Users'>
                <NavIcon>
                  <i className='fas fa-user' aria-hidden='true'></i>
                </NavIcon>
                <NavText>Users</NavText>
              </NavItem>
            ) : (
              ""
            )}
            {this.userProfile.privileges.MANAGE_ROLE_WRITE || this.userProfile.privileges.MANAGE_ROLE_READ ? (
              <NavItem eventKey='Roles' key='Roles' title='Roles'>
                <NavIcon>
                  <i className='fas fa-person-sign' aria-hidden='true'></i>
                </NavIcon>
                <NavText>Roles</NavText>
              </NavItem>
            ) : (
              ""
            )}
            {this.userProfile.privileges.MANAGE_TEAM_WRITE || this.userProfile.privileges.MANAGE_TEAM_READ ? (
              <NavItem eventKey='Teams' key='Teams' title='Teams'>
                <NavIcon>
                  <i className='fas fa-users' aria-hidden='true'></i>
                </NavIcon>
                <NavText>Teams</NavText>
              </NavItem>
            ) : (
              ""
            )}
            {/* {this.userProfile.privileges.MANAGE_KRA_WRITE || this.userProfile.privileges.MANAGE_KRA_READ ? (
              <NavItem eventKey="Goal" key="Goal" title="Goals">
                <NavIcon>
                  <i className="fas fa-bullseye-arrow" aria-hidden="true"></i>
                </NavIcon>
                <NavText>Goals</NavText>
              </NavItem>
            ) : (
              ""
            )}
            {this.userProfile.privileges.MANAGE_ERROR_WRITE || this.userProfile.privileges.MANAGE_ERROR_READ? (
              <NavItem eventKey="Errorlog" key="Errorlog" title="Errorlog">
                <NavIcon>
                  <i
                    className="fas fa-bug faa-bug animated-hover"
                    aria-hidden="true"
                  ></i>
                </NavIcon>
                <NavText>Errorlog</NavText>
              </NavItem>
            ) : (
              ""
            )} */}
						{this.userProfile.privileges.MANAGE_PROJECT_WRITE ||
						this.userProfile.privileges.MANAGE_PROJECT_READ ? (
							<NavItem eventKey="Projects" key="Projects" title="Projects">
								<NavIcon>
									<i className="fas fa-cogs" aria-hidden="true"></i>
								</NavIcon>
								<NavText>Projects</NavText>
							</NavItem>
						) : (
							""
						)}
						{this.userProfile.privileges.MANAGE_ANNOUNCEMENT_WRITE ||
						this.userProfile.privileges.MANAGE_ANNOUNCEMENT_READ ? (
							<NavItem
								eventKey="Announcements"
								key="Announcements"
								title="Announcements"
							>
								<NavIcon>
									<i className="fas fa-bullhorn" aria-hidden="true"></i>
								</NavIcon>
								<NavText>Announcement</NavText>
							</NavItem>
						) : (
							""
						)}
						{this.userProfile.privileges.MANAGE_MAILADMIN_WRITE ||
						this.userProfile.privileges.MANAGE_MAILADMIN_READ ? (
							<NavItem
								eventKey={this.userProfile.privileges.MANAGE_MAILADMIN_WRITE}
								// key={this.userProfile.privileges.MANAGE_MAILADMIN_WRITE}
								onClick={() => this.launchExternalApp("MailAdmin")}
								title="Mail Admin"
								key="MailAdmin"
							>
								<NavIcon>
									<i className="fas fa-mail-bulk" aria-hidden="true"></i>
								</NavIcon>
								<NavText>Mail Admin</NavText>
							</NavItem>
						) : (
							""
						)}
						{this.userProfile.privileges.MANAGE_CRMADMIN_WRITE ||
						this.userProfile.privileges.MANAGE_CRMADMIN_READ ? (
							<NavItem
								eventKey={this.userProfile.privileges.MANAGE_CRMADMIN_WRITE}
								// key={this.userProfile.privileges.MANAGE_CRMADMIN_WRITE}
								onClick={() => this.launchExternalApp("CRMAdmin")}
								title="CRM Admin"
								key="CRMAdmin"
							>
								<NavIcon>
									<i className="fas fa-user-tie" aria-hidden="true"></i>
								</NavIcon>
								<NavText>CRM Admin</NavText>
							</NavItem>
						) : (
							""
						)}
						{this.userProfile.privileges.MANAGE_TASKADMIN_WRITE ||
						this.userProfile.privileges.MANAGE_TASKADMIN_READ ? (
							<NavItem
								eventKey={this.userProfile.privileges.MANAGE_TASKADMIN_WRITE}
								// key={this.userProfile.privileges.MANAGE_TASKADMIN_WRITE}
								onClick={() => this.launchExternalApp("TaskAdmin")}
								title="PM Admin"
								key="PMAdmin"
							>
								<NavIcon>
									<i className="fas fa-project-diagram" aria-hidden="true"></i>
								</NavIcon>
								<NavText>PM Admin</NavText>
							</NavItem>
						) : (
							""
						)}
						{this.userProfile.privileges.MANAGE_APPBUILDER_READ ||
						this.userProfile.privileges.MANAGE_APPBUILDER_WRITE ? (
							<NavItem
								eventKey={this.userProfile.privileges.MANAGE_APPBUILDER_READ}
								// key={this.userProfile.privileges.MANAGE_APPBUILDER_READ}
								onClick={() => this.launchExternalApp("EOXAppBuilder")}
								title="App Studio"
								key="AppBuilder"
							>
								<NavIcon>
									<i className="fas fa-desktop-alt" aria-hidden="true"></i>
								</NavIcon>
								<NavText>App Studio</NavText>
							</NavItem>
						) : (
							""
						)}

						{this.userProfile.privileges.MANAGE_OIBUILDER_READ ||
						this.userProfile.privileges.MANAGE_OIBUILDER_WRITE ? (
							<NavItem
								eventKey={this.userProfile.privileges.MANAGE_OIBUILDER_READ}
								// key={this.userProfile.privileges.MANAGE_OIBUILDER_READ}
								onClick={() => this.launchExternalApp("Analytics")}
								title="OI Studio"
								key="OI"
							>
								<NavIcon>
									<i className="fas fa-chart-bar" aria-hidden="true"></i>
								</NavIcon>
								<NavText>OI Studio</NavText>
							</NavItem>
						) : (
							""
            )}

            {this.userProfile.privileges.MANAGE_USER_READ || this.userProfile.privileges.MANAGE_USER_WRITE ? (
              <NavItem eventKey='EOXLogs' key='EOXLogs' title='EOXLogs' onClick={() => this.externalLink("http://13.58.246.62:3000/")}>
                <NavIcon>
                  <i className='fas fa-info-circle' aria-hidden='true'></i>
                </NavIcon>
                <NavText>EOX Logs</NavText>
              </NavItem>
            ) : (
              ""
            )}
          </SideNav.Nav>
        </SideNav>

        <div className='DashBG' style={({ height: "100%" }, { paddingLeft: "65px" })} id='admin-page-wrap'>
          {sectionContent}
        </div>
      </div>
    );
  }
}
