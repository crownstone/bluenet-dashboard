import * as React from "react";
import {deepOrange500} from 'material-ui/styles/colors';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import Flexbox from 'flexbox-react';

import { SideMenu } from '../pageElements/SideMenu'
import { Header } from '../pageElements/Header'

const muiTheme = getMuiTheme({
  fontFamily: 'Roboto',
  palette: {
    accent1Color: deepOrange500,
  },
});

class Error404 extends React.Component<any,any> {
    render() {
        return (
          <MuiThemeProvider muiTheme={muiTheme}>
          <Flexbox flexDirection="column" minHeight="100vh">
            <Header />
            <Flexbox flexGrow={1} flexDirection="row">
              <SideMenu />
              <h1>404</h1>
              <Flexbox width="150px" />
            </Flexbox>
          </Flexbox>
          </MuiThemeProvider>
        )
    }
}

export { Error404 }

