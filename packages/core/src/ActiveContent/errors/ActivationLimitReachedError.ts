import { common } from "./common";

export class ActivationLimitReachedError extends Error {
  constructor() {
    super(`${common} activateByIndex > activation limit reached`);
    this.name = "ActivationLimitReachedError";
  }
}
