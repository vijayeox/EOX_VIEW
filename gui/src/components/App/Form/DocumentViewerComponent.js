import Base from "formiojs/components/_classes/component/Component";
import editForm from "formiojs/components/table/Table.form";
import "viewerjs/dist/viewer.css";
import Viewer from "viewerjs";
import { Formio } from "formiojs";
import * as _lodash from "lodash";

export default class DocumentViewerComponent extends Base {
  constructor(component, options, data) {
    var formOptions = Formio.getPlugin("optionsPlugin");
    var customOptions = _lodash.default.merge(options, formOptions.options);
    if(customOptions.core == null || customOptions.core == undefined){
        console.log(customOptions);
    }
    super(component, customOptions, data);
    component.core = customOptions.core;
    component.appId = customOptions.appId;
    component.uiUrl = customOptions.uiUrl;
    component.wrapperUrl = customOptions.wrapperUrl;
    this.form = this.getRoot();
    var that = this;
    this.form.on("change", changed => {
      if(changed.data[that.component.refreshOn]){
          setTimeout(function() {
            that.setValue(changed.data[that.component.refreshOn]);
            that.bindHandlers();
          }, 200);
      }
    });
  }

  //disable
  static schema(...extend) {
    return Base.schema(
      {
        label: "documentviewer",
        type: "documentviewer"
      },
      ...extend
    );
  }
  setValue(value) {
    this.value = JSON.stringify(value);
    this.dataValue = JSON.stringify(value);
  }
  get defaultSchema() {
    return DocumentViewerComponent.schema();
  }
  static builderInfo = {
    title: "Document",
    group: "basic",
    icon: "fa fa-file",
    weight: 70,
    schema: DocumentViewerComponent.schema()
  };
  //disable

  displayImage(show, src) {
    if (show) {
      this.imageViewer ? this.imageViewer.destroy() : null;
      this.imageViewer = new Viewer(document.getElementById(src), {
        inline: true,
        button: false,
        navbar: false,
        toolbar: {
          zoomIn: true,
          zoomOut: true,
          oneToOne: true,
          reset: true,
          rotateLeft: true,
          rotateRight: true,
          flipHorizontal: true,
          flipVertical: true
        }
      });
    } else {
      this.imageViewer ? this.imageViewer.destroy() : null;
    }
  }
  // onChange(flags, fromRoot){
  bindHandlers() {
    if(this.previousValue == this.dataValue){
      return;
    }
    var component = this.component;
    this.previousValue = this.dataValue;
    var dataValue = this.dataValue;

    var value = this.value;
    try{
      dataValue = JSON.parse(dataValue);
    } catch(e){
      console.log(dataValue + 'Not a JSON');
    }
    var that = this;
    this.fileList = this.generateFileList(dataValue, component);
    this.redraw();
    if (dataValue && dataValue != undefined) {
      var elements = document.getElementsByClassName(component.key + "-selectFile");
      if (elements.length > 0) {
        component.bindHandlers = true;
      }
    }
  }
  attach(element){
    var that = this;
    if(element){
    var elements = element.getElementsByClassName(
        that.key + "-selectFile"
      );
      Array.from(elements).forEach(function(ele) {
        ele.addEventListener("click", function(event) {
          var file = this.parentElement.parentElement.getAttribute("data-file");
          var url = this.parentElement.getAttribute("data-url");
          if (!url) {
            url = this.parentElement.parentElement.getAttribute("data-url");
          }
          document.getElementById(that.key + "-filePreviewModal").style.display = "block";
          var fileType = this.parentElement.parentElement.getAttribute("data-type").toLowerCase();
          if (fileType == "png" || fileType == "jpeg" || fileType == "jpg") {
            document.getElementById(that.key + "-filePreviewWindow").innerHTML = '<img id="imagesPreview" src="' + url + '" style="display:none;" key="' + url +'"></img>';
            that.displayImage(true, that.key + "-filePreviewWindow");
          } else {
            document.getElementById(that.key + "-filePreviewWindow").innerHTML ='<iframe src="' + url +'" allowTransparency="true" frameborder="0" scrolling="yes" style="width:100%;height:100%;" class="iframeDoc" key="' +url + '"></iframe>';
          }
          event.stopPropagation();
        });
      });

      var downloadElements = element.getElementsByClassName(that.key + "-downloadFile");
      Array.from(downloadElements).forEach(function(ele) {
        ele.addEventListener("click", function(event) {
          var url = this.parentElement.getAttribute("data-url");
          if (!url) {
            url = this.parentElement.parentElement.getAttribute("data-url");
          }
          // url = url ? url : this.parentElement.getAttribute("data-downloadurl");
          window.open(url, "_blank");
          event.stopPropagation();
        });
      });
      var closeFile = document.getElementById(that.key + "-closeFile");
      if (closeFile) {
        closeFile.addEventListener("click", function(event) {
          that.displayImage(false);
          document.getElementById(
            that.key + "-filePreviewModal"
          ).style.display = "none";
        });
      }
    }
      return super.attach(element);
  }

  generateFileList(files, component) {
    var fileList = `<h5>` + component.label + `</h5><div class="documentsWrap">`;
    if (files) {
      for (var prop in files) {
        var file = files[prop]["file"] ? files[prop]["file"] : files[prop];
        var fileName = files[prop]["originalName"] ? files[prop]["originalName"] : file.substring(file.lastIndexOf("/") + 1);
        var type;
        if(file && file.file_url){
          type = (file.file_url.substr(file.file_url.lastIndexOf(".") + 1)).toLowerCase();
        } else {
          if(file && file != undefined){
            type = (file.substr(file.lastIndexOf(".") + 1)).toLowerCase();
          } else {
            continue;
          }
        }
        var url, icon, disableView,downloadUrl;
        if (type == "pdf") {
          url = component.wrapperUrl + "app/" + component.appId + "/document/" + fileName+ "?docPath="+file;
            if(file && file.file_url){
              url = component.wrapperUrl + "app/" + component.appId + "/document/" + fileName+ "?docPath="+ file.file_url;
              downloadUrl = component.wrapperUrl + "app/" + component.appId + "/document/" + fileName+"?docPath="+file.file_url;
            } else {
              downloadUrl = component.wrapperUrl + "app/" + component.appId + "/document/" + fileName+"?docPath="+file;
            }
          icon = "<i class='fa fa-file-pdf-o'></i>";
          disableView = false;
        } else if (type == "png" || type == "jpeg" || type == "jpg") {
          url = component.wrapperUrl + "app/" + component.appId + "/document/" + fileName+"?docPath="+file;
          if(file && file.file_url){
            url = component.wrapperUrl + component.appId + "/" + file.file_url;
            downloadUrl = component.wrapperUrl + "app/" + component.appId + "/document/" + fileName+"?docPath="+file.file_url;
          } else {
            downloadUrl = url;
          }
          icon = "<i class='fa fa-picture-o'></i>";
          disableView = false;
        } else {
          icon = "<i class='fa fa-file-o fileIcon'></i>";
          disableView = true;
        }
        if(typeof file){
          downloadUrl = component.wrapperUrl + "app/" + component.appId + "/document/" + fileName+"?docPath="+file;
          url = component.wrapperUrl + "app/" + component.appId + "/document/" + fileName+"?docPath="+file;
        }
        fileList +=
          `<div class="docList" style="margin:0;" key="` +
          prop +
          `">
           <div class="fileDiv">
          <div class="singleFile row" ` +
          prop +
          `" data-downloadurl="` +
          downloadUrl +
          `" data-file="` +
          prop +
          `" data-type="` +
          type +
          `" data-url="` +
          url +
          `">
            <span class="fileName col-md-10 ` +
          component.key +
          `-downloadFile">` +
          icon +
          "&nbsp;&nbsp;" +
          fileName +
          `</span>
            <span class="col-md-1">
              <button` +
          (disableView ? ` hidden ` : "") +
          ` class="btn btn-sm btn-info ` +
          component.key +
          `-selectFile" >
                <i class="fa fa-eye"></i>
              </button>
            </span>
            <span class="col-md-1">
              <button class="btn btn-sm btn-info ` +
          component.key +
          `-downloadFile" style="margin-left:5px;" >
                <i class="fa fa-download"></i>
              </button>
            </span>
          </div>
        </div>
      </div>`;
      }
      fileList += "</div>";
    } else {
      fileList = "<p> No Files to Display</p>";
    }
    return fileList;
  }

  render(children) {
    var fileList = this.fileList ? this.fileList : null;
    var row =
      `<div class="docViewerComponent">
    <div class="col-md-12" >` +
      fileList +
      `</div>
    </div>
    <div id="` +
      this.component.key +
      `-filePreviewModal" class="modal">
    <div style="height:inherit;display: block;background-color: white;">
    <div id="` +
      this.component.key +
      `-closeFile" class="viewer-button viewer-close" style="z-index:111"></div>
    <div id="` +
      this.component.key +
      `-filePreviewWindow" style="height:inherit"></div>
    </div>
    </div>`;
    var that = this;
    setTimeout(function() {
      that.bindHandlers();
    }, 200);
    return super.render(row);
  }

  //disable
  static editForm = editForm;

  elementInfo() {
    const info = super.elementInfo();
    info.type = "input";
    info.attr.type = "hidden";
    info.changeEvent = "change";
    return info;
  }
  build(element) {
    super.build(element);
  }
}
