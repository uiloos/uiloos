import {
  ViewChannel,
  ViewChannelView,
  ViewChannelEvent,
  ViewChannelIndexOutOfBoundsError,
  ViewChannelViewNotFoundError,
  ViewChannelAutoDismissDurationError,
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

        assertLastSubscriber(
          subscriber,
          {
            history: [
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
            },
          ],
        },
        {
          type: 'PRESENTED',
          index: 0,
          view: expect.objectContaining({
            index: 0,
            data: 'a',
            priority: [0],
            isPresented: true,
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
            },
            {
              index: 1,
              priority: [0],
              data: 'b',
              isPresented: true,
            },
          ],
        },
        {
          type: 'PRESENTED',
          index: 1,
          view: expect.objectContaining({
            index: 1,
            data: 'b',
            priority: [0],
            isPresented: true,
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
            },
            {
              index: 1,
              priority: [0],
              data: 'b',
              isPresented: true,
            },
            {
              index: 2,
              priority: [0],
              data: 'c',
              isPresented: true,
            },
          ],
        },
        {
          type: 'PRESENTED',
          index: 2,
          view: expect.objectContaining({
            index: 2,
            data: 'c',
            priority: [0],
            isPresented: true,
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
            },
          ],
        },
        {
          type: 'PRESENTED',
          index: 0,
          view: expect.objectContaining({
            index: 0,
            data: 'a',
            priority: [1],
            isPresented: true,
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
            },
            {
              index: 1,
              priority: [1],
              data: 'a',
              isPresented: true,
            },
          ],
        },
        {
          type: 'PRESENTED',
          index: 0,
          view: expect.objectContaining({
            index: 0,
            data: 'b',
            priority: [0],
            isPresented: true,
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
            },
            {
              index: 1,
              priority: [1],
              data: 'a',
              isPresented: true,
            },
            {
              index: 2,
              priority: [3],
              data: 'c',
              isPresented: true,
            },
          ],
        },
        {
          type: 'PRESENTED',
          index: 2,
          view: expect.objectContaining({
            index: 2,
            data: 'c',
            priority: [3],
            isPresented: true,
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
            },
            {
              index: 1,
              priority: [1],
              data: 'a',
              isPresented: true,
            },
            {
              index: 2,
              priority: [2],
              data: 'd',
              isPresented: true,
            },
            {
              index: 3,
              priority: [3],
              data: 'c',
              isPresented: true,
            },
          ],
        },
        {
          type: 'PRESENTED',
          index: 2,
          view: expect.objectContaining({
            index: 2,
            data: 'd',
            priority: [2],
            isPresented: true,
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
            },
          ],
        },
        {
          type: 'PRESENTED',
          index: 0,
          view: expect.objectContaining({
            index: 0,
            data: 'a',
            priority: [0],
            isPresented: true,
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
            },
            {
              index: 1,
              priority: [1],
              data: 'b',
              isPresented: true,
            },
          ],
        },
        {
          type: 'PRESENTED',
          index: 1,
          view: expect.objectContaining({
            index: 1,
            data: 'b',
            priority: [1],
            isPresented: true,
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
            },
            {
              index: 1,
              priority: [1],
              data: 'b',
              isPresented: true,
            },
            {
              index: 2,
              priority: [1],
              data: 'c',
              isPresented: true,
            },
          ],
        },
        {
          type: 'PRESENTED',
          index: 2,
          view: expect.objectContaining({
            index: 2,
            data: 'c',
            priority: [1],
            isPresented: true,
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
            },
            {
              index: 1,
              priority: [1],
              data: 'b',
              isPresented: true,
            },
            {
              index: 2,
              priority: [1],
              data: 'c',
              isPresented: true,
            },
            {
              index: 3,
              priority: [1],
              data: 'd',
              isPresented: true,
            },
          ],
        },
        {
          type: 'PRESENTED',
          index: 3,
          view: expect.objectContaining({
            index: 3,
            data: 'd',
            priority: [1],
            isPresented: true,
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
            },
            {
              index: 1,
              priority: [0],
              data: 'e',
              isPresented: true,
            },
            {
              index: 2,
              priority: [1],
              data: 'b',
              isPresented: true,
            },
            {
              index: 3,
              priority: [1],
              data: 'c',
              isPresented: true,
            },
            {
              index: 4,
              priority: [1],
              data: 'd',
              isPresented: true,
            },
          ],
        },
        {
          type: 'PRESENTED',
          index: 1,
          view: expect.objectContaining({
            index: 1,
            data: 'e',
            priority: [0],
            isPresented: true,
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
            },
          ],
        },
        {
          type: 'PRESENTED',
          index: 0,
          view: expect.objectContaining({
            index: 0,
            data: 'a',
            priority: [0, 1, 0],
            isPresented: true,
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
            },
            {
              index: 1,
              priority: [0, 1, 0],
              data: 'a',
              isPresented: true,
            },
          ],
        },
        {
          type: 'PRESENTED',
          index: 0,
          view: expect.objectContaining({
            index: 0,
            data: 'b',
            priority: [0, 0, 0],
            isPresented: true,
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
            },
            {
              index: 1,
              priority: [0, 1, 0],
              data: 'a',
              isPresented: true,
            },
            {
              index: 2,
              priority: [0, 1, 2],
              data: 'c',
              isPresented: true,
            },
          ],
        },
        {
          type: 'PRESENTED',
          index: 2,
          view: expect.objectContaining({
            index: 2,
            data: 'c',
            priority: [0, 1, 2],
            isPresented: true,
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
            },
            {
              index: 1,
              priority: [0, 1, 0],
              data: 'a',
              isPresented: true,
            },
            {
              index: 2,
              priority: [0, 1, 0],
              data: 'd',
              isPresented: true,
            },
            {
              index: 3,
              priority: [0, 1, 2],
              data: 'c',
              isPresented: true,
            },
          ],
        },
        {
          type: 'PRESENTED',
          index: 2,
          view: expect.objectContaining({
            index: 2,
            data: 'd',
            priority: [0, 1, 0],
            isPresented: true,
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
            },
            {
              index: 1,
              priority: [0, 1, 0],
              data: 'a',
              isPresented: true,
            },
            {
              index: 2,
              priority: [0, 1, 0],
              data: 'd',
              isPresented: true,
            },
            {
              index: 3,
              priority: [0, 1, 1],
              data: 'e',
              isPresented: true,
            },
            {
              index: 4,
              priority: [0, 1, 2],
              data: 'c',
              isPresented: true,
            },
          ],
        },
        {
          type: 'PRESENTED',
          index: 3,
          view: expect.objectContaining({
            index: 3,
            data: 'e',
            priority: [0, 1, 1],
            isPresented: true,
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
            },
            {
              index: 1,
              priority: [0, 1, 0],
              data: 'a',
              isPresented: true,
            },
            {
              index: 2,
              priority: [0, 1, 0],
              data: 'd',
              isPresented: true,
            },
            {
              index: 3,
              priority: [0, 1],
              data: 'f',
              isPresented: true,
            },
            {
              index: 4,
              priority: [0, 1, 1],
              data: 'e',
              isPresented: true,
            },
            {
              index: 5,
              priority: [0, 1, 2],
              data: 'c',
              isPresented: true,
            },
          ],
        },
        {
          type: 'PRESENTED',
          index: 3,
          view: expect.objectContaining({
            index: 3,
            data: 'f',
            priority: [0, 1],
            isPresented: true,
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
            },
            {
              index: 1,
              priority: [0],
              data: 'g',
              isPresented: true,
            },
            {
              index: 2,
              priority: [0, 1, 0],
              data: 'a',
              isPresented: true,
            },
            {
              index: 3,
              priority: [0, 1, 0],
              data: 'd',
              isPresented: true,
            },
            {
              index: 4,
              priority: [0, 1],
              data: 'f',
              isPresented: true,
            },
            {
              index: 5,
              priority: [0, 1, 1],
              data: 'e',
              isPresented: true,
            },
            {
              index: 6,
              priority: [0, 1, 2],
              data: 'c',
              isPresented: true,
            },
          ],
        },
        {
          type: 'PRESENTED',
          index: 1,
          view: expect.objectContaining({
            index: 1,
            data: 'g',
            priority: [0],
            isPresented: true,
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
            },
            {
              index: 1,
              priority: [0],
              data: 'g',
              isPresented: true,
            },
            {
              index: 2,
              priority: [0, 0, 1],
              data: 'h',
              isPresented: true,
            },
            {
              index: 3,
              priority: [0, 1, 0],
              data: 'a',
              isPresented: true,
            },
            {
              index: 4,
              priority: [0, 1, 0],
              data: 'd',
              isPresented: true,
            },
            {
              index: 5,
              priority: [0, 1],
              data: 'f',
              isPresented: true,
            },
            {
              index: 6,
              priority: [0, 1, 1],
              data: 'e',
              isPresented: true,
            },
            {
              index: 7,
              priority: [0, 1, 2],
              data: 'c',
              isPresented: true,
            },
          ],
        },
        {
          type: 'PRESENTED',
          index: 2,
          view: expect.objectContaining({
            index: 2,
            data: 'h',
            priority: [0, 0, 1],
            isPresented: true,
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
              },
              {
                index: 1,
                priority: [0],
                data: 'c',
                isPresented: true,
              },
            ],
          },
          {
            type: 'DISMISSED',
            index: 1,
            reason: 'USER_INTERACTION',
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

      test('dismiss', () => {
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
              },
              {
                index: 1,
                priority: [0],
                data: 'b',
                isPresented: true,
              },
            ],
          },
          {
            type: 'DISMISSED',
            index: 2,
            reason: 'USER_INTERACTION',
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
              expect.objectContaining({
                index: 0,
                data: 'c',
                priority: [0],
                isPresented: false,
              }),
              expect.objectContaining({
                index: 1,
                data: 'b',
                priority: [1],
                isPresented: false,
              }),
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

    test('dismiss via ViewChannelContent', () => {
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
            },
            {
              index: 1,
              priority: [0],
              data: 'c',
              isPresented: true,
            },
          ],
        },
        {
          type: 'DISMISSED',
          index: 0,
          reason: 'USER_INTERACTION',
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

      // After 199 milliseconds nothing should have happened
      jest.advanceTimersByTime(199);
      // Once for init
      expect(subscriber).toBeCalledTimes(1);

      // Finally after 200 milliseconds it should have auto dismissed
      jest.advanceTimersByTime(1);
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

    test('when autoDismiss is of it will never dismiss automatically', () => {
      jest.useFakeTimers();

      const viewChannel = new ViewChannel<string, string>();
      const subscriber = autoSubscribe(viewChannel);

      viewChannel.present({
        data: 'a',
      });

      jest.advanceTimersByTime(1000 * 60 * 60 * 24);

      // Once for init
      expect(subscriber).toBeCalledTimes(1);
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

      jest.advanceTimersByTime(100);
      expect(subscriber).toBeCalledTimes(1);

      // Trigger a dismissal by the end user
      viewChannel.dismissByIndex(0, 'SUCCESS');

      jest.advanceTimersByTime(100);
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
          view: expect.objectContaining({
            index: 0,
            data: 'a',
            priority: [0],
            isPresented: false,
          }),
          time: new Date(),
        }
      );

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

      expect(view.isPlaying()).toBe(true);

      // Now pause it at the half way.
      jest.advanceTimersByTime(500);
      view.pause();

      expect(view.isPlaying()).toBe(false);
      expect(view.isPresented).toBe(true);

      // When paused advancing the time should do nothing.
      jest.advanceTimersByTime(500);
      expect(view.isPlaying()).toBe(false);
      expect(view.isPresented).toBe(true);

      // Even when advancing a huge amount of seconds, it should
      // stay paused no matter what.
      jest.advanceTimersByTime(10000);
      expect(view.isPlaying()).toBe(false);
      expect(view.isPresented).toBe(true);

      // Now press play, after 500 milliseconds it should have
      // dismissed.
      view.play();
      expect(view.isPlaying()).toBe(true);
      expect(view.isPresented).toBe(true);

      // Once for init
      expect(subscriber).toBeCalledTimes(1);

      // After 499 milliseconds should still be visible
      jest.advanceTimersByTime(499);
      expect(view.isPlaying()).toBe(true);
      expect(view.isPresented).toBe(true);

      // Once for init
      expect(subscriber).toBeCalledTimes(1);

      // After 500 milliseconds it should have been dismissed
      jest.advanceTimersByTime(1);
      expect(view.isPlaying()).toBe(false);
      expect(view.isPresented).toBe(false);

      // Once for init once for dismiss
      expect(subscriber).toBeCalledTimes(2);
    });

    test('that it is not possible to pause when already paused', () => {
      jest.useFakeTimers();

      const viewChannel = new ViewChannel<string, string>();
      const subscriber = autoSubscribe(viewChannel);

      // It should start with 'a' and be playing

      // Present a playing "a"
      const view = viewChannel.present({
        data: 'a',
        autoDismiss: {
          duration: 1000,
          result: 'TIMEOUT',
        },
      });

      // It should start with 'a' and be playing
      expect(view.isPlaying()).toBe(true);
      expect(view.isPresented).toBe(true);

      // Now pause it at the half way.
      jest.advanceTimersByTime(500);
      view.pause();

      // Now advance the timer by a huge margin, and pause again, this
      // second pause should be ignored
      jest.advanceTimersByTime(10000);
      view.pause(); // <--- this pause should be ignored

      expect(view.isPlaying()).toBe(false);

      // Now press play, after 500 milliseconds it should have
      // dismissed.
      view.play();
      expect(view.isPlaying()).toBe(true);
      expect(view.isPresented).toBe(true);

      // Once for init
      expect(subscriber).toBeCalledTimes(1);

      // After 499 milliseconds should still be visible
      jest.advanceTimersByTime(499);
      expect(view.isPlaying()).toBe(true);
      expect(view.isPresented).toBe(true);

      // Once for init
      expect(subscriber).toBeCalledTimes(1);

      // After 500 milliseconds it should have been dismissed
      jest.advanceTimersByTime(1);
      expect(view.isPlaying()).toBe(false);
      expect(view.isPresented).toBe(false);

      // Once for init once for dismiss
      expect(subscriber).toBeCalledTimes(2);
    });

    test('that the autoplay can be stopped and continued', () => {
      jest.useFakeTimers();

      const viewChannel = new ViewChannel<string, string>();
      const subscriber = autoSubscribe(viewChannel);

      // It should start with 'a' and be playing

      // Present a playing "a"
      const view = viewChannel.present({
        data: 'a',
        autoDismiss: {
          duration: 1000,
          result: 'TIMEOUT',
        },
      });

      // It should start with 'a' and be playing
      expect(view.isPlaying()).toBe(true);
      expect(view.isPresented).toBe(true);

      // Now stop it at the half way.
      jest.advanceTimersByTime(500);
      view.stop();

      // When stopped advancing the time should do nothing.
      jest.advanceTimersByTime(500);
      expect(view.isPlaying()).toBe(false);
      expect(view.isPresented).toBe(true);

      // Even when advancing a huge amount of seconds, it should
      // stay stopped no matter what.
      jest.advanceTimersByTime(10000);
      expect(view.isPlaying()).toBe(false);
      expect(view.isPresented).toBe(true);

      // Now press play, after 1000 milliseconds it should have
      // dismissed. And not after 500 because stop is not pause.
      view.play();
      expect(view.isPlaying()).toBe(true);
      expect(view.isPresented).toBe(true);

      // Once for init
      expect(subscriber).toBeCalledTimes(1);

      // After 999 milliseconds should still be visible
      jest.advanceTimersByTime(999);
      expect(view.isPlaying()).toBe(true);
      expect(view.isPresented).toBe(true);

      // Once for init
      expect(subscriber).toBeCalledTimes(1);

      // After 1000 milliseconds it should have been dismissed
      jest.advanceTimersByTime(1);
      expect(view.isPlaying()).toBe(false);
      expect(view.isPresented).toBe(false);

      // Once for init once for dismiss
      expect(subscriber).toBeCalledTimes(2);
     
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
  });
});

type ViewChannelSansHistory<T, R> = Pick<ViewChannel<T, R>, 'history'>;

type TestState<T, R> = ViewChannelSansHistory<T, R> & {
  views: TestView<T, R>[];
};

type TestView<T, R> = Pick<
  ViewChannelView<T, R>,
  'index' | 'priority' | 'isPresented'
> & {
  data: string;
};

function assertState<C>(
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
      };

      return viewAsTestView;
    }),
  };

  expect(callAsTestState).toEqual(expected);
}

function assertLastSubscriber<C>(
  subscriber: jest.Mock<ViewChannel<string, string>, any>,
  expectedState: TestState<string, string>,
  expectedEvent: ViewChannelEvent<string, string>
) {
  const lastCall = subscriber.mock.calls[subscriber.mock.calls.length - 1];
  const state: ViewChannel<string, string> = lastCall[0];
  const event: ViewChannelEvent<string, string> = lastCall[1];

  assertState(state, expectedState);

  const eventCopy = { ...event };
  // @ts-ignore Just delete it
  delete eventCopy.time;

  const expectedEventCopy = { ...expectedEvent };
  // @ts-ignore Just delete it
  delete expectedEventCopy.time;

  expect(eventCopy).toEqual(expectedEventCopy);
}
