export default class GlobalLinkHandler {
  constructor(core, args = {}) {
    this.core = core;
  }

  destroy() {}

  async init() {
    document.addEventListener("click", (event) => {
      const EOXCore = this.getCore();
      if (event.target.tagName == "A") {
        if (event.target.href == undefined || event.target.href == "" || event.target.href == "#") {
          event.preventDefault();
          event.stopPropagation();
          if (event.target.getAttribute("eoxapplication") !== null) {
            var selectedApplication = event.target.getAttribute("eoxapplication");
            const packages = EOXCore.make("osjs/packages").getPackages((m) => m.type === "application");
            if (packages.some((app) => app.name == selectedApplication)) {
              let selectedApplicationProps = packages.filter((e) => e.name == selectedApplication)[0];
              let checkRunning = EOXCore.make("osjs/packages").running().some((app) => app == selectedApplication);
              var appNavElement = "navigation_" + selectedApplicationProps.appId;
              if (checkRunning) {
                if (document.getElementById(appNavElement)) {
                  this.triggerPageLoad(event, appNavElement);
                } else {
                  this.launchApplication(event, selectedApplication);
                }
              } else {
                this.launchApplication(event, selectedApplication);
              }
            }
          }
        }
      }
    });
  }

  getCore() {
    return this.core;
  }
  async getFileDetails(fileId) {
    let helper = this.core.make("oxzion/restClient");
    let fileContent = await helper.request("v1","/file/" + fileId + "/data" ,{},"get");
    return fileContent;
  }

  triggerPageLoad(event, appNavElement) {
    let ev = new CustomEvent("addPage", {
      detail: {
        pageId: event.target.getAttribute("page-id"),
        title: event.target.getAttribute("title"),
        icon: event.target.getAttribute("icon"),
        fileId: event.target.getAttribute("file-id"),
      },bubbles: true,});
    document.getElementById(appNavElement).dispatchEvent(ev);
  }

  launchApplication(event, selectedApplication) {
    let helper = this.core.make("oxzion/link");
    helper.launchApp({
      pageId: event.target.getAttribute("page-id"),
      pageTitle: event.target.getAttribute("title"),
      pageIcon: event.target.getAttribute("icon"),
      fileId: event.target.getAttribute("file-id"),
    },selectedApplication);
  }
}
