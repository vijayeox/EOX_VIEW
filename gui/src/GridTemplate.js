import React from "react";
import {
  Grid,
  GridColumn,
  GridToolbar,
  GridNoRecords
} from "@progress/kendo-react-grid";
import Notification from "./Notification";
import { GridCell } from "@progress/kendo-react-grid";
import DataLoader from "./components/Grid/DataLoader";
import Swal from "sweetalert2";
import $ from "jquery";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

// import "@progress/kendo-theme-default/dist/all.css";

export default class GridTemplate extends React.Component {
  constructor(props) {
    super(props);
    this.child = React.createRef();
    this.core = this.props.args;
    this.baseUrl = this.core.config("wrapper.url");
    this.state = {
      dataState: {
        take: 20,
        skip: 0,
        sort: this.props.config.sortMode
      },
      gridData: this.props.gridData,
      api: this.props.config.api
    };
    this.notif = React.createRef();
  }

  componentDidMount() {
    $(document).ready(function() {
      $(".k-textbox").attr("placeholder", "Search");
    });
  
  }

  componentDidUpdate(prevProps) {
    if (this.props.config.api !== prevProps.config.api) {
      this.setState({
        api: this.props.config.api
      });
    }
  }

  dataStateChange = e => {
    this.setState({
      ...this.state,
      dataState: e.data
    });
  };

  dataRecieved = data => {
    this.setState({
      gridData: data
    });
  };

  createColumns() {
    let table = [];
    for (var i = 0; i < this.props.config.column.length; i++) {
      if (this.props.config.column[i].field == "media") {
        table.push(
          <GridColumn
            key={i}
            width="200px"
            title={this.props.config.column[i].title}
            filterCell={this.emptyCell}
            sortable={false}
            cell={props => (
              <LogoCell {...props} myProp={this.props} url={this.baseUrl} />
            )}
          />
        );
      } else if (this.props.config.column[i].field == "logo") {
        table.push(
          <GridColumn
            key={i}
            width="150px"
            title={this.props.config.column[i].title}
            filterCell={this.emptyCell}
            sortable={false}
            cell={props => <LogoCell2 {...props} myProp={this.props} />}
          />
        );
      } else {
        table.push(
          <GridColumn
            field={this.props.config.column[i].field}
            key={i}
            title={this.props.config.column[i].title}
          />
        );
      }
    }
    return table;
  }

  rawDataPresent() {
    if (this.props.gridData) {
      return <div />;
    } else {
      return (
        <DataLoader
          ref={this.child}
          args={this.core}
          url={this.state.api}
          dataState={this.state.dataState}
          onDataRecieved={this.dataRecieved}
        />
      );
    }
  }

  refreshHandler = serverResponse => {
  

 
    if (serverResponse.status == "success") {

      this.notif.current.notify(
        "Success",
        "Operation succesfully completed",
        "success"
      )
    } else {

      this.notif.current.notify(
        "Error",
        serverResponse.message ? serverResponse.message : null,
        "danger"
      )
    }
    this.child.current.refresh();
  };

  emptyCell = () => {
    return <div />;
  };

  render() {
    return (
      <div style={{ height: "90%", display: "flex", marginTop: "10px" }}>
        <Notification ref={this.notif} />
        {this.rawDataPresent()}
        <Grid
          data={
            typeof this.state.gridData == "object" ? this.state.gridData : []
          }
          {...this.state.dataState}
          sortable={{ mode: "multiple" }}
          filterable={true}
          resizable={true}
          reorderable={true}
          scrollable={"scrollable"}
          pageable={{ buttonCount: 5, pageSizes: true, info: true }}
          onDataStateChange={this.dataStateChange}
          onRowClick={e => {
            this.props.permission.canEdit
              ? this.props.manageGrid.edit(e.dataItem, { diableField: false })
              : this.props.manageGrid.edit(e.dataItem, { diableField: true });
          }}
        >
          <GridNoRecords>
            <div className="grid-no-records">
              <ul className="list-group" style={{ listStyle: "disc" }}>
                <div
                  href="#"
                  className="list-group-item list-group-item-action bg-warning"
                  style={{
                    display: "flex",
                    width: "110%",
                    alignItems: "center"
                  }}
                >
                  <div style={{ marginLeft: "10px" }}>
                    <i className="fa fa-info-circle"></i>
                  </div>
                  <div
                    style={{ fontSize: "medium", paddingLeft: "30px" }}
                    className="noRecords"
                  >
                    No Records Available
                  </div>
                </div>
              </ul>
            </div>
          </GridNoRecords>
          {this.props.config.showToolBar == true && (
            <GridToolbar>
              <div>
                <div style={{ fontSize: "20px" }}>
                  {this.props.config.title + "'s"} List
                </div>
                <AddButton
                  args={this.props.manageGrid.add}
                  permission={this.props.permission.canAdd}
                  label={this.props.config.title}
                />
              </div>
            </GridToolbar>
          )}
          {this.createColumns()}
          {(this.props.permission.canEdit ||
            this.props.permission.canDelete) && (
            <GridColumn
              title="Manage"
              width="190px"
              minResizableWidth={170}
              cell={CellWithEditing(
                this.props.config.title,
                this.props.manageGrid.edit,
                this.props.manageGrid.remove,
                this.props.manageGrid.addUsers,
                this.props.permission
              )}
              sortable={false}
              filterCell={this.emptyCell}
            />
          )}
        </Grid>
      </div>
    );
  }
}

class AddButton extends React.Component {
  render() {
    return this.props.permission ? (
      <button
        onClick={this.props.args}
        className="k-button"
        style={{ position: "absolute", top: "-1px", right: "3px" }}
      >
        <i className="fa fa-plus-circle" style={{ fontSize: "20px" }}></i>

        <p style={{ margin: "0px", paddingLeft: "10px" }}>
          Add {this.props.label}
        </p>
      </button>
    ) : null;
  }
}

class LogoCell extends React.Component {
  render() {
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

class LogoCell2 extends React.Component {
  render() {
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
}

function CellWithEditing(title, edit, remove, addUsers, permission) {
  return class extends GridCell {
    constructor(props) {
      super(props);
      this.core = this.props.args;
    }

    deleteButton() {
      return permission.canDelete ? (
        <abbr title={"Delete " + title}>
          <button
            type="button"
            className="btn manage-btn k-grid-remove-command"
            onClick={e => {
              e.preventDefault();
              MySwal.fire({
                title: "Are you sure?",
                text:
                  "Do you really want to delete the record? This cannot be undone.",
                imageUrl:
                  "https://image.flaticon.com/icons/svg/1632/1632714.svg",
                imageWidth: 75,
                imageHeight: 75,
                confirmButtonText: "Delete",
                confirmButtonColor: "#d33",
                showCancelButton: true,
                cancelButtonColor: "#3085d6",
                target: ".Window_Admin"
              }).then(result => {
                if (result.value) {
                  remove(this.props.dataItem);
                }
              });
            }}
          >
            <i className="fa fa-trash manageIcons"></i>
          </button>
        </abbr>
      ) : null;
    }

    render() {
      return (
        <td>
          <center>
            {permission.canEdit ? (
              <React.Fragment>
                <abbr title={"Edit " + title + " Details"}>
                  <button
                    type="button"
                    className=" btn manage-btn k-grid-edit-command"
                    onClick={() => {
                      edit(this.props.dataItem, { diableField: false });
                    }}
                  >
                    <i className="fa fa-pencil manageIcons"></i>
                  </button>
                </abbr>
                {addUsers && (
                  <React.Fragment>
                    &nbsp; &nbsp;
                    <abbr
                      title={
                        "Add " +
                        (title == "Announcement" ? "Groups" : "Users") +
                        " to " +
                        title
                      }
                    >
                      <button
                        type="button"
                        className="btn manage-btn"
                        onClick={() => {
                          addUsers(this.props.dataItem);
                        }}
                      >
                        {title == "Announcement" ? (
                          <i className="fa fa-users manageIcons"></i>
                        ) : (
                          <i className="fa fa-user-plus manageIcons"></i>
                        )}
                      </button>
                    </abbr>
                  </React.Fragment>
                )}
              </React.Fragment>
            ) : null}
            &nbsp; &nbsp;
            {this.props.dataItem.is_system_role || this.props.dataItem.is_admin
              ? (this.props.dataItem.is_system_role == "0" ||
                  this.props.dataItem.is_admin == "0") &&
                this.deleteButton()
              : this.deleteButton()}
          </center>
        </td>
      );
    }
  };
}
