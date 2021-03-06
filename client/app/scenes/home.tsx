import * as _ from 'lodash';
import * as dapper from '@convoy/dapper';
import * as React from 'react';
import * as querystring from 'querystring';
import { Meteor } from 'meteor/meteor';
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
  ChallengeInviteStatus,
} from '../../../imports/models/challenge_invites';
import ActivityCard from '../components/activity_card';
import ChallengeCard, {
  ChallengeWithUsersAndActivities,
} from '../components/challenge_card';
import CreateChallenge from '../components/create_challenge';
import AcceptChallengeCard from '../components/accept_challenge_card';
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
    display: 'flex',
    justifyContent: 'space-between',
  },
  body: {
    height: '100%',
    fontFamily: `'Roboto', sans-serif`,
  },
  recentRides: {
    flex: '1',
    borderLeft: '1px solid lightgrey',
    marginLeft: '1em',
    padding: '0.5em',
    background: '#ffffff',
  },
  challenges: {
    flex: '4',
    padding: '0.5em',
  },
  challengeWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
  },
});

export interface DataProps {
  currentUser: Meteor.User;
  loading?: boolean;
  recentRides: Activity[];
  challenges: ChallengeWithUsersAndActivities[];
  challengeInvites: ChallengeInvite[];
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
        <NavBar currentUser={this.props.currentUser} profileButton={true} />
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
        <div className={this.styles.challenges}>
          <div className={this.styles.challengeWrapper}>
            <div>{this._renderChallenges()}</div>
            <div>
              <CreateChallenge />
              {this._renderChallengeInvites()}
            </div>
          </div>
        </div>
        <div className={this.styles.recentRides}>
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
        {this.props.challenges.map(challenge => {
          if (!_.includes(challenge.members, Meteor.userId())) return;

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

  _renderChallengeInvites() {
    if (!this.props.challengeInvites.length) {
      return;
    }

    return (
      <div>
        <h3>Invites</h3>
        {_.map(this.props.challengeInvites, ci => {
          const challenge = _.find(
            this.props.challenges,
            c => c._id === ci.challengeId,
          );

          if (!challenge) {
            console.error(`Unable to find challenge for challengeInvite`);
            return;
          }

          return (
            <div key={ci._id}>
              <AcceptChallengeCard challenge={challenge} challengeInvite={ci} />
            </div>
          );
        })}
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

  const challengeInvites = ChallengeInvitesCollection.find(
    { status: ChallengeInviteStatus.PENDING },
    { sort: { startDate: 1 }, limit: 5 },
  ).fetch();
  const challenges = ChallengesCollection.find().fetch();
  const activities = ActivitiesCollection.find().fetch();
  const users = Meteor.users.find().fetch();
  const challengesWithActivities = _.map(challenges, c => {
    return {
      ...c,
      users: _(users)
        .filter(u => _.includes(c.members, u._id))
        .map(u => ({
          ...u,
          activities: _.filter(activities, a => a.userId === u._id),
        }))
        .value(),
    };
  });

  return {
    loading:
      !activitiesSub.ready() ||
      !challengesSub.ready() ||
      !challengeInvitesSub.ready(),
    currentUser: Meteor.users.findOne({ _id: Meteor.userId() }),
    recentRides: ActivitiesCollection.find(
      { userId: Meteor.userId() },
      { sort: { startDate: -1 }, limit: 10 },
    ).fetch(),
    challengeInvites,
    challenges: challengesWithActivities,
  };
}

export default withTracker(dataLoader)(
  connect<StateProps>(mapStateToProps)(HomeScene),
);
