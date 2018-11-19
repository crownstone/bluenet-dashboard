import * as React from "react";
import {deepOrange500} from 'material-ui/styles/colors';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Flexbox from 'flexbox-react';
import {ReplayGraph} from "../components/ReplayGraph";

const muiTheme = getMuiTheme({
  fontFamily: 'Roboto',
  palette: {
    accent1Color: deepOrange500,
  },
});

class Playback extends React.Component<any,any> {
  render() {
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <Flexbox flexDirection="column" minHeight="100vh" width="100%">
          <span style={{fontSize:15}}>Usage explanation: hold shift+scroll to zoom the Y-range, hold shift+control+scroll to offset the Y-range.</span>
          {
            (window as any).MULTIPLICATION_FACTOR != 1 ?
            <span style={{fontSize:15, fontWeight: 'bold'}}>{"ACTIVE MULTIPLICATION FACTOR: " + (window as any).MULTIPLICATION_FACTOR}</span> :
            undefined
          }
          <ReplayGraph />
        </Flexbox>
      </MuiThemeProvider>
    );
  }
}

export { Playback }