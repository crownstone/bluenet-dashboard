import {update} from "../util/reducerUtil";

export let defaultStateSettings : crownstoneState = {
  connected: false,
  simulated: false,
  name: null,
  macAddress: null,
  mode: 'UNKNOWN',  // "SETUP" | "NORMAL" | "DFU" | "UNKNOWN"
  radioOn: false,
  meshEnabled: false,
  relayOn: false,
  igbtState: 0,
  updatedAt: 1,
};


// stateReducer
export const stateReducer = (state = defaultStateSettings, action : any = {}) => {
  switch (action.type) {
    case 'STATE_UPDATE':
      if (action.data) {
        let newState = {...state};

        newState.connected   = update(action.data.connected,   newState.connected);
        newState.simulated   = update(action.data.simulated,   newState.simulated);
        newState.name        = update(action.data.name,        newState.name);
        newState.macAddress  = update(action.data.macAddress,  newState.macAddress);
        newState.mode        = update(action.data.mode,        newState.mode);
        newState.meshEnabled = update(action.data.meshEnabled, newState.meshEnabled);
        newState.radioOn     = update(action.data.radioOn,     newState.radioOn);
        newState.relayOn     = update(action.data.relayOn,     newState.relayOn);
        newState.igbtState   = update(action.data.igbtState,   newState.igbtState);

        newState.updatedAt   = update(action.data.updatedAt, newState.updatedAt);
        return newState;
      }
      return state;
    default:
      return state;
  }
};
