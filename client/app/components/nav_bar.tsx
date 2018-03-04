import * as dapper from '@convoy/dapper';
import * as React from 'react';
import Headroom from 'react-headroom';
import styled from 'styled-components';

import AccountsUIWrapper from '../components/accounts_ui_wrapper';

const STYLES = dapper.compile({
  menuWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: '1em',
    paddingRight: '1em',

    borderBottom: '1px solid lightgrey',
    backgroundColor: '#FFFFFF',
  },
  header: {
    margin: 0,
    fontFamily: `'Coiny', sans-serif`,
  },
});

export default class NavBar extends React.Component<{}> {
  // TODO: Fix the types.
  styles: any = dapper.reactTo(this, STYLES);

  render() {
    return (
      <Headroom>
        <div className={this.styles.menuWrapper}>
          <h1 className={this.styles.header}>Challenge</h1>
          <span>
            <AccountsUIWrapper />
          </span>
        </div>
      </Headroom>
    );
  }
}
