declare module 'fine-rest' {
  export interface JsonRoutes {
    add: (
      method: 'GET' | 'POST',
      path: string,
      handler: (req: Request, res: Response, next: Function) => void,
    ) => void;
    sendResult: (
      res: Response,
      result: {
        code: number;
        data: object;
      },
    ) => void;
  }

  export const JsonRoutes: JsonRoutes;
}
