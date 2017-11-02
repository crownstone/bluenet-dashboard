import * as visjs from "vis"
import {eventBus} from "../util/EventBus";

const vis = (visjs as any);

let testData = [
  // {x: '2014-06-11', y: 10},
  // {x: '2014-06-12', y: 25},
  // {x: '2014-06-13', y: 30},
  // {x: '2014-06-14', y: 10},
  // {x: '2014-06-15', y: 15},
  // {x: '2014-06-16', y: 30}
];


class DataStoreClass {
  switchState       = new vis.DataSet(testData);
  temperature       = new vis.DataSet(testData);
  voltage           = new vis.DataSet(testData);
  current           = new vis.DataSet(testData);
  advErrors         = new vis.DataSet(testData);
  powerUsage        = new vis.DataSet(testData);
  accumulatedEnergy = new vis.DataSet(testData);
  advertisements    = new vis.DataSet(testData);
  iBeacon           = new vis.DataSet(testData);

  constructor() {

  }


  /**
   * @param message { timestamp: number, type: string, data: {} }
   * @private
   */
  translateIncomingData(message) {
    // handle any special cases.
    switch (message.type) {
      case 'currentData':
        // this.current.add( /**data**/ );
        break;
      case 'voltageData':
        // this.voltage.add( /**data**/ );
        break;
      case 'advertisementData':
        this._parseAdvertisement(message);
        break;

    }
  }


  /**
   * Parse the advertisement data
   * @param message {
   *   timestamp: number,
   *   type: 'advertisementData',
   *   data: {
   *     switchState: number,
   *     temperature: number,
   *     errors: number,
   *     powerUsage: number,
   *     accumulatedEnergy: number,
   *     advertisementType: 'DFU' | 'REGULAR' | 'SETUP',
   *   }
   * }
   * @private
   */
  _parseAdvertisement( message ) {
    this.switchState.add({
      x: message.timestamp,
      y: message.data.switchState
    });
    this.temperature.add({
      x: message.timestamp,
      y: message.data.temperature
    });
    this.advErrors.add({
      x: message.timestamp,
      y: message.data.errors
    });
    this.powerUsage.add({
      x: message.timestamp,
      y: message.data.powerUsage
    });
    this.accumulatedEnergy.add({
      x: message.timestamp,
      y: message.data.accumulatedEnergy
    });
    this.advertisements.add({
      x: message.timestamp,
      y: 1,
      group: message.data.advertisementType
    });
  }
}

export const DataStore = new DataStoreClass();