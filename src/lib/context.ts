import * as _ from 'lodash';
import * as express from 'express';
import * as shortUUID from 'short-uuid';

import {
  LoggerFactory,
  LoggerRequestContext,
  getRequestContext as loggerContextGenerator,
} from './logger';
import {
  DaoRequestContext,
  getRequestContextGenerator as getDAORequestContextGenerator,
} from '../dao/context';
import {
  ServiceRequestContext,
  getRequestContext as serviceContextGenerator,
} from '../services/context';
import StravaProviderDAO from '../dao/providers/strava';

export interface RequestContext
  extends LoggerRequestContext,
    DaoRequestContext,
    ServiceRequestContext {
  traceId: string;
}

export interface ContextedRequest extends express.Request {
  context: RequestContext;
}

const shortUUIDFormat = shortUUID(shortUUID.constants.flickrBase58);

export async function getContextGeneratorMiddleware() {
  const daoContextGenerator = await getDAORequestContextGenerator();

  return () => {
    return (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      if (!!_.get(req, 'context')) {
        throw new Error(`Request already has a context!`);
      }

      try {
        const traceId = req.get('x-trace-id') || shortUUIDFormat.new();
        const loggerContext = loggerContextGenerator(traceId);
        const daoContext = daoContextGenerator(loggerContext.loggerFactory);
        // This got really messy. We need to clean up the patterns around providers. I will do that in a later
        // PR.
        const serviceContext = serviceContextGenerator(
          loggerContext.loggerFactory,
          daoContext.daos.user,
          daoContext.daos.activity,
          _.get(daoContext, 'daos.providers.strava') as
            | StravaProviderDAO
            | undefined,
        );

        const context: RequestContext = {
          ...loggerContext,
          ...daoContext,
          ...serviceContext,
          traceId,
        };

        (req as ContextedRequest).context = context;

        next();
      } catch (err) {
        next(err);
      }
    };
  };
}
