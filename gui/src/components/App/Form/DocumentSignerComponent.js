import Base from "formiojs/components/_classes/component/Component";
import editForm from "formiojs/components/table/Table.form";
import "viewerjs/dist/viewer.css";
import Viewer from "viewerjs";
import $ from "jquery";
import { Formio } from "formiojs";
import * as _lodash from "lodash";

export default class DocumentSignerComponent extends Base {
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
    this.signCompleted = false;
    var that = this;
    this.data = data;
    this.documentsList = [];
  }
  //disable
  static schema(...extend) {
    return Base.schema(
      {
        label: "documentsigner",
        type: "documentsigner",
      },
      ...extend
    );
  }
  setValue(value) {
    this.value = JSON.stringify(value);
    this.dataValue = JSON.stringify(value);
  }
  get defaultSchema() {
    return DocumentSignerComponent.schema();
  }
  static builderInfo = {
    title: "Document Signer",
    group: "basic",
    icon: "fa fa-file",
    weight: 70,
    schema: DocumentSignerComponent.schema(),
  };
  getUrl(file,type){
    var name = this.getName();
    var downloadUrl;
    var url;
    var icon;
    var disableView;
    var component = this.component;
    if (type == "pdf") {
      url = component.wrapperUrl + "app/" + component.appId + "/document/" + name+ "?docPath="+file.file;
        if(file && file.file_url){
          url = component.wrapperUrl + "app/" + component.appId + "/document/" + name+ "?docPath="+ file.file_url;
          downloadUrl = component.wrapperUrl + "app/" + component.appId + "/document/" + name+"?docPath="+file.file_url;
        } else {
          downloadUrl = component.wrapperUrl + "app/" + component.appId + "/document/" + name+"?docPath="+file.file;
        }
      icon = "<i class='fa fa-file-pdf-o'></i>";
      disableView = false;
    } else if (type == "png" || type == "jpeg" || type == "jpg") {
      url = component.wrapperUrl + "app/" + component.appId + "/document/" + name+"?docPath="+file.file;
      if(file && file.file_url){
        url = component.wrapperUrl + component.appId + "/" + file.file_url;
        downloadUrl = component.wrapperUrl + "app/" + component.appId + "/document/" + name+"?docPath="+file.file_url;
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
  downloadUrl = component.wrapperUrl + "app/" + component.appId + "/document/" + name+"?docPath="+file.file;
  url = component.wrapperUrl + "app/" + component.appId + "/document/" + name+"?docPath="+file.file;
}
return {url:url,downloadUrl:downloadUrl,icon:icon,disableView:disableView};
  }
  getType(file){
    if(file && file.originalName != undefined){
      return (file.originalName.substr(file.originalName.lastIndexOf(".") + 1)).toLowerCase();
    }
  }
  getName(){
    var form = this.form?this.form:this;
    try {
      var name=  this.form._data[this.component.documentsList][this.component.index].originalName;
    } catch (error) {
      this.redraw();
      return;
    }
    this.dataValue = name;
    return name;
  }
  bindHandlers() {
    var that = this;
    var form = that.form?that.form:that;
    var component = this.component;
    var name = that.getName();
    if(!name){
      return;
    }
    if (this.previousValue == this.dataValue) {
      return;
    }
    this.previousValue = this.dataValue;
    var file = form._data[this.component.documentsList][this.component.index];
    var type = that.getType(file);
    var url, icon,downloadUrl;
    var variables = that.getUrl(file,type);
    url = variables.url;
    var disableView = variables.disableView;
    downloadUrl = variables.downloadUrl;
    icon = variables.icon;
    that.documentsList =  `<div class="docList" style="margin:0;" key="` + this.id +`">
      <div class="fileDiv">
      <div class="singleFile row" ` + this.id + `" data-downloadurl="` + downloadUrl + `" data-file="` + this.id + `" data-type="` + type + `" data-url="` + url + `">
        <span class="fileName col-md-9">` + icon + "&nbsp;&nbsp;" + name + `</span> <span class="col-md-3"><button` + ` class="btn btn-sm btn-info ` + component.key +`-selectFile" title="Click to preview the document" >
            <i class="fa fa-eye"></i>
          </button>
          <!-- Disabling download 
          <button class="btn btn-sm btn-info ` + component.key + `-downloadFile" style="margin-left:5px;" >
            <i class="fa fa-download"></i>
          </button> -->
          <button class="btn btn-sm btn-info ` + component.key + `-signFile" id="sign_btn_`+this.id+`" style="margin-left:5px;" title="Click to sign the document">
            <i class="fal fa-file-signature"></i>
          </button>
        </span>
      </div>
    </div> </div><div id="` + component.key + `-filePreviewModal" class="modal"> <div style="height:inherit;display: block;background-color: white;"><div id="` + component.key +`-closeFile" class="viewer-button viewer-close" style="z-index:111"></div><div id="` + component.key + `-filePreviewWindow" style="height:inherit"></div></div></div>`;
    that.documentsList += `<div id="myModal_`+this.id+`" class="insuresign modal"></div>`;
    that.redraw();
  }
  
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

  attach(element){
    var that = this;
    if (document.getElementById("sign_btn_"+this.id)) {
      document.getElementById("sign_btn_"+this.id).addEventListener("click", async () => {
          // this.ShowPopupMessageBytype("error","random message")
          //currently added a dummy cross origin link.. change the link to signing_url
          var signingLink = this.form._data[this.component.documentsList][this.component.index].signingLink;
          this.showInsureSignModal(this.component.documentsList+this.component.index, signingLink);
          this.pollForStatus();
        });
    }
    if(element){
    var elements = element.getElementsByClassName(that.key + "-selectFile");
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

  ShowPopupMessageBytype(status, message) {
    var modal = document.getElementById("myModal_"+this.id);
    // Get the button that opens the modal
    var btn = document.getElementById("myBtn");
    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];
    modal.style.display = "block";
    // When the user clicks on the button, open the modal
    // When the user clicks on <span> (x), close the modal
    span.onclick = function () {
      modal.style.display = "none";
    };
    // $('#modal_message').val('');
    $("#modal_message").html(message);
  }

  showInsureSignModal(docid, signing_url) {
    let modalHTML = "";
    modalHTML += `<div class="insuresign modal-content" style="height:100%">`;
    modalHTML += `<div style="text-align:end"><i class="fa fa-close"></i></div>`;
    modalHTML += `<iframe width="100%" height="100%" src=${signing_url}></iframe>`;
    // <iframe height='100%' width='100%' src='data.url+"'></iframe>
    modalHTML += `</div>`;

    $("#myModal_"+this.id).html(modalHTML);
    $("#myModal_"+this.id).css("display", "block");
    $("span.close").on("click", () => {
      $("#myModal_"+this.id).css("display", "none");
    });
  }

  pollForStatus() {
    var that = this;
    var form = that.form?that.form:that;
    var component = this.component;
    var file = form._data[this.component.documentsList][this.component.index];
    var type = that.getType(file);
    var variables = that.getUrl(file,type);
    var name = that.getName();
    var url = variables.url;
    var disableView = variables.disableView;
    var icon = variables.icon;
    var downloadUrl = variables.downloadUrl;
    setTimeout(() => {
      var docId = that.form._data[that.component.documentsList][that.component.index].docId;
      let helper = that.component.core.make("oxzion/restClient");
      helper.request("v1", "/esign/status/" + docId, {}, "get").then(function (response) {
          if (response.data["status"] == "FINALIZED" ||response.data["status"] == "CANCELLED") {
            console.log(response.data);
            document.getElementById("myModal_"+that.id).style.display= "none";
            that.documentsList =  `<div class="docList" style="margin:0;" key="` + that.id +`">
              <div class="fileDiv">
              <div class="singleFile row" ` + that.id + `" data-downloadurl="` + downloadUrl + `" data-file="` + that.id + `" data-type="` + type + `" data-url="` + url + `">
                <span class="fileName col-md-9">` + icon + "&nbsp;&nbsp;" + name + `</span> <span class="col-md-3"><button` + ` class="btn btn-sm btn-info ` + component.key +`-selectFile" title="Click to preview the document" >
                    <i class="fa fa-eye"></i>
                  </button>
                  <!-- Disabling download 
                  <button class="btn btn-sm btn-info ` + component.key + `-downloadFile" style="margin-left:5px;" >
                    <i class="fa fa-download"></i>
                  </button> -->
                  Document has been Signed
                </span>
              </div>
            </div> </div><div id="` + component.key + `-filePreviewModal" class="modal"> <div style="height:inherit;display: block;background-color: white;"><div id="` + component.key +`-closeFile" class="viewer-button viewer-close" style="z-index:111"></div><div id="` + component.key + `-filePreviewWindow" style="height:inherit"></div></div></div>`;
            that.documentsList += `<div id="myModal_`+that.id+`" class="insuresign modal"></div>`;
            that.signCompleted = true;
            that.redraw();
          } else {
            that.pollForStatus();
          }
        }).catch(function (response) {});
    }, 1000);
  }

  render(children) {
    var documentsList = this.documentsList ? this.documentsList : `<p>not working</p>`;
    setTimeout(() => {
      this.bindHandlers();
    }, 2000);
    var row = `<button id="sign_btn_`+this.id+`" >Sign Form</button>`;
    row += `<div id="myModal_`+this.id+`" class="insuresign modal"></div>`;
    return super.render(`<div>${documentsList}</div>`);
  }

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

