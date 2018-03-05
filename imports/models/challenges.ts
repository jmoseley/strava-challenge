import * as _ from 'lodash';
import { Mongo } from 'meteor/mongo';

import { BaseModel } from './base';

export const Collection = new Mongo.Collection<Challenge>('challenges');

export interface Challenge extends ChallengeCreateOptions, BaseModel {
  members: string[];
}

export interface ChallengeCreateOptions {
  name: string;
  durationWeeks: number;
  distanceMiles: number;
  creatorId: string;
  repeats: boolean;
}
