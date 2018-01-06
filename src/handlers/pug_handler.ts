import * as _ from 'lodash';
import * as express from 'express';

import { config } from '../config';
import { LoggerInstance } from '../logger';
import StravaProviderDAO from '../dao/providers/strava';
import { ActivityService } from '../services/activities/activity-service';
import { FriendService } from '../services/friends/friend-service';

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

  // TODO: Provide these in the request container.
  const stravaProvider = new StravaProviderDAO(
    req.session.user.id,
    req.session.user.accessToken,
    req.context.loggerFactory,
  );
  const friendService = new FriendService(
    req.context.daos.user,
    stravaProvider,
  );

  const [potentialFriends, needInviteFriends] = await friendService.getFriends(
    req.session.user.id,
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

  // TODO: Provide these in the request container.
  const stravaProvider = new StravaProviderDAO(
    req.session.user.id,
    req.session.user.accessToken,
    req.context.loggerFactory,
  );
  const activityService = new ActivityService(
    req.context.daos.user,
    req.context.daos.activity,
    stravaProvider,
    log,
  );

  await activityService.syncActivities(req.session.user.id);

  context.activities = await req.context.daos.activity.findActivitiesByUser(
    req.session.user.id,
  );

  res.render('activities', context);
}

// TODO: consider moving the following functions into a base handler class
function isAuthenticated(
  req: any,
  res: express.Response,
  log: LoggerInstance,
): boolean {
  if (!req.session.user) {
    log.debug(`No user in session, redirecting`);
    res.redirect(`/`);
    return false;
  }

  return true;
}

function getLogger(handlerName: string, req: any): LoggerInstance {
  return req.context.loggerFactory.getLogger(`PugHandler.${handlerName}`);
}

function getSharedTemplateContext(req: any, log: LoggerInstance): any {
  const user = _.get(req, 'session.user');
  if (user) {
    log.debug(`Found user in session.`, { displayName: user.displayName });
  }

  return { user };
}
