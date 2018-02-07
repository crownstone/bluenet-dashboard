import * as React from "react";

import Flexbox            from 'flexbox-react';
import { colors }         from "../styles";
import {VisGraph} from "./VisGraph";


class BigGraph extends React.Component<{data: any, syncToken?: string, dataRange: any, timeRange: any} ,any> {
  render() {
    return (
      <Flexbox flexDirection={'column'} style={{marginLeft: 30, marginTop:30}}>
        <VisGraph data={ this.props.data } width={'100%'} height={600} showTime={true} dataRange={this.props.dataRange} showAxis={true} syncToken={this.props.syncToken} timeRange={this.props.timeRange} />
      </Flexbox>
    )
  }
}


export { BigGraph }

