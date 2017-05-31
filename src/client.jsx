import React from 'react';
import ReactDOM from 'react-dom';
import { Route, BrowserRouter } from 'react-router-dom';
import { AppContainer } from 'react-hot-loader';
import { Map } from 'immutable';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import App from './components/App';
import reducer from './reducers';
import { init } from './actions';

// import styles from './client.css';
const store = createStore(
  reducer,
  new Map(Object.keys(window.INITIAL_STATE).map(key => [+key, window.INITIAL_STATE[key]])),
);
const ws = new WebSocket(`ws://${window.location.host}`);
ws.addEventListener('message', msg => {
  store.dispatch(JSON.parse(msg.data));
});
init(ws);

ReactDOM.render(
  <AppContainer>
    <Provider store={store}>
      <BrowserRouter>
        <Route
          path="/"
          component={App}
        />
      </BrowserRouter>
    </Provider>
  </AppContainer>,
  document.getElementById('root'),
);

