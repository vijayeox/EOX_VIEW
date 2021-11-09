import React from 'react';
import ReactDOM from 'react-dom';
import dashboardJson from '../metadata.json';
// import {visualization as section} from './metadata.json';

class Visualization extends React.Component {
  constructor(props) {
    super(props);
    this.core = this.props.args;
    this.props.setTitle(dashboardJson.visualization.title.en_EN);
  }

  render() {
    return (
      <div className="visualization full-height">
        Visualization
      </div>
    );
  }
}

export default Visualization;

