import { CacheInterceptor } from '@nestjs/cache-manager';
import { ExecutionContext, Injectable } from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
  protected trackBy(context: ExecutionContext): string | undefined {
    const req = context.switchToHttp().getRequest();
    if (!req) return undefined;

    const method = req.method.toUpperCase();
    const path = req.path;

    // Sort query params for consistent keys
    const params = Object.keys(req.query || {})
      .sort()
      .map((k) => `${k}=${req.query[k]}`)
      .join('&');

    return `${method}:${path}?${params}`;
  }
}
