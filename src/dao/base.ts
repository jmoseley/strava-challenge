import * as uuid from 'uuid';
import * as MongoDB from 'mongodb';

import { LoggerFactory, WithLog } from '../logger';

export interface BaseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export default class BaseDAO<
  Model extends BaseModel,
  CreateOptions extends Partial<Model>
> extends WithLog {
  protected readonly collectionName: string;

  // DAOs should be bound to a request, this logger factory should come from the request.
  constructor(loggerFactory: LoggerFactory, private readonly db: MongoDB.Db) {
    super(loggerFactory);
  }

  public async create(createOptions: CreateOptions): Promise<Model> {
    const model: Model = {
      id: uuid.v4(),
      ...(createOptions as any), // Pending https://github.com/Microsoft/TypeScript/pull/13288
    };
    this.log.info(`Creating model`, { model });

    const result = await this.collection().insertOne(model);
    this.log.debug(`Got result from create`, { result });

    return model;
  }

  protected collection() {
    return this.db.collection(this.collectionName);
  }
}
