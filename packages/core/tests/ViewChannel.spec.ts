import {
  expect,
  jest,
  test,
  describe,
  beforeEach,
  afterEach,
} from '@jest/globals';

import {
  ViewChannel,
  ViewChannelView,
  ViewChannelEvent,
  ViewChannelIndexOutOfBoundsError,
  ViewChannelViewNotFoundError,
  ViewChannelAutoDismissDurationError,
  ViewChannelEventType,
  CreateViewChannelSubscriberConfig,
  createViewChannelSubscriber,
} from '../src/ViewChannel';

import { licenseChecker } from '../src/license';

import { UnsubscribeFunction } from '../src/generic/types';

describe('ViewChannel', () => {
  let unsubscribe: UnsubscribeFunction | null = null;

  beforeEach(() => {
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

  function autoSubscribe(viewChannel: ViewChannel<string, string>) {
    const subscriber = jest.fn();
    unsubscribe = viewChannel.subscribe(subscriber);

    return subscriber;
  }

  describe('constructor', () => {
    test('without a config it should be empty', () => {
      const viewChannel: ViewChannel<string, string> = new ViewChannel();

      const subscriber = jest.fn();
      unsubscribe = viewChannel.subscribe(subscriber);

      assertState(viewChannel, {
        history: [],
        views: [],
      });

      expect(subscriber).toHaveBeenCalledTimes(0);
    });

    test('with initial subscriber', () => {
      const subscriber = jest.fn();
      const viewChannel = new ViewChannel<string, string>({}, subscriber);

      unsubscribe = () => {
        viewChannel.unsubscribe(subscriber);
      };

      assertState(viewChannel, {
        history: [],
        views: [],
      });

      expect(subscriber).toHaveBeenCalledTimes(1);
      expect(subscriber).toHaveBeenCalledWith(
        viewChannel,
        expect.objectContaining({
          type: 'INITIALIZED',
        })
      );
    });

    test('without config but with initial subscriber', () => {
      const subscriber = jest.fn();
      const viewChannel = new ViewChannel<string, string>(
        undefined,
        subscriber
      );

      unsubscribe = () => {
        viewChannel.unsubscribe(subscriber);
      };

      assertState(viewChannel, {
        history: [],
        views: [],
      });

      expect(subscriber).toHaveBeenCalledTimes(1);
      expect(subscriber).toHaveBeenCalledWith(
        viewChannel,
        expect.objectContaining({
          type: 'INITIALIZED',
        })
      );
    });
  });

  describe('initialize', () => {
    describe('reset behavior', () => {
      test('that initialize can reset the ViewChannel', () => {
        const viewChannel = new ViewChannel<string, string>();
        const subscriber = autoSubscribe(viewChannel);

        viewChannel.initialize({
          keepHistoryFor: 1,
        });

        expect(subscriber).toBeCalledTimes(1);
        assertLastSubscriber(
          subscriber,
          {
            history: [
              // @ts-expect-error objectContaining works
              expect.objectContaining({
                type: 'INITIALIZED',
              }),
            ],
            views: [],
          },
          {
            type: 'INITIALIZED',
            time: new Date(),
          }
        );
      });
    });
  });

  describe('present', () => {
    test('that without given priorities everything is PRESENTED in order', () => {
      const viewChannel = new ViewChannel<string, string>();
      const subscriber = autoSubscribe(viewChannel);

      // Add 'a' it should go in first.
      expect(
        viewChannel.present({
          data: 'a',
        })
      ).toBeInstanceOf(ViewChannelView);

      expect(subscriber).toBeCalledTimes(1);
      assertLastSubscriber(
        subscriber,
        {
          history: [],
          views: [
            {
              index: 0,
              priority: [0],
              data: 'a',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
          ],
        },
        {
          type: 'PRESENTED',
          index: 0,
          // @ts-expect-error objectContaining works
          view: expect.objectContaining({
            index: 0,
            data: 'a',
            priority: [0],
            isPresented: true,
            autoDismiss: {
              isPlaying: false,
              duration: 0,
            },
          }),
          time: new Date(),
        }
      );

      // Add 'b' it should be appended due to no priority
      expect(
        viewChannel.present({
          data: 'b',
        })
      ).toBeInstanceOf(ViewChannelView);

      expect(subscriber).toBeCalledTimes(2);
      assertLastSubscriber(
        subscriber,
        {
          history: [],
          views: [
            {
              index: 0,
              priority: [0],
              data: 'a',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
            {
              index: 1,
              priority: [0],
              data: 'b',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
          ],
        },
        {
          type: 'PRESENTED',
          index: 1,
          // @ts-expect-error objectContaining works
          view: expect.objectContaining({
            index: 1,
            data: 'b',
            priority: [0],
            isPresented: true,
            autoDismiss: {
              isPlaying: false,
              duration: 0,
            },
          }),
          time: new Date(),
        }
      );

      // Add 'c' it should be appended due to no priority
      expect(
        viewChannel.present({
          data: 'c',
        })
      ).toBeInstanceOf(ViewChannelView);

      expect(subscriber).toBeCalledTimes(3);
      assertLastSubscriber(
        subscriber,
        {
          history: [],
          views: [
            {
              index: 0,
              priority: [0],
              data: 'a',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
            {
              index: 1,
              priority: [0],
              data: 'b',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
            {
              index: 2,
              priority: [0],
              data: 'c',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
          ],
        },
        {
          type: 'PRESENTED',
          index: 2,
          // @ts-expect-error objectContaining works
          view: expect.objectContaining({
            index: 2,
            data: 'c',
            priority: [0],
            isPresented: true,
            autoDismiss: {
              isPlaying: false,
              duration: 0,
            },
          }),
          time: new Date(),
        }
      );
    });

    test('inserting a higher priority view should place it before views with lower priority', () => {
      const viewChannel = new ViewChannel<string, string>();
      const subscriber = autoSubscribe(viewChannel);

      // First insert a at priority 1
      expect(
        viewChannel.present({
          data: 'a',
          priority: [1],
        })
      ).toBeInstanceOf(ViewChannelView);

      expect(subscriber).toBeCalledTimes(1);
      assertLastSubscriber(
        subscriber,
        {
          history: [],
          views: [
            {
              index: 0,
              priority: [1],
              data: 'a',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
          ],
        },
        {
          type: 'PRESENTED',
          index: 0,
          // @ts-expect-error objectContaining works
          view: expect.objectContaining({
            index: 0,
            data: 'a',
            priority: [1],
            isPresented: true,
            autoDismiss: {
              isPlaying: false,
              duration: 0,
            },
          }),
          time: new Date(),
        }
      );

      // Now insert b which move before A due to higher priority
      expect(
        viewChannel.present({
          data: 'b',
          priority: [0],
        })
      ).toBeInstanceOf(ViewChannelView);

      expect(subscriber).toBeCalledTimes(2);
      assertLastSubscriber(
        subscriber,
        {
          history: [],
          views: [
            {
              index: 0,
              priority: [0],
              data: 'b',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
            {
              index: 1,
              priority: [1],
              data: 'a',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
          ],
        },
        {
          type: 'PRESENTED',
          index: 0,
          // @ts-expect-error objectContaining works
          view: expect.objectContaining({
            index: 0,
            data: 'b',
            priority: [0],
            isPresented: true,
            autoDismiss: {
              isPlaying: false,
              duration: 0,
            },
          }),
          time: new Date(),
        }
      );

      // Now insert c which will have the lowest priority at the end
      expect(
        viewChannel.present({
          data: 'c',
          priority: [3],
        })
      ).toBeInstanceOf(ViewChannelView);

      expect(subscriber).toBeCalledTimes(3);
      assertLastSubscriber(
        subscriber,
        {
          history: [],
          views: [
            {
              index: 0,
              priority: [0],
              data: 'b',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
            {
              index: 1,
              priority: [1],
              data: 'a',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
            {
              index: 2,
              priority: [3],
              data: 'c',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
          ],
        },
        {
          type: 'PRESENTED',
          index: 2,
          // @ts-expect-error objectContaining works
          view: expect.objectContaining({
            index: 2,
            data: 'c',
            priority: [3],
            isPresented: true,
            autoDismiss: {
              isPlaying: false,
              duration: 0,
            },
          }),
          time: new Date(),
        }
      );

      // Now insert d which should be put in the middle before c
      expect(
        viewChannel.present({
          data: 'd',
          priority: [2],
        })
      ).toBeInstanceOf(ViewChannelView);

      expect(subscriber).toBeCalledTimes(4);
      assertLastSubscriber(
        subscriber,
        {
          history: [],
          views: [
            {
              index: 0,
              priority: [0],
              data: 'b',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
            {
              index: 1,
              priority: [1],
              data: 'a',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
            {
              index: 2,
              priority: [2],
              data: 'd',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
            {
              index: 3,
              priority: [3],
              data: 'c',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
          ],
        },
        {
          type: 'PRESENTED',
          index: 2,
          // @ts-expect-error objectContaining works
          view: expect.objectContaining({
            index: 2,
            data: 'd',
            priority: [2],
            isPresented: true,
            autoDismiss: {
              isPlaying: false,
              duration: 0,
            },
          }),
          time: new Date(),
        }
      );
    });

    test('inserting at the same priority should place it after all items with the same priority', () => {
      const viewChannel = new ViewChannel<string, string>();
      const subscriber = autoSubscribe(viewChannel);

      // Add 'a' to start
      expect(
        viewChannel.present({
          data: 'a',
          priority: [0],
        })
      ).toBeInstanceOf(ViewChannelView);

      expect(subscriber).toBeCalledTimes(1);
      assertLastSubscriber(
        subscriber,
        {
          history: [],
          views: [
            {
              index: 0,
              priority: [0],
              data: 'a',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
          ],
        },
        {
          type: 'PRESENTED',
          index: 0,
          // @ts-expect-error objectContaining works
          view: expect.objectContaining({
            index: 0,
            data: 'a',
            priority: [0],
            isPresented: true,
            autoDismiss: {
              isPlaying: false,
              duration: 0,
            },
          }),
          time: new Date(),
        }
      );

      // Add 'b' should go after 'a'
      expect(
        viewChannel.present({
          data: 'b',
          priority: [1],
        })
      ).toBeInstanceOf(ViewChannelView);

      expect(subscriber).toBeCalledTimes(2);
      assertLastSubscriber(
        subscriber,
        {
          history: [],
          views: [
            {
              index: 0,
              priority: [0],
              data: 'a',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
            {
              index: 1,
              priority: [1],
              data: 'b',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
          ],
        },
        {
          type: 'PRESENTED',
          index: 1,
          // @ts-expect-error objectContaining works
          view: expect.objectContaining({
            index: 1,
            data: 'b',
            priority: [1],
            isPresented: true,
            autoDismiss: {
              isPlaying: false,
              duration: 0,
            },
          }),
          time: new Date(),
        }
      );

      // Add 'c' should go after 'd' because they have the same priority,
      // so insertion order wins.
      expect(
        viewChannel.present({
          data: 'c',
          priority: [1],
        })
      ).toBeInstanceOf(ViewChannelView);

      expect(subscriber).toBeCalledTimes(3);
      assertLastSubscriber(
        subscriber,
        {
          history: [],
          views: [
            {
              index: 0,
              priority: [0],
              data: 'a',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
            {
              index: 1,
              priority: [1],
              data: 'b',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
            {
              index: 2,
              priority: [1],
              data: 'c',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
          ],
        },
        {
          type: 'PRESENTED',
          index: 2,
          // @ts-expect-error objectContaining works
          view: expect.objectContaining({
            index: 2,
            data: 'c',
            priority: [1],
            isPresented: true,
            autoDismiss: {
              isPlaying: false,
              duration: 0,
            },
          }),
          time: new Date(),
        }
      );

      // Add 'd' should go after 'c' because they have the same priority,
      // so insertion order wins.
      expect(
        viewChannel.present({
          data: 'd',
          priority: [1],
        })
      ).toBeInstanceOf(ViewChannelView);

      expect(subscriber).toBeCalledTimes(4);
      assertLastSubscriber(
        subscriber,
        {
          history: [],
          views: [
            {
              index: 0,
              priority: [0],
              data: 'a',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
            {
              index: 1,
              priority: [1],
              data: 'b',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
            {
              index: 2,
              priority: [1],
              data: 'c',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
            {
              index: 3,
              priority: [1],
              data: 'd',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
          ],
        },
        {
          type: 'PRESENTED',
          index: 3,
          // @ts-expect-error objectContaining works
          view: expect.objectContaining({
            index: 3,
            data: 'd',
            priority: [1],
            isPresented: true,
            autoDismiss: {
              isPlaying: false,
              duration: 0,
            },
          }),
          time: new Date(),
        }
      );

      // Add 'e' should go after 'a' because they have the same priority,
      // so insertion order wins.
      expect(
        viewChannel.present({
          data: 'e',
          priority: [0],
        })
      ).toBeInstanceOf(ViewChannelView);

      expect(subscriber).toBeCalledTimes(5);
      assertLastSubscriber(
        subscriber,
        {
          history: [],
          views: [
            {
              index: 0,
              priority: [0],
              data: 'a',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
            {
              index: 1,
              priority: [0],
              data: 'e',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
            {
              index: 2,
              priority: [1],
              data: 'b',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
            {
              index: 3,
              priority: [1],
              data: 'c',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
            {
              index: 4,
              priority: [1],
              data: 'd',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
          ],
        },
        {
          type: 'PRESENTED',
          index: 1,
          // @ts-expect-error objectContaining works
          view: expect.objectContaining({
            index: 1,
            data: 'e',
            priority: [0],
            isPresented: true,
            autoDismiss: {
              isPlaying: false,
              duration: 0,
            },
          }),
          time: new Date(),
        }
      );
    });

    test('inserting with a priority array (multiple sub priorities) will place the items correctly', () => {
      const viewChannel = new ViewChannel<string, string>();
      const subscriber = autoSubscribe(viewChannel);

      // Insert a at almost top priority
      expect(
        viewChannel.present({
          data: 'a',
          priority: [0, 1, 0],
        })
      ).toBeInstanceOf(ViewChannelView);

      expect(subscriber).toBeCalledTimes(1);
      assertLastSubscriber(
        subscriber,
        {
          history: [],
          views: [
            {
              index: 0,
              priority: [0, 1, 0],
              data: 'a',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
          ],
        },
        {
          type: 'PRESENTED',
          index: 0,
          // @ts-expect-error objectContaining works
          view: expect.objectContaining({
            index: 0,
            data: 'a',
            priority: [0, 1, 0],
            isPresented: true,
            autoDismiss: {
              isPlaying: false,
              duration: 0,
            },
          }),
          time: new Date(),
        }
      );

      // Insert b before a because it has top priority
      expect(
        viewChannel.present({
          data: 'b',
          priority: [0, 0, 0],
        })
      ).toBeInstanceOf(ViewChannelView);

      expect(subscriber).toBeCalledTimes(2);
      assertLastSubscriber(
        subscriber,
        {
          history: [],
          views: [
            {
              index: 0,
              priority: [0, 0, 0],
              data: 'b',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
            {
              index: 1,
              priority: [0, 1, 0],
              data: 'a',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
          ],
        },
        {
          type: 'PRESENTED',
          index: 0,
          // @ts-expect-error objectContaining works
          view: expect.objectContaining({
            index: 0,
            data: 'b',
            priority: [0, 0, 0],
            isPresented: true,
            autoDismiss: {
              isPlaying: false,
              duration: 0,
            },
          }),
          time: new Date(),
        }
      );

      // Insert c after a because it has less priority at the 2nd index
      expect(
        viewChannel.present({
          data: 'c',
          priority: [0, 1, 2],
        })
      ).toBeInstanceOf(ViewChannelView);

      expect(subscriber).toBeCalledTimes(3);
      assertLastSubscriber(
        subscriber,
        {
          history: [],
          views: [
            {
              index: 0,
              priority: [0, 0, 0],
              data: 'b',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
            {
              index: 1,
              priority: [0, 1, 0],
              data: 'a',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
            {
              index: 2,
              priority: [0, 1, 2],
              data: 'c',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
          ],
        },
        {
          type: 'PRESENTED',
          index: 2,
          // @ts-expect-error objectContaining works
          view: expect.objectContaining({
            index: 2,
            data: 'c',
            priority: [0, 1, 2],
            isPresented: true,
            autoDismiss: {
              isPlaying: false,
              duration: 0,
            },
          }),
          time: new Date(),
        }
      );

      // Insert d after a because it has the same priority, so order wins
      expect(
        viewChannel.present({
          data: 'd',
          priority: [0, 1, 0],
        })
      ).toBeInstanceOf(ViewChannelView);

      expect(subscriber).toBeCalledTimes(4);
      assertLastSubscriber(
        subscriber,
        {
          history: [],
          views: [
            {
              index: 0,
              priority: [0, 0, 0],
              data: 'b',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
            {
              index: 1,
              priority: [0, 1, 0],
              data: 'a',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
            {
              index: 2,
              priority: [0, 1, 0],
              data: 'd',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
            {
              index: 3,
              priority: [0, 1, 2],
              data: 'c',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
          ],
        },
        {
          type: 'PRESENTED',
          index: 2,
          // @ts-expect-error objectContaining works
          view: expect.objectContaining({
            index: 2,
            data: 'd',
            priority: [0, 1, 0],
            isPresented: true,
            autoDismiss: {
              isPlaying: false,
              duration: 0,
            },
          }),
          time: new Date(),
        }
      );

      // Insert e between d and c because of the 2nd index.
      expect(
        viewChannel.present({
          data: 'e',
          priority: [0, 1, 1],
        })
      ).toBeInstanceOf(ViewChannelView);

      expect(subscriber).toBeCalledTimes(5);
      assertLastSubscriber(
        subscriber,
        {
          history: [],
          views: [
            {
              index: 0,
              priority: [0, 0, 0],
              data: 'b',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
            {
              index: 1,
              priority: [0, 1, 0],
              data: 'a',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
            {
              index: 2,
              priority: [0, 1, 0],
              data: 'd',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
            {
              index: 3,
              priority: [0, 1, 1],
              data: 'e',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
            {
              index: 4,
              priority: [0, 1, 2],
              data: 'c',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
          ],
        },
        {
          type: 'PRESENTED',
          index: 3,
          // @ts-expect-error objectContaining works
          view: expect.objectContaining({
            index: 3,
            data: 'e',
            priority: [0, 1, 1],
            isPresented: true,
            autoDismiss: {
              isPlaying: false,
              duration: 0,
            },
          }),
          time: new Date(),
        }
      );

      // 'f' should be interpreted as [0, 1, 0] due to the missing
      // 2nd index, should go after 'd'
      expect(
        viewChannel.present({
          data: 'f',
          priority: [0, 1],
        })
      ).toBeInstanceOf(ViewChannelView);

      expect(subscriber).toBeCalledTimes(6);
      assertLastSubscriber(
        subscriber,
        {
          history: [],
          views: [
            {
              index: 0,
              priority: [0, 0, 0],
              data: 'b',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
            {
              index: 1,
              priority: [0, 1, 0],
              data: 'a',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
            {
              index: 2,
              priority: [0, 1, 0],
              data: 'd',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
            {
              index: 3,
              priority: [0, 1],
              data: 'f',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
            {
              index: 4,
              priority: [0, 1, 1],
              data: 'e',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
            {
              index: 5,
              priority: [0, 1, 2],
              data: 'c',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
          ],
        },
        {
          type: 'PRESENTED',
          index: 3,
          // @ts-expect-error objectContaining works
          view: expect.objectContaining({
            index: 3,
            data: 'f',
            priority: [0, 1],
            isPresented: true,
            autoDismiss: {
              isPlaying: false,
              duration: 0,
            },
          }),
          time: new Date(),
        }
      );

      // 'g' should be interpreted as [0, 0, 0] due to it not
      // having any priority, it should then go after b.
      expect(
        viewChannel.present({
          data: 'g',
        })
      ).toBeInstanceOf(ViewChannelView);

      expect(subscriber).toBeCalledTimes(7);
      assertLastSubscriber(
        subscriber,
        {
          history: [],
          views: [
            {
              index: 0,
              priority: [0, 0, 0],
              data: 'b',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
            {
              index: 1,
              priority: [0],
              data: 'g',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
            {
              index: 2,
              priority: [0, 1, 0],
              data: 'a',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
            {
              index: 3,
              priority: [0, 1, 0],
              data: 'd',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
            {
              index: 4,
              priority: [0, 1],
              data: 'f',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
            {
              index: 5,
              priority: [0, 1, 1],
              data: 'e',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
            {
              index: 6,
              priority: [0, 1, 2],
              data: 'c',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
          ],
        },
        {
          type: 'PRESENTED',
          index: 1,
          // @ts-expect-error objectContaining works
          view: expect.objectContaining({
            index: 1,
            data: 'g',
            priority: [0],
            isPresented: true,
            autoDismiss: {
              isPlaying: false,
              duration: 0,
            },
          }),
          time: new Date(),
        }
      );

      // 'h' should be placed after g, but before a
      expect(
        viewChannel.present({
          data: 'h',
          priority: [0, 0, 1],
        })
      ).toBeInstanceOf(ViewChannelView);

      expect(subscriber).toBeCalledTimes(8);
      assertLastSubscriber(
        subscriber,
        {
          history: [],
          views: [
            {
              index: 0,
              priority: [0, 0, 0],
              data: 'b',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
            {
              index: 1,
              priority: [0],
              data: 'g',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
            {
              index: 2,
              priority: [0, 0, 1],
              data: 'h',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
            {
              index: 3,
              priority: [0, 1, 0],
              data: 'a',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
            {
              index: 4,
              priority: [0, 1, 0],
              data: 'd',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
            {
              index: 5,
              priority: [0, 1],
              data: 'f',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
            {
              index: 6,
              priority: [0, 1, 1],
              data: 'e',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
            {
              index: 7,
              priority: [0, 1, 2],
              data: 'c',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
          ],
        },
        {
          type: 'PRESENTED',
          index: 2,
          // @ts-expect-error objectContaining works
          view: expect.objectContaining({
            index: 2,
            data: 'h',
            priority: [0, 0, 1],
            isPresented: true,
            autoDismiss: {
              isPlaying: false,
              duration: 0,
            },
          }),
          time: new Date(),
        }
      );
    });
  });

  describe('dismiss', () => {
    describe('dismissByIndex', () => {
      describe('when it throws out of bounds', () => {
        test('throws out of bounds when index is to large', () => {
          const viewChannel = new ViewChannel<string, string>();
          const subscriber = autoSubscribe(viewChannel);

          expect(() => {
            viewChannel.dismissByIndex(4, 'YUP');
          }).toThrowError(
            `uiloos > ViewChannel > dismissByIndex > "index" is out of bounds`
          );

          expect(() => {
            viewChannel.dismissByIndex(4, 'YUP');
          }).toThrowError(ViewChannelIndexOutOfBoundsError);

          expect(() => {
            viewChannel.dismissByIndex(3, 'YUP');
          }).toThrowError(
            `uiloos > ViewChannel > dismissByIndex > "index" is out of bounds`
          );

          expect(() => {
            viewChannel.dismissByIndex(3, 'YUP');
          }).toThrowError(ViewChannelIndexOutOfBoundsError);

          expect(subscriber).toHaveBeenCalledTimes(0);
        });

        test('throws out of bounds when index is less than zero', () => {
          const viewChannel = new ViewChannel<string, string>();
          const subscriber = autoSubscribe(viewChannel);

          expect(() => {
            viewChannel.dismissByIndex(-1, 'YUP');
          }).toThrowError(
            `uiloos > ViewChannel > dismissByIndex > "index" is out of bounds`
          );

          expect(() => {
            viewChannel.dismissByIndex(-1, 'YUP');
          }).toThrowError(ViewChannelIndexOutOfBoundsError);

          expect(subscriber).toHaveBeenCalledTimes(0);
        });
      });

      test('should remove the content, return the content, resolve the promise with the result, and inform subscribers', async () => {
        const viewChannel = new ViewChannel<string, string>();
        const subscriber = autoSubscribe(viewChannel);

        viewChannel.present({
          data: 'a',
        });

        const view = viewChannel.present({
          data: 'b',
        });

        viewChannel.present({
          data: 'c',
        });

        // remove b
        viewChannel.dismissByIndex(1, 'SUCCESS');

        // Check if the promise is resolved now
        expect(view.result).resolves.toBe('SUCCESS');

        // Three for present, one for dismiss
        expect(subscriber).toBeCalledTimes(4);
        assertLastSubscriber(
          subscriber,
          {
            history: [],
            views: [
              {
                index: 0,
                priority: [0],
                data: 'a',
                isPresented: true,
                autoDismiss: {
                  isPlaying: false,
                  duration: 0,
                },
              },
              {
                index: 1,
                priority: [0],
                data: 'c',
                isPresented: true,
                autoDismiss: {
                  isPlaying: false,
                  duration: 0,
                },
              },
            ],
          },
          {
            type: 'DISMISSED',
            index: 1,
            reason: 'USER_INTERACTION',
            // @ts-expect-error objectContaining works
            view: expect.objectContaining({
              index: 1,
              data: 'b',
              priority: [0],
              isPresented: false,
            }),
            time: new Date(),
          }
        );
      });
    });

    describe('dismiss', () => {
      test('throws out ViewChannelViewNotFoundError when view is not in views array', () => {
        const viewChannel = new ViewChannel<string, string>();
        const subscriber = autoSubscribe(viewChannel);

        const viewFromOtherChannel = new ViewChannelView(
          new ViewChannel<string, string>(),
          0,
          'blaat',
          [0],
          undefined
        );

        expect(() => {
          viewChannel.dismiss(viewFromOtherChannel, 'OK');
        }).toThrowError(
          `uiloos > ViewChannel > dismiss > "ViewChannelView" not found in views array`
        );

        expect(() => {
          viewChannel.dismiss(viewFromOtherChannel, 'OK');
        }).toThrowError(ViewChannelViewNotFoundError);

        // It should not have resulted in any events
        expect(subscriber).toHaveBeenCalledTimes(0);
      });

      test('ignores dismissal when view is no longer presented ', () => {
        const viewChannel = new ViewChannel<string, string>();
        const subscriber = autoSubscribe(viewChannel);

        viewChannel.present({
          data: 'HEYO',
        });
        // One for presented
        expect(subscriber).toHaveBeenCalledTimes(1);

        const viewChannelView = viewChannel.views[0];
        viewChannel.dismiss(viewChannelView, 'OK');
        // One for dismissed
        expect(subscriber).toHaveBeenCalledTimes(2);

        // Now dismiss the view again, it should be ignored.
        viewChannel.dismiss(viewChannelView, 'OK');
        // It should not have resulted in more than 2 events.
        expect(subscriber).toHaveBeenCalledTimes(2);
      });

      test('should remove the content, return the content, resolve the promise with the result, and inform subscribers', () => {
        const viewChannel = new ViewChannel<string, string>();
        const subscriber = autoSubscribe(viewChannel);

        viewChannel.present({
          data: 'a',
        });

        const view = viewChannel.present({
          data: 'b',
        });

        viewChannel.present({
          data: 'c',
        });

        // remove c
        viewChannel.dismiss(viewChannel.views[2], 'SUCCESS');

        // Check if the promise is resolved now
        expect(view.result).resolves.toBe('SUCCESS');

        // Three for present, one for dismiss
        expect(subscriber).toBeCalledTimes(4);
        assertLastSubscriber(
          subscriber,
          {
            history: [],
            views: [
              {
                index: 0,
                priority: [0],
                data: 'a',
                isPresented: true,
                autoDismiss: {
                  isPlaying: false,
                  duration: 0,
                },
              },
              {
                index: 1,
                priority: [0],
                data: 'b',
                isPresented: true,
                autoDismiss: {
                  isPlaying: false,
                  duration: 0,
                },
              },
            ],
          },
          {
            type: 'DISMISSED',
            index: 2,
            reason: 'USER_INTERACTION',
            // @ts-expect-error objectContaining works
            view: expect.objectContaining({
              index: 2,
              data: 'c',
              priority: [0],
              isPresented: false,
            }),
            time: new Date(),
          }
        );
      });
    });

    describe('dismissAll', () => {
      test('nothing happens when there are no views', () => {
        const viewChannel = new ViewChannel<string, string>();
        const subscriber = autoSubscribe(viewChannel);

        viewChannel.dismissAll('SUCCESS');

        expect(subscriber).toBeCalledTimes(0);
      });

      test('removing multiple items works', () => {
        const viewChannel = new ViewChannel<string, string>();
        const subscriber = autoSubscribe(viewChannel);

        // Just for fun we are going to invert the priority so it
        // becomes c, b, a.
        viewChannel.present({ data: 'a', priority: 2 });
        viewChannel.present({ data: 'b', priority: 1 });
        viewChannel.present({ data: 'c', priority: 0 });

        viewChannel.dismissAll('SUCCESS');

        // Three for the present, one for the dismissAll
        expect(subscriber).toBeCalledTimes(4);
        assertLastSubscriber(
          subscriber,
          {
            history: [],
            views: [],
          },
          {
            type: 'DISMISSED_ALL',
            indexes: [0, 1, 2],
            views: [
              // @ts-expect-error objectContaining works
              expect.objectContaining({
                index: 0,
                data: 'c',
                priority: [0],
                isPresented: false,
              }),
              // @ts-expect-error objectContaining works
              expect.objectContaining({
                index: 1,
                data: 'b',
                priority: [1],
                isPresented: false,
              }),
              // @ts-expect-error objectContaining works
              expect.objectContaining({
                index: 2,
                data: 'a',
                priority: [2],
                isPresented: false,
              }),
            ],
            time: new Date(),
          }
        );
      });
    });

    test('dismiss via ViewChannelView', () => {
      const viewChannel = new ViewChannel<string, string>();
      const subscriber = autoSubscribe(viewChannel);

      viewChannel.present({
        data: 'a',
      });

      const view = viewChannel.present({
        data: 'b',
      });

      viewChannel.present({
        data: 'c',
      });

      // remove a
      viewChannel.views[0].dismiss('SUCCESS');

      // Check if the promise is resolved now
      expect(view.result).resolves.toBe('SUCCESS');

      // Three for present, one for dismiss
      expect(subscriber).toBeCalledTimes(4);
      assertLastSubscriber(
        subscriber,
        {
          history: [],
          views: [
            {
              index: 0,
              priority: [0],
              data: 'b',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
            {
              index: 1,
              priority: [0],
              data: 'c',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
          ],
        },
        {
          type: 'DISMISSED',
          index: 0,
          reason: 'USER_INTERACTION',
          // @ts-expect-error objectContaining works
          view: expect.objectContaining({
            index: 0,
            data: 'a',
            priority: [0],
            isPresented: false,
          }),
          time: new Date(),
        }
      );
    });
  });

  describe('autoDismiss', () => {
    describe('duration errors', () => {
      test('cannot be less than zero', () => {
        const viewChannel = new ViewChannel<string, string>();
        const subscriber = autoSubscribe(viewChannel);

        expect(() => {
          viewChannel.present({
            data: 'a',
            autoDismiss: { duration: -1, result: 'TIMEOUT' },
          });
        }).toThrowError(
          'uiloos > ViewChannel > autoDismiss > duration cannot be negative or zero'
        );

        expect(() => {
          viewChannel.present({
            data: 'a',
            autoDismiss: { duration: -1, result: 'TIMEOUT' },
          });
        }).toThrowError(ViewChannelAutoDismissDurationError);

        expect(subscriber).toBeCalledTimes(0);
      });

      test('cannot be zero', () => {
        const viewChannel = new ViewChannel<string, string>();
        const subscriber = autoSubscribe(viewChannel);

        expect(() => {
          viewChannel.present({
            data: 'a',
            autoDismiss: { duration: 0, result: 'TIMEOUT' },
          });
        }).toThrowError(
          'uiloos > ViewChannel > autoDismiss > duration cannot be negative or zero'
        );

        expect(() => {
          viewChannel.present({
            data: 'a',
            autoDismiss: { duration: 0, result: 'TIMEOUT' },
          });
        }).toThrowError(ViewChannelAutoDismissDurationError);

        expect(subscriber).toBeCalledTimes(0);
      });
    });

    test('when autoDismiss is on it will dismiss after duration', () => {
      jest.useFakeTimers();

      const viewChannel = new ViewChannel<string, string>();
      const subscriber = autoSubscribe(viewChannel);

      const view = viewChannel.present({
        data: 'a',
        autoDismiss: {
          duration: 200,
          result: 'TIMEOUT',
        },
      });

      expect(view).toBeInstanceOf(ViewChannelView);
      expect(view.result).toBeInstanceOf(Promise);

      expect(view.isPresented).toBe(true);
      expect(view.autoDismiss).toEqual({ isPlaying: true, duration: 200 });
      assertEvents(subscriber, ['PRESENTED']);

      // After 199 milliseconds nothing should have happened
      jest.advanceTimersByTime(199);

      expect(view.isPresented).toBe(true);
      expect(view.autoDismiss).toEqual({ isPlaying: true, duration: 200 });
      assertEvents(subscriber, ['PRESENTED']);

      // Finally after 200 milliseconds it should have auto dismissed
      jest.advanceTimersByTime(1);

      expect(view.isPresented).toBe(false);
      expect(view.autoDismiss).toEqual({ isPlaying: false, duration: 0 });

      expect(subscriber).toBeCalledTimes(2);
      assertLastSubscriber(
        subscriber,
        {
          history: [],
          views: [],
        },
        {
          type: 'DISMISSED',
          reason: 'AUTO_DISMISS',
          index: 0,
          // @ts-expect-error objectContaining works
          view: expect.objectContaining({
            index: 0,
            data: 'a',
            priority: [0],
            isPresented: false,
          }),
          time: new Date(),
        }
      );

      expect(view.result).resolves.toBe('TIMEOUT');
    });

    test('when autoDismiss is off it will never dismiss automatically', () => {
      jest.useFakeTimers();

      const viewChannel = new ViewChannel<string, string>();
      const subscriber = autoSubscribe(viewChannel);

      const view = viewChannel.present({
        data: 'a',
      });

      expect(view.isPresented).toBe(true);
      expect(view.autoDismiss).toEqual({ isPlaying: false, duration: 0 });
      assertEvents(subscriber, ['PRESENTED']);

      jest.advanceTimersByTime(1000 * 60 * 60 * 24);

      assertEvents(subscriber, ['PRESENTED']);

      expect(view.isPresented).toBe(true);
      expect(view.autoDismiss).toEqual({ isPlaying: false, duration: 0 });
    });

    test('when autoDismiss is on but the user dismisses manually before duration nothing happens', () => {
      jest.useFakeTimers();

      const viewChannel = new ViewChannel<string, string>();
      const subscriber = autoSubscribe(viewChannel);

      const view = viewChannel.present({
        data: 'a',
        autoDismiss: {
          duration: 200,
          result: 'TIMEOUT',
        },
      });

      expect(view.result).toBeInstanceOf(Promise);

      expect(view.isPresented).toBe(true);
      expect(view.autoDismiss).toEqual({ isPlaying: true, duration: 200 });
      assertEvents(subscriber, ['PRESENTED']);

      jest.advanceTimersByTime(100);

      expect(view.isPresented).toBe(true);
      expect(view.autoDismiss).toEqual({ isPlaying: true, duration: 200 });
      assertEvents(subscriber, ['PRESENTED']);

      // Trigger a dismissal by the end user
      viewChannel.dismissByIndex(0, 'SUCCESS');

      expect(view.isPresented).toBe(false);
      expect(view.autoDismiss).toEqual({ isPlaying: false, duration: 0 });

      expect(subscriber).toBeCalledTimes(2);
      assertLastSubscriber(
        subscriber,
        {
          history: [],
          views: [],
        },
        {
          type: 'DISMISSED',
          reason: 'USER_INTERACTION',
          index: 0,
          // @ts-expect-error objectContaining works
          view: expect.objectContaining({
            index: 0,
            data: 'a',
            priority: [0],
            isPresented: false,
          }),
          time: new Date(),
        }
      );

      // Nothing should happen
      jest.advanceTimersByTime(100);

      expect(view.isPresented).toBe(false);
      expect(view.autoDismiss).toEqual({ isPlaying: false, duration: 0 });
      assertEvents(subscriber, ['PRESENTED', 'DISMISSED']);

      expect(view.result).resolves.toBe('SUCCESS');
    });

    test('that the autoDismiss can be paused and continued', () => {
      jest.useFakeTimers();

      const viewChannel = new ViewChannel<string, string>();
      const subscriber = autoSubscribe(viewChannel);

      // Present a playing "a"
      const view = viewChannel.present({
        data: 'a',
        autoDismiss: {
          duration: 1000,
          result: 'TIMEOUT',
        },
      });

      expect(view.isPresented).toBe(true);
      expect(view.autoDismiss).toEqual({ isPlaying: true, duration: 1000 });
      assertEvents(subscriber, ['PRESENTED']);

      // Now pause it at the half way.
      jest.advanceTimersByTime(500);

      expect(view.isPresented).toBe(true);
      expect(view.autoDismiss).toEqual({ isPlaying: true, duration: 1000 });
      assertEvents(subscriber, ['PRESENTED']);

      view.pause();

      expect(view.isPresented).toBe(true);
      expect(view.autoDismiss).toEqual({ isPlaying: false, duration: 1000 });
      assertEvents(subscriber, ['PRESENTED', 'AUTO_DISMISS_PAUSED']);

      // When paused advancing the time should do nothing.
      jest.advanceTimersByTime(500);

      expect(view.isPresented).toBe(true);
      expect(view.autoDismiss).toEqual({ isPlaying: false, duration: 1000 });
      assertEvents(subscriber, ['PRESENTED', 'AUTO_DISMISS_PAUSED']);

      // Even when advancing a huge amount of seconds, it should
      // stay paused no matter what.
      jest.advanceTimersByTime(10000);

      expect(view.isPresented).toBe(true);
      expect(view.autoDismiss).toEqual({ isPlaying: false, duration: 1000 });
      assertEvents(subscriber, ['PRESENTED', 'AUTO_DISMISS_PAUSED']);

      // Now press play, after 500 milliseconds it should have
      // dismissed.
      view.play();

      expect(view.isPresented).toBe(true);
      expect(view.autoDismiss).toEqual({ isPlaying: true, duration: 1000 });
      assertEvents(subscriber, [
        'PRESENTED',
        'AUTO_DISMISS_PAUSED',
        'AUTO_DISMISS_PLAYING',
      ]);

      // After 499 milliseconds should still be visible
      jest.advanceTimersByTime(499);

      expect(view.isPresented).toBe(true);
      expect(view.autoDismiss).toEqual({ isPlaying: true, duration: 1000 });
      assertEvents(subscriber, [
        'PRESENTED',
        'AUTO_DISMISS_PAUSED',
        'AUTO_DISMISS_PLAYING',
      ]);

      // After 500 milliseconds it should have been dismissed
      jest.advanceTimersByTime(1);

      expect(view.isPresented).toBe(false);
      expect(view.autoDismiss).toEqual({ isPlaying: false, duration: 0 });
      assertEvents(subscriber, [
        'PRESENTED',
        'AUTO_DISMISS_PAUSED',
        'AUTO_DISMISS_PLAYING',
        'DISMISSED',
      ]);
    });

    test('that the autoDismiss can be paused and continued multiple times', () => {
      jest.useFakeTimers();

      const viewChannel = new ViewChannel<string, string>();
      const subscriber = autoSubscribe(viewChannel);

      // Present a playing "a"
      const view = viewChannel.present({
        data: 'a',
        autoDismiss: {
          duration: 1000,
          result: 'TIMEOUT',
        },
      });

      expect(view.isPresented).toBe(true);
      expect(view.autoDismiss).toEqual({ isPlaying: true, duration: 1000 });
      assertEvents(subscriber, ['PRESENTED']);

      // Now pause it at the half way.
      jest.advanceTimersByTime(500);

      expect(view.isPresented).toBe(true);
      expect(view.autoDismiss).toEqual({ isPlaying: true, duration: 1000 });
      assertEvents(subscriber, ['PRESENTED']);

      view.pause();

      expect(view.isPresented).toBe(true);
      expect(view.autoDismiss).toEqual({ isPlaying: false, duration: 1000 });
      assertEvents(subscriber, ['PRESENTED', 'AUTO_DISMISS_PAUSED']);

      // Should have no effect
      jest.advanceTimersByTime(10000);

      expect(view.isPresented).toBe(true);
      expect(view.autoDismiss).toEqual({ isPlaying: false, duration: 1000 });
      assertEvents(subscriber, ['PRESENTED', 'AUTO_DISMISS_PAUSED']);

      // Now press play, after 500 milliseconds it should have
      // dismissed.
      view.play();

      expect(view.isPresented).toBe(true);
      expect(view.autoDismiss).toEqual({ isPlaying: true, duration: 1000 });
      assertEvents(subscriber, [
        'PRESENTED',
        'AUTO_DISMISS_PAUSED',
        'AUTO_DISMISS_PLAYING',
      ]);

      // After 250 milliseconds at 3/4 we stop it again
      jest.advanceTimersByTime(250);
      view.pause();

      // Should have no effect
      jest.advanceTimersByTime(10000);

      expect(view.isPresented).toBe(true);
      expect(view.autoDismiss).toEqual({ isPlaying: false, duration: 1000 });
      assertEvents(subscriber, [
        'PRESENTED',
        'AUTO_DISMISS_PAUSED',
        'AUTO_DISMISS_PLAYING',
        'AUTO_DISMISS_PAUSED',
      ]);

      view.play();

      expect(view.isPresented).toBe(true);
      expect(view.autoDismiss).toEqual({ isPlaying: true, duration: 1000 });
      assertEvents(subscriber, [
        'PRESENTED',
        'AUTO_DISMISS_PAUSED',
        'AUTO_DISMISS_PLAYING',
        'AUTO_DISMISS_PAUSED',
        'AUTO_DISMISS_PLAYING',
      ]);

      // Bring it to the edge
      jest.advanceTimersByTime(249);

      expect(view.isPresented).toBe(true);
      expect(view.autoDismiss).toEqual({ isPlaying: true, duration: 1000 });
      assertEvents(subscriber, [
        'PRESENTED',
        'AUTO_DISMISS_PAUSED',
        'AUTO_DISMISS_PLAYING',
        'AUTO_DISMISS_PAUSED',
        'AUTO_DISMISS_PLAYING',
      ]);

      // Now click it over
      jest.advanceTimersByTime(1);

      expect(view.isPresented).toBe(false);
      expect(view.autoDismiss).toEqual({ isPlaying: false, duration: 0 });
      assertEvents(subscriber, [
        'PRESENTED',
        'AUTO_DISMISS_PAUSED',
        'AUTO_DISMISS_PLAYING',
        'AUTO_DISMISS_PAUSED',
        'AUTO_DISMISS_PLAYING',
        'DISMISSED',
      ]);
    });

    test('that the autoplay can be stopped and restarted', () => {
      jest.useFakeTimers();

      const viewChannel = new ViewChannel<string, string>();
      const subscriber = autoSubscribe(viewChannel);

      // Present a playing "a"
      const view = viewChannel.present({
        data: 'a',
        autoDismiss: {
          duration: 1000,
          result: 'TIMEOUT',
        },
      });

      expect(view.isPresented).toBe(true);
      expect(view.autoDismiss).toEqual({ isPlaying: true, duration: 1000 });
      assertEvents(subscriber, ['PRESENTED']);

      view.stop();

      expect(view.isPresented).toBe(true);
      expect(view.autoDismiss).toEqual({ isPlaying: false, duration: 0 });
      assertEvents(subscriber, ['PRESENTED', 'AUTO_DISMISS_STOPPED']);

      // When stopped advancing the time should do nothing.
      jest.advanceTimersByTime(500);

      expect(view.isPresented).toBe(true);
      expect(view.autoDismiss).toEqual({ isPlaying: false, duration: 0 });
      assertEvents(subscriber, ['PRESENTED', 'AUTO_DISMISS_STOPPED']);

      // Even when advancing a huge amount of seconds, it should
      // stay stopped no matter what.
      jest.advanceTimersByTime(10000);

      expect(view.isPresented).toBe(true);
      expect(view.autoDismiss).toEqual({ isPlaying: false, duration: 0 });
      assertEvents(subscriber, ['PRESENTED', 'AUTO_DISMISS_STOPPED']);

      // Now press play, after 1000 milliseconds it should have
      // dismissed. And not after 500 because stop is not pause.
      view.play();

      expect(view.isPresented).toBe(true);
      expect(view.autoDismiss).toEqual({ isPlaying: true, duration: 1000 });
      assertEvents(subscriber, [
        'PRESENTED',
        'AUTO_DISMISS_STOPPED',
        'AUTO_DISMISS_PLAYING',
      ]);

      // After 999 milliseconds should still be visible
      jest.advanceTimersByTime(999);

      expect(view.isPresented).toBe(true);
      expect(view.autoDismiss).toEqual({ isPlaying: true, duration: 1000 });
      assertEvents(subscriber, [
        'PRESENTED',
        'AUTO_DISMISS_STOPPED',
        'AUTO_DISMISS_PLAYING',
      ]);

      // After 1000 milliseconds it should have been dismissed
      jest.advanceTimersByTime(1);

      expect(view.isPresented).toBe(false);
      expect(view.autoDismiss).toEqual({ isPlaying: false, duration: 0 });
      assertEvents(subscriber, [
        'PRESENTED',
        'AUTO_DISMISS_STOPPED',
        'AUTO_DISMISS_PLAYING',
        'DISMISSED',
      ]);
    });

    test('that it is possible to pause first then stop', () => {
      jest.useFakeTimers();

      const viewChannel = new ViewChannel<string, string>();
      const subscriber = autoSubscribe(viewChannel);

      // Present a playing "a"
      const view = viewChannel.present({
        data: 'a',
        autoDismiss: {
          duration: 1000,
          result: 'TIMEOUT',
        },
      });

      expect(view.isPresented).toBe(true);
      expect(view.autoDismiss).toEqual({ isPlaying: true, duration: 1000 });
      assertEvents(subscriber, ['PRESENTED']);

      view.pause();

      expect(view.isPresented).toBe(true);
      expect(view.autoDismiss).toEqual({ isPlaying: false, duration: 1000 });
      assertEvents(subscriber, ['PRESENTED', 'AUTO_DISMISS_PAUSED']);

      // Now press stop it should clear the the pause
      view.stop();

      expect(view.isPresented).toBe(true);
      expect(view.autoDismiss).toEqual({ isPlaying: false, duration: 0 });
      assertEvents(subscriber, [
        'PRESENTED',
        'AUTO_DISMISS_PAUSED',
        'AUTO_DISMISS_STOPPED',
      ]);
    });

    test('that it is not possible to pause when already paused', () => {
      jest.useFakeTimers();

      const viewChannel = new ViewChannel<string, string>();
      const subscriber = autoSubscribe(viewChannel);

      // Present a playing "a"
      const view = viewChannel.present({
        data: 'a',
        autoDismiss: {
          duration: 1000,
          result: 'TIMEOUT',
        },
      });

      expect(view.isPresented).toBe(true);
      expect(view.autoDismiss).toEqual({ isPlaying: true, duration: 1000 });
      assertEvents(subscriber, ['PRESENTED']);

      view.pause();

      expect(view.isPresented).toBe(true);
      expect(view.autoDismiss).toEqual({ isPlaying: false, duration: 1000 });
      assertEvents(subscriber, ['PRESENTED', 'AUTO_DISMISS_PAUSED']);

      // Now advance the timer by a huge margin, and pause again, this
      // second pause should be ignored
      jest.advanceTimersByTime(10000);

      expect(view.isPresented).toBe(true);
      expect(view.autoDismiss).toEqual({ isPlaying: false, duration: 1000 });
      assertEvents(subscriber, ['PRESENTED', 'AUTO_DISMISS_PAUSED']);

      view.pause(); // <--- this pause should be ignored

      expect(view.isPresented).toBe(true);
      expect(view.autoDismiss).toEqual({ isPlaying: false, duration: 1000 });
      assertEvents(subscriber, ['PRESENTED', 'AUTO_DISMISS_PAUSED']);
    });

    test('that it is not possible to pause when never playing', () => {
      jest.useFakeTimers();

      const viewChannel = new ViewChannel<string, string>();
      const subscriber = autoSubscribe(viewChannel);

      // Present a non playing "a"
      const view = viewChannel.present({
        data: 'a',
      });

      expect(view.isPresented).toBe(true);
      expect(view.autoDismiss).toEqual({ isPlaying: false, duration: 0 });
      assertEvents(subscriber, ['PRESENTED']);

      // Should do nothing
      view.pause();

      expect(view.isPresented).toBe(true);
      expect(view.autoDismiss).toEqual({ isPlaying: false, duration: 0 });
      assertEvents(subscriber, ['PRESENTED']);
    });

    test('that it is not possible to stop when already stopped', () => {
      jest.useFakeTimers();

      const viewChannel = new ViewChannel<string, string>();
      const subscriber = autoSubscribe(viewChannel);

      // Present a playing "a"
      const view = viewChannel.present({
        data: 'a',
        autoDismiss: {
          duration: 1000,
          result: 'TIMEOUT',
        },
      });

      expect(view.isPresented).toBe(true);
      expect(view.autoDismiss).toEqual({ isPlaying: true, duration: 1000 });
      assertEvents(subscriber, ['PRESENTED']);

      view.stop();

      expect(view.isPresented).toBe(true);
      expect(view.autoDismiss).toEqual({ isPlaying: false, duration: 0 });
      assertEvents(subscriber, ['PRESENTED', 'AUTO_DISMISS_STOPPED']);

      // Now advance the timer by a huge margin, and stop again, this
      // second stop should be ignored
      jest.advanceTimersByTime(10000);

      expect(view.isPresented).toBe(true);
      expect(view.autoDismiss).toEqual({ isPlaying: false, duration: 0 });
      assertEvents(subscriber, ['PRESENTED', 'AUTO_DISMISS_STOPPED']);

      view.stop(); // <--- this stop should be ignored

      expect(view.isPresented).toBe(true);
      expect(view.autoDismiss).toEqual({ isPlaying: false, duration: 0 });
      assertEvents(subscriber, ['PRESENTED', 'AUTO_DISMISS_STOPPED']);
    });

    test('that it is not possible to stop when never playing', () => {
      jest.useFakeTimers();

      const viewChannel = new ViewChannel<string, string>();
      const subscriber = autoSubscribe(viewChannel);

      // Present a non playing "a"
      const view = viewChannel.present({
        data: 'a',
      });

      expect(view.isPresented).toBe(true);
      expect(view.autoDismiss).toEqual({ isPlaying: false, duration: 0 });
      assertEvents(subscriber, ['PRESENTED']);

      // Should do nothing
      view.stop();

      expect(view.isPresented).toBe(true);
      expect(view.autoDismiss).toEqual({ isPlaying: false, duration: 0 });
      assertEvents(subscriber, ['PRESENTED']);
    });

    test('that it is not possible to play when already playing', () => {
      jest.useFakeTimers();

      const viewChannel = new ViewChannel<string, string>();
      const subscriber = autoSubscribe(viewChannel);

      // Present a playing "a"
      const view = viewChannel.present({
        data: 'a',
        autoDismiss: {
          duration: 1000,
          result: 'TIMEOUT',
        },
      });

      expect(view.isPresented).toBe(true);
      expect(view.autoDismiss).toEqual({ isPlaying: true, duration: 1000 });
      assertEvents(subscriber, ['PRESENTED']);

      view.play(); // <--- this play should be ignored

      expect(view.isPresented).toBe(true);
      expect(view.autoDismiss).toEqual({ isPlaying: true, duration: 1000 });
      assertEvents(subscriber, ['PRESENTED']);
    });
  });

  describe('changeData', () => {
    describe('changeDataByIndex', () => {
      describe('when it throws out of bounds', () => {
        test('throws out of bounds when index is to large', () => {
          const viewChannel = new ViewChannel<string, string>();
          const subscriber = autoSubscribe(viewChannel);

          expect(() => {
            viewChannel.changeDataByIndex(4, 'YUP');
          }).toThrowError(
            `uiloos > ViewChannel > changeDataByIndex > "index" is out of bounds`
          );

          expect(() => {
            viewChannel.changeDataByIndex(4, 'YUP');
          }).toThrowError(ViewChannelIndexOutOfBoundsError);

          expect(() => {
            viewChannel.changeDataByIndex(3, 'YUP');
          }).toThrowError(
            `uiloos > ViewChannel > changeDataByIndex > "index" is out of bounds`
          );

          expect(() => {
            viewChannel.changeDataByIndex(3, 'YUP');
          }).toThrowError(ViewChannelIndexOutOfBoundsError);

          expect(subscriber).toHaveBeenCalledTimes(0);
        });

        test('throws out of bounds when index is less than zero', () => {
          const viewChannel = new ViewChannel<string, string>();
          const subscriber = autoSubscribe(viewChannel);

          expect(() => {
            viewChannel.changeDataByIndex(-1, 'YUP');
          }).toThrowError(
            `uiloos > ViewChannel > changeDataByIndex > "index" is out of bounds`
          );

          expect(() => {
            viewChannel.changeDataByIndex(-1, 'YUP');
          }).toThrowError(ViewChannelIndexOutOfBoundsError);

          expect(subscriber).toHaveBeenCalledTimes(0);
        });
      });

      test('should change the data and inform subscribers', async () => {
        const viewChannel = new ViewChannel<string, string>();
        const subscriber = autoSubscribe(viewChannel);

        viewChannel.present({
          data: 'b',
        });

        viewChannel.changeDataByIndex(0, 'z');

        // One for present, one for changeData
        expect(subscriber).toBeCalledTimes(2);
        assertLastSubscriber(
          subscriber,
          {
            history: [],
            views: [
              {
                index: 0,
                priority: [0],
                data: 'z',
                isPresented: true,
                autoDismiss: {
                  isPlaying: false,
                  duration: 0,
                },
              },
            ],
          },
          {
            type: 'DATA_CHANGED',
            index: 0,
            data: 'z',
            // @ts-expect-error objectContaining works
            view: expect.objectContaining({
              index: 0,
              data: 'z',
              priority: [0],
              isPresented: true,
            }),
            time: new Date(),
          }
        );
      });

      test('should still inform when data stays the same, for primitives', async () => {
        const viewChannel = new ViewChannel<string, string>();
        const subscriber = autoSubscribe(viewChannel);

        viewChannel.present({
          data: 'b',
        });

        viewChannel.changeDataByIndex(0, 'b');

        // One for present, one for changeData
        expect(subscriber).toBeCalledTimes(2);
        assertLastSubscriber(
          subscriber,
          {
            history: [],
            views: [
              {
                index: 0,
                priority: [0],
                data: 'b',
                isPresented: true,
                autoDismiss: {
                  isPlaying: false,
                  duration: 0,
                },
              },
            ],
          },
          {
            type: 'DATA_CHANGED',
            index: 0,
            data: 'b',
            // @ts-expect-error objectContaining works
            view: expect.objectContaining({
              index: 0,
              data: 'b',
              priority: [0],
              isPresented: true,
            }),
            time: new Date(),
          }
        );
      });

      test('should still inform when data stays the same, for objects', async () => {
        const viewChannel = new ViewChannel<{
          name: string,
          age: number;
        }, string>();

        const subscriber = jest.fn();
        unsubscribe = viewChannel.subscribe(subscriber);

        const view = viewChannel.present({
          data: {
            name: 'Maarten',
            age: 34,
          },
        });

        view.data.age = 35;

        
        viewChannel.changeDataByIndex(0, view.data);

        // One for present, one for changeData
        expect(subscriber).toBeCalledTimes(2);
        assertLastSubscriber(
          subscriber,
          {
            history: [],
            views: [
              {
                index: 0,
                priority: [0],
                // @ts-expect-error Allow me to pass in an object
                data: {
                  name: 'Maarten',
                  age: 35,
                },
                isPresented: true,
                autoDismiss: {
                  isPlaying: false,
                  duration: 0,
                },
              },
            ],
          },
          {
            type: 'DATA_CHANGED',
            index: 0,
            data: {
              name: 'Maarten',
              age: 35,
            },
            view: expect.objectContaining({
              index: 0,
              data: {
                name: 'Maarten',
                age: 35,
              },
              priority: [0],
              isPresented: true,
            }),
            time: new Date(),
          }
        );
      });
    });

    describe('changeData', () => {
      test('throws out ViewChannelViewNotFoundError when view is not in views array', () => {
        const viewChannel = new ViewChannel<string, string>();
        const subscriber = autoSubscribe(viewChannel);

        const viewFromOtherChannel = new ViewChannelView(
          new ViewChannel<string, string>(),
          0,
          'blaat',
          [0],
          undefined
        );

        expect(() => {
          viewChannel.changeData(viewFromOtherChannel, 'OK');
        }).toThrowError(
          `uiloos > ViewChannel > changeData > "ViewChannelView" not found in views array`
        );

        expect(() => {
          viewChannel.changeData(viewFromOtherChannel, 'OK');
        }).toThrowError(ViewChannelViewNotFoundError);

        // It should not have resulted in any events
        expect(subscriber).toHaveBeenCalledTimes(0);
      });

      test('throws out ViewChannelViewNotFoundError when view is no longer in views array', () => {
        const viewChannel = new ViewChannel<string, string>();
        const subscriber = autoSubscribe(viewChannel);

        viewChannel.present({
          data: 'HEYO',
        });
        // One for presented
        expect(subscriber).toHaveBeenCalledTimes(1);

        const viewChannelView = viewChannel.views[0];
        viewChannel.dismiss(viewChannelView, 'OK');
        // One for dismissed
        expect(subscriber).toHaveBeenCalledTimes(2);

        // Now changeData it should throw an error
        expect(() => {
          viewChannel.changeData(viewChannelView, 'OK');
        }).toThrowError(ViewChannelViewNotFoundError);

        // It should not have resulted in more than 2 events.
        expect(subscriber).toHaveBeenCalledTimes(2);
      });

      test('should change the data and inform subscribers', async () => {
        const viewChannel = new ViewChannel<string, string>();
        const subscriber = autoSubscribe(viewChannel);

        const view = viewChannel.present({
          data: 'b',
        });

        viewChannel.changeData(view, 'z');

        // One for present, one for changeData
        expect(subscriber).toBeCalledTimes(2);
        assertLastSubscriber(
          subscriber,
          {
            history: [],
            views: [
              {
                index: 0,
                priority: [0],
                data: 'z',
                isPresented: true,
                autoDismiss: {
                  isPlaying: false,
                  duration: 0,
                },
              },
            ],
          },
          {
            type: 'DATA_CHANGED',
            index: 0,
            data: 'z',
            // @ts-expect-error objectContaining works
            view: expect.objectContaining({
              index: 0,
              data: 'z',
              priority: [0],
              isPresented: true,
            }),
            time: new Date(),
          }
        );
      });
    });

    test('changeData via ViewChannelView', async () => {
      const viewChannel = new ViewChannel<string, string>();
      const subscriber = autoSubscribe(viewChannel);

      const view = viewChannel.present({
        data: 'b',
      });

      view.changeData('z');

      // One for present, one for changeData
      expect(subscriber).toBeCalledTimes(2);
      assertLastSubscriber(
        subscriber,
        {
          history: [],
          views: [
            {
              index: 0,
              priority: [0],
              data: 'z',
              isPresented: true,
              autoDismiss: {
                isPlaying: false,
                duration: 0,
              },
            },
          ],
        },
        {
          type: 'DATA_CHANGED',
          index: 0,
          data: 'z',
          // @ts-expect-error objectContaining works
          view: expect.objectContaining({
            index: 0,
            data: 'z',
            priority: [0],
            isPresented: true,
          }),
          time: new Date(),
        }
      );
    });
  });

  // These test should pass TypeScript checking
  describe('generics', () => {
    describe('T', () => {
      test('when T is an object it should require the data function to return that object', () => {
        const viewChannel = new ViewChannel<{
          text: string;
          icon: 'check' | 'cross';
        }>();
        viewChannel.present({
          data: {
            text: 'Pokemon removed',
            icon: 'check',
          },
        });

        viewChannel.present({
          // @ts-expect-error This is a typecheck undefined should keep failings
          data: undefined,
        });
      });

      test('when T not an object but a primitive it should work', () => {
        const viewChannel = new ViewChannel<number>();
        viewChannel.present({
          data: 42,
        });

        viewChannel.present({
          // @ts-expect-error This is a typecheck undefined should keep failing
          data: undefined,
        });
      });

      test('when T is not defined all should work', () => {
        const viewChannel = new ViewChannel();
        viewChannel.present({
          data: 42,
        });

        viewChannel.present({
          data: {
            text: 'Pokemon removed',
            icon: 'check',
          },
        });

        viewChannel.present({
          data: () => ({
            text: 'Pokemon removed',
            icon: 'check',
          }),
        });
      });
    });

    describe('R', () => {
      test('when R is defined it is required on dismissal', () => {
        const viewChannel = new ViewChannel<string, 'YES' | 'NO' | 'CANCEL'>();
        viewChannel.present({
          data: "Are you sure you want to remove boat named: 'tugger'",
        });
        // Test that a reason is needed.
        viewChannel.dismissByIndex(0, 'CANCEL');
      });

      test('when R is not defined it is not required on dismissal', () => {
        const viewChannel = new ViewChannel<string>();
        viewChannel.present({
          data: "Are you sure you want to remove boat named: 'tugger'",
        });
        // Test that a reason is needed.
        viewChannel.dismissByIndex(0);
      });

      test('when R is set explicitly to void it does not require a reason', () => {
        const viewChannel = new ViewChannel<string, void>();
        viewChannel.present({
          data: "Are you sure you want to remove boat named: 'tugger'",
        });
        // Test that a reason is needed.
        viewChannel.dismissByIndex(0);
      });
    });
  });

  describe('history', () => {
    test('that a correct history is kept for all events', () => {
      const viewChannel = new ViewChannel<string, string>({
        keepHistoryFor: 100,
      });

      expect(viewChannel.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
        }),
      ]);

      viewChannel.present({
        data: 'a',
      });

      expect(viewChannel.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
        }),
        expect.objectContaining({
          type: 'PRESENTED',
          view: expect.objectContaining({
            index: 0,
            data: 'a',
            isPresented: true,
            autoDismiss: {
              isPlaying: false,
              duration: 0,
            },
            priority: [0],
          }),
          index: 0,
        }),
      ]);

      viewChannel.present({
        data: 'b',
      });

      expect(viewChannel.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
        }),
        expect.objectContaining({
          type: 'PRESENTED',
          view: expect.objectContaining({
            index: 0,
            data: 'a',
            isPresented: true,
            autoDismiss: {
              isPlaying: false,
              duration: 0,
            },
            priority: [0],
          }),
          index: 0,
        }),
        expect.objectContaining({
          type: 'PRESENTED',
          view: expect.objectContaining({
            index: 1,
            data: 'b',
            isPresented: true,
            autoDismiss: {
              isPlaying: false,
              duration: 0,
            },
            priority: [0],
          }),
          index: 1,
        }),
      ]);

      viewChannel.present({
        data: 'c',
      });

      expect(viewChannel.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
        }),
        expect.objectContaining({
          type: 'PRESENTED',
          view: expect.objectContaining({
            index: 0,
            data: 'a',
            isPresented: true,
            autoDismiss: {
              isPlaying: false,
              duration: 0,
            },
            priority: [0],
          }),
          index: 0,
        }),
        expect.objectContaining({
          type: 'PRESENTED',
          view: expect.objectContaining({
            index: 1,
            data: 'b',
            isPresented: true,
            autoDismiss: {
              isPlaying: false,
              duration: 0,
            },
            priority: [0],
          }),
          index: 1,
        }),
        expect.objectContaining({
          type: 'PRESENTED',
          view: expect.objectContaining({
            index: 2,
            data: 'c',
            isPresented: true,
            autoDismiss: {
              isPlaying: false,
              duration: 0,
            },
            priority: [0],
          }),
          index: 2,
        }),
      ]);

      viewChannel.dismissByIndex(0, 'SUCCESS');

      expect(viewChannel.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
        }),
        expect.objectContaining({
          type: 'PRESENTED',
          view: expect.objectContaining({
            index: 0,
            data: 'a',
            isPresented: false,
            priority: [0],
          }),
          index: 0,
        }),
        expect.objectContaining({
          type: 'PRESENTED',
          view: expect.objectContaining({
            index: 0, // Note that b has now become the first index
            data: 'b',
            isPresented: true,
            autoDismiss: {
              isPlaying: false,
              duration: 0,
            },
            priority: [0],
          }),
          index: 1,
        }),
        expect.objectContaining({
          type: 'PRESENTED',
          view: expect.objectContaining({
            index: 1, // Note that c has now become the second index
            data: 'c',
            isPresented: true,
            autoDismiss: {
              isPlaying: false,
              duration: 0,
            },
            priority: [0],
          }),
          index: 2,
        }),
        expect.objectContaining({
          type: 'DISMISSED',
          reason: 'USER_INTERACTION',
          view: expect.objectContaining({
            index: 0,
            data: 'a',
            isPresented: false,
            priority: [0],
          }),
          index: 0,
        }),
      ]);

      viewChannel.dismissAll('SUCCESS');

      expect(viewChannel.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
        }),
        expect.objectContaining({
          type: 'PRESENTED',
          view: expect.objectContaining({
            index: 0,
            data: 'a',
            isPresented: false,
            priority: [0],
          }),
          index: 0,
        }),
        expect.objectContaining({
          type: 'PRESENTED',
          view: expect.objectContaining({
            index: 0,
            data: 'b',
            isPresented: false,
            priority: [0],
          }),
          index: 1,
        }),
        expect.objectContaining({
          type: 'PRESENTED',
          view: expect.objectContaining({
            index: 1,
            data: 'c',
            isPresented: false,
            priority: [0],
          }),
          index: 2,
        }),
        expect.objectContaining({
          type: 'DISMISSED',
          reason: 'USER_INTERACTION',
          view: expect.objectContaining({
            index: 0,
            data: 'a',
            isPresented: false,
            priority: [0],
          }),
          index: 0,
        }),
        expect.objectContaining({
          type: 'DISMISSED_ALL',
          views: [
            expect.objectContaining({
              index: 0,
              data: 'b',
              isPresented: false,
              priority: [0],
            }),
            expect.objectContaining({
              index: 1, // Note that c has now become the second index
              data: 'c',
              isPresented: false,
              priority: [0],
            }),
          ],
          indexes: [0, 1],
        }),
      ]);

      // Present a view so we can test pause, stop and play
      const view = viewChannel.present({
        data: 'd',
        autoDismiss: {
          duration: 1000,
          result: 'AUTO',
        },
      });

      expect(viewChannel.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
        }),
        expect.objectContaining({
          type: 'PRESENTED',
          view: expect.objectContaining({
            index: 0,
            data: 'a',
            isPresented: false,
            priority: [0],
          }),
          index: 0,
        }),
        expect.objectContaining({
          type: 'PRESENTED',
          view: expect.objectContaining({
            index: 0,
            data: 'b',
            isPresented: false,
            priority: [0],
          }),
          index: 1,
        }),
        expect.objectContaining({
          type: 'PRESENTED',
          view: expect.objectContaining({
            index: 1,
            data: 'c',
            isPresented: false,
            priority: [0],
          }),
          index: 2,
        }),
        expect.objectContaining({
          type: 'DISMISSED',
          reason: 'USER_INTERACTION',
          view: expect.objectContaining({
            index: 0,
            data: 'a',
            isPresented: false,
            priority: [0],
          }),
          index: 0,
        }),
        expect.objectContaining({
          type: 'DISMISSED_ALL',
          views: [
            expect.objectContaining({
              index: 0,
              data: 'b',
              isPresented: false,
              priority: [0],
            }),
            expect.objectContaining({
              index: 1, // Note that c has now become the second index
              data: 'c',
              isPresented: false,
              priority: [0],
            }),
          ],
          indexes: [0, 1],
        }),
        expect.objectContaining({
          type: 'PRESENTED',
          view: expect.objectContaining({
            index: 0,
            data: 'd',
            isPresented: true,
            autoDismiss: {
              isPlaying: true,
              duration: 1000,
            },
            priority: [0],
          }),
          index: 0,
        }),
      ]);

      view.pause();

      expect(viewChannel.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
        }),
        expect.objectContaining({
          type: 'PRESENTED',
          view: expect.objectContaining({
            index: 0,
            data: 'a',
            isPresented: false,
            priority: [0],
          }),
          index: 0,
        }),
        expect.objectContaining({
          type: 'PRESENTED',
          view: expect.objectContaining({
            index: 0,
            data: 'b',
            isPresented: false,
            priority: [0],
          }),
          index: 1,
        }),
        expect.objectContaining({
          type: 'PRESENTED',
          view: expect.objectContaining({
            index: 1,
            data: 'c',
            isPresented: false,
            priority: [0],
          }),
          index: 2,
        }),
        expect.objectContaining({
          type: 'DISMISSED',
          reason: 'USER_INTERACTION',
          view: expect.objectContaining({
            index: 0,
            data: 'a',
            isPresented: false,
            priority: [0],
          }),
          index: 0,
        }),
        expect.objectContaining({
          type: 'DISMISSED_ALL',
          views: [
            expect.objectContaining({
              index: 0,
              data: 'b',
              isPresented: false,
              priority: [0],
            }),
            expect.objectContaining({
              index: 1, // Note that c has now become the second index
              data: 'c',
              isPresented: false,
              priority: [0],
            }),
          ],
          indexes: [0, 1],
        }),
        expect.objectContaining({
          type: 'PRESENTED',
          view: expect.objectContaining({
            index: 0,
            data: 'd',
            isPresented: true,
            autoDismiss: {
              isPlaying: false,
              duration: 1000,
            },
            priority: [0],
          }),
          index: 0,
        }),
        expect.objectContaining({
          type: 'AUTO_DISMISS_PAUSED',
          view: expect.objectContaining({
            index: 0,
            data: 'd',
            isPresented: true,
            autoDismiss: {
              isPlaying: false,
              duration: 1000,
            },
            priority: [0],
          }),
          index: 0,
        }),
      ]);

      view.play();

      expect(viewChannel.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
        }),
        expect.objectContaining({
          type: 'PRESENTED',
          view: expect.objectContaining({
            index: 0,
            data: 'a',
            isPresented: false,
            priority: [0],
          }),
          index: 0,
        }),
        expect.objectContaining({
          type: 'PRESENTED',
          view: expect.objectContaining({
            index: 0,
            data: 'b',
            isPresented: false,
            priority: [0],
          }),
          index: 1,
        }),
        expect.objectContaining({
          type: 'PRESENTED',
          view: expect.objectContaining({
            index: 1,
            data: 'c',
            isPresented: false,
            priority: [0],
          }),
          index: 2,
        }),
        expect.objectContaining({
          type: 'DISMISSED',
          reason: 'USER_INTERACTION',
          view: expect.objectContaining({
            index: 0,
            data: 'a',
            isPresented: false,
            priority: [0],
          }),
          index: 0,
        }),
        expect.objectContaining({
          type: 'DISMISSED_ALL',
          views: [
            expect.objectContaining({
              index: 0,
              data: 'b',
              isPresented: false,
              priority: [0],
            }),
            expect.objectContaining({
              index: 1, // Note that c has now become the second index
              data: 'c',
              isPresented: false,
              priority: [0],
            }),
          ],
          indexes: [0, 1],
        }),
        expect.objectContaining({
          type: 'PRESENTED',
          view: expect.objectContaining({
            index: 0,
            data: 'd',
            isPresented: true,
            autoDismiss: {
              isPlaying: true,
              duration: 1000,
            },
            priority: [0],
          }),
          index: 0,
        }),
        expect.objectContaining({
          type: 'AUTO_DISMISS_PAUSED',
          view: expect.objectContaining({
            index: 0,
            data: 'd',
            isPresented: true,
            autoDismiss: {
              isPlaying: true,
              duration: 1000,
            },
            priority: [0],
          }),
          index: 0,
        }),
        expect.objectContaining({
          type: 'AUTO_DISMISS_PLAYING',
          view: expect.objectContaining({
            index: 0,
            data: 'd',
            isPresented: true,
            autoDismiss: {
              isPlaying: true,
              duration: 1000,
            },
            priority: [0],
          }),
          index: 0,
        }),
      ]);

      view.stop();

      expect(viewChannel.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
        }),
        expect.objectContaining({
          type: 'PRESENTED',
          view: expect.objectContaining({
            index: 0,
            data: 'a',
            isPresented: false,
            priority: [0],
          }),
          index: 0,
        }),
        expect.objectContaining({
          type: 'PRESENTED',
          view: expect.objectContaining({
            index: 0,
            data: 'b',
            isPresented: false,
            priority: [0],
          }),
          index: 1,
        }),
        expect.objectContaining({
          type: 'PRESENTED',
          view: expect.objectContaining({
            index: 1,
            data: 'c',
            isPresented: false,
            priority: [0],
          }),
          index: 2,
        }),
        expect.objectContaining({
          type: 'DISMISSED',
          reason: 'USER_INTERACTION',
          view: expect.objectContaining({
            index: 0,
            data: 'a',
            isPresented: false,
            priority: [0],
          }),
          index: 0,
        }),
        expect.objectContaining({
          type: 'DISMISSED_ALL',
          views: [
            expect.objectContaining({
              index: 0,
              data: 'b',
              isPresented: false,
              priority: [0],
            }),
            expect.objectContaining({
              index: 1, // Note that c has now become the second index
              data: 'c',
              isPresented: false,
              priority: [0],
            }),
          ],
          indexes: [0, 1],
        }),
        expect.objectContaining({
          type: 'PRESENTED',
          view: expect.objectContaining({
            index: 0,
            data: 'd',
            isPresented: true,
            autoDismiss: {
              isPlaying: false,
              duration: 0,
            },
            priority: [0],
          }),
          index: 0,
        }),
        expect.objectContaining({
          type: 'AUTO_DISMISS_PAUSED',
          view: expect.objectContaining({
            index: 0,
            data: 'd',
            isPresented: true,
            autoDismiss: {
              isPlaying: false,
              duration: 0,
            },
            priority: [0],
          }),
          index: 0,
        }),
        expect.objectContaining({
          type: 'AUTO_DISMISS_PLAYING',
          view: expect.objectContaining({
            index: 0,
            data: 'd',
            isPresented: true,
            autoDismiss: {
              isPlaying: false,
              duration: 0,
            },
            priority: [0],
          }),
          index: 0,
        }),
        expect.objectContaining({
          type: 'AUTO_DISMISS_STOPPED',
          view: expect.objectContaining({
            index: 0,
            data: 'd',
            isPresented: true,
            autoDismiss: {
              isPlaying: false,
              duration: 0,
            },
            priority: [0],
          }),
          index: 0,
        }),
      ]);

      view.changeData('z');

      expect(viewChannel.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
        }),
        expect.objectContaining({
          type: 'PRESENTED',
          view: expect.objectContaining({
            index: 0,
            data: 'a',
            isPresented: false,
            priority: [0],
          }),
          index: 0,
        }),
        expect.objectContaining({
          type: 'PRESENTED',
          view: expect.objectContaining({
            index: 0,
            data: 'b',
            isPresented: false,
            priority: [0],
          }),
          index: 1,
        }),
        expect.objectContaining({
          type: 'PRESENTED',
          view: expect.objectContaining({
            index: 1,
            data: 'c',
            isPresented: false,
            priority: [0],
          }),
          index: 2,
        }),
        expect.objectContaining({
          type: 'DISMISSED',
          reason: 'USER_INTERACTION',
          view: expect.objectContaining({
            index: 0,
            data: 'a',
            isPresented: false,
            priority: [0],
          }),
          index: 0,
        }),
        expect.objectContaining({
          type: 'DISMISSED_ALL',
          views: [
            expect.objectContaining({
              index: 0,
              data: 'b',
              isPresented: false,
              priority: [0],
            }),
            expect.objectContaining({
              index: 1, // Note that c has now become the second index
              data: 'c',
              isPresented: false,
              priority: [0],
            }),
          ],
          indexes: [0, 1],
        }),
        expect.objectContaining({
          type: 'PRESENTED',
          view: expect.objectContaining({
            index: 0,
            data: 'z',
            isPresented: true,
            autoDismiss: {
              isPlaying: false,
              duration: 0,
            },
            priority: [0],
          }),
          index: 0,
        }),
        expect.objectContaining({
          type: 'AUTO_DISMISS_PAUSED',
          view: expect.objectContaining({
            index: 0,
            data: 'z',
            isPresented: true,
            autoDismiss: {
              isPlaying: false,
              duration: 0,
            },
            priority: [0],
          }),
          index: 0,
        }),
        expect.objectContaining({
          type: 'AUTO_DISMISS_PLAYING',
          view: expect.objectContaining({
            index: 0,
            data: 'z',
            isPresented: true,
            autoDismiss: {
              isPlaying: false,
              duration: 0,
            },
            priority: [0],
          }),
          index: 0,
        }),
        expect.objectContaining({
          type: 'AUTO_DISMISS_STOPPED',
          view: expect.objectContaining({
            index: 0,
            data: 'z',
            isPresented: true,
            autoDismiss: {
              isPlaying: false,
              duration: 0,
            },
            priority: [0],
          }),
          index: 0,
        }),
        expect.objectContaining({
          type: 'DATA_CHANGED',
          view: expect.objectContaining({
            index: 0,
            data: 'z',
            isPresented: true,
            autoDismiss: {
              isPlaying: false,
              duration: 0,
            },
            priority: [0],
          }),
          index: 0,
          data: 'z',
        }),
      ]);
    });

    test('that a history is kept for a maximum number of events', () => {
      const viewChannel = new ViewChannel<string, string>({
        keepHistoryFor: 3,
      });

      expect(viewChannel.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
        }),
      ]);

      viewChannel.present({ data: 'view' });
      expect(viewChannel.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
        }),
        expect.objectContaining({ type: 'PRESENTED', index: 0 }),
      ]);

      viewChannel.present({ data: 'view' });
      expect(viewChannel.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
        }),
        expect.objectContaining({ type: 'PRESENTED', index: 0 }),
        expect.objectContaining({ type: 'PRESENTED', index: 1 }),
      ]);

      viewChannel.present({ data: 'view' });
      expect(viewChannel.history).toEqual([
        expect.objectContaining({ type: 'PRESENTED', index: 0 }),
        expect.objectContaining({ type: 'PRESENTED', index: 1 }),
        expect.objectContaining({ type: 'PRESENTED', index: 2 }),
      ]);
    });

    test('that initialize resets the history', () => {
      const viewChannel = new ViewChannel<string, string>({
        keepHistoryFor: 5,
      });

      expect(viewChannel.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
        }),
      ]);

      viewChannel.present({ data: 'view' });

      expect(viewChannel.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
        }),
        expect.objectContaining({ type: 'PRESENTED', index: 0 }),
      ]);

      viewChannel.present({ data: 'view' });
      expect(viewChannel.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
        }),
        expect.objectContaining({ type: 'PRESENTED', index: 0 }),
        expect.objectContaining({ type: 'PRESENTED', index: 1 }),
      ]);

      // Now reset the history, note that if `keepHistoryFor` is zero
      // the `history` array would be empty
      viewChannel.initialize({ keepHistoryFor: 1 });
      expect(viewChannel.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
        }),
      ]);
    });
  });

  describe('subscribers', () => {
    test('multiple subscribers', () => {
      const viewChannel = new ViewChannel<string, string>();
      const subscriber = autoSubscribe(viewChannel);

      const secondSubscriber = jest.fn();
      const removeSecondSubscriber = viewChannel.subscribe(secondSubscriber);

      const thirdSubscriber = jest.fn();
      viewChannel.subscribe(thirdSubscriber);

      viewChannel.present({
        data: 'view',
      });

      expect(subscriber).toHaveBeenCalledTimes(1);
      expect(secondSubscriber).toHaveBeenCalledTimes(1);
      expect(thirdSubscriber).toHaveBeenCalledTimes(1);

      removeSecondSubscriber();

      viewChannel.present({
        data: 'view',
      });

      expect(subscriber).toHaveBeenCalledTimes(2);
      expect(secondSubscriber).toHaveBeenCalledTimes(1);
      expect(thirdSubscriber).toHaveBeenCalledTimes(2);

      viewChannel.unsubscribe(thirdSubscriber);

      viewChannel.present({
        data: 'view',
      });

      expect(subscriber).toHaveBeenCalledTimes(3);
      expect(secondSubscriber).toHaveBeenCalledTimes(1);
      expect(thirdSubscriber).toHaveBeenCalledTimes(2);
    });

    test('unsubscribeAll', () => {
      const viewChannel = new ViewChannel<string, string>();
      const subscriber = autoSubscribe(viewChannel);

      const secondSubscriber = jest.fn();
      viewChannel.subscribe(secondSubscriber);

      const thirdSubscriber = jest.fn();
      viewChannel.subscribe(thirdSubscriber);

      // All three should be informed of this
      viewChannel.present({
        data: 'view',
      });

      expect(subscriber).toHaveBeenCalledTimes(1);
      expect(secondSubscriber).toHaveBeenCalledTimes(1);
      expect(thirdSubscriber).toHaveBeenCalledTimes(1);

      viewChannel.unsubscribeAll();

      // no one should be informed after the unsubscribe all
      viewChannel.present({
        data: 'view',
      });

      expect(subscriber).toHaveBeenCalledTimes(1);
      expect(secondSubscriber).toHaveBeenCalledTimes(1);
      expect(thirdSubscriber).toHaveBeenCalledTimes(1);

      // Test if a new subscriber can still be added after the clear.
      const newSubscriber = jest.fn();
      viewChannel.subscribe(newSubscriber);

      // Only new one should be informed
      viewChannel.present({
        data: 'view',
      });

      // New one should be informed
      expect(newSubscriber).toHaveBeenCalledTimes(1);

      // Still not informed
      expect(subscriber).toHaveBeenCalledTimes(1);
      expect(secondSubscriber).toHaveBeenCalledTimes(1);
      expect(thirdSubscriber).toHaveBeenCalledTimes(1);
    });
  });

  describe('createViewChannelSubscriber', () => {
    test('that all methods are called correctly', () => {
      jest.useFakeTimers();

      const config: CreateViewChannelSubscriberConfig<string, string> = {
        onInitialized: jest.fn(),
        onPresented: jest.fn(),
        onDismissed: jest.fn(),
        onDismissedAll: jest.fn(),
        onAutoDismissPlaying: jest.fn(),
        onAutoDismissPaused: jest.fn(),
        onAutoDismissStopped: jest.fn(),
        onDataChanged: jest.fn(),
      };

      const subscriber = createViewChannelSubscriber<string, string>(config);

      const viewChannel = new ViewChannel<string, string>({}, subscriber);

      expect(config.onInitialized).toBeCalledTimes(1);
      expect(config.onInitialized).lastCalledWith(
        expect.objectContaining({
          type: 'INITIALIZED',
        }),
        viewChannel
      );

      const eggs = viewChannel.present({
        data: 'eggs',
      });

      expect(config.onPresented).toBeCalledTimes(1);
      expect(config.onPresented).lastCalledWith(
        expect.objectContaining({
          type: 'PRESENTED',
          view: eggs,
          index: 0,
        }),
        viewChannel
      );

      eggs.dismiss('reason');

      expect(config.onDismissed).toBeCalledTimes(1);
      expect(config.onDismissed).lastCalledWith(
        expect.objectContaining({
          type: 'DISMISSED',
          reason: 'USER_INTERACTION',
          view: eggs,
          index: 0,
        }),
        viewChannel
      );

      const ham = viewChannel.present({
        data: 'ham',
      });

      viewChannel.dismissAll('reason');

      expect(config.onDismissedAll).toBeCalledTimes(1);
      expect(config.onDismissedAll).lastCalledWith(
        expect.objectContaining({
          type: 'DISMISSED_ALL',
          views: [ham],
          indexes: [0],
        }),
        viewChannel
      );

      const jam = viewChannel.present({
        data: 'jam',
        autoDismiss: {
          duration: 1000,
          result: 'auto_dismiss',
        },
      });

      jam.pause();

      expect(config.onAutoDismissPaused).toBeCalledTimes(1);
      expect(config.onAutoDismissPaused).lastCalledWith(
        expect.objectContaining({
          type: 'AUTO_DISMISS_PAUSED',
          view: jam,
          index: 0,
        }),
        viewChannel
      );

      jam.play();

      expect(config.onAutoDismissPlaying).toBeCalledTimes(1);
      expect(config.onAutoDismissPlaying).lastCalledWith(
        expect.objectContaining({
          type: 'AUTO_DISMISS_PLAYING',
          view: jam,
          index: 0,
        }),
        viewChannel
      );

      jam.stop();

      expect(config.onAutoDismissStopped).toBeCalledTimes(1);
      expect(config.onAutoDismissStopped).lastCalledWith(
        expect.objectContaining({
          type: 'AUTO_DISMISS_STOPPED',
          view: jam,
          index: 0,
        }),
        viewChannel
      );

      jam.changeData('z');

      expect(config.onDataChanged).toBeCalledTimes(1);
      expect(config.onDataChanged).lastCalledWith(
        expect.objectContaining({
          type: 'DATA_CHANGED',
          view: jam,
          index: 0,
          data: 'z',
        }),
        viewChannel
      );

      // Check if they are all called at least once.
      for (const spy of Object.values(config)) {
        // @ts-expect-error they are mocks
        expect(spy.mock.calls.length).not.toBe(0);
      }
    });

    describe('when a method is not implemented', () => {
      test('that it logs a warning when debug is true', () => {
        jest.spyOn(console, 'warn').mockImplementation(() => undefined);

        const subscriber = createViewChannelSubscriber<string, string>({
          debug: true,
        });

        new ViewChannel({}, subscriber);

        expect(console.warn).toHaveBeenCalledTimes(1);
        expect(console.warn).toHaveBeenCalledWith(
          "uiloos > createViewChannelSubscriber event 'INITIALIZED' was fired but 'onInitialized' method is not implemented, this might not be correct."
        );
      });

      test('that it does not log a warning when debug is false', () => {
        jest.spyOn(console, 'warn').mockImplementation(() => undefined);

        const subscriber = createViewChannelSubscriber<string, string>({
          debug: false,
        });

        new ViewChannel({}, subscriber);

        expect(console.warn).toHaveBeenCalledTimes(0);
      });

      test('that it does not log a warning when debug is undefined', () => {
        jest.spyOn(console, 'warn').mockImplementation(() => undefined);

        const subscriber = createViewChannelSubscriber<string, string>({});

        new ViewChannel({}, subscriber);

        expect(console.warn).toHaveBeenCalledTimes(0);
      });
    });

    test('that created subscribers can be unsubscribed', () => {
      jest.useFakeTimers();

      const config: CreateViewChannelSubscriberConfig<string, string> = {
        onPresented: jest.fn(),
        onDismissedAll: jest.fn(),
      };

      const subscriber = createViewChannelSubscriber<string, string>(config);

      const viewChannel = new ViewChannel<string, string>({}, subscriber);

      viewChannel.present({
        data: 'some modal',
      });
      expect(config.onPresented).toBeCalledTimes(1);

      viewChannel.unsubscribe(subscriber);

      // Should be unsubscribed and therefore 0 and not 1.
      viewChannel.dismissAll('clearing');
      expect(config.onDismissedAll).toBeCalledTimes(0);
    });
  });
});

type ViewChannelWithHistory<T, R> = Pick<ViewChannel<T, R>, 'history'>;

type TestState<T, R> = ViewChannelWithHistory<T, R> & {
  views: TestView<T, R>[];
};

type TestView<T, R> = Pick<
  ViewChannelView<T, R>,
  'index' | 'priority' | 'isPresented' | 'autoDismiss'
> & {
  data: string;
};

function assertState(
  state: ViewChannel<string, string>,
  expected: TestState<string, string>
) {
  const callAsTestState: TestState<string, string> = {
    history: state.history,
    views: state.views.map((view) => {
      const viewAsTestView: TestView<string, string> = {
        index: view.index,
        priority: view.priority,
        data: view.data,
        isPresented: view.isPresented,
        autoDismiss: {
          isPlaying: view.autoDismiss.isPlaying,
          duration: view.autoDismiss.duration,
        },
      };

      return viewAsTestView;
    }),
  };

  expect(callAsTestState).toEqual(expected);
}

function assertLastSubscriber(
  subscriber: jest.Mock,
  expectedState: TestState<string, string>,
  expectedEvent: ViewChannelEvent<string, string>
) {
  const lastCall = subscriber.mock.calls[subscriber.mock.calls.length - 1];
  const state = lastCall[0] as ViewChannel<string, string>;
  const event = lastCall[1] as ViewChannelEvent<string, string>;

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
  subscriber: jest.Mock,
  expectedEvents: ViewChannelEventType[]
) {
  const events: ViewChannelEventType[] = subscriber.mock.calls.map((call) => {
    const event = call[1] as ViewChannelEvent<string, string>;
    return event.type;
  });

  expect(events).toEqual(expectedEvents);

  expect(subscriber).toBeCalledTimes(expectedEvents.length);
}
