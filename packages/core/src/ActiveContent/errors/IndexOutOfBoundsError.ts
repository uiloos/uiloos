import { common } from "./common";

export class IndexOutOfBoundsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IndexOutOfBoundsError";
  }
}

export function throwIndexOutOfBoundsError(method: string, indexName: string): never {
  throw new IndexOutOfBoundsError(
    `${common} ${method} > IndexOutOfBoundsError > "${indexName}" is out of bounds`
  );
}

