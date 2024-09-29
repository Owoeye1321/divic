import { Controller, Get } from '@nestjs/common';

@Controller('')
export class IndexController {
  @Get()
  get(): String {
    return 'Hello World!';
  }
}
