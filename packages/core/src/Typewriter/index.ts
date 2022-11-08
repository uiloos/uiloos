import { Typewriter } from './Typewriter';
import { TypewriterBlinkAfterError } from './errors/TypewriterBlinkAfterError';
import { TypewriterDelayError } from './errors/TypewriterDelayError';
import { TypewriterRepeatError } from './errors/TypewriterRepeatError';
import { TypewriterRepeatDelayError } from './errors/TypewriterRepeatDelayError';
import { TypewriterInvalidCursorError } from './errors/TypewriterInvalidCursorError';
import {
  TypewriterFromSentencesConfig,
  typewriterFromSentences,
} from './builders/sentences';

export * from './types';

export {
  Typewriter,
  TypewriterBlinkAfterError,
  TypewriterDelayError,
  TypewriterRepeatError,
  TypewriterRepeatDelayError,
  TypewriterInvalidCursorError,
  TypewriterFromSentencesConfig,
  typewriterFromSentences,
};
