import { Controller, Get, Inject } from '@nestjs/common';
import { UserService } from './user.service';
import Route from '@configs/route.config';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Controller(Route.USERS.toString())
export class UserController {
  constructor(
    private readonly userService: UserService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @Get()
  getOne() {
    this.logger.info(`Path: ${Route.USERS.toString()}/`);
    return this.userService.findOneCached();
  }
}
