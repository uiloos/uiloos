import { common } from "./common";

/**
 * Error which is thrown whenever the `ViewChannelView` was not found
 * inside of the `views` array of the `ViewChannel`
 */
export class ViewChannelViewNotFoundError extends Error {
  constructor() {
    super(`${common} dismiss > "ViewChannelView" not found in views array`);
    this.name = "ViewChannelViewNotFoundError";
  }
}
