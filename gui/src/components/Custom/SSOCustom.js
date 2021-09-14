import React, { Component } from "react";
import ReactDOM from 'react-dom';

class SSOCustom extends Component {

    constructor(props) {
        super(props);
        this.core = this.props.args;
        this.appId = this.props.appId;
        this.params = this.props.params;

        this.state = {
            authorizedUrl: '',
            externalUrl: this.props.item.externalUrl ? this.props.item.externalUrl : undefined,
            redirectUrl: this.props.item.redirectUrl ? this.props.item.redirectUrl : undefined,
            emailForSSO: this.props.item.emailForSSO ? this.props.item.emailForSSO : false,
            awaitingResponse: true,
            content: this.props.content
        }
    }

    async getExternalURL(url) {
        let uiUrl = this.core.config("ui.url");
        let externalUrl = uiUrl + url;
        let resp = await fetch(externalUrl, {
            method: "post",
        });
        return resp;
    }

    componentDidMount() {
        if (this.state.externalUrl != undefined) {
            this.getExternalURL(this.state.externalUrl)
                .then((response) => {
                    if (response.ok) {
                        response.text().then((value) => {
                            this.setState({
                                content: value,
                            });
                        });
                    }
                }).catch((e) => {
                    console.log("Error " + e);
                });
        } else if (this.state.redirectUrl) {
            let url = this.state.redirectUrl;
            if (this.state.emailForSSO) {
                url += '?emailForSSO=' + this.profile.key.email;
            }
            this.getURL(url).then((response) => {
                if (response.status == "success") {
                    if (response.data.authorizedUrl) {
                        this.setState({ authorizedUrl: response.data.authorizedUrl });
                    }
                    this.setState({ awaitingResponse: false });
                }
            });
        } else if (this.state.content) {
            this.preRender();
        }
    }

    render() {
        return (
            <div>
                <div className="sidebar">
                    Click to Login
                </div>
            </div >
        );
    }
}

export default SSOCustom;