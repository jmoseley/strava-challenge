import * as _ from 'lodash';
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import * as uuid from 'uuid';

import { BaseModel } from './base';

export const Collection = new Mongo.Collection<Challenge>('challenges');

export interface Challenge extends ChallengeCreateOptions, BaseModel {
  members: string[];
  creatorId: string;
}

export interface ChallengeCreateOptions {
  name: string;
  startDayOfWeek: number;
  durationWeeks: number;
  distanceMiles: number;
  repeats: boolean;
}

export interface ChallengeInviteOptions {
  email: string;
  challengeId: string;
}

if (Meteor.isServer) {
  Meteor.methods({
    'challenge.create': ({
      newChallenge,
    }: {
      newChallenge: ChallengeCreateOptions;
    }) => {
      // TODO: Validation. Typescript helps, but dosen't protect us from maliciousness.
      Collection.insert({
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
      const challenge = Collection.findOne({ _id: challengeId });
      if (!challenge) {
        throw new Error(`Challenge now found.`);
      }
      if (Meteor.userId() !== challenge.creatorId) {
        throw new Error(`Only the owner can invite people.`);
      }
    },
  });
}
