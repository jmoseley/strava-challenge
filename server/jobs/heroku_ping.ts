import * as _ from 'lodash';
import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import * as moment from 'moment';

import { runRepeatingJob, JobResult, RunArguments } from '../lib/jobs';
import StravaProviderDAO from '../providers/strava';
import { Collection as ActivitiesCollection } from '../../imports/models/activities';

export const SELF_PING_JOB_ID = 'selfPing';

async function selfPing(_args: RunArguments): Promise<JobResult> {
  const result = HTTP.call('GET', `${Meteor.settings.rootUrl}/status`);

  return JobResult.SUCCESS;
}

runRepeatingJob({
  name: SELF_PING_JOB_ID,
  job: selfPing,
  repeatMinutes: 5,
});
