import { onMounted, onUnmounted, Ref, shallowRef, triggerRef } from 'vue';

import {
  Typewriter as TypewriterCore,
  TypewriterConfig,
  UnsubscribeFunction
} from '@uiloos/core';

/**
 * A composable which returns an Typewriter from @uiloos/core 
 * which is configured by the config parameter. 
 * 
 * What the composable does is register itself to the Typewriter for 
 * changes, when a change is detected it makes sure that the component
 * using the composable is re-rendered.
 * 
 * @param {TypewriterConfig} config The initial configuration of the Typewriter.
 * @returns An instance of the Typewriter from @uiloos/core
 * 
 * @since 1.2.0
 */
export function useTypewriter<T>(
  config: TypewriterConfig
): Ref<TypewriterConfig> {
  const typewriter = shallowRef(new TypewriterCore(config)) as unknown as Ref<TypewriterCore>;

  let subscriber: UnsubscribeFunction;

  onMounted(() => {
    subscriber = typewriter.value.subscribe(() => {
      triggerRef(typewriter);
    });
  });

  onUnmounted(() => {
    subscriber();
  })

  return typewriter;
}