import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  toggleLights,
  togglePump,
  toggleAirPump,
  toggleVent
} from "../../store/actions/actionPaneActions";
import "./actionPane.css";

class ActionPane extends Component {
  static propTypes = {
    availableControls: PropTypes.array,
    toggleLights: PropTypes.func.isRequired,
    togglePump: PropTypes.func.isRequired,
    toggleAirPump: PropTypes.func.isRequired,
    toggleVent: PropTypes.func.isRequired
  };

  static defaultProps = {
    availableControls: ["Lights", "Pump", "AirPump", "Vent"]
  };

  componentWillMount() {}

  toggle(action) {
    switch (action) {
      case "Lights":
        this.props.toggleLights();
        break;
      case "Pump":
        this.props.togglePump();
        break;
      case "AirPump":
        this.props.toggleAirPump();
        break;
      case "Vent":
        this.props.toggleVent();
        break;
      default:
        console.error("Action not set up for this button");
    }
  }

  render() {
    const mappedControls = this.props.availableControls.map(control => (
      <button key={control + "button"} onClick={() => this.toggle(control)}>
        {control}
      </button>
    ));

    return (
      <div className="flex-container">
        <h1>{mappedControls}</h1>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  actionPane: state.actionPane
});

const dispatchToProps = dispatch => ({
  toggleLights: () => dispatch(toggleLights()),
  togglePump: () => dispatch(togglePump()),
  toggleAirPump: () => dispatch(toggleAirPump()),
  toggleVent: () => dispatch(toggleVent())
});

export default connect(
  mapStateToProps,
  dispatchToProps
)(ActionPane);
