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
      dataSource2: null,
      dataSource2Label: null,
      dataSource3: null,
      dataSource3Label: null,
    }
  }

  _getData(source) {
    if (source) {
      return DataStore[this.state.dataSource1];
    }
    else {
      return null;
    }
  }

  _setData(index, source, label) {
    let dataSource = 'dataSource' + index;
    let stateLabel = dataSource + 'Label';
    let newData = {};
    newData[dataSource] = source;
    newData[stateLabel] = label;
    this.setState(newData);
  }

  render() {

    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <Flexbox flexDirection="column" minHeight="100vh">
          <Flexbox flexDirection={'row'} style={{marginLeft: 30, marginTop:30}}>
            <SmallGraph data={DataStore.switchState} label={"State"} callback={(index) => { this._setData(index, 'state',          'State')}}/>
            <SmallGraph data={DataStore.temperature}    label={"Temperature"}    callback={(index) => { this._setData(index, 'temperature',    'Temperature')}}/>
            <SmallGraph data={DataStore.powerUsage}     label={"PowerUsage"}     callback={(index) => { this._setData(index, 'powerUsage',     'PowerUsage')}}/>
            <SmallGraph data={DataStore.advertisements} label={"Advertisements"} callback={(index) => { this._setData(index, 'advertisements', 'Advertisements')}}/>
            <SmallGraph data={DataStore.advErrors}      label={"Errors"}         callback={(index) => { this._setData(index, 'advErrors',      'AdvErrors')}}/>
            <SmallGraph data={DataStore.voltage}        label={"Voltage"}        callback={(index) => { this._setData(index, 'voltage',        'Voltage')}}/>
            <SmallGraph data={DataStore.current}        label={"Current"}        callback={(index) => { this._setData(index, 'current',        'Current')}}/>
          </Flexbox>
          <BigGraph data={ this._getData(this.state.dataSource1) } label={ this.state.dataSource1Label } syncToken={'bigGraph'}/>
          <BigGraph data={ this._getData(this.state.dataSource2) } label={ this.state.dataSource2Label } syncToken={'bigGraph'}/>
          <BigGraph data={ this._getData(this.state.dataSource3) } label={ this.state.dataSource3Label } syncToken={'bigGraph'}/>
        </Flexbox>
      </MuiThemeProvider>
    );
  }
}

export { Data }