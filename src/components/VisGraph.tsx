import * as React from "react";

import * as visjs from "vis"
import {eventBus} from "../util/EventBus";
import {Util} from "../util/Util";
import {DataStore} from "../data/dataStore";
 
const vis = (visjs as any);

window["isKeyPressed"] = function(event) {
  if (event.shiftKey || event.ctrlKey) {
    eventBus.emit("modifierPressed", event) 
  }
}

window["onKeyUp"] = function(event) {
  if (event.shiftKey || event.ctrlKey) {
    eventBus.emit("modifierPressed", event)
  }
  else {
    eventBus.emit("modifierPressed", null)
  }
}

function formatter(value) {
  let dec = value - Math.floor(value);
  if (dec > 0) {
    return '' + (value - dec) + '.' + Math.floor(dec * 1000);
  }
  else {
    return value;
  }
}


class VisGraph extends React.Component<{ width: any, height: any, options: any, data: any,ignoreSync?:boolean, realtimeData?: boolean, showRangeInputs?: boolean},any> {

  container;
  graph;
  id;
  inputMin;
  inputMax;
  customTimeId = null;
  loadOnNextData = false;
  timeSinceLastOffset = 0
  timeSinceLastZoom = 0

  zoomable = true;
  dataRange = null;
  activeModifiers : any = {};

  unsubscribe = []

  constructor() {
    super();
    this.id = Util.getUUID()
  }


  componentDidMount() {
    this.dataRange = {
      min: this.props.options['dataAxis']['left']['range']['min'],
      max: this.props.options['dataAxis']['left']['range']['max'],
    };

    this._loadData(this.props);

    if (this.props.realtimeData) {
      this.props.data.on("add", () => {
        this.graph.setWindow(new Date().valueOf() - 120000, new Date().valueOf() + 20000, {animation:false})
      });
    }

    let syncToken = this.props.realtimeData ? 'realTimeSync' : 'fixedSync'
    if (this.props.ignoreSync === true) {
      syncToken = this.id;
    }

    let topic = syncToken + "_rangechanged";
    this.graph.on("rangechanged", (data) => {
      if (data.byUser) {
        eventBus.emit(topic, {start: data.start, end: data.end, id: this.id})
      }
    });

    this.graph.on("doubleClick", (data) => {
      eventBus.emit("setCustomTime", data.time)
    });

    this.unsubscribe.push(eventBus.on(topic, (data) => {
      if (data.id === this.id) { return; }
      this.graph.setWindow(data.start, data.end, {animation:false})
    }))

    this.unsubscribe.push(eventBus.on("UpdatedDataset", (data) => {
      if (data.id === this.id) { return; }
      this.graph.setWindow(data.start, data.end, {animation:false})
    }))

    this.unsubscribe.push(eventBus.on("FIT_GRAPH", () => {
      this.graph.fit();
    }))

    this.graph.on("mousewheel", (event) => {
      if (this.zoomable === false) {

        // deltaX and deltaY normalization from jquery.mousewheel.js
        let deltaX = 0;
        let deltaY = 0;

        // Old school scrollwheel delta
        if ( 'detail'      in event ) { deltaY = event.detail * -1;      }
        if ( 'wheelDelta'  in event ) { deltaY = event.wheelDelta;       }
        if ( 'wheelDeltaY' in event ) { deltaY = event.wheelDeltaY;      }
        if ( 'wheelDeltaX' in event ) { deltaX = event.wheelDeltaX * -1; }

        // Firefox < 17 horizontal scrolling related to DOMMouseScroll event
        if ( 'axis' in event && event.axis === event.HORIZONTAL_AXIS ) {
          deltaX = deltaY * -1;
          deltaY = 0;
        }

        // New school wheel delta (wheel event)
        if ( 'deltaY' in event ) {
          deltaY = event.deltaY * -1;
        }
        if ( 'deltaX' in event ) {
          deltaX = event.deltaX;
        }

        if (deltaX === 0) {
          return;
        }

        event.preventDefault();

        if (this.activeModifiers['shift'] && this.activeModifiers['ctrl']) {
          this._changeOffset(deltaX < 0)
        }
        else if (this.activeModifiers['shift']) {
          this._changeYRange(deltaX < 0)
        }

      }
    })

    this.unsubscribe.push(eventBus.on('modifierPressed', (data) => {
      this.activeModifiers = {};
      if (data && data.shiftKey) { this.activeModifiers['shift'] = true; }
      if (data && data.ctrlKey)  { this.activeModifiers['ctrl'] = true; }

      if (data !== null && this.zoomable === true) {
        this.graph.setOptions({zoomable:false});
        this.zoomable = false;
      }
      else if (data === null && this.zoomable === false) {
        this.graph.setOptions({zoomable:true});
        this.zoomable = true;
      }
    }))

    this.unsubscribe.push(eventBus.on('setCustomTime', (time) => {
      if (this.customTimeId !== null) {
        this.graph.removeCustomTime(this.customTimeId);
      }

      this.customTimeId = this.graph.addCustomTime(time);
    }))

  }

  componentWillUnmount() {
    this.unsubscribe.forEach((unsub) => { unsub() });
  }

  fitGraph() {
    this.graph.fit();
  }

  setRange(min, max) {
    if (this.props.realtimeData) {
      this.graph.setWindow(new Date().valueOf() - 120000, new Date().valueOf() + 20000, {animation:false})
    }
    this.graph.setWindow(min, max, {animation:false})
  }

  reloadDataRange() {
    this.graph.setOptions({ dataAxis: { left: { range: {min: undefined, max: undefined}}} });
    setTimeout(() => {
      this._setDataRange();
      this.inputMax.value = formatter(this.dataRange.max);
      this.inputMin.value = formatter(this.dataRange.min);
    }, 200);
  }

  _applyDataRange() {
    if (this.dataRange.max === undefined) {
      this._setDataRange();
      this.graph.setOptions({
        dataAxis: {
          left: {
            range: {min: this.dataRange.min, max: this.dataRange.max},
          }
        }
      });
      this.inputMax.value = formatter(this.dataRange.max);
      this.inputMin.value = formatter(this.dataRange.min);
    }
  }

  _setDataRange() {
    this.dataRange.min = this.graph.linegraph.yAxisLeft.range.start;
    this.dataRange.max = this.graph.linegraph.yAxisLeft.range.end;
  }

  _changeYRange(zoomIn) {
    if (this.dataRange.max === undefined) {
      this._setDataRange()
    }

    let center = (this.dataRange.max + this.dataRange.min) / 2;
    let distance = center - this.dataRange.min;


    let factor = 1.06;
    if (zoomIn) {
      factor = 0.94;
    }

    let diff = new Date().valueOf() - this.timeSinceLastZoom;
    if (diff < 3000) {
      factor = Math.pow(factor, 1.5*(3-(diff*0.001)))
    }
    this.timeSinceLastZoom = new Date().valueOf();


    let newDistance = factor * distance;
    this.dataRange = {min: center - newDistance, max: center + newDistance};
    this.graph.setOptions({
      dataAxis: {
        left: {
          range: {min: this.dataRange.min, max: this.dataRange.max}
        }
      }
    });
    this.inputMax.value = formatter(this.dataRange.max);
    this.inputMin.value = formatter(this.dataRange.min);
  }

  _changeOffset(up) {
    if (this.dataRange.max === undefined) {
      this._setDataRange()
    }
    let center = (this.dataRange.max + this.dataRange.min) / 2;
    let distance = center - this.dataRange.min;
    let factor = 0.1
    if (up) {
      factor = -0.1
    }

    let diff = new Date().valueOf() - this.timeSinceLastOffset;
    if (diff < 3000) {
      factor *= 1.5*(3-(diff*0.001))
    }
    this.timeSinceLastOffset = new Date().valueOf();
    let newCenter = center + factor * distance;
    this.dataRange = {min: newCenter - distance, max: newCenter + distance};
    this.graph.setOptions({dataAxis: {left: {range: {min: this.dataRange.min, max: this.dataRange.max}}}});
    this.inputMax.value = formatter(this.dataRange.max);
    this.inputMin.value = formatter(this.dataRange.min);

  }

  _increaseOffset() {
    this._changeOffset(true);
  }

  _decreaseOffset() {
    this._changeOffset(false);
  }

  _increaseYRange() {
    this._changeYRange(true);
  }

  _decreaseYRange() {
    this._changeYRange(false);
  }


  _loadData(props : any) {
    if (props.data === null) {
      if (this.graph) {
        this.graph.setItems([]);
      }
      else {
        this.graph = new vis.Graph2d(this.container, [], DataStore.groups, this.props.options);
      }
    }
    else {
      props.data.on("*", this._applyDataRange.bind(this))
      if (this.graph) {
        this.graph.setItems(props.data);
      }
      else {
        this.graph = new vis.Graph2d(this.container, props.data, DataStore.groups, this.props.options);
      }
    }
  }

  componentWillReceiveProps(nextProps,nextState) {
    if (this.props.data !== nextProps.data) {
      this.props.data.off("*", this._applyDataRange.bind(this))
      this._loadData(nextProps);
    }
  }

  render() {
    return (
      <div style={{position:'relative', width:'100%', height:'100%'}} >
        <div ref={(div) => { this.container = div; }} id={'visDiv' + this.id} style={{position:'relative', width:'100%', height: (window as any).GRAPH_HEIGHT - 30}} />
        <div style={{display: this.props.showRangeInputs ? "block" : "none"}}>
          <input ref={(inputMin) => { this.inputMin = inputMin; }} style={{width:60, height:25}} onBlur={() => { this.graph.setOptions({dataAxis: {left: {range: {min: Number(this.inputMin.value) }}}}); }} />
          <input ref={(inputMax) => { this.inputMax = inputMax; }} style={{width:60, height:25}} onBlur={() => { this.graph.setOptions({dataAxis: {left: {range: {max: Number(this.inputMax.value) }}}}); }} />
        </div>
      </div>
    )
  }
}

export { VisGraph }

