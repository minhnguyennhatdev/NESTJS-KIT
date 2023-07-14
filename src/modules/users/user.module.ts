import { UserController } from '@modules/users/user.controller';
import { UserRepository } from '@modules/users/user.repository';
import { UserService } from '@modules/users/user.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@databases/cache/cache.module';
import { UserEntity } from '@modules/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), CacheModule],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}
