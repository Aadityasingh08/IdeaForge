import type { UserDoc } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      /** The signed-in user, set by the session middleware. */
      user?: UserDoc;
      /** SHA-256 of the current session token. */
      sessionHash?: string;
    }
  }
}

export {};
