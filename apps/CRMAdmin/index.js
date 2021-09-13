/*
 * OS.js - JavaScript Cloud/Web Desktop Platform
 *
 * Copyright (c) 2011-2018, Anders Evenrud <andersevenrud@gCRM.com>
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * @author  Anders Evenrud <andersevenrud@gCRM.com>
 * @licence Simplified BSD License
 */
import {
  name as applicationName
} from "./metadata.json";
const baseUrl = process.env.SERVER;

var i, finalposition, finalDimension, finalMaximised, finalMinimised;

const createIframe = (bus, proc, win, cb) => {
  const iframe = document.createElement("iframe");
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.setAttribute("border", "0");

  iframe.addEventListener("load", () => {
    const ref = iframe.contentWindow;
    // win.maximize(); // Maximize

    // This will proxy the window focus events to iframe
    win.on("focus", () => ref.focus());
    win.on("blur", () => ref.blur());

    // Create message sending wrapper
    const sendMessage = msg => ref.postMessage(msg, baseUrl);

    // After connection is established, this handler will process
    // all events coming from iframe.
    proc.on("message", data => {
      console.warn("[Application", "Iframe sent", data);
      bus.emit(data.method, sendMessage, ...data.args);
    });
    cb(sendMessage);
  });

  return iframe;
};
const makeApiCall = function (core, params) {
  return (async () => {
    var caller = core.make("oxzion/restClient");
    // console.log(params.data)
    var res = await caller.request(
      params.version,
      params.action,
      params.data,
      params.method
    );
    if (res != null && res.status == "success") {
      return Promise.resolve(res);
    } else if (res != null && res.status != "success") {
      console.log("login failed.");
      return Promise.reject(new Error(res.message));
    } else {
      return Promise.reject(new Error(res.message));
    }
  })();
};
// Creates the internal callback function when OS.js launches an application
// Note the first argument is the 'name' taken from your metadata.json file
OSjs.make("osjs/packages").register(
  "CRMAdmin",
  (core, args, options, metadata) => {
    // Create a new Application instance
    const proc = core.make("osjs/application", {
      args,
      options,
      metadata
    });

    let session = core.make('osjs/settings').get('osjs/session');
    let sessions = Object.entries(session);
    for (i = 0; i < sessions.length; i++) {
      if (Object.keys(session[i].windows).length && session[i].name == "CRMAdmin"){
        finalposition = session[i].windows[0].position;
        finalDimension = session[i].windows[0].dimension;
        finalMaximised = session[i].windows[0].maximized;
        finalMinimised = session[i].windows[0].minimized;
      }
    }

    // Create  a new Window instance
    const win = proc
      .createWindow({
        id: "CRMAdminApplicationWindow",
        icon: proc.resource(proc.metadata.icon_white),
        title: metadata.title.en_EN,
        dimension: finalDimension ? finalDimension : {width: 860, height: 550},
        attributes: {
           minDimension: { width: 800, height: 500 }
        },
        // dimension: {width: 400, height: 400},
          position:  finalposition ? finalposition :{left: 250, top: 0}
      })
      .on("destroy", () => proc.destroy())
      // .on('init', () => ref.maximize())
      .render(($content, win) => {
        // win.maximize();

        if(finalMinimised){
          win.minimize();
        }
        if(finalMaximised){
          win.maximize();
        }
        win.attributes.maximizable = true;
        // Create a new bus for our messaging
        const bus = core.make("osjs/event-handler", "CRMAdminApplicationWindow");

        const user = core.make('osjs/auth').user();
        const suffix = `?pid=${proc.pid}&wid=${win.wid}`;
          // Get path to iframe content
        const src = proc.resource( baseUrl + "/public/index.php/user/login" + suffix);
        console.log(src)
        // Create DOM element
        const iframe = createIframe(bus, proc, win, send => {
          bus.on("yo", (send, args) =>
            send({
              method: "yo",
              args: ["OX CRMAdmin says hello"]
            })
          );

          // Send the process ID to our iframe to establish communication
          send({
            method: "init",
            args: [proc.pid]
          });
        });

        // Finally set the source and attach
        iframe.src = src;

        // Attach
        $content.appendChild(iframe);
      });

    return proc;
  }
);
