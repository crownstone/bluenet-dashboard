import * as React from "react";

import Flexbox            from 'flexbox-react';
import { colors }         from "../styles";
import * as visjs from "vis"
import {eventBus} from "../util/EventBus";
import {Util} from "../util/Util";


class VisGraph extends React.Component<any,any> {
  container;
  graph;
  groups;
  options;
  id;

  constructor() {
    super();

    this.id = Util.getUUID()
  }


  componentDidMount() {
    this.groups = new visjs.DataSet();
    this.groups.add({
      id: '__ungrouped__',
      className:'defaultGraphStyle',
      options: {
        drawPoints: false,
        shaded: {
          orientation: 'bottom' // top, bottom
        }
      }});

    this.options = {
      width: this.props.width,
      height: this.props.height,
      dataAxis: {
        visible: this.props.showAxis || false
      },
      showMinorLabels: this.props.showTime || false,
      showMajorLabels: this.props.showTime || false,
      showCurrentTime: this.props.showTime || false,
    };

    this._loadData(this.props);

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
  }

  _loadData(props) {
    if (props.data === null) {
      if (this.graph) {
        this.graph.setItems([]);
      }
      else {
        this.graph = new visjs.Graph2d(this.container, [], this.groups, this.options);
      }
    }
    else {
      if (this.graph) {
        this.graph.setItems(props.data);
      }
      else {
        this.graph = new visjs.Graph2d(this.container, props.data, this.groups, this.options);
      }
    }
    this.graph.fit()
  }

  componentWillReceiveProps(nextProps,nextState) {
    if (this.props.data !== nextProps.data) {
      this._loadData(nextProps);
    }
  }

  render() {
    return (
      <div ref={(div) => { this.container = div; }} id="visDiv" style={{position:'relative', width:'100%', height:'100%'}} />
    )
  }
}

export { VisGraph }

