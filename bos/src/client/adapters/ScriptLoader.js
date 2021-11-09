//By Nikhil
import { ServiceProvider } from "@osjs/common";

export class ScriptLoaderServiceProvider extends ServiceProvider {
  constructor(core, options = {}) {
    super(core, options || {});
    this.core = core;
    this.token = null;
    this.baseUrl = this.core.config("wrapper.url");
  }

  providers() {
    return ["oxzion/scriptLoader"];
  }

  async init() {
    this.core.instance("oxzion/scriptLoader", () => ({
      loadScript: (element, src) => this.scriptLoader(element, src),
      unloadScript: (element, src) => this.scriptUnloader(element, src)
    }));
  }

  isMyScriptLoaded(root, src) {
    var scripts = root.getElementsByTagName("script");
    for (var i = scripts.length; i--; ) {
      if (scripts[i].src == src){
        var scriptCount = scripts[i].getAttribute("count");
        scripts[i].setAttribute("count",++scriptCount);     //increment count if already there
        return true;
      }
    }
    return false;
  }

  async scriptLoader(root, src) {
    if (!this.isMyScriptLoaded(root, src)) {
      new Promise((resolve, reject) => {
        const el = document.createElement("script");
        el.onreadystatechange = function() {
          if (this.readyState === "complete" || this.readyState === "loaded") {
            resolve(el);
          }
        };
        el.onerror = err => reject(err);
        el.onload = () => resolve(el);
        el.src = src;
        var att = document.createAttribute("count");        //set count attribute to got to know when to remove from DOM
        att.value = 1;                                      //initial 1
        el.setAttributeNode(att);

        root.appendChild(el);
        return el;
      });
    }
  }

  async unLoadScriptFromDom(root, src) {
    var scripts = root.getElementsByTagName("script");
    for (var i = scripts.length; i--; ) {
      if (scripts[i].src == src) {
        var scriptCount = scripts[i].getAttribute("count");
        if(scriptCount == 1){                               //remove script if count = 1
            scripts[i].parentNode.removeChild(scripts[i]);
        }
        else{
            scripts[i].setAttribute("count",--scriptCount);
        }
        return true;
      }
    }
    return false;
  }

  async scriptUnloader(root, src) {
    this.unLoadScriptFromDom(root, src);
  }

  async loadScriptToDom(root, src) {
    try {
      let sc = this.scriptLoader(root, src);
      console.log(sc);
      sc.then(
        onfulfilled => {
          console.log("success");
        },
        onrejected => {
          console.log("failed");
        }
      );
    } catch (e) {
      return Promise.reject(e);
    }
  }
}
