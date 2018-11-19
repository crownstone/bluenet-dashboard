import * as React from "react";
import { createStore, combineReducers } from 'redux'
import { Provider } from 'react-redux'
import { IndexRedirect, Router, Route, browserHistory, hashHistory } from 'react-router'
import { syncHistoryWithStore, routerReducer } from 'react-router-redux'

import { Pages } from './Pages'
import {WebSocketHandler} from "../backendConnection/webSockets";
import {ProtocolBackendToFrontend} from "../backendConnection/ProtocolBackendToFrontend";
import {ProtocolFrontendToBackend} from "../backendConnection/ProtocolFrontendToBackend";
import {eventBus} from "../util/EventBus";

// Add the reducer to your store on the `routing` key
const store = createStore(combineReducers({routing: routerReducer}));

WebSocketHandler.start();

ProtocolBackendToFrontend.subscribe();
ProtocolFrontendToBackend.subscribe();

// setInterval(() => { eventBus.emit("sendOverWebSocket", 'hi')}, 1000)

// Create an enhanced history that syncs navigation events with the store
const history = syncHistoryWithStore(hashHistory, store);

(window as any).___DIFFERENTIAL = null;
(window as any).___RANGE = null;
(window as any).___PIN = null;

class App extends React.Component<{},{}> {
  render() {
    return (
      <Provider store={store}>
        <Router history={hashHistory} >
          <Route path={"/"} component={ Pages.AppContainer }>
            <IndexRedirect to={'data'} />
          </Route>

          <Route path={"/"} component={ Pages.AppContainer }>
            <Route path={"data"}     component={ Pages.Data  }       />
            <Route path={"playback"} component={ Pages.Playback  }       />
          </Route>
          <Route path={"*"} component={ Pages.Error404  }   />
        </Router>
      </Provider>
    )
  }
}

export { App }

