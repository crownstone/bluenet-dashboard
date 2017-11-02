import * as React from "react";

import Flexbox from 'flexbox-react';
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';
import { browserHistory } from 'react-router'
import store from "../router/store/store";
import {colors} from "../styles";


class StateIndicator extends React.Component<{keyValue?: string, colorMap?: any, numericValue?: number, value?: any, label?:string},any> {
  render() {
    let backgroundColor = colors.gray.rgba(0.5);
    let color = colors.lightGray.hex;
    let coverFactor = 1;
    if (this.props.keyValue && this.props.colorMap) {
      color = this.props.colorMap[this.props.keyValue].hex;
    }
    else if (this.props.numericValue) {
      color = colors.green.hex;
      coverFactor = this.props.numericValue;
    }
    else if (this.props.value) {
      color = colors.green.hex;
    }

    let width = 180;
    let height = 30;
    return (
      <div style={{
        height: height,
        width: width,
        marginRight:15,
        paddingLeft:0,
        paddingRight:10,
        position:'relative',
        borderColor: color,
        borderStyle:'solid',
        borderWidth: 2,
        backgroundColor: backgroundColor,
        overflow:'hidden',
        borderRadius:6
      }}>
        <Flexbox
          style={{position:'absolute', top:0,left:0, width: width*coverFactor, height: height, backgroundColor:color, padding: 5}}>
        </Flexbox>
        <Flexbox
          alignItems="center"
          justifyContent="center"
          style={{position:'absolute', top:0,left:0, width: width, height: height, padding: 5}}>
          <span style={{color: color === colors.lightGray.hex ? colors.gray.hex : colors.white.hex, height: 30}}>{this.props.label}</span>
        </Flexbox>
      </div>
    )
  }
}

export { StateIndicator }

