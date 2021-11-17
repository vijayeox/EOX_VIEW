import moment from "moment";
import React, { Component } from "react";
import JsxParser from "react-jsx-parser";
import Swal from "sweetalert2";
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
    this.loader = this.core.make("oxzion/splash");
    this.helper = this.core.make("oxzion/restClient");
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
        let { template, params, functions, api } = this.data;
        const wrapperUrl = this.core.config("wrapper.url");
        const _moment = moment;
        const sweetAlert = Swal;
        const helper = this.core.config("oxzion/restClient");
        const loader = this.core.make("oxzion/splash");
        //
        for (let name in params) {
          params[name] = eval(params[name]);
        }
        functions?.forEach((func) => {
          eval(func)
        })
        this.preload()
        console.log("params-", params);
        this.setState({
          ...this.state,
          data: fileDetails?.data,
          template,
          params,
          api
        });
      }
    } catch (e) {
      console.log("params-", e);
    }
  }

  preload(){
    this.data?.preload?.forEach((func) => {
      try{
        eval(func)?.()
      }catch(e){}
    })
  }

  async apiCall(id){
    try{
      const apiData = this.state.api?.find((data) => data.id === id)
      console.log(apiData)
      if(!apiData) return;
      if(apiData?.priorConfirm){
        const {isConfirmed} = await Swal.fire({
          text: apiData?.priorConfirm,
          showCancelButton: true,
        })
        if(!isConfirmed) return;
      }
      this.loader.show();
      const params = this.state.params;
      const parsedPayload = eval(apiData?.payload);
      console.log('parsedPayload apiCall ',parsedPayload)
      this.helper.request("v1", apiData.url, parsedPayload, apiData.type || 'POST').
      then(() => {
        this.loader.destroy();
        apiData.callback && eval(apiData.callback)?.();
      }).catch(() => {
        this.loader.destroy()
      })
    }catch(e){
      console.log('Custompage apiCall ',e)
      this.loader.destroy();
    }
  }

  clickEvent(e) {
    try{
      const isApi = e?.target?.attributes?.[0]?.name === 'data-api' && e?.target?.attributes?.[0]?.value
      if(isApi){
        this.apiCall(isApi)
        return
      }
      this.state?.params[e?.target?.id]?.();
    }catch(e){}
  }
  render() {
    return this.state?.data ? (
      <div onClick={this.clickEvent.bind(this)}>
        <JsxParser bindings={this.state?.params} jsx={this.state.template} />
      </div>
    ) : null;
  }
}
