import * as _ from 'lodash';
import * as uuid from 'uuid';
import * as url from 'url';
import { Meteor } from 'meteor/meteor';
import { publishComposite } from 'meteor/reywood:publish-composite';

import {
  Collection as ChallengesCollection,
  ChallengeCreateOptions,
  ChallengeInviteOptions,
  Errors,
} from '../../imports/models/challenges';
import {
  Collection as ChallengeInvitesCollection,
  ChallengeInviteStatus,
  ChallengeInvite,
} from '../../imports/models/challenge_invites';
import { sendEmail, EMAIL_TEMPLATES } from '../lib/email';

function getChallengeInvitesFilter() {
  return {
    $and: [
      { status: ChallengeInviteStatus.PENDING },
      {
        $or: [
          { email: _.get(Meteor.user(), 'profile.email') },
          { email: _.get(Meteor.user(), 'services.strava.email') },
          { inviteeId: Meteor.userId() },
        ],
      },
    ],
  };
}

Meteor.publish('challenges', () => {
  return ChallengesCollection.find({
    $or: [{ creatorId: Meteor.userId() }, { members: Meteor.userId() }],
  });
});

publishComposite('challengeInvites', {
  find() {
    const filter = getChallengeInvitesFilter();
    return ChallengeInvitesCollection.find(filter);
  },
  children: [
    {
      find(challengeInvite: ChallengeInvite) {
        return ChallengesCollection.find({ _id: challengeInvite.challengeId });
      },
    },
  ],
});

Meteor.methods({
  'challenge.create': ({
    newChallenge,
  }: {
    newChallenge: ChallengeCreateOptions;
  }) => {
    // TODO: Validation. Typescript helps, but dosen't protect us from maliciousness.
    ChallengesCollection.insert({
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
    const challengeInvite = ChallengeInvitesCollection.findOne({
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

    console.info(`Accepting invite for user ${Meteor.userId()}.`);
    ChallengeInvitesCollection.update(
      { _id: challengeInvite._id },
      { status: ChallengeInviteStatus.FULFILLED },
    );
    ChallengesCollection.update(
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
    const challenge = ChallengesCollection.findOne({ _id: challengeId });
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
    const existingChallengeInvite = ChallengeInvitesCollection.findOne({
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
    ChallengeInvitesCollection.insert({
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
        acceptUrl: Meteor.settings.rootUrl,
        challengeName: challenge.name,
        challengeDistanceMiles: challenge.distanceMiles,
      },
    });
  },
});
