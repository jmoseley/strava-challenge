import * as express from 'express';
import * as MongoDB from 'mongodb';

import { config } from '../config';
import { getLogger, LoggerFactory } from '../lib/logger';
import UserMongoDAO from './mongo/users';
import ActivityMongoDAO from './mongo/activities';
import { ContextedRequest } from '../lib/context';

const LOG = getLogger('lib/db');

export interface DaoRequestContext {
  daos: {
    user: UserMongoDAO;
    activity: ActivityMongoDAO;
  };
}

export async function getRequestContextGenerator() {
  LOG.debug(`Building DaoRequestContext`);
  const mongodbConfig = config.get('mongodb');
  const dbClient = await MongoDB.MongoClient.connect(mongodbConfig.url);
  const db = dbClient.db(mongodbConfig.dbName);
  LOG.info(`Successfully connected to database.`);

  return (loggerFactory: LoggerFactory): DaoRequestContext => {
    return {
      daos: {
        user: new UserMongoDAO(loggerFactory, db),
        activity: new ActivityMongoDAO(loggerFactory, db),
      },
    };
  };
}
