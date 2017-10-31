import * as React from "react";

import Flexbox            from 'flexbox-react';
import { StateIndicator } from "./StateIndicator";
import { colors }         from "../styles";
import RaisedButton from "material-ui/RaisedButton";

class CsButton extends React.Component<any,any> {
  render() {
    return (
      <Flexbox style={{
        marginRight: 20,
        width: 300,
        borderRadius: 10,
        height: 50,
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: colors.black.rgba(0.1),
        overflow: 'hidden'
      }}>
        <RaisedButton
          backgroundColor={this.props.value ? colors.green.hex : colors.csBlue.hex}
          label={this.props.label}
          primary={true}
          labelStyle={{color: colors.white.hex}}
          style={{
            width: 300,
            height: 50,
          }}
          onClick={() => {
            this.props.toggle()
          }}
        />
      </Flexbox>
    )
  }
}

export { CsButton }

