import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

jest.setTimeout(500000);

declare global {
  var signin: (id?: string) => string[];
}

jest.mock('../nats-wrapper');
// jest.mock('../stripe.ts');

process.env.STRIPE_KEY =
  'sk_test_51L6ZwKHKad5DoENAs8KPQFhq37axeEDD17l36TyxMwvXPjBENPV3xT8oKiefIltQSqfCgacjxXGbniSG9YS4mf0g00ZXC5t7Sp';

let mongo: any;
beforeAll(async () => {
  process.env.JWT_KEY = 'keykey';
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterEach(() => {
  jest.clearAllMocks();
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.signin = (id?: string) => {
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: 'test@test.com',
  };

  const token = jwt.sign(payload, process.env.JWT_KEY!);

  const session = { jwt: token };

  const seessionJSON = JSON.stringify(session);

  const base64 = Buffer.from(seessionJSON).toString('base64');

  return [`session=${base64}`];
};
