import React from 'react';
// import { widget as section } from '../metadata.json';
import dashboardJson from '../metadata.json';
import { Button } from 'react-bootstrap'
import OX_Grid from "./OX_Grid"
import Notification from "./Notification"
import Switch from "react-switch"
import WidgetModal from './components/Modals/WidgetModal'
import "./public/css/widgetmanager.scss";


class WidgetManager extends React.Component {
  constructor(props) {
    super(props);
    this.core = this.props.args;
    this.state = {
      showModal: false,
      modalType: "",
      modalContent: {},
      checked: {}
    };
    this.refresh = React.createRef();
    this.notif = React.createRef();
    this.props.setTitle(dashboardJson.widget.title.en_EN);
    this.handleSwitch = this.handleSwitch.bind(this);
    this.checkedList = {}
  }

  componentDidMount() {
    this.setState({ checked: this.checkedList })
  }

  handleSwitch(checked, event, id) {
    let toggleList = { ...this.state.checked }
    toggleList[id] = checked
    this.setState({ checked: toggleList });
  }

  widgetOperation = (e, operation) => {
    this.setState({ showModal: true, modalContent: e, modalType: operation })
  }

  //functions for OX_Grid
  renderEmpty() {
    return [<React.Fragment key={1} />];
  }

  renderButtons(e, action) {

    var actionButtons = [];
    Object.keys(action).map(function (key, index) {
      var string = this.replaceParams(action[key].rule, e);
      var showButton = eval(string);
      var variant = "primary"
      if (action[key].name === "Activate") {
        variant = "success"
      }
      else if (action[key].name === "Delete") {
        variant = "danger"
      }
      else if (action[key].name === "toggleActivate") {
        this.checkedList[e.name] = showButton //check if the widget is deleted or not
        showButton = true   //always show the button
      }
      else {
        variant = "primary"
      }
      var buttonStyles = action[key].icon
        ? {
          width: "auto"
        }
        : {
          width: "auto",
          // paddingTop: "5px",
          color: "white",
          fontWeight: "600"
        };
      showButton
        ?
        action[key].name === "toggleActivate" ?
          actionButtons.push(
            <abbr className={this.checkedList[e.name] ? "deactivateWidget" : "activateWidget"} title={this.checkedList[e.name] ? "Deactivate" : "Activate"} key={index}>
              <Switch
                id={e.name}
                onChange={() => this.buttonAction(action[key], e)}
                checked={this.state.checked[e.name]}
                onColor="#86d3ff"
                onHandleColor="#2693e6"
                handleDiameter={10}
                uncheckedIcon={false}
                checkedIcon={false}
                boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                height={20}
                width={33}
                className="react-switch"
              />
            </abbr>
          )
          :
          actionButtons.push(
            <abbr title={action[key].name} key={index}>
              <Button
                className=" btn manage-btn k-grid-edit-command"
                variant={variant}
                onClick={() => this.buttonAction(action[key], e)}
                style={buttonStyles}
              >
                {action[key].icon ? (
                  <i className={action[key].icon + " manageIcons"}></i>
                ) : (
                  action[key].name
                )}
              </Button>
            </abbr>
          )
        : actionButtons.push(<Button style={{ visibility: "hidden" }}><i className="fa fa-user"></i></Button>)
    }, this);
    return actionButtons;
  }

  replaceParams(route, params) {
    if (!params) {
      return route;
    }
    var regex = /\{\{.*?\}\}/g;
    let m;
    while ((m = regex.exec(route)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === regex.lastIndex) {
        regex.lastIndex++;
      }

      // The result can be accessed through the `m`-variable.
      m.forEach((match, groupIndex) => {
        route = route.replace(match, params[match.replace(/\{\{|\}\}/g, "")]);
      });
    }
    return route;
  }

  //calling relevant function with respective to action name
  buttonAction(action, item) {
    if (action.name !== undefined) {
      if (action.name === "toggleActivate" && item.isdeleted == "0")
        this.widgetOperation(item, "Delete")
      else if (action.name === "toggleActivate" && item.isdeleted == "1")
        this.widgetOperation(item, "Activate")
      else
        this.widgetOperation(item, action.name)
    }
  }

  render() {
    return (
      <div className="widget-manager">
        <Notification ref={this.notif} />
        <OX_Grid
          ref={this.refresh}
          osjsCore={this.core}
          data={"analytics/widget?show_deleted=true"}
          filterable={true}
          reorderable={true}
          sortable={true}
          pageable={true}
          columnConfig={[
            {
              title: "Name", field: "name"
            },
            {
              title: "Actions",
              cell: e =>
                this.renderButtons(e, [
                  // {
                  //   name: "Edit", rule: "{{isdeleted}}==0", icon: "fa fa-edit"
                  // },
                  {
                    name: "toggleActivate", rule: "{{isdeleted}}==0", icon: "fa fa-user"
                  }
                ]),
              filterCell: e => this.renderEmpty()
            }
          ]}
        />

        <WidgetModal
          osjsCore={this.core}
          modalType={this.state.modalType}
          show={this.state.showModal}
          onHide={() => this.setState({ showModal: false })}
          content={this.state.modalContent}
          handleChange={(e) => this.handleChange(e)}
          notification={this.notif}
          refreshGrid={this.refresh}
        />
      </div>
    );
  }
}

export default WidgetManager;

