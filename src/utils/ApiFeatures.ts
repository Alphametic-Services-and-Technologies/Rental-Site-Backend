import {
  Brackets,
  ObjectLiteral,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { SortDir } from './enums/SortDir';
import { plainToInstance } from 'class-transformer';

export class APIFeatures<T extends ObjectLiteral> {
  public queryBuilder: SelectQueryBuilder<T>;
  private currentPage: number = 0;
  private pageSize: number = 0;

  constructor(private alias: string, private repo: Repository<T>) {
    this.queryBuilder = this.repo.createQueryBuilder(alias).select();
  }

  public paginate(page: number, pageSize: number) {
    this.currentPage = page;
    this.pageSize = pageSize;

    const skip = (page - 1) * pageSize;

    this.queryBuilder.skip(skip).take(pageSize);

    return this;
  }

  public search(searchTerm: string, ...fields: string[]) {
    const params = { searchTerm: `%${searchTerm}%` };

    this.queryBuilder.where(
      new Brackets((qb) => {
        fields.forEach((field: string, index: number) => {
          const whereStatement = `${field} ILIKE :searchTerm`;

          if (index === 0) qb.where(whereStatement, params);
          else qb.orWhere(whereStatement, params);
        });
      })
    );

    return this;
  }

  public sort(sortField: string, sortDir: SortDir) {
    this.queryBuilder.orderBy(`${this.alias}.${sortField}`, sortDir);

    return this;
  }

  public limitFields(fields: string[]) {
    if (fields.length)
      this.queryBuilder.select(fields.map((field) => `${this.alias}.${field}`));

    return this;
  }

  public getResults() {
    return this.queryBuilder.getMany();
  }

  public getCount() {
    return this.queryBuilder.getCount();
  }

  public async getResponse(dtoClass?: any) {
    let results = await this.getResults();

    if (dtoClass) {
      results = plainToInstance(dtoClass, results, {
        excludeExtraneousValues: true,
      });
    }

    const rowCount = await this.getCount();
    const pageCount = results.length;
    const firstRowOnPage = (this.currentPage - 1) * this.pageSize + 1;
    const lastRowOnPage = Math.min(this.currentPage * this.pageSize, rowCount);

    return {
      rowCount,
      pageCount,
      currentPage: this.currentPage,
      pageSize: this.pageSize,
      firstRowOnPage,
      lastRowOnPage,
      results,
    };
  }
}
