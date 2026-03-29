declare module "express" {
  export type Request = any;
  export type Response = any;
  export type NextFunction = any;
  export type ErrorRequestHandler = any;
  export type RequestHandler = any;
  export const Router: any;
  const express: any;
  export default express;
}

declare module "cors" {
  const cors: any;
  export default cors;
}

declare module "dotenv" {
  const dotenv: {
    config: (...args: any[]) => any;
  };
  export default dotenv;
}

declare module "zod" {
  export const z: any;
  export class ZodError extends Error {
    flatten: () => any;
  }
  export type RefinementCtx = any;
}

declare module "jsonwebtoken" {
  export type SignOptions = any;
  const jwt: {
    sign: (...args: any[]) => string;
    verify: (...args: any[]) => any;
  };
  export default jwt;
}

declare module "bcrypt" {
  const bcrypt: {
    hash: (...args: any[]) => Promise<string>;
    compare: (...args: any[]) => Promise<boolean>;
  };
  export default bcrypt;
}
