import * as dapper from '@convoy/dapper';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze';

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
});

export interface Props {
  currentUser: Meteor.User;
}

export default class LoginButton extends React.Component<Props> {
  styles: any = dapper.reactTo(this, STYLES);

  render() {
    if (this.props.currentUser) {
      return (
        <div>
          <span className={this.styles.userName}>
            {this.props.currentUser.profile.name}
          </span>
          <span onClick={this._logout} className={this.styles.logout}>
            Logout
          </span>
        </div>
      );
    } else {
      return (
        <span onClick={this._login}>
          <img
            className={this.styles.button}
            src="/imgs/btn_strava_connectwith_orange@2x.png"
          />
        </span>
      );
    }
  }

  _logout() {
    Meteor.logout();
  }

  _login() {
    (Meteor as any).loginWithStrava();
  }
}
