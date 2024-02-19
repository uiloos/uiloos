import {
  DateGallery,
  DateGalleryConfig,
} from '@uiloos/core';
import { subscribe } from './subscribe';

/**
 * The configuration for the activeList Alpine.js component.
 *
 * It has all properties the DateGalleryConfig has from core, plus an
 * optional `alpine` configuration object which allows you to set the
 * name for the exposed DateGallery.
 *
 * @since 1.6.0
 */
export type AlpineDateGalleryConfig<T> = DateGalleryConfig<T> & {
  /**
   * Additional alpine only configuration for the DateGallery.
   *
   * @since 1.6.0
   */
  alpine?: {
    /**
     * The method name you want to expose the `DateGallery` under.
     *
     * Say for example you set it to `"calendar"`: in the HTML you 
     * now use `calendar().firstFrame` and `calendar().next()`.
     *
     * It is recommended that you provide a name for readability, but
     * it is not required.
     *
     * Defaults to 'dateGallery'.
     *
     * @since 1.6.0
     */
    name?: string;
  };
};

/**
 * A function which you can use to register a `data` to Alpine.js to
 * create DateGallery instances from within HTML.
 *
 * @example
 * A. A Simple example
 *
 * The example below creates a simple month calendar as a list, 
 * with buttons to go to the next and previous months.
 * Clicking a date toggles the dates selection.
 *
 * First register dateGallery to alpine:
 *
 * ```js
 * import Alpine from 'alpinejs';
 * import { dateGallery } from '@uiloos/alpine';
 *
 * Alpine.data('dateGallery', dateGallery);
 *
 * Alpine.start();
 * ```
 *
 * Now you can use the dateGallery in your HTML like this:
 *
 * ```html
 * <div
 *   x-data="dateGallery({
 *     alpine: {
 *       name: 'calendar'
 *     },
 *     mode: 'month',
 *   })"
 * >
 *   <ul>
 *     <template x-for="dateObj in calendar().firstFrame.dates">
 *       <li @click="dateObj.toggle()">
 *         <span x-text="dateObj.date.toLocaleDateString()"></span>
 *         <span x-text="date.isSelected ? 'selected' : ''"></span>
 *       </li>
 *     </template>
 *   </ul>
 *   
 *   <button @click="calendar().previous()">previous</button>
 *   <button @click="calendar().next()">next</button>
 * </div>
 * ```
 *
 * @param {AlpineDateGalleryConfig<T>} config The initial configuration for the DateGallery
 * @returns An Alpine.js data component
 * @since 1.6.0
 */
export function dateGallery<T>(config: AlpineDateGalleryConfig<T>) {
  const dateGallery = new DateGallery<T>(config);

  const name = config.alpine?.name ?? 'dateGallery';

  return subscribe(name, dateGallery)();
}
