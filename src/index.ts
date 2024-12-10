import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();
import appDataSource from './config/dataSource';
import app from './app';
import { Server } from 'http';
import seedDefaultAdmin from './utils/seedDefaultAdmin';

process.on('uncaughtException', (err: Error) => {
  console.log('UNHANDLED EXCEPTION: shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

let server: Server;

const main = async () => {
  try {
    await appDataSource.initialize();

    console.log('connected to db');

    await seedDefaultAdmin();

    const port = process.env.PORT || 3000;

    server = app.listen(port, () => {
      console.log(`App running on port ${port}`);
    });
  } catch (e) {
    console.log(e);
    throw new Error('Something went wrong');
  }
};

main();

process.on('unhandledRejection', (err: Error) => {
  console.log('UNHANDLED REJECTION: shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
