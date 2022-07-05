import React from "react";
import ReactDOM from "react-dom";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import { filterBy, orderBy, process } from "@progress/kendo-data-query";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import "@progress/kendo-theme-bootstrap/dist/all.css";
import GridActions from "./GridActions";
import FormRender from "../App/FormRender";
import Requests from "../../Requests";
import Swal from "sweetalert2";
import { GridDetailRow } from "@progress/kendo-react-grid";

const loadingPanel = (
  <div className="k-loading-mask">
    <span className="k-loading-text">Loading</span>
    <div className="k-loading-image"></div>
    <div className="k-loading-color"></div>
  </div>
);
export default class EOXGrid extends React.Component {
  constructor(props) {
    super(props);
    this.excelExporter = null;
    this.allData = this.props.data ? this.props.data : [];
    this.filteredData = null;
    let configuration = this.props.configuration;
    this.isDrillDownTable = this.props.isDrillDownTable;
    this.resizable = configuration
      ? configuration.resizable
        ? configuration.resizable
        : false
      : false;
    this.filterable = configuration
      ? configuration.filterable
        ? configuration.filterable
        : false
      : false;
    this.groupable = configuration
      ? configuration.groupable
        ? configuration.groupable
        : false
      : false;
    this.reorderable = configuration
      ? configuration.reorderable
        ? configuration.reorderable
        : false
      : false;
    this.height = configuration
      ? configuration.height
        ? configuration.height
        : "100%"
      : "100%";
    this.subRoute = configuration.subRoute

    this.width = configuration
      ? configuration.width
        ? configuration.width
        : "100%"
      : "100%";
    this.columnConfig = configuration
      ? configuration.column
        ? configuration.column
        : []
      : [];
    this.sortable = configuration ? (configuration.sort ? true : false) : false;
    this.pagerConfig = configuration
      ? configuration.pageable
        ? { pageable: configuration.pageable }
        : {}
      : {};
    this.pageSize = configuration
      ? configuration.pageSize
        ? configuration.pageSize
        : 10
      : 10;
    this.isReactComponent = configuration
      ? configuration.isReactComponent
        ? configuration.isReactComponent
        : false
      : false;
    //need to pass these in org config
    let oxzionMeta = configuration
      ? configuration["oxzion-meta"]
        ? configuration["oxzion-meta"]
        : null
      : null;
    this.exportToExcel = oxzionMeta
      ? oxzionMeta["exportToExcel"]
        ? oxzionMeta["exportToExcel"]
        : false
      : false;
    this.core = this.props.core;
    this.helper = this.core.make("oxzion/link");
    this.actionItems = this.props.actionItems;
    this.api = this.props.api;
    this.permission = this.props.permission;
    this.editForm = this.props.editForm;
    this.editApi = this.props.editApi;
    this.createApi = this.props.createApi;
    this.deleteApi = this.props.deleteApi;
    this.selectedOrg = this.props.selectedOrg;
    this.addConfig = this.props.addConfig;
    this.noCreateAction = this.props.noCreateAction ? this.props.noCreateAction : false;
    this.baseUrl = this.core.config("wrapper.url");
    this.gridId = Date.now();
    this.detailGrid = Date.now() + 1;
    this.state = {
      filter: null,
      props: this.props,
      pagination: {
        skip: 0,
        take: this.pageSize,
      },
      sort: configuration
        ? configuration.sort
          ? configuration.sort
          : null
        : null,
      group: null,
      displayedData: { data: this.props.data },
      isLoading: props.isLoading,
      exportFilterData: [],
      dataState: {}
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

  //updating the data 
  updateDisplayData = () => {
    this.props.dataStateChanged({ dataState: { skip: this.props.skip, take: this.pageSize, filter: null, group: null, sort: null }, refresh: true })
  };

  async handleCreateSubmit(formData, createFlag) {
    if (formData) {
      this.props.appendAttachments?.(formData)
      Requests.createFormPushData(this.core, this.createApi, this.props.getCustomPayload?.(formData) || formData, this.props.createCrudType).then(
        (response) => {
          if (response.status === "success") {
            Swal.fire({
              icon: "success",
              title: response.status,
              showConfirmButton: true,
            });
            this.updateDisplayData({ crudType: "CREATE", data: response.data });
            this.create(null);
          }
          else if (response.status === "error") {
            Swal.fire({
              icon: "error",
              title: response.status + "(" + response.message + ")",
              showConfirmButton: true,
            });
            this.create(null);
          }
        }
      );
    } else {
      this.create(null);
    }
  }

  create = async (form, createFlag) => {
    let gridsId = document.getElementsByClassName("eox-grids")[0].parentNode.id;
    if (createFlag) {
      document.getElementById(gridsId).classList.add("display-none");
      document.getElementById("titlebar-admin").style.zIndex = "10";
      (this.api === "account") ? document.getElementById("eox-grid").style.marginTop = "-38px" : document.getElementById("eox-grid").style.marginTop = "-25px";
      if(this.isReactComponent){
        document.getElementById("eox-grid").style.marginTop = "-35px";
        document.getElementById("eox-grid").style.left = "8px";
      }else{
        document.getElementById("eox-grid").style.marginTop = "-25px";
      }
    
      // document.getElementById("dash-manager-button").classList.add("display-none");
    } else {
      document.getElementById(gridsId).classList.remove("display-none");
      document.getElementById("eox-grid").style.marginTop = "-35px";
      // document.getElementById("dash-manager-button").classList.remove("display-none");
    }
    let data = {};
    if (this.props.prepareCreateFormData) {
      data = await this.props.prepareCreateFormData()
    }
   
    const RoleFormComponent = this.isReactComponent ? this.editForm : null
    let apiSplit = this.api;
    let changedAccountId = apiSplit.split("/")[1];
    this.isReactComponent ?
      ReactDOM.render(
        <RoleFormComponent 
        args={this.core}  
        formAction={"post"} 
        createApi={this.createApi} 
        selectedOrg={this.props.selectedOrg} 
        // diableField="false"
        gridsId= {gridsId}
        isReactComponent={this.isReactComponent}
        onUpdate= {this.updateDisplayData}
        />, 
        document.getElementById("eox-grid-form")
      ) ? (document.getElementById("eox-grid-form").style.overflow = "scroll")
        : (document.getElementById("eox-grid-form").style.overflow = "auto") :
      ReactDOM.render(
        createFlag ? (
          <div
            style={{
              position: "absolute",
              left: "0",
              top: (this.api ==="account")?"0px":"-15px",
              width: "100%",
              height: "100%",
              zIndex: "100",
            }}
          >
            <FormRender
              key={"abc"}
              core={this.core}
              data={{accountId:changedAccountId,createFlag:true}}
              updateFormData={true}
              getAttachment={true}
              postSubmitCallback={(formData) =>
                this.handleCreateSubmit(formData, true)
              }
              {...data}
              content={form}
              uniqueAttachments={this.props.uniqueAttachments || false}
            // appId={data.uuid}
            // route= {this.api}
            />
          </div>
        ) : null,
        document.getElementById("eox-grid-form")
      )
        ? (document.getElementById("eox-grid-form").style.overflow = "scroll")
        : (document.getElementById("eox-grid-form").style.overflow = "auto");
  };

  saveAsExcel = () => {
    let filterData;
    filterData =
      Object.keys(this.state.exportFilterData).length > 0
        ? this.state.exportFilterData
        : this.allData;
    this.excelExporter.save(filterData);
  };

  parseData = () => {
    let fieldDataTypeMap = new Map();
    for (const config of this.columnConfig) {
      if (config["dataType"]) {
        fieldDataTypeMap.set(config["field"], config["dataType"]);
      }
    }
    for (let dataItem of this.allData) {
      for (let [field, dataType] of fieldDataTypeMap) {
        switch (dataType) {
          case "date":
            dataItem[field] = new Date(dataItem[field]);
            break;
          default:
            throw `Column data type ${dataType} is not parsed. Add parser to parse it.`;
        }
      }
    }
  };

  // getRandomInt(min, max) {
  //   min = Math.ceil(min);
  //   max = Math.floor(max);
  //   return Math.floor(Math.random() * (max - min + 1)) + min;
  // }

  prepareData = (refilter) => {
    if (this.allData) {
      this.allData.map((data) => {
        //trimmimg time from date in order for date filter to work
        data.date ? data.date.setHours(0, 0, 0, 0) : null;
      });
    }
    if (this.state.sort) {
      this.allData = orderBy(this.allData, this.state.sort);
    }
    if (!this.filteredData || refilter) {
      let filter = this.state.filter;
      this.filteredData = filter
        ? filterBy(this.allData, filter)
        : this.allData;
    }
    let pagination = this.state.pagination;
    let displayedData = process(this.filteredData, {
      take: pagination.take,
      skip: this.state.filter
        ? refilter
          ? 0
          : pagination.skip
        : pagination.skip,
      group: this.state.group,
    });
    this.setState({
      displayedData: displayedData,
    });
  };

  getFilteredRowCount = () => {
    return this.filteredData ? this.filteredData.length : 0;
  };

  componentDidMount() {
    if (this.props.expandableApi) {
      this.props.expandableApi((childGridResponse) => {
        this.allData = childGridResponse;
        // this.setState({displayedData :childGridResponse, isLoading : props.isLoading})
        this.parseData();
        this.prepareData(true);
      })
      return;
    }
    this.parseData();
    // this.prepareData(true);
  }

  shouldComponentUpdate(prevProps, props) {
    (prevProps.api !== this.api) ? this.api= prevProps.api:"";
    (prevProps.deleteApi !== this.deleteApi) ? this.deleteApi= prevProps.deleteApi:"";
    (prevProps.createApi !== this.createApi) ? this.createApi= prevProps.createApi:"";
    (prevProps.editApi !== this.editApi) ? this.editApi= prevProps.editApi:"";
    return true;
  }
  componentWillReceiveProps(props) {
    if (props.isLoading !== this.state.displayedData?.isLoading) {
      this.setState({ displayedData: props.data, isLoading: props.isLoading })
    }
  }

  gridGroupChanged = (e) => {
    this.setState(
      {
        group: e.group,
      },
      () => {
        this.prepareData(false);
      }
    );
  };

  gridGroupExpansionChanged = (e) => {
    e.dataItem[e.target.props.expandField] = e.value;
    //Force state change with modified e.dataItem in this.state.displayedData. This state
    //change forces Kendo grid to repaint itself with expanded/collapsed grouped row item.
    this.setState((state) => {
      state.displayedData = this.state.displayedData;
      return state;
    });
  };

  render() {
    let gridTag = (
      <div id="eox-grid" style={{ position: "relative", marginTop: "-35px" }}>
        <div id="eox-grid-form"></div>
        {/* create new user */}
        <div style={{ float: "right" }} id="dash-manager-button" className="dash-manager-buttons mr-4 mb-2">
          {Object["values"](this.actionItems).map((actions, key) =>
            (actions.text === "CREATE") && (!(this.noCreateAction)) ? (
              <abbr title={actions.title} key={key}>
                <button
                  type={actions.type}
                  key={key}
                  className="btn btn-primary EOXGrids"
                  onClick={() => {
                    {
                      actions.text === "CREATE"
                        ? this.create(this.editForm, true)
                        : null
                    }
                  }}
                >
                  <i className={actions.icon}></i>
                </button>
              </abbr>
            ) : (
              null
            )
          )}
        </div>
        <div id={this.noCreateAction ? this.detailGrid : this.gridId}>
          <Grid
            style={{ height: this.height, width: this.width }}
            className={"eox-grids"}
            data={this.state.displayedData}
            resizable={this.resizable}
            reorderable={this.reorderable}
            // cellRender={(tdelement, cellProps) =>
            //   this.cellRender(tdelement, cellProps, this)
            // }
            detail={
              this.props.rowTemplate
                ? (dataItem) => (
                  <DetailComponent
                    rowTemplate={this.props.rowTemplate}
                    dataItem={dataItem.dataItem}
                  />
                )
                : undefined
            }
            filterable={this.filterable}
            filter={this.state.filter}
            // onFilterChange={this.gridFilterChanged}
            pageSize={this.pageSize}
            {...this.pagerConfig} //Sets grid "pageable" property
            total={this.state.displayedData.total}
            skip={this.props.skip}
            take={this.state.pagination.take}
            // onPageChange={this.gridPageChanged}
            sortable={this.sortable}
            sort={this.state.sort}
            // onSortChange={this.gridSortChanged}
            // onRowClick={this.drillDownClick}
            groupable={this.groupable}
            group={this.state.group}
            onGroupChange={this.gridGroupChanged}
            onExpandChange={this.gridGroupExpansionChanged}
            onDataStateChange={(e) => {
              if (e?.dataState?.filter?.filters?.find(v => !v.field)) return
              if (e?.dataState?.filter?.filters?.find(o => o.value === "")) return
              this.setState({ dataState: e.dataState });
              this.props.dataStateChanged(e)
            }}
            expandField="expanded"
            {...this.state.dataState}
          >
            {this.columnConfig.map((columns) =>
              columns.title == "Image" || columns.title == "Banner" ? (
                <GridColumn
                  key={columns.field}
                  // field={columns.field}
                  title={columns.title}
                  filterable={columns.filterable}
                  width={columns.width}
                  cell={(props) => (
                    <LogoCell
                      {...props}
                      myProp={this.props}
                      title={columns.title}
                      url={this.baseUrl}
                    />
                  )}
                ></GridColumn>
              ) : (
                <GridColumn
                  key={columns.field}
                  field={columns.field}
                  title={columns.title}
                  filterable={columns.filterable}
                  width={columns.width}
                ></GridColumn>
              )
            )}
            <GridColumn
              title="Actions"
              filterable={false}
              cell={() => (
                <GridActions
                  dataItem={this.state.displayedData}
                  core={this.props.core}
                  api={this.api}
                  actionItems={this.actionItems}
                  onUpdate={this.updateDisplayData}
                  permission={this.permission}
                  editForm={this.editForm}
                  editApi={this.editApi}
                  createApi={this.createApi}
                  deleteApi={this.deleteApi}
                  gridId={this.gridId}
                  addConfig={this.addConfig}
                  appendAttachments={this.props.appendAttachments}
                  fetchAttachments={this.props.fetchAttachments}
                  createCrudType={this.props.createCrudType}
                  getCustomPayload={this.props.getCustomPayload}
                  prepareFormData={this.props.prepareFormData}
                  isReactComponent={this.isReactComponent}
                  selectedOrg = {this.props.selectedOrg}
                />
              )}
            ></GridColumn>
          </Grid>
        </div>
      </div>
    );

    return (
      <>
        {this.state.isLoading && loadingPanel}
        {this.exportToExcel && (
          <>
            <div
              // className="oxzion-widget-drilldown-excel-icon"
              onClick={this.saveAsExcel}
            >
              <i className="fa fa-file-excel fa-lg"></i>
            </div>
            <ExcelExport
              data={this.state.exportFilterData}
              ref={(exporter) => (this.excelExporter = exporter)}
              filterable
            >
              {gridTag}
            </ExcelExport>
          </>
        )}
        {!this.exportToExcel && gridTag}
      </>
    );
  }
}

class LogoCell extends React.Component {
  render() {
    // Image -Account & User
    if (this.props.title === "Image") {
      return this.props.dataItem.logo ? (
        <td>
          <img
            src={this.props.dataItem.logo + "?" + new Date()}
            alt="Logo"
            className="text-center circle gridBanner"
          />
        </td>
      ) : this.props.dataItem.icon ? (
        <td>
          <img
            src={this.props.dataItem.icon + "?" + new Date()}
            alt="Logo"
            className="text-center circle gridBanner"
          />
        </td>
      ) : null;
    }
    // Banner - Announcement
    else if (this.props.title == "Banner") {
      if (this.props.dataItem.media_type == "image") {
        return this.props.dataItem.media ? (
          <td>
            <img
              src={
                this.props.url +
                "resource/" +
                this.props.dataItem.media +
                "?" +
                new Date()
              }
              alt="Logo"
              className="text-center circle gridBanner"
            />
            {/* {
              this.props.url +
                "resource/" +
                this.props.dataItem.media +
                "?" +
                new Date()
            } */}
          </td>
        ) : null;
      } else {
        return this.props.dataItem.media ? (
          <td>
            <video className="text-center circle gridBanner">
              <source
                src={
                  this.props.url +
                  "resource/" +
                  this.props.dataItem.media +
                  "?" +
                  new Date()
                }
                type="video/mp4"
              />
            </video>
          </td>
        ) : null;
      }
    }
  }
}
class DetailComponent extends GridDetailRow {
  render() {
    const dataItem = this.props.dataItem;
    return <React.Fragment>{this.props.rowTemplate(dataItem)}</React.Fragment>;
  }
}