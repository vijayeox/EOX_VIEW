import React from "react";
import PropTypes from "prop-types";

import timezones from "../../public/js/timezones.js";

class TimezonePicker extends React.Component {
  static propTypes = {
    value: PropTypes.string,
    offset: PropTypes.oneOf(["GMT", "UTC"]),
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    style: PropTypes.shape({}),
    inputProps: PropTypes.shape({
      onBlur: PropTypes.func,
      onFocus: PropTypes.func,
      onChange: PropTypes.func,
      onKeyDown: PropTypes.func
    })
  };

  static defaultProps = {
    value: "",
    offset: "GMT",
    className: "",
    style: {},
    inputProps: {}
  };

  state = {
    focus: null,
    query: "",
    currentZone: this.props.value
      ? timezones.find(zone => zone.name === this.props.value)
      : null
  };

  static getDerivedStateFromProps(props, state) {
    if (props.value !== (state.currentZone ? state.currentZone.name : "")) {
      return { currentZone: timezones.find(zone => zone.name === props.value) };
    }
    return null;
  }

  stringifyZone(zone, offset) {
    const ensure2Digits = num => (num > 9 ? `${num}` : `0${num}`);

    return `(${offset}${zone.offset < 0 ? "-" : "+"}${ensure2Digits(
      Math.floor(Math.abs(zone.offset))
    )}:${ensure2Digits(Math.abs((zone.offset % 1) * 60))}) ${zone.label}`;
  }

  timezones() {
    if (!this.state.query.trim()) return timezones;

    return timezones.filter(zone =>
      zone.label
        .toLowerCase()
        .replace(/\s+/g, "")
        .includes(this.state.query.toLowerCase().replace(/\s+/g, ""))
    );
  }

  handleFocus = e => {
    this.props.disableItem
      ? e.preventDefault()
      : (this.setState({ focus: 0 }),
        this.props.inputProps.onFocus
          ? this.props.inputProps.onFocus(e)
          : null);
  };

  handleBlur = e => {
    this.setState({ focus: null, query: "" });

    if (this.props.inputProps.onBlur) {
      this.props.inputProps.onBlur(e);
    }
  };

  handleChange = e => {
    this.setState({ query: e.currentTarget.value, focus: 0 });

    if (this.props.inputProps.onChange) {
      this.props.inputProps.onChange(e);
    }
  };

  handleKeyDown = e => {
    if (e.key === "ArrowDown") {
      e.stopPropagation();
      e.preventDefault();

      const ulElement = e.currentTarget.parentElement.querySelector("ul");
      const zones = this.timezones();
      this.setState(state => {
        const focus = state.focus === zones.length - 1 ? 0 : state.focus + 1;

        this.scrollToElement(ulElement.children[focus]);

        return { focus };
      });
    } else if (e.key === "ArrowUp") {
      e.stopPropagation();
      e.preventDefault();

      const ulElement = e.currentTarget.parentElement.querySelector("ul");
      const zones = this.timezones();
      this.setState(state => {
        const focus = state.focus === 0 ? zones.length - 1 : state.focus - 1;

        this.scrollToElement(ulElement.children[focus]);

        return { focus };
      });
    } else if (e.key === "Escape" && this.input) {
      e.stopPropagation();
      e.preventDefault();

      this.input.blur();
    } else if (e.key === "Enter") {
      e.stopPropagation();
      e.preventDefault();
      e.currentTarget.blur();

      const zones = this.timezones();
      if (zones[this.state.focus]) {
        this.handleChangeZone(zones[this.state.focus]);
      }
    }

    if (this.props.inputProps.onKeyDown) {
      this.props.inputProps.onKeyDown(e);
    }
  };

  handleHoverItem = index => {
    if (index === this.state.focus) return;

    this.setState({ focus: index });
  };

  handleChangeZone = zone => {
    this.props.onChange(zone.name);

    this.input.blur();
  };

  scrollToElement = element => {
    const ulElement = element.parentElement;

    const topDifference = element.offsetTop - ulElement.scrollTop;
    const bottomDifference =
      ulElement.clientHeight +
      ulElement.scrollTop -
      (element.offsetTop + element.offsetHeight);

    if (topDifference < 0) {
      // Scroll top
      ulElement.scrollTop = element.offsetTop;
    }

    if (bottomDifference < 0) {
      // Scroll bottom
      ulElement.scrollTop -= bottomDifference;
    }
  };

  render() {
    const { offset, inputProps } = this.props;
    const { currentZone, focus, query } = this.state;

    const open = focus !== null;

    return (
      <div className={this.props.className} style={this.props.style}>
        <input
          type="text"
          {...inputProps}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          onChange={this.handleChange}
          onKeyDown={this.handleKeyDown}
          value={
            currentZone && !open
              ? this.stringifyZone(currentZone, offset)
              : query
          }
          ref={input => {
            this.input = input;
          }}
        />

        <ul className={open ? "open" : ""}>
          {this.timezones().map((zone, index) => (
            <li key={zone.name}>
              <button
                title={zone.label}
                onMouseDown={() => this.handleChangeZone(zone)}
                onMouseOver={() => this.handleHoverItem(index)}
                onFocus={() => this.handleHoverItem(index)}
                className={focus === index ? "focus" : ""}
              >
                {this.stringifyZone(zone, offset)}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

export { TimezonePicker as default, timezones };
