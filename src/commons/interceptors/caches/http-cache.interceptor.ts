import { CACHE_KEY_METADATA, CacheInterceptor } from '@nestjs/cache-manager';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
// cache by query
export class HttpCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    const cacheKey = this.reflector.get(
      CACHE_KEY_METADATA,
      context.getHandler(),
    );
    const request = context
      .switchToHttp()
      .getRequest<Request & { user: { id: number } }>();
    return `${cacheKey ?? request?.originalUrl}:${request?.user?.id}:${
      request?.params?.id ?? request?.params?._id
    }:${JSON.stringify(request.query)}`;
  }
}
