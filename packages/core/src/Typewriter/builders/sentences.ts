import { typewriterActionTypeBackspace } from '../keys';
import {
  TypewriterAction,
  TypewriterSubscriber,
} from '../types';
import { Typewriter } from '../Typewriter';

// MANUALLY SYNCHED WITH `TypewriterConfig` SO DOCS RENDER BETTER.
/**
 * The configuration for the `typewriterFromSentences` function.
 *
 * @since 1.2.0
 */
export type TypewriterFromSentencesConfig = {
  /**
   * The sentences the Typewriter should animate.
   *
   * @since 1.2.0
   */
  sentences: string[];

  /**
   * The delay in between letters, meaning the speed at which to type.
   *
   * Defaults to 50ms
   *
   * @since 1.2.0
   */
  delay?: number;

  /**
   * The delay in between sentences.
   *
   * Defaults to 2000ms
   *
   * @since 1.2.0
   */
  sentenceDelay?: number;

  /**
   * The initial text the `Typewriter` starts with.
   *
   * Defaults to '' meaning that the Typewriter will not have an
   * initial text.
   *
   * @since 1.2.0
   */
  text?: string;

  /**
   * The time it takes until a cursor starts blinking again after
   * the cursor was used.
   *
   * A cursor does not blink when it is used until after a certain
   * time. So if you keep typing the cursor does not blink, until
   * you stop typing for some "predefined amount" of time.
   *
   * The `blinkAfter` is what represents that 'predefined amount' of
   * time, you can also say this is a debounce time.
   *
   * Note: when you set the `blinkAfter` to a number lower or equal to
   * the `delay` of a `TypewriterAction`, it will negate the debounce.
   * The effect is that all "CHANGED" events will have a "BLINKING"
   * event. This might not "visually" affect your animation, but
   * will make the `Typewriter` send extra events. If this happens it
   * is technically as "misconfiguration" on your part, but the
   * Typewriter will not throw any errors, since visually nothing
   * bad happens.
   *
   * Defaults to after `250` milliseconds.
   *
   * @since 1.2.0
   */
  blinkAfter?: number;

  /**
   * For how many items the `history` may contain in the `Typewriter`.
   *
   * Defaults to `0` meaning that it will not track history.
   *
   * @since 1.2.0
   */
  keepHistoryFor?: number;

  /**
   * Whether or not the animation will immediately start playing.
   *
   * When `true` the animation will start playing immediately, when
   * `false` the animation will start when `play()` is called.
   *
   * Note: the animation will only start playing when there are
   * actions defined.
   *
   * Defaults to `true` meaning that the animation will play instantly.
   *
   * @since 1.2.0
   */
  autoPlay?: boolean;

  /**
   * Whether or not this animation repeats and how often.
   *
   * There are three ways to define `repeat`.
   *
   *  1. When `repeat` is `false` or `1` it will never repeat the
   *     animation, the animation will run only once.
   *
   *  2. When `repeat` is `true` it will repeat the animation forever.
   *
   *  3. When `repeat` is a number it will repeat the animation
   *     for given number of times. If the number is 0 or a negative
   *     number is provided a error occurs.
   *
   * Defaults to `false` meaning that the animation will run once.
   *
   * @since 1.2.0
   */
  repeat?: boolean | number;

  /**
   * The time in milliseconds the animation is paused in between
   * repeats.
   *
   * Defaults to `0` milliseconds, meaning an almost instant repeat.
   *
   * @since 1.2.0
   */
  repeatDelay?: number;
};

/**
 * Creates a Typewriter which will type in the provided sentences
 * using a single cursor.
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
 * @returns {Typewriter<void>} a configured typewriter
 * @since 1.2.0
 */
export function typewriterFromSentences(
  config: TypewriterFromSentencesConfig,
  subscriber?: TypewriterSubscriber<void>
): Typewriter<void> {
  const delay = config.delay === undefined ? 50 : config.delay;
  const sentenceDelay =
    config.sentenceDelay === undefined ? 2000 : config.sentenceDelay;

  const actions: TypewriterAction[] = [];

  // This will be the text which is manipulated.
  let text: string[] = config.text ? Array.from(config.text) : [];

  let firstSentence = true;
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
      // Only add a sentenceDelay when it is not the first sentence.
      const actualDelay = !firstSentence && i === 0 ? sentenceDelay : delay;

      actions.push({
        type: _KEYBOARD,
        text: typewriterActionTypeBackspace,
        delay: actualDelay,
        cursor: 0,
      });
    }

    // Now we must calculate which chars are missing in the text now,
    // remember we have already hit backspace at this point. So if
    // the text is no 'Ma' and the new sentence is 'Maarten' we only what
    // to add 'arten'. This is what calling splice will do:
    // "Maarten".slice(2) -> 'arten';
    const missingChars =
      text.length > 0
        ? sentenceArray.slice(charsInCommonFromStart)
        : sentenceArray;

    // Now we must add the missing characters one at a time.
    for (const missingChar of missingChars) {
      actions.push({
        type: _KEYBOARD,
        text: missingChar,
        delay,
        cursor: 0,
      });
    }

    text = text.concat(missingChars);

    firstSentence = false;
  }

  return new Typewriter<void>(
    {
      // Set the repeat delay to sentence delay this way when,
      // repeat is `true` it will match the sentence. By placing
      // the ...config below it can still be overwritten.
      repeatDelay: sentenceDelay,
      ...config,
      actions,
    },
    subscriber
  );
}

const _KEYBOARD = 'keyboard'