import * as express from 'express';
import * as MongoDB from 'mongodb';

import { config } from '../config';
import { getLogger, LoggerFactory } from '../lib/logger';
import UserMongoDAO, { User } from './mongo/users';
import ActivityMongoDAO from './mongo/activities';
import { ContextedRequest } from '../lib/context';
import StravaProviderDAO from './providers/strava';

const LOG = getLogger('lib/db');

interface ProvidersList {
  strava: StravaProviderDAO;
}

export interface DaoRequestContext {
  daos: {
    user: UserMongoDAO;
    activity: ActivityMongoDAO;
    providers?: ProvidersList;
  };
}

export async function getRequestContextGenerator() {
  LOG.debug(`Building DaoRequestContext`);
  const mongodbConfig = config.get('mongodb');
  const dbClient = await MongoDB.MongoClient.connect(mongodbConfig.url);
  const db = dbClient.db(mongodbConfig.dbName);
  LOG.info(`Successfully connected to database.`);

  return (loggerFactory: LoggerFactory, user?: User): DaoRequestContext => {
    let providers: ProvidersList | undefined = undefined;
    if (user) {
      providers = {
        strava: new StravaProviderDAO(
          user.providerId,
          user.accessToken,
          loggerFactory,
        ),
      };
    }

    return {
      daos: {
        user: new UserMongoDAO(loggerFactory, db),
        activity: new ActivityMongoDAO(loggerFactory, db),
        providers,
      },
    };
  };
}
