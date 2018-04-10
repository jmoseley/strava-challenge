import * as _ from 'lodash';
import { Meteor } from 'meteor/meteor';
import * as moment from 'moment';

import { runJob, JobResult, RunArguments } from '../lib/jobs';
import StravaProviderDAO from '../providers/strava';
import { Collection as ActivitiesCollection } from '../../imports/models/activities';

// Only use this for the repeating job.
export const SYNC_USER_RELATIONSHIPS_JOB_ID = 'syncUserRelationships';

export interface SyncUserRelationshipsArgs extends RunArguments {
  userId?: string;
}

export async function syncUserRelationships(
  args: SyncUserRelationshipsArgs,
): Promise<JobResult> {
  console.info(`Syncing user relationships with args: ${JSON.stringify(args)}`);
  let users: Meteor.User[];

  if (args && args.userId) {
    users = Meteor.users
      .find({
        _id: args.userId,
      })
      .fetch();
  } else {
    users = Meteor.users
      .find(
        {
          $and: [
            {
              $or: [
                {
                  lastSyncedRelationshipsAt: {
                    $lt: moment()
                      .subtract(6, 'hours')
                      .toDate(),
                  },
                },
                {
                  lastSyncedRelationshipsAt: { $exists: false },
                },
              ],
            },
            {
              'services.strava': { $exists: true },
            },
          ],
        },
        { limit: 5 },
      )
      .fetch();
  }

  console.info(`Found ${users.length} users to sync.`);

  for (const user of users) {
    // TODO: Bulkkkkkk!
    const dao = new StravaProviderDAO(user);

    // N^2...
    const potentialFriends = Meteor.users
      .find({ _id: { $nin: [user._id, ...(user.friends || [])] } })
      .fetch();

    // TODO: Maybe we should limit this call to a certain number of activities?
    // TODO: Obey Strava rate limiting.
    for (const potentialFriend of potentialFriends) {
      const isFriend = await dao.isMutualFriend(potentialFriend);
      if (!isFriend) {
        continue;
      }

      // Add the relationship to the user.
      console.info(
        `Establishing friendship between ${user._id} && ${potentialFriend._id}`,
      );
      Meteor.users.update(
        { _id: user._id },
        { $addToSet: { friends: potentialFriend._id } },
      );
      Meteor.users.update(
        { _id: potentialFriend._id },
        { $addToSet: { friends: user._id } },
      );
    }

    console.info(`Upadting lastSyncedRelationshipsAt for ${user._id}.`);

    Meteor.users.update(
      { _id: user._id },
      { $set: { lastSyncedRelationshipsAt: new Date() } },
    );
  }

  return JobResult.SUCCESS;
}

// TODO: Run this job on repeat.
