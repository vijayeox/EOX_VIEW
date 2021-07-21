import osjs from "osjs";
// import { name as applicationName } from "./metadata.json";
import adminJson from "./metadata.json";
import {React,ReactDOM} from "oxziongui";
import icon_white from "./metadata.json";
import Home from "./home";

var i, finalposition, finalDimension,finalMaximised,finalMinimised;
// Our launcher
const register = (core, args, options, metadata) => {
  // Create a new Application instance
  const proc = core.make("osjs/application", {
    args,
    options,
    metadata
  });
    let session = core.make('osjs/settings').get('osjs/session');
  let sessions = Object.entries(session);
  for (i = 0; i < sessions.length; i++) {
    if (Object.keys(session[i].windows).length && session[i].name == metadata.name){
      finalposition = session[i].windows[0].position;
      finalDimension = session[i].windows[0].dimension;
      finalMaximised = session[i].windows[0].maximized;
      finalMinimised = session[i].windows[0].minimized;
    }
  }
  // Create  a new Window instance
 const createProcWindow = () => {
    var win = proc
    .createWindow({
      id: "AdminWindow",
      title: metadata.title.en_EN,
      icon: proc.resource(icon_white),
      attributes: {
        classNames: ["Window_Admin"],
        dimension: finalDimension ? finalDimension : {
          width: 900,
          height: 570
        },
        minDimension: {
          width: 900,
          height: 570
        },
        position:  finalposition ? finalposition : {
          left: 150,
          top: 50
        }
      }
    })
    .on("destroy", () => proc.destroy())
    .on("resized", config => {
      event = new CustomEvent("windowResize", {
        detail: config,
        bubbles: true,
        cancelable: true
      });
      window.setTimeout(
        () =>
          document
            .getElementsByClassName("Window_Admin")[0]
            .dispatchEvent(event),
        0
      );
    })
    .on("maximize", config => {
      event = new CustomEvent("windowResize", {
        detail: config.state.dimension,
        bubbles: true,
        cancelable: true
      });
      window.setTimeout(
        () =>
          document
            .getElementsByClassName("Window_Admin")[0]
            .dispatchEvent(event),
        0
      );
    })
    .render($content => ReactDOM.render(<Home args={core} />, $content));

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

osjs.register(adminJson.name, register);
