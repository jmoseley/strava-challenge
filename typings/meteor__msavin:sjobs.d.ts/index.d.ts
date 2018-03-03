import { Mongo } from 'meteor/mongo';

declare module 'meteor/msavin:sjobs' {
  interface JobsInternalSingleton {
    Utilities: {
      collection: Mongo.Collection<JobModel>;
    };
  }

  interface JobModel {
    _id: string;
    name: string;
    state: JobModel.State;
  }

  namespace JobModel {
    export enum State {
      SUCCESS = 'success',
      PENDING = 'pending',
    }
  }

  interface JobInstance {
    success: (result?: any) => void;
    failure: (result?: any) => void;
    reschedule: (config: RunConfig) => void;
    replicate: (config: RunConfig) => void;
  }

  interface Config {
    autostart: boolean;
    interval: number;
    startupDelay: number;
    maxWait: number;
  }

  type RunArguments = {
    [key: string]: any;
  } | null;

  interface JobsList {
    [jobId: string]: (args: RunArguments) => void;
  }

  interface RunConfig {
    in?: {
      millisecond?: number;
      milliseconds?: number;
      second?: number;
      seconds?: number;
      minute?: number;
      minutes?: number;
      hour?: number;
      hours?: number;
      day?: number;
      days?: number;
      month?: number;
      months?: number;
      year?: number;
      years?: number;
    };
    on?: {
      millisecond?: number;
      milliseconds?: number;
      second?: number;
      seconds?: number;
      minute?: number;
      minutes?: number;
      hour?: number;
      hours?: number;
      day?: number;
      days?: number;
      month?: number;
      months?: number;
      year?: number;
      years?: number;
    };
    priority?: number;
  }

  interface JobsSingleton {
    configure: (config: Config) => void;
    register: (jobs: JobsList) => void;
    // This is not a perfect reflection of the allowed arguments, but it simplifies the interface an allows
    // the config to be well typed.
    run: (jobId: string, args: RunArguments, config: RunConfig) => void;
  }

  const Jobs: JobsSingleton;

  const JobsInternal: JobsInternalSingleton;
}
