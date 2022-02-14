import { ref, Ref, onMounted, onUnmounted } from 'vue';

import {
  ActiveContent as ActiveContentCore,
} from '@automata.dev/core';

import type { ActiveContentConfig, UnsubscribeFunction } from '@automata.dev/core'

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
