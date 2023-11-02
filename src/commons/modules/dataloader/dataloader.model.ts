import { CacheService } from '@commons/modules/cache/cache.service';
import { Model } from 'mongoose';
import DataLoader from 'dataloader';
import sift from 'sift';
import { Injectable } from '@nestjs/common';
import { LeanMongoModel } from '@commons/types/MongoModel';
import { SECONDS_TO_MILLISECONDS } from '@commons/constants';
import { MilliSeconds } from '@commons/types/Time';
import * as crypto from 'crypto';

type Input<T> = Array<Input<T>>;
type Output<T> = LeanMongoModel<T>[];

/**
 * HOW TO USE
 * class UserRepository extends DataLoaderModel<this.userModel> {
 *   constructor(
 *     @InjectModel() private readonly userModel: Model<UserDocument>,
 *     protected readonly cacheService: CacheService,
 *   ) {
 *     super(user, cacheService);
 *   }
 * }
 */
@Injectable()
export abstract class DataLoaderModel<T> {
  private readonly dataloader: DataLoader<Input<T>, Output<T>>;
  private readonly BATCH_DELAY = 100; // ms
  private readonly cachePrefix: string;

  constructor(
    private readonly model: Model<T>,
    private readonly cacheService?: CacheService,
  ) {
    this.cachePrefix = `mongo:${this.model?.name}:`;

    this.dataloader = new DataLoader(
      (queries: Input<T>): Promise<Output<T>[]> => {
        const query = {
          $or: queries,
        };
        const data = this.model
          .find(query)
          .read('s')
          .lean<LeanMongoModel<T>[]>();
        return data.then((result) => {
          return queries.map((q) => result.filter(sift(q)));
        });
      },
      {
        cache: false,
        batchScheduleFn: (cb) => setTimeout(cb, this.BATCH_DELAY),
      },
    );
  }

  private buildQueryKey = (query: Input<T>) => {
    const signature = crypto
      .createHash('sha1')
      .update(JSON.stringify(query))
      .digest('hex');
    return this.cachePrefix + signature;
  };

  async findBatched(query: Input<T>) {
    return this.dataloader.load(query);
  }

  async findBatchedWithCache(
    query: Input<T>,
    ttl: MilliSeconds = SECONDS_TO_MILLISECONDS.THIRTY,
  ) {
    if (!query) return null;
    const key = this.buildQueryKey(query);
    if (this.cacheService)
      return this.cacheService?.getOneCached(
        key,
        async () => this.dataloader.load(query),
        ttl,
      );
    return this.dataloader.load(query);
  }
}
