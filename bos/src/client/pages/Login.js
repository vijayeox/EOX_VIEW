import { Login as defaultLogin } from "../../osjs-client/index.js";
import "../assets/scss/login.scss";
import React from "react";
import ReactDOM from "react-dom";
import oxLogo from "../assets/images/eox.png";
import wallpaper from "../assets/images/wallpaper.png";
import AnnouncementIcon from "../assets/images/icon_white.svg";
import ForgotPassword from "./ForgotPassword.js";
import ResetPasswordPage from "./ResetPasswordPage.js";
import Slider from "./Slider.js";
import LocalStorageAdapter from "../adapters/localStorageAdapter.js";

export default class LoginContainer extends defaultLogin {
  render() {
    var node = document.createElement("div");
    node.className = "reactLoginPage";
    document.body.appendChild(node);
    const b = ReactDOM.render(
      <Login
        core={this.core}
        triggerSubmit={(values) => {
          this.emit("login:post", values);
        }}
      />,
      document.getElementsByClassName("reactLoginPage")[0]
    );
    this.on("login:stop", () => {
      let AuthToken = this.core.make("oxzion/profile").getAuth();
      if (AuthToken) {
        ReactDOM.unmountComponentAtNode(
          document.getElementsByClassName("reactLoginPage")[0]
        );
      }
    });
    this.on("login:error", (err) => {
      let ev = new CustomEvent("loginMessage", {
        detail: err,
        bubbles: true,
      });
      document.getElementById("ox-login-form").dispatchEvent(ev);
    });
  }
}

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.core = this.props.core;
    this.state = {
      showPage: "login",
      error: false,
      username: "",
      password: "",
      resetPasswordToken: "",
    };
    this.handleChange = this.handleChange.bind(this);
    this.loginAction = this.loginAction.bind(this);
    this.errorMessage = this.errorMessage.bind(this);
  }

  componentDidMount() {
    var queryObj = window.location.search.substr(1);
    queryObj = queryObj.split("&").reduce(function (prev, curr) {
      var p = curr.split("=");
      prev[decodeURIComponent(p[0])] = decodeURIComponent(p[1]);
      return prev;
    }, {});
    queryObj.resetpassword
      ? this.setState({
          showPage: "resetpassword",
          resetPasswordToken: queryObj.resetpassword,
        })
      : null;
    document
      .getElementById("ox-login-form")
      .addEventListener("loginMessage", this.errorMessage, false);
  }

  errorMessage(e) {
    this.setState({ error: e.detail });
  }

  handleChange(e) {
    let target = e.target;
    this.setState({ [target.name]: target.value });
  }

  loginAction(e) {
    e.preventDefault();
    var loginDetails = {
      username: this.state.username,
      password: this.state.password,
    };
    this.props.triggerSubmit(loginDetails);
  }

  render() {
    if (this.state.showPage == "resetpassword") {
      return (
        <ResetPasswordPage
          core={this.core}
          resetPasswordToken={this.state.resetPasswordToken}
          showLoginPage={() => this.setState({ showPage: "login" })}
        />
      );
    } else if (this.state.showPage == "forgotpassword") {
      return (
        <ForgotPassword
          core={this.core}
          showLoginPage={() => this.setState({ showPage: "login" })}
        />
      );
    } else {
      return (
        <main id="login-container " className="loginContainer row lighten-3 ">
           <img
          src={wallpaper}
          alt="EOX Vantage"
          style={{
            position: "absolute",
            width: "100vw",
            height: "135vh",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
          }}
        />
          <div
            className="loginSlider col-8"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Slider core={this.core} />
          </div>
          <div id="ox-login-form" className="col-4">
            <div
              className="form-wrapper__inner"
              id="loginPage"
              style={{ display: "block" }}
            >
              <form
                className="ox-form "
                method="post"
                onSubmit={this.loginAction}
              >
                <div id="ox-img" className="ox-imgDiv">
                  <img id="ox-logo" className="ox-img" src={oxLogo} />
                </div>
                <div className="floating-label">
                  <input
                    type="text"
                    name="username"
                    className="validate"
                    id="username"
                    placeholder="Username"
                    value={this.state.username}
                    onChange={this.handleChange}
                  />
                  <label htmlFor="username">Username</label>
                </div>
                <div className="floating-label">
                  <input
                    type="password"
                    name="password"
                    className="validate"
                    id="password"
                    placeholder="Password"
                    value={this.state.password}
                    onChange={this.handleChange}
                  />
                  <label htmlFor="password">Password</label>
                </div>
                <div className="form-signin__footer">
                  <button
                    type="submit"
                    value="login"
                    className="btn waves-effect waves-light"
                  >
                    Login
                  </button>
                  <a
                    href="#"
                    onClick={() =>
                      this.setState({ showPage: "forgotpassword" })
                    }
                  >
                    Forgot your password?
                  </a>
                </div>
              </form>
              <div
                className="osjs-login-error"
                style={{ display: this.state.error ? "block" : "none" }}
              >
                <span>
                  The username and/or password is incorrect! Please try again.
                </span>
              </div>
            </div>
            <footer className="footer-links">
              <a href="https://www.eoxvantage.com">About Us</a> &nbsp;&nbsp; |
              &nbsp;&nbsp;
              <a href="./privacy-policy" target="_blank">
                Privacy Policy
              </a>
              <div className="coppyRight">
                Copyright © 2004-{new Date().getFullYear()} EOX Vantage. All rights reserved.
              </div>
            </footer>
          </div>
        </main>
      );
    }
  }
}
