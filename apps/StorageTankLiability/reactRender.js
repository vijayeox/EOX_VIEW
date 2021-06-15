const path = require("path");
const fs = require("fs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const Register = require("./public/register/Register");

module.exports = function (core, proc) {
  core.app.get(proc.resource("/register/:productName"), (req, res) => {
    console.log(req.params);
    if (req.params.productName) {
      var filePath = path.join(
        __dirname + "/public/register/" + req.params.productName + ".json"
      );
      console.log(filePath);
      if (fs.existsSync(filePath)) {
        fs.readFile(filePath, function (err, buf) {
          if (err) {
            res.json({ error: "No template found" });
          }
          const params = {
            productName: req.params.productName,
            proc: proc,
            core: core,
          };
          const component = ReactDOMServer.renderToString(
            <Register {...params} />
          );
          const appId = proc.metadata.appId;
          const html = `<!DOCTYPE html>
          <html>
            <head>
              <title>Vicencia & Buckley</title>
              <meta charSet="UTF-8" />
              <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
              <meta name="viewport" content="width=device-width, initial-scale=1" />
              <link rel="stylesheet" type="text/css" href="../css/bootstrap.min.css">
              <link rel="stylesheet" type="text/css" href="../css/formio.full.min.css" />
              <link rel="stylesheet" type="text/css" href="../css/custom.css" />
              <script type="text/javascript">
                var formContent = JSON.stringify(${buf});
                var accountId = '${proc.metadata.accountId}'
                var appParams = '${params}';
                var appId='${appId}';
                var productName='${req.params.productName}';
                var baseUrl="${core.config("api.url")}";
              </script>
            </head>
            <body>
              <div id="root">${component}</div>
              <script src="../js/country.js"></script>
              <script src="../js/phonelist.js"></script>
              <script src="../js/jquery.min.js"></script>
              <script src="../js/moment.js"></script>
              <script src="../js/moment-tz.js"></script>
              <script src="../js/formio.full.min.js"></script>
              <script src="../js/custom.js"></script>
              <script src="../js/sweetaleart.js"></script>
            </body>
          </html>
          `;
          res.send(html);
        });
      }
    }
  });
};
