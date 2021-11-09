const { ServiceProvider } = require("@osjs/common");
const AppInstaller = require("../AppInstaller.js");

/**
 * EOX Package Installer
 */
class InstallerServiceProvider extends ServiceProvider {
  constructor(core, options) {
    super(core, options);
    this.installer = new AppInstaller(core, options);
  }

  destroy() {
    super.destroy();
  }

  async runCommand(path, command) {
    try {
      return execSync(command, { cwd: path, encoding: "utf8" });
    } catch (error) {
      return false;
    }
  }

  async init() {
    const { route } = this.core.make("osjs/express");

    route("post", "/installer", (req, res) => this.installer.build(req, res));
    route("post", "/execute", (req, res) => this.installer.execute(req, res));

    await this.installer.init();
  }
}

module.exports = InstallerServiceProvider;
