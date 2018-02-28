import { Promise as MeteorPromise } from 'meteor/promise';
import {
  Jobs,
  RunConfig,
  RunArguments,
  JobInstance,
} from 'meteor/msavin:sjobs';

import './activity_sync';

export function registerJob({
  name,
  run,
}: {
  name: string;
  run: (args: RunArguments) => Promise<void>;
}) {
  console.info(`Registering ${name} job.`);
  Jobs.register({
    [name](args: RunArguments) {
      /* Forward context/params to 'run' method - execute in a fiber-aware await to
       allow regular async syntax in provided function */
      MeteorPromise.await(run.apply(this, args));
    },
  });
}
