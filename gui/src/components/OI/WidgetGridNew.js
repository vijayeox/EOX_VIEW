import { ExcelExport } from '@progress/kendo-react-excel-export';
import { Grid, GridColumn as Column } from '@progress/kendo-react-grid';
import { IntlService } from '@progress/kendo-react-intl';
import { Menu, MenuItem } from "@progress/kendo-react-layout";
import { Popup } from "@progress/kendo-react-popup";
import "@progress/kendo-theme-bootstrap/dist/all.css";
import Moment from 'moment';
import React from 'react';
import ReactDOM from 'react-dom';
import WidgetDrillDownHelper from './WidgetDrillDownHelper';
import { WidgetGridLoader } from './WidgetGridLoader.js';
import { PopupContext } from "../../helpers";
import { EventListeners } from "../../interfaces";
import Swal from "sweetalert2";

const loadingPanel = (
    <div className="k-loading-mask">
        <span className="k-loading-text">Loading</span>
        <div className="k-loading-image"></div>
        <div className="k-loading-color"></div>
    </div>
);
export default class WidgetGridNew extends React.Component {
    constructor(props) {
        super(props);
        this.core = props.core;
        this.restClient = this.core.make("oxzion/restClient");
        this.excelExporter = null;
        this.allData = this.props.data ? props.data : [];
        // this.filteredData = null;
        this.filterParams = props.filterParams
        this.uuid = this.props.uuid
        let configuration = this.props.configuration;
        this.isDrillDownTable = this.props.isDrillDownTable;
        this.resizable = configuration ? (configuration.resizable ? configuration.resizable : false) : false;
        this.filterable = configuration ? (configuration.filterable ? configuration.filterable : false) : false;
        this.groupable = configuration ? (configuration.groupable ? configuration.groupable : false) : false;
        this.reorderable = configuration ? (configuration.reorderable ? configuration.reorderable : false) : false;
        this.height = configuration ? (configuration.height ? configuration.height : '100%') : '100%';
        this.width = configuration ? (configuration.width ? configuration.width : '100%') : '100%';
        this.columnConfig = configuration ? (configuration.column ? configuration.column : []) : [];
        this.rightClickPopup = configuration ? (configuration.rightClickPopup ? configuration.rightClickPopup : false) : false
        this.sortable = configuration ? (configuration.sort ? true : false) : false;
        this.pagerConfig = configuration ? (configuration.pageable ? { pageable: configuration.pageable } : {}) : {};
        this.pageSize = configuration ? (configuration.pageSize ? configuration.pageSize : 10) : 10;
        let oxzionMeta = configuration ? (configuration['oxzion-meta'] ? configuration['oxzion-meta'] : null) : null;
        this.exportToExcel = oxzionMeta ? (oxzionMeta['exportToExcel'] ? oxzionMeta['exportToExcel'] : false) : false;
        this.total_count = this.props.total_count
        this.helper = this.core.make("oxzion/link");
        // data can be assigned as allData since the first call needs to be assigned here.
        this.state = {
            props: this.props,
            displayedData: { data: this.allData, total: this.total_count },
            dataState: { take: this.pageSize, skip: 0 },
            filter: null,
            pagination: {
                skip: 0,
                take: this.pageSize
            },
            showContextPopup: false,
            sort: (configuration ? (configuration.sort ? configuration.sort : null) : null),
            group: null,
            exportFilterData: []
        };

        let beginWith = configuration ? configuration.beginWith : null;
        if (beginWith) {
            // let page = beginWith.page;
            // if (page) {
            //     this.state.pagination.skip = page.skip ? page.skip : 0;
            //     this.state.pagination.take = page.take ? page.size : 10;
            // }
            this.state.sort = beginWith.sort ? beginWith.sort : null;
            this.state.group = beginWith.group ? beginWith.group : null;
            this.state.filter = beginWith.filter ? beginWith.filter : null;
        }
    }

    handleContextMenu = (e) => {
        e.preventDefault();
        offSet.current = {
          left: e.clientX,
          top: e.clientY,
        };
        if(this.rightClickPopup == false){
            this.setState({showContextPopup: false});
        }
        else{
            this.setState({showContextPopup: true});
        }

      };

    dataStateChange = (e) => {
        // console.log(e);
        this.setState({
            ...this.state,
            dataState: e.dataState
        }, () => {
            // console.log(this.state.dataState);
        });
    }

    dataRecieved = (displayedData) => {
        this.setState({
            ...this.state,
            displayedData: displayedData
        });
    }

    saveAsExcel = () => {
        let filterData;
        filterData = (Object.keys(this.state.displayedData.data).length > 0) ? this.state.displayedData.data : this.allData
        this.excelExporter.save(filterData);
    }

    parseData = () => {
        let fieldDataTypeMap = new Map();
        for (const config of this.columnConfig) {
            if (config['dataType'] == "date" || config['type'] == "date") {
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

    componentDidMount() {
        this.parseData();
        // this.setState({displayedData: { data: [], total: 10000 },
        //     dataState: { take: 10, skip: 0 }})
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
        onContextMenu: (e) => {
            e.preventDefault();
            this.handleContextMenuOpen(e, dataItem.dataItem);
          }
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
        return tdElement;
    }

    gridFilterChanged = (e) => {
        if (e.filter == null) {
            this.setState({
                filter: e.filter,
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

    myCustomDateCell = (props,config) => {
        if (props.dataItem[props.field] !== '') {
          return <td>{Moment(props.dataItem[props.field]).format(config.dateFormat || "YYYY/MM/DD")}</td>
        }
        return <td>{props.dataItem[props.field]}</td>
    }

    jsonToText = (props,config) => {
        if (props.dataItem[props.field] !== '') {
          let jsonData = JSON.parse(props.dataItem[props.field]);
          if(jsonData !== null) {
            return <td>{jsonData[config.jsonKeyName]}</td>;
          } else {
            return <td></td>;
          }
        } else {
          return <td></td>;
        }
    }

    rowRender = (trElement, dataItem) => {
        const trProps = {
          ...trElement.props,
          onContextMenu: (e) => {
            e.preventDefault();
            this.handleContextMenuOpen(e, dataItem.dataItem);
          },
        };
        return React.cloneElement(
          trElement,
          { ...trProps },
          trElement.props.children
        );
      };

    handleOnSelect = (e) => {
    const appName =
      this.state.props.configuration["oxzion-meta"]["drillDown"][
        "nextWidgetId"
      ];
    const app = this.props.core
      .make("osjs/packages")
      .getPackages((m) => m.type === "application")
      .find((v) => v.name === appName);
    switch (e.item.text) {
      case "View":
        this.launchApplication(this.dataItem, appName, "file_uuid");
        break;
      case "Edit":
        this.editRecord(app);
        break;
      case "Delete":
        this.deleteRecord(app);
        break;
      default:
    }
    this.setState({
      showContextPopup: false,
    });
  };


  editRecord = async (app) => {
    const { file_uuid, formId } = this.dataItem;
    let ev = new CustomEvent(EventListeners.ADD_PAGE, {
      detail: {
        pageContent: [
          {
            form_id: formId,
            fileId: file_uuid,
            type: "Form",
            form_name: {
              name: "",
              uuid: formId,
            },
          },
        ],
      },
      bubbles: true,
    });
    document.getElementById(`navigation_${app.appId}`)?.dispatchEvent(ev);
  };

  deleteRecord = async (app) => {
    const { value } = await Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete the record? This cannot be undone.",
      icon: "question",
      imageWidth: 75,
      imageHeight: 75,
      confirmButtonText: "Delete",
      confirmButtonColor: "#d33",
      showCancelButton: true,
      cancelButtonColor: "#3085d6",
    });
    if (!value) return;
    const { file_uuid, version } = this.dataItem;
    const { status, message } = await this.restClient.request(
      "v1",
      `app/${app.appId}/file/crud/${file_uuid}?version=${version || 1}`,
      {},
      "delete"
    );
    const isSuccess = status == "success";
    this.props.notif?.current?.notify(
      isSuccess ? "Success" : "Error",
      !isSuccess ? message : "Deleted Successfully",
      isSuccess ? "success" : "danger"
    );
    if (isSuccess) {
      let data = [...this.state.gridData];
      data.splice(this.dataItemIndex, 1);
      this.setState({
        gridData: data,
      });
    }
  };

      onFocusHandler = () => {
        clearTimeout(this.blurTimeoutRef);
        this.blurTimeoutRef = undefined;
      };

      onBlurTimeout = () => {
        this.setState({
            showContextPopup: false,
        });

        this.blurTimeoutRef = undefined;
      };

      onBlurHandler = (event) => {
        clearTimeout(this.blurTimeoutRef);
        this.blurTimeoutRef = setTimeout(this.onBlurTimeout);
      };

      onPopupOpen = () => {
        this.menuWrapperRef.querySelector("[tabindex]").focus();
      };
      handleContextMenuOpen = (e, dataItem) => {
        this.dataItem = dataItem;
        this.offset = { left: e.clientX, top: e.clientY };
          this.setState({showContextPopup: true});
      };

      handleMoveUp = () => {
        let data = [...this.state.gridData];
        if (this.dataItemIndex !== 0) {
          data.splice(this.dataItemIndex, 1);
          data.splice(this.dataItemIndex - 1, 0, this.dataItem);
          this.setState({ gridData: data });
        }
      };

      handleMoveDown = () => {
        let data = [...this.state.gridData];
        if (this.dataItemIndex < this.state.gridData.length) {
          data.splice(this.dataItemIndex, 1);
          data.splice(this.dataItemIndex + 1, 0, this.dataItem);
          this.setState({ gridData: data });
        }
      };

      handleDelete = () => {
        let data = [...this.state.gridData];
        data.splice(this.dataItemIndex, 1);
        this.setState({
          gridData: data,
        });
      };

    render() {
        let thiz = this;
        let hasBackButton = this.hasBackButton()
        function getColumns() {
            let columns = []
            for (const config of thiz.columnConfig) {
                if (config['footerAggregate']) {
                    if (config['type'] == null) {
                        columns.push(<Column field={config['field']} title={config['title']} key={config['field']} className={config['className'] ? config['className'] : null}/>);
                    } else {
                        columns.push(<Column field={config['field']} title={config['title']} filter={config ? ((config['type'] == 'number') ? 'numeric' : config['type']) : "numeric"} key={config['field']} className={config['className'] ? config['className'] : null} />);
                    }
                } else if (config['jsonKeyName']) {
                  columns.push(<Column field={config['field']} title={config['title']} key={config['field']} filter="text"  {...config} className={config['className'] ? config['className'] : null} cell={(props) => thiz.jsonToText(props,config)} />);
                } else {
                    if (config['type'] == null) {
                        columns.push(<Column field={config['field']} title={config['title']} key={config['field']} {...config} className={config['className'] ? config['className'] : null}/>);
                    } else if (config['type'] == 'date'){
                        columns.push(<Column field={config['field']} title={config['title']} filter="date" key={config['field']} {...config} className={config['className'] ? config['className'] : null} cell={(props) => thiz.myCustomDateCell(props,config)} />);
                    } else {
                        columns.push(<Column field={config['field']} title={config['title']} filter={config ? ((config['type'] == 'number') ? 'numeric' : config['type']) : "numeric"
                        } key={config['field']} {...config} className={config['className'] ? config['className'] : null} />);
                    }
                }
            }
            return columns;
        }

        let gridTag = <Grid
            style={{ height: this.height, width: this.width }}
            className={this.isDrillDownTable ? "drillDownStyle" : ""}
            filterable={this.filterable}
            filterOperators={{
                'text': [
                    { text: 'grid.filterStartsWithOperator', operator: 'startswith' },
                    { text: 'grid.filterStartsWithOperator', operator: 'endswith' },
                    { text: 'grid.filterContainsOperator', operator: 'contains' },
                    { text: 'grid.filterNotContainsOperator', operator: 'doesnotcontain' },
                    { text: 'grid.filterEqOperator', operator: 'eq' },
                ],
                'numeric': [
                    { text: 'grid.filterEqOperator', operator: 'eq' },
                    { text: 'grid.filterGteOperator', operator: 'gte' },
                    { text: 'grid.filterGtOperator', operator: 'gt' },
                    { text: 'grid.filterLteOperator', operator: 'lte' },
                    { text: 'grid.filterLtOperator', operator: 'lt' },
                ],
                'date': [
                    { text: 'grid.filterEqOperator', operator: 'eq' },
                ],
                'boolean': [
                    { text: 'grid.filterEqOperator', operator: 'eq' }
                ]
            }}
            {...this.pagerConfig}
            resizable={this.resizable}
            sortable={this.sortable}
            sort={this.state.sort}
            groupable={this.groupable}
            rowRender={this.rightClickPopup
                ? this.rowRender
                : this.rowRender}
            group={this.state.group}
            // onFilterChange={this.gridFilterChanged}
            reorderable={this.reorderable}
            {...this.state.dataState}
            {...this.state.displayedData}
            onDataStateChange={this.dataStateChange}
            onRowClick={this.drillDownClick}
            cellRender={(tdelement, cellProps) => this.cellRender(tdelement, cellProps, this)}
        >
            {/* comment all the columns for testing with our api  */}
            {/* <GridColumn field="ProductID" filter="numeric" title="Id" />
            <GridColumn field="ProductName" title="Name" />
            <GridColumn field="UnitPrice" filter="numeric" format="{0:c}" title="Price" />
            <GridColumn field="UnitsInStock" filter="numeric" title="In stock" /> */}
            {getColumns()}
        </Grid>;
        let gridLoader = <WidgetGridLoader
            dataState={this.state.dataState}
            onDataRecieved={this.dataRecieved}
            uuid={this.uuid}
            filterParams={this.filterParams}
            core={this.core}
        />;

        return (
            <>
                {this.state.displayedData.length === 0 && loadingPanel}
                {
                // this.isDrillDownTable &&
                //     <div className="oxzion-widget-drilldown-table-icon" style={hasBackButton ? { right: "5%" } : { right: "7px" }} title="Drilldown Table">
                //         <i className="fas fa-angle-double-down fa-lg"></i>
                //     </div>
                }
                {/* {gridTag}
                {gridLoader} */}
                {this.exportToExcel &&
                    <>
                        <div
                            className="oxzion-widget-drilldown-excel-icon"
                            style={hasBackButton ? { right: "5%" } : { }}
                            onClick={this.saveAsExcel}>
                            <i className="fa fa-file-excel fa-lg"></i>
                        </div>
                        <ExcelExport
                            data={this.state.displayedData}
                            ref={exporter => this.excelExporter = exporter}
                            filterable
                        >
                            {
        <Popup
          offset={this.offset}
          show={this.state.showContextPopup}
          open={this.onPopupOpen}
          popupClass={"popup-content"}
        >
          <div
            onFocus={this.onFocusHandler}
            onBlur={this.onBlurHandler}
            tabIndex={-1}
            ref={(el) => (this.menuWrapperRef = el)}
          >
            <Menu
              vertical={true}
              style={{ display: "inline-block" }}
              onSelect={this.handleOnSelect}
            >
              <MenuItem text="View" />
              <MenuItem text="Edit" />
              <MenuItem text="Delete" />
            </Menu>
            <i
              style={{
                color: "#212529b3",
                cursor: "pointer",
                position: "absolute",
                top: "1px",
                right: "-2px",
              }}
              className={"fas fa-times"}
              onClick={() => {
                this.setState({showContextPopup: false});
              }}
            ></i>
          </div>
        </Popup>}
                            {gridTag}
                            {gridLoader}
                        </ExcelExport>
                    </>
                }
                {!this.exportToExcel &&
                <>
                {this.state.showContextPopup && (
                  <PopupContext
                    offset={this.offset}
                    onClick={this.handleOnSelect}
                    onClose={() => this.setState({ showContextPopup: false })}
                    menus={[
                      {
                        text: "View",
                        icon: "fa fa-eye",
                        disabled: !this.dataItem.file_uuid,
                      },
                      {
                        text: "Edit",
                        icon: "fa fa-pencil",
                        disabled: !this.dataItem.formId,
                      },
                      {
                        text: "Delete",
                        icon: "fa fa-trash",
                        disabled: !this.dataItem.version,
                      },
                    ]}
                  />
            )}
                    {gridTag}
                    {gridLoader}
                </>
                }
            </>
        );
    }
}
