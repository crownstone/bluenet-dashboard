import * as React from "react";

import Flexbox            from 'flexbox-react';
import { colors }         from "../styles";
import {VisGraph} from "./VisGraph";
import FontIcon from "material-ui/FontIcon";
import IconButton from "material-ui/IconButton";
import RaisedButton from "material-ui/RaisedButton";


class SmallGraph extends React.Component<{label: string, data: any, callback(number): void},any> {
  render() {
    return (
      <Flexbox flexDirection={'column'}>
        <span>{this.props.label}</span>
        <Flexbox flexDirection={'row'} style={{margin: 20, marginTop:10}}>
          <VisGraph data={ this.props.data } width={150} height={100}/>
          <Flexbox flexDirection={'column'} style={{marginLeft: 10}}>
            <GraphIcon callback={ () => { this.props.callback(1); }}/>
            <GraphIcon callback={ () => { this.props.callback(2); }}/>
            <GraphIcon callback={ () => { this.props.callback(3); }}/>
          </Flexbox>
        </Flexbox>
      </Flexbox>
    )
  }
}

class GraphIcon extends React.Component<{callback(): void},any> {
  render() {
    return (
      <Flexbox style={{
        width:25,
        height:25,
        borderRadius: 5,
        marginBottom:10
      }}>
        <RaisedButton
          icon={
            <FontIcon
              className="material-icons"
              style={{
                fontSize:24,
                color: colors.white.hex,
              }}>
              timeline
            </FontIcon>
          }
          backgroundColor={colors.csBlue.rgba(0.6)}
          style={{
            width:30,
            minWidth:30,
            height:30,
          }}
          onClick={() => { this.props.callback(); }}
        />
      </Flexbox>
    )
  }
}



export { SmallGraph }

