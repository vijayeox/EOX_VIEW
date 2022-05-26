import Swal from "sweetalert2";
import '../../../../../gui/src/public/css/sweetalert.css';
import Helpers from '../../../helpers'
class Deferred {
    static deferredRegistry = {};

    constructor() {
        this.corrId = Helpers.Utils.generateUUID();
        this.promise = new Promise((resolve, reject) => {
            this.reject = reject; //Here this refers to Deferred instance's this, not Promise instance's this.
            this.resolve = resolve; //Here this refers to Deferred instance's this, not Promise instance's this.
        });
        Deferred.deferredRegistry[this.corrId] = this;
        //console.log(Deferred.deferredRegistry);
    }

    static getFromRegistry(corrId) {
        let deferred = Deferred.deferredRegistry[corrId];
        if (deferred) {
            delete Deferred.deferredRegistry[corrId];
            //console.log(Deferred.deferredRegistry);
        }
        return deferred;
    }
}

window.oxzionEditor = null;
//CkEditor automatically calls window.onDialogEvent function when dialog events occur.
//Function must be named onDialogEvent - name is not configurable in CkEditor.
window.onDialogEvent = function (dialogEvent) {
    switch (dialogEvent.name) {
        case 'load':
            window.addEventListener('message', function (event) {
                if (event.data.data != undefined && 'permissions' in event.data.data) {
                    window.sendAllPermissions(event.data.data)
                } else
                    window.handleDataResponse(event.data);
            }, false);
            //Dialog 'load' event contains reference to the editor opening this dialog.
            window.oxzionEditor = dialogEvent.editor;
            window.startWidgetEditorApp(window.oxzionEditor);
            window.skipUserInputValidation = false;
            break;
        case 'ok':
            function closeDialogWindow(data) {
                window.oxzionEditor.plugins.oxzion.acceptUserData(window.oxzionEditor, data);
                window.skipUserInputValidation = true;
                let buttons = window.parent.document.getElementsByClassName('cke_dialog_ui_button_ok');
                if (!buttons || (0 === buttons.length)) {
                    console.error('Failed to locate CkEditor dialog close button.');
                }
                let button = buttons[0];
                button.click();
            }

            let widgetEditorApp = window.widgetEditorApp;
            if (!widgetEditorApp.isEdited()) {
                console.debug('Widget has not been edited. Check for widget selection.');
                let data = widgetEditorApp.getWidgetStateForCkEditorPlugin();
                if (data.id) {
                    console.debug('Existing widget has been selected. Embedding it in dashboard.');
                    closeDialogWindow(data);
                } else {
                    console.debug('No widget has been selected. Just close dialog.');
                }
                return;
            }
            if (window.skipUserInputValidation) {
                console.debug('skipUserInputValidation is true. Close dialog.');
                return;
            }

            widgetEditorApp.hasUserInputErrors(true).then(function (hasErrors) {
                console.debug(`hasUserInputErrors promise fulfilled with '${hasErrors}'`);
                if (hasErrors) {
                    console.debug('User input has errors. Dont close the dialog.');
                } else {
                    console.debug('Save widget and close the dialog if widget save is successful.');
                    widgetEditorApp.saveWidget().
                        then(function (response) {
                            let data = widgetEditorApp.getWidgetStateForCkEditorPlugin();
                            let mode = widgetEditorApp.getEditorMode();
                            if (mode === 'edit') {
                                data['id'] = response['uuid'];
                            } else {
                                data['id'] = response['newWidgetUuid'];
                            }
                            closeDialogWindow(data);
                        }).
                        catch(function (response) {
                            console.error(response);
                            Swal.fire({
                                type: 'error',
                                title: 'Oops ...',
                                text: 'Could not save the widget. Please try after some time.'
                            });
                            throw 'Could not save the widget. Please try after some time.';
                        });
                }
            });
            throw 'Waiting for validation to complete and/or save widget. Threw exception to prevent dialog window closure.';
            break;
    }
}

const OXZION_CORRELATION_ID = 'OX_CORR_ID';
window.postDataRequest = function (url, params, method) {
    let deferred = new Deferred();
    if (!params) {
        params = {};
    }
    params[OXZION_CORRELATION_ID] = deferred.corrId;
    var message = {
        'action': 'data',
        'url': url,
        'params': params
    };
    if (method) {
        message['method'] = method;
    }
    window.top.postMessage(message);
    return deferred.promise;
}


window.handleDataResponse = function (response) {
    let corrId = response.params[OXZION_CORRELATION_ID];
    if (!corrId) {
        throw `Response object does not contain ${OXZION_CORRELATION_ID} parameter.`;
    }
    delete response.params[OXZION_CORRELATION_ID];
    let deferred = Deferred.getFromRegistry(corrId);
    if (!deferred) {
        console.warn('No deferred instance found. Unexpected REST response found:');
        console.warn(response);
        return;
    }
    switch (response.status) {
        case 'success':
            deferred.resolve(response);
            break;
        case 'error':
        case 'failure':
            deferred.reject(response);
            break;
    }
}

// sends message to dashboardEditor
window.getAllPermission = function () {
    let deferred = new Deferred();
    let params = {}
    params[OXZION_CORRELATION_ID] = deferred.corrId;
    var message = {
        'action': 'permissions',
        'params': params
    };
    window.top.postMessage(message);
    return deferred.promise
}

window.sendAllPermissions = function (response) {
    let corrId = response.corrid;
    if (!corrId) {
        throw `Response object does not contain ${OXZION_CORRELATION_ID} parameter.`;
    }
    delete response.corrid;
    let deferred = Deferred.getFromRegistry(corrId);
    if (!deferred) {
        console.warn('No deferred instance found. Unexpected REST response found:');
        console.warn(response);
        return;
    }
    deferred.resolve(response);
}



