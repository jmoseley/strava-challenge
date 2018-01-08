import { BaseProviderDAO } from './base';
import { WithLog, LoggerFactory } from '../../lib/logger';
import { User } from '../mongo/users';
import StravaProviderDAO from './strava';

/**
 * Provide a place to generically obtain data from all providers, providing a single interface for the consumers
 * of this data. This is making a big assumption that we can create a generic interface for activities and
 * friends and other data we will get from providers.
 *
 * This also assumes that we always want to get all data from all providers.
 */
export class AllProvidersDao extends WithLog implements BaseProviderDAO {
  constructor(
    loggerFactory: LoggerFactory,
    private readonly stravaProvider: StravaProviderDAO,
  ) {
    super(loggerFactory);
  }

  public async getFriends(user: User) {
    const stravaFriends = this.stravaProvider.getFriends(user);

    return stravaFriends;
  }

  public async getActivities(user: User, afterDate: Date) {
    const stravaActivities = this.stravaProvider.getActivities(user, afterDate);

    return stravaActivities;
  }
}
