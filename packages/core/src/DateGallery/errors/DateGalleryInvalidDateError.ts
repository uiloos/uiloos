import { common } from './common';

/**
 * Error which is thrown whenever the DateGallery is given an invalid
 * Date object, or when Date object cannot be constructed from
 * a string.
 * 
 * An example of an invalid date would be '2000-42-42' as there is 
 * no 42th month.
 *
 * @since 1.6.0
 */
export class DateGalleryInvalidDateError extends Error {
  /**
   * DateGalleryInvalidDateError constructor
   *
   * @since 1.6.0
   */
  constructor(method: string, dateName: string) {
    super(`${common} ${method} > "${dateName}" is an or contains an invalid date`);
    this.name = 'DateGalleryInvalidDateError';
  }
}