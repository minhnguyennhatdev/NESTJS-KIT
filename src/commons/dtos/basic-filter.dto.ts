import { IsNumber, IsOptional, IsString } from 'class-validator';
import { PaginationDTO } from '@commons/dtos/pagination.dto';
import { Type } from 'class-transformer';

export class BasicFilterDTO extends PaginationDTO {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  from?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  to?: number;

  @IsOptional()
  @IsString()
  @Type(() => String)
  search?: string;
}
