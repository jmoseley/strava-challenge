import * as _ from 'lodash';
import { Mongo } from 'meteor/mongo';

import { BaseModel } from './base';

export const Collection = new Mongo.Collection<Activity>('activities');

// TODO: move these models out of the 'mongo dao' in case we want other sources besides mongo.
export interface Activity extends ActivityCreateOptions, BaseModel {}

export interface ActivityCreateOptions {
  userId: string;
  name: string;
  type: string;
  startDate: Date;
  movingTime: number;
  totalTime: number;
  distance: number;
  elevation: number;
  provider: string;
  providerId: string;
}
