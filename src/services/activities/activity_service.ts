import { isNullOrUndefined } from 'util';

import {
  Activity,
  default as ActivityMongoDAO,
} from '../../dao/mongo/activities';
import UserMongoDAO from '../../dao/mongo/users';
import { ProviderActivity, ProviderUser } from '../../dao/providers/base';
import { LoggerFactory, WithLog } from '../../lib/logger';
import { AllProvidersDao } from '../../dao/providers/all';

const DEFAULT_SYNC_RANGE_IN_SECONDS = 1209600 * 1000; // 2 weeks

export class ActivityService extends WithLog {
  constructor(
    loggerFactory: LoggerFactory,
    protected readonly userDAO: UserMongoDAO,
    protected readonly activityDAO: ActivityMongoDAO,
    protected readonly providerDAO: AllProvidersDao,
  ) {
    super(loggerFactory);
  }

  async syncActivities(userId: string): Promise<Activity[]> {
    // get the last time activities were synced for the user. if activities have never been synced,
    // get the activities for the past DEFAULT_SYNC_RANGE_IN_SECONDS.
    let user = await this.userDAO.findById(userId);
    const nextActivityDate = !isNullOrUndefined(user.lastActivitiesSyncedAt)
      ? new Date(new Date(user.lastActivitiesSyncedAt).getTime())
      : new Date(new Date().getTime() - DEFAULT_SYNC_RANGE_IN_SECONDS); // TODO: make this configurable.

    // get all activities from strava after the time activities were last synced.
    const providerActivities = await this.providerDAO.getActivities(
      user,
      nextActivityDate,
    );

    let newLastSyncedAt: Date;
    if (providerActivities.length > 0) {
      // set to the last activity found
      newLastSyncedAt =
        providerActivities[providerActivities.length - 1].startDate;
    } else {
      // set to the last time we synced so that next time we sync we can still catch any activities found since
      newLastSyncedAt = nextActivityDate;
    }

    let activities: Activity[] = [];
    if (providerActivities.length > 0) {
      activities = await this.activityDAO.createMultiple(providerActivities);
    }

    // set the lastActivitiesSyncedAt to now.
    // TODO: How do we want to handle the case where a user hasn't logged in for an extended period of time?
    // Currently by setting the lastActivitiesSyncedAt property to the last activity found, if the user logs in a month,
    // or a year, later we could possibly be syncing hundreds of activities.
    // Solution?: create a queue for accounts to be synced so we can better control rate limiting over the whole service
    // TODO: Handle case where activities have a start date prior to the date of the last activity found.
    // Example: I uploaded an activity today, checked StravaChallenge, but forgot to sync my activity from yesterday. I
    // proceed to upload my activity from yesterday.
    // Since we've set the lastActivitySyncedAt to the time of the activity today, the activity from yesterday would
    // never be fetched by StravaChallenge.
    // Solution?: could handle this by having an option for the user to force sync all activities.
    await this.userDAO.updateLastActivitiesSyncedAt(userId, newLastSyncedAt);

    return activities;
  }
}
