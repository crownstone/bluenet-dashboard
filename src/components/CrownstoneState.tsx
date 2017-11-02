import * as React from "react";

import Flexbox from 'flexbox-react';
import store from "../router/store/store";
import {StateIndicator} from "./StateIndicator";
import {colors} from "../styles";

class CrownstoneState extends React.Component<any,any> {
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
      </Flexbox>
    )
  }
}

export { CrownstoneState }

