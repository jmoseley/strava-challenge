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

export function runRepeatingJob({
  name,
  job,
  args,
  repeatMinutes,
}: {
  name: string;
  job: (args: RunArguments) => Promise<JobResult>;
  args?: RunArguments;
  repeatMinutes: number;
}) {
  const runConfig: RunConfig = {
    in: {
      minutes: repeatMinutes,
    },
  };

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
  Jobs.run(name, args || null, runConfig);
}

function jobWrapper(
  name: string,
  job: (args: RunArguments) => Promise<JobResult>,
  runConfig: RunConfig,
): (instance: JobInstance, args: RunArguments) => Promise<void> {
  return async (instance: JobInstance, args: RunArguments) => {
    try {
      const result = await job(args);
      console.debug(`Result (${name}): ${result}`);
      switch (result) {
        case JobResult.SUCCESS:
          instance.replicate(runConfig);
          instance.success();
          break;
        case JobResult.RETRY_WITH_DELAY:
          console.info(`Retrying (${name}) due to result.`);
          instance.reschedule(runConfig);
          break;
        default:
          console.error(`Unknown job result.`);
          instance.reschedule(runConfig);
      }
      return;
    } catch (error) {
      console.error(`Error executing job ${name}: ${error.message}. Retrying.`);
      instance.reschedule(runConfig);
      return;
    }
  };
}
