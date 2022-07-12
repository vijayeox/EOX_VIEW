import { ServiceProvider } from "@osjs/common";
import LocalStorageAdapter from "./localStorageAdapter.js";

export class UserSessionServiceProvider extends ServiceProvider {
  constructor(core, options = {}) {
    super(core, options || {});
    this.core = core;
    core.on("osjs/core:logged-in", () => this.get());
  }

  providers() {
    return ["oxzion/usersession"];
  }

  init() {
    this.core.instance("oxzion/usersession", () => ({
      get: () => this.get(),
      set: () => this.setUserSession(),
    }));
    this.lsHelper = new LocalStorageAdapter();
  }

  async get() {
    let helper = this.core.make("oxzion/restClient");
    let session = await helper.request("v1", "/user/me/getsession", {}, "get");
    this.core
      .make("osjs/settings")
      .set("osjs/session", null, session["data"])
      .save();

    let userSession = await helper.request("v1", "/user/me", {}, "GET");
    if (userSession?.data?.cleared_browser_cache == 1) {
      // clearCacheData();
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name);
        });
      });

      this.lsHelper.supported();

      this.lsHelper.purge("UserInfo");
      this.lsHelper.purge("Metadata");

      // this.core.make("oxzion/profile").set();
      // this.core.make("oxzion/profile").getMetadata();

      localStorage.setItem("version", "New");
      window.location.reload(true);

      // Update the user cache value to 0
      await helper.request(
        "v1",
        "/user/" + userSession?.data?.id,
        JSON.stringify({
          cleared_browser_cache: 0,
        }),
        "PUT"
      );
    }
  }

  async setUserSession() {
    let session = this.core.make("osjs/settings").get("osjs/session");
    let helper = this.core.make("oxzion/restClient");
    let updatesession = await helper.request(
      "v1",
      "/user/me/updatesession",
      { data: JSON.stringify(session) },
      "post"
    );
  }
}
