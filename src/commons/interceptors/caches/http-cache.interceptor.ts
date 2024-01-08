import { CACHE_KEY_METADATA, CacheInterceptor } from '@nestjs/cache-manager';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
// cache by query
export class HttpCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    const request = context
      ?.switchToHttp()
      ?.getRequest<Request & { user: { id: number } }>();
    const cacheKey =
      this.reflector.get(CACHE_KEY_METADATA, context.getHandler()) ??
      request?.originalUrl;
    if (cacheKey) {
      return `${cacheKey}:${request?.user?.id}:${
        request?.params?.id ?? request?.params?._id
      }:${JSON.stringify(request?.query)}`;
    }
    return super.trackBy(context);
  }
}
