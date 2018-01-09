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

export const friends = requestHandler(
  true,
  async (context: RequestContext, session: Express.Session) => {
    const log = getLogger('friends', context);
    log.debug(`finding friends`);
    const templateContext = getSharedTemplateContext(session, log);

    const [
      friends,
      potentialFriends,
      needInviteFriends,
    ] = await context.services.friends.getFriends(session.user.id);

    templateContext.friends = friends;
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

    await context.services.activities.syncActivities(session.user.id);

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
    log.debug(`Found user in session.`, {
      displayName: user.displayName,
      providerId: user.providerId,
    });
  }

  return { user };
}
