import * as React from "react";
import { createStore, combineReducers } from 'redux'
import { Provider } from 'react-redux'
import { IndexRedirect, Router, Route, browserHistory } from 'react-router'
import { syncHistoryWithStore, routerReducer } from 'react-router-redux'

import { Pages } from './Pages'

// Add the reducer to your store on the `routing` key
const store = createStore(combineReducers({routing: routerReducer}));


// Create an enhanced history that syncs navigation events with the store
const history = syncHistoryWithStore(browserHistory, store);

class App extends React.Component<{},{}> {
  render() {
    return (
      <Provider store={store}>
        <Router history={history} >
          <Route path={"/index.html"} component={ Pages.AppContainer }>
            <IndexRedirect to={'/'} />
          </Route>

          <Route path={"/"} component={ Pages.AppContainer }>
            <Route path={"*"} component={ Pages.Dashboard  }   />
          </Route>
          <Route path={"*"} component={ Pages.Error404  }   />
        </Router>
      </Provider>
    )
  }
}

export { App }

