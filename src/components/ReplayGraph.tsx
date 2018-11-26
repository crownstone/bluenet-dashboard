import * as React from "react";
import Flexbox from "flexbox-react";
import RaisedButton from "material-ui/RaisedButton";
import {colors} from "../styles";
import {VisGraph} from "./VisGraph";
import {Util} from "../util/Util";

import * as fft from "fft-js"

import * as visjs from "vis"
import {VisTimeline} from "./VisTimeline";
import {eventBus} from "../util/EventBus";
import {IconButton} from "material-ui";
import HardwareKeyboardArrowUp from "material-ui/svg-icons/hardware/keyboard-arrow-up";
import HardwareKeyboardArrowDown from "material-ui/svg-icons/hardware/keyboard-arrow-down";
import ActionZoomIn from "material-ui/svg-icons/action/zoom-in";
import ActionZoomOut from "material-ui/svg-icons/action/zoom-out";
import AvAddToQueue from "material-ui/svg-icons/av/add-to-queue";
import {VisPreviewGraph} from "./VisPreviewGraph";
import NavigationRefresh from "material-ui/svg-icons/navigation/refresh";
import {StateIndicator} from "./StateIndicator";
const vis = (visjs as any);

let buttonStyle = {margin:10, padding:10}

const ADC_RESET_STRING = "ADC_RESET";

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

class ReplayGraph extends React.Component<any,any> {
  baseOptions : any;
  previewBaseOptions : any;
  uuid: string;
  graphRef: any;
  graphRefFFT: any;
  graphRefPreview: any;
  inputRef: any;
  timelineRef: any;

  jsonContent : any = {}

  graphData = [];

  dataset = new vis.DataSet();
  fftDataset = new vis.DataSet();
  datasetPreview = new vis.DataSet();

  visibleData = [];

  startTime = -1;
  endTime = 5000;

  loadedConfig = false;

  constructor(props) {
    super(props);

    this.uuid = Util.getUUID();

    this.state = {
      showSourceSelection: false,
      graphActive: false,
      maxTime: 1000,
    }

    this.baseOptions = {
      width: '100%',
      height: (window as any).REPLAY_GRAPH_HEIGHT - 30,
      interpolation: false,
      sampling: false,
      dataAxis: {
        left: {
          range: { min: undefined, max: undefined },
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
          }},
        visible: true,
        width: '100px',
      },
      legend: true,
      showMinorLabels: true,
      showMajorLabels: false,
      showCurrentTime: true,
    };

    this.previewBaseOptions = {
      width: '100%',
      height: 100,
      interpolation: false,
      sampling: false,
      drawPoints: false,
      dataAxis: {
        left: { range: { min: undefined, max: undefined }},
        visible: false,
      },
      legend: false,
      zoomable: false,
      moveable: false,
      showMinorLabels: false,
      showMajorLabels: false,
      showCurrentTime: false,
    };

    eventBus.on("applyDataRange", (data) => {
      this.startTime = data.startTime;
      this.endTime = data.endTime;

      this._reloadData(false);
    })
  }

  _reloadData(refreshPreview) {
    this.dataset.clear()
    let dataContent = [];
    let dataContentPreview = [];

    this.graphData = [];

    this.visibleData.forEach((datasetName) => {
      if (!this.jsonContent)                     { return }
      if (!this.jsonContent[datasetName].length) { return }


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

      let minVal = 1e9;
      let maxVal = -1e9;
      let samplesForAverage = 0;
      for (let i = 0; i < this.jsonContent[datasetName].length; i++) {
        let point = this.jsonContent[datasetName][i];

        if (point[1] === ADC_RESET_STRING) { continue; }
        if (this.startTime <= point[0] && this.endTime >= point[0]) {
          minVal = Math.min(minVal, point[1]);
          maxVal = Math.max(maxVal, point[1]);
          samplesForAverage++;

          if (samplesForAverage > 500) {
            break
          }
        }
      }

      if (samplesForAverage > 200) {
        let minValues = [];
        let maxValues = [];
        let midPoint = 0.5*(minVal+maxVal);
        minVal = 1e9;
        maxVal = -1e9;
        let lastPoint = null;
        for (let i = 0; i < this.jsonContent[datasetName].length; i++) {
          let point = this.jsonContent[datasetName][i];
          if (point[1] === ADC_RESET_STRING) { continue; }
          if (this.startTime <= point[0] && this.endTime >= point[0]) {
            if (lastPoint !== null) {
              let dy = point[1] - lastPoint[1];
              if (point[1] > midPoint && dy > 0) {
                if (minVal != 1e9) {
                  minValues.push(minVal)
                }
                maxVal = Math.max(maxVal, point[1]);
                minVal = 1e9;
              }
              else if (point[1] < midPoint && dy < 0) {
                if (maxVal != -1e9) {
                  maxValues.push(maxVal)
                }
                minVal = Math.min(minVal, point[1]);
                maxVal = -1e9;
              }
            }

            lastPoint = point;
          }
        }

        let maxAvg = 0;
        let minAvg = 0;
        for (let i = 0; i < maxValues.length; i++) { maxAvg += maxValues[i]; }
        for (let i = 0; i < minValues.length; i++) { minAvg += minValues[i]; }
        maxAvg /= maxValues.length;
        minAvg /= minValues.length;

        dataContent.push({id: datasetName+"_minS", x: this.startTime, y: conversion(minAvg), group: datasetName+ "_min"});
        dataContent.push({id: datasetName+"_minE", x: this.endTime,   y: conversion(minAvg), group: datasetName+ "_min"});
        dataContent.push({id: datasetName+"_maxS", x: this.startTime, y: conversion(maxAvg), group: datasetName+ "_max"});
        dataContent.push({id: datasetName+"_maxE", x: this.endTime,   y: conversion(maxAvg), group: datasetName+ "_max"});
        dataContent.push({id: datasetName+"_midS", x: this.startTime, y: conversion(0.5*(minAvg+maxAvg)), group: datasetName + "_mid"});
        dataContent.push({id: datasetName+"_midE", x: this.endTime,   y: conversion(0.5*(minAvg+maxAvg)), group: datasetName + "_mid"});
      }

      for (let i = 0; i < this.jsonContent[datasetName].length; i++) {
        let point = this.jsonContent[datasetName][i];
        if (point[1] === ADC_RESET_STRING) { continue; }

        if (this.startTime <= point[0] && this.endTime >= point[0]) {
          dataContent.push({id: i + "ds:" + datasetName, x: point[0], y: conversion(point[1]), group: datasetName});
          this.graphData.push(conversion(point[1]))
        }

        if (refreshPreview) {
          if (i % 2 === 0) {
            dataContentPreview.push({
              id: i + "dsprev:" + datasetName,
              x: point[0],
              y: point[1],
              group: 'prev' + datasetName
            })
          }
        }
      }
    })

    this.dataset.update(dataContent);
    if (refreshPreview) {
      this.datasetPreview.update(dataContentPreview);
    }


    eventBus.emit("FIT_GRAPH", refreshPreview)
  }


  _getFFT() {
    if (this.graphData.length > 0) {
      let pow = Math.pow(2,Math.floor(Math.log(this.graphData.length)/Math.log(2)));
      let d = []
      for (let i = 0; i < pow; i++) {
        d.push(this.graphData[i])
      }

      let phasors = fft.fft(d);

      let frequencies = fft.util.fftFreq(phasors, 5000); // Sample rate and coef is just used for length, and frequency step
      let magnitudes = fft.util.fftMag(phasors);

      // this.fftDataset.clear()
      let data = [];
      for (let i = 0; i < frequencies.length; i++) {
        data.push({id: i, x: frequencies[i], y: magnitudes[i]})
      }
      this.fftDataset.update(data);
      this.graphRefFFT.fitGraph()
    }
  }


  _loadData(refreshPreview) {
    this.setState({graphActive: true, showSourceSelection: false});
    this._reloadData(refreshPreview)
  }

  _toggleData(source ) {
    let index = this.visibleData.indexOf(source)

    if (index === -1) {
      this.visibleData.push(source);
    }
    else {
      this.visibleData.splice(index,1)
    }

    this.forceUpdate()
  }

  _getContent() {
    if (this.state.showSourceSelection === true) {
      return (
        <div style={{
          borderStyle:'solid',
          borderWidth: '2px',
          borderRadius: 15,
          borderColor:"#e5eaec",
          backgroundColor: colors.darkBackground.rgba(0.1),
          width: '100%',
          height:(window as any).REPLAY_GRAPH_HEIGHT,
        }}
        >
          <Flexbox flexDirection={'column'}>
            <Flexbox height={'30px'} />
            <Flexbox flexDirection={'row'} height={(window as any).REPLAY_GRAPH_HEIGHT + 'px'} width={'100%'}>
              <Flexbox flexGrow={1} />
              <Flexbox flexDirection={'column'}>
                <div style={{margin:10, padding:10, backgroundColor:"#fff"}}><span>{"Select data to plot:"}</span></div>
                <RaisedButton primary={this.visibleData.indexOf('voltage') !== -1} style={buttonStyle} onClick={() => { this._toggleData('voltage') }} label={"Voltage (" + (this.jsonContent['voltage'] ? this.jsonContent['voltage'].length : 'No data' ) + " points)"} />
                <RaisedButton primary={this.visibleData.indexOf('current') !== -1} style={buttonStyle} onClick={() => { this._toggleData('current') }} label={"Current (" + (this.jsonContent['current'] ? this.jsonContent['current'].length : 'No data' ) + " points)"} />
                <RaisedButton primary={this.visibleData.indexOf('filteredCurrent') !== -1} style={buttonStyle} onClick={() => { this._toggleData('filteredCurrent') }} label={"Filtered Current (" + (this.jsonContent['filteredCurrent'] ? this.jsonContent['filteredCurrent'].length : 'No data') + " points)"} />
                <RaisedButton primary={true} style={buttonStyle} onClick={() => { this._loadData(true) }} label={"Plot"} />
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
          height:(window as any).REPLAY_GRAPH_HEIGHT,
          backgroundImage: 'url("./images/placeholder.png',
          backgroundRepeat: 'no-repeat',
          backgroundPosition:'center',
        }}
        >
          <a onClick={() => { this.setState({showSourceSelection: true})}}>
            <div style={{ width:'100%', height:(window as any).REPLAY_GRAPH_HEIGHT }}/>
          </a>
        </div>
      )
    }
    else if (this.state.graphActive === true) {
      return (
        <div style={{
          position:'relative',
          borderStyle:'solid',
          borderWidth: '2px',
          borderRadius: 15,
          borderColor:"#e5eaec",
          backgroundColor: colors.white.hex,
          width:'100%',
          height:(window as any).REPLAY_GRAPH_HEIGHT,
        }}
        >
          <Flexbox flexDirection={'column'}>
            <VisGraph
              width={'100%'}
              ref={(graphRef) => {this.graphRef = graphRef; }}
              height={(window as any).REPLAY_GRAPH_HEIGHT}
              data={this.dataset}
              options={this.baseOptions}
              showRangeInputs={true}
            />
          </Flexbox>
          { this._getLeftCommandIcons()  }
          { this._getRightCommandIcons()  }
        </div>
      )
    }
  }

  _getLeftCommandIcons() {
    let iconStyle = {borderRadius:24};
    return (
      <div style={{position:'absolute', top:-24, left:-24, width: 48, height: (window as any).REPLAY_GRAPH_HEIGHT - 6}}>
        <Flexbox flexDirection={'column'} flexGrow={1} height={'100%'}>
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

  _getRightCommandIcons() {
    let iconStyle = {borderRadius:24};

    let buttons = [
      <IconButton key={this.uuid + 'closeButton'} tooltip="Close Graph" touch={true} tooltipPosition="bottom-left" style={{...iconStyle, backgroundColor: colors.darkBackground.hex}}
                  onClick={() => { this.setState({showSourceSelection: true}) }}>
        <AvAddToQueue color={colors.white.hex} />
      </IconButton>
    ];

    return (
      <div style={{position:'absolute', top:-24, right:-24, width: 48, height: (window as any).REPLAY_GRAPH_HEIGHT}}>
        <Flexbox flexDirection={'column'}>
          {buttons}
        </Flexbox>
      </div>
    )
  }

  getTimeRange() {
    let length = Math.max(Math.max(this.jsonContent.current.length,this.jsonContent.voltage.length), this.jsonContent.filteredCurrent.length);
    this.setState({maxTime: length})

  }

  handleFiles() {
    let file = this.inputRef.files[0];
    let fr = new FileReader();
    fr.readAsText(file);
    fr.onload = () => {
      this.jsonContent = JSON.parse(fr.result);
      if (this.jsonContent.config) {
        if (this.jsonContent.config.differential !== undefined) { (window as any).___DIFFERENTIAL = this.jsonContent.config.differential }
        if (this.jsonContent.config.range !== undefined)        { (window as any).___RANGE = this.jsonContent.config.range }
        if (this.jsonContent.config.pin !== undefined)          { (window as any).___PIN = this.jsonContent.config.pin }

        if (this.jsonContent.config.multipliers !== undefined)  { (window as any).PIN_MULTIPLIERS = this.jsonContent.config.multipliers }
        if (this.jsonContent.config.shuntResistance !== undefined)  { (window as any).SHUNT_RESISTANCE = this.jsonContent.config.shuntResistance }

        this.loadedConfig = true;
      }

      this.getTimeRange()
    }
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
        <StateIndicator label={ "Voltage" } value={(window as any).VIEW_MODE === 'Voltage'} onClick={() => {(window as any).VIEW_MODE = 'Voltage'; this._reloadData(false); this.forceUpdate(); }} />
      </div>
    )
    result.push(
      <div key={'amp'} style={{paddingBottom:5}}>
        <StateIndicator label={ "Amperage" } value={(window as any).VIEW_MODE === 'Amperage'} onClick={() => {(window as any).VIEW_MODE = 'Amperage'; this._reloadData(false); this.forceUpdate(); }} />
      </div>
    )
    result.push(
      <div key={'adc'} style={{paddingBottom:5}}>
        <StateIndicator label={ "ADC" } value={(window as any).VIEW_MODE === 'ADC'} onClick={() => {(window as any).VIEW_MODE = 'ADC'; this._reloadData(false); this.forceUpdate(); }} />
      </div>
    )
    return result;
  }

  _getDescription() {
    let label = ''
    if (this.loadedConfig) {
      label += "Differential: " + (window as any).___DIFFERENTIAL
      label += "     Range: " + (window as any).___RANGE
      label += "     Pin: " + (window as any).___PIN
    }
    return <span>{label}</span>
  }

  render() {

    return (
      <Flexbox flexDirection={'column'} style={{marginLeft: 30, marginRight:30, marginTop:30, position:'relative'}}>
        {this._getDescription()}
        <input type="file" ref={(inputRef) => {this.inputRef = inputRef; }} id="input" onChange={() => { this.handleFiles() }} />
        <div style={{width:'100%', height:(window as any).REPLAY_GRAPH_HEIGHT}}>
          { this._getContent() }
        </div>
        <Flexbox flexDirection={'row'}>
          <div style={{width:300}}>{this._getPinEntries()}</div>
          <Flexbox flex={"1"} width={'100%'}/>
          <div style={{}}>{this._getViewModes()}</div>
        </Flexbox>
        <div>
          <VisPreviewGraph width={'100%'} ref={(graphRefPreview) => {this.graphRefPreview = graphRefPreview; }} height={100} data={this.datasetPreview} options={this.previewBaseOptions} />
        </div>
        <div style={{position:'relative', top:-100}}>
          <VisTimeline width={'100%'}  ref={(timelineRef) => {this.timelineRef = timelineRef; }} maxTime={this.state.maxTime} height={100} />
        </div>

        <div>
          <input type={"button"} onClick={()=>{this._getFFT()}} value={"Refresh FFT"} />
          <VisGraph
            width={'100%'}
            ref={(graphRef) => {this.graphRefFFT = graphRef; }}
            height={(window as any).REPLAY_GRAPH_HEIGHT}
            data={this.fftDataset}
            options={this.baseOptions}
            showRangeInputs={true}
            ignoreSync={true}
          />
        </div>
      </Flexbox>
    );
  }

}


export { ReplayGraph }