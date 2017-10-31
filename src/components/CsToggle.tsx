import * as React from "react";

import Flexbox            from 'flexbox-react';
import FlatButton from "material-ui/FlatButton";
import { colors }         from "../styles";

class CsToggle extends React.Component<{label: string, value: any, toggle(): void},any> {
  render() {
    return (
      <Flexbox style={{
        marginRight: 20,
        width:300,
        borderRadius: 10,
        height:50,
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: colors.black.rgba(0.1),
        overflow:'hidden'
      }}>
        <FlatButton
          backgroundColor={this.props.value ? colors.green.hex : colors.csBlue.hex}
          label={this.props.label}
          hoverColor={colors.csOrange.hex}
          labelStyle={{color: colors.white.hex}}
          style={{
            width:300,
            height:50,
          }}
          onClick={() => { this.props.toggle() }}
        />
      </Flexbox>
    )
  }
}

export { CsToggle }

