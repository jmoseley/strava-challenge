import { Meteor } from 'meteor/meteor';
import { ServiceConfiguration } from 'meteor/service-configuration';

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
