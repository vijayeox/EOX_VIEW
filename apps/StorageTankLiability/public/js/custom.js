$(".form")
  .find("input, textarea")
  .on("keyup blur focus", function (e) {
    var $this = $(this),
      label = $this.prev("label");

    if (e.type === "keyup") {
      if ($this.val() === "") {
        label.removeClass("active highlight");
      } else {
        label.addClass("active highlight");
      }
    } else if (e.type === "blur") {
      if ($this.val() === "") {
        label.removeClass("active highlight");
      } else {
        label.removeClass("highlight");
      }
    } else if (e.type === "focus") {
      if ($this.val() === "") {
        label.removeClass("highlight");
      } else if ($this.val() !== "") {
        label.addClass("highlight");
      }
    }
  });

$(".tab a").on("click", function (e) {
  e.preventDefault();

  $(this).parent().addClass("active");
  $(this).parent().siblings().removeClass("active");

  target = $(this).attr("href");

  $(".tab-content > div").not(target).hide();

  $(target).fadeIn(600);
});

document.addEventListener("DOMContentLoaded", function () {
  $("#username_field").keyup(function (e) {
    if (e.keyCode === 13) {
      loginAction();
    }
  });

  $("#password_field").keyup(function (e) {
    if (e.keyCode === 13) {
      loginAction();
    }
  });

  $(".loginButton").on("click", function (e) {
    loginAction();
  });

  $(".resetPassword").on("click", function (e) {
    forgotPassword();
  });

  function loginAction() {
    var username = document.getElementById("username_field").value;
    var password = document.getElementById("password_field").value;
    if (username && password) {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);
      let response = fetch(baseUrl + "auth", {
        body: formData,
        method: "POST",
        mode: "cors",
      }).then((response) => {
        return response.json();
      });
      response.then((res) => {
        if (res.status == "success") {
          autoLogin(res.data);
        } else {
          Swal.fire({
            title: "Login Failed",
            html: '<div style="font-size: 17px">The Username and/or password is incorrect!  <br /> Please try again.</div>',
            icon: "error",
            confirmButtonText: "Forgot Password ?",
            showCancelButton: true,
          }).then((result) => {
            if (result.value == true) {
              forgotPassword();
            }
          });
          // document.getElementById("wrongPassword").style.display = "block";
        }
      });
    } else {
      Swal.fire({
        // position: "top-end",
        icon: "warning",
        title:
          "Please enter your " +
          (username ? "" : "username") +
          (!username && !password ? " and " : "") +
          (password ? "" : "password") +
          ".",
        showConfirmButton: false,
        timer: 2200,
      });
    }
  }

  function forgotPassword() {
    Swal.fire({
      title: "Please enter your Username",
      input: "text",
      inputAttributes: {
        autocapitalize: "off",
      },
      inputValidator: (value) => {
        if (!value) {
          return "Please enter your Username!";
        }
      },
      confirmButtonText: "Confirm",
      showCancelButton: true,
      showLoaderOnConfirm: true,
      preConfirm: (login) => {
        let formData = new FormData();
        formData.append("username", login);
        return fetch(baseUrl + "user/me/forgotpassword", {
          method: "post",
          body: formData,
        })
          .then((response) => {
            if (response.status == 417) {
              Swal.showValidationMessage(
                `We do not have an email on your account.<br/>Contact Us:Helpline Ph: +1 216-452-0324 | Email: padi-professionals@hubinternational.com`
              );
              return;
            }
            if (!response.ok) {
              throw new Error(response.statusText);
            }
            return response.json();
          })
          .catch((error) => {
            Swal.showValidationMessage(`Request failed: Username not found.`);
          });
      },
    }).then((result) => {
      if (result.value.status == "success") {
        Swal.fire({
          position: "top-end",
          icon: "success",
          title:
            "Verification Mail has been sent to " + result.value.data.email,
          showConfirmButton: false,
          timer: 2100,
        });
      } else {
        Swal.showValidationMessage(`Request failed: Username not found.`);
      }
    });
  }

  function autoLogin(data) {
    localStorage.clear();
    localStorage.setItem(
      "User",
      JSON.stringify({ key: data.username, timestamp: new Date() })
    );
    localStorage.setItem(
      "AUTH_token",
      JSON.stringify({ key: data.jwt, timestamp: new Date() })
    );
    localStorage.setItem(
      "REFRESH_token",
      JSON.stringify({ key: data.refresh_token, timestamp: new Date() })
    );
    window.location.href = window.location.origin;
  }

  function submitForm(submission, next) {
    submission.data.app_id = appId;
    submission.data.accountId = accountId;
    submission.data.preferences = JSON.stringify({
      timezone: moment.tz.guess(),
    });
    var response = fetch(baseUrl + "register", {
      body: JSON.stringify(submission.data),
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
      mode: "cors",
    }).then((response) => {
      return response.json();
    });
    response.then((res) => {
      if (res.status == "success") {
        form.emit("submitDone", submission);
        setTimeout(() => {
          autoLogin(res.data);
        }, 500);
      } else {
        Swal.fire({
          icon: "error",
          title: "Submission Failed",
          text: res.message,
        }).then(form.emit("error", submission));
      }
    });
  }

  Formio.createForm(
    document.getElementById("formio"),
    JSON.parse(formContent),
    {
      noAlerts: true,
      hooks: {
        beforeSubmit: (submission, next) => submitForm(submission, next),
      },
    }
  ).then(function (form) {
    // Prevent the submission from going to the form.io server.
    form.nosubmit = true;

    setTimeout(function () {
      var padiField = $("input[name='data[padi]']");
      padiField.keyup(function (e) {
        if (e.keyCode === 13) {
          $("button[name='data[validatePADIButton]']").trigger("click");
        }
      });
    }, 500);

    form.on("submit", function (submission, next) {
      submission.data.app_id = appId;
      submission.data.preferences = JSON.stringify({
        timezone: moment.tz.guess(),
      });
      var response = fetch(baseUrl + "register", {
        body: JSON.stringify(submission.data),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
        mode: "cors",
      }).then((response) => {
        return response.json();
      });
      response.then((res) => {
        if (res.status == "success") {
          form.emit("submitDone", submission);
          setTimeout(() => {
            autoLogin(res.data);
          }, 500);
        } else {
          Swal.fire({
            icon: "error",
            title: "Submission Failed",
            text: res.message,
          }).then(form.emit("error", submission));
        }
      });
    });
    form.on("customEvent", function (event) {
      console.log(event);
      var changed = event.data;
      if (event.type == "callDelegate") {
        var component = form.getComponent(event.target.id);
        if (component) {
          var component = event.component;
          if (properties) {
            if (properties["delegate"]) {
              if (properties["padiType"]) {
                changed["padiType"] = properties["padiType"]
                  ? properties["padiType"]
                  : null;
              }
              $.ajax({
                type: "POST",
                async: false,
                url:
                  baseUrl +
                  "app/" +
                  appId +
                  "/delegate/" +
                  properties["delegate"],
                data: changed,
                success: function (response) {
                  if (response.data) {
                    form.setSubmission({ data: response.data });
                    form.triggerChange();
                  }
                },
              });
            }
          }
        }
      }
      if (event.type == "callCommands") {
        var component = event.component;
        if (component) {
          var properties = component.properties;
          if (properties) {
            if (properties["commands"]) {
              $.ajax({
                type: "POST",
                async: false,
                url:
                  baseUrl +
                  "app/" +
                  appId +
                  "/commands?" +
                  $.param(JSON.parse(properties["commands"])),
                data: changed,
                success: function (response) {
                  if (response.data) {
                    console.log(response.data);
                    form
                      .setSubmission({ data: response.data })
                      .then((response2) => {
                        console.log(form.submission);
                      });
                    console.log(form.submission);
                    // form.triggerChange();
                  }
                },
              });
            }
          }
        }
      }
    });
    form.on("change", (changed) => {
      if (changed && changed.changed) {
        var component = changed.changed.component;
        var properties = component.properties;
        console.log(changed);
        if (properties) {
          if (properties["delegate"]) {
            $.ajax({
              type: "POST",
              async: true,
              url:
                baseUrl +
                "app/" +
                appId +
                "/delegate/" +
                properties["delegate"],
              data: changed.data,
              success: function (response) {
                if (response.data) {
                  form.submission = { data: response.data };
                  form.triggerChange();
                }
              },
            });
          }
          if (properties["clear_field"]) {
            var targetComponent = form.getComponent(properties["clear_field"]);
            if (targetComponent) {
              targetComponent.setValue("");
            }
          }
        }
      }
    });
  });
});
