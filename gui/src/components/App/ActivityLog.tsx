import React, { Ref } from "react";
import { CoreBase, Pageable } from "../../interfaces";
import OX_Grid from "../OI/OX_Grid";
import "./Styles/PageComponentStyles.scss";
interface Props {
  core: CoreBase;
  config?: any;
  appId: string;
  fileId: string;
  disableControls: any;
  cancel?:any;
}
class ActivityLog extends React.Component<Props,any> {
  private config: any;
  private core: CoreBase;
  private profileAdapter: any;
  private profile: any;
  private appId: string;
  private fileId: string;
  private filterable: boolean;
  private reorderable: boolean;
  private resizable: boolean;
  private sortable: boolean;
  private api: string;
  private disableControls: any;
  private pageable: Pageable;
  private parentGrid : Ref<any>;
  private childGrid : Ref<any>;
  constructor(props) {
    super(props);
    this.config = this.props.config;
    this.core = this.props.core;
    this.profileAdapter = this.core.make("oxzion/profile");
    this.profile = this.profileAdapter.get();
    this.appId = this.props.appId;
    this.fileId = this.props.fileId;
    this.filterable = false;
    this.reorderable = false;
    this.resizable = false;
    this.sortable = false;
    this.disableControls = this.props.disableControls;
    this.api = "app/" + this.appId + "/file/" + this.fileId + "/audit";

    var columnConfig = [
      {
        field: "version",
        title: "Version",
      },
      {
        field: "file_date_modified",
        title: "Performed On",
        filter: "date",
        filterFormat: "YYYY-MM-DD",
        cell: "<td>{formatDate(item.file_date_modified,'YYYY-MM-DD')}</td>",
      },
      {
        field: "modifiedUser",
        title: "Modified By",
      },
      {
        field: "action",
        title: "Action Performed",
      },
    ];

    this.pageable = { buttonCount: 3, pageSizes: [10, 20, 50] };
    this.state = {
      columnConfig: columnConfig,
      filter: [],
    };
    this.parentGrid = React.createRef();
    this.childGrid = React.createRef();
  }
  renderRow(e) {
    var childColumnConfig = [
      { title: "Field", field: "text", editable: false },
      { title: "Previous Value", field: "initialValue" },
      { title: "Updated Value", field: "submittedValue" },
    ];
    return (
      <OX_Grid
        osjsCore={this.props.core}
        ref={this.childGrid}
        data={e?.fields || []}
        columnConfig={childColumnConfig}
        inlineEdit={false}
      />
    );
  }

  render() {
    return (
      <div className="activityLogWindow">
        {!this.disableControls && (
          <div id="audit-controls">
            <div style={{ textAlign: "end" }}>
              <button
                type="button"
                className="btn btn-danger"
                onClick={this.props.cancel}
              >
                <i className="fa fa-close"></i>
              </button>
            </div>
          </div>
        )}
        <div
          id="loading-animation"
          className="blockUI blockMsg blockElement loadingdivcss hide"
        >
          <div className="loading-message ">
            <div className="block-spinner-bar">
              <div className="bounce1"></div>
              <div className="bounce2"></div>
              <div className="bounce3"></div>
            </div>
          </div>
        </div>
        {/* <div id="browser-no-support" className="hide">
        Your browser does not support this functionality! <br/> 
        Please use Google Chrome or Firefox.
        </div> */}
        <div className="logResults">
          <OX_Grid
            osjsCore={this.core}
            filterable={this.filterable}
            data={this.api}
            reorderable={this.reorderable}
            expandable={true}
            rowTemplate={(e) => this.renderRow(e)}
            resizable={this.resizable}
            pageable={this.pageable}
            sortable={this.sortable}
            columnConfig={this.state.columnConfig}
          />
        </div>
      </div>
    );
  }
}
export default React.memo(ActivityLog);
