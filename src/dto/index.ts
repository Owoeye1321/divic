import { User } from '@prisma/client';

export class IUserDto {
  email: string;
  password: string;
  biometricKey?: string;
}

export class IResponseDto {
  code: number;
  message: string;
  data?: any;
}
export class ILoginServiceResponse {
  accessToken: string;
  user: User;
}

export interface IUserResolver {
  id: number;
  email: string;
  password?: string;
  biometricKey?: string;
  createdAt: string;
  updatedAt: string;
}
