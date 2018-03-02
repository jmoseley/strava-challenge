import { Mongo } from 'meteor/mongo';

export interface JobsInternalSingleton {
  Utilities: {
    collection: Mongo.Collection<JobModel>;
  };
}

export interface JobModel {
  _id: string;
  name: string;
  state: JobModel.State;
}

export namespace JobModel {
  export enum State {
    SUCCESS = 'success',
    PENDING = 'pending',
  }
}

export interface JobInstance {
  success: (result?: any) => void;
  failure: (result?: any) => void;
  reschedule: (config: RunConfig) => void;
  replicate: (config: RunConfig) => void;
}
export interface Config {
  autostart: boolean;
  interval: number;
  startupDelay: number;
  maxWait: number;
}

export type RunArguments = {
  [key: string]: any;
} | null;

export interface JobsList {
  [jobId: string]: (args: RunArguments) => void;
}

export interface RunConfig {
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

export interface JobsSingleton {
  configure: (config: Config) => void;
  register: (jobs: JobsList) => void;
  // This is not a perfect reflection of the allowed arguments, but it simplifies the interface an allows
  // the config to be well typed.
  run: (jobId: string, args: RunArguments, config: RunConfig) => void;
}

export const Jobs: JobsSingleton;

export const JobsInternal: JobsInternalSingleton;
