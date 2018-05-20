import * as _ from 'lodash';
import * as dapper from '@convoy/dapper';
import * as React from 'react';
import * as moment from 'moment';
import { Quantity } from '@neutrium/quantity';

import { Challenge } from '../../../imports/models/challenges';
import InviteToChallengeForm from './invite_to_challenge_form';
import { Activity } from '../../../imports/models/activities';
import ProgressDisplay, {
  UserWithActivities,
} from './challenges/progress_display';

const STYLES = dapper.compile({
  challenge: {
    margin: '0.5em',
  },
  title: {
    margin: 0,
  },
  link: {
    color: 'black',
  },
});

export interface ChallengeWithUsersAndActivities extends Challenge {
  users?: UserWithActivities[];
}

export interface Props {
  challenge: ChallengeWithUsersAndActivities;
}

export interface State {
  showInviteForm: boolean;
}

export default class ChallengeCard extends React.Component<Props, State> {
  styles: any = dapper.reactTo(this, STYLES);

  constructor(props: Props) {
    super(props);

    this.state = {
      showInviteForm: false,
    };
  }

  render() {
    return (
      <div className={this.styles.challenge}>
        <h3 className={this.styles.title}>{this.props.challenge.name}</h3>
        <span>{this.props.challenge.distanceMiles} miles</span>
        {this.props.challenge.creatorId === Meteor.userId() &&
          this._renderOptions()}
        {this._renderParticipants()}
      </div>
    );
  }

  _renderOptions() {
    return (
      <div>
        {this.state.showInviteForm && (
          <InviteToChallengeForm
            form={`inviteToChallenge-${this.props.challenge._id}`}
            challengeId={this.props.challenge._id}
            onSubmit={this._hideInviteForm}
          />
        )}
        {!this.state.showInviteForm && (
          <a href="#" onClick={this._showInviteForm}>
            Invite
          </a>
        )}
      </div>
    );
  }

  _showInviteForm = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    this.setState({ showInviteForm: true });
  };

  _hideInviteForm = () => {
    this.setState({ showInviteForm: false });
  };

  _renderParticipants = () => {
    const progressDisplays = [];

    for (const user of _.get(
      this.props,
      'challenge.users',
      [],
    ) as UserWithActivities[]) {
      // Weeks start on Monday.
      const currentWeekStart = moment()
        .day(1)
        .startOf('day');
      // Filter activities to just the most recent week.
      // Eventually we can display past progress.
      const activities = _.filter(user.activities, a => {
        return (
          moment(a.startDate).isAfter(currentWeekStart) &&
          moment(a.startDate).isBefore(currentWeekStart.clone().add(1, 'week'))
        );
      });
      progressDisplays.push(
        <ProgressDisplay
          user={{
            ...user,
            activities,
          }}
          key={user._id}
          goal={this.props.challenge.distanceMiles}
        />,
      );
    }

    return (
      <div className={this.styles.participants}>
        {/* Just render the current week for now */}
        {progressDisplays}
      </div>
    );
  };
}
