import * as React from "react";

import Flexbox      from 'flexbox-react'
import {CsRange}    from "./CsRange"
import {CsToggle}   from "./CsToggle"
import {CsButton}   from "./CsButton"
import store from "../router/store/store";
import {eventBus} from "../util/EventBus";

class CrownstoneCommands extends React.Component<any,any> {
  render() {
    let state = store.getState();

    let spanStyle = {width:160, marginBottom: 10, marginTop:10, fontSize:15, fontStyle:'italic'};
    let segmentStyle = {marginBottom:20, marginLeft:20};
    let igbtIncrement = 0.05;

    return (
      <Flexbox flexDirection={'column'} style={{marginLeft: 30, margin:10, marginTop:30}}>
        <span style={spanStyle}>Toggles:</span>
        <Flexbox alignItems="center" style={segmentStyle} >
          <CsToggle
            label={"Toggle Relay"}
            toggle={() => { eventBus.emit("command", {type:'setRelay', value:!state.state.relayEnabled}); }}
            value={state.state.relayEnabled}
          />
          <CsToggle
            label={"Toggle Advertisements"}
            toggle={() => { eventBus.emit("command", {type:'setAdvertisements', value:!state.state.advertisementsEnabled}); }}
            value={state.state.advertisementsEnabled}
          />
          <CsToggle
            label={"Toggle Mesh"}
            toggle={() => { eventBus.emit("command", {type:'setMesh', value:!state.state.meshEnabled}); }}
            value={state.state.meshEnabled}
          />
        </Flexbox>
        <span style={spanStyle}>Set Ranges:</span>
        <Flexbox alignItems="center" style={segmentStyle} >
          <CsRange
            label={"IGBT"}
            increase={() => { eventBus.emit("command", {type:'setIGBT', value: Math.min(1, state.state.igbtState + igbtIncrement)}); }}
            decrease={() => { eventBus.emit("command", {type:'setIGBT', value: Math.max(0, state.state.igbtState - igbtIncrement)}); }}
            value={state.state.igbtState}
          />
          <CsRange
            label={"Voltage Range"}
            increase={() => { alert("implement"); /*eventBus.emit("command", {type:'setVoltageRange', value: ??});*/ }}
            decrease={() => { alert("implement"); /*eventBus.emit("command", {type:'setVoltageRange', value: ??});*/ }}
            value={state.state.voltageRange}
          />
          <CsRange
            label={"Current Range"}
            increase={() => { alert("implement"); /*eventBus.emit("command", {type:'setCurrentRange', value: ??});*/ }}
            decrease={() => { alert("implement"); /*eventBus.emit("command", {type:'setCurrentRange', value: ??});*/ }}
            value={state.state.currentRange}
          />
        </Flexbox>
        <span style={spanStyle}>Measurement Toggles:</span>
        <Flexbox alignItems="center" style={segmentStyle} >
          <CsToggle
            label={"Differential Voltage"}
            toggle={() => { alert("implement"); /*eventBus.emit("command", {type:'setVoltageDifferential', value: ??});*/ }}
            value={state.state.differentialVoltage}/>
          <CsToggle
            label={"Differential Current"}
            toggle={() => { alert("implement"); /*eventBus.emit("command", {type:'setCurrentDifferential', value: ??});*/ }}
            value={state.state.differentialCurrent}/>
          <CsToggle
            label={"Measure Voltage / Reference"}
            toggle={() => { alert("implement"); /*eventBus.emit("command", {type:'toggleMeasurementChannel', value: ??});*/ }}
            value={state.state.measureReference}/>
        </Flexbox>
        <span style={spanStyle}>Commands:</span>
        <Flexbox alignItems="center" style={segmentStyle} >
          <CsButton label={"Reset"} toggle={() => { eventBus.emit("command", {type:'reset'}); }}/>
        </Flexbox>
      </Flexbox>
    )
  }
}

export { CrownstoneCommands }

