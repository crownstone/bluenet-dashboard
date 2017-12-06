

import {eventBus} from "../util/EventBus";
import store from "../router/store/store";
import {DataStore} from "../data/dataStore";

class ProtocolBackendToFrontendClass {
  count = 0


  constructor() {

  }

  subscribe() {
    console.log("SUBBED")
    eventBus.on("receivedMessage", (message) => { this._translate(message); })
  }


  /**
   * All store fields can be found in ../router/reducers/switchState.ts
   * @param message { timestamp: number, type: string, data: {} }
   * @private
   */
  _translate(message) {
    console.log("GOT MESSAGE", message, this.count++);
    let messageObj = message;
    if (typeof message === 'string') {
      try {
        messageObj = JSON.parse(message);
      }
      catch(err) {}

    }

    let data = messageObj.data;

    // handle any special cases.
    switch (messageObj.type) {
      case 'getName':
        store.dispatch({type:'STATE_UPDATE', data: {name: data.value }}); // TODO: match messageObj.data to the value which is set to true.
        break;
      case 'getMacAddress':
        store.dispatch({type:'STATE_UPDATE', data: {macAddress: data.value }});
        break;
      case 'setMode':
        store.dispatch({type:'STATE_UPDATE', data: {mode: data.value }});
        break;
      case 'setRelay':
        store.dispatch({type:'STATE_UPDATE', data: {relayEnabled: data.value }}); // TODO: match messageObj.data to the value which is set to true.
        break;
      case 'setAdvertisements':
        store.dispatch({type:'STATE_UPDATE', data: {advertisementsEnabled: data.value }}); // TODO: match messageObj.data to the value which is set to true.
        break;
      case 'setMesh':
        store.dispatch({type:'STATE_UPDATE', data: {meshEnabled: data.value }}); // TODO: match messageObj.data to the value which is set to true.
        break;
      case 'setIGBT':
        store.dispatch({type:'STATE_UPDATE', data: {igbtState: data.value }}); // TODO: match messageObj.data to the value which is set to true.
        break;
      case 'setVoltageRange':
        store.dispatch({type:'STATE_UPDATE', data: {voltageRange: data.value }}); // TODO: match messageObj.data to the value which is set to true.
        break;
      case 'setCurrentRange':
        store.dispatch({type:'STATE_UPDATE', data: {currentRange: data.value }}); // TODO: match messageObj.data to the value which is set to true.
        break;
      case 'setVoltageDifferential':
        store.dispatch({type:'STATE_UPDATE', data: {differentialVoltage: data.value }}); // TODO: match messageObj.data to the value which is set to true.
        break;
      case 'setCurrentDifferential':
        store.dispatch({type:'STATE_UPDATE', data: {differentialCurrent: data.value }}); // TODO: match messageObj.data to the value which is set to true.
        break;
      case 'toggleMeasurementChannel':
        store.dispatch({type:'STATE_UPDATE', data: {measureReference: data.value }}); // TODO: match messageObj.data to the value which is set to true.
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