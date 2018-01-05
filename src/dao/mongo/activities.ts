import * as _ from 'lodash';
import * as MongoDB from 'mongodb';

import { LoggerFactory } from '../../logger';
import BaseDAO, { BaseModel } from './base';

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

export default class ActivityMongoDAO extends BaseDAO<
  Activity,
  ActivityCreateOptions
> {
  protected readonly collectionName: string = 'activities';

  // DAOs should be bound to a request, this logger factory should come from the request.
  constructor(loggerFactory: LoggerFactory, db: MongoDB.Db) {
    super(loggerFactory, db);
  }

  public async findActivitiesByUser(userId: string): Promise<Activity[]> {
    const queryResult = await this.collection().find({
      userId,
    });

    let result = await queryResult.toArray();
    this.log.debug(`found ${result.length} activities for user ${userId}...`);
    return result;
  }
}
