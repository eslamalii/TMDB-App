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

describe('HttpCacheInterceptor.trackBy', () => {
  const interceptor = new HttpCacheInterceptor({} as any, new Reflector());

  it('builds key with sorted query params and uppercased method', () => {
    const req = {
      method: 'get',
      path: '/movies',
      query: { b: '2', a: '1' },
    };
    const ctx = createHttpContext(req);
    const key = (interceptor as any).trackBy(ctx);
    expect(key).toBe('GET:/movies?a=1&b=2');
  });

  it('builds key with trailing question mark when no params', () => {
    const req = {
      method: 'POST',
      path: '/genres',
      query: {},
    };
    const ctx = createHttpContext(req);
    const key = (interceptor as any).trackBy(ctx);
    expect(key).toBe('POST:/genres?');
  });

  it('returns undefined when no request (non-http context)', () => {
    const ctx = createHttpContext(undefined);
    const key = (interceptor as any).trackBy(ctx);
    expect(key).toBeUndefined();
  });
});
