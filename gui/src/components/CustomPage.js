import moment from "moment";
import React, { Component } from "react";
import JsxParser from "react-jsx-parser";
export default class CustomPage extends Component {
  constructor(props) {
    super(props);
    this.core = this.props.core;
    this.profileAdapter = this.core.make("oxzion/profile");
    this.profile = this.profileAdapter.get();
    this.appId = this.props.appId;
    this.fileId = this.props.fileId;
    this.proc = this.props.proc;
    this.data = this.props.data;
    this.state = {};
  }

  async getFileDetails(fileId) {
    let helper = this.core.make("oxzion/restClient");
    let fileContent = await helper.request(
      "v1",
      "/app/" + this.appId + "/file/" + fileId + "/data",
      {},
      "get"
    );
    return fileContent;
  }
  async getEntityPage(entityId) {
    let helper = this.core.make("oxzion/restClient");
    let fileContent = await helper.request(
      "v1",
      "/app/" + this.appId + "/entity/" + entityId + "/page",
      {},
      "get"
    );
    return fileContent;
  }
  componentDidMount() {
    this.loadData();
  }
  async loadData() {
    try {
      const fileDetails = await this.getFileDetails(this.props.fileId);
      if (
        fileDetails.status == "success" &&
        fileDetails.data &&
        fileDetails.data.entity_id
      ) {
        // const fileData = await this.getEntityPage(fileDetails.data.entity_id);
        // if (!fileData?.data?.data?.uuid) {
        //   fileData.data.data.uuid = fileData?.data?.uuid;
        // }
        const data = fileDetails.data;
        const wrapperUrl = this.core.config("wrapper.url");
        let { template, params } = this.data;
        const _moment = moment;
        for (let name in params) {
          params[name] = eval(params[name]);
        }
        console.log("params-", params);
        this.setState({
          ...this.state,
          data: fileDetails?.data,
          template,
          params,
        });
      }
    } catch (e) {
      console.log("params-", e);
    }
  }

  clickEvent(e) {
    if (this.state?.params[e?.target?.id]) {
      eval(this.state?.params[e?.target?.id])?.();
    }
  }
  render() {
    return this.state?.data ? (
      <div onClick={this.clickEvent.bind(this)}>
        <JsxParser bindings={this.state?.params} jsx={this.state.template} />
      </div>
    ) : null;
  }
}
