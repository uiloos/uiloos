import { useEffect, useState } from 'react';

import {
  Typewriter,
  TypewriterFromSentencesConfig,
  typewriterFromSentences,
} from '@uiloos/core';

/**
 * A hook which returns a Typewriter from @uiloos/core which
 * is configured using `typewriterFromSentences`. Meaning returns 
 * a Typewriter which will type in the provided sentences using a 
 * single cursor.
 * 
 * What the hook does is register itself to the Typewriter for 
 * changes, when a change is detected it makes sure that the component
 * using the hook is re-rendered.
 * 
 * @param {TypewriterFromSentencesConfig} config The initial configuration of the Typewriter.
 * @returns An instance of the Typewriter from @uiloos/core
 * 
 * @since 1.2.0
 */
export function useTypewriterFromSentences(
  config: TypewriterFromSentencesConfig
): Typewriter {
  const [_counter, setCounter] = useState(0);
  const [typewriter] = useState(() => typewriterFromSentences(config));

  useEffect(() => {
    const unsubscribe = typewriter.subscribe(() => {
      setCounter((value) => value + 1);
    });

    return () => {
      unsubscribe();
    }
  }, []);

  return typewriter;
}