import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { defaults } from 'lodash';

/**
 * HOW TO USE
 * class UserRepository extends BaseRepository<UserEntity> {
 *   constructor(
 *     @InjectRepository(UserEntity)
 *     private readonly user: Repository<UserEntity>,
 *   ) {
 *     super(user);
 *   }
 * }
 */
export class BaseRepository<T> {
  private readonly repository: Repository<T>;
  constructor(repository: Repository<T>) {
    this.repository = repository;
  }

  async insertOne(data: DeepPartial<T>): Promise<T> {
    const newData = await this.repository.create(data);
    return this.repository.save(newData);
  }

  async findOne(options: FindOneOptions<T>): Promise<T> {
    return this.repository.findOne(options);
  }

  async findMany(options: FindManyOptions<T>): Promise<T[]> {
    return this.repository.find(options);
  }

  async paginatedFindMany(options: FindManyOptions<T>): Promise<[T[], number]> {
    const _options: FindManyOptions<T> = defaults(options, {
      where: null,
      skip: 0,
      take: 0,
    });
    return this.repository.findAndCount(_options);
  }

  async updateOne(data: DeepPartial<T>): Promise<T> {
    return this.repository.save(data);
  }

  async existed(filter: FindOptionsWhere<T>) {
    return this.repository.exist(filter);
  }
}
