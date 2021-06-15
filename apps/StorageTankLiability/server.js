require("@babel/register")({
  ignore: [/(node_modules)/],
  presets: ["@babel/env", "@babel/react"],
});
module.exports = (core, proc) => ({
  init: async () => {
    let reactRender = require("./reactRender");
    reactRender(core, proc);
  },

  // When server starts
  start: () => {},

  // When server goes down
  destroy: () => {},

  // When using an internally bound websocket, messages comes here
  onmessage: (ws, respond, args) => {
    respond("Pong");
  },
});
