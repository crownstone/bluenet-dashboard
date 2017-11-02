import {update} from "../util/reducerUtil";

export let defaultStateSettings : crownstoneState = {
  connected: false,
  simulated: false,
  name: null,
  macAddress: null,
  mode: 'UNKNOWN',  // "SETUP" | "NORMAL" | "DFU" | "UNKNOWN"
  radioEnabled: false,
  advertisementsEnabled: false,
  meshEnabled: false,
  relayEnabled: false,
  igbtState: 0,

  voltageRange: 0,
  currentRange: 0,
  differentialVoltage: false,
  differentialCurrent: false,
  measureReference: false,

  updatedAt: 1,
};


// stateReducer
export const stateReducer = (state = defaultStateSettings, action : any = {}) => {
  switch (action.type) {
    case 'STATE_UPDATE':
      if (action.data) {
        let newState = {...state} as crownstoneState;

        newState.connected             = update(action.data.connected,             newState.connected);
        newState.simulated             = update(action.data.simulated,             newState.simulated);
        newState.name                  = update(action.data.name,                  newState.name);
        newState.macAddress            = update(action.data.macAddress,            newState.macAddress);
        newState.mode                  = update(action.data.mode,                  newState.mode);
        newState.meshEnabled           = update(action.data.meshEnabled,           newState.meshEnabled);
        newState.advertisementsEnabled = update(action.data.advertisementsEnabled, newState.advertisementsEnabled);
        newState.radioEnabled          = update(action.data.radioEnabled,          newState.radioEnabled);
        newState.relayEnabled          = update(action.data.relayEnabled,          newState.relayEnabled);
        newState.igbtState             = update(action.data.igbtState,             newState.igbtState);

        newState.voltageRange          = update(action.data.voltageRange,          newState.voltageRange);
        newState.currentRange          = update(action.data.currentRange,          newState.currentRange);
        newState.differentialVoltage   = update(action.data.differentialVoltage,   newState.differentialVoltage);
        newState.differentialCurrent   = update(action.data.differentialCurrent,   newState.differentialCurrent);
        newState.measureReference      = update(action.data.measureReference,      newState.measureReference);

        newState.updatedAt             = update(action.data.updatedAt,             newState.updatedAt);
        return newState;
      }
      return state;
    default:
      return state;
  }
};
