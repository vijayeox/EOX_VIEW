import React from "react";
import LeftMenuTemplate from "./LeftMenuTemplate";

class EOXApplication extends React.Component {
  constructor(props) {
    super(props);
    this.core = this.props.args;
    this.helper = this.core.make("oxzion/restClient");
    this.params = this.props.params;
    this.proc = this.props.proc;
    this.state = {
      showMenuPage: undefined
    };
  }

  componentDidMount() {
  }

  render() {
    return (
      <div style={{ height: "inherit", overflow: "auto" }}>
          <LeftMenuTemplate
            core={this.core}
            params={this.params}
            proc={this.proc}
            appId={this.props.application_id}
            childrenComponents={this.props.childrenComponents}
          />
      </div>
    );
  }
}
export default EOXApplication;