import * as React from "react";
import Flexbox from 'flexbox-react';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';

import { browserHistory } from 'react-router'

class SideMenu extends React.Component<any,any> {
    render() {
        return (
          <Flexbox flexGrow={1} flexDirection="row" style={{marginLeft:10, marginTop:11}}>
            <Flexbox flexDirection="column">
              <Menu>
                <MenuItem primaryText="Dashboard" onTouchTap={() => { /* browserHistory.push('/keywordSearch') */ }} />
                <MenuItem primaryText="Save Snapshot" onTouchTap={() => { /* browserHistory.push('/keywordSearch') */ }} />
                <MenuItem primaryText="Load Snapshot" onTouchTap={() => { /* browserHistory.push('/keywordSearch') */ }} />
                <MenuItem primaryText="Compare Snapshots" onTouchTap={() => { /* browserHistory.push('/keywordSearch') */ }} />
              </Menu>
            </Flexbox>
          </Flexbox>
        );
    }
}

export { SideMenu }

