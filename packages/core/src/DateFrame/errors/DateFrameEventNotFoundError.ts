import { common } from './common';

/**
 * Error which is thrown whenever a move is performed on an 
 * DateFrameEvent, but that event is not found within the 
 * DateFrame that is performing the move,
 *
 * This can occur whenever an event is removed and the instance 
 * is then moved.
 * 
 * @since 1.6.0
 */
export class DateFrameEventNotFoundError extends Error {
  /**
   * DateFrameEventNotFoundError constructor
   *
   * @since 1.6.0
   */
  constructor() {
    super(
      `${common} moveEvent > event cannot be found in DateFrame`
    );
    this.name = 'DateFrameEventNotFoundError';
  }
}
