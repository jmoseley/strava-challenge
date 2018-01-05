import * as _ from 'lodash';
import * as MongoDB from 'mongodb';

import { LoggerFactory } from '../../logger';
import BaseDAO, { BaseModel } from './base';

// TODO: move these models out of the 'mongo dao' in case we want other sources besides mongo.
export interface Activity extends ActivityCreateOptions, BaseModel {}

export interface ActivityCreateOptions {
  userId: string;
  activityName: string;
  activityType: string;
  activityDate: Date;
  movingTime: number;
  totalTime: number;
  distance: number;
  elevation: number;
  platform: string;
  platformId: string;
}

export default class ActivityMongoDAO extends BaseDAO<
  Activity,
  ActivityCreateOptions
> {
  protected readonly collectionName: string = 'activity';

  // DAOs should be bound to a request, this logger factory should come from the request.
  constructor(loggerFactory: LoggerFactory, db: MongoDB.Db) {
    super(loggerFactory, db);
  }

  public async findActivitiesByUser(userId: string): Promise<Activity[]> {
    const result = await this.collection().find({
      id: userId,
    });

    let resultToReturn = await result.toArray();
    console.log(`found ${resultToReturn.length} activities for user ${userId}`);
    return await result.toArray();
  }
}
