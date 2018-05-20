import { Meteor } from 'meteor/meteor';
import * as _ from 'lodash';

import { Activity } from '../../imports/models/activities';
import { Challenge } from '../../imports/models/challenges';
import {
  NOTIFICATION_EVENTS,
  NOTIFICATION_TYPES,
} from '../../imports/preferences';
import { getNotificationTypesForEvent } from '../actions/preferences';
import { sendChallengeInviteEmail } from './email';

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
                recipients: [email],
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
        recipients: [email],
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
  challenger: Meteor.User,
  receiver: Meteor.User,
  activity: Activity,
): Promise<void> {
  //
}
