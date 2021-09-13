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
  
  const createIframe = (proc, win) => {
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
    });

    return iframe;
  };

  const makeApiCall = function(core, params) {
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
    "MailAdmin",
    (core, args, options, metadata) => {
      // Create a new Application instance
      const proc = core.make("osjs/application", {
        args,
        options,
        metadata
      });

      // Create  a new Window instance
      const win = proc
        .createWindow({
          id: "MailAdminApplicationWindow",
          icon: proc.resource(proc.metadata.icon_white),
          title: metadata.title.en_EN,
          attributes: { state: { maximized: true } }
          // dimension: {width: 400, height: 400},
          // position: {left: 200, top: 0}
        })
        .on("destroy", () => proc.destroy())
        // .on('init', () => ref.maximize())
        .render(($content, win) => {
          win.maximize();
          win.attributes.maximizable = false;
          // Create a new bus for our messaging
          const profile = core.make("oxzion/profile");
          // const details = profile.get();
          // console.log(details.key.email);
          //Get path to iframe content
          const suffix = `&pid=${proc.pid}&wid=${win.wid}`;
          const src = proc.resource(baseUrl + "/?admin" + suffix);

          // Create DOM element
          const iframe = createIframe(proc, win);

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
          // Attach
          $content.appendChild(iframe);
        });

      return proc;
    }
  );
