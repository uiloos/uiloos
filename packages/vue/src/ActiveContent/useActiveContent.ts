import { ref, Ref, onMounted, onUnmounted } from 'vue';

import {
  ActiveContent as ActiveContentCore,
} from '@automata.dev/core';

import type { ActiveContentConfig, UnsubscribeFunction } from '@automata.dev/core'

/**
 * A composable which returns an ActiveContent from @automata.ui/core 
 * which is configured by the config parameter. 
 * 
 * What the composable does is register itself to the ActiveContent for 
 * changes, when a change is detected it makes sure that the component
 * using the hook is re-rendered.
 * 
 * @param {ActiveContentConfig<T>} config  The initial configuration of the ActiveContent.
 * @returns An instance of the ActiveContent from @automata.ui/core
 */
export function useActiveContent<T>(
  config: ActiveContentConfig<T>
): Ref<ActiveContentCore<T>> {
  const counter = ref(0);
  const activeContent = ref(new ActiveContentCore<T>(config)) as unknown as Ref<ActiveContentCore<T>>;

  let subscriber: UnsubscribeFunction;

  onMounted(() => {
    subscriber = activeContent.value.subscribe((activeContent) => {
      activeContent = activeContent;
      counter.value + 1;
    });
  });

  onUnmounted(() => {
    subscriber();
  })

  return activeContent;
}
