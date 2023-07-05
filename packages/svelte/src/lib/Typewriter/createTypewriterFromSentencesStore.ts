import {
  Typewriter,
  typewriterFromSentences,
  type TypewriterFromSentencesConfig,
} from '@uiloos/core';
import { readable, type Readable } from 'svelte/store';

/**
 * Creates a stores containing a Typewriter from @uiloos/core which is 
 * configured by the config parameter.
 * 
 * What the function does is create the Typewriter and register itself 
 * to the ActiveList for changes, when a change is detected it makes 
 * sure that the component using the store is re-rendered.
 * 
 * @param {TypewriterFromSentencesConfig} config The initial configuration of the Typewriter.
 * @returns A Readable<Typewriter> 
 * 
 * @since 1.3.0
 */
export function createTypewriterFromSentencesStore(
  config: TypewriterFromSentencesConfig
): Readable<Typewriter> {
  const typewriter = typewriterFromSentences(config);

  const typewriterReadable = readable(typewriter, (_set, update) => {
    const unsubscribe = typewriter.subscribe(() => {
      update(() => {
        return typewriter;
      });
    });

    return () => {
      unsubscribe();
    };
  });

  return typewriterReadable;
}