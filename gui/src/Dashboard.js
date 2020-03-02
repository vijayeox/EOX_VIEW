import React, { Component } from "react";
import WidgetRenderer from "./WidgetRenderer";

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.core = this.props.core;
    this.state = {
      htmlData: this.props.htmlData ? this.props.htmlData : null
    };
    this.content = this.props.content;
    var uuid = '';
    if(this.props.uuid){
      uuid = this.props.uuid;
    }
    if(this.props.content){
      var content = JSON.parse(this.props.content)
      if(content && content.uuid){
        uuid = content.uuid;
      }
    }
    this.uuid = uuid;
    console.log(this.uuid);
    this.loader = this.core.make("oxzion/splash");
    this.helper=this.core.make("oxzion/restClient");
    this.props.proc.on("destroy", () => {
      this.removeScriptsFromDom();
    });
  }

  async GetDashboardHtmlDataByUUID(uuid) {
    let response = await this.helper.request(
      "v1",
      "analytics/dashboard/" + uuid,
      {},
      "get"
    );
    return response;
  }
  async GetWidgetByUUID(uuid) {
    let response = await this.helper.request(
      "v1",
      "analytics/widget/" + uuid+'?data=true',
      {},
      "get"
    );
    return response;
  }

  componentDidMount() {
    if (this.uuid) {
      this.loader.show();
      this.GetDashboardHtmlDataByUUID(this.uuid).then(response => {
        this.loader.destroy();
        if (response.status == "success") {
          this.setState({
            htmlData: response.data.dashboard.content ? response.data.dashboard.content : null
          });
            this.callUpdateGraph();
        } else {
          this.setState({
            htmlData: `<p>No Data</p>`
          });
        }
      });
    } else if (this.state.htmlData != null) {
      this.callUpdateGraph();
    }
    window.addEventListener('message', this.widgetDrillDownMessageHandler, false);
  }

  componentWillUnmount() {
    if (this.chart) {
      this.chart.dispose();
    }
    window.removeEventListener('message', this.widgetDrillDownMessageHandler, false);
  }

  componentDidUpdate(prevProps) {
    if (this.props.htmlData) {
      if (this.props.htmlData !== prevProps.htmlData) {
        this.setState({
          htmlData: this.props.htmlData
        });
      }
    }
  }

  callUpdateGraph = () => {
      var self = this;
      if (this.state.htmlData != null) {
        var root = document;
        self.updateGraph(root);
      }
  };

  updateGraph = root => {
    var widgets = root.getElementsByClassName("oxzion-widget");
    for(let widget of widgets)
    {
        var attributes = widget.attributes;
        var widgetUUId = attributes['data-oxzion-widget-id'].value;
        this.GetWidgetByUUID(widgetUUId).then(response => {
          WidgetRenderer.render(widget, response.data.widget);
        })
    }
  };

    widgetDrillDownMessageHandler = (event) => {
        let data = event.data;
        if (data['action'] !== 'oxzion-widget-drillDown') {
            return;
        }

        let elementId = data['elementId'];
        let widgetId = data['widgetId'];
//        let chart = this.renderedCharts[elementId];
//        if (chart) {
//            if (chart.dispose) {
//                chart.dispose();
//            }
//            this.renderedCharts[elementId] = null;
//        }
        let replaceWidgetId = data['replaceWith'];
        if (replaceWidgetId) {
            let widgetElement = document.querySelector('#' + elementId);
            widgetId = replaceWidgetId;
            widgetElement.setAttribute('data-oxzion-widget-id', replaceWidgetId);
        }
        thiz.callUpdateGraph();
    }

  render() {
    return <div dangerouslySetInnerHTML={{ __html: this.state.htmlData }} />;
  }
}

export default Dashboard;
