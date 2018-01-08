import * as _ from 'lodash';

import { User, default as UserMongoDAO } from '../../dao/mongo/users';
import { ProviderActivity, ProviderUser } from '../../dao/providers/base';
import { LoggerFactory, WithLog } from '../../lib/logger';
import { AllProvidersDao } from '../../dao/providers/all';

export class FriendService extends WithLog {
  constructor(
    loggerFactory: LoggerFactory,
    protected readonly userDAO: UserMongoDAO,
    protected readonly providerDAO: AllProvidersDao,
  ) {
    super(loggerFactory);
  }

  async getFriends(userId: string): Promise<[ProviderUser[], ProviderUser[]]> {
    let user = await this.userDAO.findById(userId);
    if (!user) {
      // TODO: 404
      throw new Error(`User not found.`);
    }
    const providerFriends = await this.providerDAO.getFriends(user);

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

    return _.partition(providerFriends, providerFriend => {
      return !!_.find(
        friendUsers,
        friendUser =>
          providerFriend.providerId ===
          friendUser.providers[providerFriend.provider].providerId,
      );
    });
  }
}
