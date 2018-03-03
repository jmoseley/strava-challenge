declare module 'meteor/promise' {
  interface PromiseStatic {
    await: <T>(func: (...args: any[]) => Promise<T>) => T;
  }

  export const Promise: PromiseStatic;
}
