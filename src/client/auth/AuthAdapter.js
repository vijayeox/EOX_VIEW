/*
For more information about authentication adapters, visit:
- https://manual.os-js.org/v3/tutorial/auth/
- https://manual.os-js.org/v3/guide/auth/
- https://manual.os-js.org/v3/development/
*/
const loginAdapter = (core, config) => ({
  login: (req, res) => {

    const username = req.username;

    var reqData = new FormData();
    reqData.append("username", req.username);
    reqData.append("password", req.password);


    var request = new XMLHttpRequest();
    let url = core.config('auth.url');
    console.log("login call - " + url);

    // call to login API
    request.open('POST', url, false);
    request.send(reqData);
    if (request.status === 200) {
      const resp = JSON.parse(request.responseText);
      console.log(resp);
      return Promise.resolve({
        id: 666,
        username,
        groups: ['admin'],
        token: resp.data.jwt
      });
    }

  },

  logout: (req, res) => {
    return Promise.resolve(true);
  }
});

export default loginAdapter;