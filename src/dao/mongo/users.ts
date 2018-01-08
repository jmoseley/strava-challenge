import * as _ from 'lodash';
import * as uuid from 'uuid';
import * as MongoDB from 'mongodb';

import { LoggerFactory } from '../../lib/logger';
import BaseDAO, { BaseModel } from './base';

export interface User extends UserCreateOptions, BaseModel {
  lastActivitiesSyncedAt: Date;
  friendIds: string[];
}

export interface UserCreateOptions {
  displayName: string;
  provider: string;
  accessToken: string;
  providerId: string;
  lastActivitiesSyncedAt?: Date;
  friendIds?: string[];
}

export default class UserMongoDAO extends BaseDAO<User, UserCreateOptions> {
  protected readonly collectionName: string = 'users';

  public async create(createOptions: UserCreateOptions): Promise<User> {
    if (!createOptions.lastActivitiesSyncedAt) {
      createOptions.lastActivitiesSyncedAt = new Date(0);
    }
    if (!createOptions.friendIds) {
      createOptions.friendIds = [];
    }

    return super.create(createOptions);
  }

  public async findUsers(
    userIdentifiers: {
      provider: string;
      providerId: string;
    }[],
  ): Promise<User[]> {
    const query = _.reduce(
      userIdentifiers,
      (query, uid) => {
        query.provider.$in.push(uid.provider);
        query.providerId.$in.push(uid.providerId);

        query.provider.$in = _.uniq(query.provider.$in);

        return query;
      },
      {
        provider: { $in: [] as string[] },
        providerId: { $in: [] as string[] },
      },
    );

    const result = await this.collection().find(query);

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
