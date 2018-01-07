import { FriendService } from './friends/friend_service';
import { ActivityService } from './activities/activity_service';
import UserMongoDAO from '../dao/mongo/users';
import { LoggerFactory } from '../lib/logger';
import ActivityMongoDAO from '../dao/mongo/activities';
import { AllProvidersDao } from '../dao/providers/all';

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
  providerDao: AllProvidersDao,
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
