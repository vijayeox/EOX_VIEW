import React from "react";
import oxLogo from "../assets/images/eox.png";

class ResetPasswordPage extends React.Component {
  constructor(props) {
    super(props);
    this.core = this.props.core;
    this.state = { showMessage: undefined };
    this.submitAction = this.submitAction.bind(this);
  }

  submitAction() {
    var newPassword = document.getElementById("enterNewPassword").value;
    var reEnterPassword = document.getElementById("reEnterPassword").value;
    var validatePassword = true;
    if (newPassword.length < 8) {
      this.setState({
        showMessage: "Password must contain at least eight characters!"
      });
      validatePassword = false;
    }
    var re = /[0-9]/;
    if (!re.test(newPassword) && validatePassword) {
      this.setState({
        showMessage: "Password must contain at least one number (0-9)!"
      });
      validatePassword = false;
    }

    re = /[a-z]/;
    if (!re.test(newPassword) && validatePassword) {
      this.setState({
        showMessage:
          "Password must contain at least one lowercase letter (a-z)!"
      });
      validatePassword = false;
    }

    re = /[A-Z]/;
    if (!re.test(newPassword) && validatePassword) {
      this.setState({
        showMessage:
          "Password must contain at least one uppercase letter (A-Z)!"
      });
      validatePassword = false;
    }

    re = /[! $ & + , : ; = ? @ # | ' < > . - ^ * ( ) % /]/;
    if (!re.test(newPassword) && validatePassword) {
      this.setState({
        showMessage:
          "Password must contain at least one Special Character($&+,:;=?@#|'<>.-^*()%!)"
      });
      validatePassword = false;
    }

    if (newPassword.localeCompare(reEnterPassword) == 0 && validatePassword) {
      const baseUrl = this.core.config("wrapper.url", {});
      var reqData = new FormData();
      reqData.append("password_reset_code", this.props.resetPasswordToken);
      reqData.append("new_password", newPassword);
      reqData.append("confirm_password", reEnterPassword);
      var request = new XMLHttpRequest();
      request.open("POST", baseUrl + "user/me/resetpassword", false);
      request.send(reqData);
      if (request.status === 200) {
        const resp = JSON.parse(request.responseText);
        if (resp.status == "success") {
          this.setState({ showMessage: "Password Reset Successfully" });
          document.getElementById("resetPasswordError").style.color = "green";
          setTimeout(function () {
            window.location.href = window.location.origin;
          }, 2000);
        }
      } else {
        this.setState({
          showMessage:
            "The password reset link has expired, please try resetting again."
        });
      }
    } else {
      validatePassword
        ? this.setState({ showMessage: "Password mismatch" })
        : null;
    }
  }

  render() {
    return (
      <main id="login-container " className="loginContainer row lighten-3 " style={{flexDirection:"row-reverse"}}>
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
              <div className="floating-label resetPasswordInputField">
                <div className="newPasswordDiv">
                  <input
                    type="password"
                    name="password"
                    className="validate"
                    id="enterNewPassword"
                    placeholder="Enter Password"
                  />
                  <label htmlFor="password">Enter Password</label>
                </div>
                <div className="tooltip infoDiv" id="PasswordValidation">
                  <span className="tooltiptext">
                    <span className="">Password must contain:</span>
                    <br />
                    <span className=""> at least 8 characters</span>
                    <br />
                    <span className="">at least one number (0-9)</span>
                    <br />
                    <span className="">
                      at least one lowercase letter (a-z)
                    </span>
                    <br />
                    <span className="">
                      at least one uppercase letter (A-Z)
                    </span>
                    <br />
                    <span className="">
                      at least one Special
                      Character($&amp;+,:;=?@#|'&gt;.-^*()%!)
                    </span>
                    <br />
                  </span>
                  <span className="passwordRestInfoIcon">ⓘ</span>
                </div>
              </div>
              <div className="floating-label">
                <input
                  type="password"
                  name="password"
                  className="validate"
                  id="reEnterPassword"
                  placeholder="Re-enter Password"
                />
                <label htmlFor="password">Re-Enter Password</label>
              </div>
              <div
                className="osjs-login-error"
                style={{ display: this.state.showMessage ? "block" : "none" }}
              >
                <span id="resetPasswordError">{this.state.showMessage}</span>
              </div>
              <div className="form-signin__footer">
                <button
                  type="button"
                  value="Reset"
                  className="btn waves-effect waves-light"
                  onClick={this.submitAction}
                >
                  Submit
                </button>
                <button
                  type="button"
                  className="btn waves-effect waves-light"
                  onClick={() => this.props.showLoginPage()}
                >
                  Cancel
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

export default ResetPasswordPage;