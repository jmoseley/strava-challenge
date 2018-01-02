import * as _ from 'lodash';
import * as express from 'express';

import { config } from '../config';

// TODO: Types.
// const strava = require('strava-v3');

export async function index(req: any, res: express.Response) {
  const log = req.context.loggerFactory.getLogger('PageHandler/Index');

  const user = _.get(req, 'session.user');
  if (user) {
    log.debug(`Found user in session.`, { displayName: user.displayName });
  }
  res.render('index', { user });
}
