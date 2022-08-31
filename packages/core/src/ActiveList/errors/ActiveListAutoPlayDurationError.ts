import { common } from "./common";

/**
 * Error which is thrown whenever the autoPlay duration is zero or
 * less than zero. 
 * 
 * @since 1.0.0
 */
export class ActiveListAutoPlayDurationError extends Error {
  constructor() {
    super(`${common} autoPlay > duration cannot be negative or zero`);
    this.name = "ActiveListAutoPlayDurationError";
  }
}
