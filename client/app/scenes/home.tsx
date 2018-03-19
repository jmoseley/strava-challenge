import * as _ from 'lodash';
import * as dapper from '@convoy/dapper';
import * as React from 'react';
import * as querystring from 'querystring';
import { Meteor } from 'meteor/meteor';
import { connect } from 'react-redux';
// TODO: Meteor is badly typed :(
import { withTracker } from 'meteor/react-meteor-data';
import styled from 'styled-components';
import { fromBase64Url } from 'b64u-lite';

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
import { locationShape } from 'react-router';

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
  loading?: boolean;
  recentRides: Activity[];
  challenges: Challenge[];
  challengeInvite?: ChallengeInvite;
}

export interface StateProps {
  foo: string;
}

export interface PropParams {
  location: typeof locationShape;
}

export interface Props extends DataProps, StateProps, PropParams {}

class HomeScene extends React.Component<Props> {
  styles: any = dapper.reactTo(this, STYLES);

  render() {
    return (
      <div className={this.styles.body}>
        <NavBar currentUser={this.props.currentUser} />
        {this._renderCover()}
        {this._renderUserData()}
      </div>
    );
  }

  _renderUserData() {
    if (!this.props.currentUser) {
      return null;
    }

    if (this.props.loading) {
      return <div>Loading...</div>;
    }

    return (
      <div className={this.styles.homepage}>
        {this._renderChallengeInvite()}
        <div>
          <h2 className={this.styles.heading}>Challenges</h2>
          <div>{this._renderChallenges()}</div>
        </div>
        <div>
          <h2 className={this.styles.heading}>Recent Rides</h2>
          <div>{this._renderRecentRides()}</div>
        </div>
      </div>
    );
  }

  _renderCover() {
    if (this.props.currentUser) {
      return null;
    }

    return (
      <CoverWrapper>
        <Cover src="/imgs/cover.jpeg" />
      </CoverWrapper>
    );
  }

  _renderChallenges() {
    return (
      <div>
        <CreateChallenge />
        {this.props.challenges.map(challenge => {
          return <ChallengeCard challenge={challenge} key={challenge._id} />;
        })}
      </div>
    );
  }

  _renderRecentRides() {
    return this.props.recentRides.map(activity => {
      return <ActivityCard activity={activity} key={activity._id} />;
    });
  }

  _renderChallengeInvite() {
    if (!this.props.challengeInvite) {
      return;
    }

    const challenge = _.find(
      this.props.challenges,
      c => c._id === _.get(this, 'props.challengeInvite.challengeId'),
    );

    if (!challenge) {
      console.error(`Unable to find challenge for challengeInvite`);
      return;
    }

    return (
      <div>
        <h3>Accept Challenge</h3>
        <AcceptChallengeForm challenge={challenge} />
      </div>
    );
  }
}

// POC that the redux connection works.
const mapStateToProps = (state: any) => ({
  foo: 'bar',
});

function dataLoader(p: PropParams): DataProps {
  const activitiesSub = Meteor.subscribe('activities');
  const challengesSub = Meteor.subscribe('challenges');
  const challengeInvitesSub = Meteor.subscribe('challengeInvites');

  const queryParamsString: string = p.location.search as any;

  const queryParams = querystring.parse(queryParamsString.replace('?', ''));

  let challengeInvite: ChallengeInvite | undefined;

  if (Meteor.userId() && queryParams._p) {
    try {
      const decodedObject = fromBase64Url(queryParams._p as string);
      const parsedObject = JSON.parse(decodedObject);

      challengeInvite = ChallengeInvitesCollection.findOne({
        _id: parsedObject.challengeInviteId,
      });
    } catch (error) {
      console.error(error);
    }
  }

  return {
    loading: !activitiesSub.ready() || !challengesSub.ready(),
    currentUser: Meteor.users.findOne({ _id: Meteor.userId() }),
    recentRides: ActivitiesCollection.find(
      {},
      { sort: { startDate: -1 }, limit: 10 },
    ).fetch(),
    challenges: ChallengesCollection.find({
      $or: [
        { creatorId: Meteor.userId() },
        { members: Meteor.userId() },
        { _id: _.get(challengeInvite, 'challengeId') },
      ],
    }).fetch(),
    challengeInvite,
  };
}

export default withTracker(dataLoader)(
  connect<StateProps>(mapStateToProps)(HomeScene),
);
