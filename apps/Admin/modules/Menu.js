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

  onIconClickHandler = (e, component, type, link) => {
    if (type == "external") {
      this.launchExternalApp(component);
    } else if (type == "internal") {
      this.props.onIconClick(component);
    } else if (type == "externalLink") {
      this.externalLink(link);
    }
  };

  externalLink = (linkName) => {
    window.open(linkName, "_blank");
  };

  list = () => {
    let iconTitleList = [
      {
        name: "Accounts",
        icon: <i className='fas fa-users-cog' aria-hidden='true'></i>,
        component: "Accounts",
        type: "internal",
        privileges: "ACCOUNT",
      },
      {
        name: "Users",
        icon: <i className='fas fa-user ' aria-hidden='true'></i>,
        component: "Users",
        type: "internal",
        privileges: "USER",
      },
      {
        name: "Roles",
        icon: <i className='fas fa-person-sign' aria-hidden='true'></i>,
        component: "Roles",
        type: "internal",
        privileges: "ROLE",
      },
      {
        name: "Teams",
        icon: <i className='fas fa-users' aria-hidden='true'></i>,
        component: "Teams",
        type: "internal",
        privileges: "TEAM",
      },
      // {
      //   name: "Errorlog",
      //   icon: <i className="fas fa-bug" aria-hidden="true"></i>,
      //   component: "Errorlog",
      //   type: "internal",
      //   privileges:"ERROR"
      // },
      // {
      //   name: "Goals",
      //   icon: <i className="fas fa-bullseye-arrow" aria-hidden="true"></i>,
      //   component: "Goal",
      //   type: "internal",
      //   privileges:"KRA"
      // },
      {
        name: "Projects",
        icon: <i className='fas fa-cogs' aria-hidden='true'></i>,
        component: "Projects",
        type: "internal",
        privileges: "PROJECT",
      },
      {
        name: "Announcements",
        icon: <i className='fas fa-bullhorn' aria-hidden='true'></i>,
        component: "Announcements",
        type: "internal",
        privileges: "ANNOUNCEMENT",
      },
      {
        name: "Mail Admin",
        icon: <i className='fas fa-mail-bulk' aria-hidden='true'></i>,
        component: "MailAdmin",
        type: "external",
        privileges: "MAILADMIN",
      },
      {
        name: "CRM Admin",
        icon: <i className='fas fa-user-tie' aria-hidden='true'></i>,
        component: "CRMAdmin",
        type: "external",
        privileges: "CRMADMIN",
      },
      {
        name: "PM Admin",
        icon: <i className='fas fa-project-diagram' aria-hidden='true'></i>,
        component: "TaskAdmin",
        type: "external",
        privileges: "TASKADMIN",
      },
      {
        name: "App Studio",
        icon: <i className="fas fa-desktop-alt" aria-hidden="true"></i>,
        component: "EOXAppBuilder",
        type: "external",
        privileges: "APPBUILDER",
      },
      {
        name: "OI Studio",
        icon: <i className='fas fa-chart-bar' aria-hidden='true'></i>,
        component: "Analytics",
        type: "external",
        privileges: "OIBUILDER",
      },
      {
        name: "EOX Logs",
        icon: <i className='fas fa-info-circle' aria-hidden='true'></i>,
        component: "EOXLogs",
        type: "externalLink",
        privileges: "USER",
        link: "http://13.58.246.62:3000/",
      },
    ];
    return iconTitleList;
  };

  iconsTitles = () => {
    let iconsList = this.list();
    let table = [];
    var readPermission = "";
    var writePermission = "";
    iconsList.map((currentValue) => {
      readPermission = "MANAGE_" + currentValue.privileges + "_READ";
      writePermission = "MANAGE_" + currentValue.privileges + "_WRITE";

      if (this.props.userProfile.privileges[readPermission] === true || this.props.userProfile.privileges[writePermission] === true) {
        table.push(
          <div className='desk' id={currentValue.name} onClick={(e) => this.onIconClickHandler(e, currentValue.component, currentValue.type, currentValue.link)} key={currentValue.name} data-txt={currentValue.component}>
            <div className='header'>{currentValue.icon}</div>
            <div className='text'>
              <p>{currentValue.name}</p>
            </div>
          </div>
        );
      }
    });
    return table;
  };

  render() {
    return (
      <div>
        <div className='iconTitle'>{this.iconsTitles()}</div>
      </div>
    );
  }
}
