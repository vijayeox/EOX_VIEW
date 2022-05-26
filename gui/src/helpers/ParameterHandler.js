//Utility class for dynamically loading/unloading javascript libraries.
import merge from "deepmerge";
import moment from "moment";
export default class ParameterHandler {
    static replaceParams(appId,route, params,fileId) {
      var finalParams = merge(params ? params : {}, {
        current_date: moment().format("YYYY-MM-DD"),
        fileId: fileId ? fileId : null,
        appId: appId
      });
      if (typeof route == "object") {
        var final_route = JSON.parse(JSON.stringify(route));
        Object.keys(route).map((item) => {
          if (/\{\{.*?\}\}/g.test(route[item])) {
            if (finalParams[item]) {
              final_route[item] = finalParams[item];
            } else {
              if (item == "appId") {
                final_route[item] = appId;
              } else if (item == "fileId" && fileId) {
                final_route[item] = fileId;
              } else {
                final_route[item] = route[item];
              }
              final_route[item] = this.searchAndReplaceParams(route[item],finalParams)
            }
          } else {
            final_route[item] = route[item];
          }
        });
        return final_route;
      } else {
        var regex = /\{\{.*?\}\}/g;
        let m;
        var matches = [];
        do {
          m = regex.exec(route)
          if (m) {
            if (m.index === regex.lastIndex) {
              regex.lastIndex++;
            }
            // The result can be accessed through the `m`-variable.
            matches.push(m);
          }
        } while (m);
        matches.forEach((match, groupIndex) => {
          var param = match[0].replace("{{", "");
          param = param.replace("}}", "");
          if (param.includes(".")) { 
            param = param.split(".");
            let interpolation = finalParams;            
            param.forEach(element => {
              interpolation = interpolation[element];
            });
            route = route.replace(match[0], interpolation);
          } else if (finalParams[param] != undefined) {
            route = route.replace( match[0], finalParams[param] );
          } else {
            route = route.replace(match[0], null );
          }
        });
        return route;
      }
    }
    async updateCall(core,appId,route, body,disableAppId,method) {
        let helper = core.make("oxzion/restClient");
        route = disableAppId ? route : "/app/" + appId + "/" + route;
        let formData = await helper.request(
          "v1",
          route,
          method == "GET" ? {} : body,
          method ? method.toLowerCase() :"post"
        );
        return formData;
    }
    searchAndReplaceParams(route,finalParams){
    var regex = /\{\{.*?\}\}/g;
    let m;
    var matches=[];
    do {
      m = regex.exec(route)
      if(m){
        if (m.index === regex.lastIndex) {
          regex.lastIndex++;
        }
        matches.push(m);
      }
    } while (m);
    matches.forEach((match, groupIndex) => {
      var param = match[0].replace("{{", "");
      param = param.replace("}}", "");
      if(finalParams[param] !=undefined){
        route = route.replace(
          match[0],
          finalParams[param]
          );
      } else {
        route = route.replace(
          match[0],
          null
          );
      }
    });
    return route
  }
  static async updateCall(core,appId,route, body,disableAppId,method) {
    let helper = core.make("oxzion/restClient");
    route = disableAppId ? route : "/app/" + appId + "/" + route;
    let formData = await helper.request(
      "v1",
      route,
      method == "GET" ? {} : body,
      method ? method.toLowerCase() :"post"
    );
    return formData;
  }
  static searchAndReplaceParams(route,finalParams){
    var regex = /\{\{.*?\}\}/g;
    let m;
    var matches=[];
    do {
      m = regex.exec(route)
      if(m){
        if (m.index === regex.lastIndex) {
          regex.lastIndex++;
        }
        matches.push(m);
      }
    } while (m);
    matches.forEach((match, groupIndex) => {
      var param = match[0].replace("{{", "");
      param = param.replace("}}", "");
      if(finalParams[param] !=undefined){
        route = route.replace(
          match[0],
          finalParams[param]
          );
      } else {
        route = route.replace(
          match[0],
          null
          );
      }
    });
    return route
  }
  
  static async downloadFile(response) {
    try {
      const file = await response.blob();
      const fileName = response.headers
        .get("content-disposition")
        .split(";")
        .find((n) => n.includes("filename="))
        .replace("filename=", "")
        .replaceAll('"', "")
        .trim();
  
      if (window.navigator.msSaveOrOpenBlob)
        // IE10+
        window.navigator.msSaveOrOpenBlob(file, fileName);
      else {
        const ele = document.createElement("a");
        ele.href = URL.createObjectURL(file);
        ele.download = fileName;
        ele.click();
      }
      return true;
    } catch (error) {
      return false;
    }
  
  }
}