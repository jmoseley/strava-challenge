import * as _ from 'lodash';

import { User, default as UserMongoDAO } from '../../dao/mongo/users';
import {
  BaseProviderDAO,
  ProviderActivity,
  ProviderUser,
} from '../../dao/providers/base';
import { LoggerFactory, WithLog } from '../../lib/logger';

export interface PotentialFriendUser extends User {
  requested: boolean;
}

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

  async getFriends(
    userId: string,
  ): Promise<[User[], PotentialFriendUser[], ProviderUser[]]> {
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

    const [friends, potentialFriendUsers] = _.partition(
      friendUsers,
      pfu =>
        !!_.find(pfu.friendIds, user.id) && !!_.find(user.friendIds, pfu.id),
    );

    const nonPotentialFriends = _.filter(
      providerFriends,
      pf => !_.find(friendUsers, pfu => pfu.providerId === pf.providerId),
    );

    const potentialFriends = _.map(potentialFriendUsers, pfu => {
      return {
        ...pfu,
        requested: !!_.find(pfu.friendIds, user.id),
      };
    });

    return [friends, potentialFriends, nonPotentialFriends];
  }
}
