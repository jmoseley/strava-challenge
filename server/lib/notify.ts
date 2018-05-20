import { Meteor } from 'meteor/meteor';
import * as _ from 'lodash';

import { Activity } from '../../imports/models/activities';
import { Challenge } from '../../imports/models/challenges';
import {
  NOTIFICATION_EVENTS,
  NOTIFICATION_TYPES,
} from '../../imports/preferences';
import { getNotificationTypesForEvent } from '../actions/preferences';
import {
  sendChallengeInviteEmail,
  sendActivityNotificationEmail,
} from './email';

export async function notifyForChallengeInvite(
  challenge: Challenge,
  inviter: Meteor.User,
  email: string,
  invitee?: Meteor.User,
): Promise<void> {
  if (invitee) {
    const notificationTypes = getNotificationTypesForEvent(
      invitee,
      NOTIFICATION_EVENTS.CHALLENGE_INVITE,
    );

    if (!notificationTypes.length) {
      console.info(
        `Not sending notification for user ${invitee._id} and event ${
          NOTIFICATION_EVENTS.CHALLENGE_INVITE
        } because the user has no preferences for this event.`,
      );
      return;
    }

    await Promise.all(
      _.map(notificationTypes, async nt => {
        switch (nt) {
          case NOTIFICATION_TYPES.EMAIL:
            console.info(
              `Sending email for Challenge Invite to user ${invitee._id}.`,
            );
            return await sendChallengeInviteEmail(
              {
                recipient: email,
              },
              {
                inviterName: _.get(inviter, 'profile.fullName'),
                acceptUrl: Meteor.settings.rootUrl,
                challengeName: challenge.name,
                challengeDistanceMiles: challenge.distanceMiles,
              },
            );
          default:
            console.error(`Unknown notification type: ${nt}.`);
            return;
        }
      }),
    );
  } else {
    // If we only have their email, we don't have preferences so just send an email.
    // TODO: Send different emails depending on whether the user is currently a member yet. New users need
    // a better introduction.
    return await sendChallengeInviteEmail(
      {
        recipient: email,
      },
      {
        inviterName: _.get(inviter, 'profile.fullName'),
        acceptUrl: Meteor.settings.rootUrl,
        challengeName: challenge.name,
        challengeDistanceMiles: challenge.distanceMiles,
      },
    );
  }
}

export async function notifyForActivityNotification(
  rider: Meteor.User,
  receiver: Meteor.User,
  challengeName: string,
  activityMiles: string,
): Promise<void> {
  const notificationTypes = getNotificationTypesForEvent(
    receiver,
    NOTIFICATION_EVENTS.CHALLENGE_ACTIVITY,
  );

  // TODO: Eventually include summary information too, like percentage complete and the receivers data as
  // well.
  // TODO: Include suggestions of rides the receiver can do.
  const notificationDetails = {
    challengerName: _.get(rider, 'profile.fullName') as string,
    challengerMiles: activityMiles,
    challengeName,
  };

  await Promise.all(
    _.map(notificationTypes, async nt => {
      switch (nt) {
        case NOTIFICATION_TYPES.EMAIL:
          const email =
            _.get(receiver, 'profile.email') ||
            _.get(receiver, 'services.strava.email');
          return await sendActivityNotificationEmail(
            {
              recipient: email,
            },
            notificationDetails,
          );
        default:
          console.error(`Unknown notification type ${nt}.`);
          return;
      }
    }),
  );
}
