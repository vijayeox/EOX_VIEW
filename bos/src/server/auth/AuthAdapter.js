/*
For more information about authentication adapters, visit:
- https://manual.os-js.org/v3/tutorial/auth/
- https://manual.os-js.org/v3/guide/auth/
- https://manual.os-js.org/v3/development/
*/
const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs-extra');

async function validateLogin (username,password,core) {
  var reqData = new FormData();
  reqData.append("username", username);
  reqData.append("password", password);
  var info = await makeRequest(reqData,core)
  if (info["status"] == "success") {
    core.make('osjs/vfs')
    .realpath('home:/', {username: username})
    .then(realpath => fs.ensureDir(realpath))
    return Promise.resolve({jwt:info["data"]["jwt"], username : username,refresh_token:info["data"]["refresh_token"],id:username}); 
  } else {
    return Promise.resolve(false);
  }
};
async function makeRequest(params,core) {
  try {
    var respData;
    let url = core.config('wrapper.url') + 'auth';
    const resp = await fetch(url, {
      method: 'post',
      body: params
    });
    return resp.json();
  } catch (e) { 
    console.log(e);
    return false;
  }
}
module.exports = (core, config) => ({
  login: (req, res) => {
    const {username,password} = req.body;
    return validateLogin(username,password,core);
  },
  logout: (req, res) => {
    return Promise.resolve(true);
  },

  register: (req, res) => {
    return Promise.reject(new Error('Registration not available'));
  }
});
