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
      displaySection: "Menu"
    };
    this.child = React.createRef();
  }

  onIconClickHandler = (e, name) => {
    this.props.onIconClick(name);
  }

  list = () => {
    let iconTitleList = [
      {
        name: "Account",
        icon: <i className="fad fa-users-cog" aria-hidden="true"></i>,
        name: "Account"
      },
      {
        name: "Users",
        icon: <i className="fas fa-user " aria-hidden="true"></i>,
        name: "User"
      },
      {
        name: "Roles",
        icon: <i className="fas fa-person-sign" aria-hidden="true"></i>,
      },
      {
        name: "Teams",
        icon: <i className="fas fa-users" aria-hidden="true"></i>,
      },
      {
        name: "Errorlog",
        icon: <i className="far fa-bug" aria-hidden="true"></i>,
      },
      {
        name: "Goals",
        icon: <i className="fas fa-bullseye-arrow" aria-hidden="true"></i>,
      },
      {
        name: "Projects",
        icon: <i className="fad fa-cogs" aria-hidden="true"></i>,
      },
      {
        name: "Announcements",
        icon: <i className="fad fa-bullhorn" aria-hidden="true"></i>,
      },
      {
        name: "Mail Admin",
        icon: <i className="fad fa-mail-bulk" aria-hidden="true"></i>,
      },
      {
        name: "CRM Admin",
        icon: <i className="fad fa-user-tie" aria-hidden="true"></i>,
      },
      {
        name: "PM Admin",
        icon: <i className="fas fa-project-diagram" aria-hidden="true"></i>,
      },
      {
        name: "App Builder",
        icon: <i className="far fa-desktop-alt" aria-hidden="true"></i>,
      },
      {
        name: "OI Studio",
        icon: <i className="fad fa-database" aria-hidden="true"></i>,
      },
    ];
    return iconTitleList;
  };

  iconsTitles = () => {
    let iconsList = this.list();
    let table = [];
    iconsList.map((currentValue) => {
      table.push(
        <div className="desk" id={currentValue.name} onClick={(e) => this.onIconClickHandler(e, currentValue.name)} key={currentValue.name}
          data-txt={currentValue.name}>
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
