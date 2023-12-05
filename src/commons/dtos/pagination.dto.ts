import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';
import { SortDTO } from '@commons/dtos/sort.dto';
import { MAXIMUM_LIMIT_SIZE } from '@commons/constants';

export class PaginationDTO extends SortDTO {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  skip?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(MAXIMUM_LIMIT_SIZE.FIVE_HUNDRED)
  @Type(() => Number)
  limit? = MAXIMUM_LIMIT_SIZE.ONE_HUNDRED;
}
