import File from 'formiojs/components/file/File'
import * as _utils from 'formiojs/utils/utils'
import { Formio } from "formiojs";
import * as _lodash from "lodash";

export default class FileComponent extends File { 

    constructor(component, options, data) {
        var formOptions = Formio.getPlugin("optionsPlugin");
        var customOptions = _lodash.default.merge(options, formOptions.options);
        super(component, customOptions, data);
        component.core = customOptions.core;
        component.appId = customOptions.appId;
        component.uiUrl = customOptions.uiUrl;
        component.wrapperUrl = customOptions.wrapperUrl;
    }
    upload(files){
    var _this6 = this;
      // Only allow one upload if not multiple.
      if (!this.component.multiple) {
        files = Array.prototype.slice.call(files, 0, 1);
      }
      if (this.component.storage && files && files.length) {
        // files is not really an array and does not have a forEach method, so fake it.
        Array.prototype.forEach.call(files, function (file) {
          var fileName = (0, _utils.uniqueName)(file.name, _this6.component.fileNameTemplate, _this6.evalContext());
          var fileUpload = {
            originalName: file.name,
            name: fileName,
            size: file.size,
            status: 'info',
            message: _this6.t('Starting upload')
          }; // Check file pattern
          if (_this6.component.filePattern && !_this6.validatePattern(file, _this6.component.filePattern)) {
            fileUpload.status = 'error';
            fileUpload.message = _this6.t('File is the wrong type; it must be {{ pattern }}', {
              pattern: _this6.component.filePattern
            });
          } // Check file minimum size
          if (_this6.component.fileMinSize && !_this6.validateMinSize(file, _this6.component.fileMinSize)) {
            fileUpload.status = 'error';
            fileUpload.message = _this6.t('File is too small; it must be at least {{ size }}', {
              size: _this6.component.fileMinSize
            });
          } // Check file maximum size
          if (_this6.component.fileMaxSize && !_this6.validateMaxSize(file, _this6.component.fileMaxSize)) {
            fileUpload.status = 'error';
            fileUpload.message = _this6.t('File is too big; it must be at most {{ size }}', {
              size: _this6.component.fileMaxSize
            });
          } // Get a unique name for this file to keep file collisions from occurring.
          var dir = _this6.interpolate(_this6.component.dir || '');
          var fileService = _this6.fileService;
          if (!fileService) {
            fileUpload.status = 'error';
            fileUpload.message = _this6.t('File Service not provided.');
          }
          _this6.statuses.push(fileUpload);
          _this6.redraw();
          if (fileUpload.status !== 'error') {
            if (_this6.component.privateDownload) {
              file.private = true;
            }
            var _this6$component = _this6.component,
                storage = _this6$component.storage,
                _this6$component$opti = _this6$component.options,
                options = _this6$component$opti === void 0 ? {} : _this6$component$opti;
            var url = _this6.interpolate(_this6.component.url);
            var fileKey = _this6.component.fileKey || 'file';
            if(_this6.component.storage=='url'){
            var uploadFile = {file:file,data:{name:file.name,type:file.type}}
            //
            if(_this6?.options?.fileUploadCallback){
              var index = _this6.statuses.indexOf(fileUpload);
              if (index !== -1) {
                _this6.statuses.splice(index, 1);
              }
              if (!_this6.hasValue()) {
                _this6.dataValue = [];
              }
              const obj = {
                id : Math.random(),
                size: file.size,
                ...uploadFile.data,
                uploadFile,
              };
              _this6.dataValue.push(obj);
              _this6?.options?.fileUploadCallback?.(obj)
              _this6.redraw();
              _this6.triggerChange();
              return
            }
            //
            var helper = _this6.component.core.make("oxzion/restClient");
            helper.request("v1",(_this6.component.properties['absoluteUrl'] ? url : "/app/"+_this6.component.appId +_this6.component.url),uploadFile,"fileupload").then(function (response) {
                if(response.status=='success'){
                    var index = _this6.statuses.indexOf(fileUpload);
                    if (index !== -1) {
                        _this6.statuses.splice(index, 1);
                    }
                response.originalName = file.name;
                if (!_this6.hasValue()) {
                    _this6.dataValue = [];
                }
                _this6.dataValue.push(response.data);
                _this6.redraw();
                _this6.triggerChange();
            } else {
              fileUpload.status = 'error';
              fileUpload.message = response.message;
              delete fileUpload.progress;
              _this6.redraw();
            }
            }).catch(function (response) {
              fileUpload.status = 'error';
              fileUpload.message = response;
              delete fileUpload.progress;
              _this6.redraw();
            });
            } else {
            fileService.uploadFile(storage, file, fileName, dir, function (evt) {
              fileUpload.status = 'progress';
              fileUpload.progress = parseInt(100.0 * evt.loaded / evt.total);
              delete fileUpload.message;

              _this6.redraw();
            }, url, options, fileKey).then(function (fileInfo) {
              var index = _this6.statuses.indexOf(fileUpload);

              if (index !== -1) {
                _this6.statuses.splice(index, 1);
              }

              fileInfo.originalName = file.name;

              if (!_this6.hasValue()) {
                _this6.dataValue = [];
              }

              _this6.dataValue.push(fileInfo);

              _this6.redraw();

              _this6.triggerChange();
            }).catch(function (response) {
              fileUpload.status = 'error';
              fileUpload.message = response;
              delete fileUpload.progress;

              _this6.redraw();
            });
            }
          }
        });
      }
    }
    getFile(fileInfo) {
      const { options = {} } = this.component;
      const { fileService } = this;
      if (!fileService) {
        return alert('File Service not provided');
      }
      if (this.component.privateDownload) {
        fileInfo.private = true;
      }
      fileService.downloadFile(fileInfo, options).then((file) => {
        if (file) {
          if (['base64', 'indexeddb'].includes(file.storage)) {
            download(file.url, file.originalName || file.name, file.type);
          }
          else {
            if(fileInfo.url && !fileInfo.url.includes(this.component.wrapperUrl+this.component.appId, 0)){
              window.open(fileInfo.url.replace(this.component.uiUrl,this.component.wrapperUrl+this.component.appId), '_blank');
            } else {
              if(fileInfo.url){
                window.open(fileInfo.url, '_blank');
              } else {
                window.open(file.url, '_blank');
              }
            }
          }
        }
      })
      .catch((response) => {
        // Is alert the best way to do this?
        // User is expecting an immediate notification due to attempting to download a file.
        alert(response);
      });
    }
}
