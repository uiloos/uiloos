import {
  Typewriter,
  TypewriterBlinkAfterError,
  TypewriterDelayError,
  TypewriterEvent,
  TypewriterEventType,
  typewriterActionTypeBackspace,
  typewriterActionTypeClearAll,
  TypewriterRepeatError,
  TypewriterRepeatDelayError,
  TypewriterCursorOutOfBoundsError,
  TypewriterCursorConfig,
  typewriterActionTypeLeft,
  typewriterActionTypeRight,
  TypewriterAction,
  typewriterActionTypeSelectLeft,
  typewriterActionTypeSelectRight,
  TypewriterCursorNotAtSelectionEdgeError,
  TypewriterCursorSelectionOutOfBoundsError,
  TypewriterCursorSelectionInvalidRangeError,
  typewriterFromSentences,
  TypewriterCursor,
  TypewriterActionUnknownCursorError,
} from '../src/Typewriter';

import { licenseChecker } from '../src/license';

import { UnsubscribeFunction } from '../src/generic/types';

describe('Typewriter', () => {
  let unsubscribe: UnsubscribeFunction | null = null;

  beforeEach(() => {
    jest.useFakeTimers();

    licenseChecker.activateLicense('fake-100', { logLicenseActivated: false });

    if (unsubscribe) {
      unsubscribe();
    }
  });

  afterEach(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });

  function autoSubscribe(typewriter: Typewriter) {
    const subscriber = jest.fn();
    unsubscribe = typewriter.subscribe(subscriber);

    return subscriber;
  }

  test('imports', () => {
    expect(TypewriterCursor).toBeDefined();
  });

  describe('constructor', () => {
    describe('errors', () => {
      describe('blinkAfter errors', () => {
        test('cannot be less than zero', () => {
          expect(() => {
            new Typewriter({ blinkAfter: -1 });
          }).toThrowError(
            'uiloos > Typewriter > blinkAfter cannot be negative or zero'
          );

          expect(() => {
            new Typewriter({ blinkAfter: -1 });
          }).toThrowError(TypewriterBlinkAfterError);
        });

        test('cannot be zero', () => {
          expect(() => {
            new Typewriter({ blinkAfter: 0 });
          }).toThrowError(
            'uiloos > Typewriter > blinkAfter cannot be negative or zero'
          );

          expect(() => {
            new Typewriter({ blinkAfter: 0 });
          }).toThrowError(TypewriterBlinkAfterError);
        });
      });

      describe('delay errors', () => {
        test('cannot be less than zero', () => {
          expect(() => {
            new Typewriter({
              actions: [
                {
                  type: 'keyboard',
                  key: 'a',
                  delay: -1,
                  cursor: 0,
                },
              ],
            });
          }).toThrowError(
            'uiloos > Typewriter > delay cannot be negative or zero'
          );

          expect(() => {
            new Typewriter({
              actions: [
                {
                  type: 'keyboard',
                  key: 'a',
                  delay: -1,
                  cursor: 0,
                },
              ],
            });
          }).toThrowError(TypewriterDelayError);

          // Middle of array
          expect(() => {
            new Typewriter({
              actions: [
                {
                  type: 'keyboard',
                  key: 'a',
                  delay: 100,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: 'b',
                  delay: -1,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: 'c',
                  delay: 100,
                  cursor: 0,
                },
              ],
            });
          }).toThrowError(TypewriterDelayError);

          // End of array
          expect(() => {
            new Typewriter({
              actions: [
                {
                  type: 'keyboard',
                  key: 'a',
                  delay: 100,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: 'b',
                  delay: 100,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: 'c',
                  delay: -1,
                  cursor: 0,
                },
              ],
            });
          }).toThrowError(TypewriterDelayError);
        });

        test('cannot be zero', () => {
          expect(() => {
            new Typewriter({
              actions: [
                {
                  type: 'keyboard',
                  key: 'a',
                  delay: 0,
                  cursor: 0,
                },
              ],
            });
          }).toThrowError(
            'uiloos > Typewriter > delay cannot be negative or zero'
          );

          expect(() => {
            new Typewriter({
              actions: [
                {
                  type: 'keyboard',
                  key: 'a',
                  delay: 0,
                  cursor: 0,
                },
              ],
            });
          }).toThrowError(TypewriterDelayError);

          // Middle of array
          expect(() => {
            new Typewriter({
              actions: [
                {
                  type: 'keyboard',
                  key: 'a',
                  delay: 100,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: 'b',
                  delay: 0,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: 'c',
                  delay: 100,
                  cursor: 0,
                },
              ],
            });
          }).toThrowError(TypewriterDelayError);

          // End of array
          expect(() => {
            new Typewriter({
              actions: [
                {
                  type: 'keyboard',
                  key: 'a',
                  delay: 100,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: 'b',
                  delay: 100,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: 'c',
                  delay: 0,
                  cursor: 0,
                },
              ],
            });
          }).toThrowError(TypewriterDelayError);
        });
      });

      describe('repeat errors', () => {
        test('cannot be less than zero', () => {
          expect(() => {
            new Typewriter({
              repeat: -1,
            });
          }).toThrowError(
            'uiloos > Typewriter > repeat cannot be negative or zero'
          );

          expect(() => {
            new Typewriter({
              repeat: -1,
            });
          }).toThrowError(TypewriterRepeatError);
        });

        test('cannot be zero', () => {
          expect(() => {
            new Typewriter({
              repeat: 0,
            });
          }).toThrowError(
            'uiloos > Typewriter > repeat cannot be negative or zero'
          );

          expect(() => {
            new Typewriter({
              repeat: 0,
            });
          }).toThrowError(TypewriterRepeatError);
        });
      });

      describe('repeatDelay errors', () => {
        test('cannot be less than zero', () => {
          expect(() => {
            new Typewriter({
              repeatDelay: -1,
            });
          }).toThrowError(
            'uiloos > Typewriter > repeatDelay cannot be a negative number'
          );

          expect(() => {
            new Typewriter({
              repeatDelay: -1,
            });
          }).toThrowError(TypewriterRepeatDelayError);
        });
      });

      describe('action cursor unknown errors', () => {
        test('must use known cursor', () => {
          expect(() => {
            new Typewriter({
              text: 'abc',
              cursors: [],
              actions: [
                {
                  type: 'keyboard',
                  cursor: 1,
                  key: 'a',
                  delay: 50,
                },
              ],
            });
          }).toThrowError(
            'uiloos > Typewriter > action uses an unknown cursor'
          );

          expect(() => {
            new Typewriter({
              text: 'abc',
              cursors: [],
              actions: [
                {
                  type: 'keyboard',
                  cursor: 1,
                  key: 'a',
                  delay: 50,
                },
              ],
            });
          }).toThrowError(TypewriterActionUnknownCursorError);

          // Now with -1

          expect(() => {
            new Typewriter({
              text: 'abc',
              cursors: [],
              actions: [
                {
                  type: 'keyboard',
                  cursor: -1,
                  key: 'a',
                  delay: 50,
                },
              ],
            });
          }).toThrowError(
            'uiloos > Typewriter > action uses an unknown cursor'
          );

          expect(() => {
            new Typewriter({
              text: 'abc',
              cursors: [],
              actions: [
                {
                  type: 'keyboard',
                  cursor: -1,
                  key: 'a',
                  delay: 50,
                },
              ],
            });
          }).toThrowError(TypewriterActionUnknownCursorError);
        });
      });

      describe('cursor position errors', () => {
        test('cannot be less than zero', () => {
          expect(() => {
            new Typewriter({
              text: 'abc',
              cursors: [
                { position: -1, name: '' },
                { position: 2, name: '' },
                { position: 3, name: '' },
              ],
            });
          }).toThrowError('uiloos > Typewriter > cursor is out of bounds');

          expect(() => {
            new Typewriter({
              text: 'abc',
              cursors: [
                { position: -1, name: '' },
                { position: 2, name: '' },
                { position: 3, name: '' },
              ],
            });
          }).toThrowError(TypewriterCursorOutOfBoundsError);

          // Middle of array
          expect(() => {
            new Typewriter({
              text: 'abc',
              cursors: [
                { position: 1, name: '' },
                { position: -1, name: '' },
                { position: 2, name: '' },
              ],
            });
          }).toThrowError(TypewriterCursorOutOfBoundsError);

          // End of array
          expect(() => {
            new Typewriter({
              text: 'abc',
              cursors: [
                { position: 2, name: '' },
                { position: 0, name: '' },
                { position: -1, name: '' },
              ],
            });
          }).toThrowError(TypewriterCursorOutOfBoundsError);
        });

        test('cannot be more than length of text', () => {
          expect(() => {
            new Typewriter({
              text: 'abc',
              cursors: [
                { position: 4, name: '' },
                { position: 0, name: '' },
                { position: 1, name: '' },
              ],
            });
          }).toThrowError('uiloos > Typewriter > cursor is out of bounds');

          expect(() => {
            new Typewriter({
              text: 'abc',
              cursors: [
                { position: 4, name: '' },
                { position: 0, name: '' },
                { position: 1, name: '' },
              ],
            });
          }).toThrowError(TypewriterCursorOutOfBoundsError);

          // Middle of array
          expect(() => {
            new Typewriter({
              text: 'abc',
              cursors: [
                { position: 1, name: '' },
                { position: 4, name: '' },
                { position: 2, name: '' },
              ],
            });
          }).toThrowError(TypewriterCursorOutOfBoundsError);

          // End of array
          expect(() => {
            new Typewriter({
              text: 'abc',
              cursors: [
                { position: 2, name: '' },
                { position: 0, name: '' },
                { position: 4, name: '' },
              ],
            });
          }).toThrowError(TypewriterCursorOutOfBoundsError);
        });
      });

      describe('selection errors', () => {
        test('cursor must be placed on edges of selection', () => {
          expect(() => {
            new Typewriter({
              text: 'abc',
              cursors: [
                { position: 0, name: '', selection: { start: 2, end: 3 } },
                { position: 2, name: '' },
                { position: 3, name: '' },
              ],
            });
          }).toThrowError(
            'uiloos > Typewriter > cursor is not placed on edges of selection'
          );

          expect(() => {
            new Typewriter({
              text: 'abc',
              cursors: [
                { position: 0, name: '', selection: { start: 2, end: 3 } },
                { position: 2, name: '' },
                { position: 3, name: '' },
              ],
            });
          }).toThrowError(TypewriterCursorNotAtSelectionEdgeError);

          // Middle of array
          expect(() => {
            new Typewriter({
              text: 'abc',
              cursors: [
                { position: 1, name: '' },
                { position: 3, name: '', selection: { start: 1, end: 2 } },
                { position: 2, name: '' },
              ],
            });
          }).toThrowError(TypewriterCursorNotAtSelectionEdgeError);

          // End of array
          expect(() => {
            new Typewriter({
              text: 'abc',
              cursors: [
                { position: 2, name: '' },
                { position: 0, name: '' },
                { position: 0, name: '', selection: { start: 1, end: 2 } },
              ],
            });
          }).toThrowError(TypewriterCursorNotAtSelectionEdgeError);
        });

        test('selection start cannot be less than zero', () => {
          expect(() => {
            new Typewriter({
              text: 'abc',
              cursors: [
                { position: 3, name: '', selection: { start: -1, end: 3 } },
                { position: 2, name: '' },
                { position: 3, name: '' },
              ],
            });
          }).toThrowError(
            'uiloos > Typewriter > cursor selection start is out of bounds'
          );

          expect(() => {
            new Typewriter({
              text: 'abc',
              cursors: [
                { position: 3, name: '', selection: { start: -1, end: 3 } },
                { position: 2, name: '' },
                { position: 3, name: '' },
              ],
            });
          }).toThrowError(TypewriterCursorSelectionOutOfBoundsError);

          // Middle of array
          expect(() => {
            new Typewriter({
              text: 'abc',
              cursors: [
                { position: 1, name: '' },
                { position: 3, name: '', selection: { start: -1, end: 3 } },
                { position: 2, name: '' },
              ],
            });
          }).toThrowError(TypewriterCursorSelectionOutOfBoundsError);

          // End of array
          expect(() => {
            new Typewriter({
              text: 'abc',
              cursors: [
                { position: 2, name: '' },
                { position: 0, name: '' },
                { position: 1, name: '', selection: { start: -1, end: 1 } },
              ],
            });
          }).toThrowError(TypewriterCursorSelectionOutOfBoundsError);
        });

        test('selection end cannot be more than length of text', () => {
          expect(() => {
            new Typewriter({
              text: 'abc',
              cursors: [
                { position: 0, name: '', selection: { start: 0, end: 4 } },
                { position: 2, name: '' },
                { position: 3, name: '' },
              ],
            });
          }).toThrowError(
            'uiloos > Typewriter > cursor selection end is out of bounds'
          );

          expect(() => {
            new Typewriter({
              text: 'abc',
              cursors: [
                { position: 0, name: '', selection: { start: 0, end: 4 } },
                { position: 2, name: '' },
                { position: 3, name: '' },
              ],
            });
          }).toThrowError(TypewriterCursorSelectionOutOfBoundsError);

          // Middle of array
          expect(() => {
            new Typewriter({
              text: 'abc',
              cursors: [
                { position: 1, name: '' },
                { position: 3, name: '', selection: { start: 3, end: 4 } },
                { position: 2, name: '' },
              ],
            });
          }).toThrowError(TypewriterCursorSelectionOutOfBoundsError);

          // End of array
          expect(() => {
            new Typewriter({
              text: 'abc',
              cursors: [
                { position: 2, name: '' },
                { position: 0, name: '' },
                { position: 0, name: '', selection: { start: 0, end: 4 } },
              ],
            });
          }).toThrowError(TypewriterCursorSelectionOutOfBoundsError);
        });

        test('selection start must be before end', () => {
          expect(() => {
            new Typewriter({
              text: 'abc',
              cursors: [
                { position: 1, name: '', selection: { start: 2, end: 1 } },
                { position: 2, name: '' },
                { position: 3, name: '' },
              ],
            });
          }).toThrowError(
            'uiloos > Typewriter > cursors selection has an invalid range: start is equal or larger than the end'
          );

          expect(() => {
            new Typewriter({
              text: 'abc',
              cursors: [
                { position: 1, name: '', selection: { start: 2, end: 1 } },
                { position: 2, name: '' },
                { position: 3, name: '' },
              ],
            });
          }).toThrowError(TypewriterCursorSelectionInvalidRangeError);

          // Middle of array
          expect(() => {
            new Typewriter({
              text: 'abc',
              cursors: [
                { position: 1, name: '' },
                { position: 1, name: '', selection: { start: 3, end: 1 } },
                { position: 2, name: '' },
              ],
            });
          }).toThrowError(TypewriterCursorSelectionInvalidRangeError);

          // End of array
          expect(() => {
            new Typewriter({
              text: 'abc',
              cursors: [
                { position: 2, name: '' },
                { position: 0, name: '' },
                { position: 2, name: '', selection: { start: 3, end: 2 } },
              ],
            });
          }).toThrowError(TypewriterCursorSelectionInvalidRangeError);
        });
      });
    });

    test('with a config it should initialize with configured values', () => {
      const typewriter: Typewriter = new Typewriter({
        text: 'aap',
        blinkAfter: 1337,
        actions: [
          { type: 'keyboard', key: 'a', delay: 999, cursor: 0 },

          { type: 'keyboard', key: 'a', delay: 999, cursor: 2 },

          { type: 'keyboard', key: 'a', delay: 999, cursor: 1 },

          { type: 'keyboard', key: 'b', delay: 999, cursor: 0 },

          { type: 'keyboard', key: 'b', delay: 999, cursor: 2 },

          { type: 'keyboard', key: 'b', delay: 999, cursor: 1 },

          { type: 'keyboard', key: 'c', delay: 999, cursor: 0 },

          { type: 'keyboard', key: 'c', delay: 999, cursor: 2 },

          { type: 'keyboard', key: 'c', delay: 999, cursor: 1 },
        ],
        keepHistoryFor: 1,
        repeat: 1337,
        repeatDelay: 666,
        cursors: [
          { position: 0, name: 'Tosca' },
          { position: 1, name: 'Owen' },
          { position: 0, name: 'Jane' },
        ],
      });

      const subscriber = jest.fn();
      unsubscribe = typewriter.subscribe(subscriber);

      assertState(typewriter, {
        history: [
          expect.objectContaining({
            type: 'INITIALIZED',
          }),
        ],
        actions: [
          { type: 'keyboard', key: 'a', delay: 999, cursor: 0 },

          { type: 'keyboard', key: 'a', delay: 999, cursor: 2 },

          { type: 'keyboard', key: 'a', delay: 999, cursor: 1 },

          { type: 'keyboard', key: 'b', delay: 999, cursor: 0 },

          { type: 'keyboard', key: 'b', delay: 999, cursor: 2 },

          { type: 'keyboard', key: 'b', delay: 999, cursor: 1 },

          { type: 'keyboard', key: 'c', delay: 999, cursor: 0 },

          { type: 'keyboard', key: 'c', delay: 999, cursor: 2 },

          { type: 'keyboard', key: 'c', delay: 999, cursor: 1 },
        ],
        cursors: [
          { position: 0, name: 'Tosca', isBlinking: true },
          { position: 1, name: 'Owen', isBlinking: true },
          { position: 0, name: 'Jane', isBlinking: true },
        ],
        text: 'aap',
        blinkAfter: 1337,
        isPlaying: true,
        isFinished: false,
        hasBeenStoppedBefore: false,
        repeat: 1337,
        repeatDelay: 666,
      });

      expect(subscriber).toHaveBeenCalledTimes(0);
    });

    test('cursor should start at end of text by default', () => {
      const typewriter: Typewriter = new Typewriter({
        text: 'aap',
      });

      const subscriber = jest.fn();
      unsubscribe = typewriter.subscribe(subscriber);

      expect(typewriter.cursors.length).toBe(1);
      assertCursor(typewriter.cursors[0], {
        position: 3,
        name: '',
        isBlinking: true,
      });

      expect(subscriber).toHaveBeenCalledTimes(0);
    });

    test('without a config it should be empty', () => {
      const typewriter: Typewriter = new Typewriter();

      const subscriber = jest.fn();
      unsubscribe = typewriter.subscribe(subscriber);

      assertState(typewriter, {
        history: [],
        actions: [],
        cursors: [{ position: 0, name: '', isBlinking: true }],
        text: '',
        blinkAfter: 250,
        isPlaying: false,
        isFinished: false,
        hasBeenStoppedBefore: false,
        repeat: false,
        repeatDelay: 0,
      });

      expect(subscriber).toHaveBeenCalledTimes(0);
    });

    test('with initial subscriber', () => {
      const subscriber = jest.fn();
      const typewriter = new Typewriter({}, subscriber);

      unsubscribe = () => {
        typewriter.unsubscribe(subscriber);
      };

      assertState(typewriter, {
        history: [],
        actions: [],
        cursors: [{ position: 0, name: '', isBlinking: true }],
        text: '',
        blinkAfter: 250,
        isPlaying: false,
        isFinished: false,
        hasBeenStoppedBefore: false,
        repeat: false,
        repeatDelay: 0,
      });

      expect(subscriber).toHaveBeenCalledTimes(1);
      expect(subscriber).toHaveBeenCalledWith(
        typewriter,
        expect.objectContaining({
          type: 'INITIALIZED',
        })
      );
    });

    test('without config but with initial subscriber', () => {
      const subscriber = jest.fn();
      const typewriter = new Typewriter(undefined, subscriber);

      unsubscribe = () => {
        typewriter.unsubscribe(subscriber);
      };

      assertState(typewriter, {
        history: [],
        actions: [],
        cursors: [{ position: 0, name: '', isBlinking: true }],
        text: '',
        blinkAfter: 250,
        isPlaying: false,
        isFinished: false,
        hasBeenStoppedBefore: false,
        repeat: false,
        repeatDelay: 0,
      });

      expect(subscriber).toHaveBeenCalledTimes(1);
      expect(subscriber).toHaveBeenCalledWith(
        typewriter,
        expect.objectContaining({
          type: 'INITIALIZED',
        })
      );
    });
  });

  describe('initialize', () => {
    describe('errors', () => {
      describe('blinkAfter errors', () => {
        test('cannot be less than zero', () => {
          const typewriter = new Typewriter();
          const subscriber = autoSubscribe(typewriter);

          expect(() => {
            typewriter.initialize({ blinkAfter: -1 });
          }).toThrowError(
            'uiloos > Typewriter > blinkAfter cannot be negative or zero'
          );

          expect(() => {
            typewriter.initialize({ blinkAfter: -1 });
          }).toThrowError(TypewriterBlinkAfterError);

          expect(subscriber).toBeCalledTimes(0);
        });

        test('cannot be zero', () => {
          const typewriter = new Typewriter();
          const subscriber = autoSubscribe(typewriter);

          expect(() => {
            typewriter.initialize({ blinkAfter: 0 });
          }).toThrowError(
            'uiloos > Typewriter > blinkAfter cannot be negative or zero'
          );

          expect(() => {
            typewriter.initialize({ blinkAfter: 0 });
          }).toThrowError(TypewriterBlinkAfterError);

          expect(subscriber).toBeCalledTimes(0);
        });
      });

      describe('delay errors', () => {
        test('cannot be less than zero', () => {
          const typewriter = new Typewriter();
          const subscriber = autoSubscribe(typewriter);

          expect(() => {
            typewriter.initialize({
              actions: [
                {
                  type: 'keyboard',
                  key: 'a',
                  delay: -1,
                  cursor: 0,
                },
              ],
            });
          }).toThrowError(
            'uiloos > Typewriter > delay cannot be negative or zero'
          );

          expect(() => {
            typewriter.initialize({
              actions: [
                {
                  type: 'keyboard',
                  key: 'a',
                  delay: -1,
                  cursor: 0,
                },
              ],
            });
          }).toThrowError(TypewriterDelayError);

          // Middle of array
          expect(() => {
            typewriter.initialize({
              actions: [
                {
                  type: 'keyboard',
                  key: 'a',
                  delay: 100,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: 'b',
                  delay: -1,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: 'c',
                  delay: 100,
                  cursor: 0,
                },
              ],
            });
          }).toThrowError(TypewriterDelayError);

          // End of array
          expect(() => {
            typewriter.initialize({
              actions: [
                {
                  type: 'keyboard',
                  key: 'a',
                  delay: 100,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: 'b',
                  delay: 100,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: 'c',
                  delay: -1,
                  cursor: 0,
                },
              ],
            });
          }).toThrowError(TypewriterDelayError);

          expect(subscriber).toBeCalledTimes(0);
        });

        test('cannot be zero', () => {
          const typewriter = new Typewriter();
          const subscriber = autoSubscribe(typewriter);

          expect(() => {
            typewriter.initialize({
              actions: [
                {
                  type: 'keyboard',
                  key: 'a',
                  delay: 0,
                  cursor: 0,
                },
              ],
            });
          }).toThrowError(
            'uiloos > Typewriter > delay cannot be negative or zero'
          );

          expect(() => {
            typewriter.initialize({
              actions: [
                {
                  type: 'keyboard',
                  key: 'a',
                  delay: 0,
                  cursor: 0,
                },
              ],
            });
          }).toThrowError(TypewriterDelayError);

          // Middle of array
          expect(() => {
            typewriter.initialize({
              actions: [
                {
                  type: 'keyboard',
                  key: 'a',
                  delay: 100,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: 'b',
                  delay: 0,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: 'c',
                  delay: 100,
                  cursor: 0,
                },
              ],
            });
          }).toThrowError(TypewriterDelayError);

          // End of array
          expect(() => {
            typewriter.initialize({
              actions: [
                {
                  type: 'keyboard',
                  key: 'a',
                  delay: 100,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: 'b',
                  delay: 100,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: 'c',
                  delay: 0,
                  cursor: 0,
                },
              ],
            });
          }).toThrowError(TypewriterDelayError);

          expect(subscriber).toBeCalledTimes(0);
        });
      });

      describe('repeat errors', () => {
        test('cannot be less than zero', () => {
          const typewriter = new Typewriter();
          const subscriber = autoSubscribe(typewriter);

          expect(() => {
            typewriter.initialize({
              repeat: -1,
            });
          }).toThrowError(
            'uiloos > Typewriter > repeat cannot be negative or zero'
          );

          expect(() => {
            typewriter.initialize({
              repeat: -1,
            });
          }).toThrowError(TypewriterRepeatError);

          expect(subscriber).toBeCalledTimes(0);
        });

        test('cannot be zero', () => {
          const typewriter = new Typewriter();
          const subscriber = autoSubscribe(typewriter);

          expect(() => {
            typewriter.initialize({
              repeat: 0,
            });
          }).toThrowError(
            'uiloos > Typewriter > repeat cannot be negative or zero'
          );

          expect(() => {
            typewriter.initialize({
              repeat: 0,
            });
          }).toThrowError(TypewriterRepeatError);

          expect(subscriber).toBeCalledTimes(0);
        });
      });

      describe('repeatDelay errors', () => {
        test('cannot be less than zero', () => {
          const typewriter = new Typewriter();
          const subscriber = autoSubscribe(typewriter);

          expect(() => {
            typewriter.initialize({
              repeatDelay: -1,
            });
          }).toThrowError(
            'uiloos > Typewriter > repeatDelay cannot be a negative number'
          );

          expect(() => {
            typewriter.initialize({
              repeatDelay: -1,
            });
          }).toThrowError(TypewriterRepeatDelayError);

          expect(subscriber).toBeCalledTimes(0);
        });
      });

      describe('action cursor unknown errors', () => {
        test('must use known cursor', () => {
          const typewriter = new Typewriter();
          const subscriber = autoSubscribe(typewriter);

          expect(() => {
            typewriter.initialize({
              text: 'abc',
              cursors: [],
              actions: [
                {
                  type: 'keyboard',
                  cursor: 1,
                  key: 'a',
                  delay: 50,
                },
              ],
            });
          }).toThrowError(
            'uiloos > Typewriter > action uses an unknown cursor'
          );

          expect(() => {
            typewriter.initialize({
              text: 'abc',
              cursors: [],
              actions: [
                {
                  type: 'keyboard',
                  cursor: 1,
                  key: 'a',
                  delay: 50,
                },
              ],
            });
          }).toThrowError(TypewriterActionUnknownCursorError);

          // Now with -1

          expect(() => {
            typewriter.initialize({
              text: 'abc',
              cursors: [],
              actions: [
                {
                  type: 'keyboard',
                  cursor: -1,
                  key: 'a',
                  delay: 50,
                },
              ],
            });
          }).toThrowError(
            'uiloos > Typewriter > action uses an unknown cursor'
          );

          expect(() => {
            typewriter.initialize({
              text: 'abc',
              cursors: [],
              actions: [
                {
                  type: 'keyboard',
                  cursor: -1,
                  key: 'a',
                  delay: 50,
                },
              ],
            });
          }).toThrowError(TypewriterActionUnknownCursorError);

          expect(subscriber).toBeCalledTimes(0);
        });
      });

      describe('cursor position errors', () => {
        test('cannot be less than zero', () => {
          const typewriter = new Typewriter();
          const subscriber = autoSubscribe(typewriter);

          expect(() => {
            typewriter.initialize({
              text: 'abc',
              cursors: [
                { position: -1, name: '' },
                { position: 2, name: '' },
                { position: 3, name: '' },
              ],
            });
          }).toThrowError('uiloos > Typewriter > cursor is out of bounds');

          expect(() => {
            typewriter.initialize({
              text: 'abc',
              cursors: [
                { position: -1, name: '' },
                { position: 2, name: '' },
                { position: 3, name: '' },
              ],
            });
          }).toThrowError(TypewriterCursorOutOfBoundsError);

          // Middle of array
          expect(() => {
            typewriter.initialize({
              text: 'abc',
              cursors: [
                { position: 1, name: '' },
                { position: -1, name: '' },
                { position: 2, name: '' },
              ],
            });
          }).toThrowError(TypewriterCursorOutOfBoundsError);

          // End of array
          expect(() => {
            typewriter.initialize({
              text: 'abc',
              cursors: [
                { position: 2, name: '' },
                { position: 0, name: '' },
                { position: -1, name: '' },
              ],
            });
          }).toThrowError(TypewriterCursorOutOfBoundsError);

          expect(subscriber).toBeCalledTimes(0);
        });

        test('cannot be more than length of text', () => {
          const typewriter = new Typewriter();
          const subscriber = autoSubscribe(typewriter);

          expect(() => {
            typewriter.initialize({
              text: 'abc',
              cursors: [
                { position: 4, name: '' },
                { position: 0, name: '' },
                { position: 1, name: '' },
              ],
            });
          }).toThrowError('uiloos > Typewriter > cursor is out of bounds');

          expect(() => {
            typewriter.initialize({
              text: 'abc',
              cursors: [
                { position: 4, name: '' },
                { position: 0, name: '' },
                { position: 1, name: '' },
              ],
            });
          }).toThrowError(TypewriterCursorOutOfBoundsError);

          // Middle of array
          expect(() => {
            typewriter.initialize({
              text: 'abc',
              cursors: [
                { position: 1, name: '' },
                { position: 4, name: '' },
                { position: 2, name: '' },
              ],
            });
          }).toThrowError(TypewriterCursorOutOfBoundsError);

          // End of array
          expect(() => {
            typewriter.initialize({
              text: 'abc',
              cursors: [
                { position: 2, name: '' },
                { position: 0, name: '' },
                { position: 4, name: '' },
              ],
            });
          }).toThrowError(TypewriterCursorOutOfBoundsError);

          expect(subscriber).toBeCalledTimes(0);
        });
      });

      describe('selection errors', () => {
        test('cursor must be placed on edges of selection', () => {
          const typewriter = new Typewriter();
          const subscriber = autoSubscribe(typewriter);

          expect(() => {
            typewriter.initialize({
              text: 'abc',
              cursors: [
                { position: 0, name: '', selection: { start: 2, end: 3 } },
                { position: 2, name: '' },
                { position: 3, name: '' },
              ],
            });
          }).toThrowError(
            'uiloos > Typewriter > cursor is not placed on edges of selection'
          );

          expect(() => {
            typewriter.initialize({
              text: 'abc',
              cursors: [
                { position: 0, name: '', selection: { start: 2, end: 3 } },
                { position: 2, name: '' },
                { position: 3, name: '' },
              ],
            });
          }).toThrowError(TypewriterCursorNotAtSelectionEdgeError);

          // Middle of array
          expect(() => {
            typewriter.initialize({
              text: 'abc',
              cursors: [
                { position: 1, name: '' },
                { position: 3, name: '', selection: { start: 1, end: 2 } },
                { position: 2, name: '' },
              ],
            });
          }).toThrowError(TypewriterCursorNotAtSelectionEdgeError);

          // End of array
          expect(() => {
            typewriter.initialize({
              text: 'abc',
              cursors: [
                { position: 2, name: '' },
                { position: 0, name: '' },
                { position: 0, name: '', selection: { start: 1, end: 2 } },
              ],
            });
          }).toThrowError(TypewriterCursorNotAtSelectionEdgeError);

          expect(subscriber).toBeCalledTimes(0);
        });

        test('selection start cannot be less than zero', () => {
          const typewriter = new Typewriter();
          const subscriber = autoSubscribe(typewriter);

          expect(() => {
            typewriter.initialize({
              text: 'abc',
              cursors: [
                { position: 3, name: '', selection: { start: -1, end: 3 } },
                { position: 2, name: '' },
                { position: 3, name: '' },
              ],
            });
          }).toThrowError(
            'uiloos > Typewriter > cursor selection start is out of bounds'
          );

          expect(() => {
            typewriter.initialize({
              text: 'abc',
              cursors: [
                { position: 3, name: '', selection: { start: -1, end: 3 } },
                { position: 2, name: '' },
                { position: 3, name: '' },
              ],
            });
          }).toThrowError(TypewriterCursorSelectionOutOfBoundsError);

          // Middle of array
          expect(() => {
            typewriter.initialize({
              text: 'abc',
              cursors: [
                { position: 1, name: '' },
                { position: 3, name: '', selection: { start: -1, end: 3 } },
                { position: 2, name: '' },
              ],
            });
          }).toThrowError(TypewriterCursorSelectionOutOfBoundsError);

          // End of array
          expect(() => {
            typewriter.initialize({
              text: 'abc',
              cursors: [
                { position: 2, name: '' },
                { position: 0, name: '' },
                { position: 1, name: '', selection: { start: -1, end: 1 } },
              ],
            });
          }).toThrowError(TypewriterCursorSelectionOutOfBoundsError);

          expect(subscriber).toBeCalledTimes(0);
        });

        test('selection end cannot be more than length of text', () => {
          const typewriter = new Typewriter();
          const subscriber = autoSubscribe(typewriter);

          expect(() => {
            typewriter.initialize({
              text: 'abc',
              cursors: [
                { position: 0, name: '', selection: { start: 0, end: 4 } },
                { position: 2, name: '' },
                { position: 3, name: '' },
              ],
            });
          }).toThrowError(
            'uiloos > Typewriter > cursor selection end is out of bounds'
          );

          expect(() => {
            typewriter.initialize({
              text: 'abc',
              cursors: [
                { position: 0, name: '', selection: { start: 0, end: 4 } },
                { position: 2, name: '' },
                { position: 3, name: '' },
              ],
            });
          }).toThrowError(TypewriterCursorSelectionOutOfBoundsError);

          // Middle of array
          expect(() => {
            typewriter.initialize({
              text: 'abc',
              cursors: [
                { position: 1, name: '' },
                { position: 3, name: '', selection: { start: 3, end: 4 } },
                { position: 2, name: '' },
              ],
            });
          }).toThrowError(TypewriterCursorSelectionOutOfBoundsError);

          // End of array
          expect(() => {
            typewriter.initialize({
              text: 'abc',
              cursors: [
                { position: 2, name: '' },
                { position: 0, name: '' },
                { position: 0, name: '', selection: { start: 0, end: 4 } },
              ],
            });
          }).toThrowError(TypewriterCursorSelectionOutOfBoundsError);

          expect(subscriber).toBeCalledTimes(0);
        });

        test('selection start must be before end', () => {
          const typewriter = new Typewriter();
          const subscriber = autoSubscribe(typewriter);

          expect(() => {
            typewriter.initialize({
              text: 'abc',
              cursors: [
                { position: 1, name: '', selection: { start: 2, end: 1 } },
                { position: 2, name: '' },
                { position: 3, name: '' },
              ],
            });
          }).toThrowError(
            'uiloos > Typewriter > cursors selection has an invalid range: start is equal or larger than the end'
          );

          expect(() => {
            typewriter.initialize({
              text: 'abc',
              cursors: [
                { position: 1, name: '', selection: { start: 2, end: 1 } },
                { position: 2, name: '' },
                { position: 3, name: '' },
              ],
            });
          }).toThrowError(TypewriterCursorSelectionInvalidRangeError);

          // Middle of array
          expect(() => {
            typewriter.initialize({
              text: 'abc',
              cursors: [
                { position: 1, name: '' },
                { position: 1, name: '', selection: { start: 3, end: 1 } },
                { position: 2, name: '' },
              ],
            });
          }).toThrowError(TypewriterCursorSelectionInvalidRangeError);

          // End of array
          expect(() => {
            typewriter.initialize({
              text: 'abc',
              cursors: [
                { position: 2, name: '' },
                { position: 0, name: '' },
                { position: 2, name: '', selection: { start: 3, end: 2 } },
              ],
            });
          }).toThrowError(TypewriterCursorSelectionInvalidRangeError);

          expect(subscriber).toBeCalledTimes(0);
        });
      });
    });

    describe('reset behavior', () => {
      test('that initialize can reset the Typewriter', () => {
        const typewriter: Typewriter = new Typewriter({
          text: 'aap',
          blinkAfter: 1337,
          actions: [{ type: 'keyboard', key: '', delay: 999, cursor: 0 }],
          keepHistoryFor: 1,
        });

        const subscriber = autoSubscribe(typewriter);

        typewriter.initialize({
          keepHistoryFor: 0,
        });

        assertLastSubscriber(
          subscriber,
          {
            history: [],
            actions: [],
            cursors: [{ position: 0, name: '', isBlinking: true }],
            text: '',
            blinkAfter: 250,
            isPlaying: false,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          },
          {
            type: 'INITIALIZED',
            time: new Date(),
          }
        );
      });

      it('should reset the animation timeout', () => {
        const typewriter: Typewriter = new Typewriter({
          actions: [
            { type: 'keyboard', key: 'a', delay: 100, cursor: 0 },

            { type: 'keyboard', key: 'b', delay: 100, cursor: 0 },
          ],
        });

        jest.advanceTimersByTime(100);

        expect(typewriter.text).toBe('a');

        // Just before the timer hits do an initialize
        typewriter.initialize({});

        // It should not trigger
        jest.advanceTimersByTime(1);
        expect(typewriter.text).toBe('');

        // Not even after a very long time
        jest.advanceTimersByTime(5000);
        expect(typewriter.text).toBe('');
      });

      it('should reset the blinking timeout', () => {
        const typewriter: Typewriter = new Typewriter({
          blinkAfter: 50,
          actions: [
            { type: 'keyboard', key: 'a', delay: 100, cursor: 0 },
            { type: 'keyboard', key: 'b', delay: 100, cursor: 0 },
          ],
        });

        const subscriber = autoSubscribe(typewriter);

        expect(typewriter.cursors[0].isBlinking).toBe(true);
        expect(typewriter.text).toBe('');
        assertEvents(subscriber, []);

        jest.advanceTimersByTime(100);

        expect(typewriter.cursors[0].isBlinking).toBe(false);
        expect(typewriter.text).toBe('a');
        assertEvents(subscriber, ['CHANGED']);

        // Move it to just before the blink.
        jest.advanceTimersByTime(49);
        expect(typewriter.cursors[0].isBlinking).toBe(false);
        expect(typewriter.text).toBe('a');
        assertEvents(subscriber, ['CHANGED']);

        // But then hits it with an initialize
        typewriter.initialize({
          actions: [
            { type: 'keyboard', key: 'c', delay: 100, cursor: 0 },
            { type: 'keyboard', key: 'd', delay: 100, cursor: 0 },
          ],
        });
        expect(typewriter.cursors[0].isBlinking).toBe(true);
        expect(typewriter.text).toBe('');
        assertEvents(subscriber, ['CHANGED', 'INITIALIZED']);

        // Push it to over the blink if it where still active, nothing
        // should happen.
        jest.advanceTimersByTime(1);
        expect(typewriter.cursors[0].isBlinking).toBe(true);
        expect(typewriter.text).toBe('');
        assertEvents(subscriber, ['CHANGED', 'INITIALIZED']);

        // Check that the next event is 'CHANGED'.
        jest.advanceTimersByTime(99);
        expect(typewriter.cursors[0].isBlinking).toBe(false);
        expect(typewriter.text).toBe('c');
        assertEvents(subscriber, ['CHANGED', 'INITIALIZED', 'CHANGED']);
      });

      it('should reset finished to false', () => {
        const typewriter: Typewriter = new Typewriter({
          blinkAfter: 50,
          actions: [
            { type: 'keyboard', key: 'a', delay: 100, cursor: 0 },
          ],
        });

        const subscriber = autoSubscribe(typewriter);

        expect(typewriter.isFinished).toBe(false);
        assertEvents(subscriber, []);

        jest.advanceTimersByTime(100);

        expect(typewriter.isFinished).toBe(true);
        assertEvents(subscriber, ['FINISHED']);

        // Now re-initialize, should set it to false, even with no 
        // actions.
        typewriter.initialize({
          actions: [],
        });
        
        expect(typewriter.isFinished).toBe(false);
        assertEvents(subscriber, ['FINISHED', 'INITIALIZED']);
      });
    });

    describe('autoPlay', () => {
      it('should start playing automatically when there are actions configured and autoPlay is undefined', () => {
        const typewriter = new Typewriter();

        typewriter.initialize({
          actions: [
            {
              type: 'keyboard',
              key: 'a',
              delay: 100,
              cursor: 0,
            },
            {
              type: 'keyboard',
              key: 'b',
              delay: 100,
              cursor: 0,
            },
            {
              type: 'keyboard',
              key: 'c',
              delay: 100,
              cursor: 0,
            },
          ],
        });

        // After 100 milliseconds it should now be 'a'
        jest.advanceTimersByTime(100);

        expect(typewriter.isPlaying).toBe(true);
        expect(typewriter.cursors[0].isBlinking).toBe(false);
        expect(typewriter.text).toBe('a');
      });

      it('should start playing automatically when there are actions configured and autoPlay is true', () => {
        const typewriter = new Typewriter();

        typewriter.initialize({
          autoPlay: true,
          actions: [
            {
              type: 'keyboard',
              key: 'a',
              delay: 100,
              cursor: 0,
            },
            {
              type: 'keyboard',
              key: 'b',
              delay: 100,
              cursor: 0,
            },
            {
              type: 'keyboard',
              key: 'c',
              delay: 100,
              cursor: 0,
            },
          ],
        });

        // After 100 milliseconds it should now be 'a'
        jest.advanceTimersByTime(100);

        expect(typewriter.isPlaying).toBe(true);
        expect(typewriter.cursors[0].isBlinking).toBe(false);
        expect(typewriter.text).toBe('a');
      });

      it('should not start playing automatically when there are actions configured and autoPlay is false', () => {
        const typewriter = new Typewriter();

        typewriter.initialize({
          autoPlay: false,
          actions: [
            {
              type: 'keyboard',
              key: 'a',
              delay: 100,
              cursor: 0,
            },
            {
              type: 'keyboard',
              key: 'b',
              delay: 100,
              cursor: 0,
            },
            {
              type: 'keyboard',
              key: 'c',
              delay: 100,
              cursor: 0,
            },
          ],
        });

        // Should not play even after a long time.
        expect(typewriter.isPlaying).toBe(false);
        jest.advanceTimersByTime(10000);
        expect(typewriter.isPlaying).toBe(false);

        // Now activate it.
        typewriter.play();

        // After 100 milliseconds it should now be 'a'
        jest.advanceTimersByTime(100);

        expect(typewriter.isPlaying).toBe(true);
        expect(typewriter.cursors[0].isBlinking).toBe(false);
        expect(typewriter.text).toBe('a');
      });

      it('should not start playing automatically when there are no actions configured even when autoPlay is true', () => {
        const typewriter = new Typewriter();

        typewriter.initialize({
          autoPlay: true,
          actions: [],
        });

        // Should not play even after a long time.
        expect(typewriter.isPlaying).toBe(false);
        jest.advanceTimersByTime(10000);
        expect(typewriter.isPlaying).toBe(false);

        // Now activate it, should have no effect
        typewriter.play();

        expect(typewriter.isPlaying).toBe(false);
        jest.advanceTimersByTime(10000);
        expect(typewriter.isPlaying).toBe(false);
      });

      it('should not start playing automatically when there are no actions configured and when autoPlay is false', () => {
        const typewriter = new Typewriter();

        typewriter.initialize({
          autoPlay: false,
          actions: [],
        });

        // Should not play even after a long time.
        expect(typewriter.isPlaying).toBe(false);
        jest.advanceTimersByTime(10000);
        expect(typewriter.isPlaying).toBe(false);

        // Now activate it, should have no effect
        typewriter.play();

        expect(typewriter.isPlaying).toBe(false);
        jest.advanceTimersByTime(10000);
        expect(typewriter.isPlaying).toBe(false);
      });
    });
  });

  describe('actions', () => {
    describe('without selection', () => {
      describe('inserting', () => {
        it('should know how to do a basic text animation from start to finish', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: 'a',
                delay: 100,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: 'b',
                delay: 200,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: 'c',
                delay: 300,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: 'a',
                delay: 100,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: 'b',
                delay: 200,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: 'c',
                delay: 300,
                cursor: 0,
              },
            ],
            cursors: [{ position: 0, name: '', isBlinking: true }],
            text: '',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(100);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: 'a',
                  delay: 100,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: 'b',
                  delay: 200,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: 'c',
                  delay: 300,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 1, name: '', isBlinking: false }],
              text: 'a',
              blinkAfter: 50,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'keyboard',
                key: 'a',
                delay: 100,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          jest.advanceTimersByTime(200);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: 'a',
                  delay: 100,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: 'b',
                  delay: 200,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: 'c',
                  delay: 300,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 2, name: '', isBlinking: false }],
              text: 'ab',
              blinkAfter: 50,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'keyboard',
                key: 'b',
                delay: 200,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          jest.advanceTimersByTime(300);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: 'a',
                  delay: 100,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: 'b',
                  delay: 200,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: 'c',
                  delay: 300,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 3, name: '', isBlinking: false }],
              text: 'abc',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: 'c',
                delay: 300,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should know how to add a letter in the middle', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: 'b',
                delay: 100,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'ac',
            cursors: [{ position: 1, name: '' }],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: 'b',
                delay: 100,
                cursor: 0,
              },
            ],
            cursors: [{ position: 1, name: '', isBlinking: true }],
            text: 'ac',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(100);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: 'b',
                  delay: 100,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 2, name: '', isBlinking: false }],
              text: 'abc',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: 'b',
                delay: 100,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should know how to add a letter at the start', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: 'a',
                delay: 100,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'bc',
            cursors: [{ position: 0, name: '' }],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: 'a',
                delay: 100,
                cursor: 0,
              },
            ],
            cursors: [{ position: 0, name: '', isBlinking: true }],
            text: 'bc',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(100);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: 'a',
                  delay: 100,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 1, name: '', isBlinking: false }],
              text: 'abc',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: 'a',
                delay: 100,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });
      });

      describe('backspace', () => {
        it('should know how to to apply a backspace from the end', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: 'a',
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: 'b',
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: 'c',
                delay: 50,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: 'a',
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: 'b',
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: 'c',
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [{ position: 0, name: '', isBlinking: true }],
            text: '',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: 'a',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeBackspace,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: 'b',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeBackspace,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: 'c',
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 1, name: '', isBlinking: false }],
              text: 'a',
              blinkAfter: 50,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'keyboard',
                key: 'a',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: 'a',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeBackspace,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: 'b',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeBackspace,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: 'c',
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 0, name: '', isBlinking: false }],
              text: '',
              blinkAfter: 50,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: 'a',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeBackspace,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: 'b',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeBackspace,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: 'c',
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 1, name: '', isBlinking: false }],
              text: 'b',
              blinkAfter: 50,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'keyboard',
                key: 'b',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: 'a',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeBackspace,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: 'b',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeBackspace,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: 'c',
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 0, name: '', isBlinking: false }],
              text: '',
              blinkAfter: 50,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: 'a',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeBackspace,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: 'b',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeBackspace,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: 'c',
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 1, name: '', isBlinking: false }],
              text: 'c',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: 'c',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should know how to to apply a backspace from the middle', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 50,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'abc',
            cursors: [{ position: 2, name: '' }],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [{ position: 2, name: '', isBlinking: true }],
            text: 'abc',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeBackspace,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 1, name: '', isBlinking: false }],
              text: 'ac',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should know how to to apply a backspace from index 1', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 50,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'abc',
            cursors: [{ position: 1, name: '' }],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [{ position: 1, name: '', isBlinking: true }],
            text: 'abc',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeBackspace,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 0, name: '', isBlinking: false }],
              text: 'bc',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should ignore a backspace from the start and continue the animation', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: 'z',
                delay: 50,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'abc',
            cursors: [{ position: 0, name: '' }],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: 'z',
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [{ position: 0, name: '', isBlinking: true }],
            text: 'abc',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          // It should ignore the action
          jest.advanceTimersByTime(50);
          expect(subscriber).toBeCalledTimes(0);

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeBackspace,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: 'z',
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 1, name: '', isBlinking: false }],
              text: 'zabc',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: 'z',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should be able to finish from a backspace from the start which is ignored', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 50,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'abc',
            cursors: [{ position: 0, name: '' }],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [{ position: 0, name: '', isBlinking: true }],
            text: 'abc',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeBackspace,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 0, name: '', isBlinking: false }],
              text: 'abc',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should know how to to apply a backspace when using unicode chars such as emoji', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: '😀',
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: '😃',
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: '😀',
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: '😃',
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [{ position: 0, name: '', isBlinking: true }],
            text: '',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😀',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeBackspace,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: '😃',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeBackspace,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 1, name: '', isBlinking: false }],
              text: '😀',
              blinkAfter: 50,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'keyboard',
                key: '😀',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😀',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeBackspace,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: '😃',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeBackspace,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 0, name: '', isBlinking: false }],
              text: '',
              blinkAfter: 50,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😀',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeBackspace,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: '😃',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeBackspace,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 1, name: '', isBlinking: false }],
              text: '😃',
              blinkAfter: 50,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'keyboard',
                key: '😃',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😀',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeBackspace,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: '😃',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeBackspace,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 0, name: '', isBlinking: false }],
              text: '',
              blinkAfter: 50,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😀',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeBackspace,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: '😃',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeBackspace,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 1, name: '', isBlinking: false }],
              text: '😄',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should when backspace is the last action start repeating', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 50,
                cursor: 0,
              },
            ],
            repeat: true,
            blinkAfter: 1000,
            text: '',
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [{ position: 0, name: '', isBlinking: true }],
            text: '',
            blinkAfter: 1000,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: true,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeBackspace,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 1, name: '', isBlinking: false }],
              text: '😄',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeBackspace,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 0, name: '', isBlinking: false }],
              text: '',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeBackspace,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 0, name: '', isBlinking: true }],
              text: '',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'REPEATING',
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should when backspace is ignored still start repeating', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 50,
                cursor: 0,
              },
            ],
            repeat: true,
            blinkAfter: 1000,
            text: '',
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [{ position: 0, name: '', isBlinking: true }],
            text: '',
            blinkAfter: 1000,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: true,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeBackspace,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeBackspace,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 1, name: '', isBlinking: false }],
              text: '😄',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeBackspace,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeBackspace,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 0, name: '', isBlinking: false }],
              text: '',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          jest.advanceTimersByTime(50);

          // The last typewriterActionTypeBackspace should have no effect
          expect(subscriber).toBeCalledTimes(2);

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeBackspace,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeBackspace,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 0, name: '', isBlinking: true }],
              text: '',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'REPEATING',
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });
      });

      describe('clear all', () => {
        it('should know how to to apply a clear all and continue the animation', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeClearAll,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'Hello world!',
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeClearAll,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [{ position: 12, name: '', isBlinking: true }],
            text: 'Hello world!',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeClearAll,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 0, name: '', isBlinking: false }],
              text: '',
              blinkAfter: 50,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeClearAll,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeClearAll,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 1, name: '', isBlinking: false }],
              text: '😄',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should know how to to finish on a clear all', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeClearAll,
                delay: 50,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'Hello world!',
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeClearAll,
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [{ position: 12, name: '', isBlinking: true }],
            text: 'Hello world!',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeClearAll,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 0, name: '', isBlinking: false }],
              text: '',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeClearAll,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should ignore a clear all when text is already empty', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeClearAll,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: 'b',
                delay: 50,
                cursor: 0,
              },
            ],
            blinkAfter: 1000,
            text: 'a',
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeClearAll,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: 'b',
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [{ position: 1, name: '', isBlinking: true }],
            text: 'a',
            blinkAfter: 1000,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeBackspace,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeClearAll,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: 'b',
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 0, name: '', isBlinking: false }],
              text: '',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          jest.advanceTimersByTime(50);

          // Clear all should be ignored
          expect(subscriber).toBeCalledTimes(1);

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeBackspace,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeClearAll,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: 'b',
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 1, name: '', isBlinking: false }],
              text: 'b',
              blinkAfter: 1000,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: 'b',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should still finish on a clear all when text is already empty and ignored', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeClearAll,
                delay: 50,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: '',
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeClearAll,
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [{ position: 0, name: '', isBlinking: true }],
            text: '',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeClearAll,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 0, name: '', isBlinking: false }],
              text: '',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeClearAll,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should when clear all is the last action start repeating', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeClearAll,
                delay: 50,
                cursor: 0,
              },
            ],
            repeat: true,
            blinkAfter: 1000,
            text: '',
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeClearAll,
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [{ position: 0, name: '', isBlinking: true }],
            text: '',
            blinkAfter: 1000,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: true,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeClearAll,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 1, name: '', isBlinking: false }],
              text: '😄',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeClearAll,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 0, name: '', isBlinking: false }],
              text: '',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeClearAll,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeClearAll,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 0, name: '', isBlinking: true }],
              text: '',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'REPEATING',
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should when clear all is ignored still start repeating', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeClearAll,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeClearAll,
                delay: 50,
                cursor: 0,
              },
            ],
            repeat: true,
            blinkAfter: 1000,
            text: '',
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeClearAll,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeClearAll,
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [{ position: 0, name: '', isBlinking: true }],
            text: '',
            blinkAfter: 1000,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: true,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeClearAll,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeClearAll,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 1, name: '', isBlinking: false }],
              text: '😄',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeClearAll,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeClearAll,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 0, name: '', isBlinking: false }],
              text: '',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeClearAll,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          jest.advanceTimersByTime(50);

          // The last typewriterActionTypeClearAll should have no effect
          expect(subscriber).toBeCalledTimes(2);

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeClearAll,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeClearAll,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 0, name: '', isBlinking: true }],
              text: '',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'REPEATING',
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });
      });

      describe('move left', () => {
        it('should know how to move left from the middle', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeLeft,
                delay: 100,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'abc',
            cursors: [{ position: 1, name: '' }],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeLeft,
                delay: 100,
                cursor: 0,
              },
            ],
            cursors: [{ position: 1, name: '', isBlinking: true }],
            text: 'abc',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(100);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeLeft,
                  delay: 100,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 0, name: '', isBlinking: false }],
              text: 'abc',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeLeft,
                delay: 100,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should know how to move left from the end', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeLeft,
                delay: 100,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'abc',
            cursors: [{ position: 2, name: '' }],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeLeft,
                delay: 100,
                cursor: 0,
              },
            ],
            cursors: [{ position: 2, name: '', isBlinking: true }],
            text: 'abc',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(100);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeLeft,
                  delay: 100,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 1, name: '', isBlinking: false }],
              text: 'abc',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeLeft,
                delay: 100,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should ignore a move left from the start and continue the animation', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeLeft,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: 'z',
                delay: 50,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'abc',
            cursors: [{ position: 0, name: '' }],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeLeft,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: 'z',
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [{ position: 0, name: '', isBlinking: true }],
            text: 'abc',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          // It should ignore the action
          jest.advanceTimersByTime(50);
          expect(subscriber).toBeCalledTimes(0);

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeLeft,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: 'z',
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 1, name: '', isBlinking: false }],
              text: 'zabc',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: 'z',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should be able to finish from a move left from the start which is ignored', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeLeft,
                delay: 50,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'abc',
            cursors: [{ position: 0, name: '' }],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeLeft,
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [{ position: 0, name: '', isBlinking: true }],
            text: 'abc',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeLeft,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 0, name: '', isBlinking: false }],
              text: 'abc',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeLeft,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should when move left is the last action start repeating', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeLeft,
                delay: 50,
                cursor: 0,
              },
            ],
            repeat: true,
            blinkAfter: 1000,
            text: '',
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeLeft,
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [{ position: 0, name: '', isBlinking: true }],
            text: '',
            blinkAfter: 1000,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: true,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeLeft,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 1, name: '', isBlinking: false }],
              text: '😄',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeLeft,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 0, name: '', isBlinking: false }],
              text: '😄',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeLeft,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeLeft,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 0, name: '', isBlinking: true }],
              text: '',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'REPEATING',
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should when move left is ignored still start repeating', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeLeft,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeLeft,
                delay: 50,
                cursor: 0,
              },
            ],
            repeat: true,
            blinkAfter: 1000,
            text: '',
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeLeft,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeLeft,
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [{ position: 0, name: '', isBlinking: true }],
            text: '',
            blinkAfter: 1000,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: true,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeLeft,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeLeft,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 1, name: '', isBlinking: false }],
              text: '😄',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeLeft,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeLeft,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 0, name: '', isBlinking: false }],
              text: '😄',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeLeft,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          jest.advanceTimersByTime(50);

          // The last typewriterActionTypeLeft should have no effect
          expect(subscriber).toBeCalledTimes(2);

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeLeft,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeLeft,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 0, name: '', isBlinking: true }],
              text: '',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'REPEATING',
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });
      });

      describe('move right', () => {
        it('should know how to move right from the start', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeRight,
                delay: 100,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'abc',
            cursors: [{ position: 0, name: '' }],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeRight,
                delay: 100,
                cursor: 0,
              },
            ],
            cursors: [{ position: 0, name: '', isBlinking: true }],
            text: 'abc',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(100);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeRight,
                  delay: 100,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 1, name: '', isBlinking: false }],
              text: 'abc',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeRight,
                delay: 100,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should know how to move right from the middle', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeRight,
                delay: 100,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'abc',
            cursors: [{ position: 1, name: '' }],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeRight,
                delay: 100,
                cursor: 0,
              },
            ],
            cursors: [{ position: 1, name: '', isBlinking: true }],
            text: 'abc',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(100);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeRight,
                  delay: 100,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 2, name: '', isBlinking: false }],
              text: 'abc',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeRight,
                delay: 100,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should ignore a move right from the end and continue the animation', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeRight,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: 'z',
                delay: 50,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'abc',
            cursors: [{ position: 3, name: '' }],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeRight,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: 'z',
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [{ position: 3, name: '', isBlinking: true }],
            text: 'abc',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          // It should ignore the action
          jest.advanceTimersByTime(50);
          expect(subscriber).toBeCalledTimes(0);

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeRight,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: 'z',
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 4, name: '', isBlinking: false }],
              text: 'abcz',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: 'z',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should be able to finish from a move right from the end which is ignored', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeRight,
                delay: 50,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'abc',
            cursors: [{ position: 3, name: '' }],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeRight,
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [{ position: 3, name: '', isBlinking: true }],
            text: 'abc',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeRight,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 3, name: '', isBlinking: false }],
              text: 'abc',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeRight,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should when move right is the last action start repeating', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              {
                // Add artificial move left so move right is not an
                // ignored final action.
                type: 'keyboard',
                key: typewriterActionTypeLeft,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeRight,
                delay: 50,
                cursor: 0,
              },
            ],
            repeat: true,
            blinkAfter: 1000,
            text: '',
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeLeft,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeRight,
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [{ position: 0, name: '', isBlinking: true }],
            text: '',
            blinkAfter: 1000,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: true,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeLeft,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeRight,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 1, name: '', isBlinking: false }],
              text: '😄',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeLeft,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeRight,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 0, name: '', isBlinking: false }],
              text: '😄',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeLeft,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeLeft,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeRight,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 1, name: '', isBlinking: false }],
              text: '😄',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeRight,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeLeft,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeRight,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 0, name: '', isBlinking: true }],
              text: '',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'REPEATING',
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should when move right is ignored still start repeating', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeRight,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeRight,
                delay: 50,
                cursor: 0,
              },
            ],
            repeat: true,
            blinkAfter: 1000,
            text: '',
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeRight,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeRight,
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [{ position: 0, name: '', isBlinking: true }],
            text: '',
            blinkAfter: 1000,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: true,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeRight,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeRight,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 1, name: '', isBlinking: false }],
              text: '😄',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          // The first typewriterActionTypeRight should have no effect
          jest.advanceTimersByTime(50);
          expect(subscriber).toBeCalledTimes(1);

          jest.advanceTimersByTime(50);

          // The last typewriterActionTypeRight should also have no effect
          expect(subscriber).toBeCalledTimes(1);

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeRight,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeRight,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 0, name: '', isBlinking: true }],
              text: '',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'REPEATING',
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });
      });

      describe('mouse click', () => {
        it('should know to move the cursor to the position clicked', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'mouse',
                position: 1,
                delay: 100,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'abc',
            cursors: [{ position: 0, name: '' }],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'mouse',
                position: 1,
                delay: 100,
                cursor: 0,
              },
            ],
            cursors: [{ position: 0, name: '', isBlinking: true }],
            text: 'abc',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(100);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'mouse',
                  position: 1,
                  delay: 100,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 1, name: '', isBlinking: false }],
              text: 'abc',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'mouse',
                position: 1,
                delay: 100,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should know to select text on mouse clicked', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'mouse',
                position: 0,
                delay: 100,
                cursor: 0,
                selection: {
                  start: 0,
                  end: 3,
                },
              },
            ],
            blinkAfter: 50,
            text: 'abc',
            cursors: [{ position: 0, name: '' }],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'mouse',
                position: 0,
                delay: 100,
                cursor: 0,
                selection: {
                  start: 0,
                  end: 3,
                },
              },
            ],
            cursors: [{ position: 0, name: '', isBlinking: true }],
            text: 'abc',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(100);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'mouse',
                  position: 0,
                  delay: 100,
                  cursor: 0,
                  selection: {
                    start: 0,
                    end: 3,
                  },
                },
              ],
              cursors: [
                {
                  position: 0,
                  name: '',
                  isBlinking: false,
                  selection: { start: 0, end: 3 },
                },
              ],
              text: 'abc',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'mouse',
                position: 0,
                delay: 100,
                cursor: 0,
                selection: {
                  start: 0,
                  end: 3,
                },
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should ignore a mouse click on the current position and continue the animation', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'mouse',
                position: 3,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: 'z',
                delay: 50,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'abc',
            cursors: [{ position: 3, name: '' }],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'mouse',
                position: 3,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: 'z',
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [{ position: 3, name: '', isBlinking: true }],
            text: 'abc',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          // It should ignore the action
          jest.advanceTimersByTime(50);
          expect(subscriber).toBeCalledTimes(0);

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'mouse',
                  position: 3,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: 'z',
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 4, name: '', isBlinking: false }],
              text: 'abcz',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: 'z',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should when a mouse click has a position less than 0 move to 0 instead', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'mouse',
                position: -1,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: 'z',
                delay: 50,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'abc',
            cursors: [{ position: 3, name: '' }],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'mouse',
                position: -1,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: 'z',
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [{ position: 3, name: '', isBlinking: true }],
            text: 'abc',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'mouse',
                  position: -1,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: 'z',
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 0, name: '', isBlinking: false }],
              text: 'abc',
              blinkAfter: 50,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'mouse',
                position: -1,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'mouse',
                  position: -1,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: 'z',
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 1, name: '', isBlinking: false }],
              text: 'zabc',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: 'z',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should when a mouse click has a position less than 0 and the current position is zero ignore the click', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'mouse',
                position: -1,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: 'z',
                delay: 50,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'abc',
            cursors: [{ position: 0, name: '' }],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'mouse',
                position: -1,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: 'z',
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [{ position: 0, name: '', isBlinking: true }],
            text: 'abc',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          // It should ignore the action
          jest.advanceTimersByTime(50);
          expect(subscriber).toBeCalledTimes(0);

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'mouse',
                  position: -1,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: 'z',
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 1, name: '', isBlinking: false }],
              text: 'zabc',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: 'z',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should when a mouse click has a position larger than the text move to text length instead', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'mouse',
                position: 4,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: 'z',
                delay: 50,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'abc',
            cursors: [{ position: 0, name: '' }],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'mouse',
                position: 4,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: 'z',
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [{ position: 0, name: '', isBlinking: true }],
            text: 'abc',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'mouse',
                  position: 4,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: 'z',
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 3, name: '', isBlinking: false }],
              text: 'abc',
              blinkAfter: 50,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'mouse',
                position: 4,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'mouse',
                  position: 4,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: 'z',
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 4, name: '', isBlinking: false }],
              text: 'abcz',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: 'z',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should when a mouse click has a position larger than the text and the current position is the text length ignore the click', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'mouse',
                position: 4,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: 'z',
                delay: 50,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'abc',
            cursors: [{ position: 3, name: '' }],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'mouse',
                position: 4,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: 'z',
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [{ position: 3, name: '', isBlinking: true }],
            text: 'abc',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          // It should ignore the action
          jest.advanceTimersByTime(50);
          expect(subscriber).toBeCalledTimes(0);

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'mouse',
                  position: 4,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: 'z',
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 4, name: '', isBlinking: false }],
              text: 'abcz',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: 'z',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should be able to finish from a mouse click at the end which is ignored', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'mouse',
                position: 3,
                delay: 50,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'abc',
            cursors: [{ position: 3, name: '' }],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'mouse',
                position: 3,
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [{ position: 3, name: '', isBlinking: true }],
            text: 'abc',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'mouse',
                  position: 3,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 3, name: '', isBlinking: false }],
              text: 'abc',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'mouse',
                position: 3,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should when a mouse click is the last action start repeating', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              {
                type: 'mouse',
                position: 0,
                delay: 50,
                cursor: 0,
              },
            ],
            repeat: true,
            blinkAfter: 1000,
            text: '',
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              {
                type: 'mouse',
                position: 0,
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [{ position: 0, name: '', isBlinking: true }],
            text: '',
            blinkAfter: 1000,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: true,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'mouse',
                  position: 0,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 1, name: '', isBlinking: false }],
              text: '😄',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'mouse',
                  position: 0,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 0, name: '', isBlinking: false }],
              text: '😄',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'mouse',
                position: 0,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'mouse',
                  position: 0,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 0, name: '', isBlinking: true }],
              text: '',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'REPEATING',
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should when a mouse click is ignored still start repeating', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              {
                type: 'mouse',
                position: 1,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'mouse',
                position: 1,
                delay: 50,
                cursor: 0,
              },
            ],
            repeat: true,
            blinkAfter: 1000,
            text: '',
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              {
                type: 'mouse',
                position: 1,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'mouse',
                position: 1,
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [{ position: 0, name: '', isBlinking: true }],
            text: '',
            blinkAfter: 1000,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: true,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'mouse',
                  position: 1,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'mouse',
                  position: 1,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 1, name: '', isBlinking: false }],
              text: '😄',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          // The first typewriterActionTypeRight should have no effect
          jest.advanceTimersByTime(50);
          expect(subscriber).toBeCalledTimes(1);

          jest.advanceTimersByTime(50);

          // The last typewriterActionTypeRight should also have no effect
          expect(subscriber).toBeCalledTimes(1);

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'mouse',
                  position: 1,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'mouse',
                  position: 1,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 0, name: '', isBlinking: true }],
              text: '',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'REPEATING',
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });
      });

      describe('select left', () => {
        it('should know how to create a selection to the left from middle', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeSelectLeft,
                delay: 100,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'abc',
            cursors: [{ position: 1, name: '' }],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeSelectLeft,
                delay: 100,
                cursor: 0,
              },
            ],
            cursors: [{ position: 1, name: '', isBlinking: true }],
            text: 'abc',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(100);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeSelectLeft,
                  delay: 100,
                  cursor: 0,
                },
              ],
              cursors: [
                {
                  position: 0,
                  name: '',
                  isBlinking: false,
                  selection: { start: 0, end: 1 },
                },
              ],
              text: 'abc',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeSelectLeft,
                delay: 100,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should know how to create a selection to the left from the end', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeSelectLeft,
                delay: 100,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'abc',
            cursors: [{ position: 3, name: '' }],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeSelectLeft,
                delay: 100,
                cursor: 0,
              },
            ],
            cursors: [{ position: 3, name: '', isBlinking: true }],
            text: 'abc',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(100);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeSelectLeft,
                  delay: 100,
                  cursor: 0,
                },
              ],
              cursors: [
                {
                  position: 2,
                  name: '',
                  isBlinking: false,
                  selection: { start: 2, end: 3 },
                },
              ],
              text: 'abc',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeSelectLeft,
                delay: 100,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should ignore create selection when on the start and continue the animation', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeSelectLeft,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: 'z',
                delay: 50,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'abc',
            cursors: [{ position: 0, name: '' }],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeSelectLeft,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: 'z',
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [{ position: 0, name: '', isBlinking: true }],
            text: 'abc',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          // It should ignore the action
          jest.advanceTimersByTime(50);
          expect(subscriber).toBeCalledTimes(0);

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeSelectLeft,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: 'z',
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 1, name: '', isBlinking: false }],
              text: 'zabc',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: 'z',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should be able to finish from a select left from the start which is ignored', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeSelectLeft,
                delay: 100,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'abc',
            cursors: [{ position: 0, name: '' }],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeSelectLeft,
                delay: 100,
                cursor: 0,
              },
            ],
            cursors: [{ position: 0, name: '', isBlinking: true }],
            text: 'abc',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(100);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeSelectLeft,
                  delay: 100,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 0, name: '', isBlinking: false }],
              text: 'abc',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeSelectLeft,
                delay: 100,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should when select left is the last action start repeating', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeSelectLeft,
                delay: 50,
                cursor: 0,
              },
            ],
            repeat: true,
            blinkAfter: 1000,
            text: '',
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeSelectLeft,
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [{ position: 0, name: '', isBlinking: true }],
            text: '',
            blinkAfter: 1000,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: true,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeSelectLeft,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 1, name: '', isBlinking: false }],
              text: '😄',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeSelectLeft,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [
                {
                  position: 0,
                  name: '',
                  isBlinking: false,
                  selection: { start: 0, end: 1 },
                },
              ],
              text: '😄',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeSelectLeft,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeSelectLeft,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 0, name: '', isBlinking: true }],
              text: '',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'REPEATING',
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should when select left is ignored still start repeating', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeSelectLeft,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeSelectLeft,
                delay: 50,
                cursor: 0,
              },
            ],
            repeat: true,
            blinkAfter: 1000,
            text: '',
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeSelectLeft,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeSelectLeft,
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [{ position: 0, name: '', isBlinking: true }],
            text: '',
            blinkAfter: 1000,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: true,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeSelectLeft,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeSelectLeft,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 1, name: '', isBlinking: false }],
              text: '😄',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeSelectLeft,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeSelectLeft,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [
                {
                  position: 0,
                  name: '',
                  isBlinking: false,
                  selection: { start: 0, end: 1 },
                },
              ],
              text: '😄',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeSelectLeft,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          jest.advanceTimersByTime(50);

          // The last typewriterActionTypeSelectLeft should have no effect
          expect(subscriber).toBeCalledTimes(2);

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeSelectLeft,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeSelectLeft,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 0, name: '', isBlinking: true }],
              text: '',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'REPEATING',
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });
      });

      describe('select right', () => {
        it('should know how to create a selection to the right from middle', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeSelectRight,
                delay: 100,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'abc',
            cursors: [{ position: 1, name: '' }],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeSelectRight,
                delay: 100,
                cursor: 0,
              },
            ],
            cursors: [{ position: 1, name: '', isBlinking: true }],
            text: 'abc',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(100);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeSelectRight,
                  delay: 100,
                  cursor: 0,
                },
              ],
              cursors: [
                {
                  position: 2,
                  name: '',
                  isBlinking: false,
                  selection: { start: 1, end: 2 },
                },
              ],
              text: 'abc',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeSelectRight,
                delay: 100,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should know how to create a selection to the right from the start', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeSelectRight,
                delay: 100,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'abc',
            cursors: [{ position: 0, name: '' }],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeSelectRight,
                delay: 100,
                cursor: 0,
              },
            ],
            cursors: [{ position: 0, name: '', isBlinking: true }],
            text: 'abc',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(100);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeSelectRight,
                  delay: 100,
                  cursor: 0,
                },
              ],
              cursors: [
                {
                  position: 1,
                  name: '',
                  isBlinking: false,
                  selection: { start: 0, end: 1 },
                },
              ],
              text: 'abc',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeSelectRight,
                delay: 100,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should ignore create selection when on the end and continue the animation', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeSelectRight,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: 'z',
                delay: 50,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'abc',
            cursors: [{ position: 3, name: '' }],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeSelectRight,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: 'z',
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [{ position: 3, name: '', isBlinking: true }],
            text: 'abc',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          // It should ignore the action
          jest.advanceTimersByTime(50);
          expect(subscriber).toBeCalledTimes(0);

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeSelectRight,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: 'z',
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 4, name: '', isBlinking: false }],
              text: 'abcz',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: 'z',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should be able to finish from a select right from the end which is ignored', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeSelectRight,
                delay: 100,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'abc',
            cursors: [{ position: 3, name: '' }],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeSelectRight,
                delay: 100,
                cursor: 0,
              },
            ],
            cursors: [{ position: 3, name: '', isBlinking: true }],
            text: 'abc',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(100);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeSelectRight,
                  delay: 100,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 3, name: '', isBlinking: false }],
              text: 'abc',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeSelectRight,
                delay: 100,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should when select right is the last action start repeating', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeLeft,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeSelectRight,
                delay: 50,
                cursor: 0,
              },
            ],
            repeat: true,
            blinkAfter: 1000,
            text: '',
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeLeft,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeSelectRight,
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [{ position: 0, name: '', isBlinking: true }],
            text: '',
            blinkAfter: 1000,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: true,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeLeft,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeSelectRight,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 1, name: '', isBlinking: false }],
              text: '😄',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeLeft,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeSelectRight,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 0, name: '', isBlinking: false }],
              text: '😄',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeLeft,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeLeft,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeSelectRight,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [
                {
                  position: 1,
                  name: '',
                  isBlinking: false,
                  selection: { start: 0, end: 1 },
                },
              ],
              text: '😄',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeSelectRight,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeLeft,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeSelectRight,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 0, name: '', isBlinking: true }],
              text: '',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'REPEATING',
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should when select right is ignored still start repeating', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeSelectRight,
                delay: 50,
                cursor: 0,
              },
            ],
            repeat: true,
            blinkAfter: 1000,
            text: '',
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeSelectRight,
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [{ position: 0, name: '', isBlinking: true }],
            text: '',
            blinkAfter: 1000,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: true,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeSelectRight,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 1, name: '', isBlinking: false }],
              text: '😄',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          jest.advanceTimersByTime(50);

          // The last typewriterActionTypeSelectRight should have no effect
          expect(subscriber).toBeCalledTimes(1);

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeSelectRight,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 0, name: '', isBlinking: true }],
              text: '',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'REPEATING',
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });
      });
    });

    describe('with selection', () => {
      describe('inserting', () => {
        it('should remove selection and insert the letter in place of the selection', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: 'x',
                delay: 50,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'this is a nice line',
            cursors: [{ position: 14, selection: { start: 10, end: 14 } }],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: 'x',
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [
              {
                name: '',
                position: 14,
                selection: { start: 10, end: 14 },
                isBlinking: true,
              },
            ],
            text: 'this is a nice line',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: 'x',
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [
                {
                  name: '',
                  position: 11,
                  selection: undefined,
                  isBlinking: false,
                },
              ],
              text: 'this is a x line',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: 'x',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });
      });

      describe('backspace', () => {
        it('should know how to to apply a backspace from the start of the selection', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 50,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'this is a nice line',
            cursors: [{ position: 10, selection: { start: 10, end: 14 } }],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [
              {
                position: 10,
                selection: { start: 10, end: 14 },
                name: '',
                isBlinking: true,
              },
            ],
            text: 'this is a nice line',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeBackspace,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [
                {
                  position: 10,
                  selection: undefined,
                  name: '',
                  isBlinking: false,
                },
              ],
              text: 'this is a  line',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should know how to to apply a backspace from the end of the selection', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 50,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'this is a nice line',
            cursors: [{ position: 14, selection: { start: 10, end: 14 } }],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [
              {
                position: 14,
                selection: { start: 10, end: 14 },
                name: '',
                isBlinking: true,
              },
            ],
            text: 'this is a nice line',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeBackspace,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [
                {
                  position: 10,
                  selection: undefined,
                  name: '',
                  isBlinking: false,
                },
              ],
              text: 'this is a  line',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should when backspace from a selection is the last action start repeating', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 50,
                cursor: 0,
              },
            ],
            blinkAfter: 1000,
            text: 'this is a nice line',
            cursors: [{ position: 0, selection: { start: 0, end: 19 } }],
            repeat: 2,
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [
              {
                name: '',
                position: 0,
                selection: { start: 0, end: 19 },
                isBlinking: true,
              },
            ],
            text: 'this is a nice line',
            blinkAfter: 1000,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: 2,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeBackspace,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [
                {
                  position: 0,
                  selection: undefined,
                  name: '',
                  isBlinking: false,
                },
              ],
              text: '',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: 2,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeBackspace,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [
                {
                  name: '',
                  position: 0,
                  selection: { start: 0, end: 19 },
                  isBlinking: true,
                },
              ],
              text: 'this is a nice line',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: 2,
              repeatDelay: 0,
            },
            {
              type: 'REPEATING',
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });
      });

      describe('clear all', () => {
        it('should know how to to apply a clear all and continue the animation', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeClearAll,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'Hello world!',
            cursors: [{ position: 6, selection: { start: 6, end: 12 } }],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeClearAll,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [
              {
                position: 6,
                name: '',
                isBlinking: true,
                selection: { start: 6, end: 12 },
              },
            ],
            text: 'Hello world!',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeClearAll,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 0, name: '', isBlinking: false }],
              text: '',
              blinkAfter: 50,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeClearAll,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeClearAll,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 1, name: '', isBlinking: false }],
              text: '😄',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should know how to to finish on a clear all', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeClearAll,
                delay: 50,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'Hello world!',
            cursors: [{ position: 0, selection: { start: 0, end: 5 } }],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeClearAll,
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [
              {
                position: 0,
                name: '',
                isBlinking: true,
                selection: { start: 0, end: 5 },
              },
            ],
            text: 'Hello world!',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeClearAll,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 0, name: '', isBlinking: false }],
              text: '',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeClearAll,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should ignore a clear all when text is already empty', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeClearAll,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: 'b',
                delay: 50,
                cursor: 0,
              },
            ],
            blinkAfter: 1000,
            text: 'a',
            cursors: [{ position: 1, selection: { start: 0, end: 1 } }],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeClearAll,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: 'b',
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [
              {
                position: 1,
                name: '',
                isBlinking: true,
                selection: { start: 0, end: 1 },
              },
            ],
            text: 'a',
            blinkAfter: 1000,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeBackspace,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeClearAll,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: 'b',
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 0, name: '', isBlinking: false }],
              text: '',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          jest.advanceTimersByTime(50);

          // Clear all should be ignored
          expect(subscriber).toBeCalledTimes(1);

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeBackspace,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeClearAll,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: 'b',
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 1, name: '', isBlinking: false }],
              text: 'b',
              blinkAfter: 1000,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: 'b',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should when clear all is the last action start repeating, and restore the selection', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeClearAll,
                delay: 50,
                cursor: 0,
              },
            ],
            repeat: true,
            blinkAfter: 1000,
            text: 'Hello world!',
            cursors: [{ position: 5, selection: { start: 0, end: 5 } }],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeClearAll,
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [
              {
                position: 5,
                name: '',
                isBlinking: true,
                selection: { start: 0, end: 5 },
              },
            ],
            text: 'Hello world!',
            blinkAfter: 1000,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: true,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeClearAll,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 1, name: '', isBlinking: false }],
              text: '😄 world!',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeClearAll,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 0, name: '', isBlinking: false }],
              text: '',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeClearAll,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeClearAll,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [
                {
                  position: 5,
                  name: '',
                  isBlinking: true,
                  selection: { start: 0, end: 5 },
                },
              ],
              text: 'Hello world!',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'REPEATING',
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should when clear all is ignored still start repeating, and restore the selection', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeClearAll,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeClearAll,
                delay: 50,
                cursor: 0,
              },
            ],
            repeat: true,
            blinkAfter: 1000,
            text: 'Hello world!',
            cursors: [{ position: 0, selection: { start: 0, end: 5 } }],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeClearAll,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeClearAll,
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [
              {
                position: 0,
                name: '',
                isBlinking: true,
                selection: { start: 0, end: 5 },
              },
            ],
            text: 'Hello world!',
            blinkAfter: 1000,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: true,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeClearAll,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeClearAll,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 1, name: '', isBlinking: false }],
              text: '😄 world!',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeClearAll,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeClearAll,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 0, name: '', isBlinking: false }],
              text: '',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeClearAll,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          jest.advanceTimersByTime(50);

          // The last typewriterActionTypeClearAll should have no effect
          expect(subscriber).toBeCalledTimes(2);

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeClearAll,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeClearAll,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [
                {
                  position: 0,
                  name: '',
                  isBlinking: true,
                  selection: { start: 0, end: 5 },
                },
              ],
              text: 'Hello world!',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'REPEATING',
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });
      });

      describe('move left', () => {
        it('should when the cursor is at the start of the selection, stay on the position, and clear the selection', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeLeft,
                delay: 100,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'abcd',
            cursors: [
              { position: 1, name: '', selection: { start: 1, end: 3 } },
            ],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeLeft,
                delay: 100,
                cursor: 0,
              },
            ],
            cursors: [
              {
                position: 1,
                name: '',
                isBlinking: true,
                selection: { start: 1, end: 3 },
              },
            ],
            text: 'abcd',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(100);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeLeft,
                  delay: 100,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 1, name: '', isBlinking: false }],
              text: 'abcd',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeLeft,
                delay: 100,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should when the cursor is at the end of the selection, move to the start of the selection, and clear the selection', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeLeft,
                delay: 100,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'abcd',
            cursors: [
              { position: 3, name: '', selection: { start: 1, end: 3 } },
            ],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeLeft,
                delay: 100,
                cursor: 0,
              },
            ],
            cursors: [
              {
                position: 3,
                name: '',
                isBlinking: true,
                selection: { start: 1, end: 3 },
              },
            ],
            text: 'abcd',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(100);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeLeft,
                  delay: 100,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 1, name: '', isBlinking: false }],
              text: 'abcd',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeLeft,
                delay: 100,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should not ignore a move left from the start when there is a selection but should clear the selection', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeLeft,
                delay: 50,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'abc',
            cursors: [
              { position: 0, name: '', selection: { start: 0, end: 2 } },
            ],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeLeft,
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [
              {
                position: 0,
                name: '',
                isBlinking: true,
                selection: { start: 0, end: 2 },
              },
            ],
            text: 'abc',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeLeft,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 0, name: '', isBlinking: false }],
              text: 'abc',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeLeft,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should be able to finish from a move left from the start which is ignored, and restore the selection', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeLeft,
                delay: 50,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'abc',
            cursors: [
              { position: 0, name: '', selection: { start: 0, end: 1 } },
            ],
            repeat: true,
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeLeft,
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [
              {
                position: 0,
                name: '',
                isBlinking: true,
                selection: { start: 0, end: 1 },
              },
            ],
            text: 'abc',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: true,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeLeft,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 0, name: '', isBlinking: false }],
              text: 'abc',
              blinkAfter: 50,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeLeft,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeLeft,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [
                {
                  position: 0,
                  name: '',
                  isBlinking: true,
                  selection: { start: 0, end: 1 },
                },
              ],
              text: 'abc',
              blinkAfter: 50,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'REPEATING',
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });
      });

      describe('move right', () => {
        it('should when the cursor is at the end of the selection, stay on the position, and clear the selection', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeRight,
                delay: 100,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'abcd',
            cursors: [
              { position: 3, name: '', selection: { start: 1, end: 3 } },
            ],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeRight,
                delay: 100,
                cursor: 0,
              },
            ],
            cursors: [
              {
                position: 3,
                name: '',
                isBlinking: true,
                selection: { start: 1, end: 3 },
              },
            ],
            text: 'abcd',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(100);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeRight,
                  delay: 100,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 3, name: '', isBlinking: false }],
              text: 'abcd',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeRight,
                delay: 100,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should when the cursor is at the start of the selection, move to the end of the selection, and clear the selection', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeRight,
                delay: 100,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'abcd',
            cursors: [
              { position: 1, name: '', selection: { start: 1, end: 3 } },
            ],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeRight,
                delay: 100,
                cursor: 0,
              },
            ],
            cursors: [
              {
                position: 1,
                name: '',
                isBlinking: true,
                selection: { start: 1, end: 3 },
              },
            ],
            text: 'abcd',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(100);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeRight,
                  delay: 100,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 3, name: '', isBlinking: false }],
              text: 'abcd',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeRight,
                delay: 100,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should not ignore a move right from the end when there is a selection but should clear the selection', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeRight,
                delay: 50,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'abc',
            cursors: [
              { position: 3, name: '', selection: { start: 0, end: 3 } },
            ],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeRight,
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [
              {
                position: 3,
                name: '',
                isBlinking: true,
                selection: { start: 0, end: 3 },
              },
            ],
            text: 'abc',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          // It not should ignore the action when there is a selection
          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeRight,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 3, name: '', isBlinking: false }],
              text: 'abc',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeRight,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should be able to finish from a move right from the end which is ignored, and restore the selection', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeRight,
                delay: 50,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'abc',
            cursors: [
              { position: 3, name: '', selection: { start: 2, end: 3 } },
            ],
            repeat: true,
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeRight,
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [
              {
                position: 3,
                name: '',
                isBlinking: true,
                selection: { start: 2, end: 3 },
              },
            ],
            text: 'abc',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: true,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeRight,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 3, name: '', isBlinking: false }],
              text: 'abc',
              blinkAfter: 50,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeRight,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeRight,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [
                {
                  position: 3,
                  name: '',
                  isBlinking: true,
                  selection: { start: 2, end: 3 },
                },
              ],
              text: 'abc',
              blinkAfter: 50,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'REPEATING',
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });
      });

      describe('mouse click', () => {
        it('should know to move the cursor to the position clicked, and clear the selection', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'mouse',
                position: 1,
                delay: 100,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'abc',
            cursors: [
              { position: 0, name: '', selection: { start: 0, end: 2 } },
            ],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'mouse',
                position: 1,
                delay: 100,
                cursor: 0,
              },
            ],
            cursors: [
              {
                position: 0,
                name: '',
                isBlinking: true,
                selection: { start: 0, end: 2 },
              },
            ],
            text: 'abc',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(100);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'mouse',
                  position: 1,
                  delay: 100,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 1, name: '', isBlinking: false }],
              text: 'abc',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'mouse',
                position: 1,
                delay: 100,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should ignore selection when selection is already selected and continue the animation.', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'mouse',
                position: 3,
                delay: 50,
                cursor: 0,
                selection: {
                  start: 0,
                  end: 3,
                },
              },
              {
                type: 'keyboard',
                key: 'z',
                delay: 50,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'abc',
            cursors: [
              { position: 3, name: '', selection: { start: 0, end: 3 } },
            ],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'mouse',
                position: 3,
                delay: 50,
                cursor: 0,
                selection: {
                  start: 0,
                  end: 3,
                },
              },
              {
                type: 'keyboard',
                key: 'z',
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [
              {
                position: 3,
                name: '',
                isBlinking: true,
                selection: { start: 0, end: 3 },
              },
            ],
            text: 'abc',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          // It should ignore the action
          jest.advanceTimersByTime(50);
          expect(subscriber).toBeCalledTimes(0);

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'mouse',
                  position: 3,
                  delay: 50,
                  cursor: 0,
                  selection: {
                    start: 0,
                    end: 3,
                  },
                },
                {
                  type: 'keyboard',
                  key: 'z',
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 1, name: '', isBlinking: false }],
              text: 'z',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: 'z',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should not ignore a mouse click on the current position, if there is a selection, clear it', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'mouse',
                position: 3,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: 'z',
                delay: 50,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'abc',
            cursors: [
              { position: 3, name: '', selection: { start: 0, end: 3 } },
            ],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'mouse',
                position: 3,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: 'z',
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [
              {
                position: 3,
                name: '',
                isBlinking: true,
                selection: { start: 0, end: 3 },
              },
            ],
            text: 'abc',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          // It should not ignore the action if there is a selection
          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'mouse',
                  position: 3,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: 'z',
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 3, name: '', isBlinking: false }],
              text: 'abc',
              blinkAfter: 50,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'mouse',
                position: 3,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'mouse',
                  position: 3,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: 'z',
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 4, name: '', isBlinking: false }],
              text: 'abcz',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: 'z',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should when a mouse click has a position less than 0 move to 0 instead, and clear the selection', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'mouse',
                position: -1,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: 'z',
                delay: 50,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'abc',
            cursors: [
              { position: 3, name: '', selection: { start: 0, end: 3 } },
            ],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'mouse',
                position: -1,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: 'z',
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [
              {
                position: 3,
                name: '',
                isBlinking: true,
                selection: { start: 0, end: 3 },
              },
            ],
            text: 'abc',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'mouse',
                  position: -1,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: 'z',
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 0, name: '', isBlinking: false }],
              text: 'abc',
              blinkAfter: 50,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'mouse',
                position: -1,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'mouse',
                  position: -1,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: 'z',
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 1, name: '', isBlinking: false }],
              text: 'zabc',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: 'z',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should when a mouse click has a position less than 0 and the current position is zero not ignore the click but clear the selection', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'mouse',
                position: -1,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: 'z',
                delay: 50,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'abc',
            cursors: [
              { position: 0, name: '', selection: { start: 0, end: 3 } },
            ],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'mouse',
                position: -1,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: 'z',
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [
              {
                position: 0,
                name: '',
                isBlinking: true,
                selection: { start: 0, end: 3 },
              },
            ],
            text: 'abc',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          // It not should ignore the action but clear the selection
          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'mouse',
                  position: -1,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: 'z',
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 0, name: '', isBlinking: false }],
              text: 'abc',
              blinkAfter: 50,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'mouse',
                position: -1,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'mouse',
                  position: -1,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: 'z',
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 1, name: '', isBlinking: false }],
              text: 'zabc',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: 'z',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should when a mouse click has a position larger than the text move to text length instead, and clear the selection', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'mouse',
                position: 4,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: 'z',
                delay: 50,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'abc',
            cursors: [
              { position: 0, name: '', selection: { start: 0, end: 1 } },
            ],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'mouse',
                position: 4,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: 'z',
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [
              {
                position: 0,
                name: '',
                isBlinking: true,
                selection: { start: 0, end: 1 },
              },
            ],
            text: 'abc',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'mouse',
                  position: 4,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: 'z',
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 3, name: '', isBlinking: false }],
              text: 'abc',
              blinkAfter: 50,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'mouse',
                position: 4,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'mouse',
                  position: 4,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: 'z',
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 4, name: '', isBlinking: false }],
              text: 'abcz',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: 'z',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should when a mouse click has a position larger than the text and the current position is the text length not ignore the click but clear the selection', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'mouse',
                position: 4,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: 'z',
                delay: 50,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'abc',
            cursors: [
              { position: 3, name: '', selection: { start: 2, end: 3 } },
            ],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'mouse',
                position: 4,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: 'z',
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [
              {
                position: 3,
                name: '',
                isBlinking: true,
                selection: { start: 2, end: 3 },
              },
            ],
            text: 'abc',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          // It should not ignore the action but reset the selection
          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'mouse',
                  position: 4,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: 'z',
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 3, name: '', isBlinking: false }],
              text: 'abc',
              blinkAfter: 50,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'mouse',
                position: 4,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'mouse',
                  position: 4,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: 'z',
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 4, name: '', isBlinking: false }],
              text: 'abcz',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: 'z',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should when a mouse click is the last action start repeating, and restore the selection', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              {
                type: 'mouse',
                position: 0,
                delay: 50,
                cursor: 0,
              },
            ],
            repeat: true,
            blinkAfter: 1000,
            text: 'abc',
            cursors: [
              { position: 3, name: '', selection: { start: 2, end: 3 } },
            ],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              {
                type: 'mouse',
                position: 0,
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [
              {
                position: 3,
                name: '',
                isBlinking: true,
                selection: { start: 2, end: 3 },
              },
            ],
            text: 'abc',
            blinkAfter: 1000,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: true,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'mouse',
                  position: 0,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 3, name: '', isBlinking: false }],
              text: 'ab😄',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'mouse',
                  position: 0,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 0, name: '', isBlinking: false }],
              text: 'ab😄',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'mouse',
                position: 0,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'mouse',
                  position: 0,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [
                {
                  position: 3,
                  name: '',
                  isBlinking: true,
                  selection: { start: 2, end: 3 },
                },
              ],
              text: 'abc',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'REPEATING',
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });
      });

      describe('select expand left', () => {
        it('should know how to expand a selection from the end to the middle', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeSelectLeft,
                delay: 100,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'abc',
            cursors: [
              { position: 2, name: '', selection: { start: 2, end: 3 } },
            ],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeSelectLeft,
                delay: 100,
                cursor: 0,
              },
            ],
            cursors: [
              {
                position: 2,
                name: '',
                isBlinking: true,
                selection: { start: 2, end: 3 },
              },
            ],
            text: 'abc',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(100);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeSelectLeft,
                  delay: 100,
                  cursor: 0,
                },
              ],
              cursors: [
                {
                  position: 1,
                  name: '',
                  isBlinking: false,
                  selection: { start: 1, end: 3 },
                },
              ],
              text: 'abc',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeSelectLeft,
                delay: 100,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should know how to expand a selection from the middle to the start', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeSelectLeft,
                delay: 100,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'abc',
            cursors: [
              { position: 1, name: '', selection: { start: 1, end: 2 } },
            ],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeSelectLeft,
                delay: 100,
                cursor: 0,
              },
            ],
            cursors: [
              {
                position: 1,
                name: '',
                isBlinking: true,
                selection: { start: 1, end: 2 },
              },
            ],
            text: 'abc',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(100);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeSelectLeft,
                  delay: 100,
                  cursor: 0,
                },
              ],
              cursors: [
                {
                  position: 0,
                  name: '',
                  isBlinking: false,
                  selection: { start: 0, end: 2 },
                },
              ],
              text: 'abc',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeSelectLeft,
                delay: 100,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should ignore expand selection when on the start and continue the animation', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeSelectLeft,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: 'z',
                delay: 50,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'abc',
            cursors: [
              { position: 0, name: '', selection: { start: 0, end: 2 } },
            ],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeSelectLeft,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: 'z',
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [
              {
                position: 0,
                name: '',
                isBlinking: true,
                selection: { start: 0, end: 2 },
              },
            ],
            text: 'abc',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          // It should ignore the action
          jest.advanceTimersByTime(50);
          expect(subscriber).toBeCalledTimes(0);

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeSelectLeft,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: 'z',
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 1, name: '', isBlinking: false }],
              text: 'zc',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: 'z',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should be able to finish from a expand left from the start which is ignored', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeSelectLeft,
                delay: 100,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'abc',
            cursors: [
              { position: 0, name: '', selection: { start: 0, end: 2 } },
            ],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeSelectLeft,
                delay: 100,
                cursor: 0,
              },
            ],
            cursors: [
              {
                position: 0,
                name: '',
                isBlinking: true,
                selection: { start: 0, end: 2 },
              },
            ],
            text: 'abc',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(100);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeSelectLeft,
                  delay: 100,
                  cursor: 0,
                },
              ],
              cursors: [
                {
                  position: 0,
                  name: '',
                  isBlinking: false,
                  selection: { start: 0, end: 2 },
                },
              ],
              text: 'abc',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeSelectLeft,
                delay: 100,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should when expand left is the last action start repeating, and reset the selection', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeSelectLeft,
                delay: 50,
                cursor: 0,
              },
            ],
            repeat: true,
            blinkAfter: 1000,
            text: 'abc',
            cursors: [
              { position: 0, name: '', selection: { start: 0, end: 3 } },
            ],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeSelectLeft,
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [
              {
                position: 0,
                name: '',
                isBlinking: true,
                selection: { start: 0, end: 3 },
              },
            ],
            text: 'abc',
            blinkAfter: 1000,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: true,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeSelectLeft,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 1, name: '', isBlinking: false }],
              text: '😄',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeSelectLeft,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [
                {
                  position: 0,
                  name: '',
                  isBlinking: false,
                  selection: { start: 0, end: 1 },
                },
              ],
              text: '😄',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeSelectLeft,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeSelectLeft,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [
                {
                  position: 0,
                  name: '',
                  isBlinking: true,
                  selection: { start: 0, end: 3 },
                },
              ],
              text: 'abc',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'REPEATING',
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });
      });

      describe('select expand right', () => {
        it('should know how to expand a selection from the start to the middle', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeSelectRight,
                delay: 100,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'abc',
            cursors: [
              { position: 1, name: '', selection: { start: 0, end: 1 } },
            ],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeSelectRight,
                delay: 100,
                cursor: 0,
              },
            ],
            cursors: [
              {
                position: 1,
                name: '',
                isBlinking: true,
                selection: { start: 0, end: 1 },
              },
            ],
            text: 'abc',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(100);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeSelectRight,
                  delay: 100,
                  cursor: 0,
                },
              ],
              cursors: [
                {
                  position: 2,
                  name: '',
                  isBlinking: false,
                  selection: { start: 0, end: 2 },
                },
              ],
              text: 'abc',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeSelectRight,
                delay: 100,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should know how to expand a selection from the middle to the end', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeSelectRight,
                delay: 100,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'abc',
            cursors: [
              { position: 2, name: '', selection: { start: 1, end: 2 } },
            ],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeSelectRight,
                delay: 100,
                cursor: 0,
              },
            ],
            cursors: [
              {
                position: 2,
                name: '',
                isBlinking: true,
                selection: { start: 1, end: 2 },
              },
            ],
            text: 'abc',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(100);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeSelectRight,
                  delay: 100,
                  cursor: 0,
                },
              ],
              cursors: [
                {
                  position: 3,
                  name: '',
                  isBlinking: false,
                  selection: { start: 1, end: 3 },
                },
              ],
              text: 'abc',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeSelectRight,
                delay: 100,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should ignore expand selection when on the end and continue the animation', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeSelectRight,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: 'z',
                delay: 50,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'abc',
            cursors: [
              { position: 3, name: '', selection: { start: 0, end: 3 } },
            ],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeSelectRight,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: 'z',
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [
              {
                position: 3,
                name: '',
                isBlinking: true,
                selection: { start: 0, end: 3 },
              },
            ],
            text: 'abc',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          // It should ignore the action
          jest.advanceTimersByTime(50);
          expect(subscriber).toBeCalledTimes(0);

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeSelectRight,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: 'z',
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 1, name: '', isBlinking: false }],
              text: 'z',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: 'z',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should be able to finish from a expand right from the end which is ignored', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeSelectRight,
                delay: 100,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'abc',
            cursors: [
              { position: 3, name: '', selection: { start: 0, end: 3 } },
            ],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeSelectRight,
                delay: 100,
                cursor: 0,
              },
            ],
            cursors: [
              {
                position: 3,
                name: '',
                isBlinking: true,
                selection: { start: 0, end: 3 },
              },
            ],
            text: 'abc',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(100);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeSelectRight,
                  delay: 100,
                  cursor: 0,
                },
              ],
              cursors: [
                {
                  position: 3,
                  name: '',
                  isBlinking: false,
                  selection: { start: 0, end: 3 },
                },
              ],
              text: 'abc',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeSelectRight,
                delay: 100,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should when expand right is the last action start repeating, and reset the selection', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeLeft,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeSelectRight,
                delay: 50,
                cursor: 0,
              },
            ],
            repeat: true,
            blinkAfter: 1000,
            text: 'abc',
            cursors: [
              { position: 0, name: '', selection: { start: 0, end: 3 } },
            ],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeLeft,
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: typewriterActionTypeSelectRight,
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [
              {
                position: 0,
                name: '',
                isBlinking: true,
                selection: { start: 0, end: 3 },
              },
            ],
            text: 'abc',
            blinkAfter: 1000,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: true,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeLeft,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeSelectRight,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 1, name: '', isBlinking: false }],
              text: '😄',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'keyboard',
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeLeft,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeSelectRight,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [{ position: 0, name: '', isBlinking: false }],
              text: '😄',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeLeft,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeLeft,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeSelectRight,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [
                {
                  position: 1,
                  name: '',
                  isBlinking: false,
                  selection: { start: 0, end: 1 },
                },
              ],
              text: '😄',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'CHANGED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeSelectRight,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeLeft,
                  delay: 50,
                  cursor: 0,
                },
                {
                  type: 'keyboard',
                  key: typewriterActionTypeSelectRight,
                  delay: 50,
                  cursor: 0,
                },
              ],
              cursors: [
                {
                  position: 0,
                  name: '',
                  isBlinking: true,
                  selection: { start: 0, end: 3 },
                },
              ],
              text: 'abc',
              blinkAfter: 1000,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: true,
              repeatDelay: 0,
            },
            {
              type: 'REPEATING',
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });
      });
    });
  });

  describe('multiple cursors', () => {
    it('should know how to do a basic text animation from start to finish', () => {
      const typewriter = new Typewriter({
        actions: [
          {
            type: 'keyboard',
            key: 'o',
            delay: 100,
            cursor: 2,
          },
          {
            type: 'keyboard',
            key: 'o',
            delay: 100,
            cursor: 1,
          },
          {
            type: 'keyboard',
            key: 'e',
            delay: 100,
            cursor: 0,
          },
        ],
        blinkAfter: 50,
        text: 'hllwrld',
        cursors: [
          { position: 1, name: 'bert' },
          { position: 3, name: 'annie' },
          { position: 4, name: 'hank' },
        ],
      });
      const subscriber = autoSubscribe(typewriter);

      assertState(typewriter, {
        history: [],
        actions: [
          {
            type: 'keyboard',
            key: 'o',
            delay: 100,
            cursor: 2,
          },
          {
            type: 'keyboard',
            key: 'o',
            delay: 100,
            cursor: 1,
          },
          {
            type: 'keyboard',
            key: 'e',
            delay: 100,
            cursor: 0,
          },
        ],
        cursors: [
          { position: 1, name: 'bert', isBlinking: true, selection: undefined },
          {
            position: 3,
            name: 'annie',
            isBlinking: true,
            selection: undefined,
          },
          { position: 4, name: 'hank', isBlinking: true, selection: undefined },
        ],
        text: 'hllwrld',
        blinkAfter: 50,
        isPlaying: true,
        isFinished: false,
        hasBeenStoppedBefore: false,
        repeat: false,
        repeatDelay: 0,
      });

      jest.advanceTimersByTime(100);

      assertLastSubscriber(
        subscriber,
        {
          history: [],
          actions: [
            {
              type: 'keyboard',
              key: 'o',
              delay: 100,
              cursor: 2,
            },
            {
              type: 'keyboard',
              key: 'o',
              delay: 100,
              cursor: 1,
            },
            {
              type: 'keyboard',
              key: 'e',
              delay: 100,
              cursor: 0,
            },
          ],
          cursors: [
            {
              position: 1,
              name: 'bert',
              isBlinking: true,
              selection: undefined,
            },
            {
              position: 3,
              name: 'annie',
              isBlinking: true,
              selection: undefined,
            },
            {
              position: 5,
              name: 'hank',
              isBlinking: false,
              selection: undefined,
            },
          ],
          text: 'hllworld',
          blinkAfter: 50,
          isPlaying: true,
          isFinished: false,
          hasBeenStoppedBefore: false,
          repeat: false,
          repeatDelay: 0,
        },
        {
          type: 'CHANGED',
          action: {
            type: 'keyboard',
            key: 'o',
            delay: 100,
            cursor: 2,
          },
          time: new Date(),
          cursor: typewriter.cursors[2],
        }
      );

      jest.advanceTimersByTime(100);

      assertLastSubscriber(
        subscriber,
        {
          history: [],
          actions: [
            {
              type: 'keyboard',
              key: 'o',
              delay: 100,
              cursor: 2,
            },
            {
              type: 'keyboard',
              key: 'o',
              delay: 100,
              cursor: 1,
            },
            {
              type: 'keyboard',
              key: 'e',
              delay: 100,
              cursor: 0,
            },
          ],
          cursors: [
            {
              position: 1,
              name: 'bert',
              isBlinking: true,
              selection: undefined,
            },
            {
              position: 4,
              name: 'annie',
              isBlinking: false,
              selection: undefined,
            },
            {
              position: 6,
              name: 'hank',
              isBlinking: true,
              selection: undefined,
            },
          ],
          text: 'hlloworld',
          blinkAfter: 50,
          isPlaying: true,
          isFinished: false,
          hasBeenStoppedBefore: false,
          repeat: false,
          repeatDelay: 0,
        },
        {
          type: 'CHANGED',
          action: {
            type: 'keyboard',
            key: 'o',
            delay: 100,
            cursor: 1,
          },
          time: new Date(),
          cursor: typewriter.cursors[1],
        }
      );

      jest.advanceTimersByTime(100);

      assertLastSubscriber(
        subscriber,
        {
          history: [],
          actions: [
            {
              type: 'keyboard',
              key: 'o',
              delay: 100,
              cursor: 2,
            },
            {
              type: 'keyboard',
              key: 'o',
              delay: 100,
              cursor: 1,
            },
            {
              type: 'keyboard',
              key: 'e',
              delay: 100,
              cursor: 0,
            },
          ],
          cursors: [
            {
              position: 2,
              name: 'bert',
              isBlinking: false,
              selection: undefined,
            },
            {
              position: 5,
              name: 'annie',
              isBlinking: true,
              selection: undefined,
            },
            {
              position: 7,
              name: 'hank',
              isBlinking: true,
              selection: undefined,
            },
          ],
          text: 'helloworld',
          blinkAfter: 50,
          isPlaying: false,
          isFinished: true,
          hasBeenStoppedBefore: false,
          repeat: false,
          repeatDelay: 0,
        },
        {
          type: 'FINISHED',
          action: {
            type: 'keyboard',
            key: 'e',
            delay: 100,
            cursor: 0,
          },
          time: new Date(),
          cursor: typewriter.cursors[0],
        }
      );
    });

    it('should work even if one cursor does more animations than other cursors', () => {
      const typewriter = new Typewriter({
        actions: [
          {
            type: 'keyboard',
            key: 'o',
            delay: 100,
            cursor: 1,
          },
          {
            type: 'keyboard',
            key: 'w',
            delay: 100,
            cursor: 1,
          },
          {
            type: 'keyboard',
            key: 'e',
            delay: 100,
            cursor: 0,
          },
        ],
        blinkAfter: 50,
        text: 'hllorld',
        cursors: [
          { position: 1, name: 'john' },
          { position: 3, name: 'sally' },
        ],
      });
      const subscriber = autoSubscribe(typewriter);

      assertState(typewriter, {
        history: [],
        actions: [
          {
            type: 'keyboard',
            key: 'o',
            delay: 100,
            cursor: 1,
          },
          {
            type: 'keyboard',
            key: 'w',
            delay: 100,
            cursor: 1,
          },
          {
            type: 'keyboard',
            key: 'e',
            delay: 100,
            cursor: 0,
          },
        ],
        cursors: [
          { position: 1, name: 'john', isBlinking: true, selection: undefined },
          {
            position: 3,
            name: 'sally',
            isBlinking: true,
            selection: undefined,
          },
        ],
        text: 'hllorld',
        blinkAfter: 50,
        isPlaying: true,
        isFinished: false,
        hasBeenStoppedBefore: false,
        repeat: false,
        repeatDelay: 0,
      });

      jest.advanceTimersByTime(100);

      assertLastSubscriber(
        subscriber,
        {
          history: [],
          actions: [
            {
              type: 'keyboard',
              key: 'o',
              delay: 100,
              cursor: 1,
            },
            {
              type: 'keyboard',
              key: 'w',
              delay: 100,
              cursor: 1,
            },
            {
              type: 'keyboard',
              key: 'e',
              delay: 100,
              cursor: 0,
            },
          ],
          cursors: [
            {
              position: 1,
              name: 'john',
              isBlinking: true,
              selection: undefined,
            },
            {
              position: 4,
              name: 'sally',
              isBlinking: false,
              selection: undefined,
            },
          ],
          text: 'hlloorld',
          blinkAfter: 50,
          isPlaying: true,
          isFinished: false,
          hasBeenStoppedBefore: false,
          repeat: false,
          repeatDelay: 0,
        },
        {
          type: 'CHANGED',
          action: {
            type: 'keyboard',
            key: 'o',
            delay: 100,
            cursor: 1,
          },
          time: new Date(),
          cursor: typewriter.cursors[1],
        }
      );

      jest.advanceTimersByTime(100);

      assertLastSubscriber(
        subscriber,
        {
          history: [],
          actions: [
            {
              type: 'keyboard',
              key: 'o',
              delay: 100,
              cursor: 1,
            },
            {
              type: 'keyboard',
              key: 'w',
              delay: 100,
              cursor: 1,
            },
            {
              type: 'keyboard',
              key: 'e',
              delay: 100,
              cursor: 0,
            },
          ],
          cursors: [
            {
              position: 1,
              name: 'john',
              isBlinking: true,
              selection: undefined,
            },
            {
              position: 5,
              name: 'sally',
              isBlinking: false,
              selection: undefined,
            },
          ],
          text: 'hlloworld',
          blinkAfter: 50,
          isPlaying: true,
          isFinished: false,
          hasBeenStoppedBefore: false,
          repeat: false,
          repeatDelay: 0,
        },
        {
          type: 'CHANGED',
          action: {
            type: 'keyboard',
            key: 'w',
            delay: 100,
            cursor: 1,
          },
          time: new Date(),
          cursor: typewriter.cursors[1],
        }
      );

      jest.advanceTimersByTime(100);

      assertLastSubscriber(
        subscriber,
        {
          history: [],
          actions: [
            {
              type: 'keyboard',
              key: 'o',
              delay: 100,
              cursor: 1,
            },
            {
              type: 'keyboard',
              key: 'w',
              delay: 100,
              cursor: 1,
            },
            {
              type: 'keyboard',
              key: 'e',
              delay: 100,
              cursor: 0,
            },
          ],
          cursors: [
            {
              position: 2,
              name: 'john',
              isBlinking: false,
              selection: undefined,
            },
            {
              position: 6,
              name: 'sally',
              isBlinking: true,
              selection: undefined,
            },
          ],
          text: 'helloworld',
          blinkAfter: 50,
          isPlaying: false,
          isFinished: true,
          hasBeenStoppedBefore: false,
          repeat: false,
          repeatDelay: 0,
        },
        {
          type: 'FINISHED',
          action: {
            type: 'keyboard',
            key: 'e',
            delay: 100,
            cursor: 0,
          },
          time: new Date(),
          cursor: typewriter.cursors[0],
        }
      );
    });

    describe('backspace is pressed', () => {
      describe('cursor movement', () => {
        it('should do nothing (except blink cursor) when removing from the start, when cursor is already on the start', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 100,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'john',
            cursors: [
              { position: 0, name: '' },

              { position: 2, name: '' },
              { position: 3, name: '' },
              { position: 1, name: '' },
              { position: 0, name: '' },
              { position: 4, name: '' },
            ],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 100,
                cursor: 0,
              },
            ],
            cursors: [
              { position: 0, name: '', isBlinking: true, selection: undefined },
              { position: 2, name: '', isBlinking: true, selection: undefined },
              { position: 3, name: '', isBlinking: true, selection: undefined },
              { position: 1, name: '', isBlinking: true, selection: undefined },
              { position: 0, name: '', isBlinking: true, selection: undefined },
              { position: 4, name: '', isBlinking: true, selection: undefined },
            ],
            text: 'john',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(100);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeBackspace,
                  delay: 100,
                  cursor: 0,
                },
              ],
              cursors: [
                {
                  position: 0,
                  name: '',
                  isBlinking: false,
                  selection: undefined,
                },
                {
                  position: 2,
                  name: '',
                  isBlinking: true,
                  selection: undefined,
                },
                {
                  position: 3,
                  name: '',
                  isBlinking: true,
                  selection: undefined,
                },
                {
                  position: 1,
                  name: '',
                  isBlinking: true,
                  selection: undefined,
                },
                {
                  position: 0,
                  name: '',
                  isBlinking: true,
                  selection: undefined,
                },
                {
                  position: 4,
                  name: '',
                  isBlinking: true,
                  selection: undefined,
                },
              ],
              text: 'john',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 100,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should move cursors that are after or on the cursor one place backwards, and cursors that lie before should stay in position, when removing from the middle', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 100,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'john',
            cursors: [
              { position: 2, name: '' },
              { position: 2, name: '' },
              { position: 3, name: '' },
              { position: 1, name: '' },
              { position: 0, name: '' },
              { position: 4, name: '' },
            ],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 100,
                cursor: 0,
              },
            ],
            cursors: [
              { position: 2, name: '', isBlinking: true, selection: undefined },
              { position: 2, name: '', isBlinking: true, selection: undefined },
              { position: 3, name: '', isBlinking: true, selection: undefined },
              { position: 1, name: '', isBlinking: true, selection: undefined },
              { position: 0, name: '', isBlinking: true, selection: undefined },
              { position: 4, name: '', isBlinking: true, selection: undefined },
            ],
            text: 'john',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(100);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeBackspace,
                  delay: 100,
                  cursor: 0,
                },
              ],
              cursors: [
                {
                  position: 1,
                  name: '',
                  isBlinking: false,
                  selection: undefined,
                },
                {
                  position: 1,
                  name: '',
                  isBlinking: true,
                  selection: undefined,
                },
                {
                  position: 2,
                  name: '',
                  isBlinking: true,
                  selection: undefined,
                },
                {
                  position: 1,
                  name: '',
                  isBlinking: true,
                  selection: undefined,
                },
                {
                  position: 0,
                  name: '',
                  isBlinking: true,
                  selection: undefined,
                },
                {
                  position: 3,
                  name: '',
                  isBlinking: true,
                  selection: undefined,
                },
              ],
              text: 'jhn',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 100,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should move cursors that are after or on the cursor one place backwards, and cursors that lie before should stay in position, when removing from the end', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 100,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'john',
            cursors: [
              { position: 4, name: '' },
              { position: 2, name: '' },
              { position: 3, name: '' },
              { position: 1, name: '' },
              { position: 0, name: '' },
              { position: 4, name: '' },
            ],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 100,
                cursor: 0,
              },
            ],
            cursors: [
              { position: 4, name: '', isBlinking: true, selection: undefined },
              { position: 2, name: '', isBlinking: true, selection: undefined },
              { position: 3, name: '', isBlinking: true, selection: undefined },
              { position: 1, name: '', isBlinking: true, selection: undefined },
              { position: 0, name: '', isBlinking: true, selection: undefined },
              { position: 4, name: '', isBlinking: true, selection: undefined },
            ],
            text: 'john',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(100);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeBackspace,
                  delay: 100,
                  cursor: 0,
                },
              ],
              cursors: [
                {
                  position: 3,
                  name: '',
                  isBlinking: false,
                  selection: undefined,
                },
                {
                  position: 2,
                  name: '',
                  isBlinking: true,
                  selection: undefined,
                },
                {
                  position: 3,
                  name: '',
                  isBlinking: true,
                  selection: undefined,
                },
                {
                  position: 1,
                  name: '',
                  isBlinking: true,
                  selection: undefined,
                },
                {
                  position: 0,
                  name: '',
                  isBlinking: true,
                  selection: undefined,
                },
                {
                  position: 3,
                  name: '',
                  isBlinking: true,
                  selection: undefined,
                },
              ],
              text: 'joh',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 100,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });
      });

      describe('deleting cursor has no selection', () => {
        it('should reduce, remove or keep selection of other cursors, when removing from the start', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 100,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'aap noot mies',
            cursors: [
              // The cursor that is going to hit backspace, between the first a of aap
              { position: 1, name: '' },

              // Selects 'a' becomes undefined
              { position: 0, name: 'a', selection: { start: 0, end: 1 } },
              // Selects 'aa', becomes 'a', 0 - 1
              { position: 2, name: 'aa', selection: { start: 0, end: 2 } },
              // Selects 'aap' becomes 'ap', 0 - 2
              { position: 0, name: 'aap', selection: { start: 0, end: 3 } },

              // Selects 'ap', stays 'ap', 0 - 2
              { position: 3, name: 'ap', selection: { start: 1, end: 3 } },
            ],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 100,
                cursor: 0,
              },
            ],
            cursors: [
              { position: 1, name: '', isBlinking: true },
              {
                position: 0,
                name: 'a',
                selection: { start: 0, end: 1 },
                isBlinking: true,
              },
              {
                position: 2,
                name: 'aa',
                selection: { start: 0, end: 2 },
                isBlinking: true,
              },
              {
                position: 0,
                name: 'aap',
                selection: { start: 0, end: 3 },
                isBlinking: true,
              },
              {
                position: 3,
                name: 'ap',
                selection: { start: 1, end: 3 },
                isBlinking: true,
              },
            ],
            text: 'aap noot mies',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(100);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeBackspace,
                  delay: 100,
                  cursor: 0,
                },
              ],
              cursors: [
                {
                  position: 0,
                  name: '',
                  selection: undefined,
                  isBlinking: false,
                },
                {
                  position: 0,
                  name: 'a',
                  selection: undefined,
                  isBlinking: true,
                },
                {
                  position: 1,
                  name: 'aa',
                  selection: { start: 0, end: 1 },
                  isBlinking: true,
                },
                {
                  position: 0,
                  name: 'aap',
                  selection: { start: 0, end: 2 },
                  isBlinking: true,
                },
                {
                  position: 2,
                  name: 'ap',
                  selection: { start: 0, end: 2 },
                  isBlinking: true,
                },
              ],
              text: 'ap noot mies',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 100,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should reduce, remove or keep selection of other cursors, when removing from the middle', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 100,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'aap noot mies',
            cursors: [
              // The cursor that is going to hit backspace, between the oo's
              { position: 6, name: '' },

              {
                position: 13,
                name: 'aap noot mies',
                selection: { start: 0, end: 13 },
              },
              // Selects 'aap' stays 'aap', 0 - 3
              { position: 3, name: 'aap', selection: { start: 0, end: 3 } },
              // Selects 'noot', becomes 'not', 4 - 7
              { position: 4, name: 'noot', selection: { start: 4, end: 8 } },
              // Selects 'mies' stays 'mies', 8 - 12
              { position: 13, name: 'mies', selection: { start: 9, end: 13 } },

              // Selects 'p noot', becomes 'p not', 2 - 6
              { position: 2, name: 'p noo', selection: { start: 2, end: 7 } },
              // Selects 'ot mi', stays 'ot mi', 5 - 10
              { position: 11, name: 'ot mi', selection: { start: 6, end: 11 } },
              // Selects 'p no', becomes 'p n', 2 - 5
              { position: 2, name: 'p no', selection: { start: 2, end: 6 } },
              // Selects 'oot m', becomes 'ot m', 5 - 9
              { position: 10, name: 'oot m', selection: { start: 5, end: 10 } },
              // Selects 'aap noot mies', becomes 'aap not mies', 0 - 12

              // Selects 'aap n' stays 'aap n', 0 - 5
              { position: 5, name: 'aap n', selection: { start: 0, end: 5 } },
              // Selects 't mies' stays 't mies', 6 - 12
              { position: 7, name: 't mies', selection: { start: 7, end: 13 } },

              // Selects 'oo', becomes 'o', 5 - 6
              {
                position: 5,
                name: 'oo',
                selection: { start: 5, end: 7 },
              },

              // Selects 'o', becomes undefined
              {
                position: 6,
                name: 'o',
                selection: { start: 5, end: 6 },
              },
            ],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 100,
                cursor: 0,
              },
            ],
            cursors: [
              { position: 6, name: '', selection: undefined, isBlinking: true },
              {
                position: 13,
                name: 'aap noot mies',
                selection: { start: 0, end: 13 },
                isBlinking: true,
              },
              {
                position: 3,
                name: 'aap',
                selection: { start: 0, end: 3 },
                isBlinking: true,
              },
              {
                position: 4,
                name: 'noot',
                selection: { start: 4, end: 8 },
                isBlinking: true,
              },
              {
                position: 13,
                name: 'mies',
                selection: { start: 9, end: 13 },
                isBlinking: true,
              },
              {
                position: 2,
                name: 'p noo',
                selection: { start: 2, end: 7 },
                isBlinking: true,
              },
              {
                position: 11,
                name: 'ot mi',
                selection: { start: 6, end: 11 },
                isBlinking: true,
              },
              {
                position: 2,
                name: 'p no',
                selection: { start: 2, end: 6 },
                isBlinking: true,
              },
              {
                position: 10,
                name: 'oot m',
                selection: { start: 5, end: 10 },
                isBlinking: true,
              },
              {
                position: 5,
                name: 'aap n',
                selection: { start: 0, end: 5 },
                isBlinking: true,
              },
              {
                position: 7,
                name: 't mies',
                selection: { start: 7, end: 13 },
                isBlinking: true,
              },
              {
                position: 5,
                name: 'oo',
                selection: { start: 5, end: 7 },
                isBlinking: true,
              },
              {
                position: 6,
                name: 'o',
                selection: { start: 5, end: 6 },
                isBlinking: true,
              },
            ],
            text: 'aap noot mies',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(100);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeBackspace,
                  delay: 100,
                  cursor: 0,
                },
              ],
              cursors: [
                {
                  position: 5,
                  name: '',
                  selection: undefined,
                  isBlinking: false,
                },
                {
                  position: 12,
                  name: 'aap noot mies',
                  selection: { start: 0, end: 12 },
                  isBlinking: true,
                },
                {
                  position: 3,
                  name: 'aap',
                  selection: { start: 0, end: 3 },
                  isBlinking: true,
                },
                {
                  position: 4,
                  name: 'noot',
                  selection: { start: 4, end: 7 },
                  isBlinking: true,
                },
                {
                  position: 12,
                  name: 'mies',
                  selection: { start: 8, end: 12 },
                  isBlinking: true,
                },
                {
                  position: 2,
                  name: 'p noo',
                  selection: { start: 2, end: 6 },
                  isBlinking: true,
                },
                {
                  position: 10,
                  name: 'ot mi',
                  selection: { start: 5, end: 10 },
                  isBlinking: true,
                },
                {
                  position: 2,
                  name: 'p no',
                  selection: { start: 2, end: 5 },
                  isBlinking: true,
                },
                {
                  position: 9,
                  name: 'oot m',
                  selection: { start: 5, end: 9 },
                  isBlinking: true,
                },
                {
                  position: 5,
                  name: 'aap n',
                  selection: { start: 0, end: 5 },
                  isBlinking: true,
                },
                {
                  position: 6,
                  name: 't mies',
                  selection: { start: 6, end: 12 },
                  isBlinking: true,
                },
                {
                  position: 5,
                  name: 'oo',
                  selection: { start: 5, end: 6 },
                  isBlinking: true,
                },
                {
                  position: 5,
                  name: 'o',
                  selection: undefined,
                  isBlinking: true,
                },
              ],
              text: 'aap not mies',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 100,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should reduce, remove or keep selection of other cursors, when removing from the end', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 100,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'aap noot mies',
            cursors: [
              // The cursor that is going to hit backspace, on the last position
              { position: 13, name: '' },

              // Selects 's' becomes undefined
              { position: 12, name: 's', selection: { start: 12, end: 13 } },
              // Selects 'es', becomes 'e', 11 - 12
              { position: 13, name: 'es', selection: { start: 11, end: 13 } },
              // Selects 'ies' becomes 'ie', 10 - 12
              { position: 10, name: 'ies', selection: { start: 10, end: 13 } },

              // Selects 'mie', stays 'mie', 9 - 12
              { position: 9, name: 'mie', selection: { start: 9, end: 12 } },
            ],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 100,
                cursor: 0,
              },
            ],
            cursors: [
              { position: 13, name: '', isBlinking: true },
              {
                position: 12,
                name: 's',
                selection: { start: 12, end: 13 },
                isBlinking: true,
              },
              {
                position: 13,
                name: 'es',
                selection: { start: 11, end: 13 },
                isBlinking: true,
              },
              {
                position: 10,
                name: 'ies',
                selection: { start: 10, end: 13 },
                isBlinking: true,
              },
              {
                position: 9,
                name: 'mie',
                selection: { start: 9, end: 12 },
                isBlinking: true,
              },
            ],
            text: 'aap noot mies',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(100);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeBackspace,
                  delay: 100,
                  cursor: 0,
                },
              ],
              cursors: [
                // The cursor that is going to hit backspace, on the last position
                {
                  position: 12,
                  name: '',
                  selection: undefined,
                  isBlinking: false,
                },
                {
                  position: 12,
                  name: 's',
                  selection: undefined,
                  isBlinking: true,
                },
                {
                  position: 12,
                  name: 'es',
                  selection: { start: 11, end: 12 },
                  isBlinking: true,
                },
                {
                  position: 10,
                  name: 'ies',
                  selection: { start: 10, end: 12 },
                  isBlinking: true,
                },
                {
                  position: 9,
                  name: 'mie',
                  selection: { start: 9, end: 12 },
                  isBlinking: true,
                },
              ],
              text: 'aap noot mie',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 100,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });
      });

      describe('deleting cursor has selection', () => {
        it('should reduce, remove or keep selection of other cursors, when removing from the start', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 100,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'aap noot mies',
            cursors: [
              // The cursor that is going to hit backspace, selects the aa's
              { position: 0, name: '', selection: { start: 0, end: 2 } },

              // Selects 'a' becomes undefined
              { position: 0, name: 'a', selection: { start: 0, end: 1 } },
              // Selects 'aa', becomes undefined
              { position: 2, name: 'aa', selection: { start: 0, end: 2 } },
              // Selects 'aap' becomes 'p', 0 - 1
              { position: 0, name: 'aap', selection: { start: 0, end: 3 } },

              // Selects 'p n', stays 'p n', 0 - 3
              { position: 5, name: 'p n', selection: { start: 2, end: 5 } },
            ],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 100,
                cursor: 0,
              },
            ],
            cursors: [
              {
                position: 0,
                name: '',
                selection: { start: 0, end: 2 },
                isBlinking: true,
              },
              {
                position: 0,
                name: 'a',
                selection: { start: 0, end: 1 },
                isBlinking: true,
              },
              {
                position: 2,
                name: 'aa',
                selection: { start: 0, end: 2 },
                isBlinking: true,
              },
              {
                position: 0,
                name: 'aap',
                selection: { start: 0, end: 3 },
                isBlinking: true,
              },
              {
                position: 5,
                name: 'p n',
                selection: { start: 2, end: 5 },
                isBlinking: true,
              },
            ],
            text: 'aap noot mies',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(100);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeBackspace,
                  delay: 100,
                  cursor: 0,
                },
              ],
              cursors: [
                {
                  position: 0,
                  name: '',
                  selection: undefined,
                  isBlinking: false,
                },
                {
                  position: 0,
                  name: 'a',
                  selection: undefined,
                  isBlinking: true,
                },
                {
                  position: 0,
                  name: 'aa',
                  selection: undefined,
                  isBlinking: true,
                },
                {
                  position: 0,
                  name: 'aap',
                  selection: { start: 0, end: 1 },
                  isBlinking: true,
                },
                {
                  position: 3,
                  name: 'p n',
                  selection: { start: 0, end: 3 },
                  isBlinking: true,
                },
              ],
              text: 'p noot mies',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 100,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should reduce, remove or keep selection of other cursors, when removing from the middle', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 100,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'aap noot mies',
            cursors: [
              // The cursor that is going to hit backspace, selects the oo's
              { position: 5, name: '', selection: { start: 5, end: 7 } },
              // Selects 'aap' stays 'aap', 0 - 3
              { position: 3, name: 'aap', selection: { start: 0, end: 3 } },
              // Selects 'noot', becomes 'nt', 4 - 6
              { position: 4, name: 'noot', selection: { start: 4, end: 8 } },
              // Selects 'mies' stays 'mies', 7 - 11
              { position: 13, name: 'mies', selection: { start: 9, end: 13 } },
              // Selects 'p noot', becomes 'p nt', 2 - 6
              { position: 2, name: 'p noot', selection: { start: 2, end: 8 } },
              // Selects 'ot mi', becomes 't mi', 5 - 9
              { position: 11, name: 'ot mi', selection: { start: 6, end: 11 } },
              // Selects 't mi', stays 't mi', 5 - 9
              { position: 11, name: 't mi', selection: { start: 7, end: 11 } },
              // Selects 'p no', becomes 'p n', 2 - 5
              { position: 2, name: 'p no', selection: { start: 2, end: 6 } },
              // Selects 'oot m', becomes 't m', 5 - 8
              { position: 10, name: 'oot m', selection: { start: 5, end: 10 } },
              // Selects 'p noo', becomes 'p n', 2 - 5
              { position: 7, name: 'p noo', selection: { start: 2, end: 7 } },
              // Selects 'oot m', becomes 't m', 5 - 8
              // Selects 'aap noot mies', becomes 'aap nt mies', 0 - 11
              {
                position: 13,
                name: 'aap noot mies',
                selection: { start: 0, end: 13 },
              },
              // Selects 'noot mies', becomes 'nt mies' 4 - 11
              {
                position: 4,
                name: 'noot mies',
                selection: { start: 4, end: 13 },
              },
              // Selects 'oo', becomes undefined
              {
                position: 5,
                name: 'oo',
                selection: { start: 5, end: 7 },
              },
            ],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 100,
                cursor: 0,
              },
            ],
            cursors: [
              {
                position: 5,
                name: '',
                selection: { start: 5, end: 7 },
                isBlinking: true,
              },
              {
                position: 3,
                name: 'aap',
                selection: { start: 0, end: 3 },
                isBlinking: true,
              },
              {
                position: 4,
                name: 'noot',
                selection: { start: 4, end: 8 },
                isBlinking: true,
              },
              {
                position: 13,
                name: 'mies',
                selection: { start: 9, end: 13 },
                isBlinking: true,
              },
              {
                position: 2,
                name: 'p noot',
                selection: { start: 2, end: 8 },
                isBlinking: true,
              },
              {
                position: 11,
                name: 'ot mi',
                selection: { start: 6, end: 11 },
                isBlinking: true,
              },
              {
                position: 11,
                name: 't mi',
                selection: { start: 7, end: 11 },
                isBlinking: true,
              },
              {
                position: 2,
                name: 'p no',
                selection: { start: 2, end: 6 },
                isBlinking: true,
              },
              {
                position: 10,
                name: 'oot m',
                selection: { start: 5, end: 10 },
                isBlinking: true,
              },
              {
                position: 7,
                name: 'p noo',
                selection: { start: 2, end: 7 },
                isBlinking: true,
              },
              {
                position: 13,
                name: 'aap noot mies',
                selection: { start: 0, end: 13 },
                isBlinking: true,
              },
              {
                position: 4,
                name: 'noot mies',
                selection: { start: 4, end: 13 },
                isBlinking: true,
              },
              {
                position: 5,
                name: 'oo',
                selection: { start: 5, end: 7 },
                isBlinking: true,
              },
            ],
            text: 'aap noot mies',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(100);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeBackspace,
                  delay: 100,
                  cursor: 0,
                },
              ],
              cursors: [
                {
                  position: 5,
                  name: '',
                  selection: undefined,
                  isBlinking: false,
                },
                {
                  position: 3,
                  name: 'aap',
                  selection: { start: 0, end: 3 },
                  isBlinking: true,
                },
                {
                  position: 4,
                  name: 'noot',
                  selection: { start: 4, end: 6 },
                  isBlinking: true,
                },
                {
                  position: 11,
                  name: 'mies',
                  selection: { start: 7, end: 11 },
                  isBlinking: true,
                },
                {
                  position: 2,
                  name: 'p noot',
                  selection: { start: 2, end: 6 },
                  isBlinking: true,
                },
                {
                  position: 9,
                  name: 'ot mi',
                  selection: { start: 5, end: 9 },
                  isBlinking: true,
                },
                {
                  position: 9,
                  name: 't mi',
                  selection: { start: 5, end: 9 },
                  isBlinking: true,
                },
                {
                  position: 2,
                  name: 'p no',
                  selection: { start: 2, end: 5 },
                  isBlinking: true,
                },
                {
                  position: 8,
                  name: 'oot m',
                  selection: { start: 5, end: 8 },
                  isBlinking: true,
                },
                {
                  position: 5,
                  name: 'p noo',
                  selection: { start: 2, end: 5 },
                  isBlinking: true,
                },
                {
                  position: 11,
                  name: 'aap noot mies',
                  selection: { start: 0, end: 11 },
                  isBlinking: true,
                },
                {
                  position: 4,
                  name: 'noot mies',
                  selection: { start: 4, end: 11 },
                  isBlinking: true,
                },
                {
                  position: 5,
                  name: 'oo',
                  selection: undefined,
                  isBlinking: true,
                },
              ],
              text: 'aap nt mies',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 100,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should reduce, remove or keep selection of other cursors, when removing from the end', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 100,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'aap noot mies',
            cursors: [
              // The cursor that is going to hit backspace, on es
              { position: 11, name: '', selection: { start: 11, end: 13 } },

              // Selects 's' becomes undefined
              { position: 12, name: 's', selection: { start: 12, end: 13 } },
              // Selects 'es', becomes undefined
              { position: 13, name: 'es', selection: { start: 11, end: 13 } },
              // Selects 'ies' becomes 'i', 10 - 11
              { position: 10, name: 'ies', selection: { start: 10, end: 13 } },
              // Selects 'mie', becomes 'mi', 9 - 11
              { position: 9, name: 'mie', selection: { start: 9, end: 12 } },
              // Selects 'mi', stays 'mi', 9 - 11
              { position: 9, name: 'mi', selection: { start: 9, end: 11 } },
            ],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 100,
                cursor: 0,
              },
            ],
            cursors: [
              {
                position: 11,
                name: '',
                selection: { start: 11, end: 13 },
                isBlinking: true,
              },
              {
                position: 12,
                name: 's',
                selection: { start: 12, end: 13 },
                isBlinking: true,
              },
              {
                position: 13,
                name: 'es',
                selection: { start: 11, end: 13 },
                isBlinking: true,
              },
              {
                position: 10,
                name: 'ies',
                selection: { start: 10, end: 13 },
                isBlinking: true,
              },
              {
                position: 9,
                name: 'mie',
                selection: { start: 9, end: 12 },
                isBlinking: true,
              },
              {
                position: 9,
                name: 'mi',
                selection: { start: 9, end: 11 },
                isBlinking: true,
              },
            ],
            text: 'aap noot mies',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(100);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: typewriterActionTypeBackspace,
                  delay: 100,
                  cursor: 0,
                },
              ],
              cursors: [
                // The cursor that is going to hit backspace, on es
                {
                  position: 11,
                  name: '',
                  selection: undefined,
                  isBlinking: false,
                },
                {
                  position: 11,
                  name: 's',
                  selection: undefined,
                  isBlinking: true,
                },
                {
                  position: 11,
                  name: 'es',
                  selection: undefined,
                  isBlinking: true,
                },
                {
                  position: 10,
                  name: 'ies',
                  selection: { start: 10, end: 11 },
                  isBlinking: true,
                },
                {
                  position: 9,
                  name: 'mie',
                  selection: { start: 9, end: 11 },
                  isBlinking: true,
                },
                {
                  position: 9,
                  name: 'mi',
                  selection: { start: 9, end: 11 },
                  isBlinking: true,
                },
              ],
              text: 'aap noot mi',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: typewriterActionTypeBackspace,
                delay: 100,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });
      });
    });

    describe('char is inserted', () => {
      describe('cursor movement', () => {
        it('should move cursors that are before the cursor one place forwards, and cursors that lie before or on should stay in position, when inserting at the start', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: 'j',
                delay: 100,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'ohn',
            cursors: [
              { position: 0, name: '' },

              { position: 0, name: '' },
              { position: 2, name: '' },
              { position: 1, name: '' },
              { position: 3, name: '' },
            ],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: 'j',
                delay: 100,
                cursor: 0,
              },
            ],
            cursors: [
              { position: 0, name: '', isBlinking: true, selection: undefined },
              { position: 0, name: '', isBlinking: true, selection: undefined },
              { position: 2, name: '', isBlinking: true, selection: undefined },
              { position: 1, name: '', isBlinking: true, selection: undefined },
              { position: 3, name: '', isBlinking: true, selection: undefined },
            ],
            text: 'ohn',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(100);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: 'j',
                  delay: 100,
                  cursor: 0,
                },
              ],
              cursors: [
                {
                  position: 1,
                  name: '',
                  isBlinking: false,
                  selection: undefined,
                },
                {
                  position: 0,
                  name: '',
                  isBlinking: true,
                  selection: undefined,
                },
                {
                  position: 3,
                  name: '',
                  isBlinking: true,
                  selection: undefined,
                },
                {
                  position: 2,
                  name: '',
                  isBlinking: true,
                  selection: undefined,
                },
                {
                  position: 4,
                  name: '',
                  isBlinking: true,
                  selection: undefined,
                },
              ],
              text: 'john',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: 'j',
                delay: 100,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should move cursors that are after or on the cursor one place backwards, and cursors that lie before should stay in position, when inserting at the middle', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: 'x',
                delay: 100,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'john',
            cursors: [
              { position: 2, name: '' },
              { position: 2, name: '' },
              { position: 3, name: '' },
              { position: 1, name: '' },
              { position: 0, name: '' },
              { position: 4, name: '' },
            ],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: 'x',
                delay: 100,
                cursor: 0,
              },
            ],
            cursors: [
              { position: 2, name: '', isBlinking: true, selection: undefined },
              { position: 2, name: '', isBlinking: true, selection: undefined },
              { position: 3, name: '', isBlinking: true, selection: undefined },
              { position: 1, name: '', isBlinking: true, selection: undefined },
              { position: 0, name: '', isBlinking: true, selection: undefined },
              { position: 4, name: '', isBlinking: true, selection: undefined },
            ],
            text: 'john',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(100);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: 'x',
                  delay: 100,
                  cursor: 0,
                },
              ],
              cursors: [
                {
                  position: 3,
                  name: '',
                  isBlinking: false,
                  selection: undefined,
                },
                {
                  position: 2,
                  name: '',
                  isBlinking: true,
                  selection: undefined,
                },
                {
                  position: 4,
                  name: '',
                  isBlinking: true,
                  selection: undefined,
                },
                {
                  position: 1,
                  name: '',
                  isBlinking: true,
                  selection: undefined,
                },
                {
                  position: 0,
                  name: '',
                  isBlinking: true,
                  selection: undefined,
                },
                {
                  position: 5,
                  name: '',
                  isBlinking: true,
                  selection: undefined,
                },
              ],
              text: 'joxhn',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: 'x',
                delay: 100,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should not alter other cursors positions, when inserting at the end', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: 'x',
                delay: 100,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'john',
            cursors: [
              { position: 4, name: '' },
              { position: 2, name: '' },
              { position: 3, name: '' },
              { position: 1, name: '' },
              { position: 0, name: '' },
              { position: 4, name: '' },
            ],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: 'x',
                delay: 100,
                cursor: 0,
              },
            ],
            cursors: [
              { position: 4, name: '', isBlinking: true, selection: undefined },
              { position: 2, name: '', isBlinking: true, selection: undefined },
              { position: 3, name: '', isBlinking: true, selection: undefined },
              { position: 1, name: '', isBlinking: true, selection: undefined },
              { position: 0, name: '', isBlinking: true, selection: undefined },
              { position: 4, name: '', isBlinking: true, selection: undefined },
            ],
            text: 'john',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(100);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: 'x',
                  delay: 100,
                  cursor: 0,
                },
              ],
              cursors: [
                {
                  position: 5,
                  name: '',
                  isBlinking: false,
                  selection: undefined,
                },
                {
                  position: 2,
                  name: '',
                  isBlinking: true,
                  selection: undefined,
                },
                {
                  position: 3,
                  name: '',
                  isBlinking: true,
                  selection: undefined,
                },
                {
                  position: 1,
                  name: '',
                  isBlinking: true,
                  selection: undefined,
                },
                {
                  position: 0,
                  name: '',
                  isBlinking: true,
                  selection: undefined,
                },
                {
                  position: 4,
                  name: '',
                  isBlinking: true,
                  selection: undefined,
                },
              ],
              text: 'johnx',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: 'x',
                delay: 100,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should alter other cursors positions, when inserting at the start', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: 'x',
                delay: 100,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'john',
            cursors: [
              { position: 0, name: '' },
              { position: 2, name: '' },
              { position: 3, name: '' },
              { position: 1, name: '' },
              { position: 0, name: '' },
              { position: 4, name: '' },
            ],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: 'x',
                delay: 100,
                cursor: 0,
              },
            ],
            cursors: [
              { position: 0, name: '', isBlinking: true, selection: undefined },
              { position: 2, name: '', isBlinking: true, selection: undefined },
              { position: 3, name: '', isBlinking: true, selection: undefined },
              { position: 1, name: '', isBlinking: true, selection: undefined },
              { position: 0, name: '', isBlinking: true, selection: undefined },
              { position: 4, name: '', isBlinking: true, selection: undefined },
            ],
            text: 'john',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(100);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: 'x',
                  delay: 100,
                  cursor: 0,
                },
              ],
              cursors: [
                {
                  position: 1,
                  name: '',
                  isBlinking: false,
                  selection: undefined,
                },
                {
                  position: 3,
                  name: '',
                  isBlinking: true,
                  selection: undefined,
                },
                {
                  position: 4,
                  name: '',
                  isBlinking: true,
                  selection: undefined,
                },
                {
                  position: 2,
                  name: '',
                  isBlinking: true,
                  selection: undefined,
                },
                {
                  position: 0,
                  name: '',
                  isBlinking: true,
                  selection: undefined,
                },
                {
                  position: 5,
                  name: '',
                  isBlinking: true,
                  selection: undefined,
                },
              ],
              text: 'xjohn',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: 'x',
                delay: 100,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });
      });

      describe('inserting cursor has no selection', () => {
        it('should increase or keep selection of other cursors, when inserting at the start', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: 'a',
                delay: 100,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'ap noot mies',
            cursors: [
              // The cursor that is going to insert 'a' at the start
              { position: 0, name: '' },

              // Selects 'a' becomes 'aa', 0 - 2, pos stays 0
              { position: 0, name: 'a', selection: { start: 0, end: 1 } },
              // Selects 'ap', becomes 'aap', 0 - 3, pos stays 0
              { position: 0, name: 'ap', selection: { start: 0, end: 2 } },
              // Selects 'ap ' becomes 'aap ', 0 - 4, pos stays 0
              { position: 0, name: 'ap ', selection: { start: 0, end: 3 } },

              // Selects 'a' becomes 'aa', 0 - 2, pos becomes 2
              { position: 1, name: 'a', selection: { start: 0, end: 1 } },
              // Selects 'ap', becomes 'aap', 0 - 3, pos becomes 3
              { position: 2, name: 'ap', selection: { start: 0, end: 2 } },
              // Selects 'ap ' becomes 'aap ', 0 - 4, pos becomes 4
              { position: 3, name: 'ap ', selection: { start: 0, end: 3 } },

              // Selects 'p', stays 'p', 2 - 3, pos becomes 2
              { position: 1, name: 'p', selection: { start: 1, end: 2 } },
              // Selects 'p ', stays 'p ', 2 - 4, pos becomes 2
              { position: 1, name: 'p ', selection: { start: 1, end: 3 } },

              // Selects 'p', stays 'p', 2 - 3, pos becomes 3
              { position: 2, name: 'p', selection: { start: 1, end: 2 } },
              // Selects 'p ', stays 'p ', 2 - 4, pos becomes 4
              { position: 3, name: 'p ', selection: { start: 1, end: 3 } },
            ],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: 'a',
                delay: 100,
                cursor: 0,
              },
            ],
            cursors: [
              {
                position: 0,
                name: '',
                selection: undefined,
                isBlinking: true,
              },
              {
                position: 0,
                name: 'a',
                selection: { start: 0, end: 1 },
                isBlinking: true,
              },
              {
                position: 0,
                name: 'ap',
                selection: { start: 0, end: 2 },
                isBlinking: true,
              },
              {
                position: 0,
                name: 'ap ',
                selection: { start: 0, end: 3 },
                isBlinking: true,
              },
              {
                position: 1,
                name: 'a',
                selection: { start: 0, end: 1 },
                isBlinking: true,
              },
              {
                position: 2,
                name: 'ap',
                selection: { start: 0, end: 2 },
                isBlinking: true,
              },
              {
                position: 3,
                name: 'ap ',
                selection: { start: 0, end: 3 },
                isBlinking: true,
              },
              {
                position: 1,
                name: 'p',
                selection: { start: 1, end: 2 },
                isBlinking: true,
              },
              {
                position: 1,
                name: 'p ',
                selection: { start: 1, end: 3 },
                isBlinking: true,
              },
              {
                position: 2,
                name: 'p',
                selection: { start: 1, end: 2 },
                isBlinking: true,
              },
              {
                position: 3,
                name: 'p ',
                selection: { start: 1, end: 3 },
                isBlinking: true,
              },
            ],
            text: 'ap noot mies',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(100);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: 'a',
                  delay: 100,
                  cursor: 0,
                },
              ],
              cursors: [
                {
                  position: 1,
                  name: '',
                  selection: undefined,
                  isBlinking: false,
                },
                {
                  position: 0,
                  name: 'a',
                  selection: { start: 0, end: 2 },
                  isBlinking: true,
                },
                {
                  position: 0,
                  name: 'ap',
                  selection: { start: 0, end: 3 },
                  isBlinking: true,
                },
                {
                  position: 0,
                  name: 'ap ',
                  selection: { start: 0, end: 4 },
                  isBlinking: true,
                },
                {
                  position: 2,
                  name: 'a',
                  selection: { start: 0, end: 2 },
                  isBlinking: true,
                },
                {
                  position: 3,
                  name: 'ap',
                  selection: { start: 0, end: 3 },
                  isBlinking: true,
                },
                {
                  position: 4,
                  name: 'ap ',
                  selection: { start: 0, end: 4 },
                  isBlinking: true,
                },
                {
                  position: 2,
                  name: 'p',
                  selection: { start: 2, end: 3 },
                  isBlinking: true,
                },
                {
                  position: 2,
                  name: 'p ',
                  selection: { start: 2, end: 4 },
                  isBlinking: true,
                },
                {
                  position: 3,
                  name: 'p',
                  selection: { start: 2, end: 3 },
                  isBlinking: true,
                },
                {
                  position: 4,
                  name: 'p ',
                  selection: { start: 2, end: 4 },
                  isBlinking: true,
                },
              ],
              text: 'aap noot mies',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: 'a',
                delay: 100,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('should increase or keep selection of other cursors, when inserting at the middle', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: 'o',
                delay: 100,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'aap not mies',
            cursors: [
              // The cursor that is going to add a second 'o' in 'not
              { position: 6, name: '' },

              // Selects 'aap not mies' becomes 'aap noot mies', 0 - 13, pos becomes 13
              {
                position: 12,
                name: 'aap not mies',
                selection: { start: 0, end: 12 },
              },
              // Selects 'aap not mies' becomes 'aap noot mies', 0 - 13, pos stays 0
              {
                position: 0,
                name: 'aap not mies',
                selection: { start: 0, end: 12 },
              },
              // Selects 'aap' stays 'aap', 0 - 3, pos stays 3
              { position: 3, name: 'aap', selection: { start: 0, end: 3 } },
              // Selects 'aap' stays 'aap', 0 - 3, pos stays 0
              { position: 0, name: 'aap', selection: { start: 0, end: 3 } },

              // Selects 'mies' stays 'mies', 9 - 13, pos becomes 13
              { position: 12, name: 'mies', selection: { start: 8, end: 12 } },
              // Selects 'mies' stays 'mies', 9 - 13, pos becomes 9
              { position: 8, name: 'mies', selection: { start: 8, end: 12 } },

              // Selects 'not', becomes 'noot', 4 - 8, pos stays 4
              { position: 4, name: 'not', selection: { start: 4, end: 7 } },
              // Selects 'not', becomes 'noot', 4 - 8, pos becomes 8
              { position: 7, name: 'not', selection: { start: 4, end: 7 } },

              // Selects 'no', stays 'no', 4 - 6, pos stays 4
              { position: 4, name: 'no', selection: { start: 4, end: 6 } },
              // Selects 'no', stays 'no', 4 - 6, pos stays 6
              { position: 6, name: 'no', selection: { start: 4, end: 6 } },

              // Selects 'o', stays 'o', 5 - 6, pos stays 5
              { position: 5, name: 'o', selection: { start: 5, end: 6 } },
              // Selects 'o', stays 'o', 5 - 6, pos stays 6
              { position: 6, name: 'o', selection: { start: 5, end: 6 } },

              // Selects 't', becomes 'ot', 6 - 8, pos stays 6
              { position: 6, name: 't', selection: { start: 6, end: 7 } },
              // Selects 't', stays 'ot', 6 - 8, pos becomes 8
              { position: 7, name: 't', selection: { start: 6, end: 7 } },

              // Selects 't ', becomes 'ot ', 6 - 9, pos stays 6
              { position: 6, name: 't ', selection: { start: 6, end: 8 } },
              // Selects 't ', stays 'ot ', 6 - 9, pos becomes 9
              { position: 8, name: 't ', selection: { start: 6, end: 8 } },
            ],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: 'o',
                delay: 100,
                cursor: 0,
              },
            ],
            cursors: [
              {
                position: 6,
                name: '',
                selection: undefined,
                isBlinking: true,
              },
              {
                position: 12,
                name: 'aap not mies',
                selection: { start: 0, end: 12 },
                isBlinking: true,
              },
              {
                position: 0,
                name: 'aap not mies',
                selection: { start: 0, end: 12 },
                isBlinking: true,
              },
              {
                position: 3,
                name: 'aap',
                selection: { start: 0, end: 3 },
                isBlinking: true,
              },
              {
                position: 0,
                name: 'aap',
                selection: { start: 0, end: 3 },
                isBlinking: true,
              },
              {
                position: 12,
                name: 'mies',
                selection: { start: 8, end: 12 },
                isBlinking: true,
              },
              {
                position: 8,
                name: 'mies',
                selection: { start: 8, end: 12 },
                isBlinking: true,
              },
              {
                position: 4,
                name: 'not',
                selection: { start: 4, end: 7 },
                isBlinking: true,
              },
              {
                position: 7,
                name: 'not',
                selection: { start: 4, end: 7 },
                isBlinking: true,
              },
              {
                position: 4,
                name: 'no',
                selection: { start: 4, end: 6 },
                isBlinking: true,
              },
              {
                position: 6,
                name: 'no',
                selection: { start: 4, end: 6 },
                isBlinking: true,
              },
              {
                position: 5,
                name: 'o',
                selection: { start: 5, end: 6 },
                isBlinking: true,
              },
              {
                position: 6,
                name: 'o',
                selection: { start: 5, end: 6 },
                isBlinking: true,
              },
              {
                position: 6,
                name: 't',
                selection: { start: 6, end: 7 },
                isBlinking: true,
              },
              {
                position: 7,
                name: 't',
                selection: { start: 6, end: 7 },
                isBlinking: true,
              },
              {
                position: 6,
                name: 't ',
                selection: { start: 6, end: 8 },
                isBlinking: true,
              },
              {
                position: 8,
                name: 't ',
                selection: { start: 6, end: 8 },
                isBlinking: true,
              },
            ],
            text: 'aap not mies',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(100);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: 'o',
                  delay: 100,
                  cursor: 0,
                },
              ],
              cursors: [
                {
                  position: 7,
                  name: '',
                  selection: undefined,
                  isBlinking: false,
                },
                {
                  position: 13,
                  name: 'aap not mies',
                  selection: { start: 0, end: 13 },
                  isBlinking: true,
                },
                {
                  position: 0,
                  name: 'aap not mies',
                  selection: { start: 0, end: 13 },
                  isBlinking: true,
                },
                {
                  position: 3,
                  name: 'aap',
                  selection: { start: 0, end: 3 },
                  isBlinking: true,
                },
                {
                  position: 0,
                  name: 'aap',
                  selection: { start: 0, end: 3 },
                  isBlinking: true,
                },
                {
                  position: 13,
                  name: 'mies',
                  selection: { start: 9, end: 13 },
                  isBlinking: true,
                },
                {
                  position: 9,
                  name: 'mies',
                  selection: { start: 9, end: 13 },
                  isBlinking: true,
                },
                {
                  position: 4,
                  name: 'not',
                  selection: { start: 4, end: 8 },
                  isBlinking: true,
                },
                {
                  position: 8,
                  name: 'not',
                  selection: { start: 4, end: 8 },
                  isBlinking: true,
                },
                {
                  position: 4,
                  name: 'no',
                  selection: { start: 4, end: 6 },
                  isBlinking: true,
                },
                {
                  position: 6,
                  name: 'no',
                  selection: { start: 4, end: 6 },
                  isBlinking: true,
                },
                {
                  position: 5,
                  name: 'o',
                  selection: { start: 5, end: 6 },
                  isBlinking: true,
                },
                {
                  position: 6,
                  name: 'o',
                  selection: { start: 5, end: 6 },
                  isBlinking: true,
                },
                {
                  position: 6,
                  name: 't',
                  selection: { start: 6, end: 8 },
                  isBlinking: true,
                },
                {
                  position: 8,
                  name: 't',
                  selection: { start: 6, end: 8 },
                  isBlinking: true,
                },
                {
                  position: 6,
                  name: 't ',
                  selection: { start: 6, end: 9 },
                  isBlinking: true,
                },
                {
                  position: 9,
                  name: 't ',
                  selection: { start: 6, end: 9 },
                  isBlinking: true,
                },
              ],
              text: 'aap noot mies',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: 'o',
                delay: 100,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });

        it('keep selection of other cursors, when inserting at the end', () => {
          const typewriter = new Typewriter({
            actions: [
              {
                type: 'keyboard',
                key: 'x',
                delay: 100,
                cursor: 0,
              },
            ],
            blinkAfter: 50,
            text: 'aap noot mies',
            cursors: [
              // The cursor that is going to add 'x' to the last position.
              { position: 13, name: '' },

              // All cursors should not be affected
              {
                position: 13,
                name: 'aap noot mies',
                selection: { start: 0, end: 13 },
              },
              {
                position: 0,
                name: 'aap noot mies',
                selection: { start: 0, end: 13 },
              },
              { position: 3, name: 'aap', selection: { start: 0, end: 3 } },
              { position: 0, name: 'aap', selection: { start: 0, end: 3 } },
              { position: 13, name: 'mies', selection: { start: 9, end: 13 } },
              { position: 9, name: 'mies', selection: { start: 9, end: 13 } },
              { position: 4, name: 'noot', selection: { start: 4, end: 8 } },
              { position: 8, name: 'noot', selection: { start: 4, end: 8 } },
            ],
          });
          const subscriber = autoSubscribe(typewriter);

          assertState(typewriter, {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: 'x',
                delay: 100,
                cursor: 0,
              },
            ],
            cursors: [
              {
                position: 13,
                name: '',
                selection: undefined,
                isBlinking: true,
              },
              {
                position: 13,
                name: 'aap noot mies',
                selection: { start: 0, end: 13 },
                isBlinking: true,
              },
              {
                position: 0,
                name: 'aap noot mies',
                selection: { start: 0, end: 13 },
                isBlinking: true,
              },
              {
                position: 3,
                name: 'aap',
                selection: { start: 0, end: 3 },
                isBlinking: true,
              },
              {
                position: 0,
                name: 'aap',
                selection: { start: 0, end: 3 },
                isBlinking: true,
              },
              {
                position: 13,
                name: 'mies',
                selection: { start: 9, end: 13 },
                isBlinking: true,
              },
              {
                position: 9,
                name: 'mies',
                selection: { start: 9, end: 13 },
                isBlinking: true,
              },
              {
                position: 4,
                name: 'noot',
                selection: { start: 4, end: 8 },
                isBlinking: true,
              },
              {
                position: 8,
                name: 'noot',
                selection: { start: 4, end: 8 },
                isBlinking: true,
              },
            ],
            text: 'aap noot mies',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          });

          jest.advanceTimersByTime(100);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: 'x',
                  delay: 100,
                  cursor: 0,
                },
              ],
              cursors: [
                {
                  position: 14,
                  name: '',
                  selection: undefined,
                  isBlinking: false,
                },
                {
                  position: 13,
                  name: 'aap noot mies',
                  selection: { start: 0, end: 13 },
                  isBlinking: true,
                },
                {
                  position: 0,
                  name: 'aap noot mies',
                  selection: { start: 0, end: 13 },
                  isBlinking: true,
                },
                {
                  position: 3,
                  name: 'aap',
                  selection: { start: 0, end: 3 },
                  isBlinking: true,
                },
                {
                  position: 0,
                  name: 'aap',
                  selection: { start: 0, end: 3 },
                  isBlinking: true,
                },
                {
                  position: 13,
                  name: 'mies',
                  selection: { start: 9, end: 13 },
                  isBlinking: true,
                },
                {
                  position: 9,
                  name: 'mies',
                  selection: { start: 9, end: 13 },
                  isBlinking: true,
                },
                {
                  position: 4,
                  name: 'noot',
                  selection: { start: 4, end: 8 },
                  isBlinking: true,
                },
                {
                  position: 8,
                  name: 'noot',
                  selection: { start: 4, end: 8 },
                  isBlinking: true,
                },
              ],
              text: 'aap noot miesx',
              blinkAfter: 50,
              isPlaying: false,
              isFinished: true,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            },
            {
              type: 'FINISHED',
              action: {
                type: 'keyboard',
                key: 'x',
                delay: 100,
                cursor: 0,
              },
              time: new Date(),
              cursor: typewriter.cursors[0],
            }
          );
        });
      });

      describe('inserting cursor has selection', () => {
        describe('with backward selection', () => {
          it('should increase, remove or keep selection of other cursors, when inserting at the start', () => {
            const typewriter = new Typewriter({
              actions: [
                {
                  type: 'keyboard',
                  key: 'x',
                  delay: 100,
                  cursor: 0,
                },
              ],
              blinkAfter: 50,
              text: 'aap noot mies',
              cursors: [
                // The cursor that is going to insert 'x' at the start, while selecting 'aap'
                { position: 0, name: '', selection: { start: 0, end: 3 } },

                // Selects 'aap' becomes undefined, pos stays 0
                { position: 0, name: 'aap-0', selection: { start: 0, end: 3 } },

                // Selects 'aap' becomes undefined, pos becomes 0
                { position: 3, name: 'aap-3', selection: { start: 0, end: 3 } },

                // Selects 'ap' becomes undefined, pos becomes 0
                { position: 1, name: 'ap-1', selection: { start: 1, end: 3 } },

                // Selects 'ap' becomes undefined, pos becomes 0
                { position: 3, name: 'ap-3', selection: { start: 1, end: 3 } },

                // Selects 'p' becomes undefined, pos becomes 0
                { position: 2, name: 'p-2', selection: { start: 2, end: 3 } },

                // Selects 'p' becomes undefined, pos becomes 0
                { position: 3, name: 'p-3', selection: { start: 2, end: 3 } },

                // Selects 'aap ' becomes 'x ', 0 - 2 , pos stays 0
                {
                  position: 0,
                  name: 'aap -0',
                  selection: { start: 0, end: 4 },
                },

                // Selects 'aap ' becomes 'x ', 0 - 2 , pos becomes 2
                {
                  position: 4,
                  name: 'aap -4',
                  selection: { start: 0, end: 4 },
                },

                // ' noot' in google docs becomes 'x noot' which is very unexpected
                // I'm ignoring that result.

                // Selects ' noot' stays ' noot', 1 - 6 , pos becomes 1
                {
                  position: 3,
                  name: ' noot-3',
                  selection: { start: 3, end: 8 },
                },
                // Selects ' noot' stays ' noot', 1 - 6 , pos becomes 6
                {
                  position: 8,
                  name: ' noot-8',
                  selection: { start: 3, end: 8 },
                },

                // Selects 'noot' stays 'noot', 2 - 6 , pos becomes 2
                {
                  position: 4,
                  name: 'noot-4',
                  selection: { start: 4, end: 8 },
                },

                // Selects 'noot' stays 'noot', 2 - 6 , pos becomes 6
                {
                  position: 8,
                  name: 'noot-8',
                  selection: { start: 4, end: 8 },
                },
              ],
            });
            const subscriber = autoSubscribe(typewriter);

            assertState(typewriter, {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: 'x',
                  delay: 100,
                  cursor: 0,
                },
              ],
              cursors: [
                {
                  position: 0,
                  name: '',
                  selection: { start: 0, end: 3 },
                  isBlinking: true,
                },
                {
                  position: 0,
                  name: 'aap-0',
                  selection: { start: 0, end: 3 },
                  isBlinking: true,
                },
                {
                  position: 3,
                  name: 'aap-3',
                  selection: { start: 0, end: 3 },
                  isBlinking: true,
                },
                {
                  position: 1,
                  name: 'ap-1',
                  selection: { start: 1, end: 3 },
                  isBlinking: true,
                },
                {
                  position: 3,
                  name: 'ap-3',
                  selection: { start: 1, end: 3 },
                  isBlinking: true,
                },
                {
                  position: 2,
                  name: 'p-2',
                  selection: { start: 2, end: 3 },
                  isBlinking: true,
                },
                {
                  position: 3,
                  name: 'p-3',
                  selection: { start: 2, end: 3 },
                  isBlinking: true,
                },
                {
                  position: 0,
                  name: 'aap -0',
                  selection: { start: 0, end: 4 },
                  isBlinking: true,
                },
                {
                  position: 4,
                  name: 'aap -4',
                  selection: { start: 0, end: 4 },
                  isBlinking: true,
                },
                {
                  position: 3,
                  name: ' noot-3',
                  selection: { start: 3, end: 8 },
                  isBlinking: true,
                },
                {
                  position: 8,
                  name: ' noot-8',
                  selection: { start: 3, end: 8 },
                  isBlinking: true,
                },
                {
                  position: 4,
                  name: 'noot-4',
                  selection: { start: 4, end: 8 },
                  isBlinking: true,
                },
                {
                  position: 8,
                  name: 'noot-8',
                  selection: { start: 4, end: 8 },
                  isBlinking: true,
                },
              ],
              text: 'aap noot mies',
              blinkAfter: 50,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            });

            jest.advanceTimersByTime(100);

            assertLastSubscriber(
              subscriber,
              {
                history: [],
                actions: [
                  {
                    type: 'keyboard',
                    key: 'x',
                    delay: 100,
                    cursor: 0,
                  },
                ],
                cursors: [
                  {
                    position: 1,
                    name: '',
                    selection: undefined,
                    isBlinking: false,
                  },
                  {
                    position: 0,
                    name: 'aap-0',
                    selection: undefined,
                    isBlinking: true,
                  },
                  {
                    position: 0,
                    name: 'aap-3',
                    selection: undefined,
                    isBlinking: true,
                  },
                  {
                    position: 0,
                    name: 'ap-1',
                    selection: undefined,
                    isBlinking: true,
                  },
                  {
                    position: 0,
                    name: 'ap-3',
                    selection: undefined,
                    isBlinking: true,
                  },
                  {
                    position: 0,
                    name: 'p-2',
                    selection: undefined,
                    isBlinking: true,
                  },
                  {
                    position: 0,
                    name: 'p-3',
                    selection: undefined,
                    isBlinking: true,
                  },
                  {
                    position: 0,
                    name: 'aap -0',
                    selection: { start: 0, end: 2 },
                    isBlinking: true,
                  },
                  {
                    position: 2,
                    name: 'aap -4',
                    selection: { start: 0, end: 2 },
                    isBlinking: true,
                  },
                  {
                    position: 1,
                    name: ' noot-3',
                    selection: { start: 1, end: 6 },
                    isBlinking: true,
                  },
                  {
                    position: 6,
                    name: ' noot-8',
                    selection: { start: 1, end: 6 },
                    isBlinking: true,
                  },
                  {
                    position: 2,
                    name: 'noot-4',
                    selection: { start: 2, end: 6 },
                    isBlinking: true,
                  },
                  {
                    position: 6,
                    name: 'noot-8',
                    selection: { start: 2, end: 6 },
                    isBlinking: true,
                  },
                ],
                text: 'x noot mies',
                blinkAfter: 50,
                isPlaying: false,
                isFinished: true,
                hasBeenStoppedBefore: false,
                repeat: false,
                repeatDelay: 0,
              },
              {
                type: 'FINISHED',
                action: {
                  type: 'keyboard',
                  key: 'x',
                  delay: 100,
                  cursor: 0,
                },
                time: new Date(),
                cursor: typewriter.cursors[0],
              }
            );
          });

          it('should increase, remove or keep selection of other cursors, when inserting at the middle', () => {
            const typewriter = new Typewriter({
              actions: [
                {
                  type: 'keyboard',
                  key: 'x',
                  delay: 100,
                  cursor: 0,
                },
              ],
              blinkAfter: 50,
              text: 'aap noot mies',
              cursors: [
                // The cursor that is going to add 'x', selects the oo's
                { position: 5, name: '', selection: { start: 5, end: 7 } },
                // Selects 'aap' stays 'aap', 0 - 3
                { position: 3, name: 'aap', selection: { start: 0, end: 3 } },
                // Selects 'noot', becomes 'nxt', 4 - 7
                { position: 4, name: 'noot', selection: { start: 4, end: 8 } },
                // Selects 'mies' stays 'mies', 8 - 12
                {
                  position: 13,
                  name: 'mies',
                  selection: { start: 9, end: 13 },
                },
                // Selects 'p noot', becomes 'p nxt', 2 - 7
                {
                  position: 2,
                  name: 'p noot',
                  selection: { start: 2, end: 8 },
                },
                // Selects 'ot mi', becomes 'xt mi', 5 - 10
                {
                  position: 11,
                  name: 'ot mi',
                  selection: { start: 6, end: 11 },
                },

                // 't mi' in google docs becomes 'xt mi' which is very unexpected
                // I'm ignoring that result.

                // Selects 't mi', stays 't mi', 6 - 10
                {
                  position: 11,
                  name: 't mi',
                  selection: { start: 7, end: 11 },
                },

                // 'p no' is a bit unexpected as you might think the x will be selected but it is not.
                // Selects 'p no', becomes 'p n', 2 - 5
                { position: 2, name: 'p no', selection: { start: 2, end: 6 } },

                // Selects 'oot m', becomes 'xt m', 5 - 9
                {
                  position: 10,
                  name: 'oot m',
                  selection: { start: 5, end: 10 },
                },

                // 'p noo' is a bit unexpected as you might think the x will be selected but it is not.
                // Selects 'p noo', becomes 'p n', 2 - 5
                { position: 7, name: 'p noo', selection: { start: 2, end: 7 } },
                // Selects 'aap noot mies', becomes 'aap nxt mies', 0 - 12
                {
                  position: 13,
                  name: 'aap noot mies',
                  selection: { start: 0, end: 13 },
                },
                // Selects 'noot mies', becomes 'nxt mies' 4 - 12
                {
                  position: 4,
                  name: 'noot mies',
                  selection: { start: 4, end: 13 },
                },
                // Selects 'oo', becomes undefined
                {
                  position: 5,
                  name: 'oo',
                  selection: { start: 5, end: 7 },
                },
              ],
            });
            const subscriber = autoSubscribe(typewriter);

            assertState(typewriter, {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: 'x',
                  delay: 100,
                  cursor: 0,
                },
              ],
              cursors: [
                {
                  position: 5,
                  name: '',
                  selection: { start: 5, end: 7 },
                  isBlinking: true,
                },
                {
                  position: 3,
                  name: 'aap',
                  selection: { start: 0, end: 3 },
                  isBlinking: true,
                },
                {
                  position: 4,
                  name: 'noot',
                  selection: { start: 4, end: 8 },
                  isBlinking: true,
                },
                {
                  position: 13,
                  name: 'mies',
                  selection: { start: 9, end: 13 },
                  isBlinking: true,
                },
                {
                  position: 2,
                  name: 'p noot',
                  selection: { start: 2, end: 8 },
                  isBlinking: true,
                },
                {
                  position: 11,
                  name: 'ot mi',
                  selection: { start: 6, end: 11 },
                  isBlinking: true,
                },
                {
                  position: 11,
                  name: 't mi',
                  selection: { start: 7, end: 11 },
                  isBlinking: true,
                },
                {
                  position: 2,
                  name: 'p no',
                  selection: { start: 2, end: 6 },
                  isBlinking: true,
                },
                {
                  position: 10,
                  name: 'oot m',
                  selection: { start: 5, end: 10 },
                  isBlinking: true,
                },
                {
                  position: 7,
                  name: 'p noo',
                  selection: { start: 2, end: 7 },
                  isBlinking: true,
                },
                {
                  position: 13,
                  name: 'aap noot mies',
                  selection: { start: 0, end: 13 },
                  isBlinking: true,
                },
                {
                  position: 4,
                  name: 'noot mies',
                  selection: { start: 4, end: 13 },
                  isBlinking: true,
                },
                {
                  position: 5,
                  name: 'oo',
                  selection: { start: 5, end: 7 },
                  isBlinking: true,
                },
              ],
              text: 'aap noot mies',
              blinkAfter: 50,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            });

            jest.advanceTimersByTime(100);

            assertLastSubscriber(
              subscriber,
              {
                history: [],
                actions: [
                  {
                    type: 'keyboard',
                    key: 'x',
                    delay: 100,
                    cursor: 0,
                  },
                ],
                cursors: [
                  {
                    position: 6,
                    name: '',
                    selection: undefined,
                    isBlinking: false,
                  },
                  {
                    position: 3,
                    name: 'aap',
                    selection: { start: 0, end: 3 },
                    isBlinking: true,
                  },
                  {
                    position: 4,
                    name: 'noot',
                    selection: { start: 4, end: 7 },
                    isBlinking: true,
                  },
                  {
                    position: 12,
                    name: 'mies',
                    selection: { start: 8, end: 12 },
                    isBlinking: true,
                  },
                  {
                    position: 2,
                    name: 'p noot',
                    selection: { start: 2, end: 7 },
                    isBlinking: true,
                  },
                  {
                    position: 10,
                    name: 'ot mi',
                    selection: { start: 5, end: 10 },
                    isBlinking: true,
                  },
                  {
                    position: 10,
                    name: 't mi',
                    selection: { start: 6, end: 10 },
                    isBlinking: true,
                  },
                  {
                    position: 2,
                    name: 'p no',
                    selection: { start: 2, end: 5 },
                    isBlinking: true,
                  },
                  {
                    position: 9,
                    name: 'oot m',
                    selection: { start: 5, end: 9 },
                    isBlinking: true,
                  },
                  {
                    position: 5,
                    name: 'p noo',
                    selection: { start: 2, end: 5 },
                    isBlinking: true,
                  },
                  {
                    position: 12,
                    name: 'aap noot mies',
                    selection: { start: 0, end: 12 },
                    isBlinking: true,
                  },
                  {
                    position: 4,
                    name: 'noot mies',
                    selection: { start: 4, end: 12 },
                    isBlinking: true,
                  },
                  {
                    position: 5,
                    name: 'oo',
                    selection: undefined,
                    isBlinking: true,
                  },
                ],
                text: 'aap nxt mies',
                blinkAfter: 50,
                isPlaying: false,
                isFinished: true,
                hasBeenStoppedBefore: false,
                repeat: false,
                repeatDelay: 0,
              },
              {
                type: 'FINISHED',
                action: {
                  type: 'keyboard',
                  key: 'x',
                  delay: 100,
                  cursor: 0,
                },
                time: new Date(),
                cursor: typewriter.cursors[0],
              }
            );
          });

          it('should increase, remove or keep selection of other cursors, when inserting at the end', () => {
            const typewriter = new Typewriter({
              actions: [
                {
                  type: 'keyboard',
                  key: 'x',
                  delay: 100,
                  cursor: 0,
                },
              ],
              blinkAfter: 50,
              text: 'aap noot mies',
              cursors: [
                // The cursor that is going to hit 'x', on es
                { position: 11, name: '', selection: { start: 11, end: 13 } },

                // Selects 's' becomes undefined, pos 11
                { position: 12, name: 's', selection: { start: 12, end: 13 } },
                // Selects 's' becomes undefined, pos 11
                { position: 13, name: 's', selection: { start: 12, end: 13 } },

                // Selects 'es', becomes undefined pos 11
                { position: 11, name: 'es', selection: { start: 11, end: 13 } },
                // Selects 'es', becomes undefined pos 11
                { position: 13, name: 'es', selection: { start: 11, end: 13 } },

                // Selects 'ies' becomes 'i', 10 - 11 pos 10
                {
                  position: 10,
                  name: 'ies',
                  selection: { start: 10, end: 13 },
                },
                // Selects 'ies' becomes 'i', 10 - 11 pos 11
                {
                  position: 13,
                  name: 'ies',
                  selection: { start: 10, end: 13 },
                },

                // Selects 'mie', becomes 'mi', 9 - 11 pos 9
                { position: 9, name: 'mie', selection: { start: 9, end: 12 } },
                // Selects 'mie', becomes 'mi', 9 - 11 pos 11
                { position: 12, name: 'mie', selection: { start: 9, end: 12 } },

                // Selects 'mi', stays 'mi', 9 - 11 pos 9
                { position: 9, name: 'mi', selection: { start: 9, end: 11 } },
                // Selects 'mi', stays 'mi', 9 - 11 pos 11
                { position: 11, name: 'mi', selection: { start: 9, end: 11 } },
              ],
            });
            const subscriber = autoSubscribe(typewriter);

            assertState(typewriter, {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: 'x',
                  delay: 100,
                  cursor: 0,
                },
              ],
              cursors: [
                {
                  position: 11,
                  name: '',
                  selection: { start: 11, end: 13 },
                  isBlinking: true,
                },
                {
                  position: 12,
                  name: 's',
                  selection: { start: 12, end: 13 },
                  isBlinking: true,
                },
                {
                  position: 13,
                  name: 's',
                  selection: { start: 12, end: 13 },
                  isBlinking: true,
                },
                {
                  position: 11,
                  name: 'es',
                  selection: { start: 11, end: 13 },
                  isBlinking: true,
                },
                {
                  position: 13,
                  name: 'es',
                  selection: { start: 11, end: 13 },
                  isBlinking: true,
                },
                {
                  position: 10,
                  name: 'ies',
                  selection: { start: 10, end: 13 },
                  isBlinking: true,
                },
                {
                  position: 13,
                  name: 'ies',
                  selection: { start: 10, end: 13 },
                  isBlinking: true,
                },
                {
                  position: 9,
                  name: 'mie',
                  selection: { start: 9, end: 12 },
                  isBlinking: true,
                },
                {
                  position: 12,
                  name: 'mie',
                  selection: { start: 9, end: 12 },
                  isBlinking: true,
                },
                {
                  position: 9,
                  name: 'mi',
                  selection: { start: 9, end: 11 },
                  isBlinking: true,
                },
                {
                  position: 11,
                  name: 'mi',
                  selection: { start: 9, end: 11 },
                  isBlinking: true,
                },
              ],
              text: 'aap noot mies',
              blinkAfter: 50,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            });

            jest.advanceTimersByTime(100);

            assertLastSubscriber(
              subscriber,
              {
                history: [],
                actions: [
                  {
                    type: 'keyboard',
                    key: 'x',
                    delay: 100,
                    cursor: 0,
                  },
                ],
                cursors: [
                  {
                    position: 12,
                    name: '',
                    selection: undefined,
                    isBlinking: false,
                  },
                  {
                    position: 11,
                    name: 's',
                    selection: undefined,
                    isBlinking: true,
                  },
                  {
                    position: 11,
                    name: 's',
                    selection: undefined,
                    isBlinking: true,
                  },
                  {
                    position: 11,
                    name: 'es',
                    selection: undefined,
                    isBlinking: true,
                  },
                  {
                    position: 11,
                    name: 'es',
                    selection: undefined,
                    isBlinking: true,
                  },
                  {
                    position: 10,
                    name: 'ies',
                    selection: { start: 10, end: 11 },
                    isBlinking: true,
                  },
                  {
                    position: 11,
                    name: 'ies',
                    selection: { start: 10, end: 11 },
                    isBlinking: true,
                  },
                  {
                    position: 9,
                    name: 'mie',
                    selection: { start: 9, end: 11 },
                    isBlinking: true,
                  },
                  {
                    position: 11,
                    name: 'mie',
                    selection: { start: 9, end: 11 },
                    isBlinking: true,
                  },
                  {
                    position: 9,
                    name: 'mi',
                    selection: { start: 9, end: 11 },
                    isBlinking: true,
                  },
                  {
                    position: 11,
                    name: 'mi',
                    selection: { start: 9, end: 11 },
                    isBlinking: true,
                  },
                ],
                text: 'aap noot mix',
                blinkAfter: 50,
                isPlaying: false,
                isFinished: true,
                hasBeenStoppedBefore: false,
                repeat: false,
                repeatDelay: 0,
              },
              {
                type: 'FINISHED',
                action: {
                  type: 'keyboard',
                  key: 'x',
                  delay: 100,
                  cursor: 0,
                },
                time: new Date(),
                cursor: typewriter.cursors[0],
              }
            );
          });
        });

        describe('with forward selection', () => {
          it('should increase, remove or keep selection of other cursors, when inserting at the start', () => {
            const typewriter = new Typewriter({
              actions: [
                {
                  type: 'keyboard',
                  key: 'x',
                  delay: 100,
                  cursor: 0,
                },
              ],
              blinkAfter: 50,
              text: 'aap noot mies',
              cursors: [
                // The cursor that is going to insert 'x' at the start, while selecting 'aap'
                { position: 3, name: '', selection: { start: 0, end: 3 } },

                // Selects 'aap' becomes undefined, pos stays 0
                { position: 0, name: 'aap-0', selection: { start: 0, end: 3 } },

                // Selects 'aap' becomes undefined, pos becomes 0
                { position: 3, name: 'aap-3', selection: { start: 0, end: 3 } },

                // Selects 'ap' becomes undefined, pos becomes 0
                { position: 1, name: 'ap-1', selection: { start: 1, end: 3 } },

                // Selects 'ap' becomes undefined, pos becomes 0
                { position: 3, name: 'ap-3', selection: { start: 1, end: 3 } },

                // Selects 'p' becomes undefined, pos becomes 0
                { position: 2, name: 'p-2', selection: { start: 2, end: 3 } },

                // Selects 'p' becomes undefined, pos becomes 0
                { position: 3, name: 'p-3', selection: { start: 2, end: 3 } },

                // Selects 'aap ' becomes 'x ', 0 - 2 , pos stays 0
                {
                  position: 0,
                  name: 'aap -0',
                  selection: { start: 0, end: 4 },
                },

                // Selects 'aap ' becomes 'x ', 0 - 2 , pos becomes 2
                {
                  position: 4,
                  name: 'aap -4',
                  selection: { start: 0, end: 4 },
                },

                // ' noot' in google docs becomes 'x noot' which is very unexpected
                // I'm ignoring that result.

                // Selects ' noot' stays ' noot', 1 - 6 , pos becomes 1
                {
                  position: 3,
                  name: ' noot-3',
                  selection: { start: 3, end: 8 },
                },
                // Selects ' noot' stays ' noot', 1 - 6 , pos becomes 6
                {
                  position: 8,
                  name: ' noot-8',
                  selection: { start: 3, end: 8 },
                },

                // Selects 'noot' stays 'noot', 2 - 6 , pos becomes 2
                {
                  position: 4,
                  name: 'noot-4',
                  selection: { start: 4, end: 8 },
                },

                // Selects 'noot' stays 'noot', 2 - 6 , pos becomes 6
                {
                  position: 8,
                  name: 'noot-8',
                  selection: { start: 4, end: 8 },
                },
              ],
            });
            const subscriber = autoSubscribe(typewriter);

            assertState(typewriter, {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: 'x',
                  delay: 100,
                  cursor: 0,
                },
              ],
              cursors: [
                {
                  position: 3,
                  name: '',
                  selection: { start: 0, end: 3 },
                  isBlinking: true,
                },
                {
                  position: 0,
                  name: 'aap-0',
                  selection: { start: 0, end: 3 },
                  isBlinking: true,
                },
                {
                  position: 3,
                  name: 'aap-3',
                  selection: { start: 0, end: 3 },
                  isBlinking: true,
                },
                {
                  position: 1,
                  name: 'ap-1',
                  selection: { start: 1, end: 3 },
                  isBlinking: true,
                },
                {
                  position: 3,
                  name: 'ap-3',
                  selection: { start: 1, end: 3 },
                  isBlinking: true,
                },
                {
                  position: 2,
                  name: 'p-2',
                  selection: { start: 2, end: 3 },
                  isBlinking: true,
                },
                {
                  position: 3,
                  name: 'p-3',
                  selection: { start: 2, end: 3 },
                  isBlinking: true,
                },
                {
                  position: 0,
                  name: 'aap -0',
                  selection: { start: 0, end: 4 },
                  isBlinking: true,
                },
                {
                  position: 4,
                  name: 'aap -4',
                  selection: { start: 0, end: 4 },
                  isBlinking: true,
                },
                {
                  position: 3,
                  name: ' noot-3',
                  selection: { start: 3, end: 8 },
                  isBlinking: true,
                },
                {
                  position: 8,
                  name: ' noot-8',
                  selection: { start: 3, end: 8 },
                  isBlinking: true,
                },
                {
                  position: 4,
                  name: 'noot-4',
                  selection: { start: 4, end: 8 },
                  isBlinking: true,
                },
                {
                  position: 8,
                  name: 'noot-8',
                  selection: { start: 4, end: 8 },
                  isBlinking: true,
                },
              ],
              text: 'aap noot mies',
              blinkAfter: 50,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            });

            jest.advanceTimersByTime(100);

            assertLastSubscriber(
              subscriber,
              {
                history: [],
                actions: [
                  {
                    type: 'keyboard',
                    key: 'x',
                    delay: 100,
                    cursor: 0,
                  },
                ],
                cursors: [
                  {
                    position: 1,
                    name: '',
                    selection: undefined,
                    isBlinking: false,
                  },
                  {
                    position: 0,
                    name: 'aap-0',
                    selection: undefined,
                    isBlinking: true,
                  },
                  {
                    position: 0,
                    name: 'aap-3',
                    selection: undefined,
                    isBlinking: true,
                  },
                  {
                    position: 0,
                    name: 'ap-1',
                    selection: undefined,
                    isBlinking: true,
                  },
                  {
                    position: 0,
                    name: 'ap-3',
                    selection: undefined,
                    isBlinking: true,
                  },
                  {
                    position: 0,
                    name: 'p-2',
                    selection: undefined,
                    isBlinking: true,
                  },
                  {
                    position: 0,
                    name: 'p-3',
                    selection: undefined,
                    isBlinking: true,
                  },
                  {
                    position: 0,
                    name: 'aap -0',
                    selection: { start: 0, end: 2 },
                    isBlinking: true,
                  },
                  {
                    position: 2,
                    name: 'aap -4',
                    selection: { start: 0, end: 2 },
                    isBlinking: true,
                  },
                  {
                    position: 1,
                    name: ' noot-3',
                    selection: { start: 1, end: 6 },
                    isBlinking: true,
                  },
                  {
                    position: 6,
                    name: ' noot-8',
                    selection: { start: 1, end: 6 },
                    isBlinking: true,
                  },
                  {
                    position: 2,
                    name: 'noot-4',
                    selection: { start: 2, end: 6 },
                    isBlinking: true,
                  },
                  {
                    position: 6,
                    name: 'noot-8',
                    selection: { start: 2, end: 6 },
                    isBlinking: true,
                  },
                ],
                text: 'x noot mies',
                blinkAfter: 50,
                isPlaying: false,
                isFinished: true,
                hasBeenStoppedBefore: false,
                repeat: false,
                repeatDelay: 0,
              },
              {
                type: 'FINISHED',
                action: {
                  type: 'keyboard',
                  key: 'x',
                  delay: 100,
                  cursor: 0,
                },
                time: new Date(),
                cursor: typewriter.cursors[0],
              }
            );
          });

          it('should increase, remove or keep selection of other cursors, when inserting at the middle', () => {
            const typewriter = new Typewriter({
              actions: [
                {
                  type: 'keyboard',
                  key: 'x',
                  delay: 100,
                  cursor: 0,
                },
              ],
              blinkAfter: 50,
              text: 'aap noot mies',
              cursors: [
                // The cursor that is going to add 'x', selects the oo's
                { position: 7, name: '', selection: { start: 5, end: 7 } },
                // Selects 'aap' stays 'aap', 0 - 3
                { position: 3, name: 'aap', selection: { start: 0, end: 3 } },
                // Selects 'noot', becomes 'nxt', 4 - 7
                { position: 4, name: 'noot', selection: { start: 4, end: 8 } },
                // Selects 'mies' stays 'mies', 8 - 12
                {
                  position: 13,
                  name: 'mies',
                  selection: { start: 9, end: 13 },
                },
                // Selects 'p noot', becomes 'p nxt', 2 - 7
                {
                  position: 2,
                  name: 'p noot',
                  selection: { start: 2, end: 8 },
                },
                // Selects 'ot mi', becomes 'xt mi', 5 - 10
                {
                  position: 11,
                  name: 'ot mi',
                  selection: { start: 6, end: 11 },
                },

                // 't mi' in google docs becomes 'xt mi' which is very unexpected
                // I'm ignoring that result.

                // Selects 't mi', stays 't mi', 6 - 10
                {
                  position: 11,
                  name: 't mi',
                  selection: { start: 7, end: 11 },
                },

                // 'p no' is a bit unexpected as you might think the x will be selected but it is not.
                // Selects 'p no', becomes 'p n', 2 - 5
                { position: 2, name: 'p no', selection: { start: 2, end: 6 } },

                // Selects 'oot m', becomes 'xt m', 5 - 9
                {
                  position: 10,
                  name: 'oot m',
                  selection: { start: 5, end: 10 },
                },

                // 'p noo' is a bit unexpected as you might think the x will be selected but it is not.
                // Selects 'p noo', becomes 'p n', 2 - 5
                { position: 7, name: 'p noo', selection: { start: 2, end: 7 } },
                // Selects 'aap noot mies', becomes 'aap nxt mies', 0 - 12
                {
                  position: 13,
                  name: 'aap noot mies',
                  selection: { start: 0, end: 13 },
                },
                // Selects 'noot mies', becomes 'nxt mies' 4 - 12
                {
                  position: 4,
                  name: 'noot mies',
                  selection: { start: 4, end: 13 },
                },
                // Selects 'oo', becomes undefined
                {
                  position: 5,
                  name: 'oo',
                  selection: { start: 5, end: 7 },
                },
              ],
            });
            const subscriber = autoSubscribe(typewriter);

            assertState(typewriter, {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: 'x',
                  delay: 100,
                  cursor: 0,
                },
              ],
              cursors: [
                {
                  position: 7,
                  name: '',
                  selection: { start: 5, end: 7 },
                  isBlinking: true,
                },
                {
                  position: 3,
                  name: 'aap',
                  selection: { start: 0, end: 3 },
                  isBlinking: true,
                },
                {
                  position: 4,
                  name: 'noot',
                  selection: { start: 4, end: 8 },
                  isBlinking: true,
                },
                {
                  position: 13,
                  name: 'mies',
                  selection: { start: 9, end: 13 },
                  isBlinking: true,
                },
                {
                  position: 2,
                  name: 'p noot',
                  selection: { start: 2, end: 8 },
                  isBlinking: true,
                },
                {
                  position: 11,
                  name: 'ot mi',
                  selection: { start: 6, end: 11 },
                  isBlinking: true,
                },
                {
                  position: 11,
                  name: 't mi',
                  selection: { start: 7, end: 11 },
                  isBlinking: true,
                },
                {
                  position: 2,
                  name: 'p no',
                  selection: { start: 2, end: 6 },
                  isBlinking: true,
                },
                {
                  position: 10,
                  name: 'oot m',
                  selection: { start: 5, end: 10 },
                  isBlinking: true,
                },
                {
                  position: 7,
                  name: 'p noo',
                  selection: { start: 2, end: 7 },
                  isBlinking: true,
                },
                {
                  position: 13,
                  name: 'aap noot mies',
                  selection: { start: 0, end: 13 },
                  isBlinking: true,
                },
                {
                  position: 4,
                  name: 'noot mies',
                  selection: { start: 4, end: 13 },
                  isBlinking: true,
                },
                {
                  position: 5,
                  name: 'oo',
                  selection: { start: 5, end: 7 },
                  isBlinking: true,
                },
              ],
              text: 'aap noot mies',
              blinkAfter: 50,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            });

            jest.advanceTimersByTime(100);

            assertLastSubscriber(
              subscriber,
              {
                history: [],
                actions: [
                  {
                    type: 'keyboard',
                    key: 'x',
                    delay: 100,
                    cursor: 0,
                  },
                ],
                cursors: [
                  {
                    position: 6,
                    name: '',
                    selection: undefined,
                    isBlinking: false,
                  },
                  {
                    position: 3,
                    name: 'aap',
                    selection: { start: 0, end: 3 },
                    isBlinking: true,
                  },
                  {
                    position: 4,
                    name: 'noot',
                    selection: { start: 4, end: 7 },
                    isBlinking: true,
                  },
                  {
                    position: 12,
                    name: 'mies',
                    selection: { start: 8, end: 12 },
                    isBlinking: true,
                  },
                  {
                    position: 2,
                    name: 'p noot',
                    selection: { start: 2, end: 7 },
                    isBlinking: true,
                  },
                  {
                    position: 10,
                    name: 'ot mi',
                    selection: { start: 5, end: 10 },
                    isBlinking: true,
                  },
                  {
                    position: 10,
                    name: 't mi',
                    selection: { start: 6, end: 10 },
                    isBlinking: true,
                  },
                  {
                    position: 2,
                    name: 'p no',
                    selection: { start: 2, end: 5 },
                    isBlinking: true,
                  },
                  {
                    position: 9,
                    name: 'oot m',
                    selection: { start: 5, end: 9 },
                    isBlinking: true,
                  },
                  {
                    position: 5,
                    name: 'p noo',
                    selection: { start: 2, end: 5 },
                    isBlinking: true,
                  },
                  {
                    position: 12,
                    name: 'aap noot mies',
                    selection: { start: 0, end: 12 },
                    isBlinking: true,
                  },
                  {
                    position: 4,
                    name: 'noot mies',
                    selection: { start: 4, end: 12 },
                    isBlinking: true,
                  },
                  {
                    position: 5,
                    name: 'oo',
                    selection: undefined,
                    isBlinking: true,
                  },
                ],
                text: 'aap nxt mies',
                blinkAfter: 50,
                isPlaying: false,
                isFinished: true,
                hasBeenStoppedBefore: false,
                repeat: false,
                repeatDelay: 0,
              },
              {
                type: 'FINISHED',
                action: {
                  type: 'keyboard',
                  key: 'x',
                  delay: 100,
                  cursor: 0,
                },
                time: new Date(),
                cursor: typewriter.cursors[0],
              }
            );
          });

          it('should increase, remove or keep selection of other cursors, when inserting at the end', () => {
            const typewriter = new Typewriter({
              actions: [
                {
                  type: 'keyboard',
                  key: 'x',
                  delay: 100,
                  cursor: 0,
                },
              ],
              blinkAfter: 50,
              text: 'aap noot mies',
              cursors: [
                // The cursor that is going to hit 'x', on es
                { position: 13, name: '', selection: { start: 11, end: 13 } },

                // Selects 's' becomes undefined, pos 11
                { position: 12, name: 's', selection: { start: 12, end: 13 } },
                // Selects 's' becomes undefined, pos 11
                { position: 13, name: 's', selection: { start: 12, end: 13 } },

                // Selects 'es', becomes undefined pos 11
                { position: 11, name: 'es', selection: { start: 11, end: 13 } },
                // Selects 'es', becomes undefined pos 11
                { position: 13, name: 'es', selection: { start: 11, end: 13 } },

                // Selects 'ies' becomes 'i', 10 - 11 pos 10
                {
                  position: 10,
                  name: 'ies',
                  selection: { start: 10, end: 13 },
                },
                // Selects 'ies' becomes 'i', 10 - 11 pos 11
                {
                  position: 13,
                  name: 'ies',
                  selection: { start: 10, end: 13 },
                },

                // Selects 'mie', becomes 'mi', 9 - 11 pos 9
                { position: 9, name: 'mie', selection: { start: 9, end: 12 } },
                // Selects 'mie', becomes 'mi', 9 - 11 pos 11
                { position: 12, name: 'mie', selection: { start: 9, end: 12 } },

                // Selects 'mi', stays 'mi', 9 - 11 pos 9
                { position: 9, name: 'mi', selection: { start: 9, end: 11 } },
                // Selects 'mi', stays 'mi', 9 - 11 pos 11
                { position: 11, name: 'mi', selection: { start: 9, end: 11 } },
              ],
            });
            const subscriber = autoSubscribe(typewriter);

            assertState(typewriter, {
              history: [],
              actions: [
                {
                  type: 'keyboard',
                  key: 'x',
                  delay: 100,
                  cursor: 0,
                },
              ],
              cursors: [
                {
                  position: 13,
                  name: '',
                  selection: { start: 11, end: 13 },
                  isBlinking: true,
                },
                {
                  position: 12,
                  name: 's',
                  selection: { start: 12, end: 13 },
                  isBlinking: true,
                },
                {
                  position: 13,
                  name: 's',
                  selection: { start: 12, end: 13 },
                  isBlinking: true,
                },
                {
                  position: 11,
                  name: 'es',
                  selection: { start: 11, end: 13 },
                  isBlinking: true,
                },
                {
                  position: 13,
                  name: 'es',
                  selection: { start: 11, end: 13 },
                  isBlinking: true,
                },
                {
                  position: 10,
                  name: 'ies',
                  selection: { start: 10, end: 13 },
                  isBlinking: true,
                },
                {
                  position: 13,
                  name: 'ies',
                  selection: { start: 10, end: 13 },
                  isBlinking: true,
                },
                {
                  position: 9,
                  name: 'mie',
                  selection: { start: 9, end: 12 },
                  isBlinking: true,
                },
                {
                  position: 12,
                  name: 'mie',
                  selection: { start: 9, end: 12 },
                  isBlinking: true,
                },
                {
                  position: 9,
                  name: 'mi',
                  selection: { start: 9, end: 11 },
                  isBlinking: true,
                },
                {
                  position: 11,
                  name: 'mi',
                  selection: { start: 9, end: 11 },
                  isBlinking: true,
                },
              ],
              text: 'aap noot mies',
              blinkAfter: 50,
              isPlaying: true,
              isFinished: false,
              hasBeenStoppedBefore: false,
              repeat: false,
              repeatDelay: 0,
            });

            jest.advanceTimersByTime(100);

            assertLastSubscriber(
              subscriber,
              {
                history: [],
                actions: [
                  {
                    type: 'keyboard',
                    key: 'x',
                    delay: 100,
                    cursor: 0,
                  },
                ],
                cursors: [
                  {
                    position: 12,
                    name: '',
                    selection: undefined,
                    isBlinking: false,
                  },
                  {
                    position: 11,
                    name: 's',
                    selection: undefined,
                    isBlinking: true,
                  },
                  {
                    position: 11,
                    name: 's',
                    selection: undefined,
                    isBlinking: true,
                  },
                  {
                    position: 11,
                    name: 'es',
                    selection: undefined,
                    isBlinking: true,
                  },
                  {
                    position: 11,
                    name: 'es',
                    selection: undefined,
                    isBlinking: true,
                  },
                  {
                    position: 10,
                    name: 'ies',
                    selection: { start: 10, end: 11 },
                    isBlinking: true,
                  },
                  {
                    position: 11,
                    name: 'ies',
                    selection: { start: 10, end: 11 },
                    isBlinking: true,
                  },
                  {
                    position: 9,
                    name: 'mie',
                    selection: { start: 9, end: 11 },
                    isBlinking: true,
                  },
                  {
                    position: 11,
                    name: 'mie',
                    selection: { start: 9, end: 11 },
                    isBlinking: true,
                  },
                  {
                    position: 9,
                    name: 'mi',
                    selection: { start: 9, end: 11 },
                    isBlinking: true,
                  },
                  {
                    position: 11,
                    name: 'mi',
                    selection: { start: 9, end: 11 },
                    isBlinking: true,
                  },
                ],
                text: 'aap noot mix',
                blinkAfter: 50,
                isPlaying: false,
                isFinished: true,
                hasBeenStoppedBefore: false,
                repeat: false,
                repeatDelay: 0,
              },
              {
                type: 'FINISHED',
                action: {
                  type: 'keyboard',
                  key: 'x',
                  delay: 100,
                  cursor: 0,
                },
                time: new Date(),
                cursor: typewriter.cursors[0],
              }
            );
          });
        });
      });
    });

    it('should set all cursors to index 0 when a clear all is performed, and remove all selections', () => {
      const typewriter = new Typewriter({
        actions: [
          {
            type: 'keyboard',
            key: typewriterActionTypeClearAll,
            delay: 100,
            cursor: 2,
          },
        ],
        blinkAfter: 50,
        text: 'hllwrld',
        cursors: [
          { position: 0, name: '', selection: { start: 0, end: 6 } },
          { position: 4, name: '', selection: { start: 3, end: 4 } },
          { position: 5, name: '', selection: { start: 5, end: 7 } },
        ],
      });
      const subscriber = autoSubscribe(typewriter);

      assertState(typewriter, {
        history: [],
        actions: [
          {
            type: 'keyboard',
            key: typewriterActionTypeClearAll,
            delay: 100,
            cursor: 2,
          },
        ],
        cursors: [
          {
            position: 0,
            name: '',
            selection: { start: 0, end: 6 },
            isBlinking: true,
          },
          {
            position: 4,
            name: '',
            selection: { start: 3, end: 4 },
            isBlinking: true,
          },
          {
            position: 5,
            name: '',
            selection: { start: 5, end: 7 },
            isBlinking: true,
          },
        ],
        text: 'hllwrld',
        blinkAfter: 50,
        isPlaying: true,
        isFinished: false,
        hasBeenStoppedBefore: false,
        repeat: false,
        repeatDelay: 0,
      });

      jest.advanceTimersByTime(100);

      assertLastSubscriber(
        subscriber,
        {
          history: [],
          actions: [
            {
              type: 'keyboard',
              key: typewriterActionTypeClearAll,
              delay: 100,
              cursor: 2,
            },
          ],
          cursors: [
            { position: 0, name: '', selection: undefined, isBlinking: true },
            { position: 0, name: '', selection: undefined, isBlinking: true },
            { position: 0, name: '', selection: undefined, isBlinking: false },
          ],
          text: '',
          blinkAfter: 50,
          isPlaying: false,
          isFinished: true,
          hasBeenStoppedBefore: false,
          repeat: false,
          repeatDelay: 0,
        },
        {
          type: 'FINISHED',
          action: {
            type: 'keyboard',
            key: typewriterActionTypeClearAll,
            delay: 100,
            cursor: 2,
          },
          time: new Date(),
          cursor: typewriter.cursors[2],
        }
      );
    });
  });

  describe('repeat', () => {
    it('should when repeat is false run the animation only once', () => {
      const typewriter = new Typewriter({
        actions: [
          {
            type: 'keyboard',
            key: 'a',
            delay: 50,
            cursor: 0,
          },
          {
            type: 'keyboard',
            key: 'b',
            delay: 50,
            cursor: 0,
          },
          {
            type: 'keyboard',
            key: 'c',
            delay: 50,
            cursor: 0,
          },
        ],
        blinkAfter: 50,
        repeat: false,
        repeatDelay: 0,
      });
      const subscriber = autoSubscribe(typewriter);

      assertState(typewriter, {
        history: [],
        actions: [
          {
            type: 'keyboard',
            key: 'a',
            delay: 50,
            cursor: 0,
          },
          {
            type: 'keyboard',
            key: 'b',
            delay: 50,
            cursor: 0,
          },
          {
            type: 'keyboard',
            key: 'c',
            delay: 50,
            cursor: 0,
          },
        ],
        cursors: [{ position: 0, name: '', isBlinking: true }],
        text: '',
        blinkAfter: 50,
        isPlaying: true,
        isFinished: false,
        hasBeenStoppedBefore: false,
        repeat: false,
        repeatDelay: 0,
      });

      jest.advanceTimersByTime(50);

      assertLastSubscriber(
        subscriber,
        {
          history: [],
          actions: [
            {
              type: 'keyboard',
              key: 'a',
              delay: 50,
              cursor: 0,
            },
            {
              type: 'keyboard',
              key: 'b',
              delay: 50,
              cursor: 0,
            },
            {
              type: 'keyboard',
              key: 'c',
              delay: 50,
              cursor: 0,
            },
          ],
          cursors: [{ position: 1, name: '', isBlinking: false }],
          text: 'a',
          blinkAfter: 50,
          isPlaying: true,
          isFinished: false,
          hasBeenStoppedBefore: false,
          repeat: false,
          repeatDelay: 0,
        },
        {
          type: 'CHANGED',
          action: {
            type: 'keyboard',
            key: 'a',
            delay: 50,
            cursor: 0,
          },
          time: new Date(),
          cursor: typewriter.cursors[0],
        }
      );

      jest.advanceTimersByTime(50);

      assertLastSubscriber(
        subscriber,
        {
          history: [],
          actions: [
            {
              type: 'keyboard',
              key: 'a',
              delay: 50,
              cursor: 0,
            },
            {
              type: 'keyboard',
              key: 'b',
              delay: 50,
              cursor: 0,
            },
            {
              type: 'keyboard',
              key: 'c',
              delay: 50,
              cursor: 0,
            },
          ],
          cursors: [{ position: 2, name: '', isBlinking: false }],
          text: 'ab',
          blinkAfter: 50,
          isPlaying: true,
          isFinished: false,
          hasBeenStoppedBefore: false,
          repeat: false,
          repeatDelay: 0,
        },
        {
          type: 'CHANGED',
          action: {
            type: 'keyboard',
            key: 'b',
            delay: 50,
            cursor: 0,
          },
          time: new Date(),
          cursor: typewriter.cursors[0],
        }
      );

      jest.advanceTimersByTime(50);

      assertLastSubscriber(
        subscriber,
        {
          history: [],
          actions: [
            {
              type: 'keyboard',
              key: 'a',
              delay: 50,
              cursor: 0,
            },
            {
              type: 'keyboard',
              key: 'b',
              delay: 50,
              cursor: 0,
            },
            {
              type: 'keyboard',
              key: 'c',
              delay: 50,
              cursor: 0,
            },
          ],
          cursors: [{ position: 3, name: '', isBlinking: false }],
          text: 'abc',
          blinkAfter: 50,
          isPlaying: false,
          isFinished: true,
          hasBeenStoppedBefore: false,
          repeat: false,
          repeatDelay: 0,
        },
        {
          type: 'FINISHED',
          action: {
            type: 'keyboard',
            key: 'c',
            delay: 50,
            cursor: 0,
          },
          time: new Date(),
          cursor: typewriter.cursors[0],
        }
      );
    });

    it('should when repeat is 1 run the animation only once', () => {
      const typewriter = new Typewriter({
        actions: [
          {
            type: 'keyboard',
            key: 'a',
            delay: 50,
            cursor: 0,
          },
          {
            type: 'keyboard',
            key: 'b',
            delay: 50,
            cursor: 0,
          },
          {
            type: 'keyboard',
            key: 'c',
            delay: 50,
            cursor: 0,
          },
        ],
        blinkAfter: 50,
        repeat: 1,
        repeatDelay: 0,
      });
      const subscriber = autoSubscribe(typewriter);

      assertState(typewriter, {
        history: [],
        actions: [
          {
            type: 'keyboard',
            key: 'a',
            delay: 50,
            cursor: 0,
          },
          {
            type: 'keyboard',
            key: 'b',
            delay: 50,
            cursor: 0,
          },
          {
            type: 'keyboard',
            key: 'c',
            delay: 50,
            cursor: 0,
          },
        ],
        cursors: [{ position: 0, name: '', isBlinking: true }],
        text: '',
        blinkAfter: 50,
        isPlaying: true,
        isFinished: false,
        hasBeenStoppedBefore: false,
        repeat: 1,
        repeatDelay: 0,
      });

      jest.advanceTimersByTime(50);

      assertLastSubscriber(
        subscriber,
        {
          history: [],
          actions: [
            {
              type: 'keyboard',
              key: 'a',
              delay: 50,
              cursor: 0,
            },
            {
              type: 'keyboard',
              key: 'b',
              delay: 50,
              cursor: 0,
            },
            {
              type: 'keyboard',
              key: 'c',
              delay: 50,
              cursor: 0,
            },
          ],
          cursors: [{ position: 1, name: '', isBlinking: false }],
          text: 'a',
          blinkAfter: 50,
          isPlaying: true,
          isFinished: false,
          hasBeenStoppedBefore: false,
          repeat: 1,
          repeatDelay: 0,
        },
        {
          type: 'CHANGED',
          action: {
            type: 'keyboard',
            key: 'a',
            delay: 50,
            cursor: 0,
          },
          time: new Date(),
          cursor: typewriter.cursors[0],
        }
      );

      jest.advanceTimersByTime(50);

      assertLastSubscriber(
        subscriber,
        {
          history: [],
          actions: [
            {
              type: 'keyboard',
              key: 'a',
              delay: 50,
              cursor: 0,
            },
            {
              type: 'keyboard',
              key: 'b',
              delay: 50,
              cursor: 0,
            },
            {
              type: 'keyboard',
              key: 'c',
              delay: 50,
              cursor: 0,
            },
          ],
          cursors: [{ position: 2, name: '', isBlinking: false }],
          text: 'ab',
          blinkAfter: 50,
          isPlaying: true,
          isFinished: false,
          hasBeenStoppedBefore: false,
          repeat: 1,
          repeatDelay: 0,
        },
        {
          type: 'CHANGED',
          action: {
            type: 'keyboard',
            key: 'b',
            delay: 50,
            cursor: 0,
          },
          time: new Date(),
          cursor: typewriter.cursors[0],
        }
      );

      jest.advanceTimersByTime(50);

      assertLastSubscriber(
        subscriber,
        {
          history: [],
          actions: [
            {
              type: 'keyboard',
              key: 'a',
              delay: 50,
              cursor: 0,
            },
            {
              type: 'keyboard',
              key: 'b',
              delay: 50,
              cursor: 0,
            },
            {
              type: 'keyboard',
              key: 'c',
              delay: 50,
              cursor: 0,
            },
          ],
          cursors: [{ position: 3, name: '', isBlinking: false }],
          text: 'abc',
          blinkAfter: 50,
          isPlaying: false,
          isFinished: true,
          hasBeenStoppedBefore: false,
          repeat: 1,
          repeatDelay: 0,
        },
        {
          type: 'FINISHED',
          action: {
            type: 'keyboard',
            key: 'c',
            delay: 50,
            cursor: 0,
          },
          time: new Date(),
          cursor: typewriter.cursors[0],
        }
      );
    });

    it('should when repeat is true run the animation indefinitely', () => {
      const typewriter = new Typewriter({
        actions: [
          {
            type: 'keyboard',
            key: 'a',
            delay: 50,
            cursor: 0,
          },
          {
            type: 'keyboard',
            key: 'b',
            delay: 50,
            cursor: 0,
          },
          {
            type: 'keyboard',
            key: 'c',
            delay: 50,
            cursor: 0,
          },
        ],
        blinkAfter: 50,
        repeat: true,
        repeatDelay: 1,
        cursors: [{ position: 0, name: 'Owen' }],
      });
      const subscriber = autoSubscribe(typewriter);

      assertState(typewriter, {
        history: [],
        actions: [
          {
            type: 'keyboard',
            key: 'a',
            delay: 50,
            cursor: 0,
          },
          {
            type: 'keyboard',
            key: 'b',
            delay: 50,
            cursor: 0,
          },
          {
            type: 'keyboard',
            key: 'c',
            delay: 50,
            cursor: 0,
          },
        ],
        cursors: [{ position: 0, name: 'Owen', isBlinking: true }],
        text: '',
        blinkAfter: 50,
        isPlaying: true,
        isFinished: false,
        hasBeenStoppedBefore: false,
        repeat: true,
        repeatDelay: 1,
      });

      function checkIteration() {
        jest.advanceTimersByTime(50);

        assertLastSubscriber(
          subscriber,
          {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: 'a',
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: 'b',
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: 'c',
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [{ position: 1, name: 'Owen', isBlinking: false }],
            text: 'a',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: true,
            repeatDelay: 1,
          },
          {
            type: 'CHANGED',
            action: {
              type: 'keyboard',
              key: 'a',
              delay: 50,
              cursor: 0,
            },
            time: new Date(),
            cursor: typewriter.cursors[0],
          }
        );

        jest.advanceTimersByTime(50);

        assertLastSubscriber(
          subscriber,
          {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: 'a',
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: 'b',
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: 'c',
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [{ position: 2, name: 'Owen', isBlinking: false }],
            text: 'ab',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: true,
            repeatDelay: 1,
          },
          {
            type: 'CHANGED',
            action: {
              type: 'keyboard',
              key: 'b',
              delay: 50,
              cursor: 0,
            },
            time: new Date(),
            cursor: typewriter.cursors[0],
          }
        );

        jest.advanceTimersByTime(50);

        assertLastSubscriber(
          subscriber,
          {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: 'a',
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: 'b',
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: 'c',
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [{ position: 3, name: 'Owen', isBlinking: false }],
            text: 'abc',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: true,
            repeatDelay: 1,
          },
          {
            type: 'CHANGED',
            action: {
              type: 'keyboard',
              key: 'c',
              delay: 50,
              cursor: 0,
            },
            time: new Date(),
            cursor: typewriter.cursors[0],
          }
        );

        jest.advanceTimersByTime(1);

        assertLastSubscriber(
          subscriber,
          {
            history: [],
            actions: [
              {
                type: 'keyboard',
                key: 'a',
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: 'b',
                delay: 50,
                cursor: 0,
              },
              {
                type: 'keyboard',
                key: 'c',
                delay: 50,
                cursor: 0,
              },
            ],
            cursors: [{ position: 0, name: 'Owen', isBlinking: true }],
            text: '',
            blinkAfter: 50,
            isPlaying: true,
            isFinished: false,
            hasBeenStoppedBefore: false,
            repeat: true,
            repeatDelay: 1,
          },
          {
            type: 'REPEATING',
            time: new Date(),
            cursor: typewriter.cursors[0],
          }
        );
      }

      // Run 10 times then call it a day
      checkIteration();
      checkIteration();
      checkIteration();
      checkIteration();
      checkIteration();
      checkIteration();
      checkIteration();
      checkIteration();
      checkIteration();
    });

    it('should when repeat is a number repeat that number amount of times, and then finish', () => {
      const typewriter = new Typewriter({
        actions: [
          {
            type: 'keyboard',
            key: 'a',
            delay: 50,
            cursor: 0,
          },
          {
            type: 'keyboard',
            key: 'b',
            delay: 50,
            cursor: 0,
          },
          {
            type: 'keyboard',
            key: 'c',
            delay: 50,
            cursor: 0,
          },
        ],
        text: 'z',
        blinkAfter: 50,
        repeat: 3,
      });
      const subscriber = autoSubscribe(typewriter);

      assertState(typewriter, {
        history: [],
        actions: [
          {
            type: 'keyboard',
            key: 'a',
            delay: 50,
            cursor: 0,
          },
          {
            type: 'keyboard',
            key: 'b',
            delay: 50,
            cursor: 0,
          },
          {
            type: 'keyboard',
            key: 'c',
            delay: 50,
            cursor: 0,
          },
        ],
        cursors: [{ position: 1, name: '', isBlinking: true }],
        text: 'z',
        blinkAfter: 50,
        isPlaying: true,
        isFinished: false,
        hasBeenStoppedBefore: false,
        repeat: 3,
        repeatDelay: 0,
      });

      // First iteration

      jest.advanceTimersByTime(50);

      assertLastSubscriber(
        subscriber,
        {
          history: [],
          actions: [
            {
              type: 'keyboard',
              key: 'a',
              delay: 50,
              cursor: 0,
            },
            {
              type: 'keyboard',
              key: 'b',
              delay: 50,
              cursor: 0,
            },
            {
              type: 'keyboard',
              key: 'c',
              delay: 50,
              cursor: 0,
            },
          ],
          cursors: [{ position: 2, name: '', isBlinking: false }],
          text: 'za',
          blinkAfter: 50,
          isPlaying: true,
          isFinished: false,
          hasBeenStoppedBefore: false,
          repeat: 3,
          repeatDelay: 0,
        },
        {
          type: 'CHANGED',
          action: {
            type: 'keyboard',
            key: 'a',
            delay: 50,
            cursor: 0,
          },
          time: new Date(),
          cursor: typewriter.cursors[0],
        }
      );

      jest.advanceTimersByTime(50);

      assertLastSubscriber(
        subscriber,
        {
          history: [],
          actions: [
            {
              type: 'keyboard',
              key: 'a',
              delay: 50,
              cursor: 0,
            },
            {
              type: 'keyboard',
              key: 'b',
              delay: 50,
              cursor: 0,
            },
            {
              type: 'keyboard',
              key: 'c',
              delay: 50,
              cursor: 0,
            },
          ],
          cursors: [{ position: 3, name: '', isBlinking: false }],
          text: 'zab',
          blinkAfter: 50,
          isPlaying: true,
          isFinished: false,
          hasBeenStoppedBefore: false,
          repeat: 3,
          repeatDelay: 0,
        },
        {
          type: 'CHANGED',
          action: {
            type: 'keyboard',
            key: 'b',
            delay: 50,
            cursor: 0,
          },
          time: new Date(),
          cursor: typewriter.cursors[0],
        }
      );

      jest.advanceTimersByTime(50);

      assertLastSubscriber(
        subscriber,
        {
          history: [],
          actions: [
            {
              type: 'keyboard',
              key: 'a',
              delay: 50,
              cursor: 0,
            },
            {
              type: 'keyboard',
              key: 'b',
              delay: 50,
              cursor: 0,
            },
            {
              type: 'keyboard',
              key: 'c',
              delay: 50,
              cursor: 0,
            },
          ],
          cursors: [{ position: 4, name: '', isBlinking: false }],
          text: 'zabc',
          blinkAfter: 50,
          isPlaying: true,
          isFinished: false,
          hasBeenStoppedBefore: false,
          repeat: 3,
          repeatDelay: 0,
        },
        {
          type: 'CHANGED',
          action: {
            type: 'keyboard',
            key: 'c',
            delay: 50,
            cursor: 0,
          },
          time: new Date(),
          cursor: typewriter.cursors[0],
        }
      );

      jest.advanceTimersByTime(1);

      assertLastSubscriber(
        subscriber,
        {
          history: [],
          actions: [
            {
              type: 'keyboard',
              key: 'a',
              delay: 50,
              cursor: 0,
            },
            {
              type: 'keyboard',
              key: 'b',
              delay: 50,
              cursor: 0,
            },
            {
              type: 'keyboard',
              key: 'c',
              delay: 50,
              cursor: 0,
            },
          ],
          cursors: [{ position: 1, name: '', isBlinking: true }],
          text: 'z',
          blinkAfter: 50,
          isPlaying: true,
          isFinished: false,
          hasBeenStoppedBefore: false,
          repeat: 3,
          repeatDelay: 0,
        },
        {
          type: 'REPEATING',
          time: new Date(),
          cursor: typewriter.cursors[0],
        }
      );

      // Second iteration

      jest.advanceTimersByTime(50);

      assertLastSubscriber(
        subscriber,
        {
          history: [],
          actions: [
            {
              type: 'keyboard',
              key: 'a',
              delay: 50,
              cursor: 0,
            },
            {
              type: 'keyboard',
              key: 'b',
              delay: 50,
              cursor: 0,
            },
            {
              type: 'keyboard',
              key: 'c',
              delay: 50,
              cursor: 0,
            },
          ],
          cursors: [{ position: 2, name: '', isBlinking: false }],
          text: 'za',
          blinkAfter: 50,
          isPlaying: true,
          isFinished: false,
          hasBeenStoppedBefore: false,
          repeat: 3,
          repeatDelay: 0,
        },
        {
          type: 'CHANGED',
          action: {
            type: 'keyboard',
            key: 'a',
            delay: 50,
            cursor: 0,
          },
          time: new Date(),
          cursor: typewriter.cursors[0],
        }
      );

      jest.advanceTimersByTime(50);

      assertLastSubscriber(
        subscriber,
        {
          history: [],
          actions: [
            {
              type: 'keyboard',
              key: 'a',
              delay: 50,
              cursor: 0,
            },
            {
              type: 'keyboard',
              key: 'b',
              delay: 50,
              cursor: 0,
            },
            {
              type: 'keyboard',
              key: 'c',
              delay: 50,
              cursor: 0,
            },
          ],
          cursors: [{ position: 3, name: '', isBlinking: false }],
          text: 'zab',
          blinkAfter: 50,
          isPlaying: true,
          isFinished: false,
          hasBeenStoppedBefore: false,
          repeat: 3,
          repeatDelay: 0,
        },
        {
          type: 'CHANGED',
          action: {
            type: 'keyboard',
            key: 'b',
            delay: 50,
            cursor: 0,
          },
          time: new Date(),
          cursor: typewriter.cursors[0],
        }
      );

      jest.advanceTimersByTime(50);

      assertLastSubscriber(
        subscriber,
        {
          history: [],
          actions: [
            {
              type: 'keyboard',
              key: 'a',
              delay: 50,
              cursor: 0,
            },
            {
              type: 'keyboard',
              key: 'b',
              delay: 50,
              cursor: 0,
            },
            {
              type: 'keyboard',
              key: 'c',
              delay: 50,
              cursor: 0,
            },
          ],
          cursors: [{ position: 4, name: '', isBlinking: false }],
          text: 'zabc',
          blinkAfter: 50,
          isPlaying: true,
          isFinished: false,
          hasBeenStoppedBefore: false,
          repeat: 3,
          repeatDelay: 0,
        },
        {
          type: 'CHANGED',
          action: {
            type: 'keyboard',
            key: 'c',
            delay: 50,
            cursor: 0,
          },
          time: new Date(),
          cursor: typewriter.cursors[0],
        }
      );

      jest.advanceTimersByTime(1);

      assertLastSubscriber(
        subscriber,
        {
          history: [],
          actions: [
            {
              type: 'keyboard',
              key: 'a',
              delay: 50,
              cursor: 0,
            },
            {
              type: 'keyboard',
              key: 'b',
              delay: 50,
              cursor: 0,
            },
            {
              type: 'keyboard',
              key: 'c',
              delay: 50,
              cursor: 0,
            },
          ],
          cursors: [{ position: 1, name: '', isBlinking: true }],
          text: 'z',
          blinkAfter: 50,
          isPlaying: true,
          isFinished: false,
          hasBeenStoppedBefore: false,
          repeat: 3,
          repeatDelay: 0,
        },
        {
          type: 'REPEATING',
          time: new Date(),
          cursor: typewriter.cursors[0],
        }
      );

      // Third iteration

      jest.advanceTimersByTime(50);

      assertLastSubscriber(
        subscriber,
        {
          history: [],
          actions: [
            {
              type: 'keyboard',
              key: 'a',
              delay: 50,
              cursor: 0,
            },
            {
              type: 'keyboard',
              key: 'b',
              delay: 50,
              cursor: 0,
            },
            {
              type: 'keyboard',
              key: 'c',
              delay: 50,
              cursor: 0,
            },
          ],
          cursors: [{ position: 2, name: '', isBlinking: false }],
          text: 'za',
          blinkAfter: 50,
          isPlaying: true,
          isFinished: false,
          hasBeenStoppedBefore: false,
          repeat: 3,
          repeatDelay: 0,
        },
        {
          type: 'CHANGED',
          action: {
            type: 'keyboard',
            key: 'a',
            delay: 50,
            cursor: 0,
          },
          time: new Date(),
          cursor: typewriter.cursors[0],
        }
      );

      jest.advanceTimersByTime(50);

      assertLastSubscriber(
        subscriber,
        {
          history: [],
          actions: [
            {
              type: 'keyboard',
              key: 'a',
              delay: 50,
              cursor: 0,
            },
            {
              type: 'keyboard',
              key: 'b',
              delay: 50,
              cursor: 0,
            },
            {
              type: 'keyboard',
              key: 'c',
              delay: 50,
              cursor: 0,
            },
          ],
          cursors: [{ position: 3, name: '', isBlinking: false }],
          text: 'zab',
          blinkAfter: 50,
          isPlaying: true,
          isFinished: false,
          hasBeenStoppedBefore: false,
          repeat: 3,
          repeatDelay: 0,
        },
        {
          type: 'CHANGED',
          action: {
            type: 'keyboard',
            key: 'b',
            delay: 50,
            cursor: 0,
          },
          time: new Date(),
          cursor: typewriter.cursors[0],
        }
      );

      jest.advanceTimersByTime(50);

      assertLastSubscriber(
        subscriber,
        {
          history: [],
          actions: [
            {
              type: 'keyboard',
              key: 'a',
              delay: 50,
              cursor: 0,
            },
            {
              type: 'keyboard',
              key: 'b',
              delay: 50,
              cursor: 0,
            },
            {
              type: 'keyboard',
              key: 'c',
              delay: 50,
              cursor: 0,
            },
          ],
          cursors: [{ position: 4, name: '', isBlinking: false }],
          text: 'zabc',
          blinkAfter: 50,
          isPlaying: false,
          isFinished: true,
          hasBeenStoppedBefore: false,
          repeat: 3,
          repeatDelay: 0,
        },
        {
          type: 'FINISHED',
          action: {
            type: 'keyboard',
            key: 'c',
            delay: 50,
            cursor: 0,
          },
          time: new Date(),
          cursor: typewriter.cursors[0],
        }
      );

      jest.advanceTimersByTime(1);
    });
  });

  describe('play & pause and stop', () => {
    test('that the animation can be paused and continued', () => {
      const typewriter = new Typewriter({
        actions: [
          {
            type: 'keyboard',
            key: 'a',
            delay: 100,
            cursor: 0,
          },
          {
            type: 'keyboard',
            key: 'b',
            delay: 100,
            cursor: 0,
          },
          {
            type: 'keyboard',
            key: 'c',
            delay: 100,
            cursor: 0,
          },
        ],
        blinkAfter: 50,
      });
      const subscriber = autoSubscribe(typewriter);

      // Should be empty initially
      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.cursors[0].isBlinking).toBe(true);
      expect(typewriter.hasBeenStoppedBefore).toBe(false);
      expect(typewriter.text).toBe('');
      assertEvents(subscriber, []);

      // After 100 milliseconds it should now be 'a'
      jest.advanceTimersByTime(100);

      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.cursors[0].isBlinking).toBe(false);
      expect(typewriter.hasBeenStoppedBefore).toBe(false);
      expect(typewriter.text).toBe('a');
      assertEvents(subscriber, ['CHANGED']);

      // Now pause it at the half way, it should be blinking now.
      jest.advanceTimersByTime(50);

      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.cursors[0].isBlinking).toBe(true);
      expect(typewriter.hasBeenStoppedBefore).toBe(false);
      expect(typewriter.text).toBe('a');
      assertEvents(subscriber, ['CHANGED', 'BLINKING']);

      typewriter.pause();

      expect(typewriter.isPlaying).toBe(false);
      expect(typewriter.cursors[0].isBlinking).toBe(true);
      expect(typewriter.text).toBe('a');
      assertEvents(subscriber, ['CHANGED', 'BLINKING', 'PAUSED']);

      // When paused advancing the time should do nothing.
      jest.advanceTimersByTime(500);

      expect(typewriter.isPlaying).toBe(false);
      expect(typewriter.cursors[0].isBlinking).toBe(true);
      expect(typewriter.hasBeenStoppedBefore).toBe(false);
      expect(typewriter.text).toBe('a');
      assertEvents(subscriber, ['CHANGED', 'BLINKING', 'PAUSED']);

      // Even when advancing a huge amount of seconds, it should
      // stay paused no matter what.
      jest.advanceTimersByTime(10000);

      expect(typewriter.isPlaying).toBe(false);
      expect(typewriter.cursors[0].isBlinking).toBe(true);
      expect(typewriter.hasBeenStoppedBefore).toBe(false);
      expect(typewriter.text).toBe('a');
      assertEvents(subscriber, ['CHANGED', 'BLINKING', 'PAUSED']);

      // Now press play, after 50 milliseconds it should type 'b'
      typewriter.play();

      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.cursors[0].isBlinking).toBe(true);
      expect(typewriter.hasBeenStoppedBefore).toBe(false);
      expect(typewriter.text).toBe('a');
      assertEvents(subscriber, ['CHANGED', 'BLINKING', 'PAUSED', 'PLAYING']);

      // Just before nothing should happen
      jest.advanceTimersByTime(49);

      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.cursors[0].isBlinking).toBe(true);
      expect(typewriter.hasBeenStoppedBefore).toBe(false);
      expect(typewriter.text).toBe('a');
      assertEvents(subscriber, ['CHANGED', 'BLINKING', 'PAUSED', 'PLAYING']);

      // Force it over
      jest.advanceTimersByTime(1);

      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.cursors[0].isBlinking).toBe(false);
      expect(typewriter.hasBeenStoppedBefore).toBe(false);
      expect(typewriter.text).toBe('ab');
      assertEvents(subscriber, [
        'CHANGED',
        'BLINKING',
        'PAUSED',
        'PLAYING',
        'CHANGED',
      ]);
    });

    test('that the autoplay can be stopped and restarted', () => {
      const typewriter = new Typewriter({
        actions: [
          {
            type: 'keyboard',
            key: 'a',
            delay: 100,
            cursor: 0,
          },
          {
            type: 'keyboard',
            key: 'b',
            delay: 100,
            cursor: 0,
          },
          {
            type: 'keyboard',
            key: 'c',
            delay: 100,
            cursor: 0,
          },
        ],
        blinkAfter: 50,
      });
      const subscriber = autoSubscribe(typewriter);

      // Should be empty initially
      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.cursors[0].isBlinking).toBe(true);
      expect(typewriter.hasBeenStoppedBefore).toBe(false);
      expect(typewriter.text).toBe('');
      assertEvents(subscriber, []);

      // After 100 milliseconds it should now be 'a'
      jest.advanceTimersByTime(100);

      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.cursors[0].isBlinking).toBe(false);
      expect(typewriter.hasBeenStoppedBefore).toBe(false);
      expect(typewriter.text).toBe('a');
      assertEvents(subscriber, ['CHANGED']);

      // Now stop it at the half way, it should be blinking now.
      jest.advanceTimersByTime(50);

      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.cursors[0].isBlinking).toBe(true);
      expect(typewriter.hasBeenStoppedBefore).toBe(false);
      expect(typewriter.text).toBe('a');
      assertEvents(subscriber, ['CHANGED', 'BLINKING']);

      typewriter.stop();

      expect(typewriter.isPlaying).toBe(false);
      expect(typewriter.cursors[0].isBlinking).toBe(true);
      expect(typewriter.hasBeenStoppedBefore).toBe(true);
      expect(typewriter.text).toBe('a');
      assertEvents(subscriber, ['CHANGED', 'BLINKING', 'STOPPED']);

      // When stopped advancing the time should do nothing.
      jest.advanceTimersByTime(500);

      expect(typewriter.isPlaying).toBe(false);
      expect(typewriter.cursors[0].isBlinking).toBe(true);
      expect(typewriter.hasBeenStoppedBefore).toBe(true);
      expect(typewriter.text).toBe('a');
      assertEvents(subscriber, ['CHANGED', 'BLINKING', 'STOPPED']);

      // Even when advancing a huge amount of seconds, it should
      // stay stopped no matter what.
      jest.advanceTimersByTime(10000);

      expect(typewriter.isPlaying).toBe(false);
      expect(typewriter.cursors[0].isBlinking).toBe(true);
      expect(typewriter.hasBeenStoppedBefore).toBe(true);
      expect(typewriter.text).toBe('a');
      assertEvents(subscriber, ['CHANGED', 'BLINKING', 'STOPPED']);

      // Now press play, after 100 milliseconds it should type 'a'
      typewriter.play();

      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.cursors[0].isBlinking).toBe(true);
      expect(typewriter.hasBeenStoppedBefore).toBe(true);
      expect(typewriter.text).toBe('');
      assertEvents(subscriber, ['CHANGED', 'BLINKING', 'STOPPED', 'PLAYING']);

      // Just before nothing should happen
      jest.advanceTimersByTime(99);

      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.cursors[0].isBlinking).toBe(true);
      expect(typewriter.text).toBe('');
      assertEvents(subscriber, ['CHANGED', 'BLINKING', 'STOPPED', 'PLAYING']);

      // Force it over
      jest.advanceTimersByTime(1);

      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.cursors[0].isBlinking).toBe(false);
      expect(typewriter.hasBeenStoppedBefore).toBe(true);
      expect(typewriter.text).toBe('a');
      assertEvents(subscriber, [
        'CHANGED',
        'BLINKING',
        'STOPPED',
        'PLAYING',
        'CHANGED',
      ]);
    });

    test('that calling play when finished restarts the animation', () => {
      const typewriter = new Typewriter({
        actions: [
          {
            type: 'keyboard',
            key: 'a',
            delay: 100,
            cursor: 0,
          },
          {
            type: 'keyboard',
            key: 'b',
            delay: 100,
            cursor: 0,
          },
        ],
        blinkAfter: 200,
      });
      const subscriber = autoSubscribe(typewriter);

      // Should be empty initially
      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.cursors[0].isBlinking).toBe(true);
      expect(typewriter.hasBeenStoppedBefore).toBe(false);
      expect(typewriter.text).toBe('');
      assertEvents(subscriber, []);

      // After 100 milliseconds it should now be 'a'
      jest.advanceTimersByTime(100);

      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.isFinished).toBe(false);
      expect(typewriter.cursors[0].isBlinking).toBe(false);
      expect(typewriter.hasBeenStoppedBefore).toBe(false);
      expect(typewriter.text).toBe('a');
      assertEvents(subscriber, ['CHANGED']);

      // Stop the animation so we can test if the 'hasBeenStoppedBefore'
      // will be reset after play() is called when FINISHED.
      typewriter.stop();

      expect(typewriter.isPlaying).toBe(false);
      expect(typewriter.isFinished).toBe(false);
      expect(typewriter.cursors[0].isBlinking).toBe(true);
      expect(typewriter.hasBeenStoppedBefore).toBe(true);
      expect(typewriter.text).toBe('a');
      assertEvents(subscriber, ['CHANGED', 'STOPPED']);

      // Now trigger the play an run the animation to finished.
      typewriter.play();

      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.isFinished).toBe(false);
      expect(typewriter.cursors[0].isBlinking).toBe(true);
      expect(typewriter.hasBeenStoppedBefore).toBe(true);
      expect(typewriter.text).toBe('');
      assertEvents(subscriber, ['CHANGED', 'STOPPED', 'PLAYING']);

      // After 100 milliseconds it should now be 'a'
      jest.advanceTimersByTime(100);

      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.isFinished).toBe(false);
      expect(typewriter.cursors[0].isBlinking).toBe(false);
      expect(typewriter.hasBeenStoppedBefore).toBe(true);
      expect(typewriter.text).toBe('a');
      assertEvents(subscriber, ['CHANGED', 'STOPPED', 'PLAYING', 'CHANGED']);

      // After 100 milliseconds it should now be 'b'
      jest.advanceTimersByTime(100);

      expect(typewriter.isPlaying).toBe(false);
      expect(typewriter.isFinished).toBe(true);
      expect(typewriter.cursors[0].isBlinking).toBe(false);
      expect(typewriter.hasBeenStoppedBefore).toBe(true);
      expect(typewriter.text).toBe('ab');
      assertEvents(subscriber, [
        'CHANGED',
        'STOPPED',
        'PLAYING',
        'CHANGED',
        'FINISHED',
      ]);

      // Trigger blinking
      jest.advanceTimersByTime(200);
      assertEvents(subscriber, [
        'CHANGED',
        'STOPPED',
        'PLAYING',
        'CHANGED',
        'FINISHED',
        'BLINKING',
      ]);

      // Nothing should happen unless play() is called
      jest.advanceTimersByTime(1000);
      assertEvents(subscriber, [
        'CHANGED',
        'STOPPED',
        'PLAYING',
        'CHANGED',
        'FINISHED',
        'BLINKING',
      ]);

      // Call play
      typewriter.play();

      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.isFinished).toBe(false);
      expect(typewriter.cursors[0].isBlinking).toBe(true);
      expect(typewriter.hasBeenStoppedBefore).toBe(false);
      expect(typewriter.text).toBe('');
      assertEvents(subscriber, [
        'CHANGED',
        'STOPPED',
        'PLAYING',
        'CHANGED',
        'FINISHED',
        'BLINKING',
        'PLAYING',
      ]);

      // After 100 milliseconds it should now be 'a'
      jest.advanceTimersByTime(100);

      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.isFinished).toBe(false);
      expect(typewriter.cursors[0].isBlinking).toBe(false);
      expect(typewriter.hasBeenStoppedBefore).toBe(false);
      expect(typewriter.text).toBe('a');
      assertEvents(subscriber, [
        'CHANGED',
        'STOPPED',
        'PLAYING',
        'CHANGED',
        'FINISHED',
        'BLINKING',
        'PLAYING',
        'CHANGED',
      ]);

      // After 100 milliseconds it should now be 'b'
      jest.advanceTimersByTime(100);

      expect(typewriter.isPlaying).toBe(false);
      expect(typewriter.isFinished).toBe(true);
      expect(typewriter.cursors[0].isBlinking).toBe(false);
      expect(typewriter.hasBeenStoppedBefore).toBe(false);
      expect(typewriter.text).toBe('ab');
      assertEvents(subscriber, [
        'CHANGED',
        'STOPPED',
        'PLAYING',
        'CHANGED',
        'FINISHED',
        'BLINKING',
        'PLAYING',
        'CHANGED',
        'FINISHED',
      ]);
    });

    test('that the autoplay can be stopped and restarted with the original text', () => {
      const typewriter = new Typewriter({
        actions: [
          {
            type: 'keyboard',
            key: 'a',
            delay: 100,
            cursor: 0,
          },
          {
            type: 'keyboard',
            key: 'b',
            delay: 100,
            cursor: 0,
          },
          {
            type: 'keyboard',
            key: 'c',
            delay: 100,
            cursor: 0,
          },
        ],
        blinkAfter: 50,
        text: 'z',
      });
      const subscriber = autoSubscribe(typewriter);

      // Should be empty initially
      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.cursors[0].isBlinking).toBe(true);
      expect(typewriter.hasBeenStoppedBefore).toBe(false);
      expect(typewriter.text).toBe('z');
      assertEvents(subscriber, []);

      // After 100 milliseconds it should now be 'a'
      jest.advanceTimersByTime(100);

      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.cursors[0].isBlinking).toBe(false);
      expect(typewriter.hasBeenStoppedBefore).toBe(false);
      expect(typewriter.text).toBe('za');
      assertEvents(subscriber, ['CHANGED']);

      // Now stop it at the half way, it should be blinking now.
      jest.advanceTimersByTime(50);

      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.cursors[0].isBlinking).toBe(true);
      expect(typewriter.hasBeenStoppedBefore).toBe(false);
      expect(typewriter.text).toBe('za');
      assertEvents(subscriber, ['CHANGED', 'BLINKING']);

      typewriter.stop();

      expect(typewriter.isPlaying).toBe(false);
      expect(typewriter.cursors[0].isBlinking).toBe(true);
      expect(typewriter.hasBeenStoppedBefore).toBe(true);
      expect(typewriter.text).toBe('za');
      assertEvents(subscriber, ['CHANGED', 'BLINKING', 'STOPPED']);

      // When stopped advancing the time should do nothing.
      jest.advanceTimersByTime(500);

      expect(typewriter.isPlaying).toBe(false);
      expect(typewriter.cursors[0].isBlinking).toBe(true);
      expect(typewriter.hasBeenStoppedBefore).toBe(true);
      expect(typewriter.text).toBe('za');
      assertEvents(subscriber, ['CHANGED', 'BLINKING', 'STOPPED']);

      // Even when advancing a huge amount of seconds, it should
      // stay stopped no matter what.
      jest.advanceTimersByTime(10000);

      expect(typewriter.isPlaying).toBe(false);
      expect(typewriter.cursors[0].isBlinking).toBe(true);
      expect(typewriter.hasBeenStoppedBefore).toBe(true);
      expect(typewriter.text).toBe('za');
      assertEvents(subscriber, ['CHANGED', 'BLINKING', 'STOPPED']);

      // Now press play, after 100 milliseconds it should type 'a'
      typewriter.play();

      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.cursors[0].isBlinking).toBe(true);
      expect(typewriter.hasBeenStoppedBefore).toBe(true);
      expect(typewriter.text).toBe('z');
      assertEvents(subscriber, ['CHANGED', 'BLINKING', 'STOPPED', 'PLAYING']);

      // Just before nothing should happen
      jest.advanceTimersByTime(99);

      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.cursors[0].isBlinking).toBe(true);
      expect(typewriter.hasBeenStoppedBefore).toBe(true);
      expect(typewriter.text).toBe('z');
      assertEvents(subscriber, ['CHANGED', 'BLINKING', 'STOPPED', 'PLAYING']);

      // Force it over
      jest.advanceTimersByTime(1);

      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.cursors[0].isBlinking).toBe(false);
      expect(typewriter.hasBeenStoppedBefore).toBe(true);
      expect(typewriter.text).toBe('za');
      assertEvents(subscriber, [
        'CHANGED',
        'BLINKING',
        'STOPPED',
        'PLAYING',
        'CHANGED',
      ]);
    });

    test('that the autoplay can be stopped and restarted when animation repeats', () => {
      const typewriter = new Typewriter({
        actions: [
          {
            type: 'keyboard',
            key: 'a',
            delay: 100,
            cursor: 0,
          },
          {
            type: 'keyboard',
            key: 'b',
            delay: 100,
            cursor: 0,
          },
        ],
        blinkAfter: 1000,
        repeat: 2,
      });
      const subscriber = autoSubscribe(typewriter);

      // Should be empty initially
      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.cursors[0].isBlinking).toBe(true);
      expect(typewriter.hasBeenStoppedBefore).toBe(false);
      expect(typewriter.text).toBe('');
      assertEvents(subscriber, []);

      // After 100 milliseconds it should now be 'a'
      jest.advanceTimersByTime(100);

      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.cursors[0].isBlinking).toBe(false);
      expect(typewriter.hasBeenStoppedBefore).toBe(false);
      expect(typewriter.text).toBe('a');
      assertEvents(subscriber, ['CHANGED']);

      // Stop at 'a'
      typewriter.stop();

      expect(typewriter.isPlaying).toBe(false);
      expect(typewriter.cursors[0].isBlinking).toBe(true);
      expect(typewriter.hasBeenStoppedBefore).toBe(true);
      expect(typewriter.text).toBe('a');
      assertEvents(subscriber, ['CHANGED', 'STOPPED']);

      // Reset now, the animation should now play twice.
      typewriter.play();

      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.cursors[0].isBlinking).toBe(true);
      expect(typewriter.hasBeenStoppedBefore).toBe(true);
      expect(typewriter.text).toBe('');
      assertEvents(subscriber, ['CHANGED', 'STOPPED', 'PLAYING']);

      jest.advanceTimersByTime(100);

      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.cursors[0].isBlinking).toBe(false);
      expect(typewriter.hasBeenStoppedBefore).toBe(true);
      expect(typewriter.text).toBe('a');
      assertEvents(subscriber, ['CHANGED', 'STOPPED', 'PLAYING', 'CHANGED']);

      jest.advanceTimersByTime(100);

      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.cursors[0].isBlinking).toBe(false);
      expect(typewriter.hasBeenStoppedBefore).toBe(true);
      expect(typewriter.text).toBe('ab');
      assertEvents(subscriber, [
        'CHANGED',
        'STOPPED',
        'PLAYING',
        'CHANGED',
        'CHANGED',
      ]);

      // Repeat first time
      jest.advanceTimersByTime(100);

      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.cursors[0].isBlinking).toBe(true);
      expect(typewriter.hasBeenStoppedBefore).toBe(true);
      expect(typewriter.text).toBe('');
      assertEvents(subscriber, [
        'CHANGED',
        'STOPPED',
        'PLAYING',
        'CHANGED',
        'CHANGED',
        'REPEATING',
      ]);

      jest.advanceTimersByTime(100);

      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.cursors[0].isBlinking).toBe(false);
      expect(typewriter.hasBeenStoppedBefore).toBe(true);
      expect(typewriter.text).toBe('a');
      assertEvents(subscriber, [
        'CHANGED',
        'STOPPED',
        'PLAYING',
        'CHANGED',
        'CHANGED',
        'REPEATING',
        'CHANGED',
      ]);

      jest.advanceTimersByTime(100);

      expect(typewriter.isPlaying).toBe(false);
      expect(typewriter.cursors[0].isBlinking).toBe(false);
      expect(typewriter.hasBeenStoppedBefore).toBe(true);
      expect(typewriter.text).toBe('ab');
      assertEvents(subscriber, [
        'CHANGED',
        'STOPPED',
        'PLAYING',
        'CHANGED',
        'CHANGED',
        'REPEATING',
        'CHANGED',
        'FINISHED',
      ]);
    });

    test('that it is possible to pause first then stop', () => {
      const typewriter = new Typewriter({
        actions: [
          {
            type: 'keyboard',
            key: 'a',
            delay: 100,
            cursor: 0,
          },
          {
            type: 'keyboard',
            key: 'b',
            delay: 100,
            cursor: 0,
          },
          {
            type: 'keyboard',
            key: 'c',
            delay: 100,
            cursor: 0,
          },
        ],
        blinkAfter: 50,
      });
      const subscriber = autoSubscribe(typewriter);

      // Should be empty initially
      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.cursors[0].isBlinking).toBe(true);
      expect(typewriter.hasBeenStoppedBefore).toBe(false);
      expect(typewriter.text).toBe('');
      assertEvents(subscriber, []);

      typewriter.pause();

      expect(typewriter.isPlaying).toBe(false);

      assertEvents(subscriber, ['PAUSED']);

      // Now press stop it should clear the the pause
      typewriter.stop();

      expect(typewriter.isPlaying).toBe(false);
      expect(typewriter.hasBeenStoppedBefore).toBe(true);

      assertEvents(subscriber, ['PAUSED', 'STOPPED']);
    });

    test('that it is not possible to pause when already paused', () => {
      const typewriter = new Typewriter({
        actions: [
          {
            type: 'keyboard',
            key: 'a',
            delay: 100,
            cursor: 0,
          },
          {
            type: 'keyboard',
            key: 'b',
            delay: 100,
            cursor: 0,
          },
          {
            type: 'keyboard',
            key: 'c',
            delay: 100,
            cursor: 0,
          },
        ],
        blinkAfter: 50,
      });
      const subscriber = autoSubscribe(typewriter);

      // Should be empty initially
      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.cursors[0].isBlinking).toBe(true);
      expect(typewriter.hasBeenStoppedBefore).toBe(false);
      expect(typewriter.text).toBe('');
      assertEvents(subscriber, []);

      typewriter.pause();

      expect(typewriter.isPlaying).toBe(false);

      assertEvents(subscriber, ['PAUSED']);

      // Now press pause again it should be ignored
      typewriter.pause();

      expect(typewriter.isPlaying).toBe(false);
      expect(typewriter.hasBeenStoppedBefore).toBe(false);

      assertEvents(subscriber, ['PAUSED']);
    });

    test('that it is not possible to stop when already stopped', () => {
      const typewriter = new Typewriter({
        actions: [
          {
            type: 'keyboard',
            key: 'a',
            delay: 100,
            cursor: 0,
          },
          {
            type: 'keyboard',
            key: 'b',
            delay: 100,
            cursor: 0,
          },
          {
            type: 'keyboard',
            key: 'c',
            delay: 100,
            cursor: 0,
          },
        ],
        blinkAfter: 50,
      });
      const subscriber = autoSubscribe(typewriter);

      // Should be empty initially
      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.cursors[0].isBlinking).toBe(true);
      expect(typewriter.hasBeenStoppedBefore).toBe(false);
      expect(typewriter.text).toBe('');
      assertEvents(subscriber, []);

      typewriter.stop();

      expect(typewriter.isPlaying).toBe(false);
      expect(typewriter.hasBeenStoppedBefore).toBe(true);

      assertEvents(subscriber, ['STOPPED']);

      // Now press stop again it should be ignored
      typewriter.stop();

      expect(typewriter.isPlaying).toBe(false);
      expect(typewriter.hasBeenStoppedBefore).toBe(true);

      assertEvents(subscriber, ['STOPPED']);
    });

    test('that it is not possible to stop when never playing', () => {
      const typewriter = new Typewriter();
      const subscriber = autoSubscribe(typewriter);

      // Should be empty initially
      expect(typewriter.isPlaying).toBe(false);
      expect(typewriter.cursors[0].isBlinking).toBe(true);
      expect(typewriter.hasBeenStoppedBefore).toBe(false);
      expect(typewriter.text).toBe('');
      assertEvents(subscriber, []);

      typewriter.stop();

      expect(typewriter.isPlaying).toBe(false);
      expect(typewriter.hasBeenStoppedBefore).toBe(false);

      assertEvents(subscriber, []);
    });

    test('that it is not possible to play when already playing', () => {
      const typewriter = new Typewriter({
        actions: [
          {
            type: 'keyboard',
            key: 'a',
            delay: 100,
            cursor: 0,
          },
          {
            type: 'keyboard',
            key: 'b',
            delay: 100,
            cursor: 0,
          },
          {
            type: 'keyboard',
            key: 'c',
            delay: 100,
            cursor: 0,
          },
        ],
        blinkAfter: 50,
      });
      const subscriber = autoSubscribe(typewriter);

      // Should be empty initially
      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.cursors[0].isBlinking).toBe(true);
      expect(typewriter.hasBeenStoppedBefore).toBe(false);
      expect(typewriter.text).toBe('');
      assertEvents(subscriber, []);

      typewriter.play();

      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.hasBeenStoppedBefore).toBe(false);

      assertEvents(subscriber, []);
    });

    test('that it is not possible to stop when already finished', () => {
      const typewriter = new Typewriter({
        actions: [
          {
            type: 'keyboard',
            key: 'a',
            delay: 100,
            cursor: 0,
          },
        ],
        blinkAfter: 50,
      });
      const subscriber = autoSubscribe(typewriter);

      // Should be empty initially
      expect(typewriter.isFinished).toBe(false);
      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.cursors[0].isBlinking).toBe(true);
      expect(typewriter.hasBeenStoppedBefore).toBe(false);
      expect(typewriter.text).toBe('');
      assertEvents(subscriber, []);

      // Let the animation run its course
      jest.advanceTimersByTime(100);

      expect(typewriter.isFinished).toBe(true);
      expect(typewriter.isPlaying).toBe(false);
      expect(typewriter.cursors[0].isBlinking).toBe(false);
      expect(typewriter.hasBeenStoppedBefore).toBe(false);
      expect(typewriter.text).toBe('a');
      assertEvents(subscriber, ['FINISHED']);

      // Should not do anything.
      typewriter.stop();

      expect(typewriter.hasBeenStoppedBefore).toBe(false);

      assertEvents(subscriber, ['FINISHED']);
    });
  });

  describe('blinking', () => {
    it('should not blink a cursor when the user is typing until after the blinkAfter, and debounce the blinking whenever an event occurs', () => {
      const typewriter = new Typewriter({
        blinkAfter: 250, // btw this is the default
        cursors: [{ position: 0 }],
        actions: [
          { type: 'keyboard', key: 'j', delay: 50, cursor: 0 },
          { type: 'keyboard', key: 'o', delay: 50, cursor: 0 },
          { type: 'keyboard', key: 'y', delay: 50, cursor: 0 },
          { type: 'keyboard', key: '!', delay: 50, cursor: 0 },
        ],
      });
      const subscriber = autoSubscribe(typewriter);

      expect(typewriter.cursors[0].isBlinking).toBe(true);
      expect(typewriter.text).toBe('');
      assertEvents(subscriber, []);

      jest.advanceTimersByTime(50);
      expect(typewriter.cursors[0].isBlinking).toBe(false);
      expect(typewriter.text).toBe('j');
      assertEvents(subscriber, ['CHANGED']);

      jest.advanceTimersByTime(50);
      expect(typewriter.cursors[0].isBlinking).toBe(false);
      expect(typewriter.text).toBe('jo');
      assertEvents(subscriber, ['CHANGED', 'CHANGED']);

      jest.advanceTimersByTime(50);
      expect(typewriter.cursors[0].isBlinking).toBe(false);
      expect(typewriter.text).toBe('joy');
      assertEvents(subscriber, ['CHANGED', 'CHANGED', 'CHANGED']);

      jest.advanceTimersByTime(50);
      expect(typewriter.cursors[0].isBlinking).toBe(false);
      expect(typewriter.text).toBe('joy!');
      assertEvents(subscriber, ['CHANGED', 'CHANGED', 'CHANGED', 'FINISHED']);

      // Move it to the edge
      jest.advanceTimersByTime(249);
      expect(typewriter.cursors[0].isBlinking).toBe(false);
      expect(typewriter.text).toBe('joy!');
      assertEvents(subscriber, ['CHANGED', 'CHANGED', 'CHANGED', 'FINISHED']);

      // Push it over
      jest.advanceTimersByTime(1);
      expect(typewriter.cursors[0].isBlinking).toBe(true);
      assertEvents(subscriber, [
        'CHANGED',
        'CHANGED',
        'CHANGED',
        'FINISHED',
        'BLINKING',
      ]);
    });

    describe('testing the edges', () => {
      it('should work even if a blinkAfter is equal to the delay', () => {
        // In this test we kind of misconfigure the Typewriter by
        // setting the blinkAfter equal to the delay.

        const typewriter = new Typewriter({
          blinkAfter: 50,
          cursors: [{ position: 0 }],
          actions: [
            { type: 'keyboard', key: 'j', delay: 50, cursor: 0 },
            { type: 'keyboard', key: 'o', delay: 50, cursor: 0 },
            { type: 'keyboard', key: 'y', delay: 50, cursor: 0 },
            { type: 'keyboard', key: '!', delay: 50, cursor: 0 },
          ],
        });
        const subscriber = autoSubscribe(typewriter);

        expect(typewriter.cursors[0].isBlinking).toBe(true);
        expect(typewriter.text).toBe('');
        assertEvents(subscriber, []);

        jest.advanceTimersByTime(50);
        expect(typewriter.cursors[0].isBlinking).toBe(false);
        expect(typewriter.text).toBe('j');
        assertEvents(subscriber, ['CHANGED']);

        jest.advanceTimersByTime(50);
        expect(typewriter.cursors[0].isBlinking).toBe(false);
        expect(typewriter.text).toBe('jo');
        assertEvents(subscriber, ['CHANGED', 'BLINKING', 'CHANGED']);

        jest.advanceTimersByTime(50);
        expect(typewriter.cursors[0].isBlinking).toBe(false);
        expect(typewriter.text).toBe('joy');
        assertEvents(subscriber, [
          'CHANGED',
          'BLINKING',
          'CHANGED',
          'BLINKING',
          'CHANGED',
        ]);

        jest.advanceTimersByTime(50);
        expect(typewriter.cursors[0].isBlinking).toBe(false);
        expect(typewriter.text).toBe('joy!');
        assertEvents(subscriber, [
          'CHANGED',
          'BLINKING',
          'CHANGED',
          'BLINKING',
          'CHANGED',
          'BLINKING',
          'FINISHED',
        ]);

        // Move it to the edge
        jest.advanceTimersByTime(49);
        expect(typewriter.cursors[0].isBlinking).toBe(false);
        expect(typewriter.text).toBe('joy!');
        assertEvents(subscriber, [
          'CHANGED',
          'BLINKING',
          'CHANGED',
          'BLINKING',
          'CHANGED',
          'BLINKING',
          'FINISHED',
        ]);

        // Push it over
        jest.advanceTimersByTime(1);
        expect(typewriter.cursors[0].isBlinking).toBe(true);
        assertEvents(subscriber, [
          'CHANGED',
          'BLINKING',
          'CHANGED',
          'BLINKING',
          'CHANGED',
          'BLINKING',
          'FINISHED',
          'BLINKING',
        ]);
      });

      it('should work even if a blinkAfter is one number less than the delay', () => {
        // In this test we kind of misconfigure the Typewriter by
        // setting the blinkAfter one less than the delay.

        const typewriter = new Typewriter({
          blinkAfter: 49,
          cursors: [{ position: 0 }],
          actions: [
            { type: 'keyboard', key: 'j', delay: 50, cursor: 0 },
            { type: 'keyboard', key: 'o', delay: 50, cursor: 0 },
            { type: 'keyboard', key: 'y', delay: 50, cursor: 0 },
            { type: 'keyboard', key: '!', delay: 50, cursor: 0 },
          ],
        });
        const subscriber = autoSubscribe(typewriter);

        expect(typewriter.cursors[0].isBlinking).toBe(true);
        expect(typewriter.text).toBe('');
        assertEvents(subscriber, []);

        jest.advanceTimersByTime(50);
        expect(typewriter.cursors[0].isBlinking).toBe(false);
        expect(typewriter.text).toBe('j');
        assertEvents(subscriber, ['CHANGED']);

        jest.advanceTimersByTime(50);
        expect(typewriter.cursors[0].isBlinking).toBe(false);
        expect(typewriter.text).toBe('jo');
        assertEvents(subscriber, ['CHANGED', 'BLINKING', 'CHANGED']);

        jest.advanceTimersByTime(50);
        expect(typewriter.cursors[0].isBlinking).toBe(false);
        expect(typewriter.text).toBe('joy');
        assertEvents(subscriber, [
          'CHANGED',
          'BLINKING',
          'CHANGED',
          'BLINKING',
          'CHANGED',
        ]);

        jest.advanceTimersByTime(50);
        expect(typewriter.cursors[0].isBlinking).toBe(false);
        expect(typewriter.text).toBe('joy!');
        assertEvents(subscriber, [
          'CHANGED',
          'BLINKING',
          'CHANGED',
          'BLINKING',
          'CHANGED',
          'BLINKING',
          'FINISHED',
        ]);

        // Move it to the edge
        jest.advanceTimersByTime(48);
        expect(typewriter.cursors[0].isBlinking).toBe(false);
        expect(typewriter.text).toBe('joy!');
        assertEvents(subscriber, [
          'CHANGED',
          'BLINKING',
          'CHANGED',
          'BLINKING',
          'CHANGED',
          'BLINKING',
          'FINISHED',
        ]);

        // Push it over
        jest.advanceTimersByTime(1);
        expect(typewriter.cursors[0].isBlinking).toBe(true);
        assertEvents(subscriber, [
          'CHANGED',
          'BLINKING',
          'CHANGED',
          'BLINKING',
          'CHANGED',
          'BLINKING',
          'FINISHED',
          'BLINKING',
        ]);
      });

      it('should work even if a blinkAfter is one more than the delay', () => {
        // This one is not a misconfiguration, but it is cutting it close :P

        const typewriter = new Typewriter({
          blinkAfter: 51,
          cursors: [{ position: 0 }],
          actions: [
            { type: 'keyboard', key: 'j', delay: 50, cursor: 0 },
            { type: 'keyboard', key: 'o', delay: 50, cursor: 0 },
            { type: 'keyboard', key: 'y', delay: 50, cursor: 0 },
            { type: 'keyboard', key: '!', delay: 50, cursor: 0 },
          ],
        });
        const subscriber = autoSubscribe(typewriter);

        expect(typewriter.cursors[0].isBlinking).toBe(true);
        expect(typewriter.text).toBe('');
        assertEvents(subscriber, []);

        jest.advanceTimersByTime(50);
        expect(typewriter.cursors[0].isBlinking).toBe(false);
        expect(typewriter.text).toBe('j');
        assertEvents(subscriber, ['CHANGED']);

        jest.advanceTimersByTime(50);
        expect(typewriter.cursors[0].isBlinking).toBe(false);
        expect(typewriter.text).toBe('jo');
        assertEvents(subscriber, ['CHANGED', 'CHANGED']);

        jest.advanceTimersByTime(50);
        expect(typewriter.cursors[0].isBlinking).toBe(false);
        expect(typewriter.text).toBe('joy');
        assertEvents(subscriber, ['CHANGED', 'CHANGED', 'CHANGED']);

        jest.advanceTimersByTime(50);
        expect(typewriter.cursors[0].isBlinking).toBe(false);
        expect(typewriter.text).toBe('joy!');
        assertEvents(subscriber, ['CHANGED', 'CHANGED', 'CHANGED', 'FINISHED']);

        // Move it to the edge
        jest.advanceTimersByTime(50);
        expect(typewriter.cursors[0].isBlinking).toBe(false);
        expect(typewriter.text).toBe('joy!');
        assertEvents(subscriber, ['CHANGED', 'CHANGED', 'CHANGED', 'FINISHED']);

        // Push it over
        jest.advanceTimersByTime(1);
        expect(typewriter.cursors[0].isBlinking).toBe(true);
        assertEvents(subscriber, [
          'CHANGED',
          'CHANGED',
          'CHANGED',
          'FINISHED',
          'BLINKING', // This might seem odd but in line with what FINISHED means.
        ]);
      });
    });

    it('should blink multiple cursors independently', () => {
      const typewriter = new Typewriter({
        blinkAfter: 100,
        cursors: [
          { position: 0, name: 'first' },
          { position: 0, name: 'middle' }, // This one should always blink
          { position: 0, name: 'last' }, // This one does the first and last action
        ],
        actions: [
          { type: 'keyboard', key: 'a', delay: 50, cursor: 2 },
          { type: 'keyboard', key: 'b', delay: 50, cursor: 0 },
          { type: 'keyboard', key: 'c', delay: 50, cursor: 0 },
          { type: 'keyboard', key: 'd', delay: 50, cursor: 2 },
        ],
      });
      const subscriber = autoSubscribe(typewriter);

      // All cursors should blink at the start
      expect(typewriter.cursors[0].isBlinking).toBe(true);
      expect(typewriter.cursors[1].isBlinking).toBe(true);
      expect(typewriter.cursors[2].isBlinking).toBe(true);
      expect(typewriter.text).toBe('');
      assertEvents(subscriber, []);

      // Now the last cursor should not blink because it typed 'a'
      jest.advanceTimersByTime(50);
      expect(typewriter.cursors[0].isBlinking).toBe(true);
      expect(typewriter.cursors[1].isBlinking).toBe(true);
      expect(typewriter.cursors[2].isBlinking).toBe(false);
      expect(typewriter.text).toBe('a');
      assertEvents(subscriber, ['CHANGED']);

      // Now the last cursor should still blink because it has not
      // passed blinkAfter/ The first one typed 'b' to it does not
      // blink now
      jest.advanceTimersByTime(50);
      expect(typewriter.cursors[0].isBlinking).toBe(false);
      expect(typewriter.cursors[1].isBlinking).toBe(true);
      expect(typewriter.cursors[2].isBlinking).toBe(false);
      expect(typewriter.text).toBe('ba');
      assertEvents(subscriber, ['CHANGED', 'CHANGED']);

      // Now the first cursor types in 'c' so it does not blink.
      // but the final cursor now starts blinking again.
      jest.advanceTimersByTime(50);
      expect(typewriter.cursors[0].isBlinking).toBe(false);
      expect(typewriter.cursors[1].isBlinking).toBe(true);
      expect(typewriter.cursors[2].isBlinking).toBe(true);
      expect(typewriter.text).toBe('bca');
      assertEvents(subscriber, ['CHANGED', 'CHANGED', 'BLINKING', 'CHANGED']);

      // Now the first cursor is still blinking, and the final cursor stops
      // blinking again since it typed 'd' .
      jest.advanceTimersByTime(50);
      expect(typewriter.cursors[0].isBlinking).toBe(false);
      expect(typewriter.cursors[1].isBlinking).toBe(true);
      expect(typewriter.cursors[2].isBlinking).toBe(false);
      expect(typewriter.text).toBe('bcad');
      assertEvents(subscriber, [
        'CHANGED',
        'CHANGED',
        'BLINKING',
        'CHANGED',
        'FINISHED',
      ]);

      // Move the first cursor to the edge
      jest.advanceTimersByTime(49);
      expect(typewriter.cursors[0].isBlinking).toBe(false);
      expect(typewriter.cursors[1].isBlinking).toBe(true);
      expect(typewriter.cursors[2].isBlinking).toBe(false);
      expect(typewriter.text).toBe('bcad');

      // Push it over
      jest.advanceTimersByTime(1);
      expect(typewriter.cursors[0].isBlinking).toBe(true);
      expect(typewriter.cursors[1].isBlinking).toBe(true);
      expect(typewriter.cursors[2].isBlinking).toBe(false);
      assertEvents(subscriber, [
        'CHANGED',
        'CHANGED',
        'BLINKING',
        'CHANGED',
        'FINISHED',
        'BLINKING',
      ]);

      // Move the last cursor to the edge
      jest.advanceTimersByTime(49);
      expect(typewriter.cursors[0].isBlinking).toBe(true);
      expect(typewriter.cursors[1].isBlinking).toBe(true);
      expect(typewriter.cursors[2].isBlinking).toBe(false);
      assertEvents(subscriber, [
        'CHANGED',
        'CHANGED',
        'BLINKING',
        'CHANGED',
        'FINISHED',
        'BLINKING',
      ]);

      // Push it over
      jest.advanceTimersByTime(1);
      expect(typewriter.cursors[0].isBlinking).toBe(true);
      expect(typewriter.cursors[1].isBlinking).toBe(true);
      expect(typewriter.cursors[2].isBlinking).toBe(true);
      assertEvents(subscriber, [
        'CHANGED',
        'CHANGED',
        'BLINKING',
        'CHANGED',
        'FINISHED',
        'BLINKING',
        'BLINKING',
      ]);
    });

    describe('effects of repeating on blinking', () => {
      it('should still start blinking during the repeatDelay', () => {
        const typewriter = new Typewriter({
          blinkAfter: 100,
          repeat: 2,
          repeatDelay: 1000,
          cursors: [{ position: 0 }],
          actions: [
            { type: 'keyboard', key: 'j', delay: 50, cursor: 0 },
            { type: 'keyboard', key: 'o', delay: 50, cursor: 0 },
            { type: 'keyboard', key: 'y', delay: 50, cursor: 0 },
            { type: 'keyboard', key: '!', delay: 50, cursor: 0 },
          ],
        });
        const subscriber = autoSubscribe(typewriter);

        expect(typewriter.cursors[0].isBlinking).toBe(true);
        expect(typewriter.text).toBe('');
        assertEvents(subscriber, []);

        jest.advanceTimersByTime(50);
        expect(typewriter.cursors[0].isBlinking).toBe(false);
        expect(typewriter.text).toBe('j');
        assertEvents(subscriber, ['CHANGED']);

        jest.advanceTimersByTime(50);
        expect(typewriter.cursors[0].isBlinking).toBe(false);
        expect(typewriter.text).toBe('jo');
        assertEvents(subscriber, ['CHANGED', 'CHANGED']);

        jest.advanceTimersByTime(50);
        expect(typewriter.cursors[0].isBlinking).toBe(false);
        expect(typewriter.text).toBe('joy');
        assertEvents(subscriber, ['CHANGED', 'CHANGED', 'CHANGED']);

        jest.advanceTimersByTime(50);
        expect(typewriter.cursors[0].isBlinking).toBe(false);
        expect(typewriter.text).toBe('joy!');
        assertEvents(subscriber, ['CHANGED', 'CHANGED', 'CHANGED', 'CHANGED']);

        // At this time we finished this animation iteration, and are
        // awaiting the repeat delay.
        jest.advanceTimersByTime(99);
        expect(typewriter.cursors[0].isBlinking).toBe(false);
        expect(typewriter.text).toBe('joy!');
        assertEvents(subscriber, ['CHANGED', 'CHANGED', 'CHANGED', 'CHANGED']);

        // Should start blinking now
        jest.advanceTimersByTime(1);
        expect(typewriter.cursors[0].isBlinking).toBe(true);
        expect(typewriter.text).toBe('joy!');
        assertEvents(subscriber, [
          'CHANGED',
          'CHANGED',
          'CHANGED',
          'CHANGED',
          'BLINKING',
        ]);

        // Should still be blinking now, the second before the repeat
        jest.advanceTimersByTime(899);
        expect(typewriter.cursors[0].isBlinking).toBe(true);
        expect(typewriter.text).toBe('joy!');
        assertEvents(subscriber, [
          'CHANGED',
          'CHANGED',
          'CHANGED',
          'CHANGED',
          'BLINKING',
        ]);

        // Check the firing of the repeat
        jest.advanceTimersByTime(1);
        expect(typewriter.cursors[0].isBlinking).toBe(true);
        expect(typewriter.text).toBe('');
        assertEvents(subscriber, [
          'CHANGED',
          'CHANGED',
          'CHANGED',
          'CHANGED',
          'BLINKING',
          'REPEATING',
        ]);

        // Once more check the animation, just to be sure
        jest.advanceTimersByTime(50);
        expect(typewriter.cursors[0].isBlinking).toBe(false);
        expect(typewriter.text).toBe('j');
        assertEvents(subscriber, [
          'CHANGED',
          'CHANGED',
          'CHANGED',
          'CHANGED',
          'BLINKING',
          'REPEATING',
          'CHANGED',
        ]);

        jest.advanceTimersByTime(50);
        expect(typewriter.cursors[0].isBlinking).toBe(false);
        expect(typewriter.text).toBe('jo');
        assertEvents(subscriber, [
          'CHANGED',
          'CHANGED',
          'CHANGED',
          'CHANGED',
          'BLINKING',
          'REPEATING',
          'CHANGED',
          'CHANGED',
        ]);

        jest.advanceTimersByTime(50);
        expect(typewriter.cursors[0].isBlinking).toBe(false);
        expect(typewriter.text).toBe('joy');
        assertEvents(subscriber, [
          'CHANGED',
          'CHANGED',
          'CHANGED',
          'CHANGED',
          'BLINKING',
          'REPEATING',
          'CHANGED',
          'CHANGED',
          'CHANGED',
        ]);

        jest.advanceTimersByTime(50);
        expect(typewriter.cursors[0].isBlinking).toBe(false);
        expect(typewriter.text).toBe('joy!');
        assertEvents(subscriber, [
          'CHANGED',
          'CHANGED',
          'CHANGED',
          'CHANGED',
          'BLINKING',
          'REPEATING',
          'CHANGED',
          'CHANGED',
          'CHANGED',
          'FINISHED',
        ]);

        // At this time we finished this animation iteration, and are
        // awaiting the repeat delay.
        jest.advanceTimersByTime(99);
        expect(typewriter.cursors[0].isBlinking).toBe(false);
        expect(typewriter.text).toBe('joy!');
        assertEvents(subscriber, [
          'CHANGED',
          'CHANGED',
          'CHANGED',
          'CHANGED',
          'BLINKING',
          'REPEATING',
          'CHANGED',
          'CHANGED',
          'CHANGED',
          'FINISHED',
        ]);

        // Should start blinking now
        jest.advanceTimersByTime(1);
        expect(typewriter.cursors[0].isBlinking).toBe(true);
        expect(typewriter.text).toBe('joy!');
        assertEvents(subscriber, [
          'CHANGED',
          'CHANGED',
          'CHANGED',
          'CHANGED',
          'BLINKING',
          'REPEATING',
          'CHANGED',
          'CHANGED',
          'CHANGED',
          'FINISHED',
          'BLINKING',
        ]);

        // Should still be blinking now, the second before the repeat
        jest.advanceTimersByTime(899);
        expect(typewriter.cursors[0].isBlinking).toBe(true);
        expect(typewriter.text).toBe('joy!');
        assertEvents(subscriber, [
          'CHANGED',
          'CHANGED',
          'CHANGED',
          'CHANGED',
          'BLINKING',
          'REPEATING',
          'CHANGED',
          'CHANGED',
          'CHANGED',
          'FINISHED',
          'BLINKING',
        ]);

        // Check the firing of the finished event.
        jest.advanceTimersByTime(1);
        expect(typewriter.cursors[0].isBlinking).toBe(true);
        expect(typewriter.text).toBe('joy!');
        assertEvents(subscriber, [
          'CHANGED',
          'CHANGED',
          'CHANGED',
          'CHANGED',
          'BLINKING',
          'REPEATING',
          'CHANGED',
          'CHANGED',
          'CHANGED',
          'FINISHED',
          'BLINKING',
        ]);
      });

      it('should when repeating reset the cursor and ignore blinks from the previous iterations', () => {
        const typewriter = new Typewriter({
          blinkAfter: 51,
          repeat: true,
          repeatDelay: 50, // The repeatDelay lies before the blinkAfter
          cursors: [{ position: 0 }],
          actions: [
            { type: 'keyboard', key: 'j', delay: 50, cursor: 0 },
            { type: 'keyboard', key: '!', delay: 50, cursor: 0 },
          ],
        });
        const subscriber = autoSubscribe(typewriter);

        expect(typewriter.cursors[0].isBlinking).toBe(true);
        expect(typewriter.text).toBe('');
        assertEvents(subscriber, []);

        jest.advanceTimersByTime(50);
        expect(typewriter.cursors[0].isBlinking).toBe(false);
        expect(typewriter.text).toBe('j');
        assertEvents(subscriber, ['CHANGED']);

        jest.advanceTimersByTime(50);
        expect(typewriter.cursors[0].isBlinking).toBe(false);
        expect(typewriter.text).toBe('j!');
        assertEvents(subscriber, ['CHANGED', 'CHANGED']);

        // At this time we finished this animation iteration, and are
        // awaiting the repeat delay.
        jest.advanceTimersByTime(49);
        expect(typewriter.cursors[0].isBlinking).toBe(false);
        expect(typewriter.text).toBe('j!');
        assertEvents(subscriber, ['CHANGED', 'CHANGED']);

        // Should start repeating and blinking due to the reset
        jest.advanceTimersByTime(1);
        expect(typewriter.cursors[0].isBlinking).toBe(true);
        expect(typewriter.text).toBe('');
        assertEvents(subscriber, ['CHANGED', 'CHANGED', 'REPEATING']);

        // Trigger first letter
        jest.advanceTimersByTime(50);
        expect(typewriter.cursors[0].isBlinking).toBe(false);
        expect(typewriter.text).toBe('j');
        assertEvents(subscriber, [
          'CHANGED',
          'CHANGED',
          'REPEATING',
          'CHANGED',
        ]);

        // This would have triggerd the blink from the previous '!' if
        // blinks from previous iterations are not ignored.
        jest.advanceTimersByTime(1);
        expect(typewriter.cursors[0].isBlinking).toBe(false);
        expect(typewriter.text).toBe('j');
        assertEvents(subscriber, [
          'CHANGED',
          'CHANGED',
          'REPEATING',
          'CHANGED',
        ]);

        // Make sure changed is the next event is not BLINKING.
        jest.advanceTimersByTime(49);
        expect(typewriter.cursors[0].isBlinking).toBe(false);
        expect(typewriter.text).toBe('j!');
        assertEvents(subscriber, [
          'CHANGED',
          'CHANGED',
          'REPEATING',
          'CHANGED',
          'CHANGED',
        ]);
      });

      it('should when repeating reset the cursors and ignore blinks from the previous iterations for multiple cursors', () => {
        // Two cursors first cursor is not the last action, but
        // blinks in the time of the repeatDelay.

        // Timeline: 0 50 100 150 200 250 300
        //  Actions:   j   !   R   j   !   R
        //    Blink:            0   1
        const typewriter = new Typewriter({
          blinkAfter: 101,
          repeat: true,
          repeatDelay: 50,
          cursors: [{ position: 0 }, { position: 0 }],
          actions: [
            { type: 'keyboard', key: 'j', delay: 50, cursor: 0 },
            { type: 'keyboard', key: '!', delay: 50, cursor: 1 },
          ],
        });
        const subscriber = autoSubscribe(typewriter);

        expect(typewriter.cursors[0].isBlinking).toBe(true);
        expect(typewriter.cursors[1].isBlinking).toBe(true);
        expect(typewriter.text).toBe('');
        assertEvents(subscriber, []);

        jest.advanceTimersByTime(50);
        expect(typewriter.cursors[0].isBlinking).toBe(false);
        expect(typewriter.cursors[1].isBlinking).toBe(true);
        expect(typewriter.text).toBe('j');
        assertEvents(subscriber, ['CHANGED']);

        jest.advanceTimersByTime(50);
        expect(typewriter.cursors[0].isBlinking).toBe(false);
        expect(typewriter.cursors[1].isBlinking).toBe(false);
        expect(typewriter.text).toBe('!j');
        assertEvents(subscriber, ['CHANGED', 'CHANGED']);

        // At this time we finished this animation iteration, and are
        // awaiting the repeat delay.
        jest.advanceTimersByTime(49);
        expect(typewriter.cursors[0].isBlinking).toBe(false);
        expect(typewriter.cursors[1].isBlinking).toBe(false);
        expect(typewriter.text).toBe('!j');
        assertEvents(subscriber, ['CHANGED', 'CHANGED']);

        // Should start repeating and blinking due to the reset
        jest.advanceTimersByTime(1);
        expect(typewriter.cursors[0].isBlinking).toBe(true);
        expect(typewriter.cursors[1].isBlinking).toBe(true);
        expect(typewriter.text).toBe('');
        assertEvents(subscriber, ['CHANGED', 'CHANGED', 'REPEATING']);

        // This would have triggerd the blink from the previous 'j' if
        // blinks from previous iterations are not ignored.
        jest.advanceTimersByTime(1);
        expect(typewriter.cursors[0].isBlinking).toBe(true);
        expect(typewriter.cursors[1].isBlinking).toBe(true);
        expect(typewriter.text).toBe('');
        assertEvents(subscriber, ['CHANGED', 'CHANGED', 'REPEATING']);

        // Trigger first letter
        jest.advanceTimersByTime(49);
        expect(typewriter.cursors[0].isBlinking).toBe(false);
        expect(typewriter.cursors[1].isBlinking).toBe(true);
        expect(typewriter.text).toBe('j');
        assertEvents(subscriber, [
          'CHANGED',
          'CHANGED',
          'REPEATING',
          'CHANGED',
        ]);

        // Make sure changed is the next event is not BLINKING.
        jest.advanceTimersByTime(50);
        expect(typewriter.cursors[0].isBlinking).toBe(false);
        expect(typewriter.cursors[1].isBlinking).toBe(false);
        expect(typewriter.text).toBe('!j');
        assertEvents(subscriber, [
          'CHANGED',
          'CHANGED',
          'REPEATING',
          'CHANGED',
          'CHANGED',
        ]);
      });
    });
  });

  describe('builders', () => {
    describe('typewriterFromSentences', () => {
      it('should know how to build a Typewriter from sentences', () => {
        const typewriter = typewriterFromSentences({
          sentences: ['I love cats', 'I love dogs'],
        });

        expect(typewriter.text).toBe('');

        jest.advanceTimersByTime(50);
        expect(typewriter.text).toBe('I');

        jest.advanceTimersByTime(50);
        expect(typewriter.text).toBe('I ');

        jest.advanceTimersByTime(50);
        expect(typewriter.text).toBe('I l');

        jest.advanceTimersByTime(50);
        expect(typewriter.text).toBe('I lo');

        jest.advanceTimersByTime(50);
        expect(typewriter.text).toBe('I lov');

        jest.advanceTimersByTime(50);
        expect(typewriter.text).toBe('I love');

        jest.advanceTimersByTime(50);
        expect(typewriter.text).toBe('I love ');

        jest.advanceTimersByTime(50);
        expect(typewriter.text).toBe('I love c');

        jest.advanceTimersByTime(50);
        expect(typewriter.text).toBe('I love ca');

        jest.advanceTimersByTime(50);
        expect(typewriter.text).toBe('I love cat');

        jest.advanceTimersByTime(50);
        expect(typewriter.text).toBe('I love cats');

        jest.advanceTimersByTime(50);
        expect(typewriter.text).toBe('I love cat');

        jest.advanceTimersByTime(50);
        expect(typewriter.text).toBe('I love ca');

        jest.advanceTimersByTime(50);
        expect(typewriter.text).toBe('I love c');

        jest.advanceTimersByTime(50);
        expect(typewriter.text).toBe('I love ');

        jest.advanceTimersByTime(50);
        expect(typewriter.text).toBe('I love d');

        jest.advanceTimersByTime(50);
        expect(typewriter.text).toBe('I love do');

        jest.advanceTimersByTime(50);
        expect(typewriter.text).toBe('I love dog');

        jest.advanceTimersByTime(50);
        expect(typewriter.text).toBe('I love dogs');
      });

      it('should be able to set a custom delay', () => {
        const typewriter = typewriterFromSentences({
          sentences: ['I love cats', 'I love dogs'],
          delay: 100,
        });

        expect(typewriter.text).toBe('');

        jest.advanceTimersByTime(100);
        expect(typewriter.text).toBe('I');

        jest.advanceTimersByTime(100);
        expect(typewriter.text).toBe('I ');

        jest.advanceTimersByTime(100);
        expect(typewriter.text).toBe('I l');

        jest.advanceTimersByTime(100);
        expect(typewriter.text).toBe('I lo');

        jest.advanceTimersByTime(100);
        expect(typewriter.text).toBe('I lov');

        jest.advanceTimersByTime(100);
        expect(typewriter.text).toBe('I love');

        jest.advanceTimersByTime(100);
        expect(typewriter.text).toBe('I love ');

        jest.advanceTimersByTime(100);
        expect(typewriter.text).toBe('I love c');

        jest.advanceTimersByTime(100);
        expect(typewriter.text).toBe('I love ca');

        jest.advanceTimersByTime(100);
        expect(typewriter.text).toBe('I love cat');

        jest.advanceTimersByTime(100);
        expect(typewriter.text).toBe('I love cats');

        jest.advanceTimersByTime(100);
        expect(typewriter.text).toBe('I love cat');

        jest.advanceTimersByTime(100);
        expect(typewriter.text).toBe('I love ca');

        jest.advanceTimersByTime(100);
        expect(typewriter.text).toBe('I love c');

        jest.advanceTimersByTime(100);
        expect(typewriter.text).toBe('I love ');

        jest.advanceTimersByTime(100);
        expect(typewriter.text).toBe('I love d');

        jest.advanceTimersByTime(100);
        expect(typewriter.text).toBe('I love do');

        jest.advanceTimersByTime(100);
        expect(typewriter.text).toBe('I love dog');

        jest.advanceTimersByTime(100);
        expect(typewriter.text).toBe('I love dogs');
      });

      it('should know how to build a Typewriter from sentences which include unicode characters such as emoji', () => {
        const typewriter = typewriterFromSentences({
          sentences: ['I 😀 cats', 'I 🥹 dogs'],
        });

        expect(typewriter.text).toBe('');

        jest.advanceTimersByTime(50);
        expect(typewriter.text).toBe('I');

        jest.advanceTimersByTime(50);
        expect(typewriter.text).toBe('I ');

        jest.advanceTimersByTime(50);
        expect(typewriter.text).toBe('I 😀');

        jest.advanceTimersByTime(50);
        expect(typewriter.text).toBe('I 😀 ');

        jest.advanceTimersByTime(50);
        expect(typewriter.text).toBe('I 😀 c');

        jest.advanceTimersByTime(50);
        expect(typewriter.text).toBe('I 😀 ca');

        jest.advanceTimersByTime(50);
        expect(typewriter.text).toBe('I 😀 cat');

        jest.advanceTimersByTime(50);
        expect(typewriter.text).toBe('I 😀 cats');

        jest.advanceTimersByTime(50);
        expect(typewriter.text).toBe('I 😀 cat');

        jest.advanceTimersByTime(50);
        expect(typewriter.text).toBe('I 😀 ca');

        jest.advanceTimersByTime(50);
        expect(typewriter.text).toBe('I 😀 c');

        jest.advanceTimersByTime(50);
        expect(typewriter.text).toBe('I 😀 ');

        jest.advanceTimersByTime(50);
        expect(typewriter.text).toBe('I 😀');

        jest.advanceTimersByTime(50);
        expect(typewriter.text).toBe('I ');

        jest.advanceTimersByTime(50);
        expect(typewriter.text).toBe('I 🥹');

        jest.advanceTimersByTime(50);
        expect(typewriter.text).toBe('I 🥹 ');

        jest.advanceTimersByTime(50);
        expect(typewriter.text).toBe('I 🥹 d');

        jest.advanceTimersByTime(50);
        expect(typewriter.text).toBe('I 🥹 do');

        jest.advanceTimersByTime(50);
        expect(typewriter.text).toBe('I 🥹 dog');

        jest.advanceTimersByTime(50);
        expect(typewriter.text).toBe('I 🥹 dogs');
      });

      it('should work when setting an initial text', () => {
        const typewriter = typewriterFromSentences({
          text: 'I love cats',
          sentences: ['I love dogs'],
        });

        expect(typewriter.text).toBe('I love cats');

        jest.advanceTimersByTime(50);
        expect(typewriter.text).toBe('I love cat');

        jest.advanceTimersByTime(50);
        expect(typewriter.text).toBe('I love ca');

        jest.advanceTimersByTime(50);
        expect(typewriter.text).toBe('I love c');

        jest.advanceTimersByTime(50);
        expect(typewriter.text).toBe('I love ');

        jest.advanceTimersByTime(50);
        expect(typewriter.text).toBe('I love d');

        jest.advanceTimersByTime(50);
        expect(typewriter.text).toBe('I love do');

        jest.advanceTimersByTime(50);
        expect(typewriter.text).toBe('I love dog');

        jest.advanceTimersByTime(50);
        expect(typewriter.text).toBe('I love dogs');
      });
    });
  });

  describe('iterator', () => {
    it('the Typewriter should be iterable and return all positions, selections and cursors', () => {
      const typewriter = new Typewriter({
        text: 'joy',
        cursors: [
          {
            position: 0,
            name: 'owen',
            selection: {
              // joy
              start: 0,
              end: 3,
            },
          },
          {
            position: 1,
            name: 'jane',
            selection: {
              // o
              start: 1,
              end: 2,
            },
          },
          {
            position: 2,
            name: 'tosca',
            selection: {
              // jo
              start: 0,
              end: 2,
            },
          },
          {
            position: 3,
            name: 'maarten',
            selection: {
              // joy
              start: 0,
              end: 3,
            },
          },
        ],
        actions: [],
      });

      const iterator = typewriter[Symbol.iterator]();

      const result0 = iterator.next();
      expect(result0.done).toBe(false);
      expect(result0.value.position).toBe(0);
      expect(result0.value.selected.length).toBe(3);
      expect(result0.value.selected[0].name).toBe('owen');
      expect(result0.value.selected[1].name).toBe('tosca');
      expect(result0.value.selected[2].name).toBe('maarten');
      expect(result0.value.cursors.length).toBe(1);
      expect(result0.value.cursors[0].name).toBe('owen');
      expect(result0.value.character).toBe('j');

      const result1 = iterator.next();
      expect(result1.done).toBe(false);
      expect(result1.value.position).toBe(1);
      expect(result1.value.selected.length).toBe(4);
      expect(result1.value.selected[0].name).toBe('owen');
      expect(result1.value.selected[1].name).toBe('jane');
      expect(result1.value.selected[2].name).toBe('tosca');
      expect(result1.value.selected[3].name).toBe('maarten');
      expect(result1.value.cursors.length).toBe(1);
      expect(result1.value.cursors[0].name).toBe('jane');
      expect(result1.value.character).toBe('o');

      const result2 = iterator.next();
      expect(result2.done).toBe(false);
      expect(result2.value.position).toBe(2);
      expect(result2.value.selected.length).toBe(2);
      expect(result2.value.selected[0].name).toBe('owen');
      expect(result2.value.selected[1].name).toBe('maarten');
      expect(result2.value.cursors.length).toBe(1);
      expect(result2.value.cursors[0].name).toBe('tosca');
      expect(result2.value.character).toBe('y');

      const result3 = iterator.next();
      expect(result3.done).toBe(false);
      expect(result3.value.position).toBe(3);
      expect(result3.value.selected.length).toBe(0);
      expect(result3.value.cursors.length).toBe(1);
      expect(result3.value.cursors[0].name).toBe('maarten');
      expect(result3.value.character).toBe('');

      const result4 = iterator.next();
      expect(result4.done).toBe(true);
      expect(result4.value).toBe(undefined);
    });

    it('it should work when there are multiple cursor on each position', () => {
      const typewriter = new Typewriter({
        text: 'joy',
        cursors: [
          {
            position: 0,
            name: 'owen',
          },
          {
            position: 0,
            name: 'tessa',
          },
          {
            position: 1,
            name: 'jane',
          },
          {
            position: 1,
            name: 'sam',
          },
          {
            position: 2,
            name: 'tosca',
          },
          {
            position: 2,
            name: 'carla',
          },
          {
            position: 3,
            name: 'leen',
          },
          {
            position: 3,
            name: 'maarten',
          },
          {
            position: 3,
            name: 'arie',
          },
        ],
        actions: [],
      });

      const iterator = typewriter[Symbol.iterator]();

      const result0 = iterator.next();
      expect(result0.done).toBe(false);
      expect(result0.value.position).toBe(0);
      expect(result0.value.selected.length).toBe(0);
      expect(result0.value.cursors.length).toBe(2);
      expect(result0.value.cursors[0].name).toBe('owen');
      expect(result0.value.cursors[1].name).toBe('tessa');
      expect(result0.value.character).toBe('j');

      const result1 = iterator.next();
      expect(result1.done).toBe(false);
      expect(result1.value.position).toBe(1);
      expect(result1.value.selected.length).toBe(0);
      expect(result1.value.cursors.length).toBe(2);
      expect(result1.value.cursors[0].name).toBe('jane');
      expect(result1.value.cursors[1].name).toBe('sam');
      expect(result1.value.character).toBe('o');

      const result2 = iterator.next();
      expect(result2.done).toBe(false);
      expect(result2.value.position).toBe(2);
      expect(result2.value.selected.length).toBe(0);
      expect(result2.value.cursors.length).toBe(2);
      expect(result2.value.cursors[0].name).toBe('tosca');
      expect(result2.value.cursors[1].name).toBe('carla');
      expect(result2.value.character).toBe('y');

      const result3 = iterator.next();
      expect(result3.done).toBe(false);
      expect(result3.value.position).toBe(3);
      expect(result3.value.selected.length).toBe(0);
      expect(result3.value.cursors.length).toBe(3);
      expect(result3.value.cursors[0].name).toBe('leen');
      expect(result3.value.cursors[1].name).toBe('maarten');
      expect(result3.value.cursors[2].name).toBe('arie');
      expect(result3.value.character).toBe('');

      const result4 = iterator.next();
      expect(result4.done).toBe(true);
      expect(result4.value).toBe(undefined);
    });

    it('the iterator should work when there is just one cursor at the end', () => {
      const typewriter = new Typewriter({
        text: 'joy',
        actions: [],
      });

      const iterator = typewriter[Symbol.iterator]();

      const result0 = iterator.next();
      expect(result0.done).toBe(false);
      expect(result0.value.position).toBe(0);
      expect(result0.value.selected.length).toBe(0);
      expect(result0.value.cursors.length).toBe(0);
      expect(result0.value.character).toBe('j');

      const result1 = iterator.next();
      expect(result1.done).toBe(false);
      expect(result1.value.position).toBe(1);
      expect(result1.value.selected.length).toBe(0);
      expect(result1.value.cursors.length).toBe(0);
      expect(result1.value.character).toBe('o');

      const result2 = iterator.next();
      expect(result2.done).toBe(false);
      expect(result2.value.position).toBe(2);
      expect(result2.value.selected.length).toBe(0);
      expect(result2.value.cursors.length).toBe(0);
      expect(result2.value.character).toBe('y');

      const result3 = iterator.next();
      expect(result3.done).toBe(false);
      expect(result3.value.position).toBe(3);
      expect(result3.value.selected.length).toBe(0);
      expect(result3.value.cursors.length).toBe(1);
      expect(result3.value.cursors[0].name).toBe('');
      expect(result3.value.character).toBe('');

      const result4 = iterator.next();
      expect(result4.done).toBe(true);
      expect(result4.value).toBe(undefined);
    });

    it('the iterator should work when there is no cursor at the end', () => {
      const typewriter = new Typewriter({
        cursors: [
          {
            position: 2,
            name: 'tosca',
          },
        ],
        text: 'joy',
        actions: [],
      });

      const iterator = typewriter[Symbol.iterator]();

      const result0 = iterator.next();
      expect(result0.done).toBe(false);
      expect(result0.value.position).toBe(0);
      expect(result0.value.selected.length).toBe(0);
      expect(result0.value.cursors.length).toBe(0);
      expect(result0.value.character).toBe('j');

      const result1 = iterator.next();
      expect(result1.done).toBe(false);
      expect(result1.value.position).toBe(1);
      expect(result1.value.selected.length).toBe(0);
      expect(result1.value.cursors.length).toBe(0);
      expect(result1.value.character).toBe('o');

      const result2 = iterator.next();
      expect(result2.done).toBe(false);
      expect(result2.value.position).toBe(2);
      expect(result2.value.selected.length).toBe(0);
      expect(result2.value.cursors.length).toBe(1);
      expect(result2.value.cursors[0].name).toBe('tosca');
      expect(result2.value.character).toBe('y');

      const result3 = iterator.next();
      expect(result3.done).toBe(true);
      expect(result3.value).toBe(undefined);
    });
  });

  describe('history', () => {
    test('that a history is kept for a maximum number of events', () => {
      const typewriter = new Typewriter({
        actions: [
          {
            type: 'keyboard',
            key: 'a',
            delay: 100,
            cursor: 0,
          },
        ],
        keepHistoryFor: 3,
      });

      expect(typewriter.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
        }),
      ]);

      typewriter.pause();
      expect(typewriter.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
        }),

        expect.objectContaining({ type: 'PAUSED' }),
      ]);

      typewriter.play();
      expect(typewriter.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
        }),

        expect.objectContaining({ type: 'PAUSED' }),

        expect.objectContaining({ type: 'PLAYING' }),
      ]);

      typewriter.pause();
      expect(typewriter.history).toEqual([
        expect.objectContaining({ type: 'PAUSED' }),

        expect.objectContaining({ type: 'PLAYING' }),

        expect.objectContaining({ type: 'PAUSED' }),
      ]);
    });

    test('that initialize resets the history', () => {
      const typewriter = new Typewriter({
        actions: [
          {
            type: 'keyboard',
            key: 'a',
            delay: 100,
            cursor: 0,
          },
        ],
        keepHistoryFor: 5,
      });

      expect(typewriter.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
        }),
      ]);

      typewriter.pause();

      expect(typewriter.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
        }),

        expect.objectContaining({ type: 'PAUSED' }),
      ]);

      // Now reset the history, note that if `keepHistoryFor` is zero
      // the `history` array would be empty
      typewriter.initialize({ keepHistoryFor: 1 });
      expect(typewriter.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
        }),
      ]);
    });
  });

  describe('subscribers', () => {
    test('multiple subscribers', () => {
      const typewriter = new Typewriter({
        actions: [
          {
            type: 'keyboard',
            key: 'a',
            delay: 10000,
            cursor: 0,
          },
          {
            type: 'keyboard',
            key: 'b',
            delay: 10000,
            cursor: 0,
          },
          {
            type: 'keyboard',
            key: 'c',
            delay: 10000,
            cursor: 0,
          },
        ],
      });
      const subscriber = autoSubscribe(typewriter);

      const secondSubscriber = jest.fn();
      const removeSecondSubscriber = typewriter.subscribe(secondSubscriber);

      const thirdSubscriber = jest.fn();
      typewriter.subscribe(thirdSubscriber);

      typewriter.pause();

      expect(subscriber).toHaveBeenCalledTimes(1);
      expect(secondSubscriber).toHaveBeenCalledTimes(1);
      expect(thirdSubscriber).toHaveBeenCalledTimes(1);

      removeSecondSubscriber();

      typewriter.play();

      expect(subscriber).toHaveBeenCalledTimes(2);
      expect(secondSubscriber).toHaveBeenCalledTimes(1);
      expect(thirdSubscriber).toHaveBeenCalledTimes(2);

      typewriter.unsubscribe(thirdSubscriber);

      typewriter.pause();

      expect(subscriber).toHaveBeenCalledTimes(3);
      expect(secondSubscriber).toHaveBeenCalledTimes(1);
      expect(thirdSubscriber).toHaveBeenCalledTimes(2);
    });
  });
});

type TestCursor = TypewriterCursorConfig & {
  isBlinking: boolean;
  name: string;
};

type TestState = Pick<
  Typewriter,
  | 'text'
  | 'history'
  | 'blinkAfter'
  | 'isPlaying'
  | 'isFinished'
  | 'hasBeenStoppedBefore'
  | 'actions'
  | 'repeat'
  | 'repeatDelay'
> & {
  cursors: TestCursor[];
};

function assertState(state: Typewriter, expected: TestState) {
  const callAsTestState: TestState = {
    history: state.history,
    text: state.text,
    blinkAfter: state.blinkAfter,
    isPlaying: state.isPlaying,
    isFinished: state.isFinished,
    repeat: state.repeat,
    repeatDelay: state.repeatDelay,
    hasBeenStoppedBefore: state.hasBeenStoppedBefore,
    actions: state.actions.map((action) => {
      if (action.type === 'keyboard') {
        const copy: TypewriterAction = {
          type: 'keyboard',
          delay: action.delay,
          cursor: action.cursor,
          key: action.key,
        };

        return copy;
      } else {
        const copy: TypewriterAction = {
          type: 'mouse',
          delay: action.delay,
          cursor: action.cursor,
          position: action.position,
          selection: action.selection,
        };

        return copy;
      }
    }),
    cursors: state.cursors.map((cursor) => {
      const copy: TestCursor = {
        position: cursor.position,
        name: cursor.name,
        isBlinking: cursor.isBlinking,
        selection: cursor.selection
          ? {
              start: cursor.selection.start,
              end: cursor.selection.end,
            }
          : undefined,
      };

      return copy;
    }),
  };

  expect(callAsTestState).toEqual(expected);
}

function assertCursor(cursor: TypewriterCursor, expected: TestCursor) {
  const testState: TestCursor = {
    position: cursor.position,
    name: cursor.name,
    isBlinking: cursor.isBlinking,
  };

  expect(testState).toEqual(expected);
}

function assertLastSubscriber(
  subscriber: jest.Mock<Typewriter, any>,
  expectedState: TestState,
  expectedEvent: TypewriterEvent
) {
  const lastCall = subscriber.mock.calls[subscriber.mock.calls.length - 1];
  const state: Typewriter = lastCall[0];
  const event: TypewriterEvent = lastCall[1];

  assertState(state, expectedState);

  const eventCopy = { ...event };
  // @ts-ignore Just delete it
  delete eventCopy.time;

  const expectedEventCopy = { ...expectedEvent };
  // @ts-ignore Just delete it
  delete expectedEventCopy.time;

  expect(eventCopy).toEqual(expectedEventCopy);
}

function assertEvents(
  subscriber: jest.Mock<Typewriter, any>,
  expectedEvents: TypewriterEventType[]
) {
  const events: TypewriterEventType[] = subscriber.mock.calls.map((call) => {
    const event: TypewriterEvent = call[1];
    return event.type;
  });

  expect(events).toEqual(expectedEvents);

  expect(subscriber).toBeCalledTimes(expectedEvents.length);
}
