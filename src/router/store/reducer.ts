import {defaultStateSettings, stateReducer } from './reducers/state'
import {adcConfigReducer, defaultADCSettings} from "./reducers/adc";


const defaultValue : dashboardState = {
  state: defaultStateSettings,
  adc: defaultADCSettings
};

export default (state: dashboardState = defaultValue, action: any = {}) => {
  if (action.type === 'CLEAR_STORE') {
    state = defaultValue;
  }
  else if (action.type === 'HYDRATE') {
    state = action.state;
  }

  return {
    state: stateReducer(state.state, action),
    adc: adcConfigReducer(state.adc, action)
  }
};