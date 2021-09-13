import osjs from "osjs";
import { name as applicationName } from "./metadata.json";
import { React, ReactDOM } from "oxziongui";
import { icon_white } from "./metadata.json";
import App from "./App";

var i, finalposition, finalDimension, finalMaximised, finalMinimised;
// Our launcher
const register = (core, args, options, metadata) => {
  // Create a new Application instance
  const proc = core.make("osjs/application", {
    args,
    options,
    metadata,
  });
  let session = core.make("osjs/settings").get("osjs/session");
  let sessions = Object.entries(session);
  for (i = 0; i < sessions.length; i++) {
    if (
      Object.keys(session[i].windows).length &&
      session[i].name == metadata.name
    ) {
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
        id: "Window_DocumentsWindow",
        title: metadata.title.en_EN,
        // icon: proc.resource(icon_white),
        icon: metadata.fontIcon,
        position: finalposition ? finalposition : { left: 400, top: 90 },
        attributes: {
          classNames: ["Window_DocumentsWindow"],
          dimension: finalDimension
            ? finalDimension
            : {
                width: 400,
                height: 500,
              },
          minDimension: {
            width: 400,
            height: 500,
          },
        },
      })
      .on("destroy", () => proc.destroy())
      .on("resized", (config) => {
        event = new CustomEvent("windowResize", {
          detail: config,
          bubbles: true,
          cancelable: true,
        });
        window.setTimeout(
          () =>
            document
              .getElementsByClassName("Window_DocumentsWindow")[0]
              .dispatchEvent(event),
          0
        );
      })
      .on("maximize", (config) => {
        event = new CustomEvent("windowResize", {
          detail: config.state.dimension,
          bubbles: true,
          cancelable: true,
        });
        window.setTimeout(
          () =>
            document
              .getElementsByClassName("Window_DocumentsWindow")[0]
              .dispatchEvent(event),
          0
        );
      })
      .render(($content) => ReactDOM.render(<App args={core} />, $content));

    if (finalMinimised) {
      win.minimize();
    }
    if (finalMaximised) {
      win.maximize();
    }
  };
  createProcWindow(proc);

  return proc;
};

osjs.register(applicationName, register);
