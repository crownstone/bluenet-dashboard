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


let buttonStyle = {margin:10, padding:10}
const GRAPH_HEIGHT = 500;

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

  recordEventSubscription;

  constructor(props) {
    super(props);

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
      drawing: false,
      amountOfRecordedSamples: 0,
    }

    this.baseOptions = {
      width: '100%',
      height: GRAPH_HEIGHT,
      interpolation: false,
      sampling: false,
      dataAxis: {
        left: { range: { min: -5, max: 150 }},
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
      if (state.state.connected !== this.state.connected) {
        this.setState({connected: state.state.connected})
      }
    })

    eventBus.on("PauseFeed", () =>  { this.setState({paused: true});  })
    eventBus.on("ResumeFeed", () => { this.setState({paused: false}); })
  }

  componentWillUnmount() {
    this.unsubscribeStoreEvent();
  }

  unload(dataType) {
    switch (dataType) {
      case 'Voltage':
        this._disable('setVoltageLogging'); break;
      case 'Current':
        this._disable('setCurrentLogging'); break;
      case 'FilteredVoltage':
        this._disable('setFilteredVoltageLogging'); break;
      case 'FilteredCurrent':
        this._disable('setFilteredCurrentLogging'); break;
      default:
        break;
    }
    this.setState({dataReference: null, graphActive: false, activeOptions: null, realtimeData: false, activeLabel: null, dataSetName: null, amountOfRecordedSamples: 0})
  }

  load(dataType) {
    let activeOptions : any = naiveDeepCopy(this.baseOptions);

    // valid for most graphs
    activeOptions.start = 0;
    activeOptions.end = DataStore.bufferCollectionLength*DataStore.bufferCount;
    activeOptions.dataAxis.left.range.min = -100;
    activeOptions.dataAxis.left.range.max = 4100;

    let stateChange : any = {showSourceSelection: false, graphActive: true, realtimeData:false, activeLabel: dataType, activeOptions: activeOptions, recording: false, paused: false};

    switch (dataType) {
      case 'Voltage':
        this._enable('setVoltageLogging');
        stateChange = {...stateChange, dataReference: DataStore.voltage, dataSetName: 'voltage'}
        break
      case 'Current':
        this._enable('setCurrentLogging');
        stateChange = {...stateChange, dataReference: DataStore.current, dataSetName: 'current'}
        break
      case 'FilteredVoltage':
        this._enable('setFilteredVoltageLogging');
        stateChange = {...stateChange, dataReference: DataStore.filteredVoltage, dataSetName: 'filteredVoltage'}
        break
      case 'FilteredCurrent':
        this._enable('setFilteredCurrentLogging');
        stateChange = {...stateChange, dataReference: DataStore.filteredCurrent, dataSetName: 'filteredCurrent'}
        break
      case 'switchState':
        activeOptions.dataAxis.left.range.min = -10;
        activeOptions.dataAxis.left.range.max = 150;
        activeOptions.showMajorLabels = true;
        stateChange = {...stateChange, dataReference: DataStore.switchState, realtimeData: true, dataSetName: 'switchState'}
        break
      case 'powerUsage':
        activeOptions.dataAxis.left.range.min = -10;
        activeOptions.dataAxis.left.range.max = 100;
        activeOptions.showMajorLabels = true;
        stateChange = {...stateChange, dataReference: DataStore.powerUsage, realtimeData: true, dataSetName: 'powerUsage'}
        break;
      case 'powerUsage':
        activeOptions.dataAxis.left.range.min = -10;
        activeOptions.dataAxis.left.range.max = 100;
        activeOptions.showMajorLabels = true;
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

  _getRightCommandIcons() {
    let iconStyle = {borderRadius:24};
    return (
      <div style={{position:'absolute', top:-24, right:-24, width: 48, height: GRAPH_HEIGHT}}>
        <Flexbox flexDirection={'column'}>
          <IconButton tooltip="Close Graph" touch={true} tooltipPosition="bottom-left" style={{...iconStyle, backgroundColor: colors.darkBackground.hex}} onClick={() => { this.unload(this.state.activeLabel) }}>
            <ContentClear color={colors.white.hex} />
          </IconButton>
          <div style={{height: 60}} />
          <IconButton tooltip="Increase Gain" touch={true} tooltipPosition="bottom-left" style={{...iconStyle, backgroundColor: colors.darkBackground.hex}} onClick={() => {  }}>
            <ActionZoomIn color={colors.white.hex} />
          </IconButton>
          <div style={{height: 60}} />
          <IconButton tooltip="Decrease Gain" touch={true} tooltipPosition="bottom-left" style={{...iconStyle, backgroundColor: colors.darkBackground.hex}} onClick={() => {  }}>
            <ActionZoomOut color={colors.white.hex} />
          </IconButton>
        </Flexbox>
      </div>
    )
  }


  _resumeFeed() {
    eventBus.emit("ResumeFeed", this.state.dataSetName);
  }

  _pauseFeed() {
    eventBus.emit("PauseFeed", this.state.dataSetName);
  }

  _startRecording() {
    if (this.state.paused) {
      this._resumeFeed();
    }

    this.recordEventSubscription = eventBus.on("RecordingCycleAdded_" + this.state.dataSetName, (data) => { this.setState({amountOfRecordedSamples: data})})

    eventBus.emit("StartRecording", this.state.dataSetName)
    this.setState({recording: true, drawing: false });
  }

  _stopRecoding() {
    if (!this.state.paused) {
      this._pauseFeed();
    }

    this.setState({drawing: true})
    setTimeout(() => {
      eventBus.emit("StopRecording", this.state.dataSetName)
      this.setState({recording: false, paused: true, drawing: false});
    }, 500);
  }

  _getLeftCommandIcons() {
    let iconStyle = {borderRadius:24};
    return (
      <div style={{position:'absolute', top:-24, left:-24, width: 48, height: GRAPH_HEIGHT}}>
        <Flexbox flexDirection={'column'}>
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
          <IconButton tooltip="Record" touch={true} tooltipPosition="bottom-right" style={{...iconStyle, backgroundColor: colors.darkBackground.hex}} onClick={() => { this._startRecording() }}>
            <AvFiberManualRecord color={colors.menuRed.hex} />
          </IconButton>
          <div style={{height: 60}} />
          <IconButton tooltip="Download" touch={true} tooltipPosition="bottom-right" style={{...iconStyle, backgroundColor: colors.darkBackground.hex}} onClick={() => { alert("TODO: implement") }}>
            <ActionPlayForWork color={colors.white.hex} />
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
          height:GRAPH_HEIGHT,
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
          height:GRAPH_HEIGHT,
        }}
        >
          <Flexbox flexDirection={'column'}>
            <VisGraph width={'100%'} height={GRAPH_HEIGHT} data={this.state.dataReference} options={this.state.activeOptions} realtimeData={this.state.realtimeData} />
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
          height:GRAPH_HEIGHT,
        }}
        >
          <Flexbox flexDirection={'column'}>
            <Flexbox height={'30px'} />
            <Flexbox flexDirection={'row'} height={'500px'} width={'100%'}>
              <Flexbox flexGrow={1} />
              <Flexbox flexDirection={'column'}>
                <div style={{margin:10, padding:10, backgroundColor:"#fff"}}><span>{"Cyclic data:"}</span></div>
                <RaisedButton primary={true} style={buttonStyle} onClick={() => { this.load('Voltage') }} label={"Voltage"} />
                <RaisedButton primary={true} style={buttonStyle} onClick={() => { this.load('Current') }} label={"Current"} />
                <RaisedButton primary={true} style={buttonStyle} onClick={() => { this.load('FilteredVoltage') }} label={"TODO: Filtered Voltage"} />
                <RaisedButton primary={true} style={buttonStyle} onClick={() => { this.load('FilteredCurrent') }} label={"TODO: Filtered Current"} />
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
          height:GRAPH_HEIGHT,
          backgroundImage: 'url("./images/placeholder.png',
          backgroundRepeat: 'no-repeat',
          backgroundPosition:'center',
        }}
        >
          <a onClick={() => { this.setState({showSourceSelection: true})}}>
            <div style={{ width:'100%', height:GRAPH_HEIGHT }}/>
          </a>
        </div>
      )
    }
  }

  render() {
    let actions = []
    if (!this.state.drawing) {
      actions = [
        <RaisedButton
          label="Finish Recording"
          primary={true}
          onClick={() => { this._stopRecoding(); }}
        />,
      ];
    }

    return (
      <Flexbox flexDirection={'column'} style={{marginLeft: 30, marginRight:30, marginTop:30}}>
        <div style={{width:'100%', height:GRAPH_HEIGHT}}>
          { this._getContent() }
        </div>
        <Dialog
          title={this.state.drawing ? "Recording Finished" : "Recording in Progress..."}
          actions={actions}
          modal={false}
          open={this.state.recording}
          onRequestClose={() => {}}
        >
          {
            this.state.drawing ? "Drawing results..." :
              <div>
                <p>Data is being collected in the background. You can stop this any time to view the results.</p>
                <p>{"Amount of samples recorded: " + this.state.amountOfRecordedSamples}</p>
            </div>
          }
        </Dialog>
      </Flexbox>
    );
  }

}


export { GraphSelector }