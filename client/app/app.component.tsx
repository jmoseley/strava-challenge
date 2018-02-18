import * as ReactDOM from 'react-dom';
import * as React from 'react';
import { Meteor } from 'meteor/meteor';
import { StatefullComponent } from './statefull.component';
import { StatelessComponent } from './stateless.component';
import styled from 'styled-components';

// --------------------------
// Render the two components
// --------------------------

const Wrapper = styled.div`
  h1 {
    padding: 20px 0 0 30px;
    font-size: 10pt;
    font-weight: normal;
    color: #555;
    font-family: Arial, sans-serif;
  }
`;

Meteor.startup(function() {
  ReactDOM.render(
    <Wrapper>
      <h1>Stateless component</h1>
      <StatelessComponent opacity={0.5} />

      <h1>Statefull component with hover and click events</h1>
      <StatefullComponent opacity={1} />
    </Wrapper>,
    document.getElementById('app'),
  );
});
