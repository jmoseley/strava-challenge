import * as React from 'react';
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { connect } from 'react-redux';
// TODO: Meteor is badly typed :(
import { withTracker } from 'meteor/react-meteor-data';
import AccountsUIWrapper from '../components/accounts_ui_wrapper';

import {
  Activity,
  Collection as ActivitiesCollection,
} from '../../../imports/models/activities';
import ActivityCard from '../components/activity_card';

interface DataProps {
  loading: boolean;
  currentUser: Meteor.User;
  activities: Activity[];
}

interface StateProps {
  foo: string;
}

export interface Props extends DataProps, StateProps {}

class ActivitiesScene extends React.Component<Props> {
  render() {
    return (
      <div>
        <h1>Cycle Challenge</h1>
        <h2>Activities</h2>
        {this.renderComponents()}
      </div>
    );
  }

  renderComponents() {
    if (this.props.loading) {
      return <div>Loading...</div>;
    }

    return this.props.activities.map(activity => {
      return <ActivityCard activity={activity} key={activity._id} />;
    });
  }
}

// POC that the redux connection works.
const mapStateToProps = (state: any) => ({
  foo: 'bar',
});

function dataLoader(): DataProps {
  const activitiesSub = Meteor.subscribe('activities');

  return {
    loading: !activitiesSub.ready(),
    currentUser: Meteor.users.findOne({ _id: Meteor.userId() }),
    activities: ActivitiesCollection.find().fetch(),
  };
}

export default withTracker(dataLoader)(
  connect<StateProps>(mapStateToProps)(ActivitiesScene),
);
