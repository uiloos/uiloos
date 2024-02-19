import { common } from './common';

/**
 * Error which is thrown whenever the mode is unknown, meaning not
 * part of the `DATE_FRAME_MODES` array of known modes.
 *
 * @since 1.6.0
 */
export class DateGalleryModeError extends Error {
  /**
   * DateGalleryModeError constructor
   *
   * @since 1.6.0
   */
  constructor(mode: string) {
    super(`${common} unknown mode: "${mode}" provided`);
    this.name = 'DateGalleryModeError';
  }
}
