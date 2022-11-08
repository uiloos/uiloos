import {
  Typewriter,
  TypewriterBlinkAfterError,
  TypewriterDelayError,
  TypewriterEvent,
  TypewriterEventType,
  TypewriterKeystroke,
  typewriterKeyStrokeBackspace,
  typewriterKeyStrokeClearAll,
  typewriterFromSentences,
  TypewriterRepeatError,
  TypewriterRepeatDelayError,
  TypewriterInvalidCursorError,
  TypewriterCursorConfig,
  typewriterKeyStrokeLeft,
  typewriterKeyStrokeRight,
} from '../src/Typewriter';

import { licenseChecker } from '../src/license';

import { UnsubscribeFunction } from '../src/generic/types';
import { TypewriterCursor } from '../src/Typewriter/TypewriterCursor';

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
              keystrokes: [
                {
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
              keystrokes: [
                {
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
              keystrokes: [
                {
                  key: 'a',
                  delay: 100,
                  cursor: 0,
                },
                {
                  key: 'b',
                  delay: -1,
                  cursor: 0,
                },
                {
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
              keystrokes: [
                {
                  key: 'a',
                  delay: 100,
                  cursor: 0,
                },
                {
                  key: 'b',
                  delay: 100,
                  cursor: 0,
                },
                {
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
              keystrokes: [
                {
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
              keystrokes: [
                {
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
              keystrokes: [
                {
                  key: 'a',
                  delay: 100,
                  cursor: 0,
                },
                {
                  key: 'b',
                  delay: 0,
                  cursor: 0,
                },
                {
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
              keystrokes: [
                {
                  key: 'a',
                  delay: 100,
                  cursor: 0,
                },
                {
                  key: 'b',
                  delay: 100,
                  cursor: 0,
                },
                {
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

      describe('cursor errors', () => {
        test('cannot be less than zero', () => {
          expect(() => {
            new Typewriter({
              text: 'abc',
              cursors: [
                { position: -1, name: '' },
                { position: 2, name: '' },
                { position: 3, name: '' },
                { position: 4, name: '' },
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
                { position: 4, name: '' },
              ],
            });
          }).toThrowError(TypewriterInvalidCursorError);

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
          }).toThrowError(TypewriterInvalidCursorError);

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
          }).toThrowError(TypewriterInvalidCursorError);
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
          }).toThrowError(TypewriterInvalidCursorError);

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
          }).toThrowError(TypewriterInvalidCursorError);

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
          }).toThrowError(TypewriterInvalidCursorError);
        });
      });
    });

    test('with a config it should initialize with configured values', () => {
      const typewriter: Typewriter = new Typewriter({
        text: 'aap',
        blinkAfter: 1337,
        keystrokes: [
          { key: 'a', delay: 999, cursor: 0 },
          { key: 'a', delay: 999, cursor: 2 },
          { key: 'a', delay: 999, cursor: 1 },
          { key: 'b', delay: 999, cursor: 0 },
          { key: 'b', delay: 999, cursor: 2 },
          { key: 'b', delay: 999, cursor: 1 },
          { key: 'c', delay: 999, cursor: 0 },
          { key: 'c', delay: 999, cursor: 2 },
          { key: 'c', delay: 999, cursor: 1 },
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
        keystrokesPerCursor: [
          [{ key: 'a', delay: 999, cursor: 0 } ,{ key: 'b', delay: 999, cursor: 0 }, { key: 'c', delay: 999, cursor: 0 }],
          [{ key: 'a', delay: 999, cursor: 1 }, { key: 'b', delay: 999, cursor: 1 }, { key: 'c', delay: 999, cursor: 1 }],
          [{ key: 'a', delay: 999, cursor: 2 }, { key: 'b', delay: 999, cursor: 2 }, { key: 'c', delay: 999, cursor: 2 }],
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
      assertCursor(typewriter.cursors[0],{
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
        keystrokesPerCursor: [[]],
        cursors: [{ position: 0, name: '', isBlinking: true }],
        text: '',
        blinkAfter: 50,
        isPlaying: false,
        isFinished: true,
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
        keystrokesPerCursor: [[]],
        cursors: [{ position: 0, name: '', isBlinking: true }],
        text: '',
        blinkAfter: 50,
        isPlaying: false,
        isFinished: true,
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
        keystrokesPerCursor: [[]],
        cursors: [{ position: 0, name: '', isBlinking: true }],
        text: '',
        blinkAfter: 50,
        isPlaying: false,
        isFinished: true,
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
              keystrokes: [
                {
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
              keystrokes: [
                {
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
              keystrokes: [
                {
                  key: 'a',
                  delay: 100,
                  cursor: 0,
                },
                {
                  key: 'b',
                  delay: -1,
                  cursor: 0,
                },
                {
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
              keystrokes: [
                {
                  key: 'a',
                  delay: 100,
                  cursor: 0,
                },
                {
                  key: 'b',
                  delay: 100,
                  cursor: 0,
                },
                {
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
              keystrokes: [
                {
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
              keystrokes: [
                {
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
              keystrokes: [
                {
                  key: 'a',
                  delay: 100,
                  cursor: 0,
                },
                {
                  key: 'b',
                  delay: 0,
                  cursor: 0,
                },
                {
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
              keystrokes: [
                {
                  key: 'a',
                  delay: 100,
                  cursor: 0,
                },
                {
                  key: 'b',
                  delay: 100,
                  cursor: 0,
                },
                {
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

      describe('cursor errors', () => {
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
                { position: 4, name: '' },
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
                { position: 4, name: '' },
              ],
            });
          }).toThrowError(TypewriterInvalidCursorError);

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
          }).toThrowError(TypewriterInvalidCursorError);

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
          }).toThrowError(TypewriterInvalidCursorError);

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
          }).toThrowError(TypewriterInvalidCursorError);

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
          }).toThrowError(TypewriterInvalidCursorError);

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
          }).toThrowError(TypewriterInvalidCursorError);

          expect(subscriber).toBeCalledTimes(0);
        });
      });
    });

    describe('reset behavior', () => {
      test('that initialize can reset the Typewriter', () => {
        const typewriter: Typewriter = new Typewriter({
          text: 'aap',
          blinkAfter: 1337,
          keystrokes: [{ key: '', delay: 999, cursor: 0 }],
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
            keystrokesPerCursor: [[]],
            cursors: [{ position: 0, name: '', isBlinking: true }],
            text: '',
            blinkAfter: 50,
            isPlaying: false,
            isFinished: true,
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
          keystrokes: [
            { key: 'a', delay: 100, cursor: 0 },
            { key: 'b', delay: 100, cursor: 0 },
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
          keystrokes: [
            { key: 'a', delay: 100, cursor: 0 },
            { key: 'b', delay: 100, cursor: 0 },
          ],
        });

        expect(typewriter.cursors[0].isBlinking).toBe(true);

        jest.advanceTimersByTime(100);

        expect(typewriter.cursors[0].isBlinking).toBe(false);

        // Just before the timer hits do an initialize
        typewriter.initialize({
          keystrokes: [
            { key: 'c', delay: 100, cursor: 0 },
            { key: 'd', delay: 100, cursor: 0 },
          ],
        });

        jest.advanceTimersByTime(100);

        // It should only trigger now after another 50ms
        jest.advanceTimersByTime(1);
        expect(typewriter.cursors[0].isBlinking).toBe(false);

        // Move it just before
        jest.advanceTimersByTime(48);
        expect(typewriter.cursors[0].isBlinking).toBe(false);

        // Now push it over the time limit
        jest.advanceTimersByTime(1);
        expect(typewriter.cursors[0].isBlinking).toBe(true);
      });
    });

    it('should start playing automatically when there are keystrokes configured', () => {
      const typewriter = new Typewriter();

      typewriter.initialize({
        keystrokes: [
          {
            key: 'a',
            delay: 100,
            cursor: 0,
          },
          {
            key: 'b',
            delay: 100,
            cursor: 0,
          },
          {
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
  });

  describe('animation', () => {
    describe('single cursor', () => {
      describe('inserting', () => {
        it('should know how to do a basic text animation from start to finish', () => {
          const typewriter = new Typewriter({
            keystrokes: [
              {
                key: 'a',
                delay: 100,
                cursor: 0,
              },
              {
                key: 'b',
                delay: 200,
                cursor: 0,
              },
              {
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
            keystrokesPerCursor: [
              [
                {
                  key: 'a',
                  delay: 100,
                  cursor: 0,
                },
                {
                  key: 'b',
                  delay: 200,
                  cursor: 0,
                },
                {
                  key: 'c',
                  delay: 300,
                  cursor: 0,
                },
              ],
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
              keystrokesPerCursor: [
                [
                  {
                    key: 'a',
                    delay: 100,
                    cursor: 0,
                  },
                  {
                    key: 'b',
                    delay: 200,
                    cursor: 0,
                  },
                  {
                    key: 'c',
                    delay: 300,
                    cursor: 0,
                  },
                ],
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
              keystroke: {
                key: 'a',
                delay: 100,
                cursor: 0,
              },
              time: new Date(),
            }
          );

          jest.advanceTimersByTime(200);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              keystrokesPerCursor: [
                [
                  {
                    key: 'a',
                    delay: 100,
                    cursor: 0,
                  },
                  {
                    key: 'b',
                    delay: 200,
                    cursor: 0,
                  },
                  {
                    key: 'c',
                    delay: 300,
                    cursor: 0,
                  },
                ],
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
              keystroke: {
                key: 'b',
                delay: 200,
                cursor: 0,
              },
              time: new Date(),
            }
          );

          jest.advanceTimersByTime(300);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              keystrokesPerCursor: [
                [
                  {
                    key: 'a',
                    delay: 100,
                    cursor: 0,
                  },
                  {
                    key: 'b',
                    delay: 200,
                    cursor: 0,
                  },
                  {
                    key: 'c',
                    delay: 300,
                    cursor: 0,
                  },
                ],
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
              keystroke: {
                key: 'c',
                delay: 300,
                cursor: 0,
              },
              time: new Date(),
            }
          );
        });

        it('should know how to add a letter in the middle', () => {
          const typewriter = new Typewriter({
            keystrokes: [
              {
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
            keystrokesPerCursor: [
              [
                {
                  key: 'b',
                  delay: 100,
                  cursor: 0,
                },
              ],
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
              keystrokesPerCursor: [
                [
                  {
                    key: 'b',
                    delay: 100,
                    cursor: 0,
                  },
                ],
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
              keystroke: {
                key: 'b',
                delay: 100,
                cursor: 0,
              },
              time: new Date(),
            }
          );
        });

        it('should know how to add a letter at the start', () => {
          const typewriter = new Typewriter({
            keystrokes: [
              {
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
            keystrokesPerCursor: [
              [
                {
                  key: 'a',
                  delay: 100,
                  cursor: 0,
                },
              ],
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
              keystrokesPerCursor: [
                [
                  {
                    key: 'a',
                    delay: 100,
                    cursor: 0,
                  },
                ],
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
              keystroke: {
                key: 'a',
                delay: 100,
                cursor: 0,
              },
              time: new Date(),
            }
          );
        });
      });

      describe('backspace', () => {
        it('should know how to to apply a backspace from the end', () => {
          const typewriter = new Typewriter({
            keystrokes: [
              {
                key: 'a',
                delay: 50,
                cursor: 0,
              },
              {
                key: typewriterKeyStrokeBackspace,
                delay: 50,
                cursor: 0,
              },
              {
                key: 'b',
                delay: 50,
                cursor: 0,
              },
              {
                key: typewriterKeyStrokeBackspace,
                delay: 50,
                cursor: 0,
              },
              {
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
            keystrokesPerCursor: [
              [
                {
                  key: 'a',
                  delay: 50,
                  cursor: 0,
                },
                {
                  key: typewriterKeyStrokeBackspace,
                  delay: 50,
                  cursor: 0,
                },
                {
                  key: 'b',
                  delay: 50,
                  cursor: 0,
                },
                {
                  key: typewriterKeyStrokeBackspace,
                  delay: 50,
                  cursor: 0,
                },
                {
                  key: 'c',
                  delay: 50,
                  cursor: 0,
                },
              ],
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
              keystrokesPerCursor: [
                [
                  {
                    key: 'a',
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: typewriterKeyStrokeBackspace,
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: 'b',
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: typewriterKeyStrokeBackspace,
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: 'c',
                    delay: 50,
                    cursor: 0,
                  },
                ],
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
              keystroke: {
                key: 'a',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              keystrokesPerCursor: [
                [
                  {
                    key: 'a',
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: typewriterKeyStrokeBackspace,
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: 'b',
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: typewriterKeyStrokeBackspace,
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: 'c',
                    delay: 50,
                    cursor: 0,
                  },
                ],
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
              keystroke: {
                key: typewriterKeyStrokeBackspace,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              keystrokesPerCursor: [
                [
                  {
                    key: 'a',
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: typewriterKeyStrokeBackspace,
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: 'b',
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: typewriterKeyStrokeBackspace,
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: 'c',
                    delay: 50,
                    cursor: 0,
                  },
                ],
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
              keystroke: {
                key: 'b',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              keystrokesPerCursor: [
                [
                  {
                    key: 'a',
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: typewriterKeyStrokeBackspace,
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: 'b',
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: typewriterKeyStrokeBackspace,
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: 'c',
                    delay: 50,
                    cursor: 0,
                  },
                ],
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
              keystroke: {
                key: typewriterKeyStrokeBackspace,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              keystrokesPerCursor: [
                [
                  {
                    key: 'a',
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: typewriterKeyStrokeBackspace,
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: 'b',
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: typewriterKeyStrokeBackspace,
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: 'c',
                    delay: 50,
                    cursor: 0,
                  },
                ],
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
              keystroke: {
                key: 'c',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
            }
          );
        });

        it('should know how to to apply a backspace from the middle', () => {
          const typewriter = new Typewriter({
            keystrokes: [
              {
                key: typewriterKeyStrokeBackspace,
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
            keystrokesPerCursor: [
              [
                {
                  key: typewriterKeyStrokeBackspace,
                  delay: 50,
                  cursor: 0,
                },
              ],
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
              keystrokesPerCursor: [
                [
                  {
                    key: typewriterKeyStrokeBackspace,
                    delay: 50,
                    cursor: 0,
                  },
                ],
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
              keystroke: {
                key: typewriterKeyStrokeBackspace,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
            }
          );
        });

        it('should know how to to apply a backspace from index 1', () => {
          const typewriter = new Typewriter({
            keystrokes: [
              {
                key: typewriterKeyStrokeBackspace,
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
            keystrokesPerCursor: [
              [
                {
                  key: typewriterKeyStrokeBackspace,
                  delay: 50,
                  cursor: 0,
                },
              ],
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
              keystrokesPerCursor: [
                [
                  {
                    key: typewriterKeyStrokeBackspace,
                    delay: 50,
                    cursor: 0,
                  },
                ],
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
              keystroke: {
                key: typewriterKeyStrokeBackspace,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
            }
          );
        });

        it('should ignore a backspace from the start and continue the animation', () => {
          const typewriter = new Typewriter({
            keystrokes: [
              {
                key: typewriterKeyStrokeBackspace,
                delay: 50,
                cursor: 0,
              },
              {
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
            keystrokesPerCursor: [
              [
                {
                  key: typewriterKeyStrokeBackspace,
                  delay: 50,
                  cursor: 0,
                },
                {
                  key: 'z',
                  delay: 50,
                  cursor: 0,
                },
              ],
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

          // It should ignore the keystroke
          jest.advanceTimersByTime(50);
          expect(subscriber).toBeCalledTimes(0);
          
          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              keystrokesPerCursor: [
                [
                  {
                    key: typewriterKeyStrokeBackspace,
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: 'z',
                    delay: 50,
                    cursor: 0,
                  },
                ],
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
              keystroke: {
                key: 'z',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
            }
          );
        });

        it('should be able to finish from a backspace from the start which is ignored', () => {
          const typewriter = new Typewriter({
            keystrokes: [
              {
                key: typewriterKeyStrokeBackspace,
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
            keystrokesPerCursor: [
              [
                {
                  key: typewriterKeyStrokeBackspace,
                  delay: 50,
                  cursor: 0,
                },
              ],
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
              keystrokesPerCursor: [
                [
                  {
                    key: typewriterKeyStrokeBackspace,
                    delay: 50,
                    cursor: 0,
                  },
                ],
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
              keystroke: {
                key: typewriterKeyStrokeBackspace,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
            }
          );
        });

        it('should know how to to apply a backspace when using unicode chars such as emoji', () => {
          const typewriter = new Typewriter({
            keystrokes: [
              {
                key: '😀',
                delay: 50,
                cursor: 0,
              },
              {
                key: typewriterKeyStrokeBackspace,
                delay: 50,
                cursor: 0,
              },
              {
                key: '😃',
                delay: 50,
                cursor: 0,
              },
              {
                key: typewriterKeyStrokeBackspace,
                delay: 50,
                cursor: 0,
              },
              {
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
            keystrokesPerCursor: [
              [
                {
                  key: '😀',
                  delay: 50,
                  cursor: 0,
                },
                {
                  key: typewriterKeyStrokeBackspace,
                  delay: 50,
                  cursor: 0,
                },
                {
                  key: '😃',
                  delay: 50,
                  cursor: 0,
                },
                {
                  key: typewriterKeyStrokeBackspace,
                  delay: 50,
                  cursor: 0,
                },
                {
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
              ],
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
              keystrokesPerCursor: [
                [
                  {
                    key: '😀',
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: typewriterKeyStrokeBackspace,
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: '😃',
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: typewriterKeyStrokeBackspace,
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: '😄',
                    delay: 50,
                    cursor: 0,
                  },
                ],
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
              keystroke: {
                key: '😀',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              keystrokesPerCursor: [
                [
                  {
                    key: '😀',
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: typewriterKeyStrokeBackspace,
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: '😃',
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: typewriterKeyStrokeBackspace,
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: '😄',
                    delay: 50,
                    cursor: 0,
                  },
                ],
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
              keystroke: {
                key: typewriterKeyStrokeBackspace,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              keystrokesPerCursor: [
                [
                  {
                    key: '😀',
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: typewriterKeyStrokeBackspace,
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: '😃',
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: typewriterKeyStrokeBackspace,
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: '😄',
                    delay: 50,
                    cursor: 0,
                  },
                ],
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
              keystroke: {
                key: '😃',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              keystrokesPerCursor: [
                [
                  {
                    key: '😀',
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: typewriterKeyStrokeBackspace,
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: '😃',
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: typewriterKeyStrokeBackspace,
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: '😄',
                    delay: 50,
                    cursor: 0,
                  },
                ],
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
              keystroke: {
                key: typewriterKeyStrokeBackspace,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              keystrokesPerCursor: [
                [
                  {
                    key: '😀',
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: typewriterKeyStrokeBackspace,
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: '😃',
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: typewriterKeyStrokeBackspace,
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: '😄',
                    delay: 50,
                    cursor: 0,
                  },
                ],
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
              keystroke: {
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
            }
          );
        });

        it('should when backspace is the last keystroke start repeating', () => {
          const typewriter = new Typewriter({
            keystrokes: [
              {
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              {
                key: typewriterKeyStrokeBackspace,
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
            keystrokesPerCursor: [
              [
                {
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  key: typewriterKeyStrokeBackspace,
                  delay: 50,
                  cursor: 0,
                },
              ],
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
              keystrokesPerCursor: [
                [
                  {
                    key: '😄',
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: typewriterKeyStrokeBackspace,
                    delay: 50,
                    cursor: 0,
                  },
                ],
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
              keystroke: {
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              keystrokesPerCursor: [
                [
                  {
                    key: '😄',
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: typewriterKeyStrokeBackspace,
                    delay: 50,
                    cursor: 0,
                  },
                ],
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
              keystroke: {
                key: typewriterKeyStrokeBackspace,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              keystrokesPerCursor: [
                [
                  {
                    key: '😄',
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: typewriterKeyStrokeBackspace,
                    delay: 50,
                    cursor: 0,
                  },
                ],
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
              type: 'REPEATING',
              time: new Date(),
            }
          );
        });

        it('should when backspace is ignored still start repeating', () => {
          const typewriter = new Typewriter({
            keystrokes: [
              {
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              {
                key: typewriterKeyStrokeBackspace,
                delay: 50,
                cursor: 0,
              },
              {
                key: typewriterKeyStrokeBackspace,
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
            keystrokesPerCursor: [
              [
                {
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  key: typewriterKeyStrokeBackspace,
                  delay: 50,
                  cursor: 0,
                },
                {
                  key: typewriterKeyStrokeBackspace,
                  delay: 50,
                  cursor: 0,
                },
              ],
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
              keystrokesPerCursor: [
                [
                  {
                    key: '😄',
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: typewriterKeyStrokeBackspace,
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: typewriterKeyStrokeBackspace,
                    delay: 50,
                    cursor: 0,
                  },
                ],
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
              keystroke: {
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              keystrokesPerCursor: [
                [
                  {
                    key: '😄',
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: typewriterKeyStrokeBackspace,
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: typewriterKeyStrokeBackspace,
                    delay: 50,
                    cursor: 0,
                  },
                ],
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
              keystroke: {
                key: typewriterKeyStrokeBackspace,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
            }
          );

          jest.advanceTimersByTime(50);

          // The last typewriterKeyStrokeBackspace should have no effect
          expect(subscriber).toBeCalledTimes(2);

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              keystrokesPerCursor: [
                [
                  {
                    key: '😄',
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: typewriterKeyStrokeBackspace,
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: typewriterKeyStrokeBackspace,
                    delay: 50,
                    cursor: 0,
                  },
                ],
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
              type: 'REPEATING',
              time: new Date(),
            }
          );
        });
      });

      describe('clear all', () => {
        it('should know how to to apply a clear all and continue the animation', () => {
          const typewriter = new Typewriter({
            keystrokes: [
              {
                key: typewriterKeyStrokeClearAll,
                delay: 50,
                cursor: 0,
              },
              {
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
            keystrokesPerCursor: [
              [
                {
                  key: typewriterKeyStrokeClearAll,
                  delay: 50,
                  cursor: 0,
                },
                {
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
              ],
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
              keystrokesPerCursor: [
                [
                  {
                    key: typewriterKeyStrokeClearAll,
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: '😄',
                    delay: 50,
                    cursor: 0,
                  },
                ],
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
              keystroke: {
                key: typewriterKeyStrokeClearAll,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              keystrokesPerCursor: [
                [
                  {
                    key: typewriterKeyStrokeClearAll,
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: '😄',
                    delay: 50,
                    cursor: 0,
                  },
                ],
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
              keystroke: {
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
            }
          );
        });

        it('should know how to to finish on a clear all', () => {
          const typewriter = new Typewriter({
            keystrokes: [
              {
                key: typewriterKeyStrokeClearAll,
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
            keystrokesPerCursor: [
              [
                {
                  key: typewriterKeyStrokeClearAll,
                  delay: 50,
                  cursor: 0,
                },
              ],
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
              keystrokesPerCursor: [
                [
                  {
                    key: typewriterKeyStrokeClearAll,
                    delay: 50,
                    cursor: 0,
                  },
                ],
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
              keystroke: {
                key: typewriterKeyStrokeClearAll,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
            }
          );
        });

        it('should ignore a clear all when text is already empty', () => {
          const typewriter = new Typewriter({
            keystrokes: [
              {
                key: typewriterKeyStrokeBackspace,
                delay: 50,
                cursor: 0,
              },
              {
                key: typewriterKeyStrokeClearAll,
                delay: 50,
                cursor: 0,
              },
              {
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
            keystrokesPerCursor: [
              [
                {
                  key: typewriterKeyStrokeBackspace,
                  delay: 50,
                  cursor: 0,
                },
                {
                  key: typewriterKeyStrokeClearAll,
                  delay: 50,
                  cursor: 0,
                },
                {
                  key: 'b',
                  delay: 50,
                  cursor: 0,
                },
              ],
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
              keystrokesPerCursor: [
                [
                  {
                    key: typewriterKeyStrokeBackspace,
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: typewriterKeyStrokeClearAll,
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: 'b',
                    delay: 50,
                    cursor: 0,
                  },
                ],
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
              keystroke: {
                key: typewriterKeyStrokeBackspace,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
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
              keystrokesPerCursor: [
                [
                  {
                    key: typewriterKeyStrokeBackspace,
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: typewriterKeyStrokeClearAll,
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: 'b',
                    delay: 50,
                    cursor: 0,
                  },
                ],
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
              keystroke: {
                key: 'b',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
            }
          );
        });

        it('should still finish on a clear all when text is already empty and ignored', () => {
          const typewriter = new Typewriter({
            keystrokes: [
              {
                key: typewriterKeyStrokeClearAll,
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
            keystrokesPerCursor: [
              [
                {
                  key: typewriterKeyStrokeClearAll,
                  delay: 50,
                  cursor: 0,
                },
              ],
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
              keystrokesPerCursor: [
                [
                  {
                    key: typewriterKeyStrokeClearAll,
                    delay: 50,
                    cursor: 0,
                  },
                ],
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
              keystroke: {
                key: typewriterKeyStrokeClearAll,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
            }
          );
        });

        it('should when clear all is the last keystroke start repeating', () => {
          const typewriter = new Typewriter({
            keystrokes: [
              {
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              {
                key: typewriterKeyStrokeClearAll,
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
            keystrokesPerCursor: [
              [
                {
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  key: typewriterKeyStrokeClearAll,
                  delay: 50,
                  cursor: 0,
                },
              ],
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
              keystrokesPerCursor: [
                [
                  {
                    key: '😄',
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: typewriterKeyStrokeClearAll,
                    delay: 50,
                    cursor: 0,
                  },
                ],
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
              keystroke: {
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              keystrokesPerCursor: [
                [
                  {
                    key: '😄',
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: typewriterKeyStrokeClearAll,
                    delay: 50,
                    cursor: 0,
                  },
                ],
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
              keystroke: {
                key: typewriterKeyStrokeClearAll,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              keystrokesPerCursor: [
                [
                  {
                    key: '😄',
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: typewriterKeyStrokeClearAll,
                    delay: 50,
                    cursor: 0,
                  },
                ],
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
              type: 'REPEATING',
              time: new Date(),
            }
          );
        });

        it('should when clear all is ignored still start repeating', () => {
          const typewriter = new Typewriter({
            keystrokes: [
              {
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              {
                key: typewriterKeyStrokeClearAll,
                delay: 50,
                cursor: 0,
              },
              {
                key: typewriterKeyStrokeClearAll,
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
            keystrokesPerCursor: [
              [
                {
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  key: typewriterKeyStrokeClearAll,
                  delay: 50,
                  cursor: 0,
                },
                {
                  key: typewriterKeyStrokeClearAll,
                  delay: 50,
                  cursor: 0,
                },
              ],
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
              keystrokesPerCursor: [
                [
                  {
                    key: '😄',
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: typewriterKeyStrokeClearAll,
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: typewriterKeyStrokeClearAll,
                    delay: 50,
                    cursor: 0,
                  },
                ],
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
              keystroke: {
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              keystrokesPerCursor: [
                [
                  {
                    key: '😄',
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: typewriterKeyStrokeClearAll,
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: typewriterKeyStrokeClearAll,
                    delay: 50,
                    cursor: 0,
                  },
                ],
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
              keystroke: {
                key: typewriterKeyStrokeClearAll,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
            }
          );

          jest.advanceTimersByTime(50);

          // The last typewriterKeyStrokeClearAll should have no effect
          expect(subscriber).toBeCalledTimes(2);

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              keystrokesPerCursor: [
                [
                  {
                    key: '😄',
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: typewriterKeyStrokeClearAll,
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: typewriterKeyStrokeClearAll,
                    delay: 50,
                    cursor: 0,
                  },
                ],
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
              type: 'REPEATING',
              time: new Date(),
            }
          );
        });
      });

      describe('move left', () => {
        it('should ignore a move left from the start and continue the animation', () => {
          const typewriter = new Typewriter({
            keystrokes: [
              {
                key: typewriterKeyStrokeLeft,
                delay: 50,
                cursor: 0,
              },
              {
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
            keystrokesPerCursor: [
              [
                {
                  key: typewriterKeyStrokeLeft,
                  delay: 50,
                  cursor: 0,
                },
                {
                  key: 'z',
                  delay: 50,
                  cursor: 0,
                },
              ],
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

          // It should ignore the keystroke
          jest.advanceTimersByTime(50);
          expect(subscriber).toBeCalledTimes(0);
          
          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              keystrokesPerCursor: [
                [
                  {
                    key: typewriterKeyStrokeLeft,
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: 'z',
                    delay: 50,
                    cursor: 0,
                  },
                ],
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
              keystroke: {
                key: 'z',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
            }
          );
        });

        it('should be able to finish from a move left from the start which is ignored', () => {
          const typewriter = new Typewriter({
            keystrokes: [
              {
                key: typewriterKeyStrokeLeft,
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
            keystrokesPerCursor: [
              [
                {
                  key: typewriterKeyStrokeLeft,
                  delay: 50,
                  cursor: 0,
                },
              ],
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
              keystrokesPerCursor: [
                [
                  {
                    key: typewriterKeyStrokeLeft,
                    delay: 50,
                    cursor: 0,
                  },
                ],
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
              keystroke: {
                key: typewriterKeyStrokeLeft,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
            }
          );
        });

        it('should when move left is the last keystroke start repeating', () => {
          const typewriter = new Typewriter({
            keystrokes: [
              {
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              {
                key: typewriterKeyStrokeLeft,
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
            keystrokesPerCursor: [
              [
                {
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  key: typewriterKeyStrokeLeft,
                  delay: 50,
                  cursor: 0,
                },
              ],
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
              keystrokesPerCursor: [
                [
                  {
                    key: '😄',
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: typewriterKeyStrokeLeft,
                    delay: 50,
                    cursor: 0,
                  },
                ],
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
              keystroke: {
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              keystrokesPerCursor: [
                [
                  {
                    key: '😄',
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: typewriterKeyStrokeLeft,
                    delay: 50,
                    cursor: 0,
                  },
                ],
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
              keystroke: {
                key: typewriterKeyStrokeLeft,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              keystrokesPerCursor: [
                [
                  {
                    key: '😄',
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: typewriterKeyStrokeLeft,
                    delay: 50,
                    cursor: 0,
                  },
                ],
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
              type: 'REPEATING',
              time: new Date(),
            }
          );
        });

        it('should when move left is ignored still start repeating', () => {
          const typewriter = new Typewriter({
            keystrokes: [
              {
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              {
                key: typewriterKeyStrokeLeft,
                delay: 50,
                cursor: 0,
              },
              {
                key: typewriterKeyStrokeLeft,
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
            keystrokesPerCursor: [
              [
                {
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  key: typewriterKeyStrokeLeft,
                  delay: 50,
                  cursor: 0,
                },
                {
                  key: typewriterKeyStrokeLeft,
                  delay: 50,
                  cursor: 0,
                },
              ],
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
              keystrokesPerCursor: [
                [
                  {
                    key: '😄',
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: typewriterKeyStrokeLeft,
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: typewriterKeyStrokeLeft,
                    delay: 50,
                    cursor: 0,
                  },
                ],
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
              keystroke: {
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              keystrokesPerCursor: [
                [
                  {
                    key: '😄',
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: typewriterKeyStrokeLeft,
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: typewriterKeyStrokeLeft,
                    delay: 50,
                    cursor: 0,
                  },
                ],
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
              keystroke: {
                key: typewriterKeyStrokeLeft,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
            }
          );

          jest.advanceTimersByTime(50);

          // The last typewriterKeyStrokeLeft should have no effect
          expect(subscriber).toBeCalledTimes(2);

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              keystrokesPerCursor: [
                [
                  {
                    key: '😄',
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: typewriterKeyStrokeLeft,
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: typewriterKeyStrokeLeft,
                    delay: 50,
                    cursor: 0,
                  },
                ],
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
              type: 'REPEATING',
              time: new Date(),
            }
          );
        });
        
        it('should know how to move left from the middle', () => {
          const typewriter = new Typewriter({
            keystrokes: [
              {
                key: typewriterKeyStrokeLeft,
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
            keystrokesPerCursor: [
              [
                {
                  key: typewriterKeyStrokeLeft,
                  delay: 100,
                  cursor: 0,
                },
              ],
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
              keystrokesPerCursor: [
                [
                  {
                    key: typewriterKeyStrokeLeft,
                    delay: 100,
                    cursor: 0,
                  },
                ],
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
              keystroke: {
                key: typewriterKeyStrokeLeft,
                delay: 100,
                cursor: 0,
              },
              time: new Date(),
            }
          );
        });

        it('should know how to move left from the end', () => {
          const typewriter = new Typewriter({
            keystrokes: [
              {
                key: typewriterKeyStrokeLeft,
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
            keystrokesPerCursor: [
              [
                {
                  key: typewriterKeyStrokeLeft,
                  delay: 100,
                  cursor: 0,
                },
              ],
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
              keystrokesPerCursor: [
                [
                  {
                    key: typewriterKeyStrokeLeft,
                    delay: 100,
                    cursor: 0,
                  },
                ],
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
              keystroke: {
                key: typewriterKeyStrokeLeft,
                delay: 100,
                cursor: 0,
              },
              time: new Date(),
            }
          );
        });
      });

      describe('move right', () => {
        it('should know how to move right from the start', () => {
          const typewriter = new Typewriter({
            keystrokes: [
              {
                key: typewriterKeyStrokeRight,
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
            keystrokesPerCursor: [
              [
                {
                  key: typewriterKeyStrokeRight,
                  delay: 100,
                  cursor: 0,
                },
              ],
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
              keystrokesPerCursor: [
                [
                  {
                    key: typewriterKeyStrokeRight,
                    delay: 100,
                    cursor: 0,
                  },
                ],
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
              keystroke: {
                key: typewriterKeyStrokeRight,
                delay: 100,
                cursor: 0,
              },
              time: new Date(),
            }
          );
        });
        
        it('should know how to move right from the middle', () => {
          const typewriter = new Typewriter({
            keystrokes: [
              {
                key: typewriterKeyStrokeRight,
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
            keystrokesPerCursor: [
              [
                {
                  key: typewriterKeyStrokeRight,
                  delay: 100,
                  cursor: 0,
                },
              ],
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
              keystrokesPerCursor: [
                [
                  {
                    key: typewriterKeyStrokeRight,
                    delay: 100,
                    cursor: 0,
                  },
                ],
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
              keystroke: {
                key: typewriterKeyStrokeRight,
                delay: 100,
                cursor: 0,
              },
              time: new Date(),
            }
          );
        });

        it('should ignore a move right from the end and continue the animation', () => {
          const typewriter = new Typewriter({
            keystrokes: [
              {
                key: typewriterKeyStrokeRight,
                delay: 50,
                cursor: 0,
              },
              {
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
            keystrokesPerCursor: [
              [
                {
                  key: typewriterKeyStrokeRight,
                  delay: 50,
                  cursor: 0,
                },
                {
                  key: 'z',
                  delay: 50,
                  cursor: 0,
                },
              ],
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

          // It should ignore the keystroke
          jest.advanceTimersByTime(50);
          expect(subscriber).toBeCalledTimes(0);
          
          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              keystrokesPerCursor: [
                [
                  {
                    key: typewriterKeyStrokeRight,
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: 'z',
                    delay: 50,
                    cursor: 0,
                  },
                ],
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
              keystroke: {
                key: 'z',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
            }
          );
        });

        it('should be able to finish from a move right from the end which is ignored', () => {
          const typewriter = new Typewriter({
            keystrokes: [
              {
                key: typewriterKeyStrokeRight,
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
            keystrokesPerCursor: [
              [
                {
                  key: typewriterKeyStrokeRight,
                  delay: 50,
                  cursor: 0,
                },
              ],
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
              keystrokesPerCursor: [
                [
                  {
                    key: typewriterKeyStrokeRight,
                    delay: 50,
                    cursor: 0,
                  },
                ],
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
              keystroke: {
                key: typewriterKeyStrokeRight,
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
            }
          );
        });

        it('should when move right is the last keystroke start repeating', () => {
          const typewriter = new Typewriter({
            keystrokes: [
              {
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              {
                key: typewriterKeyStrokeRight,
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
            keystrokesPerCursor: [
              [
                {
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  key: typewriterKeyStrokeRight,
                  delay: 50,
                  cursor: 0,
                },
              ],
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
              keystrokesPerCursor: [
                [
                  {
                    key: '😄',
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: typewriterKeyStrokeRight,
                    delay: 50,
                    cursor: 0,
                  },
                ],
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
              keystroke: {
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              keystrokesPerCursor: [
                [
                  {
                    key: '😄',
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: typewriterKeyStrokeRight,
                    delay: 50,
                    cursor: 0,
                  },
                ],
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
              keystroke: {
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
            }
          );

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              keystrokesPerCursor: [
                [
                  {
                    key: '😄',
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: typewriterKeyStrokeRight,
                    delay: 50,
                    cursor: 0,
                  },
                ],
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
              type: 'REPEATING',
              time: new Date(),
            }
          );
        });

        it('should when move right is ignored still start repeating', () => {
          const typewriter = new Typewriter({
            keystrokes: [
              {
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              {
                key: typewriterKeyStrokeRight,
                delay: 50,
                cursor: 0,
              },
              {
                key: typewriterKeyStrokeRight,
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
            keystrokesPerCursor: [
              [
                {
                  key: '😄',
                  delay: 50,
                  cursor: 0,
                },
                {
                  key: typewriterKeyStrokeRight,
                  delay: 50,
                  cursor: 0,
                },
                {
                  key: typewriterKeyStrokeRight,
                  delay: 50,
                  cursor: 0,
                },
              ],
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
              keystrokesPerCursor: [
                [
                  {
                    key: '😄',
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: typewriterKeyStrokeRight,
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: typewriterKeyStrokeRight,
                    delay: 50,
                    cursor: 0,
                  },
                ],
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
              keystroke: {
                key: '😄',
                delay: 50,
                cursor: 0,
              },
              time: new Date(),
            }
          );

          // The first typewriterKeyStrokeRight should have no effect
          jest.advanceTimersByTime(50);
          expect(subscriber).toBeCalledTimes(1);

          jest.advanceTimersByTime(50);

          // The last typewriterKeyStrokeRight should also have no effect
          expect(subscriber).toBeCalledTimes(1);

          jest.advanceTimersByTime(50);

          assertLastSubscriber(
            subscriber,
            {
              history: [],
              keystrokesPerCursor: [
                [
                  {
                    key: '😄',
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: typewriterKeyStrokeRight,
                    delay: 50,
                    cursor: 0,
                  },
                  {
                    key: typewriterKeyStrokeRight,
                    delay: 50,
                    cursor: 0,
                  },
                ],
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
              type: 'REPEATING',
              time: new Date(),
            }
          );
        });
      });
    });

    xdescribe('multiple cursors', () => {
      it('should know how to do a basic text animation from start to finish', () => {
        const typewriter = new Typewriter({
          keystrokes: [
            {
              key: 'o',
              delay: 100,
              cursor: 2,
            },
            {
              key: 'o',
              delay: 100,
              cursor: 1,
            },
            {
              key: 'e',
              delay: 100,
              cursor: 0,
            },
          ],
          blinkAfter: 50,
          text: 'hllwrld',
          cursors: [
            { position: 1, name: '' },
            { position: 3, name: '' },
            { position: 4, name: '' },
          ],
        });
        const subscriber = autoSubscribe(typewriter);

        assertState(typewriter, {
          history: [],
          keystrokesPerCursor: [
            [
              {
                key: 'o',
                delay: 100,
                cursor: 2,
              },
              {
                key: 'o',
                delay: 100,
                cursor: 1,
              },
              {
                key: 'e',
                delay: 100,
                cursor: 0,
              },
            ],
          ],
          cursors: [
            { position: 1, name: '', isBlinking: true },
            { position: 3, name: '', isBlinking: true },
            { position: 4, name: '', isBlinking: true },
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
            keystrokesPerCursor: [
              [
                {
                  key: 'o',
                  delay: 100,
                  cursor: 2,
                },
                {
                  key: 'o',
                  delay: 100,
                  cursor: 1,
                },
                {
                  key: 'e',
                  delay: 100,
                  cursor: 0,
                },
              ],
            ],
            cursors: [
              { position: 1, name: '', isBlinking: false },
              { position: 3, name: '', isBlinking: false },
              { position: 5, name: '', isBlinking: false },
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
            keystroke: {
              key: 'o',
              delay: 100,
              cursor: 2,
            },
            time: new Date(),
          }
        );

        jest.advanceTimersByTime(100);

        assertLastSubscriber(
          subscriber,
          {
            history: [],
            keystrokesPerCursor: [
              [
                {
                  key: 'o',
                  delay: 100,
                  cursor: 2,
                },
                {
                  key: 'o',
                  delay: 100,
                  cursor: 1,
                },
                {
                  key: 'e',
                  delay: 100,
                  cursor: 0,
                },
              ],
            ],
            cursors: [
              { position: 1, name: '', isBlinking: false },
              { position: 4, name: '', isBlinking: false },
              { position: 5, name: '', isBlinking: false },
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
            keystroke: {
              key: 'o',
              delay: 100,
              cursor: 1,
            },
            time: new Date(),
          }
        );

        jest.advanceTimersByTime(100);

        assertLastSubscriber(
          subscriber,
          {
            history: [],
            keystrokesPerCursor: [
              [
                {
                  key: 'o',
                  delay: 100,
                  cursor: 2,
                },
                {
                  key: 'o',
                  delay: 100,
                  cursor: 1,
                },
                {
                  key: 'e',
                  delay: 100,
                  cursor: 0,
                },
              ],
            ],
            cursors: [
              { position: 2, name: '', isBlinking: false },
              { position: 4, name: '', isBlinking: false },
              { position: 5, name: '', isBlinking: false },
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
            keystroke: {
              key: 'e',
              delay: 100,
              cursor: 0,
            },
            time: new Date(),
          }
        );
      });

      it('should when backspace is pressed move cursors that are on the end of the text one place backwards', () => {
        const typewriter = new Typewriter({
          keystrokes: [
            {
              key: typewriterKeyStrokeBackspace,
              delay: 100,
              cursor: 0,
            },
          ],
          blinkAfter: 50,
          text: 'john',
          cursors: [
            { position: 2, name: '' },
            { position: 4, name: '' },
            { position: 4, name: '' },
          ],
        });
        const subscriber = autoSubscribe(typewriter);

        assertState(typewriter, {
          history: [],
          keystrokesPerCursor: [
            [
              {
                key: typewriterKeyStrokeBackspace,
                delay: 100,
                cursor: 0,
              },
            ],
          ],
          cursors: [
            { position: 2, name: '', isBlinking: true },
            { position: 4, name: '', isBlinking: true },
            { position: 4, name: '', isBlinking: true },
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
            keystrokesPerCursor: [
              [
                {
                  key: typewriterKeyStrokeBackspace,
                  delay: 100,
                  cursor: 0,
                },
              ],
            ],
            cursors: [
              { position: 1, name: '', isBlinking: false },
              { position: 3, name: '', isBlinking: false },
              { position: 3, name: '', isBlinking: false },
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
            keystroke: {
              key: typewriterKeyStrokeBackspace,
              delay: 100,
              cursor: 0,
            },
            time: new Date(),
          }
        );
      });

      it('should when backspace is pressed not move cursors that are before the cursor that performed the backspace ', () => {
        const typewriter = new Typewriter({
          keystrokes: [
            {
              key: typewriterKeyStrokeBackspace,
              delay: 100,
              cursor: 0,
            },
          ],
          blinkAfter: 50,
          text: 'john',
          cursors: [
            { position: 3, name: '' },
            { position: 1, name: '' },
            { position: 0, name: '' },
          ],
        });
        const subscriber = autoSubscribe(typewriter);

        assertState(typewriter, {
          history: [],
          keystrokesPerCursor: [
            [
              {
                key: typewriterKeyStrokeBackspace,
                delay: 100,
                cursor: 0,
              },
            ],
          ],
          cursors: [
            { position: 3, name: '', isBlinking: true },
            { position: 1, name: '', isBlinking: true },
            { position: 0, name: '', isBlinking: true },
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
            keystrokesPerCursor: [
              [
                {
                  key: typewriterKeyStrokeBackspace,
                  delay: 100,
                  cursor: 0,
                },
              ],
            ],
            cursors: [
              { position: 2, name: '', isBlinking: false },
              { position: 1, name: '', isBlinking: false },
              { position: 0, name: '', isBlinking: false },
            ],
            text: 'jon',
            blinkAfter: 50,
            isPlaying: false,
            isFinished: true,
            hasBeenStoppedBefore: false,
            repeat: false,
            repeatDelay: 0,
          },
          {
            type: 'FINISHED',
            keystroke: {
              key: typewriterKeyStrokeBackspace,
              delay: 100,
              cursor: 0,
            },
            time: new Date(),
          }
        );
      });

      it('should set all cursors to index 0 when a clear all is performed', () => {
        const typewriter = new Typewriter({
          keystrokes: [
            {
              key: typewriterKeyStrokeClearAll,
              delay: 100,
              cursor: 2,
            },
          ],
          blinkAfter: 50,
          text: 'hllwrld',
          cursors: [
            { position: 1, name: '' },
            { position: 3, name: '' },
            { position: 4, name: '' },
          ],
        });
        const subscriber = autoSubscribe(typewriter);

        assertState(typewriter, {
          history: [],
          keystrokesPerCursor: [
            [
              {
                key: typewriterKeyStrokeClearAll,
                delay: 100,
                cursor: 2,
              },
            ],
          ],
          cursors: [
            { position: 1, name: '', isBlinking: true },
            { position: 3, name: '', isBlinking: true },
            { position: 4, name: '', isBlinking: true },
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
            keystrokesPerCursor: [
              [
                {
                  key: typewriterKeyStrokeClearAll,
                  delay: 100,
                  cursor: 2,
                },
              ],
            ],
            cursors: [
              { position: 0, name: '', isBlinking: false },
              { position: 0, name: '', isBlinking: false },
              { position: 0, name: '', isBlinking: false },
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
            keystroke: {
              key: typewriterKeyStrokeClearAll,
              delay: 100,
              cursor: 2,
            },
            time: new Date(),
          }
        );
      });
    });
  });

  describe('repeat', () => {
    it('should when repeat is false run the animation only once', () => {
      const typewriter = new Typewriter({
        keystrokes: [
          {
            key: 'a',
            delay: 50,
            cursor: 0,
          },
          {
            key: 'b',
            delay: 50,
            cursor: 0,
          },
          {
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
        keystrokesPerCursor: [
          [
            {
              key: 'a',
              delay: 50,
              cursor: 0,
            },
            {
              key: 'b',
              delay: 50,
              cursor: 0,
            },
            {
              key: 'c',
              delay: 50,
              cursor: 0,
            },
          ],
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
          keystrokesPerCursor: [
            [
              {
                key: 'a',
                delay: 50,
                cursor: 0,
              },
              {
                key: 'b',
                delay: 50,
                cursor: 0,
              },
              {
                key: 'c',
                delay: 50,
                cursor: 0,
              },
            ],
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
          keystroke: {
            key: 'a',
            delay: 50,
            cursor: 0,
          },
          time: new Date(),
        }
      );

      jest.advanceTimersByTime(50);

      assertLastSubscriber(
        subscriber,
        {
          history: [],
          keystrokesPerCursor: [
            [
              {
                key: 'a',
                delay: 50,
                cursor: 0,
              },
              {
                key: 'b',
                delay: 50,
                cursor: 0,
              },
              {
                key: 'c',
                delay: 50,
                cursor: 0,
              },
            ],
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
          keystroke: {
            key: 'b',
            delay: 50,
            cursor: 0,
          },
          time: new Date(),
        }
      );

      jest.advanceTimersByTime(50);

      assertLastSubscriber(
        subscriber,
        {
          history: [],
          keystrokesPerCursor: [
            [
              {
                key: 'a',
                delay: 50,
                cursor: 0,
              },
              {
                key: 'b',
                delay: 50,
                cursor: 0,
              },
              {
                key: 'c',
                delay: 50,
                cursor: 0,
              },
            ],
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
          keystroke: {
            key: 'c',
            delay: 50,
            cursor: 0,
          },
          time: new Date(),
        }
      );
    });

    it('should when repeat is true run the animation indefinitely', () => {
      const typewriter = new Typewriter({
        keystrokes: [
          {
            key: 'a',
            delay: 50,
            cursor: 0,
          },
          {
            key: 'b',
            delay: 50,
            cursor: 0,
          },
          {
            key: 'c',
            delay: 50,
            cursor: 0,
          },
        ],
        blinkAfter: 50,
        repeat: true,
        repeatDelay: 1,
      });
      const subscriber = autoSubscribe(typewriter);

      assertState(typewriter, {
        history: [],
        keystrokesPerCursor: [
          [
            {
              key: 'a',
              delay: 50,
              cursor: 0,
            },
            {
              key: 'b',
              delay: 50,
              cursor: 0,
            },
            {
              key: 'c',
              delay: 50,
              cursor: 0,
            },
          ],
        ],
        cursors: [{ position: 0, name: '', isBlinking: true }],
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
            keystrokesPerCursor: [
              [
                {
                  key: 'a',
                  delay: 50,
                  cursor: 0,
                },
                {
                  key: 'b',
                  delay: 50,
                  cursor: 0,
                },
                {
                  key: 'c',
                  delay: 50,
                  cursor: 0,
                },
              ],
            ],
            cursors: [{ position: 1, name: '', isBlinking: false }],
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
            keystroke: {
              key: 'a',
              delay: 50,
              cursor: 0,
            },
            time: new Date(),
          }
        );

        jest.advanceTimersByTime(50);

        assertLastSubscriber(
          subscriber,
          {
            history: [],
            keystrokesPerCursor: [
              [
                {
                  key: 'a',
                  delay: 50,
                  cursor: 0,
                },
                {
                  key: 'b',
                  delay: 50,
                  cursor: 0,
                },
                {
                  key: 'c',
                  delay: 50,
                  cursor: 0,
                },
              ],
            ],
            cursors: [{ position: 2, name: '', isBlinking: false }],
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
            keystroke: {
              key: 'b',
              delay: 50,
              cursor: 0,
            },
            time: new Date(),
          }
        );

        jest.advanceTimersByTime(50);

        assertLastSubscriber(
          subscriber,
          {
            history: [],
            keystrokesPerCursor: [
              [
                {
                  key: 'a',
                  delay: 50,
                  cursor: 0,
                },
                {
                  key: 'b',
                  delay: 50,
                  cursor: 0,
                },
                {
                  key: 'c',
                  delay: 50,
                  cursor: 0,
                },
              ],
            ],
            cursors: [{ position: 3, name: '', isBlinking: false }],
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
            keystroke: {
              key: 'c',
              delay: 50,
              cursor: 0,
            },
            time: new Date(),
          }
        );

        jest.advanceTimersByTime(1);

        assertLastSubscriber(
          subscriber,
          {
            history: [],
            keystrokesPerCursor: [
              [
                {
                  key: 'a',
                  delay: 50,
                  cursor: 0,
                },
                {
                  key: 'b',
                  delay: 50,
                  cursor: 0,
                },
                {
                  key: 'c',
                  delay: 50,
                  cursor: 0,
                },
              ],
            ],
            cursors: [{ position: 0, name: '', isBlinking: false }],
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
        keystrokes: [
          {
            key: 'a',
            delay: 50,
            cursor: 0,
          },
          {
            key: 'b',
            delay: 50,
            cursor: 0,
          },
          {
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
        keystrokesPerCursor: [
          [
            {
              key: 'a',
              delay: 50,
              cursor: 0,
            },
            {
              key: 'b',
              delay: 50,
              cursor: 0,
            },
            {
              key: 'c',
              delay: 50,
              cursor: 0,
            },
          ],
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
          keystrokesPerCursor: [
            [
              {
                key: 'a',
                delay: 50,
                cursor: 0,
              },
              {
                key: 'b',
                delay: 50,
                cursor: 0,
              },
              {
                key: 'c',
                delay: 50,
                cursor: 0,
              },
            ],
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
          keystroke: {
            key: 'a',
            delay: 50,
            cursor: 0,
          },
          time: new Date(),
        }
      );

      jest.advanceTimersByTime(50);

      assertLastSubscriber(
        subscriber,
        {
          history: [],
          keystrokesPerCursor: [
            [
              {
                key: 'a',
                delay: 50,
                cursor: 0,
              },
              {
                key: 'b',
                delay: 50,
                cursor: 0,
              },
              {
                key: 'c',
                delay: 50,
                cursor: 0,
              },
            ],
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
          keystroke: {
            key: 'b',
            delay: 50,
            cursor: 0,
          },
          time: new Date(),
        }
      );

      jest.advanceTimersByTime(50);

      assertLastSubscriber(
        subscriber,
        {
          history: [],
          keystrokesPerCursor: [
            [
              {
                key: 'a',
                delay: 50,
                cursor: 0,
              },
              {
                key: 'b',
                delay: 50,
                cursor: 0,
              },
              {
                key: 'c',
                delay: 50,
                cursor: 0,
              },
            ],
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
          keystroke: {
            key: 'c',
            delay: 50,
            cursor: 0,
          },
          time: new Date(),
        }
      );

      jest.advanceTimersByTime(1);

      assertLastSubscriber(
        subscriber,
        {
          history: [],
          keystrokesPerCursor: [
            [
              {
                key: 'a',
                delay: 50,
                cursor: 0,
              },
              {
                key: 'b',
                delay: 50,
                cursor: 0,
              },
              {
                key: 'c',
                delay: 50,
                cursor: 0,
              },
            ],
          ],
          cursors: [{ position: 1, name: '', isBlinking: false }],
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
        }
      );

      // Second iteration

      jest.advanceTimersByTime(50);

      assertLastSubscriber(
        subscriber,
        {
          history: [],
          keystrokesPerCursor: [
            [
              {
                key: 'a',
                delay: 50,
                cursor: 0,
              },
              {
                key: 'b',
                delay: 50,
                cursor: 0,
              },
              {
                key: 'c',
                delay: 50,
                cursor: 0,
              },
            ],
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
          keystroke: {
            key: 'a',
            delay: 50,
            cursor: 0,
          },
          time: new Date(),
        }
      );

      jest.advanceTimersByTime(50);

      assertLastSubscriber(
        subscriber,
        {
          history: [],
          keystrokesPerCursor: [
            [
              {
                key: 'a',
                delay: 50,
                cursor: 0,
              },
              {
                key: 'b',
                delay: 50,
                cursor: 0,
              },
              {
                key: 'c',
                delay: 50,
                cursor: 0,
              },
            ],
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
          keystroke: {
            key: 'b',
            delay: 50,
            cursor: 0,
          },
          time: new Date(),
        }
      );

      jest.advanceTimersByTime(50);

      assertLastSubscriber(
        subscriber,
        {
          history: [],
          keystrokesPerCursor: [
            [
              {
                key: 'a',
                delay: 50,
                cursor: 0,
              },
              {
                key: 'b',
                delay: 50,
                cursor: 0,
              },
              {
                key: 'c',
                delay: 50,
                cursor: 0,
              },
            ],
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
          keystroke: {
            key: 'c',
            delay: 50,
            cursor: 0,
          },
          time: new Date(),
        }
      );

      jest.advanceTimersByTime(1);

      assertLastSubscriber(
        subscriber,
        {
          history: [],
          keystrokesPerCursor: [
            [
              {
                key: 'a',
                delay: 50,
                cursor: 0,
              },
              {
                key: 'b',
                delay: 50,
                cursor: 0,
              },
              {
                key: 'c',
                delay: 50,
                cursor: 0,
              },
            ],
          ],
          cursors: [{ position: 1, name: '', isBlinking: false }],
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
        }
      );

      // Third iteration

      jest.advanceTimersByTime(50);

      assertLastSubscriber(
        subscriber,
        {
          history: [],
          keystrokesPerCursor: [
            [
              {
                key: 'a',
                delay: 50,
                cursor: 0,
              },
              {
                key: 'b',
                delay: 50,
                cursor: 0,
              },
              {
                key: 'c',
                delay: 50,
                cursor: 0,
              },
            ],
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
          keystroke: {
            key: 'a',
            delay: 50,
            cursor: 0,
          },
          time: new Date(),
        }
      );

      jest.advanceTimersByTime(50);

      assertLastSubscriber(
        subscriber,
        {
          history: [],
          keystrokesPerCursor: [
            [
              {
                key: 'a',
                delay: 50,
                cursor: 0,
              },
              {
                key: 'b',
                delay: 50,
                cursor: 0,
              },
              {
                key: 'c',
                delay: 50,
                cursor: 0,
              },
            ],
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
          keystroke: {
            key: 'b',
            delay: 50,
            cursor: 0,
          },
          time: new Date(),
        }
      );

      jest.advanceTimersByTime(50);

      assertLastSubscriber(
        subscriber,
        {
          history: [],
          keystrokesPerCursor: [
            [
              {
                key: 'a',
                delay: 50,
                cursor: 0,
              },
              {
                key: 'b',
                delay: 50,
                cursor: 0,
              },
              {
                key: 'c',
                delay: 50,
                cursor: 0,
              },
            ],
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
          keystroke: {
            key: 'c',
            delay: 50,
            cursor: 0,
          },
          time: new Date(),
        }
      );

      jest.advanceTimersByTime(1);
    });
  });

  describe('play & pause and stop', () => {
    test('that the animation can be paused and continued', () => {
      const typewriter = new Typewriter({
        keystrokes: [
          {
            key: 'a',
            delay: 100,
            cursor: 0,
          },
          {
            key: 'b',
            delay: 100,
            cursor: 0,
          },
          {
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
        keystrokes: [
          {
            key: 'a',
            delay: 100,
            cursor: 0,
          },
          {
            key: 'b',
            delay: 100,
            cursor: 0,
          },
          {
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

    test('that the autoplay can be stopped and restarted with the original text', () => {
      const typewriter = new Typewriter({
        keystrokes: [
          {
            key: 'a',
            delay: 100,
            cursor: 0,
          },
          {
            key: 'b',
            delay: 100,
            cursor: 0,
          },
          {
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
        keystrokes: [
          {
            key: 'a',
            delay: 100,
            cursor: 0,
          },
          {
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
      expect(typewriter.cursors[0].isBlinking).toBe(false);
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
        keystrokes: [
          {
            key: 'a',
            delay: 100,
            cursor: 0,
          },
          {
            key: 'b',
            delay: 100,
            cursor: 0,
          },
          {
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
        keystrokes: [
          {
            key: 'a',
            delay: 100,
            cursor: 0,
          },
          {
            key: 'b',
            delay: 100,
            cursor: 0,
          },
          {
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
        keystrokes: [
          {
            key: 'a',
            delay: 100,
            cursor: 0,
          },
          {
            key: 'b',
            delay: 100,
            cursor: 0,
          },
          {
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
        keystrokes: [
          {
            key: 'a',
            delay: 100,
            cursor: 0,
          },
          {
            key: 'b',
            delay: 100,
            cursor: 0,
          },
          {
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

    test('that it is not possible to play when already playing', () => {
      const typewriter = new Typewriter({
        keystrokes: [
          {
            key: 'a',
            delay: 100,
            cursor: 0,
          },
          {
            key: 'b',
            delay: 100,
            cursor: 0,
          },
          {
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
    });
  });

  describe('history', () => {
    test('that a history is kept for a maximum number of events', () => {
      const typewriter = new Typewriter({
        keystrokes: [
          {
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
        keystrokes: [
          {
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
        keystrokes: [
          {
            key: 'a',
            delay: 10000,
            cursor: 0,
          },
          {
            key: 'b',
            delay: 10000,
            cursor: 0,
          },
          {
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

type TestCursor = TypewriterCursorConfig & { isBlinking: boolean };

type TestState = Pick<
  Typewriter,
  | 'text'
  | 'history'
  | 'blinkAfter'
  | 'isPlaying'
  | 'isFinished'
  | 'hasBeenStoppedBefore'
  | 'keystrokesPerCursor'
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
    keystrokesPerCursor: state.keystrokesPerCursor.map((keystrokes) => {
      return keystrokes.map((keystroke) => {
        const copy: TypewriterKeystroke = {
          key: keystroke.key,
          delay: keystroke.delay,
          cursor: keystroke.cursor,
        };

        return copy;
      });
    }),
    cursors: state.cursors.map((cursor) => {
      const copy: TestCursor = {
        position: cursor.position,
        name: cursor.name,
        isBlinking: cursor.isBlinking,
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
