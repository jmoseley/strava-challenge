import * as _ from 'lodash';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { ServiceConfiguration } from 'meteor/service-configuration';
import { Mongo } from 'meteor/mongo';

import StravaProviderDAO from './providers/strava';
import { Collection as ActivitiesCollection } from '../imports/models/activities';

Accounts.onLogin(async (result: any) => {
  // For now, sync on login.
  // TODO: Eventually we should have a background task that syncs with Strava.
  const user = Meteor.users.findOne({ _id: result.user._id });

  const dao = new StravaProviderDAO(user);

  const activities = await dao.getActivities();

  await Promise.all(
    _.map(activities, async activity => {
      await ActivitiesCollection.upsert(
        { provider: activity.provider, providerId: activity.providerId },
        { $set: activity },
      );
    }),
  );
});

Meteor.publish('activities', () => {
  return ActivitiesCollection.find({ userId: Meteor.userId() });
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
