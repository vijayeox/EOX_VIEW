import {React,OX_Grid} from "oxziongui";
import { TitleBar } from "./components/titlebar";

class Errorlog extends React.Component {
  constructor(props) {
    super(props);
    this.core = this.props.args;
  }

  async retryCall(dataItem) {
    let helper2 = this.core.make("oxzion/restClient");
    let response = await helper2.request(
      "v1",
      "errorlog/" + dataItem.id + "/retry",
      {},
      "post"
    );
    return response;
  }

  renderButtons(e, action) {
    var actionButtons = [];
    Object.keys(action).map(function(key, index) {
      var buttonStyles = action[key].icon
        ? {
            width: "2.2rem"
          }
        : {
            width: "auto",
            paddingTop: "5px",
            color: "white",
            fontWeight: "600"
          };
      actionButtons.push(
        <abbr title={action[key].name} key={index}>
          <button
            type="button"
            className=" btn manage-btn k-grid-edit-command"
            onClick={() => this.retryCall(e)}
            style={buttonStyles}
          >
            {action[key].icon ? (
              <i className={action[key].icon + " manageIcons"}></i>
            ) : (
              action[key].name
            )}
          </button>
        </abbr>
      );
    }, this);
    return actionButtons;
  }

  renderEmpty() {
    return [<React.Fragment key={1} />];
  }

  render() {
    return (
      <div style={{ height: "inherit" }}>
        <TitleBar
          title="Manage System Errors"
          menu={this.props.menu}
          args={this.core}
        />
        <div style={{ width: "100%", padding: "10px" }}></div>
        <OX_Grid
          osjsCore={this.core}
          data={"errorlog"}
          filterable={true}
          reorderable={true}
          resizable={true}
          sortable={true}
          columnConfig={[
            {
              title: "ID",
              field: "id"
            },
            {
              title: "Type",
              field: "error_type"
            },
            {
              title: "Payload",
              field: "payload"
            },
            {
              title: "Parameters",
              field: "params"
            },
            {
              title: "Date Created",
              field: "date_created"
            },
            {
              title: "Actions",
              cell: e =>
                this.renderButtons(e, [
                  {
                    name: "Retry",
                    rule: "true",
                    icon: "fa fa-redo"
                  }
                ]),
              filterCell: e => this.renderEmpty()
            }
          ]}
        />
      </div>
    );
  }
}

export default Errorlog;
