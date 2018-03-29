import * as visjs from "vis"
import {eventBus} from "../util/EventBus";
import {SyncedDataManager} from "./syncedDataManager";

const vis = (visjs as any);

// let testData = [
//   {x: '2014-06-11', y: 10},
//   {x: '2014-06-12', y: 25},
//   {x: '2014-06-13', y: 30},
//   {x: '2014-06-14', y: 10},
//   {x: '2014-06-15', y: 15},
//   {x: '2014-06-16', y: 30}
// ];


class DataStoreClass {


  switchState       = new vis.DataSet();
  temperature       = new vis.DataSet();
  advErrors         = new vis.DataSet();
  powerUsage        = new vis.DataSet();
  accumulatedEnergy = new vis.DataSet();
  advertisements    = new vis.DataSet();
  iBeacon           = new vis.DataSet();

  groups            = new vis.DataSet();

  bufferCollectionLength = 25;
  bufferCount = 100


  paused = false;
  recordingToBuffer = false;
  recordingToDisk = false;

  recordToDiskData : any = {};


  syncedDataManager = new SyncedDataManager();



  constructor() {
    // fill the databuffer with empty data.
    this._clearRecordedDataBuffer()

    this.groups.add({
      id: 'current',
      content:"Current (RAW)",
      className:'currentGraphStyle',
      options: {
        drawPoints: { size:2, style: 'circle'},
        shaded: {
          orientation: 'bottom' // top, bottom
        }
      }});

    this.groups.add({
      id: 'voltage',
      content:"Voltage (RAW)",
      className:'voltageGraphStyle',
      options: {
        drawPoints: { size:2, style: 'circle'},
        shaded: {
          orientation: 'bottom' // top, bottom
        }
      }});

    this.groups.add({
      id: 'switchState',
      content: "SwitchState From Advertisements",
      className:'switchStateGraphStyle',
      options: {
        drawPoints: {size: 4, style:'circle'},
        shaded: {
          orientation: 'bottom' // top, bottom
        }
      }});

    this.groups.add({
      id: 'temperature',
      content: "Chip temperature",
      className:'temperatureGraphStyle',
      options: {
        drawPoints: {size: 3, style:'circle'},
        shaded: {
          orientation: 'bottom' // top, bottom
        }
      }});

    this.groups.add({
      id: 'powerUsage',
      content: "Power Usage (real: W)",
      className:'powerUsageGraphStyle',
      options: {
        drawPoints: {size: 3, style:'circle'},
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


    eventBus.on("PauseFeed",      () => { this.paused = true;  })
    eventBus.on("ResumeFeed",     () => { this.paused = false; })
    eventBus.on("StartRecordingToDisk", () => { this.recordingToDisk = true; })
    eventBus.on("StopRecordingToDisk", () => {
      this.recordingToDisk = false;
      this.syncedDataManager.stopRecordingToDisk();

      let topics = Object.keys(this.syncedDataManager.topicGroupMap);

      topics.forEach((topic) => {
        if (this.syncedDataManager.dataCollections[topic]) {
          this.recordToDiskData[this.syncedDataManager.topicGroupMap[topic]] = this.syncedDataManager.dataCollections[topic].recordedData;
        }
      })

      let zeroPad = (i) => {
        let nrI = Number(i)
        if (nrI < 10) {
          return '0'+i;
        }
        return i
      }

      // download data:
      var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.recordToDiskData, undefined, 2));
      var dlAnchorElem = document.getElementById('downloadAnchorElem');
      dlAnchorElem.setAttribute("href",     dataStr     );
      let fileDate = new Date().getFullYear() + '-' +
        zeroPad(new Date().getMonth() +1)+ '-' +
        zeroPad(new Date().getDate()) + '_' +
        zeroPad(new Date().getHours()) + ':' +
        zeroPad(new Date().getMinutes()) + ':' +
        zeroPad(new Date().getSeconds());
      let filename = fileDate + "_DashboardData.json";
      dlAnchorElem.setAttribute("download", filename);
      dlAnchorElem.setAttribute("target", "_blank");
      dlAnchorElem.click();

      // clear memory buffer
      this._clearRecordedDataBuffer();
      this.syncedDataManager.clearRecordedData()

    })
  }

  _clearRecordedDataBuffer() {
    this.recordToDiskData = {
      switchState: [],
      powerUsage: [],
      temperature: [],
      voltage: [],
      current: [],
      filteredVoltage: [],
      filteredCurrent: [],
      legend:{
        switchState: '[t(ms), value]',
        powerUsage: '[t(ms), value (W)]',
        temperature: '[t(ms), value (C) ]',
        voltage: '[t(ms)*5 with t0 when recording started, value]',
        current: '[t(ms)*5 with t0 when recording started, value]',
        filteredVoltage: '[t(ms)*5 with t0 when recording started, value]',
        filteredCurrent: '[t(ms)*5 with t0 when recording started, value]',
      }
    };
  }


  /**
   * @param message { topic: string, data: { timestamp: xxxx, data: [x,x,x,x,x]}}
   * @private
   */
  translateIncomingData(message) {
    switch (message.topic) {
      case 'newCurrentData':
      case 'newVoltageData':
      case 'newFilteredCurrentData':
      case 'newFilteredVoltageData':
        this.syncedDataManager.loadDataChannel(message)
    }

    if (this.paused) { return; }


    switch (message.topic) {
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
    if (this.paused) { return; }

    // recording data to disk:
    let time = new Date().valueOf();
    if (this.recordingToDisk) {
      this.recordToDiskData.switchState.push([time, message.data.switchState]);
      this.recordToDiskData.temperature.push([time, message.data.temperature]);
      this.recordToDiskData.powerUsage.push([time, message.data.powerUsageReal]);
    }


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
    this.powerUsage.add({
      x: time,
      y: message.data.powerUsageReal,
      group: 'powerUsage'
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