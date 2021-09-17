import React, { Component } from "react";
import $ from "jquery";
import ReactDOM from 'react-dom';
import Swal from "sweetalert2";
import { Button } from 'react-bootstrap';

class SSOCustom extends Component {

  constructor(props) {
    super(props);
    this.core = this.props.core;
    this.helper = this.core.make("oxzion/restClient");
    this.state = {
      authorizedUrl: '',
      redirectUrl: '',
      element: this.props.element,
      config: this.props.config,
      core: this.props.core,
      data: this.props.data,
      awaitingResponse: '',
      appUuid: (this.props.config.appId) ? this.props.config.appId : '51c59337-9ac2-40d5-9775-d76094c1e861' //hardcoded val
    }
  }

  async getURL(url) {
    let fileContent = await this.helper.request("v1", url, {}, "get");
    return fileContent;
  }

  async getExternalURL(url) {
    let uiUrl = this.core.config("ui.url");
    let externalUrl = uiUrl + url;
    let resp = await fetch(externalUrl, {
      method: "post",
    });
    return resp;
  }

  generateToken() {
    // Code to generate the URL
    let url = 'app/' + this.state.appUuid + '/delegate/GenerateSpeedgaugeAuth';
    if (this.state.config.email) {
      url += '?emailForSSO=' + this.state.config.email;
    }

    this.getURL(url).then((response) => {
      if (response.status == "success") {
        if (response.data.authorizedUrl) {
          this.setState({ authorizedUrl: response.data.authorizedUrl });
        }
        this.setState({ awaitingResponse: false });
      }
    });

    // let urlId = "https://www.speedgauge.net/access/jwt?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJha3RydWNraW5nODJAeWFob28uY29tIiwiaXNzIjoicnNpLWluc3VyYW5jZS1icm9rZXJzLTEiLCJpYXQiOjE2MzE3MTA0OTYsImV4cCI6MTYzMTc5Njg5Nn0.mn33sG32XAzw0NYNChX7VDvOHd64g3U_DisEoHwOiMs&redirect_to=https://www.speedgauge.net/insurance";
    // window.open(urlId, '_blank');

    if (this.state.authorizedUrl !== '') {
      this.stepDownPage();
      window.open(this.state.authorizedUrl, '_blank');
      return null;
    } else if (this.state.authorizedUrl === ''
      // && this.props.config.redirectUrl && !this.state.awaitingResponse
    ) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Could not redirect to the requested site. Please contact customer support.",
      });
      return null;
    }
  }

  onSSOClicked = () => {
    this.generateToken();
  }

  render() {
    $('.dash-manager-buttons').parent('div').css('outline', 'none');
    $('.dash-manager-buttons').parent('div').css('background', 'none');
    return (
      <div class="dash-manager-buttons">
        <Button onClick={() => this.onSSOClicked()} title="Open SpeedGuage Dashboard">
          <i className="fa fa-external-link"></i>
        </Button>
      </div >
    );
  }
}

export default SSOCustom;