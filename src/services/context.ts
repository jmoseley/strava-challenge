import { FriendService } from './friends/friend_service';
import { ActivityService } from './activities/activity_service';
import UserMongoDAO from '../dao/mongo/users';
import {
  BaseProviderDAO,
  ProviderUser,
  ProviderActivity,
} from '../dao/providers/base';
import { LoggerFactory } from '../lib/logger';
import ActivityMongoDAO from '../dao/mongo/activities';

export interface ServiceRequestContext {
  services?: {
    friends: FriendService;
    activities: ActivityService;
  };
}

export function getRequestContext(
  loggerFactory: LoggerFactory,
  userDao: UserMongoDAO,
  activityDao: ActivityMongoDAO,
  providerDao?: BaseProviderDAO<ProviderUser, ProviderActivity>,
): ServiceRequestContext {
  if (!providerDao) {
    return {};
  }

  return {
    services: {
      friends: new FriendService(loggerFactory, userDao, providerDao),
      activities: new ActivityService(
        loggerFactory,
        userDao,
        activityDao,
        providerDao,
      ),
    },
  };
}
