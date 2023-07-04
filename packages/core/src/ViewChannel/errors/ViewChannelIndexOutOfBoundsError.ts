import { common } from './common';

/**
 * Error which is thrown whenever an index is out of bounds.
 *
 * @since 1.0.0
 */
export class ViewChannelIndexOutOfBoundsError extends Error {
  /**
   * ViewChannelIndexOutOfBoundsError constructor
   *
   * @since 1.0.0
   */
  constructor() {
    super(`${common} dismissByIndex > "index" is out of bounds`);
    this.name = 'ViewChannelIndexOutOfBoundsError';
  }
}
