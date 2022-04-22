import { common } from "./common";

export class ItemNotFoundError extends Error {
  constructor() {
    super(`${common} getIndex > index cannot be found, item is not in contents array`);
    this.name = "ItemNotFoundError";
  }
}
