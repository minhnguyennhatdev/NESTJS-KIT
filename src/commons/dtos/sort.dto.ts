import { IsSortObject } from '@commons/validators/IsSortObject';
import { IsOptional } from 'class-validator';
import { SortOrder } from 'mongoose';

export class SortDTO {
  @IsOptional()
  @IsSortObject()
  sort?: Record<string, SortOrder>;
}
