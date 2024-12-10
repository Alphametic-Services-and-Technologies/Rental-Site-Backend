import { ArrayUnique, IsNumber, IsOptional, IsString } from 'class-validator';
import { SortDir } from '../utils/enums/SortDir';
import { Transform } from 'class-transformer';

export class GetUsersQueryParams {
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  page: number = 1;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  pageSize: number = 50;

  @IsString()
  @IsOptional()
  sortField: string = 'createdAt';

  @IsString()
  @IsOptional()
  sortDir: SortDir = SortDir.Descending;

  @IsString()
  @IsOptional()
  searchTerm: string = '';

  @IsOptional()
  @ArrayUnique()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map((v) => v.trim());
    }
    return value;
  })
  fields: string[] = [];
}
