import { common } from './common';

/**
 * Error which is thrown whenever the numberOfFrames is zero or
 * less than zero. 
 *
 * @since 1.6.0
 */
export class DateFrameNumberOfFramesError extends Error {
  /**
   * DateFrameNumberOfFramesError constructor
   *
   * @since 1.6.0
   */
  constructor() {
    super(`${common} numberOfFrames cannot be negative or zero`);
    this.name = 'DateFrameNumberOfFramesError';
  }
}
