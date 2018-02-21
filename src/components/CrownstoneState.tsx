import * as React from "react";

import Flexbox from 'flexbox-react';
import store from "../router/store/store";
import {StateIndicator} from "./StateIndicator";
import {colors} from "../styles";
import {RaisedButton} from "material-ui";

import {hashHistory} from 'react-router'

class CrownstoneState extends React.Component<any,any> {
  unsubscribeStoreEvent;

  constructor(props) {
    super(props);

    if (window.location.href.indexOf("/playback") === -1) {
      this.state = {label:"Load Recorded Data", target:"/playback"};
    }
    else {
      this.state = {label: "Go to live view", target: "/data"};
    }
  }

  toggleButton() {
    if (this.state.target !== '/playback') {
      this.setState({label: "Load Recorded Data", target: "/playback"})
    }
    else {
      this.setState({label: "Go to live view", target: "/data"})
    }
  }

  componentDidMount() {
    this.unsubscribeStoreEvent = store.subscribe(() => {
      this.forceUpdate();
    })
  }

  componentWillUnmount() {
    this.unsubscribeStoreEvent();
  }

  render() {
    let state = store.getState();

    return (
      <Flexbox>
        <StateIndicator label={ state.state.connected ? "connected" : 'not connected'} value={ state.state.connected }/>
        <StateIndicator
          label={"mode: " + state.state.mode}
          keyValue={state.state.mode}
          colorMap={{DFU: colors.purple, SETUP: colors.blue, NORMAL: colors.green, UNKNOWN: colors.lightGray}}
        />
        <StateIndicator label={ state.state.radioEnabled ? "radio ON" : 'radio OFF'} value={ state.state.radioEnabled }/>
        <StateIndicator label={ state.state.advertisementsEnabled ? "advertising" : 'not advertising'} value={ state.state.advertisementsEnabled }/>
        <StateIndicator label={ state.state.meshEnabled ? "meshing" : 'not meshing'} value={ state.state.meshEnabled }/>
        <StateIndicator label={ state.state.relayEnabled ? "relay ON" : 'relay OFF'} value={ state.state.relayEnabled }/>
        <StateIndicator label={ "IGBT state: " + state.state.igbtState } numericValue={ state.state.igbtState }/>
        <RaisedButton label={ this.state.label } primary={true} onClick={() => { this.toggleButton(); hashHistory.push(this.state.target) }} />
      </Flexbox>
    )
  }
}

export { CrownstoneState }

