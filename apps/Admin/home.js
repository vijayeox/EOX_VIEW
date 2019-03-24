import React from "react";
import ReactDOM from "react-dom";

import "jquery/dist/jquery.js";
import $ from "jquery";

import Organization from "./modules/Organization";
import Project from "./modules/Project";
import User from "./modules/User";
import Group from "./modules/Group";
import Role from "./modules/Roles";
import Announcement from "./modules/Announcement";
import Application from "./modules/Application";

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.core = this.props.args;
    this.state = {
      value: "6"
    };
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    M.AutoInit();

    $(document).ready(function () {
      $("#componentsBox").hide();

      $(document).on("click", ".moduleBtn", function () {
        $(".DashBG").fadeOut(),
          $("#componentsBox").show();
      });

      $(document).on("click", ".goBack", function () {
        $("#componentsBox").hide(), $(".DashBG").show();
      });
    });
  }

  handleChange(event) {
    this.setState({
      value: event.target.value
    });
  }

  createBlock = () => {
    let table = [];

    if (this.state.value == 1) {
      table.push(
        <div key="1" style={{ display: "inline-grid" }}>
          <div className="block d1" onClick={this.orgClick}>
            <img src="apps/Admin/org.svg" className="moduleBtn App-logo" />
          </div>
          <div className="titles">Organization</div>
        </div>
      );
    } else if (this.state.value == 2) {
      table.push(
        <div key="2">
          <div style={{ display: "inline-grid" }}>
            <div className="block d1" onClick={this.orgClick}>
              <img src="apps/Admin/org.svg" className="moduleBtn App-logo" />
            </div>
            <div className="titles">Organization</div>
          </div>

          <div style={{ display: "inline-grid" }}>
            <div className="block d1" onClick={this.groupClick}>
              <img
                src="apps/Admin/group.svg"
                className="moduleBtn App-logo"
              />
            </div>
            <div className="titles">Groups</div>
          </div>
        </div>
      );
    } else if (this.state.value == 4) {
      table.push(
        <div key="4" >
          <div style={{ display: "inline-grid" }}>
            <div className="block d1" onClick={this.orgClick}>
              <img src="apps/Admin/org.svg" className="moduleBtn App-logo" />
            </div>
            <div className="titles">Organization</div>
          </div>

          <div style={{ display: "inline-grid" }}>
            <div className="block d1" onClick={this.groupClick}>
              <img
                src="apps/Admin/group.svg"
                className="moduleBtn App-logo"
              />
            </div>
            <div className="titles">Groups</div>
          </div>

          <div style={{ display: "inline-grid" }}>
            <div className="block d1" onClick={this.prjClick} >
              <img
                src="apps/Admin/101-project.svg"
                className="moduleBtn App-logo"
              />
            </div>
            <div className="titles">Projects</div>
          </div>

          <div style={{ display: "inline-grid" }}>
            <div className="block d1" onClick={this.userClick}>
              <img
                src="apps/Admin/115-manager.svg"
                className="moduleBtn App-logo"
              />
            </div>
            <div className="titles">Users</div>
          </div>
        </div>
      );
    } else if (this.state.value == 5) {
      table.push(
        <div key="5">
          <div style={{ display: "inline-grid" }}>
            <div className="block d1" onClick={this.orgClick}>
              <img src="apps/Admin/org.svg" className="moduleBtn App-logo" />
            </div>
            <div className="titles">Organization</div>
          </div>

          <div style={{ display: "inline-grid" }}>
            <div className="block d1" onClick={this.groupClick}>
              <img
                src="apps/Admin/group.svg"
                className="moduleBtn App-logo"
              />
            </div>
            <div className="titles">Groups</div>
          </div>

          <div style={{ display: "inline-grid" }}>
            <div className="block d1" onClick={this.prjClick}>
              <img
                src="apps/Admin/101-project.svg"
                className="moduleBtn App-logo"
              />
            </div>
            <div className="titles">Projects</div>
          </div>

          <div style={{ display: "inline-grid" }}>
            <div className="block d1" onClick={this.userClick}>
              <img
                src="apps/Admin/115-manager.svg"
                className="moduleBtn App-logo"
              />
            </div>
            <div className="titles">Users</div>
          </div>
          <div style={{ display: "inline-grid" }}>
            <div className="block d1" onClick={this.roleClick}>
              <img
                src="apps/Admin/005-workflow.svg"
                className="moduleBtn App-logo"
              />
            </div>
            <div className="titles">Roles</div>
          </div>
        </div>
      );
    } else if (this.state.value == 6) {
      table.push(
        <div key="6">
          <div style={{ display: "inline-grid" }}>
            <div className="block d1" onClick={this.orgClick}>
              <img src="apps/Admin/org.svg" className="moduleBtn App-logo" />
            </div>
            <div className="titles">Organization</div>
          </div>

          <div style={{ display: "inline-grid" }}>
            <div className="block d1" onClick={this.groupClick}>
              <img
                src="apps/Admin/group.svg"
                className="moduleBtn App-logo"
              />
            </div>
            <div className="titles">Groups</div>
          </div>

          <div style={{ display: "inline-grid" }}>
            <div className="block d1" onClick={this.prjClick}>
              <img
                src="apps/Admin/101-project.svg"
                className="moduleBtn App-logo"
              />
            </div>
            <div className="titles">Projects</div>
          </div>

          <div style={{ display: "inline-grid" }}>
            <div className="block d1" onClick={this.userClick}>
              <img
                src="apps/Admin/115-manager.svg"
                className="moduleBtn App-logo"
              />
            </div>
            <div className="titles">Users</div>
          </div>
          <div style={{ display: "inline-grid" }}>
            <div className="block d1" onClick={this.roleClick}>
              <img
                src="apps/Admin/005-workflow.svg"
                className="moduleBtn App-logo"
              />
            </div>
            <div className="titles">Roles</div>
          </div>

          <div style={{ display: "inline-grid" }}>
            <div className="block d1" onClick={this.announClick}>
              <img src="apps/Admin/131-laptop.svg"
                className="moduleBtn App-logo"
              />
            </div>
            <div className="titles">Announcements</div>
          </div>

          <div style={{ display: "inline-grid" }}>
            <div className="block d1" onClick={this.appClick}>
              <img src="apps/Admin/102-production.svg"
                className="moduleBtn App-logo"
              />
            </div>
            <div className="titles">Apps</div>
          </div>
        </div>
      );
    }

    return table;
  };


  orgClick = (e) => {
    ReactDOM.render(<Organization args={this.core} unmountMe={this.handleChildUnmount} />, document.getElementById('componentsBox'));
  }

  groupClick = (e) => {
    ReactDOM.render(<Group args={this.core} />, document.getElementById('componentsBox'));
  }

  prjClick = (e) => {
    ReactDOM.render(<Project args={this.core} />, document.getElementById('componentsBox'));
  }

  userClick = (e) => {
    ReactDOM.render(<User args={this.core} />, document.getElementById('componentsBox'));
  }

  roleClick = (e) => {
    ReactDOM.render(<Role args={this.core} />, document.getElementById('componentsBox'));
  }

  announClick = (e) => {
    ReactDOM.render(<Announcement args={this.core} />, document.getElementById('componentsBox'));
  }

  appClick = (e) => {
    ReactDOM.render(<Application args={this.core} />, document.getElementById('componentsBox'));
  }

  render() {
    return (
      <div>
        <div
          className="DashBG"
          style={{
            backgroundImage: "url(apps/Admin/wait.jpg)",
            backgroundSize: "cover"
          }}
        >
          <center>
            <div style={{ height: '-webkit-fill-available', display: 'flex' }} >
              <div className="container">
                {this.createBlock()}
              </div>
            </div>
          </center>
        </div>
        <div id="componentsBox">
        </div>
      </div >
    );
  }
}
export default Home;