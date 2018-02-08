import * as React from "react";
import {deepOrange500} from 'material-ui/styles/colors';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import * as visjs from "vis"
import Flexbox from 'flexbox-react';
import {GraphSelector} from "../components/GraphSelector";

const muiTheme = getMuiTheme({
  fontFamily: 'Roboto',
  palette: {
    accent1Color: deepOrange500,
  },
});

class Data extends React.Component<any,any> {

  constructor() {
    super();

    this.state = {

    }
  }

  render() {
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <Flexbox flexDirection="column" minHeight="100vh" width="100%">
          <GraphSelector />
          <GraphSelector />
          <GraphSelector />
        </Flexbox>
      </MuiThemeProvider>
    );
  }
}

export { Data }