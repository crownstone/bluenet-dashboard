import * as React from "react";
import Flexbox from "flexbox-react";
import RaisedButton from "material-ui/RaisedButton";
import {colors} from "../styles";
import {VisGraph} from "./VisGraph";
import {Util} from "../util/Util";


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
const vis = (visjs as any);

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

class ReplayGraph extends React.Component<any,any> {
  baseOptions : any;
  previewBaseOptions : any;
  uuid: string;
  graphRef: any;
  graphRefPreview: any;
  inputRef: any;
  timelineRef: any;

  jsonContent : any = {}

  dataset = new vis.DataSet();
  datasetPreview = new vis.DataSet();

  visibleData = [];

  startTime = -1;
  endTime = 5000;

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
      height: GRAPH_HEIGHT,
      interpolation: false,
      sampling: false,
      dataAxis: {
        left: { range: { min: -100, max: 4100 }},
        visible: true,
        width: '100px'
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
        left: { range: { min: -100, max: 4100 }},
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
    this.visibleData.forEach((datasetName) => {
      if (!this.jsonContent)                     { return }
      if (!this.jsonContent[datasetName].length) { return }

      for (let i = 0; i < this.jsonContent[datasetName].length; i++) {
        let point = this.jsonContent[datasetName][i];

        if (this.startTime <= point[0] && this.endTime >= point[0]) {
          dataContent.push({id: i + "ds:" + datasetName, x: point[0], y: point[1], group: datasetName})
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
          height:GRAPH_HEIGHT,
        }}
        >
          <Flexbox flexDirection={'column'}>
            <Flexbox height={'30px'} />
            <Flexbox flexDirection={'row'} height={GRAPH_HEIGHT + 'px'} width={'100%'}>
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
          height:GRAPH_HEIGHT,
        }}
        >
          <Flexbox flexDirection={'column'}>
            <VisGraph  width={'100%'}  ref={(graphRef) => {this.graphRef = graphRef; }} height={GRAPH_HEIGHT} data={this.dataset} options={this.baseOptions} />
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
      <div style={{position:'absolute', top:-24, left:-24, width: 48, height: GRAPH_HEIGHT + 24}}>
        <Flexbox flexDirection={'column'} flexGrow={1} height={'100%'}>
          <Flexbox flexGrow={1} />
          <IconButton
            touch={true}
            style={{...iconStyle, backgroundColor: colors.green.hex}}
            onClick={() => { this.graphRef._increaseOffset() }}
          >
            <HardwareKeyboardArrowUp color={colors.white.hex} />
          </IconButton>
          <IconButton
            touch={true}
            style={{...iconStyle, backgroundColor: colors.green.hex}}
            onClick={() => { this.graphRef._decreaseOffset() }}
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
      <div style={{position:'absolute', top:-24, right:-24, width: 48, height: GRAPH_HEIGHT}}>
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
      this.getTimeRange()
    }
  }


  render() {
    return (
      <Flexbox flexDirection={'column'} style={{marginLeft: 30, marginRight:30, marginTop:30, position:'relative'}}>
        <input type="file" ref={(inputRef) => {this.inputRef = inputRef; }} id="input" onChange={() => { this.handleFiles() }} />
        <div style={{width:'100%', height:GRAPH_HEIGHT}}>
          { this._getContent() }
        </div>
        <div>
        <VisPreviewGraph    width={'100%'}  ref={(graphRefPreview) => {this.graphRefPreview = graphRefPreview; }} height={100} data={this.datasetPreview} options={this.previewBaseOptions} />
        </div>
        <div style={{position:'relative', top:-100}}>
          <VisTimeline width={'100%'}  ref={(timelineRef) => {this.timelineRef = timelineRef; }} maxTime={this.state.maxTime} height={100} />
        </div>
      </Flexbox>
    );
  }

}


export { ReplayGraph }