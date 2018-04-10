declare module 'meteor/http' {
  interface HTTP {
    call: (
      method: 'GET' | 'POST',
      url: string,
      options?: Options,
      callback?: (error: any, result: any) => void,
    ) => void;
  }

  interface Options {
    content: string;
    data: object;
    query: string;
    params: string;
    headers: object;
    timeout: number;
  }
}
