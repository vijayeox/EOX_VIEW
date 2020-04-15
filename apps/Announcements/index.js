import osjs from 'osjs';
import { name as applicationName } from './metadata.json';
import { icon_white } from './metadata.json';
import Slider from './slider.js';
import React from 'react';
import ReactDOM from 'react-dom';

let tray = null;
var i, finalposition = {};
// Our launcher
const register = (core, args, options, metadata) => {
  // Create a new Application instance
  const proc = core.make("osjs/application", { args, options, metadata });
  let trayInitialized = false;
  // Create  a new Window instance
  let session = core.make('osjs/settings').get('osjs/session');
  let sessions = Object.entries(session);
  for (i = 0; i < sessions.length; i++) {
    if (session[i] && session[i].name == "Announcements"){
      finalposition = session[i].windows[i].position ? session[i].windows[i].position : {left: 700, top: 200};
    }
  }
  
  const createProcWindow = () => {
    var win = proc
      .createWindow({
        id: "annoucementsWindow",
        title: metadata.title.en_EN,
        icon: proc.resource(icon_white),
        dimension: { width: 800, height: 450 },
        position:  finalposition,
        attributes: {
          minDimension: { width: 800, height: 450 },
          gravity: "center",
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

    const getAnnouncements = async () => {
      let helper = core.make("oxzion/restClient");
      let announ = await helper.request("v1", "/announcement", {}, "get");
      return announ;
    };

    let announcementsCount = 0;
    getAnnouncements().then((response) => {
      announcementsCount = response["data"].length;
      if (core.has("osjs/tray") && !trayInitialized) {
        trayInitialized = true;
        tray = core.make("osjs/tray").create(
          {
            title: "AnnouncementsWindow",
            icon: proc.resource(metadata.icon_white),
            badge: "badgeCheck",
            count: announcementsCount,
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
    });
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
