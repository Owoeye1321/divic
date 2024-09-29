import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../src/auth-controller/auth.controller';
import { AuthService } from '../src/auth-service/auth.service';
import { ILoginServiceResponse, IUserDto, IUserResolver } from '../src/dto';
import { ConfigService } from '@nestjs/config';
import { PrismaClient, User } from '@prisma/client';
import { ErrorConverter } from '../src/utility/error-converter';

describe('User Controller', () => {
  let controller: AuthController;
  let authService: AuthService;
  const mockConfigService = {
    get: jest.fn().mockReturnValue('some-secret-key'),
  };

  const mockErrorConcerter = {
    handle: jest.fn().mockReturnValue({
      message: 'Invalid Credentials',
      error: 'Bad Request',
      statusCode: 400,
    }),
  };

  const user: User = {
    id: 1,
    email: 'sample@gmail.com',
    password: 'password',
    biometricKey: 'hello',
    createdAt: new Date('2020-03-03'),
    updatedAt: new Date('2020-03-03'),
  };
  const mockPrismaClient = {
    user: {
      create: jest.fn().mockReturnValue(user),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
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

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('create a new user', async () => {
    //Arrange
    const userDto: IUserDto = {
      email: 'sample@gmail.com',
      password: 'string',
      biometricKey: 'string',
    };
    const result: IUserResolver = {
      id: 1,
      email: 'sample@gmail.com',
      biometricKey: 'hello',
      createdAt: '2020-03-03',
      updatedAt: '2020-03-03',
    };

    //Act
    jest.spyOn(authService, 'create').mockImplementation(async () => result);
    const { code, message, data } = await controller.create(userDto);

    //Assert
    expect(code).toEqual(200);
    expect(message).toEqual('success');
  });

  it('Login with username and password', async () => {
    //Arrange
    const userDto: IUserDto = {
      email: 'sample@gmail.com',
      password: 'string',
      biometricKey: 'string',
    };
    const response: ILoginServiceResponse = {
      accessToken: 'test token',
      user: user,
    };

    //Act
    jest.spyOn(authService, 'login').mockImplementation(async () => response);
    const { code, message, data } = await controller.login(userDto);
    //Assert
    expect(code).toEqual(200);
    expect(message).toEqual('success');
    expect(data.token.accessToken).toBeDefined();
  });
});
