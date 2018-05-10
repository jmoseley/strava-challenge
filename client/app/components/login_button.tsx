import * as dapper from '@convoy/dapper';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze';

import Button from './button';

// http://www.colourlovers.com/palette/92095/Giant_Goldfish
const STYLES = dapper.compile({
  button: {
    height: '3em',
    cursor: 'pointer',
  },
  logout: {
    cursor: 'pointer',
    padding: '7px',
    borderRadius: '3px',
    backgroundColor: '#FA6900',
    color: '#FFFFFF',
    fontFamily: `sans-serif`,
  },
  userName: {
    padding: '5px',
  },
  container: {
    display: 'flex',
  },
});

export interface Props {
  currentUser: Meteor.User;
}

export default class LoginButton extends React.Component<Props> {
  styles: any = dapper.reactTo(this, STYLES);

  render() {
    if (this.props.currentUser) {
      return (
        <div className={this.styles.container}>
          <div>
            <span className={this.styles.userName}>
              {this.props.currentUser.profile.name}
            </span>
          </div>
          <Button onClick={this._logout} label="Logout" />
        </div>
      );
    } else {
      return (
        <span onClick={this._login}>
          <img
            className={this.styles.button}
            src="/imgs/btn_strava_connectwith_light.png"
          />
        </span>
      );
    }
  }

  _logout() {
    Meteor.logout();
  }

  _login() {
    (Meteor as any).loginWithStrava({
      requestPermissions: ['public', 'view_private'],
    });
  }
}
