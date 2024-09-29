
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export class LoginInput {
    email: string;
    password: string;
}

export class RegisterInput {
    email: string;
    password: string;
    biometricKey?: Nullable<string>;
}

export class User {
    id: number;
    email: string;
    biometricKey?: Nullable<string>;
    password?: Nullable<string>;
    createdAt: string;
    updatedAt: string;
}

export abstract class IQuery {
    abstract getUser(id: number): User | Promise<User>;
}

export abstract class IMutation {
    abstract login(data: LoginInput): Nullable<AuthResponse> | Promise<Nullable<AuthResponse>>;

    abstract biometricLogin(biometricKey: string): Nullable<AuthResponse> | Promise<Nullable<AuthResponse>>;

    abstract register(data: RegisterInput): Nullable<User> | Promise<Nullable<User>>;
}

export class AuthResponse {
    token?: Nullable<string>;
    message?: Nullable<string>;
}

type Nullable<T> = T | null;
