import * as _ from 'lodash';
import * as uuid from 'uuid';
import * as url from 'url';
import { Meteor } from 'meteor/meteor';
import { toBase64Url } from 'b64u-lite';

import {
  Collection as ChallengeCollection,
  ChallengeCreateOptions,
  ChallengeInviteOptions,
  Errors,
} from '../../imports/models/challenges';
import {
  Collection as ChallengeInviteCollection,
  ChallengeInviteStatus,
} from '../../imports/models/challenge_invites';
import { sendEmail, EMAIL_TEMPLATES } from '../lib/email';

Meteor.methods({
  'challenge.create': ({
    newChallenge,
  }: {
    newChallenge: ChallengeCreateOptions;
  }) => {
    // TODO: Validation. Typescript helps, but dosen't protect us from maliciousness.
    ChallengeCollection.insert({
      ...newChallenge,
      members: [Meteor.userId()],
      creatorId: Meteor.userId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      _id: uuid.v4(),
    });
  },
  'challenge.accept': ({
    challengeInviteId,
  }: {
    challengeInviteId: string;
  }) => {
    const challengeInvite = ChallengeInviteCollection.findOne({
      _id: challengeInviteId,
    });

    if (!challengeInvite) {
      throw new Meteor.Error(Errors.NOT_FOUND, 'Challenge Invite not found.');
    }

    const email =
      _.get(Meteor.user(), 'profile.email') ||
      _.get(Meteor.user(), 'services.strava.email');
    if (
      (challengeInvite.inviteeId &&
        Meteor.userId() !== challengeInvite.inviteeId) ||
      challengeInvite.email !== email
    ) {
      throw new Meteor.Error(
        Errors.UNAUTHORIZED,
        'Only the invitee can accept a challenge invite.',
      );
    }

    console.info(`Accepting invite for user ${Meteor.userId}.`);
    ChallengeInviteCollection.update(
      { _id: challengeInvite._id },
      { status: ChallengeInviteStatus.FULFILLED },
    );
    ChallengeCollection.update(
      { _id: challengeInvite.challengeId },
      { $addToSet: { members: Meteor.userId() } },
    );
  },
  'challenge.invite': async ({
    email,
    challengeId,
  }: ChallengeInviteOptions) => {
    // TODO: Validation. Typescript helps, but dosen't protect us from maliciousness.
    console.info(`Inviting ${email} to challenge ${challengeId}`);
    const challenge = ChallengeCollection.findOne({ _id: challengeId });
    if (!challenge) {
      console.info(`Challenge not found.`);
      throw new Meteor.Error(Errors.NOT_FOUND, `Challenge not found.`);
    }

    // For now only allow the owner of the challenge to invite people. Maybe we should open this up in the
    // future?
    if (Meteor.userId() !== challenge.creatorId) {
      console.info(`User is not owner of challenge.`);
      throw new Meteor.Error(
        Errors.UNAUTHORIZED,
        `Only the owner can invite people.`,
      );
    }

    const invitee = Meteor.users.findOne({
      $or: [{ 'services.strava.email': email }, { 'profile.email': email }],
    });

    // Ensure the user is not already a member of the challenge.
    if (invitee && _.includes(challenge.members, invitee._id)) {
      console.info(`User is already a member of this challenge.`);
      throw new Meteor.Error(
        Errors.ALREADY_MEMBER,
        `This user is already a member of this challenge.`,
      );
    }

    // Prevent multiple invites.
    const existingChallengeInvite = ChallengeInviteCollection.findOne({
      $and: [
        { challengeId: challenge._id },
        {
          $or: [{ email }, { inviteeId: invitee._id }],
        },
      ],
    });
    if (existingChallengeInvite) {
      console.info(`There is already an outstanding invite for this user.`);
      return;
    }

    const challengeInviteId = uuid.v4();

    // Insert the object.
    ChallengeInviteCollection.insert({
      _id: challengeInviteId,
      challengeId: challenge._id,
      inviteeId: _.get(invitee, '_id'),
      email,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: ChallengeInviteStatus.PENDING,
    });

    // Send the email!
    // TODO: Send different emails depending on whether the user is currently a member yet. New users need
    // a better introduction.
    await sendEmail({
      recipients: [email],
      templateId: EMAIL_TEMPLATES.CHALLENGE_INVITE,
      substitutions: {
        inviterName: _.get(Meteor.user(), 'profile.fullName'),
        acceptUrl: buildAcceptUrl(challengeInviteId),
        challengeName: challenge.name,
        challengeDistanceMiles: challenge.distanceMiles,
      },
    });
  },
});

function buildAcceptUrl(challengeInviteId: string): string {
  const baseUrl = Meteor.settings.rootUrl;

  // All of this is basically arbitrary. Just vaguely disguising how this mechanism works for no good reason.
  const param = toBase64Url(JSON.stringify({ challengeInviteId }));
  const acceptUrl = new url.URL('/', baseUrl);
  acceptUrl.search = `_p=${param}`;

  return acceptUrl.toString();
}
