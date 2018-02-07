import * as React from "react";

import Flexbox            from 'flexbox-react';
import { colors }         from "../styles";
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

class VisGraph extends React.Component<{
  width: any,
  height: any,
  showTime?: boolean,
  showAxis?:boolean
  syncToken?:string,
  historyTrackCount?:number,
  data: any,
  timeRange: any,
  dataRange: any,
},any> {
  container;
  graph;
  options;
  id;

  zoomable = true;
  dataRange = null;
  activeModifiers : any = {};


  constructor() {
    super();

    this.id = Util.getUUID()
  }


  componentDidMount() {
    this.options = {
      width: this.props.width,
      height: this.props.height,
      interpolation: false,
      sampling: false,
      dataAxis: {
        alignZeros: false,
        visible: this.props.showAxis || false
      },
      showMinorLabels: this.props.showTime || false,
      showMajorLabels: this.props.showTime || false,
      showCurrentTime: this.props.showTime || false,
    };

    this.dataRange = { min: this.props.dataRange.min, max: this.props.dataRange.max }


    this.options['dataAxis']['left'] = {range: {min: this.dataRange.min, max: this.dataRange.max}}

    this._loadData(this.props);

    if (this.props.historyTrackCount) {
      this.props.data.on("add", () => {
        if (this.props.timeRange) {
          this.graph.setWindow(this.props.timeRange.min, this.props.timeRange.max, {animation:false})
        }
        else {
          this.graph.setWindow(new Date().valueOf() - 120000, new Date().valueOf() + 20000, {animation:false})
        }
      });
    }

    if (this.props.syncToken) {
      let topic = this.props.syncToken + "_rangechanged";
      this.graph.on("rangechanged", (data) => {
        if (data.byUser) {
          eventBus.emit(topic, {start: data.start, end: data.end, id: this.id})
        }
      });

      eventBus.on(topic, (data) => {
        if (data.id === this.id) { return; }
        this.graph.setWindow(data.start, data.end, {animation:false})
      })
    }

    this.graph.on("mousewheel", (event) => {
      if (this.zoomable === false) {
        if (event.deltaX === 0) {
          return
        }
        let center = (this.dataRange.max + this.dataRange.min) / 2;
        let distance = center - this.dataRange.min;
        if (this.activeModifiers['shift'] && this.activeModifiers['ctrl']) {

          let factor = 1.06
          if (event.deltaX > 0) {
            factor = 0.94
          }
          let newCenter = center * factor;
          this.dataRange = {min: newCenter - distance, max: newCenter + distance};
        }
        else if (this.activeModifiers['shift']) {
          let factor = 1.06
          if (event.deltaX > 0) {
            factor = 0.94
          }
          let newDistance = factor * distance;
          this.dataRange = {min: center - newDistance, max: center + newDistance};
        }

        this.graph.setOptions({dataAxis: {left: {range: {min: this.dataRange.min, max: this.dataRange.max}}}})
      }
    })

    eventBus.on('modifierPressed', (data) => {
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
    })
  }

  _loadData(props : any) {
    if (props.data === null) {
      if (this.graph) {
        this.graph.setItems([]);
      }
      else {
        this.graph = new vis.Graph2d(this.container, [], DataStore.groups, this.options);
      }
    }
    else {
      if (this.graph) {
        this.graph.setItems(props.data);
      }
      else {
        this.graph = new vis.Graph2d(this.container, props.data, DataStore.groups, this.options);
      }
    }
  }

  componentWillReceiveProps(nextProps,nextState) {
    if (this.props.data !== nextProps.data) {
      this._loadData(nextProps);
    }

    if (nextProps.dataRange.min !== this.dataRange.min || nextProps.dataRange.max !== this.dataRange.max) {
      this.dataRange = { min: nextProps.dataRange.min, max: nextProps.dataRange.max }
    }

    this.graph.setOptions({dataAxis: {left: {range: {min: this.dataRange.min, max: this.dataRange.max}}}})

    if (this.props.timeRange) {
      this.graph.setWindow(this.props.timeRange.min, this.props.timeRange.max, {animation:false})
    }
    else {
      this.graph.setWindow(new Date().valueOf() - 120000, new Date().valueOf() + 20000, {animation:false})
    }
  }

  render() {
    return (
      <div ref={(div) => { this.container = div; }} id="visDiv" style={{position:'relative', width:'100%', height:'100%'}} />
    )
  }
}

export { VisGraph }

