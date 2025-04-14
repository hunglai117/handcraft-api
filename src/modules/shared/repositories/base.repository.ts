// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import {
  Document,
  FilterQuery,
  Model,
  PaginateModel,
  PipelineStage,
  QueryOptions,
  SaveOptions,
  UpdateQuery,
  UpdateWithAggregationPipeline,
} from 'mongoose';
import { DEFAULT_LIMIT, DEFAULT_PAGE } from '../constants';
import { IPagination } from '../shared.interface';

export abstract class BaseRepository<T> {
  public model: Model<T & Document>;
  public modelPagination: PaginateModel<T & Document>;
  public collectionName: string;

  constructor(model: Model<T & Document> | PaginateModel<T & Document>) {
    this.model = model;
    if (model.hasOwnProperty('paginate')) {
      this.modelPagination = model as PaginateModel<T & Document>;
    }
    this.collectionName = model.collection.name;
  }

  getPaginateRes(paginateOptions: IPagination, data: any) {
    if (!data) {
      data = [];
    }
    return {
      page: paginateOptions.page,
      limit: paginateOptions.limit,
      total_items: data.length,
      data: data as T[],
    };
  }

  async findOne(
    filter?: FilterQuery<T & Document>,
    projection?: Partial<Record<keyof T, 1 | 0>>,
    options?: QueryOptions,
  ): Promise<T & Document> {
    return this.model.findOne(filter, projection, options).lean();
  }

  async updateOne(
    filter?: FilterQuery<T & Document>,
    update?: UpdateQuery<T & Document> | UpdateWithAggregationPipeline,
    options?: QueryOptions,
  ): Promise<boolean> {
    const raw = await this.model.updateOne(filter, update, options);
    if (raw.modifiedCount)
      console.log(`update ${this.collectionName}`, {
        filter,
        update,
      });
    return !!raw.modifiedCount;
  }

  async create(doc: T, options?: SaveOptions) {
    return new this.model(doc).save(options);
  }

  async createMany(docs: T[]) {
    return await this.model.insertMany(docs);
  }

  async find(
    filter?: FilterQuery<T & Document>,
    projection?: Partial<Record<keyof T, 1 | 0>>,
    options?: QueryOptions | null,
  ) {
    return this.model.find(filter, projection, options);
  }

  async findOneAndDelete(
    filter?: FilterQuery<T & Document>,
    options?: QueryOptions | null,
  ): Promise<T & Document> {
    const entity = await this.model.findOneAndDelete(filter, options);
    if (entity)
      console.log(`Delete ${this.collectionName}`, {
        filter,
      });
    return entity;
  }

  async deleteOne(
    filter?: FilterQuery<T & Document>,
    options?: QueryOptions,
  ): Promise<boolean> {
    const raw = await this.model.deleteOne(filter, options);
    return !!raw.deletedCount;
  }

  async countDocuments(
    filter?: FilterQuery<T & Document>,
    options?: QueryOptions,
  ): Promise<number> {
    return this.model.countDocuments(filter, options);
  }

  async findOneAndUpdate(
    filter?: FilterQuery<T & Document>,
    update?: UpdateQuery<T & Document>,
    options?: QueryOptions | null,
  ): Promise<T & Document> {
    return await this.model.findOneAndUpdate(filter, update, options);
  }

  async paginate(
    filter?: FilterQuery<T & Document>,
    paginateOptions: {
      page: number;
      limit: number;
      sort?: Partial<Record<keyof T, 1 | -1>> & { createdAt?: number };
      lean?: boolean;
    } = { page: DEFAULT_PAGE, limit: DEFAULT_LIMIT },
  ) {
    return this.modelPagination.paginate(filter, paginateOptions);
  }

  async aggregate(pipeline: PipelineStage[]) {
    return this.model.aggregate(pipeline);
  }

  async updateMany(
    filter?: FilterQuery<T & Document>,
    update?: UpdateWithAggregationPipeline | UpdateQuery<T & Document>,
    options?: QueryOptions,
  ) {
    const raw = await this.model.updateMany(filter, update, options);
    return !!raw.modifiedCount;
  }

  async deleteMany(filter?: FilterQuery<T & Document>, options?: QueryOptions) {
    const raw = await this.model.deleteMany(filter, options);
    return !!raw.deletedCount;
  }
}
