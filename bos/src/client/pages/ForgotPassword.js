import React from "react";
import oxLogo from "../assets/images/eox.png";
import wallpaper from "../assets/images/wallpaper.png";

class ForgotPassword extends React.Component {
  constructor(props) {
    super(props);
    this.core = this.props.core;
    this.state = { showMessage: undefined };
    this.triggerSubmit = this.triggerSubmit.bind(this);
  }

  triggerSubmit() {
    var username = document.getElementById("username").value;
    if (username.length == 0) {
      this.setState({ showMessage: "Please enter your Username" });
      document.getElementById("usernameError").style.color = "red";
    } else {
      document.getElementById("usernameError").style.color = "green";
      const baseUrl = this.core.config("wrapper.url", {});
      var reqData = new FormData();
      reqData.append("username", username);
      var request = new XMLHttpRequest();
      request.open("POST", baseUrl + "user/me/forgotpassword", false);
      request.send(reqData);
      if (request.status === 200) {
        const resp = JSON.parse(request.responseText);
        if (resp.status == "success") {
          this.setState({
            showMessage:
              "If account exists, an email will be sent with further instructions",
          });
        }
        setTimeout(function () {
          window.location.href = window.location.origin;
        }, 2000);
      } else {
        this.setState({
          showMessage:
            "If account exists, an email will be sent with further instructions",
        });
        setTimeout(function () {
          window.location.href = window.location.origin;
        }, 2000);
      }
    }
  }

  render() {
    return (
      <main
        id="login-container "
        className="loginContainer row lighten-3 "
        style={{ flexDirection: "row-reverse" }}
      >
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
        <div id="ox-login-form" className="form-wrapper">
          <div
            className="form-wrapper__inner"
            id="loginPage"
            style={{ display: "block" }}
          >
            <form className="ox-form ">
              <div id="ox-img" className="ox-imgDiv">
                <img id="ox-logo" className="ox-img" src={oxLogo} />
              </div>
              <div className="ox-forgotPWText">
                <h4>Recover Password</h4>
                <h6>Don't worry. It happens to the best of us.</h6>
              </div>

              <div className="floating-label">
                <input
                  type="text"
                  name="username"
                  className="validate"
                  id="username"
                  placeholder="Username"
                />
                <label htmlFor="username">Username</label>
              </div>
              <div
                className="osjs-login-error"
                style={{ display: this.state.showMessage ? "block" : "none" }}
              >
                <span id="usernameError" style={{ color: "green" }}>
                  {this.state.showMessage}
                </span>
              </div>
              <div className="form-signin__footer">
                <button
                  type="button"
                  value="Submit"
                  className="btn waves-effect waves-light"
                  onClick={this.triggerSubmit}
                >
                  Email me a recovery link
                </button>
                <button
                  type="button"
                  className="btn waves-effect waves-light"
                  onClick={() => this.props.showLoginPage()}
                >
                  Go Back
                </button>
              </div>
            </form>
          </div>
          <div className="footer-links">
            <a href="https://www.eoxvantage.com">About Us</a>
          </div>
        </div>
      </main>
    );
  }
}

export default ForgotPassword;
