/*
For more information about service providers, visit:
- https://manual.os-js.org/v3/tutorial/provider/
- https://manual.os-js.org/v3/guide/provider/
- https://manual.os-js.org/v3/development/
*/
class WebSocketServiceProvider {

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
    this.userSocketArray = {};
  }

  /**
   * A list of services this provider can create
   * @desc Used for resolving a dependency graph
   * @return {string[]}
   */
  provides() {
    return [
      'oxzion/websockets'
    ];
  }

  /**
   * Initializes provider
   */
  async init() {
    this.core.singleton('oxzion/websockets', () => new WebSocket());
  }

  /**
   * Starts provider
   */
   start() {
    const {app, session, configuration} = this.core;
    this.core.on("storeUserInfo", (ws,msg) => {
      if(this.userSocketArray[msg['id']]){
        this.userSocketArray[msg['id']].push(ws);
      } else {
        this.userSocketArray[msg['id']] = [];
        this.userSocketArray[msg['id']].push(ws);
      }
      console.log(msg['id']);
    });
    app.ws('/notification', (ws, req) => {
      ws.on('message', msg => {
        var parsedMessage = JSON.parse(msg);
        if(this.userSocketArray[parsedMessage['userid']]){

          // to remove web sockets that are already closed.
          for (let i = 0; i < this.userSocketArray[parsedMessage['userid']].length; i++) {
            const element = this.userSocketArray[parsedMessage['userid']][i];
            if(element.readyState == 3) {
              this.userSocketArray[parsedMessage['userid']].splice(i,1);
            }
          }

          for (let i = 0; i < this.userSocketArray[parsedMessage['userid']].length; i++) {
            const element = this.userSocketArray[parsedMessage['userid']][i];
            var parameterArray = [];
            Object.keys(parsedMessage).forEach(function(key) {
              var obj = {};
              obj[key] = parsedMessage[key];
              parameterArray.push(obj);
            });
            var packet = {name:"notification",params:parameterArray};
            try {
              element.send(JSON.stringify(packet));
            } catch (Exception){
              console.log(Exception);
            }
          }
        }
      });
    });
  }

  /**
   * Destroys provider
   */
  destroy() {
  }




}

module.exports = WebSocketServiceProvider;