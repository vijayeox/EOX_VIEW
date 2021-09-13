import osjs from 'osjs';
import { name as applicationName } from './metadata.json';
import { icon_white } from './metadata.json';
import Slider from './slider.js';
import {React,ReactDOM} from "oxziongui";

var i, finalposition, finalDimension,finalMaximised,finalMinimised;
// Our launcher
const register = (core, args, options, metadata) => {
  // Create a new Application instance
  const proc = core.make("osjs/application", { args, options, metadata });
  let tray = null;
  let trayInitialized = false;
  // Create  a new Window instance
  let session = core.make('osjs/settings').get('osjs/session');
  let sessions = Object.entries(session);
  for (i = 0; i < sessions.length; i++) {
    if (Object.keys(session[i].windows).length && session[i].name == "Announcement"){
      finalposition = session[i].windows[0].position;
      finalDimension = session[i].windows[0].dimension;
      finalMaximised = session[i].windows[0].maximized;
      finalMinimised = session[i].windows[0].minimized;
    }
  }
  const createProcWindow = () => {
    var win = proc
    .createWindow({
      id: "annoucementsWindow",
      title: metadata.title.en_EN,
      icon: proc.resource(icon_white),
      dimension: finalDimension ? finalDimension : { width: 800, height: 450 },
      position:  finalposition ? finalposition : {left: 700, top: 200},
      maximized: finalMaximised,
      minimized: finalMinimised, 
      attributes: {
        minDimension: { width: 800, height: 450 },
        visibility: "restricted",
        closeable: false,
      },
    })
    .render(($content) => ReactDOM.render(<Slider args={core} />, $content))
    .on("resized", (config) => {
      trigger();
    })
    .on("maximize", (config) => {
      trigger();
    });
    if(finalMinimised){
      win.minimize();
    }
    if(finalMaximised){
      win.maximize();
    }

    const getAnnouncements = async () => {
      let helper = core.make("oxzion/restClient");
      let announ = await helper.request("v1", "/announcement/a/ANNOUNCEMENT", {}, "get");
      return announ;
    };
    
    const updateTray = () => {
      getAnnouncements().then((response) => {
        let announcementsCount = 0;
        response["data"].map((announcement)=> {
          if(!announcement.view  || announcement.view =="0") announcementsCount++;
        });
        if (core.has("osjs/tray")) {
          const trayObj = core.make("osjs/tray");
          if (trayInitialized) {
                trigger();
                tray.update({count: announcementsCount});
              } else {
            trayInitialized = true;
            tray = trayObj.create(
              {
                title: "AnnouncementWindow",
                icon: proc.resource(metadata.icon_white),
                badge: "badgeCheck",
                count: announcementsCount,
                pos: 1,
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
              core.on('announcement/tray:modified', (count)=>{
                tray.update({count: count});
              });
            }
          }
        });
      };
      core.on('admin/announcement:modified', updateTray);
      updateTray();
    };
    createProcWindow(proc);
    return proc;
  };

const trigger = () => {
  var an_ev = new CustomEvent("updateAnnouncements", {
    detail: null,
    bubbles: true,
    cancelable: true,
  });
  document
  .querySelector('div[data-id="annoucementsWindow"]')
  .dispatchEvent(an_ev);
};

// Creates the internal callback function when OS.js launches an application
osjs.register(applicationName, register);
