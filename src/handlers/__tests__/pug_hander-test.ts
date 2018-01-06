import * as _ from 'lodash';
import * as express from 'express';

import * as pugHandler from '../pug_handler';
import { LoggerFactory } from '../../lib/logger';
import { ContextedRequest } from '../../lib/context';

describe(`PugHandler`, () => {
  describe(`index`, () => {
    let req: any;
    let res: any;
    let next: express.NextFunction;
    beforeEach(() => {
      req = {
        context: {
          loggerFactory: new LoggerFactory(`PugHandler.index`),
        },
      };
      res = {
        render: jest.fn(),
      };
    });

    describe(`with a user session`, () => {
      let user: any;
      beforeEach(() => {
        user = { displayName: 'Joe Shmoe' };
        _.set(req, 'session.user', user);
      });

      it(`renders with the users displayName`, async () => {
        await pugHandler.index(req, res, next);

        expect(res.render).toBeCalledWith('index', { user });
      });
    });

    it(`renders without the user`, async () => {
      await pugHandler.index(req, res, next);

      expect(res.render).toBeCalledWith('index', {});
    });
  });
  // TODO: Write tests for /friends
  // TODO: Write tests for /activities
});
