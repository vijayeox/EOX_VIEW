import { React, EOXGrid } from "oxziongui";
import { TitleBar } from "./components/titlebar";
import { GetData } from "./components/apiCalls";
class Errorlog extends React.Component {
  constructor(props) {
    super(props);
    this.core = this.props.args;
    this.drillDownRequired = false;
    (this.actionItems = {
      retry:{
        type:"button",
        api:"errorlog",
        icon:"fad fa-redo",
        text:"RETRY",
        ispopup:true,
      }
    }),
    this.config = {
      height: "100%",
      width: "100%",
      filterable: true,
      reorderable: true,
      sortable: true,
      // sort:true,
      pageSize: 4,
      // pageable:true,
      pageable: {
        skip: 0,
        // pageSize: 10,
        buttonCount: 3,
      },
      groupable: true,
      resizable: true,

      isDrillDownTable: true,

      column: [
        {
          title: "ID",
          field: "id",
        },
        {
          title: "Type",
          field: "error_type",
        },
        {
          title: "Payload",
          field: "payload",
        },
        {
          title: "Parameters",
          field: "params",
        },
        {
          title: "Date Created",
          field: "date_created",
        },
      ],
    },

    (this.state = {
      skip : 0,
      isLoading: true,
      accountData: [],
      
      permission: {
          canAdd: this.props.userProfile.privileges.MANAGE_TEAM_CREATE,
          canEdit: this.props.userProfile.privileges.MANAGE_TEAM_WRITE,
          canDelete: this.props.userProfile.privileges.MANAGE_TEAM_DELETE,
        },
    }),
    (this.api = "errorlog");
  }

  componentDidMount() {
    GetData(this.api+`?filter=[{"skip":0,"take":${this.config.pageSize}}]`).then((data) => {
      this.setState({
        accountData: data?.status === 'success' ? data : {data : [], total : 0},
        isLoading: false,
      });
    }).catch(() => {
      this.setState({
        accountData: {data : [], total : 0},
        isLoading : false
      });
    })
  }


  dataStateChanged({dataState : { filter, group, skip, sort, take}}){
    this.setState({ isLoading : true });
    GetData(this.api+`?filter=[{"skip":${skip},"take":${this.config.pageSize}, "filter" : ${JSON.stringify(filter)}}]`).then((data) => {
      this.setState({
        accountData: data?.status === 'success' ? data : {data : [], total : 0},
        skip,
        isLoading : false
      });
    }).catch(() => {
      this.setState({
        accountData: {data : [], total : 0},
        isLoading : false
      });
    })
  }

  render() {
   
    return (
      <div style={{ height: "inherit" }}>
         <TitleBar
          title="Manage System Errors"
          menu={this.props.menu}
          args={this.core}
        />
        <React.Suspense fallback={<div>Loading...</div>}>
          <div >
          {/* {!this.state.isLoading && ( */}
              <EOXGrid
                configuration={this.config}
                data={this.state.accountData}
                core={this.core}
                isDrillDownTable={this.props.drillDownRequired}
                actionItems={this.actionItems}
                api={this.api}
                permission={this.state.permission}
                // key={Math.random()}
                skip={this.state.skip}
                dataStateChanged={this.dataStateChanged.bind(this)}
                isLoading={this.state.isLoading}
              />
            {/* )} */}
          </div>
        </React.Suspense>
        {/* {this.state.userInEdit && this.inputTemplate} */}
      </div>
    );
  }
}

export default Errorlog;
