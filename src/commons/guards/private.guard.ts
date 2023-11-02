import config from '@configs/configuration';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

export class PrivateGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const { 'service-private-key': servicePrivateKey } = request.headers;
    return servicePrivateKey === config.SERVICE_PRIVATE_KEY;
  }
}
