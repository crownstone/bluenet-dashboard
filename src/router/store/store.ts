import { createStore, combineReducers } from 'redux'
import dashboardReducer from './reducer'

export default createStore(dashboardReducer);