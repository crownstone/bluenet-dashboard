import * as React from "react";

import Flexbox            from 'flexbox-react';
import { colors }         from "../styles";
import {VisGraph} from "./VisGraph";
import FontIcon from "material-ui/FontIcon";
import IconButton from "material-ui/IconButton";
import RaisedButton from "material-ui/RaisedButton";


class BigGraph extends React.Component<any,any> {
  render() {
    return (
      <Flexbox flexDirection={'column'} style={{marginLeft: 30, marginTop:30}}>
        <VisGraph data={ this.props.data } width={'100%'} height={300} showTime={true} showAxis={true} />
      </Flexbox>
    )
  }
}


export { BigGraph }

