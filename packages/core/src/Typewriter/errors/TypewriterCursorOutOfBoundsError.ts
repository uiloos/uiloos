import { common, name } from "./common";

/**
 * Error which is thrown whenever the cursors are placed outside
 * of the text of the Typewriter.
 * 
 * @since 1.2.0
 */
export class TypewriterCursorOutOfBoundsError extends Error {
  constructor() {
    super(`${common} cursor is out of bounds`);
    this.name = `${name}CursorOutOfBoundsError`;
  }
}
