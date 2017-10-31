import * as React from "react";
import {deepOrange500} from 'material-ui/styles/colors';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import Flexbox from 'flexbox-react';

import { CrownstoneCommands } from "../components/CrownstoneCommands";

const muiTheme = getMuiTheme({
  fontFamily: 'Roboto',
  palette: {
    accent1Color: deepOrange500,
  },
});

class Data extends React.Component<any,any> {
  render() {
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <Flexbox flexDirection="column" minHeight="100vh">
          <span>data</span>
        </Flexbox>
      </MuiThemeProvider>
    );
  }
}

export { Data }