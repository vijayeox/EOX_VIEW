import React from "react";
import { Popup } from "@progress/kendo-react-popup";
import { Button } from "@progress/kendo-react-buttons";
import PageContent from "./PageContent";

class Page extends React.Component {
  constructor(props) {
    super(props);
    this.core = this.props.core;
    this.appId = this.props.app;
    this.proc = this.props.proc;
    this.loader = this.core.make("oxzion/splash");
    this.currentRow = this.props.currentRow;
    this.pageContentRef = React.createRef();
    this.componentKey = this.props.pageId + "_page";
    this.contentDivID = "root_" + this.appId + "_" + this.props.pageId;
    this.postSubmitCallback = this.props.postSubmitCallback;
    this.params = this.props.params;
    this.parentRowData = props.parentRowData;
    this.state = {
      pageId: this.props.pageId,
      fileId: this.props.fileId,
      showLoader: false,
      pageContent: this.props.pageContent ? this.props.pageContent : null,
      icon: this.props.icon ? this.props.icon : null,
      fileData: this.props.fileData ? this.props.fileData : {},
      isMenuOpen: false,
      title: "",
      displaySection: "DB",
      params: this.props.params ? this.props.params : null,
      sectionData: null,
    };
    if (this.props.pageId && !this.props.pageId.includes("_subpage")) {
      this.loadPage(this.props.pageId);
    } else {
      this.loader.destroy();
    }
  }

  loadPage(pageId, icon, hideLoader) {
    this.getPageContent(pageId).then((response) => {
      if (response.status == "success") {
        this.setState({ pageContent: response.data.content }, hideLoader ? this.setState({ showLoader: false }) : null);
        this.setState({ showLoader: false });
        let responseContent = response.data;
        icon ? (responseContent.icon = icon) : null;
      }
      this.loader.destroy();
    });
  }
  async getPageContent(pageId) {
    let helper = this.core.make("oxzion/restClient");
    let pageContent = await helper.request("v1", "/app/" + this.appId + "/page/" + pageId, {}, "get");
    return pageContent;
  }

  componentDidUpdate(prevProps) {
    if (this.props.pageId !== prevProps.pageId) {
      if (this.props.pageId) {
        var PageRenderDiv = document.querySelector(".PageRender");
        this.loader.show(PageRenderDiv);
        this.loadPage(this.props.pageId);
      } else {
        this.loader.destroy();
      }
    }
  }

  stepDownPage() {
    let ev = new CustomEvent("stepDownPage", {
      detail: {},
      bubbles: true,
    });
    if (document.getElementById("navigation_" + this.props.app)) {
      document.getElementById("navigation_" + this.props.app).dispatchEvent(ev);
    }
  }

  setTitle = (title) => {
    this.setState({ title: title });
  };

  hideMenu = () => {
    this.setState({ isMenuOpen: false });
  };

  switchSection = (section, data) => {
    this.hideMenu();
    this.setState({ displaySection: section, sectionData: data });
  };

  render() {
    if (this.state.pageContent && this.state.pageContent.length > 0 && !this.state.showLoader) {
      this.loader.destroy();
      if (this.props.popupConfig) {
        return (
          <Popup anchor={document.getElementById("navigation_" + this.appId)} appendTo={document.getElementById("navigation_" + this.appId)} show={true} popupClass={"popup-content"} {...this.props.popupConfig}>
            <PageContent
              ref={this.pageContentRef}
              key={this.componentKey}
              core={this.props.core}
              pageId={this.props.pageId}
              appId={this.appId}
              isTab={this.props.isTab}
              params={this.props.params}
              fileId={this.props.fileId}
              notif={this.props.notif}
              parentPage={this.props.parentPage}
              proc={this.props.proc}
              pageContent={this.state.pageContent}
              loadPage={this.props.loadPage}
              fileData={this.state.fileData}
              currentRow={this.props.currentRow}
              postSubmitCallback={this.props.postSubmitCallback}
              parentRowData={this.parentRowData}
            />
            <div style={{ display: "contents" }}>
              <Button primary={true} onClick={() => this.stepDownPage()}>
                Cancel
              </Button>
            </div>
          </Popup>
        );
      } else {
        return (
          <PageContent
            ref={this.pageContentRef}
            key={this.componentKey}
            core={this.props.core}
            pageId={this.props.pageId}
            appId={this.appId}
            isTab={this.props.isTab}
            params={this.props.params}
            fileId={this.props.fileId}
            notif={this.props.notif}
            parentPage={this.props.parentPage}
            proc={this.props.proc}
            pageContent={this.state.pageContent}
            loadPage={this.props.loadPage}
            fileData={this.state.fileData}
            currentRow={this.props.currentRow}
            postSubmitCallback={this.props.postSubmitCallback}
            parentRowData={this.parentRowData}
          />
        );
      }
    } else {
      this.loader.show();
      return <div></div>;
    }
  }
}

export default Page;
