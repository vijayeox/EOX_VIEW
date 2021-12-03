import merge from "deepmerge";
import moment from "moment";
// import osjs from "osjs";
// let helper = osjs.make("oxzion/restClient");

class Requests {
    static async getDashboardHtmlDataByUuid(core,uuid) {
        let helper = core.make("oxzion/restClient");
        let response = await helper.request("v1","analytics/dashboard/" + uuid,{},"get");
        return response;
    }

    static async getWidgetByUuid(core, uuid, filterParams) {
        let helper = core.make("oxzion/restClient");
        let filterParameter = (filterParams && filterParams != [] && filterParams.length != 0) ? ("&filter=" + JSON.stringify(filterParams)) : ''
        let response = await helper.request("v1","analytics/widget/" + uuid + '?data=true' + filterParameter,{},"get");
        return response;
    }

  static async getDocumentsListService(core, appId, url) {
    let helper = core.make("oxzion/restClient");
    let response = await helper.request(
      "v1",
      "/app/" + appId + "/" + url,
      {},
      "get"
    );
    return response;
  }

  static async deleteFile(core, appId, fileId, attachementId) {
    let helper = core.make("oxzion/restClient");
    let response = await helper.request(
      "v1",
      "/app/" +
        appId +
        "/file/" +
        fileId +
        "/attachment/" +
        attachementId +
        "/remove",
      {},
      "delete"
    );
    return response;
  }

  static async renameFile(core, appId, fileId, attachementId, name) {
    let helper = core.make("oxzion/restClient");
    let response = await helper.request(
      "v1",
      "/app/" + appId + "/file/" + fileId + "/attachment/" + attachementId,
      { name: name },
      "post"
    );
    return response;
  }

  static async getMenulist(core, appId) {
    let helper = core.make("oxzion/restClient");
    let menulist = await helper.request(
      "v1",
      "/app/" + appId + "/menu",
      {},
      "get"
    );
    return menulist;
  }

  static doRestRequest = (
    core,
    url,
    params,
    method,
    successHandler,
    failureHandler,
    loader
  ) => {
    if (!loader) {
      loader = core.make("oxzion/splash");
    }
    loader.show();
    let restResponse = core
      .make("oxzion/restClient")
      .request("v1", url, params ? params : {}, method ? method : "get");
    function handleNonSuccessResponse(response) {
      console.info(
        `Received a non-success status from server for URL ${url}. JSON:${JSON.stringify(
          response
        )}.`
      );
      if (loader) {
        loader.destroy();
      }
      if (failureHandler) {
        response.url = url;
        response.params = params;
        try {
          failureHandler(response);
        } catch (e) {
          console.error(response);
        }
      } else {
        Swal.fire({
          type: "error",
          title: "Oops...",
          text: "Unexpected error occurred. Please try after some time.",
        });
      }
    }
    restResponse
      .then(function (response) {
        if (response.status !== "success") {
          handleNonSuccessResponse(response);
        } else {
          if (successHandler) {
            let responseObject = {
              url: url,
              params: params,
              status: "success",
            };
            let dataContent = response.data;
            for (let property in dataContent) {
              if (
                property === "url" ||
                property === "params" ||
                property === "status"
              ) {
                throw `Reserved property name ${property} used in REST response. Modify the server side controller to use some other property name.`;
              }
              responseObject[property] = dataContent[property];
            }
            try {
              successHandler(responseObject);
            } catch (e) {
              console.error(e);
            }
          }
        }
      })
      .catch(function (response) {
        handleNonSuccessResponse(response);
      })
      .finally(function (response) {
        if (loader) {
          loader.destroy();
        }
      });
  };

  static async DeleteEntry(core,api, dataItem) {
    let helper = core.make("oxzion/restClient");
    let response = await helper.request(
      "v1",
      "/" + api + "/" + dataItem,
      {},
      "delete"
    );
    return response;
  }

  static async retryCall(core,api,dataItem) {
    let helper2 = core.make("oxzion/restClient");
    let response = await helper2.request(
      "v1",
      api+"/"+ dataItem.id + "/retry",
      {},
      "post"
    );
    return response;
  }

  static async resetPasswordCall(core,username) {
    let helper = core.make("oxzion/restClient");
    let response = await helper.request(
      "v1",
      "user/me/forgotpassword",
      { username: username },
      "post"
    );
    return response;
  }
}
export default Requests;
