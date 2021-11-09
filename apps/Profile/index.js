import osjs from "osjs";
import { name as applicationName } from "./metadata.json";
import { icon_white } from "./metadata.json";
import Body from "./body.js";
import { React, ReactDOM } from "oxziongui";
import metaData from "./metadata.json";

var i, finalposition, finalDimension, finalMaximised, finalMinimised;



// Our launcher
const register = (core, args, options, metadata) => {
  // Create a new Application instance
  const proc = core.make("osjs/application", { args, options, metadata });
  let tray = null;
  //   let tray = null;
   const trayOptions = {};
  let dashboardUUID = ""    // add the UUID string here 
  let trayInitialized = false;
  // Create  a new Window instance
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
  
  const createProcWindow = () => {
    var win = proc
      .createWindow({
        id: metadata.name + "_Window",
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
          closeable: false,
          maximizable: true,
          minimizable: true,

        }
          
      })
      .on("destroy", () => proc.destroy())
      .on("render", (e) => {
        win.focus();
        win.maximize();
        
      })
      // .on("render", (e) => {
      //   win.maximize();
      // })
      .render($content => {
        ReactDOM.render(<Body args={core} dashboardUUID={dashboardUUID} proc={proc}/>, $content)
         })   // pass it directly to the component you create
      if(win.$element.className.indexOf('Window_'+applicationName) == 12){
        win.$element.className += " Window_"+applicationName;
      } 
      if(finalMinimised){
        win.minimize(); 
      }
      if(finalMaximised){
        win.maximize();
      }
      const updateTray = () => {
        if (core.has("osjs/tray")) {
          const trayObj = core.make("osjs/tray");
          if (trayInitialized) {
            trigger();
            tray.update({ count: announcementsCount });
          } else {
            trayInitialized = true;
            tray = trayObj.create(
              {
                
                title: "profileWindow",
                icon: proc.resource(metadata.icon_white),
                pos: 4,
                onclick: () => {
                  win.raise();
                  win.focus();
                  trigger();
                },
              },
              (ev) => {
                core.make("osjs/contextmenu").show({
                  position: ev,
                });
              }
            );
          }
        }
      
    };
    updateTray();  
  };
  createProcWindow(proc);
  return proc;
};



const trigger = () => {
  var an_ev = new CustomEvent("openProfile", {
    detail: null,
    bubbles: true,
    cancelable: true,
  });
  document
  .querySelector('div[data-id="profileWindow"]')
  .dispatchEvent(an_ev);
};

// Creates the internal callback function when OS.js launches an application
osjs.register(metaData.name, register);
