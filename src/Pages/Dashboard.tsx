import * as React from "react";
import {deepOrange500} from 'material-ui/styles/colors';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import Flexbox from 'flexbox-react';

import { SideMenu } from '../PageElements/SideMenu'
import { Header } from '../PageElements/Header'

const muiTheme = getMuiTheme({
  fontFamily: 'Roboto',
  palette: {
    accent1Color: deepOrange500,
  },
});

class Dashboard extends React.Component<any,any> {
    render() {
        return (
          <MuiThemeProvider muiTheme={muiTheme}>
              <Flexbox flexDirection="column" minHeight="100vh">
                DashBoardy-x
              </Flexbox>
          </MuiThemeProvider>
        )
    }
}

export { Dashboard }

