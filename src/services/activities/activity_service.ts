import {
  Activity,
  default as ActivityMongoDAO,
} from '../../dao/mongo/activities';
import UserMongoDAO from '../../dao/mongo/users';
import {
  BaseProviderDAO,
  ProviderActivity,
  ProviderUser,
} from '../../dao/providers/base';
import { LoggerInstance } from '../../logger';
import { isNullOrUndefined } from 'util';

export class ActivityService {
  constructor(
    protected readonly userDAO: UserMongoDAO,
    protected readonly activityDAO: ActivityMongoDAO,
    protected readonly providerDAO: BaseProviderDAO<
      ProviderUser,
      ProviderActivity
    >,
    protected readonly log: LoggerInstance,
  ) {}

  async syncActivities(userId: string): Promise<Activity[]> {
    // get the last time activities were synced for the user. if activites have never been synced, get the activities for
    // the past two weeks.
    let user = await this.userDAO.findById(userId);
    const nextActivityDate = !isNullOrUndefined(user.lastActivitiesSyncedAt)
      ? new Date(new Date(user.lastActivitiesSyncedAt).getTime())
      : new Date(new Date().getTime() - 1209600 * 1000); // TODO: make this configurable. Currently set to past two weeks.

    // get all activities from strava after the time activities were last synced.
    const providerActivities = await this.providerDAO.getActivities(
      nextActivityDate,
    );

    let newLastSyncedAt = new Date();

    let activities: Activity[] = [];
    if (providerActivities.length > 0) {
      activities = await this.activityDAO.createMultiple(providerActivities);
    }

    // set the lastActivitiesSyncedAt to now.
    // TODO: We might want to set this to the date of the last activity, just in case a ride hasn't been uploaded to
    // strava yet when we perform the sync.
    await this.userDAO.updateLastActivitiesSyncedAt(userId, newLastSyncedAt);

    return activities;
  }
}
