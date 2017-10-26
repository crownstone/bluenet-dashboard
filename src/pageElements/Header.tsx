import * as React from "react";

import Flexbox from 'flexbox-react';
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';
import { browserHistory } from 'react-router'
import { CrownstoneState } from '../components/CrownstoneState'
import store from "../router/store/store";

const buttonStyle = { margin:14, marginRight:0 };

class Header extends React.Component<any,any> {
  unsubscribeStoreEvent;

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

    let headerLabel = "Crownstone Dashboard: ";
    if (state.state.connected === true) {
      headerLabel += state.state.name + ' ' + state.state.macAddress;
    }
    else {
      headerLabel += " not connected.";
    }

    return (
      <Flexbox
        element="header"
        flexDirection="column"
        height="109px"
        alignItems="flex-start"
        justifyContent="flex-start"
        style={{marginTop:10, marginLeft:25, marginRight: 14}}
      >
        <Flexbox flexGrow={0.5} />
        <span style={{fontSize: 32, fontWeight:'bold', paddingTop: 15}}>{headerLabel}</span>
        <Flexbox flexGrow={0.5} />
        <CrownstoneState />
        <Flexbox flexGrow={0.1} />
      </Flexbox>
    )
  }
}

export { Header }

