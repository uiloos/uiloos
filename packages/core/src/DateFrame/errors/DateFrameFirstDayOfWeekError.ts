import { common } from './common';

/**
 * Error which is thrown whenever the DateFrame is configured 
 * with a `firstDayOfWeek` which is not a number from 0 to 6,
 * including 6.
 *
 * @since 1.6.0
 */
export class DateFrameFirstDayOfWeekError extends Error {
  /**
   * DateFrameFirstDayOfWeekError constructor
   *
   * @since 1.6.0
   */
  constructor() {
    super(`${common} invalid firstDayOfWeek`);
    this.name = 'DateFrameFirstDayOfWeekError';
  }
}
