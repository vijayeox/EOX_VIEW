import { react } from "@babel/types";
import React, { Component } from "react";
import ReactDOM from 'react-dom';
import Mapbox from './Mapbox';
import SSOCustom from './SSOCustom';
import InsureLearn from './InsureLearnCustom';

//List of all the components that are needed for the custom components
// This component is used to link all the custom reports that are built and 
class ComponentIndex extends Component {
    constructor(props) {
        super(props);
        // this.state = {
        //     element: this.props.element,
        //     config: this.props.config,
        //     data: this.props.data ? this.props.data : null,
        // };
    }

    render() {
        let ComponentType = this.props.config.report;
        switch (ComponentType) {
            case 'Mapbox':
                ReactDOM.render(
                    <Mapbox
                        element={this.props.element} key={Math.random()} config={this.props.config} core={this.props.core} data={this.props.data} canvasElement={this.props.canvasElement}
                    />, this.props.canvasElement
                );
                break;
            case 'SSOCustom':
                ReactDOM.render(
                    <SSOCustom
                        element={this.props.element} key={Math.random()} config={this.props.config} core={this.props.core} data={this.props.data} canvasElement={this.props.canvasElement}
                    />, this.props.canvasElement
                );
                break;
            case 'InsureLearn':
                ReactDOM.render(
                    <InsureLearn
                        element={this.props.element} key={Math.random()} config={this.props.config} core={this.props.core} data={this.props.data} canvasElement={this.props.canvasElement}
                    />, this.props.canvasElement
                );
                break;

            default:
                break;
        }
        return null;
    }
}

export default ComponentIndex;
