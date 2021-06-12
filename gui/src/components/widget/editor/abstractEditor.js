
import React from 'react';
import ReactDOM from 'react-dom';
import Swal from 'sweetalert2';

class AbstractEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedTab: null,
            widgetType: null,
            readOnly: true,
            queries: [],
            configuration: null,
            drillDownFilter: '',
            drillDownWidget: '',
            drillDownTarget: '',
            expression: '',
            drillDownWidgetTitle: '',
            drillDownWidgetType: "",
            drillDownWidgetFooter: '',
            hasMaxDepth: false,
            drillDownMaxDepth: -1,
            filteredWidgetList: [],
            templateList:[],
            widgetVisualType : this.props.widget.type,
            isTemplateLoading : true,
            selectedTemplate: "",
            templateContent:"",
            errors: {
                configuration: null,
                expression: null,
                drillDown: {},
                queries: [],
                target: { singleLevel: {}, multiLevel: {} }
            }
        };
        this.widgetTypes = [{ "label": "Chart", "value": "chart" }, { "label": "Inline", "value": "inline" }, { "label": "Table", "value": "table" }, { "label": "Dashboard", "value": "dashboard" }, { "label": "File", "value": "file" }]
        this.queryList = [];
        this.data = null;
        this.selectedOption=null
        this.widgetJson={
            "chart":[
                {"name":"Area","value":"area_chart"},
                {"name":"Bar","value":"bar_chart"},
                {"name":"Column","value":"column_chart"},
                {"name":"Funnel","value":"funnel_chart"},
                {"name":"Line","value":"line_chart"},
                {"name":"map","value":"map"},
                {"name":"Multi Axis Cluster Column","value":"multi_axis_cluster_column_chart"},
                {"name":"Pie","value":"pie_chart"},
                {"name":"Stacked Horizontal Bar","value":"stacked_horizontal_bar_chart"}
            ],
            "table":[
                {"name":"Area","value":"area_chart"}
            ],
            "Aggregate value":[
            ],
            "Profile":[

            ]
        }
    }

    getState = () => {
        //IMPORTANT: query object in the array this.state.queries is a mixed mode object.
        //    query.uuid, query.configuration are objects. JSON data in query.configuration.filter,
        //    query.configuration.grouping and query.configuration.sort are JSON strings coming from 
        //    form fields. Here we convert those JSON strings to java objects.
        let queries = [];
        if (this.state.queries) {
            this.state.queries.forEach(function (query, index) {
                let configuration = query['configuration'];
                queries.push({
                    'uuid': query['uuid'],
                    'configuration': {
                        'filter': configuration ? (configuration.filter ? JSON.parse(configuration.filter) : null) : null,
                        'grouping': configuration ? (configuration.grouping ? JSON.parse(configuration.grouping) : null) : null,
                        'sort': configuration ? (configuration.sort ? JSON.parse(configuration.sort) : null) : null
                    }
                });
            });
        }

        return {
            configuration: this.state.configuration ? JSON.parse(this.state.configuration) : null,
            expression: this.state.expression ? JSON.parse(this.state.expression) : null,
            queries: queries
        }
    }

    initializeDrillDownValues = (configuration) => {
        let hasMaxDepth = false
        let maxDepth = -1
        if (this.props.widget.uuid === configuration["oxzion-meta"]["drillDown"]["nextWidgetId"]) {
            hasMaxDepth = true
            maxDepth = configuration["oxzion-meta"]["drillDown"]["maxDepth"] || -1
        }
        this.setState({
            drillDownFilter: configuration["oxzion-meta"]["drillDown"]["filter"] || '',
            drillDownWidget: configuration["oxzion-meta"]["drillDown"]["nextWidgetId"] || '',
            drillDownWidgetTitle: configuration["oxzion-meta"]["drillDown"]["widgetTitle"] || '',
            drillDownWidgetFooter: configuration["oxzion-meta"]["drillDown"]["widgetFooter"] || '',
            drillDownTarget: configuration["oxzion-meta"]["drillDown"]["target"] || '',
            hasMaxDepth: hasMaxDepth,
            drillDownMaxDepth: maxDepth
        }, state => this.setDrillDownTargetType(this.state.drillDownTarget))
    }

    handleSelect(e, type) {
        let hasMaxDepth = false
        let errors = { ...this.state.errors }
        let name = type
        let value = e.value
        errors["drillDown"][name] = ""
        if (name == "drillDownMaxDepth") {
            hasMaxDepth = true
            this.setState({ [name]: value, hasMaxDepth: hasMaxDepth, errors: errors })
        } else if (name == "drillDownWidget") {
            if (value !== 'dashboard') {
                hasMaxDepth = (this.props.widget["uuid"] && this.props.widget["uuid"] === value)
                this.setState({ [name]: value, hasMaxDepth: hasMaxDepth, errors: errors })
            }
        } else if (name == "drillDownWidgetType") {
            let filteredWidgetList = null
            if (value === 'dashboard') {
                filteredWidgetList = this.props.selectableDashboardOptions.filter(option => option.type == value)
            } else if (value === 'file') {
                filteredWidgetList = this.props.selectableAppOptions.filter(option => option.type == value)
            } else {
                filteredWidgetList = this.props.selectableWidgetOptions.filter(option => option.type == value)
            }
            this.setState({ filteredWidgetList: filteredWidgetList, drillDownWidgetType: e, drillDownWidget: "" })
        } else {
            this.setState({ [name]: value, errors: errors })
        }
    }

    setWidgetData = (widgetData) => {
        this.data = widgetData.data;
        let queries = [];
        let type = (this.props.type === 'inline' || this.props.type === 'html') ? 'widget' : this.props.type;
        if (widgetData.queries) {
            widgetData.queries.forEach(function (query, index) {
                let configuration = query.configuration;
                queries.push({
                    'uuid': query.uuid,
                    'configuration': {
                        'filter': configuration ? (configuration.filter ? JSON.stringify(configuration.filter, null, '') : '') : '',
                        'grouping': configuration ? (configuration.grouping ? JSON.stringify(configuration.grouping, null, '') : '') : '',
                        'sort': configuration ? (configuration.sort ? JSON.stringify(configuration.sort, null, '') : '') : ''
                    },
                    'value': query.uuid,
                });
            });
        }
        var thiz = this;
        this.setState((state) => {
            state.configuration = widgetData.configuration ? JSON.stringify(widgetData.configuration, null, '    ') : '';
            state.expression = widgetData.expression ? JSON.stringify(widgetData.expression, null, '    ') : '';
            state.queries = queries;
            state.widgetType = type;
            return state;
        }, () => {
            if (this.state.selectedTab !== '' && (this.state.selectedTab == "widget" || this.state.selectedTab == "chart" || this.state.selectedTab == "profile")) {
                thiz.refreshViews();
            } else if (this.state.selectedTab !== '' && this.state.selectedTab == "query") {
                thiz.refreshQueryPreview()
            } else if (this.state.selectedTab !== '' && this.state.selectedTab == "table") {
                thiz.refreshDrillDownPreview()
            }
        });
    }

    makeReadOnly = (flag) => {
        this.setState({
            readOnly: flag
        });
    }

    configurationChanged = (evt) => {
        let value = evt.target.value;
        this.setState({
            configuration: value
        });
    }

    expressionChanged = (evt) => {
        let value = evt.target.value;
        this.setState({
            expression: value
        });
    }

    validateExpression = () => {
        let expression = this.state.expression;
        if (!expression || (expression === '')) {
            return;
        }
        let errorMessage = null;
        try {
            JSON.parse(expression);
        } catch (jsonParseError) {
            errorMessage = this.ERRORS.EXPRESSION_INVALID_JSON;
        }
        this.setState((state) => {
            state.errors.expression = errorMessage;
            return state;
        });
        return errorMessage ? false : true;
    }

    getSelectedWidgetType = () => {
        switch (this.state.drillDownWidgetType.value) {
            case 'file':
                this.state.drillDownWidgetType.value = "file";
                break;
            case 'widget':
                this.state.drillDownWidgetType.value = "widget";
                break;
            default:
                this.state.drillDownWidgetType.value = "dashboard";
        }
        return this.state.drillDownWidgetType.value;
        // return this.state.drillDownWidgetType.value !== "dashboard" ? this.state.drillDownWidgetType.value !== "widget" ? "file" : "widget" : "dashboard";
    }

    ApplyDrillDown = (widgetType) => {
        if (this.validateDrillDownForm()) {
            let configuration = this.state.configuration !== "" ? JSON.parse(this.state.configuration) : undefined
            let drillDownObject = {
                "target": this.getSelectedWidgetType(),
                "filter": this.state.drillDownFilter,
                "nextWidgetId": this.state.drillDownWidget
            }
            this.state.drillDownWidgetTitle !== "" && (drillDownObject["widgetTitle"] = this.state.drillDownWidgetTitle)
            this.state.drillDownWidgetFooter !== "" && (drillDownObject["widgetFooter"] = this.state.drillDownWidgetFooter)
            this.state.drillDownDashboardTitle !== "" && (drillDownObject["dashboardTitle"] = this.state.drillDownDashboardTitle)

            this.state.hasMaxDepth && this.state.drillDownMaxDepth != -1 && (drillDownObject["maxDepth"] = parseInt(this.state.drillDownMaxDepth))
            if (configuration) {
                if (configuration["oxzion-meta"]) {
                    configuration["oxzion-meta"]["drillDown"] = drillDownObject
                } else {
                    configuration["oxzion-meta"] = {
                        "drillDown": drillDownObject
                    }
                }
            } else {
                configuration = {
                    "oxzion-meta": {
                        "drillDown": drillDownObject
                    }
                }
            }
            this.setState({ configuration: JSON.stringify(configuration, null, 2), selectedTab: widgetType }, () => {
                this.props.syncWidgetState("configuration", this.state.configuration);
            })
        }
    }

    setDrillDownTargetType(target) {
        if (this.state.drillDownWidget.length > 0) {
            let selectedDrillDownOption = null
            if (target == "dashboard") {
                selectedDrillDownOption = this.state.selectableDashboardOptions.filter(option => option.value == this.state.drillDownWidget)
            } else if (target == "file") {
                selectedDrillDownOption = this.state.selectableAppOptions.filter(option => option.value == this.state.drillDownWidget)
            } else {
                selectedDrillDownOption = this.state.selectableWidgetOptions.filter(option => option.value == this.state.drillDownWidget)
            }
            let widget = selectedDrillDownOption[0] ? selectedDrillDownOption[0]["type"] : ''
            let selectedWidget = widget
            let widgetType = this.widgetTypes.filter(option => option.value == selectedWidget)
            this.setState({ drillDownWidgetType: widgetType[0] })
        }
    }

    validateDrillDownForm() {
        //form validation
        let validForm = true
        let errors = { ...this.state.errors }
        errors["drillDown"] = {}
        if (this.state.drillDownWidget == "") {
            errors["drillDown"]["drillDownWidget"] = "* Please Choose the Widget to apply Drill down"
            validForm = false
        }
        if (this.state.drillDownFilter == "") {
            errors["drillDown"]["drillDownFilter"] = "* Please specify the filter to apply Drill down"
            validForm = false
        }
        if (this.state.hasMaxDepth && this.state.drillDownMaxDepth == -1) {
            errors["drillDown"]["drillDownMaxDepth"] = "* Please Choose the Max Depth to apply Drill down"
            validForm = false
        }
        this.setState({ errors: errors })
        return validForm
    }

    handleDrillDownInputChange(e) {
        let hasMaxDepth = false
        let errors = { ...this.state.errors }
        errors["drillDown"][e.target.name] = ""
        if (e.target.name == "drillDownMaxDepth") {
            hasMaxDepth = true
            this.setState({ [e.target.name]: e.target.value, hasMaxDepth: hasMaxDepth, errors: errors })
        }
        else if (e.target.name == "drillDownWidget") {
            hasMaxDepth = (this.props.widget["uuid"] && this.props.widget["uuid"] === e.target.value)
            this.setState({ [e.target.name]: e.target.value, hasMaxDepth: hasMaxDepth, errors: errors })
        }
        else {
            this.setState({ [e.target.name]: e.target.value, errors: errors })
        }
    }

    getSelectedDrillDownWidget() {
        switch (this.state.drillDownWidgetType.value) {
            case 'file':
                this.props.selectableAppOptions.filter(option => option.value == this.state.drillDownWidget)
                break;
            case 'widget':
                this.props.selectableWidgetOptions.filter(option => option.value == this.state.drillDownWidget)
                break;
            case 'dashboard':
                this.props.selectableDashboardOptions.filter(option => option.value == this.state.drillDownWidget)
            default:
                this.props.selectableDashboardOptions.filter(option => option.value == this.state.drillDownWidget)
        }
    }

    querySelectionChanged = (evt, index) => {
        let thiz = this;
        let value = evt.value;
        this.setState((state) => {
            let queryObject = state.queries[index];
            queryObject.uuid = value;
            queryObject.configuration.filter = '';
            queryObject.configuration.grouping = '';
            queryObject.configuration.sort = '';
            state.errors.queries[index] = (value === '') ? thiz.ERRORS.QUERY_NEEDED : null;
            return state;
        }, () => {
            thiz.loadData(thiz.refreshQueryPreview);
        });
    }

    getTemplateSelection = () => {
        window.postDataRequest('analytics/template', {}, 'get')
        .then((response)=>{
            if(response.status == "success"){
                this.setState({isTemplateLoading:false,templateList:response.data})
            }
        })
    }

    getWidgetPreView = (templateName,queries,expression) => {
        let params = {};
        let postUrl = '';
        let method = '';
        postUrl = 'analytics/widget/preview'
        method = 'filepost'
        if(this.state.queries[0].uuid == ""){
            Swal.fire({
                type: 'error',
                title: 'Oops ...',
                text: 'Failed to load queries. Queries Required...'
            });
            return;
        }
        else if (!expression || (expression === '')) {
            params['configuration'] = JSON.stringify({"template":templateName});
            params['queries'] = JSON.stringify({"queries":[queries[0].uuid]});            
        }else{
            params['configuration'] = JSON.stringify({"template":templateName});
            params['queries'] = JSON.stringify({"queries":[queries[0].uuid]});
            params['expression'] = JSON.stringify({"expression":[expression]});
        }
        window.postDataRequest(postUrl,params,method)
        .then((response)=>{
            if(response.status == 'success'){
                this.data = response.widget.data;
                this.refreshWidgetPreview();
            }
        }).catch((err)=> console.log("err-->",err));
       
    }

    templateSelectionChanged = (evt) =>{
        let value = evt.value;
        this.getWidgetPreView(value.split('.')[0],this.state.queries,this.state.expression);
        this.setState({
            selectedTemplate:evt,
            configuration:JSON.stringify({"template":value.split('.')[0]})
        });
    }

    clearAllErrors = () => {
        var thiz = this;
        return new Promise((resolve) => {
            thiz.setState((state) => {
                state.errors.configuration = null;
                state.errors.expression = null;
                let queryErrors = state.errors.queries;
                for (let i = 0; i < queryErrors.length; i++) {
                    queryErrors[i] = null;
                }
                return state;
            }, () => {
                resolve();
            });
        });
    }

    applyFilterToQuery = (index) => {
        let thiz = this;
        Swal.fire({
            title: 'Query filter',
            input: 'textarea',
            showCloseButton: true,
            showCancelButton: true,
            focusConfirm: false,
            onOpen: function (element) {
                let query = thiz.state.queries[index];
                if (query) {
                    let value = query.configuration.filter;
                    let inputbox = element.querySelector('textarea');
                    inputbox.value = value ? value : '';
                    inputbox.disabled = thiz.state.readOnly;
                }
            },
            inputValidator: (value) => {
                return new Promise((resolve) => {
                    if (value === '') {
                        resolve();
                    }
                    else {
                        try {
                            //Parse to ensure JSON is valid.
                            JSON.parse(value);
                            resolve();
                        }
                        catch (error) {
                            resolve('Invalid JSON');
                        }
                    }
                });
            }
        }).then((result) => {
            if (!result.dismiss) {
                thiz.setState((state) => {
                    state.queries[index].configuration.filter = (result.value === '') ? null : result.value;
                    return state;
                }, () => {
                    thiz.loadData(thiz.refreshQueryPreview());
                });
            }
        });
    }

    applyGroupingToQuery = (index) => {
        let thiz = this;
        Swal.fire({
            title: 'Query column grouping',
            input: 'text',
            showCloseButton: true,
            showCancelButton: true,
            focusConfirm: false,
            onOpen: function (element) {
                let query = thiz.state.queries[index];
                if (query) {
                    let value = query.configuration.grouping;
                    let inputbox = element.querySelector('input[type="text"]');
                    inputbox.value = value ? value : '';
                    inputbox.disabled = thiz.state.readOnly;
                }
            },
            inputValidator: (value) => {
                return new Promise((resolve) => {
                    if (value === '') {
                        resolve();
                    }
                    else {
                        try {
                            //Parse to ensure JSON is valid.
                            JSON.parse(value);
                            resolve();
                        }
                        catch (error) {
                            resolve('Invalid JSON');
                        }
                    }
                });
            }
        }).then((result) => {
            if (!result.dismiss) {
                thiz.setState((state) => {
                    state.queries[index].configuration.grouping = (result.value === '') ? null : result.value;
                    return state;
                }, () => {
                    thiz.loadData(thiz.refreshQueryPreview());
                });
            }
        });
    }

    applySortingToQuery = (index) => {
        let thiz = this;
        Swal.fire({
            title: 'Query sorting',
            input: 'text',
            showCloseButton: true,
            showCancelButton: true,
            focusConfirm: false,
            onOpen: function (element) {
                let query = thiz.state.queries[index];
                if (query) {
                    let value = query.configuration.sort;
                    let inputbox = element.querySelector('input[type="text"]');
                    inputbox.value = value ? value : '';
                    inputbox.disabled = thiz.state.readOnly;
                }
            },
            inputValidator: (value) => {
                return new Promise((resolve) => {
                    if (value === '') {
                        resolve();
                    }
                    else {
                        try {
                            //Parse to ensure JSON is valid.
                            JSON.parse(value);
                            resolve();
                        }
                        catch (error) {
                            resolve('Invalid JSON');
                        }
                    }
                });
            }
        }).then((result) => {
            if (!result.dismiss) {
                thiz.setState((state) => {
                    state.queries[index].configuration.sort = (result.value === '') ? null : result.value;
                    return state;
                }, () => {
                    thiz.loadData(thiz.refreshQueryPreview());
                });
            }
        });
    }

    addQueryToGivenState = (state, value) => {
        state.queries.push({
            uuid: value ? value : '',
            configuration: {
                filter: '',
                grouping: '',
                sort: ''
            }
        });
        state.errors.queries.push(null);
    }

    addQuery = (value) => {
        let thiz = this;
        this.setState((state) => {
            thiz.addQueryToGivenState(state, value);
            return state;
        });
    }

    deleteQuery = (index) => {
        let thiz = this;
        this.setState((state) => {
            state.queries.splice(index, 1);
            state.errors.queries.splice(index, 1);
            return state;
        }, () => {
            thiz.loadData(thiz.refreshQueryPreview());
        });
    }

    loadData = (postLoadCallback) => {
        let params = {};
        let postUrl = '';
        let method = '';
        //when only single query is passed pass the uuid in url
        if (this.state.queries && (this.state.queries.length === 1)) {
            postUrl = 'analytics/query/' + this.state.queries[0].uuid + '?data=true';
        } else {
            postUrl = 'analytics/query/data';
            params['queries'] = this.state.queries;
            method = 'POST';
        };

        let thiz = this;
        window.postDataRequest(postUrl, params, method).
            then(function (responseData) {
                thiz.data = responseData.query.data;
                thiz.props.syncWidgetState("queries", thiz.state.queries, thiz.data)
                if (postLoadCallback) {
                    postLoadCallback();
                }
            }).
            catch(function (responseData) {
                console.error('Could not load data.');
                console.error(responseData);
                Swal.fire({
                    type: 'error',
                    title: 'Oops ...',
                    text: 'Could not load data. Please try after some time.'
                });
            });

    }

    loadQueries = (postLoadCallback) => {
        let thiz = this;
        window.postDataRequest('analytics/query?filter=' +
            encodeURIComponent('[{"take":500000,"skip":0,"sort":[{"field":"name","dir":"asc"}]}]')).
            then(function (response) {
                thiz.queryList = response.data;
                thiz.forceUpdate();
                if (postLoadCallback) {
                    postLoadCallback();
                }
            }).
            catch(function (response) {
                console.error(response)
                Swal.fire({
                    type: 'error',
                    title: 'Oops ...',
                    text: 'Failed to load queries. Please try after some time.'
                });
            });
    }
}

export default AbstractEditor;
