import {
  ActiveList,
  ActiveListConfig,
} from '@uiloos/core';
import { subscribe } from './subscribe';

/**
 * The configuration for the activeList Alpine.js component.
 *
 * It has all properties the ActiveListConfig has from core, plus an
 * optional `alpine` configuration object which allows you to set the
 * name for the exposed ActiveList.
 *
 * @since 1.4.0
 */
export type AlpineActiveListConfig<T> = ActiveListConfig<T> & {
  /**
   * Additional alpine only configuration for the ActiveList.
   *
   * @since 1.4.0
   */
  alpine?: {
    /**
     * The method name you want to expose the `ActiveList` under.
     *
     * Say for example you set it to `"tabs"`: in the HTML you now use
     * `tabs().contents` and `tabs().activateByIndex(1)`.
     *
     * It is recommended that you provide a name for readability, but
     * it is not required.
     *
     * Defaults to 'activeList'.
     *
     * @since 1.4.0
     */
    name?: string;
  };
};

/**
 * A function which you can use to register a `data` to Alpine.js to
 * create ActiveList instances from within HTML.
 *
 * @example
 * A. A Simple example
 *
 * The example below creates a list with three items:
 * a, b and c of which only one item can be active.
 * Clicking an item makes it active.
 *
 * First register activeList to alpine:
 *
 * ```js
 * import Alpine from 'alpinejs';
 * import { activeList } from '@uiloos/alpine';
 *
 * Alpine.data('activeList', activeList);
 *
 * Alpine.start();
 * ```
 *
 * Now you can use the activeList in your HTML like this:
 *
 * ```html
 * <ul
 *   x-data="activeList({
 *     alpine: {
 *       name: 'tabs'
 *     },
 *     active: 'a',
 *     contents: ['a', 'b', 'c']
 *   })"
 * >
 *   <template x-for="content in tabs().contents">
 *     <li @click="content.activate()">
 *       <span x-text="`${content.value} ${content.isActive 'active' : 'inactive'}`"></span>
 *     </li>
 *   </template>
 * </ul>
 * ```
 *
 * @param {AlpineActiveListConfig<T>} config The initial configuration for the ActiveList
 * @returns An Alpine.js data component
 * @since 1.4.0
 */
export function activeList<T>(config: AlpineActiveListConfig<T>) {
  const activeList = new ActiveList<T>(config);

  const name = config.alpine?.name ?? 'activeList';

  return subscribe(name, activeList)();
}
