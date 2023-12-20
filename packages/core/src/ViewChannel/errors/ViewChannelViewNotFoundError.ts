import { common } from './common';

/**
 * Error which is thrown whenever the `ViewChannelView` was not found
 * inside of the `views` array of the `ViewChannel`.
 *
 * @since 1.0.0
 */
export class ViewChannelViewNotFoundError extends Error {
  /**
   * ViewChannelViewNotFoundError constructor
   *
   * @since 1.0.0
   */
  constructor(method: string) {
    super(`${common} ${method} > "ViewChannelView" not found in views array`);
    this.name = 'ViewChannelViewNotFoundError';
  }
}
