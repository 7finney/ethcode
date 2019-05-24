import React from 'react';
import ReactDOM from 'react-dom';
import App from "./components/App";
// @ts-ignore
import { Provider } from "react-redux";
import { createStore } from "redux";
import * as serviceWorker from './serviceWorker';
import reducer from "./reducers";
import './index.css';

const store = createStore(reducer);
ReactDOM.render(
    <Provider store={store}>
        <App />,
    </Provider>,
    document.getElementById('root') as HTMLElement
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
