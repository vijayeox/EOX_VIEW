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
  
  var i, finalposition, finalDimension,finalMaximised,finalMinimised;
  
  const baseUrl = process.env.SERVER;
  OSjs.make("osjs/packages").register(
    "TaskAdmin",
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
    if (Object.keys(session[i].windows).length && session[i].name == "TaskAdmin"){
      finalposition = session[i].windows[0].position;
      finalDimension = session[i].windows[0].dimension;
      finalMaximised = session[i].windows[0].maximized;
      finalMinimised = session[i].windows[0].minimized;
    }
  }

  proc.createWindow({ id: "TaskAdminApplicationWindow", icon: proc.resource(proc.metadata.icon_white),
  title: metadata.title.en_EN, dimension: finalDimension ? finalDimension : {width: 400, height: 400},
  position:  finalposition ? finalposition : {left: 350, top: 100} ,
  attributes: {
   minDimension: { width: 800, height: 500 },
 },})
  .on('destroy', () => proc.destroy())
  .render(($content, win) => {
    // Add our process and window id to iframe URL
    if(finalMinimised){
      win.minimize();
    }
    if(finalMaximised){
      win.maximize();
    }
    win.attributes.maximizable = true;
    const profile = core.make("oxzion/profile");
    const details = profile.get();
    const suffix = `?pid=${proc.pid}&wid=${win.wid}`;
    const user = core.make('osjs/auth').user();
    console.log(user);
  
    // Create an iframe
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.src = proc.resource(baseUrl+ "/oxadminindex");
  
    iframe.setAttribute('border', '0');

    // Bind window events to iframe
    win.on('blur', () => iframe.contentWindow.blur());
    win.on('focus', () => iframe.contentWindow.focus());
    win.on('iframe:post', msg => iframe.contentWindow.postMessage(msg, window.location.href));

    // Listen for messages from iframe
    win.on('iframe:get', msg => {
      console.warn('Message from Iframe', msg);
      win.emit('iframe:post', 'Pong');
    });

    $content.appendChild(iframe);
    
  });
}
);
