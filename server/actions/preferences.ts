import { Meteor } from 'meteor/meteor';
import * as _ from 'lodash';

import {
  NOTIFICATION_EVENTS,
  NOTIFICATION_TYPES,
  SetNotificationPreferencesOptions,
} from '../../imports/preferences';

Meteor.publish('userData', function() {
  if (this.userId) {
    return Meteor.users.find(
      { _id: this.userId },
      {
        fields: { preferences: 1 },
      },
    );
  } else {
    this.ready();
  }
});

Meteor.methods({
  'preferences.notifications.set': ({
    notificationEvent,
    notificationType,
    newValue,
  }: SetNotificationPreferencesOptions) => {
    console.info(
      `Setting notificatino preference for user ${Meteor.userId()}. ${notificationEvent} ${notificationType} ${newValue ===
        true}`,
    );
    const prefs = Meteor.user().preferences || {};

    if (!prefs.notifications) {
      prefs.notifications = {
        [NOTIFICATION_EVENTS.CHALLENGE_INVITE]: [NOTIFICATION_TYPES.EMAIL],
        [NOTIFICATION_EVENTS.CHALLENGE_ACTIVITY]: [NOTIFICATION_TYPES.EMAIL],
      };
    }

    if (newValue === true) {
      prefs.notifications[notificationEvent] = _(
        prefs.notifications[notificationEvent],
      )
        .push(notificationType)
        .uniq()
        .value();
    } else {
      prefs.notifications[notificationEvent] = _.filter(
        prefs.notifications[notificationEvent],
        existingType => existingType !== notificationType,
      );
    }

    Meteor.users.update(
      { _id: Meteor.userId() },
      { $set: { preferences: prefs } },
    );
  },
});
