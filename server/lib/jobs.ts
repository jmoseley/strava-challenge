import * as _ from 'lodash';
import { Promise as MeteorPromise } from 'meteor/promise';
import {
  Jobs,
  JobsInternal,
  JobModel,
  RunConfig,
  RunArguments as SJobsRunArguments,
  JobInstance,
} from 'meteor/msavin:sjobs';

export enum JobResult {
  SUCCESS = 'SUCCESS',
  FAILURE_WITHOUT_RETRY = 'FAILURE_WITHOUT_RETRY',
  RETRY_WITH_DELAY = 'RETRY_WITH_DELAY',
}

export type RunArguments = SJobsRunArguments;

export function registerJob({
  name,
  job,
}: {
  name: string;
  job: (instance: JobInstance, args: RunArguments) => Promise<void>;
}) {
  console.info(`Registering ${name} job.`);
  Jobs.register({
    [name](args: RunArguments) {
      /* Forward context/params to 'run' method - execute in a fiber-aware await to
       allow regular async syntax in provided function */
      MeteorPromise.await(job.apply(this, [this, args]));
    },
  });
}

/**
 * name - Name of the job to run
 * job - The function to run for this job
 * args - The arguments for the job
 * repeatSeconds - How long to delay between repeat runs of the job. If this is not provided, the job will not
 *                 repeat, and it will be run immediately.
 */
export function runJob({
  name,
  job,
  args,
  repeatSeconds,
}: {
  name: string;
  job: (args: RunArguments) => Promise<JobResult>;
  args?: RunArguments;
  repeatSeconds?: number;
}) {
  let runConfig: RunConfig;
  if (_.isNumber(repeatSeconds)) {
    runConfig = {
      in: {
        seconds: repeatSeconds,
      },
    };
  }

  const wrappedJob = jobWrapper(name, job, runConfig);

  registerJob({ name, job: wrappedJob });

  // Cancel a pending version of the job so we can rerun it with new args and/or new run config.
  const pendingJob = JobsInternal.Utilities.collection.findOne({
    name: name,
    state: 'pending',
  });
  if (pendingJob) {
    console.info(
      `Canceling pending ${name} job so new version can be started.`,
    );
    Jobs.cancel(pendingJob._id);
  }
  console.info(`Running ${name} job.`);
  // Run the job immediately.
  Jobs.run(name, args || null, {});
}

function jobWrapper(
  name: string,
  job: (args: RunArguments) => Promise<JobResult>,
  repeatRunConfig?: RunConfig,
): (instance: JobInstance, args: RunArguments) => Promise<void> {
  return async (instance: JobInstance, args: RunArguments) => {
    console.info(`Running job: ${name}`);

    try {
      const result = await job(args);
      console.debug(`Result (${name}): ${result}`);
      switch (result) {
        case JobResult.SUCCESS:
          if (repeatRunConfig) {
            instance.replicate(repeatRunConfig);
          }
          instance.success();
          break;
        case JobResult.RETRY_WITH_DELAY:
          console.info(`Retrying (${name}) due to result.`);
          instance.reschedule(repeatRunConfig || {});
          break;
        case JobResult.FAILURE_WITHOUT_RETRY:
          console.info(`Job failed (${name}).`);
          instance.failed();
          break;
        default:
          console.error(`Unknown job result.`);
          instance.reschedule(repeatRunConfig || {});
      }
      return;
    } catch (error) {
      console.error(`Error executing job ${name}: ${error.message}. Retrying.`);
      instance.reschedule(repeatRunConfig || {});
      return;
    }
  };
}
