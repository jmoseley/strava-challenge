import * as _ from 'lodash';
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import * as uuid from 'uuid';

import { BaseModel } from './base';

export const Collection = new Mongo.Collection<ChallengeInvite>(
  'challenge_invites',
);

export interface ChallengeInvite
  extends ChallengeInviteCreateOptions,
    BaseModel {}

export interface ChallengeInviteCreateOptions {
  inviteeId: string;
  challengeId: string;
}
