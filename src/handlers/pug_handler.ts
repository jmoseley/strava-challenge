import * as _ from 'lodash';
import * as express from 'express';

import { config } from '../config';
import { LoggerInstance } from '../logger';

function getSharedTemplateContext(req: any, log: LoggerInstance): object {
  const user = _.get(req, 'session.user');
  if (user) {
    log.debug(`Found user in session.`, { displayName: user.displayName });
  }

  return { user };
}

export async function index(req: any, res: express.Response) {
  const log = req.context.loggerFactory.getLogger('PugHandler.index');

  const context = getSharedTemplateContext(req, log);

  res.render('index', context);
}

export async function friends(req: any, res: express.Response) {
  const log = req.context.loggerFactory.getLogger(`PugHander.friends`);
  const context = getSharedTemplateContext(req, log);

  res.render('friends', context);
}
