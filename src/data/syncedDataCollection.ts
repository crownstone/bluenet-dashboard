import {eventBus} from "../util/EventBus";

class SyncedDataCollection {

  bufferCollectionLimit = 25;
  bufferSize = 100;

  data = [];
  averageData = [];
  sampleCounter = 0;
  bufferCounter = 0;
  accumulatedDrift = 0;

  recordedData = [];
  recordingSampleCounter = 0;
  recordingBufferCounter = 0;
  recordingAccumulatedDrift = 0;

  lastTime = null;
  groupName = null;

  hasDataset = false;
  targetDatasets = {};

  recordingToBuffer = false;
  recordingToDisk = false;

  unsub = null;

  constructor(groupname) {
    this.groupName = groupname;

    this.unsub = eventBus.on("ADC_RESET_RECEIVED", () => {
      if (this.recordingToDisk) {
        this.recordedData.push([this.recordingSampleCounter + this.recordingAccumulatedDrift, "ADC_RESET"]);
      }
    })
  }

  destroy() {
    this.targetDatasets = {};
    this.clearData();
    this.unsub();
  }

  recordToDisk() {
    this.recordingToDisk = true;
    this.recordedData = [];
    for (let i = 0; i < this.data.length; i++) {
      this.recordedData.push([this.data[i].x, this.data[i].y])
    }
    this.recordingSampleCounter = this.sampleCounter;
    this.recordingBufferCounter = this.bufferCounter;
    this.recordingAccumulatedDrift = this.accumulatedDrift;
  }

  stopRecordingToDisk() {
    this.recordingToDisk = false;
  }

  clearRecordedData() {
    this.recordedData = []
    this.recordingSampleCounter = 0;
    this.recordingBufferCounter = 0;
    this.recordingAccumulatedDrift = 0;
  }

  setDatasetTarget(dataset, datasetId) {
    this.targetDatasets[datasetId] = dataset;
    this.targetDatasets[datasetId].clear();
    this.hasDataset = true;
  }

  removeDatasetTarget(datasetId) {
    delete this.targetDatasets[datasetId];

    if (Object.keys(this.targetDatasets).length === 0) {
      this.hasDataset = false;
    }
  }

  /**
   * @param data { timestamp: 1234, data: [x,x,x,x,x,x]
   */
  loadData(data) {
    if (this.lastTime === null) {
      this.lastTime = data.timestamp;
    }

    let globals = (window as any);
    let multiplicationFactor = globals.MULTIPLICATION_FACTOR;
    let conversion = function(val) { return val * multiplicationFactor;}
    let pinMultiplier = 1;

    if (globals.VIEW_MODE === "Voltage" || globals.VIEW_MODE === "Amperage") {
      if (globals.___DIFFERENTIAL !== null) {
        if (globals.VIEW_MODE === "Amperage" && globals.___PIN && globals.PIN_MULTIPLIERS[globals.___PIN]) {
          pinMultiplier = globals.PIN_MULTIPLIERS[globals.___PIN] * globals.SHUNT_RESISTANCE;
        }

        if (globals.___DIFFERENTIAL === true) {
          conversion = function (val) {
            return 1.2 + ((val / 2047) * (Number(globals.___RANGE) * 0.001) * multiplicationFactor * pinMultiplier);
          }
        }
        else {
          conversion = function (val) {
            return (val / 4096) * (Number(globals.___RANGE) * 0.001) * multiplicationFactor * pinMultiplier;
          }
        }
      }
    }



    let timeFactor = 5; // convert smallest used value to millis
    let samplePeriodMs = 200e-6 * 1000 * timeFactor; // 0.2 ms ==> with factor this becomes 1 ms
    let timeSampleClockPeriodMs = timeFactor * 1000/32768; // 32768 Hz ~= 0.03051 ms ==> with factor this becomes 0.1525 ms;

    let dtRaw = data.timestamp - this.lastTime;
    let timeOffset = 0;
    if (dtRaw !== 0) {
      timeOffset = Math.max(0,dtRaw * timeSampleClockPeriodMs - this.bufferSize * samplePeriodMs);
      this.accumulatedDrift += timeOffset;
      this.recordingAccumulatedDrift += timeOffset;
    }

    this.lastTime = data.timestamp;
    let average = 0;
    let minVal = 1e9;
    let maxVal = -1e9;
    let startSampleCounter = this.sampleCounter;
    let endSampleCounter = this.sampleCounter;
    if (globals.SHOW_AVERAGES == true) {
      for (let i = 0; i < data.data.length; i++) {
        average += data.data[i];
        minVal = Math.min(minVal, data.data[i])
        maxVal = Math.max(maxVal, data.data[i])
      }
      average = average / data.data.length;
    }

    for (let i = 0; i < data.data.length; i++) {
      this.data[this.sampleCounter] = {id: this.groupName+this.sampleCounter, x: this.sampleCounter + this.accumulatedDrift, y: conversion(data.data[i]), group: this.groupName};
      // // recording data to disk:
      if (this.recordingToDisk) {
        this.recordedData.push([this.recordingSampleCounter + this.recordingAccumulatedDrift, data.data[i]]);
        if (this.recordingSampleCounter % 200 === 0) {
          let datasetIds = Object.keys(this.targetDatasets);
          for (let i = 0; i < datasetIds.length; i++) {
            eventBus.emit("RecordingCycleAdded_" + datasetIds[i], this.recordingSampleCounter)
          }
        }
        this.recordingSampleCounter++;
      }
      this.sampleCounter++;
    }

    if ((window as any).SHOW_AVERAGES == true) {
      endSampleCounter = this.sampleCounter;
      let sampleIndex = 0.5*(startSampleCounter + endSampleCounter);
      this.averageData.push({id: this.groupName  +"_average" + sampleIndex,
        x: sampleIndex + this.accumulatedDrift,
        y: conversion(average),
        group: this.groupName + "_average"
      });
      this.averageData.push({id: this.groupName+"_min" + sampleIndex,
        x: sampleIndex + this.accumulatedDrift,
        y: conversion(minVal),
        group: this.groupName + "_min"
      });
      this.averageData.push({id: this.groupName+"_max" + sampleIndex,
        x: sampleIndex + this.accumulatedDrift,
        y: conversion(maxVal),
        group: this.groupName + "_max"
      });
      this.averageData.push({id: this.groupName+"_mid" + sampleIndex,
        x: sampleIndex + this.accumulatedDrift,
        y: conversion(0.5*(minVal+maxVal)),
        group: this.groupName + "_mid"
      });
    }

    this.bufferCounter++;

    if (this.recordingToBuffer === false) {
      if (this.bufferCounter > this.bufferCollectionLimit) {
        this.updateDatasets();
        this.clearData();
      }
    }
    else {
      if (this.sampleCounter % 200 === 0) {
        let datasetIds = Object.keys(this.targetDatasets);
        for (let i = 0; i < datasetIds.length; i++) {
          eventBus.emit("RecordingCycleAdded_" + datasetIds[i], this.sampleCounter)
        }
      }
    }
  }

  updateDatasets() {
    let datasetIds = Object.keys(this.targetDatasets);
    for (let i = 0; i < datasetIds.length; i++) {
      this.targetDatasets[datasetIds[i]].update(this.data);
      if ((window as any).SHOW_AVERAGES == true) {
        this.targetDatasets[datasetIds[i]].update(this.averageData);
      }
    }
  }

  clearData() {
    this.data = [];
    this.lastTime = null;
    this.sampleCounter = 0;
    this.bufferCounter = 0;
    this.accumulatedDrift = 0;
  }

  clearAllData() {
    let datasetIds = Object.keys(this.targetDatasets);
    for (let i = 0; i < datasetIds.length; i++) {
      this.targetDatasets[datasetIds[i]].clear()
    }

    this.clearData();
  }


}


export { SyncedDataCollection }