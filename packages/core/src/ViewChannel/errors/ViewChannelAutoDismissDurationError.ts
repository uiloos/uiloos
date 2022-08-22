import { common } from "./common";

/**
 * Error which is thrown whenever the autoDismiss duration is zero or
 * less than zero. 
 */
export class ViewChannelAutoDismissDurationError extends Error {
  constructor() {
    super(`${common} autoDismiss > duration cannot be negative or zero`);
    this.name = "ViewChannelAutoDismissDurationError";
  }
}
