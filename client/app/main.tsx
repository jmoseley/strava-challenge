import * as ReactDOM from 'react-dom';
import * as React from 'react';
import { Meteor } from 'meteor/meteor';
import styled from 'styled-components';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { combineInteractions } from 'redux-interactions';

import App from './components/app';

const store = createStore(
  combineInteractions({
    // Eventually we'll have some interactions.
  }),
);

Meteor.startup(function() {
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById('app'),
  );
});
