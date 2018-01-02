import * as _ from 'lodash';
import * as express from 'express';

import { config } from '../config';

// TODO: Types.
const strava = require('strava-v3');

export async function index(req: any, res: express.Response) {
  const log = req.context.loggerFactory.getLogger('PageHandler/Index');

  let user;
  if (_.get(req.session, 'passport.user')) {
    log.info(`Found user session.`, { displayName: req.session.passport.user.displayName });
    user = req.session.passport.user;
  }
  res.render('index', { user });
}
