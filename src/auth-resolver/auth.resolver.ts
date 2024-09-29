import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { AuthResponse, RegisterInput, User } from '../graphql';
import { AuthService } from '../auth-service/auth.service';
import { IUserDto } from '../dto';
import { ErrorConverter } from '../utility/error-converter';
@Resolver('User')
export class AuthResolver {
  constructor(
    private authService: AuthService,
    private errorConverter: ErrorConverter,
  ) {}

  @Query(() => User)
  /**
   * @id this is user id
   * fetch the user with the is
   * @returns the user profile
   */
  async getUser(@Args('id') id: number): Promise<User> {
    const user = await this.authService.get('id', null, null, id);
    return {
      ...user,
      createdAt: new Date(user.createdAt).toISOString(),
      updatedAt: new Date(user.updatedAt).toISOString(),
    };
  }

  @Mutation(() => AuthResponse)
  /**
   * @biometricKey This is the biometric value for access
   * call the biometric login function abstraction from the auth service
   * @returns access token and message
   */
  async biometricLogin(
    @Args('biometricKey') biometricKey: string,
  ): Promise<AuthResponse> {
    try {
      const { accessToken } =
        await this.authService.biometricLogin(biometricKey);
      return { token: accessToken, message: 'success' };
    } catch (error) {
      throw this.errorConverter.handle(error);
    }
  }

  @Mutation(() => AuthResponse)
  /**
   * @data This is the data object that include email and password for logging in
   * call the login  function abstraction from the auth service
   * @returns access token and message
   */
  async login(@Args('data') data: IUserDto): Promise<AuthResponse> {
    try {
      const { accessToken } = await this.authService.login(data);
      return { token: accessToken, message: 'success' };
    } catch (error) {
      throw this.errorConverter.handle(error);
    }
  }
  @Mutation(() => User)
  /**
   * @data This is the user details for registration
   * call the creat function abstraction from the auth service
   * @returns the user details from the database
   */
  async register(@Args('data') data: RegisterInput): Promise<User> {
    try {
      return await this.authService.create(data);
    } catch (error) {
      throw this.errorConverter.handle(error);
    }
  }
}
