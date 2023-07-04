import { common, name } from './common';

/**
 * Error which is thrown whenever a cursors selection is
 * initialized to be outside of the text of the Typewriter.
 *
 * @since 1.2.0
 */
export class TypewriterCursorSelectionOutOfBoundsError extends Error {
  /**
   * TypewriterCursorSelectionOutOfBoundsError constructor
   *
   * @since 1.2.0
   */
  constructor(name: 'start' | 'end') {
    super(`${common} cursor selection ${name} is out of bounds`);
    this.name = `${name}InvalidCursorSelectionOutOfBoundsError`;
  }
}
