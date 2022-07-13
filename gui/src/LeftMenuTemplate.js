import React from "react";
import SideNav, {
  Toggle,
  Nav,
  NavItem,
  NavIcon,
  NavText,
} from "@trendmicro/react-sidenav";
// Be sure to include styles at some point, probably during your bootstraping
import "@trendmicro/react-sidenav/dist/react-sidenav.css";
import Navigation from "./Navigation";
import "./public/css/LeftMenuTemplate.scss";

export default class LeftMenuTemplate extends React.Component {
  constructor(props) {
    super(props);
    this.core = this.props.core;
    this.appId = this.props.appId;
    this.params = this.props.params;
    this.proc = this.props.proc;
    this.config = this.props.config;
    this.keepExpanded = this.props.keepExpanded;
    this.navigation = React.createRef();
    this.appNavigationDiv = "navigation_" + this.appId;
    this.state = {
      menus: this.props.menus ? this.props.menus : [],
      selected: "",
      expanded: this.keepExpanded ? true : false,
      childrenComponents : this.props.childrenComponents
    };
    this.onSelect = this.onSelect.bind(this);
    this.onToggle = this.onToggle.bind(this);
    this.leftMenuTemplateId = `left-navigation-${this.appId}`;
  }

  onToggle(expanded) {
    this.setState({ expanded: expanded });
  }

  componentDidMount(){
    this.getReactComponents();
  }
  getReactComponents(){
    document.getElementById(this.leftMenuTemplateId).addEventListener('GET_REACT_COMPONENT', 
      ({ detail : { cb, type } }) => {
        cb?.(this.state.childrenComponents[type])
      })
  }

  onSelect(selected) {
    this.navigation.current.reloadExistingPage();
    if(selected?.page_id === this.state.selected?.page_id) return;
    this.navigation.current.resetPageCustomActions();
    this.setState({
      selected: selected,
      expanded: this.keepExpanded ? true : false,
    });
  }
  menuLoad(menus) {
    this.setState({
      menus: menus,
    });
  }
  selectLoad(selected) {
    this.setState({
      selected: selected,
    });
  }

  render() {
    const { expanded, selected } = this.state;
    return (
      <div
        className={
          "LeftMenuTemplate" +
          (this.props.proc.metadata.hideMenu ? " hideMenu" : "")
        }
        id={this.leftMenuTemplateId}
      >
        <SideNav
          onSelect={this.onSelect}
          onToggle={this.onToggle}
          expanded={this.state.expanded}
        >
          {this.keepExpanded ? null : <SideNav.Toggle />}
          <SideNav.Nav selected={selected}>
            {this.state.menus && this.state.menus.length > 0 ? (
              this.state.menus.map((menuitem, index) => {
                return (
                  <NavItem eventKey={menuitem} key={index} title={menuitem.name}>
                    <NavIcon>
                      {/* <abbr title={menuitem.name} style={{ cursor: "pointer" }}> */}
                        <i
                          className={menuitem.icon}
                          name={menuitem.name}
                          style={{ fontSize: "1.5em", verticalAlign: "middle" }}
                        />
                      {/* </abbr> */}
                    </NavIcon>
                    <NavText
                      style={{ paddingRight: 32 }}
                      name={menuitem.name}
                      // title={menuitem.name}
                    >
                      {menuitem.name.length > 18
                        ? menuitem.name.substring(0, 18) + "..."
                        : menuitem.name}
                    </NavText>
                    {menuitem.submenu
                      ? menuitem.submenu.map((subMenu, index2) => {
                          return (
                            <NavItem
                              eventKey={subMenu}
                              key={`${Math.random()}_${Math.random()}`}
                              expanded={true}
                              title={subMenu.name}
                            >
                              <NavIcon>
                                {/* <abbr
                                  title={subMenu.name}
                                  style={{ cursor: "pointer" }}
                                > */}
                                  <i
                                    className={subMenu.icon}
                                    name={subMenu.name}
                                    style={{
                                      fontSize: "1.5em",
                                      verticalAlign: "middle",
                                    }}
                                  />
                                {/* </abbr> */}
                              </NavIcon>
                              <NavText
                                style={{ paddingRight: 32 }}
                                name={subMenu.name}
                                // title={subMenu.name}
                              >
                                {subMenu.name.length > 18
                                  ? subMenu.name.substring(0, 18) + "..."
                                  : subMenu.name}
                              </NavText>
                            </NavItem>
                          );
                        })
                      : null}
                  </NavItem>
                );
              })
            ) : (
              <div></div>
            )}
          </SideNav.Nav>
        </SideNav>
        <Navigation
          ref={this.navigation}
          core={this.core}
          params={this.params}
          config={this.config}
          menus={this.state.menus}
          menuLoad={this.menuLoad.bind(this)}
          selectLoad={this.selectLoad.bind(this)}
          onSelect={this.onSelect}
          appId={this.appId}
          proc={this.proc}
          selected={this.state.selected}
        />
      </div>
    );
  }
}
