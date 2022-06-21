import React, { Ref, RefObject } from "react";
import ReactNotification from "react-notifications-component";
import "react-notifications-component/dist/theme.css";
class Notification extends React.Component {
  notificationDOMRef: RefObject<{
    addNotification: (...args) => any;
  }>;
  constructor(props) {
    super(props);
    this.notificationDOMRef = React.createRef();
  }
  notify(title, message, type, container, duration) {
    this.notificationDOMRef?.current?.addNotification({
      title: title || "",
      message: message || "",
      type: type || "",
      insert: "top",
      container: container ? container : "bottom-right",
      animationIn: ["animated", "bounceIn"],
      animationOut: ["animated", "bounceOut"],
      dismiss: { duration: duration ? duration : 3000 },
      dismissable: { click: true },
    });
  }
  render() {
    return (
      <div>
        <ReactNotification ref={this.notificationDOMRef} />
      </div>
    );
  }
}
export default Notification;
