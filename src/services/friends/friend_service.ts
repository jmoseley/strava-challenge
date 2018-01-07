import * as _ from 'lodash';

import { User, default as UserMongoDAO } from '../../dao/mongo/users';
import {
  BaseProviderDAO,
  ProviderActivity,
  ProviderUser,
} from '../../dao/providers/base';
import { LoggerFactory, WithLog } from '../../lib/logger';

export class FriendService extends WithLog {
  constructor(
    loggerFactory: LoggerFactory,
    protected readonly userDAO: UserMongoDAO,
    protected readonly providerDAO: BaseProviderDAO<
      ProviderUser,
      ProviderActivity
    >,
  ) {
    super(loggerFactory);
  }

  async getFriends(userId: string): Promise<[ProviderUser[], ProviderUser[]]> {
    const providerFriends = await this.providerDAO.getFriends();

    // Parition by friends that are already in the database.
    // Potential friends are friends that are already on the plgatform.
    // Non-potential friends are friends that aren't on the platform yet, and need to be invited.
    // TODO: Eventually we should just create a user object for all these users that we find.

    // Look up all the friends in one query.
    const friendUsers = await this.userDAO.findUsers(
      _.map(providerFriends, f => ({
        provider: f.provider,
        providerId: f.providerId,
      })),
    );

    return _.partition(providerFriends, stravaFriend => {
      return !!_.find(
        friendUsers,
        friendUser => stravaFriend.providerId === friendUser.providerId,
      );
    });
  }
}
