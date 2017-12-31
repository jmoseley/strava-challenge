import * as winston from 'winston';

function createTransports(loggerName?: string): winston.TransportInstance[] {
  const transports = [
    new winston.transports.Console({
      label: loggerName,
     }),
  ];
  // TODO: Sentry
  return transports;
}

function createWinstonLogger(name: string): winston.LoggerInstance {
  if (winston.loggers.has(name)) {
    return winston.loggers.get(name);
  }
  return winston.loggers.add(name, {
    transports: createTransports(name),
  });
}

const BASE_WINSTON_LOGGER = createWinstonLogger('');

// Use the logger factory to build loggers attached to some context, such as a single request.
export class LoggerFactory {
  constructor(private readonly base: string) {}

  public getLogger(name: string) {
    return new LoggerInstance(name, this.base, BASE_WINSTON_LOGGER);
  }
}

export class LoggerInstance {
  constructor(private readonly name: string, private readonly base: string, private readonly winstonLogger: winston.LoggerInstance) {}
  
  public info(message: string, context?: object) {
    this.winstonLogger.info(message, this.buildContext(context));
  }
  public warn(message: string, context?: object) {
    this.winstonLogger.warn(message, this.buildContext(context));
  }
  public debug(message: string, context?: object) {
    this.winstonLogger.debug(message, this.buildContext(context));
  }
  public error(message: string, context?: object) {
    this.winstonLogger.error(message, this.buildContext(context))
  }

  private buildContext(context: object = {}): any {
    return { ...context, 'scope': this.base, 'target': this.name };
  }
}

const GLOBAL_LOGGER_FACTORY = new LoggerFactory('GLOBAL');

// Use this function to get a non-request level logger.
export function getLogger(name: string) {
  return GLOBAL_LOGGER_FACTORY.getLogger(name);
}
