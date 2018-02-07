import * as React from "react";
import {deepOrange500} from 'material-ui/styles/colors';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import Flexbox from 'flexbox-react';

import { SideMenu } from '../pageElements/SideMenu'
import { Header } from '../pageElements/Header'
import { colors } from '../styles/styles'

const muiTheme = getMuiTheme({
  fontFamily: 'Roboto',
  palette: {
    primary1Color: colors.wikiBlue,
    // primary1Color: '#2d2d2f',
    // primary2Color: cyan700,
    // primary3Color: "#ff0000",
    // accent2Color: "#f00",
    // accent3Color: grey500,
    // textColor: darkBlack,
    // alternateTextColor: white,
    // canvasColor: white,
    // borderColor: grey300,
    disabledColor: 'rgba(0,0,0,0.4)',
    // pickerHeaderColor: cyan500,
    // clockCircleColor: fade(darkBlack, 0.07),
    // shadowColor: fullBlack,
    accent1Color: deepOrange500,
  },
});

class AppContainer extends React.Component<any,any> {
    render() {
        return (
          <MuiThemeProvider muiTheme={muiTheme}>
          <Flexbox flexGrow={1} flexDirection="row" minHeight="100vh">
            <Flexbox flexGrow={1} maxWidth="20px" />
            <Flexbox flexGrow={1} flexDirection="column" minHeight="100vh">
              <Header />
              <Flexbox flexGrow={1} flexDirection="row">
                <Flexbox flexGrow={1} flexBasis="10px" maxWidth="25px" />
                <Flexbox flexGrow={22}>
                  {this.props.children}
                </Flexbox>
                <Flexbox flexGrow={1} flexBasis="10px" maxWidth="25px" />
              </Flexbox>
            </Flexbox>
            <Flexbox flexGrow={1} maxWidth="20px" />
          </Flexbox>
          </MuiThemeProvider>
        )
    }
}

export { AppContainer }

