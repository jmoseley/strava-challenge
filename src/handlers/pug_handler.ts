import * as express from 'express';

export async function index(req: any, res: express.Response) {
  const log = req.context.loggerFactory.getLogger('PageHandler/Index');
  log.info(`Rendering index.`);
  res.render('index', {
    strava_auth_url: 'http://example.com',
  });
}
