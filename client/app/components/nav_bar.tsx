import * as dapper from '@convoy/dapper';
import { Meteor } from 'meteor/meteor';
import * as React from 'react';
import Headroom from 'react-headroom';
import styled from 'styled-components';

import LoginButton from '../components/login_button';

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
    paddingBottom: '0.1em',
    fontFamily: `'Lobster', sans-serif`,
  },
});

export interface Props {
  currentUser: Meteor.User;
}

export default class NavBar extends React.Component<Props> {
  // TODO: Fix the types.
  styles: any = dapper.reactTo(this, STYLES);

  render() {
    return (
      <Headroom>
        <div className={this.styles.menuWrapper}>
          <h1 className={this.styles.header}>Challenge</h1>
          <span>
            <LoginButton currentUser={this.props.currentUser} />
          </span>
        </div>
      </Headroom>
    );
  }
}
