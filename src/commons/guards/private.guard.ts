import { config } from '@configs/configuration';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

export class PrivateGuard implements CanActivate {
  private readonly HEADER_KEY = 'service-private-key';
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const { [this.HEADER_KEY]: servicePrivateKey } = request.headers;
    return servicePrivateKey === config.SERVICE_PRIVATE_KEY;
  }
}
