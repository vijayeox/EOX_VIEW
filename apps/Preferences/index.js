import osjs from 'osjs';
import {React,ReactDOM} from "oxziongui";
import {name as applicationName} from './metadata.json';
import App from './App.js';

// Our launcher
const register = (core, args, options, metadata) => {
    // Create a new Application instance
    const proc = core.make('osjs/application', {args, options, metadata});
    // Create  a new Window instance
    //
    const win = proc.createWindow({
      id: 'PreferencesWindow',
      title: metadata.title.en_EN,
      dimension: {width: 720, height: 550},
      position: {left: 700, top: 200},
      attributes:{  
      visibility: 'restricted', 
          minimizable: false
 	 }
    })
    .on('resized', (dimension, win) => {
      var resizedEvent=new CustomEvent("windowResized", {
        detail: {
          dimensions: dimension 
        }
        
      });
      win.$content.dispatchEvent(resizedEvent)
    })
    .on('destroy', () => proc.destroy())
    .render(($content,win) => 
        ReactDOM.render(<App args = {core} win={win} />, $content));
    if(win.$element.className.indexOf('Window_'+applicationName) == -1){
      win.$element.className += " Window_"+applicationName;
    } 

  // Creates a new WebSocket connection (see server.js)
  //const sock = proc.socket('/socket');
  //sock.on('message', (...args) => console.log(args))
  //sock.on('open', () => sock.send('Ping'));

  // Use the internally core bound websocket
  //proc.on('ws:message', (...args) => console.log(args))
  //proc.send('Ping')

  // Creates a HTTP call (see server.js)
  //proc.request('/test', {method: 'post'})
  //.then(response => console.log(response));

  return proc;
};

// Creates the internal callback function when OS.js launches an application
osjs.register(applicationName, register);