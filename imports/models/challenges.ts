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
