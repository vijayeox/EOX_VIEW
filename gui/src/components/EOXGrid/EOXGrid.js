import React from "react";
import ReactDOM from "react-dom";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import { filterBy, orderBy, process } from "@progress/kendo-data-query";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import "@progress/kendo-theme-bootstrap/dist/all.css";
import GridActions from "./GridActions";
import FormRender from "../App/FormRender";
import Requests from "../../Requests";


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
    this.createApi=this.props.createApi;

    this.gridId = Date.now();
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
      displayedData: [],
      exportFilterData: [],
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

  //updating the data on delete
  updateDisplayData = ({ crudType, deleteIndex, index, data }) => {
    if (crudType == "DELETE") {
      const displayedData = this.state.displayedData;
      displayedData.data.splice(deleteIndex, 1);
      displayedData.total--;
      this.setState({ displayedData });
    }
    if (crudType == "RETRY") {
      const displayedData = this.state.displayedData;
      console.log("retry update eoxgrids");
      this.setState({ displayedData });
    }
    if (crudType == "RESET") {
      const displayedData = this.state.displayedData;
      console.log("reset update eoxgrids");
      this.setState({ displayedData });
    }
    if (crudType == "ADD") {
      // const displayedData = this.state.displayedData;
      console.log("Addition  eoxgrids");
      // this.setState({ displayedData });
    }
    if (crudType == "EDIT") {
      const displayedData = { ...this.state.displayedData };
      displayedData.data[index] = { ...data };
      console.log("edit eoxgrids");
      this.setState({ displayedData });
    }
    if (crudType == "CREATE") {
      console.log("create eoxgrids");
      const displayedData = { ...this.state.displayedData };
      displayedData.data[0] = { ...data };
      displayedData.data.add();
      displayedData.total++;
      this.setState({ displayedData });
    }
  };

  async handleCreateSubmit(formData,createFlag) {
    console.log("on create submittt----------------");
    console.log(formData);

     Requests.createFormPushData(this.core, this.createApi, formData).then(
        (response) => {
          if (response.status == "success") {
            // this.onUpdate({ crudType: "CREATE", index, data: response.data });
            console.log("successfully created ",response);
            console.log("creteflag ",createFlag);
          }
          this.create(null);
        }
      );
  }


    create = ( form,createFlag) => {
    if (createFlag) {
      document.getElementById(this.gridId).classList.add("display-none");
    } else {
      document.getElementById(this.gridId).classList.remove("display-none");
    }

    ReactDOM.render(
      <div
        style={{
          position: "absolute",
          left: "0",
          top: "0",
          width: "100%",
          height: "100%",
          zIndex: "10",
        }}
      >
        <FormRender
          key={"abc"}
          core={this.core}
          // data={data}
          updateFormData={true}
          postSubmitCallback={(formData) => this.handleCreateSubmit(formData,true)}
          content={form}
          // appId={data.uuid}
          // route= {this.api}
        />
      </div>,
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
    this.parseData();
    this.prepareData(true);
  }

  gridPageChanged = (e) => {
    console.log("page event clicked");
    // call the api to get the data for the next page by passing the new page
    let pagination = {
      skip: e.page.skip,
      take: e.page.take,
    };
    this.setState(
      {
        pagination: pagination,
      },
      () => {
        this.prepareData(false);
      }
    );
  };

  gridFilterChanged = (e) => {
    if (e.filter == null) {
      this.setState(
        {
          filter: e.filter,
          exportFilterData: this.allData,
        },
        () => {
          this.prepareData(true);
        }
      );
    } else {
      this.setState(
        {
          filter: e.filter,
          exportFilterData: e.target.props.data,
        },
        () => {
          this.prepareData(true);
        }
      );
    }
  };

  gridSortChanged = (e) => {
    this.allData = orderBy(this.allData, e.sort);
    this.setState(
      {
        sort: e.sort,
      },
      () => {
        this.prepareData(true);
      }
    );
  };

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
      <div id="eox-grid" style={{ position: "relative" }}>
        <div id="eox-grid-form"></div>
        {/* create new user */}
        <div style={{ float: "right" }} className="dash-manager-buttons">
          {Object["values"](this.actionItems).map((actions, key) =>
            actions.text === "CREATE" ? (
              <abbr title={actions.title} key={key}>
                <button
                  type={actions.type}
                  key={key}
                  className="btn btn-primary EOXGrids"
                  onClick={() => {
                    console.log(" CREATEEE ");
                    {
                      actions.text === "CREATE"
                        ? this.create(this.editForm,true)
                        // console.log("created")
                        : console.log("Not CREATED");
                    }
                  }}
                >
                  <i className={actions.icon}></i>
                </button>
              </abbr>
            ) : (
              console.log("not adding")
            )
          )}
        </div>
        <div id={this.gridId}>
          <Grid
            style={{ height: this.height, width: this.width }}
            // className={this.gridId}
            data={this.state.displayedData}
            resizable={this.resizable}
            reorderable={this.reorderable}
            // cellRender={(tdelement, cellProps) =>
            //   this.cellRender(tdelement, cellProps, this)
            // }
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
            // onRowClick={this.drillDownClick}
            groupable={this.groupable}
            group={this.state.group}
            onGroupChange={this.gridGroupChanged}
            onExpandChange={this.gridGroupExpansionChanged}
            // onDataStateChange={this.gridDataStageChanged}
            expandField="expanded"
          >
            {this.columnConfig.map((columns) => (
              <GridColumn
                key={columns.field}
                field={columns.field}
                title={columns.title}
                // cell={columns.title == "Logo" ? (props) => <LogoCell2 {...props} myProp={this.props} /> :<div></div>}
              ></GridColumn>
            ))}
            <GridColumn
              title="Actions"
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
                  gridId={this.gridId}
                />
              )}
            ></GridColumn>
          </Grid>
        </div>
      </div>
    );

    return (
      <>
        {this.state.displayedData.length === 0 && loadingPanel}
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
        {/* {this.state.visible && this.addUsersTemplate} */}
        {/* {gridTag} */}
      </>
    );
  }
}

// class LogoCell2 extends React.Component {
//     render() {
//       return this.props.dataItem.logo ? (
//         <td>
//           <img
//             src={this.props.dataItem.logo + "?" + new Date()}
//             alt="Logo"
//             className="text-center circle gridBanner"
//           />
//         </td>
//       ) : this.props.dataItem.icon ? (
//         <td>
//           <img
//             src={this.props.dataItem.icon + "?" + new Date()}
//             alt="Logo"
//             className="text-center circle gridBanner"
//           />
//         </td>
//       ) : null;
//     }
//   }
