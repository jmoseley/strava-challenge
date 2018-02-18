import * as React from 'react';
import { Meteor } from 'meteor/meteor';
import { connect } from 'react-redux';
import AccountsUIWrapper from '../components/accounts_ui_wrapper';

const { withTracker } = require('meteor/react-meteor-data');

export interface DataProps {
  currentUser: Meteor.User;
}

export interface StateProps {
  foo: string;
}

export interface Props extends DataProps, StateProps {}

class HomeScene extends React.Component<Props> {
  render() {
    console.log('user', this.props.currentUser);
    console.log('foo', this.props.foo);
    return (
      <div>
        <h1>Cycle Challenge</h1>
        <AccountsUIWrapper />
      </div>
    );
  }
}

// POC that the redux connection works.
const mapStateToProps = (state: any) => ({
  foo: 'bar',
});

export default withTracker(() => {
  Meteor.subscribe('users');

  return {
    currentUser: Meteor.user(),
  };
})(connect<StateProps>(mapStateToProps)(HomeScene));
