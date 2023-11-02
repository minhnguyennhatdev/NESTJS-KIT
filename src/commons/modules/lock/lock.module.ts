import { Global, Module } from '@nestjs/common';
import { LockService } from '@commons/modules/lock/lock.service';

@Global()
@Module({
  providers: [LockService],
  exports: [LockService],
})
export class LockModule {}
