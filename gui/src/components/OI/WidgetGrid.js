import React from 'react';
import ReactDOM from 'react-dom';
import { Grid, GridColumn, GridToolbar } from '@progress/kendo-react-grid';
import { filterBy, orderBy, process } from '@progress/kendo-data-query';
import { IntlService } from '@progress/kendo-react-intl'
import { ExcelExport } from '@progress/kendo-react-excel-export';
import WidgetDrillDownHelper from './WidgetDrillDownHelper';
import "@progress/kendo-theme-bootstrap/dist/all.css";
import parseCustom from "html-react-parser";
import Moment from 'moment';

const loadingPanel = (
    <div className="k-loading-mask">
        <span className="k-loading-text">Loading</span>
        <div className="k-loading-image"></div>
        <div className="k-loading-color"></div>
    </div>
);

export default class WidgetGrid extends React.Component {
    constructor(props) {
        super(props);
        this.excelExporter = null;
        this.allData = this.props.data ? this.props.data : [];
        this.filteredData = null;
        let configuration = this.props.configuration;
        this.isDrillDownTable = this.props.isDrillDownTable;
        this.resizable = configuration ? (configuration.resizable ? configuration.resizable : false) : false;
        this.filterable = configuration ? (configuration.filterable ? configuration.filterable : false) : false;
        this.groupable = configuration ? (configuration.groupable ? configuration.groupable : false) : false;
        this.reorderable = configuration ? (configuration.reorderable ? configuration.reorderable : false) : false;
        this.height = configuration ? (configuration.height ? configuration.height : '100%') : '100%';
        this.width = configuration ? (configuration.width ? configuration.width : '100%') : '100%';
        this.columnConfig = configuration ? (configuration.column ? configuration.column : []) : [];
        this.sortable = configuration ? (configuration.sort ? true : false) : false;
        this.pagerConfig = configuration ? (configuration.pageable ? { pageable: configuration.pageable } : {}) : {};
        this.pageSize = configuration ? (configuration.pageSize ? configuration.pageSize : 10) : 10;
        let oxzionMeta = configuration ? (configuration['oxzion-meta'] ? configuration['oxzion-meta'] : null) : null;
        this.exportToExcel = oxzionMeta ? (oxzionMeta['exportToExcel'] ? oxzionMeta['exportToExcel'] : false) : false;
        this.core = this.props.core;
        this.helper = this.core.make("oxzion/link");
        this.state = {
            filter: null,
            props: this.props,
            pagination: {
                skip: 0,
                take: this.pageSize
            },
            sort: (configuration ? (configuration.sort ? configuration.sort : null) : null),
            group: null,
            displayedData: [],
            exportFilterData: []
        };

        let beginWith = configuration ? configuration.beginWith : null;
        if (beginWith) {
            let page = beginWith.page;
            if (page) {
                this.state.pagination.skip = page.skip ? page.skip : 0;
                this.state.pagination.take = page.take ? page.size : 10;
            }
            this.state.sort = beginWith.sort ? beginWith.sort : null;
            this.state.group = beginWith.group ? beginWith.group : null;
            this.state.filter = beginWith.filter ? beginWith.filter : null;
        }
    }

    saveAsExcel = () => {
        let filterData;
        filterData = (Object.keys(this.state.exportFilterData).length > 0) ? this.state.exportFilterData : this.allData
        this.excelExporter.save(filterData);
    }

    parseData = () => {
        let fieldDataTypeMap = new Map();
        for (const config of this.columnConfig) {
            if (config['dataType'] === "date" || config['type'] === "date") {
                fieldDataTypeMap.set(config['field'], (config['dataType'] || config['type']));
            }
        }
        for (let dataItem of this.allData) {
            for (let [field, dataType] of fieldDataTypeMap) {
                switch (dataType) {
                    case 'date':
                        dataItem[field] = new Date(dataItem[field]);
                        break;
                    default:
                        throw `Column data type ${dataType} is not parsed. Add parser to parse it.`;
                }
            }
        }
    }

    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }


    prepareData = (refilter) => {
        // testing code 

        // if(this.allData) {
        //     this.allData.map(data => {
        //         data['rflag'] = this.getRandomInt(0,4);
        //         console.log(data);
        //     })
        // }


        if (this.allData) {
            this.allData.map(data => {
                //trimmimg time from date in order for date filter to work
                data.date ? data.date.setHours(0, 0, 0, 0) : null
            })
        }
        if (this.state.sort) {
            this.allData = orderBy(this.allData, this.state.sort);
        }
        if (!this.filteredData || refilter) {
            let filter = this.state.filter;
            this.filteredData = filter ? filterBy(this.allData, filter) : this.allData;
        }
        let pagination = this.state.pagination;
        let displayedData = process(this.filteredData, {
            take: pagination.take,
            skip: this.state.filter ? (refilter ? 0 : pagination.skip) : pagination.skip,
            group: this.state.group
        });
        this.setState({
            displayedData: displayedData
        });
    }

    getFilteredRowCount = () => {
        return this.filteredData ? this.filteredData.length : 0;
    }

    componentDidMount() {
        this.parseData();
        this.prepareData(true);
    }

    gridPageChanged = (e) => {
        console.log("page event clicked");
        // call the api to get the data for the next page by passing the new page
        let pagination = {
            skip: e.page.skip,
            take: e.page.take
        }
        this.setState({
            pagination: pagination
        }, () => {
            this.prepareData(false);
        });
    }

    gridFilterChanged = (e) => {
        if (e.filter == null) {
            this.setState({
                filter: e.filter,
                exportFilterData: this.allData,
            }, () => {
                this.prepareData(true);
            });
        } else {
            this.setState({
                filter: e.filter,
                exportFilterData: e.target.props.data,
            }, () => {
                this.prepareData(true);
            });
        }
    }

    gridSortChanged = (e) => {
        this.allData = orderBy(this.allData, e.sort);
        this.setState({
            sort: e.sort
        }, () => {
            this.prepareData(true);
        });
    }

    gridGroupChanged = (e) => {
        this.setState({
            group: e.group
        }, () => {
            this.prepareData(false);
        });
    }

    gridGroupExpansionChanged = (e) => {
        e.dataItem[e.target.props.expandField] = e.value;
        //Force state change with modified e.dataItem in this.state.displayedData. This state
        //change forces Kendo grid to repaint itself with expanded/collapsed grouped row item.
        this.setState((state) => {
            state.displayedData = this.state.displayedData;
            return state;
        });
    }

    //No implementation now. Add implementation if needed later.
    gridDataStageChanged = (e) => {
        console.log('Called event handler - gridDataStageChanged. Event is:');
        console.log(e);
    }

    drillDownClick = (evt) => {
        // console.log(this.props.configuration);
        let drillDownTarget = this.state.props.configuration["oxzion-meta"]['drillDown']['target'];
        let drillDownField = this.state.props.configuration["oxzion-meta"]['drillDown']['drillDownField'];
        if (drillDownTarget == 'file') {
            let appName = this.state.props.configuration["oxzion-meta"]['drillDown']['nextWidgetId'];
            let eventData = evt.dataItem;
            // console.log("Inside the file log Content" + eventData); //Need to open a URL
            this.launchApplication(eventData, appName, drillDownField)
        } else {
            WidgetDrillDownHelper.drillDownClicked(WidgetDrillDownHelper.findWidgetElement(evt.nativeEvent ? evt.nativeEvent.target : evt.target), evt.dataItem)
            ReactDOM.unmountComponentAtNode(this.state.props.canvasElement)
        }
    }

    launchApplication(event, selectedApplication, drillDownField) {
        console.log(event[drillDownField]);
        if (drillDownField) {
            this.helper.launchApp({
                // pageId: event.target.getAttribute("page-id"),
                pageTitle: event.name,
                // pageIcon: event.target.getAttribute("icon"),
                fileId: (event[drillDownField]) ? event[drillDownField] : event.uuid,
            }, selectedApplication);
        }
    }

    hasBackButton() {
        if (this.props.canvasElement && this.props.canvasElement.parentElement) {
            let backbutton = this.props.canvasElement.parentElement.getElementsByClassName('oxzion-widget-roll-up-button')
            if (backbutton.length > 0)
                return true
            else
                return false
        } else {
            return false
        }
    }

    cellRender(tdElement, cellProps, thiz) {
        if (cellProps.rowType === 'groupFooter') {
            let element = null
            if (thiz.props.configuration["groupable"] && thiz.props.configuration["groupable"] != false && thiz.props.configuration["groupable"]["aggregate"]) {
                let aggregateColumns = thiz.props.configuration["groupable"]["aggregate"]
                let sum = 0
                let kendo_service = new IntlService()
                let formattedSum = sum
                aggregateColumns.forEach(column => {
                    if (cellProps.field == column.field) {
                        cellProps.dataItem.items.forEach(item => {
                            if (typeof (item[column.field]) == "number") {
                                sum += item[column.field]
                            }
                        })
                        formattedSum = sum
                        if (column.format) {
                            formattedSum = kendo_service.toString(sum, column.format)
                        }
                        element = <td>{formattedSum}</td>
                    }
                })
                if (element != null) {
                    return <td>{formattedSum}</td>
                }
            }
        }
        // if (this.props.configuration["oxzion-meta"]["drillDown"] != null) {
        if (this.props.isDrillDownTable === 'undefined' && this.props.configuration["oxzion-meta"]["drillDown"] !== null) {
            let target = this.props.configuration["oxzion-meta"]["drillDown"];
            if (target["target"] == "link") {
                return <td><a eoxapplication={target["AppName"]} file-id={column.uuid}>{column.name}</a></td>
            }
        }
        return tdElement;
    }

    Aggregate = (props, configuration) => {
        let total = 0
        if (this.state.displayedData.data) {
            total = this.state.displayedData.data.reduce((acc, current) => acc + (typeof (current[props.field]) == "number" ? current[props.field] : 0), 0)
        }
        if (!Number.isNaN(total)) {
            let formattedSum = total
            if (configuration.format) {
                let kendo_service = new IntlService()
                formattedSum = kendo_service.toString(total, configuration.format)
            }
            return (
                <td colSpan={props.colSpan} style={configuration.style}>
                    {configuration.value}{formattedSum}
                </td>
            );
        } return <td></td>
    }

    // Function to return  the html string and convert it as an html to be loaded by iterating through the cases 
    /*
        Params 
        props - Properties 
        configuration - Configuration array provided for the query 
        c - Column Name
        d - fieldValuetypes from the configuration 
    */
    getIconValue = (props, configuration, c, d) => {
        if (d.length > 0) {
            for (var i = 0; i <= d.length; i++) {
                var caseValue = d[i];
                if (String(caseValue) === String(props.dataItem[c])) {
                    return [
                        parseCustom(configuration.html.images[i][String(caseValue)]),
                        configuration.colors[String(caseValue)]
                    ]
                }
            }
        }
        else {
            console.log("Check the configuration, the field types is kept empty in the configuration.")
        }
    }

    // Function to render the different html tags inside the grid column 
    /*
        Params 
        props - Properties 
        configuration - Configuration array provided for the query 
        c - Column Name
    */
    cellWithBackGround = (props, configuration, c) => {
        let colName = c
        // fetch the images to be loaded from the configuration
        const icons = configuration.html.images
        const fieldValueTypesForCheck = configuration.html.fieldValuetypes
        // get the value of the check by getting the field from configuration and putting it to check folder 
        let deciderCheck = configuration.html.field
        // Fetch the information to be loaded for rendering 
        var [icontoBeLoaded, styles] = this.getIconValue(props, configuration, deciderCheck, fieldValueTypesForCheck)
        // Create the style based on the color that we provide. 
        var style = {
            backgroundColor: String(styles),
        };

        // Return the table elements 
        return (
            <td colSpan={props.colSpan} style={style} >
                {props.dataItem[colName]}{icontoBeLoaded}
            </td>
        );
    };

    myCustomDateCell = (props,config) => {	
        if (props.dataItem[props.field] !== '') {	
          return <td className={config.className} >{Moment(props.dataItem[props.field]).format(config.dateFormat || "YYYY/MM/DD")}</td>	
        }	
        return <td>{props.dataItem[props.field]}</td>	
    }


    render() {
        let thiz = this;
        let hasBackButton = this.hasBackButton()
        function getColumns() {
            let columns = []
            for (const config of thiz.columnConfig) {
                if (config['footerAggregate']) {
                    // add a check here for checking for derived column around this. if derived column pass the props to load derived column values. 

                    columns.push(<GridColumn key={config['field']} {...config} footerCell={(props) => thiz.Aggregate(props, config['footerAggregate'])} className={config['className'] ? config['className'] : null}/>);
                } else {
                    if (config['derived_column']) {
                        columns.push(<GridColumn key={config['field']} {...config} className={config['className'] ? config['className'] : null} cell={(props) => thiz.cellWithBackGround(props, config, config['field'])} />)
                    } else if (config['type'] == 'date') {
                        columns.push(<GridColumn field={config['field']} title={config['title']} filter="date" key={config['field']} {...config} className={config['className'] ? config['className'] : null} cell={(props) => thiz.myCustomDateCell(props,config)} />);
                    } else {
                        columns.push(<GridColumn key={config['field']} {...config} className={config['className'] ? config['className'] : null} />);
                    }
                }
            }
            return columns;
        }
        let gridTag = <Grid
            style={{ height: this.height, width: this.width }}
            className={this.isDrillDownTable ? "drillDownStyle" : ""}
            data={this.state.displayedData}
            resizable={this.resizable}
            reorderable={this.reorderable}
            cellRender={(tdelement, cellProps) => this.cellRender(tdelement, cellProps, this)}
            filterable={this.filterable}
            filter={this.state.filter}
            onFilterChange={this.gridFilterChanged}
            pageSize={this.pageSize}
            {...this.pagerConfig} //Sets grid "pageable" property
            total={this.getFilteredRowCount()}
            skip={this.state.pagination.skip}
            take={this.state.pagination.take}
            onPageChange={this.gridPageChanged}
            sortable={this.sortable}
            sort={this.state.sort}
            onSortChange={this.gridSortChanged}
            onRowClick={this.drillDownClick}
            groupable={this.groupable}
            group={this.state.group}
            onGroupChange={this.gridGroupChanged}
            onExpandChange={this.gridGroupExpansionChanged}
            // onDataStateChange={this.gridDataStageChanged}
            expandField='expanded'
        >
            {getColumns()}
        </Grid>;

        return (
            <>
                {this.state.displayedData.length === 0 && loadingPanel}
                {
                // this.isDrillDownTable &&
                //     <div className="oxzion-widget-drilldown-table-icon" style={hasBackButton ? { right: "5%" } : { right: "7px" }} title="Drilldown Table">
                //         <i className="fas fa-angle-double-down fa-lg"></i>
                //     </div>
                }
                {this.exportToExcel &&
                    <>
                        <div
                            className="oxzion-widget-drilldown-excel-icon"
                            style={hasBackButton ? { right: "5%" } : { right: "10px" }}
                            onClick={this.saveAsExcel}>
                            <i className="fa fa-file-excel fa-lg"></i>
                        </div>
                        <ExcelExport
                            data={this.state.exportFilterData}
                            ref={exporter => this.excelExporter = exporter}
                            filterable
                        >
                            {gridTag}
                        </ExcelExport>
                    </>
                }
                {!this.exportToExcel && gridTag}
            </>
        );
    }
}