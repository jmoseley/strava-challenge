import * as dapper from '@convoy/dapper';
import { Meteor } from 'meteor/meteor';
import * as React from 'react';
import Headroom from 'react-headroom';
import styled from 'styled-components';
import { WithRouterProps, withRouter } from 'react-router';

import Button from './button';
import LoginButton from '../components/login_button';
import ProfileButton from '../components/profile_button';

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
  buttons: {
    display: 'flex',
  },
});

export interface Props {
  currentUser: Meteor.User;
  profileButton?: boolean;
  homeButton?: boolean;
}

class NavBar extends React.Component<Props & WithRouterProps> {
  // TODO: Fix the types.
  styles: any = dapper.reactTo(this, STYLES);

  render() {
    return (
      <Headroom>
        <div className={this.styles.menuWrapper}>
          <h1 className={this.styles.header}>Challenge</h1>
          <div className={this.styles.buttons}>
            {this.props.currentUser &&
              this.props.profileButton && <ProfileButton />}
            {this.props.homeButton && (
              <Button onClick={this._goHome.bind(this)} label="Home" />
            )}
            <LoginButton currentUser={this.props.currentUser} />
          </div>
        </div>
      </Headroom>
    );
  }

  _goHome() {
    this.props.router.push('/');
  }
}

export default withRouter(NavBar);
