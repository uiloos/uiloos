import { ref, Ref } from 'vue';

import {
  ActiveList as ActiveListCore,
  ActiveListConfig,
} from '@uiloos/core';

/**
 * A composable which returns a ref containing an ActiveList from
 * @uiloos/core which is configured by the config parameter.
 *
 * @param {ActiveListConfig<T>} config The initial configuration for the ActiveList.
 * @returns {Ref<ActiveListCore<T>>} A ref containing an instance of the ActiveList from @uiloos/core
 */
export function useActiveList<T>(
  config: ActiveListConfig<T>
): Ref<ActiveListCore<T>> {
  return ref(new ActiveListCore<T>(config)) as unknown as Ref<
    ActiveListCore<T>
  >;
}
