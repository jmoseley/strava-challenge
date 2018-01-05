import * as uuid from 'uuid';
import * as MongoDB from 'mongodb';

import { LoggerFactory, WithLog } from '../../logger';

export interface BaseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export default class BaseMongoDAO<
  Model extends BaseModel,
  CreateOptions extends Partial<Model>
> extends WithLog {
  protected readonly collectionName: string;

  // DAOs should be bound to a request, this logger factory should come from the request.
  constructor(loggerFactory: LoggerFactory, private readonly db: MongoDB.Db) {
    super(loggerFactory);
  }

  public async findById(id: string): Promise<Model> {
    return await this.collection().findOne({ id });
  }

  public async create(createOptions: CreateOptions): Promise<Model> {
    const model: Model = {
      // TODO: mongo automatically generates an id that is indexed. Maybe we should use that instead?
      id: uuid.v4(),
      createAt: new Date(),
      updatedAt: new Date(),
      ...(createOptions as any), // Pending https://github.com/Microsoft/TypeScript/pull/13288
    };
    this.log.info(`Creating model`, { model });

    await this.collection().insertOne(model);
    return model;
  }

  protected collection() {
    return this.db.collection(this.collectionName);
  }
}
