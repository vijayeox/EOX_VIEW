import './index.scss';
import osjs from 'osjs';
import {name as applicationName} from './metadata.json';
const sourceUrl = process.env.SOURCE;
const serverUrl = process.env.SERVER;

// Our launcher
const register = (core, args, options, metadata) => {
  // Create a new Application instance
  const proc = core.make('osjs/application', {args, options, metadata});

  // Create  a new Window instance
  proc.createWindow({
    id: 'TimesheetWindow',
    icon: metadata.fontIcon,
    title: metadata.title.en_EN,
    position: {left: 700, top: 200},
    dimension: {width: 400, height: 400}
  })
  .on('destroy', () => proc.destroy())
  .render(($content, win) => {
    win.maximize(); // Maximize
    win.attributes.maximizable = false;
    const profile = core.make("oxzion/profile");
    const details = profile.get();
    const suffix = `?pid=${proc.pid}&wid=${win.wid}`;
    const user = core.make('osjs/auth').user();

    // Create an iframe
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '100%';

    var jwt = user.jwt;
    var userAccess = (details.key.privileges.hasOwnProperty('MANAGE_TIMESHEET_MANAGER_READ')) ? 'managerreport' : 'hive';
    // jwt = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpYXQiOjE2NTgzODUwNzQsImp0aSI6IkV5ZHhCVWNBajZOa0RSVkZkclRYTllVczlrb2RXaEJhdTh1aVJBb1hsZ2s9IiwibmJmIjoxNjU4Mzg1MDc0LCJleHAiOjE2NTg0NTcwNzQsImRhdGEiOnsidXNlcm5hbWUiOiJrYXJhbmEiLCJhY2NvdW50SWQiOiIzIn19.Ueklc2D17jyUy_LmmIYjnVFzEh6rBvHBwcCkvq56ckorqM0j4ust7J2X5zZGVNuF4hAAJJYgHxDb1UXKrfJKpw';

    const clientId = (proc.args.clientId != undefined) ? proc.args.clientId : 56;
    iframe.src = proc.resource(sourceUrl+'/login/iframelogin/eosFrame/1?lasturl=commatrix/timesheet/'+userAccess+'/moduleid/28/client/'+clientId+'/instanceform&url='+serverUrl+'/user/me&user=username&m=GET&h=Authorization&Authorization=Authorization: Bearer ' + jwt);
    iframe.setAttribute('border', '0');

    // Bind window events to iframe
    win.on('blur', () => iframe.contentWindow.blur());
    win.on('focus', () => iframe.contentWindow.focus());
    win.on('iframe:post', msg => iframe.contentWindow.postMessage(msg, window.location.href));

    // Listen for messages from iframe
    win.on('iframe:get', msg => {
      // We should get "Ping" here
      // console.warn('Message from Iframe', msg);

      // In this case we just send "Pong" back
      win.emit('iframe:post', 'Pong');
    });

    $content.appendChild(iframe);
  });

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
