import React from "react";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import { filterBy, orderBy, process } from "@progress/kendo-data-query";
import { IntlService } from "@progress/kendo-react-intl";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import "@progress/kendo-theme-bootstrap/dist/all.css";
import GridActions from "./GridActions";

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
  updateDisplayData = ({ crudType, deleteIndex }) => {
    if (crudType == "DELETE") {
      const displayedData = this.state.displayedData;
      displayedData.data.splice(deleteIndex, 1);
      displayedData.total--;
      this.setState({ displayedData });
    }
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

  //No implementation now. Add implementation if needed later.
  // gridDataStageChanged = (e) => {
  //   console.log("Called event handler - gridDataStageChanged. Event is:");
  //   console.log(e);
  // };

  render() {
    let gridTag = (
      <div>
        {/* create new user */}
        <div style={{ float: "right" }} className="dash-manager-buttons">
          {/* {this.actionItems?.addUsers && 
                <button
                    type="button"
                    className="btn btn-primary EOXGrids"
                    onClick={() => {
                        
                        console.log(" user");
                        }}
                    >
                    <i className="fad fa-plus"></i>
                </button>
            } */}
        </div>
        <Grid
          style={{ height: this.height, width: this.width }}
          // className={this.isDrillDownTable ? "drillDownStyle" : ""}
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
              />
            )}
          ></GridColumn>
        </Grid>
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
