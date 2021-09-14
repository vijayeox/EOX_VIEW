import React, { Component } from "react";
import ReactDOM from 'react-dom';
import { Button } from 'react-bootstrap';

class SSOCustom extends Component {

    constructor(props) {
        super(props);
        this.core = this.props.args;
        this.appId = this.props.appId;
        this.params = this.props.params;
        this.state = {
            authorizedUrl: '',
            externalUrl: this.props.args.externalUrl ? this.props.args.externalUrl : undefined, // Format/Example?
            redirectUrl: this.props.args.redirectUrl ? this.props.args.redirectUrl : undefined, // Format/Example?
            emailForSSO: this.props.args.emailForSSO ? this.props.args.emailForSSO : false,
            awaitingResponse: true,
            content: this.props.content,
            appUuid: '51c59337-9ac2-40d5-9775-d76094c1e861' //hardcoded val
        }

        let profile = this.core.make("oxzion/profile").get();
        console.log("Constructor -> this.state", this.state);
        console.log("Constructor -> this.profile", profile);
    }

    async getURL(url) {
        let fileContent = await this.helper.request("v1", url, {}, "get");
        return fileContent;
      }

    async getExternalURL(url) {
        let uiUrl = this.core.config("ui.url");
        let externalUrl = uiUrl + url;
        let resp = await fetch(externalUrl, {
            method: "post",
        });
        return resp;
    }

    generateToken() {
        console.log("Generate Token Called");
        if (this.state.externalUrl != undefined) {
            this.getExternalURL(this.state.externalUrl)
                .then((response) => {
                    if (response.ok) {
                        response.text().then((value) => {
                            this.setState({
                                content: value,
                            });
                        });
                    }
                }).catch((e) => {
                    console.log("Error " + e);
                });
        } else if (this.state.redirectUrl) {
            let url = this.state.redirectUrl;
            if (this.state.emailForSSO) {
                url += '?emailForSSO=' + this.profile.key.email;
            }
            this.getURL(url).then((response) => {
                if (response.status == "success") {
                    if (response.data.authorizedUrl) {
                        this.setState({ authorizedUrl: response.data.authorizedUrl });
                    }
                    this.setState({ awaitingResponse: false });
                }
            });
        } else if (this.state.content) {
            this.preRender();
        }
    }

    onSSOClicked = () => {
        this.generateToken();
        
        // generates token in the form \n
        // open the Authorized URL we get from PHP (delegate file)
        // Ex. "https://www.speedgauge.net/access/jwt?token=exampleToken&redirect_to=https://www.speedgauge.net/insurance";
        
        // authorizedUrl = this.state.authorizedUrl 
        // window.open(authorizedUrl, "_blank"); 
    }


// Necessary functions
    // Necessary for prerender()
    searchAndReplaceParams(content, params) {
        var regex = /\{data\.(.*)?\}/g;
        let m;
        var matches = [];
        do {
          m = regex.exec(content);
          if (m) {
            if (m.index === regex.lastIndex) {
              regex.lastIndex++;
            }
            matches.push(m);
          }
        } while (m);
        matches.forEach((match, groupIndex) => {
          if (params[match[1]] != undefined && this.isHTML(params[match[1]])) {
            content = content.replace(match[0], params[match[1]]);
          }
        });
        content = this.getXrefFields(content);
        return content;
      }
// Necessary for prerender()      
      updateGraph = async (filterParams) => {
        if (false === this.state.dataReady) {
          return;
        }
        let root = document.getElementById(this.fileDivID);
        var widgets = root.getElementsByClassName("oxzion-widget");
        let thiz = this;
        // this.loader.show();
        let errorFound = false;
        for (let elementId in this.renderedWidgets) {
          let widget = this.renderedWidgets[elementId];
          if (widget) {
            if (widget.dispose) {
              widget.dispose();
            }
            delete this.renderedWidgets[elementId];
          }
        }
        if (widgets.length == 0) {
          this.loader.destroy();
        } else {
          for (let widget of widgets) {
            var attributes = widget.attributes;
            //dispose
            var that = this;
            var widgetUUId =
              attributes[WidgetDrillDownHelper.OXZION_WIDGET_ID_ATTRIBUTE].value;
            Requests.getWidgetByUuid(that.core, widgetUUId, filterParams).then(
              (response) => {
                if (response.status == "success") {
                  that.setState({ widgetCounter: that.state.widgetCounter + 1 });
                  if ("error" === response.status) {
                    console.error("Could not load widget.");
                    console.error(response);
                    errorFound = true;
                  } else {
                    //dispose if widget exists
                    let hasDashboardFilters = that.state.preparedDashboardFilter
                      ? true
                      : false;
                    let renderproperties = {
                      element: widget,
                      widget: response.data.widget,
                      hasDashboardFilters: hasDashboardFilters,
                      dashboardEditMode: false,
                    };
                    let widgetObject = WidgetRenderer.render(renderproperties);
                    console.log(widgetObject);
                    if (widgetObject) {
                      that.renderedWidgets[widgetUUId] = widgetObject;
                    }
                  }
                  if (that.state.widgetCounter >= widgets.length) {
                    that.loader.destroy();
                  }
                } else {
                  that.setState({ widgetCounter: that.state.widgetCounter + 1 });
                  if (that.state.widgetCounter >= widgets.length) {
                    that.loader.destroy();
                  }
                }
              }
            );
          }
        }
        if (errorFound) {
          Swal.fire({
            type: "error",
            title: "Oops ...",
            text: "Could not load one or more widget(s). Please try after some time.",
          });
          return;
        }
      };

      preRender() {
        var that = this;
    
        var fileData = {};
        for (const [key, value] of Object.entries(this.state.fileData)) {
          fileData[key] = value;
        }
        content = this.searchAndReplaceParams(this.state.content, fileData);
    
        this.setState({ content: content, fileData: fileData });
        var rawHTML = ReactDOMServer.renderToString(
          <JsxParser
            autoCloseVoidElements
            className={this.props.className}
            jsx={this.state.content}
            bindings={{
              data: this.state.fileData ? this.state.fileData : {},
              item: this.state.fileData ? this.state.fileData : {},
              moment: moment,
              formatDate: this.formatDate,
              formatDateWithoutTimezone: this.formatDateWithoutTimezone,
              profile: this.profile.key,
            }}
          />
        );
        this.setState({ outputHtml: rawHTML, dataReady: true }, () => {
          that.updateGraph();
          var viewerElement = document.getElementById(this.fileDivID);
          if (
            viewerElement &&
            viewerElement.parentNode &&
            viewerElement.parentNode.parentNode
          ) {
            that.observer.observe(viewerElement.parentNode.parentNode, {
              attributes: true,
            });
          }
        });
      }
// End of Necessary functions
    render() {
        return (
            <div>
                <Button style={{margin:"1%"}} onClick={this.ssoClicked}>
                    <i className="fa fa-external-link"></i>
                </Button>
            </div >
        );
    }
}

export default SSOCustom;