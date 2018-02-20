import {eventBus} from "../util/EventBus";

class SyncedDataCollection {

  bufferCollectionLimit = 25;
  bufferSize = 100;

  data = [];
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

  constructor(groupname) {
    this.groupName = groupname;
  }

  destroy() {
    this.targetDatasets = {};
    this.clearData();
  }

  recordToDisk() {
    this.recordingToDisk = true;
    this.recordedData = [];
    for (let i = 0; i < this.data.length; i++) {
      this.recordedData.push(this.data[i])
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

    let timeFactor = 5; // convert smallest used value to millis
    let samplePeriodMs = 200e-6 * 1000 * timeFactor; // 0.2 ms ==> with factor this becomes 1 ms
    let timeSampleClockPeriodMs = timeFactor * 1000/32768; // 32768 Hz ~= 0.03051 ms ==> with factor this becomes 0.1525 ms;

    let dtRaw = data.timestamp - this.lastTime;
    let timeOffset = 0;
    if (dtRaw !== 0) {
      timeOffset = dtRaw * timeSampleClockPeriodMs - this.bufferSize * samplePeriodMs;
      this.accumulatedDrift += timeOffset;
      this.recordingAccumulatedDrift += timeOffset;
    }

    this.lastTime = data.timestamp;

    for (let i = 0; i < data.data.length; i++) {
      this.data[this.sampleCounter] = {id: this.groupName+this.sampleCounter, x: this.sampleCounter + this.accumulatedDrift, y: data.data[i], group: this.groupName};
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