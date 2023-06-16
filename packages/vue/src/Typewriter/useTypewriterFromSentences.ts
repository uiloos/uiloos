import { onMounted, onUnmounted, Ref, shallowRef, triggerRef } from 'vue';

import {
  Typewriter,
  typewriterFromSentences,
  TypewriterFromSentencesConfig,
  UnsubscribeFunction
} from '@uiloos/core';

/**
 * A composable which returns a Typewriter from @uiloos/core which
 * is configured using `typewriterFromSentences`. Meaning returns 
 * a Typewriter which will type in the provided sentences using a 
 * single cursor.
 * 
 * What the composable does is register itself to the Typewriter for 
 * changes, when a change is detected it makes sure that the component
 * using the composable is re-rendered.
 * 
 * @param {TypewriterFromSentencesConfig} config The initial configuration of the Typewriter.
 * @returns An instance of the Typewriter from @uiloos/core
 * 
 * @since 1.2.0
 */
export function useTypewriterFromSentences(
  config: TypewriterFromSentencesConfig
): Ref<Typewriter> {
  const typewriter = shallowRef(typewriterFromSentences(config)) as unknown as Ref<Typewriter>;

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