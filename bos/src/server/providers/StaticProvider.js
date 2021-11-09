/*
For more information about service providers, visit:
- https://manual.os-js.org/v3/tutorial/provider/
- https://manual.os-js.org/v3/guide/provider/
- https://manual.os-js.org/v3/development/
*/

const path = require('path');
const express = require('express');

class StaticProvider {

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
    this.core.app.use('/static', express.static(path.join(__dirname+'/../public')));
  }

  /**
   * A list of services this provider can create
   * @desc Used for resolving a dependency graph
   * @return {string[]}
   */
  provides() {
    return [
      'oxzion/StaticProvider'
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
      res.sendFile(path.join(__dirname+'/../public/'+organisation+'/'+template+'.html'));
      // res.json({result: 'pong'});
    });
  }

  /**
   * Destroys provider
   */
  destroy() {

  }
}

module.exports = StaticProvider;