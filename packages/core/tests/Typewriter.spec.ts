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
                },
                {
                  key: 'b',
                  delay: -1,
                },
                {
                  key: 'c',
                  delay: 100,
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
                },
                {
                  key: 'b',
                  delay: 100,
                },
                {
                  key: 'c',
                  delay: -1,
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
                },
                {
                  key: 'b',
                  delay: 0,
                },
                {
                  key: 'c',
                  delay: 100,
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
                },
                {
                  key: 'b',
                  delay: 100,
                },
                {
                  key: 'c',
                  delay: 0,
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
    });

    test('with a config it should initialize with configured values', () => {
      const typewriter: Typewriter = new Typewriter({
        text: 'aap',
        blinkAfter: 1337,
        keystrokes: [{ key: '', delay: 999 }],
        keepHistoryFor: 1,
        repeat: 1337,
        repeatDelay: 666
      });

      const subscriber = jest.fn();
      unsubscribe = typewriter.subscribe(subscriber);

      assertState(typewriter, {
        history: [
          expect.objectContaining({
            type: 'INITIALIZED',
          }),
        ],
        keystrokes: [{ key: '', delay: 999 }],
        text: 'aap',
        isBlinking: true,
        blinkAfter: 1337,
        isPlaying: true,
        isFinished: false,
        hasBeenStoppedBefore: false,
        repeat: 1337,
        repeatDelay: 666,
      });

      expect(subscriber).toHaveBeenCalledTimes(0);
    });

    test('without a config it should be empty', () => {
      const typewriter: Typewriter = new Typewriter();

      const subscriber = jest.fn();
      unsubscribe = typewriter.subscribe(subscriber);

      assertState(typewriter, {
        history: [],
        keystrokes: [],
        text: '',
        isBlinking: true,
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
        keystrokes: [],
        text: '',
        isBlinking: true,
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
        keystrokes: [],
        text: '',
        isBlinking: true,
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
                },
                {
                  key: 'b',
                  delay: -1,
                },
                {
                  key: 'c',
                  delay: 100,
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
                },
                {
                  key: 'b',
                  delay: 100,
                },
                {
                  key: 'c',
                  delay: -1,
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
                },
                {
                  key: 'b',
                  delay: 0,
                },
                {
                  key: 'c',
                  delay: 100,
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
                },
                {
                  key: 'b',
                  delay: 100,
                },
                {
                  key: 'c',
                  delay: 0,
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
    });

    describe('reset behavior', () => {
      test('that initialize can reset the Typewriter', () => {
        const typewriter: Typewriter = new Typewriter({
          text: 'aap',
          blinkAfter: 1337,
          keystrokes: [{ key: '', delay: 999 }],
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
            keystrokes: [],
            text: '',
            isBlinking: true,
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
            { key: 'a', delay: 100 },
            { key: 'b', delay: 100 },
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
            { key: 'a', delay: 100 },
            { key: 'b', delay: 100 },
          ],
        });

        expect(typewriter.isBlinking).toBe(true);

        jest.advanceTimersByTime(100);

        expect(typewriter.isBlinking).toBe(false);

        // Just before the timer hits do an initialize
        typewriter.initialize({
          keystrokes: [
            { key: 'c', delay: 100 },
            { key: 'd', delay: 100 },
          ],
        });

        jest.advanceTimersByTime(100);

        // It should only trigger now after another 50ms
        jest.advanceTimersByTime(1);
        expect(typewriter.isBlinking).toBe(false);

        // Move it just before
        jest.advanceTimersByTime(48);
        expect(typewriter.isBlinking).toBe(false);

        // Now push it over the time limit
        jest.advanceTimersByTime(1);
        expect(typewriter.isBlinking).toBe(true);
      });
    });

    it('should start playing automatically when there are keystrokes configured', () => {
      const typewriter = new Typewriter();

      typewriter.initialize({
        keystrokes: [
          {
            key: 'a',
            delay: 100,
          },
          {
            key: 'b',
            delay: 100,
          },
          {
            key: 'c',
            delay: 100,
          },
        ],
      });

      // After 100 milliseconds it should now be 'a'
      jest.advanceTimersByTime(100);

      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.isBlinking).toBe(false);
      expect(typewriter.text).toBe('a');
    });
  });

  describe('animation', () => {
    it('should know how to do a basic text animation from start to finish', () => {
      const typewriter = new Typewriter({
        keystrokes: [
          {
            key: 'a',
            delay: 100,
          },
          {
            key: 'b',
            delay: 200,
          },
          {
            key: 'c',
            delay: 300,
          },
        ],
        blinkAfter: 50,
      });
      const subscriber = autoSubscribe(typewriter);

      assertState(typewriter, {
        history: [],
        keystrokes: [
          {
            key: 'a',
            delay: 100,
          },
          {
            key: 'b',
            delay: 200,
          },
          {
            key: 'c',
            delay: 300,
          },
        ],
        text: '',
        isBlinking: true,
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
          keystrokes: [
            {
              key: 'a',
              delay: 100,
            },
            {
              key: 'b',
              delay: 200,
            },
            {
              key: 'c',
              delay: 300,
            },
          ],
          text: 'a',
          isBlinking: false,
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
          },
          time: new Date(),
        }
      );

      jest.advanceTimersByTime(200);

      assertLastSubscriber(
        subscriber,
        {
          history: [],
          keystrokes: [
            {
              key: 'a',
              delay: 100,
            },
            {
              key: 'b',
              delay: 200,
            },
            {
              key: 'c',
              delay: 300,
            },
          ],
          text: 'ab',
          isBlinking: false,
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
          },
          time: new Date(),
        }
      );

      jest.advanceTimersByTime(300);

      assertLastSubscriber(
        subscriber,
        {
          history: [],
          keystrokes: [
            {
              key: 'a',
              delay: 100,
            },
            {
              key: 'b',
              delay: 200,
            },
            {
              key: 'c',
              delay: 300,
            },
          ],
          text: 'abc',
          isBlinking: false,
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
          },
          time: new Date(),
        }
      );
    });

    it('should know how to to apply a backspace', () => {
      const typewriter = new Typewriter({
        keystrokes: [
          {
            key: 'a',
            delay: 50,
          },
          {
            key: typewriterKeyStrokeBackspace,
            delay: 50,
          },
          {
            key: 'b',
            delay: 50,
          },
          {
            key: typewriterKeyStrokeBackspace,
            delay: 50,
          },
          {
            key: 'c',
            delay: 50,
          },
        ],
        blinkAfter: 50,
      });
      const subscriber = autoSubscribe(typewriter);

      assertState(typewriter, {
        history: [],
        keystrokes: [
          {
            key: 'a',
            delay: 50,
          },
          {
            key: typewriterKeyStrokeBackspace,
            delay: 50,
          },
          {
            key: 'b',
            delay: 50,
          },
          {
            key: typewriterKeyStrokeBackspace,
            delay: 50,
          },
          {
            key: 'c',
            delay: 50,
          },
        ],
        text: '',
        isBlinking: true,
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
          keystrokes: [
            {
              key: 'a',
              delay: 50,
            },
            {
              key: typewriterKeyStrokeBackspace,
              delay: 50,
            },
            {
              key: 'b',
              delay: 50,
            },
            {
              key: typewriterKeyStrokeBackspace,
              delay: 50,
            },
            {
              key: 'c',
              delay: 50,
            },
          ],
          text: 'a',
          isBlinking: false,
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
          },
          time: new Date(),
        }
      );

      jest.advanceTimersByTime(50);

      assertLastSubscriber(
        subscriber,
        {
          history: [],
          keystrokes: [
            {
              key: 'a',
              delay: 50,
            },
            {
              key: typewriterKeyStrokeBackspace,
              delay: 50,
            },
            {
              key: 'b',
              delay: 50,
            },
            {
              key: typewriterKeyStrokeBackspace,
              delay: 50,
            },
            {
              key: 'c',
              delay: 50,
            },
          ],
          text: '',
          isBlinking: false,
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
          },
          time: new Date(),
        }
      );

      jest.advanceTimersByTime(50);

      assertLastSubscriber(
        subscriber,
        {
          history: [],
          keystrokes: [
            {
              key: 'a',
              delay: 50,
            },
            {
              key: typewriterKeyStrokeBackspace,
              delay: 50,
            },
            {
              key: 'b',
              delay: 50,
            },
            {
              key: typewriterKeyStrokeBackspace,
              delay: 50,
            },
            {
              key: 'c',
              delay: 50,
            },
          ],
          text: 'b',
          isBlinking: false,
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
          },
          time: new Date(),
        }
      );

      jest.advanceTimersByTime(50);

      assertLastSubscriber(
        subscriber,
        {
          history: [],
          keystrokes: [
            {
              key: 'a',
              delay: 50,
            },
            {
              key: typewriterKeyStrokeBackspace,
              delay: 50,
            },
            {
              key: 'b',
              delay: 50,
            },
            {
              key: typewriterKeyStrokeBackspace,
              delay: 50,
            },
            {
              key: 'c',
              delay: 50,
            },
          ],
          text: '',
          isBlinking: false,
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
          },
          time: new Date(),
        }
      );

      jest.advanceTimersByTime(50);

      assertLastSubscriber(
        subscriber,
        {
          history: [],
          keystrokes: [
            {
              key: 'a',
              delay: 50,
            },
            {
              key: typewriterKeyStrokeBackspace,
              delay: 50,
            },
            {
              key: 'b',
              delay: 50,
            },
            {
              key: typewriterKeyStrokeBackspace,
              delay: 50,
            },
            {
              key: 'c',
              delay: 50,
            },
          ],
          text: 'c',
          isBlinking: false,
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
          },
          {
            key: typewriterKeyStrokeBackspace,
            delay: 50,
          },
          {
            key: '😃',
            delay: 50,
          },
          {
            key: typewriterKeyStrokeBackspace,
            delay: 50,
          },
          {
            key: '😄',
            delay: 50,
          },
        ],
        blinkAfter: 50,
      });
      const subscriber = autoSubscribe(typewriter);

      assertState(typewriter, {
        history: [],
        keystrokes: [
          {
            key: '😀',
            delay: 50,
          },
          {
            key: typewriterKeyStrokeBackspace,
            delay: 50,
          },
          {
            key: '😃',
            delay: 50,
          },
          {
            key: typewriterKeyStrokeBackspace,
            delay: 50,
          },
          {
            key: '😄',
            delay: 50,
          },
        ],
        text: '',
        isBlinking: true,
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
          keystrokes: [
            {
              key: '😀',
              delay: 50,
            },
            {
              key: typewriterKeyStrokeBackspace,
              delay: 50,
            },
            {
              key: '😃',
              delay: 50,
            },
            {
              key: typewriterKeyStrokeBackspace,
              delay: 50,
            },
            {
              key: '😄',
              delay: 50,
            },
          ],
          text: '😀',
          isBlinking: false,
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
          },
          time: new Date(),
        }
      );

      jest.advanceTimersByTime(50);

      assertLastSubscriber(
        subscriber,
        {
          history: [],
          keystrokes: [
            {
              key: '😀',
              delay: 50,
            },
            {
              key: typewriterKeyStrokeBackspace,
              delay: 50,
            },
            {
              key: '😃',
              delay: 50,
            },
            {
              key: typewriterKeyStrokeBackspace,
              delay: 50,
            },
            {
              key: '😄',
              delay: 50,
            },
          ],
          text: '',
          isBlinking: false,
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
          },
          time: new Date(),
        }
      );

      jest.advanceTimersByTime(50);

      assertLastSubscriber(
        subscriber,
        {
          history: [],
          keystrokes: [
            {
              key: '😀',
              delay: 50,
            },
            {
              key: typewriterKeyStrokeBackspace,
              delay: 50,
            },
            {
              key: '😃',
              delay: 50,
            },
            {
              key: typewriterKeyStrokeBackspace,
              delay: 50,
            },
            {
              key: '😄',
              delay: 50,
            },
          ],
          text: '😃',
          isBlinking: false,
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
          },
          time: new Date(),
        }
      );

      jest.advanceTimersByTime(50);

      assertLastSubscriber(
        subscriber,
        {
          history: [],
          keystrokes: [
            {
              key: '😀',
              delay: 50,
            },
            {
              key: typewriterKeyStrokeBackspace,
              delay: 50,
            },
            {
              key: '😃',
              delay: 50,
            },
            {
              key: typewriterKeyStrokeBackspace,
              delay: 50,
            },
            {
              key: '😄',
              delay: 50,
            },
          ],
          text: '',
          isBlinking: false,
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
          },
          time: new Date(),
        }
      );

      jest.advanceTimersByTime(50);

      assertLastSubscriber(
        subscriber,
        {
          history: [],
          keystrokes: [
            {
              key: '😀',
              delay: 50,
            },
            {
              key: typewriterKeyStrokeBackspace,
              delay: 50,
            },
            {
              key: '😃',
              delay: 50,
            },
            {
              key: typewriterKeyStrokeBackspace,
              delay: 50,
            },
            {
              key: '😄',
              delay: 50,
            },
          ],
          text: '😄',
          isBlinking: false,
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
          },
          time: new Date(),
        }
      );
    });

    it('should know how to to apply a clear all', () => {
      const typewriter = new Typewriter({
        keystrokes: [
          {
            key: typewriterKeyStrokeClearAll,
            delay: 50,
          },
          {
            key: '😄',
            delay: 50,
          },
        ],
        blinkAfter: 50,
        text: 'Hello world!',
      });
      const subscriber = autoSubscribe(typewriter);

      assertState(typewriter, {
        history: [],
        keystrokes: [
          {
            key: typewriterKeyStrokeClearAll,
            delay: 50,
          },
          {
            key: '😄',
            delay: 50,
          },
        ],
        text: 'Hello world!',
        isBlinking: true,
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
          keystrokes: [
            {
              key: typewriterKeyStrokeClearAll,
              delay: 50,
            },
            {
              key: '😄',
              delay: 50,
            },
          ],
          text: '',
          isBlinking: false,
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
          },
          time: new Date(),
        }
      );

      jest.advanceTimersByTime(50);

      assertLastSubscriber(
        subscriber,
        {
          history: [],
          keystrokes: [
            {
              key: typewriterKeyStrokeClearAll,
              delay: 50,
            },
            {
              key: '😄',
              delay: 50,
            },
          ],
          text: '😄',
          isBlinking: false,
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
          },
          time: new Date(),
        }
      );
    });
  });

  describe('repeat', () => {
    it('should when repeat is false run the animation only once', () => {
      const typewriter = new Typewriter({
        keystrokes: [
          {
            key: 'a',
            delay: 50,
          },
          {
            key: 'b',
            delay: 50,
          },
          {
            key: 'c',
            delay: 50,
          },
        ],
        blinkAfter: 50,
        repeat: false,
        repeatDelay: 0,
      });
      const subscriber = autoSubscribe(typewriter);

      assertState(typewriter, {
        history: [],
        keystrokes: [
          {
            key: 'a',
            delay: 50,
          },
          {
            key: 'b',
            delay: 50,
          },
          {
            key: 'c',
            delay: 50,
          },
        ],
        text: '',
        isBlinking: true,
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
          keystrokes: [
            {
              key: 'a',
              delay: 50,
            },
            {
              key: 'b',
              delay: 50,
            },
            {
              key: 'c',
              delay: 50,
            },
          ],
          text: 'a',
          isBlinking: false,
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
          },
          time: new Date(),
        }
      );

      jest.advanceTimersByTime(50);

      assertLastSubscriber(
        subscriber,
        {
          history: [],
          keystrokes: [
            {
              key: 'a',
              delay: 50,
            },
            {
              key: 'b',
              delay: 50,
            },
            {
              key: 'c',
              delay: 50,
            },
          ],
          text: 'ab',
          isBlinking: false,
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
          },
          time: new Date(),
        }
      );

      jest.advanceTimersByTime(50);

      assertLastSubscriber(
        subscriber,
        {
          history: [],
          keystrokes: [
            {
              key: 'a',
              delay: 50,
            },
            {
              key: 'b',
              delay: 50,
            },
            {
              key: 'c',
              delay: 50,
            },
          ],
          text: 'abc',
          isBlinking: false,
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
          },
          {
            key: 'b',
            delay: 50,
          },
          {
            key: 'c',
            delay: 50,
          },
        ],
        blinkAfter: 50,
        repeat: true,
        repeatDelay: 1,
      });
      const subscriber = autoSubscribe(typewriter);

      assertState(typewriter, {
        history: [],
        keystrokes: [
          {
            key: 'a',
            delay: 50,
          },
          {
            key: 'b',
            delay: 50,
          },
          {
            key: 'c',
            delay: 50,
          },
        ],
        text: '',
        isBlinking: true,
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
            keystrokes: [
              {
                key: 'a',
                delay: 50,
              },
              {
                key: 'b',
                delay: 50,
              },
              {
                key: 'c',
                delay: 50,
              },
            ],
            text: 'a',
            isBlinking: false,
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
            },
            time: new Date(),
          }
        );

        jest.advanceTimersByTime(50);

        assertLastSubscriber(
          subscriber,
          {
            history: [],
            keystrokes: [
              {
                key: 'a',
                delay: 50,
              },
              {
                key: 'b',
                delay: 50,
              },
              {
                key: 'c',
                delay: 50,
              },
            ],
            text: 'ab',
            isBlinking: false,
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
            },
            time: new Date(),
          }
        );

        jest.advanceTimersByTime(50);

        assertLastSubscriber(
          subscriber,
          {
            history: [],
            keystrokes: [
              {
                key: 'a',
                delay: 50,
              },
              {
                key: 'b',
                delay: 50,
              },
              {
                key: 'c',
                delay: 50,
              },
            ],
            text: 'abc',
            isBlinking: false,
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
            },
            time: new Date(),
          }
        );

        jest.advanceTimersByTime(1);

        assertLastSubscriber(
          subscriber,
          {
            history: [],
            keystrokes: [
              {
                key: 'a',
                delay: 50,
              },
              {
                key: 'b',
                delay: 50,
              },
              {
                key: 'c',
                delay: 50,
              },
            ],
            text: '',
            isBlinking: false,
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
          },
          {
            key: 'b',
            delay: 50,
          },
          {
            key: 'c',
            delay: 50,
          },
        ],
        blinkAfter: 50,
        repeat: 3,
      });
      const subscriber = autoSubscribe(typewriter);

      assertState(typewriter, {
        history: [],
        keystrokes: [
          {
            key: 'a',
            delay: 50,
          },
          {
            key: 'b',
            delay: 50,
          },
          {
            key: 'c',
            delay: 50,
          },
        ],
        text: '',
        isBlinking: true,
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
          keystrokes: [
            {
              key: 'a',
              delay: 50,
            },
            {
              key: 'b',
              delay: 50,
            },
            {
              key: 'c',
              delay: 50,
            },
          ],
          text: 'a',
          isBlinking: false,
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
          },
          time: new Date(),
        }
      );

      jest.advanceTimersByTime(50);

      assertLastSubscriber(
        subscriber,
        {
          history: [],
          keystrokes: [
            {
              key: 'a',
              delay: 50,
            },
            {
              key: 'b',
              delay: 50,
            },
            {
              key: 'c',
              delay: 50,
            },
          ],
          text: 'ab',
          isBlinking: false,
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
          },
          time: new Date(),
        }
      );

      jest.advanceTimersByTime(50);

      assertLastSubscriber(
        subscriber,
        {
          history: [],
          keystrokes: [
            {
              key: 'a',
              delay: 50,
            },
            {
              key: 'b',
              delay: 50,
            },
            {
              key: 'c',
              delay: 50,
            },
          ],
          text: 'abc',
          isBlinking: false,
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
          },
          time: new Date(),
        }
      );

      jest.advanceTimersByTime(1);

      assertLastSubscriber(
        subscriber,
        {
          history: [],
          keystrokes: [
            {
              key: 'a',
              delay: 50,
            },
            {
              key: 'b',
              delay: 50,
            },
            {
              key: 'c',
              delay: 50,
            },
          ],
          text: '',
          isBlinking: false,
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
          keystrokes: [
            {
              key: 'a',
              delay: 50,
            },
            {
              key: 'b',
              delay: 50,
            },
            {
              key: 'c',
              delay: 50,
            },
          ],
          text: 'a',
          isBlinking: false,
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
          },
          time: new Date(),
        }
      );

      jest.advanceTimersByTime(50);

      assertLastSubscriber(
        subscriber,
        {
          history: [],
          keystrokes: [
            {
              key: 'a',
              delay: 50,
            },
            {
              key: 'b',
              delay: 50,
            },
            {
              key: 'c',
              delay: 50,
            },
          ],
          text: 'ab',
          isBlinking: false,
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
          },
          time: new Date(),
        }
      );

      jest.advanceTimersByTime(50);

      assertLastSubscriber(
        subscriber,
        {
          history: [],
          keystrokes: [
            {
              key: 'a',
              delay: 50,
            },
            {
              key: 'b',
              delay: 50,
            },
            {
              key: 'c',
              delay: 50,
            },
          ],
          text: 'abc',
          isBlinking: false,
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
          },
          time: new Date(),
        }
      );

      jest.advanceTimersByTime(1);

      assertLastSubscriber(
        subscriber,
        {
          history: [],
          keystrokes: [
            {
              key: 'a',
              delay: 50,
            },
            {
              key: 'b',
              delay: 50,
            },
            {
              key: 'c',
              delay: 50,
            },
          ],
          text: '',
          isBlinking: false,
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
          keystrokes: [
            {
              key: 'a',
              delay: 50,
            },
            {
              key: 'b',
              delay: 50,
            },
            {
              key: 'c',
              delay: 50,
            },
          ],
          text: 'a',
          isBlinking: false,
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
          },
          time: new Date(),
        }
      );

      jest.advanceTimersByTime(50);

      assertLastSubscriber(
        subscriber,
        {
          history: [],
          keystrokes: [
            {
              key: 'a',
              delay: 50,
            },
            {
              key: 'b',
              delay: 50,
            },
            {
              key: 'c',
              delay: 50,
            },
          ],
          text: 'ab',
          isBlinking: false,
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
          },
          time: new Date(),
        }
      );

      jest.advanceTimersByTime(50);

      assertLastSubscriber(
        subscriber,
        {
          history: [],
          keystrokes: [
            {
              key: 'a',
              delay: 50,
            },
            {
              key: 'b',
              delay: 50,
            },
            {
              key: 'c',
              delay: 50,
            },
          ],
          text: 'abc',
          isBlinking: false,
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
          },
          {
            key: 'b',
            delay: 100,
          },
          {
            key: 'c',
            delay: 100,
          },
        ],
        blinkAfter: 50,
      });
      const subscriber = autoSubscribe(typewriter);

      // Should be empty initially
      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.isBlinking).toBe(true);
      expect(typewriter.hasBeenStoppedBefore).toBe(false);
      expect(typewriter.text).toBe('');
      assertEvents(subscriber, []);

      // After 100 milliseconds it should now be 'a'
      jest.advanceTimersByTime(100);

      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.isBlinking).toBe(false);
      expect(typewriter.hasBeenStoppedBefore).toBe(false);
      expect(typewriter.text).toBe('a');
      assertEvents(subscriber, ['CHANGED']);

      // Now pause it at the half way, it should be blinking now.
      jest.advanceTimersByTime(50);

      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.isBlinking).toBe(true);
      expect(typewriter.hasBeenStoppedBefore).toBe(false);
      expect(typewriter.text).toBe('a');
      assertEvents(subscriber, ['CHANGED', 'BLINKING']);

      typewriter.pause();

      expect(typewriter.isPlaying).toBe(false);
      expect(typewriter.isBlinking).toBe(true);
      expect(typewriter.text).toBe('a');
      assertEvents(subscriber, ['CHANGED', 'BLINKING', 'PAUSED']);

      // When paused advancing the time should do nothing.
      jest.advanceTimersByTime(500);

      expect(typewriter.isPlaying).toBe(false);
      expect(typewriter.isBlinking).toBe(true);
      expect(typewriter.hasBeenStoppedBefore).toBe(false);
      expect(typewriter.text).toBe('a');
      assertEvents(subscriber, ['CHANGED', 'BLINKING', 'PAUSED']);

      // Even when advancing a huge amount of seconds, it should
      // stay paused no matter what.
      jest.advanceTimersByTime(10000);

      expect(typewriter.isPlaying).toBe(false);
      expect(typewriter.isBlinking).toBe(true);
      expect(typewriter.hasBeenStoppedBefore).toBe(false);
      expect(typewriter.text).toBe('a');
      assertEvents(subscriber, ['CHANGED', 'BLINKING', 'PAUSED']);

      // Now press play, after 50 milliseconds it should type 'b'
      typewriter.play();

      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.isBlinking).toBe(true);
      expect(typewriter.hasBeenStoppedBefore).toBe(false);
      expect(typewriter.text).toBe('a');
      assertEvents(subscriber, ['CHANGED', 'BLINKING', 'PAUSED', 'PLAYING']);

      // Just before nothing should happen
      jest.advanceTimersByTime(49);

      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.isBlinking).toBe(true);
      expect(typewriter.hasBeenStoppedBefore).toBe(false);
      expect(typewriter.text).toBe('a');
      assertEvents(subscriber, ['CHANGED', 'BLINKING', 'PAUSED', 'PLAYING']);

      // Force it over
      jest.advanceTimersByTime(1);

      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.isBlinking).toBe(false);
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
          },
          {
            key: 'b',
            delay: 100,
          },
          {
            key: 'c',
            delay: 100,
          },
        ],
        blinkAfter: 50,
      });
      const subscriber = autoSubscribe(typewriter);

      // Should be empty initially
      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.isBlinking).toBe(true);
      expect(typewriter.hasBeenStoppedBefore).toBe(false);
      expect(typewriter.text).toBe('');
      assertEvents(subscriber, []);

      // After 100 milliseconds it should now be 'a'
      jest.advanceTimersByTime(100);

      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.isBlinking).toBe(false);
      expect(typewriter.hasBeenStoppedBefore).toBe(false);
      expect(typewriter.text).toBe('a');
      assertEvents(subscriber, ['CHANGED']);

      // Now stop it at the half way, it should be blinking now.
      jest.advanceTimersByTime(50);

      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.isBlinking).toBe(true);
      expect(typewriter.hasBeenStoppedBefore).toBe(false);
      expect(typewriter.text).toBe('a');
      assertEvents(subscriber, ['CHANGED', 'BLINKING']);

      typewriter.stop();

      expect(typewriter.isPlaying).toBe(false);
      expect(typewriter.isBlinking).toBe(true);
      expect(typewriter.hasBeenStoppedBefore).toBe(true);
      expect(typewriter.text).toBe('a');
      assertEvents(subscriber, ['CHANGED', 'BLINKING', 'STOPPED']);

      // When stopped advancing the time should do nothing.
      jest.advanceTimersByTime(500);

      expect(typewriter.isPlaying).toBe(false);
      expect(typewriter.isBlinking).toBe(true);
      expect(typewriter.hasBeenStoppedBefore).toBe(true);
      expect(typewriter.text).toBe('a');
      assertEvents(subscriber, ['CHANGED', 'BLINKING', 'STOPPED']);

      // Even when advancing a huge amount of seconds, it should
      // stay stopped no matter what.
      jest.advanceTimersByTime(10000);

      expect(typewriter.isPlaying).toBe(false);
      expect(typewriter.isBlinking).toBe(true);
      expect(typewriter.hasBeenStoppedBefore).toBe(true);
      expect(typewriter.text).toBe('a');
      assertEvents(subscriber, ['CHANGED', 'BLINKING', 'STOPPED']);

      // Now press play, after 100 milliseconds it should type 'a'
      typewriter.play();

      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.isBlinking).toBe(true);
      expect(typewriter.hasBeenStoppedBefore).toBe(true);
      expect(typewriter.text).toBe('');
      assertEvents(subscriber, ['CHANGED', 'BLINKING', 'STOPPED', 'PLAYING']);

      // Just before nothing should happen
      jest.advanceTimersByTime(99);

      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.isBlinking).toBe(true);
      expect(typewriter.text).toBe('');
      assertEvents(subscriber, ['CHANGED', 'BLINKING', 'STOPPED', 'PLAYING']);

      // Force it over
      jest.advanceTimersByTime(1);

      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.isBlinking).toBe(false);
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
          },
          {
            key: 'b',
            delay: 100,
          },
          {
            key: 'c',
            delay: 100,
          },
        ],
        blinkAfter: 50,
        text: 'z',
      });
      const subscriber = autoSubscribe(typewriter);

      // Should be empty initially
      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.isBlinking).toBe(true);
      expect(typewriter.hasBeenStoppedBefore).toBe(false);
      expect(typewriter.text).toBe('z');
      assertEvents(subscriber, []);

      // After 100 milliseconds it should now be 'a'
      jest.advanceTimersByTime(100);

      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.isBlinking).toBe(false);
      expect(typewriter.hasBeenStoppedBefore).toBe(false);
      expect(typewriter.text).toBe('za');
      assertEvents(subscriber, ['CHANGED']);

      // Now stop it at the half way, it should be blinking now.
      jest.advanceTimersByTime(50);

      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.isBlinking).toBe(true);
      expect(typewriter.hasBeenStoppedBefore).toBe(false);
      expect(typewriter.text).toBe('za');
      assertEvents(subscriber, ['CHANGED', 'BLINKING']);

      typewriter.stop();

      expect(typewriter.isPlaying).toBe(false);
      expect(typewriter.isBlinking).toBe(true);
      expect(typewriter.hasBeenStoppedBefore).toBe(true);
      expect(typewriter.text).toBe('za');
      assertEvents(subscriber, ['CHANGED', 'BLINKING', 'STOPPED']);

      // When stopped advancing the time should do nothing.
      jest.advanceTimersByTime(500);

      expect(typewriter.isPlaying).toBe(false);
      expect(typewriter.isBlinking).toBe(true);
      expect(typewriter.hasBeenStoppedBefore).toBe(true);
      expect(typewriter.text).toBe('za');
      assertEvents(subscriber, ['CHANGED', 'BLINKING', 'STOPPED']);

      // Even when advancing a huge amount of seconds, it should
      // stay stopped no matter what.
      jest.advanceTimersByTime(10000);

      expect(typewriter.isPlaying).toBe(false);
      expect(typewriter.isBlinking).toBe(true);
      expect(typewriter.hasBeenStoppedBefore).toBe(true);
      expect(typewriter.text).toBe('za');
      assertEvents(subscriber, ['CHANGED', 'BLINKING', 'STOPPED']);

      // Now press play, after 100 milliseconds it should type 'a'
      typewriter.play();

      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.isBlinking).toBe(true);
      expect(typewriter.hasBeenStoppedBefore).toBe(true);
      expect(typewriter.text).toBe('z');
      assertEvents(subscriber, ['CHANGED', 'BLINKING', 'STOPPED', 'PLAYING']);

      // Just before nothing should happen
      jest.advanceTimersByTime(99);

      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.isBlinking).toBe(true);
      expect(typewriter.hasBeenStoppedBefore).toBe(true);
      expect(typewriter.text).toBe('z');
      assertEvents(subscriber, ['CHANGED', 'BLINKING', 'STOPPED', 'PLAYING']);

      // Force it over
      jest.advanceTimersByTime(1);

      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.isBlinking).toBe(false);
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

    test('that it is possible to pause first then stop', () => {
      const typewriter = new Typewriter({
        keystrokes: [
          {
            key: 'a',
            delay: 100,
          },
          {
            key: 'b',
            delay: 100,
          },
          {
            key: 'c',
            delay: 100,
          },
        ],
        blinkAfter: 50,
      });
      const subscriber = autoSubscribe(typewriter);

      // Should be empty initially
      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.isBlinking).toBe(true);
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
          },
          {
            key: 'b',
            delay: 100,
          },
          {
            key: 'c',
            delay: 100,
          },
        ],
        blinkAfter: 50,
      });
      const subscriber = autoSubscribe(typewriter);

      // Should be empty initially
      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.isBlinking).toBe(true);
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
          },
          {
            key: 'b',
            delay: 100,
          },
          {
            key: 'c',
            delay: 100,
          },
        ],
        blinkAfter: 50,
      });
      const subscriber = autoSubscribe(typewriter);

      // Should be empty initially
      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.isBlinking).toBe(true);
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
      expect(typewriter.isBlinking).toBe(true);
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
          },
          {
            key: 'b',
            delay: 100,
          },
          {
            key: 'c',
            delay: 100,
          },
        ],
        blinkAfter: 50,
      });
      const subscriber = autoSubscribe(typewriter);

      // Should be empty initially
      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.isBlinking).toBe(true);
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
          },
          {
            key: 'b',
            delay: 100,
          },
          {
            key: 'c',
            delay: 100,
          },
        ],
        blinkAfter: 50,
      });
      const subscriber = autoSubscribe(typewriter);

      // Should be empty initially
      expect(typewriter.isPlaying).toBe(true);
      expect(typewriter.isBlinking).toBe(true);
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

  // TODO: test history
  // describe('history', () => {
  //   test('that a correct history is kept for all events', () => {
  //     const viewChannel = new ViewChannel<string, string>({
  //       keepHistoryFor: 100,
  //     });

  //     expect(viewChannel.history).toEqual([
  //       expect.objectContaining({
  //         type: 'INITIALIZED',
  //       }),
  //     ]);

  //     viewChannel.present({
  //       data: 'a',
  //     });

  //     expect(viewChannel.history).toEqual([
  //       expect.objectContaining({
  //         type: 'INITIALIZED',
  //       }),
  //       expect.objectContaining({
  //         type: 'PRESENTED',
  //         view: expect.objectContaining({
  //           index: 0,
  //           data: 'a',
  //           isPresented: true,
  //           autoDismiss: {
  //             isPlaying: false,
  //             duration: 0,
  //           },
  //           priority: [0],
  //         }),
  //         index: 0,
  //       }),
  //     ]);

  //     viewChannel.present({
  //       data: 'b',
  //     });

  //     expect(viewChannel.history).toEqual([
  //       expect.objectContaining({
  //         type: 'INITIALIZED',
  //       }),
  //       expect.objectContaining({
  //         type: 'PRESENTED',
  //         view: expect.objectContaining({
  //           index: 0,
  //           data: 'a',
  //           isPresented: true,
  //           autoDismiss: {
  //             isPlaying: false,
  //             duration: 0,
  //           },
  //           priority: [0],
  //         }),
  //         index: 0,
  //       }),
  //       expect.objectContaining({
  //         type: 'PRESENTED',
  //         view: expect.objectContaining({
  //           index: 1,
  //           data: 'b',
  //           isPresented: true,
  //           autoDismiss: {
  //             isPlaying: false,
  //             duration: 0,
  //           },
  //           priority: [0],
  //         }),
  //         index: 1,
  //       }),
  //     ]);

  //     viewChannel.present({
  //       data: 'c',
  //     });

  //     expect(viewChannel.history).toEqual([
  //       expect.objectContaining({
  //         type: 'INITIALIZED',
  //       }),
  //       expect.objectContaining({
  //         type: 'PRESENTED',
  //         view: expect.objectContaining({
  //           index: 0,
  //           data: 'a',
  //           isPresented: true,
  //           autoDismiss: {
  //             isPlaying: false,
  //             duration: 0,
  //           },
  //           priority: [0],
  //         }),
  //         index: 0,
  //       }),
  //       expect.objectContaining({
  //         type: 'PRESENTED',
  //         view: expect.objectContaining({
  //           index: 1,
  //           data: 'b',
  //           isPresented: true,
  //           autoDismiss: {
  //             isPlaying: false,
  //             duration: 0,
  //           },
  //           priority: [0],
  //         }),
  //         index: 1,
  //       }),
  //       expect.objectContaining({
  //         type: 'PRESENTED',
  //         view: expect.objectContaining({
  //           index: 2,
  //           data: 'c',
  //           isPresented: true,
  //           autoDismiss: {
  //             isPlaying: false,
  //             duration: 0,
  //           },
  //           priority: [0],
  //         }),
  //         index: 2,
  //       }),
  //     ]);

  //     viewChannel.dismissByIndex(0, 'SUCCESS');

  //     expect(viewChannel.history).toEqual([
  //       expect.objectContaining({
  //         type: 'INITIALIZED',
  //       }),
  //       expect.objectContaining({
  //         type: 'PRESENTED',
  //         view: expect.objectContaining({
  //           index: 0,
  //           data: 'a',
  //           isPresented: false,
  //           priority: [0],
  //         }),
  //         index: 0,
  //       }),
  //       expect.objectContaining({
  //         type: 'PRESENTED',
  //         view: expect.objectContaining({
  //           index: 0, // Note that b has now become the first index
  //           data: 'b',
  //           isPresented: true,
  //           autoDismiss: {
  //             isPlaying: false,
  //             duration: 0,
  //           },
  //           priority: [0],
  //         }),
  //         index: 1,
  //       }),
  //       expect.objectContaining({
  //         type: 'PRESENTED',
  //         view: expect.objectContaining({
  //           index: 1, // Note that c has now become the second index
  //           data: 'c',
  //           isPresented: true,
  //           autoDismiss: {
  //             isPlaying: false,
  //             duration: 0,
  //           },
  //           priority: [0],
  //         }),
  //         index: 2,
  //       }),
  //       expect.objectContaining({
  //         type: 'DISMISSED',
  //         reason: 'USER_INTERACTION',
  //         view: expect.objectContaining({
  //           index: 0,
  //           data: 'a',
  //           isPresented: false,
  //           priority: [0],
  //         }),
  //         index: 0,
  //       }),
  //     ]);

  //     viewChannel.dismissAll('SUCCESS');

  //     expect(viewChannel.history).toEqual([
  //       expect.objectContaining({
  //         type: 'INITIALIZED',
  //       }),
  //       expect.objectContaining({
  //         type: 'PRESENTED',
  //         view: expect.objectContaining({
  //           index: 0,
  //           data: 'a',
  //           isPresented: false,
  //           priority: [0],
  //         }),
  //         index: 0,
  //       }),
  //       expect.objectContaining({
  //         type: 'PRESENTED',
  //         view: expect.objectContaining({
  //           index: 0,
  //           data: 'b',
  //           isPresented: false,
  //           priority: [0],
  //         }),
  //         index: 1,
  //       }),
  //       expect.objectContaining({
  //         type: 'PRESENTED',
  //         view: expect.objectContaining({
  //           index: 1,
  //           data: 'c',
  //           isPresented: false,
  //           priority: [0],
  //         }),
  //         index: 2,
  //       }),
  //       expect.objectContaining({
  //         type: 'DISMISSED',
  //         reason: 'USER_INTERACTION',
  //         view: expect.objectContaining({
  //           index: 0,
  //           data: 'a',
  //           isPresented: false,
  //           priority: [0],
  //         }),
  //         index: 0,
  //       }),
  //       expect.objectContaining({
  //         type: 'DISMISSED_ALL',
  //         views: [
  //           expect.objectContaining({
  //             index: 0,
  //             data: 'b',
  //             isPresented: false,
  //             priority: [0],
  //           }),
  //           expect.objectContaining({
  //             index: 1, // Note that c has now become the second index
  //             data: 'c',
  //             isPresented: false,
  //             priority: [0],
  //           }),
  //         ],
  //         indexes: [0, 1],
  //       }),
  //     ]);

  //     // Present a view so we can test pause, stop and play
  //     const view = viewChannel.present({
  //       data: 'd',
  //       autoDismiss: {
  //         duration: 1000,
  //         result: 'AUTO',
  //       },
  //     });

  //     expect(viewChannel.history).toEqual([
  //       expect.objectContaining({
  //         type: 'INITIALIZED',
  //       }),
  //       expect.objectContaining({
  //         type: 'PRESENTED',
  //         view: expect.objectContaining({
  //           index: 0,
  //           data: 'a',
  //           isPresented: false,
  //           priority: [0],
  //         }),
  //         index: 0,
  //       }),
  //       expect.objectContaining({
  //         type: 'PRESENTED',
  //         view: expect.objectContaining({
  //           index: 0,
  //           data: 'b',
  //           isPresented: false,
  //           priority: [0],
  //         }),
  //         index: 1,
  //       }),
  //       expect.objectContaining({
  //         type: 'PRESENTED',
  //         view: expect.objectContaining({
  //           index: 1,
  //           data: 'c',
  //           isPresented: false,
  //           priority: [0],
  //         }),
  //         index: 2,
  //       }),
  //       expect.objectContaining({
  //         type: 'DISMISSED',
  //         reason: 'USER_INTERACTION',
  //         view: expect.objectContaining({
  //           index: 0,
  //           data: 'a',
  //           isPresented: false,
  //           priority: [0],
  //         }),
  //         index: 0,
  //       }),
  //       expect.objectContaining({
  //         type: 'DISMISSED_ALL',
  //         views: [
  //           expect.objectContaining({
  //             index: 0,
  //             data: 'b',
  //             isPresented: false,
  //             priority: [0],
  //           }),
  //           expect.objectContaining({
  //             index: 1, // Note that c has now become the second index
  //             data: 'c',
  //             isPresented: false,
  //             priority: [0],
  //           }),
  //         ],
  //         indexes: [0, 1],
  //       }),
  //       expect.objectContaining({
  //         type: 'PRESENTED',
  //         view: expect.objectContaining({
  //           index: 0,
  //           data: 'd',
  //           isPresented: true,
  //           autoDismiss: {
  //             isPlaying: true,
  //             duration: 1000,
  //           },
  //           priority: [0],
  //         }),
  //         index: 0,
  //       }),
  //     ]);

  //     view.pause();

  //     expect(viewChannel.history).toEqual([
  //       expect.objectContaining({
  //         type: 'INITIALIZED',
  //       }),
  //       expect.objectContaining({
  //         type: 'PRESENTED',
  //         view: expect.objectContaining({
  //           index: 0,
  //           data: 'a',
  //           isPresented: false,
  //           priority: [0],
  //         }),
  //         index: 0,
  //       }),
  //       expect.objectContaining({
  //         type: 'PRESENTED',
  //         view: expect.objectContaining({
  //           index: 0,
  //           data: 'b',
  //           isPresented: false,
  //           priority: [0],
  //         }),
  //         index: 1,
  //       }),
  //       expect.objectContaining({
  //         type: 'PRESENTED',
  //         view: expect.objectContaining({
  //           index: 1,
  //           data: 'c',
  //           isPresented: false,
  //           priority: [0],
  //         }),
  //         index: 2,
  //       }),
  //       expect.objectContaining({
  //         type: 'DISMISSED',
  //         reason: 'USER_INTERACTION',
  //         view: expect.objectContaining({
  //           index: 0,
  //           data: 'a',
  //           isPresented: false,
  //           priority: [0],
  //         }),
  //         index: 0,
  //       }),
  //       expect.objectContaining({
  //         type: 'DISMISSED_ALL',
  //         views: [
  //           expect.objectContaining({
  //             index: 0,
  //             data: 'b',
  //             isPresented: false,
  //             priority: [0],
  //           }),
  //           expect.objectContaining({
  //             index: 1, // Note that c has now become the second index
  //             data: 'c',
  //             isPresented: false,
  //             priority: [0],
  //           }),
  //         ],
  //         indexes: [0, 1],
  //       }),
  //       expect.objectContaining({
  //         type: 'PRESENTED',
  //         view: expect.objectContaining({
  //           index: 0,
  //           data: 'd',
  //           isPresented: true,
  //           autoDismiss: {
  //             isPlaying: false,
  //             duration: 1000,
  //           },
  //           priority: [0],
  //         }),
  //         index: 0,
  //       }),
  //       expect.objectContaining({
  //         type: 'AUTO_DISMISS_PAUSED',
  //         view: expect.objectContaining({
  //           index: 0,
  //           data: 'd',
  //           isPresented: true,
  //           autoDismiss: {
  //             isPlaying: false,
  //             duration: 1000,
  //           },
  //           priority: [0],
  //         }),
  //         index: 0,
  //       }),
  //     ]);

  //     view.play();

  //     expect(viewChannel.history).toEqual([
  //       expect.objectContaining({
  //         type: 'INITIALIZED',
  //       }),
  //       expect.objectContaining({
  //         type: 'PRESENTED',
  //         view: expect.objectContaining({
  //           index: 0,
  //           data: 'a',
  //           isPresented: false,
  //           priority: [0],
  //         }),
  //         index: 0,
  //       }),
  //       expect.objectContaining({
  //         type: 'PRESENTED',
  //         view: expect.objectContaining({
  //           index: 0,
  //           data: 'b',
  //           isPresented: false,
  //           priority: [0],
  //         }),
  //         index: 1,
  //       }),
  //       expect.objectContaining({
  //         type: 'PRESENTED',
  //         view: expect.objectContaining({
  //           index: 1,
  //           data: 'c',
  //           isPresented: false,
  //           priority: [0],
  //         }),
  //         index: 2,
  //       }),
  //       expect.objectContaining({
  //         type: 'DISMISSED',
  //         reason: 'USER_INTERACTION',
  //         view: expect.objectContaining({
  //           index: 0,
  //           data: 'a',
  //           isPresented: false,
  //           priority: [0],
  //         }),
  //         index: 0,
  //       }),
  //       expect.objectContaining({
  //         type: 'DISMISSED_ALL',
  //         views: [
  //           expect.objectContaining({
  //             index: 0,
  //             data: 'b',
  //             isPresented: false,
  //             priority: [0],
  //           }),
  //           expect.objectContaining({
  //             index: 1, // Note that c has now become the second index
  //             data: 'c',
  //             isPresented: false,
  //             priority: [0],
  //           }),
  //         ],
  //         indexes: [0, 1],
  //       }),
  //       expect.objectContaining({
  //         type: 'PRESENTED',
  //         view: expect.objectContaining({
  //           index: 0,
  //           data: 'd',
  //           isPresented: true,
  //           autoDismiss: {
  //             isPlaying: true,
  //             duration: 1000,
  //           },
  //           priority: [0],
  //         }),
  //         index: 0,
  //       }),
  //       expect.objectContaining({
  //         type: 'AUTO_DISMISS_PAUSED',
  //         view: expect.objectContaining({
  //           index: 0,
  //           data: 'd',
  //           isPresented: true,
  //           autoDismiss: {
  //             isPlaying: true,
  //             duration: 1000,
  //           },
  //           priority: [0],
  //         }),
  //         index: 0,
  //       }),
  //       expect.objectContaining({
  //         type: 'AUTO_DISMISS_PLAYING',
  //         view: expect.objectContaining({
  //           index: 0,
  //           data: 'd',
  //           isPresented: true,
  //           autoDismiss: {
  //             isPlaying: true,
  //             duration: 1000,
  //           },
  //           priority: [0],
  //         }),
  //         index: 0,
  //       }),
  //     ]);

  //     view.stop();

  //     expect(viewChannel.history).toEqual([
  //       expect.objectContaining({
  //         type: 'INITIALIZED',
  //       }),
  //       expect.objectContaining({
  //         type: 'PRESENTED',
  //         view: expect.objectContaining({
  //           index: 0,
  //           data: 'a',
  //           isPresented: false,
  //           priority: [0],
  //         }),
  //         index: 0,
  //       }),
  //       expect.objectContaining({
  //         type: 'PRESENTED',
  //         view: expect.objectContaining({
  //           index: 0,
  //           data: 'b',
  //           isPresented: false,
  //           priority: [0],
  //         }),
  //         index: 1,
  //       }),
  //       expect.objectContaining({
  //         type: 'PRESENTED',
  //         view: expect.objectContaining({
  //           index: 1,
  //           data: 'c',
  //           isPresented: false,
  //           priority: [0],
  //         }),
  //         index: 2,
  //       }),
  //       expect.objectContaining({
  //         type: 'DISMISSED',
  //         reason: 'USER_INTERACTION',
  //         view: expect.objectContaining({
  //           index: 0,
  //           data: 'a',
  //           isPresented: false,
  //           priority: [0],
  //         }),
  //         index: 0,
  //       }),
  //       expect.objectContaining({
  //         type: 'DISMISSED_ALL',
  //         views: [
  //           expect.objectContaining({
  //             index: 0,
  //             data: 'b',
  //             isPresented: false,
  //             priority: [0],
  //           }),
  //           expect.objectContaining({
  //             index: 1, // Note that c has now become the second index
  //             data: 'c',
  //             isPresented: false,
  //             priority: [0],
  //           }),
  //         ],
  //         indexes: [0, 1],
  //       }),
  //       expect.objectContaining({
  //         type: 'PRESENTED',
  //         view: expect.objectContaining({
  //           index: 0,
  //           data: 'd',
  //           isPresented: true,
  //           autoDismiss: {
  //             isPlaying: false,
  //             duration: 0,
  //           },
  //           priority: [0],
  //         }),
  //         index: 0,
  //       }),
  //       expect.objectContaining({
  //         type: 'AUTO_DISMISS_PAUSED',
  //         view: expect.objectContaining({
  //           index: 0,
  //           data: 'd',
  //           isPresented: true,
  //           autoDismiss: {
  //             isPlaying: false,
  //             duration: 0,
  //           },
  //           priority: [0],
  //         }),
  //         index: 0,
  //       }),
  //       expect.objectContaining({
  //         type: 'AUTO_DISMISS_PLAYING',
  //         view: expect.objectContaining({
  //           index: 0,
  //           data: 'd',
  //           isPresented: true,
  //           autoDismiss: {
  //             isPlaying: false,
  //             duration: 0,
  //           },
  //           priority: [0],
  //         }),
  //         index: 0,
  //       }),
  //       expect.objectContaining({
  //         type: 'AUTO_DISMISS_STOPPED',
  //         view: expect.objectContaining({
  //           index: 0,
  //           data: 'd',
  //           isPresented: true,
  //           autoDismiss: {
  //             isPlaying: false,
  //             duration: 0,
  //           },
  //           priority: [0],
  //         }),
  //         index: 0,
  //       }),
  //     ]);
  //   });

  //   test('that a history is kept for a maximum number of events', () => {
  //     const viewChannel = new ViewChannel<string, string>({
  //       keepHistoryFor: 3,
  //     });

  //     expect(viewChannel.history).toEqual([
  //       expect.objectContaining({
  //         type: 'INITIALIZED',
  //       }),
  //     ]);

  //     viewChannel.present({ data: 'view' });
  //     expect(viewChannel.history).toEqual([
  //       expect.objectContaining({
  //         type: 'INITIALIZED',
  //       }),
  //       expect.objectContaining({ type: 'PRESENTED', index: 0 }),
  //     ]);

  //     viewChannel.present({ data: 'view' });
  //     expect(viewChannel.history).toEqual([
  //       expect.objectContaining({
  //         type: 'INITIALIZED',
  //       }),
  //       expect.objectContaining({ type: 'PRESENTED', index: 0 }),
  //       expect.objectContaining({ type: 'PRESENTED', index: 1 }),
  //     ]);

  //     viewChannel.present({ data: 'view' });
  //     expect(viewChannel.history).toEqual([
  //       expect.objectContaining({ type: 'PRESENTED', index: 0 }),
  //       expect.objectContaining({ type: 'PRESENTED', index: 1 }),
  //       expect.objectContaining({ type: 'PRESENTED', index: 2 }),
  //     ]);
  //   });

  //   test('that initialize resets the history', () => {
  //     const viewChannel = new ViewChannel<string, string>({
  //       keepHistoryFor: 5,
  //     });

  //     expect(viewChannel.history).toEqual([
  //       expect.objectContaining({
  //         type: 'INITIALIZED',
  //       }),
  //     ]);

  //     viewChannel.present({ data: 'view' });

  //     expect(viewChannel.history).toEqual([
  //       expect.objectContaining({
  //         type: 'INITIALIZED',
  //       }),
  //       expect.objectContaining({ type: 'PRESENTED', index: 0 }),
  //     ]);

  //     viewChannel.present({ data: 'view' });
  //     expect(viewChannel.history).toEqual([
  //       expect.objectContaining({
  //         type: 'INITIALIZED',
  //       }),
  //       expect.objectContaining({ type: 'PRESENTED', index: 0 }),
  //       expect.objectContaining({ type: 'PRESENTED', index: 1 }),
  //     ]);

  //     // Now reset the history, note that if `keepHistoryFor` is zero
  //     // the `history` array would be empty
  //     viewChannel.initialize({ keepHistoryFor: 1 });
  //     expect(viewChannel.history).toEqual([
  //       expect.objectContaining({
  //         type: 'INITIALIZED',
  //       }),
  //     ]);
  //   });
  // });

  describe('subscribers', () => {
    test('multiple subscribers', () => {
      const typewriter = new Typewriter({
        keystrokes: [
          {
            key: 'a',
            delay: 10000,
          },
          {
            key: 'b',
            delay: 10000,
          },
          {
            key: 'c',
            delay: 10000,
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

type TestState = Pick<
  Typewriter,
  | 'text'
  | 'history'
  | 'isBlinking'
  | 'blinkAfter'
  | 'isPlaying'
  | 'isFinished'
  | 'hasBeenStoppedBefore'
  | 'keystrokes'
  | 'repeat'
  | 'repeatDelay'
>;

function assertState(state: Typewriter, expected: TestState) {
  const callAsTestState: TestState = {
    history: state.history,
    text: state.text,
    isBlinking: state.isBlinking,
    blinkAfter: state.blinkAfter,
    isPlaying: state.isPlaying,
    isFinished: state.isFinished,
    repeat: state.repeat,
    repeatDelay: state.repeatDelay,
    hasBeenStoppedBefore: state.hasBeenStoppedBefore,
    keystrokes: state.keystrokes.map((keystroke) => {
      const copy: TypewriterKeystroke = {
        key: keystroke.key,
        delay: keystroke.delay,
      };

      return copy;
    }),
  };

  expect(callAsTestState).toEqual(expected);
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
