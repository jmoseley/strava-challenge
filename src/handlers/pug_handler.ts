import * as _ from 'lodash';
import * as express from 'express';

import { config } from '../config';
import { LoggerInstance, LoggerFactory } from '../lib/logger';
import StravaProviderDAO from '../dao/providers/strava';
import { ActivityService } from '../services/activities/activity_service';
import { FriendService } from '../services/friends/friend_service';
import { ContextedRequest, RequestContext } from '../lib/context';
import { requestHandler } from './base';

export const index = requestHandler(
  false,
  async (context: RequestContext, session: Express.Session) => {
    const log = getLogger('PugHandler.index', context);
    const templateContext = getSharedTemplateContext(session, log);

    return { template: { name: 'index', context: templateContext } };
  },
);

// Data layout for friends:
// Friend Request:
// sourceUseId, targetUserId
// When request is accepted, we create a friendship, and delete the request
// Frienship:
// user1Id, user2Id
export const friends = requestHandler(
  true,
  async (context: RequestContext, session: Express.Session) => {
    const log = getLogger('friends', context);
    const templateContext = getSharedTemplateContext(session, log);

    // TODO: Provide these in the request container.
    const stravaProvider = new StravaProviderDAO(
      session.user.id,
      session.user.accessToken,
      context.loggerFactory,
    );
    const friendService = new FriendService(
      context.daos.user,
      stravaProvider,
      log,
    );

    const [
      potentialFriends,
      needInviteFriends,
    ] = await friendService.getFriends(session.user.id);

    // TODO: If there is bi-directional following and the user exists on the platform, we should just create the
    // friendship automatically.

    // TODO: Filter out people that are already friends.
    templateContext.potentialFriends = potentialFriends;
    templateContext.needInviteFriends = needInviteFriends;

    return { template: { name: 'friends', context: templateContext } };
  },
);

export const activities = requestHandler(
  true,
  async (context: RequestContext, session: Express.Session) => {
    const log = getLogger('activities', context);
    const templateContext = getSharedTemplateContext(session, log);

    // TODO: Provide these in the request container.
    const stravaProvider = new StravaProviderDAO(
      session.user.id,
      session.user.accessToken,
      context.loggerFactory,
    );
    const activityService = new ActivityService(
      context.daos.user,
      context.daos.activity,
      stravaProvider,
      log,
    );

    await activityService.syncActivities(session.user.id);

    templateContext.activities = await context.daos.activity.findActivitiesByUser(
      session.user.id,
    );

    return { template: { name: 'activities', context: templateContext } };
  },
);

function getLogger(
  handlerName: string,
  context: RequestContext,
): LoggerInstance {
  return context.loggerFactory.getLogger(`PugHandler.${handlerName}`);
}

function getSharedTemplateContext(
  session: Express.Session,
  log: LoggerInstance,
): any {
  const user = _.get(session, 'user');
  if (user) {
    log.debug(`Found user in session.`, { displayName: user.displayName });
  }

  return { user };
}
