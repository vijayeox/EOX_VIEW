const { ServiceProvider } = require("@osjs/common");

/**
 * EOX Privacy Policy
 */
class PrivacyPolicyProvider extends ServiceProvider {
  constructor(core, options) {
    super(core, options);
  }

  destroy() {
    super.destroy();
  }

  async init() {
    const { route } = this.core.make("osjs/express");

    route("get", "/privacy-policy", (req, res) => {
      var path = require("path");
      res.sendFile(path.join(__dirname, "../assets/Privacy Policy.html"));
    });
  }
}

module.exports = PrivacyPolicyProvider;
