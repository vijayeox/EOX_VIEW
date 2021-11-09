import { ServiceProvider } from "@osjs/common";

export class BosAdapter extends ServiceProvider {
  constructor(core, options = {}) {
    super(core, options || {});
    this.core = core;
    this.metadata = [];
  }

  providers() {
    return ["oxzion/core"];
  }

  async init() {
    this.core.on("osjs/core:started", () => {
      document.body.classList.add("osjs-root");
      var queryString = window.location.search.substr(1);
      if (queryString) {
        var queryObj = queryString
          .split("&")
          .reduce(function(prev, curr, i, arr) {
            var p = curr.split("=");
            prev[decodeURIComponent(p[0])] = decodeURIComponent(p[1]);
            return prev;
          }, {});
        var appName = queryObj.app;
        var userDetails = this.core.make("oxzion/profile").get();
        if (!(appName in userDetails.key.blackListedApps)) {
          this.core
            .request(this.core.config("packages.manifest"), {}, "json")
            .then(metadata => {
              this.addPackages(metadata);
              this.launch(queryObj);
            })
            .catch(error => console.error(error));
        }
      }
    });

    this.core.on("osjs/core:started", () => {
      var userDetails = this.core.make("oxzion/profile").get();
      var myDate = new Date();
      var hrs = myDate.getHours();
      var greet;
      if (hrs < 12) greet = "Good Morning";
      else if (hrs >= 12 && hrs <= 17) greet = "Good Afternoon";
      else if (hrs >= 17 && hrs <= 24) greet = "Good Evening";
      //console.log(this.core.make('oxzion/profile').get().UserInfo();
      if (userDetails["key"]["preferences"]["Greetingmessage"] == "true")
      {
      this.core.make("osjs/notification", {
        timeout: 10000,
        icon: userDetails["key"]["icon"],
        title: "Welcome to EOS!",
        message:
          "Hello and " + greet + " " + userDetails["key"]["firstname"] + "!"
      });
     }
    });

    this.core.on("oxzion/application:launch", params => {
      if (params.app) {
        this.core
          .make("osjs/packages")
          .launch(
            params.app,
            params.args ? params.args : {},
            params.options ? params.options : {}
          );
      }
    });
  }

  addPackages(list) {
    if (list instanceof Array) {
      const append = list.map(iter =>
        Object.assign(
          {
            type: "application"
          },
          iter
        )
      );
      this.metadata = [...this.metadata, ...append];
    }
  }

  launch(app) {
    var found = this.metadata.find(pkg => pkg.name === app.app);
    if (found != "undefined" && found != undefined) {
      var appName = app.app;
      var params = app;
      delete params.app;
      if (app.params) {
        params = app.params;
      }
      if (app.args) {
        params = app.args;
      }
      this.core
        .make("osjs/packages")
        .launch(appName, params, app.options ? app.options : {});
    }
  }
}
