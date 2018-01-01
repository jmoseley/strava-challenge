import * as express from 'express';

import { config } from '../config';

// TODO: Types.
const strava = require('strava-v3');

export async function index(req: any, res: express.Response) {
  const log = req.context.loggerFactory.getLogger('PageHandler/Index');
  log.info(`Rendering index.`);
  log.info('strava', config.get('strava'));
  const strava_auth_url = strava.oauth.getRequestAccessURL(config.get('strava'));
  log.info('strava_auth_url', { strava_auth_url });
  res.render('index', {
    strava_auth_url,
  });
}
