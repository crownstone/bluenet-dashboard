import * as React from "react";
import Flexbox from 'flexbox-react';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';

import { hashHistory } from 'react-router'
import {colors} from "../styles";

class SideMenu extends React.Component<any,any> {
  render() {
    let itemStyle = {
      borderStyle:'solid',
      borderColor:colors.black.rgba(0.2),
      marginBottom: 5,
      borderRightWidth:3, borderLeftWidth:0, borderTopWidth:0, borderBottomWidth:0};
    return (
      <Flexbox flexGrow={1} flexDirection="row" style={{marginLeft:10, marginTop:11}}>
        <Flexbox flexDirection="column">
          <Menu>
            <MenuItem style={itemStyle} primaryText="Commands"          onTouchTap={() => { hashHistory.push('commands') }} />
            <MenuItem style={itemStyle} primaryText="Data"              onTouchTap={() => { hashHistory.push('data') }} />
            <MenuItem style={itemStyle} primaryText="Save Snapshot"     onTouchTap={() => { alert("not implemented yet") }} />
            <MenuItem style={itemStyle} primaryText="Load Snapshot"     onTouchTap={() => { alert("not implemented yet") }} />
            <MenuItem style={itemStyle} primaryText="Compare Snapshots" onTouchTap={() => { hashHistory.push('compare') }} />
          </Menu>
        </Flexbox>
      </Flexbox>
    );
  }
}

export { SideMenu }

