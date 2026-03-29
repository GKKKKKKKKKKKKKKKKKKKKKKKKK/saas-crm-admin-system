import type { UploadedFile } from "../middlewares/upload.middleware.js";
import type { JwtUserPayload } from "../utils/token.js";

declare global {
  namespace Express {
    interface Request {
      user?: JwtUserPayload;
      file?: UploadedFile;
    }
  }
}

export {};
