import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../src/auth-service/auth.service';
import { IUserDto } from '../src/dto';
import { PrismaClient, User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { ErrorConverter } from '../src/utility/error-converter';

describe('User Service', () => {
  //Arrange
  let service: AuthService;
  const mockConfigService = {
    get: jest.fn().mockReturnValue('some-secret-key'),
  };

  const user: User = {
    id: 1,
    email: 'sample1@gmail.com',
    password: 'password',
    biometricKey: 'hello',
    createdAt: new Date('2020-03-03'),
    updatedAt: new Date('2020-03-03'),
  };
  const mockPrismaClient = {
    user: {
      create: jest.fn().mockReturnValue(user),
      delete: jest.fn(),
      findFirst: jest.fn().mockReturnValue(null),
    },
  };
  const mockErrorConcerter = {
    handle: jest.fn().mockReturnValue({
      message: 'Invalid Credentials',
      error: 'Bad Request',
      statusCode: 400,
    }),
  };
  const userDto: IUserDto = {
    email: 'sample@gmail.com',
    password: 'string',
    biometricKey: 'string',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: PrismaClient,
          useValue: mockPrismaClient,
        },
        {
          provide: ErrorConverter,
          useValue: mockErrorConcerter,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('Create  a new user', async () => {
    //Act
    jest.spyOn(service, 'get').mockReturnValue(null);
    const { email, biometricKey, id } = await service.create({ ...user });

    //Assert
    expect(email).toEqual('sample1@gmail.com');
    expect(biometricKey).toEqual('hello');
  });
  it('Login with username and password', async () => {
    //Act
    jest.spyOn(service, 'get').mockReturnValue(Promise.resolve({ ...user }));
    jest
      .spyOn(service, 'validatePassword')
      .mockReturnValue(Promise.resolve(true));
    const { accessToken } = await service.login(userDto);
    //Assert
    expect(accessToken).toBeDefined();
  });

  it('Login with biometric key', async () => {
    //Act
    jest.spyOn(service, 'get').mockReturnValue(Promise.resolve({ ...user }));
    jest
      .spyOn(service, 'validatePassword')
      .mockReturnValue(Promise.resolve(true));
    const { accessToken } = await service.biometricLogin(user.biometricKey);
    //Assert
    expect(accessToken).toBeDefined();
  });
});
