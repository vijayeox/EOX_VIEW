/*
For more information about authentication adapters, visit:
- https://manual.os-js.org/v3/tutorial/auth/
- https://manual.os-js.org/v3/guide/auth/
- https://manual.os-js.org/v3/development/
*/

import LocalStorageAdapter from './localStorageAdapter.js';


const loginAdapter = (core, config) => ({

  login: async(req, res) => {
    const splash = core.make('oxzion/splash');
    core.on('osjs/core:boot', () => splash.show());
    core.on('osjs/core:booted', () => splash.destroy());
    core.on('osjs/core:logged-in', () => splash.show());
    core.on('osjs/core:started', () => splash.destroy());
    let response = await core.request("/login", { method: 'POST', body: JSON.stringify({username:req.username,password:req.password}) }, 'json');
    var lsHelper = new LocalStorageAdapter;
    if((lsHelper.supported() || lsHelper.cookieEnabled()) && response['jwt'] != null){
      lsHelper.purge('AUTH_token');
      lsHelper.purge('REFRESH_token');
      lsHelper.purge('User');
      lsHelper.purge('UserInfo');
      lsHelper.purge('Metadata');
      lsHelper.purge('osjs/session');
      lsHelper.purge('osjs/locale');
      lsHelper.purge('osjs/desktop');
      lsHelper.set('AUTH_token',response["jwt"]);
      lsHelper.set('REFRESH_token',response["refresh_token"]);
      lsHelper.set('User',req.username);
      let user = {jwt:response["jwt"],refresh_token:response['refresh_token'], username : req.username};
      core.setUser(user);
      return Promise.resolve(user); 
    } else {
      console.log('login failed.');
      return Promise.reject(new Error(res.message));
    }
  },

  logout: (req, res) => {
    var lsHelper = new LocalStorageAdapter;
    if(lsHelper.supported() || lsHelper.cookieEnabled()){
      lsHelper.purge('AUTH_token');
      lsHelper.purge('REFRESH_token');
      lsHelper.purge('User');
      lsHelper.purge('UserInfo');
      lsHelper.purge('Metadata');
      lsHelper.purge('osjs/session');
      lsHelper.purge('osjs/locale');
      lsHelper.purge('osjs/desktop');
      return Promise.resolve(true); 
    }
  }
});

export default loginAdapter;