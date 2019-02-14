import osjs from "osjs";
import { name as applicationName } from "./metadata.json";
import React from "react";
import ReactDOM from "react-dom";
import { icon } from "./metadata.json";
import Dash from "./Dash";

// Our launcher
const register = (core, args, options, metadata) => {
  // Create a new Application instance
  const proc = core.make("osjs/application", { args, options, metadata });

  // Create  a new Window instance
  proc
    .createWindow({
      id: "OXAdminWindow",
      title: metadata.title.en_EN,
      dimension: { width: 650, height: 510 },
      position: { left: 200, top: 50 }
    })
    .on("destroy", () => proc.destroy())
    .render($content => ReactDOM.render(<Dash args={core} />, $content));

  return proc;
};

osjs.register(applicationName, register);
