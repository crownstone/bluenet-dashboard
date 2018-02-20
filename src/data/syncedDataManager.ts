import {SyncedDataCollection} from "./syncedDataCollection";
import {eventBus} from "../util/EventBus";


class SyncedDataManager {

  topicTimestamps = {};
  firstTopic = null;
  synced = false;
  orderedTopics = [];

  dataCollections = {};
  seenChannels = {};
  sequentiallyDroppedMessages = {};

  topicGroupMap = {
    'newCurrentData': 'current',
    'newVoltageData': 'voltage',
    'newFilteredCurrentData': 'filteredCurrent',
    'newFilteredVoltageData': 'filteredVoltage',
  };

  paused = false;


  constructor() {
    eventBus.on("PauseFeed",            () => { this.paused = true;  });
    eventBus.on("ResumeFeed",           () => { this.paused = false; this._execOnData((d) => { d.clearAllData(); }) });
    eventBus.on("StartRecording",       () => { this.paused = false; this._execOnData((d) => { d.recordingToBuffer = true})});
    eventBus.on("StartRecordingToDisk", () => { this._execOnData((d) => { d.recordToDisk();  })});
    eventBus.on("StopRecording",        () => { this.paused = true; this._execOnData((d) => { d.recordingToBuffer = false; d.updateDatasets();})});
    eventBus.on("StopRecordingToDisk",  () => { /* nothing, this will be done by the datastore */ });

    eventBus.on("RequestData", (data) => {
      if (this.dataCollections[data.topic] === undefined) {
        this.dataCollections[data.topic] = new SyncedDataCollection(this.topicGroupMap[data.topic]);
      }

      this.dataCollections[data.topic].setDatasetTarget(data.dataset, data.datasetId);
    });

    eventBus.on("ReleaseData", (data) => {
      if (this.dataCollections[data.topic] !== undefined) {
        this.dataCollections[data.topic].removeDatasetTarget();
      }
    });
  }

  stopRecordingToDisk() {
    this._execOnData((d) => { d.stopRecordingToDisk(); });
  }


  clearRecordedData() {
    this._execOnData((d) => { d.clearRecordedData(); });
  }

  _execOnData(callback) {
    let datakeys = Object.keys(this.dataCollections);
    for (let i = 0; i < datakeys.length; i++) {
      callback(this.dataCollections[datakeys[i]])
    }
  }

  loadDataChannel(data) {
    // collect start timestamps.
    this.seenChannels[data.topic] = true;

    if (this.topicTimestamps[data.topic] === undefined) {
      this.topicTimestamps[data.topic] = data.data.timestamp;
      this.orderedTopics.push(data.topic);
    }
    else {
      if (!this.firstTopic) {
        this.firstTopic = data.topic;
      }
      else if (this.firstTopic === data.topic) {
        this.sync();
        this.validate();
      }

      this.topicTimestamps[data.topic] = data.data.timestamp;
    }

    if (this.dataCollections[data.topic] === undefined) {
      this.dataCollections[data.topic] = new SyncedDataCollection(this.topicGroupMap[data.topic]);
    }


    if (this.paused === false) {
      if (this.synced) {
        this.dataCollections[data.topic].loadData(data.data);
      }
      else {
        this.dataCollections[data.topic].clearData();
      }
    }
  }

  validate() {
    for (let i = 0; i < this.orderedTopics.length; i++) {
      if (!this.seenChannels[this.orderedTopics[i]]) {
        this.sequentiallyDroppedMessages[this.orderedTopics[i]] = 1 + (this.sequentiallyDroppedMessages[this.orderedTopics[i]] || 0)
      }
      else {
        this.sequentiallyDroppedMessages[this.orderedTopics[i]] = 0;
      }
    }

    for (let i = 0; i < this.orderedTopics.length; i++) {
      if (this.sequentiallyDroppedMessages[this.orderedTopics[i]] > 5) {
        console.log("REMOVING ", this.orderedTopics[i], " from synced data manager")
        this._deleteData(this.orderedTopics[i]);
        break;
      }
    }

    this.seenChannels = {};
  }

  _deleteData(topic) {
    let index = this.orderedTopics.indexOf(topic);
    this.orderedTopics.splice(index,1);

    delete this.topicTimestamps[topic]
    if (this.firstTopic === topic) {
      this.firstTopic = null;
    }

    delete this.sequentiallyDroppedMessages[topic];
    if (this.dataCollections[topic]) {
      this.dataCollections[topic].destroy();
    }
    delete this.dataCollections[topic];

    this.synced = false;
  }


  sync() {
    if (this.orderedTopics.length === 1) {
      this.synced = true;
      return;
    }

    let firstIndex = this.orderedTopics.indexOf(this.firstTopic);
    let timestamp = this.topicTimestamps[this.firstTopic];

    let validate = (i) => {
      let testTopic = this.orderedTopics[i];
      let dt = timestamp - this.topicTimestamps[testTopic]; // assuming the next one is newer, we get a negative sign
      timestamp = this.topicTimestamps[testTopic]

      if (!this.synced) {
        console.log(i, "Starting with ", this.firstTopic, " dt=", dt, ' with ', testTopic, timestamp)
      }

      // we expect a dt of -300.
      if (dt < -500 || dt > 0) {
        console.log("dt is too large", dt, 'clearing first')
        this.firstTopic = null;
        this.synced = false;
        return true;
      }
    }

    let abort = false;

    for (let i = firstIndex; i < this.orderedTopics.length; i++) {
      if (validate(i)) {
        abort = true;
        break;
      }
    }

    if (abort) { return; }

    for (let i = 0; i < firstIndex; i++) {
      if (validate(i)) {
        abort = true;
        break;
      }
    }

    if (abort) { return }

    this.synced = true;
  }


}

export { SyncedDataManager }