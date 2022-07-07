import React from "react";
import merge from "deepmerge";
import moment from "moment";

class RenderButtons extends React.Component {
  constructor(props) {
    super(props);
    this.core = this.props.core;
    this.appId = this.props.appId;
    this.pageId = this.props.pageId;
    this.fileData = this.props.currentRow;
    this.appNavigationDiv = "navigation_" + this.appId;
    this.userProfile = this.props.core
      ? this.props.core.make("oxzion/profile").get().key
      : undefined;
  }

  createTiles = () => {
    let adminItems = [];
    var rowData = this.fileData;
    (this.props.content || []).buttonList.map((currentValue, index) => {
      var showButton;
      if (currentValue.rule) {
        const profile = this.userProfile; //for eval
        var string = this.replaceParams(currentValue.rule, rowData);
        var _moment = moment;
        string = string.replace(/moment/g, "_moment");
        showButton = eval(string);
      } else {
        showButton = true;
      }
      var copyPageContent = [];
      var that = this;
      if (currentValue.details && currentValue.details.length > 0) {
        currentValue.details.every(async (item, index) => {
          if (item.params && item.params.page_id) {
            copyPageContent.pageId = item.params.page_id;
          } else if (item.pageId) {
            copyPageContent.pageId = item.page_id;
          } else {
            var pageContentObj = item;
            pageContentObj = that.replaceParams(item, rowData);
            copyPageContent.push(pageContentObj);
          }
        });
      }
      var pageDetails = {title:currentValue.name,pageContent:copyPageContent,pageId:currentValue.pageId,icon:currentValue.icon,parentPage:this.pageId}
      if(showButton){
          const isExportPdf = currentValue?.details?.find((detail) => detail?.type === 'exportPdf')
          adminItems.push(
          <button
            key={index}
            className="btn btn-primary"
            onClick={() => {
              let p_ev = new CustomEvent("addPage", {
                detail: pageDetails,
                bubbles: true,
              });
              document
                .getElementById(this.appNavigationDiv)
                .dispatchEvent(
                  isExportPdf ? new CustomEvent("exportPdf") : p_ev
                );
            }}
          >
            <div className="block">
              {currentValue.icon ? (
                <i className={currentValue.icon} title={currentValue.name}></i>
              ) : (
                currentValue.name
              )}
            </div>
            {/* {currentValue.icon ? (
              <div className="titles">{currentValue.name}</div>
            ) : null} */}
          </button>
        );
      }
    });
    return adminItems;
  };
  replaceParams(route) {
    var finalParams = merge(this.fileData ? this.fileData : {}, {
      current_date: moment().format("YYYY-MM-DD"),
      appId: this.appId,
    });
    if (typeof route == "object") {
      var final_route = JSON.parse(JSON.stringify(route));
      Object.keys(route).map((item) => {
        if (/\{\{.*?\}\}/g.test(route[item])) {
          if (finalParams[item]) {
            final_route[item] = finalParams[item];
          } else {
            if (item == "appId") {
              final_route[item] = this.appId;
            } else {
              final_route[item] = route[item];
            }
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
        m = regex.exec(route);
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
        if (finalParams[param] != undefined) {
          route = route.replace(match[0], finalParams[param]);
        } else {
          route = route.replace(match[0], null);
        }
      });
      return route;
    }
  }
  updateActionHandler(details, rowData) {
    var that = this;
    return new Promise((resolve) => {
      var queryRoute = that.replaceParams(details.params.url, rowData);
      that.updateCall(queryRoute, rowData).then((response) => {
        that.setState({
          showLoader: false,
        });
        resolve(response);
      });
    });
  }
  render() {
    return <div className="dash-manager-buttons w-100 text-right pt-2 pr-2">{this.createTiles()}</div>;
  }
}

export default RenderButtons;
