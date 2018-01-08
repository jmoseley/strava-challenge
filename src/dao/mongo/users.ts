import * as _ from 'lodash';
import * as uuid from 'uuid';
import * as MongoDB from 'mongodb';

import { LoggerFactory } from '../../lib/logger';
import BaseDAO, { BaseModel } from './base';

export interface User extends UserCreateOptions, BaseModel {
  lastActivitiesSyncedAt: Date;
}

export interface UserCreateOptions {
  displayName: string;
  // Eventually these schemas should be owned by the providers.
  providers: {
    strava: {
      accessToken: string;
      providerId: string;
    };
    [key: string]: {
      accessToken: string;
      providerId: string;
    };
  };
}

export interface StravaUserCreateOptions {
  displayName: string;
  accessToken: string;
  providerId: string;
}

export default class UserMongoDAO extends BaseDAO<User, UserCreateOptions> {
  protected readonly collectionName: string = 'users';

  public async createUserWithStrava(
    stravaCreateOptions: StravaUserCreateOptions,
  ): Promise<User> {
    const createOptions: UserCreateOptions = {
      displayName: stravaCreateOptions.displayName,
      providers: {
        strava: {
          accessToken: stravaCreateOptions.accessToken,
          providerId: stravaCreateOptions.providerId,
        },
      },
    };

    return super.create(createOptions);
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
          if (!query.providers[uid.provider]) {
            query.providers[uid.provider] = {
              providerId: { $in: [] as string[] },
            };
          }
          query.providers[uid.provider].providerId.$in.push(uid.providerId);

          return query;
        },
        {
          providers: {} as { [key: string]: { providerId: { $in: string[] } } },
        },
      ),
    );

    return await result.toArray();
  }

  public async updateAccessToken(
    id: string,
    provider: string,
    accessToken: string,
  ): Promise<User> {
    const result = await this.collection().findOneAndUpdate(
      { id },
      {
        $set: {
          providers: { [provider]: { accessToken } },
          updatedAt: new Date(),
        },
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
