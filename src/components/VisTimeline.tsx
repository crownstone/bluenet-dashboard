import * as React from "react";

import * as visjs from "vis"
import {eventBus} from "../util/EventBus";
import {Util} from "../util/Util";
import {colors} from "../styles";

const vis = (visjs as any);

class VisTimeline extends React.Component<{ width: any, height: any, maxTime: number},any> {

  container;
  timeline;
  id;

  startTime = -1
  endTime = 5000

  startTimeId = 1
  endTimeId = 2

  dataset = new vis.DataSet();
  timeChanged = false;

  constructor() {
    super();
    this.id = Util.getUUID()
  }


  componentDidMount() {
    let options = {
      width: '100%',
      height: this.props.height,
      rollingMode:false,
      showMinorLabels: false,
      showMajorLabels: false,
      showCurrentTime: false,
      stack:false,
      start:this.startTime - 1000, end: this.endTime + 1000
    };


    this.timeline = new vis.Timeline(this.container, this.dataset, options);

    this.timeline.on("click", (data) => {
      if (!this.timeChanged) {
        let time = data.time.valueOf();

        let centerTime = (this.endTime + this.startTime)*0.5;
        let dt = this.endTime - centerTime;

        this.startTime = time - dt;
        this.endTime   = time + dt;

        this.timeline.setCustomTime(new Date(this.startTime), this.startTimeId);
        this.timeline.setCustomTime(new Date(this.endTime), this.endTimeId);
        this._updateRanges(this.props.maxTime);
      }

      this.timeChanged = false;
    });

    this.timeline.on("timechanged", (data) => {
      let time = data.time.valueOf() || -1;
      if (data.id === this.startTimeId) {
        if (time >= this.endTime) {
          this.timeline.setCustomTime(this.endTime - 1000, this.startTimeId)
          this.startTime = this.endTime - 1000;
        }
        else {
          this.startTime = time;
        }
      }
      else {
        if (time <= this.startTime) {
          this.timeline.setCustomTime(this.startTime + 1000, this.endTimeId);
          this.endTime = this.startTime + 1000;
        }
        else {
          this.endTime = time;
        }
      }
      this.timeChanged = true;
      this._updateRanges(this.props.maxTime);

    })

    this.startTimeId = this.timeline.addCustomTime(new Date(this.startTime), this.startTimeId);
    this.endTimeId   = this.timeline.addCustomTime(new Date(this.endTime), this.endTimeId);
  }

  _updateRanges(maxTime) {
    let sharedStyle = ';color:rgba(0,0,0,0.5);border-width:0px;'

    this.dataset.update({id:1, height:60, content:'<br>Hidden<br><br>', start:-1, end: this.startTime, style:"background-color:" + colors.csOrange.rgba(0.4) + sharedStyle})
    this.dataset.update({id:2, height:60, content:'<br>Visible data. Drag the bars to select the viewable range.<br><br>', start:this.startTime, end: this.endTime, style:"background-color:" + colors.green.rgba(0.4) + sharedStyle})
    this.dataset.update({id:3, height:60, content:'<br>Hidden<br><br>', start: this.endTime, end: maxTime, style:"background-color:" + colors.csOrange.rgba(0.4) + sharedStyle});

    eventBus.emit("applyDataRange", {startTime: this.startTime, endTime: this.endTime} );
  }

  componentWillReceiveProps(newProps) {
    if (this.props.maxTime !== newProps.maxTime) {
      let newMax = newProps.maxTime
      if (newProps.maxTime > 10000) {
        newMax = 10000;
      }

      this.endTime = newMax;

      this._updateRanges(newProps.maxTime)


      this.timeline.setCustomTime(newMax, this.endTimeId);
      this.timeline.fit()
      this.timeline.setOptions({moveable: false, zoomable: false})


    }
  }


  render() {


    return (
      <div ref={(div) => { this.container = div; }} id={'visTimelineDiv' + this.id} style={{position:'relative', width:'100%', height:'100%'}} />
    )
  }
}

export { VisTimeline }

