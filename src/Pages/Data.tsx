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

  constructor() {
    super();

    this.state = {
      dataSource1: null,
      dataSource1Label: null,
      dataSource1min: null,
      dataSource1max: null,
      dataSource1timeRange: null,
      dataSource2: null,
      dataSource2Label: null,
      dataSource2min: null,
      dataSource2max: null,
      dataSource2timeRange: null,
      dataSource3: null,
      dataSource3Label: null,
      dataSource3min: null,
      dataSource3max: null,
      dataSource3timeRange: null,
    }
  }

  _getData(source) {
    if (source) {
      return DataStore[source];
    }
    else {
      return null;
    }
  }

  _setData(index, source, label, min = -5, max = 100, timeRange?) {
    let dataSource = 'dataSource' + index;
    let stateLabel = dataSource + 'Label';
    let minLabel = dataSource + 'min';
    let maxLabel = dataSource + 'max';
    let timerangeLabel = dataSource + 'timeRange';
    let newData = {};
    newData[dataSource] = source;
    newData[stateLabel] = label;
    newData[minLabel] = min;
    newData[maxLabel] = max;
    newData[timerangeLabel] = timeRange;
    this.setState(newData);
  }

  render() {
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <Flexbox flexDirection="column" minHeight="100vh" width="100%">
          <BigGraph data={DataStore.switchState} dataRange={{min:-5, max:150}} timeRange={null}/>
        </Flexbox>
      </MuiThemeProvider>
    );
  }
}

export { Data }