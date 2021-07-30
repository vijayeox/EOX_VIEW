import React from "react";
import { v4 } from "uuid";
import PageContent from "./PageContent";
import { Tabs, TabLink, TabContent } from "react-tabs-redux";
import "./Styles/TabStyles.scss";

class TabSegment extends React.Component {
  constructor(props) {
    super(props);
    this.core = this.props.core;
    this.proc = this.props.proc;
    this.profileAdapter = this.core.make("oxzion/profile");
    this.profile = this.profileAdapter.get();
    this.appId = this.props.appId;
    this.pageId = this.props.pageId;
    this.tabs = this.props.tabs;
    this.fileId = this.props.fileId;
    this.currentRow = this.props.currentRow;
    this.state = {
      content: this.props.content,
      pageContent: [],
      dataReady: false,
      currentRow: this.props.currentRow ? this.props.currentRow : {},
      fileData: this.props.fileData ? this.props.fileData : {},
      tabNames: [],
      tabContent: [],
      tabs: this.props.tabs ? this.props.tabs : [],
    };
    if (this.props.tabs.length > 1) {
      var tabNames = [];
      var tabContent = [];
      this.props.tabs.map((item, i) => {
        let uuidv4 = v4();
        tabNames.push(
          <TabLink to={item.uuid ? item.uuid : uuidv4}> {item.name}</TabLink>
        );
        var tabContentKey = (item.uuid ? item.uuid : uuidv4) + "_tab";
        var fileData = item.fileData ? item.fileData : {};
        tabContent.push(
          <TabContent
            for={item.uuid ? item.uuid : uuidv4}
            key={item.uuid ? item.uuid : uuidv4}
            visibleClassName="visibleTabStyle"
          >
            <PageContent
              key={tabContentKey}
              config={this.props.config}
              proc={this.props.proc}
              isTab="true"
              appId={this.props.appId}
              parentPage={this.pageId}
              fileData={fileData}
              currentRow={this.state.currentRow}
              pageContent={item.content}
              pageId={item.pageId}
              fileId={this.fileId}
              core={this.core}
            />
          </TabContent>
        );
      });
      this.state.tabNames = tabNames;
      this.state.tabContent = tabContent;
      this.state.dataReady = true;
    }
  }
  componentDidUpdate(prevProps) {
    if (prevProps.tabs !== this.props.tabs) {
      this.setState({ tabs: this.props.tabs });
      if (this.props.tabs.length > 1) {
        var tabNames = [];
        var tabContent = [];
        this.props.tabs.map((item, i) => {
          let uuidv4 = v4();
          tabNames.push(
            <TabLink to={item.uuid ? item.uuid : uuidv4}> {item.name}</TabLink>
          );
          var tabContentKey = (item.uuid ? item.uuid : uuidv4) + "_tab";
          tabContent.push(
            <TabContent
              for={item.uuid ? item.uuid : uuidv4}
              key={item.uuid ? item.uuid : uuidv4}
            >
              <PageContent
                key={tabContentKey}
                config={this.props.config}
                proc={this.props.proc}
                isTab="true"
                appId={this.props.appId}
                parentPage={this.pageId}
                pageContent={item.content}
                pageId={this.pageId}
                fileId={this.fileId}
                currentRow={this.state.currentRow}
                core={this.core}
              />
            </TabContent>
          );
        });
        this.setState({ tabNames: tabNames });
        this.setState({ tabContent: tabContent });
      }
    }
  }

  render() {
    if (this.state.tabs && this.state.tabs.length == 1) {
      return (
        <PageContent
          key={this.state.tabs[0].uuid}
          config={this.props.config}
          proc={this.props.proc}
          appId={this.props.appId}
          fileId={this.fileId}
          pageContent={
            this.state.tabs[0].content ? this.state.tabs[0].content : null
          }
          currentRow={this.state.currentRow}
          core={this.core}
        />
      );
    } else if (this.state.tabs && this.state.dataReady) {
      return (
        <Tabs
          name="tabs2"
          className="tabs"
          selectedTab={this.state.tabs[0].uuid}
        >
          <div className="links">{this.state.tabNames}</div>
          <div className="tabContentDiv">{this.state.tabContent}</div>
        </Tabs>
      );
    } else {
      return <div>No Content to Display</div>;
    }
  }
}

export default TabSegment;
