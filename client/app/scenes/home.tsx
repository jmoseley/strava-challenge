import * as dapper from '@convoy/dapper';
import * as React from 'react';
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
import ActivityCard from '../components/activity_card';
import ChallengeCard from '../components/challenge_card';

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
}

export interface StateProps {
  foo: string;
}

export interface Props extends DataProps, StateProps {}

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
    return this.props.challenges.map(challenge => {
      return <ChallengeCard challenge={challenge} key={challenge._id} />;
    });
  }

  _renderRecentRides() {
    return this.props.recentRides.map(activity => {
      return <ActivityCard activity={activity} key={activity._id} />;
    });
  }
}

// POC that the redux connection works.
const mapStateToProps = (state: any) => ({
  foo: 'bar',
});

function dataLoader(): DataProps {
  const activitiesSub = Meteor.subscribe('activities');
  const challengesSub = Meteor.subscribe('challenges');

  return {
    loading: !activitiesSub.ready() || !challengesSub.ready(),
    currentUser: Meteor.users.findOne({ _id: Meteor.userId() }),
    recentRides: ActivitiesCollection.find(
      {},
      { sort: { startDate: -1 }, limit: 10 },
    ).fetch(),
    challenges: ChallengesCollection.find({
      $or: [{ creatorId: Meteor.userId() }, { members: Meteor.userId() }],
    }).fetch(),
  };
}

export default withTracker(dataLoader)(
  connect<StateProps>(mapStateToProps)(HomeScene),
);
