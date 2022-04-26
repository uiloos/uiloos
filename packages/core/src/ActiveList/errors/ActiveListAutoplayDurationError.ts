import { common } from "./common";

/**
 * Error which is thrown whenever the autoplay duration is zero or
 * less than zero. 
 */
export class ActiveListAutoplayDurationError extends Error {
  constructor() {
    super(`${common} autoplay > duration cannot be negative or zero`);
    this.name = "ActiveListAutoplayDurationError";
  }
}
