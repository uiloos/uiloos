import { common } from './common';

/**
 * Error which is thrown whenever the DateGallery is in
 * `DateGalleryMaxSelectionLimitBehavior` mode `error`, when the
 * `maxSelectionLimit` is exceeded.
 *
 * @since 1.6.0
 */
export class DateGallerySelectionLimitReachedError extends Error {
  /**
   * DateGallerySelectionLimitReachedError constructor
   *
   * @since 1.6.0
   */
  constructor(method: string) {
    super(`${common} ${method} > selection limit reached`);
    this.name = 'DateGallerySelectionLimitReachedError';
  }
}
