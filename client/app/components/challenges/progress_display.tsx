import { Meteor } from 'meteor/meteor';
import * as React from 'react';
import * as _ from 'lodash';

import { Activity } from '../../../../imports/models/activities';

export interface UserWithActivities extends Meteor.User {
  activities: Activity[];
}

export interface Props {
  goal: number;
  user: UserWithActivities;
}

export default class ChallengeProgressDisplay extends React.Component<Props> {
  render() {
    const totalMiles = _.reduce(
      this.props.user.activities,
      (sum, a) => {
        return sum + this._convertMetersToMiles(a.distance);
      },
      0,
    );
    let percentage = 0;
    if (totalMiles > 0) {
      percentage = totalMiles / this.props.goal;
    }
    const percentageText = (percentage * 100).toFixed(2);

    return (
      <div>
        {this.props.user.profile.name}: {totalMiles.toFixed(1)} miles -{' '}
        {percentageText}%
      </div>
    );
  }

  _convertMetersToMiles(meters: number) {
    return meters * 0.000621371;
  }
}
