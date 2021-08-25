import $ from 'jquery';
import { name as applicationName } from './metadata.json';
import { React, Query, DataSource, Visualization, WidgetGrid, Suspense } from 'oxziongui';
import { WidgetManager, Dashboard } from 'oxziongui';
import { preparefilter, replaceCommonFilters, showDashboard, extractFilterValues } from '../../gui/src/DashboardUtils'

const SECTION_Profile = 'DB'; //DashBoard
const SECTION_HTML = 'html';

class Body extends React.Component {
  constructor(props) {
    super(props);
    this.core = this.props.args;
    this.helper = this.core.make("oxzion/restClient");
    this.state = {
      displaySection: SECTION_Profile,
      sectionData: null,
      title: 'Profile',
      dashboard_id: "",

      showModal: false,
      modalType: "",
      modalContent: {},
      flipped: false,
      uuid: "",
      dashList: [],
      inputs: {},
      dashboardBody: "",
      loadEditor: false,
      filterConfiguration: [],
      filterOptions: [],
      showFilter: false,
      dashboardFilter: [],
      drilldownDashboardFilter: [],
      hideEdit: this.props.hideEdit,
      dashboardStack: [],
      exportConfiguration: null,
      loadDefaultFilters: false
    };
    // get the function call for the profile API. should wait for it to finish. 
    let response =  this.getProfileDashboardUUID().then((res) => {
      // check if dashboard UUID is present for the user.
      if(res.data.dashboard_uuid){
        // assign the dashboard UUID to the state so that Dashboard Component can use it using props. 
        let dashboardUUID = res.data.dashboard_uuid;
        console.log(dashboardUUID);
              this.setState({
          dashboard_id : dashboardUUID,
          displaySection: SECTION_Profile,
          
        });
      }
      // else it's a html page. assign the values accordingly.
      else{
        let htmlID = res.data.html;
              this.setState({
          dashboard_id : dashboardUUID,
          displaySection: 'html',
        });
      }
     
    }).then(() => {
      this.getDashboardHtmlDataByUuid(this.state.dashboard_id)
    })
  }

  async getDashboardHtmlDataByUuid(uuid) {
    let helper = this.restClient;
    // let dashboardStack = [...this.state.dashboardStack]
    let dashboardStack = JSON.parse(JSON.stringify(this.state.dashboardStack))
    let inputs = this.state.inputs !== undefined ? this.state.inputs : undefined;
    let dashData = [];
    let response = await this.helper.request(
      "v1",
      "analytics/dashboard/" + uuid,
      {},
      "get"
    );
    let dash = response.data.dashboard;
    let filterOptions = []
    let filterConfig = dash.filter_configuration != "" ? JSON.parse(dash.filter_configuration) : []
    dashData.push({ dashData: response.data });
    filterConfig && filterConfig.map((filter, index) => {
      if (!filter.isDefault) {
        filterOptions.push({ label: filter["filterName"], value: filter })
      }
    })

    inputs["dashname"] = dash
    let drilldownDashboardFilter = this.getPreparedExtractedFilterValues(filterConfig, "default")
    dashboardStack.push({ data: dash, drilldownDashboardFilter: drilldownDashboardFilter })
    this.setState({ dashboardBody: "", inputs, uuid: uuid, dashList: dashData, filterConfiguration: filterConfig, dashboardStack: dashboardStack, drilldownDashboardFilter: drilldownDashboardFilter, filterOptions: filterOptions, loadDefaultFilters: true })
  }

  getPreparedExtractedFilterValues(dashboardFilter, filtermode) {
    filtermode = filtermode || "applied"
    let extractedFilterValues = extractFilterValues(dashboardFilter, [...this.state.dashboardStack], filtermode);
    let preapredExtractedFilterValue = null
    if (extractedFilterValues && extractedFilterValues.length > 0) {
      preapredExtractedFilterValue = extractedFilterValues[0]
      for (let i = 1; i < extractedFilterValues.length; i++) {
        preapredExtractedFilterValue = preparefilter(preapredExtractedFilterValue, extractedFilterValues[i])
      }
    }
    return preapredExtractedFilterValue
  }

  async getProfileDashboardUUID() {
    let response = await this.helper.request(
        "v1",
        "profile/user",
        {},
        "get"
    );
    return response;
}
  render() {
    let sectionContent;
    
    // console.log("Inside the body render");
    switch (this.state.displaySection) {
      case SECTION_Profile:
        // Change to dashboard 
        // add the HTML Viewer content in switch case!!!!!!!
        console.log("The UUID coming in is : ")
        console.log(this.state.dashboard_id);
    
        
      sectionContent =  
        <Dashboard
            setTitle={this.state.title}
            uuid={this.state.dashboard_id}
            core={this.core}
            proc={this.props.proc}
            dashboardFilter={this.state.dashboardFilter}
            applyDashboardFilter={filter => this.applyDashboardFilter(filter)}
            drilldownDashboardFilter={this.state.drilldownDashboardFilter}
            dashboardStack={this.state.dashboardStack}
            rollupToDashboard={() => this.rollupToDashboard()}
            loadDefaultFilters={this.state.loadDefaultFilters}
          />;
          break;
        //<Dashboard args={this.core} proc={this.props.proc} setTitle={this.state.title} uuid={this.dashboard_id} editDashboard={false} hideEdit={false} key={""} />;
      case SECTION_HTML:
        // Change to dashboard 
        // add the HTML Viewer content in switch case!!!!!!!
        //UUID won't be coming in this case. Need to load the HTML Viewer document. 
        sectionContent =  
          <Dashboard
              setTitle={this.state.title}
              uuid={this.state.dashboard_id}
              core={this.core}
              proc={this.props.proc}
            />;
        break;
      
    }

    return (
      <div id="page-body" className="page-body full-width">
        {
          this.state.title != "Profile" && <div className="page-title full-width">{this.state.title}</div>
        }
        <div className="page-content full-width" id="page-content">
          {
            this.state.dashboard_id !== "" && 
            sectionContent}
        </div>
      </div>
    );
  }
}

export default Body;

