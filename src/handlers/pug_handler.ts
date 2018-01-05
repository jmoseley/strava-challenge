import * as _ from 'lodash';
import * as express from 'express';

import { config } from '../config';
import { LoggerInstance } from '../logger';
import StravaProviderDAO from '../dao/providers/strava';
import ActivityMongoDAO from '../dao/mongo/activities';
import { isNullOrUndefined } from 'util';

export async function index(req: any, res: express.Response) {
  const log = req.context.loggerFactory.getLogger('PugHandler.index');
  const context = getSharedTemplateContext(req, log);

  res.render('index', context);
}

// Data layout for friends:
// Friend Request:
// sourceUseId, targetUserId
// When request is accepted, we create a friendship, and delete the request
// Frienship:
// user1Id, user2Id
export async function friends(req: any, res: express.Response) {
  const log = getLogger('friends', req);
  const context = getSharedTemplateContext(req, log);

  if (!isAuthenticated(req, res, log)) {
    return;
  }

  const stravaProvider = new StravaProviderDAO(
    req.session.user.id,
    req.session.user.accessToken,
    req.context.loggerFactory,
  );
  const stravaFriends = await stravaProvider.getFriends();

  // Parition by friends that are already in the database.
  // Potential friends are friends that are already on the plgatform.
  // Non-potential friends are friends that aren't on the platform yet, and need to be invited.
  // TODO: Eventually we should just create a user object for all these users that we find.

  // TODO: Move this into a service outside of the handler.
  // Look up all the friends in one query.
  const friendUsers = await req.context.daos.user.findUsers(
    _.map(stravaFriends, f => ({
      provider: f.provider,
      providerId: f.providerId,
    })),
  );
  const [potentialFriends, needInviteFriends] = _.partition(
    stravaFriends,
    stravaFriend => {
      return !!_.find(
        friendUsers,
        friendUser => stravaFriend.providerId === friendUser.providerId,
      );
    },
  );

  // TODO: If there is bi-directional following and the user exists on the platform, we should just create the
  // friendship automatically.

  // TODO: Filter out people that are already friends.
  context.potentialFriends = potentialFriends;
  context.needInviteFriends = needInviteFriends;

  res.render('friends', context);
}

export async function activities(req: any, res: express.Response) {
  const log = getLogger('activities', req);
  const context = getSharedTemplateContext(req, log);

  if (!isAuthenticated(req, res, log)) {
    return;
  }

  const stravaProvider = new StravaProviderDAO(
    req.session.user.id,
    req.session.user.accessToken,
    req.context.loggerFactory,
  );

  // get the last time activities were synced for the user
  let user = await req.context.daos.user.findById(req.session.user.id);
  const nextActivityDate = !isNullOrUndefined(user.lastActivitiesSyncedAt)
    ? new Date(new Date(user.lastActivitiesSyncedAt).getTime() + 1000)
    : new Date(new Date().getTime() - 1209600 * 1000); // TODO: make this configurable. Currently set to past two weeks.

  // get all activities after the time activities were last synced.
  const stravaActivities = await stravaProvider.getActivities(nextActivityDate);
  _.map(stravaActivities, stravaActivity => {
    stravaActivity.userId = req.session.user.id;
    return stravaActivity;
  });

  let newLastSyncedAt = new Date();

  // persist the activities
  await Promise.all(
    _.map(stravaActivities, activity => {
      return req.context.daos.activity.create(activity);
    }),
  );

  // set the last synced activities to the last element (which should be the most recent), or the current time.
  await req.context.daos.user.updateLastActivitiesSyncedAt(
    req.session.user.id,
    newLastSyncedAt,
  );

  context.activities = await req.context.daos.activity.findActivitiesByUser(
    req.session.user.id,
  );

  res.render('activities', context);
}

// TODO: consider moving these into a base handler class
function isAuthenticated(req: any, res: express.Response, log: LoggerInstance) {
  if (!req.session.user) {
    log.debug(`No user in session, redirecting`);
    res.redirect(`/`);
    return false;
  }

  return true;
}

function getLogger(handlerName: string, req: any) {
  return req.context.loggerFactory.getLogger(`PugHandler.${handlerName}`);
}

function getSharedTemplateContext(req: any, log: LoggerInstance): any {
  const user = _.get(req, 'session.user');
  if (user) {
    log.debug(`Found user in session.`, { displayName: user.displayName });
  }

  return { user };
}
