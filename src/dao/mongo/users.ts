import * as _ from 'lodash';
import * as uuid from 'uuid';
import * as MongoDB from 'mongodb';

import { LoggerFactory } from '../../logger';
import BaseDAO, { BaseModel } from './base';

export interface User extends UserCreateOptions, BaseModel {}

export interface UserCreateOptions {
  displayName: string;
  provider: string;
  accessToken: string;
  providerId: string;
  lastActivitiesSyncedAt: number;
}

export default class UserMongoDAO extends BaseDAO<User, UserCreateOptions> {
  protected readonly collectionName: string = 'users';

  // DAOs should be bound to a request, this logger factory should come from the request.
  constructor(loggerFactory: LoggerFactory, db: MongoDB.Db) {
    super(loggerFactory, db);
  }

  public async findUsers(
    userIdentifiers: {
      provider: string;
      providerId: string;
    }[],
  ): Promise<User[]> {
    const result = await this.collection().find(
      _.reduce(
        userIdentifiers,
        (query, uid) => {
          query.provider.$in.push(uid.provider);
          query.providerId.$in.push(uid.providerId);

          return query;
        },
        {
          provider: { $in: [] as string[] },
          providerId: { $in: [] as string[] },
        },
      ),
    );

    return await result.toArray();
  }

  public async updateAccessToken(
    id: string,
    accessToken: string,
  ): Promise<User> {
    const result = await this.collection().findOneAndUpdate(
      { id },
      {
        $set: { accessToken, updatedAt: new Date() },
      },
    );

    if (!result.value) {
      throw new Error(`Cannot update user that does not exist.`);
    }
    return result.value;
  }

  public async updateLastActivitiesSyncedAt(
    id: string,
    lastActivitiesSyncedAt: Date,
  ): Promise<User> {
    const result = await this.collection().findOneAndUpdate(
      { id },
      {
        $set: { lastActivitiesSyncedAt, updatedAt: new Date() },
      },
    );

    if (!result.value) {
      throw new Error(`Cannot update user that does not exist.`);
    }
    return result.value;
  }
}
