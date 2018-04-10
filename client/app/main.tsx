import * as ReactDOM from 'react-dom';
import * as React from 'react';
import { Meteor } from 'meteor/meteor';
import styled from 'styled-components';
import { Provider } from 'react-redux';
import { createStore, combineReducers } from 'redux';
import { combineInteractions } from 'redux-interactions';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import { syncHistoryWithStore, routerReducer } from 'react-router-redux';
import { reducer as formReducer } from 'redux-form';

import Home from './scenes/home';

const store = createStore(
  combineReducers({
    ...combineInteractions({
      // Eventually we'll have some interactions.
    }),
    routing: routerReducer,
    form: formReducer,
  }),
);

const history = syncHistoryWithStore(browserHistory, store);

Meteor.startup(function() {
  ReactDOM.render(
    <Provider store={store}>
      <Router history={history}>
        <Route path="/">
          <IndexRoute component={Home} />
        </Route>
      </Router>
    </Provider>,
    document.getElementById('app'),
  );
});
