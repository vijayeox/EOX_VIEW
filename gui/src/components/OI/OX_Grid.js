import { process } from "@progress/kendo-data-query";
import { Button, DropDownButton } from "@progress/kendo-react-buttons";
import { DateTimePicker } from "@progress/kendo-react-dateinputs";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { ExcelExport, ExcelExportColumn } from "@progress/kendo-react-excel-export";
import { Grid, GridColumn, GridColumnMenuCheckboxFilter, GridDetailRow, GridNoRecords, GridToolbar } from "@progress/kendo-react-grid";
import { Menu, MenuItem } from "@progress/kendo-react-layout";
import { GridPDFExport } from "@progress/kendo-react-pdf";
import { Popup } from "@progress/kendo-react-popup";
import "@progress/kendo-theme-bootstrap/dist/all.css";
import $ from "jquery";
import moment from "moment";
import PropTypes from "prop-types";
import React from "react";
import JsxParser from "react-jsx-parser";
import Swal from "sweetalert2";
import ParameterHandler from "../App/ParameterHandler";
import { ColumnMenu } from "../Grid/ColumnMenu";
import CustomFilter from "../Grid/CustomFilter";
import "../Grid/customStyles.scss";
import DataLoader from "../Grid/DataLoader";
import DataOperation from "../Grid/DataOperation";
import InlineComponent from "../Grid/InlineComponent";
import PageNavigation from "../PageNavigation";
const util = require("util");

export default class OX_Grid extends React.Component {
  constructor(props) {
    super(props);
    this.core = this.props.osjsCore;
    this.baseUrl = this.props.osjsCore ? this.props.osjsCore.config("wrapper.url") : undefined;
    this.userprofile = this.props.osjsCore ? this.props.osjsCore.make("oxzion/profile").get().key : undefined;
    this.restClient = this.core.make("oxzion/restClient");
    this.rawDataPresent = typeof this.props.data == "object" ? true : false;
    this.pageId = this.props.pageId;
    this.appId = this.props.appId;
    this.notif = this.props.notif;
    this.datePickerValue = null;
    this.state = {
      showLoader: false,
      gridData: this.rawDataPresent ? this.props.data : { data: [], total: 0 },
      dataState: this.props.gridDefaultFilters ? this.props.gridDefaultFilters : {},
      showButtonPopup: false,
      buttonPopup: null,
      contextMenuOpen: false,
      notif: this.notif,
      apiActivityCompleted: this.rawDataPresent ? true : false,
      isTab: this.props.isTab ? this.props.isTab : false,
      actions: this.props.actions ? this.props.actions : null,
      menu: null,
    };
    this.blurTimeoutRef;
    this.menuWrapperRef;
    this.appNavigationDiv = "navigation_" + this.props.appId;
    this.loader = this.props.osjsCore.make("oxzion/splash");
    this.child = this.props.reference ? this.props.reference : React.createRef();
    this.refreshHandler = this.refreshHandler.bind(this);
    this.inlineEdit = this.inlineEdit.bind(this);
    this.toggleGridLoader = this.toggleGridLoader.bind(this);
    this.toggleGridLoader();
  }
  _excelExport;
  _grid;

  componentDidMount() {
    document.getElementById(this.appNavigationDiv) ? document.getElementById(this.appNavigationDiv).addEventListener("handleGridRefresh", () => this.refreshHandler(), false) : null;
    $(document).ready(function () {
      $(".k-textbox").attr("placeholder", "Search");
    });
    if (!document.getElementsByClassName("PageRender")) {
      this.gridHeight = document.getElementsByClassName("PageRender")[0].clientHeight - 50;
    }
    this.generateGridToolbar();
    document.getElementById("customActionsToolbar").addEventListener("getCustomActions", this.getCustomActions, false);
    document.getElementById(`navigation_${this.appId}`)?.addEventListener("exportPdf", this.exportPDF, false);
    this.toggleGridLoader();
  }

  componentWillUnmount() {
    document.getElementById(`navigation_${this.appId}`)?.removeEventListener("exportPdf", this.exportPDF, false);
  }

  getCustomActions = (e) => {
    this.generateGridToolbar();
  };

  dataStateChange = (e) => {
    if (e?.dataState?.filter?.filters?.find(o => o.value === "")) return;
    const showLoader = (() => {
      try {
        return JSON.stringify(this.state?.dataState) !== JSON.stringify(e?.dataState);
      } catch (e) {
        return false;
      }
    })();
    this.setState({ ...this.state, dataState: e.dataState, apiActivityCompleted: false }, () => showLoader && this.toggleGridLoader());
  };

  dataRecieved = (data) => {
    this.setState({ gridData: data, apiActivityCompleted: true }, this.toggleGridLoader);
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    // change to use componentDidUpdate later in future
    // Write different props which when changed we need to trigger a setState
    if (util.inspect(this.props.data, { depth: 2 }) != util.inspect(nextProps.data) || util.inspect(this.props.gridDefaultFilters, { depth: 4 }) != util.inspect(nextProps.gridDefaultFilters, { depth: 4 }) || util.inspect(this.props.columnConfig) != util.inspect(nextProps.columnConfig)) {
      if (nextProps.gridDefaultFilters) {
        let mergedFilters = {
          ...this.state.dataState,
          ...nextProps.gridDefaultFilters,
        };
        this.setState({ dataState: mergedFilters });
      }
    }
  }

  async DeleteFile(api, item, urlPostParams) {
    let response = await this.restClient.request("v1", "/" + api, urlPostParams ? urlPostParams : {}, item.typeOfRequest ? item.typeOfRequest : "post");
    return response;
  }

  parseDefaultFilters() {
    var splitUrl = this.props.data.split("?");
    if (splitUrl[1]) {
      apiUrl = splitUrl[0];
      var getUrlParams = decodeURI(splitUrl[1])
        .replace("?", "")
        .split("&")
        .map((param) => param.split("="))
        .reduce((values, [key, value]) => {
          values[key] = value;
          return values;
        }, {});
      if (getUrlParams.filter) {
        try {
          defaultFilters = JSON.parse(getUrlParams.filter);
        } catch (e) {
          defaultFilters = getUrlParams.filter;
        }
      } else {
        apiUrl = this.props.data;
      }
    }
  }

  createColumns = (columnConfig) => {
    let table = [];
    this.props.checkBoxSelection ? table.push(<GridColumn field='selected' filterable={false} columnMenu={this.props.columnMenuFilter != false ? GridColumnMenuCheckboxFilter : undefined} key={Math.random() * 20} locked={true} reorderable={false} orderIndex={0} width='50px' />) : null;
    columnConfig.map((dataItem, i) => {
      table.push(
        <GridColumn
          cell={dataItem.cell || dataItem.rygRule ? (item) => <CustomCell cellTemplate={dataItem.cell} dataItem={item.dataItem} type={"cellTemplate"} userProfile={this.userprofile} baseUrl={this.baseUrl} /> : undefined}
          children={dataItem.children ? dataItem.children : undefined}
          className={dataItem.className ? dataItem.className : undefined}
          field={dataItem.field ? dataItem.field : undefined}
          filter={dataItem.filter ? dataItem.filter : "text"}
          filterable={this.props.columnMenuFilter == false ? dataItem.filterable : undefined}
          columnMenu={dataItem.columnMenuFilter == false ? undefined : this.props.columnMenuFilter != false ? ColumnMenu : undefined}
          filterCell={dataItem.filterCell ? CustomFilter(dataItem.filterCell) : undefined}
          groupable={dataItem.groupable ? dataItem.groupable : undefined}
          editor={dataItem.editor ? dataItem.editor : undefined}
          editable={dataItem.editable}
          headerClassName={dataItem.headerClassName ? dataItem.headerClassName : undefined}
          headerCell={dataItem.headerCell ? dataItem.headerCell : undefined}
          key={i}
          locked={dataItem.locked ? dataItem.locked : undefined}
          minResizableWidth={dataItem.minResizableWidth ? dataItem.minResizableWidth : undefined}
          orderIndex={dataItem.orderIndex ? dataItem.orderIndex : undefined}
          reorderable={this.props.reorderable ? this.props.reorderable : dataItem.reorderable ? dataItem.reorderable : undefined}
          resizable={this.props.resizable ? this.props.resizable : dataItem.resizable ? dataItem.resizable : undefined}
          sortable={this.props.sortable ? this.props.sortable : dataItem.sortable ? dataItem.sortable : undefined}
          width={dataItem.width ? dataItem.width : undefined}
          title={dataItem.title ? dataItem.title : undefined}
        />
      );
    });

    this.props.inlineEdit ? table.push(<GridColumn filterable={false} key={Math.random() * 20} reorderable={false} width='175px' title={"Actions"} cell={InlineComponent(this.props.inlineActions, this.inlineEdit, this.refreshHandler)} />) : null;
    return table;
  };

  inlineEdit = (dataItem) => {
    if (this.state.dataState.group) {
      if (this.state.dataState.group.length > 0) {
        var newData = this.state.gridData.data.map((item) => {
          var newItem = item.items.map((item1) => {
            return item1.id === dataItem.id ? { ...item1, inEdit: true } : item1;
          });
          return {
            items: newItem,
            aggregates: item.aggregates,
            field: item.field,
            value: item.value,
          };
        });
      }
    } else {
      var newData = this.state.gridData.data.map((item) => {
        return item.id === dataItem.id ? { ...item, inEdit: true } : item;
      });
    }
    this.setState({
      gridData: { data: newData, total: this.state.gridData.total },
    });
  };

  itemChange = (event) => {
    if (this.state.dataState.group) {
      if (this.state.dataState.group.length > 0) {
        var data = this.state.gridData.data.map((item) => {
          var newItem = item.items.map((item1) => {
            return item1.id === event.dataItem.id ? { ...item1, [event.field]: event.value } : item1;
          });
          return {
            items: newItem,
            aggregates: item.aggregates,
            field: item.field,
            value: item.value,
          };
        });
      }
    } else {
      var data = this.state.gridData.data.map((item) => {
        return item.id === event.dataItem.id ? { ...item, [event.field]: event.value } : item;
      });
    }
    this.setState({
      gridData: { data: data, total: this.state.gridData.total },
    });
  };

  rowRender = (trElement, dataItem) => {
    var that = this;
    const trProps = {
      ...trElement.props,
      onContextMenu: (e) => {
        e.preventDefault();
        if(this.props.disableContextAction) return;
        this.handleContextMenuOpen(e, dataItem.dataItem);
      },
      onClick: (e) => {
        e.preventDefault();
        if (this.state.actions) {
          Object.keys(this.state.actions).map(function (key, index) {
            var action = that.state.actions;
            if (action[key].defaultAction == true) {
              that.handleAction(key, dataItem.dataItem);
            }
          });
        }
      },
    };
    return React.cloneElement(trElement, { ...trProps }, trElement.props.children);
  };

  handleContextMenuOpen = (e, dataItem) => {
    if (this.state.actions) {
      this.dataItem = dataItem;
      this.offset = { left: e.clientX, top: e.clientY };
      var actionButtons = [];
      this.setState({
        menu: null,
      });
      Object.keys(this.state.actions).map(function (key, index) {
        var action = this.state.actions;
        var paramsRule = ParameterHandler.replaceParams(this.appId, action[key].rule, dataItem);
        var row = dataItem;
        var _moment = moment;
        var profile = this.userprofile;
        paramsRule = paramsRule.replace(/moment/g, "_moment");
        var showButton = eval(paramsRule);
        var buttonStyles = action[key].icon
          ? { width: "auto" }
          : {
              width: "auto",
              color: "white",
              fontWeight: "600",
            };
        const itemRender = (props) => {
          return (
            <div style={{ padding: "5px" }} text={action[key].name}>
              <i style={{ marginRight: "5px" }} className={action[key].icon + " manageIcons"}></i>
              {action[key].name}
            </div>
          );
        };
        showButton ? actionButtons.push(<MenuItem text={action[key].name} key={index} render={itemRender} />) : null;
      }, this);
      this.setState({
        menu: actionButtons,
        contextMenuOpen: true,
      });
    }
  };

  generateGridToolbar() {
    let gridToolbarContent = [];
    if (typeof this.props.gridToolbar == "string") {
      gridToolbarContent.push(
        <div style={{ display: "inline-block" }} key={Math.random()}>
          <JsxParser
            bindings={{
              item: this.props.parentData,
              data: this.props.parentData,
              moment: moment,
              profile: this.props.userProfile,
              baseUrl: this.props.baseUrl,
              gridData: this.state.gridData.data,
            }}
            jsx={this.props.gridToolbar}
          />
          {/* {this.props.refreshButton ? (
            <abbr
              title="Refresh"
              style={{ right: "10px", float: "right", paddingLeft: "15px" }}
            >
              <Button primary={true} onClick={() => this.refreshHandler()}>
                <i className="far fa-redo manageIcons"></i>
              </Button>
            </abbr>
          ) : null} */}
        </div>
      );
    } else if (this.props.gridToolbar) {
      gridToolbarContent.push(this.props.gridToolbar);
    }
    if (this.props.exportToPDF) {
      gridToolbarContent.push(
        <Button primary={true} onClick={this.exportPDF} key={Math.random()} className={"toolBarButton btn btn-primary"} title='Export to PDF'>
          <i className='fa fa-file-pdf-o'></i>
        </Button>
      );
    }
    if (this.props.exportToExcel) {
      gridToolbarContent.push(
        <Button primary={true} className={"toolBarButton btn btn-primary"} key={Math.random()} onClick={() => this.exportExcel(this.props.exportToExcel)}>
          <i className='fa fa-file-excel-o'></i>
        </Button>
      );
    }
    if (this.props.gridOperations) {
      gridToolbarContent.length == 0 ? gridToolbarContent.push(<div key={Math.random()}></div>) : null;
      gridToolbarContent.push(this.renderListOperations(this.props.gridOperations));
      if (this.props.defaultToolBar != true) {
        let ev = new CustomEvent("addcustomActions", {
          detail: { customActions: gridToolbarContent, pageId : this.props.pageId  },
          bubbles: true,
        });
        document.getElementById(this.appId + "_breadcrumbParent").dispatchEvent(ev);
      }
    }
    return gridToolbarContent.length > 0 ? gridToolbarContent : false;
  }

  exportPDF = () => {
    this.loader.show();
    if (this.gridPDFExport) {
      this.gridPDFExport.save(this.state.data, this.loader.destroy());
    }
  };

  exportExcel = (excelConfig) => {
    var gridData = this.state.gridData;
    if (excelConfig.columnConfig) {
      gridData = typeof gridData == "array" ? gridData : gridData.data;
      gridData = gridData.map((item) => {
        var tempItem = { ...item };
        excelConfig.columnConfig.map((column) => {
          if (column.cell) {
            var data = tempItem;
            var _moment = moment;
            var formatDate = (dateTime, dateTimeFormat) => {
              let userTimezone,
                userDateTimeFomat = null;
              userTimezone = this.userprofile.preferences.timezone ? this.userprofile.preferences.timezone : moment.tz.guess();
              userDateTimeFomat = this.userprofile.preferences.dateformat ? this.userprofile.preferences.dateformat : "YYYY-MM-DD";
              dateTimeFormat ? (userDateTimeFomat = dateTimeFormat) : null;
              return moment(dateTime).utc(dateTime, "MM/dd/yyyy HH:mm:ss").clone().tz(userTimezone).format(userDateTimeFomat);
            };
            var formatDateWithoutTimezone = (dateTime, dateTimeFormat) => {
              let userDateTimeFomat = null;
              userDateTimeFomat = this.userprofile.preferences.dateformat ? this.userprofile.preferences.dateformat : "YYYY-MM-DD";
              dateTimeFormat ? (userDateTimeFomat = dateTimeFormat) : null;
              return moment(dateTime).format(userDateTimeFomat);
            };
            var evalString = column.cell.replace(/moment/g, "_moment");
            tempItem[column.field] = eval("(" + evalString + ")");
          }
        });
        return tempItem;
      });
    }
    if (this._excelExport) {
      this._excelExport.save(gridData, excelConfig.columnConfig ? undefined : this._grid.columns);
    }
  };

  expandChange = (event) => {
    event.dataItem.expanded = !event.dataItem.expanded;
    this.forceUpdate();
  };

  headerSelectionChange = (event) => {
    const checked = event.syntheticEvent.target.checked;
    this.state.gridData.forEach((item) => (item.selected = checked));
    this.forceUpdate();
  };

  refreshHandler = (hideLoader = false) => {
    this.child ? (this.child.current ? this.child.current.triggerGetCall(hideLoader) : this.child.triggerGetCall(hideLoader)) : null;
  };

  selectionChange = (event) => {
    event.dataItem.selected = !event.dataItem.selected;
    this.forceUpdate();
    var selectedItems = [];
    this.state.gridData.data.map((dataItem) => {
      dataItem.selected ? selectedItems.push(dataItem) : null;
    });
    this.props.checkBoxSelection(selectedItems);
  };

  updatePageContent = (config) => {
    let eventDiv = document.getElementById(this.props.parentDiv);
    let ev2 = new CustomEvent("clickAction", {
      detail: config,
      bubbles: true,
    });
    eventDiv.dispatchEvent(ev2);
  };

  renderListOperations = (config) => {
    var operationsList = [];
    var listData = this.state.gridData.data;
    config.actions.map((i) => {
      var profile = this.userprofile;
      let result = eval(i.rule);
      result ? operationsList.push(i) : null;
    });
    if (operationsList.length > 1) {
      const itemRender = (props) => {
        return (
          <div style={{ padding: "5px" }} text={props.item.name} key={Math.random()}>
            <i style={{ marginRight: "5px" }} className={props.item.icon + " manageIcons"}></i>
            {props.item.name}
          </div>
        );
      };
      return (
        <DropDownButton
          text={config.title ? config.title : "Options"}
          textField='name'
          className='gridOperationDropdown'
          itemRender={itemRender}
          iconClass={config.icon ? config.icon : null}
          onItemClick={(e) => {
            this.updatePageContent(e.item);
          }}
          popupSettings={{ popupClass: "dropDownButton" }}
          items={operationsList}
          primary={true}
          className={"toolBarButton"}
          key={Math.random()}
        />
      );
    } else if (operationsList.length == 1) {
      return operationsList[0].name ? (
        <Button className={" btn btn-primary btn-create"} style={{ right: "10px", fontSize: "0.9rem" }} primary={true} title={"Create New"} onClick={(e) => this.updatePageContent(operationsList[0])} key={Math.random()}>
          {operationsList[0].icon ? (
            <i
              className={operationsList[0].icon}
              // style={{ paddingRight: "5px" }}
            />
          ) : null}
          {/* {operationsList[0].name} */}
        </Button>
      ) : (
        <Button title={operationsList[0].name} className={"toolBarButton"} primary={true} onClick={(e) => this.updatePageContent(operationsList[0])} key={Math.random()}>
          <i className={operationsList[0].icon}></i>
        </Button>
      );
    }
    return null;
  };

  generatePDFTemplate(pageData) {
    let PDFProps = this.props.exportToPDF;
    return PDFProps.titleTemplate || PDFProps.JSXtemplate ? (
      <div>
        {pageData.pageNum == 1 && PDFProps.titleTemplate ? (
          <div>
            <JsxParser
              bindings={{
                pageData: pageData,
                data: this.props.parentData,
                moment: moment,
                gridData: this.state.gridData.data,
              }}
              jsx={PDFProps.titleTemplate}
            />
          </div>
        ) : null}
        {PDFProps.JSXtemplate ? (
          <JsxParser
            bindings={{
              pageData: pageData,
              data: this.props.parentData,
              moment: moment,
              gridData: this.state.gridData.data,
            }}
            jsx={PDFProps.JSXtemplate}
          />
        ) : null}
      </div>
    ) : (
      <div />
    );
  }
  onPopupOpen = (e, props) => {
    if (this.menuWrapperRef.querySelector("[tabindex]")) {
      this.menuWrapperRef.querySelector("[tabindex]").focus();
    }
  };
  onFocusHandler = () => {
    clearTimeout(this.blurTimeoutRef);
    this.blurTimeoutRef = undefined;
  };

  onBlurTimeout = () => {
    this.setState({
      contextMenuOpen: false,
    });
    this.blurTimeoutRef = undefined;
  };

  onBlurHandler = (event) => {
    clearTimeout(this.blurTimeoutRef);
    this.blurTimeoutRef = setTimeout(this.onBlurTimeout);
  };
  async buttonAction(actionCopy, rowData) {
    var action = actionCopy;
    if (action.content) {
      action.details = action.content;
    }
    var mergeRowData = this.props.currentRow ? { ...this.props.currentRow, ...rowData } : rowData;
    if (action.page_id) {
      PageNavigation.loadPage(this.appId, this.pageId, action.page_id, null, null, null, null, null, null, null, rowData);
    } else if (action.details) {
      var pageDetails = this.state.pageContent;
      var that = this;
      var copyPageContent = [];
      if (rowData.rygRule) {
        copyPageContent.push({
          type: "HTMLViewer",
          content: rowData.rygRule,
          className: "rygBadge",
        });
      }
      var checkForTypeUpdate = false;
      var updateBreadcrumb = true;
      var pageId = null;
      if (action.details.length > 0) {
        action.details.every(async (item, index) => {
          if (item.type == "Update") {
            var PageRenderDiv = document.getElementById(this.props.parentDiv);
            this.loader.show(PageRenderDiv ? PageRenderDiv : null, item.loaderMessage);
            checkForTypeUpdate = true;
            const response = await that.updateActionHandler(item, mergeRowData);
            if (response.status == "success") {
              this.loader.destroy();
              if (item.successMessage) {
                Swal.fire({
                  icon: "success",
                  title: item.successMessage,
                  showConfirmButton: true,
                });
              }
              item.params.successNotification ? that.state.notif.current.notify("Success", item.params.successNotification.length > 0 ? item.params.successNotification : "Update Completed", "success") : null;
              this.props.postSubmitCallback();
              this.setState({ showLoader: false });
            } else {
              this.loader.destroy();
              Swal.fire({
                icon: "error",
                title: item.errorMessage ? item.errorMessage : response.message,
                showConfirmButton: true,
              });
              that.setState({
                pageContent: pageDetails,
                showLoader: false,
              });
              return false;
            }
          } else if (item.type == "API") {
            if (item.typeOfRequest == "delete") {
              action.updateOnly = true;
              var url = ParameterHandler.replaceParams(this.appId, item.route, mergeRowData);
              Swal.fire({
                title: "Are you sure?",
                text: "Do you really want to delete the record? This cannot be undone.",
                // imageUrl:
                //   "https://image.flaticon.com/icons/svg/1632/1632714.svg",
                icon: "question",
                imageWidth: 75,
                imageHeight: 75,
                confirmButtonText: "Delete",
                confirmButtonColor: "#d33",
                showCancelButton: true,
                cancelButtonColor: "#3085d6",
              }).then((result) => {
                if (result.value) {
                  this.DeleteFile("app/" + this.appId + "/" + url, item).then((response) => {
                    this.refreshHandler(response);
                    if (response.status == "success") {
                      this.state.notif.current.notify("Success", "Deleted Successfully", "success");
                    } else {
                      this.state.notif.current.notify("Error", item.errorMessage ? item.errorMessage : response.message, "danger");
                    }
                  });
                }
              });
            } else if (item.typeOfRequest == "post") {
              action.updateOnly = true;
              var url = ParameterHandler.replaceParams(
                this.appId,
                item.route,
                mergeRowData
              );
              var params = ParameterHandler.replaceParams(
                this.appId,
                item.params,
                mergeRowData
              );
              var postData = {...mergeRowData,...params};
              this.messageBox.show(item.confirmationMessage, '', 'Yes', true)
              .then((response) => {
                  if(response){
                    this.restClient
                    .request("v1", "/" + url, postData, "post", {
                      "Content-Type": "application/json",
                    })
                    .then((response1) => {
                        if(response1.status == "success"){
                          if(item.successNotification){
                            this.messageBox.show(item.successNotification, '', 'OK', false);
                          }
                          this.refreshHandler(response1);
                        }else{
                          this.messageBox.show(response1.message, '', 'OK', false);
                        }
                    });
                  }
              });
            }
          } else if (item.type == "ButtonPopUp") {
            action.updateOnly = true;
            var params = ParameterHandler.replaceParams(this.appId, item.params, mergeRowData);
            var buttonPopup = this.renderButtonPopup(params);
            that.setState({
              buttonPopup: buttonPopup,
              showButtonPopup: true,
            });
          } else if (item.type == "APIRequest") {
            action.updateOnly = true;
            var urlPostParams = {};
            if (item.params && item.params.urlPostParams) {
              urlPostParams = ParameterHandler.replaceParams(this.appId, item.params.urlPostParams, mergeRowData);
            }
            var url = ParameterHandler.replaceParams(this.appId, item.route, mergeRowData);
            Swal.fire({
              title: "Are you sure?",
              text: "Do you really want to delete the record? This cannot be undone.",
              // imageUrl:
              //   "https://image.flaticon.com/icons/svg/1632/1632714.svg",
              icon: "question",
              imageWidth: 75,
              imageHeight: 75,
              confirmButtonText: "Delete",
              confirmButtonColor: "#d33",
              showCancelButton: true,
              cancelButtonColor: "#3085d6",
            }).then((result) => {
              if (result.value) {
                this.DeleteFile("app/" + this.appId + "/" + url, item, urlPostParams).then((response) => {
                  this.refreshHandler(response);
                  if (response.status == "success") {
                    this.state.notif.current.notify("Success", "Deleted Successfully", "success");
                  } else {
                    this.state.notif.current.notify("Error", response.message, "danger");
                  }
                });
              }
            });
          } else {
            if (item.params && item.params.page_id) {
              pageId = item.params.page_id;
              if (item.params.params && typeof item.params.params === "string") {
                var newParams = ParameterHandler.replaceParams(this.appId, item.params.params, mergeRowData);
                mergeRowData = { ...newParams, ...mergeRowData };
              } else if (item.params.params && typeof item.params.params === "object") {
                var params = {};
                Object.keys(item.params.params).map((i) => {
                  params[i] = ParameterHandler.replaceParams(this.appId, item.params.params[i], mergeRowData);
                });
                mergeRowData = { ...params, ...mergeRowData };
              }
              copyPageContent = [];
            } else {
              var pageContentObj = {};
              mergeRowData = { ...this.props.parentData, ...mergeRowData };
              pageContentObj = ParameterHandler.replaceParams(this.appId, item, mergeRowData);
              copyPageContent.push(pageContentObj);
            }
          }
        });
        action.updateOnly ? null : PageNavigation.loadPage(this.appId, this.pageId, pageId, action.icon, true, action.name, mergeRowData, copyPageContent, undefined, action.popupConfig, mergeRowData);
      }
    }
  }

  async handleDatePicker(params) {
    if (this.datePickerValue) {
      var year = this.datePickerValue.getFullYear();
      var month = this.datePickerValue.getUTCMonth() + 1;
      var day = this.datePickerValue.getUTCDate();
      var hours = this.datePickerValue.getUTCHours();
      var minute = this.datePickerValue.getUTCMinutes();

      var cron = "0 " + minute.toString() + " " + hours.toString() + " " + day.toString() + " " + month.toString() + " ? " + year.toString();
      if (params.cron) {
        params.cron = cron;
      }
      let route = params.route;
      delete params.route;
      delete params.type;
      let response = await this.restClient.request("v1", "/" + route, params, "post", {
        "Content-Type": "application/json",
      });
      this.refreshHandler(response);
      return response;
    }
  }

  renderButtonPopup(params) {
    var that = this;
    if (params.type == "DatePicker") {
      var toggleDialogue = () => {
        that.setState({ showButtonPopup: !that.state.showButtonPopup });
      };
      return (
        <Dialog title={"Set Date & Time"} onClose={toggleDialogue}>
          <DateTimePicker
            popup={DatePickerPopup}
            onChange={(event) => {
              that.datePickerValue = event.target.value;
            }}
          />
          <DialogActionsBar>
            <Button primary={true} onClick={toggleDialogue}>
              Cancel
            </Button>
            <Button
              primary={true}
              onClick={() => {
                var currentTime = new Date();
                if (that.datePickerValue >= currentTime) {
                  that.handleDatePicker(params);
                  toggleDialogue();
                }
              }}>
              Save
            </Button>
          </DialogActionsBar>
        </Dialog>
      );
    }
  }

  updateActionHandler(details, rowData) {
    var that = this;
    rowData = { ...this.props.parentData, ...rowData };
    return new Promise((resolve) => {
      var queryRoute = ParameterHandler.replaceParams(this.appId, details.params.url, rowData);
      var postData = {};
      try {
        if (details.params.postData) {
          Object.keys(details.params.postData).map((i) => {
            postData[i] = ParameterHandler.replaceParams(this.appId, details.params.postData[i], rowData);
          });
        } else {
          Object.keys(details.params).map((i) => {
            postData[i] = ParameterHandler.replaceParams(this.appId, details.params[i], rowData);
          });
          postData = rowData;
        }
      } catch (error) {
        postData = rowData;
      }
      ParameterHandler.updateCall(that.core, that.appId, queryRoute, postData, details.params.disableAppId, details.method).then((response) => {
        if (details.params.downloadFile && response.status == 200) {
          ParameterHandler.downloadFile(response).then((result) => {
            that.setState({ showLoader: false });
            var downloadStatus = result ? "success" : "failed";
            resolve({ status: downloadStatus });
          });
        } else {
          that.setState({ showLoader: false });
          resolve(response);
        }
      });
    });
  }
  handleAction(key, dataItem) {
    this.dataItem = dataItem;
    this.state.actions[key].confirmationMessage
      ? Swal.fire({
          title: this.state.actions[key].confirmationMessage,
          confirmButtonText: "Agree",
          confirmButtonColor: "#275362",
          showCancelButton: true,
          cancelButtonColor: "#7b7878",
          target: ".PageRender",
        }).then((result) => {
          result.value ? this.buttonAction(this.state.actions[key], this.dataItem) : null;
        })
      : this.state.actions[key].details
      ? this.buttonAction(this.state.actions[key], this.dataItem)
      : null;
    this.state.actions[key].callback?.(dataItem);
  }
  handleOnSelect = (e) => {
    var dataItem = this.dataItem;
    if (this.state.actions) {
      Object.keys(this.state.actions).map(function (key, index) {
        if (this.state.actions[key].name == e.item.text) {
          this.handleAction(key, dataItem);
        }
      }, this);
      this.setState({ contextMenuOpen: false });
    }
  };

  toggleGridLoader() {
    const selector = `#content_${this.appId}_${this.pageId} .k-grid-container `;
    try {
      document.querySelector(`${selector}>.osjs-boot-splash-grid`)?.remove();
      if (!this.state.apiActivityCompleted) {
        const ele = document.createElement("div");
        ele.className = "osjs-boot-splash-grid";
        ele.innerHTML = ` <div class="spinner">
                  <div class="bounce1"></div>
                  <div class="bounce2"></div>
                  <div class="bounce3"></div>
                </div>`;
        document.querySelector(selector)?.append(ele);
      }
    } catch (e) {
      document.querySelector(`${selector}>.osjs-boot-splash-grid`)?.remove();
    }
  }

  loadData() {
    return (
      <DataLoader
        ref={(r) => {
          this.child = r;
        }}
        args={this.props.osjsCore}
        url={this.props.data}
        dataState={this.state.dataState}
        onDataRecieved={this.dataRecieved}
        {...this.props}
      />
    );
  }

  render() {
    return (
      <div style={this.props.wrapStyle ? this.props.wrapStyle : { height: "100%", float: "left" }} className={"GridCustomStyle " + (this.props.className ? this.props.className : "")}>
        {this.state.showButtonPopup ? this.state.buttonPopup : null}
        <Popup offset={this.offset} show={this.state.contextMenuOpen} open={this.onPopupOpen} popupClass={"popup-content"}>
          <div onFocus={this.onFocusHandler} onBlur={this.onBlurHandler} tabIndex={-1} ref={(el) => (this.menuWrapperRef = el)} style={{ backgroundColor: "#f8f9fa" }}>
            <Menu vertical={true} style={{ display: "inline-block" }} onSelect={this.handleOnSelect}>
              {this.state.menu}
            </Menu>
            <i
              style={{
                color: "#212529b3",
                cursor: "pointer",
                position: "absolute",
                top: "4px",
                right: "4px",
              }}
              className={"fas fa-times"}
              onClick={() => {
                this.setState({ contextMenuOpen: false });
              }}></i>
          </div>
        </Popup>
        <>{this.rawDataPresent ? <DataOperation args={this.props.osjsCore} gridData={this.props.data} total={this.props.data.length} dataState={this.state.dataState} onDataRecieved={this.dataRecieved} /> : this.loadData()}</>
        <div id='customActionsToolbar' />
        <Grid
          rowRender={this.rowRender}
          data={this.state.gridData.data}
          ref={(grid) => {
            this._grid = grid;
          }}
          total={this.state.gridData.total ? parseInt(this.state.gridData.total) : null}
          detail={this.props.rowTemplate ? (dataItem) => <DetailComponent rowTemplate={this.props.rowTemplate} dataItem={dataItem.dataItem} /> : undefined}
          filterable={this.props.filterable}
          filterOperators={this.props.filterOperators}
          groupable={this.props.groupable}
          style={this.props.gridStyles}
          //pageable={{
          //buttonCount: 5,
          //info: true,
          //pageSizes: [50, 100, 200],
          //}}
          pageable={this.props.pageable}
          take={this.props.take}
          resizable={this.props.resizable ? true : false}
          reorderable={this.props.reorderable ? true : false}
          sortable={this.props.sortable ? true : false}
          scrollable={this.props.scrollable}
          onDataStateChange={this.dataStateChange}
          onExpandChange={this.props.expandable ? this.expandChange : null}
          onHeaderSelectionChange={this.headerSelectionChange}
          onSelectionChange={this.selectionChange}
          onRowClick={(e) => {
            this.props.onRowClick ? this.props.onRowClick(e) : null;
          }}
          selectedField='selected'
          expandField={this.props.expandable ? "expanded" : null}
          {...this.state.dataState}
          editField={this.props.inlineEdit ? "inEdit" : undefined}
          onItemChange={this.itemChange}>
          {this.state.gridData.total === 0 ? (
            <GridNoRecords>
              <div />
            </GridNoRecords>
          ) : (
            <GridNoRecords>No Records Found</GridNoRecords>
          )}
          {this.props.defaultToolBar && this.generateGridToolbar() && this.state.apiActivityCompleted ? (
            <GridToolbar>
              <div className={"GridToolBar"}>{this.generateGridToolbar()}</div>
            </GridToolbar>
          ) : null}
          {this.createColumns(this.props.columnConfig)}
        </Grid>
        {this.props.exportToPDF ? (
          <GridPDFExport pageTemplate={(props) => this.generatePDFTemplate(props)} ref={(pdfExport) => (this.gridPDFExport = pdfExport)} {...this.props.exportToPDF} fileName={this.props.exportToPDF.fileNameTemplate ? eval(this.props.exportToPDF.fileNameTemplate) : undefined}>
            <Grid data={this.props.exportToPDF.defaultFilters && this.state.gridData.data && typeof this.state.gridData.data == "array" ? process(this.state.gridData.data, JSON.parse(this.props.exportToPDF.defaultFilters)) : this.state.gridData.data}>{this.createColumns(this.props.exportToPDF.columnConfig ? this.props.exportToPDF.columnConfig : this.props.columnConfig)}</Grid>
          </GridPDFExport>
        ) : null}
        {this.props.exportToExcel ? (
          <ExcelExport ref={(excelExport) => (this._excelExport = excelExport)} fileName={this.props.exportToExcel.fileNameTemplate ? eval(this.props.exportToExcel.fileNameTemplate) : undefined} filterable={true}>
            {this.props.exportToExcel.columnConfig ? this.props.exportToExcel.columnConfig.map((item) => <ExcelExportColumn field={item.field} title={item.title} cellOptions={item.cellOptions} locked={item.locked} width={item.width} />) : null}
          </ExcelExport>
        ) : null}
      </div>
    );
  }
}

class DatePickerPopup extends React.Component {
  render() {
    return (
      <Popup
        {...this.props}
        anchorAlign={{
          horizontal: "center",
          vertical: "center",
        }}
        popupAlign={{
          horizontal: "center",
          vertical: "center",
        }}
      />
    );
  }
}

class CustomCell extends React.Component {
  render() {
    var formatDate = (dateTime, dateTimeFormat) => {
      let userTimezone,
        userDateTimeFomat = null;
      userTimezone = this.props.userProfile.preferences.timezone ? this.props.userProfile.preferences.timezone : moment.tz.guess();
      userDateTimeFomat = this.props.userProfile.preferences.dateformat ? this.props.userProfile.preferences.dateformat : "MM/dd/yyyy";
      dateTimeFormat ? (userDateTimeFomat = dateTimeFormat) : null;
      return moment(dateTime).utc(dateTime, "MM/dd/yyyy HH:mm:ss").clone().tz(userTimezone).format(userDateTimeFomat);
    };
    var formatDateWithoutTimezone = (dateTime, dateTimeFormat) => {
      let userDateTimeFomat = null;
      userDateTimeFomat = this.props.userProfile.preferences.dateformat ? this.props.userProfile.preferences.dateformat : "MM/dd/yyyy";
      dateTimeFormat ? (userDateTimeFomat = dateTimeFormat) : null;
      return moment(dateTime).format(userDateTimeFomat);
    };
    let checkType = typeof this.props.cellTemplate;
    if (checkType == "function") {
      var cellTemplate = this.props.cellTemplate(this.props.dataItem);
      if (this.props.type == "filterTemplate") {
        return <div className='gridActions'>{cellTemplate}</div>;
      } else {
        return <td ><div className='gridActions-grid'>{cellTemplate}</div></td>;
      }
    } else if (checkType == "string" || this.props.dataItem.rygRule) {
      return (
        <JsxParser
          bindings={{
            item: this.props.dataItem,
            moment: moment,
            formatDate: formatDate,
            formatDateWithoutTimezone: formatDateWithoutTimezone,
            profile: this.props.userProfile,
            baseUrl: this.props.baseUrl,
          }}
          renderInWrapper={false}
          jsx={this.props.cellTemplate ? this.props.cellTemplate : this.props.dataItem.rygRule ? this.props.dataItem.rygRule : "<td></td>"}
        />
      );
    }
  }
}

class DetailComponent extends GridDetailRow {
  render() {
    const dataItem = this.props.dataItem;
    return <React.Fragment>{this.props.rowTemplate(dataItem)}</React.Fragment>;
  }
}

OX_Grid.defaultProps = {
  data: [],
  scrollable: "scrollable",
  filterOperators: {
    text: [
      { text: "grid.filterContainsOperator", operator: "contains" },
      { text: "grid.filterStartsWithOperator", operator: "startswith" },
      { text: "grid.filterEqOperator", operator: "eq" },
      { text: "grid.filterNotContainsOperator", operator: "doesnotcontain" },
      { text: "grid.filterNotEqOperator", operator: "neq" },
      { text: "grid.filterEndsWithOperator", operator: "endswith" },
      { text: "grid.filterIsNullOperator", operator: "isnull" },
      { text: "grid.filterIsNotNullOperator", operator: "isnotnull" },
      { text: "grid.filterIsEmptyOperator", operator: "isempty" },
      { text: "grid.filterIsNotEmptyOperator", operator: "isnotempty" },
    ],
    numeric: [
      { text: "grid.filterEqOperator", operator: "eq" },
      { text: "grid.filterNotEqOperator", operator: "neq" },
      { text: "grid.filterGteOperator", operator: "gte" },
      { text: "grid.filterGtOperator", operator: "gt" },
      { text: "grid.filterLteOperator", operator: "lte" },
      { text: "grid.filterLtOperator", operator: "lt" },
      { text: "grid.filterIsNullOperator", operator: "isnull" },
      { text: "grid.filterIsNotNullOperator", operator: "isnotnull" },
    ],
    date: [
      { text: "grid.filterEqOperator", operator: "eq" },
      { text: "grid.filterNotEqOperator", operator: "neq" },
      { text: "grid.filterAfterOrEqualOperator", operator: "gte" },
      { text: "grid.filterAfterOperator", operator: "gt" },
      { text: "grid.filterBeforeOperator", operator: "lt" },
      { text: "grid.filterBeforeOrEqualOperator", operator: "lte" },
      { text: "grid.filterIsNullOperator", operator: "isnull" },
      { text: "grid.filterIsNotNullOperator", operator: "isnotnull" },
    ],
    boolean: [{ text: "grid.filterEqOperator", operator: "eq" }],
  },
};

OX_Grid.propTypes = {
  data: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  checkBoxSelection: PropTypes.func,
  columnConfig: PropTypes.array.isRequired,
  filterOperators: PropTypes.object,
  gridDefaultFilters: PropTypes.object,
  gridToolbar: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  gridNoRecords: PropTypes.element,
  gridStyles: PropTypes.object,
  groupable: PropTypes.bool,
  onRowClick: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
  osjsCore: PropTypes.object,
  pageable: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
  resizable: PropTypes.bool,
  reorderable: PropTypes.bool,
  rowTemplate: PropTypes.func,
  sortable: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
  expandable: PropTypes.bool,
};

// Send selected value as true in data array to enable selected field css background
// (Wont be applied for customRenderedCells)
// Example:  {
//   name: "prajwal",
//   address: "test",
//   selected: true
// }
//
// Send gridDefaultFilters in the following format
// {
//   "filter":{
//   "logic":"and",
//   "filters":[
//   {
//   "field":"workflow_name",
//   "operator":"contains",
//   "value":"ipl"
//   }
//   ]
//   },
//   "sort":[
//   {
//   "field":"workflow_name",
//   "dir":"desc"
//   }
//   ],
//   "skip":0,
//   "take":50
// }

// PDF Processing Kendo
// https://www.telerik.com/kendo-react-ui/components/pdfprocessing/
