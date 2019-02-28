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
import {name as applicationName} from './metadata.json';

const baseUrl = "http://localhost:8065";
const createIframe = (bus, proc, win, cb) => {
  const iframe = document.createElement('iframe');
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.setAttribute('border', '0');

  iframe.addEventListener('load', () => {
   
    const ref = iframe.contentWindow;
    // win.maximize(); // Maximize
    
    // This will proxy the window focus events to iframe
    win.on('focus', () => ref.focus());
    win.on('blur', () => ref.blur());

    // Create message sending wrapper
    const sendMessage = msg => ref.postMessage(msg, baseUrl);

    // After connection is established, this handler will process
    // all events coming from iframe.
    proc.on('message', data => {
      console.warn('[Application', 'Iframe sent', data);
      bus.emit(data.method, sendMessage, ...data.args);
    });

    cb(sendMessage);
  });

  return iframe;
};

// Creates the internal callback function when OS.js launches an application
// Note the first argument is the 'name' taken from your metadata.json file
OSjs.make('osjs/packages').register('Chat', (core, args, options, metadata) => {

  // Create a new Application instance
  const proc = core.make('osjs/application', {
    args,
    options,
    metadata 
  });
  let trayInitialized = false;
  
  // Create  a new Window instance
  const createProcWindow = () => {
    let win = proc.createWindow({
      id: 'ChatWindow',
      icon: proc.resource(proc.metadata.icon),
      title: metadata.title.en_EN,
      dimension: {width: 400, height: 500},
      position: {left: 200, top: 400}
    })
    // To close the Chat app when the window is destructed
      .on('close', () => {
        console.log("close event");
      })
      
      // .on('init', () => ref.maximize())
      .render(($content, win) => {
        // win.maximize();
         
         // Create a new bus for our messaging
         const bus = core.make('osjs/event-handler', 'ChatWindow');
         const user = core.make('osjs/auth').user();
         // Get path to iframe content
         const src = proc.resource(baseUrl + '/login?oxauth=' + user.jwt);
    
         // Create DOM element
         const iframe = createIframe(bus, proc, win, send => {
           bus.on('yo', (send, args) => send({
             method: 'yo',
             args: ['Chat says hello']
           }));
    
           // Send the process ID to our iframe to establish communication
           send({
             method: 'init',
             args: [proc.pid]
           });
         });
    
          // Finally set the source and attach
         iframe.src = src;
    
              // Tray Icon
         if (core.has('osjs/tray') && !trayInitialized) {
           trayInitialized = true;
           const tray = core.make('osjs/tray').create({
             title: "Chat",
             icon: proc.resource(metadata.icon),
           }, (ev) => {
             core.make('osjs/contextmenu').show({
               position: ev,
               menu: [
                 {label: 'Open', 
                  onclick: () => {
                     console.log(proc);
                     createProcWindow();
                   }
                 },
                 {
                  label: 'Quit', 
                  onclick: () => {
                  win.destroy();
                   }
                 }
               ]
             });
           });
         }
    
    
         // Attach
         $content.appendChild(iframe);
       })
    }
  createProcWindow();  
  return proc;
});
