export interface PromiseStatic {
  await: <T>(func: (...any) => Promise<T>) => T;
}

export const Promise: PromiseStatic;
