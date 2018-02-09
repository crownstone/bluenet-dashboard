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

  voltage           = new vis.DataSet();
  current           = new vis.DataSet();

  filteredVoltage   = new vis.DataSet();
  filteredCurrent   = new vis.DataSet();

  switchState       = new vis.DataSet();
  temperature       = new vis.DataSet();
  advErrors         = new vis.DataSet();
  powerUsage        = new vis.DataSet();
  accumulatedEnergy = new vis.DataSet();
  advertisements    = new vis.DataSet();
  iBeacon           = new vis.DataSet();

  groups            = new vis.DataSet();

  bufferCollectionLength = 20;
  bufferCount = 100

  checkSync = true
  streamOrder = {};

  paused = false;
  recording = false;
  recordedDataPresent = false;


  constructor() {
    this.groups.add({
      id: 'current',
      content:"Current (RAW)",
      className:'currentGraphStyle',
      options: {
        drawPoints: false,
        shaded: {
          orientation: 'bottom' // top, bottom
        }
      }});

    this.groups.add({
      id: 'voltage',
      content:"Voltage (RAW)",
      className:'voltageGraphStyle',
      options: {
        drawPoints: false,
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


    eventBus.on("PauseFeed",      () => { this.paused    = true; })
    eventBus.on("ResumeFeed",     () => {
      console.log("IN RESUME", this.recordedDataPresent)
      if (this.recordedDataPresent) {
        console.log("sadasdIN RESUME", this.recordedDataPresent)
        this.current.clear();
        this.voltage.clear();
        this.recordedDataPresent = false;
        setTimeout(() => { this.paused = false; }, 1000);
      }
      else {
        this.paused = false;
      }
    })
    eventBus.on("StartRecording", () => { this.recording = true; })
    eventBus.on("StopRecording",  () => { this.recording = false;
      this.paused = true;
      this.current.update(this.currentDatasetFormat);
      this.voltage.update(this.voltageDatasetFormat);

      let aLength = this.currentDatasetFormat.length;
      for (let i = this.bufferCollectionLength * this.bufferCount; i < aLength; i++) {
        this.currentDatasetFormat.pop()
      }

      let vLength = this.voltageDatasetFormat.length;
      for (let i = this.bufferCollectionLength * this.bufferCount; i < vLength; i++) {
        this.voltageDatasetFormat.pop()
      }
      console.log("AFTER UPDATE", this.voltageDatasetFormat, this.bufferCollectionLength * this.bufferCount, vLength, aLength)

      this.recordedDataPresent = true;
      this._initCyclicBufferVariables();
    })
  }

  _initCyclicBufferVariables() {
    this.currentBufferCounter = 0;
    this.currentSampleCounter = 0;
    this.currentTimeOffset = 0;
    this.currentLastTime = null;

    this.voltageLastTime = null;
    this.voltageTimeOffset = 0;
    this.voltageBufferCounter = 0;
    this.voltageSampleCounter = 0;
  }

  /**
   * @param message { timestamp: number, type: string, data: {} }
   * @private
   */
  translateIncomingData(message) {
    if (this.paused) { return; }

    // handle any special cases.
    let timeFactor = 5/32768

    switch (message.topic) {
      case 'newCurrentData':
        let newTimestamp = message.data.timestamp
        if (this.currentLastTime === null) {
          this.currentLastTime = newTimestamp;
        }

        if (this.currentBufferCounter === 0) {
          this.streamOrder['newCurrentData'] = newTimestamp;
        }

        if (this.streamOrder['newVoltageData'] !== undefined && this.currentBufferCounter < 2 && this.checkSync === true) {
          this.checkSync = false;
          // start time A - start time V
          let dt = this.streamOrder['newCurrentData'] - this.streamOrder['newVoltageData'];

          // the delay between buffer sending should be about 300 ticks. If it is around 1000 ticks, we are getting them in the wrong order.
          // First we need to know if V is before A:
          // option 1) ...-------- A -300- V ------------1000------------ A -300- V ------...
          // option 2) ...-------- V -300- A ------------1000------------ V -300- A ------...

          // the difference can spike to 1500*this.bufferCollectionLength due to the implementation.
          if (dt < 0 && dt > -1500*0.5*this.bufferCollectionLength) {
            // so we receive A before V.
            if (dt > -500) {
              // this means the Crownstone sends A before V
              console.log("A -> V, A -> V .......... GOOD!")
            }
            else {
              // this means the Crownstone sends A before V --> we need to sync!
              console.log("A -> V, V -> A --> SYNC!")
              this.currentBufferCounter--;
            }
          }
          else if (dt > 0 && dt < 1500*0.5*this.bufferCollectionLength) {
            // so we receive A before V.
            if (dt < 500) {
              // this means the Crownstone sends V before A
              console.log("V -> A, V -> A .......... GOOD")
            }
            else {
              // this means the Crownstone sends A before V --> we need to sync!
              console.log("V -> A, A -> V --> SYNC!")
              this.currentBufferCounter++;
            }
          }
          // console.log("aStart is this much later than vStart", dt)
        }

        this.currentTimeOffset = newTimestamp - this.currentLastTime;
        if (this.currentTimeOffset < 0) {
          this.currentTimeOffset += 0x00FFFFFF
        } 

        for (let i = 0; i < message.data.data.length; i++) {
          this.currentDatasetFormat[this.currentSampleCounter] = {id: this.currentSampleCounter, x: this.currentSampleCounter + this.currentTimeOffset*timeFactor, y: message.data.data[i], group: 'current'}
          this.currentSampleCounter++;
        }
        this.currentBufferCounter++;


        if (this.recording === false) {
          if (this.currentBufferCounter >= this.bufferCollectionLength) {
            this.current.update(this.currentDatasetFormat);
            this.currentBufferCounter = 0;
            this.currentSampleCounter = 0;
            this.checkSync = true;
          }
        }
        else {
          if (this.currentBufferCounter % 0.25*this.bufferCollectionLength === 0) {
            eventBus.emit("RecordingCycleAdded_current", this.currentDatasetFormat.length);
          }
        }

        this.currentLastTime = message.data.timestamp
        break;
      case 'newVoltageData':
        newTimestamp = message.data.timestamp
        if (this.voltageLastTime === null) {
          this.voltageLastTime = newTimestamp;
        }

        if (this.voltageBufferCounter === 0) {
          this.streamOrder['newVoltageData'] = newTimestamp;
        }

        this.voltageTimeOffset = newTimestamp - this.voltageLastTime;
        if (this.voltageTimeOffset < 0) {
          this.voltageTimeOffset += 0x00FFFFFF
        }

        for (let i = 0; i < message.data.data.length; i++) {
          this.voltageDatasetFormat[this.voltageSampleCounter] = {id: this.voltageSampleCounter, x: this.voltageSampleCounter + this.voltageTimeOffset*timeFactor, y: message.data.data[i], group: 'voltage'}
          this.voltageSampleCounter++;
        }
        this.voltageBufferCounter++;
        if (this.recording === false) {
          if (this.voltageBufferCounter >= this.bufferCollectionLength) {
            this.voltage.update(this.voltageDatasetFormat);
            this.voltageBufferCounter = 0;
            this.voltageSampleCounter = 0;
          }
        }
        else {
          if (this.voltageBufferCounter % 0.25*this.bufferCollectionLength === 0) {
            if (this.voltageDatasetFormat.length > 3000) {
              eventBus.emit("StopRecording")
            }
            eventBus.emit("RecordingCycleAdded_voltage", this.voltageDatasetFormat.length);
          }
        }

        this.voltageLastTime = message.data.timestamp
        break;
      case 'newServiceData':
        this._parseAdvertisement(message);
        break;
    }

    switch (message.topic) {
      case 'newCurrentData':
      case 'newVoltageData':
        if (this.streamOrder['newCurrentData'] !== undefined && this.streamOrder['newVoltageData'] !== undefined) {
          // console.log(this.streamOrder['newCurrentData'] , this.streamOrder['newVoltageData'], this.streamOrder['newCurrentData'] - this.streamOrder['newVoltageData'])
        }
        break;
      default:
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