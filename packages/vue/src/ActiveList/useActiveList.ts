import { ref, Ref, onMounted, onUnmounted } from 'vue';

import {
  ActiveList as ActiveListCore,
  ActiveListConfig, 
  UnsubscribeFunction
} from '@uiloos/core';

/**
 * A composable which returns an ActiveList from @uiloos/core 
 * which is configured by the config parameter. 
 * 
 * What the composable does is register itself to the ActiveList for 
 * changes, when a change is detected it makes sure that the component
 * using the composable is re-rendered.
 * 
 * @param {ActiveListConfig<T>} config The initial configuration of the ActiveList.
 * @returns An instance of the ActiveList from @uiloos/core
 */
export function useActiveList<T>(
  config: ActiveListConfig<T>
): Ref<ActiveListCore<T>> {
  const counter = ref(0);
  const activeList = ref(new ActiveListCore<T>(config)) as unknown as Ref<ActiveListCore<T>>;

  let subscriber: UnsubscribeFunction;

  onMounted(() => {
    subscriber = activeList.value.subscribe(() => {
      counter.value + 1;
    });
  });

  onUnmounted(() => {
    subscriber();
  })

  return activeList;
}