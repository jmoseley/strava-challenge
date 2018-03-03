import * as _ from 'lodash';
import { Meteor } from 'meteor/meteor';
import { ServiceConfiguration } from 'meteor/service-configuration';
import { Mongo } from 'meteor/mongo';
import { JsonRoutes } from 'fine-rest';

import StravaProviderDAO from './providers/strava';
import { Collection as ActivitiesCollection } from '../imports/models/activities';

// Start all the jobs.
import './jobs';

Meteor.publish('activities', () => {
  return ActivitiesCollection.find({ userId: Meteor.userId() });
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
