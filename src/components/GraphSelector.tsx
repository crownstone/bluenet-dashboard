import * as React from "react";
import Flexbox from "flexbox-react";
import RaisedButton from "material-ui/RaisedButton";
import {colors} from "../styles";
import {WSSendQueue} from "../backendConnection/WSSendQueue";
import {DataStore} from "../data/dataStore";
import store from "../router/store/store";
import {VisGraph} from "./VisGraph";
import {IconButton} from "material-ui";
import ContentClear from "material-ui/svg-icons/content/clear";

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

  constructor(props) {
    super(props);

    this.state = {
      showSourceSelection: false,
      graphActive: false,
      dataReference: null,
      activeOptions: null,
      connected: false,
      realtimeData: false,
      activeLabel: null
    }

    this.baseOptions = {
      width: '100%',
      height: 500,
      interpolation: false,
      sampling: false,
      dataAxis: {
        left: { range: { min: -5, max: 150 }},
        visible: true,
      },
      showMinorLabels: true,
      showMajorLabels: true,
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
    this.setState({dataReference: null, graphActive: false, activeOptions: null, realtimeData: false, activeLabel: null})
  }

  load(dataType) {
    let activeOptions : any = naiveDeepCopy(this.baseOptions);

    // valid for most graphs
    activeOptions.start = 0;
    activeOptions.end = DataStore.bufferCollectionLength*DataStore.bufferCount;
    activeOptions.dataAxis.left.range.min = -10;
    activeOptions.dataAxis.left.range.max = 4000;

    let stateChange   : any = {showSourceSelection: false, graphActive: true, realtimeData:false, activeLabel: dataType, activeOptions: activeOptions};

    switch (dataType) {
      case 'Voltage':
        this._enable('setVoltageLogging');
        stateChange = {...stateChange, dataReference: DataStore.voltage}
        break
      case 'Current':
        this._enable('setCurrentLogging');
        stateChange = {...stateChange, dataReference: DataStore.current}
        break
      case 'FilteredVoltage':
        this._enable('setFilteredVoltageLogging');
        stateChange = {...stateChange, dataReference: DataStore.filteredVoltage}
        break
      case 'FilteredCurrent':
        this._enable('setFilteredCurrentLogging');
        stateChange = {...stateChange, dataReference: DataStore.filteredCurrent}
        break
      case 'switchState':
        activeOptions.dataAxis.left.range.min = -10;
        activeOptions.dataAxis.left.range.max = 150;
        stateChange = {...stateChange, dataReference: DataStore.switchState, realtimeData: true}
        break
      case 'powerUsage':
        activeOptions.dataAxis.left.range.min = -10;
        activeOptions.dataAxis.left.range.max = 100;
        stateChange = {...stateChange, dataReference: DataStore.powerUsage, realtimeData: true}
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

  _getContent() {
    if (this.state.connected === false) {
      return (
        <div style={{
          borderStyle:'solid',
          borderWidth: '2px',
          borderRadius: 15,
          borderColor:"#e5eaec",
          width:'100%',
          height:500,
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
          height:500,
        }}
        >
          <Flexbox flexDirection={'column'}>
            <VisGraph width={'100%'} height={500} data={this.state.dataReference} options={this.state.activeOptions} realtimeData={this.state.realtimeData} />
          </Flexbox>
          <div style={{position:'absolute', top:-24, right:-24, width: 48, height:48}}>
            <IconButton tooltip="Close Graph" touch={true} tooltipPosition="bottom-left" style={{backgroundColor:colors.darkBackground.hex, borderRadius:24}}
              onClick={() => { this.unload(this.state.activeLabel) }}>
              <ContentClear color={colors.white.hex} />
            </IconButton>
          </div>
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
          height:500,
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
                <RaisedButton primary={true} style={buttonStyle} onClick={() => { this.load('FilteredVoltage') }} label={"Filtered Voltage"} />
                <RaisedButton primary={true} style={buttonStyle} onClick={() => { this.load('FilteredCurrent') }} label={"Filtered Current"} />
                <Flexbox flexGrow={1} />
              </Flexbox>
              <Flexbox flexGrow={0.2} />
              <Flexbox flexDirection={'column'}>
                <div style={{margin:10, padding:10, backgroundColor:"#fff"}}><span>{"Timeseries Data:"}</span></div>
                <RaisedButton primary={true} style={buttonStyle} onClick={() => { this.load('switchState') }} label={"Switch State (adv.)"} />
                <RaisedButton primary={true} style={buttonStyle} onClick={() => { this.load('powerUsage') }} label={"Power Usage (adv.)"} />
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
          height:500,
          backgroundImage: 'url("./images/placeholder.png',
          backgroundRepeat: 'no-repeat',
          backgroundPosition:'center',
        }}
        >
          <a onClick={() => { this.setState({showSourceSelection: true})}}>
            <div style={{ width:'100%', height:500 }}/>
          </a>
        </div>
      )
    }
  }

  render() {
    return (
      <Flexbox flexDirection={'column'} style={{marginLeft: 30, marginRight:30, marginTop:30}}>
        <div style={{width:'100%', height:500}}>
          { this._getContent() }
        </div>
      </Flexbox>
    );
  }

}


export { GraphSelector }