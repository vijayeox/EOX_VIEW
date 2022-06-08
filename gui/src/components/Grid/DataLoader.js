import React from "react";
import { toODataString } from "@progress/kendo-data-query";
import moment from "moment";
import { process } from "@progress/kendo-data-query";

export class DataLoader extends React.Component {
  constructor(props) {
    super(props);
    this.core = this.props.args;
    this.state = {
      url: this.props.url,
      dataState: this.props.dataState,
    };
    this.init = { method: "GET", accept: "application/json", headers: {} };
    this.timeout = null;
    this.lastSuccess = undefined;
    this.loader = this.core.make("oxzion/splash");
  }

  componentDidMount() {
    if (this.props.searchOnEnter) {
      var that = this;
      document
        .getElementsByClassName("k-filter-row")[0]
        .getElementsByClassName("k-textbox")
        .forEach((item) => {
          item.addEventListener("keypress", function (e) {
            if (e.key === "Enter") {
              that.timeout ? clearTimeout(that.timeout) : null;
              that.triggerGetCall();
            }
          });
        });
    }
    if (this.props.autoRefresh && this.props.autoRefresh != "false") {
      var that = this;
      var autoRefreshTimer = setInterval(() => {
        var gridElement = document.getElementById(this.props.parentDiv);
        if (gridElement) {
          if (
            !document.hidden &&
            (gridElement.offsetWidth ||
              gridElement.offsetHeight ||
              gridElement.getClientRects().length > 0)
          ) {
            that.triggerGetCall(true);
          }
        } else {
          autoRefreshTimer ? clearInterval(autoRefreshTimer) : null;
        }
      }, this.props.autoRefresh);
    }
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.url !== prevProps.url ||
      !this.objectEquals(this.props.urlPostParams, prevProps.urlPostParams)
    ) {
      this.triggerGetCall();
    }
  }

  triggerGetCall(hideLoader) {
    hideLoader ? null : this.loader.show();
    this.pending = toODataString(this.props.dataState);
    this.getData(this.props.url).then((response) => {
      this.lastSuccess = this.pending;
      this.pending = undefined;
      if (toODataString(this.props.dataState) === this.lastSuccess) {
        if (typeof response == "object" && response.status == "success") {
          if (this.props.dataState.group) {
            var groupConfig = {
              group: this.props.dataState.group
            };
          }
          this.props.onDataRecieved.call(undefined, {
            data: groupConfig ? process(response.data, groupConfig).data : response.data,
            total: response.total ? response.total : null
          });
        } else {
          //put notification
          this.pending = undefined;
        }
      } else {
        this.requestDataIfNeeded();
      }
      hideLoader ? null : this.loader.destroy();
    });
  }

  prepareAPIRoute(url) {
    let paramSeperator =
      url !== undefined ? (url.includes("?") ? "&" : "?") : "&";
    var columnList = this.props.passColumnConfig
      ? this.props.passColumnConfig.concat(
        this.props.columnConfig
          .map((item) => (item.field ? item.field : null))
          .filter(
            (el) => el != null && this.props.passColumnConfig.indexOf(el) < 0
          )
      )
      : undefined;
    if (Object.keys(this.props.dataState).length === 0) {
      return columnList
        ? url + paramSeperator + "columns=" + JSON.stringify(columnList)
        : url;
    } else {
      var filterConfig = this.prepareQueryFilters(this.props.dataState);
      var finalRoute = columnList
        ? url +
        paramSeperator +
        "filter=[" +
        JSON.stringify(filterConfig) +
        "]&columns=" +
        JSON.stringify(columnList)
        : url +
        paramSeperator +
        "filter=[" +
        JSON.stringify(filterConfig) +
        "]";
      return finalRoute;
    }
  }

  async getData(url) {
    if (typeof this.core == "undefined") {
      let response = await fetch(url, this.init);
      let json = await response.json();
      if (json.status == "success") {
        let data = { data: json.value, total: json["@odata.count"] };
        return data;
      } else {
        let data = { data: [], total: 0 };
        return data;
      }
    } else {
      let helper = this.core.make("oxzion/restClient");
      var route = this.prepareAPIRoute(url);
      let data = this.props.urlPostParams
        ? await helper.request(
          "v1",
          "/" + route,
          this.props.urlPostParams,
          "post"
        )
        : await helper.request("v1", "/" + route, {}, "get");

      if (data.status == "success") {
        return data;
      } else {
        return { data: [], total: 0 };
      }
    }
  }

  prepareQueryFilters = (filterConfig) => {
    var gridConfig = JSON.parse(JSON.stringify(filterConfig));
    if (this.props.forceDefaultFilters) {
      try {
        if (gridConfig.sort.length == 0 || gridConfig.sort == null) {
          gridConfig.sort = this.props.gridDefaultFilters.sort ? this.props.gridDefaultFilters.sort : gridConfig.sort;
        }
      } catch { }
    }
    if (this.props.filterLogic && gridConfig.filter) {
      gridConfig.filter.logic = this.props.filterLogic;
    }
    this.props.columnConfig.map((ColumnItem) => {
      if (ColumnItem.filterFormat && gridConfig.filter) {
        gridConfig.filter.filters.map((filterItem1, i) => {
          filterItem1.filters && filterItem1.filters.map((filterItems1, j) => {
            this.processFilters(filterItems1, ColumnItem, gridConfig, i, j, filterItem1);
          });
          filterItem1 && this.processFilters(filterItem1, ColumnItem, gridConfig, i);
        });
      }
      if (ColumnItem.multiFieldFilter && gridConfig.filter) {
        var newFilters = [];
        gridConfig.filter.filters.map((filterItem2, i) => {
          if (filterItem2.field == ColumnItem.field) {
            var mergeFilterArray = [filterItem2];
            ColumnItem.multiFieldFilter.map((multiFieldItem) => {
              let filterCopy = JSON.parse(JSON.stringify(filterItem2));
              mergeFilterArray.push({
                field: multiFieldItem,
                operator: filterCopy.operator,
                value: filterCopy.value
              });
            });
            var mergeFilter = {
              filter: {
                logic: "or",
                filters: mergeFilterArray
              }
            };
            newFilters.push(mergeFilter);
          } else {
            newFilters.push(filterItem2);
          }
        });
        gridConfig.filter.filters = newFilters;
      }
    });
    return gridConfig;
  };

  requestDataIfNeeded = () => {
    if ((this.pending && this.pending != undefined) || toODataString(this.props.dataState) === this.lastSuccess) {
      return;
    }
    this.pending = toODataString(this.props.dataState);
    this.triggerGetCall();
  };

  processFilters = (filterItem, ColumnItem, gridConfig, i, j, filterItem1) => {
    if (filterItem.field == ColumnItem.field) {
      var result = moment(filterItem.value).format(
        ColumnItem.filterFormat
      );
      if (filterItem.value && result != "Invalid date" && filterItem1) {
        filterItem1.filters ? gridConfig.filter.filters[i].filters[j].value = result : gridConfig.filter.filters[i].value = result;
      }
    }
  }
  render() {
    if (this.lastSuccess) {
      this.timeout ? clearTimeout(this.timeout) : null;
      this.timeout = setTimeout(() => {
        this.requestDataIfNeeded();
      }, 1000);
    } else {
      this.requestDataIfNeeded();
    }
    return <div></div>;
  }

  objectEquals(obj1, obj2) {
    for (var i in obj1) {
      if (obj1.hasOwnProperty(i)) {
        if (!obj2.hasOwnProperty(i)) return false;
        if (obj1[i] != obj2[i]) return false;
      }
    }
    for (var i in obj2) {
      if (obj2.hasOwnProperty(i)) {
        if (!obj1.hasOwnProperty(i)) return false;
        if (obj1[i] != obj2[i]) return false;
      }
    }
    return true;
  }
}
export default DataLoader;
