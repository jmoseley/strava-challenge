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
}

export default class UserMongoDAO extends BaseDAO<User, UserCreateOptions> {
  protected readonly collectionName: string = 'users';

  // DAOs should be bound to a request, this logger factory should come from the request.
  constructor(loggerFactory: LoggerFactory, db: MongoDB.Db) {
    super(loggerFactory, db);
  }

  public async findUser(
    provider: string,
    providerId: string,
  ): Promise<User | null> {
    return await this.collection().findOne({ provider, providerId });
  }

  public async updateAccessToken(
    id: string,
    accessToken: string,
  ): Promise<User> {
    const result = await this.collection().findOneAndUpdate(
      { id },
      {
        $set: { accessToken },
      },
    );

    if (!result.value) {
      throw new Error(`Cannot update user that does not exist.`);
    }
    return result.value;
  }
}
