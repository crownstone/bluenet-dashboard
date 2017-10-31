import * as React from "react";

import Flexbox      from 'flexbox-react'
import {CsRange}    from "./CsRange"
import {CsToggle}   from "./CsToggle"
import {CsButton}   from "./CsButton"
import store from "../router/store/store";

class CrownstoneCommands extends React.Component<any,any> {
  render() {
    let state = store.getState();

    let spanStyle = {width:160, marginBottom: 10, marginTop:10, fontSize:15, fontStyle:'italic'};
    let segmentStyle = {marginBottom:20, marginLeft:20};
    return (
      <Flexbox flexDirection={'column'} style={{marginLeft: 30, margin:10, marginTop:30}}>
        <span style={spanStyle}>Toggles:</span>
        <Flexbox alignItems="center" style={segmentStyle} >
          <CsToggle label={"Toggle Relay"}          toggle={() => {}} value={state.state.relayEnabled}/>
          <CsToggle label={"Toggle advertisements"} toggle={() => {}} value={state.state.advertisementsEnabled}/>
          <CsToggle label={"Toggle Mesh"}           toggle={() => {}} value={state.state.meshEnabled}/>
        </Flexbox>
        <span style={spanStyle}>Set Ranges:</span>
        <Flexbox alignItems="center" style={segmentStyle} >
          <CsRange  label={"IGBT"}          increase={() => {}} decrease={() => {}} value={state.state.igbtState}/>
          <CsRange  label={"Voltage Range"} increase={() => {}} decrease={() => {}} value={state.state.voltageRange}/>
          <CsRange  label={"Current Range"} increase={() => {}} decrease={() => {}} value={state.state.currentRange}/>
        </Flexbox>
        <span style={spanStyle}>Measurements:</span>
        <Flexbox alignItems="center" style={segmentStyle} >
          <CsToggle label={"Differential Voltage"}        toggle={() => {}} value={state.state.differentialVoltage}/>
          <CsToggle label={"Differential Current"}        toggle={() => {}} value={state.state.differentialCurrent}/>
          <CsToggle label={"Measure Voltage / Reference"} toggle={() => {}} value={state.state.measureReference}/>
        </Flexbox>
        <span style={spanStyle}>Commands:</span>
        <Flexbox alignItems="center" style={segmentStyle} >
          <CsButton label={"Reset"} />
        </Flexbox>
      </Flexbox>
    )
  }
}

export { CrownstoneCommands }

