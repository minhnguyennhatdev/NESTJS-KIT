import { PriceController } from '@modules/price/price.controller';
import { Module } from '@nestjs/common';
import { PriceService } from '@modules/price/price.service';

@Module({
  controllers: [PriceController],
  providers: [PriceService],
  exports: [PriceService],
})
export class PriceModule {}
