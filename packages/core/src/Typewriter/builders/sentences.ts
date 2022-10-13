import {
  TypewriterConfig,
  TypewriterKeystroke,
  typewriterKeyStrokeBackspace,
  TypewriterSubscriber,
} from '../types';
import { Typewriter } from '../Typewriter';

/**
 * The configuration for the `typewriterFromSentences` function.
 */
export type TypewriterFromSentencesConfig = Omit<
  TypewriterConfig,
  'keystrokes'
> & {
  /**
   * The sentences the Typewriter should animate.
   *
   * @since 1.2.0
   */
  sentences: string[];

  /**
   * The delay in between letters, meaning the speed in which to type.
   *
   * Defaults to 50ms
   *
   * @since 1.2.0
   */
  delay?: number;
};

/**
 * Creates a TypeWriter which will type in the provided sentences.
 *
 * Intelligently moves from one sentence to another, only removing
 * parts of the sentence if necessary.
 *
 * For example when providing the following sentences array:
 * `['I love dogs', 'I love cats]`.
 *
 * The Typewriter will type the sentence "I love dogs" first. Then it
 * will do four backspaces to end up with "I love". Finally it will
 * type in "dogs".
 *
 * @param {TypewriterFromSentencesConfig} config The configuration of the Typewriter.
 * @param {TypewriterSubscriber | undefined} subscriber An optional subscriber which responds to changes in the Typewriter.
 * @returns {Typewriter} a configured typewriter
 * @since 1.2.0
 */
export function typewriterFromSentences(
  config: TypewriterFromSentencesConfig,
  subscriber?: TypewriterSubscriber
): Typewriter {
  const delay = config.delay === undefined ? 50 : config.delay;

  const keystrokes: TypewriterKeystroke[] = [];

  // This will be the text which is manipulated.
  let text: string[] = [];

  // Yield each sentence with a slight delay between them.
  for (let sentence of config.sentences) {
    const sentenceArray = Array.from(sentence);

    /*
      First check how many backspaces we need to do. A normal person
      will not remove an entire sentence if part of the sentence
      matches. For example when going from 'Mark' to 'Maarten' you
      do not remove 'Mark' completely you keep the 'Ma' and then
      you start typing again filling in the rest which is 'arten'.
    */

    let charsInCommonFromStart = 0;

    for (let i = 0; i < text.length; i++) {
      const fromChar = text[i];
      const toChar = sentenceArray[i];

      if (toChar === fromChar) {
        charsInCommonFromStart += 1;
      } else {
        break;
      }
    }

    /* 
      There are two scenarios, either the entire sentence needs to be
      removed before starting the new sentence, or part of the sentence
      needs to be removed.
  
      The first scenario: removing the entire sentence, happens when
      there are no characters which match / are in common between the
      two sentences from the start of the sentences. 
  
      For example if the `from` is "Salt" and the `to` is "Pepper". 
      The number of letters in common would be 0. Then the number of 
      backspaces would be "Salt" - 0 which is 4. Which makes sense
      because the entirety of "Salt" needs to be removed.
    
      The second scenario: removing part of the sentence, happens when
      there are characters which match / are in common between the
      two sentences from the start of the sentences. 
      
      Take a `from` which is: "Mark" and a `to` which is "Maarten". 
      The amount of letters they have have in common from the start is 2 
      namely the "M" and "a". So the number of backspaces we need to do 
      is "Mark".length - 2 which is 2. This is correct because we
      want to start typing from "Ma".
    */
    const backspaces = text.length - charsInCommonFromStart;

    // Perform backspaces on text
    text = text.slice(0, text.length - backspaces);

    // Now apply the number of backspaces
    for (let i = 0; i < backspaces; i++) {
      keystrokes.push({
        key: typewriterKeyStrokeBackspace,
        delay,
      });
    }

    // Now we must calculate which chars are missing in the text now,
    // remember we have already hit backspace at this point. So if
    // the text is no 'Ma' and the new sentence is 'Maarten' we only what
    // to add 'arten'. This is what calling splice will do:
    // "Maarten".slice(2) -> 'arten';
    const missingChars =
      text.length > 0
        ? sentenceArray.slice(sentenceArray.length - backspaces)
        : sentenceArray;

    // Now we must add the missing characters one at a time.
    for (const missingChar of missingChars) {
      keystrokes.push({
        key: missingChar,
        delay,
      });
    }

    text = text.concat(missingChars);
  }

  return new Typewriter(
    {
      text: config.text,
      blinkAfter: config.blinkAfter,
      keepHistoryFor: config.keepHistoryFor,
      keystrokes,
    },
    subscriber
  );
}
