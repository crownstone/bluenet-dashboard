import * as React from "react";

import Flexbox            from 'flexbox-react';
import { colors }         from "../styles";
import * as visjs from "vis"


class VisGraph extends React.Component<any,any> {
  container;
  graph;

  componentDidMount() {
    let groups = new visjs.DataSet();
    groups.add({
      id: '__ungrouped__',
      className:'defaultGraphStyle',
      options: {
        drawPoints: false,
        shaded: {
          orientation: 'bottom' // top, bottom
        }
      }});

    let options = {
      width: this.props.width,
      height: this.props.height,
      dataAxis: {
        visible: this.props.showAxis || false
      },
      showMinorLabels: this.props.showTime || false,
      showMajorLabels: this.props.showTime || false,
      showCurrentTime: this.props.showTime || false,
    };


    this.graph = new visjs.Graph2d(this.container, this.props.data, groups, options);
  }

  render() {
    return (
      <div ref={(div) => { this.container = div; }} id="visDiv" style={{position:'relative', width:'100%', height:'100%'}} />
    )
  }
}

export { VisGraph }

