import * as _ from 'lodash';
import * as dapper from '@convoy/dapper';
import * as React from 'react';
import * as querystring from 'querystring';
import { Meteor } from 'meteor/meteor';
import { browserHistory, locationShape } from 'react-router';
import { connect } from 'react-redux';
// TODO: Meteor is badly typed :(
import { withTracker } from 'meteor/react-meteor-data';
import styled from 'styled-components';

import NavBar from '../components/nav_bar';
import {
  Activity,
  Collection as ActivitiesCollection,
} from '../../../imports/models/activities';
import {
  Challenge,
  Collection as ChallengesCollection,
} from '../../../imports/models/challenges';
import {
  ChallengeInvite,
  Collection as ChallengeInvitesCollection,
} from '../../../imports/models/challenge_invites';
import ActivityCard from '../components/activity_card';
import ChallengeCard from '../components/challenge_card';
import CreateChallenge from '../components/create_challenge';
import base64url from 'base64url';

const CoverWrapper = styled.div`
  margin: 0;
  padding: 0;
`;

const Cover = styled.img`
  width: 100%;
`;

const STYLES = dapper.compile({
  heading: {
    marginTop: '0.2em',
    fontWeight: 'lighter',
  },
  homepage: {
    padding: '0.5em',
    display: 'flex',
  },
  body: {
    height: '100%',
    fontFamily: `'Roboto', sans-serif`,
  },
});

export interface DataProps {
  currentUser: Meteor.User;
  challengeInvite?: ChallengeInvite;
  challenge?: Challenge;
}

export interface StateProps {
  foo: string;
}

export interface PropParams {
  location: typeof locationShape;
}

export interface Props extends DataProps, StateProps, PropParams {}

class AcceptChallengeInviteScene extends React.Component<Props> {
  styles: any = dapper.reactTo(this, STYLES);

  componentWillMount() {
    if (!this.props.currentUser) {
      // Redirect the user to the home page to get them to login/signup.
      browserHistory.push(
        `/?${querystring.stringify({
          afterLogin: `${this.props.location.pathname}${
            this.props.location.search
          }`,
        })}`,
      );
    }
  }

  render() {
    return (
      <div className={this.styles.body}>
        <NavBar currentUser={this.props.currentUser} />
        <div className={this.styles.homepage}>{this._renderChallenge()}</div>
      </div>
    );
  }

  _renderChallenge() {
    if (!this.props.challenge) {
      return <div>Unable to find challenge to join.</div>;
    }

    return <ChallengeCard challenge={this.props.challenge} />;
  }
}

// POC that the redux connection works.
const mapStateToProps = (state: any) => ({
  foo: 'bar',
});

function dataLoader(p: PropParams): DataProps {
  const queryParams = querystring.parse(p.location.search as any);
  const { challengeInviteId } = JSON.parse(base64url.decode(queryParams._p));

  const challengeInvite = ChallengeInvitesCollection.findOne({
    _id: challengeInviteId,
  });

  let challenge: Challenge | undefined = undefined;
  if (challengeInvite) {
    challenge = ChallengesCollection.findOne({
      _id: challengeInvite.challengeId,
    });
  }

  return {
    currentUser: Meteor.users.findOne({ _id: Meteor.userId() }),
    challenge,
    challengeInvite,
  };
}

export default withTracker(dataLoader)(
  connect<StateProps>(mapStateToProps)(AcceptChallengeInviteScene),
);
