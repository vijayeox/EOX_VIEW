import './index.scss';
import osjs from 'osjs';
import {name as applicationName} from './metadata.json';

// Our launcher
const register = (core, args, options, metadata) => {
  // Create a new Application instance
  const proc = core.make('osjs/application', {args, options, metadata});

  // Create  a new Window instance

  proc.createWindow({
    id: "DemoWindow",
    icon: proc.resource(proc.metadata.icon_white),
    title: metadata.title.en_EN,
    dimension: {
      width: 400,
      height: 400
    },
    state: {
      maximized: true
    },
  })
  .on('destroy', () => proc.destroy())
  .render(($content, win) => {
    var elements;
    // Add our process and window id to iframe URL
    win.attributes.maximizable = true;
    const profile = core.make("oxzion/profile");
    const details = profile.get();
    const suffix = `?pid=${proc.pid}&wid=${win.wid}`;
    const user = core.make('osjs/auth').user();

    // Create an iframe
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.position = 'relative';
    iframe.src = proc.resource('https://pr.to/SKNF38/embed/?embedside=0');

    iframe.setAttribute('border', '0');

    // Bind window events to iframe
    win.on('blur', () => iframe.contentWindow.blur());
    win.on('focus', () => iframe.contentWindow.focus());
    win.on('iframe:post', msg => iframe.contentWindow.postMessage(msg, window.location.href));

    // Listen for messages from iframe
    win.on('iframe:get', msg => {
      // console.warn('Message from Iframe', msg);
      win.emit('iframe:post', 'Pong');
    });

    $content.appendChild(iframe);
    
  });


  return proc;
};

// Creates the internal callback function when OS.js launches an application
osjs.register(applicationName, register);
