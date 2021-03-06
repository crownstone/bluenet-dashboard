import * as React from "react";
import Flexbox from "flexbox-react";
import RaisedButton from "material-ui/RaisedButton";
import {colors} from "../styles";
import {WSSendQueue} from "../backendConnection/WSSendQueue";
import {DataStore} from "../data/dataStore";
import store from "../router/store/store";
import {VisGraph} from "./VisGraph";
import {FlatButton, IconButton} from "material-ui";
import ContentClear from "material-ui/svg-icons/content/clear";
import ActionZoomIn from "material-ui/svg-icons/action/zoom-in";
import ActionZoomOut from "material-ui/svg-icons/action/zoom-out";
import AvFiberManualRecord from "material-ui/svg-icons/av/fiber-manual-record";
import AvPlayArrow from "material-ui/svg-icons/av/play-arrow";
import AvPause from "material-ui/svg-icons/av/pause";
import ActionPlayForWork from "material-ui/svg-icons/action/play-for-work";
import Dialog from 'material-ui/Dialog';
import {eventBus} from "../util/EventBus";
import {Util} from "../util/Util";
import ContentSave from "material-ui/svg-icons/content/save";
import NavigationRefresh from "material-ui/svg-icons/navigation/refresh";
import HardwareKeyboardArrowUp from "material-ui/svg-icons/hardware/keyboard-arrow-up";
import HardwareKeyboardArrowDown from "material-ui/svg-icons/hardware/keyboard-arrow-down";
import ImageBlurOff from "material-ui/svg-icons/image/blur-off";
import ImageFilter1 from "material-ui/svg-icons/image/filter-1";


import * as visjs from "vis"
import ImageBlurOn from "material-ui/svg-icons/image/blur-on";
import {StateIndicator} from "./StateIndicator";
const vis = (visjs as any);

let buttonStyle = {margin:10, padding:10}

function naiveDeepCopy( original )
{
  // First create an empty object with
  // same prototype of our original source
  var clone = Object.create( Object.getPrototypeOf( original ) ) ;

  var i , descriptor , keys = Object.getOwnPropertyNames( original ) ;

  for ( i = 0 ; i < keys.length ; i ++ )
  {
    // Save the source's descriptor
    descriptor = Object.getOwnPropertyDescriptor( original , keys[ i ] ) ;

    if ( descriptor.value && typeof descriptor.value === 'object' )
    {
      // If the value is an object, recursively deepCopy() it
      descriptor.value = naiveDeepCopy( descriptor.value ) ;
    }

    Object.defineProperty( clone , keys[ i ] , descriptor ) ;
  }

  return clone ;
}

class GraphSelector extends React.Component<any,any> {
  unsubscribeStoreEvent;
  baseOptions : any;
  uuid: string;
  graphRef: any;
  recordEventSubscription;

  dataset = new vis.DataSet();

  constructor(props) {
    super(props);

    this.uuid = Util.getUUID();

    this.state = {
      showSourceSelection: false,
      graphActive: false,
      dataReference: null,
      dataSetName: null,
      activeOptions: null,
      connected: false,
      realtimeData: false,
      activeLabel: null,
      paused: false,
      recording: false,
      recordingToDisk: false,
      recordingRequested: false,
      drawing: false,
      amountOfRecordedSamples: 0,

      voltagePin: null,
      voltageRange: null,
      voltageRefPin: null,

      currentPin: null,
      currentRange: null,
      currentRefPin: null,
    };

    this.baseOptions = {
      width: '100%',
      height: (window as any).GRAPH_HEIGHT - 30,
      interpolation: false,
      sampling: false,
      dataAxis: {
        left: {
          range: { min: -5, max: 150 },
          format: (value) => {
            if (value < 1 && value > 0) {
              return value.toPrecision(3)
            }
            let dec = value - Math.floor(value);

            if (dec > 0.1) {
              return '' + (value - dec) + '.' + Math.floor(dec * 1000);
            }
            else if (dec > 0.01) {
              return '' + (value - dec) + '.0' + Math.floor(dec * 1000);
            }
            else if (dec > 0.001) {
              return '' + (value - dec) + '.00' + Math.floor(dec * 1000);
            }
            else {
              return value;
            }
          }
        },
        visible: true,
        width: '100px'
      },
      legend: true,
      showMinorLabels: true,
      showMajorLabels: false,
      showCurrentTime: true,
    };
  }

  componentDidMount() {
    this.unsubscribeStoreEvent = store.subscribe(() => {
      let state = store.getState();
      let changePayload = {};
      if (state.state.connected !== this.state.connected) {  changePayload['connected'] = state.state.connected;   }

      if (state.adc.voltage.pin    !== undefined && state.adc.voltage.pin    !== this.state.voltagePin)    {  changePayload['voltagePin']    = state.adc.voltage.pin    }
      if (state.adc.voltage.range  !== undefined && state.adc.voltage.range  !== this.state.voltageRange)  {  changePayload['voltageRange']  = state.adc.voltage.range  }
      if (state.adc.voltage.refPin !== undefined && state.adc.voltage.refPin !== this.state.voltageRefPin) {  changePayload['voltageRefPin'] = state.adc.voltage.refPin }
      if (state.adc.current.pin    !== undefined && state.adc.current.pin    !== this.state.currentPin)    {  changePayload['currentPin']    = state.adc.current.pin    }
      if (state.adc.current.range  !== undefined && state.adc.current.range  !== this.state.currentRange)  {  changePayload['currentRange']  = state.adc.current.range  }
      if (state.adc.current.refPin !== undefined && state.adc.current.refPin !== this.state.currentRefPin) {  changePayload['currentRefPin'] = state.adc.current.refPin }

      this.setState(changePayload)

      if (this.state.activeLabel === 'Voltage') {
        (window as any).___PIN = this.state.voltagePin;
        (window as any).___DIFFERENTIAL = this.state.voltageRefPin !== 255;
        if (state.adc.voltage.range)
          (window as any).___RANGE = state.adc.voltage.range;
      }
      else if (this.state.activeLabel === 'Current' || this.state.activeLabel === 'FilteredCurrent') {
        (window as any).___PIN = this.state.currentPin;
        if (state.adc.current.range)
          (window as any).___RANGE = state.adc.current.range;
        (window as any).___DIFFERENTIAL = this.state.currentRefPin !== 255;
      }
    })

    eventBus.on("PauseFeed", () =>  { this.setState({paused: true});  })
    eventBus.on("ResumeFeed", () => { this.setState({paused: false}); })
    eventBus.on("StartRecordingToDisk", () => { this.setState({recordingToDisk: true});  })
    eventBus.on("StopRecordingToDisk",  () => { this.setState({recordingToDisk: false}); })
  }

  componentWillUnmount() {
    this.unsubscribeStoreEvent();
  }

  unload(dataType) {
    switch (dataType) {
      case 'Voltage':
        this._disable('setVoltageLogging');
        eventBus.emit("ReleaseData", {topic: 'newVoltageData', datasetId: this.uuid})
        break;
      case 'Current':
        this._disable('setCurrentLogging');
        eventBus.emit("ReleaseData", {topic: 'newCurrentData', datasetId: this.uuid})
        break;
      case 'FilteredVoltage':
        this._disable('setFilteredVoltageLogging');
        eventBus.emit("ReleaseData", {topic: 'newFilteredCurrentData', datasetId: this.uuid})
        break;
      case 'FilteredCurrent':
        this._disable('setFilteredCurrentLogging');
        eventBus.emit("ReleaseData", {topic: 'newFilteredVoltageData', datasetId: this.uuid})
        break;
      default:
        break;
    }
    this.setState({dataReference: null, graphActive: false, activeOptions: null, realtimeData: false, activeLabel: null, dataSetName: null, amountOfRecordedSamples: 0})
  }

  getActiveOptions(dataType) {
    let activeOptions : any = naiveDeepCopy(this.baseOptions);

    // valid for most graphs
    activeOptions.start = 0;
    activeOptions.end = DataStore.bufferCollectionLength*DataStore.bufferCount;
    activeOptions.dataAxis.left.range.min = undefined;
    activeOptions.dataAxis.left.range.max = undefined;


    switch (dataType) {
      case 'Voltage':
      case 'Current':
      case 'FilteredVoltage':
      case 'FilteredCurrent':
        break
      case 'switchState':
        activeOptions.dataAxis.left.range.min = -10;
        activeOptions.dataAxis.left.range.max = 150;
        activeOptions.showMajorLabels = true;
        break
      case 'powerUsage':
        activeOptions.dataAxis.left.range.min = -10;
        activeOptions.dataAxis.left.range.max = 100;
        activeOptions.showMajorLabels = true;
        break;
      case 'temperature':
        activeOptions.dataAxis.left.range.min = -10;
        activeOptions.dataAxis.left.range.max = 100;
        activeOptions.showMajorLabels = true;
        break;
    }

    return activeOptions;
  }

  load(dataType) {
    let activeOptions : any = this.getActiveOptions(dataType)

    let stateChange : any = {showSourceSelection: false, graphActive: true, realtimeData:false, activeLabel: dataType, activeOptions: activeOptions, recording: false, paused: false};

    switch (dataType) {
      case 'Voltage':
        this._enable('setVoltageLogging');
        stateChange = {...stateChange, dataReference: null, dataSetName: 'voltage'}
        eventBus.emit("RequestData", {topic: 'newVoltageData', dataset: this.dataset, datasetId: this.uuid});
        break
      case 'Current':
        this._enable('setCurrentLogging');
        stateChange = {...stateChange, dataReference: null, dataSetName: 'current'}
        eventBus.emit("RequestData", {topic: 'newCurrentData', dataset: this.dataset, datasetId: this.uuid})
        break
      case 'FilteredVoltage':
        this._enable('setFilteredVoltageLogging');
        stateChange = {...stateChange, dataReference: null, dataSetName: 'filteredVoltage'}
        eventBus.emit("RequestData", {topic: 'newFilteredVoltageData', dataset: this.dataset, datasetId: this.uuid})
        break
      case 'FilteredCurrent':
        this._enable('setFilteredCurrentLogging');
        stateChange = {...stateChange, dataReference: null, dataSetName: 'filteredCurrent'}
        eventBus.emit("RequestData", {topic: 'newFilteredCurrentData', dataset: this.dataset, datasetId: this.uuid})
        break
      case 'switchState':
        stateChange = {...stateChange, dataReference: DataStore.switchState, realtimeData: true, dataSetName: 'switchState'}
        break
      case 'powerUsage':
        stateChange = {...stateChange, dataReference: DataStore.powerUsage, realtimeData: true, dataSetName: 'powerUsage'}
        break;
      case 'temperature':
        stateChange = {...stateChange, dataReference: DataStore.temperature, realtimeData: true, dataSetName: 'temperature'}
        break;
    }

    this.setState(stateChange);
  }

  _enable(type) {
    WSSendQueue.add({
      type:'command',
      command:type,
      value: true
    });
  }

  _disable(type) {
    WSSendQueue.add({
      type:'command',
      command:type,
      value: false
    });
  }

  _increaseGain(dataType) {
    let command = null
    switch (dataType) {
      case 'Current':
      case 'FilteredCurrent':
        command = 'increaseCurrentRange'; break;
      case 'Voltage':
        command = 'increaseVoltageRange'; break;
      default:
        console.warn("INVALID TYPE TO INCREASE GAIN", this.state.activeLabel);
        return;
    }

    WSSendQueue.add({
      type:'command',
      command: command,
    });
  }

  _decreaseGain(dataType) {
    let command = null
    switch (dataType) {
      case 'Current':
      case 'FilteredCurrent':
        command = 'decreaseCurrentRange'; break;
      case 'Voltage':
        command = 'decreaseVoltageRange'; break;
      default:
        console.warn("INVALID TYPE TO DECREASE GAIN", this.state.activeLabel);
        return;
    }

    WSSendQueue.add({
      type:'command',
      command: command,
    });
  }

  _toggleDifferential(dataType) {
    let command = null
    let differentialOn = false;
    if (this.state.activeLabel === 'Voltage') {
      differentialOn = this.state.voltageRefPin !== 255;
    }
    else if (this.state.activeLabel === 'Current' || this.state.activeLabel === 'FilteredCurrent') {
      differentialOn = this.state.currentRefPin !== 255;
    }

    switch (dataType) {
      case 'Current':
      case 'FilteredCurrent':
        command = 'setDifferentialModeCurrent'; break;
      case 'Voltage':
        command = 'setDifferentialModeVoltage'; break;
      default:
        console.warn("INVALID TYPE TO TOGGLE DIFFERENTIAL", this.state.activeLabel);
        return;
    }

    WSSendQueue.add({
      type:'command',
      command: command,
      value: !differentialOn
    });
  }

  _togglePin(dataType) {
    let command = null
    switch (dataType) {
      case 'Current':
      case 'FilteredCurrent':
        command = 'toggleCurrentChannelPin'; break;
      case 'Voltage':
        command = 'toggleVoltageChannelPin'; break;
      default:
        console.warn("INVALID TYPE TO TOGGLE DIFFERENTIAL", this.state.activeLabel);
        return;
    }

    WSSendQueue.add({
      type:'command',
      command: command,
      value: false
    });
  }



  _resumeFeed() {
    eventBus.emit("ResumeFeed", this.state.dataSetName);

    let activeOptions = this.getActiveOptions(this.state.activeLabel)
    this.graphRef.setRange(activeOptions.start, activeOptions.end)
  }

  _pauseFeed() {
    eventBus.emit("PauseFeed", this.state.dataSetName);
  }

  _endRecordingAndDownload() {
    eventBus.emit("StopRecordingToDisk", {
      amountOfRecordedSamples: this.state.amountOfRecordedSamples,
      voltagePin: this.state.voltagePin,
      voltageRange: this.state.voltageRange,
      voltageRefPin: this.state.voltageRefPin,
      currentPin: this.state.currentPin,
      currentRange: this.state.currentRange,
      currentRefPin: this.state.currentRefPin,
    })
    this.setState({recordingToDisk: false});
  }

  _requestRecording() {
    this.setState({recordingRequested: true});
  }

   _startRecording() {
    if (this.state.paused) {
      this._resumeFeed();
    }

    this.recordEventSubscription = eventBus.on("RecordingCycleAdded_" + this.uuid, (data) => {
      this.setState({amountOfRecordedSamples: data});
      if (data >= 20000) {
        this._stopRecording();
      }
    })

    eventBus.emit("StartRecording", this.state.dataSetName)
    this.setState({recording: true, drawing: false, recordingRequested: false});
  }

  _startRecordingToDisk() {
    if (this.state.paused) {
      this._resumeFeed();
    }

    this.recordEventSubscription = eventBus.on("RecordingCycleAdded_" + this.uuid, (data) => { this.setState({amountOfRecordedSamples: data})})

    eventBus.emit("StartRecordingToDisk", this.state.dataSetName);
    this.setState({recordingToDisk: true, drawing: false, recordingRequested: false });
  }

  _stopRecording() {
    if (!this.state.paused) {
      this._pauseFeed();
    }

    this.setState({drawing: true})
    setTimeout(() => {
      eventBus.emit("StopRecording", this.state.dataSetName)
      this.setState({recording: false, paused: true, drawing: false});
    }, 500);
  }

  _getRightCommandIcons() {
    let iconStyle = {borderRadius:24};

    let buttons = [
      <IconButton key={this.uuid + 'closeButton'} tooltip="Close Graph" touch={true} tooltipPosition="bottom-left" style={{...iconStyle, backgroundColor: colors.darkBackground.hex}} onClick={() => { this.unload(this.state.activeLabel) }}>
        <ContentClear color={colors.white.hex} />
      </IconButton>
    ];


    let differentialKnown = false;
    let pinKnown = false;
    let differentialOn = false;
    let activePin = 0;
    let range = "UNKNOWN";

    if (this.state.activeLabel === 'Voltage') {
      activePin = this.state.voltagePin;
      pinKnown = this.state.voltagePin !== null;
      differentialOn = this.state.voltageRefPin !== 255;
      if (this.state.voltageRange)
        range = this.state.voltageRange;
      differentialKnown = this.state.voltagePin !== null;
    }
    else if (this.state.activeLabel === 'Current' || this.state.activeLabel === 'FilteredCurrent') {
      activePin = this.state.currentPin;
      pinKnown = this.state.currentPin !== null;
      if (this.state.currentRange)
        range = this.state.currentRange;
      differentialOn = this.state.currentRefPin !== 255;
      differentialKnown = this.state.currentRefPin !== null;
    }


    let addSharedCyclicButtons = () => {
      buttons.push(<div key={this.uuid+'spacer1'} style={{height: 60}} />);
      buttons.push(<IconButton key={this.uuid+'_decreaseRange'} tooltip={"Decrease Range (Currently " + range + ")"} touch={true} tooltipPosition="bottom-left" style={{...iconStyle, backgroundColor: colors.darkBackground.hex}} onClick={() => {  this._decreaseGain(this.state.activeLabel) }}>
        <ActionZoomIn color={colors.white.hex} />
      </IconButton>);
      buttons.push(<div key={this.uuid+'spacer2'} style={{height: 60}} />);
      buttons.push(<IconButton key={this.uuid+'_increaseRange'} tooltip={"Increase Range (Currently " + range + ")"} touch={true} tooltipPosition="bottom-left" style={{...iconStyle, backgroundColor: colors.darkBackground.hex}} onClick={() => { this._increaseGain(this.state.activeLabel) }}>
        <ActionZoomOut color={colors.white.hex} />
      </IconButton>);
      buttons.push(<div key={this.uuid+'spacer3'} style={{height: 60}} />);
      buttons.push(<IconButton key={this.uuid+'_toggleDifferential'} tooltip={"Toggle Differential " + (differentialKnown ? ("(Currently "+(differentialOn ? 'ON)':'OFF)')) : "(Currently UNKNOWN)")} touch={true} tooltipPosition="bottom-left" style={{...iconStyle, backgroundColor: differentialKnown ? colors.darkBackground.hex : colors.csOrange.hex }} onClick={() => {  this._toggleDifferential(this.state.activeLabel) }}>
        {differentialOn ? <ImageBlurOff color={colors.white.hex} /> : <ImageBlurOn color={colors.white.hex} />}
      </IconButton>);
    }

    switch (this.state.activeLabel) {
      case 'Voltage':
      case 'FilteredVoltage':
        addSharedCyclicButtons();
        buttons.push(<div key={this.uuid+'spacer4'} style={{height: 60}} />);
        buttons.push(<div key={this.uuid+'pinValue'} style={{color: colors.white.hex, position:'relative', width:48, height:48, lineHeight: '48px', textAlign:'center', fontSize: '15pt',backgroundColor: pinKnown ? colors.darkBackground.hex : colors.csOrange.hex, borderRadius:24}}>{activePin === 100 ? "VDD" : (activePin === undefined || activePin === null ? '?' : activePin)}</div>)
        buttons.push(<IconButton key={this.uuid+'_togglePin'} tooltip={"Toggle Pin " + (pinKnown ? "(Currently " + activePin + ')' : "(Currently UNKNOWN)")} touch={true} tooltipPosition="bottom-left" style={{...iconStyle, position:'relative', top:-48}} onClick={() => {  this._togglePin(this.state.activeLabel) }} />);
        break;
      case 'Current':
      case 'FilteredCurrent':
        addSharedCyclicButtons();
        break
      case 'switchState':
      case 'powerUsage':
      case 'powerUsage':
        break;
    }
    return (
      <div style={{position:'absolute', top:-24, right:-24, width: 48, height: (window as any).GRAPH_HEIGHT}}>
        <Flexbox flexDirection={'column'}>
          {buttons}
        </Flexbox>
      </div>
    )
  }

  _getLeftCommandIcons() {
    let iconStyle = {borderRadius:24};
    return (
      <div style={{position:'absolute', top:-24, left:-24, width: 48, height: (window as any).GRAPH_HEIGHT - 6}}>
        <Flexbox flexDirection={'column'} flexGrow={1} height={'100%'}>
          <IconButton
            tooltip={this.state.paused === true ? "Resume" : "Pause"}
            touch={true}
            tooltipPosition="bottom-right"
            style={{...iconStyle, backgroundColor: colors.darkBackground.hex}}
            onClick={() => { this.state.paused === true ? this._resumeFeed() : this._pauseFeed() }}
          >
            { this.state.paused === true ? <AvPlayArrow color={colors.white.hex} /> : <AvPause color={colors.white.hex} />}
              </IconButton>
          <div style={{height: 60}} />
          <IconButton tooltip="Record"
                      touch={true}
                      tooltipPosition="bottom-right"
                      style={{...iconStyle, backgroundColor: this.state.recordingToDisk ? colors.green.hex : colors.darkBackground.hex}}
                      onClick={() => {
                        if (this.state.recordingToDisk) {
                          this._endRecordingAndDownload()
                        }
                        else {
                          this._requestRecording()
                        }
                      }}
          >
            { this.state.recordingToDisk === true ?  <ContentSave color={colors.white.hex} /> :  <AvFiberManualRecord color={colors.menuRed.hex} />}
          </IconButton>

          <Flexbox flexGrow={1} />

          <IconButton
            touch={true}
            style={{...iconStyle, backgroundColor: colors.green.hex}}
            onClick={() => { this.graphRef.reloadDataRange() }}
          >
            <NavigationRefresh color={colors.white.hex} />
          </IconButton>
          <IconButton
            touch={true}
            style={{...iconStyle, backgroundColor: colors.green.hex}}
            onClick={() => { this.graphRef._decreaseOffset() }}
          >
            <HardwareKeyboardArrowUp color={colors.white.hex} />
          </IconButton>
          <IconButton
            touch={true}
            style={{...iconStyle, backgroundColor: colors.green.hex}}
            onClick={() => { this.graphRef._increaseOffset() }}
          >
            <HardwareKeyboardArrowDown color={colors.white.hex} />
          </IconButton>
          <IconButton
            touch={true}
            style={{...iconStyle, backgroundColor: colors.green.hex}}
            onClick={() => { this.graphRef._increaseYRange() }}
          >
            <ActionZoomIn color={colors.white.hex} />
          </IconButton>
          <IconButton
            touch={true}
            style={{...iconStyle, backgroundColor: colors.green.hex}}
            onClick={() => { this.graphRef._decreaseYRange() }}
          >
            <ActionZoomOut color={colors.white.hex} />
          </IconButton>
        </Flexbox>
      </div>
    );
  }

  _getContent() {
    if (this.state.connected === false) {
      return (
        <div style={{
          borderStyle:'solid',
          borderWidth: '2px',
          borderRadius: 15,
          borderColor:"#e5eaec",
          width:'100%',
          height:(window as any).GRAPH_HEIGHT,
          backgroundImage: 'url("./images/notConnected.png',
          backgroundRepeat: 'no-repeat',
          backgroundPosition:'center',
        }}
        />
      )
    }

    if (this.state.graphActive === true) {
      return (
        <div style={{
          position:'relative',
          borderStyle:'solid',
          borderWidth: '2px',
          borderRadius: 15,
          borderColor:"#e5eaec",
          backgroundColor: colors.white.hex,
          width:'100%',
          height:(window as any).GRAPH_HEIGHT,
        }}
        >
          <Flexbox flexDirection={'column'}>
            <VisGraph
              width={'100%'}
              ref={(graphRef) => {this.graphRef = graphRef; }}
              height={(window as any).GRAPH_HEIGHT}
              data={this.state.dataReference || this.dataset}
              options={this.state.activeOptions}
              realtimeData={this.state.realtimeData}
              showRangeInputs={true}
            />
          </Flexbox>
          { this._getLeftCommandIcons()  }
          { this._getRightCommandIcons() }
        </div>
      )
    }

    if (this.state.showSourceSelection === true) {
      return (
        <div style={{
          borderStyle:'solid',
          borderWidth: '2px',
          borderRadius: 15,
          borderColor:"#e5eaec",
          backgroundColor: colors.darkBackground.rgba(0.1),
          width:'100%',
          height:(window as any).GRAPH_HEIGHT,
        }}
        >
          <Flexbox flexDirection={'column'}>
            <Flexbox height={'30px'} />
            <Flexbox flexDirection={'row'} height={(window as any).GRAPH_HEIGHT + 'px'} width={'100%'}>
              <Flexbox flexGrow={1} />
              <Flexbox flexDirection={'column'}>
                <div style={{margin:10, padding:10, backgroundColor:"#fff"}}><span>{"Cyclic data:"}</span></div>
                <RaisedButton primary={true} style={buttonStyle} onClick={() => { this.load('Voltage') }} label={"Voltage"} />
                <RaisedButton primary={true} style={buttonStyle} onClick={() => { this.load('Current') }} label={"Current"} />
                {/*<RaisedButton primary={true} style={buttonStyle} onClick={() => { this.load('FilteredVoltage') }} label={"TODO: Filtered Voltage"} />*/}
                <RaisedButton primary={true} style={buttonStyle} onClick={() => { this.load('FilteredCurrent') }} label={"Filtered Current"} />
                <Flexbox flexGrow={1} />
              </Flexbox>
              <Flexbox flexGrow={0.2} />
              <Flexbox flexDirection={'column'}>
                <div style={{margin:10, padding:10, backgroundColor:"#fff"}}><span>{"Timeseries Data:"}</span></div>
                <RaisedButton primary={true} style={buttonStyle} onClick={() => { this.load('switchState') }} label={"Switch State (adv.)"}     />
                <RaisedButton primary={true} style={buttonStyle} onClick={() => { this.load('powerUsage' ) }} label={"Power Usage (adv.)"}      />
                <RaisedButton primary={true} style={buttonStyle} onClick={() => { this.load('temperature') }} label={"Chip Temperature (adv.)"} />
                <Flexbox flexGrow={1} />
              </Flexbox>
              <Flexbox flexGrow={1} />
            </Flexbox>
            <Flexbox flexGrow={1} />
          </Flexbox>
        </div>
      )
    }
    else if (this.state.graphActive === false) {
      return (
        <div style={{
          position:'relative',
          borderStyle:'solid',
          borderWidth: '2px',
          borderRadius: 15,
          borderColor:"#e5eaec",
          width:'100%',
          height:(window as any).GRAPH_HEIGHT,
          backgroundImage: 'url("./images/placeholder.png',
          backgroundRepeat: 'no-repeat',
          backgroundPosition:'center',
        }}
        >
          <a onClick={() => { this.setState({showSourceSelection: true})}}>
            <div style={{ width:'100%', height:(window as any).GRAPH_HEIGHT }}/>
          </a>
        </div>
      )
    }
  }

  _getDialog() {
    let actions = [];
    let title = "Recording in Progress...";
    let content = (
      <div>
        <p>Data is being collected in the background. You can stop this any time to view the results.</p>
        <p>{"Amount of samples recorded: " + this.state.amountOfRecordedSamples}</p>
      </div>
    );
    if (this.state.recordingRequested) {
      title = 'Record Data';
      content = (
        <div>
          <p>You can start recording data by pressing the Start Button.</p>
        </div>
      );
      actions.push([
        <FlatButton
          style={{float:'left'}}
          label="Cancel"
          primary={true}
          onClick={() => { this.setState({recordingRequested: false}) }}
        />,
      ]);
      actions.push([
        <FlatButton
          label="Record to Graph"
          primary={true}
          onClick={() => { this._startRecording(); }}
        />,
      ]);
      actions.push([
        <RaisedButton
          label="Record to Disk (background)"
          primary={true}
          style={{paddingRight:10}}
          onClick={() => { this._startRecordingToDisk(); }}
        />,
      ]);
    }
    else if (this.state.drawing) {
      title = 'Drawing Data';
      content = (
        <div>
          <p>Drawing the data in the graph. This can take a while...</p>
          <p>{"Amount of samples recorded: " + this.state.amountOfRecordedSamples}</p>
        </div>
      );
    }
    else {
      actions.push([
        <RaisedButton
          label="Finish Recording"
          primary={true}
          onClick={() => { this._stopRecording(); }}
        />,
      ]);
    }

    return (
      <Dialog
        title={title}
        actions={actions}
        modal={false}
        open={this.state.recording || this.state.recordingRequested}
        onRequestClose={() => {}}
      >
        {content}
      </Dialog>
    )
  }

  _getPinEntries() {
    let pins = Object.keys((window as any).PIN_MULTIPLIERS);
    let result = [];
    pins.forEach((pin) => {
      result.push(
        <div key={pin}>
          <span>{"multiplier for pin: " + pin + " = "}</span>
          <input
            placeholder={(window as any).PIN_MULTIPLIERS[pin]}
            style={{width:60, height:25}}
            onBlur={(event) => {
              if ((event.target as any).value) {
                (window as any).PIN_MULTIPLIERS[pin] = (event.target as any).value;
              }
            }
          }/>
        </div>
      )
    })
    return result;
  }

  _getViewModes() {
    let result = [];
    result.push(
      <div key={'volt'} style={{paddingBottom:5}}>
        <StateIndicator label={ "Voltage" } value={(window as any).VIEW_MODE === 'Voltage'} onClick={() => {(window as any).VIEW_MODE = 'Voltage'; this.forceUpdate(); }} />
      </div>
    )
    result.push(
      <div key={'amp'} style={{paddingBottom:5}}>
        <StateIndicator label={ "Amperage" } value={(window as any).VIEW_MODE === 'Amperage'} onClick={() => {(window as any).VIEW_MODE = 'Amperage'; this.forceUpdate(); }} />
      </div>
    )
    result.push(
      <div key={'adc'} style={{paddingBottom:5}}>
        <StateIndicator label={ "ADC" } value={(window as any).VIEW_MODE === 'ADC'} onClick={() => {(window as any).VIEW_MODE = 'ADC'; this.forceUpdate(); }} />
      </div>
    )
    return result;
  }

  render() {
    return (
      <Flexbox flexDirection={'column'} style={{marginLeft: 30, marginRight:30, marginTop:30}}>
        { this.state.recordingToDisk ? <span style={{paddingLeft:30}}>{'Amount of samples recorded: ' + this.state.amountOfRecordedSamples}</span> : undefined}
        <div style={{width:'100%', height: (window as any).GRAPH_HEIGHT + 10}}>
          { this._getContent() }
        </div>
        <Flexbox flexDirection={'row'}>
          <div style={{width:300}}>{this._getPinEntries()}</div>
          <Flexbox flex={"1"} width={'100%'}/>
          <div style={{}}>{this._getViewModes()}</div>
        </Flexbox>
        {this._getDialog()}
      </Flexbox>
    );
  }

}


export { GraphSelector }