import { Meteor } from 'meteor/meteor';
import * as _ from 'lodash';
import { Quantity } from '@neutrium/quantity';

import { JobResult, RunArguments } from '../lib/jobs';
import { Collection as ActivitiesCollection } from '../../imports/models/activities';
import { Collection as ChallengesCollection } from '../../imports/models/challenges';
import { sendActivityNotificationEmail, EMAIL_TEMPLATES } from '../lib/email';

export interface NotifyForActivityArgs extends RunArguments {
  activityId: string;
}

export async function notifyForActivity(
  args?: NotifyForActivityArgs,
): Promise<JobResult> {
  if (!args) {
    console.error(`Cannot notify without an activityId.`);
    return JobResult.FAILURE_WITHOUT_RETRY;
  }

  console.info(`Sending notifications for new activity: ${args.activityId}`);

  const activity = await ActivitiesCollection.findOne({ _id: args.activityId });

  if (!activity) {
    console.error(`Unable to find activity: ${args.activityId}`);
    return JobResult.FAILURE_WITHOUT_RETRY;
  }

  const challenger = await Meteor.users.findOne({ _id: activity.userId });

  if (!challenger) {
    console.error(
      `Unable to find user for activity. Acitivty ID: ${
        activity._id
      } User ID: ${activity.userId}`,
    );
    return JobResult.FAILURE_WITHOUT_RETRY;
  }

  const challenges = await ChallengesCollection.find({
    members: challenger._id,
  }).fetch();

  if (!challenges || !challenges.length) {
    console.info(
      `No challenges found for user. User ID: ${challenger._id} Activity ID: ${
        activity._id
      }`,
    );
    return JobResult.SUCCESS;
  }

  const activityMiles = toMiles(activity.distance);

  // Send a separate email to each participant in each challenge.
  // TODO: Send a single email for each challenge once SendGrid supports substitutions for arrays of things.
  // TODO: Limit this to a single email per user, to prevent multiple emails being sent when two users are in
  // multiple challanges together.
  for (const challenge of challenges) {
    const memberIds = _.filter(
      challenge.members,
      uid => uid !== challenger._id,
    );
    const members = await Meteor.users
      .find({ _id: { $in: memberIds } })
      .fetch();

    const emails = _(members)
      .map(
        member =>
          _.get(member, 'profile.email') ||
          _.get(member, 'services.strava.email'),
      )
      .compact()
      .value();

    // TODO: Eventually include summary information too, like percentage complete and the receivers data as
    // well.
    // TODO: Include suggestions of rides the receiver can do.
    await sendActivityNotificationEmail(
      {
        recipients: emails,
      },
      {
        challengerName: _.get(challenger, 'profile.fullName'),
        challengerMiles: activityMiles,
        challengeName: challenge.name,
      },
    );
  }

  return JobResult.SUCCESS;
}

function toMiles(meters: number): string {
  return new Quantity(`${meters} m`).to('mi').scalar.toFixed(2);
}
