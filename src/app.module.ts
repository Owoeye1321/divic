import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriverConfig, ApolloDriver } from '@nestjs/apollo';
import { AuthController } from './auth-controller/auth.controller';
import { AuthService } from './auth-service/auth.service';
import { PrismaClient } from '@prisma/client';
import { AuthResolver } from './auth-resolver/auth.resolver';
import { IndexController } from './index/index.controller';
import { ErrorConverter } from './utility/error-converter';

@Module({
  imports: [
    //Load the env file and make it global to the application ecosystem
    ConfigModule.forRoot({
      envFilePath: join(__dirname, '../.env'),
      isGlobal: true,
    }),
    //Configure graphQl
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      debug: true,
      playground: true,
      typePaths: [join(process.cwd(), '/src/graphql-schema/schema.graphql')],
      definitions: {
        path: join(process.cwd(), '/src/graphql.ts'),
        outputAs: 'class',
      },
    }),
  ],
  controllers: [AuthController, IndexController],
  providers: [AuthService, PrismaClient, AuthResolver, ErrorConverter],
})
export class AppModule {}
