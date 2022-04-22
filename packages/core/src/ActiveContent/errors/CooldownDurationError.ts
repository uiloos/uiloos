import { common } from "./common";

export class CooldownDurationError extends Error {
  constructor() {
    super(`${common} cooldown > duration cannot be negative or zero`);
    this.name = "CooldownDurationError";
  }
}
