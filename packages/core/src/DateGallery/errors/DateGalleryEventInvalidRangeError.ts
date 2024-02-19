import { common } from './common';

/**
 * Error which is thrown whenever an event has a startDate that lies
 * after the endDate.
 *
 * @since 1.6.0
 */
export class DateGalleryEventInvalidRangeError extends Error {
  /**
   * DateGalleryEventInvalidRangeError constructor
   *
   * @since 1.6.0
   */
  constructor() {
    super(`${common} invalid range, an events startDate lies after its endDate`);
    this.name = 'DateGalleryEventInvalidRangeError';
  }
}
