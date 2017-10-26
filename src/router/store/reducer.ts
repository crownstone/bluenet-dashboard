import {defaultStateSettings, stateReducer } from './reducers/state'


const defaultValue : dashboardState = {
  state: defaultStateSettings,
};

export default (state: dashboardState = defaultValue, action: any = {}) => {
  if (action.type === 'CLEAR_STORE') {
    state = defaultValue;
  }
  else if (action.type === 'HYDRATE') {
    state = action.state;
  }

  return {
    state: stateReducer(state.state, action)
  }
};