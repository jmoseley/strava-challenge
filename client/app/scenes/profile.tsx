import * as _ from 'lodash';
import * as dapper from '@convoy/dapper';
import * as React from 'react';
import * as querystring from 'querystring';
import { Meteor } from 'meteor/meteor';
import { connect } from 'react-redux';
// TODO: Meteor is badly typed :(
import { withTracker } from 'meteor/react-meteor-data';
import styled from 'styled-components';

import NavBar from '../components/nav_bar';
import AccountInfo from '../components/profile/account_info';
import NotificationPreferences from '../components/profile/notification_preferences';

const STYLES = dapper.compile({
  heading: {
    marginTop: '0.2em',
    fontWeight: 'lighter',
  },
  main: {
    display: 'flex',
    justifyContent: 'space-between',
    height: '100%',
  },
  body: {
    height: '100%',
    fontFamily: `'Roboto', sans-serif`,
  },
  accountInfo: {
    flex: '1',
    borderLeft: '1px solid lightgrey',
    marginLeft: '1em',
    padding: '0.5em',
    background: '#ffffff',
    height: '100%',
  },
  preferences: {
    flex: '4',
    padding: '0.5em',
  },
});

export interface DataProps {
  currentUser: Meteor.User;
}

export interface StateProps {
  foo: string;
}

export interface PropParams {}

export interface Props extends DataProps, StateProps, PropParams {}

class ProfileScene extends React.Component<Props> {
  styles: any = dapper.reactTo(this, STYLES);

  render() {
    return (
      <div className={this.styles.body}>
        <NavBar currentUser={this.props.currentUser} homeButton={true} />
        <div className={this.styles.main}>
          <div className={this.styles.preferences}>
            <NotificationPreferences user={this.props.currentUser} />
          </div>
          <div className={this.styles.accountInfo}>
            <AccountInfo user={this.props.currentUser} />
          </div>
        </div>
      </div>
    );
  }
}

// POC that the redux connection works.
const mapStateToProps = (state: any) => ({
  foo: 'bar',
});

function dataLoader(p: PropParams): DataProps {
  return {
    currentUser: Meteor.users.findOne({ _id: Meteor.userId() }),
  };
}

export default withTracker(dataLoader)(
  connect<StateProps>(mapStateToProps)(ProfileScene),
);
