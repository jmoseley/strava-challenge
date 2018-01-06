import * as _ from 'lodash';
import * as express from 'express';
import { RequestContext, ContextedRequest } from '../lib/context';

export interface RequestHandlerResult {
  template?: {
    name: string;
    context: object;
  };
  redirect?: string;
}
export type RequestHandler = (
  context: RequestContext,
  session: Express.Session,
) => Promise<RequestHandlerResult>;

export function requestHandler(
  requiresAuthentication: boolean,
  handler: RequestHandler,
): express.RequestHandler {
  const expressHandler = async (
    req: ContextedRequest,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const log = req.context.loggerFactory.getLogger('RequestHandler');

    let session: Express.Session = {} as any;
    if (requiresAuthentication) {
      session = _.get(req, 'session');
      if (!session) {
        throw new Error(`Not authenticated`);
      }
    }

    const result = await handler(req.context, session);

    if (!result) {
      throw new Error('unexpected undefined result');
    }
    const { template, redirect } = result;
    if (template) {
      res.render(template.name, template.context);
    } else if (redirect) {
      res.redirect(redirect);
    } else {
      throw new Error(
        `Handler must return a template to render or a redirect target`,
      );
    }
  };

  return expressHandler as any; // Need to fool the types into accepting ContextedRequest as Request.
}