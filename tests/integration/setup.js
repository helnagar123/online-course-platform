process.env.NODE_ENV = 'test';
process.env.AUTH_RATE_LIMIT_MAX = '1000';
process.env.RATE_LIMIT_MAX = '1000';

import 'dotenv/config';
import mongoose from 'mongoose';

const baseTestUri =
  process.env.MONGODB_TEST_URI;

if (!baseTestUri) {
  throw new Error(
    'MONGODB_TEST_URI is required for integration tests'
  );
}

const workerId =
  process.env.JEST_WORKER_ID || '1';

const testUri = new URL(baseTestUri);

const baseDbName =
  testUri.pathname.replace(/^\/+/, '') ||
  'online_course_platform_test';

testUri.pathname = `/${baseDbName}_worker_${workerId}`;

process.env.MONGODB_URI =
  testUri.toString();

await mongoose.connect(
  process.env.MONGODB_URI
);

beforeEach(async () => {
  const collections =
    mongoose.connection.collections;

  for (const collection of Object.values(
    collections
  )) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();

  await mongoose.disconnect();
});