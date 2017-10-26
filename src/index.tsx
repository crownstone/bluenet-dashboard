import * as React from "react";
import * as ReactDOM from "react-dom";

import * as injectTapEventPlugin from "react-tap-event-plugin"
injectTapEventPlugin();

import { App } from "./router/Router";

// render the Router into the app
ReactDOM.render(<App />, document.getElementById("app"));