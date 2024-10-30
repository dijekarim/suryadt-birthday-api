import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';
import { EmailService } from 'src/email/email.service';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Types } from 'mongoose';
import { UserDto } from './dto/user.dto';
import * as moment from 'moment';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;
  const userPayload: UserDto = {
    email: 'tes1@tes.com',
    first_name: 'Test',
    last_name: '1',
    birth_date: moment('2024-10-31').toDate(),
    timezone: 'Asia/Jakarta',
  };
  let mongod: MongoMemoryServer = null;
  const mockUserService = {
    create: jest
      .fn()
      .mockReturnValue({ _id: new Types.ObjectId(), ...userPayload }),
    delete: jest
      .fn()
      .mockReturnValue({ _id: new Types.ObjectId(), ...userPayload }),
    update: jest
      .fn()
      .mockReturnValue({ _id: new Types.ObjectId(), ...userPayload }),
  };

  beforeAll(async () => {
    // This will create an new instance of "MongoMemoryServer" and automatically start it
    mongod = await MongoMemoryServer.create();

    const uri = mongod.getUri();
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        MongooseModule.forRootAsync({
          useFactory: () => ({
            uri,
          }),
        }),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        HttpModule,
      ],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
        EmailService,
      ],
      controllers: [UserController],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  afterEach(async () => {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany();
    }
  });

  afterAll(async () => {
    await mongod.stop();
  }, 10000);

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  it('should create user data', async () => {
    const result = await controller.register(userPayload);
    expect(service.create).toHaveBeenCalledTimes(1);
    expect(service.create).toHaveBeenCalledWith(userPayload);
    expect(result).toHaveProperty('_id');
    expect(result).toHaveProperty('email');
    expect(result.email).toEqual(userPayload.email);
  });

  it('should update user data', async () => {
    const result = await controller.update(userPayload);
    expect(service.update).toHaveBeenCalledTimes(1);
    expect(service.update).toHaveBeenCalledWith(userPayload);
    expect(result).toHaveProperty('_id');
    expect(result).toHaveProperty('email');
    expect(result.email).toEqual(userPayload.email);
  });

  it('should delete user data', async () => {
    const result = await controller.delete(userPayload.email);
    expect(service.delete).toHaveBeenCalledTimes(1);
    expect(service.delete).toHaveBeenCalledWith(userPayload.email);
    expect(result['email']).toEqual(userPayload.email);
  });
});
