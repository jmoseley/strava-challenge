import * as _ from 'lodash';
import { Meteor } from 'meteor/meteor';
import * as moment from 'moment';

import { runJob, JobResult, RunArguments } from '../lib/jobs';
import StravaProviderDAO from '../providers/strava';
import { Collection as ActivitiesCollection } from '../../imports/models/activities';

// Only use this for the repeating job.
export const SYNC_USER_ACTIVITIES_JOB_ID = 'syncUserActivties';

export interface SyncUserActivitiesArgs extends RunArguments {
  userId?: string;
}

export async function syncUserActivities(
  args: RunArguments,
): Promise<JobResult> {
  console.info(`Syncing user activities with args: ${JSON.stringify(args)}`);
  let users: Meteor.User[];

  if (args && args.userId) {
    users = Meteor.users
      .find({
        _id: args.userId,
      })
      .fetch();
  } else {
    users = Meteor.users
      .find({
        $and: [
          {
            $or: [
              {
                lastSyncedAt: {
                  $lt: moment()
                    .subtract(10, 'minutes')
                    .toDate(),
                },
              },
              {
                lastSyncedAt: { $exists: false },
              },
            ],
          },
          {
            'services.strava': { $exists: true },
          },
        ],
      })
      .fetch();
  }

  console.info(`Found ${users.length} users to sync.`);

  for (const user of users) {
    // TODO: Bulkkkkkk!
    const dao = new StravaProviderDAO(user);

    // TODO: Maybe we should limit this call to a certain number of activities?
    // TODO: Obey Strava rate limiting.
    const activities = await dao.getActivities();

    console.info(
      `Syncing ${activities.length} activities for user with id ${user._id}.`,
    );

    await Promise.all(
      _.map(activities, async activity => {
        await ActivitiesCollection.upsert(
          { provider: activity.provider, providerId: activity.providerId },
          { $set: activity },
        );
      }),
    );

    console.info(`Upadting lastSyncedAt for ${user._id}.`);

    Meteor.users.update(
      { _id: user._id },
      { $set: { lastSyncedAt: new Date() } },
    );
  }

  return JobResult.SUCCESS;
}

runJob({
  name: SYNC_USER_ACTIVITIES_JOB_ID,
  job: syncUserActivities,
  repeatSeconds: 2 * 60, // 2 minutes
});
