import * as visjs from "vis"
import {eventBus} from "../util/EventBus";

const vis = (visjs as any);

// let testData = [
//   {x: '2014-06-11', y: 10},
//   {x: '2014-06-12', y: 25},
//   {x: '2014-06-13', y: 30},
//   {x: '2014-06-14', y: 10},
//   {x: '2014-06-15', y: 15},
//   {x: '2014-06-16', y: 30}
// ];


let THRESHOLD = 150;

class DataStoreClass {
  currentBufferCounter = 0;
  currentSampleCounter = 0;
  currentTimeOffset = 0;
  currentDatasetFormat = [];
  currentLastTime = null;

  voltageLastTime = null;
  voltageTimeOffset = 0;
  voltageBufferCounter = 0;
  voltageSampleCounter = 0;
  voltageDatasetFormat = [];


  switchState       = new vis.DataSet();
  temperature       = new vis.DataSet();
  voltage           = new vis.DataSet();
  current           = new vis.DataSet();
  advErrors         = new vis.DataSet();
  powerUsage        = new vis.DataSet();
  accumulatedEnergy = new vis.DataSet();
  advertisements    = new vis.DataSet();
  iBeacon           = new vis.DataSet();

  groups            = new vis.DataSet();

  constructor() {
    this.groups.add({
      id: 'switchState',
      className:'switchStateGraphStyle',
      options: {
        drawPoints: true,
        shaded: {
          orientation: 'bottom' // top, bottom
        }
      }});

    this.groups.add({
      id: 'temperature',
      className:'temperatureGraphStyle',
      options: {
        drawPoints: true,
        shaded: {
          orientation: 'bottom' // top, bottom
        }
      }});

    this.groups.add({
      id: 'powerUsage',
      className:'powerUsageGraphStyle',
      options: {
        drawPoints: false,
        shaded: {
          orientation: 'bottom' // top, bottom
        }
      }});

    this.groups.add({
      id: '__ungrouped__',
      className:'defaultGraphStyle',
      options: {
        drawPoints: false,
        shaded: {
          orientation: 'bottom' // top, bottom
        }
      }});

  }


  /**
   * @param message { timestamp: number, type: string, data: {} }
   * @private
   */
  translateIncomingData(message) {
    // handle any special cases.
    let timeFactor = 5/32768
    switch (message.topic) {
      case 'newCurrentData':
        let newTimestamp = message.data.timestamp
        if (this.currentLastTime === null) {
          this.currentLastTime = newTimestamp;
        }

        this.currentTimeOffset = newTimestamp - this.currentLastTime;
        if (this.currentTimeOffset < 0) {
          this.currentTimeOffset += 0x00FFFFFF
        }

        for (let i = 0; i < message.data.data.length; i++) {
          this.currentDatasetFormat[this.currentSampleCounter] = {id: this.currentSampleCounter, x: this.currentSampleCounter + this.currentTimeOffset*timeFactor, y: message.data.data[i]}
          this.currentSampleCounter++;
        }
        this.currentBufferCounter++;

        if (this.currentBufferCounter === THRESHOLD) {
          this.current.update(this.currentDatasetFormat);
          this.currentBufferCounter = 0;
          this.currentSampleCounter = 0;
        }

        this.currentLastTime = message.data.timestamp
        break;
      case 'newVoltageData':
        newTimestamp = message.data.timestamp
        if (this.voltageLastTime === null) {
          this.voltageLastTime = newTimestamp;
        }

        this.voltageTimeOffset = newTimestamp - this.voltageLastTime;
        if (this.voltageTimeOffset < 0) {
          this.voltageTimeOffset += 0x00FFFFFF
        }

        for (let i = 0; i < message.data.data.length; i++) {
          this.voltageDatasetFormat[this.voltageSampleCounter] = {id: this.voltageSampleCounter, x: this.voltageSampleCounter + this.voltageTimeOffset*timeFactor, y: message.data.data[i]}
          this.voltageSampleCounter++;
        }
        this.voltageBufferCounter++;

        if (this.voltageBufferCounter === THRESHOLD) {
          this.voltage.update(this.voltageDatasetFormat);
          this.voltageBufferCounter = 0;
          this.voltageSampleCounter = 0;
        }

        this.voltageLastTime = message.data.timestamp
        break;
      case 'newServiceData':
        this._parseAdvertisement(message);
        break;

    }
  }


  /**
   * Parse the advertisement data
   * @param message {
   *   type: 'newServiceData',
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
    let time = new Date().valueOf();
    this.switchState.add({
      x: time,
      y: message.data.switchState,
      group: 'switchState',
    });
    this.temperature.add({
      x: time,
      y: message.data.temperature,
      group: 'temperature',
    });
    this.advErrors.add({
      x: time,
      y: message.data.flagBitmask
    });
    this.powerUsage.add({
      x: time,
      y: message.data.powerUsageReal
    })
    // this.accumulatedEnergy.add({
    //   x: time,
    //   y: message.data.energyUsed
    // });
    // this.advertisements.add({
    //   x: time,
    //   y: message.data.opCode,
    // });

  }
}

export const DataStore = new DataStoreClass();