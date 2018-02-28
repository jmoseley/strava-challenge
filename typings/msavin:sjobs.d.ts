declare module 'meteor/msavin:sjobs' {
  export interface Config {
    autostart: boolean;
    interval: number;
    startupDelay: number;
    maxWait: number;
  }

  export interface RunArguments {
    [key: string]: any;
  }

  export interface JobsList {
    [jobId: string]: (args: RunArguments) => void;
  }

  export interface RunConfig {
    in: {
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
    on: {
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
    priority: number;
  }

  export interface JobsSingleton {
    configure: (config: Config) => void;
    register: (jobs: JobsList) => void;
    // This is not a perfect reflection of the allowed arguments, but it simplifies the interface an allows
    // the config to be well typed.
    run: (jobId: string, args: RunArguments, config: RunConfig) => void;
  }

  export const Jobs: JobsSingleton;
}
