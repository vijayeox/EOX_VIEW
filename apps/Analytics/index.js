import './index.scss';
import osjs from 'osjs';
import {React,ReactDOM} from "oxziongui"
import metaData from './metadata.json';
// import {name as applicationName} from './metadata.json';
import icon_white from './metadata.json';
import Body from './body'

// Our launcher
const register = (core, args, options, metadata) => {
  // Create a new Application instance
  const proc = core.make('osjs/application', {args, options, metadata});
  // Create  a new Window instance
  let session = core.make('osjs/settings').get('osjs/session');
  let sessions = Object.entries(session);
  var i, finalposition, finalDimension,finalMaximised,finalMinimised, win;
  for (i = 0; i < sessions.length; i++) {
    if (Object.keys(session[i].windows).length && session[i].name == metadata.name){
      finalposition = session[i].windows[0].position;
      finalDimension = session[i].windows[0].dimension;
      finalMaximised = session[i].windows[0].maximized;
      finalMinimised = session[i].windows[0].minimized;
    }
  }
  var win = proc.createWindow({
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
        }
      }
    }).on('destroy', () => proc.destroy())
    .on('render', (e) => { win.maximize(); })
    .render($content => ReactDOM.render(<Body args={core} proc={proc}/>, $content));
    if(finalMinimised){
      win.minimize();
    }
    if(finalMaximised){
      win.maximize();
    }
  return proc;
};

// Creates the internal callback function when OS.js launches an application
osjs.register(metaData.name, register);

