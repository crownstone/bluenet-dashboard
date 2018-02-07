import * as React from "react";

import Flexbox from 'flexbox-react';
import { CrownstoneState } from '../components/CrownstoneState'


class Header extends React.Component<any,any> {

  render() {
    return (
      <Flexbox
        element="header"
        flexDirection="column"
        height="40px"
        alignItems="flex-start"
        justifyContent="flex-start"
        style={{marginTop:10, marginLeft:25, marginRight: 14}}
      >
        <CrownstoneState />
        <Flexbox flexGrow={0.1} />
      </Flexbox>
    )
  }
}

export { Header }

