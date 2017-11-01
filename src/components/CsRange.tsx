import * as React from "react";

import Flexbox            from 'flexbox-react';
import { colors }         from "../styles";
import RaisedButton from "material-ui/RaisedButton";

class CsRange extends React.Component<
  {decrease() : void, increase(): void, value: any, label: string}

  ,any> {
  render() {
    let size = 50;
    let buttonStyle = {width: size, minWidth:size, height:size, minHeight: size};

    return (
      <Flexbox
        flexDirection={"row"}
        style={{
          width: 300,
          height: size,
          marginRight: 20,
          borderColor: colors.black.rgba(0.1),
          borderStyle: 'solid',
          borderWidth: 1,
          borderRadius: 10,
          overflow: 'hidden'
        }}>
        <RaisedButton
          label={"-"}
          primary={true}
          labelStyle={{color: colors.white.hex, fontWeight: 'bolder', fontSize: 20}}
          style={buttonStyle}
          onClick={() => { this.props.decrease() }}
        />
        <Flexbox flexGrow={1} alignItems={'center'} justifyContent={'center'} flexDirection={"column"}>
          <Flexbox flexGrow={1} />
          <span style={{fontSize:16, fontWeight:'bold'}}>{this.props.label}</span>
          <Flexbox flexGrow={1} />
          <span style={{fontSize:14, color: colors.gray.hex}}>{"currentValue: " + ((this.props.value === null || this.props.value === undefined) ? '?' : this.props.value)}</span>
          <Flexbox flexGrow={1} />
        </Flexbox>
        <RaisedButton
          label={"+"}
          primary={true}
          labelStyle={{color: colors.white.hex, fontWeight: 'bolder', fontSize: 20}}
          style={buttonStyle}
          onClick={() => { this.props.increase() }}
        />
      </Flexbox>
    )
  }
}

export { CsRange }

