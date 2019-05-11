import * as React from "react";
// @ts-ignore
import * as ReactDOM from "react-dom";
import App from "./components/App";
// @ts-ignore
import { Provider } from "react-redux";
import { createStore } from "redux";
import reducer from "./reducers";
import "./index.css";

const store = createStore(reducer);

ReactDOM.render(
  <Provider store={store}>
    <App />,
  </Provider>,
  document.getElementById("root") as HTMLElement
);
