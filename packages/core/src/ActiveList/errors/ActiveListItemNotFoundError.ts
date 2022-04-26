import { common } from "./common";

/**
 * Error which is thrown whenever an item cannot be found in the 
 * `ActiveList` contents array based on '===' equality. 
 */
export class ActiveListItemNotFoundError extends Error {
  constructor() {
    super(`${common} getIndex > index cannot be found, item is not in contents array`);
    this.name = "ActiveListItemNotFoundError";
  }
}
