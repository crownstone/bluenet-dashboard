

import {eventBus} from "../util/EventBus";
import store from "../router/store/store";
import {DataStore} from "../data/dataStore";

class ProtocolBackendToFrontendClass {
  constructor() {

  }

  subscribe() {
    eventBus.on("receivedMessage", (message) => { this._translate(message); })
  }


  /**
   * All store fields can be found in ../router/reducers/switchState.ts
   * @param message { timestamp: number, type: string, data: {} }
   * @private
   */
  _translate(message) {
    let messageObj = message;
    if (typeof message === 'string') {
      messageObj = JSON.parse(message);
    }

    // handle any special cases.
    switch (messageObj.type) {
      case 'setRelay':
        store.dispatch({type:'STATE_UPDATE', data: {relayEnabled: true }}); // TODO: match messageObj.data to the value which is set to true.
        break;
      case 'setAdvertisements':
        store.dispatch({type:'STATE_UPDATE', data: {advertisementsEnabled: true }}); // TODO: match messageObj.data to the value which is set to true.
        break;
      case 'setMesh':
        store.dispatch({type:'STATE_UPDATE', data: {meshEnabled: true }}); // TODO: match messageObj.data to the value which is set to true.
        break;
      case 'setIGBT':
        store.dispatch({type:'STATE_UPDATE', data: {igbtState: true }}); // TODO: match messageObj.data to the value which is set to true.
        break;
      case 'setVoltageRange':
        store.dispatch({type:'STATE_UPDATE', data: {voltageRange: true }}); // TODO: match messageObj.data to the value which is set to true.
        break;
      case 'setCurrentRange':
        store.dispatch({type:'STATE_UPDATE', data: {currentRange: true }}); // TODO: match messageObj.data to the value which is set to true.
        break;
      case 'setVoltageDifferential':
        store.dispatch({type:'STATE_UPDATE', data: {differentialVoltage: true }}); // TODO: match messageObj.data to the value which is set to true.
        break;
      case 'setCurrentDifferential':
        store.dispatch({type:'STATE_UPDATE', data: {differentialCurrent: true }}); // TODO: match messageObj.data to the value which is set to true.
        break;
      case 'toggleMeasurementChannel':
        store.dispatch({type:'STATE_UPDATE', data: {measureReference: true }}); // TODO: match messageObj.data to the value which is set to true.
        break;
      case 'currentData':
      case 'voltageData':
      case 'advertisementData':
        DataStore.translateIncomingData(messageObj);
        break;

    }
  }
}

export const ProtocolBackendToFrontend = new ProtocolBackendToFrontendClass();