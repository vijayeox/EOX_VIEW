import React from "react";
import OX_Grid from "../../components/OI/OX_Grid";
import "./Styles/PageComponentStyles.scss";

class SearchPage extends React.Component {
  constructor(props) {
    super(props);
    this.config = this.props.config;
    this.core = this.props.core;
    this.appId = this.props.appId;
    this.filterable = false;
    this.reorderable = true;
    this.resizable = true;
    this.sortable = true;
    this.search = {
      value: "",
    };
    this.api = "app/" + this.appId + "/file/search/status/Completed";
    this.pageable = { buttonCount: 3, pageSizes: [10, 20, 50] };
    this.state = {
      content: this.props.content,
      query: "",
      columnConfig: this.props.columnConfig,
      filterColumns: this.props.filterColumns,
      placeholder: this.props.placeholder,
      filter: [],
    };
    var itemContent = this.props.content;
    var columnConfig = itemContent.columnConfig;
    for (var i = columnConfig.length - 1; i >= 0; i--) {
      for (var j = this.state.filterColumns.length - 1; j >= 0; j--) {
        if (columnConfig[i].field == this.state.filterColumns[j]) {
          columnConfig[i].filterable = false;
        }
      }
    }
    if (itemContent.actions) {
      if (columnConfig[columnConfig.length - 1].title == "Actions") {
        null;
      } else {
        columnConfig.push({
          title: "Actions",
          cell: (e) => this.renderButtons(e, itemContent.actions),
          filterCell: (e) => this.renderEmpty(),
        });
      }
    }
    this.columnConfig = columnConfig;
  }
  componentDidMount() {
    this.setState({ columnConfig: this.columnConfig });
  }
  replaceParams(route, params) {
    if (!params) {
      return route;
    }
    var regex = /\{\{.*?\}\}/g;
    let m;
    while ((m = regex.exec(route)) !== null) {
      if (m.index === regex.lastIndex) {
        regex.lastIndex++;
      }
      m.forEach((match, groupIndex) => {
        route = route.replace(match, params[match.replace(/\{\{|\}\}/g, "")]);
      });
    }
    return route;
  }
  handleInputChange = () => {
    var filters = [];
    if (this.state.filterColumns) {
      for (var i = this.state.filterColumns.length - 1; i >= 0; i--) {
        filters.push({
          field: this.state.filterColumns[i],
          operator: this.props.filterOperator ? this.props.filterOperator : "contains",
          value: this.search.value,
        });
      }
    }
    var filter = {
      logic: "or",
      filters: filters,
    };
    this.setState({ filter: { filter: filter } });
    this.setState({ query: this.search.value });
  };

  componentDidUpdate(prevProps) {
    if (this.props.content !== prevProps.content) {
      this.setState({ content: this.props.content });
    }
  }

  render() {
    var placeholder = this.state.placeholder ? this.state.placeholder : "Search for...";
    return (
      <div className='searchResults'>
        <div className='searchPageDiv'>
          <div className='searchBar'>
            <svg className='icon' viewBox='0 0 1024 1024'>
              <path className='path1' d='M848.471 928l-263.059-263.059c-48.941 36.706-110.118 55.059-177.412 55.059-171.294 0-312-140.706-312-312s140.706-312 312-312c171.294 0 312 140.706 312 312 0 67.294-24.471 128.471-55.059 177.412l263.059 263.059-79.529 79.529zM189.623 408.078c0 121.364 97.091 218.455 218.455 218.455s218.455-97.091 218.455-218.455c0-121.364-103.159-218.455-218.455-218.455-121.364 0-218.455 97.091-218.455 218.455z'></path>
            </svg>
            <input className='searchInput' placeholder={placeholder} ref={(input) => (this.search = input)} onChange={this.handleInputChange} />
          </div>
          <div className='seperator'></div>
        </div>
        {this.search.value ? (
          <div className='row searchText'>
            <div className='col-md-12'>Search Results for "{this.search.value}"</div>
          </div>
        ) : null}
        {this.search.value != "" ? (
          <div className='row'>
            <div className='col-md-12'>
              <OX_Grid osjsCore={this.core} gridDefaultFilters={this.state.filter.length != 0 ? this.state.filter : null} filterable={this.filterable} data={this.api} reorderable={this.reorderable} resizable={this.resizable} pageable={this.pageable} sortable={this.sortable} columnConfig={this.state.columnConfig} passColumnConfig={this.props.passColumnConfig} />
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}
export default SearchPage;
