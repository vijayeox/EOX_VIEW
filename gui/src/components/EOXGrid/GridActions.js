import React from "react";
import Requests from "../../Requests";

export default class GridActions extends React.Component {
  constructor(props) {
    console.log("gridactions=================");
    super(props);
    this.core = this.props.core;
    (this.actionItems = this.props.actionItems),
      (this.dataItems = this.props.dataItem),
      (this.api = this.props.api);
      this.onUpdate = this.props.onUpdate.bind(this);
  }

  delete = ( data,index) => {
    Requests.DeleteEntry(this.core, this.api, data.uuid).then((response) => {
      console.log(response);
      this.onUpdate({crudType:"DELETE",index})
      // grid.refresh();
    });
  };

  render() {
    return (
      <td>
        {Object["values"](this.actionItems).map((actions, key) => (
          <button
            type={actions.type}
            key={key}
            className="btn btn-primary EOXGrids"
            onClick={(e) => {
              var tr = e.target.closest("tr");
              let index = tr.getAttribute("data-grid-row-index");
              console.log(this.dataItems.data[index]);
              // {actions.text === "DELETE" ? this.delete(tr,rData,e):console.log("Not Deleted")}
              // this.delete(this.dataItems.data[index],index);
            }}
          >
            <i className={actions.icon}></i>
          </button>
        ))}
      </td>
    );
  }
}
// list of actions to be defined
//  1.EDIT -----formIO
//  2.ADD
//  3.DELETE -completed
//  4.RESET PASSWORD FOR USERS
//  5.RETRY FOR MANAGE SYSTEM Error(ERRORLOG)
//  6.Manage teams in Announcement
//  7. and 8. Also the top actions ---switch account and create new user/account/role/
