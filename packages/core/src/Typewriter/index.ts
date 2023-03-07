import { Typewriter } from './Typewriter';
import { TypewriterBlinkAfterError } from './errors/TypewriterBlinkAfterError';
import { TypewriterDelayError } from './errors/TypewriterDelayError';
import { TypewriterRepeatError } from './errors/TypewriterRepeatError';
import { TypewriterRepeatDelayError } from './errors/TypewriterRepeatDelayError';
import { TypewriterCursorOutOfBoundsError } from './errors/TypewriterCursorOutOfBoundsError';
import { TypewriterCursorNotAtSelectionEdgeError } from './errors/TypewriterCursorNotPlacedAtBoundsOfSelectionError'
import { TypewriterCursorSelectionOutOfBoundsError } from './errors/TypewriterCursorSelectionOutOfBoundsError';
import { TypewriterCursorSelectionInvalidRangeError } from './errors/TypewriterCursorSelectionInvalidRangeError';
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
  TypewriterCursorOutOfBoundsError,
  TypewriterCursorNotAtSelectionEdgeError,
  TypewriterCursorSelectionOutOfBoundsError,
  TypewriterCursorSelectionInvalidRangeError,
  TypewriterFromSentencesConfig,
  typewriterFromSentences,
};
