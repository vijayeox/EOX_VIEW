import React from 'react'
import * as KendoReactDateInputs from "@progress/kendo-react-dateinputs";
import * as Moment from "moment";

export default class DateComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: undefined,
      minValue: undefined
    };
    this.dateformat = this.props.format
      ? this.props.format.replace(/m/g, "M")
      : "dd-MM-yyy";
  }

  UNSAFE_componentWillMount() {
    if (Moment(this.props.value, "YYYY-MM-DD", true).isValid()) {
      var getDate = this.convertToDate(this.props.value);
      this.setState({ value: getDate });
    }
    if (this.props.min !== undefined) {
      if (Moment(this.props.min, "YYYY-MM-DD", true).isValid()) {
        var getDate = this.convertToDate(this.props.min);
        this.setState({ minValue: getDate });
      }
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.value !== prevProps.value) {
      if (Moment(this.props.value, "YYYY-MM-DD", true).isValid()) {
        var getDate = this.convertToDate(this.props.value);
        this.setState({ value: getDate });
      }
    }
    if (this.props.min !== prevProps.min) {
      if (Moment(this.props.min, "YYYY-MM-DD", true).isValid()) {
        var getDate = this.convertToDate(this.props.min);
        this.setState({ minValue: getDate });
      }
    }
  }

  convertToDate = currentDate => {
    const Dateiso = new Moment(currentDate, "YYYY-MM-DD").format();
    const Datekendo = new Date(Dateiso);
    return Datekendo;
  };

  render() {
    return (
      <KendoReactDateInputs.DatePicker
        format={this.dateformat}
        value={this.state.value}
        min={this.state.minValue}
        max={this.props.max}
        validationMessage={this.props.validationMessage}
        onChange={this.props.change}
        required={this.props.required}
        disabled={this.props.disabled ? true : false}
      />
    );
  }
}
