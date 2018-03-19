import * as dapper from '@convoy/dapper';
import * as React from 'react';
import * as moment from 'moment';
import { Quantity } from '@neutrium/quantity';

import { Challenge } from '../../../imports/models/challenges';
import InviteToChallengeForm from './invite_to_challenge_form';

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

export interface Props {
  challenge: Challenge;
}

export default class ChallengeCard extends React.Component<Props> {
  styles: any = dapper.reactTo(this, STYLES);

  render() {
    return (
      <div className={this.styles.challenge}>
        <h3 className={this.styles.title}>{this.props.challenge.name}</h3>
        <span>{this.props.challenge.distanceMiles} miles</span>
        {this.props.challenge.creatorId === Meteor.userId() && (
          <InviteToChallengeForm
            form={`inviteToChallenge-${this.props.challenge._id}`}
            challengeId={this.props.challenge._id}
          />
        )}
      </div>
    );
  }
}
