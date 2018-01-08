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

  async getFriends(
    userId: string,
  ): Promise<[User[], ProviderUser[], ProviderUser[]]> {
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
    const potentialFriendUsers = await this.userDAO.findUsers(
      _.map(providerFriends, f => ({
        provider: f.provider,
        providerId: f.providerId,
      })),
    );

    const friends = _.filter(
      potentialFriendUsers,
      pfu =>
        !!_.find(pfu.friendIds, user.id) && !!_.find(user.friendIds, pfu.id),
    );

    const [unfilteredPotentialFriends, nonPotentialFriends] = _.partition(
      providerFriends,
      stravaFriend => {
        return !!_.find(
          potentialFriendUsers,
          friendUser => stravaFriend.providerId === friendUser.providerId,
        );
      },
    );

    const potentialFriends = _.filter(
      unfilteredPotentialFriends,
      upf => !_.find(friends, f => f.providerId === upf.providerId),
    );

    return [friends, potentialFriends, nonPotentialFriends];
  }
}
