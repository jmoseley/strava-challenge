import * as _ from 'lodash';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { ServiceConfiguration } from 'meteor/service-configuration';
import { Mongo } from 'meteor/mongo';
import { JsonRoutes } from 'fine-rest';

import StravaProviderDAO from './providers/strava';
import { Collection as ActivitiesCollection } from '../imports/models/activities';
import { Collection as ChallengesCollection } from '../imports/models/challenges';
import { Collection as ChallengeInvitesCollection } from '../imports/models/challenge_invites';
import { runJob } from './lib/jobs';
import { SYNC_USER_ACTIVITIES_JOB_ID, syncUserActivities } from './jobs';

// Start all the jobs.
import './jobs';

Accounts.onLogin((loginOptions: { type: string; user: Meteor.User }) => {
  const userId = _.get(loginOptions, 'user._id');

  if (userId) {
    // Sync the users activities so we look like we are up to date. This is also done at regular intervals.
    runJob({
      // It's important this name is not the same as the repeating sync job, otherwise we will cancel the repeating version.
      name: `loginUser-${SYNC_USER_ACTIVITIES_JOB_ID}`,
      job: syncUserActivities,
      args: {
        userId,
      },
    });
  }
});

Meteor.publish('activities', () => {
  return ActivitiesCollection.find({ userId: Meteor.userId() });
});

Meteor.publish('challenges', () => {
  return ChallengesCollection.find({
    $or: [{ creatorId: Meteor.userId() }, { members: Meteor.userId() }],
  });
});

Meteor.publish('challengeInvites', () => {
  return ChallengeInvitesCollection.find({
    $or: [
      { email: _.get(Meteor.user(), 'profile.email') },
      { email: _.get(Meteor.user(), 'services.strava.email') },
      { inviteeId: Meteor.userId() },
    ],
  });
});

JsonRoutes.add('GET', '/status', (req: Request, res: Response) => {
  console.info(`Handling status request.`);
  JsonRoutes.sendResult(res, {
    code: 200,
    data: {
      result: 'OK',
    },
  });
});

ServiceConfiguration.configurations.remove({
  service: 'strava',
});

ServiceConfiguration.configurations.upsert(
  { service: 'strava' },
  {
    $set: {
      client_id: Meteor.settings.strava.clientId,
      secret: Meteor.settings.strava.clientSecret,
    },
  },
);

Meteor.startup(() => {
  console.log('Hello world!');
});
