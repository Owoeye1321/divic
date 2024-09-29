import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class ErrorConverter {
  handle(error: any) {
    if (error instanceof BadRequestException) {
      return new BadRequestException(error.message);
    } else if (error instanceof NotFoundException) {
      return new NotFoundException(error.message);
    } else if (error instanceof HttpException) {
      return new HttpException(error.message, HttpStatus.UNPROCESSABLE_ENTITY);
    } else {
      // Default to a GeneralError for unhandled error types
      return new HttpException(error.message, HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }
}
