import React from 'react';
import ReactDOM from 'react-dom';
import { Overlay, Tooltip, Button, Form } from 'react-bootstrap';
import WidgetModal from './Modal/WidgetModal'
import './globalFunctions';
import Swal from "sweetalert2";
import '../../../public/css/sweetalert.css';
// import './widgetEditorApp.scss';
import { options } from '../../../../../gui/amcharts/core';
import Select from 'react-select'
import Flippy, { FrontSide, BackSide } from 'react-flippy';
import WidgetEditorBody from './widgetEditorBody'
import Tabs from 'react-bootstrap/Tabs'
// import '../../../public/css/dashboardEditor.scss'

class WidgetEditorApp extends React.Component {
    constructor(props) {
        super(props);
        let editor = props.editor;
        let widgetConfiguration = editor.plugins.oxzion.getWidgetConfiguration(editor);
        this.state = {
            mode: null,
            flipped: false,
            widget: {
                align: widgetConfiguration ? widgetConfiguration.align : "left",
                uuid: widgetConfiguration ? widgetConfiguration.id : null,
                // type: html
            },
            showModal: false,
            widgetName: '',
            widgetPermissions: {},
            widgetOwner: 0,
            visualization: null,
            visualizationID: '',
            visibility: null,
            errors: {
            },
            visualizationOptions: [],
            selectableWidgetOptions: [],
            selectableDashboardOptions: [],
            selectableAppOptions: [],
            readOnly: true,
            isPreLoadedWidget: widgetConfiguration ? (widgetConfiguration.id ? true : false) : false
        };
        this.baseState = this.state
    }

    _sendUnlimitedWidgetListRequest = (params, method) => {
        return window.postDataRequest('analytics/widget?filter=' +
            encodeURIComponent('[{"take":500000,"skip":0,"sort":[{"field":"name","dir":"asc"}]}]'), params, method);
    }

    _sendUnlimitedDashboardListRequest = (params, method) => {
        return window.postDataRequest('/analytics/dashboard?filter=' +
            encodeURIComponent('[{"sort":[{"field":"name","dir":"asc"}],"skip":0,"take":0}]'), params, method);
    }

    inputChanged = (e) => {
        let name = e.target.name;
        let value = e.target.value;
        this.setState({
            [name]: value
        });
    }

    makeReadOnly = (flag) => {
        this.setState({
            readOnly: flag
        });
        this.refs.editor.makeReadOnly(flag);
    }

    loadWidget = (uuid) => {
        let thiz = this;
        window.postDataRequest(`analytics/widget/${uuid}?data=true`).
            then(function (responseData) {
                if ('error' === responseData.status) {
                    console.error('Could not load MLET.');
                    console.error(responseData);
                    Swal.fire({
                        type: 'error',
                        title: 'Oops ...',
                        text: 'Could not load a MLET. Please try after some time.'
                    });
                    return;
                }
                let widget = responseData.widget;
                thiz.setState((state) => {
                    widget.align = (state.widget.align) ? state.widget.align : "left"; //Retain align property needed for ckEditor.
                    state.widget = widget;
                    state.widgetName = widget.name;
                    state.widgetOwner = widget.is_owner
                    state.visibility = widget.ispublic
                    return state;
                });
            }).
            catch(function (responseData) {
                // console.error('Could not load MLET.');
                // console.error(responseData);
                Swal.fire({
                    type: 'error',
                    title: 'Oops ...',
                    text: 'Could not load a MLET. Please try after some time.'
                });
            });
    }

    widgetSelectionChanged = (e) => {
        let widgetId = e.target.value;
        if (widgetId === this.state.widget.uuid) {
            return;
        }
        this.setState((state) => {
            state.widget.align = null;
            return state;
        });
        this.loadWidget(widgetId);
    }

    selectableWidgetSelectionChanged = (e) => {
        let widgetId = e.value;
        if (widgetId === this.state.widget.uuid) {
            return;
        }
        this.setState((state) => {
            state.widget.align = null;
            return state;
        });
        this.loadWidget(widgetId);
    }

    copyWidget = (e) => {
        this.makeReadOnly(false);
        this.setState({
            mode: 'copy'
        });
    }

    editWidget = (e) => {
        this.makeReadOnly(false);
        this.setState({
            mode: 'edit'
        });
    }

    //Called by globalFunctions.js for getting editor mode.
    getEditorMode = (e) => {
        return this.state.mode;
    }

    deleteWidget = (e) => {
        let thiz = this;
        window.postDataRequest('analytics/widget/' + this.state.widget.uuid + "?version=" + this.state.widget.version, {}, "delete")
            .then(function (response) {
                //fetch the updated widget list after delete
                thiz._sendUnlimitedWidgetListRequest()
                    .then(function (response) {
                        let widgetData = response.data;
                        let widgetList = []
                        let selectableWidgetList = []
                        widgetList = widgetData.map(widget => {
                            return (
                                <option key={widget.uuid} value={widget.uuid}>{widget.name}</option>
                            )
                        });
                        widgetData.map(widget => {
                            selectableWidgetList.push({ "label": widget.name, "value": widget.uuid, "type": widget.type })
                        });
                        thiz.setState({
                            widget: {
                                align: null,
                                uuid: null,
                                type: null
                            },
                            selectableWidgetOptions: selectableWidgetList,
                            showModal: false
                        });
                    }).catch(function (response) {
                        thiz.setState({ showModal: false })
                        Swal.fire({
                            type: 'error',
                            title: 'Oops ...',
                            text: 'Failed to load MLET. Please try after some time.'
                        });
                    });
                Swal.fire({
                    type: 'success',
                    title: 'Operation Successfull',
                    text: 'Widget Deleted Successfully'
                });
            })
            .catch(function (response) {
                thiz.setState({ showModal: false })
                Swal.fire({
                    type: 'error',
                    title: 'Operation Failed',
                    text: 'Failed to Delete MLET. Please try after some time.'
                });
            });
    }

    //Set the react app instance on the window so that the window can call this app to get its state before the window closes.
    componentDidMount() {
        window.widgetEditorApp = this;
        let thiz = this;
        Promise.all([this._sendUnlimitedWidgetListRequest(), window.postDataRequest('analytics/visualization'), window.getAllPermission(), this._sendUnlimitedDashboardListRequest(), window.postDataRequest('app')])
            .then((response) => {
                let widgetData = response[0].data;
                let dashboardData = response[3];
                let dashboardResult = [];
                let selectableAppList = [];

                Object.values(response[4]).map(app => {
                    if (app.uuid) {
                        selectableAppList.push({ "label": app.name, "value": app.name, "type": "file" });
                    }
                });
                let widgetList = [];
                let dashboardList = [];
                widgetList = widgetData.map(widget => {
                    return (
                        <option key={widget.uuid} value={widget.uuid}>{widget.name}</option>
                    )
                });
                dashboardList = dashboardResult.map(dashboard => {
                    return (
                        <option key={dashboard.uuid} value={dashboard.uuid}>{dashboard.name}</option>
                    )
                });
                let selectableWidgetList = [];
                let visualList = [];
                widgetData.map(widget => {
                    selectableWidgetList.push({ "label": widget.name, "value": widget.uuid, "type": widget.type })
                });
                let selectableDashboardList = [];
                Object.values(response[3]).map(dashboard => {
                    if (dashboard.uuid) {
                        selectableDashboardList.push({ "label": dashboard.name, "value": dashboard.uuid, "type": "dashboard" })
                    }
                });
                let visualizationData = response[1].data;
                visualList = visualizationData.map(visualization => {
                    return (
                        <option key={visualization.uuid} data-key={visualization.uuid} value={visualization.type}>{visualization.name}</option>
                    )
                });
                const { MANAGE_ANALYTICS_WIDGET_READ, MANAGE_ANALYTICS_WIDGET_WRITE } = response[2].permissions
                thiz.setState({ selectableWidgetOptions: selectableWidgetList, visualizationOptions: visualList, widgetPermissions: { MANAGE_ANALYTICS_WIDGET_READ, MANAGE_ANALYTICS_WIDGET_WRITE }, selectableDashboardOptions: selectableDashboardList, selectableAppOptions: selectableAppList })
                if (thiz.state.widget.uuid) {
                    thiz.loadWidget(thiz.state.widget.uuid);
                }
            }).catch(err => {
                console.error(err)
                Swal.fire({
                    type: 'error',
                    title: 'Oops ...',
                    text: 'Failed to load MLETs. Please try after some time.'
                });
            });
    }

    componentDidUpdate() {
        let widget = this.state.widget;
        if (this.refs.editor && widget.configuration) {
            this.refs.editor.setWidgetData({
                data: widget.data,
                configuration: widget.configuration,
                queries: widget.queries,
                expression: widget.expression,
                readOnly: this.state.readOnly
            });
            this.refs.editor.makeReadOnly(this.state.readOnly);
        }
    }

    updateWidgetState = (value) => {
        this.setState({
            widget: value
        });
    }

    setErrorMessage = (key, message) => {
        this.setState((state) => {
            if (!message || ('' === message)) {
                delete state.errors[key];
            } else {
                state.errors[key] = message;
            }
            return state;
        });
    }

    //Resolves with true if validation passes. Resolves with false if validation fails.
    isWidgetNameValid = () => {
        let resolvePromise;
        let promise = new Promise((resolve, reject) => {
            resolvePromise = resolve;
        });
        let widgetName = this.state.widgetName;
        if (widgetName) {
            widgetName = widgetName.trim();
        }
        if (!widgetName || ('' === widgetName)) {
            this.setErrorMessage('widgetName', 'Widget name is needed');
            console.debug('Widget name is null or empty. Invalid.');
            resolvePromise(false); //Found validation error.
        } else {
            let thiz = this;
            let errorMessage = null;
            let encodedName = encodeURIComponent(widgetName);
            window.postDataRequest(`analytics/widget/byName?name=${encodedName}`).
                then(function (response) {
                    let localWidget = thiz.state.widget;
                    let responseWidget = response.widget;
                    if ('copy' === thiz.state.mode) {
                        if (responseWidget) {
                            thiz.setErrorMessage('widgetName', 'MLET name is already in use. Please provide another name.');
                            resolvePromise(false);
                            console.log('MLET copy is in progress. Given MLET name is in use. Error.');
                        } else {
                            console.log('MLET copy is in progress. Given MLET name not found. Ok to continue.');
                            resolvePromise(true);
                        }
                    } else if ('edit' === thiz.state.mode) {
                        if (localWidget.uuid) { //Case of editing existing widget.
                            if (responseWidget) { //If name is found uuid's should match.
                                if (responseWidget.uuid === localWidget.uuid) {
                                    console.log('UUIDs of MLET being edited and name search response MLET are matching. Ok to continue.');
                                    resolvePromise(true);
                                } else {
                                    thiz.setErrorMessage('widgetName', 'MLET name is already in use. Please provide another name.');
                                    resolvePromise(false);
                                    console.log('UUIDs not matching. Some other MLET has given name. Error.');
                                }
                            } else { //Else it is ok because it may be the name of the widget being edited OR a new name.
                                console.log('Widget having given name not found. Ok to continue.');
                                resolvePromise(true);
                            }
                        } else { //Case of new widget. Name should not be found.
                            if (responseWidget) {
                                thiz.setErrorMessage('widgetName', 'MLET name is already in use. Please provide another name.');
                                resolvePromise(false);
                                console.log('UUIDs not matching. Some other MLET has given name.');
                            } else {
                                resolvePromise(true);
                                console.log('MLET having given name not found. Ok to continue.');
                            }
                        }
                    }
                }).
                catch(function (response) {
                    if (response.errorCode == 404) {
                        thiz.setErrorMessage('widgetName', null);
                        console.debug('MLET name is not in use. valid.');
                        resolvePromise(true); //No validation errors.
                    } else {
                        console.error(response);
                        Swal.fire({
                            type: 'error',
                            title: 'Oops ...',
                            text: 'Could not validate MLET name. Please try after some time.'
                        });
                        console.debug('MLET name validation REST request failed. Forced invalid.');
                        resolvePromise(false); //Found validation error.
                    }
                });
        }
        return promise;
    }

    areAllFieldsValid = () => {
        let resolvePromise;
        let promise = new Promise((resolve, reject) => {
            resolvePromise = resolve;
        });
        let thiz = this;
        this.isWidgetNameValid().then(function (isNameValid) {
            console.debug(`Widget name valid? ${isNameValid}`);
            let result = isNameValid &
                thiz.refs.editor.areAllFieldsValid();
            console.debug(`Overall validation result:${result}`);
            resolvePromise(result);
        }).catch(function () {
            console.debug('widgetEditorApp.isWidgetNameValid call failed.');
            resolvePromise(false);
        });
        return promise;
    }

    //Called in globalFunctions.js
    getWidgetStateForCkEditorPlugin() {
        let widget = this.state.widget;
        let type = null;
        switch (widget.type) {
            case 'aggregate':
            case 'inline':
            case 'profile':
                // case 'html':
                type = 'inline';
                break;
            case 'chart':
            case 'table':
            case 'grid':
                type = 'block';
                break;
            case 'html':
                type = 'html';
                break;
        }
        return {
            align: widget.align,
            type: type,
            id: widget.uuid
        };
    }

    //Called in globalFunctions.js
    saveWidget = () => {
        let state = this.state;
        let editorState = this.refs.editor.getState();
        let params = {
            'configuration': editorState.configuration,
            'expression': editorState.expression,
            'queries': editorState.queries,
            'name': state.widgetName
        };
        let widgetId = state.widget.uuid;
        if (widgetId) {
            params['uuid'] = widgetId;
        }

        if (state.flipped) {
            // called on create widget
            params["visualization_uuid"] = state.visualizationID
            params["ispublic"] = parseInt(state.visibility);
            return window.postDataRequest('analytics/widget', params, 'post');
        } else {
            switch (state.mode) {
                case 'edit':
                    params['uuid'] = widgetId;
                    params["ispublic"] = parseInt(state.visibility);
                    params['version'] = state.widget.version;
                    return window.postDataRequest('analytics/widget/' + state.widget.uuid, params, 'put');
                    break;
                case 'copy':
                    params["ispublic"] = parseInt(state.visibility);
                    return window.postDataRequest('analytics/widget/' + state.widget.uuid + '/copy', params, 'post');
                    break;
            }
        }
    }

    //Called in globalFunctions.js to ensure data is clean when the user clicks "Ok" button of dialog.
    hasUserInputErrors = (displayMessageOnError) => {
        let resolvePromise;
        let promise = new Promise((resolve, reject) => {
            resolvePromise = resolve;
        });
        let thiz = this;
        this.areAllFieldsValid().then(function (areFieldsValid) {
            console.debug(`widgetEditorApp.areAllFieldsValid resolved with ${areFieldsValid}`);
            var errors = thiz.state.errors;
            var errorsFound = !areFieldsValid;
            for (let [key, value] of Object.entries(errors)) {
                if (value) {
                    errorsFound = true;
                    break;
                }
            }
            if (errorsFound) {
                Swal.fire({
                    type: 'info',
                    title: 'Input error',
                    text: 'Form fields have errors. Please resolve errors and try again.'
                });
                resolvePromise(true); //true indicates there are errors.
            } else {
                resolvePromise(false); //false indicates there are no errors.
            }
        });
        return promise;
    }

    //Called in globalFunctions.js to detect whether the widget has been edited.
    isEdited = () => {
        return !this.state.readOnly;
    }

    selectVisualization(e) {
        const selectedIndex = e.target.options.selectedIndex;
        let visualizationid = e.target.options[selectedIndex].getAttribute('data-key')
        let visualization = e.target.options[selectedIndex].value
        let newWidget = { type: "" }
        if (e.target.value !== undefined) {
            newWidget.type = e.target.value
            this.setState({ widget: newWidget, visualizationID: visualizationid, visualization: visualization }, () => {
                this.makeReadOnly(false);
            })
        }
    }

    selectVisibility(e) {
        const selectedIndex = event.target.options.selectedIndex;
    }

    toggleWidgetDiv() {
        let widget = this.baseState.widget
        this.setState({
            flipped: true,
            widgetName: '',
            widget: widget,
            mode: 'create'
        });
    }

    syncWidgetState(name, value, data) {
        if (this.state.mode == "copy") {
            if (value != null && value !== "") {
                let widget = { ...this.state.widget }
                if (name === "configuration" || name === "expression") {
                    widget[name] = JSON.parse(value)
                    this.setState({ widget: widget })

                } else if (name === "queries") {
                    widget[name] = value
                    widget["data"] = data
                    this.setState({ widget: widget })

                }
            }
        }
    }

    render() {
        return (
            <form className="widget-editor-form">
                <Flippy
                    flipDirection="horizontal" // horizontal or vertical
                    isFlipped={this.state.flipped}
                    flipOnClick={false}
                    style={{ width: '100%', height: '100vh' }}
                >
                    <FrontSide>
                        <div className="form-group row no-left-margin no-right-margin">
                            <div className="col-1 right-align" style={{ maxWidth: '3em', paddingLeft: '0px' }}>
                                <label htmlFor="selectWidget" className="col-form-label form-control-sm">MLET</label>
                            </div>
                            <div className="col-2">
                                <Select
                                    placeholder="Choose MLET"
                                    name="selectWidget"
                                    id="selectWidget"
                                    isDisabled={this.state.isPreLoadedWidget}
                                    onChange={this.selectableWidgetSelectionChanged}
                                    value={this.state.selectableWidgetOptions.length > 0 && this.state.selectableWidgetOptions.filter(option => option.value == this.state.widget.uuid)}
                                    options={this.state.selectableWidgetOptions}
                                />
                            </div>
                            {!this.state.readOnly && !this.state.flipped &&
                                <>
                                    <div className="left-align">
                                        <label htmlFor="widgetName" className="left-align col-form-label form-control-sm">Widget Name</label>
                                    </div>
                                    <div className="col-3">
                                        <input type="text" id="widgetName" name="widgetName" ref="widgetName" className="form-control form-control-sm"
                                            onChange={this.inputChanged} value={this.state.widgetName} onBlur={this.isWidgetNameValid}
                                            disabled={this.state.readOnly} />
                                        <Overlay target={this.refs.widgetName} show={this.state.errors.widgetName != null} placement="bottom">
                                            {props => (
                                                <Tooltip id="widgetName-tooltip" {...props} className="error-tooltip">
                                                    {this.state.errors.widgetName}
                                                </Tooltip>
                                            )}
                                        </Overlay>
                                    </div>
                                    <div className="left-align">
                                        <label htmlFor="visibility" className="left-align col-form-label form-control-sm">Visibility</label>
                                    </div>
                                    <div className="col-2">
                                        <select id="visibility" name="visibility" className="form-control form-control-sm" placeholder="Select visibility"
                                            value={this.state.visibility} onChange={this.inputChanged} disabled={this.state.readOnly}
                                        >
                                            <option key="" value="" disabled>-Select Visibility-</option>
                                            <option key="1" value="1">Public</option>
                                            <option key="2" value="0">Private</option>
                                        </select>
                                    </div>
                                </>
                            }
                            <div className="dash-manager-buttons">
                                {this.state.widgetPermissions.MANAGE_ANALYTICS_WIDGET_WRITE &&
                                    <>
                                        <button type="button" className="btn btn-primary widget-action-btn" title="Create MLET"
                                            onClick={() => this.toggleWidgetDiv()} disabled={!this.state.readOnly}>
                                            <span className="fa fa-plus" aria-hidden="true"></span>
                                        </button>
                                    </>
                                }
                                {(this.state.widget.uuid && this.state.widgetPermissions.MANAGE_ANALYTICS_WIDGET_WRITE) &&
                                    <>
                                        <button type="button" className="btn btn-primary widget-action-btn" title="Edit MLET"
                                            onClick={this.editWidget} disabled={!this.state.readOnly && (this.state.mode != 'edit')}>
                                            <span className="fa fa-edit" aria-hidden="true"></span>
                                        </button>
                                    </>
                                }
                                {(this.state.widget.uuid && this.state.widgetPermissions.MANAGE_ANALYTICS_WIDGET_WRITE) &&
                                    <>
                                        <button type="button" className="btn btn-primary widget-action-btn" title="Delete MLET"
                                            onClick={() => { this.setState({ showModal: true }) }} disabled={!this.state.readOnly}>
                                            <span className="fa fa-trash" aria-hidden="true"></span>
                                        </button>
                                    </>
                                }
                                {(this.state.widget.uuid && this.state.widgetPermissions.MANAGE_ANALYTICS_WIDGET_WRITE) &&
                                    <>
                                        <button type="button" className="btn btn-primary widget-action-btn" title="Copy MLET"
                                            onClick={this.copyWidget} disabled={!this.state.readOnly && (this.state.mode != 'copy')}>
                                            <span className="fa fa-copy" aria-hidden="true"></span>
                                        </button>
                                    </>
                                }
                            </div>
                        </div>
                        {!this.state.flipped &&
                            <div className="row">
                                {((this.state.widget.type === 'chart' || this.state.widget.type === 'table' || this.state.widget.type === 'inline' || this.state.widget.type === 'html' || this.state.widget.type === 'profile') && (this.state.selectableWidgetOptions.length > 0) && (this.state.selectableDashboardOptions.length > 0) && (this.state.selectableAppOptions.length > 0)) &&
                                    <WidgetEditorBody
                                        ref="editor"
                                        type={this.state.widget.type}
                                        widget={this.state.widget}
                                        syncWidgetState={(name, value, data) => this.syncWidgetState(name, value, data)} 
                                        selectableWidgetOptions={this.state.selectableWidgetOptions}
                                        selectableDashboardOptions={this.state.selectableDashboardOptions}
                                        selectableAppOptions={this.state.selectableAppOptions} />
                                }
                            </div>
                        }
                    </FrontSide>
                    <BackSide style={{ padding: "0px" }} className="dashboard">
                        {this.state.flipped &&
                            <>
                                <div className="row create-widget-div" >
                                    <div className="col-1 right-align">
                                        <label htmlFor="selectWidget" className="right-align col-form-label form-control-sm">Name</label>
                                    </div>
                                    <div className="col-3">
                                        <input type="text" id="widgetName" name="widgetName" ref="widgetName" className="form-control form-control-sm"
                                            onChange={this.inputChanged} value={this.state.widgetName} onBlur={this.isWidgetNameValid}
                                        />
                                        <Overlay target={this.refs.widgetName} show={this.state.errors.widgetName != null} placement="bottom">
                                            {props => (
                                                <Tooltip id="widgetName-tooltip" {...props} className="error-tooltip">
                                                    {this.state.errors.widgetName}
                                                </Tooltip>
                                            )}
                                        </Overlay>
                                    </div>
                                    <div className="col-1 right-align">
                                        <label htmlFor="selectVisualization" className="right-align col-form-label form-control-sm">Visualization</label>
                                    </div>
                                    <div className="col-3">
                                        <select id="selectVisualization" name="selectVisualization" className="form-control form-control-sm" placeholder="Select Visualization" value={this.state.visualization != null ? this.state.visualization : -1}
                                            onChange={(event) => this.selectVisualization(event)}>
                                            <option key="-1" value="-1" disabled></option>
                                            {this.state.visualizationOptions}
                                        </select>
                                    </div>
                                    <div className="col-1 right-align">
                                        <label htmlFor="selectVisibility" className="right-align col-form-label form-control-sm">Visibility</label>
                                    </div>
                                    <div className="col-2">
                                        <select id="selectVisibility" name="selectVisibility" className="form-control form-control-sm" placeholder="Select MLET" value={this.state.visibility != null ? this.state.visibility : -1} onChange={(e) => this.setState({ visibility: e.target.value })}>
                                            <option disabled value="-1" key="-1"></option>
                                            <option key="1" value="1">Public</option>
                                            <option key="2" value="0">Private</option>
                                        </select>
                                    </div>
                                    <button type="button" className="btn btn-primary add-series-button" title="Go Back" style={{ borderRadius: "26px", height: "30px" }}
                                        onClick={() => this.setState({ flipped: false })} >
                                        <span className="fa fa-arrow-left" aria-hidden="true"></span>
                                    </button>
                                </div>

                                <div className="row">
                                    {(this.state.widget.type === 'chart' || this.state.widget.type === 'table' || this.state.widget.type === 'inline' || this.state.widget.type === 'html' || this.state.widget.type === 'profile') &&
                                        <WidgetEditorBody 
                                        ref="editor" 
                                        type={this.state.widget.type} 
                                        widget={this.state.widget} 
                                        syncWidgetState={(name, value, data) => this.syncWidgetState(name, value, data)} 
                                        selectableWidgetOptions={this.state.selectableWidgetOptions} 
                                        selectableDashboardOptions={this.state.selectableDashboardOptions} 
                                        selectableAppOptions={this.state.selectableAppOptions} />
                                    }
                                </div>
                            </>
                        }
                    </BackSide>
                </Flippy>
                <WidgetModal
                    show={this.state.showModal}
                    onHide={() => { this.setState({ showModal: false }) }}
                    deletewidget={this.deleteWidget}
                />
            </form>
        );
    }
}

export default WidgetEditorApp;
window.startWidgetEditorApp = function (editor) {
    ReactDOM.render(<WidgetEditorApp editor={editor} />, document.getElementById('root'));
}
