import * as React from 'react';
import styled from 'styled-components';

import { StatefullComponent } from './statefull';
import { StatelessComponent } from './stateless';

const Wrapper = styled.div`
  h1 {
    padding: 20px 0 0 30px;
    font-size: 10pt;
    font-weight: normal;
    color: #555;
    font-family: Arial, sans-serif;
  }
`;

const App = () => {
  return (
    <Wrapper>
      <h1>Stateless component</h1>
      <StatelessComponent opacity={0.5} />

      <h1>Statefull component with hover and click events</h1>
      <StatefullComponent opacity={1} />
    </Wrapper>
  );
};

export default App;
