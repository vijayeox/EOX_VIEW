import osjs from "osjs";
import { name as applicationName } from "./metadata.json";
import { icon_white } from "./metadata.json";
import Slider from "./slider.js";
import Body from "./body.js";
import { React, ReactDOM } from "oxziongui";

var i, finalposition, finalDimension, finalMaximised, finalMinimised;
// Our launcher
const register = (core, args, options, metadata) => {
  // Create a new Application instance
  const proc = core.make("osjs/application", { args, options, metadata });
  let tray = null;
  let dashboardUUID = ""    // add the UUID string here 
  let trayInitialized = false;
  // Create  a new Window instance
  let session = core.make("osjs/settings").get("osjs/session");
  let sessions = Object.entries(session);
  for (i = 0; i < sessions.length; i++) {
    if (
      Object.keys(session[i].windows).length &&
      session[i].name == "Profile"
    ) {
      finalposition = session[i].windows[0].position;
      finalDimension = session[i].windows[0].dimension;
      finalMaximised = session[i].windows[0].maximized;
      finalMinimised = session[i].windows[0].minimized;
    }
  }
  const createProcWindow = () => {
    var win = proc
      .createWindow({
        id: "profileWindow",
        title: metadata.title.en_EN,
        icon: proc.resource(icon_white),
        attributes: {
          classNames: ["Window_" + metadata.name],
          dimension: finalDimension ? finalDimension : {
            width: 900,
            height: 570
          },
          minDimension: {
            width: 900,
            height: 570
          },
          position: finalposition ? finalposition : {
            left: 150,
            top: 50
          },
          visibility: "restricted",
          closeable: true
        }
          
      })
      .render($content => ReactDOM.render(<Body args={core} dashboardUUID={dashboardUUID} proc={proc}/>, $content))    // pass it directly to the component you create
      if(finalMinimised){
        win.minimize(); 
      }
      if(finalMaximised){
        win.maximize();
      }
  };
  createProcWindow(proc);
  return proc;
};
// Creates the internal callback function when OS.js launches an application
osjs.register(applicationName, register);
