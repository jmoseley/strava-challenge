import * as React from 'react';
import Headroom from 'react-headroom';
import styled from 'styled-components';

import AccountsUIWrapper from '../components/accounts_ui_wrapper';

const Menu = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 1em;
  padding-right: 1em;
  padding-bottom: 0.5em;

  border-bottom: 1px solid lightgrey;
`;

const Header = styled.h1`
  margin: 0;
  font-family: 'Coiny', sans-serif;
`;

const LoginButton = styled.span``;

export default class NavBar extends React.Component<{}> {
  render() {
    return (
      <Headroom>
        <Menu>
          <Header>Challenge</Header>
          <LoginButton>
            <AccountsUIWrapper />
          </LoginButton>
        </Menu>
      </Headroom>
    );
  }
}
