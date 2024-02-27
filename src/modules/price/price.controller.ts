import { Controller, Get, Param, Query } from '@nestjs/common';
import { PriceService } from '@modules/price/price.service';
import { ROUTER } from '@configs/route.config';

@Controller(ROUTER.PRICE.default)
export class PriceController {
  constructor(private readonly priceService: PriceService) {}

  @Get(':pair')
  async price(
    @Param('pair') pair: string,
    @Query() query: { base: string; quote: string },
  ) {
    if (pair.toUpperCase() === 'ALL') return this.priceService.bookTickers;
    return this.priceService.price(pair, query);
  }
}
