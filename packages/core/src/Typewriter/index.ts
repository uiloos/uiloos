import { Typewriter } from './Typewriter';
import { TypewriterCursor } from './TypewriterCursor';
import { createTypewriterSubscriber, CreateTypewriterSubscriberConfig } from './createTypewriterSubscriber';

import { TypewriterBlinkAfterError } from './errors/TypewriterBlinkAfterError';
import { TypewriterDelayError } from './errors/TypewriterDelayError';
import { TypewriterRepeatError } from './errors/TypewriterRepeatError';
import { TypewriterRepeatDelayError } from './errors/TypewriterRepeatDelayError';
import { TypewriterCursorOutOfBoundsError } from './errors/TypewriterCursorOutOfBoundsError';
import { TypewriterCursorNotAtSelectionEdgeError } from './errors/TypewriterCursorNotPlacedAtBoundsOfSelectionError'
import { TypewriterCursorSelectionOutOfBoundsError } from './errors/TypewriterCursorSelectionOutOfBoundsError';
import { TypewriterCursorSelectionInvalidRangeError } from './errors/TypewriterCursorSelectionInvalidRangeError';
import { TypewriterActionUnknownCursorError } from './errors/TypewriterActionUnknownCursorError';

import {
  TypewriterFromSentencesConfig,
  typewriterFromSentences,
} from './builders/sentences';

export * from './types';

export {
  Typewriter,
  TypewriterCursor,
  TypewriterBlinkAfterError,
  TypewriterDelayError,
  TypewriterRepeatError,
  TypewriterRepeatDelayError,
  TypewriterCursorOutOfBoundsError,
  TypewriterCursorNotAtSelectionEdgeError,
  TypewriterCursorSelectionOutOfBoundsError,
  TypewriterCursorSelectionInvalidRangeError,
  TypewriterActionUnknownCursorError,
  TypewriterFromSentencesConfig,
  typewriterFromSentences,
  createTypewriterSubscriber,
  CreateTypewriterSubscriberConfig
};
