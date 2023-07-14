import { BaseRepository } from '@commons/bases/repository.base';
import { CacheService } from '@databases/cache/cache.service';
import { UserEntity } from '@modules/users/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

Injectable();
export class UserRepository extends BaseRepository<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    protected readonly user: Repository<UserEntity>,
    protected readonly cacheService: CacheService,
  ) {
    super(user, cacheService);
  }
}
