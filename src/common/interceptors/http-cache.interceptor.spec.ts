import { Reflector } from '@nestjs/core';
import type { ExecutionContext } from '@nestjs/common';
import { HttpCacheInterceptor } from './http-cache.interceptor';

const createHttpContext = (req?: any): ExecutionContext => {
  return {
    switchToHttp: () => ({
      getRequest: () => req,
      getResponse: () => undefined,
      getNext: () => undefined,
    }),
    switchToRpc: () => ({}) as any,
    switchToWs: () => ({}) as any,
    getType: () => 'http' as any,
    getClass: () => ({}) as any,
    getHandler: () => ({}) as any,
    getArgs: () => [],
    getArgByIndex: () => undefined,
  } as unknown as ExecutionContext;
};

describe('HttpCacheInterceptor', () => {
  const interceptor = new HttpCacheInterceptor({} as any, new Reflector());

  describe('trackBy', () => {
    it('should build key with sorted query params and uppercased method', () => {
      const req = {
        method: 'get',
        path: '/movies',
        query: { b: '2', a: '1' },
      };
      const ctx = createHttpContext(req);
      const key = (interceptor as any).trackBy(ctx);
      expect(key).toBe('GET:/movies?a=1&b=2');
    });

    it('should build key with trailing question mark when no params', () => {
      const req = {
        method: 'POST',
        path: '/genres',
        query: {},
      };
      const ctx = createHttpContext(req);
      const key = (interceptor as any).trackBy(ctx);
      expect(key).toBe('POST:/genres?');
    });

    it('should return undefined when no request (non-http context)', () => {
      const ctx = createHttpContext(undefined);
      const key = (interceptor as any).trackBy(ctx);
      expect(key).toBeUndefined();
    });

    it('should handle array values in query params', () => {
      const req = {
        method: 'GET',
        path: '/movies',
        query: { genres: ['action', 'drama'], limit: '20' },
      };
      const ctx = createHttpContext(req);
      const key = (interceptor as any).trackBy(ctx);
      expect(key).toBe('GET:/movies?genres=action,drama&limit=20');
    });

    it('should ignore baseUrl and use path only', () => {
      const req = {
        method: 'GET',
        baseUrl: '/api',
        path: '/movies',
        query: { limit: '10' },
      };
      const ctx = createHttpContext(req);
      const key = (interceptor as any).trackBy(ctx);
      expect(key).toBe('GET:/movies?limit=10');
    });

    it('should not include user id when authenticated', () => {
      const req = {
        method: 'GET',
        path: '/watchlist',
        query: {},
        user: { id: 123 },
      };
      const ctx = createHttpContext(req);
      const key = (interceptor as any).trackBy(ctx);
      expect(key).toBe('GET:/watchlist?');
    });

    it('should not include user part when no user', () => {
      const req = {
        method: 'GET',
        path: '/movies',
        query: {},
      };
      const ctx = createHttpContext(req);
      const key = (interceptor as any).trackBy(ctx);
      expect(key).toBe('GET:/movies?');
    });
  });
});
