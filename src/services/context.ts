import { FriendService } from './friends/friend_service';
import { ActivityService } from './activities/activity_service';
import UserMongoDAO from '../dao/mongo/users';
import {
  BaseProviderDAO,
  ProviderUser,
  ProviderActivity,
  AuthenticatedUser,
} from '../dao/providers/base';
import { LoggerFactory } from '../lib/logger';
import ActivityMongoDAO from '../dao/mongo/activities';

export interface ServiceRequestContext {
  services: {
    friends: FriendService;
    activities: ActivityService;
  };
}

export function getRequestContext(
  loggerFactory: LoggerFactory,
  userDao: UserMongoDAO,
  activityDao: ActivityMongoDAO,
  providerDao: BaseProviderDAO<ProviderUser, ProviderActivity>,
): ServiceRequestContext {
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
