import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from '../auth-service/auth.service';
import { IResponseDto, IUserDto } from '../dto';
import { ErrorConverter } from '../utility/error-converter';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private errorConverter: ErrorConverter,
  ) {}
  @Post('/create')
  /**
   * @data this is the email and password object for registering a new user
   * @returns the user details.
   */
  async create(@Body() data: IUserDto): Promise<IResponseDto> {
    try {
      const user = await this.authService.create(data);
      return {
        code: HttpStatus.OK,
        message: 'success',
        data: { ...user, password: undefined },
      };
    } catch (error) {
      throw this.errorConverter.handle(error);
    }
  }

  @Post('/login')
  /**
   * @data this is the email and password object for logging in
   * @returns the user details and access token
   */
  async login(@Body() data: IUserDto): Promise<IResponseDto> {
    try {
      const { accessToken, user } = await this.authService.login(data);
      return {
        code: HttpStatus.OK,
        message: 'success',
        data: { ...user, password: undefined, token: { accessToken } },
      };
    } catch (error) {
      throw this.errorConverter.handle(error);
    }
  }

  @Post('/biometric-login')
  /**
   * @data this is the object containing the biometric key object
   * @returns the user details and access token
   */
  async biometricLogin(
    @Body() data: { biometricKey: string },
  ): Promise<IResponseDto> {
    try {
      const { accessToken, user } = await this.authService.biometricLogin(
        data.biometricKey,
      );
      return {
        code: HttpStatus.OK,
        message: 'success',
        data: { ...user, password: undefined, token: { accessToken } },
      };
    } catch (error) {
      throw this.errorConverter.handle(error);
    }
  }
}
