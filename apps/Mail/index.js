    /*
    * OS.js - JavaScript Cloud/Web Desktop Platform
    *
    * Copyright (c) 2011-2018, Anders Evenrud <andersevenrud@gmail.com>
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
    * @author  Anders Evenrud <andersevenrud@gmail.com>
    * @licence Simplified BSD License
    */
    import {
      name as applicationName
    } from "./metadata.json";

    const baseUrl = process.env.SERVER;

    const trayOptions = {};
    let mailCount = 0;
    let tray = null;
    var i, finalposition, finalDimension,finalMaximised = false,finalMinimised = true;

    const resetBadge = () => {
      if (trayOptions.count > 0) {
        trayOptions.count = undefined;
        trayOptions.badge = "";
        tray.update(trayOptions);
      }
    };
      // MailApplicationWindow Header Icons are interchanged purposefully. Do not change this.
  const HeaderIcon = () => {
  let parent = document.querySelectorAll(
      ".osjs-window[data-id=MailApplicationWindow] div.osjs-window-header"
    )[0];
    if (parent.childNodes[3].getAttribute("data-action") == "minimize") {
      var clonedItem = (parent.childNodes[3]).cloneNode(true);
      clonedItem.className = "osjs-window-button dummyCloseButton";
      parent.appendChild(clonedItem);
    }
  }

    const createIframe = (proc, win) => {
      const iframe = document.createElement("iframe");
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      iframe.setAttribute("border", "0");

      iframe.addEventListener("load", () => {
        const ref = iframe.contentWindow;
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
      "Mail",
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
          if (Object.keys(session[i].windows).length && session[i].name == "Mail"){
            finalposition = session[i].windows[0].position;
            finalDimension = session[i].windows[0].dimension;
            finalMaximised = session[i].windows[0].maximized;
            finalMinimised = session[i].windows[0].minimized;
          }
        }
        let trayInitialized = false;
        // Create  a new Window instance
        const createProcWindow = () => {
          const win = proc
            .createWindow({
              id: "MailApplicationWindow",
              icon: proc.resource(proc.metadata.fontIcon),
              title: metadata.title.en_EN,
              position:  finalposition ? finalposition : { left: 150, top: 50},
              dimension: finalDimension ? finalDimension : {width: 900, height: 600},
              maximized: finalMaximised,
              minimized: finalMinimised, 
              attributes: {
                visibility: "restricted",
                closeable: false,
                 minDimension: { width: 800, height: 500 },
              }
            })
            .on("close", () => {
              win.state.minimized == true;
              win.minimize = true;
              win.attributes.minimized = true;
              // win.minimize();
              // win.attributes.minimizable = true;
              console.log("close event");
            })
            .on("destroy", () => proc.destroy())
            .render(($content, win) => {

              HeaderIcon();
                // Context menu is hidden
            win.$icon.addEventListener('click', (ev) => {
              ev.stopPropagation();
              ev.preventDefault();
              core.make('osjs/contextmenu').hide();
            });
            win.$icon.addEventListener('dblclick', (ev) =>{
              ev.stopPropagation();
              ev.preventDefault();
            });

              if(finalMinimised){
                win.minimize();
              }
              if(finalMaximised){
                win.maximize();
              }
              // win.maximize();
              // win.minimize();
              win.attributes.maximizable = true;
              // Create a new bus for our messaging
              const profile = core.make("oxzion/profile");
              const details = profile.get();
              const defaultFlag = details.key.authRequired ? true : false;
              const suffix = `?pid=${proc.pid}&wid=${win.wid}`;
              const src = proc.resource(
                baseUrl + "/oxindex.php" + suffix + "&email=" + details.key.email + "&authRequired=" + defaultFlag
              );
              // Create DOM element
              const iframe = createIframe(proc, win);
              const handleNotification = () => {
                if (win.state.focused == false || win.state.minimized == true) {
                  mailCount++;
                  mailCount = mailCount > 0 ? mailCount : "";
                  trayOptions.badge = "badgeCheck";
                  trayOptions.count = mailCount;
                }
                tray.update(trayOptions);
              };
              // Send the process ID to our iframe to establish communication
              win.on("blur", () => iframe.contentWindow.blur());
              win.on("focus", () => iframe.contentWindow.focus());
              win.on("iframe:post", msg =>
                iframe.contentWindow.postMessage(msg, src)
              );
              win.on("iframe:get", msg => {
                console.warn("Message from Iframe", msg);
                if (msg === "Ping") {
                  win.emit("iframe:post", "Pong");
                } else if (msg instanceof Object && msg.method == "notify") {
                  handleNotification();
                } else if (
                  msg instanceof Object &&
                  msg.method &&
                  msg.args &&
                  Array.isArray(msg.args)
                ) {
                  const params = msg.args[0];
                  makeApiCall(core, params)
                    .then(res => {
                      win.emit("iframe:post", {
                        method: msg.method,
                        params: params,
                        data: res.data
                      });
                    })
                    .catch(err => {
                      win.emit("iframe:post", {
                        method: msg.method,
                        params: params,
                        error: err.message
                      });
                    });
                }
              });
              // Finally set the source and attach
              iframe.src = src;
              // Tray Icon
              if (core.has("osjs/tray") && !trayInitialized) {
                trayInitialized = true;
                trayOptions.title = "Mail";
                trayOptions.icon = proc.resource(metadata.icon_white);
                trayOptions.pos = 3;
                trayOptions.onclick = () => {
                  
                  win.raise();
                  win.focus();
                  resetBadge();
                }
              
                tray = core.make("osjs/tray").create(trayOptions, ev => {
                  core.make("osjs/contextmenu").show({
                    
                    position: ev,
                    // menu: [{
                    //     label: "Open",
                    //     onclick: () => {
                    //       console.log(proc);
                    //       win.raise();
                    //       win.focus();
                    //       resetBadge();
                    //     }
                    //   },
                    //   {
                    //     label: "Quit",
                    //     onclick: () => {
                    //       proc.destroy();
                    //       tray.destroy();
                    //     }
                    //   }
                    // ]
                  });
                });
              }
              // Attach
              $content.appendChild(iframe);
            });
        };
        createProcWindow();
        return proc;
      }
    );