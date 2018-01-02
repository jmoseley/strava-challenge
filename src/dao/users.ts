import * as uuid from 'uuid';
import * as MongoDB from 'mongodb';

import { LoggerFactory, WithLog } from "../logger";

export interface User extends UserCreateOptions {
  id:string;
}

export interface UserCreateOptions {
  displayName: string;
  provider: string;
  accessToken: string;
  providerId: string;
}

export default class UserDAO extends WithLog {
  private readonly collectionName: string = 'users';

  // DAOs should be bound to a request, this logger factory should come from the request.
  constructor(loggerFactory: LoggerFactory, private readonly db: MongoDB.Db) {
    super(loggerFactory);
  }

  public async findUser(provider: string, providerId: string): Promise<User|null> {
    const userResult = await this.collection().findOne({ provider, providerId });

    return userResult.value || null;
  }

  public async create(userCreateOptions:UserCreateOptions): Promise<User> {
    const user = {
      id: uuid.v4(),
      ...userCreateOptions,
    };
    this.log.info(`Creating user`, { user });

    const result = await this.collection().insertOne(user);
    this.log.debug(`Got result from create`, { result });

    return user;
  }

  private collection() {
    return this.db.collection(this.collectionName);
  }
}
