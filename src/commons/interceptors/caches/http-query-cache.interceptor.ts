import { CACHE_KEY_METADATA, CacheInterceptor } from '@nestjs/cache-manager';
import { ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
// cache by query
export class HttpQueryCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    const cacheKey = this.reflector.get(
      CACHE_KEY_METADATA,
      context.getHandler(),
    );
    if (cacheKey) {
      const request = context.switchToHttp().getRequest();
      return `${cacheKey}:${request?.user?.id}:${JSON.stringify(
        request.query,
      )}`;
    }
    return super.trackBy(context);
  }
}
