import * as _ from 'lodash';
import * as express from 'express';
import * as uuid from 'uuid';

import * as authHandler from '../auth_handler';
import { fail } from 'assert';
import { LoggerFactory } from '../../lib/logger';

describe(`AuthHandler`, () => {
  let res: any;
  let req: any;
  let next: express.NextFunction;
  beforeEach(() => {
    req = {
      session: {},
      context: {
        loggerFactory: new LoggerFactory(`AuthHandlerTests`),
        daos: {
          // Can we use mocks?
          user: {
            findUsers: jest.fn(),
            updateAccessToken: jest.fn(),
            createUserWithStrava: jest.fn(),
          },
        },
      },
    };
    res = {
      redirect: jest.fn(),
    };
    next = jest.fn();
  });

  describe(`logout`, () => {
    beforeEach(async () => {
      req.session.destroy = jest.fn();
      req.logout = jest.fn();

      await authHandler.logout(req, res, next);
    });

    it(`logs the user out`, () => {
      expect(req.logout).toBeCalled();
    });

    it(`destroys the session`, () => {
      expect(req.session.destroy).toBeCalled();
    });

    it(`redirects the user`, () => {
      expect(req.session.destroy).toBeCalled();
    });
  });

  describe(`callback`, () => {
    describe(`with a user in the session`, () => {
      let user: any;
      beforeEach(() => {
        _.set(req, 'session.passport.user', {
          displayName: 'Joe Shmoe',
          token: '123456',
          provider: 'strava',
          id: 'stravaid',
        });

        user = {
          displayName: 'Joe Shmoe',
          accessToken: '123456',
          provider: 'strava',
          providerId: 'stravaid',
          id: uuid.v4(),
        };
      });

      describe(`without an existing user`, () => {
        beforeEach(async () => {
          req.context.daos.user.findUsers.mockReturnValue([]);
          req.context.daos.user.createUserWithStrava.mockReturnValue(user);

          await authHandler.callback(req, res, next);
        });

        it(`creates the user`, async () => {
          expect(req.context.daos.user.createUserWithStrava).toBeCalledWith(
            _.omit(user, ['id']),
          );
        });

        it(`sets the user in the session`, () => {
          expect(req.session.user).toEqual(user);
        });

        it(`tries to find the user`, () => {
          expect(req.context.daos.user.findUsers).toBeCalledWith([
            {
              provider: 'strava',
              providerId: 'stravaid',
            },
          ]);
        });

        it(`redirects the user`, () => {
          expect(res.redirect).toBeCalledWith('/');
        });
      });

      describe(`with an existing user`, () => {
        beforeEach(async () => {
          req.context.daos.user.findUsers.mockReturnValue([user]);
          req.context.daos.user.updateAccessToken.mockReturnValue(user);

          await authHandler.callback(req, res, next);
        });

        it(`updates the accessToken`, () => {
          expect(req.context.daos.user.updateAccessToken).toBeCalledWith(
            user.id,
            'strava',
            '123456',
          );
        });

        it(`sets the user in the session`, () => {
          expect(req.session.user).toEqual(user);
        });

        it(`does not create the user`, () => {
          expect(req.context.daos.user.createUserWithStrava).not.toBeCalled();
        });

        it(`tries to find the user`, () => {
          expect(req.context.daos.user.findUsers).toBeCalledWith([
            {
              provider: 'strava',
              providerId: 'stravaid',
            },
          ]);
        });

        it(`redirects the user`, () => {
          expect(res.redirect).toBeCalledWith('/');
        });
      });
    });

    it(`throws an error`, async () => {
      try {
        await authHandler.callback(req, res, next);
      } catch (err) {
        expect(err.message).toEqual(`Did not get a user back.`);
        return;
      }
      fail(`Should have errored`);
    });
  });
});
