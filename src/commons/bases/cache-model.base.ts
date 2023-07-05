import { Document, FilterQuery, Model, Types } from 'mongoose';
import { FindManyOptions, Repository, In } from 'typeorm';
import DataLoader from 'dataloader';
import { CacheService } from '@commons/cache/cache.service';
import sift from 'sift';

type DataSource<T> = Model<T> | Repository<T>;
type Input<T> = FindManyOptions<T> | FilterQuery<T>;
type Output<T> =
  | (T &
      Document<any, any, any> & {
        _id: Types.ObjectId;
      })
  | T;

/**
 * HOW TO USE
 * class UserRepository extends BaseCacheModel<UserEntity> {
 *   constructor(
 *     @InjectRepository(UserEntity)
 *     private readonly user: Repository<UserEntity>,
 *     protected readonly cacheService: CacheService,
 *   ) {
 *     super(user, cacheService);
 *   }
 * }
 */
export class BaseCacheModel<T> {
  private readonly dataloader: DataLoader<
    Input<T>,
    any,
    Promise<Output<T>[] | Output<T>>
  >;
  protected readonly cacheService: CacheService;
  private readonly cachePrefix: string;
  private readonly cachePrefixQueryOption: string;
  private readonly dataSource: DataSource<T>;
  constructor(dataSource: DataSource<T>, cacheService: CacheService) {
    this.dataSource = dataSource;
    this.cacheService = cacheService;
    const isMongooseCollection = this.isMongooseCollection(dataSource);

    if (isMongooseCollection) {
      this.cachePrefix = `mongo:${(this.dataSource as Model<T>)?.name}:`;
    } else {
      this.cachePrefix = `mysql:${(
        this.dataSource as Repository<T>
      )?.target?.toString()}:`;
    }
    this.cachePrefixQueryOption = `${this.cachePrefix}query:`;

    this.dataloader = new DataLoader((queries: Input<T>[]) => {
      const query: Input<T> = isMongooseCollection
        ? {
            $or: queries,
          }
        : {
            where: queries,
          };

      const data = this.dataSource.find(query);
      if (isMongooseCollection) {
        (query as any).lean();
      }

      return data.then((result) => {
        return queries.map((q) => result.filter(sift(q)));
      });
    });
  }

  private isMongooseCollection(
    dataSource: DataSource<T>,
  ): dataSource is Model<T> {
    return (<Model<T>>dataSource).baseModelName !== undefined;
  }

  async findBatchedAndCached(query: Input<T>) {
    if (!query) return null;
    const key = this.cachePrefix + JSON.stringify(query);
    const data = this.dataloader.load(query);
    return this.cacheService.getOneCached(key, () => data);
  }
}
