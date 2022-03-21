
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { toODataString } from '@progress/kendo-data-query';
import { string } from 'prop-types';
import { preparefilter } from './DashboardUtils'
import { filter } from '@progress/kendo-data-query/dist/npm/transducers';
import './WidgetGridLoader.scss'

export class WidgetGridLoader extends React.Component {

    constructor(props) {
        super(props);
        this.core = props.core;
        this.helper = this.core.make("oxzion/restClient");
        this.uuid = props.uuid;
        this.filterParams = props.filterParams;
    }

    lastSuccess = '';
    pending = '';
    gridfilterString = '';

    // function to create Grid Filter Parameters 
    // params - The default filterGrid event parameters that are triggered by gridstateChange event
    createFilterString = (gridFilterParams) => {
        let filterVal = []
        let parentFilter = []
        var filterString = ""
        let dateOp = ""
        let stringOp
        for (var key of Object.keys(gridFilterParams)) {
            if (key == 'filters') {
                var gridFilterString = ""
                // Loop through each filter object and create elastic filters 
                let length = gridFilterParams[key].length;
                gridFilterParams[key].map((data, index) => {
                    if (data.value == null) {
                        return gridFilterString
                    } else {
                        // if only 1 filter is associated
                        if (index === 0) {
                            // if (filterVal.length > 0) {
                            //     parentFilter.push(filterVal);
                            //     parentFilter.push("AND")
                            // }
                            let gridFilterP = []
                            gridFilterP.push(data.field);
                            if ((typeof data.value) == "string") {
                                stringOp = this.getStringOperator(data.operator);
                                gridFilterP.push(stringOp);
                            } else if ((typeof data.value) == "number") {
                                dateOp = this.getDateOperator(data.operator)
                                gridFilterP.push(dateOp);
                            }
                            // IMPORTANT - Add for date filters too // 
                            gridFilterP.push(data.value);
                            // if only 1 object in the filters
                            if (index + 1 == length) {
                                gridFilterString = JSON.stringify(gridFilterP)
                                gridFilterP = []
                            } else {
                                filterVal.push(gridFilterP)
                                gridFilterP = []
                                gridFilterString = JSON.stringify(filterVal)
                            }
                        } else {
                            // if not the first object i.e. multiple filters 
                            let gridFilterP = []
                            gridFilterP.push(data.field);
                            // Add more operators according to supported parameters. Change to switch if Many 
                            if ((typeof data.value) == "string") {
                                stringOp = this.getStringOperator(data.operator);
                                gridFilterP.push(stringOp);
                            } else if ((typeof data.value) == "number") {
                                dateOp = this.getDateOperator(data.operator)
                                gridFilterP.push(dateOp);
                            }
                            // IMPORTANT - Add for date filters too //
                            gridFilterP.push(data.value);
                            if (index > 1) {
                                parentFilter = []
                                if (filterVal.length > 0) {
                                    parentFilter.push(filterVal)
                                }
                                parentFilter.push("AND")
                                parentFilter.push(gridFilterP)
                                gridFilterP = []
                                // filterVal = []
                                gridFilterString = JSON.stringify(parentFilter)
                                filterVal = parentFilter;
                            } else {
                                filterVal.push("AND")
                                filterVal.push(gridFilterP)
                                gridFilterP = []
                                gridFilterString = JSON.stringify(filterVal)
                            }
                        }
                    }
                });
                filterString = gridFilterString
            }
        }
        // console.log("The filter string looks like : ");
        // console.log(filterString);
        return filterString
    }

    getDateOperator(operator) {
        let gridFilterP = ""
        if (operator == 'eq') {
            gridFilterP = "=="
        } else if (operator == 'neq') {
            gridFilterP = "!=";
        } else if (operator == 'gte') {
            gridFilterP = ">=";
        } else if (operator == 'gt') {
            gridFilterP = ">"
        } else if (operator == 'lte') {
            gridFilterP = "<="
        } else if (operator == 'lt') {
            gridFilterP = "<"
        } else {
            gridFilterP = "==";
        }
        return gridFilterP;
    }

    getStringOperator(operator) {
        let gridFilterP
        if (operator == 'startswith') {
            gridFilterP = "STARTSWITH"
        } else if (operator == 'contains') {
            gridFilterP = "LIKE";
        } else if (operator == 'doesnotcontain') {
            gridFilterP = "NOT LIKE";
        } else if (operator == 'eq') {
            gridFilterP = "=="
        } else if (operator == 'neq') {
            gridFilterP = "!="
        } else {
            gridFilterP = "==";
        }
        return gridFilterP;
    }

    requestDataIfNeeded = () => {
        // use the datastate to generate required query and pass it to the check as well
        var dataStateCopy = {}

        if (this.props.dataState['filter'] != null) {
            dataStateCopy['filter_grid'] = this.props.dataState ? this.props.dataState['filter'] : null
        }
        if (this.props.dataState['skip'] != null) {
            dataStateCopy['skip'] = this.props.dataState ? this.props.dataState['skip'] : null
        }
        if (this.props.dataState['take'] != null) {
            dataStateCopy['take'] = this.props.dataState ? this.props.dataState['take'] : null
        }
        if (this.props.dataState['sort'] != null) {
            dataStateCopy['sort'] = this.props.dataState ? this.props.dataState['sort'] : null
        }
        if (this.props.dataState['group'] != null) {
            dataStateCopy['group'] = this.props.dataState ? this.props.dataState['group'] : null
        }
        var filtersApplied = ''
        let filterD = typeof (dataStateCopy['filter_grid'])
        if (filterD == "undefined") {
            // Since no filters are there, we can use the OData string 
            filtersApplied = toODataString(this.props.dataState);
            filtersApplied = filtersApplied.replace(/\$/g, '');
            // filtersApplied = filtersApplied.replace('filter', 'filter_grid')
        } else {
            // call createFilterString to get the filter String required for filters 
            this.gridfilterString = this.createFilterString(dataStateCopy['filter_grid']);
            // console.log(this.gridfilterString)
            filtersApplied = toODataString(this.props.dataState);
            filtersApplied = filtersApplied.replace(/\$/g, '');
            var filterSplit = filtersApplied.split(/&(.+)/)
            filtersApplied = filterSplit[1]
            if (this.gridfilterString == "") {
                filtersApplied = filtersApplied
            }
            else {
                filtersApplied = filtersApplied + "&filter_grid=" + this.gridfilterString
            }

        }
        // console.log('final check before the filter request');
        // console.log(filtersApplied);
        if (this.pending || filtersApplied === this.lastSuccess) {
            // change the check for the previous value not to return 
            return;
        }
        this.pending = filtersApplied;
        this.getWidgetByUuid(this.uuid, this.filterParams, this.pending).then(response => {
            if (response.status == "success") {
                this.lastSuccess = this.pending;
                this.pending = '';
                if (filtersApplied === this.lastSuccess) {
                    this.props.onDataRecieved.call(undefined, {
                        data: response.data.widget.data,
                        total: response.data.widget.total_count
                    });
                } else {
                    this.requestDataIfNeeded();
                }
            }
            else {
                // generate an alert for data issues
            }
        });
    }
    async getWidgetByUuid(uuid, filterParams, gridParams) {
        let filterParameter = (filterParams && filterParams != [] && filterParams.length != 0) ? ("&filter=" + JSON.stringify(filterParams)) : ''
        // send this filters to widgets as well so that we can append those to the url that we are trying to create 
        let response = await this.helper.request(
            "v1",
            "analytics/widget/" + uuid + '?data=true' + filterParameter + "&" + gridParams,
            {},
            "get"
        );
        return response;
    }

    render() {
        this.requestDataIfNeeded();
        return this.pending && <LoadingPanel />;
    }
}

class LoadingPanel extends React.Component {
    render() {
        const loadingPanel = (
            <div className="k-loading-mask" style={{"backgroundColor":"white","minHeight":"200vh"}}>
                <span className="k-loading-text">Loading</span>
                <div className="k-loading-image"></div>
                <div className="k-loading-color"></div>
            </div>
        );
        const gridContent = document && document.querySelector('.k-grid-content');
        return gridContent ? ReactDOM.createPortal(loadingPanel, gridContent) : loadingPanel;
    }
}
