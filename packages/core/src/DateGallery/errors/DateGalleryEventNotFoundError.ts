import { common } from './common';

/**
 * Error which is thrown whenever a move is performed on an 
 * DateGalleryEvent, but that event is not found within the 
 * DateGallery that is performing the move,
 *
 * This can occur whenever an event is removed and the instance 
 * is then moved.
 * 
 * @since 1.6.0
 */
export class DateGalleryEventNotFoundError extends Error {
  /**
   * DateGalleryEventNotFoundError constructor
   *
   * @since 1.6.0
   */
  constructor(method: string) {
    super(
      `${common} ${method} > "DateGalleryEvent" not found in events array`
    );
    this.name = 'DateGalleryEventNotFoundError';
  }
}
