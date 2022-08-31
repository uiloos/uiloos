import { common } from "./common";

/**
 * Error which is thrown whenever an index is out of bounds.
 * 
 * @since 1.0.0
 */
export class ActiveListIndexOutOfBoundsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ActiveListIndexOutOfBoundsError";
  }
}

export function throwIndexOutOfBoundsError(method: string, indexName: string): never {
  throw new ActiveListIndexOutOfBoundsError(
    `${common} ${method} > "${indexName}" is out of bounds`
  );
}

