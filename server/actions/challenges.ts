import * as uuid from 'uuid';

import {
  Collection as ChallengeCollection,
  ChallengeCreateOptions,
  ChallengeInviteOptions,
} from '../../imports/models/challenges';
import { Collection as ChallengeInviteCollection } from '../../imports/models/challenge_invites';

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
  },
});
