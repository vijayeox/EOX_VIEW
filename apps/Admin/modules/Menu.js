import { React } from "oxziongui";

export default class Menu extends React.Component {
  constructor(props) {
    super(props);
    this.core = this.props.args;
    // this.onSelect = this.onSelect(this);
    this.state = {
      userInEdit: undefined,
      permission: {
        canAdd: this.props.userProfile.privileges.MANAGE_USER_CREATE,
        canEdit: this.props.userProfile.privileges.MANAGE_USER_WRITE,
        canDelete: this.props.userProfile.privileges.MANAGE_USER_DELETE,
      },
      selectedOrg: this.props.userProfile.accountId,
      displaySection: "Menu",
    };
    this.child = React.createRef();
  }


  launchExternalApp = (appName) => {
    this.core.run(appName);
    let name = document.getElementsByClassName("Window_Admin");
  };

  onIconClickHandler = (e, component, type) => {
    if (type == "external") {
      this.launchExternalApp(component);
    } else {
      this.props.onIconClick(component);
    }
  };

  list = () => {
    let iconTitleList = [
      {
        name: "Account",
        icon: <i className="fad fa-users-cog" aria-hidden="true"></i>,
        component: "Account",
        type: "internal",
      },
      {
        name: "Users",
        icon: <i className="fas fa-user " aria-hidden="true"></i>,
        component: "User",
        type: "internal",
      },
      {
        name: "Roles",
        icon: <i className="fas fa-person-sign" aria-hidden="true"></i>,
        component: "Role",
        type: "internal",
      },
      {
        name: "Teams",
        icon: <i className="fas fa-users" aria-hidden="true"></i>,
        component: "Team",
        type: "internal",
      },
      {
        name: "Errorlog",
        icon: <i className="far fa-bug" aria-hidden="true"></i>,
        component: "Errorlog",
        type: "internal",
      },
      {
        name: "Goals",
        icon: <i className="fas fa-bullseye-arrow" aria-hidden="true"></i>,
        component: "Goal",
        type: "internal",
      },
      {
        name: "Projects",
        icon: <i className="fad fa-cogs" aria-hidden="true"></i>,
        component: "Project",
        type: "internal",
      },
      {
        name: "Announcements",
        icon: <i className="fad fa-bullhorn" aria-hidden="true"></i>,
        component: "Announcement",
        type: "internal",
      },
      {
        name: "Mail Admin",
        icon: <i className="fad fa-mail-bulk" aria-hidden="true"></i>,
        component: "MailAdmin",
        type: "external",
      },
      {
        name: "CRM Admin",
        icon: <i className="fad fa-user-tie" aria-hidden="true"></i>,
        component: "CRMAdmin",
        type: "external",
      },
      {
        name: "PM Admin",
        icon: <i className="fas fa-project-diagram" aria-hidden="true"></i>,
        component: "TaskAdmin",
        type: "external",
      },
      {
        name: "App Builder",
        icon: <i className="far fa-desktop-alt" aria-hidden="true"></i>,
        component: "EOXAppBuilder",
        type: "external",
      },
      {
        name: "OI Studio",
        icon: <i className="fas fa-chart-bar" aria-hidden="true"></i>,
        component: "Analytics",
        type: "external",
      },
    ];
    return iconTitleList;
  };

  iconsTitles = () => {
    let iconsList = this.list();
    let table = [];
    iconsList.map((currentValue) => {
      table.push(
        <div
          className="desk"
          id={currentValue.name}
          onClick={(e) =>
            this.onIconClickHandler(
              e,
              currentValue.component,
              currentValue.type
            )
          }
          key={currentValue.name}
          data-txt={currentValue.component}
        >
          <div className="header">{currentValue.icon}</div>
          <div className="text">
            <p>{currentValue.name}</p>
          </div>
        </div>
      );
    });
    return table;
  };

  render() {
    return (
      <div>
        <div className="iconTitle">{this.iconsTitles()}</div>
      </div>
    );
  }
}
