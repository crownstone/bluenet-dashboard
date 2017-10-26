import * as React from "react";

import Flexbox from 'flexbox-react';
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';
import { browserHistory } from 'react-router'
import store from "../router/store/store";
import {StateIndicator} from "./StateIndicator";
import {colors} from "../styles";

const buttonStyle = { margin:14, marginRight:0 };

class CrownstoneState extends React.Component<any,any> {
  render() {
    let state = store.getState();

    return (
      <Flexbox>
        <StateIndicator
          label={"mode: " + state.state.mode}
          keyValue={state.state.mode}
          colorMap={{DFU: colors.purple, SETUP: colors.blue, NORMAL: colors.green, UNKNOWN: colors.lightGray}}
        />
        <StateIndicator label={"connected"} value={ state.state.connected}/>
        <StateIndicator label={"radio state"} value={ state.state.radioOn }/>
        <StateIndicator label={"relay state"} value={ state.state.relayOn }/>
        <StateIndicator label={"igbtState"} numericValue={ state.state.igbtState }/>
      </Flexbox>
    )
  }
}

export { CrownstoneState }

