import * as React from "react";
import {deepOrange500} from 'material-ui/styles/colors';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import * as visjs from "vis"
import Flexbox from 'flexbox-react';

import store from "../router/store/store";
import {DataStore} from "../data/dataStore";
import {SmallGraph} from "../components/SmallGraph";
import {BigGraph} from "../components/BigGraph";

const muiTheme = getMuiTheme({
  fontFamily: 'Roboto',
  palette: {
    accent1Color: deepOrange500,
  },
});

class Data extends React.Component<any,any> {
  render() {
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <Flexbox flexDirection="column" minHeight="100vh">
          <Flexbox flexDirection={'row'} style={{marginLeft: 30, marginTop:30}}>
            <SmallGraph data={DataStore.state}          label={"State"} />
            <SmallGraph data={DataStore.temperature}    label={"Temperature"} />
            <SmallGraph data={DataStore.powerUsage}     label={"PowerUsage"} />
            <SmallGraph data={DataStore.advertisements} label={"Advertisements"} />
            <SmallGraph data={DataStore.advErrors}      label={"Errors"} />
            <SmallGraph data={DataStore.voltage}        label={"Voltage"} />
            <SmallGraph data={DataStore.current}        label={"Current"} />
          </Flexbox>
          <BigGraph data={DataStore.state} label={"State"} />
          <BigGraph data={DataStore.state} label={"State"} />
          <BigGraph data={DataStore.state} label={"State"} />
        </Flexbox>
      </MuiThemeProvider>
    );
  }
}

export { Data }