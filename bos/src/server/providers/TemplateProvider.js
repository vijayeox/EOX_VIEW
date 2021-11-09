/*
For more information about service providers, visit:
- https://manual.os-js.org/v3/tutorial/provider/
- https://manual.os-js.org/v3/guide/provider/
- https://manual.os-js.org/v3/development/
*/

const path = require('path');
const fs = require('fs');

class TemplateProvider {

  /**
   * Constructor
   * @param {Core} core Core reference
   */
  constructor(core, options = {}) {
    /**
     * Core instance reference
     * @type {Core}
     */
    this.core = core;
    this.options = options;
  }

  /**
   * A list of services this provider can create
   * @desc Used for resolving a dependency graph
   * @return {string[]}
   */
  provides() {
    return [
      'oxzion/TemplateProvider'
    ];
  }

  /**
   * Initializes provider
   */
  async init() {
  }

  /**
   * Starts provider
   */
   start() {
    this.core.app.post('/template', (req, res) => {
      var template = req.body.template
      var organisation = req.body.organisation
      var filePath = path.join(__dirname+'/../public/'+organisation+'/'+template+'.html');
      if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
      } else {
        res.json({error:'No template found'})
      }
    });
  }

  /**
   * Destroys provider
   */
  destroy() {

  }
}

module.exports = TemplateProvider;