import * as React from "react";

import * as visjs from "vis"
import {eventBus} from "../util/EventBus";
import {Util} from "../util/Util";
import {DataStore} from "../data/dataStore";
 
const vis = (visjs as any);

class VisPreviewGraph extends React.Component<{ width: any, height: any, options: any, data: any, realtimeData?: boolean},any> {

  container;
  graph;
  id;



  constructor() {
    super();
    this.id = Util.getUUID()
  }


  componentDidMount() {
    this._loadData(this.props);

    eventBus.on("FIT_GRAPH", (refreshPreview) => {
      if (refreshPreview) {
        this.graph.fit();
      }
    })
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
      this._loadData(nextProps);
    }
  }

  render() {
    return (
      <div ref={(div) => { this.container = div; }} id={'visDiv' + this.id} style={{position:'relative', width:'100%', height:'100%'}} />
    )
  }
}

export { VisPreviewGraph }

