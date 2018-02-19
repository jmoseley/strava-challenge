import * as React from 'react';
import { Meteor } from 'meteor/meteor';
import { connect } from 'react-redux';
// TODO: Meteor is badly typed :(
import { withTracker } from 'meteor/react-meteor-data';
import AccountsUIWrapper from '../components/accounts_ui_wrapper';

export interface DataProps {
  currentUser: Meteor.User;
}

export interface StateProps {
  foo: string;
}

export interface Props extends DataProps, StateProps {}

class HomeScene extends React.Component<Props> {
  render() {
    return (
      <div>
        <h1>Cycle Challenge</h1>
        <AccountsUIWrapper />
        {this.props.currentUser && <a href="/activities">Activities</a>}
      </div>
    );
  }
}

// POC that the redux connection works.
const mapStateToProps = (state: any) => ({
  foo: 'bar',
});

function dataLoader(): DataProps {
  return {
    currentUser: Meteor.users.findOne({ _id: Meteor.userId() }),
  };
}

export default withTracker(dataLoader)(
  connect<StateProps>(mapStateToProps)(HomeScene),
);
