import { common, name } from "./common";

/**
 * Error which is thrown whenever the cursor has a selection but the
 * cursor itself is not placed at either the start or end of the
 * selection.
 * 
 * @since 1.2.0
 */
export class TypewriterCursorNotAtSelectionEdgeError extends Error {
  constructor() {
    super(`${common} cursor is not placed on edges of selection`);
    this.name = `${name}CursorNotAtSelectionEdgeError`;
  }
}
