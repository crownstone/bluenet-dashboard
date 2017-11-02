

import {eventBus} from "../util/EventBus";

class ProtocolFrontendToBackendClass {
  constructor() {

  }

  subscribe() {
    eventBus.on("command", (data) => { this._translate(data); })
  }


  /**
   * This has the format of:
   * @param data { type: 'string', value: 'value' }
   * @private
   */
  _translate(data) {
    let outgoingMessage = {
      timestamp: new Date().valueOf(),
      type: data.type,
      data: { value: data.value}
    };


    // handle any special cases.
    switch (data.type) {
      case 'setRelay':

        break;
      case 'setAdvertisements':

        break;
      case 'setMesh':

        break;
      case 'setIGBT':

        break;
      case 'setVoltageRange':

        break;
      case 'setCurrentRange':

        break;
      case 'setVoltageDifferential':

        break;
      case 'setCurrentDifferential':

        break;
      case 'toggleMeasurementChannel':

        break;
      case 'reset':

        break;

    }

    eventBus.emit("sendOverWebSocket", outgoingMessage);
  }
}

export const ProtocolFrontendToBackend = new ProtocolFrontendToBackendClass();