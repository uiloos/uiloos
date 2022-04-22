import { common } from "./common";

export class AutoplayDurationError extends Error {
  constructor() {
    super(`${common} autoplay > duration cannot be negative or zero`);
    this.name = "AutoplayDurationError";
  }
}
