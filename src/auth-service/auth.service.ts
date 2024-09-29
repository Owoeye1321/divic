import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient, User } from '@prisma/client';
import { pbkdf2Sync } from 'crypto';
import * as jwt from 'jsonwebtoken';
import {
  ILoginServiceResponse,
  IResponseDto,
  IUserDto,
  IUserResolver,
} from 'src/dto';
import { ErrorConverter } from '../utility/error-converter';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private prismaClient: PrismaClient,
    private errorConverter:ErrorConverter
  ) {}

  /**
   *
   * @param data This is the registration object
   * check if the user already exist
   * check if the biometric is provided, if true, check the uniqueness
   * encrypt the the user password
   * create the new user
   * @returns  this abstraction returns the new user profile
   */
  async create(data: IUserDto): Promise<IUserResolver> {
    try {
      const userExist = await this.get('email', data.email);
      if (userExist) throw new BadRequestException('User already exist');
      if (
        data.biometricKey &&
        (await this.prismaClient.user.findFirst({
          where: { biometricKey: data.biometricKey },
        }))
      )
        throw new BadRequestException('Biometric key not allowed');
      const hashedPassword = await this.setPassword(data.password);
      data.password = hashedPassword;
      const { email, id, createdAt, updatedAt, biometricKey } =
        await this.prismaClient.user.create({ data });
      return {
        email,
        id,
        biometricKey,
        createdAt: new Date(createdAt).toISOString(),
        updatedAt: new Date(updatedAt).toISOString(),
      };
    } catch (error) {
      throw  this.errorConverter.handle(error);
    }
  }

  /**
   *
   * @param data This is the email and password object
   * check if the user exist, throw error if otherwise
   * validate the user's password
   * generate the jwt token
   * @returns the access token and the user profile
   */
  async login(data: IUserDto): Promise<ILoginServiceResponse> {
    try {
      const user = await this.get('email', data.email);
      if (!user) throw new NotFoundException('User not found');
      const { email, createdAt } = user;
      if (!(await this.validatePassword(user.password, data.password)))
        throw new BadRequestException('Invalid Credentials');
      const accessToken = await this.seal(
        {
          email,
          createdAt,
        },
        '20m',
      );
      return { accessToken, user };
    } catch (error) {
      throw  this.errorConverter.handle(error);
    }
  }
  /**
   *
   * @param biometricKey this is the biometricKey for logging in
   * check the validity of the biometric key
   * the biometric is not encrypted due to the context of the task objective
   * @returns the access token and the user profile
   */
  async biometricLogin(biometricKey: string): Promise<ILoginServiceResponse> {
    try {
      const user = await this.get('biometricKey', null, biometricKey);
      if (!user) throw new NotFoundException('Invalid Biometric key');
      const { email, createdAt } = user;
      const accessToken = await this.seal(
        {
          email,
          createdAt,
        },
        '20m',
      );
      return { accessToken, user };
    } catch (error) {
      throw  this.errorConverter.handle(error);
    }
  }
  /**
   *
   * @param type This signifies the identifier for quering the data from the database
   * @param email The email field
   * @param biometricKey The biometricKey field
   * @param id The user id filed
   * used switch case to determine the key and return the query balue
   * @returns The user profile or null if the user does not exist
   */
  async get(
    type: string,
    email?: string,
    biometricKey?: string,
    id?: number,
  ): Promise<User | null> {
    try {
      switch (type) {
        case 'email':
          return await this.prismaClient.user.findFirst({
            where: { email },
          });
          break;
        case 'biometricKey':
          return await this.prismaClient.user.findFirst({
            where: { biometricKey },
          });
          break;

        default:
          return await this.prismaClient.user.findFirst({
            where: { id },
          });
          break;
      }
    } catch (error) {
      throw  this.errorConverter.handle(error);
    }
  }

  /**
   *
   * @param id the user id
   * this was initially provided for deleting unit testing data from the database if mocking wasn't used
   * @returns code and message
   */
  async removeUser(id: number): Promise<IResponseDto> {
    try {
      await this.prismaClient.user.delete({ where: { id } });
      return { code: HttpStatus.OK, message: 'success' };
    } catch (error) {
      throw  this.errorConverter.handle(error);
    }
  }

  /**
   *
   * @param password the user password
   * hash the password
   * @returns the hashed version of the pasword
   */
  setPassword = async (password: string): Promise<string> => {
    try {
      const salt = this.configService.get<string>('PASSWORD_SALT');
      const passwordHash = pbkdf2Sync(
        password,
        salt,
        10000,
        512,
        'sha512',
      ).toString('hex');
      return passwordHash;
    } catch (error) {
      throw  this.errorConverter.handle(error);
    }
  };

  /**
   *
   * @param hashedPassword the hashed password from the database
   * @param password the user's password entered
   * @returns boolean base on the validity of the password when compared to the hased password
   */
  validatePassword = async (
    hashedPassword: string,
    password: string,
  ): Promise<boolean> => {
    try {
      const salt = this.configService.get<string>('PASSWORD_SALT');
      const hash = pbkdf2Sync(password, salt, 10000, 512, 'sha512').toString(
        'hex',
      );
      return hashedPassword === hash;
    } catch (error) {
      throw  this.errorConverter.handle(error);
    }
  };

  /**
   *
   * @param data the object to encrypt
   * @param ttl expiration time
   * @returns the encryption token
   */
  seal(data: any, ttl: number | string): Promise<string> {
    try {
      const secret = this.configService.get<string>('SECRET_KEY');
      const expiresIn = typeof ttl === 'number' ? `${ttl}s` : ttl;
      return new Promise((resolve, reject) => {
        const claim = data.toJSON ? data.toJSON() : data;
        jwt.sign({ ...claim }, secret, { expiresIn }, (err: any, sig: any) => {
          if (err) return reject(err);
          resolve(sig);
        });
      });
    } catch (error) {
      throw  this.errorConverter.handle(error);
    }
  }

  /**
   *
   * @param token encrypted token
   * @param secret secret to decryptt
   * @returns returns the user object
   */
  unseal(token: string, secret: string): Promise<any> {
    try {
      return new Promise((resolve, reject) => {
        jwt.verify(token, secret, (err, val) => {
          if (err) return reject(err);
          return resolve(val);
        });
      });
    } catch (error) {
      throw  this.errorConverter.handle(error);
    }
  }
}
