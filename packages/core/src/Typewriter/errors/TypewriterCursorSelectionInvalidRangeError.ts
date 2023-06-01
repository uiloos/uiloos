import { common, name } from "./common";

/**
 * Error which is thrown whenever a cursors selection has a start
 * which does not lie before the end. This happens when the start
 * of the selection has a higher or equal value to the end of 
 * the selection.
 * 
 * @since 1.2.0
 */
export class TypewriterCursorSelectionInvalidRangeError extends Error {
  constructor() {
    super(`${common} cursors selection has an invalid range: start is equal or larger than the end`);
    this.name = `${name}CursorSelectionInvalidRangeError`;
  }
}
