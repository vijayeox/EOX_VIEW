/*
For more information about authentication adapters, visit:
- https://manual.os-js.org/v3/tutorial/auth/
- https://manual.os-js.org/v3/guide/auth/
- https://manual.os-js.org/v3/development/
*/

import LocalStorageAdapter from "./localStorageAdapter.js";

const loginAdapter = (core, config) => ({
  login: async (req, res) => {
    const splash = core.make("oxzion/splash");
    const helper = core.make("oxzion/restClient");
    core.on("osjs/core:boot", () => splash.show());
    core.on("osjs/core:booted", () => splash.destroy());
    core.on("osjs/core:logged-in", () => splash.show());
    core.on("osjs/core:started", () => splash.destroy());
    localStorage.clear();
    localStorage.removeItem("userInfo");
    let response = await core.request(
      "/login",
      {
        method: "POST",
        body: JSON.stringify({
          username: req.username,
          password: req.password,
        }),
      },
      "json"
    );
    var lsHelper = new LocalStorageAdapter();
    if (
      (lsHelper.supported() || lsHelper.cookieEnabled()) &&
      response["jwt"] != null
    ) {
      lsHelper.purge("AUTH_token");
      lsHelper.purge("REFRESH_token");
      lsHelper.purge("User");
      lsHelper.purge("UserInfo");
      lsHelper.purge("Metadata");
      lsHelper.purge("osjs/session");
      lsHelper.purge("osjs/locale");
      lsHelper.purge("osjs/desktop");
      lsHelper.set("AUTH_token", response["jwt"]);
      lsHelper.set("REFRESH_token", response["refresh_token"]);
      lsHelper.set("User", req.username);
      let user = {
        jwt: response["jwt"],
        refresh_token: response["refresh_token"],
        username: req.username,
      };
      core.setUser(user);

      let userSession = await helper.request("v1", "/user/me", {}, "GET");

      //If a request is made for the user's cache to be cleared, then this function will be triggered and cache will be cleared from the browser
      if (userSession["data"]["cleared_browser_cache"] == 1) {
        // clearCacheData();
        caches.keys().then((names) => {
          names.forEach((name) => {
            caches.delete(name);
          });
        });
        // localStorage.clear();
        // localStorage.setItem("version", packageJson.version);
        // window.location.reload(true);

        //Update the user cache value to 0
        await helper.request(
          "v1",
          "/user/" + userSession["data"]["id"],
          JSON.stringify({
            cleared_browser_cache: 0,
          }),
          "PUT"
        );
      }

      return Promise.resolve(user);
    } else {
      console.log("login failed.");
      return Promise.reject(new Error(res.message));
    }
  },

  logout: (req, res) => {
    var lsHelper = new LocalStorageAdapter();
    if (lsHelper.supported() || lsHelper.cookieEnabled()) {
      lsHelper.purge("AUTH_token");
      lsHelper.purge("REFRESH_token");
      lsHelper.purge("User");
      lsHelper.purge("UserInfo");
      lsHelper.purge("Metadata");
      lsHelper.purge("osjs/session");
      lsHelper.purge("osjs/locale");
      lsHelper.purge("osjs/desktop");
      localStorage.removeItem("userInfo");
      return Promise.resolve(true);
    }
  },
});

export default loginAdapter;
