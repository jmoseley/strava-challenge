import * as React from 'react';

import { Challenge } from '../../../imports/models/challenges';
import { ChallengeInvite } from '../../../imports/models/challenge_invites';
import ChallengeCard from './challenge_card';

export interface Props {
  challenge: Challenge;
  challengeInvite: ChallengeInvite;
}

export default class AcceptChallengeCard extends React.Component<Props> {
  render() {
    return (
      <div>
        <ChallengeCard challenge={this.props.challenge} />
        <button onClick={this._acceptChallenge.bind(this)}>
          Accept Challenge
        </button>
      </div>
    );
  }

  _acceptChallenge() {
    Meteor.call('challenge.accept', {
      challengeInviteId: this.props.challengeInvite._id,
    });
  }
}
