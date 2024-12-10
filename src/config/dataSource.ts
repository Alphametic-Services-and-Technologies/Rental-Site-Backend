import { DataSource } from 'typeorm';

import { User } from '../entities/User';

const appDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: 'POC',
  synchronize: false,
  entities: [User],
});

export default appDataSource;
