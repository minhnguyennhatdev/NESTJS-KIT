import { CacheService } from '@commons/modules/cache/cache.service';
import DataLoader from 'dataloader';
import { FindOptionsWhere, Repository } from 'typeorm';
import sift from 'sift';
import { SECONDS_TO_MILLISECONDS } from '@commons/constants';
import * as crypto from 'crypto';

type Input<T> = FindOptionsWhere<T>;

export class TypeORMDataLoader<T> {
  private readonly loader: DataLoader<Input<T>, T>;
  private readonly cachePrefix: string;

  constructor(
    private readonly repository: Repository<T>,
    private readonly cacheService?: CacheService,
  ) {
    this.cachePrefix = `${this.repository.metadata.tableName}:`;
    this.loader = new DataLoader<Input<T>, T>(this.batchLoad.bind(this));
  }

  private async batchLoad(queries: FindOptionsWhere<T>[]): Promise<T[]> {
    const entities = await this.repository.find({
      where: queries,
    });
    const filteredEntities = queries.map((q) =>
      entities.filter((entity) => sift<any, any>(q)(entity)),
    );
    return filteredEntities.flat();
  }

  async load(query: FindOptionsWhere<T>): Promise<T> {
    const entity = await this.repository.findOne({
      where: query,
    });
    return entity;
  }

  private buildQueryKey = (query: Input<T>) => {
    const signature = crypto
      .createHash('sha1')
      .update(JSON.stringify(query))
      .digest('hex');
    return this.cachePrefix + signature;
  };

  async loadWithCache(
    query: Input<T>,
    ttl: number = SECONDS_TO_MILLISECONDS.THIRTY,
  ) {
    if (!query) return null;
    const key = this.buildQueryKey(query);
    if (this.cacheService)
      return this.cacheService?.getOneCached(
        key,
        async () => this.loader.load(query),
        ttl,
      );
    return this.loader.load(query);
  }

  async loadAll(): Promise<T[]> {
    return this.repository.find();
  }
}
