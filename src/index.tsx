import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App";
import { Provider } from "react-redux";
import { createStore, applyMiddleware } from "redux";
import reducer from "./reducers";
import "./index.css";
import logger from "redux-logger";
import ReduxThunk from "redux-thunk";

const store = createStore(reducer, {}, applyMiddleware(ReduxThunk, logger));

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root") as HTMLElement
);
