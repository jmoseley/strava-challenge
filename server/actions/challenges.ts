import * as _ from 'lodash';
import * as uuid from 'uuid';
import { Meteor } from 'meteor/meteor';

import {
  Collection as ChallengeCollection,
  ChallengeCreateOptions,
  ChallengeInviteOptions,
} from '../../imports/models/challenges';
import {
  Collection as ChallengeInviteCollection,
  ChallengeInviteStatus,
} from '../../imports/models/challenge_invites';

Meteor.methods({
  'challenge.create': ({
    newChallenge,
  }: {
    newChallenge: ChallengeCreateOptions;
  }) => {
    // TODO: Validation. Typescript helps, but dosen't protect us from maliciousness.
    ChallengeCollection.insert({
      ...newChallenge,
      members: [Meteor.userId()],
      creatorId: Meteor.userId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      _id: uuid.v4(),
    });
  },
  'challenge.invite': ({ email, challengeId }: ChallengeInviteOptions) => {
    // TODO: Validation. Typescript helps, but dosen't protect us from maliciousness.
    // For now only allow the owner of the challenge to invite people. Maybe we should open this up in the
    // future?
    const challenge = ChallengeCollection.findOne({ _id: challengeId });
    if (!challenge) {
      throw new Error(`Challenge now found.`);
    }
    if (Meteor.userId() !== challenge.creatorId) {
      throw new Error(`Only the owner can invite people.`);
    }

    const invitee = Meteor.users.findOne({
      $or: [{ 'services.strava.email': email }, { 'profile.email': email }],
    });

    // Ensure the user is not already a member of the challenge.
    if (invitee && _.includes(challenge.members, invitee._id)) {
      throw new Error(`This user is already a member of this challenge.`);
    }

    ChallengeInviteCollection.insert({
      _id: uuid.v4(),
      challengeId: challenge._id,
      inviteeId: _.get(invitee, '_id'),
      email,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: ChallengeInviteStatus.PENDING,
    });

    // Send the email!
  },
});
