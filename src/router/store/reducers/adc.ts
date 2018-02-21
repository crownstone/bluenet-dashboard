import {update} from "../util/reducerUtil";

export let defaultADCSettings = {
  amountOfChannels: undefined,
  samplingPeriod: undefined,
  voltage: {
    pin:undefined,
    range: undefined,
    refPin: undefined,
    channelIndex:undefined,
  },
  current: {
    pin:undefined,
    range: undefined,
    refPin: undefined,
    channelIndex:undefined,
  },
  updatedAt: undefined,
};


// stateReducer
export const adcConfigReducer = (state = defaultADCSettings, action : any = {}) => {
  switch (action.type) {
    case 'ADC_CONFIG_UPDATE':
      if (action.data) {
        let newState = {...state} as any;

        newState.amountOfChannels             = update(action.data.amountOfChannels,             newState.amountOfChannels);
        newState.samplingPeriod             = update(action.data.samplingPeriod,             newState.samplingPeriod);

        newState.voltage = {} as any;
        newState.current = {} as any;

        newState.voltage.pin          = update(action.data.channels.voltage.pin,          newState.voltage.pin);
        newState.voltage.range        = update(action.data.channels.voltage.range,        newState.voltage.range);
        newState.voltage.refPin       = update(action.data.channels.voltage.refPin,       newState.voltage.refPin);
        newState.voltage.channelIndex = update(action.data.channels.voltage.channelIndex, newState.voltage.channelIndex);

        newState.current.pin          = update(action.data.channels.current.pin,          newState.current.pin);
        newState.current.range        = update(action.data.channels.current.range,        newState.current.range);
        newState.current.refPin       = update(action.data.channels.current.refPin,       newState.current.refPin);
        newState.current.channelIndex = update(action.data.channels.current.channelIndex, newState.current.channelIndex);

        newState.updatedAt             = update(action.data.updatedAt,             newState.updatedAt);
        
        return newState;
      }
      return state;
    default:
      return state;
  }
};

