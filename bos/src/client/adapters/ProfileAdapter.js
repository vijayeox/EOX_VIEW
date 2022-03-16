import { ServiceProvider } from "@osjs/common";
import LocalStorageAdapter from "./localStorageAdapter.js";

export class ProfileServiceProvider extends ServiceProvider {
  constructor(core, options = {}) {
    super(core, options || {});
    this.core = core;
    this.lsHelper = new LocalStorageAdapter();
  }

  providers() {
    return ["oxzion/profile"];
  }

  async init() {
    this.core.instance("oxzion/profile", () => ({
      get: () => this.get(),
      set: () => this.set(),
      update: () => this.update(),
      getAuth: () => this.getAuth(),
      getMetadata: () => this.getMetadata(),
    }));

    //If a request is made for the user's cache to be cleared, then this function will be triggered and cache will be cleared from the browser
    let helper = this.core.make("oxzion/restClient");
    let userSession = await helper.request("v1", "/user/me", {}, "GET");
    if (userSession["data"]["cleared_browser_cache"] == 1) {
      // clearCacheData();
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name);
        });
      });
      localStorage.clear();
      localStorage.setItem("version", "New");
      window.location.reload(true);

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
  }
  get() {
    if (this.lsHelper.supported() || this.lsHelper.cookieEnabled()) {
      if (!this.lsHelper.get("UserInfo")) {
        this.set();
      }
      let userInfo = this.lsHelper.get("UserInfo");
      return userInfo;
    }
  }
  set() {
    if (this.lsHelper.supported() || lsHelper.cookieEnabled()) {
      if (!this.lsHelper.get("UserInfo")) {
        this.getProfile();
      }
    }
  }
  update() {
    if (this.lsHelper.supported() || lsHelper.cookieEnabled()) {
      if (this.lsHelper.get("UserInfo")) {
        this.lsHelper.purge("UserInfo");
        this.lsHelper.purge("Metadata");
        const settings = this.core.make("osjs/settings");
        settings.clear("UserInfo");
      }
    }
    this.set();
    this.core.emit("oxzion/profile:updated");
  }
  getProfile() {
    if (this.lsHelper.supported() || lsHelper.cookieEnabled()) {
      let helper = this.core.make("oxzion/restClient");
      let profileInformation = JSON.parse(helper.profile());
      this.lsHelper.set("UserInfo", profileInformation["data"]);
      const data = this.lsHelper.get("UserInfo");
      const settings = this.core.make("osjs/settings");
      settings.set("UserInfo", "key", data.key);
      settings.set("UserInfo", "timestamp", data.timestamp);
    }
  }
  getMetadata() {
    let metadata = this.lsHelper.get("Metadata");
    if (!metadata) {
      this.core.request(this.core.config("packages.manifest"), {}, "json").then((response) => {
        this.lsHelper.set(
          "Metadata",
          response.map((iter) => ({ type: "application", ...iter }))
        );
      });
    }
    return metadata ? metadata.key : null;
  }
  getAuth() {
    if (this.lsHelper.supported() || lsHelper.cookieEnabled()) {
      if (this.lsHelper.get("AUTH_token")) {
        return this.lsHelper.get("AUTH_token");
      }
    }
  }
}
