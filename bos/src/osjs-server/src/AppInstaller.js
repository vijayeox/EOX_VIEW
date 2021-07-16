const { execSync } = require("child_process");
const fs = require("fs-extra");

/**
 * Authentication Handler
 */
class AppInstaller {
  /**
   * Creates a new instance
   * @param {Core} core Core instance reference
   * @param {Object} [options={}] Service Provider arguments
   */
  constructor(core, options = {}) {
    const { requiredGroups, denyUsers } = core.configuration.auth;
    console.log(requiredGroups);
    console.log(denyUsers);
  }

  /**
   * Initializes adapter
   */
  async init() {
    return true;
  }

  /**
   * Executes Commands
   * @param {String} path File System Path
   * @param {String} command Shell Command
   */

  async runCommand(path, command) {
    try {
      return execSync(command, { cwd: path, encoding: "utf8" });
    } catch (error) {
      return false;
    }
  }

  /**
   * Runs Commands Executer
   * @param {Object} req HTTP request
   * @param {Object} res HTTP response
   */
  async execute(req, res) {
    if (fs.existsSync(req.body.path)) {
      try {
        this.runCommand(req.body.path, req.body.command).then((result) => {
          result
            ? res.json({
              status: "Success",
              output: result
            })
            : res.status(500).json({
              status: "Failed"
            });
        });
      } catch (error) {
        res.status(500).json({
          status: "Failed",
          output: error
        });
      }
    } else {
      res.status(404).json({
        status: "Failed",
        error:
          "Folder -> " + req.body.path + ' does not exist in ' + process.cwd()
      });
    }
  }

  /**
   * Runs App Installer
   * @param {Object} req HTTP request
   * @param {Object} res HTTP response
   */
  async build(req, res) {
    if (req.body.folders) {
      var outputResult = [];
      await Promise.all(
        req.body.folders.map((i, index) => {
          var execCommand = "";
          console.log("Building " + i.path);
          switch (i.type) {
            case "app":
              execCommand = "npm install && npm run build";
              break;
            case "theme":
              execCommand = "npm install && npm run build";
              break;
            case "gui":
              execCommand = "npm install";
              break;
            case "bos":
              execCommand = "npm run package:discover";
              break;
            default:
              execCommand = "npm install && npm run build";
              break;
          }
          this.runCommand(i.path, execCommand).then((result) => {
            outputResult.push(index + 1 + ") \n" + result + "\n");
          });
        })
      );
      res.json({
        status: "Success",
        output: outputResult
      });
    } else {
      res.status(400).json({
        status: "Failed",
        error: "Folders not defined."
      });
    }
  }
}

module.exports = AppInstaller;

// Sample Install
// {
//     "folders": [
//         {
//             "path": "apps/Admin",
//             "type": "app"
//         },
//         {
//             "path": "gui/src",
//             "type": "gui"
//         },
//         {
//             "path": "themes/Vision",
//             "type": "theme"
//         }
//     ]
// }

// Sample Execute
// {
//     "path": "apps/Admin",
//     "command": "which npm"
// }
