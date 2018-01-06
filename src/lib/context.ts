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

export interface RequestContext
  extends LoggerRequestContext,
    DaoRequestContext {
  traceId: string;
}

export interface ContextedRequest extends express.Request {
  context: RequestContext;
  // This allows us to skip type checking for the session.
  session: Express.Session;
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

        const context: RequestContext = {
          ...loggerContext,
          ...daoContext,
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
