
//Utility class for dynamically loading/unloading javascript libraries.
class PageNavigation {
    static loadPage(appId,parentPage,pageId, icon, hideLoader,name,currentRow,pageContent,fileId) {
      let ev = new CustomEvent("addPage", {
        detail: {
          pageId: pageId,
          title: name,
          icon: icon,
          nested: true,
          currentRow: currentRow,
          parentPage: parentPage,
          pageContent: pageContent,
          fileId: fileId
        },
        bubbles: true
      });
      document.getElementById("navigation_"+appId).dispatchEvent(ev);
  }
}
export default PageNavigation;