import {
  ActiveList,
  ActiveListConfig,
  ActiveListEvent,
  ActiveListContent,
  ActiveListIndexOutOfBoundsError,
  ActiveListActivationLimitReachedError,
  ActiveListCooldownDurationError,
  ActiveListAutoplayDurationError,
  ActiveListItemNotFoundError
} from '../src/ActiveList';

import { UnsubscribeFunction } from '../src/Generic/types';

type TestConfig = Omit<ActiveListConfig<string>, 'subscriber' | 'contents'>;

describe('ActiveList limit 1', () => {
  let unsubscribe: UnsubscribeFunction | null = null;

  beforeEach(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });

  afterEach(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });

  function setup(
    config: TestConfig = {
      isCircular: false,
      autoplay: undefined,
      maxActivationLimit: 1,
      maxActivationLimitBehavior: 'circular',
      keepHistoryFor: 0,
    },
    contents = ['a', 'b', 'c']
  ) {
    const activeContent = new ActiveList({
      contents,
      ...config,
    });

    const subscriber = jest.fn();
    unsubscribe = activeContent.subscribe(subscriber);

    return { subscriber, contents, activeContent };
  }

  describe('initialize', () => {
    test('with initial subscriber', () => {
      const subscriber = jest.fn();
      const activeContent = new ActiveList(
        { contents: ['a', 'b', 'c'], activeIndexes: 1 },
        subscriber
      );

      unsubscribe = () => {
        activeContent.unsubscribe(subscriber);
      };

      assertState(activeContent, {
        active: ['b'],
        activeContents: [activeContent.contents[1]],
        activeIndexes: [1],
        lastActivated: 'b',
        lastActivatedContent: activeContent.contents[1],
        lastActivatedIndex: 1,
        isCircular: false,
        direction: 'right',
        maxActivationLimit: 1,
        maxActivationLimitBehavior: 'circular',
        history: [],
        hasActiveChangedAtLeastOnce: false,
        contents: [
          {
            active: false,
            index: 0,
            value: 'a',
            isFirst: true,
            isLast: false,
            hasNext: true,
            hasPrevious: false,
            isNext: false,
            isPrevious: true,
            hasBeenActiveBefore: false,
          },
          {
            active: true,
            index: 1,
            value: 'b',
            isFirst: false,
            isLast: false,
            hasNext: true,
            hasPrevious: true,
            isNext: false,
            isPrevious: false,
            hasBeenActiveBefore: true,
          },
          {
            active: false,
            index: 2,
            value: 'c',
            isFirst: false,
            isLast: true,
            hasNext: false,
            hasPrevious: true,
            isNext: true,
            isPrevious: false,
            hasBeenActiveBefore: false,
          },
        ],
      });

      expect(subscriber).toHaveBeenCalledTimes(1);
      expect(subscriber).toHaveBeenCalledWith(
        activeContent,
        expect.objectContaining({
          type: 'INITIALIZED',
          indexes: [1],
          values: ['b'],
        })
      );
    });

    test('with initial active element', () => {
      const { activeContent, subscriber } = setup({ active: 'b' });

      assertState(activeContent, {
        active: ['b'],
        activeContents: [activeContent.contents[1]],
        activeIndexes: [1],
        lastActivated: 'b',
        lastActivatedContent: activeContent.contents[1],
        lastActivatedIndex: 1,
        isCircular: false,
        direction: 'right',
        maxActivationLimit: 1,
        maxActivationLimitBehavior: 'circular',
        history: [],
        hasActiveChangedAtLeastOnce: false,
        contents: [
          {
            active: false,
            index: 0,
            value: 'a',
            isFirst: true,
            isLast: false,
            hasNext: true,
            hasPrevious: false,
            isNext: false,
            isPrevious: true,
            hasBeenActiveBefore: false,
          },
          {
            active: true,
            index: 1,
            value: 'b',
            isFirst: false,
            isLast: false,
            hasNext: true,
            hasPrevious: true,
            isNext: false,
            isPrevious: false,
            hasBeenActiveBefore: true,
          },
          {
            active: false,
            index: 2,
            value: 'c',
            isFirst: false,
            isLast: true,
            hasNext: false,
            hasPrevious: true,
            isNext: true,
            isPrevious: false,
            hasBeenActiveBefore: false,
          },
        ],
      });

      expect(subscriber).toHaveBeenCalledTimes(0);
    });

    test('with multiple initial active elements', () => {
      const { activeContent, subscriber } = setup({
        active: ['a', 'b'],
        maxActivationLimit: false,
      });

      assertState(activeContent, {
        active: ['a', 'b'],
        activeContents: [activeContent.contents[0], activeContent.contents[1]],
        activeIndexes: [0, 1],
        lastActivated: 'b',
        lastActivatedContent: activeContent.contents[1],
        lastActivatedIndex: 1,
        isCircular: false,
        direction: 'right',
        maxActivationLimit: false,
        maxActivationLimitBehavior: 'circular',
        history: [],
        hasActiveChangedAtLeastOnce: false,
        contents: [
          {
            active: true,
            index: 0,
            value: 'a',
            isFirst: true,
            isLast: false,
            hasNext: true,
            hasPrevious: false,
            isNext: false,
            isPrevious: true,
            hasBeenActiveBefore: true,
          },
          {
            active: true,
            index: 1,
            value: 'b',
            isFirst: false,
            isLast: false,
            hasNext: true,
            hasPrevious: true,
            isNext: false,
            isPrevious: false,
            hasBeenActiveBefore: true,
          },
          {
            active: false,
            index: 2,
            value: 'c',
            isFirst: false,
            isLast: true,
            hasNext: false,
            hasPrevious: true,
            isNext: true,
            isPrevious: false,
            hasBeenActiveBefore: false,
          },
        ],
      });

      expect(subscriber).toHaveBeenCalledTimes(0);
    });

    test('with multiple initial active elements reversed', () => {
      const { activeContent, subscriber } = setup({
        active: ['b', 'a'],
        maxActivationLimit: false,
      });

      assertState(activeContent, {
        active: ['b', 'a'],
        activeContents: [activeContent.contents[1], activeContent.contents[0]],
        activeIndexes: [1, 0],
        lastActivated: 'a',
        lastActivatedContent: activeContent.contents[0],
        lastActivatedIndex: 0,
        isCircular: false,
        direction: 'right',
        maxActivationLimit: false,
        maxActivationLimitBehavior: 'circular',
        history: [],
        hasActiveChangedAtLeastOnce: false,
        contents: [
          {
            active: true,
            value: 'a',
            index: 0,
            isFirst: true,
            isLast: false,
            hasNext: true,
            hasPrevious: false,
            isNext: false,
            isPrevious: false,
            hasBeenActiveBefore: true,
          },
          {
            active: true,
            value: 'b',
            index: 1,
            isFirst: false,
            isLast: false,
            hasNext: true,
            hasPrevious: true,
            isNext: true,
            isPrevious: false,
            hasBeenActiveBefore: true,
          },
          {
            active: false,
            value: 'c',
            index: 2,
            isFirst: false,
            isLast: true,
            hasNext: false,
            hasPrevious: true,
            isNext: false,
            isPrevious: false,
            hasBeenActiveBefore: false,
          },
        ],
      });

      expect(subscriber).toHaveBeenCalledTimes(0);
    });

    test('with initial active index', () => {
      const { activeContent, subscriber } = setup({ activeIndexes: 2 });

      assertState(activeContent, {
        active: ['c'],
        activeContents: [activeContent.contents[2]],
        activeIndexes: [2],
        lastActivated: 'c',
        lastActivatedContent: activeContent.contents[2],
        lastActivatedIndex: 2,
        isCircular: false,
        direction: 'right',
        maxActivationLimit: 1,
        maxActivationLimitBehavior: 'circular',
        history: [],
        hasActiveChangedAtLeastOnce: false,
        contents: [
          {
            active: false,
            value: 'a',
            index: 0,
            isFirst: true,
            isLast: false,
            hasNext: true,
            hasPrevious: false,
            isNext: false,
            isPrevious: false,
            hasBeenActiveBefore: false,
          },
          {
            active: false,
            value: 'b',
            index: 1,
            isFirst: false,
            isLast: false,
            hasNext: true,
            hasPrevious: true,
            isNext: false,
            isPrevious: true,
            hasBeenActiveBefore: false,
          },
          {
            active: true,
            value: 'c',
            index: 2,
            isFirst: false,
            isLast: true,
            hasNext: false,
            hasPrevious: true,
            isNext: false,
            isPrevious: false,
            hasBeenActiveBefore: true,
          },
        ],
      });

      expect(subscriber).toHaveBeenCalledTimes(0);
    });

    test('with multiple initial active indexes', () => {
      const { activeContent, subscriber } = setup({
        activeIndexes: [0, 2],
        maxActivationLimit: false,
      });

      assertState(activeContent, {
        active: ['a', 'c'],
        activeContents: [activeContent.contents[0], activeContent.contents[2]],
        activeIndexes: [0, 2],
        lastActivated: 'c',
        lastActivatedContent: activeContent.contents[2],
        lastActivatedIndex: 2,
        isCircular: false,
        direction: 'right',
        maxActivationLimit: false,
        maxActivationLimitBehavior: 'circular',
        history: [],
        hasActiveChangedAtLeastOnce: false,
        contents: [
          {
            active: true,
            value: 'a',
            index: 0,
            isFirst: true,
            isLast: false,
            hasNext: true,
            hasPrevious: false,
            isNext: false,
            isPrevious: false,
            hasBeenActiveBefore: true,
          },
          {
            active: false,
            value: 'b',
            index: 1,
            isFirst: false,
            isLast: false,
            hasNext: true,
            hasPrevious: true,
            isNext: false,
            isPrevious: true,
            hasBeenActiveBefore: false,
          },
          {
            active: true,
            value: 'c',
            index: 2,
            isFirst: false,
            isLast: true,
            hasNext: false,
            hasPrevious: true,
            isNext: false,
            isPrevious: false,
            hasBeenActiveBefore: true,
          },
        ],
      });

      expect(subscriber).toHaveBeenCalledTimes(0);
    });

    test('with multiple initial active indexes reversed', () => {
      const { activeContent, subscriber } = setup({
        activeIndexes: [2, 0],
        maxActivationLimit: false,
      });

      assertState(activeContent, {
        active: ['c', 'a'],
        activeContents: [activeContent.contents[2], activeContent.contents[0]],
        activeIndexes: [2, 0],
        lastActivated: 'a',
        lastActivatedContent: activeContent.contents[0],
        lastActivatedIndex: 0,
        isCircular: false,
        direction: 'right',
        maxActivationLimit: false,
        maxActivationLimitBehavior: 'circular',
        history: [],
        hasActiveChangedAtLeastOnce: false,
        contents: [
          {
            active: true,
            value: 'a',
            index: 0,
            isFirst: true,
            isLast: false,
            hasNext: true,
            hasPrevious: false,
            isNext: false,
            isPrevious: false,
            hasBeenActiveBefore: true,
          },
          {
            active: false,
            value: 'b',
            index: 1,
            isFirst: false,
            isLast: false,
            hasNext: true,
            hasPrevious: true,
            isNext: true,
            isPrevious: false,
            hasBeenActiveBefore: false,
          },
          {
            active: true,
            value: 'c',
            index: 2,
            isFirst: false,
            isLast: true,
            hasNext: false,
            hasPrevious: true,
            isNext: false,
            isPrevious: false,
            hasBeenActiveBefore: true,
          },
        ],
      });

      expect(subscriber).toHaveBeenCalledTimes(0);
    });

    test('that no item is activated without any content activator', () => {
      const { activeContent, subscriber } = setup({});

      assertState(activeContent, {
        active: [],
        activeContents: [],
        activeIndexes: [],
        lastActivated: null,
        lastActivatedContent: null,
        lastActivatedIndex: -1,
        isCircular: false,
        direction: 'right',
        maxActivationLimit: 1,
        maxActivationLimitBehavior: 'circular',
        history: [],
        hasActiveChangedAtLeastOnce: false,
        contents: [
          {
            active: false,
            value: 'a',
            index: 0,
            isFirst: true,
            isLast: false,
            hasNext: true,
            hasPrevious: false,
            isNext: false,
            isPrevious: false,
            hasBeenActiveBefore: false,
          },
          {
            active: false,
            value: 'b',
            index: 1,
            isFirst: false,
            isLast: false,
            hasNext: true,
            hasPrevious: true,
            isNext: false,
            isPrevious: false,
            hasBeenActiveBefore: false,
          },
          {
            active: false,
            value: 'c',
            index: 2,
            isFirst: false,
            isLast: true,
            hasNext: false,
            hasPrevious: true,
            isNext: false,
            isPrevious: false,
            hasBeenActiveBefore: false,
          },
        ],
      });

      expect(subscriber).toHaveBeenCalledTimes(0);
    });

    test('that nothing is activated without any content', () => {
      const { activeContent, subscriber } = setup({}, []);

      assertState(activeContent, {
        active: [],
        activeContents: [],
        activeIndexes: [],
        lastActivated: null,
        lastActivatedContent: null,
        lastActivatedIndex: -1,
        isCircular: false,
        direction: 'right',
        maxActivationLimit: 1,
        maxActivationLimitBehavior: 'circular',
        history: [],
        hasActiveChangedAtLeastOnce: false,
        contents: [],
      });

      expect(subscriber).toHaveBeenCalledTimes(0);
    });

    describe('reset behavior', () => {
      test('that initialize can reset the ActiveList', () => {
        const { activeContent, subscriber } = setup({ activeIndexes: 2 });

        expect(activeContent.contents.map((v) => v.value)).toEqual([
          'a',
          'b',
          'c',
        ]);

        const contents = ['d', 'e', 'f', 'g'];

        activeContent.initialize({ contents, activeIndexes: 0 });

        assertLastSubscriber(
          subscriber,
          {
            active: ['d'],
            activeContents: [activeContent.contents[0]],
            activeIndexes: [0],
            lastActivated: 'd',
            lastActivatedContent: activeContent.contents[0],
            lastActivatedIndex: 0,
            isCircular: false,
            direction: 'right',
            maxActivationLimit: 1,
            maxActivationLimitBehavior: 'circular',
            history: [],
            hasActiveChangedAtLeastOnce: false,
            contents: [
              {
                active: true,
                index: 0,
                value: 'd',
                isFirst: true,
                isLast: false,
                hasNext: true,
                hasPrevious: false,
                isNext: false,
                isPrevious: false,
                hasBeenActiveBefore: true,
              },
              {
                active: false,
                index: 1,
                value: 'e',
                isFirst: false,
                isLast: false,
                hasNext: true,
                hasPrevious: true,
                isNext: true,
                isPrevious: false,
                hasBeenActiveBefore: false,
              },
              {
                active: false,
                index: 2,
                value: 'f',
                isFirst: false,
                isLast: false,
                hasNext: true,
                hasPrevious: true,
                isNext: false,
                isPrevious: false,
                hasBeenActiveBefore: false,
              },
              {
                active: false,
                index: 3,
                value: 'g',
                isFirst: false,
                isLast: true,
                hasNext: false,
                hasPrevious: true,
                isNext: false,
                isPrevious: false,
                hasBeenActiveBefore: false,
              },
            ],
          },
          {
            type: 'INITIALIZED',
            indexes: [0],
            values: ['d'],
            time: new Date(),
          }
        );
      });

      test('that initialize can reset the ActiveList and make it empty', () => {
        const { activeContent, subscriber } = setup();
        activeContent.initialize({ contents: [] });

        assertLastSubscriber(
          subscriber,
          {
            active: [],
            activeContents: [],
            activeIndexes: [],
            lastActivated: null,
            lastActivatedContent: null,
            lastActivatedIndex: -1,
            isCircular: false,
            direction: 'right',
            maxActivationLimit: 1,
            maxActivationLimitBehavior: 'circular',
            history: [],
            hasActiveChangedAtLeastOnce: false,
            contents: [],
          },
          {
            type: 'INITIALIZED',
            indexes: [],
            values: [],
            time: new Date(),
          }
        );
      });
    });

    describe('edge cases', () => {
      test('when circular and there is only one item, it is both previous and next, and last and first', () => {
        const { activeContent, subscriber } = setup(
          { isCircular: true, activeIndexes: 0 },
          ['a']
        );

        assertState(activeContent, {
          active: ['a'],
          activeContents: [activeContent.contents[0]],
          activeIndexes: [0],
          lastActivated: 'a',
          lastActivatedContent: activeContent.contents[0],
          lastActivatedIndex: 0,
          isCircular: true,
          direction: 'right',
          maxActivationLimit: 1,
          maxActivationLimitBehavior: 'circular',
          history: [],
          hasActiveChangedAtLeastOnce: false,
          contents: [
            {
              active: true,
              value: 'a',
              index: 0,
              isFirst: true,
              isLast: true,
              hasNext: true,
              hasPrevious: true,
              isNext: true,
              isPrevious: true,
              hasBeenActiveBefore: true,
            },
          ],
        });

        expect(subscriber).toHaveBeenCalledTimes(0);
      });

      test('when straight and there is only one item, it is not the previous and next, but it is the last and first', () => {
        const { activeContent, subscriber } = setup(
          { isCircular: false, activeIndexes: 0 },
          ['a']
        );

        assertState(activeContent, {
          active: ['a'],
          activeContents: [activeContent.contents[0]],
          activeIndexes: [0],
          lastActivated: 'a',
          lastActivatedContent: activeContent.contents[0],
          lastActivatedIndex: 0,
          isCircular: false,
          direction: 'right',
          maxActivationLimit: 1,
          maxActivationLimitBehavior: 'circular',
          history: [],
          hasActiveChangedAtLeastOnce: false,
          contents: [
            {
              active: true,
              value: 'a',
              index: 0,
              isFirst: true,
              isLast: true,
              hasNext: false,
              hasPrevious: false,
              isNext: false,
              isPrevious: false,
              hasBeenActiveBefore: true,
            },
          ],
        });

        expect(subscriber).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe('activation of elements', () => {
    describe('activateByIndex', () => {
      describe('when it throws out of bounds', () => {
        test('throws out of bounds when index is to large', () => {
          const { activeContent, subscriber } = setup({});

          expect(() => {
            activeContent.activateByIndex(4);
          }).toThrowError(
            `uiloos > ActiveList > activateByIndex > "index" is out of bounds`
          );

          expect(() => {
            activeContent.activateByIndex(4);
          }).toThrowError(
            ActiveListIndexOutOfBoundsError
          );

          expect(() => {
            activeContent.activateByIndex(3);
          }).toThrowError(
            `uiloos > ActiveList > activateByIndex > "index" is out of bounds`
          );

          expect(() => {
            activeContent.activateByIndex(3);
          }).toThrowError(
            ActiveListIndexOutOfBoundsError
          );

          expect(subscriber).toHaveBeenCalledTimes(0);

          expect(activeContent.active).toEqual([]);
        });

        test('throws out of bounds when index is less than zero', () => {
          const { activeContent, subscriber } = setup({});

          expect(() => {
            activeContent.activateByIndex(-1);
          }).toThrowError(
            `uiloos > ActiveList > activateByIndex > "index" is out of bounds`
          );

          expect(() => {
            activeContent.activateByIndex(-1);
          }).toThrowError(
            ActiveListIndexOutOfBoundsError
          );

          expect(subscriber).toHaveBeenCalledTimes(0);

          expect(activeContent.active).toEqual([]);
        });
      });

      test('that when activating an already active index that it does nothing', () => {
        const { activeContent, subscriber } = setup({ activeIndexes: 2 });

        activeContent.activateByIndex(2);

        expect(subscriber).toHaveBeenCalledTimes(0);
      });

      describe('motion when maxActivationLimit is 1', () => {
        describe('when circular', () => {
          test('moving right', () => {
            const { activeContent, subscriber } = setup({
              activeIndexes: 0,
              isCircular: true,
            });

            activeContent.activateByIndex(1);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(
              subscriber,
              {
                active: ['b'],
                activeContents: [activeContent.contents[1]],
                activeIndexes: [1],
                lastActivated: 'b',
                lastActivatedContent: activeContent.contents[1],
                lastActivatedIndex: 1,
                direction: 'right',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                isCircular: true,
                contents: [
                  {
                    active: false,
                    value: 'a',
                    index: 0,
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: true,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: true,
                    value: 'b',
                    index: 1,
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: false,
                    value: 'c',
                    index: 2,
                    isFirst: false,
                    isLast: true,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: true,
                    isPrevious: false,
                    hasBeenActiveBefore: false,
                  },
                ],
              },
              {
                type: 'ACTIVATED',
                index: 1,
                value: 'b',
                time: new Date(),
              }
            );

            activeContent.activateByIndex(2);

            expect(subscriber).toHaveBeenCalledTimes(2);
            assertLastSubscriber(
              subscriber,
              {
                active: ['c'],
                activeContents: [activeContent.contents[2]],
                activeIndexes: [2],
                lastActivated: 'c',
                lastActivatedContent: activeContent.contents[2],
                lastActivatedIndex: 2,
                direction: 'right',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                isCircular: true,
                contents: [
                  {
                    active: false,
                    value: 'a',
                    index: 0,
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: true,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: false,
                    value: 'b',
                    index: 1,
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: true,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: true,
                    value: 'c',
                    index: 2,
                    isFirst: false,
                    isLast: true,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                ],
              },
              {
                type: 'ACTIVATED',
                index: 2,
                value: 'c',
                time: new Date(),
              }
            );

            activeContent.activateByIndex(0);

            expect(subscriber).toHaveBeenCalledTimes(3);
            assertLastSubscriber(
              subscriber,
              {
                active: ['a'],
                activeContents: [activeContent.contents[0]],
                activeIndexes: [0],
                lastActivated: 'a',
                lastActivatedContent: activeContent.contents[0],
                lastActivatedIndex: 0,
                direction: 'right',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                isCircular: true,
                contents: [
                  {
                    active: true,
                    value: 'a',
                    index: 0,
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: false,
                    value: 'b',
                    index: 1,
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: true,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: false,
                    value: 'c',
                    index: 2,
                    isFirst: false,
                    isLast: true,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: true,
                    hasBeenActiveBefore: true,
                  },
                ],
              },
              {
                type: 'ACTIVATED',
                index: 0,
                value: 'a',
                time: new Date(),
              }
            );
          });

          test('moving left', () => {
            const { activeContent, subscriber } = setup({
              activeIndexes: 2,
              isCircular: true,
            });

            activeContent.activateByIndex(1);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(
              subscriber,
              {
                active: ['b'],
                activeContents: [activeContent.contents[1]],
                activeIndexes: [1],
                lastActivated: 'b',
                lastActivatedContent: activeContent.contents[1],
                lastActivatedIndex: 1,
                direction: 'left',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                isCircular: true,
                contents: [
                  {
                    active: false,
                    value: 'a',
                    index: 0,
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: true,
                    hasBeenActiveBefore: false,
                  },
                  {
                    active: true,
                    value: 'b',
                    index: 1,
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: false,
                    value: 'c',
                    index: 2,
                    isFirst: false,
                    isLast: true,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: true,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                ],
              },
              {
                type: 'ACTIVATED',
                index: 1,
                value: 'b',
                time: new Date(),
              }
            );

            activeContent.activateByIndex(0);

            expect(subscriber).toHaveBeenCalledTimes(2);
            assertLastSubscriber(
              subscriber,
              {
                active: ['a'],
                activeContents: [activeContent.contents[0]],
                activeIndexes: [0],
                lastActivated: 'a',
                lastActivatedContent: activeContent.contents[0],
                lastActivatedIndex: 0,
                direction: 'left',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                isCircular: true,
                contents: [
                  {
                    active: true,
                    value: 'a',
                    index: 0,
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: false,
                    value: 'b',
                    index: 1,
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: true,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: false,
                    value: 'c',
                    index: 2,
                    isFirst: false,
                    isLast: true,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: true,
                    hasBeenActiveBefore: true,
                  },
                ],
              },
              {
                type: 'ACTIVATED',
                index: 0,
                value: 'a',
                time: new Date(),
              }
            );

            activeContent.activateByIndex(2);

            expect(subscriber).toHaveBeenCalledTimes(3);
            assertLastSubscriber(
              subscriber,
              {
                active: ['c'],
                activeContents: [activeContent.contents[2]],
                activeIndexes: [2],
                lastActivated: 'c',
                lastActivatedContent: activeContent.contents[2],
                lastActivatedIndex: 2,
                direction: 'left',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                isCircular: true,
                contents: [
                  {
                    active: false,
                    value: 'a',
                    index: 0,
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: true,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: false,
                    value: 'b',
                    index: 1,
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: true,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: true,
                    value: 'c',
                    index: 2,
                    isFirst: false,
                    isLast: true,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                ],
              },
              {
                type: 'ACTIVATED',
                index: 2,
                value: 'c',
                time: new Date(),
              }
            );
          });

          test('when closest means jumping right', () => {
            const { activeContent, subscriber } = setup(
              {
                activeIndexes: 2,
                isCircular: true,
              },
              //0    1    2    3    4
              ['a', 'b', 'c', 'd', 'e']
            );

            activeContent.activateByIndex(4);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(
              subscriber,
              {
                active: ['e'],
                activeContents: [activeContent.contents[4]],
                activeIndexes: [4],
                lastActivated: 'e',
                lastActivatedContent: activeContent.contents[4],
                lastActivatedIndex: 4,
                direction: 'right',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                isCircular: true,
                contents: [
                  {
                    active: false,
                    value: 'a',
                    index: 0,
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: true,
                    isPrevious: false,
                    hasBeenActiveBefore: false,
                  },
                  {
                    active: false,
                    value: 'b',
                    index: 1,
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: false,
                  },
                  {
                    active: false,
                    value: 'c',
                    index: 2,
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: false,
                    value: 'd',
                    index: 3,
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: true,
                    hasBeenActiveBefore: false,
                  },
                  {
                    active: true,
                    value: 'e',
                    index: 4,
                    isFirst: false,
                    isLast: true,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                ],
              },
              {
                type: 'ACTIVATED',
                index: 4,
                value: 'e',
                time: new Date(),
              }
            );
          });

          test('when closest means jumping left', () => {
            const { activeContent, subscriber } = setup(
              {
                activeIndexes: 2,
                isCircular: true,
              },
              //0    1    2    3    4
              ['a', 'b', 'c', 'd', 'e']
            );

            activeContent.activateByIndex(0);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(
              subscriber,
              {
                active: ['a'],
                activeContents: [activeContent.contents[0]],
                activeIndexes: [0],
                lastActivated: 'a',
                lastActivatedContent: activeContent.contents[0],
                lastActivatedIndex: 0,
                direction: 'left',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                isCircular: true,
                contents: [
                  {
                    active: true,
                    value: 'a',
                    index: 0,
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: false,
                    value: 'b',
                    index: 1,
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: true,
                    isPrevious: false,
                    hasBeenActiveBefore: false,
                  },
                  {
                    active: false,
                    value: 'c',
                    index: 2,
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: false,
                    value: 'd',
                    index: 3,
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: false,
                  },
                  {
                    active: false,
                    value: 'e',
                    index: 4,
                    isFirst: false,
                    isLast: true,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: true,
                    hasBeenActiveBefore: false,
                  },
                ],
              },
              {
                type: 'ACTIVATED',
                index: 0,
                value: 'a',
                time: new Date(),
              }
            );
          });

          test('when closest means jumping before start', () => {
            const { activeContent, subscriber } = setup(
              {
                activeIndexes: 1,
                isCircular: true,
              },
              //0    1    2    3    4
              ['a', 'b', 'c', 'd', 'e']
            );

            activeContent.activateByIndex(4);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(
              subscriber,
              {
                active: ['e'],
                activeContents: [activeContent.contents[4]],
                activeIndexes: [4],
                lastActivated: 'e',
                lastActivatedContent: activeContent.contents[4],
                lastActivatedIndex: 4,
                direction: 'left',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                isCircular: true,
                contents: [
                  {
                    active: false,
                    value: 'a',
                    index: 0,
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: true,
                    isPrevious: false,
                    hasBeenActiveBefore: false,
                  },
                  {
                    active: false,
                    value: 'b',
                    index: 1,
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: false,
                    value: 'c',
                    index: 2,
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: false,
                  },
                  {
                    active: false,
                    value: 'd',
                    index: 3,
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: true,
                    hasBeenActiveBefore: false,
                  },
                  {
                    active: true,
                    value: 'e',
                    index: 4,
                    isFirst: false,
                    isLast: true,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                ],
              },
              {
                type: 'ACTIVATED',
                index: 4,
                value: 'e',
                time: new Date(),
              }
            );
          });

          test('when closest means jumping after end', () => {
            const { activeContent, subscriber } = setup(
              {
                activeIndexes: 3,
                isCircular: true,
              },
              //0    1    2    3    4
              ['a', 'b', 'c', 'd', 'e']
            );

            activeContent.activateByIndex(0);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(
              subscriber,
              {
                active: ['a'],
                activeContents: [activeContent.contents[0]],
                activeIndexes: [0],
                lastActivated: 'a',
                lastActivatedContent: activeContent.contents[0],
                lastActivatedIndex: 0,
                direction: 'right',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                isCircular: true,
                contents: [
                  {
                    active: true,
                    value: 'a',
                    index: 0,
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: false,
                    value: 'b',
                    index: 1,
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: true,
                    isPrevious: false,
                    hasBeenActiveBefore: false,
                  },
                  {
                    active: false,
                    value: 'c',
                    index: 2,
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: false,
                  },
                  {
                    active: false,
                    value: 'd',
                    index: 3,
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: false,
                    value: 'e',
                    index: 4,
                    isFirst: false,
                    isLast: true,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: true,
                    hasBeenActiveBefore: false,
                  },
                ],
              },
              {
                type: 'ACTIVATED',
                index: 0,
                value: 'a',
                time: new Date(),
              }
            );
          });

          test('when tied it should always jump right', () => {
            const { activeContent, subscriber } = setup(
              {
                activeIndexes: 0,
                isCircular: true,
              },
              //0    1
              ['a', 'b']
            );

            activeContent.activateByIndex(1);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(
              subscriber,
              {
                active: ['b'],
                activeContents: [activeContent.contents[1]],
                activeIndexes: [1],
                lastActivated: 'b',
                lastActivatedContent: activeContent.contents[1],
                lastActivatedIndex: 1,
                direction: 'right',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                isCircular: true,
                contents: [
                  {
                    active: false,
                    value: 'a',
                    index: 0,
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: true,
                    isPrevious: true,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: true,
                    value: 'b',
                    index: 1,
                    isFirst: false,
                    isLast: true,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                ],
              },
              {
                type: 'ACTIVATED',
                index: 1,
                value: 'b',
                time: new Date(),
              }
            );
          });

          test('when tied it should always jump right even when moving over edge', () => {
            const { activeContent, subscriber } = setup(
              {
                activeIndexes: 1,
                isCircular: true,
              },
              //0    1
              ['a', 'b']
            );

            activeContent.activateByIndex(0);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(
              subscriber,
              {
                active: ['a'],
                activeContents: [activeContent.contents[0]],
                activeIndexes: [0],
                lastActivated: 'a',
                lastActivatedContent: activeContent.contents[0],
                lastActivatedIndex: 0,
                direction: 'right',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                isCircular: true,
                contents: [
                  {
                    active: true,
                    value: 'a',
                    index: 0,
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: false,
                    value: 'b',
                    index: 1,
                    isFirst: false,
                    isLast: true,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: true,
                    isPrevious: true,
                    hasBeenActiveBefore: true,
                  },
                ],
              },
              {
                type: 'ACTIVATED',
                index: 0,
                value: 'a',
                time: new Date(),
              }
            );
          });
        });

        describe('when straight', () => {
          test('moving right', () => {
            const { activeContent, subscriber } = setup({ activeIndexes: 0 });

            activeContent.activateByIndex(1);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(
              subscriber,
              {
                active: ['b'],
                activeContents: [activeContent.contents[1]],
                activeIndexes: [1],
                lastActivated: 'b',
                lastActivatedContent: activeContent.contents[1],
                lastActivatedIndex: 1,
                direction: 'right',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                isCircular: false,
                contents: [
                  {
                    active: false,
                    value: 'a',
                    index: 0,
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: false,
                    isNext: false,
                    isPrevious: true,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: true,
                    value: 'b',
                    index: 1,
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: false,
                    value: 'c',
                    index: 2,
                    isFirst: false,
                    isLast: true,
                    hasNext: false,
                    hasPrevious: true,
                    isNext: true,
                    isPrevious: false,
                    hasBeenActiveBefore: false,
                  },
                ],
              },
              {
                type: 'ACTIVATED',
                index: 1,
                value: 'b',
                time: new Date(),
              }
            );

            activeContent.activateByIndex(2);

            expect(subscriber).toHaveBeenCalledTimes(2);
            assertLastSubscriber(
              subscriber,
              {
                active: ['c'],
                activeContents: [activeContent.contents[2]],
                activeIndexes: [2],
                lastActivated: 'c',
                lastActivatedContent: activeContent.contents[2],
                lastActivatedIndex: 2,
                direction: 'right',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                isCircular: false,
                contents: [
                  {
                    active: false,
                    value: 'a',
                    index: 0,
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: false,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: false,
                    value: 'b',
                    index: 1,
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: true,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: true,
                    value: 'c',
                    index: 2,
                    isFirst: false,
                    isLast: true,
                    hasNext: false,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                ],
              },
              {
                type: 'ACTIVATED',
                index: 2,
                value: 'c',
                time: new Date(),
              }
            );
          });

          test('moving left', () => {
            const { activeContent, subscriber } = setup({ activeIndexes: 2 });

            activeContent.activateByIndex(1);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(
              subscriber,
              {
                active: ['b'],
                activeContents: [activeContent.contents[1]],
                activeIndexes: [1],
                lastActivated: 'b',
                lastActivatedContent: activeContent.contents[1],
                lastActivatedIndex: 1,
                direction: 'left',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                isCircular: false,
                contents: [
                  {
                    active: false,
                    value: 'a',
                    index: 0,
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: false,
                    isNext: false,
                    isPrevious: true,
                    hasBeenActiveBefore: false,
                  },
                  {
                    active: true,
                    value: 'b',
                    index: 1,
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: false,
                    value: 'c',
                    index: 2,
                    isFirst: false,
                    isLast: true,
                    hasNext: false,
                    hasPrevious: true,
                    isNext: true,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                ],
              },
              {
                type: 'ACTIVATED',
                index: 1,
                value: 'b',
                time: new Date(),
              }
            );

            activeContent.activateByIndex(0);

            expect(subscriber).toHaveBeenCalledTimes(2);
            assertLastSubscriber(
              subscriber,
              {
                active: ['a'],
                activeContents: [activeContent.contents[0]],
                activeIndexes: [0],
                lastActivated: 'a',
                lastActivatedContent: activeContent.contents[0],
                lastActivatedIndex: 0,
                direction: 'left',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                isCircular: false,
                contents: [
                  {
                    active: true,
                    value: 'a',
                    index: 0,
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: false,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: false,
                    value: 'b',
                    index: 1,
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: true,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: false,
                    value: 'c',
                    index: 2,
                    isFirst: false,
                    isLast: true,
                    hasNext: false,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                ],
              },
              {
                type: 'ACTIVATED',
                index: 0,
                value: 'a',
                time: new Date(),
              }
            );
          });
        });
      });

      describe('motion when maxActivationLimit is false', () => {
        describe('when circular', () => {
          test('moving right', () => {
            const { activeContent, subscriber } = setup({
              maxActivationLimit: false,
              activeIndexes: 1,
              isCircular: true,
            });

            activeContent.activateByIndex(2);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(
              subscriber,
              {
                active: ['b', 'c'],
                activeContents: [
                  activeContent.contents[1],
                  activeContent.contents[2],
                ],
                activeIndexes: [1, 2],
                lastActivated: 'c',
                lastActivatedContent: activeContent.contents[2],
                lastActivatedIndex: 2,
                direction: 'right',
                maxActivationLimit: false,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                isCircular: true,
                contents: [
                  {
                    active: false,
                    value: 'a',
                    index: 0,
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: true,
                    isPrevious: false,
                    hasBeenActiveBefore: false,
                  },
                  {
                    active: true,
                    value: 'b',
                    index: 1,
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: true,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: true,
                    value: 'c',
                    index: 2,
                    isFirst: false,
                    isLast: true,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                ],
              },
              {
                type: 'ACTIVATED',
                index: 2,
                value: 'c',
                time: new Date(),
              }
            );

            activeContent.activateByIndex(0);

            expect(subscriber).toHaveBeenCalledTimes(2);
            assertLastSubscriber(
              subscriber,
              {
                active: ['b', 'c', 'a'],
                activeContents: [
                  activeContent.contents[1],
                  activeContent.contents[2],
                  activeContent.contents[0],
                ],
                activeIndexes: [1, 2, 0],
                lastActivated: 'a',
                lastActivatedContent: activeContent.contents[0],
                lastActivatedIndex: 0,
                direction: 'right',
                maxActivationLimit: false,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                isCircular: true,
                contents: [
                  {
                    active: true,
                    value: 'a',
                    index: 0,
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: true,
                    value: 'b',
                    index: 1,
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: true,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: true,
                    value: 'c',
                    index: 2,
                    isFirst: false,
                    isLast: true,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: true,
                    hasBeenActiveBefore: true,
                  },
                ],
              },
              {
                type: 'ACTIVATED',
                index: 0,
                value: 'a',
                time: new Date(),
              }
            );
          });

          test('moving left', () => {
            const { activeContent, subscriber } = setup({
              maxActivationLimit: false,
              activeIndexes: 1,
              isCircular: true,
            });

            activeContent.activateByIndex(0);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(
              subscriber,
              {
                active: ['b', 'a'],
                activeContents: [
                  activeContent.contents[1],
                  activeContent.contents[0],
                ],
                activeIndexes: [1, 0],
                lastActivated: 'a',
                lastActivatedContent: activeContent.contents[0],
                lastActivatedIndex: 0,
                direction: 'left',
                maxActivationLimit: false,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                isCircular: true,
                contents: [
                  {
                    active: true,
                    value: 'a',
                    index: 0,
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: true,
                    value: 'b',
                    index: 1,
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: true,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: false,
                    value: 'c',
                    index: 2,
                    isFirst: false,
                    isLast: true,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: true,
                    hasBeenActiveBefore: false,
                  },
                ],
              },
              {
                type: 'ACTIVATED',
                index: 0,
                value: 'a',
                time: new Date(),
              }
            );

            activeContent.activateByIndex(2);

            expect(subscriber).toHaveBeenCalledTimes(2);
            assertLastSubscriber(
              subscriber,
              {
                active: ['b', 'a', 'c'],
                activeContents: [
                  activeContent.contents[1],
                  activeContent.contents[0],
                  activeContent.contents[2],
                ],
                activeIndexes: [1, 0, 2],
                lastActivated: 'c',
                lastActivatedContent: activeContent.contents[2],
                lastActivatedIndex: 2,
                direction: 'left',
                maxActivationLimit: false,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                isCircular: true,
                contents: [
                  {
                    active: true,
                    value: 'a',
                    index: 0,
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: true,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: true,
                    value: 'b',
                    index: 1,
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: true,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: true,
                    value: 'c',
                    index: 2,
                    isFirst: false,
                    isLast: true,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                ],
              },
              {
                type: 'ACTIVATED',
                index: 2,
                value: 'c',
                time: new Date(),
              }
            );
          });

          test('when closest means jumping right', () => {
            const { activeContent, subscriber } = setup(
              {
                maxActivationLimit: false,
                activeIndexes: [1, 2],
                isCircular: true,
              },
              //0    1    2    3    4
              ['a', 'b', 'c', 'd', 'e']
            );

            activeContent.activateByIndex(4);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(
              subscriber,
              {
                active: ['b', 'c', 'e'],
                activeContents: [
                  activeContent.contents[1],
                  activeContent.contents[2],
                  activeContent.contents[4],
                ],
                activeIndexes: [1, 2, 4],
                lastActivated: 'e',
                lastActivatedContent: activeContent.contents[4],
                lastActivatedIndex: 4,
                direction: 'right',
                maxActivationLimit: false,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                isCircular: true,
                contents: [
                  {
                    active: false,
                    value: 'a',
                    index: 0,
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: true,
                    isPrevious: false,
                    hasBeenActiveBefore: false,
                  },
                  {
                    active: true,
                    value: 'b',
                    index: 1,
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: true,
                    value: 'c',
                    index: 2,
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: false,
                    value: 'd',
                    index: 3,
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: true,
                    hasBeenActiveBefore: false,
                  },
                  {
                    active: true,
                    value: 'e',
                    index: 4,
                    isFirst: false,
                    isLast: true,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                ],
              },
              {
                type: 'ACTIVATED',
                index: 4,
                value: 'e',
                time: new Date(),
              }
            );
          });

          test('when closest means jumping left', () => {
            const { activeContent, subscriber } = setup(
              {
                maxActivationLimit: false,
                activeIndexes: [3, 2],
                isCircular: true,
              },
              //0    1    2    3    4
              ['a', 'b', 'c', 'd', 'e']
            );

            activeContent.activateByIndex(0);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(
              subscriber,
              {
                active: ['d', 'c', 'a'],
                activeContents: [
                  activeContent.contents[3],
                  activeContent.contents[2],
                  activeContent.contents[0],
                ],
                activeIndexes: [3, 2, 0],
                lastActivated: 'a',
                lastActivatedContent: activeContent.contents[0],
                lastActivatedIndex: 0,
                direction: 'left',
                maxActivationLimit: false,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                isCircular: true,
                contents: [
                  {
                    active: true,
                    value: 'a',
                    index: 0,
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: false,
                    value: 'b',
                    index: 1,
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: true,
                    isPrevious: false,
                    hasBeenActiveBefore: false,
                  },
                  {
                    active: true,
                    value: 'c',
                    index: 2,
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: true,
                    value: 'd',
                    index: 3,
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: false,
                    value: 'e',
                    index: 4,
                    isFirst: false,
                    isLast: true,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: true,
                    hasBeenActiveBefore: false,
                  },
                ],
              },
              {
                type: 'ACTIVATED',
                index: 0,
                value: 'a',
                time: new Date(),
              }
            );
          });

          test('when closest means jumping before start', () => {
            const { activeContent, subscriber } = setup(
              {
                maxActivationLimit: false,
                activeIndexes: [2, 1],
                isCircular: true,
              },
              //0    1    2    3    4
              ['a', 'b', 'c', 'd', 'e']
            );

            activeContent.activateByIndex(4);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(
              subscriber,
              {
                active: ['c', 'b', 'e'],
                activeContents: [
                  activeContent.contents[2],
                  activeContent.contents[1],
                  activeContent.contents[4],
                ],
                activeIndexes: [2, 1, 4],
                lastActivated: 'e',
                lastActivatedContent: activeContent.contents[4],
                lastActivatedIndex: 4,
                direction: 'left',
                maxActivationLimit: false,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                isCircular: true,
                contents: [
                  {
                    active: false,
                    value: 'a',
                    index: 0,
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: true,
                    isPrevious: false,
                    hasBeenActiveBefore: false,
                  },
                  {
                    active: true,
                    value: 'b',
                    index: 1,
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: true,
                    value: 'c',
                    index: 2,
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: false,
                    value: 'd',
                    index: 3,
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: true,
                    hasBeenActiveBefore: false,
                  },
                  {
                    active: true,
                    value: 'e',
                    index: 4,
                    isFirst: false,
                    isLast: true,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                ],
              },
              {
                type: 'ACTIVATED',
                index: 4,
                value: 'e',
                time: new Date(),
              }
            );
          });

          test('when closest means jumping after end', () => {
            const { activeContent, subscriber } = setup(
              {
                maxActivationLimit: false,
                activeIndexes: [2, 3],
                isCircular: true,
              },
              //0    1    2    3    4
              ['a', 'b', 'c', 'd', 'e']
            );

            activeContent.activateByIndex(0);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(
              subscriber,
              {
                active: ['c', 'd', 'a'],
                activeContents: [
                  activeContent.contents[2],
                  activeContent.contents[3],
                  activeContent.contents[0],
                ],
                activeIndexes: [2, 3, 0],
                lastActivated: 'a',
                lastActivatedContent: activeContent.contents[0],
                lastActivatedIndex: 0,
                direction: 'right',
                maxActivationLimit: false,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                isCircular: true,
                contents: [
                  {
                    active: true,
                    value: 'a',
                    index: 0,
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: false,
                    value: 'b',
                    index: 1,
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: true,
                    isPrevious: false,
                    hasBeenActiveBefore: false,
                  },
                  {
                    active: true,
                    value: 'c',
                    index: 2,
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: true,
                    value: 'd',
                    index: 3,
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: false,
                    value: 'e',
                    index: 4,
                    isFirst: false,
                    isLast: true,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: true,
                    hasBeenActiveBefore: false,
                  },
                ],
              },
              {
                type: 'ACTIVATED',
                index: 0,
                value: 'a',
                time: new Date(),
              }
            );
          });

          test('when tied it should always jump right', () => {
            const { activeContent, subscriber } = setup(
              {
                maxActivationLimit: false,
                activeIndexes: 0,
                isCircular: true,
              },
              //0    1
              ['a', 'b']
            );

            activeContent.activateByIndex(1);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(
              subscriber,
              {
                active: ['a', 'b'],
                activeContents: [
                  activeContent.contents[0],
                  activeContent.contents[1],
                ],
                activeIndexes: [0, 1],
                lastActivated: 'b',
                lastActivatedContent: activeContent.contents[1],
                lastActivatedIndex: 1,
                direction: 'right',
                maxActivationLimit: false,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                isCircular: true,
                contents: [
                  {
                    active: true,
                    value: 'a',
                    index: 0,
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: true,
                    isPrevious: true,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: true,
                    value: 'b',
                    index: 1,
                    isFirst: false,
                    isLast: true,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                ],
              },
              {
                type: 'ACTIVATED',
                index: 1,
                value: 'b',
                time: new Date(),
              }
            );
          });

          test('when tied it should always jump right even when moving over edge', () => {
            const { activeContent, subscriber } = setup(
              {
                maxActivationLimit: false,
                activeIndexes: 1,
                isCircular: true,
              },
              //0    1
              ['a', 'b']
            );

            activeContent.activateByIndex(0);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(
              subscriber,
              {
                active: ['b', 'a'],
                activeContents: [
                  activeContent.contents[1],
                  activeContent.contents[0],
                ],
                activeIndexes: [1, 0],
                lastActivated: 'a',
                lastActivatedContent: activeContent.contents[0],
                lastActivatedIndex: 0,
                direction: 'right',
                maxActivationLimit: false,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                isCircular: true,
                contents: [
                  {
                    active: true,
                    value: 'a',
                    index: 0,
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: true,
                    value: 'b',
                    index: 1,
                    isFirst: false,
                    isLast: true,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: true,
                    isPrevious: true,
                    hasBeenActiveBefore: true,
                  },
                ],
              },
              {
                type: 'ACTIVATED',
                index: 0,
                value: 'a',
                time: new Date(),
              }
            );
          });
        });

        describe('when straight', () => {
          test('moving right', () => {
            const { activeContent, subscriber } = setup({
              maxActivationLimit: false,
              activeIndexes: 0,
            });

            activeContent.activateByIndex(1);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(
              subscriber,
              {
                active: ['a', 'b'],
                activeContents: [
                  activeContent.contents[0],
                  activeContent.contents[1],
                ],
                activeIndexes: [0, 1],
                lastActivated: 'b',
                lastActivatedContent: activeContent.contents[1],
                lastActivatedIndex: 1,
                direction: 'right',
                maxActivationLimit: false,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                isCircular: false,
                contents: [
                  {
                    active: true,
                    value: 'a',
                    index: 0,
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: false,
                    isNext: false,
                    isPrevious: true,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: true,
                    value: 'b',
                    index: 1,
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: false,
                    value: 'c',
                    index: 2,
                    isFirst: false,
                    isLast: true,
                    hasNext: false,
                    hasPrevious: true,
                    isNext: true,
                    isPrevious: false,
                    hasBeenActiveBefore: false,
                  },
                ],
              },
              {
                type: 'ACTIVATED',
                index: 1,
                value: 'b',
                time: new Date(),
              }
            );

            activeContent.activateByIndex(2);

            expect(subscriber).toHaveBeenCalledTimes(2);
            assertLastSubscriber(
              subscriber,
              {
                active: ['a', 'b', 'c'],
                activeContents: [
                  activeContent.contents[0],
                  activeContent.contents[1],
                  activeContent.contents[2],
                ],
                activeIndexes: [0, 1, 2],
                lastActivated: 'c',
                lastActivatedContent: activeContent.contents[2],
                lastActivatedIndex: 2,
                direction: 'right',
                maxActivationLimit: false,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                isCircular: false,
                contents: [
                  {
                    active: true,
                    value: 'a',
                    index: 0,
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: false,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: true,
                    value: 'b',
                    index: 1,
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: true,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: true,
                    value: 'c',
                    index: 2,
                    isFirst: false,
                    isLast: true,
                    hasNext: false,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                ],
              },
              {
                type: 'ACTIVATED',
                index: 2,
                value: 'c',
                time: new Date(),
              }
            );
          });

          test('moving left', () => {
            const { activeContent, subscriber } = setup({
              maxActivationLimit: false,
              activeIndexes: 2,
            });

            activeContent.activateByIndex(1);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(
              subscriber,
              {
                active: ['c', 'b'],
                activeContents: [
                  activeContent.contents[2],
                  activeContent.contents[1],
                ],
                activeIndexes: [2, 1],
                lastActivated: 'b',
                lastActivatedContent: activeContent.contents[1],
                lastActivatedIndex: 1,
                direction: 'left',
                maxActivationLimit: false,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                isCircular: false,
                contents: [
                  {
                    active: false,
                    value: 'a',
                    index: 0,
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: false,
                    isNext: false,
                    isPrevious: true,
                    hasBeenActiveBefore: false,
                  },
                  {
                    active: true,
                    value: 'b',
                    index: 1,
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: true,
                    value: 'c',
                    index: 2,
                    isFirst: false,
                    isLast: true,
                    hasNext: false,
                    hasPrevious: true,
                    isNext: true,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                ],
              },
              {
                type: 'ACTIVATED',
                index: 1,
                value: 'b',
                time: new Date(),
              }
            );

            activeContent.activateByIndex(0);

            expect(subscriber).toHaveBeenCalledTimes(2);
            assertLastSubscriber(
              subscriber,
              {
                active: ['c', 'b', 'a'],
                activeContents: [
                  activeContent.contents[2],
                  activeContent.contents[1],
                  activeContent.contents[0],
                ],
                activeIndexes: [2, 1, 0],
                lastActivated: 'a',
                lastActivatedContent: activeContent.contents[0],
                lastActivatedIndex: 0,
                direction: 'left',
                maxActivationLimit: false,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                isCircular: false,
                contents: [
                  {
                    active: true,
                    value: 'a',
                    index: 0,
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: false,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: true,
                    value: 'b',
                    index: 1,
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: true,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: true,
                    value: 'c',
                    index: 2,
                    isFirst: false,
                    isLast: true,
                    hasNext: false,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                ],
              },
              {
                type: 'ACTIVATED',
                index: 0,
                value: 'a',
                time: new Date(),
              }
            );
          });
        });
      });

      describe('when having custom directions', () => {
        test('moving down', () => {
          const { activeContent, subscriber } = setup({
            activeIndexes: 0,
            directions: { next: 'down', previous: 'up' },
          });

          activeContent.activateByIndex(1);

          expect(subscriber).toHaveBeenCalledTimes(1);
          expect(subscriber.mock.calls[0][0]).toMatchObject({
            direction: 'down',
          });

          activeContent.activateByIndex(2);

          expect(subscriber).toHaveBeenCalledTimes(2);
          expect(subscriber.mock.calls[1][0]).toMatchObject({
            direction: 'down',
          });
        });

        test('moving up', () => {
          const { activeContent, subscriber } = setup({
            activeIndexes: 2,
            directions: { next: 'down', previous: 'up' },
          });

          activeContent.activateByIndex(1);

          expect(subscriber).toHaveBeenCalledTimes(1);
          expect(subscriber.mock.calls[0][0]).toMatchObject({
            direction: 'up',
          });

          activeContent.activateByIndex(0);

          expect(subscriber).toHaveBeenCalledTimes(2);
          expect(subscriber.mock.calls[1][0]).toMatchObject({
            direction: 'up',
          });
        });
      });

      describe('limitBehavior', () => {
        test("when behavior is 'circular' once the limit is reached, the first one in is the first one out", () => {
          const { activeContent, subscriber } = setup({
            activeIndexes: 0,
            maxActivationLimit: 2,
            maxActivationLimitBehavior: 'circular',
          });

          activeContent.activateByIndex(1);

          expect(subscriber).toHaveBeenCalledTimes(1);
          assertLastSubscriber(
            subscriber,
            {
              active: ['a', 'b'],
              activeContents: [
                activeContent.contents[0],
                activeContent.contents[1],
              ],
              activeIndexes: [0, 1],
              lastActivated: 'b',
              lastActivatedContent: activeContent.contents[1],
              lastActivatedIndex: 1,
              direction: 'right',
              maxActivationLimit: 2,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: true,
              isCircular: false,
              contents: [
                {
                  active: true,
                  value: 'a',
                  index: 0,
                  isFirst: true,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: false,
                  isNext: false,
                  isPrevious: true,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  value: 'b',
                  index: 1,
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: false,
                  value: 'c',
                  index: 2,
                  isFirst: false,
                  isLast: true,
                  hasNext: false,
                  hasPrevious: true,
                  isNext: true,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
              ],
            },
            {
              type: 'ACTIVATED',
              index: 1,
              value: 'b',
              time: new Date(),
            }
          );

          activeContent.activateByIndex(2);

          expect(subscriber).toHaveBeenCalledTimes(2);
          assertLastSubscriber(
            subscriber,
            {
              active: ['b', 'c'],
              activeContents: [
                activeContent.contents[1],
                activeContent.contents[2],
              ],
              activeIndexes: [1, 2],
              lastActivated: 'c',
              lastActivatedContent: activeContent.contents[2],
              lastActivatedIndex: 2,
              direction: 'right',
              maxActivationLimit: 2,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: true,
              isCircular: false,
              contents: [
                {
                  active: false,
                  value: 'a',
                  index: 0,
                  isFirst: true,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: false,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  value: 'b',
                  index: 1,
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: true,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  value: 'c',
                  index: 2,
                  isFirst: false,
                  isLast: true,
                  hasNext: false,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
              ],
            },
            {
              type: 'ACTIVATED',
              index: 2,
              value: 'c',
              time: new Date(),
            }
          );

          activeContent.activateByIndex(0);

          expect(subscriber).toHaveBeenCalledTimes(3);
          assertLastSubscriber(
            subscriber,
            {
              active: ['c', 'a'],
              activeContents: [
                activeContent.contents[2],
                activeContent.contents[0],
              ],
              activeIndexes: [2, 0],
              lastActivated: 'a',
              lastActivatedContent: activeContent.contents[0],
              lastActivatedIndex: 0,
              direction: 'left',
              maxActivationLimit: 2,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: true,
              isCircular: false,
              contents: [
                {
                  active: true,
                  value: 'a',
                  index: 0,
                  isFirst: true,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: false,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: false,
                  value: 'b',
                  index: 1,
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: true,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  value: 'c',
                  index: 2,
                  isFirst: false,
                  isLast: true,
                  hasNext: false,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
              ],
            },
            {
              type: 'ACTIVATED',
              index: 0,
              value: 'a',
              time: new Date(),
            }
          );
        });

        test("when behavior is 'ignore' once the limit is reached items should no longer be added, but no errors are thrown", () => {
          const { activeContent, subscriber } = setup({
            activeIndexes: 0,
            maxActivationLimit: 2,
            maxActivationLimitBehavior: 'ignore',
          });

          activeContent.activateByIndex(1);

          expect(subscriber).toHaveBeenCalledTimes(1);
          assertLastSubscriber(
            subscriber,
            {
              active: ['a', 'b'],
              activeContents: [
                activeContent.contents[0],
                activeContent.contents[1],
              ],
              activeIndexes: [0, 1],
              lastActivated: 'b',
              lastActivatedContent: activeContent.contents[1],
              lastActivatedIndex: 1,
              direction: 'right',
              maxActivationLimit: 2,
              maxActivationLimitBehavior: 'ignore',
              history: [],
              hasActiveChangedAtLeastOnce: true,
              isCircular: false,
              contents: [
                {
                  active: true,
                  value: 'a',
                  index: 0,
                  isFirst: true,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: false,
                  isNext: false,
                  isPrevious: true,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  value: 'b',
                  index: 1,
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: false,
                  value: 'c',
                  index: 2,
                  isFirst: false,
                  isLast: true,
                  hasNext: false,
                  hasPrevious: true,
                  isNext: true,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
              ],
            },
            {
              type: 'ACTIVATED',
              index: 1,
              value: 'b',
              time: new Date(),
            }
          );

          // Nothing should happen once the limit is reached
          activeContent.activateByIndex(2);
          expect(subscriber).toHaveBeenCalledTimes(1);

          // Nothing should happen once the limit is reached
          activeContent.activateByIndex(0);
          expect(subscriber).toHaveBeenCalledTimes(1);

          // Now deactivate an active index
          activeContent.deactivateByIndex(0);
          expect(subscriber).toHaveBeenCalledTimes(2);

          // This should now be allowed
          activeContent.activateByIndex(2);
          expect(subscriber).toHaveBeenCalledTimes(3);
        });

        test("when behavior is 'error' once the limit is reached and error should be thrown", () => {
          const { activeContent, subscriber } = setup({
            activeIndexes: 0,
            maxActivationLimit: 2,
            maxActivationLimitBehavior: 'error',
          });

          activeContent.activateByIndex(1);

          expect(subscriber).toHaveBeenCalledTimes(1);
          assertLastSubscriber(
            subscriber,
            {
              active: ['a', 'b'],
              activeContents: [
                activeContent.contents[0],
                activeContent.contents[1],
              ],
              activeIndexes: [0, 1],
              lastActivated: 'b',
              lastActivatedContent: activeContent.contents[1],
              lastActivatedIndex: 1,
              direction: 'right',
              maxActivationLimit: 2,
              maxActivationLimitBehavior: 'error',
              history: [],
              hasActiveChangedAtLeastOnce: true,
              isCircular: false,
              contents: [
                {
                  active: true,
                  value: 'a',
                  index: 0,
                  isFirst: true,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: false,
                  isNext: false,
                  isPrevious: true,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  value: 'b',
                  index: 1,
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: false,
                  value: 'c',
                  index: 2,
                  isFirst: false,
                  isLast: true,
                  hasNext: false,
                  hasPrevious: true,
                  isNext: true,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
              ],
            },
            {
              type: 'ACTIVATED',
              index: 1,
              value: 'b',
              time: new Date(),
            }
          );

          expect(() => {
            activeContent.activateByIndex(2);
          }).toThrowError(
            'uiloos > ActiveList > activateByIndex > activation limit reached'
          );

          expect(() => {
            activeContent.activateByIndex(2);
          }).toThrowError(
            ActiveListActivationLimitReachedError
          );

          // Now deactivate an active index
          activeContent.deactivateByIndex(0);
          expect(subscriber).toHaveBeenCalledTimes(2);

          // This should now be allowed
          activeContent.activateByIndex(2);
          expect(subscriber).toHaveBeenCalledTimes(3);
        });
      });
    });

    describe('activate', () => {
      test('activate on item', () => {
        const { activeContent } = setup();

        jest.spyOn(activeContent, 'activateByIndex');

        activeContent.contents[1].activate({ isUserInteraction: false });

        expect(activeContent.activateByIndex).toHaveBeenCalledTimes(1);
        expect(activeContent.activateByIndex).toHaveBeenCalledWith(1, {
          isUserInteraction: false,
        });
      });

      test('activate on item after removal should work because the indexes should be fixed', () => {
        const { activeContent } = setup({ activeIndexes: 0 });

        jest.spyOn(activeContent, 'activateByIndex');

        activeContent.shift();

        activeContent.contents[1].activate({ isUserInteraction: false });

        expect(activeContent.activateByIndex).toHaveBeenCalledTimes(1);
        expect(activeContent.activateByIndex).toHaveBeenLastCalledWith(1, {
          isUserInteraction: false,
        });

        expect(activeContent.active).toEqual(['c']);
      });

      test('activate content by identity', () => {
        const { activeContent, contents } = setup();

        jest.spyOn(activeContent, 'activateByIndex');

        activeContent.activate(contents[1], {
          isUserInteraction: true,
        });

        expect(activeContent.activateByIndex).toHaveBeenCalledTimes(1);
        expect(activeContent.activateByIndex).toHaveBeenCalledWith(1, {
          isUserInteraction: true,
        });
      });

      test('throws item not found', () => {
        const { activeContent } = setup();

        jest.spyOn(activeContent, 'activateByIndex');

        expect(() => {
          activeContent.activate('d');
        }).toThrowError(
          'uiloos > ActiveList > getIndex > index cannot be found, item is not in contents array'
        );

        expect(() => {
          activeContent.activate('d');
        }).toThrowError(
          ActiveListItemNotFoundError
        );

        expect(activeContent.activateByIndex).toHaveBeenCalledTimes(0);
      });
    });

    describe('activateByPredicate', () => {
      test('when multiple items match only last one is active when maxActivationLimit is 1', () => {
        // The two 'a's will match the predicate
        const { activeContent, subscriber } = setup(
          { maxActivationLimit: 1, activeIndexes: 0 },
          ['b', 'a', 'a', 'z']
        );

        activeContent.activateByPredicate(
          (data) => {
            expect(data.index).toBeDefined();
            expect(data.value).toBeDefined();
            
            expect(data.content).toBeDefined();
            expect(data.content).toBeInstanceOf(ActiveListContent);
            
            expect(data.activeList).toBeDefined();

            return data.value === 'a';
            expect(data.activeList).toBeInstanceOf(ActiveList);
          },
          {
            isUserInteraction: true,
          }
        );

        expect(subscriber).toHaveBeenCalledTimes(1);
        assertLastSubscriber(
          subscriber,
          {
            active: ['a'],
            activeContents: [activeContent.contents[2]],
            activeIndexes: [2],
            lastActivated: 'a',
            lastActivatedContent: activeContent.contents[2],
            lastActivatedIndex: 2,
            direction: 'right',
            maxActivationLimit: 1,
            maxActivationLimitBehavior: 'circular',
            history: [],
            hasActiveChangedAtLeastOnce: true,
            isCircular: false,
            contents: [
              {
                active: false,
                value: 'b',
                index: 0,
                isFirst: true,
                isLast: false,
                hasNext: true,
                hasPrevious: false,
                isNext: false,
                isPrevious: false,
                hasBeenActiveBefore: true,
              },
              {
                active: false,
                value: 'a',
                index: 1,
                isFirst: false,
                isLast: false,
                hasNext: true,
                hasPrevious: true,
                isNext: false,
                isPrevious: true,
                hasBeenActiveBefore: true,
              },
              {
                active: true,
                value: 'a',
                index: 2,
                isFirst: false,
                isLast: false,
                hasNext: true,
                hasPrevious: true,
                isNext: false,
                isPrevious: false,
                hasBeenActiveBefore: true,
              },
              {
                active: false,
                value: 'z',
                index: 3,
                isFirst: false,
                isLast: true,
                hasNext: false,
                hasPrevious: true,
                isNext: true,
                isPrevious: false,
                hasBeenActiveBefore: false,
              },
            ],
          },
          {
            type: 'ACTIVATED_MULTIPLE',
            indexes: [1, 2],
            values: ['a', 'a'],
            time: new Date(),
          }
        );
      });

      test('when multiple items match all items are activated when maxActivationLimit is false', () => {
        // The two 'a's will match the predicate
        const { activeContent, subscriber } = setup(
          { maxActivationLimit: false },
          ['b', 'a', 'a', 'z']
        );

        activeContent.activateByPredicate(
          (data) => {
            expect(data.index).toBeDefined();
            expect(data.value).toBeDefined();
            
            expect(data.content).toBeDefined();
            expect(data.content).toBeInstanceOf(ActiveListContent);
            
            expect(data.activeList).toBeDefined();

            return data.value === 'a';
            expect(data.activeList).toBeInstanceOf(ActiveList);
          },
          {
            isUserInteraction: true,
          }
        );

        expect(subscriber).toHaveBeenCalledTimes(1);
        assertLastSubscriber(
          subscriber,
          {
            active: ['a', 'a'],
            activeContents: [
              activeContent.contents[1],
              activeContent.contents[2],
            ],
            activeIndexes: [1, 2],
            lastActivated: 'a',
            lastActivatedContent: activeContent.contents[2],
            lastActivatedIndex: 2,
            direction: 'right',
            maxActivationLimit: false,
            maxActivationLimitBehavior: 'circular',
            history: [],
            hasActiveChangedAtLeastOnce: true,
            isCircular: false,
            contents: [
              {
                active: false,
                value: 'b',
                index: 0,
                isFirst: true,
                isLast: false,
                hasNext: true,
                hasPrevious: false,
                isNext: false,
                isPrevious: false,
                hasBeenActiveBefore: false,
              },
              {
                active: true,
                value: 'a',
                index: 1,
                isFirst: false,
                isLast: false,
                hasNext: true,
                hasPrevious: true,
                isNext: false,
                isPrevious: true,
                hasBeenActiveBefore: true,
              },
              {
                active: true,
                value: 'a',
                index: 2,
                isFirst: false,
                isLast: false,
                hasNext: true,
                hasPrevious: true,
                isNext: false,
                isPrevious: false,
                hasBeenActiveBefore: true,
              },
              {
                active: false,
                value: 'z',
                index: 3,
                isFirst: false,
                isLast: true,
                hasNext: false,
                hasPrevious: true,
                isNext: true,
                isPrevious: false,
                hasBeenActiveBefore: false,
              },
            ],
          },
          {
            type: 'ACTIVATED_MULTIPLE',
            indexes: [1, 2],
            values: ['a', 'a'],
            time: new Date(),
          }
        );
      });

      test('when multiple items match all items are activated when maxActivationLimit is N', () => {
        // The two 'a's will match the predicate
        const { activeContent, subscriber } = setup({ maxActivationLimit: 2 }, [
          'b',
          'a',
          'a',
          'z',
        ]);

        activeContent.activateByPredicate((data) => {
          expect(data.index).toBeDefined();
          expect(data.value).toBeDefined();
          
          expect(data.content).toBeDefined();
          expect(data.content).toBeInstanceOf(ActiveListContent);
          
          expect(data.activeList).toBeDefined();


          expect(data.activeList).toBeInstanceOf(ActiveList);
          return data.value === 'a';
        });

        expect(subscriber).toHaveBeenCalledTimes(1);
        assertLastSubscriber(
          subscriber,
          {
            active: ['a', 'a'],
            activeContents: [
              activeContent.contents[1],
              activeContent.contents[2],
            ],
            activeIndexes: [1, 2],
            lastActivated: 'a',
            lastActivatedContent: activeContent.contents[2],
            lastActivatedIndex: 2,
            direction: 'right',
            maxActivationLimit: 2,
            maxActivationLimitBehavior: 'circular',
            history: [],
            hasActiveChangedAtLeastOnce: true,
            isCircular: false,
            contents: [
              {
                active: false,
                value: 'b',
                index: 0,
                isFirst: true,
                isLast: false,
                hasNext: true,
                hasPrevious: false,
                isNext: false,
                isPrevious: false,
                hasBeenActiveBefore: false,
              },
              {
                active: true,
                value: 'a',
                index: 1,
                isFirst: false,
                isLast: false,
                hasNext: true,
                hasPrevious: true,
                isNext: false,
                isPrevious: true,
                hasBeenActiveBefore: true,
              },
              {
                active: true,
                value: 'a',
                index: 2,
                isFirst: false,
                isLast: false,
                hasNext: true,
                hasPrevious: true,
                isNext: false,
                isPrevious: false,
                hasBeenActiveBefore: true,
              },
              {
                active: false,
                value: 'z',
                index: 3,
                isFirst: false,
                isLast: true,
                hasNext: false,
                hasPrevious: true,
                isNext: true,
                isPrevious: false,
                hasBeenActiveBefore: false,
              },
            ],
          },
          {
            type: 'ACTIVATED_MULTIPLE',
            indexes: [1, 2],
            values: ['a', 'a'],
            time: new Date(),
          }
        );
      });
    });

    describe('activateNext', () => {
      test('activates the next content.', () => {
        const { activeContent } = setup({ activeIndexes: 0 });

        jest.spyOn(activeContent, 'activateByIndex');

        activeContent.activateNext({ isUserInteraction: true });

        expect(activeContent.activateByIndex).toHaveBeenCalledTimes(1);
        expect(activeContent.activateByIndex).toHaveBeenCalledWith(1, {
          isUserInteraction: true,
        });
      });

      test('activates first element when content is empty.', () => {
        const { activeContent } = setup({ activeIndexes: [] });

        jest.spyOn(activeContent, 'activateByIndex');

        activeContent.activateNext({ isUserInteraction: true });

        expect(activeContent.activateByIndex).toHaveBeenCalledTimes(1);
        expect(activeContent.activateByIndex).toHaveBeenCalledWith(0, {
          isUserInteraction: true,
        });
      });

      test('activates nothing when content is empty.', () => {
        const { activeContent } = setup({}, []);

        jest.spyOn(activeContent, 'activateByIndex');

        activeContent.activateNext({ isUserInteraction: true });

        expect(activeContent.activateByIndex).toHaveBeenCalledTimes(0);
      });

      describe('when moving beyond the last index ', () => {
        test('when isCircular is true it should go to first', () => {
          const { activeContent } = setup({
            activeIndexes: 2,
            isCircular: true,
          });

          jest.spyOn(activeContent, 'activateByIndex');

          activeContent.activateNext();

          expect(activeContent.activateByIndex).toHaveBeenCalledTimes(1);
          expect(activeContent.activateByIndex).toHaveBeenCalledWith(
            0,
            undefined
          );
        });

        test('when isCircular is false it should do nothing', () => {
          const { activeContent } = setup({
            activeIndexes: 2,
            isCircular: false,
          });

          jest.spyOn(activeContent, 'activateByIndex');

          activeContent.activateNext();

          expect(activeContent.activateByIndex).toHaveBeenCalledTimes(1);
          expect(activeContent.activateByIndex).toHaveBeenCalledWith(
            2,
            undefined
          );
        });
      });
    });

    describe('activatePrevious', () => {
      test('activates the previous content', () => {
        const { activeContent } = setup({ activeIndexes: 2 });

        jest.spyOn(activeContent, 'activateByIndex');

        activeContent.activatePrevious({ isUserInteraction: true });

        expect(activeContent.activateByIndex).toHaveBeenCalledTimes(1);
        expect(activeContent.activateByIndex).toHaveBeenCalledWith(1, {
          isUserInteraction: true,
        });
      });

      test('activates first element when content is empty.', () => {
        const { activeContent } = setup({ activeIndexes: [] });

        jest.spyOn(activeContent, 'activateByIndex');

        activeContent.activatePrevious({ isUserInteraction: true });

        expect(activeContent.activateByIndex).toHaveBeenCalledTimes(1);
        expect(activeContent.activateByIndex).toHaveBeenCalledWith(0, {
          isUserInteraction: true,
        });
      });

      test('activates nothing when content is empty.', () => {
        const { activeContent } = setup({}, []);

        jest.spyOn(activeContent, 'activateByIndex');

        activeContent.activatePrevious({ isUserInteraction: true });

        expect(activeContent.activateByIndex).toHaveBeenCalledTimes(0);
      });

      describe('when beyond the first index', () => {
        test('when isCircular is true it should go to last', () => {
          const { activeContent } = setup({
            activeIndexes: 0,
            isCircular: true,
          });

          jest.spyOn(activeContent, 'activateByIndex');

          activeContent.activatePrevious();

          expect(activeContent.activateByIndex).toHaveBeenCalledTimes(1);
          expect(activeContent.activateByIndex).toHaveBeenCalledWith(
            2,
            undefined
          );
        });

        test('when false it should do nothing', () => {
          const { activeContent } = setup({
            activeIndexes: 0,
            isCircular: false,
          });

          jest.spyOn(activeContent, 'activateByIndex');

          activeContent.activatePrevious();

          expect(activeContent.activateByIndex).toHaveBeenCalledTimes(1);
          expect(activeContent.activateByIndex).toHaveBeenCalledWith(
            0,
            undefined
          );
        });
      });
    });

    describe('activateFirst', () => {
      test('should activate the first content in the sequence.', () => {
        const { activeContent } = setup({ activeIndexes: 1 });

        jest.spyOn(activeContent, 'activateByIndex');

        activeContent.activateFirst({
          isUserInteraction: false,
        });

        expect(activeContent.activateByIndex).toHaveBeenCalledTimes(1);
        expect(activeContent.activateByIndex).toHaveBeenCalledWith(0, {
          isUserInteraction: false,
        });
      });

      test('should do nothing when there is no content to activate', () => {
        const { activeContent } = setup({}, []);

        jest.spyOn(activeContent, 'activateByIndex');

        activeContent.activateFirst({
          isUserInteraction: false,
        });

        expect(activeContent.activateByIndex).toHaveBeenCalledTimes(0);
      });
    });

    describe('activateLast', () => {
      test('should activate the last content in the sequence.', () => {
        const { activeContent } = setup({ activeIndexes: 1 });

        jest.spyOn(activeContent, 'activateByIndex');

        activeContent.activateLast({
          isUserInteraction: false,
        });

        expect(activeContent.activateByIndex).toHaveBeenCalledTimes(1);
        expect(activeContent.activateByIndex).toHaveBeenCalledWith(2, {
          isUserInteraction: false,
        });
      });

      test('should do nothing when there is no content to activate', () => {
        const { activeContent } = setup({}, []);

        jest.spyOn(activeContent, 'activateByIndex');

        activeContent.activateLast({
          isUserInteraction: false,
        });

        expect(activeContent.activateByIndex).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe('deactivation of elements', () => {
    describe('deactivateByIndex', () => {
      describe('when it throws out of bounds', () => {
        test('throws out of bounds when index is to large', () => {
          const { activeContent, subscriber } = setup({});

          expect(() => {
            activeContent.deactivateByIndex(4);
          }).toThrowError(
            `uiloos > ActiveList > deactivateByIndex > "index" is out of bounds`
          );

          expect(() => {
            activeContent.deactivateByIndex(4);
          }).toThrowError(
            ActiveListIndexOutOfBoundsError
          );

          expect(() => {
            activeContent.deactivateByIndex(3);
          }).toThrowError(
            `uiloos > ActiveList > deactivateByIndex > "index" is out of bounds`
          );

          expect(() => {
            activeContent.deactivateByIndex(3);
          }).toThrowError(
            ActiveListIndexOutOfBoundsError
          );

          expect(subscriber).toHaveBeenCalledTimes(0);

          expect(activeContent.active).toEqual([]);
        });

        test('throws out of bounds when index is less than zero', () => {
          const { activeContent, subscriber } = setup();

          expect(() => {
            activeContent.deactivateByIndex(-1);
          }).toThrowError(
            `uiloos > ActiveList > deactivateByIndex > "index" is out of bounds`
          );

          expect(() => {
            activeContent.deactivateByIndex(-1);
          }).toThrowError(
            ActiveListIndexOutOfBoundsError
          );

          expect(subscriber).toHaveBeenCalledTimes(0);

          expect(activeContent.active).toEqual([]);
        });
      });

      test('that when deactivating an already active index that it does nothing', () => {
        const { activeContent, subscriber } = setup({ activeIndexes: 0 });

        activeContent.deactivateByIndex(2);

        expect(subscriber).toHaveBeenCalledTimes(0);
      });

      test('deactivated last active item reset behavior', () => {
        const { activeContent, subscriber } = setup({
          activeIndexes: 0,
          maxActivationLimit: 1,
          isCircular: true,
        });

        activeContent.deactivateByIndex(0);

        expect(subscriber).toHaveBeenCalledTimes(1);
        assertLastSubscriber(
          subscriber,
          {
            active: [],
            activeContents: [],
            activeIndexes: [],
            lastActivated: null,
            lastActivatedContent: null,
            lastActivatedIndex: -1,
            direction: 'right',
            maxActivationLimit: 1,
            maxActivationLimitBehavior: 'circular',
            history: [],
            hasActiveChangedAtLeastOnce: true,
            isCircular: true,
            contents: [
              {
                active: false,
                value: 'a',
                index: 0,
                isFirst: true,
                isLast: false,
                hasNext: true,
                hasPrevious: true,
                isNext: false,
                isPrevious: false,
                hasBeenActiveBefore: true,
              },
              {
                active: false,
                value: 'b',
                index: 1,
                isFirst: false,
                isLast: false,
                hasNext: true,
                hasPrevious: true,
                isNext: false,
                isPrevious: false,
                hasBeenActiveBefore: false,
              },
              {
                active: false,
                value: 'c',
                index: 2,
                isFirst: false,
                isLast: true,
                hasNext: true,
                hasPrevious: true,
                isNext: false,
                isPrevious: false,
                hasBeenActiveBefore: false,
              },
            ],
          },
          {
            type: 'DEACTIVATED',
            index: 0,
            value: 'a',
            time: new Date(),
          }
        );
      });

      describe('motion', () => {
        describe('when circular', () => {
          test('moving right when removing current lastActivatedIndex', () => {
            const { activeContent, subscriber } = setup({
              activeIndexes: [0, 2, 1],
              maxActivationLimit: false,
              isCircular: true,
            });

            activeContent.deactivateByIndex(1);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(
              subscriber,
              {
                active: ['a', 'c'],
                activeContents: [
                  activeContent.contents[0],
                  activeContent.contents[2],
                ],
                activeIndexes: [0, 2],
                lastActivated: 'c',
                lastActivatedContent: activeContent.contents[2],
                lastActivatedIndex: 2,
                direction: 'right',
                maxActivationLimit: false,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                isCircular: true,
                contents: [
                  {
                    active: true,
                    value: 'a',
                    index: 0,
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: true,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: false,
                    value: 'b',
                    index: 1,
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: true,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: true,
                    value: 'c',
                    index: 2,
                    isFirst: false,
                    isLast: true,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                ],
              },
              {
                type: 'DEACTIVATED',
                index: 1,
                value: 'b',
                time: new Date(),
              }
            );
          });

          test('moving right when not removing current lastActivatedIndex', () => {
            const { activeContent, subscriber } = setup({
              activeIndexes: [0, 1, 2],
              maxActivationLimit: false,
              isCircular: true,
            });

            activeContent.deactivateByIndex(1);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(
              subscriber,
              {
                active: ['a', 'c'],
                activeContents: [
                  activeContent.contents[0],
                  activeContent.contents[2],
                ],
                activeIndexes: [0, 2],
                lastActivated: 'c',
                lastActivatedContent: activeContent.contents[2],
                lastActivatedIndex: 2,
                direction: 'right',
                maxActivationLimit: false,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                isCircular: true,
                contents: [
                  {
                    active: true,
                    value: 'a',
                    index: 0,
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: true,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: false,
                    value: 'b',
                    index: 1,
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: true,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: true,
                    value: 'c',
                    index: 2,
                    isFirst: false,
                    isLast: true,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                ],
              },
              {
                type: 'DEACTIVATED',
                index: 1,
                value: 'b',
                time: new Date(),
              }
            );
          });

          test('moving left when removing current lastActivatedIndex', () => {
            const { activeContent, subscriber } = setup({
              activeIndexes: [2, 0, 1],
              maxActivationLimit: false,
              isCircular: true,
            });

            activeContent.deactivateByIndex(1);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(
              subscriber,
              {
                active: ['c', 'a'],
                activeContents: [
                  activeContent.contents[2],
                  activeContent.contents[0],
                ],
                activeIndexes: [2, 0],
                lastActivated: 'a',
                lastActivatedContent: activeContent.contents[0],
                lastActivatedIndex: 0,
                direction: 'left',
                maxActivationLimit: false,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                isCircular: true,
                contents: [
                  {
                    active: true,
                    value: 'a',
                    index: 0,
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: false,
                    value: 'b',
                    index: 1,
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: true,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: true,
                    value: 'c',
                    index: 2,
                    isFirst: false,
                    isLast: true,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: true,
                    hasBeenActiveBefore: true,
                  },
                ],
              },
              {
                type: 'DEACTIVATED',
                index: 1,
                value: 'b',
                time: new Date(),
              }
            );
          });

          test('moving left when not removing current lastActivatedIndex', () => {
            const { activeContent, subscriber } = setup({
              activeIndexes: [2, 1, 0],
              maxActivationLimit: false,
              isCircular: true,
            });

            activeContent.deactivateByIndex(1);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(
              subscriber,
              {
                active: ['c', 'a'],
                activeContents: [
                  activeContent.contents[2],
                  activeContent.contents[0],
                ],
                activeIndexes: [2, 0],
                lastActivated: 'a',
                lastActivatedContent: activeContent.contents[0],
                lastActivatedIndex: 0,
                direction: 'left',
                maxActivationLimit: false,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                isCircular: true,
                contents: [
                  {
                    active: true,
                    value: 'a',
                    index: 0,
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: false,
                    value: 'b',
                    index: 1,
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: true,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: true,
                    value: 'c',
                    index: 2,
                    isFirst: false,
                    isLast: true,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: true,
                    hasBeenActiveBefore: true,
                  },
                ],
              },
              {
                type: 'DEACTIVATED',
                index: 1,
                value: 'b',
                time: new Date(),
              }
            );
          });

          test('end to first should move right', () => {
            const { activeContent, subscriber } = setup({
              activeIndexes: [1, 0, 2],
              maxActivationLimit: false,
              isCircular: true,
            });

            activeContent.deactivateByIndex(2);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(
              subscriber,
              {
                active: ['b', 'a'],
                activeContents: [
                  activeContent.contents[1],
                  activeContent.contents[0],
                ],
                activeIndexes: [1, 0],
                lastActivated: 'a',
                lastActivatedContent: activeContent.contents[0],
                lastActivatedIndex: 0,
                direction: 'right',
                maxActivationLimit: false,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                isCircular: true,
                contents: [
                  {
                    active: true,
                    value: 'a',
                    index: 0,
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: true,
                    value: 'b',
                    index: 1,
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: true,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: false,
                    value: 'c',
                    index: 2,
                    isFirst: false,
                    isLast: true,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: true,
                    hasBeenActiveBefore: true,
                  },
                ],
              },
              {
                type: 'DEACTIVATED',
                index: 2,
                value: 'c',
                time: new Date(),
              }
            );
          });

          test('first to last should move left', () => {
            const { activeContent, subscriber } = setup({
              activeIndexes: [1, 2, 0],
              maxActivationLimit: false,
              isCircular: true,
            });

            activeContent.deactivateByIndex(0);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(
              subscriber,
              {
                active: ['b', 'c'],
                activeContents: [
                  activeContent.contents[1],
                  activeContent.contents[2],
                ],
                activeIndexes: [1, 2],
                lastActivated: 'c',
                lastActivatedContent: activeContent.contents[2],
                lastActivatedIndex: 2,
                direction: 'left',
                maxActivationLimit: false,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                isCircular: true,
                contents: [
                  {
                    active: false,
                    value: 'a',
                    index: 0,
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: true,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: true,
                    value: 'b',
                    index: 1,
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: true,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: true,
                    value: 'c',
                    index: 2,
                    isFirst: false,
                    isLast: true,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                ],
              },
              {
                type: 'DEACTIVATED',
                index: 0,
                value: 'a',
                time: new Date(),
              }
            );
          });
        });

        describe('when straight', () => {
          test('moving right when removing current lastActivatedIndex', () => {
            const { activeContent, subscriber } = setup({
              activeIndexes: [0, 2, 1],
              maxActivationLimit: false,
              isCircular: false,
            });

            activeContent.deactivateByIndex(1);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(
              subscriber,
              {
                active: ['a', 'c'],
                activeContents: [
                  activeContent.contents[0],
                  activeContent.contents[2],
                ],
                activeIndexes: [0, 2],
                lastActivated: 'c',
                lastActivatedContent: activeContent.contents[2],
                lastActivatedIndex: 2,
                direction: 'right',
                maxActivationLimit: false,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                isCircular: false,
                contents: [
                  {
                    active: true,
                    value: 'a',
                    index: 0,
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: false,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: false,
                    value: 'b',
                    index: 1,
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: true,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: true,
                    value: 'c',
                    index: 2,
                    isFirst: false,
                    isLast: true,
                    hasNext: false,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                ],
              },
              {
                type: 'DEACTIVATED',
                index: 1,
                value: 'b',
                time: new Date(),
              }
            );
          });

          test('moving right when not removing current lastActivatedIndex', () => {
            const { activeContent, subscriber } = setup({
              activeIndexes: [0, 1, 2],
              maxActivationLimit: false,
              isCircular: false,
            });

            activeContent.deactivateByIndex(1);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(
              subscriber,
              {
                active: ['a', 'c'],
                activeContents: [
                  activeContent.contents[0],
                  activeContent.contents[2],
                ],
                activeIndexes: [0, 2],
                lastActivated: 'c',
                lastActivatedContent: activeContent.contents[2],
                lastActivatedIndex: 2,
                direction: 'right',
                maxActivationLimit: false,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                isCircular: false,
                contents: [
                  {
                    active: true,
                    value: 'a',
                    index: 0,
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: false,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: false,
                    value: 'b',
                    index: 1,
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: true,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: true,
                    value: 'c',
                    index: 2,
                    isFirst: false,
                    isLast: true,
                    hasNext: false,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                ],
              },
              {
                type: 'DEACTIVATED',
                index: 1,
                value: 'b',
                time: new Date(),
              }
            );
          });

          test('moving left when removing current lastActivatedIndex', () => {
            const { activeContent, subscriber } = setup({
              activeIndexes: [2, 0, 1],
              maxActivationLimit: false,
              isCircular: false,
            });

            activeContent.deactivateByIndex(1);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(
              subscriber,
              {
                active: ['c', 'a'],
                activeContents: [
                  activeContent.contents[2],
                  activeContent.contents[0],
                ],
                activeIndexes: [2, 0],
                lastActivated: 'a',
                lastActivatedContent: activeContent.contents[0],
                lastActivatedIndex: 0,
                direction: 'left',
                maxActivationLimit: false,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                isCircular: false,
                contents: [
                  {
                    active: true,
                    value: 'a',
                    index: 0,
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: false,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: false,
                    value: 'b',
                    index: 1,
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: true,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: true,
                    value: 'c',
                    index: 2,
                    isFirst: false,
                    isLast: true,
                    hasNext: false,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                ],
              },
              {
                type: 'DEACTIVATED',
                index: 1,
                value: 'b',
                time: new Date(),
              }
            );
          });

          test('moving left when not removing current lastActivatedIndex', () => {
            const { activeContent, subscriber } = setup({
              activeIndexes: [2, 1, 0],
              maxActivationLimit: false,
              isCircular: false,
            });

            activeContent.deactivateByIndex(1);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(
              subscriber,
              {
                active: ['c', 'a'],
                activeContents: [
                  activeContent.contents[2],
                  activeContent.contents[0],
                ],
                activeIndexes: [2, 0],
                lastActivated: 'a',
                lastActivatedContent: activeContent.contents[0],
                lastActivatedIndex: 0,
                direction: 'left',
                maxActivationLimit: false,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                isCircular: false,
                contents: [
                  {
                    active: true,
                    value: 'a',
                    index: 0,
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: false,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: false,
                    value: 'b',
                    index: 1,
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: true,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: true,
                    value: 'c',
                    index: 2,
                    isFirst: false,
                    isLast: true,
                    hasNext: false,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                ],
              },
              {
                type: 'DEACTIVATED',
                index: 1,
                value: 'b',
                time: new Date(),
              }
            );
          });

          test('end to first should move left', () => {
            const { activeContent, subscriber } = setup({
              activeIndexes: [1, 0, 2],
              maxActivationLimit: false,
              isCircular: false,
            });

            activeContent.deactivateByIndex(2);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(
              subscriber,
              {
                active: ['b', 'a'],
                activeContents: [
                  activeContent.contents[1],
                  activeContent.contents[0],
                ],
                activeIndexes: [1, 0],
                lastActivated: 'a',
                lastActivatedContent: activeContent.contents[0],
                lastActivatedIndex: 0,
                direction: 'left',
                maxActivationLimit: false,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                isCircular: false,
                contents: [
                  {
                    active: true,
                    value: 'a',
                    index: 0,
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: false,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: true,
                    value: 'b',
                    index: 1,
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: true,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: false,
                    value: 'c',
                    index: 2,
                    isFirst: false,
                    isLast: true,
                    hasNext: false,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                ],
              },
              {
                type: 'DEACTIVATED',
                index: 2,
                value: 'c',
                time: new Date(),
              }
            );
          });

          test('first to last should move right', () => {
            const { activeContent, subscriber } = setup({
              activeIndexes: [1, 2, 0],
              maxActivationLimit: false,
              isCircular: false,
            });

            activeContent.deactivateByIndex(0);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(
              subscriber,
              {
                active: ['b', 'c'],
                activeContents: [
                  activeContent.contents[1],
                  activeContent.contents[2],
                ],
                activeIndexes: [1, 2],
                lastActivated: 'c',
                lastActivatedContent: activeContent.contents[2],
                lastActivatedIndex: 2,
                direction: 'right',
                maxActivationLimit: false,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                isCircular: false,
                contents: [
                  {
                    active: false,
                    value: 'a',
                    index: 0,
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: false,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: true,
                    value: 'b',
                    index: 1,
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: true,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: true,
                    value: 'c',
                    index: 2,
                    isFirst: false,
                    isLast: true,
                    hasNext: false,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                ],
              },
              {
                type: 'DEACTIVATED',
                index: 0,
                value: 'a',
                time: new Date(),
              }
            );
          });
        });
      });
    });

    describe('deactivate', () => {
      test('deactivate on item', () => {
        const { activeContent } = setup();

        jest.spyOn(activeContent, 'deactivateByIndex');

        activeContent.contents[1].deactivate({ isUserInteraction: false });

        expect(activeContent.deactivateByIndex).toHaveBeenCalledTimes(1);
        expect(activeContent.deactivateByIndex).toHaveBeenCalledWith(1, {
          isUserInteraction: false,
        });
      });

      test('deactivate on item after removal should work because the indexes should be fixed', () => {
        const { activeContent } = setup();

        jest.spyOn(activeContent, 'deactivateByIndex');

        // 'a' is active, by unshifting 'b' becomes active.
        activeContent.shift();

        // 'b' is now on the 0th index, deactivating it should make nothing active.
        activeContent.contents[0].deactivate({ isUserInteraction: false });

        expect(activeContent.deactivateByIndex).toHaveBeenCalledTimes(1);
        expect(activeContent.deactivateByIndex).toHaveBeenLastCalledWith(0, {
          isUserInteraction: false,
        });

        expect(activeContent.active).toEqual([]);
      });

      test('activate content by identity', () => {
        const { activeContent, contents } = setup();

        jest.spyOn(activeContent, 'deactivateByIndex');

        activeContent.deactivate(contents[1], {
          isUserInteraction: true,
        });

        expect(activeContent.deactivateByIndex).toHaveBeenCalledTimes(1);
        expect(activeContent.deactivateByIndex).toHaveBeenCalledWith(1, {
          isUserInteraction: true,
        });
      });

      test('throws item not found', () => {
        const { activeContent } = setup();

        jest.spyOn(activeContent, 'deactivateByIndex');

        expect(() => {
          activeContent.deactivate('d');
        }).toThrowError(
          'uiloos > ActiveList > getIndex > index cannot be found, item is not in contents array'
        );

        expect(() => {
          activeContent.deactivate('d');
        }).toThrowError(
          ActiveListItemNotFoundError
        );

        expect(activeContent.deactivateByIndex).toHaveBeenCalledTimes(0);
      });
    });

    describe('deactivateByPredicate', () => {
      test('when multiple items match they should all be deactivated', () => {
        // The two 'a's will match the predicate
        const { activeContent, subscriber } = setup(
          {
            activeIndexes: [0, 1, 2, 3],
            maxActivationLimit: false,
          },
          ['b', 'a', 'a', 'z']
        );

        activeContent.deactivateByPredicate(
          (data) => {
            expect(data.index).toBeDefined();
            expect(data.value).toBeDefined();
            
            expect(data.content).toBeDefined();
            expect(data.content).toBeInstanceOf(ActiveListContent);
            
            expect(data.activeList).toBeDefined();


            expect(data.activeList).toBeInstanceOf(ActiveList);
            return data.value === 'a';
          },
          {
            isUserInteraction: true,
          }
        );

        expect(subscriber).toHaveBeenCalledTimes(1);
        assertLastSubscriber(
          subscriber,
          {
            active: ['b', 'z'],
            activeContents: [
              activeContent.contents[0],
              activeContent.contents[3],
            ],
            activeIndexes: [0, 3],
            lastActivated: 'z',
            lastActivatedContent: activeContent.contents[3],
            lastActivatedIndex: 3,
            direction: 'right',
            maxActivationLimit: false,
            maxActivationLimitBehavior: 'circular',
            history: [],
            hasActiveChangedAtLeastOnce: true,
            isCircular: false,
            contents: [
              {
                active: true,
                value: 'b',
                index: 0,
                isFirst: true,
                isLast: false,
                hasNext: true,
                hasPrevious: false,
                isNext: false,
                isPrevious: false,
                hasBeenActiveBefore: true,
              },
              {
                active: false,
                value: 'a',
                index: 1,
                isFirst: false,
                isLast: false,
                hasNext: true,
                hasPrevious: true,
                isNext: false,
                isPrevious: false,
                hasBeenActiveBefore: true,
              },
              {
                active: false,
                value: 'a',
                index: 2,
                isFirst: false,
                isLast: false,
                hasNext: true,
                hasPrevious: true,
                isNext: false,
                isPrevious: true,
                hasBeenActiveBefore: true,
              },
              {
                active: true,
                value: 'z',
                index: 3,
                isFirst: false,
                isLast: true,
                hasNext: false,
                hasPrevious: true,
                isNext: false,
                isPrevious: false,
                hasBeenActiveBefore: true,
              },
            ],
          },
          {
            type: 'DEACTIVATED_MULTIPLE',
            indexes: [1, 2],
            values: ['a', 'a'],
            time: new Date(),
          }
        );
      });

      test('when no items match they should remain as they were', () => {
        // The two 'a's will match the predicate
        const { activeContent, subscriber } = setup(
          {
            activeIndexes: [0, 1, 3],
            maxActivationLimit: false,
          },
          ['b', 'a', 'a', 'z']
        );

        activeContent.deactivateByPredicate((data) => {
          expect(data.index).toBeDefined();
          expect(data.value).toBeDefined();
          
          expect(data.content).toBeDefined();
          expect(data.content).toBeInstanceOf(ActiveListContent);
          
          expect(data.activeList).toBeDefined();


          expect(data.activeList).toBeInstanceOf(ActiveList);
          return data.value === 'c';
        });

        expect(subscriber).toHaveBeenCalledTimes(1);
        assertLastSubscriber(
          subscriber,
          {
            active: ['b', 'a', 'z'],
            activeContents: [
              activeContent.contents[0],
              activeContent.contents[1],
              activeContent.contents[3],
            ],
            activeIndexes: [0, 1, 3],
            lastActivated: 'z',
            lastActivatedContent: activeContent.contents[3],
            lastActivatedIndex: 3,
            direction: 'right',
            maxActivationLimit: false,
            maxActivationLimitBehavior: 'circular',
            history: [],
            hasActiveChangedAtLeastOnce: false,
            isCircular: false,
            contents: [
              {
                active: true,
                value: 'b',
                index: 0,
                isFirst: true,
                isLast: false,
                hasNext: true,
                hasPrevious: false,
                isNext: false,
                isPrevious: false,
                hasBeenActiveBefore: true,
              },
              {
                active: true,
                value: 'a',
                index: 1,
                isFirst: false,
                isLast: false,
                hasNext: true,
                hasPrevious: true,
                isNext: false,
                isPrevious: false,
                hasBeenActiveBefore: true,
              },
              {
                active: false,
                value: 'a',
                index: 2,
                isFirst: false,
                isLast: false,
                hasNext: true,
                hasPrevious: true,
                isNext: false,
                isPrevious: true,
                hasBeenActiveBefore: false,
              },
              {
                active: true,
                value: 'z',
                index: 3,
                isFirst: false,
                isLast: true,
                hasNext: false,
                hasPrevious: true,
                isNext: false,
                isPrevious: false,
                hasBeenActiveBefore: true,
              },
            ],
          },
          {
            type: 'DEACTIVATED_MULTIPLE',
            indexes: [],
            values: [],
            time: new Date(),
          }
        );
      });
    });
  });

  describe('insertion of elements', () => {
    describe('when it throws out of bounds', () => {
      test('throws out of bounds when index is to large', () => {
        const { activeContent, subscriber } = setup();

        expect(() => {
          activeContent.insertAtIndex('d', 4);
        }).toThrowError(
          `uiloos > ActiveList > insertAtIndex > "index" is out of bounds`
        );

        expect(() => {
          activeContent.insertAtIndex('d',4 );
        }).toThrowError(
          ActiveListIndexOutOfBoundsError
        );

        expect(subscriber).toHaveBeenCalledTimes(0);
      });

      test('throws out of bounds when index is less than zero', () => {
        const { activeContent, subscriber } = setup();

        expect(() => {
          activeContent.insertAtIndex('d', -1);
        }).toThrowError(
          `uiloos > ActiveList > insertAtIndex > "index" is out of bounds`
        );

        expect(() => {
          activeContent.insertAtIndex('d', -1 );
        }).toThrowError(
          ActiveListIndexOutOfBoundsError
        );

        expect(subscriber).toHaveBeenCalledTimes(0);
      });
    });

    test('inserting the first element should not activate it', () => {
      const { activeContent, subscriber } = setup({}, []);

      activeContent.unshift('z');

      expect(subscriber).toHaveBeenCalledTimes(1);

      assertLastSubscriber(
        subscriber,
        {
          active: [],
          activeContents: [],
          activeIndexes: [],
          lastActivated: null,
          lastActivatedContent: null,
          lastActivatedIndex: -1,
          isCircular: false,
          direction: 'right',
          maxActivationLimit: 1,
          maxActivationLimitBehavior: 'circular',
          history: [],
          hasActiveChangedAtLeastOnce: false,
          contents: [
            {
              active: false,
              index: 0,
              value: 'z',
              isFirst: true,
              isLast: true,
              hasNext: false,
              hasPrevious: false,
              isNext: false,
              isPrevious: false,
              hasBeenActiveBefore: false,
            },
          ],
        },
        {
          type: 'INSERTED',
          value: 'z',
          index: 0,
          time: new Date(),
        }
      );
    });

    describe('inserting when maxActivationLimit is 1', () => {
      test('inserting at the start', () => {
        const { activeContent, subscriber } = setup({ activeIndexes: 0 });

        activeContent.unshift('d');

        expect(subscriber).toHaveBeenCalledTimes(1);

        assertLastSubscriber(
          subscriber,
          {
            active: ['a'],
            activeContents: [activeContent.contents[1]],
            activeIndexes: [1],
            lastActivated: 'a',
            lastActivatedContent: activeContent.contents[1],
            lastActivatedIndex: 1,
            isCircular: false,
            direction: 'right',
            maxActivationLimit: 1,
            maxActivationLimitBehavior: 'circular',
            history: [],
            hasActiveChangedAtLeastOnce: false,
            contents: [
              {
                active: false,
                index: 0,
                value: 'd',
                isFirst: true,
                isLast: false,
                hasNext: true,
                hasPrevious: false,
                isNext: false,
                isPrevious: true,
                hasBeenActiveBefore: false,
              },
              {
                active: true,
                index: 1,
                value: 'a',
                isFirst: false,
                isLast: false,
                hasNext: true,
                hasPrevious: true,
                isNext: false,
                isPrevious: false,
                hasBeenActiveBefore: true,
              },
              {
                active: false,
                index: 2,
                value: 'b',
                isFirst: false,
                isLast: false,
                hasNext: true,
                hasPrevious: true,
                isNext: true,
                isPrevious: false,
                hasBeenActiveBefore: false,
              },
              {
                active: false,
                index: 3,
                value: 'c',
                isFirst: false,
                isLast: true,
                hasNext: false,
                hasPrevious: true,
                isNext: false,
                isPrevious: false,
                hasBeenActiveBefore: false,
              },
            ],
          },
          {
            type: 'INSERTED',
            value: 'd',
            index: 0,
            time: new Date(),
          }
        );
      });

      test('inserting in the middle', () => {
        const { activeContent, subscriber } = setup({ activeIndexes: 0 });

        activeContent.insertAtIndex('d', 1);

        expect(subscriber).toHaveBeenCalledTimes(1);

        assertLastSubscriber(
          subscriber,
          {
            active: ['a'],
            activeContents: [activeContent.contents[0]],
            activeIndexes: [0],
            lastActivated: 'a',
            lastActivatedContent: activeContent.contents[0],
            lastActivatedIndex: 0,
            isCircular: false,
            direction: 'right',
            maxActivationLimit: 1,
            maxActivationLimitBehavior: 'circular',
            history: [],
            hasActiveChangedAtLeastOnce: false,
            contents: [
              {
                active: true,
                index: 0,
                value: 'a',
                isFirst: true,
                isLast: false,
                hasNext: true,
                hasPrevious: false,
                isNext: false,
                isPrevious: false,
                hasBeenActiveBefore: true,
              },
              {
                active: false,
                index: 1,
                value: 'd',
                isFirst: false,
                isLast: false,
                hasNext: true,
                hasPrevious: true,
                isNext: true,
                isPrevious: false,
                hasBeenActiveBefore: false,
              },
              {
                active: false,
                index: 2,
                value: 'b',
                isFirst: false,
                isLast: false,
                hasNext: true,
                hasPrevious: true,
                isNext: false,
                isPrevious: false,
                hasBeenActiveBefore: false,
              },
              {
                active: false,
                index: 3,
                value: 'c',
                isFirst: false,
                isLast: true,
                hasNext: false,
                hasPrevious: true,
                isNext: false,
                isPrevious: false,
                hasBeenActiveBefore: false,
              },
            ],
          },
          {
            type: 'INSERTED',
            value: 'd',
            index: 1,
            time: new Date(),
          }
        );
      });

      test('inserting at the end', () => {
        const { activeContent, subscriber } = setup({ activeIndexes: 0 });

        activeContent.push('d');

        expect(subscriber).toHaveBeenCalledTimes(1);

        assertLastSubscriber(
          subscriber,
          {
            active: ['a'],
            activeContents: [activeContent.contents[0]],
            activeIndexes: [0],
            lastActivated: 'a',
            lastActivatedContent: activeContent.contents[0],
            lastActivatedIndex: 0,
            isCircular: false,
            direction: 'right',
            maxActivationLimit: 1,
            maxActivationLimitBehavior: 'circular',
            history: [],
            hasActiveChangedAtLeastOnce: false,
            contents: [
              {
                active: true,
                index: 0,
                value: 'a',
                isFirst: true,
                isLast: false,
                hasNext: true,
                hasPrevious: false,
                isNext: false,
                isPrevious: false,
                hasBeenActiveBefore: true,
              },
              {
                active: false,
                index: 1,
                value: 'b',
                isFirst: false,
                isLast: false,
                hasNext: true,
                hasPrevious: true,
                isNext: true,
                isPrevious: false,
                hasBeenActiveBefore: false,
              },
              {
                active: false,
                index: 2,
                value: 'c',
                isFirst: false,
                isLast: false,
                hasNext: true,
                hasPrevious: true,
                isNext: false,
                isPrevious: false,
                hasBeenActiveBefore: false,
              },
              {
                active: false,
                index: 3,
                value: 'd',
                isFirst: false,
                isLast: true,
                hasNext: false,
                hasPrevious: true,
                isNext: false,
                isPrevious: false,
                hasBeenActiveBefore: false,
              },
            ],
          },
          {
            type: 'INSERTED',
            value: 'd',
            index: 3,
            time: new Date(),
          }
        );
      });
    });

    describe('inserting when maxActivationLimit is false', () => {
      test('inserting at the start', () => {
        const { activeContent, subscriber } = setup({
          activeIndexes: [0, 1, 2],
          maxActivationLimit: false,
        });

        activeContent.unshift('d');

        expect(subscriber).toHaveBeenCalledTimes(1);

        assertLastSubscriber(
          subscriber,
          {
            active: ['a', 'b', 'c'],
            activeContents: [
              activeContent.contents[1],
              activeContent.contents[2],
              activeContent.contents[3],
            ],
            activeIndexes: [1, 2, 3],
            lastActivated: 'c',
            lastActivatedContent: activeContent.contents[3],
            lastActivatedIndex: 3,
            isCircular: false,
            direction: 'right',
            maxActivationLimit: false,
            maxActivationLimitBehavior: 'circular',
            history: [],
            hasActiveChangedAtLeastOnce: false,
            contents: [
              {
                active: false,
                index: 0,
                value: 'd',
                isFirst: true,
                isLast: false,
                hasNext: true,
                hasPrevious: false,
                isNext: false,
                isPrevious: false,
                hasBeenActiveBefore: false,
              },
              {
                active: true,
                index: 1,
                value: 'a',
                isFirst: false,
                isLast: false,
                hasNext: true,
                hasPrevious: true,
                isNext: false,
                isPrevious: false,
                hasBeenActiveBefore: true,
              },
              {
                active: true,
                index: 2,
                value: 'b',
                isFirst: false,
                isLast: false,
                hasNext: true,
                hasPrevious: true,
                isNext: false,
                isPrevious: true,
                hasBeenActiveBefore: true,
              },
              {
                active: true,
                index: 3,
                value: 'c',
                isFirst: false,
                isLast: true,
                hasNext: false,
                hasPrevious: true,
                isNext: false,
                isPrevious: false,
                hasBeenActiveBefore: true,
              },
            ],
          },
          {
            type: 'INSERTED',
            value: 'd',
            index: 0,
            time: new Date(),
          }
        );
      });

      test('inserting in the middle', () => {
        const { activeContent, subscriber } = setup({
          activeIndexes: [0, 1, 2],
          maxActivationLimit: false,
        });

        activeContent.insertAtIndex('d', 1);

        expect(subscriber).toHaveBeenCalledTimes(1);

        assertLastSubscriber(
          subscriber,
          {
            active: ['a', 'b', 'c'],
            activeContents: [
              activeContent.contents[0],
              activeContent.contents[2],
              activeContent.contents[3],
            ],
            activeIndexes: [0, 2, 3],
            lastActivated: 'c',
            lastActivatedContent: activeContent.contents[3],
            lastActivatedIndex: 3,
            isCircular: false,
            direction: 'right',
            maxActivationLimit: false,
            maxActivationLimitBehavior: 'circular',
            history: [],
            hasActiveChangedAtLeastOnce: false,
            contents: [
              {
                active: true,
                index: 0,
                value: 'a',
                isFirst: true,
                isLast: false,
                hasNext: true,
                hasPrevious: false,
                isNext: false,
                isPrevious: false,
                hasBeenActiveBefore: true,
              },
              {
                active: false,
                index: 1,
                value: 'd',
                isFirst: false,
                isLast: false,
                hasNext: true,
                hasPrevious: true,
                isNext: false,
                isPrevious: false,
                hasBeenActiveBefore: false,
              },
              {
                active: true,
                index: 2,
                value: 'b',
                isFirst: false,
                isLast: false,
                hasNext: true,
                hasPrevious: true,
                isNext: false,
                isPrevious: true,
                hasBeenActiveBefore: true,
              },
              {
                active: true,
                index: 3,
                value: 'c',
                isFirst: false,
                isLast: true,
                hasNext: false,
                hasPrevious: true,
                isNext: false,
                isPrevious: false,
                hasBeenActiveBefore: true,
              },
            ],
          },
          {
            type: 'INSERTED',
            value: 'd',
            index: 1,
            time: new Date(),
          }
        );
      });

      test('inserting at the end', () => {
        const { activeContent, subscriber } = setup({
          activeIndexes: [0, 1, 2],
          maxActivationLimit: false,
        });

        activeContent.push('d');

        expect(subscriber).toHaveBeenCalledTimes(1);

        assertLastSubscriber(
          subscriber,
          {
            active: ['a', 'b', 'c'],
            activeContents: [
              activeContent.contents[0],
              activeContent.contents[1],
              activeContent.contents[2],
            ],
            activeIndexes: [0, 1, 2],
            lastActivated: 'c',
            lastActivatedContent: activeContent.contents[2],
            lastActivatedIndex: 2,
            isCircular: false,
            direction: 'right',
            maxActivationLimit: false,
            maxActivationLimitBehavior: 'circular',
            history: [],
            hasActiveChangedAtLeastOnce: false,
            contents: [
              {
                active: true,
                index: 0,
                value: 'a',
                isFirst: true,
                isLast: false,
                hasNext: true,
                hasPrevious: false,
                isNext: false,
                isPrevious: false,
                hasBeenActiveBefore: true,
              },
              {
                active: true,
                index: 1,
                value: 'b',
                isFirst: false,
                isLast: false,
                hasNext: true,
                hasPrevious: true,
                isNext: false,
                isPrevious: true,
                hasBeenActiveBefore: true,
              },
              {
                active: true,
                index: 2,
                value: 'c',
                isFirst: false,
                isLast: false,
                hasNext: true,
                hasPrevious: true,
                isNext: false,
                isPrevious: false,
                hasBeenActiveBefore: true,
              },
              {
                active: false,
                index: 3,
                value: 'd',
                isFirst: false,
                isLast: true,
                hasNext: false,
                hasPrevious: true,
                isNext: true,
                isPrevious: false,
                hasBeenActiveBefore: false,
              },
            ],
          },
          {
            type: 'INSERTED',
            value: 'd',
            index: 3,
            time: new Date(),
          }
        );
      });
    });

    describe('insertByPredicate', () => {
      test('when no predicate matches do nothing', () => {
        const { activeContent, subscriber } = setup({ activeIndexes: 0 });

        activeContent.insertByPredicate('z', ({ value }) => value === 'y', {
          mode: 'at',
        });

        expect(subscriber).toHaveBeenCalledTimes(0);
      });

      test('when no mode is provided assume at', () => {
        const { activeContent, subscriber } = setup({ activeIndexes: 0 });

        activeContent.insertByPredicate('d', ({ value }) => value === 'b');

        expect(subscriber).toHaveBeenCalledTimes(1);

        assertLastSubscriber(
          subscriber,
          {
            active: ['a'],
            activeContents: [activeContent.contents[0]],
            activeIndexes: [0],
            lastActivated: 'a',
            lastActivatedContent: activeContent.contents[0],
            lastActivatedIndex: 0,
            isCircular: false,
            direction: 'right',

            maxActivationLimit: 1,
            maxActivationLimitBehavior: 'circular',
            history: [],
            hasActiveChangedAtLeastOnce: false,
            contents: [
              {
                active: true,
                index: 0,
                value: 'a',
                isFirst: true,
                isLast: false,
                hasNext: true,
                hasPrevious: false,
                isNext: false,
                isPrevious: false,
                hasBeenActiveBefore: true,
              },
              {
                active: false,
                index: 1,
                value: 'd',
                isFirst: false,
                isLast: false,
                hasNext: true,
                hasPrevious: true,
                isNext: true,
                isPrevious: false,
                hasBeenActiveBefore: false,
              },
              {
                active: false,
                index: 2,
                value: 'b',
                isFirst: false,
                isLast: false,
                hasNext: true,
                hasPrevious: true,
                isNext: false,
                isPrevious: false,
                hasBeenActiveBefore: false,
              },
              {
                active: false,
                index: 3,
                value: 'c',
                isFirst: false,
                isLast: true,
                hasNext: false,
                hasPrevious: true,
                isNext: false,
                isPrevious: false,
                hasBeenActiveBefore: false,
              },
            ],
          },
          {
            type: 'INSERTED',
            value: 'd',
            index: 1,
            time: new Date(),
          }
        );
      });

      test('mode is at', () => {
        const { activeContent, subscriber } = setup({ activeIndexes: 0 });

        activeContent.insertByPredicate('d', ({ value }) => value === 'b', {
          mode: 'at',
        });

        expect(subscriber).toHaveBeenCalledTimes(1);

        assertLastSubscriber(
          subscriber,
          {
            active: ['a'],
            activeContents: [activeContent.contents[0]],
            activeIndexes: [0],
            lastActivated: 'a',
            lastActivatedContent: activeContent.contents[0],
            lastActivatedIndex: 0,
            isCircular: false,
            direction: 'right',

            maxActivationLimit: 1,
            maxActivationLimitBehavior: 'circular',
            history: [],
            hasActiveChangedAtLeastOnce: false,
            contents: [
              {
                active: true,
                index: 0,
                value: 'a',
                isFirst: true,
                isLast: false,
                hasNext: true,
                hasPrevious: false,
                isNext: false,
                isPrevious: false,
                hasBeenActiveBefore: true,
              },
              {
                active: false,
                index: 1,
                value: 'd',
                isFirst: false,
                isLast: false,
                hasNext: true,
                hasPrevious: true,
                isNext: true,
                isPrevious: false,
                hasBeenActiveBefore: false,
              },
              {
                active: false,
                index: 2,
                value: 'b',
                isFirst: false,
                isLast: false,
                hasNext: true,
                hasPrevious: true,
                isNext: false,
                isPrevious: false,
                hasBeenActiveBefore: false,
              },
              {
                active: false,
                index: 3,
                value: 'c',
                isFirst: false,
                isLast: true,
                hasNext: false,
                hasPrevious: true,
                isNext: false,
                isPrevious: false,
                hasBeenActiveBefore: false,
              },
            ],
          },
          {
            type: 'INSERTED',
            value: 'd',
            index: 1,
            time: new Date(),
          }
        );
      });

      describe('mode is before', () => {
        test('when first item returns true add at start and not at -1', () => {
          const { activeContent, subscriber } = setup({ activeIndexes: 0 });

          activeContent.insertByPredicate('d', ({ value }) => value === 'a', {
            mode: 'before',
          });

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['a'],
              activeContents: [activeContent.contents[1]],
              activeIndexes: [1],
              lastActivated: 'a',
              lastActivatedContent: activeContent.contents[1],
              lastActivatedIndex: 1,
              isCircular: false,
              direction: 'right',

              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              contents: [
                {
                  active: false,
                  index: 0,
                  value: 'd',
                  isFirst: true,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: false,
                  isNext: false,
                  isPrevious: true,
                  hasBeenActiveBefore: false,
                },
                {
                  active: true,
                  index: 1,
                  value: 'a',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: false,
                  index: 2,
                  value: 'b',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: true,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 3,
                  value: 'c',
                  isFirst: false,
                  isLast: true,
                  hasNext: false,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
              ],
            },
            {
              type: 'INSERTED',
              value: 'd',
              index: 0,
              time: new Date(),
            }
          );
        });

        test('when item returns true insert before predicate', () => {
          const { activeContent, subscriber } = setup({ activeIndexes: 0 });

          activeContent.insertByPredicate('d', ({ value }) => value === 'b', {
            mode: 'before',
          });

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['a'],
              activeContents: [activeContent.contents[1]],
              activeIndexes: [1],
              lastActivated: 'a',
              lastActivatedContent: activeContent.contents[1],
              lastActivatedIndex: 1,
              isCircular: false,
              direction: 'right',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              contents: [
                {
                  active: false,
                  index: 0,
                  value: 'd',
                  isFirst: true,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: false,
                  isNext: false,
                  isPrevious: true,
                  hasBeenActiveBefore: false,
                },
                {
                  active: true,
                  index: 1,
                  value: 'a',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: false,
                  index: 2,
                  value: 'b',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: true,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 3,
                  value: 'c',
                  isFirst: false,
                  isLast: true,
                  hasNext: false,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
              ],
            },
            {
              type: 'INSERTED',
              value: 'd',
              index: 0,
              time: new Date(),
            }
          );
        });
      });

      describe('mode is after', () => {
        test('when last item returns true add at end and not after', () => {
          const { activeContent, subscriber } = setup({ activeIndexes: 0 });

          activeContent.insertByPredicate('d', ({ value }) => value === 'c', {
            mode: 'after',
          });

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['a'],
              activeContents: [activeContent.contents[0]],
              activeIndexes: [0],
              lastActivated: 'a',
              lastActivatedContent: activeContent.contents[0],
              lastActivatedIndex: 0,
              isCircular: false,
              direction: 'right',

              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              contents: [
                {
                  active: true,
                  index: 0,
                  value: 'a',
                  isFirst: true,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: false,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: false,
                  index: 1,
                  value: 'b',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: true,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 2,
                  value: 'c',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 3,
                  value: 'd',
                  isFirst: false,
                  isLast: true,
                  hasNext: false,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
              ],
            },
            {
              type: 'INSERTED',
              value: 'd',
              index: 3,
              time: new Date(),
            }
          );
        });

        test('when item returns true insert after predicate', () => {
          const { activeContent, subscriber } = setup({ activeIndexes: 0 });

          activeContent.insertByPredicate('d', ({ value }) => value === 'b', {
            mode: 'after',
          });

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['a'],
              activeContents: [activeContent.contents[0]],
              activeIndexes: [0],
              lastActivated: 'a',
              lastActivatedContent: activeContent.contents[0],
              lastActivatedIndex: 0,
              isCircular: false,
              direction: 'right',

              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              contents: [
                {
                  active: true,
                  index: 0,
                  value: 'a',
                  isFirst: true,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: false,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: false,
                  index: 1,
                  value: 'b',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: true,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 2,
                  value: 'd',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 3,
                  value: 'c',
                  isFirst: false,
                  isLast: true,
                  hasNext: false,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
              ],
            },
            {
              type: 'INSERTED',
              value: 'd',
              index: 2,
              time: new Date(),
            }
          );
        });
      });
    });
  });

  describe('removal of elements', () => {
    describe('removeByIndex based removal', () => {
      describe('when it throws out of bounds', () => {
        test('throws out of bounds when index is to large', () => {
          const { activeContent, subscriber } = setup();

          expect(() => {
            activeContent.removeByIndex(4);
          }).toThrowError(
            `uiloos > ActiveList > removeByIndex > "index" is out of bounds`
          );

          expect(() => {
            activeContent.removeByIndex(4);
          }).toThrowError(
            ActiveListIndexOutOfBoundsError
          );

          expect(() => {
            activeContent.removeByIndex(3);
          }).toThrowError(
            `uiloos > ActiveList > removeByIndex > "index" is out of bounds`
          );

          expect(() => {
            activeContent.removeByIndex(3);
          }).toThrowError(
            ActiveListIndexOutOfBoundsError
          );

          expect(subscriber).toHaveBeenCalledTimes(0);
        });

        test('throws out of bounds when index is less than zero', () => {
          const { activeContent, subscriber } = setup();

          expect(() => {
            activeContent.removeByIndex(-1);
          }).toThrowError(
            `uiloos > ActiveList > removeByIndex > "index" is out of bounds`
          );

          expect(() => {
            activeContent.removeByIndex(-1);
          }).toThrowError(
            ActiveListIndexOutOfBoundsError
          );

          expect(subscriber).toHaveBeenCalledTimes(0);
        });
      });

      test('removing first item', () => {
        const { activeContent, subscriber } = setup({ activeIndexes: 0 }, [
          'a',
        ]);

        activeContent.shift();

        expect(subscriber).toHaveBeenCalledTimes(1);

        assertLastSubscriber(
          subscriber,
          {
            active: [],
            activeContents: [],
            activeIndexes: [],
            lastActivated: null,
            lastActivatedContent: null,
            lastActivatedIndex: -1,
            isCircular: false,
            direction: 'right',
            maxActivationLimit: 1,
            maxActivationLimitBehavior: 'circular',
            history: [],
            hasActiveChangedAtLeastOnce: true,
            contents: [],
          },
          {
            type: 'REMOVED',
            value: 'a',
            index: 0,
            time: new Date(),
          }
        );
      });

      test('removing last item', () => {
        const { activeContent, subscriber } = setup({ activeIndexes: 0 }, [
          'a',
        ]);

        activeContent.pop();

        expect(subscriber).toHaveBeenCalledTimes(1);

        assertLastSubscriber(
          subscriber,
          {
            active: [],
            activeContents: [],
            activeIndexes: [],
            lastActivated: null,
            lastActivatedContent: null,
            lastActivatedIndex: -1,
            isCircular: false,
            direction: 'right',
            maxActivationLimit: 1,
            maxActivationLimitBehavior: 'circular',
            history: [],
            hasActiveChangedAtLeastOnce: true,
            contents: [],
          },
          {
            type: 'REMOVED',
            value: 'a',
            index: 0,
            time: new Date(),
          }
        );
      });

      describe('removal when maxActivationLimit is 1', () => {
        describe('removing single inactive element', () => {
          test('removing from the start', () => {
            const { activeContent, subscriber } = setup({ activeIndexes: 1 });

            const removedValue = activeContent.shift();

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(
              subscriber,
              {
                active: ['b'],
                activeContents: [activeContent.contents[0]],
                activeIndexes: [0],
                lastActivated: 'b',
                lastActivatedContent: activeContent.contents[0],
                lastActivatedIndex: 0,
                isCircular: false,
                direction: 'right',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: false,
                contents: [
                  {
                    active: true,
                    index: 0,
                    value: 'b',
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: false,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: false,
                    index: 1,
                    value: 'c',
                    isFirst: false,
                    isLast: true,
                    hasNext: false,
                    hasPrevious: true,
                    isNext: true,
                    isPrevious: false,
                    hasBeenActiveBefore: false,
                  },
                ],
              },
              {
                type: 'REMOVED',
                value: 'a',
                index: 0,
                time: new Date(),
              }
            );

            expect(removedValue).toBe('a');
          });

          test('removing from the middle', () => {
            const { activeContent, subscriber } = setup({ activeIndexes: 0 });

            const removedValue = activeContent.removeByIndex(1);

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(
              subscriber,
              {
                active: ['a'],
                activeContents: [activeContent.contents[0]],
                activeIndexes: [0],
                lastActivated: 'a',
                lastActivatedContent: activeContent.contents[0],
                lastActivatedIndex: 0,
                isCircular: false,
                direction: 'right',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: false,
                contents: [
                  {
                    active: true,
                    index: 0,
                    value: 'a',
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: false,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: false,
                    index: 1,
                    value: 'c',
                    isFirst: false,
                    isLast: true,
                    hasNext: false,
                    hasPrevious: true,
                    isNext: true,
                    isPrevious: false,
                    hasBeenActiveBefore: false,
                  },
                ],
              },
              {
                type: 'REMOVED',
                value: 'b',
                index: 1,
                time: new Date(),
              }
            );

            expect(removedValue).toBe('b');
          });

          test('removing from the end', () => {
            const { activeContent, subscriber } = setup({ activeIndexes: 0 });

            const removedValue = activeContent.pop();

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(
              subscriber,
              {
                active: ['a'],
                activeContents: [activeContent.contents[0]],
                activeIndexes: [0],
                lastActivated: 'a',
                lastActivatedContent: activeContent.contents[0],
                lastActivatedIndex: 0,
                isCircular: false,
                direction: 'right',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: false,
                contents: [
                  {
                    active: true,
                    index: 0,
                    value: 'a',
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: false,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: false,
                    index: 1,
                    value: 'b',
                    isFirst: false,
                    isLast: true,
                    hasNext: false,
                    hasPrevious: true,
                    isNext: true,
                    isPrevious: false,
                    hasBeenActiveBefore: false,
                  },
                ],
              },
              {
                type: 'REMOVED',
                value: 'c',
                index: 2,
                time: new Date(),
              }
            );

            expect(removedValue).toBe('c');
          });
        });

        describe('removing single active element', () => {
          test('removing from the start', () => {
            const { activeContent, subscriber } = setup({ activeIndexes: 0 });

            const removedValue = activeContent.shift();

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(
              subscriber,
              {
                active: [],
                activeContents: [],
                activeIndexes: [],
                lastActivated: null,
                lastActivatedContent: null,
                lastActivatedIndex: -1,
                isCircular: false,
                direction: 'right',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                contents: [
                  {
                    active: false,
                    index: 0,
                    value: 'b',
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: false,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: false,
                  },
                  {
                    active: false,
                    index: 1,
                    value: 'c',
                    isFirst: false,
                    isLast: true,
                    hasNext: false,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: false,
                  },
                ],
              },
              {
                type: 'REMOVED',
                value: 'a',
                index: 0,
                time: new Date(),
              }
            );

            expect(removedValue).toBe('a');
          });

          test('removing from the middle', () => {
            const { activeContent, subscriber } = setup({ activeIndexes: 1 });

            const removedValue = activeContent.removeByIndex(1);

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(
              subscriber,
              {
                active: [],
                activeContents: [],
                activeIndexes: [],
                lastActivated: null,
                lastActivatedContent: null,
                lastActivatedIndex: -1,
                isCircular: false,
                direction: 'right',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                contents: [
                  {
                    active: false,
                    index: 0,
                    value: 'a',
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: false,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: false,
                  },
                  {
                    active: false,
                    index: 1,
                    value: 'c',
                    isFirst: false,
                    isLast: true,
                    hasNext: false,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: false,
                  },
                ],
              },
              {
                type: 'REMOVED',
                value: 'b',
                index: 1,
                time: new Date(),
              }
            );

            expect(removedValue).toBe('b');
          });

          test('removing from the end', () => {
            const { activeContent, subscriber } = setup({ activeIndexes: 2 });

            const removedValue = activeContent.pop();

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(
              subscriber,
              {
                active: [],
                activeContents: [],
                activeIndexes: [],
                lastActivated: null,
                lastActivatedContent: null,
                lastActivatedIndex: -1,
                isCircular: false,
                direction: 'right',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                contents: [
                  {
                    active: false,
                    index: 0,
                    value: 'a',
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: false,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: false,
                  },
                  {
                    active: false,
                    index: 1,
                    value: 'b',
                    isFirst: false,
                    isLast: true,
                    hasNext: false,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: false,
                  },
                ],
              },
              {
                type: 'REMOVED',
                value: 'c',
                index: 2,
                time: new Date(),
              }
            );

            expect(removedValue).toBe('c');
          });
        });
      });

      describe('removal when maxActivationLimit is false', () => {
        test('removing from the start', () => {
          const { activeContent, subscriber } = setup({
            activeIndexes: [0, 1, 2],
            maxActivationLimit: false,
          });

          const removedValue = activeContent.shift();

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['b', 'c'],
              activeContents: [
                activeContent.contents[0],
                activeContent.contents[1],
              ],
              activeIndexes: [0, 1],
              lastActivated: 'c',
              lastActivatedContent: activeContent.contents[1],
              lastActivatedIndex: 1,
              isCircular: false,
              direction: 'right',
              maxActivationLimit: false,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: true,
              contents: [
                {
                  active: true,
                  index: 0,
                  value: 'b',
                  isFirst: true,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: false,
                  isNext: false,
                  isPrevious: true,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 1,
                  value: 'c',
                  isFirst: false,
                  isLast: true,
                  hasNext: false,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
              ],
            },
            {
              type: 'REMOVED',
              value: 'a',
              index: 0,
              time: new Date(),
            }
          );

          expect(removedValue).toBe('a');
        });

        test('removing from the middle', () => {
          const { activeContent, subscriber } = setup({
            activeIndexes: [0, 1, 2],
            maxActivationLimit: false,
          });

          const removedValue = activeContent.removeByIndex(1);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['a', 'c'],
              activeContents: [
                activeContent.contents[0],
                activeContent.contents[1],
              ],
              activeIndexes: [0, 1],
              lastActivated: 'c',
              lastActivatedContent: activeContent.contents[1],
              lastActivatedIndex: 1,
              isCircular: false,
              direction: 'right',
              maxActivationLimit: false,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: true,
              contents: [
                {
                  active: true,
                  index: 0,
                  value: 'a',
                  isFirst: true,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: false,
                  isNext: false,
                  isPrevious: true,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 1,
                  value: 'c',
                  isFirst: false,
                  isLast: true,
                  hasNext: false,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
              ],
            },
            {
              type: 'REMOVED',
              value: 'b',
              index: 1,
              time: new Date(),
            }
          );

          expect(removedValue).toBe('b');
        });

        test('removing from the end', () => {
          const { activeContent, subscriber } = setup({
            activeIndexes: [0, 1, 2],
            maxActivationLimit: false,
          });

          const removedValue = activeContent.pop();

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['a', 'b'],
              activeContents: [
                activeContent.contents[0],
                activeContent.contents[1],
              ],
              activeIndexes: [0, 1],
              lastActivated: 'b',
              lastActivatedContent: activeContent.contents[1],
              lastActivatedIndex: 1,
              isCircular: false,
              direction: 'right',
              maxActivationLimit: false,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: true,
              contents: [
                {
                  active: true,
                  index: 0,
                  value: 'a',
                  isFirst: true,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: false,
                  isNext: false,
                  isPrevious: true,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 1,
                  value: 'b',
                  isFirst: false,
                  isLast: true,
                  hasNext: false,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
              ],
            },
            {
              type: 'REMOVED',
              value: 'c',
              index: 2,
              time: new Date(),
            }
          );

          expect(removedValue).toBe('c');
        });
      });

      test('empty on pop returns undefined', () => {
        const { activeContent, subscriber } = setup({}, []);

        const removed = activeContent.pop();

        expect(subscriber).toHaveBeenCalledTimes(0);

        assertState(activeContent, {
          active: [],
          activeContents: [],
          activeIndexes: [],
          lastActivated: null,
          lastActivatedContent: null,
          lastActivatedIndex: -1,
          isCircular: false,
          direction: 'right',
          maxActivationLimit: 1,
          maxActivationLimitBehavior: 'circular',
          history: [],
          hasActiveChangedAtLeastOnce: false,
          contents: [],
        });

        expect(removed).toBe(undefined);
      });

      test('empty on shift returns undefined', () => {
        const { activeContent, subscriber } = setup({}, []);

        const removed = activeContent.shift();

        expect(subscriber).toHaveBeenCalledTimes(0);

        assertState(activeContent, {
          active: [],
          activeContents: [],
          activeIndexes: [],
          lastActivated: null,
          lastActivatedContent: null,
          lastActivatedIndex: -1,
          isCircular: false,
          direction: 'right',
          maxActivationLimit: 1,
          maxActivationLimitBehavior: 'circular',
          history: [],
          hasActiveChangedAtLeastOnce: false,
          contents: [],
        });

        expect(removed).toBe(undefined);
      });

      test('remove on item', () => {
        const { activeContent } = setup();

        jest.spyOn(activeContent, 'removeByIndex');

        activeContent.contents[1].remove();

        expect(activeContent.removeByIndex).toHaveBeenCalledTimes(1);
        expect(activeContent.removeByIndex).toHaveBeenCalledWith(1);
      });

      test('remove on item after another removal', () => {
        const { activeContent } = setup();

        jest.spyOn(activeContent, 'removeByIndex');

        activeContent.shift();

        activeContent.contents[0].remove();

        expect(activeContent.removeByIndex).toHaveBeenCalledTimes(2);
        expect(activeContent.removeByIndex).toHaveBeenLastCalledWith(0);

        expect(activeContent.contents.map((c) => c.value)).toEqual(['c']);
      });
    });

    describe('removing with predicate', () => {
      describe('when maxActivationLimit is 1', () => {
        test('all removal', () => {
          const { activeContent, subscriber } = setup({ activeIndexes: 0 });

          const removed = activeContent.removeByPredicate(() => true);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: [],
              activeContents: [],
              activeIndexes: [],
              lastActivated: null,
              lastActivatedContent: null,
              lastActivatedIndex: -1,
              isCircular: false,
              direction: 'right',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: true,
              contents: [],
            },
            {
              type: 'REMOVED_MULTIPLE',
              values: ['a', 'b', 'c'],
              indexes: [0, 1, 2],
              time: new Date(),
            }
          );

          expect(removed).toEqual(['a', 'b', 'c']);
        });

        describe('predicate matches one element', () => {
          describe('removing inactive element', () => {
            test('start removal', () => {
              const { activeContent, subscriber } = setup({ activeIndexes: 1 });

              const removed = activeContent.removeByPredicate(
                ({ value }) => value === 'a'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(
                subscriber,
                {
                  active: ['b'],
                  activeContents: [activeContent.contents[0]],
                  activeIndexes: [0],
                  lastActivated: 'b',
                  lastActivatedContent: activeContent.contents[0],
                  lastActivatedIndex: 0,
                  isCircular: false,
                  direction: 'right',
                  maxActivationLimit: 1,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: false,
                  contents: [
                    {
                      active: true,
                      index: 0,
                      value: 'b',
                      isFirst: true,
                      isLast: false,
                      hasNext: true,
                      hasPrevious: false,
                      isNext: false,
                      isPrevious: false,
                      hasBeenActiveBefore: true,
                    },
                    {
                      active: false,
                      index: 1,
                      value: 'c',
                      isFirst: false,
                      isLast: true,
                      hasNext: false,
                      hasPrevious: true,
                      isNext: true,
                      isPrevious: false,
                      hasBeenActiveBefore: false,
                    },
                  ],
                },
                {
                  type: 'REMOVED_MULTIPLE',
                  values: ['a'],
                  indexes: [0],
                  time: new Date(),
                }
              );

              expect(removed).toEqual(['a']);
            });

            test('middle removal', () => {
              const { activeContent, subscriber } = setup({ activeIndexes: 0 });

              const removed = activeContent.removeByPredicate(
                ({ value }) => value === 'b'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(
                subscriber,
                {
                  active: ['a'],
                  activeContents: [activeContent.contents[0]],
                  activeIndexes: [0],
                  lastActivated: 'a',
                  lastActivatedContent: activeContent.contents[0],
                  lastActivatedIndex: 0,
                  isCircular: false,
                  direction: 'right',
                  maxActivationLimit: 1,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: false,
                  contents: [
                    {
                      active: true,
                      index: 0,
                      value: 'a',
                      isFirst: true,
                      isLast: false,
                      hasNext: true,
                      hasPrevious: false,
                      isNext: false,
                      isPrevious: false,
                      hasBeenActiveBefore: true,
                    },
                    {
                      active: false,
                      index: 1,
                      value: 'c',
                      isFirst: false,
                      isLast: true,
                      hasNext: false,
                      hasPrevious: true,
                      isNext: true,
                      isPrevious: false,
                      hasBeenActiveBefore: false,
                    },
                  ],
                },
                {
                  type: 'REMOVED_MULTIPLE',
                  values: ['b'],
                  indexes: [1],
                  time: new Date(),
                }
              );

              expect(removed).toEqual(['b']);
            });

            test('end removal', () => {
              const { activeContent, subscriber } = setup({ activeIndexes: 0 });

              const removed = activeContent.removeByPredicate(
                ({ value }) => value === 'c'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(
                subscriber,
                {
                  active: ['a'],
                  activeContents: [activeContent.contents[0]],
                  activeIndexes: [0],
                  lastActivated: 'a',
                  lastActivatedContent: activeContent.contents[0],
                  lastActivatedIndex: 0,
                  isCircular: false,
                  direction: 'right',
                  maxActivationLimit: 1,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: false,
                  contents: [
                    {
                      active: true,
                      index: 0,
                      value: 'a',
                      isFirst: true,
                      isLast: false,
                      hasNext: true,
                      hasPrevious: false,
                      isNext: false,
                      isPrevious: false,
                      hasBeenActiveBefore: true,
                    },
                    {
                      active: false,
                      index: 1,
                      value: 'b',
                      isFirst: false,
                      isLast: true,
                      hasNext: false,
                      hasPrevious: true,
                      isNext: true,
                      isPrevious: false,
                      hasBeenActiveBefore: false,
                    },
                  ],
                },
                {
                  type: 'REMOVED_MULTIPLE',
                  values: ['c'],
                  indexes: [2],
                  time: new Date(),
                }
              );

              expect(removed).toEqual(['c']);
            });
          });

          describe('removing active element', () => {
            test('start removal', () => {
              const { activeContent, subscriber } = setup({ activeIndexes: 0 });

              const removed = activeContent.removeByPredicate(
                ({ value }) => value === 'a'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(
                subscriber,
                {
                  active: [],
                  activeContents: [],
                  activeIndexes: [],
                  lastActivated: null,
                  lastActivatedContent: null,
                  lastActivatedIndex: -1,
                  isCircular: false,
                  direction: 'right',
                  maxActivationLimit: 1,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: true,
                  contents: [
                    {
                      active: false,
                      index: 0,
                      value: 'b',
                      isFirst: true,
                      isLast: false,
                      hasNext: true,
                      hasPrevious: false,
                      isNext: false,
                      isPrevious: false,
                      hasBeenActiveBefore: false,
                    },
                    {
                      active: false,
                      index: 1,
                      value: 'c',
                      isFirst: false,
                      isLast: true,
                      hasNext: false,
                      hasPrevious: true,
                      isNext: false,
                      isPrevious: false,
                      hasBeenActiveBefore: false,
                    },
                  ],
                },
                {
                  type: 'REMOVED_MULTIPLE',
                  values: ['a'],
                  indexes: [0],
                  time: new Date(),
                }
              );

              expect(removed).toEqual(['a']);
            });

            test('middle removal', () => {
              const { activeContent, subscriber } = setup({ activeIndexes: 1 });

              const removed = activeContent.removeByPredicate(
                ({ value }) => value === 'b'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(
                subscriber,
                {
                  active: [],
                  activeContents: [],
                  activeIndexes: [],
                  lastActivated: null,
                  lastActivatedContent: null,
                  lastActivatedIndex: -1,
                  isCircular: false,
                  direction: 'right',
                  maxActivationLimit: 1,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: true,
                  contents: [
                    {
                      active: false,
                      index: 0,
                      value: 'a',
                      isFirst: true,
                      isLast: false,
                      hasNext: true,
                      hasPrevious: false,
                      isNext: false,
                      isPrevious: false,
                      hasBeenActiveBefore: false,
                    },
                    {
                      active: false,
                      index: 1,
                      value: 'c',
                      isFirst: false,
                      isLast: true,
                      hasNext: false,
                      hasPrevious: true,
                      isNext: false,
                      isPrevious: false,
                      hasBeenActiveBefore: false,
                    },
                  ],
                },
                {
                  type: 'REMOVED_MULTIPLE',
                  values: ['b'],
                  indexes: [1],
                  time: new Date(),
                }
              );

              expect(removed).toEqual(['b']);
            });

            test('end removal', () => {
              const { activeContent, subscriber } = setup({ activeIndexes: 2 });

              const removed = activeContent.removeByPredicate(
                ({ value }) => value === 'c'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(
                subscriber,
                {
                  active: [],
                  activeContents: [],
                  activeIndexes: [],
                  lastActivated: null,
                  lastActivatedContent: null,
                  lastActivatedIndex: -1,
                  isCircular: false,
                  direction: 'right',
                  maxActivationLimit: 1,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: true,
                  contents: [
                    {
                      active: false,
                      index: 0,
                      value: 'a',
                      isFirst: true,
                      isLast: false,
                      hasNext: true,
                      hasPrevious: false,
                      isNext: false,
                      isPrevious: false,
                      hasBeenActiveBefore: false,
                    },
                    {
                      active: false,
                      index: 1,
                      value: 'b',
                      isFirst: false,
                      isLast: true,
                      hasNext: false,
                      hasPrevious: true,
                      isNext: false,
                      isPrevious: false,
                      hasBeenActiveBefore: false,
                    },
                  ],
                },
                {
                  type: 'REMOVED_MULTIPLE',
                  values: ['c'],
                  indexes: [2],
                  time: new Date(),
                }
              );

              expect(removed).toEqual(['c']);
            });
          });
        });

        describe('predicate matches multiple element', () => {
          describe('removing inactive elements', () => {
            test('start removal', () => {
              const { activeContent, subscriber } = setup({ activeIndexes: 2 });

              const removed = activeContent.removeByPredicate(
                ({ value }) => value === 'a' || value === 'b'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(
                subscriber,
                {
                  active: ['c'],
                  activeContents: [activeContent.contents[0]],
                  activeIndexes: [0],
                  lastActivated: 'c',
                  lastActivatedContent: activeContent.contents[0],
                  lastActivatedIndex: 0,
                  isCircular: false,
                  direction: 'right',
                  maxActivationLimit: 1,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: false,
                  contents: [
                    {
                      active: true,
                      index: 0,
                      value: 'c',
                      isFirst: true,
                      isLast: true,
                      hasNext: false,
                      hasPrevious: false,
                      isNext: false,
                      isPrevious: false,
                      hasBeenActiveBefore: true,
                    },
                  ],
                },
                {
                  type: 'REMOVED_MULTIPLE',
                  values: ['a', 'b'],
                  indexes: [0, 1],
                  time: new Date(),
                }
              );

              expect(removed).toEqual(['a', 'b']);
            });

            test('middle removal #0', () => {
              const { activeContent, subscriber } = setup(
                { activeIndexes: 0 },
                ['a', 'b', 'c', 'd']
              );

              const removed = activeContent.removeByPredicate(
                ({ value }) => value === 'b' || value === 'c'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(
                subscriber,
                {
                  active: ['a'],
                  activeContents: [activeContent.contents[0]],
                  activeIndexes: [0],
                  lastActivated: 'a',
                  lastActivatedContent: activeContent.contents[0],
                  lastActivatedIndex: 0,
                  isCircular: false,
                  direction: 'right',
                  maxActivationLimit: 1,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: false,
                  contents: [
                    {
                      active: true,
                      index: 0,
                      value: 'a',
                      isFirst: true,
                      isLast: false,
                      hasNext: true,
                      hasPrevious: false,
                      isNext: false,
                      isPrevious: false,
                      hasBeenActiveBefore: true,
                    },
                    {
                      active: false,
                      index: 1,
                      value: 'd',
                      isFirst: false,
                      isLast: true,
                      hasNext: false,
                      hasPrevious: true,
                      isNext: true,
                      isPrevious: false,
                      hasBeenActiveBefore: false,
                    },
                  ],
                },
                {
                  type: 'REMOVED_MULTIPLE',
                  values: ['b', 'c'],
                  indexes: [1, 2],
                  time: new Date(),
                }
              );

              expect(removed).toEqual(['b', 'c']);
            });

            test('middle removal #3', () => {
              const { activeContent, subscriber } = setup(
                { activeIndexes: 3 },
                ['a', 'b', 'c', 'd']
              );

              const removed = activeContent.removeByPredicate(
                ({ value }) => value === 'b' || value === 'c'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(
                subscriber,
                {
                  active: ['d'],
                  activeContents: [activeContent.contents[1]],
                  activeIndexes: [1],
                  lastActivated: 'd',
                  lastActivatedContent: activeContent.contents[1],
                  lastActivatedIndex: 1,
                  isCircular: false,
                  direction: 'right',
                  maxActivationLimit: 1,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: false,
                  contents: [
                    {
                      active: false,
                      index: 0,
                      value: 'a',
                      isFirst: true,
                      isLast: false,
                      hasNext: true,
                      hasPrevious: false,
                      isNext: false,
                      isPrevious: true,
                      hasBeenActiveBefore: false,
                    },
                    {
                      active: true,
                      index: 1,
                      value: 'd',
                      isFirst: false,
                      isLast: true,
                      hasNext: false,
                      hasPrevious: true,
                      isNext: false,
                      isPrevious: false,
                      hasBeenActiveBefore: true,
                    },
                  ],
                },
                {
                  type: 'REMOVED_MULTIPLE',
                  values: ['b', 'c'],
                  indexes: [1, 2],
                  time: new Date(),
                }
              );

              expect(removed).toEqual(['b', 'c']);
            });

            test('middle with holes removal #0', () => {
              const { activeContent, subscriber } = setup(
                { activeIndexes: 0 },
                ['a', 'b', 'c', 'd', 'e']
              );

              const removed = activeContent.removeByPredicate(
                ({ value }) => value === 'b' || value === 'd'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(
                subscriber,
                {
                  active: ['a'],
                  activeContents: [activeContent.contents[0]],
                  activeIndexes: [0],
                  lastActivated: 'a',
                  lastActivatedContent: activeContent.contents[0],
                  lastActivatedIndex: 0,
                  isCircular: false,
                  direction: 'right',
                  maxActivationLimit: 1,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: false,
                  contents: [
                    {
                      active: true,
                      index: 0,
                      value: 'a',
                      isFirst: true,
                      isLast: false,
                      hasNext: true,
                      hasPrevious: false,
                      isNext: false,
                      isPrevious: false,
                      hasBeenActiveBefore: true,
                    },
                    {
                      active: false,
                      index: 1,
                      value: 'c',
                      isFirst: false,
                      isLast: false,
                      hasNext: true,
                      hasPrevious: true,
                      isNext: true,
                      isPrevious: false,
                      hasBeenActiveBefore: false,
                    },
                    {
                      active: false,
                      index: 2,
                      value: 'e',
                      isFirst: false,
                      isLast: true,
                      hasNext: false,
                      hasPrevious: true,
                      isNext: false,
                      isPrevious: false,
                      hasBeenActiveBefore: false,
                    },
                  ],
                },
                {
                  type: 'REMOVED_MULTIPLE',
                  values: ['b', 'd'],
                  indexes: [1, 3],
                  time: new Date(),
                }
              );

              expect(removed).toEqual(['b', 'd']);
            });

            test('middle with holes removal #2', () => {
              const { activeContent, subscriber } = setup(
                { activeIndexes: 2 },
                ['a', 'b', 'c', 'd', 'e']
              );

              const removed = activeContent.removeByPredicate(
                ({ value }) => value === 'b' || value === 'd'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(
                subscriber,
                {
                  active: ['c'],
                  activeContents: [activeContent.contents[1]],
                  activeIndexes: [1],
                  lastActivated: 'c',
                  lastActivatedContent: activeContent.contents[1],
                  lastActivatedIndex: 1,
                  isCircular: false,
                  direction: 'right',
                  maxActivationLimit: 1,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: false,
                  contents: [
                    {
                      active: false,
                      index: 0,
                      value: 'a',
                      isFirst: true,
                      isLast: false,
                      hasNext: true,
                      hasPrevious: false,
                      isNext: false,
                      isPrevious: true,
                      hasBeenActiveBefore: false,
                    },
                    {
                      active: true,
                      index: 1,
                      value: 'c',
                      isFirst: false,
                      isLast: false,
                      hasNext: true,
                      hasPrevious: true,
                      isNext: false,
                      isPrevious: false,
                      hasBeenActiveBefore: true,
                    },
                    {
                      active: false,
                      index: 2,
                      value: 'e',
                      isFirst: false,
                      isLast: true,
                      hasNext: false,
                      hasPrevious: true,
                      isNext: true,
                      isPrevious: false,
                      hasBeenActiveBefore: false,
                    },
                  ],
                },
                {
                  type: 'REMOVED_MULTIPLE',
                  values: ['b', 'd'],
                  indexes: [1, 3],
                  time: new Date(),
                }
              );

              expect(removed).toEqual(['b', 'd']);
            });

            test('middle with holes removal #4', () => {
              const { activeContent, subscriber } = setup(
                { activeIndexes: 4 },
                ['a', 'b', 'c', 'd', 'e']
              );

              const removed = activeContent.removeByPredicate(
                ({ value }) => value === 'b' || value === 'd'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(
                subscriber,
                {
                  active: ['e'],
                  activeContents: [activeContent.contents[2]],
                  activeIndexes: [2],
                  lastActivated: 'e',
                  lastActivatedContent: activeContent.contents[2],
                  lastActivatedIndex: 2,
                  isCircular: false,
                  direction: 'right',
                  maxActivationLimit: 1,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: false,
                  contents: [
                    {
                      active: false,
                      index: 0,
                      value: 'a',
                      isFirst: true,
                      isLast: false,
                      hasNext: true,
                      hasPrevious: false,
                      isNext: false,
                      isPrevious: false,
                      hasBeenActiveBefore: false,
                    },
                    {
                      active: false,
                      index: 1,
                      value: 'c',
                      isFirst: false,
                      isLast: false,
                      hasNext: true,
                      hasPrevious: true,
                      isNext: false,
                      isPrevious: true,
                      hasBeenActiveBefore: false,
                    },
                    {
                      active: true,
                      index: 2,
                      value: 'e',
                      isFirst: false,
                      isLast: true,
                      hasNext: false,
                      hasPrevious: true,
                      isNext: false,
                      isPrevious: false,
                      hasBeenActiveBefore: true,
                    },
                  ],
                },
                {
                  type: 'REMOVED_MULTIPLE',
                  values: ['b', 'd'],
                  indexes: [1, 3],
                  time: new Date(),
                }
              );

              expect(removed).toEqual(['b', 'd']);
            });

            test('end removal', () => {
              const { activeContent, subscriber } = setup({ activeIndexes: 0 });

              const removed = activeContent.removeByPredicate(
                ({ index }) => index > 0
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(
                subscriber,
                {
                  active: ['a'],
                  activeContents: [activeContent.contents[0]],
                  activeIndexes: [0],
                  lastActivated: 'a',
                  lastActivatedContent: activeContent.contents[0],
                  lastActivatedIndex: 0,
                  isCircular: false,
                  direction: 'right',
                  maxActivationLimit: 1,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: false,
                  contents: [
                    {
                      active: true,
                      index: 0,
                      value: 'a',
                      isFirst: true,
                      isLast: true,
                      hasNext: false,
                      hasPrevious: false,
                      isNext: false,
                      isPrevious: false,
                      hasBeenActiveBefore: true,
                    },
                  ],
                },
                {
                  type: 'REMOVED_MULTIPLE',
                  values: ['b', 'c'],
                  indexes: [1, 2],
                  time: new Date(),
                }
              );

              expect(removed).toEqual(['b', 'c']);
            });
          });

          describe('removing active elements', () => {
            test('start removal #0', () => {
              const { activeContent, subscriber } = setup({ activeIndexes: 0 });

              const removed = activeContent.removeByPredicate(
                ({ value }) => value === 'a' || value === 'b'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(
                subscriber,
                {
                  active: [],
                  activeContents: [],
                  activeIndexes: [],
                  lastActivated: null,
                  lastActivatedContent: null,
                  lastActivatedIndex: -1,
                  isCircular: false,
                  direction: 'right',
                  maxActivationLimit: 1,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: true,
                  contents: [
                    {
                      active: false,
                      index: 0,
                      value: 'c',
                      isFirst: true,
                      isLast: true,
                      hasNext: false,
                      hasPrevious: false,
                      isNext: false,
                      isPrevious: false,
                      hasBeenActiveBefore: false,
                    },
                  ],
                },
                {
                  type: 'REMOVED_MULTIPLE',
                  values: ['a', 'b'],
                  indexes: [0, 1],
                  time: new Date(),
                }
              );

              expect(removed).toEqual(['a', 'b']);
            });

            test('start removal #1', () => {
              const { activeContent, subscriber } = setup({ activeIndexes: 1 });

              const removed = activeContent.removeByPredicate(
                ({ value }) => value === 'a' || value === 'b'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(
                subscriber,
                {
                  active: [],
                  activeContents: [],
                  activeIndexes: [],
                  lastActivated: null,
                  lastActivatedContent: null,
                  lastActivatedIndex: -1,
                  isCircular: false,
                  direction: 'right',
                  maxActivationLimit: 1,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: true,
                  contents: [
                    {
                      active: false,
                      index: 0,
                      value: 'c',
                      isFirst: true,
                      isLast: true,
                      hasNext: false,
                      hasPrevious: false,
                      isNext: false,
                      isPrevious: false,
                      hasBeenActiveBefore: false,
                    },
                  ],
                },
                {
                  type: 'REMOVED_MULTIPLE',
                  values: ['a', 'b'],
                  indexes: [0, 1],
                  time: new Date(),
                }
              );

              expect(removed).toEqual(['a', 'b']);
            });

            test('middle removal #1', () => {
              const { activeContent, subscriber } = setup(
                { activeIndexes: 1 },
                ['a', 'b', 'c', 'd']
              );

              const removed = activeContent.removeByPredicate(
                ({ value }) => value === 'b' || value === 'c'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(
                subscriber,
                {
                  active: [],
                  activeContents: [],
                  activeIndexes: [],
                  lastActivated: null,
                  lastActivatedContent: null,
                  lastActivatedIndex: -1,
                  isCircular: false,
                  direction: 'right',
                  maxActivationLimit: 1,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: true,
                  contents: [
                    {
                      active: false,
                      index: 0,
                      value: 'a',
                      isFirst: true,
                      isLast: false,
                      hasNext: true,
                      hasPrevious: false,
                      isNext: false,
                      isPrevious: false,
                      hasBeenActiveBefore: false,
                    },
                    {
                      active: false,
                      index: 1,
                      value: 'd',
                      isFirst: false,
                      isLast: true,
                      hasNext: false,
                      hasPrevious: true,
                      isNext: false,
                      isPrevious: false,
                      hasBeenActiveBefore: false,
                    },
                  ],
                },
                {
                  type: 'REMOVED_MULTIPLE',
                  values: ['b', 'c'],
                  indexes: [1, 2],
                  time: new Date(),
                }
              );

              expect(removed).toEqual(['b', 'c']);
            });

            test('middle removal #2', () => {
              const { activeContent, subscriber } = setup(
                { activeIndexes: 2 },
                ['a', 'b', 'c', 'd']
              );

              const removed = activeContent.removeByPredicate(
                ({ value }) => value === 'b' || value === 'c'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(
                subscriber,
                {
                  active: [],
                  activeContents: [],
                  activeIndexes: [],
                  lastActivated: null,
                  lastActivatedContent: null,
                  lastActivatedIndex: -1,
                  isCircular: false,
                  direction: 'right',
                  maxActivationLimit: 1,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: true,
                  contents: [
                    {
                      active: false,
                      index: 0,
                      value: 'a',
                      isFirst: true,
                      isLast: false,
                      hasNext: true,
                      hasPrevious: false,
                      isNext: false,
                      isPrevious: false,
                      hasBeenActiveBefore: false,
                    },
                    {
                      active: false,
                      index: 1,
                      value: 'd',
                      isFirst: false,
                      isLast: true,
                      hasNext: false,
                      hasPrevious: true,
                      isNext: false,
                      isPrevious: false,
                      hasBeenActiveBefore: false,
                    },
                  ],
                },
                {
                  type: 'REMOVED_MULTIPLE',
                  values: ['b', 'c'],
                  indexes: [1, 2],
                  time: new Date(),
                }
              );

              expect(removed).toEqual(['b', 'c']);
            });

            test('middle with holes removal #1', () => {
              const { activeContent, subscriber } = setup(
                { activeIndexes: 1 },
                ['a', 'b', 'c', 'd', 'e']
              );

              const removed = activeContent.removeByPredicate(
                ({ value }) => value === 'b' || value === 'd'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(
                subscriber,
                {
                  active: [],
                  activeContents: [],
                  activeIndexes: [],
                  lastActivated: null,
                  lastActivatedContent: null,
                  lastActivatedIndex: -1,
                  isCircular: false,
                  direction: 'right',
                  maxActivationLimit: 1,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: true,
                  contents: [
                    {
                      active: false,
                      index: 0,
                      value: 'a',
                      isFirst: true,
                      isLast: false,
                      hasNext: true,
                      hasPrevious: false,
                      isNext: false,
                      isPrevious: false,
                      hasBeenActiveBefore: false,
                    },
                    {
                      active: false,
                      index: 1,
                      value: 'c',
                      isFirst: false,
                      isLast: false,
                      hasNext: true,
                      hasPrevious: true,
                      isNext: false,
                      isPrevious: false,
                      hasBeenActiveBefore: false,
                    },
                    {
                      active: false,
                      index: 2,
                      value: 'e',
                      isFirst: false,
                      isLast: true,
                      hasNext: false,
                      hasPrevious: true,
                      isNext: false,
                      isPrevious: false,
                      hasBeenActiveBefore: false,
                    },
                  ],
                },
                {
                  type: 'REMOVED_MULTIPLE',
                  values: ['b', 'd'],
                  indexes: [1, 3],
                  time: new Date(),
                }
              );

              expect(removed).toEqual(['b', 'd']);
            });

            test('middle with holes removal #3', () => {
              const { activeContent, subscriber } = setup(
                { activeIndexes: 3 },
                ['a', 'b', 'c', 'd', 'e']
              );

              const removed = activeContent.removeByPredicate(
                ({ value }) => value === 'b' || value === 'd'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(
                subscriber,
                {
                  active: [],
                  activeContents: [],
                  activeIndexes: [],
                  lastActivated: null,
                  lastActivatedContent: null,
                  lastActivatedIndex: -1,
                  isCircular: false,
                  direction: 'right',
                  maxActivationLimit: 1,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: true,
                  contents: [
                    {
                      active: false,
                      index: 0,
                      value: 'a',
                      isFirst: true,
                      isLast: false,
                      hasNext: true,
                      hasPrevious: false,
                      isNext: false,
                      isPrevious: false,
                      hasBeenActiveBefore: false,
                    },
                    {
                      active: false,
                      index: 1,
                      value: 'c',
                      isFirst: false,
                      isLast: false,
                      hasNext: true,
                      hasPrevious: true,
                      isNext: false,
                      isPrevious: false,
                      hasBeenActiveBefore: false,
                    },
                    {
                      active: false,
                      index: 2,
                      value: 'e',
                      isFirst: false,
                      isLast: true,
                      hasNext: false,
                      hasPrevious: true,
                      isNext: false,
                      isPrevious: false,
                      hasBeenActiveBefore: false,
                    },
                  ],
                },
                {
                  type: 'REMOVED_MULTIPLE',
                  values: ['b', 'd'],
                  indexes: [1, 3],
                  time: new Date(),
                }
              );

              expect(removed).toEqual(['b', 'd']);
            });

            test('end removal', () => {
              const { activeContent, subscriber } = setup({ activeIndexes: 2 });

              const removed = activeContent.removeByPredicate(
                ({ index }) => index > 0
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(
                subscriber,
                {
                  active: [],
                  activeContents: [],
                  activeIndexes: [],
                  lastActivated: null,
                  lastActivatedContent: null,
                  lastActivatedIndex: -1,
                  isCircular: false,
                  direction: 'right',
                  maxActivationLimit: 1,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: true,
                  contents: [
                    {
                      active: false,
                      index: 0,
                      value: 'a',
                      isFirst: true,
                      isLast: true,
                      hasNext: false,
                      hasPrevious: false,
                      isNext: false,
                      isPrevious: false,
                      hasBeenActiveBefore: false,
                    },
                  ],
                },
                {
                  type: 'REMOVED_MULTIPLE',
                  values: ['b', 'c'],
                  indexes: [1, 2],
                  time: new Date(),
                }
              );

              expect(removed).toEqual(['b', 'c']);
            });
          });
        });

        test('when no predicate matches do nothing', () => {
          const { activeContent, subscriber } = setup({ activeIndexes: 0 });

          const removed = activeContent.removeByPredicate(
            ({ value }) => value === 'y'
          );

          expect(subscriber).toHaveBeenCalledTimes(0);

          expect(removed).toEqual([]);
        });

        test('when content is already empty do nothing', () => {
          const { activeContent, subscriber } = setup({}, []);

          const removed = activeContent.removeByPredicate(
            ({ value }) => value === 'y'
          );

          expect(subscriber).toHaveBeenCalledTimes(0);

          expect(activeContent.hasActiveChangedAtLeastOnce).toBe(false);

          expect(removed).toEqual([]);
        });
      });

      describe('when maxActivationLimit is false', () => {
        test('all removal', () => {
          const { activeContent, subscriber } = setup({
            maxActivationLimit: false,
            activeIndexes: [0, 1, 2],
          });

          const removed = activeContent.removeByPredicate(() => true);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: [],
              activeContents: [],
              activeIndexes: [],
              lastActivated: null,
              lastActivatedContent: null,
              lastActivatedIndex: -1,
              isCircular: false,
              direction: 'right',
              maxActivationLimit: false,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: true,
              contents: [],
            },
            {
              type: 'REMOVED_MULTIPLE',
              values: ['a', 'b', 'c'],
              indexes: [0, 1, 2],
              time: new Date(),
            }
          );

          expect(removed).toEqual(['a', 'b', 'c']);
        });

        describe('predicate matches one element', () => {
          describe('removing inactive element', () => {
            test('start removal', () => {
              const { activeContent, subscriber } = setup({
                maxActivationLimit: false,
                activeIndexes: [],
              });

              const removed = activeContent.removeByPredicate(
                ({ value }) => value === 'a'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(
                subscriber,
                {
                  active: [],
                  activeContents: [],
                  activeIndexes: [],
                  lastActivated: null,
                  lastActivatedContent: null,
                  lastActivatedIndex: -1,
                  isCircular: false,
                  direction: 'right',
                  maxActivationLimit: false,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: false,
                  contents: [
                    {
                      active: false,
                      index: 0,
                      value: 'b',
                      isFirst: true,
                      isLast: false,
                      hasNext: true,
                      hasPrevious: false,
                      isNext: false,
                      isPrevious: false,
                      hasBeenActiveBefore: false,
                    },
                    {
                      active: false,
                      index: 1,
                      value: 'c',
                      isFirst: false,
                      isLast: true,
                      hasNext: false,
                      hasPrevious: true,
                      isNext: false,
                      isPrevious: false,
                      hasBeenActiveBefore: false,
                    },
                  ],
                },
                {
                  type: 'REMOVED_MULTIPLE',
                  values: ['a'],
                  indexes: [0],
                  time: new Date(),
                }
              );

              expect(removed).toEqual(['a']);
            });

            test('middle removal', () => {
              const { activeContent, subscriber } = setup({
                maxActivationLimit: false,
                activeIndexes: [],
              });

              const removed = activeContent.removeByPredicate(
                ({ value }) => value === 'b'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(
                subscriber,
                {
                  active: [],
                  activeContents: [],
                  activeIndexes: [],
                  lastActivated: null,
                  lastActivatedContent: null,
                  lastActivatedIndex: -1,
                  isCircular: false,
                  direction: 'right',
                  maxActivationLimit: false,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: false,
                  contents: [
                    {
                      active: false,
                      index: 0,
                      value: 'a',
                      isFirst: true,
                      isLast: false,
                      hasNext: true,
                      hasPrevious: false,
                      isNext: false,
                      isPrevious: false,
                      hasBeenActiveBefore: false,
                    },
                    {
                      active: false,
                      index: 1,
                      value: 'c',
                      isFirst: false,
                      isLast: true,
                      hasNext: false,
                      hasPrevious: true,
                      isNext: false,
                      isPrevious: false,
                      hasBeenActiveBefore: false,
                    },
                  ],
                },
                {
                  type: 'REMOVED_MULTIPLE',
                  values: ['b'],
                  indexes: [1],
                  time: new Date(),
                }
              );

              expect(removed).toEqual(['b']);
            });

            test('end removal', () => {
              const { activeContent, subscriber } = setup({
                maxActivationLimit: false,
                activeIndexes: [],
              });

              const removed = activeContent.removeByPredicate(
                ({ value }) => value === 'c'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(
                subscriber,
                {
                  active: [],
                  activeContents: [],
                  activeIndexes: [],
                  lastActivated: null,
                  lastActivatedContent: null,
                  lastActivatedIndex: -1,
                  isCircular: false,
                  direction: 'right',
                  maxActivationLimit: false,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: false,
                  contents: [
                    {
                      active: false,
                      index: 0,
                      value: 'a',
                      isFirst: true,
                      isLast: false,
                      hasNext: true,
                      hasPrevious: false,
                      isNext: false,
                      isPrevious: false,
                      hasBeenActiveBefore: false,
                    },
                    {
                      active: false,
                      index: 1,
                      value: 'b',
                      isFirst: false,
                      isLast: true,
                      hasNext: false,
                      hasPrevious: true,
                      isNext: false,
                      isPrevious: false,
                      hasBeenActiveBefore: false,
                    },
                  ],
                },
                {
                  type: 'REMOVED_MULTIPLE',
                  values: ['c'],
                  indexes: [2],
                  time: new Date(),
                }
              );

              expect(removed).toEqual(['c']);
            });
          });

          describe('removing active element', () => {
            test('start removal', () => {
              const { activeContent, subscriber } = setup({
                maxActivationLimit: false,
                activeIndexes: [0, 1, 2],
              });

              const removed = activeContent.removeByPredicate(
                ({ value }) => value === 'a'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(
                subscriber,
                {
                  active: ['b', 'c'],
                  activeContents: [
                    activeContent.contents[0],
                    activeContent.contents[1],
                  ],
                  activeIndexes: [0, 1],
                  lastActivated: 'c',
                  lastActivatedContent: activeContent.contents[1],
                  lastActivatedIndex: 1,
                  isCircular: false,
                  direction: 'right',
                  maxActivationLimit: false,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: true,
                  contents: [
                    {
                      active: true,
                      index: 0,
                      value: 'b',
                      isFirst: true,
                      isLast: false,
                      hasNext: true,
                      hasPrevious: false,
                      isNext: false,
                      isPrevious: true,
                      hasBeenActiveBefore: true,
                    },
                    {
                      active: true,
                      index: 1,
                      value: 'c',
                      isFirst: false,
                      isLast: true,
                      hasNext: false,
                      hasPrevious: true,
                      isNext: false,
                      isPrevious: false,
                      hasBeenActiveBefore: true,
                    },
                  ],
                },
                {
                  type: 'REMOVED_MULTIPLE',
                  values: ['a'],
                  indexes: [0],
                  time: new Date(),
                }
              );

              expect(removed).toEqual(['a']);
            });

            test('middle removal', () => {
              const { activeContent, subscriber } = setup({
                maxActivationLimit: false,
                activeIndexes: [0, 1, 2],
              });

              const removed = activeContent.removeByPredicate(
                ({ value }) => value === 'b'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(
                subscriber,
                {
                  active: ['a', 'c'],
                  activeContents: [
                    activeContent.contents[0],
                    activeContent.contents[1],
                  ],
                  activeIndexes: [0, 1],
                  lastActivated: 'c',
                  lastActivatedContent: activeContent.contents[1],
                  lastActivatedIndex: 1,
                  isCircular: false,
                  direction: 'right',
                  maxActivationLimit: false,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: true,
                  contents: [
                    {
                      active: true,
                      index: 0,
                      value: 'a',
                      isFirst: true,
                      isLast: false,
                      hasNext: true,
                      hasPrevious: false,
                      isNext: false,
                      isPrevious: true,
                      hasBeenActiveBefore: true,
                    },
                    {
                      active: true,
                      index: 1,
                      value: 'c',
                      isFirst: false,
                      isLast: true,
                      hasNext: false,
                      hasPrevious: true,
                      isNext: false,
                      isPrevious: false,
                      hasBeenActiveBefore: true,
                    },
                  ],
                },
                {
                  type: 'REMOVED_MULTIPLE',
                  values: ['b'],
                  indexes: [1],
                  time: new Date(),
                }
              );

              expect(removed).toEqual(['b']);
            });

            test('end removal', () => {
              const { activeContent, subscriber } = setup({
                maxActivationLimit: false,
                activeIndexes: [0, 1, 2],
              });

              const removed = activeContent.removeByPredicate(
                ({ value }) => value === 'c'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(
                subscriber,
                {
                  active: ['a', 'b'],
                  activeContents: [
                    activeContent.contents[0],
                    activeContent.contents[1],
                  ],
                  activeIndexes: [0, 1],
                  lastActivated: 'b',
                  lastActivatedContent: activeContent.contents[1],
                  lastActivatedIndex: 1,
                  isCircular: false,
                  direction: 'right',
                  maxActivationLimit: false,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: true,
                  contents: [
                    {
                      active: true,
                      index: 0,
                      value: 'a',
                      isFirst: true,
                      isLast: false,
                      hasNext: true,
                      hasPrevious: false,
                      isNext: false,
                      isPrevious: true,
                      hasBeenActiveBefore: true,
                    },
                    {
                      active: true,
                      index: 1,
                      value: 'b',
                      isFirst: false,
                      isLast: true,
                      hasNext: false,
                      hasPrevious: true,
                      isNext: false,
                      isPrevious: false,
                      hasBeenActiveBefore: true,
                    },
                  ],
                },
                {
                  type: 'REMOVED_MULTIPLE',
                  values: ['c'],
                  indexes: [2],
                  time: new Date(),
                }
              );

              expect(removed).toEqual(['c']);
            });
          });
        });

        describe('predicate matches multiple element', () => {
          describe('removing inactive elements', () => {
            test('start removal', () => {
              const { activeContent, subscriber } = setup({
                maxActivationLimit: false,
                activeIndexes: [],
              });

              const removed = activeContent.removeByPredicate(
                ({ value }) => value === 'a' || value === 'b'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(
                subscriber,
                {
                  active: [],
                  activeContents: [],
                  activeIndexes: [],
                  lastActivated: null,
                  lastActivatedContent: null,
                  lastActivatedIndex: -1,
                  isCircular: false,
                  direction: 'right',
                  maxActivationLimit: false,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: false,
                  contents: [
                    {
                      active: false,
                      index: 0,
                      value: 'c',
                      isFirst: true,
                      isLast: true,
                      hasNext: false,
                      hasPrevious: false,
                      isNext: false,
                      isPrevious: false,
                      hasBeenActiveBefore: false,
                    },
                  ],
                },
                {
                  type: 'REMOVED_MULTIPLE',
                  values: ['a', 'b'],
                  indexes: [0, 1],
                  time: new Date(),
                }
              );

              expect(removed).toEqual(['a', 'b']);
            });

            test('middle removal', () => {
              const { activeContent, subscriber } = setup(
                { maxActivationLimit: false, activeIndexes: [] },
                ['a', 'b', 'c', 'd']
              );

              const removed = activeContent.removeByPredicate(
                ({ value }) => value === 'b' || value === 'c'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(
                subscriber,
                {
                  active: [],
                  activeContents: [],
                  activeIndexes: [],
                  lastActivated: null,
                  lastActivatedContent: null,
                  lastActivatedIndex: -1,
                  isCircular: false,
                  direction: 'right',
                  maxActivationLimit: false,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: false,
                  contents: [
                    {
                      active: false,
                      index: 0,
                      value: 'a',
                      isFirst: true,
                      isLast: false,
                      hasNext: true,
                      hasPrevious: false,
                      isNext: false,
                      isPrevious: false,
                      hasBeenActiveBefore: false,
                    },
                    {
                      active: false,
                      index: 1,
                      value: 'd',
                      isFirst: false,
                      isLast: true,
                      hasNext: false,
                      hasPrevious: true,
                      isNext: false,
                      isPrevious: false,
                      hasBeenActiveBefore: false,
                    },
                  ],
                },
                {
                  type: 'REMOVED_MULTIPLE',
                  values: ['b', 'c'],
                  indexes: [1, 2],
                  time: new Date(),
                }
              );

              expect(removed).toEqual(['b', 'c']);
            });

            test('middle with holes removal', () => {
              const { activeContent, subscriber } = setup(
                { maxActivationLimit: false, activeIndexes: [] },
                ['a', 'b', 'c', 'd', 'e']
              );

              const removed = activeContent.removeByPredicate(
                ({ value }) => value === 'b' || value === 'd'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(
                subscriber,
                {
                  active: [],
                  activeContents: [],
                  activeIndexes: [],
                  lastActivated: null,
                  lastActivatedContent: null,
                  lastActivatedIndex: -1,
                  isCircular: false,
                  direction: 'right',
                  maxActivationLimit: false,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: false,
                  contents: [
                    {
                      active: false,
                      index: 0,
                      value: 'a',
                      isFirst: true,
                      isLast: false,
                      hasNext: true,
                      hasPrevious: false,
                      isNext: false,
                      isPrevious: false,
                      hasBeenActiveBefore: false,
                    },
                    {
                      active: false,
                      index: 1,
                      value: 'c',
                      isFirst: false,
                      isLast: false,
                      hasNext: true,
                      hasPrevious: true,
                      isNext: false,
                      isPrevious: false,
                      hasBeenActiveBefore: false,
                    },
                    {
                      active: false,
                      index: 2,
                      value: 'e',
                      isFirst: false,
                      isLast: true,
                      hasNext: false,
                      hasPrevious: true,
                      isNext: false,
                      isPrevious: false,
                      hasBeenActiveBefore: false,
                    },
                  ],
                },
                {
                  type: 'REMOVED_MULTIPLE',
                  values: ['b', 'd'],
                  indexes: [1, 3],
                  time: new Date(),
                }
              );

              expect(removed).toEqual(['b', 'd']);
            });

            test('end removal', () => {
              const { activeContent, subscriber } = setup({
                maxActivationLimit: false,
                activeIndexes: [],
              });

              const removed = activeContent.removeByPredicate(
                ({ index }) => index > 0
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(
                subscriber,
                {
                  active: [],
                  activeContents: [],
                  activeIndexes: [],
                  lastActivated: null,
                  lastActivatedContent: null,
                  lastActivatedIndex: -1,
                  isCircular: false,
                  direction: 'right',
                  maxActivationLimit: false,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: false,
                  contents: [
                    {
                      active: false,
                      index: 0,
                      value: 'a',
                      isFirst: true,
                      isLast: true,
                      hasNext: false,
                      hasPrevious: false,
                      isNext: false,
                      isPrevious: false,
                      hasBeenActiveBefore: false,
                    },
                  ],
                },
                {
                  type: 'REMOVED_MULTIPLE',
                  values: ['b', 'c'],
                  indexes: [1, 2],
                  time: new Date(),
                }
              );

              expect(removed).toEqual(['b', 'c']);
            });
          });

          describe('removing active elements', () => {
            test('start removal #0', () => {
              const { activeContent, subscriber } = setup({
                maxActivationLimit: false,
                activeIndexes: [0, 2],
              });

              const removed = activeContent.removeByPredicate(
                ({ value }) => value === 'a' || value === 'b'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(
                subscriber,
                {
                  active: ['c'],
                  activeContents: [activeContent.contents[0]],
                  activeIndexes: [0],
                  lastActivated: 'c',
                  lastActivatedContent: activeContent.contents[0],
                  lastActivatedIndex: 0,
                  isCircular: false,
                  direction: 'right',
                  maxActivationLimit: false,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: true,
                  contents: [
                    {
                      active: true,
                      index: 0,
                      value: 'c',
                      isFirst: true,
                      isLast: true,
                      hasNext: false,
                      hasPrevious: false,
                      isNext: false,
                      isPrevious: false,
                      hasBeenActiveBefore: true,
                    },
                  ],
                },
                {
                  type: 'REMOVED_MULTIPLE',
                  values: ['a', 'b'],
                  indexes: [0, 1],
                  time: new Date(),
                }
              );

              expect(removed).toEqual(['a', 'b']);
            });

            test('start removal #1', () => {
              const { activeContent, subscriber } = setup({
                maxActivationLimit: false,
                activeIndexes: [0, 1],
              });

              const removed = activeContent.removeByPredicate(
                ({ value }) => value === 'a' || value === 'b'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(
                subscriber,
                {
                  active: [],
                  activeContents: [],
                  activeIndexes: [],
                  lastActivated: null,
                  lastActivatedContent: null,
                  lastActivatedIndex: -1,
                  isCircular: false,
                  direction: 'right',
                  maxActivationLimit: false,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: true,
                  contents: [
                    {
                      active: false,
                      index: 0,
                      value: 'c',
                      isFirst: true,
                      isLast: true,
                      hasNext: false,
                      hasPrevious: false,
                      isNext: false,
                      isPrevious: false,
                      hasBeenActiveBefore: false,
                    },
                  ],
                },
                {
                  type: 'REMOVED_MULTIPLE',
                  values: ['a', 'b'],
                  indexes: [0, 1],
                  time: new Date(),
                }
              );

              expect(removed).toEqual(['a', 'b']);
            });

            test('middle removal #0', () => {
              const { activeContent, subscriber } = setup(
                { maxActivationLimit: false, activeIndexes: [0, 1] },
                ['a', 'b', 'c', 'd']
              );

              const removed = activeContent.removeByPredicate(
                ({ value }) => value === 'b' || value === 'c'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(
                subscriber,
                {
                  active: ['a'],
                  activeContents: [activeContent.contents[0]],
                  activeIndexes: [0],
                  lastActivated: 'a',
                  lastActivatedContent: activeContent.contents[0],
                  lastActivatedIndex: 0,
                  isCircular: false,
                  direction: 'right',
                  maxActivationLimit: false,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: true,
                  contents: [
                    {
                      active: true,
                      index: 0,
                      value: 'a',
                      isFirst: true,
                      isLast: false,
                      hasNext: true,
                      hasPrevious: false,
                      isNext: false,
                      isPrevious: false,
                      hasBeenActiveBefore: true,
                    },
                    {
                      active: false,
                      index: 1,
                      value: 'd',
                      isFirst: false,
                      isLast: true,
                      hasNext: false,
                      hasPrevious: true,
                      isNext: true,
                      isPrevious: false,
                      hasBeenActiveBefore: false,
                    },
                  ],
                },
                {
                  type: 'REMOVED_MULTIPLE',
                  values: ['b', 'c'],
                  indexes: [1, 2],
                  time: new Date(),
                }
              );

              expect(removed).toEqual(['b', 'c']);
            });

            test('middle removal #1', () => {
              const { activeContent, subscriber } = setup(
                { maxActivationLimit: false, activeIndexes: [2, 3] },
                ['a', 'b', 'c', 'd']
              );

              const removed = activeContent.removeByPredicate(
                ({ value }) => value === 'b' || value === 'c'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(
                subscriber,
                {
                  active: ['d'],
                  activeContents: [activeContent.contents[1]],
                  activeIndexes: [1],
                  lastActivated: 'd',
                  lastActivatedContent: activeContent.contents[1],
                  lastActivatedIndex: 1,
                  isCircular: false,
                  direction: 'right',
                  maxActivationLimit: false,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: true,
                  contents: [
                    {
                      active: false,
                      index: 0,
                      value: 'a',
                      isFirst: true,
                      isLast: false,
                      hasNext: true,
                      hasPrevious: false,
                      isNext: false,
                      isPrevious: true,
                      hasBeenActiveBefore: false,
                    },
                    {
                      active: true,
                      index: 1,
                      value: 'd',
                      isFirst: false,
                      isLast: true,
                      hasNext: false,
                      hasPrevious: true,
                      isNext: false,
                      isPrevious: false,
                      hasBeenActiveBefore: true,
                    },
                  ],
                },
                {
                  type: 'REMOVED_MULTIPLE',
                  values: ['b', 'c'],
                  indexes: [1, 2],
                  time: new Date(),
                }
              );

              expect(removed).toEqual(['b', 'c']);
            });

            test('middle with holes removal #0', () => {
              const { activeContent, subscriber } = setup(
                { maxActivationLimit: false, activeIndexes: [0, 1, 2] },
                ['a', 'b', 'c', 'd', 'e']
              );

              const removed = activeContent.removeByPredicate(
                ({ value }) => value === 'b' || value === 'd'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(
                subscriber,
                {
                  active: ['a', 'c'],
                  activeContents: [
                    activeContent.contents[0],
                    activeContent.contents[1],
                  ],
                  activeIndexes: [0, 1],
                  lastActivated: 'c',
                  lastActivatedContent: activeContent.contents[1],
                  lastActivatedIndex: 1,
                  isCircular: false,
                  direction: 'right',
                  maxActivationLimit: false,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: true,
                  contents: [
                    {
                      active: true,
                      index: 0,
                      value: 'a',
                      isFirst: true,
                      isLast: false,
                      hasNext: true,
                      hasPrevious: false,
                      isNext: false,
                      isPrevious: true,
                      hasBeenActiveBefore: true,
                    },
                    {
                      active: true,
                      index: 1,
                      value: 'c',
                      isFirst: false,
                      isLast: false,
                      hasNext: true,
                      hasPrevious: true,
                      isNext: false,
                      isPrevious: false,
                      hasBeenActiveBefore: true,
                    },
                    {
                      active: false,
                      index: 2,
                      value: 'e',
                      isFirst: false,
                      isLast: true,
                      hasNext: false,
                      hasPrevious: true,
                      isNext: true,
                      isPrevious: false,
                      hasBeenActiveBefore: false,
                    },
                  ],
                },
                {
                  type: 'REMOVED_MULTIPLE',
                  values: ['b', 'd'],
                  indexes: [1, 3],
                  time: new Date(),
                }
              );

              expect(removed).toEqual(['b', 'd']);
            });

            test('middle with holes removal #1', () => {
              const { activeContent, subscriber } = setup(
                { maxActivationLimit: false, activeIndexes: [2, 3, 4] },
                ['a', 'b', 'c', 'd', 'e']
              );

              const removed = activeContent.removeByPredicate(
                ({ value }) => value === 'b' || value === 'd'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(
                subscriber,
                {
                  active: ['c', 'e'],
                  activeContents: [
                    activeContent.contents[1],
                    activeContent.contents[2],
                  ],
                  activeIndexes: [1, 2],
                  lastActivated: 'e',
                  lastActivatedContent: activeContent.contents[2],
                  lastActivatedIndex: 2,
                  isCircular: false,
                  direction: 'right',
                  maxActivationLimit: false,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: true,
                  contents: [
                    {
                      active: false,
                      index: 0,
                      value: 'a',
                      isFirst: true,
                      isLast: false,
                      hasNext: true,
                      hasPrevious: false,
                      isNext: false,
                      isPrevious: false,
                      hasBeenActiveBefore: false,
                    },
                    {
                      active: true,
                      index: 1,
                      value: 'c',
                      isFirst: false,
                      isLast: false,
                      hasNext: true,
                      hasPrevious: true,
                      isNext: false,
                      isPrevious: true,
                      hasBeenActiveBefore: true,
                    },
                    {
                      active: true,
                      index: 2,
                      value: 'e',
                      isFirst: false,
                      isLast: true,
                      hasNext: false,
                      hasPrevious: true,
                      isNext: false,
                      isPrevious: false,
                      hasBeenActiveBefore: true,
                    },
                  ],
                },
                {
                  type: 'REMOVED_MULTIPLE',
                  values: ['b', 'd'],
                  indexes: [1, 3],
                  time: new Date(),
                }
              );

              expect(removed).toEqual(['b', 'd']);
            });

            test('end removal', () => {
              const { activeContent, subscriber } = setup({
                maxActivationLimit: false,
                activeIndexes: [0, 1, 2],
              });

              const removed = activeContent.removeByPredicate(
                ({ index }) => index > 0
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(
                subscriber,
                {
                  active: ['a'],
                  activeContents: [activeContent.contents[0]],
                  activeIndexes: [0],
                  lastActivated: 'a',
                  lastActivatedContent: activeContent.contents[0],
                  lastActivatedIndex: 0,
                  isCircular: false,
                  direction: 'right',
                  maxActivationLimit: false,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: true,
                  contents: [
                    {
                      active: true,
                      index: 0,
                      value: 'a',
                      isFirst: true,
                      isLast: true,
                      hasNext: false,
                      hasPrevious: false,
                      isNext: false,
                      isPrevious: false,
                      hasBeenActiveBefore: true,
                    },
                  ],
                },
                {
                  type: 'REMOVED_MULTIPLE',
                  values: ['b', 'c'],
                  indexes: [1, 2],
                  time: new Date(),
                }
              );

              expect(removed).toEqual(['b', 'c']);
            });
          });
        });

        test('when no predicate matches do nothing', () => {
          const { activeContent, subscriber } = setup({
            maxActivationLimit: false,
            activeIndexes: [0, 1, 2],
          });

          const removed = activeContent.removeByPredicate(
            ({ value }) => value === 'y'
          );

          expect(subscriber).toHaveBeenCalledTimes(0);

          expect(removed).toEqual([]);
        });

        test('when content is already empty do nothing', () => {
          const { activeContent, subscriber } = setup(
            { maxActivationLimit: false },
            []
          );

          const removed = activeContent.removeByPredicate(
            ({ value }) => value === 'y'
          );

          expect(subscriber).toHaveBeenCalledTimes(0);

          expect(activeContent.hasActiveChangedAtLeastOnce).toBe(false);

          expect(removed).toEqual([]);
        });
      });
    });
  });

  describe('swapping of elements', () => {
    describe('swapByIndex', () => {
      describe('when it throws out of bounds', () => {
        describe('when it throws out of bounds for index a', () => {
          test('throws out of bounds when index is to large', () => {
            const { activeContent, subscriber } = setup();

            expect(() => {
              activeContent.swapByIndex(4, 0);
            }).toThrowError(
              `uiloos > ActiveList > swapByIndex > "a" is out of bounds`
            );

            expect(() => {
              activeContent.swapByIndex(4, 0);
            }).toThrowError(
              ActiveListIndexOutOfBoundsError
            );

            expect(() => {
              activeContent.swapByIndex(3, 0);
            }).toThrowError(
              `uiloos > ActiveList > swapByIndex > "a" is out of bounds`
            );

            expect(() => {
              activeContent.swapByIndex(3, 0);
            }).toThrowError(
              ActiveListIndexOutOfBoundsError
            );

            expect(subscriber).toHaveBeenCalledTimes(0);
          });

          test('throws out of bounds when index is less than zero', () => {
            const { activeContent, subscriber } = setup();

            expect(() => {
              activeContent.swapByIndex(-1, 0);
            }).toThrowError(
              `uiloos > ActiveList > swapByIndex > "a" is out of bounds`
            );

            expect(() => {
              activeContent.swapByIndex(-1, 0);
            }).toThrowError(
              ActiveListIndexOutOfBoundsError
            );

            expect(subscriber).toHaveBeenCalledTimes(0);
          });
        });

        describe('when it throws out of bounds for index b', () => {
          test('throws out of bounds when index is to large', () => {
            const { activeContent, subscriber } = setup();

            expect(() => {
              activeContent.swapByIndex(0, 4);
            }).toThrowError(
              `uiloos > ActiveList > swapByIndex > "b" is out of bounds`
            );

            expect(() => {
              activeContent.swapByIndex(0, 4);
            }).toThrowError(
              ActiveListIndexOutOfBoundsError
            );

            expect(() => {
              activeContent.swapByIndex(0, 3);
            }).toThrowError(
              `uiloos > ActiveList > swapByIndex > "b" is out of bounds`
            );

            expect(() => {
              activeContent.swapByIndex(0, 3);
            }).toThrowError(
              ActiveListIndexOutOfBoundsError
            );

            expect(subscriber).toHaveBeenCalledTimes(0);
          });

          test('throws out of bounds when index is less than zero', () => {
            const { activeContent, subscriber } = setup();

            expect(() => {
              activeContent.swapByIndex(0, -1);
            }).toThrowError(
              `uiloos > ActiveList > swapByIndex > "b" is out of bounds`
            );

            expect(() => {
              activeContent.swapByIndex(0, -1);
            }).toThrowError(
              ActiveListIndexOutOfBoundsError
            );

            expect(subscriber).toHaveBeenCalledTimes(0);
          });
        });
      });

      describe('limit is 1', () => {
        test('swapping from the active index should not affect it', () => {
          const { activeContent, subscriber } = setup({ active: 'b' });

          // Swap b with c
          activeContent.swapByIndex(1, 2);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['b'],
              activeContents: [activeContent.contents[2]],
              activeIndexes: [2],
              lastActivated: 'b',
              lastActivatedContent: activeContent.contents[2],
              lastActivatedIndex: 2,
              isCircular: false,
              direction: 'right',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              contents: [
                {
                  active: false,
                  index: 0,
                  value: 'a',
                  isFirst: true,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: false,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 1,
                  value: 'c',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: true,
                  hasBeenActiveBefore: false,
                },
                {
                  active: true,
                  index: 2,
                  value: 'b',
                  isFirst: false,
                  isLast: true,
                  hasNext: false,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
              ],
            },
            {
              type: 'SWAPPED',
              value: {
                a: 'b',
                b: 'c',
              },
              index: {
                a: 1,
                b: 2,
              },
              time: new Date(),
            }
          );
        });

        test('swapping to the active index should not affect it', () => {
          const { activeContent, subscriber } = setup({ active: 'b' });

          // Swap c with b
          activeContent.swapByIndex(2, 1);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['b'],
              activeContents: [activeContent.contents[2]],
              activeIndexes: [2],
              lastActivated: 'b',
              lastActivatedContent: activeContent.contents[2],
              lastActivatedIndex: 2,
              isCircular: false,
              direction: 'right',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              contents: [
                {
                  active: false,
                  index: 0,
                  value: 'a',
                  isFirst: true,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: false,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 1,
                  value: 'c',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: true,
                  hasBeenActiveBefore: false,
                },
                {
                  active: true,
                  index: 2,
                  value: 'b',
                  isFirst: false,
                  isLast: true,
                  hasNext: false,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
              ],
            },
            {
              type: 'SWAPPED',
              value: {
                a: 'c',
                b: 'b',
              },
              index: {
                a: 2,
                b: 1,
              },
              time: new Date(),
            }
          );
        });

        test('swapping non active index should not affect the active index', () => {
          const { activeContent, subscriber } = setup({ active: 'b' });

          // Swap a with c
          activeContent.swapByIndex(0, 2);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['b'],
              activeContents: [activeContent.contents[1]],
              activeIndexes: [1],
              lastActivated: 'b',
              lastActivatedContent: activeContent.contents[1],
              lastActivatedIndex: 1,
              isCircular: false,
              direction: 'right',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              contents: [
                {
                  active: false,
                  index: 0,
                  value: 'c',
                  isFirst: true,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: false,
                  isNext: false,
                  isPrevious: true,
                  hasBeenActiveBefore: false,
                },
                {
                  active: true,
                  index: 1,
                  value: 'b',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: false,
                  index: 2,
                  value: 'a',
                  isFirst: false,
                  isLast: true,
                  hasNext: false,
                  hasPrevious: true,
                  isNext: true,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
              ],
            },
            {
              type: 'SWAPPED',
              value: {
                a: 'a',
                b: 'c',
              },
              index: {
                a: 0,
                b: 2,
              },
              time: new Date(),
            }
          );
        });

        test('swapping when circular should fix previous and next', () => {
          const { activeContent, subscriber } = setup({
            active: 'b',
            isCircular: true,
          });

          // Swap a with c
          activeContent.swapByIndex(0, 2);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['b'],
              activeContents: [activeContent.contents[1]],
              activeIndexes: [1],
              lastActivated: 'b',
              lastActivatedContent: activeContent.contents[1],
              lastActivatedIndex: 1,
              isCircular: true,
              direction: 'right',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              contents: [
                {
                  active: false,
                  index: 0,
                  value: 'c',
                  isFirst: true,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: true,
                  hasBeenActiveBefore: false,
                },
                {
                  active: true,
                  index: 1,
                  value: 'b',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: false,
                  index: 2,
                  value: 'a',
                  isFirst: false,
                  isLast: true,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: true,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
              ],
            },
            {
              type: 'SWAPPED',
              value: {
                a: 'a',
                b: 'c',
              },
              index: {
                a: 0,
                b: 2,
              },
              time: new Date(),
            }
          );
        });

        test('swapping two indexes which are the same should do nothing', () => {
          const { activeContent, subscriber } = setup({
            active: 'b',
            isCircular: true,
          });

          activeContent.swapByIndex(1, 1);

          expect(subscriber).toHaveBeenCalledTimes(0);
        });
      });

      describe('limit is false', () => {
        test('swapping from the active index should not affect it', () => {
          const { activeContent, subscriber } = setup({
            maxActivationLimit: false,
            active: ['a', 'b'],
          });

          // Swap b with c
          activeContent.swapByIndex(1, 2);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['a', 'b'],
              activeContents: [
                activeContent.contents[0],
                activeContent.contents[2],
              ],
              activeIndexes: [0, 2],
              lastActivated: 'b',
              lastActivatedContent: activeContent.contents[2],
              lastActivatedIndex: 2,
              isCircular: false,
              direction: 'right',
              maxActivationLimit: false,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              contents: [
                {
                  active: true,
                  index: 0,
                  value: 'a',
                  isFirst: true,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: false,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: false,
                  index: 1,
                  value: 'c',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: true,
                  hasBeenActiveBefore: false,
                },
                {
                  active: true,
                  index: 2,
                  value: 'b',
                  isFirst: false,
                  isLast: true,
                  hasNext: false,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
              ],
            },
            {
              type: 'SWAPPED',
              value: {
                a: 'b',
                b: 'c',
              },
              index: {
                a: 1,
                b: 2,
              },
              time: new Date(),
            }
          );
        });

        test('swapping to the active index should not affect it', () => {
          const { activeContent, subscriber } = setup({
            maxActivationLimit: false,
            active: ['b', 'a'],
          });

          // Swap c with b
          activeContent.swapByIndex(2, 1);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['b', 'a'],
              activeContents: [
                activeContent.contents[2],
                activeContent.contents[0],
              ],
              activeIndexes: [2, 0],
              lastActivated: 'a',
              lastActivatedContent: activeContent.contents[0],
              lastActivatedIndex: 0,
              isCircular: false,
              direction: 'right',
              maxActivationLimit: false,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              contents: [
                {
                  active: true,
                  index: 0,
                  value: 'a',
                  isFirst: true,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: false,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: false,
                  index: 1,
                  value: 'c',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: true,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: true,
                  index: 2,
                  value: 'b',
                  isFirst: false,
                  isLast: true,
                  hasNext: false,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
              ],
            },
            {
              type: 'SWAPPED',
              value: {
                a: 'c',
                b: 'b',
              },
              index: {
                a: 2,
                b: 1,
              },
              time: new Date(),
            }
          );
        });

        test('swapping non active index should not affect the active index', () => {
          const { activeContent, subscriber } = setup(
            { maxActivationLimit: false, active: ['b', 'c'] },
            ['a', 'b', 'c', 'd']
          );

          // Swap a with d
          activeContent.swapByIndex(0, 3);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['b', 'c'],
              activeContents: [
                activeContent.contents[1],
                activeContent.contents[2],
              ],
              activeIndexes: [1, 2],
              lastActivated: 'c',
              lastActivatedContent: activeContent.contents[2],
              lastActivatedIndex: 2,
              isCircular: false,
              direction: 'right',
              maxActivationLimit: false,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              contents: [
                {
                  active: false,
                  index: 0,
                  value: 'd',
                  isFirst: true,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: false,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: true,
                  index: 1,
                  value: 'b',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: true,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 2,
                  value: 'c',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: false,
                  index: 3,
                  value: 'a',
                  isFirst: false,
                  isLast: true,
                  hasNext: false,
                  hasPrevious: true,
                  isNext: true,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
              ],
            },
            {
              type: 'SWAPPED',
              value: {
                a: 'a',
                b: 'd',
              },
              index: {
                a: 0,
                b: 3,
              },
              time: new Date(),
            }
          );
        });

        test('swapping when all are active should preserve activation order', () => {
          const { activeContent, subscriber } = setup({
            maxActivationLimit: false,
            active: ['a', 'b', 'c'],
            isCircular: true,
          });

          // Swap a with c
          activeContent.swapByIndex(0, 2);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['a', 'b', 'c'],
              activeContents: [
                activeContent.contents[2],
                activeContent.contents[1],
                activeContent.contents[0],
              ],
              activeIndexes: [2, 1, 0],
              lastActivated: 'c',
              lastActivatedContent: activeContent.contents[0],
              lastActivatedIndex: 0,
              isCircular: true,
              direction: 'right',
              maxActivationLimit: false,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              contents: [
                {
                  active: true,
                  index: 0,
                  value: 'c',
                  isFirst: true,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 1,
                  value: 'b',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: true,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 2,
                  value: 'a',
                  isFirst: false,
                  isLast: true,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: true,
                  hasBeenActiveBefore: true,
                },
              ],
            },
            {
              type: 'SWAPPED',
              value: {
                a: 'a',
                b: 'c',
              },
              index: {
                a: 0,
                b: 2,
              },
              time: new Date(),
            }
          );
        });

        test('swapping two indexes which are the same should do nothing', () => {
          const { activeContent, subscriber } = setup({
            maxActivationLimit: false,
            active: 'b',
            isCircular: true,
          });

          activeContent.swapByIndex(1, 1);

          expect(subscriber).toHaveBeenCalledTimes(0);
        });
      });
    });

    test('swap', () => {
      const { activeContent, subscriber } = setup({ active: 'b' });

      // Swap b with c
      activeContent.swap('b', 'c');

      expect(subscriber).toHaveBeenCalledTimes(1);

      assertLastSubscriber(
        subscriber,
        {
          active: ['b'],
          activeContents: [activeContent.contents[2]],
          activeIndexes: [2],
          lastActivated: 'b',
          lastActivatedContent: activeContent.contents[2],
          lastActivatedIndex: 2,
          isCircular: false,
          direction: 'right',
          maxActivationLimit: 1,
          maxActivationLimitBehavior: 'circular',
          history: [],
          hasActiveChangedAtLeastOnce: false,
          contents: [
            {
              active: false,
              index: 0,
              value: 'a',
              isFirst: true,
              isLast: false,
              hasNext: true,
              hasPrevious: false,
              isNext: false,
              isPrevious: false,
              hasBeenActiveBefore: false,
            },
            {
              active: false,
              index: 1,
              value: 'c',
              isFirst: false,
              isLast: false,
              hasNext: true,
              hasPrevious: true,
              isNext: false,
              isPrevious: true,
              hasBeenActiveBefore: false,
            },
            {
              active: true,
              index: 2,
              value: 'b',
              isFirst: false,
              isLast: true,
              hasNext: false,
              hasPrevious: true,
              isNext: false,
              isPrevious: false,
              hasBeenActiveBefore: true,
            },
          ],
        },
        {
          type: 'SWAPPED',
          value: {
            a: 'b',
            b: 'c',
          },
          index: {
            a: 1,
            b: 2,
          },
          time: new Date(),
        }
      );
    });

    describe('ActiveListContent methods', () => {
      test('swapWith', () => {
        const { activeContent, subscriber } = setup({ active: 'b' });

        // Swap b with c
        activeContent.contents[1].swapWith('c');

        expect(subscriber).toHaveBeenCalledTimes(1);

        assertLastSubscriber(
          subscriber,
          {
            active: ['b'],
            activeContents: [activeContent.contents[2]],
            activeIndexes: [2],
            lastActivated: 'b',
            lastActivatedContent: activeContent.contents[2],
            lastActivatedIndex: 2,
            isCircular: false,
            direction: 'right',
            maxActivationLimit: 1,
            maxActivationLimitBehavior: 'circular',
            history: [],
            hasActiveChangedAtLeastOnce: false,
            contents: [
              {
                active: false,
                index: 0,
                value: 'a',
                isFirst: true,
                isLast: false,
                hasNext: true,
                hasPrevious: false,
                isNext: false,
                isPrevious: false,
                hasBeenActiveBefore: false,
              },
              {
                active: false,
                index: 1,
                value: 'c',
                isFirst: false,
                isLast: false,
                hasNext: true,
                hasPrevious: true,
                isNext: false,
                isPrevious: true,
                hasBeenActiveBefore: false,
              },
              {
                active: true,
                index: 2,
                value: 'b',
                isFirst: false,
                isLast: true,
                hasNext: false,
                hasPrevious: true,
                isNext: false,
                isPrevious: false,
                hasBeenActiveBefore: true,
              },
            ],
          },
          {
            type: 'SWAPPED',
            value: {
              a: 'b',
              b: 'c',
            },
            index: {
              a: 1,
              b: 2,
            },
            time: new Date(),
          }
        );
      });

      test('swapWithByIndex', () => {
        const { activeContent, subscriber } = setup({ active: 'b' });

        // Swap b with c
        activeContent.contents[1].swapWithByIndex(2);

        expect(subscriber).toHaveBeenCalledTimes(1);

        assertLastSubscriber(
          subscriber,
          {
            active: ['b'],
            activeContents: [activeContent.contents[2]],
            activeIndexes: [2],
            lastActivated: 'b',
            lastActivatedContent: activeContent.contents[2],
            lastActivatedIndex: 2,
            isCircular: false,
            direction: 'right',
            maxActivationLimit: 1,
            maxActivationLimitBehavior: 'circular',
            history: [],
            hasActiveChangedAtLeastOnce: false,
            contents: [
              {
                active: false,
                index: 0,
                value: 'a',
                isFirst: true,
                isLast: false,
                hasNext: true,
                hasPrevious: false,
                isNext: false,
                isPrevious: false,
                hasBeenActiveBefore: false,
              },
              {
                active: false,
                index: 1,
                value: 'c',
                isFirst: false,
                isLast: false,
                hasNext: true,
                hasPrevious: true,
                isNext: false,
                isPrevious: true,
                hasBeenActiveBefore: false,
              },
              {
                active: true,
                index: 2,
                value: 'b',
                isFirst: false,
                isLast: true,
                hasNext: false,
                hasPrevious: true,
                isNext: false,
                isPrevious: false,
                hasBeenActiveBefore: true,
              },
            ],
          },
          {
            type: 'SWAPPED',
            value: {
              a: 'b',
              b: 'c',
            },
            index: {
              a: 1,
              b: 2,
            },
            time: new Date(),
          }
        );
      });

      test('swapWithNext', () => {
        const { activeContent, subscriber } = setup({ active: 'b' });

        // Swap b with c
        activeContent.contents[1].swapWithNext();

        expect(subscriber).toHaveBeenCalledTimes(1);

        assertLastSubscriber(
          subscriber,
          {
            active: ['b'],
            activeContents: [activeContent.contents[2]],
            activeIndexes: [2],
            lastActivated: 'b',
            lastActivatedContent: activeContent.contents[2],
            lastActivatedIndex: 2,
            isCircular: false,
            direction: 'right',
            maxActivationLimit: 1,
            maxActivationLimitBehavior: 'circular',
            history: [],
            hasActiveChangedAtLeastOnce: false,
            contents: [
              {
                active: false,
                index: 0,
                value: 'a',
                isFirst: true,
                isLast: false,
                hasNext: true,
                hasPrevious: false,
                isNext: false,
                isPrevious: false,
                hasBeenActiveBefore: false,
              },
              {
                active: false,
                index: 1,
                value: 'c',
                isFirst: false,
                isLast: false,
                hasNext: true,
                hasPrevious: true,
                isNext: false,
                isPrevious: true,
                hasBeenActiveBefore: false,
              },
              {
                active: true,
                index: 2,
                value: 'b',
                isFirst: false,
                isLast: true,
                hasNext: false,
                hasPrevious: true,
                isNext: false,
                isPrevious: false,
                hasBeenActiveBefore: true,
              },
            ],
          },
          {
            type: 'SWAPPED',
            value: {
              a: 'b',
              b: 'c',
            },
            index: {
              a: 1,
              b: 2,
            },
            time: new Date(),
          }
        );
      });

      test('swapWithPrevious', () => {
        const { activeContent, subscriber } = setup({ active: 'b' });

        // Swap b with a
        activeContent.contents[1].swapWithPrevious();

        expect(subscriber).toHaveBeenCalledTimes(1);

        assertLastSubscriber(
          subscriber,
          {
            active: ['b'],
            activeContents: [activeContent.contents[0]],
            activeIndexes: [0],
            lastActivated: 'b',
            lastActivatedContent: activeContent.contents[0],
            lastActivatedIndex: 0,
            isCircular: false,
            direction: 'right',
            maxActivationLimit: 1,
            maxActivationLimitBehavior: 'circular',
            history: [],
            hasActiveChangedAtLeastOnce: false,
            contents: [
              {
                active: true,
                index: 0,
                value: 'b',
                isFirst: true,
                isLast: false,
                hasNext: true,
                hasPrevious: false,
                isNext: false,
                isPrevious: false,
                hasBeenActiveBefore: true,
              },
              {
                active: false,
                index: 1,
                value: 'a',
                isFirst: false,
                isLast: false,
                hasNext: true,
                hasPrevious: true,
                isNext: true,
                isPrevious: false,
                hasBeenActiveBefore: false,
              },
              {
                active: false,
                index: 2,
                value: 'c',
                isFirst: false,
                isLast: true,
                hasNext: false,
                hasPrevious: true,
                isNext: false,
                isPrevious: false,
                hasBeenActiveBefore: false,
              },
            ],
          },
          {
            type: 'SWAPPED',
            value: {
              a: 'b',
              b: 'a',
            },
            index: {
              a: 1,
              b: 0,
            },
            time: new Date(),
          }
        );
      });
    });
  });

  describe('moving of elements', () => {
    describe('moveByIndex', () => {
      describe('when it throws out of bounds', () => {
        describe('when it throws out of bounds for index "from"', () => {
          test('throws out of bounds when index is to large', () => {
            const { activeContent, subscriber } = setup();

            expect(() => {
              activeContent.moveByIndex(4, 0);
            }).toThrowError(
              `uiloos > ActiveList > moveByIndex > "from" is out of bounds`
            );

            expect(() => {
              activeContent.moveByIndex(4, 0);
            }).toThrowError(
              ActiveListIndexOutOfBoundsError
            );

            expect(() => {
              activeContent.moveByIndex(3, 0);
            }).toThrowError(
              `uiloos > ActiveList > moveByIndex > "from" is out of bounds`
            );

            expect(() => {
              activeContent.moveByIndex(3, 0);
            }).toThrowError(
              ActiveListIndexOutOfBoundsError
            );

            expect(subscriber).toHaveBeenCalledTimes(0);
          });

          test('throws out of bounds when index is less than zero', () => {
            const { activeContent, subscriber } = setup();

            expect(() => {
              activeContent.moveByIndex(-1, 0);
            }).toThrowError(
              `uiloos > ActiveList > moveByIndex > "from" is out of bounds`
            );

            expect(() => {
              activeContent.moveByIndex(-1, 0);
            }).toThrowError(
              ActiveListIndexOutOfBoundsError
            );

            expect(subscriber).toHaveBeenCalledTimes(0);
          });
        });

        describe('when it throws out of bounds for index "too"', () => {
          test('throws out of bounds when index is to large', () => {
            const { activeContent, subscriber } = setup();

            expect(() => {
              activeContent.moveByIndex(0, 4);
            }).toThrowError(
              `uiloos > ActiveList > moveByIndex > "to" is out of bounds`
            );

            expect(() => {
              activeContent.moveByIndex(0, 4);
            }).toThrowError(
              ActiveListIndexOutOfBoundsError
            );

            expect(() => {
              activeContent.moveByIndex(0, 3);
            }).toThrowError(
              `uiloos > ActiveList > moveByIndex > "to" is out of bounds`
            );

            expect(() => {
              activeContent.moveByIndex(0, 3);
            }).toThrowError(
              ActiveListIndexOutOfBoundsError
            );

            expect(subscriber).toHaveBeenCalledTimes(0);
          });

          test('throws out of bounds when index is less than zero', () => {
            const { activeContent, subscriber } = setup();

            expect(() => {
              activeContent.moveByIndex(0, -1);
            }).toThrowError(
              `uiloos > ActiveList > moveByIndex > "to" is out of bounds`
            );

            expect(() => {
              activeContent.moveByIndex(0, -1);
            }).toThrowError(
              ActiveListIndexOutOfBoundsError
            );

            expect(subscriber).toHaveBeenCalledTimes(0);
          });
        });
      });

      describe('when maxActivationLimit is 1', () => {
        test('moving from before the lastActivatedIndex to beyond the lastActivatedIndex', () => {
          const { activeContent, subscriber } = setup(
            {
              active: 'D',
            },
            ['a', 'b', 'c', 'D', 'e', 'f', 'g']
          );

          // Move b after e
          activeContent.moveByIndex(1, 4);

          const expected = ['a', 'c', 'D', 'e', 'b', 'f', 'g'];
          expect(activeContent.contents.map((c) => c.value)).toEqual(expected);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['D'],
              activeContents: [activeContent.contents[2]],
              activeIndexes: [2],
              lastActivated: 'D',
              lastActivatedContent: activeContent.contents[2],
              lastActivatedIndex: 2,
              isCircular: false,
              direction: 'right',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              contents: [
                {
                  active: false,
                  index: 0,
                  value: 'a',
                  isFirst: true,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: false,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 1,
                  value: 'c',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: true,
                  hasBeenActiveBefore: false,
                },
                {
                  active: true,
                  index: 2,
                  value: 'D',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: false,
                  index: 3,
                  value: 'e',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: true,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 4,
                  value: 'b',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 5,
                  value: 'f',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 6,
                  value: 'g',
                  isFirst: false,
                  isLast: true,
                  hasNext: false,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
              ],
            },
            {
              type: 'MOVED',
              value: 'b',
              index: {
                from: 1,
                to: 4,
              },
              time: new Date(),
            }
          );
        });

        test('moving from before the lastActivatedIndex to directly onto the lastActivatedIndex', () => {
          const { activeContent, subscriber } = setup(
            {
              active: 'D',
            },
            ['a', 'b', 'c', 'D', 'e', 'f', 'g']
          );

          // Move c onto D
          activeContent.moveByIndex(2, 3);

          const expected = ['a', 'b', 'D', 'c', 'e', 'f', 'g'];
          expect(activeContent.contents.map((c) => c.value)).toEqual(expected);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['D'],
              activeContents: [activeContent.contents[2]],
              activeIndexes: [2],
              lastActivated: 'D',
              lastActivatedContent: activeContent.contents[2],
              lastActivatedIndex: 2,
              isCircular: false,
              direction: 'right',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              contents: [
                {
                  active: false,
                  index: 0,
                  value: 'a',
                  isFirst: true,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: false,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 1,
                  value: 'b',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: true,
                  hasBeenActiveBefore: false,
                },
                {
                  active: true,
                  index: 2,
                  value: 'D',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: false,
                  index: 3,
                  value: 'c',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: true,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 4,
                  value: 'e',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 5,
                  value: 'f',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 6,
                  value: 'g',
                  isFirst: false,
                  isLast: true,
                  hasNext: false,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
              ],
            },
            {
              type: 'MOVED',
              value: 'c',
              index: {
                from: 2,
                to: 3,
              },
              time: new Date(),
            }
          );
        });

        test('moving from first to last', () => {
          const { activeContent, subscriber } = setup(
            {
              active: 'D',
            },
            ['a', 'b', 'c', 'D', 'e', 'f', 'g']
          );

          // Move a after g
          activeContent.moveByIndex(0, 6);

          const expected = ['b', 'c', 'D', 'e', 'f', 'g', 'a'];
          expect(activeContent.contents.map((c) => c.value)).toEqual(expected);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['D'],
              activeContents: [activeContent.contents[2]],
              activeIndexes: [2],
              lastActivated: 'D',
              lastActivatedContent: activeContent.contents[2],
              lastActivatedIndex: 2,
              isCircular: false,
              direction: 'right',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              contents: [
                {
                  active: false,
                  index: 0,
                  value: 'b',
                  isFirst: true,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: false,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 1,
                  value: 'c',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: true,
                  hasBeenActiveBefore: false,
                },
                {
                  active: true,
                  index: 2,
                  value: 'D',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: false,
                  index: 3,
                  value: 'e',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: true,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 4,
                  value: 'f',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 5,
                  value: 'g',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 6,
                  value: 'a',
                  isFirst: false,
                  isLast: true,
                  hasNext: false,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
              ],
            },
            {
              type: 'MOVED',
              value: 'a',
              index: {
                from: 0,
                to: 6,
              },
              time: new Date(),
            }
          );
        });

        test('moving from beyond the lastActivatedIndex to before the lastActivatedIndex', () => {
          const { activeContent, subscriber } = setup(
            {
              active: 'D',
            },
            ['a', 'b', 'c', 'D', 'e', 'f', 'g']
          );

          // Move e before b
          activeContent.moveByIndex(4, 1);

          const expected = ['a', 'e', 'b', 'c', 'D', 'f', 'g'];
          expect(activeContent.contents.map((c) => c.value)).toEqual(expected);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['D'],
              activeContents: [activeContent.contents[4]],
              activeIndexes: [4],
              lastActivated: 'D',
              lastActivatedContent: activeContent.contents[4],
              lastActivatedIndex: 4,
              isCircular: false,
              direction: 'right',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              contents: [
                {
                  active: false,
                  index: 0,
                  value: 'a',
                  isFirst: true,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: false,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 1,
                  value: 'e',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 2,
                  value: 'b',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 3,
                  value: 'c',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: true,
                  hasBeenActiveBefore: false,
                },
                {
                  active: true,
                  index: 4,
                  value: 'D',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: false,
                  index: 5,
                  value: 'f',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: true,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 6,
                  value: 'g',
                  isFirst: false,
                  isLast: true,
                  hasNext: false,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
              ],
            },
            {
              type: 'MOVED',
              value: 'e',
              index: {
                from: 4,
                to: 1,
              },
              time: new Date(),
            }
          );
        });

        test('moving from beyond the lastActivatedIndex to directly onto lastActivatedIndex', () => {
          const { activeContent, subscriber } = setup(
            {
              active: 'D',
            },
            ['a', 'b', 'c', 'D', 'e', 'f', 'g']
          );

          // Move e unto D
          activeContent.moveByIndex(4, 3);

          const expected = ['a', 'b', 'c', 'e', 'D', 'f', 'g'];
          expect(activeContent.contents.map((c) => c.value)).toEqual(expected);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['D'],
              activeContents: [activeContent.contents[4]],
              activeIndexes: [4],
              lastActivated: 'D',
              lastActivatedContent: activeContent.contents[4],
              lastActivatedIndex: 4,
              isCircular: false,
              direction: 'right',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              contents: [
                {
                  active: false,
                  index: 0,
                  value: 'a',
                  isFirst: true,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: false,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 1,
                  value: 'b',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 2,
                  value: 'c',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 3,
                  value: 'e',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: true,
                  hasBeenActiveBefore: false,
                },
                {
                  active: true,
                  index: 4,
                  value: 'D',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: false,
                  index: 5,
                  value: 'f',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: true,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 6,
                  value: 'g',
                  isFirst: false,
                  isLast: true,
                  hasNext: false,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
              ],
            },
            {
              type: 'MOVED',
              value: 'e',
              index: {
                from: 4,
                to: 3,
              },
              time: new Date(),
            }
          );
        });

        test('moving from last to first', () => {
          const { activeContent, subscriber } = setup(
            {
              active: 'D',
            },
            ['a', 'b', 'c', 'D', 'e', 'f', 'g']
          );

          // Move g before a
          activeContent.moveByIndex(6, 0);

          const expected = ['g', 'a', 'b', 'c', 'D', 'e', 'f'];
          expect(activeContent.contents.map((c) => c.value)).toEqual(expected);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['D'],
              activeContents: [activeContent.contents[4]],
              activeIndexes: [4],
              lastActivated: 'D',
              lastActivatedContent: activeContent.contents[4],
              lastActivatedIndex: 4,
              isCircular: false,
              direction: 'right',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              contents: [
                {
                  active: false,
                  index: 0,
                  value: 'g',
                  isFirst: true,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: false,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 1,
                  value: 'a',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 2,
                  value: 'b',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 3,
                  value: 'c',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: true,
                  hasBeenActiveBefore: false,
                },
                {
                  active: true,
                  index: 4,
                  value: 'D',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: false,
                  index: 5,
                  value: 'e',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: true,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 6,
                  value: 'f',
                  isFirst: false,
                  isLast: true,
                  hasNext: false,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
              ],
            },
            {
              type: 'MOVED',
              value: 'g',
              index: {
                from: 6,
                to: 0,
              },
              time: new Date(),
            }
          );
        });

        test('moving from beyond the lastActivatedIndex to beyond lastActivatedIndex', () => {
          const { activeContent, subscriber } = setup(
            {
              active: 'D',
            },
            ['a', 'b', 'c', 'D', 'e', 'f', 'g']
          );

          // Move e after f
          activeContent.moveByIndex(4, 5);

          const expected = ['a', 'b', 'c', 'D', 'f', 'e', 'g'];
          expect(activeContent.contents.map((c) => c.value)).toEqual(expected);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['D'],
              activeContents: [activeContent.contents[3]],
              activeIndexes: [3],
              lastActivated: 'D',
              lastActivatedContent: activeContent.contents[3],
              lastActivatedIndex: 3,
              isCircular: false,
              direction: 'right',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              contents: [
                {
                  active: false,
                  index: 0,
                  value: 'a',
                  isFirst: true,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: false,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 1,
                  value: 'b',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 2,
                  value: 'c',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: true,
                  hasBeenActiveBefore: false,
                },
                {
                  active: true,
                  index: 3,
                  value: 'D',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: false,
                  index: 4,
                  value: 'f',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: true,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 5,
                  value: 'e',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 6,
                  value: 'g',
                  isFirst: false,
                  isLast: true,
                  hasNext: false,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
              ],
            },
            {
              type: 'MOVED',
              value: 'e',
              index: {
                from: 4,
                to: 5,
              },
              time: new Date(),
            }
          );
        });

        test('moving from before the lastActivatedIndex to before lastActivatedIndex', () => {
          const { activeContent, subscriber } = setup(
            {
              active: 'D',
            },
            ['a', 'b', 'c', 'D', 'e', 'f', 'g']
          );

          // Move c before b
          activeContent.moveByIndex(2, 1);

          const expected = ['a', 'c', 'b', 'D', 'e', 'f', 'g'];
          expect(activeContent.contents.map((c) => c.value)).toEqual(expected);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['D'],
              activeContents: [activeContent.contents[3]],
              activeIndexes: [3],
              lastActivated: 'D',
              lastActivatedContent: activeContent.contents[3],
              lastActivatedIndex: 3,
              isCircular: false,
              direction: 'right',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              contents: [
                {
                  active: false,
                  index: 0,
                  value: 'a',
                  isFirst: true,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: false,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 1,
                  value: 'c',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 2,
                  value: 'b',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: true,
                  hasBeenActiveBefore: false,
                },
                {
                  active: true,
                  index: 3,
                  value: 'D',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: false,
                  index: 4,
                  value: 'e',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: true,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 5,
                  value: 'f',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 6,
                  value: 'g',
                  isFirst: false,
                  isLast: true,
                  hasNext: false,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
              ],
            },
            {
              type: 'MOVED',
              value: 'c',
              index: {
                from: 2,
                to: 1,
              },
              time: new Date(),
            }
          );
        });

        test('moving from lastActivatedIndex to beyond lastActivatedIndex', () => {
          const { activeContent, subscriber } = setup(
            {
              active: 'D',
            },
            ['a', 'b', 'c', 'D', 'e', 'f', 'g']
          );

          // Move D after e
          activeContent.moveByIndex(3, 4);

          const expected = ['a', 'b', 'c', 'e', 'D', 'f', 'g'];
          expect(activeContent.contents.map((c) => c.value)).toEqual(expected);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['D'],
              activeContents: [activeContent.contents[4]],
              activeIndexes: [4],
              lastActivated: 'D',
              lastActivatedContent: activeContent.contents[4],
              lastActivatedIndex: 4,
              isCircular: false,
              direction: 'right',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              contents: [
                {
                  active: false,
                  index: 0,
                  value: 'a',
                  isFirst: true,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: false,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 1,
                  value: 'b',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 2,
                  value: 'c',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 3,
                  value: 'e',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: true,
                  hasBeenActiveBefore: false,
                },
                {
                  active: true,
                  index: 4,
                  value: 'D',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: false,
                  index: 5,
                  value: 'f',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: true,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 6,
                  value: 'g',
                  isFirst: false,
                  isLast: true,
                  hasNext: false,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
              ],
            },
            {
              type: 'MOVED',
              value: 'D',
              index: {
                from: 3,
                to: 4,
              },
              time: new Date(),
            }
          );
        });

        test('moving from lastActivatedIndex to before lastActivatedIndex', () => {
          const { activeContent, subscriber } = setup(
            {
              active: 'D',
            },
            ['a', 'b', 'c', 'D', 'e', 'f', 'g']
          );

          // Move D before c
          activeContent.moveByIndex(3, 2);

          const expected = ['a', 'b', 'D', 'c', 'e', 'f', 'g'];
          expect(activeContent.contents.map((c) => c.value)).toEqual(expected);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['D'],
              activeContents: [activeContent.contents[2]],
              activeIndexes: [2],
              lastActivated: 'D',
              lastActivatedContent: activeContent.contents[2],
              lastActivatedIndex: 2,
              isCircular: false,
              direction: 'right',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              contents: [
                {
                  active: false,
                  index: 0,
                  value: 'a',
                  isFirst: true,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: false,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 1,
                  value: 'b',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: true,
                  hasBeenActiveBefore: false,
                },
                {
                  active: true,
                  index: 2,
                  value: 'D',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: false,
                  index: 3,
                  value: 'c',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: true,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 4,
                  value: 'e',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 5,
                  value: 'f',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 6,
                  value: 'g',
                  isFirst: false,
                  isLast: true,
                  hasNext: false,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
              ],
            },
            {
              type: 'MOVED',
              value: 'D',
              index: {
                from: 3,
                to: 2,
              },
              time: new Date(),
            }
          );
        });

        test('moving from active to first', () => {
          const { activeContent, subscriber } = setup(
            {
              active: 'D',
            },
            ['a', 'b', 'c', 'D', 'e', 'f', 'g']
          );

          // Move D before a
          activeContent.moveByIndex(3, 0);

          const expected = ['D', 'a', 'b', 'c', 'e', 'f', 'g'];
          expect(activeContent.contents.map((c) => c.value)).toEqual(expected);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['D'],
              activeContents: [activeContent.contents[0]],
              activeIndexes: [0],
              lastActivated: 'D',
              lastActivatedContent: activeContent.contents[0],
              lastActivatedIndex: 0,
              isCircular: false,
              direction: 'right',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              contents: [
                {
                  active: true,
                  index: 0,
                  value: 'D',
                  isFirst: true,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: false,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: false,
                  index: 1,
                  value: 'a',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: true,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 2,
                  value: 'b',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 3,
                  value: 'c',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 4,
                  value: 'e',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 5,
                  value: 'f',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 6,
                  value: 'g',
                  isFirst: false,
                  isLast: true,
                  hasNext: false,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
              ],
            },
            {
              type: 'MOVED',
              value: 'D',
              index: {
                from: 3,
                to: 0,
              },
              time: new Date(),
            }
          );
        });

        test('moving from active to last', () => {
          const { activeContent, subscriber } = setup(
            {
              active: 'D',
            },
            ['a', 'b', 'c', 'D', 'e', 'f', 'g']
          );

          // Move D before a
          activeContent.moveByIndex(3, 6);

          const expected = ['a', 'b', 'c', 'e', 'f', 'g', 'D'];
          expect(activeContent.contents.map((c) => c.value)).toEqual(expected);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['D'],
              activeContents: [activeContent.contents[6]],
              activeIndexes: [6],
              lastActivated: 'D',
              lastActivatedContent: activeContent.contents[6],
              lastActivatedIndex: 6,
              isCircular: false,
              direction: 'right',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              contents: [
                {
                  active: false,
                  index: 0,
                  value: 'a',
                  isFirst: true,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: false,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 1,
                  value: 'b',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 2,
                  value: 'c',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 3,
                  value: 'e',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 4,
                  value: 'f',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 5,
                  value: 'g',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: true,
                  hasBeenActiveBefore: false,
                },
                {
                  active: true,
                  index: 6,
                  value: 'D',
                  isFirst: false,
                  isLast: true,
                  hasNext: false,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
              ],
            },
            {
              type: 'MOVED',
              value: 'D',
              index: {
                from: 3,
                to: 6,
              },
              time: new Date(),
            }
          );
        });

        test('moving when circular should fix previous and next', () => {
          const { activeContent, subscriber } = setup({
            active: 'b',
            isCircular: true,
          });

          // Move a beyond c
          activeContent.moveByIndex(0, 2);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['b'],
              activeContents: [activeContent.contents[0]],
              activeIndexes: [0],
              lastActivated: 'b',
              lastActivatedContent: activeContent.contents[0],
              lastActivatedIndex: 0,
              isCircular: true,
              direction: 'right',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              contents: [
                {
                  active: true,
                  index: 0,
                  value: 'b',
                  isFirst: true,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: false,
                  index: 1,
                  value: 'c',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: true,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 2,
                  value: 'a',
                  isFirst: false,
                  isLast: true,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: true,
                  hasBeenActiveBefore: false,
                },
              ],
            },
            {
              type: 'MOVED',
              value: 'a',
              index: {
                from: 0,
                to: 2,
              },
              time: new Date(),
            }
          );
        });

        test('when from and to are the same do nothing ', () => {
          const { activeContent, subscriber } = setup({
            active: 'b',
          });

          // Move a beyond c
          activeContent.moveByIndex(1, 1);

          expect(subscriber).toHaveBeenCalledTimes(0);
        });
      });

      describe('when maxActivationLimit is false', () => {
        test('when all items are active they should all still be active after the move', () => {
          const { activeContent, subscriber } = setup(
            {
              maxActivationLimit: false,
              active: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
            },
            ['a', 'b', 'c', 'd', 'e', 'f', 'g']
          );

          // Move b after e
          activeContent.moveByIndex(1, 4);

          const expected = ['a', 'c', 'd', 'e', 'b', 'f', 'g'];
          expect(activeContent.contents.map((c) => c.value)).toEqual(expected);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
              activeContents: [
                activeContent.contents[0],
                activeContent.contents[4],
                activeContent.contents[1],
                activeContent.contents[2],
                activeContent.contents[3],
                activeContent.contents[5],
                activeContent.contents[6],
              ],
              activeIndexes: [0, 4, 1, 2, 3, 5, 6],
              lastActivated: 'g',
              lastActivatedContent: activeContent.contents[6],
              lastActivatedIndex: 6,
              isCircular: false,
              direction: 'right',
              maxActivationLimit: false,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              contents: [
                {
                  active: true,
                  index: 0,
                  value: 'a',
                  isFirst: true,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: false,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 1,
                  value: 'c',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 2,
                  value: 'd',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 3,
                  value: 'e',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 4,
                  value: 'b',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 5,
                  value: 'f',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: true,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 6,
                  value: 'g',
                  isFirst: false,
                  isLast: true,
                  hasNext: false,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
              ],
            },
            {
              type: 'MOVED',
              value: 'b',
              index: {
                from: 1,
                to: 4,
              },
              time: new Date(),
            }
          );
        });

        test('moving from before the lastActivatedIndex to beyond the lastActivatedIndex', () => {
          const { activeContent, subscriber } = setup(
            {
              maxActivationLimit: false,
              active: ['a', 'b', 'c', 'e', 'f', 'g', 'D'],
            },
            ['a', 'b', 'c', 'D', 'e', 'f', 'g']
          );

          // Move b after e
          activeContent.moveByIndex(1, 4);

          const expected = ['a', 'c', 'D', 'e', 'b', 'f', 'g'];
          expect(activeContent.contents.map((c) => c.value)).toEqual(expected);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['a', 'b', 'c', 'e', 'f', 'g', 'D'],
              activeContents: [
                activeContent.contents[0],
                activeContent.contents[4],
                activeContent.contents[1],
                activeContent.contents[3],
                activeContent.contents[5],
                activeContent.contents[6],
                activeContent.contents[2],
              ],
              activeIndexes: [0, 4, 1, 3, 5, 6, 2],
              lastActivated: 'D',
              lastActivatedContent: activeContent.contents[2],
              lastActivatedIndex: 2,
              isCircular: false,
              direction: 'right',
              maxActivationLimit: false,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              contents: [
                {
                  active: true,
                  index: 0,
                  value: 'a',
                  isFirst: true,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: false,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 1,
                  value: 'c',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: true,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 2,
                  value: 'D',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 3,
                  value: 'e',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: true,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 4,
                  value: 'b',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 5,
                  value: 'f',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 6,
                  value: 'g',
                  isFirst: false,
                  isLast: true,
                  hasNext: false,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
              ],
            },
            {
              type: 'MOVED',
              value: 'b',
              index: {
                from: 1,
                to: 4,
              },
              time: new Date(),
            }
          );
        });

        test('moving from before the lastActivatedIndex to directly onto the lastActivatedIndex', () => {
          const { activeContent, subscriber } = setup(
            {
              maxActivationLimit: false,
              active: ['b', 'e', 'f', 'a', 'c', 'g', 'D'],
            },
            ['a', 'b', 'c', 'D', 'e', 'f', 'g']
          );

          // Move c onto D
          activeContent.moveByIndex(2, 3);

          const expected = ['a', 'b', 'D', 'c', 'e', 'f', 'g'];
          expect(activeContent.contents.map((c) => c.value)).toEqual(expected);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['b', 'e', 'f', 'a', 'c', 'g', 'D'],
              activeContents: [
                activeContent.contents[1],
                activeContent.contents[4],
                activeContent.contents[5],
                activeContent.contents[0],
                activeContent.contents[3],
                activeContent.contents[6],
                activeContent.contents[2],
              ],
              activeIndexes: [1, 4, 5, 0, 3, 6, 2],
              lastActivated: 'D',
              lastActivatedContent: activeContent.contents[2],
              lastActivatedIndex: 2,
              isCircular: false,
              direction: 'right',
              maxActivationLimit: false,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              contents: [
                {
                  active: true,
                  index: 0,
                  value: 'a',
                  isFirst: true,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: false,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 1,
                  value: 'b',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: true,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 2,
                  value: 'D',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 3,
                  value: 'c',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: true,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 4,
                  value: 'e',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 5,
                  value: 'f',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 6,
                  value: 'g',
                  isFirst: false,
                  isLast: true,
                  hasNext: false,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
              ],
            },
            {
              type: 'MOVED',
              value: 'c',
              index: {
                from: 2,
                to: 3,
              },
              time: new Date(),
            }
          );
        });

        test('moving from first to last', () => {
          const { activeContent, subscriber } = setup(
            {
              maxActivationLimit: false,
              active: ['g', 'f', 'e', 'c', 'b', 'a', 'D'],
            },
            ['a', 'b', 'c', 'D', 'e', 'f', 'g']
          );

          // Move a after g
          activeContent.moveByIndex(0, 6);

          const expected = ['b', 'c', 'D', 'e', 'f', 'g', 'a'];
          expect(activeContent.contents.map((c) => c.value)).toEqual(expected);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['g', 'f', 'e', 'c', 'b', 'a', 'D'],
              activeContents: [
                activeContent.contents[5],
                activeContent.contents[4],
                activeContent.contents[3],
                activeContent.contents[1],
                activeContent.contents[0],
                activeContent.contents[6],
                activeContent.contents[2],
              ],
              activeIndexes: [5, 4, 3, 1, 0, 6, 2],
              lastActivated: 'D',
              lastActivatedContent: activeContent.contents[2],
              lastActivatedIndex: 2,
              isCircular: false,
              direction: 'right',
              maxActivationLimit: false,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              contents: [
                {
                  active: true,
                  index: 0,
                  value: 'b',
                  isFirst: true,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: false,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 1,
                  value: 'c',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: true,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 2,
                  value: 'D',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 3,
                  value: 'e',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: true,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 4,
                  value: 'f',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 5,
                  value: 'g',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 6,
                  value: 'a',
                  isFirst: false,
                  isLast: true,
                  hasNext: false,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
              ],
            },
            {
              type: 'MOVED',
              value: 'a',
              index: {
                from: 0,
                to: 6,
              },
              time: new Date(),
            }
          );
        });

        test('moving from beyond the lastActivatedIndex to before the lastActivatedIndex', () => {
          const { activeContent, subscriber } = setup(
            {
              maxActivationLimit: false,
              active: ['b', 'a', 'c', 'e', 'f', 'g', 'D'],
            },
            ['a', 'b', 'c', 'D', 'e', 'f', 'g']
          );

          // Move e before b
          activeContent.moveByIndex(4, 1);

          const expected = ['a', 'e', 'b', 'c', 'D', 'f', 'g'];
          expect(activeContent.contents.map((c) => c.value)).toEqual(expected);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['b', 'a', 'c', 'e', 'f', 'g', 'D'],
              activeContents: [
                activeContent.contents[2],
                activeContent.contents[0],
                activeContent.contents[3],
                activeContent.contents[1],
                activeContent.contents[5],
                activeContent.contents[6],
                activeContent.contents[4],
              ],
              activeIndexes: [2, 0, 3, 1, 5, 6, 4],
              lastActivated: 'D',
              lastActivatedContent: activeContent.contents[4],
              lastActivatedIndex: 4,
              isCircular: false,
              direction: 'right',
              maxActivationLimit: false,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              contents: [
                {
                  active: true,
                  index: 0,
                  value: 'a',
                  isFirst: true,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: false,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 1,
                  value: 'e',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 2,
                  value: 'b',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 3,
                  value: 'c',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: true,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 4,
                  value: 'D',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 5,
                  value: 'f',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: true,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 6,
                  value: 'g',
                  isFirst: false,
                  isLast: true,
                  hasNext: false,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
              ],
            },
            {
              type: 'MOVED',
              value: 'e',
              index: {
                from: 4,
                to: 1,
              },
              time: new Date(),
            }
          );
        });

        test('moving from beyond the lastActivatedIndex to directly onto the lastActivatedIndex', () => {
          const { activeContent, subscriber } = setup(
            {
              maxActivationLimit: false,
              active: ['e', 'f', 'g', 'a', 'b', 'c', 'D'],
            },
            ['a', 'b', 'c', 'D', 'e', 'f', 'g']
          );

          // Move e unto D
          activeContent.moveByIndex(4, 3);

          const expected = ['a', 'b', 'c', 'e', 'D', 'f', 'g'];
          expect(activeContent.contents.map((c) => c.value)).toEqual(expected);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['e', 'f', 'g', 'a', 'b', 'c', 'D'],
              activeContents: [
                activeContent.contents[3],
                activeContent.contents[5],
                activeContent.contents[6],
                activeContent.contents[0],
                activeContent.contents[1],
                activeContent.contents[2],
                activeContent.contents[4],
              ],
              activeIndexes: [3, 5, 6, 0, 1, 2, 4],
              lastActivated: 'D',
              lastActivatedContent: activeContent.contents[4],
              lastActivatedIndex: 4,
              isCircular: false,
              direction: 'right',
              maxActivationLimit: false,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              contents: [
                {
                  active: true,
                  index: 0,
                  value: 'a',
                  isFirst: true,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: false,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 1,
                  value: 'b',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 2,
                  value: 'c',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 3,
                  value: 'e',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: true,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 4,
                  value: 'D',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 5,
                  value: 'f',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: true,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 6,
                  value: 'g',
                  isFirst: false,
                  isLast: true,
                  hasNext: false,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
              ],
            },
            {
              type: 'MOVED',
              value: 'e',
              index: {
                from: 4,
                to: 3,
              },
              time: new Date(),
            }
          );
        });

        test('moving from last to first', () => {
          const { activeContent, subscriber } = setup(
            {
              maxActivationLimit: false,
              active: ['c', 'f', 'b', 'a', 'g', 'e', 'D'],
            },
            ['a', 'b', 'c', 'D', 'e', 'f', 'g']
          );

          // Move g before a
          activeContent.moveByIndex(6, 0);

          const expected = ['g', 'a', 'b', 'c', 'D', 'e', 'f'];
          expect(activeContent.contents.map((c) => c.value)).toEqual(expected);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['c', 'f', 'b', 'a', 'g', 'e', 'D'],
              activeContents: [
                activeContent.contents[3],
                activeContent.contents[6],
                activeContent.contents[2],
                activeContent.contents[1],
                activeContent.contents[0],
                activeContent.contents[5],
                activeContent.contents[4],
              ],
              activeIndexes: [3, 6, 2, 1, 0, 5, 4],
              lastActivated: 'D',
              lastActivatedContent: activeContent.contents[4],
              lastActivatedIndex: 4,
              isCircular: false,
              direction: 'right',
              maxActivationLimit: false,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              contents: [
                {
                  active: true,
                  index: 0,
                  value: 'g',
                  isFirst: true,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: false,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 1,
                  value: 'a',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 2,
                  value: 'b',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 3,
                  value: 'c',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: true,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 4,
                  value: 'D',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 5,
                  value: 'e',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: true,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 6,
                  value: 'f',
                  isFirst: false,
                  isLast: true,
                  hasNext: false,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
              ],
            },
            {
              type: 'MOVED',
              value: 'g',
              index: {
                from: 6,
                to: 0,
              },
              time: new Date(),
            }
          );
        });

        test('moving from beyond the lastActivatedIndex to beyond the lastActivatedIndex', () => {
          const { activeContent, subscriber } = setup(
            {
              maxActivationLimit: false,
              active: ['a', 'f', 'e', 'b', 'c', 'g', 'D'],
            },
            ['a', 'b', 'c', 'D', 'e', 'f', 'g']
          );

          // Move e after f
          activeContent.moveByIndex(4, 5);

          const expected = ['a', 'b', 'c', 'D', 'f', 'e', 'g'];
          expect(activeContent.contents.map((c) => c.value)).toEqual(expected);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['a', 'f', 'e', 'b', 'c', 'g', 'D'],
              activeContents: [
                activeContent.contents[0],
                activeContent.contents[4],
                activeContent.contents[5],
                activeContent.contents[1],
                activeContent.contents[2],
                activeContent.contents[6],
                activeContent.contents[3],
              ],
              activeIndexes: [0, 4, 5, 1, 2, 6, 3],
              lastActivated: 'D',
              lastActivatedContent: activeContent.contents[3],
              lastActivatedIndex: 3,
              isCircular: false,
              direction: 'right',
              maxActivationLimit: false,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              contents: [
                {
                  active: true,
                  index: 0,
                  value: 'a',
                  isFirst: true,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: false,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 1,
                  value: 'b',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 2,
                  value: 'c',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: true,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 3,
                  value: 'D',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 4,
                  value: 'f',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: true,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 5,
                  value: 'e',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 6,
                  value: 'g',
                  isFirst: false,
                  isLast: true,
                  hasNext: false,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
              ],
            },
            {
              type: 'MOVED',
              value: 'e',
              index: {
                from: 4,
                to: 5,
              },
              time: new Date(),
            }
          );
        });

        test('moving from before the lastActivatedIndex to before the lastActivatedIndex', () => {
          const { activeContent, subscriber } = setup(
            {
              maxActivationLimit: false,
              active: ['g', 'a', 'b', 'e', 'f', 'c', 'D'],
            },
            ['a', 'b', 'c', 'D', 'e', 'f', 'g']
          );

          // Move c before b
          activeContent.moveByIndex(2, 1);

          const expected = ['a', 'c', 'b', 'D', 'e', 'f', 'g'];
          expect(activeContent.contents.map((c) => c.value)).toEqual(expected);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['g', 'a', 'b', 'e', 'f', 'c', 'D'],
              activeContents: [
                activeContent.contents[6],
                activeContent.contents[0],
                activeContent.contents[2],
                activeContent.contents[4],
                activeContent.contents[5],
                activeContent.contents[1],
                activeContent.contents[3],
              ],
              activeIndexes: [6, 0, 2, 4, 5, 1, 3],
              lastActivated: 'D',
              lastActivatedContent: activeContent.contents[3],
              lastActivatedIndex: 3,
              isCircular: false,
              direction: 'right',
              maxActivationLimit: false,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              contents: [
                {
                  active: true,
                  index: 0,
                  value: 'a',
                  isFirst: true,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: false,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 1,
                  value: 'c',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 2,
                  value: 'b',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: true,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 3,
                  value: 'D',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 4,
                  value: 'e',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: true,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 5,
                  value: 'f',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 6,
                  value: 'g',
                  isFirst: false,
                  isLast: true,
                  hasNext: false,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
              ],
            },
            {
              type: 'MOVED',
              value: 'c',
              index: {
                from: 2,
                to: 1,
              },
              time: new Date(),
            }
          );
        });

        test('moving from lastActivatedIndex to beyond lastActivatedIndex', () => {
          const { activeContent, subscriber } = setup(
            {
              maxActivationLimit: false,
              active: ['f', 'b', 'a', 'c', 'e', 'g', 'D'],
            },
            ['a', 'b', 'c', 'D', 'e', 'f', 'g']
          );

          // Move D after e
          activeContent.moveByIndex(3, 4);

          const expected = ['a', 'b', 'c', 'e', 'D', 'f', 'g'];
          expect(activeContent.contents.map((c) => c.value)).toEqual(expected);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['f', 'b', 'a', 'c', 'e', 'g', 'D'],
              activeContents: [
                activeContent.contents[5],
                activeContent.contents[1],
                activeContent.contents[0],
                activeContent.contents[2],
                activeContent.contents[3],
                activeContent.contents[6],
                activeContent.contents[4],
              ],
              activeIndexes: [5, 1, 0, 2, 3, 6, 4],
              lastActivated: 'D',
              lastActivatedContent: activeContent.contents[4],
              lastActivatedIndex: 4,
              isCircular: false,
              direction: 'right',
              maxActivationLimit: false,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              contents: [
                {
                  active: true,
                  index: 0,
                  value: 'a',
                  isFirst: true,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: false,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 1,
                  value: 'b',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 2,
                  value: 'c',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 3,
                  value: 'e',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: true,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 4,
                  value: 'D',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 5,
                  value: 'f',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: true,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 6,
                  value: 'g',
                  isFirst: false,
                  isLast: true,
                  hasNext: false,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
              ],
            },
            {
              type: 'MOVED',
              value: 'D',
              index: {
                from: 3,
                to: 4,
              },
              time: new Date(),
            }
          );
        });

        test('moving from lastActivatedIndex to before lastActivatedIndex', () => {
          const { activeContent, subscriber } = setup(
            {
              maxActivationLimit: false,
              active: ['e', 'a', 'g', 'f', 'b', 'c', 'D'],
            },
            ['a', 'b', 'c', 'D', 'e', 'f', 'g']
          );

          // Move D before c
          activeContent.moveByIndex(3, 2);

          const expected = ['a', 'b', 'D', 'c', 'e', 'f', 'g'];
          expect(activeContent.contents.map((c) => c.value)).toEqual(expected);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['e', 'a', 'g', 'f', 'b', 'c', 'D'],
              activeContents: [
                activeContent.contents[4],
                activeContent.contents[0],
                activeContent.contents[6],
                activeContent.contents[5],
                activeContent.contents[1],
                activeContent.contents[3],
                activeContent.contents[2],
              ],
              activeIndexes: [4, 0, 6, 5, 1, 3, 2],
              lastActivated: 'D',
              lastActivatedContent: activeContent.contents[2],
              lastActivatedIndex: 2,
              isCircular: false,
              direction: 'right',
              maxActivationLimit: false,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              contents: [
                {
                  active: true,
                  index: 0,
                  value: 'a',
                  isFirst: true,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: false,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 1,
                  value: 'b',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: true,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 2,
                  value: 'D',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 3,
                  value: 'c',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: true,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 4,
                  value: 'e',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 5,
                  value: 'f',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 6,
                  value: 'g',
                  isFirst: false,
                  isLast: true,
                  hasNext: false,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
              ],
            },
            {
              type: 'MOVED',
              value: 'D',
              index: {
                from: 3,
                to: 2,
              },
              time: new Date(),
            }
          );
        });

        test('moving from lastActivatedIndex to first', () => {
          const { activeContent, subscriber } = setup(
            {
              maxActivationLimit: false,
              active: ['a', 'b', 'c', 'e', 'f', 'g', 'D'],
            },
            ['a', 'b', 'c', 'D', 'e', 'f', 'g']
          );

          // Move D before a
          activeContent.moveByIndex(3, 0);

          const expected = ['D', 'a', 'b', 'c', 'e', 'f', 'g'];
          expect(activeContent.contents.map((c) => c.value)).toEqual(expected);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['a', 'b', 'c', 'e', 'f', 'g', 'D'],
              activeContents: [
                activeContent.contents[1],
                activeContent.contents[2],
                activeContent.contents[3],
                activeContent.contents[4],
                activeContent.contents[5],
                activeContent.contents[6],
                activeContent.contents[0],
              ],
              activeIndexes: [1, 2, 3, 4, 5, 6, 0],
              lastActivated: 'D',
              lastActivatedContent: activeContent.contents[0],
              lastActivatedIndex: 0,
              isCircular: false,
              direction: 'right',
              maxActivationLimit: false,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              contents: [
                {
                  active: true,
                  index: 0,
                  value: 'D',
                  isFirst: true,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: false,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 1,
                  value: 'a',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: true,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 2,
                  value: 'b',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 3,
                  value: 'c',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 4,
                  value: 'e',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 5,
                  value: 'f',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 6,
                  value: 'g',
                  isFirst: false,
                  isLast: true,
                  hasNext: false,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
              ],
            },
            {
              type: 'MOVED',
              value: 'D',
              index: {
                from: 3,
                to: 0,
              },
              time: new Date(),
            }
          );
        });

        test('moving from lastActivatedIndex to last', () => {
          const { activeContent, subscriber } = setup(
            {
              maxActivationLimit: false,
              active: ['a', 'g', 'e', 'c', 'f', 'b', 'D'],
            },
            ['a', 'b', 'c', 'D', 'e', 'f', 'g']
          );

          // Move D after g
          activeContent.moveByIndex(3, 6);

          const expected = ['a', 'b', 'c', 'e', 'f', 'g', 'D'];
          expect(activeContent.contents.map((c) => c.value)).toEqual(expected);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['a', 'g', 'e', 'c', 'f', 'b', 'D'],
              activeContents: [
                activeContent.contents[0],
                activeContent.contents[5],
                activeContent.contents[3],
                activeContent.contents[2],
                activeContent.contents[4],
                activeContent.contents[1],
                activeContent.contents[6],
              ],
              activeIndexes: [0, 5, 3, 2, 4, 1, 6],
              lastActivated: 'D',
              lastActivatedContent: activeContent.contents[6],
              lastActivatedIndex: 6,
              isCircular: false,
              direction: 'right',
              maxActivationLimit: false,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              contents: [
                {
                  active: true,
                  index: 0,
                  value: 'a',
                  isFirst: true,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: false,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 1,
                  value: 'b',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 2,
                  value: 'c',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 3,
                  value: 'e',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 4,
                  value: 'f',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 5,
                  value: 'g',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: true,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 6,
                  value: 'D',
                  isFirst: false,
                  isLast: true,
                  hasNext: false,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
              ],
            },
            {
              type: 'MOVED',
              value: 'D',
              index: {
                from: 3,
                to: 6,
              },
              time: new Date(),
            }
          );
        });

        test('moving when circular should fix previous and next', () => {
          const { activeContent, subscriber } = setup({
            maxActivationLimit: false,
            active: ['a', 'c', 'b'],
            isCircular: true,
          });

          // Move a beyond c
          activeContent.moveByIndex(0, 2);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['a', 'c', 'b'],
              activeContents: [
                activeContent.contents[2],
                activeContent.contents[1],
                activeContent.contents[0],
              ],
              activeIndexes: [2, 1, 0],
              lastActivated: 'b',
              lastActivatedContent: activeContent.contents[0],
              lastActivatedIndex: 0,
              isCircular: true,
              direction: 'right',
              maxActivationLimit: false,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              contents: [
                {
                  active: true,
                  index: 0,
                  value: 'b',
                  isFirst: true,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 1,
                  value: 'c',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: true,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: true,
                  index: 2,
                  value: 'a',
                  isFirst: false,
                  isLast: true,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: true,
                  hasBeenActiveBefore: true,
                },
              ],
            },
            {
              type: 'MOVED',
              value: 'a',
              index: {
                from: 0,
                to: 2,
              },
              time: new Date(),
            }
          );
        });

        test('when from and to are the same do nothing ', () => {
          const { activeContent, subscriber } = setup({
            maxActivationLimit: false,
            active: 'b',
          });

          // Move a beyond c
          activeContent.moveByIndex(1, 1);

          expect(subscriber).toHaveBeenCalledTimes(0);
        });
      });
    });

    test('move', () => {
      const { activeContent, subscriber } = setup({ active: 'a' });

      // Move a beyond c
      activeContent.move('a', 2);

      expect(subscriber).toHaveBeenCalledTimes(1);

      assertLastSubscriber(
        subscriber,
        {
          active: ['a'],
          activeContents: [activeContent.contents[2]],
          activeIndexes: [2],
          lastActivated: 'a',
          lastActivatedContent: activeContent.contents[2],
          lastActivatedIndex: 2,
          isCircular: false,
          direction: 'right',
          maxActivationLimit: 1,
          maxActivationLimitBehavior: 'circular',
          history: [],
          hasActiveChangedAtLeastOnce: false,
          contents: [
            {
              active: false,
              index: 0,
              value: 'b',
              isFirst: true,
              isLast: false,
              hasNext: true,
              hasPrevious: false,
              isNext: false,
              isPrevious: false,
              hasBeenActiveBefore: false,
            },
            {
              active: false,
              index: 1,
              value: 'c',
              isFirst: false,
              isLast: false,
              hasNext: true,
              hasPrevious: true,
              isNext: false,
              isPrevious: true,
              hasBeenActiveBefore: false,
            },
            {
              active: true,
              index: 2,
              value: 'a',
              isFirst: false,
              isLast: true,
              hasNext: false,
              hasPrevious: true,
              isNext: false,
              isPrevious: false,
              hasBeenActiveBefore: true,
            },
          ],
        },
        {
          type: 'MOVED',
          value: 'a',
          index: {
            from: 0,
            to: 2,
          },
          time: new Date(),
        }
      );
    });

    describe('moveByIndexByPredicate', () => {
      test('when no mode is provided assume at', () => {
        const { activeContent, subscriber } = setup({ active: 'b' });

        activeContent.moveByIndexByPredicate(
          0,
          ({ value, index }) => value === 'b' && index === 1
        );

        expect(subscriber).toHaveBeenCalledTimes(1);

        assertLastSubscriber(
          subscriber,
          {
            active: ['b'],
            activeContents: [activeContent.contents[0]],
            activeIndexes: [0],
            lastActivated: 'b',
            lastActivatedContent: activeContent.contents[0],
            lastActivatedIndex: 0,
            isCircular: false,
            direction: 'right',
            maxActivationLimit: 1,
            maxActivationLimitBehavior: 'circular',
            history: [],
            hasActiveChangedAtLeastOnce: false,
            contents: [
              {
                active: true,
                index: 0,
                value: 'b',
                isFirst: true,
                isLast: false,
                hasNext: true,
                hasPrevious: false,
                isNext: false,
                isPrevious: false,
                hasBeenActiveBefore: true,
              },
              {
                active: false,
                index: 1,
                value: 'a',
                isFirst: false,
                isLast: false,
                hasNext: true,
                hasPrevious: true,
                isNext: true,
                isPrevious: false,
                hasBeenActiveBefore: false,
              },
              {
                active: false,
                index: 2,
                value: 'c',
                isFirst: false,
                isLast: true,
                hasNext: false,
                hasPrevious: true,
                isNext: false,
                isPrevious: false,
                hasBeenActiveBefore: false,
              },
            ],
          },
          {
            type: 'MOVED',
            value: 'a',
            index: {
              from: 0,
              to: 1,
            },
            time: new Date(),
          }
        );
      });

      describe('mode at', () => {
        describe('moving first item', () => {
          test('move to first should do nothing', () => {
            const { activeContent, subscriber } = setup({ active: 'b' });

            activeContent.moveByIndexByPredicate(
              0,
              ({ value, index }) => value === 'a' && index === 0,
              { mode: 'at' }
            );

            expect(subscriber).toHaveBeenCalledTimes(0);
          });

          test('move to middle', () => {
            const { activeContent, subscriber } = setup({ active: 'b' });

            activeContent.moveByIndexByPredicate(
              0,
              ({ value, index }) => value === 'b' && index === 1,
              { mode: 'at' }
            );

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(
              subscriber,
              {
                active: ['b'],
                activeContents: [activeContent.contents[0]],
                activeIndexes: [0],
                lastActivated: 'b',
                lastActivatedContent: activeContent.contents[0],
                lastActivatedIndex: 0,
                isCircular: false,
                direction: 'right',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: false,
                contents: [
                  {
                    active: true,
                    index: 0,
                    value: 'b',
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: false,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: false,
                    index: 1,
                    value: 'a',
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: true,
                    isPrevious: false,
                    hasBeenActiveBefore: false,
                  },
                  {
                    active: false,
                    index: 2,
                    value: 'c',
                    isFirst: false,
                    isLast: true,
                    hasNext: false,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: false,
                  },
                ],
              },
              {
                type: 'MOVED',
                value: 'a',
                index: {
                  from: 0,
                  to: 1,
                },
                time: new Date(),
              }
            );
          });

          test('move to last', () => {
            const { activeContent, subscriber } = setup({ active: 'b' });

            activeContent.moveByIndexByPredicate(
              0,
              ({ value, index }) => value === 'c' && index === 2,
              { mode: 'at' }
            );

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(
              subscriber,
              {
                active: ['b'],
                activeContents: [activeContent.contents[0]],
                activeIndexes: [0],
                lastActivated: 'b',
                lastActivatedContent: activeContent.contents[0],
                lastActivatedIndex: 0,
                isCircular: false,
                direction: 'right',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: false,
                contents: [
                  {
                    active: true,
                    index: 0,
                    value: 'b',
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: false,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: false,
                    index: 1,
                    value: 'c',
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: true,
                    isPrevious: false,
                    hasBeenActiveBefore: false,
                  },
                  {
                    active: false,
                    index: 2,
                    value: 'a',
                    isFirst: false,
                    isLast: true,
                    hasNext: false,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: false,
                  },
                ],
              },
              {
                type: 'MOVED',
                value: 'a',
                index: {
                  from: 0,
                  to: 2,
                },
                time: new Date(),
              }
            );
          });
        });

        describe('moving middle item', () => {
          test('move to first', () => {
            const { activeContent, subscriber } = setup({ active: 'b' });

            activeContent.moveByIndexByPredicate(
              1,
              ({ value, index }) => value === 'a' && index === 0,
              { mode: 'at' }
            );

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(
              subscriber,
              {
                active: ['b'],
                activeContents: [activeContent.contents[0]],
                activeIndexes: [0],
                lastActivated: 'b',
                lastActivatedContent: activeContent.contents[0],
                lastActivatedIndex: 0,
                isCircular: false,
                direction: 'right',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: false,
                contents: [
                  {
                    active: true,
                    index: 0,
                    value: 'b',
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: false,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: false,
                    index: 1,
                    value: 'a',
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: true,
                    isPrevious: false,
                    hasBeenActiveBefore: false,
                  },
                  {
                    active: false,
                    index: 2,
                    value: 'c',
                    isFirst: false,
                    isLast: true,
                    hasNext: false,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: false,
                  },
                ],
              },
              {
                type: 'MOVED',
                value: 'b',
                index: {
                  from: 1,
                  to: 0,
                },
                time: new Date(),
              }
            );
          });

          test('move to middle, should do nothing', () => {
            const { activeContent, subscriber } = setup({ active: 'b' });

            activeContent.moveByIndexByPredicate(
              1,
              ({ value, index }) => value === 'b' && index === 1,
              { mode: 'at' }
            );

            expect(subscriber).toHaveBeenCalledTimes(0);
          });

          test('move to last', () => {
            const { activeContent, subscriber } = setup({ active: 'b' });

            activeContent.moveByIndexByPredicate(
              1,
              ({ value, index }) => value === 'c' && index === 2,
              { mode: 'at' }
            );

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(
              subscriber,
              {
                active: ['b'],
                activeContents: [activeContent.contents[2]],
                activeIndexes: [2],
                lastActivated: 'b',
                lastActivatedContent: activeContent.contents[2],
                lastActivatedIndex: 2,
                isCircular: false,
                direction: 'right',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: false,
                contents: [
                  {
                    active: false,
                    index: 0,
                    value: 'a',
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: false,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: false,
                  },
                  {
                    active: false,
                    index: 1,
                    value: 'c',
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: true,
                    hasBeenActiveBefore: false,
                  },
                  {
                    active: true,
                    index: 2,
                    value: 'b',
                    isFirst: false,
                    isLast: true,
                    hasNext: false,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                ],
              },
              {
                type: 'MOVED',
                value: 'b',
                index: {
                  from: 1,
                  to: 2,
                },
                time: new Date(),
              }
            );
          });
        });

        describe('moving last item', () => {
          test('move to first', () => {
            const { activeContent, subscriber } = setup({ active: 'b' });

            activeContent.moveByIndexByPredicate(
              2,
              ({ value, index }) => value === 'a' && index === 0,
              { mode: 'at' }
            );

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(
              subscriber,
              {
                active: ['b'],
                activeContents: [activeContent.contents[2]],
                activeIndexes: [2],
                lastActivated: 'b',
                lastActivatedContent: activeContent.contents[2],
                lastActivatedIndex: 2,
                isCircular: false,
                direction: 'right',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: false,
                contents: [
                  {
                    active: false,
                    index: 0,
                    value: 'c',
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: false,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: false,
                  },
                  {
                    active: false,
                    index: 1,
                    value: 'a',
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: true,
                    hasBeenActiveBefore: false,
                  },
                  {
                    active: true,
                    index: 2,
                    value: 'b',
                    isFirst: false,
                    isLast: true,
                    hasNext: false,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                ],
              },
              {
                type: 'MOVED',
                value: 'c',
                index: {
                  from: 2,
                  to: 0,
                },
                time: new Date(),
              }
            );
          });

          test('move to middle', () => {
            const { activeContent, subscriber } = setup({ active: 'b' });

            activeContent.moveByIndexByPredicate(
              2,
              ({ value, index }) => value === 'b' && index === 1,
              { mode: 'at' }
            );

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(
              subscriber,
              {
                active: ['b'],
                activeContents: [activeContent.contents[2]],
                activeIndexes: [2],
                lastActivated: 'b',
                lastActivatedContent: activeContent.contents[2],
                lastActivatedIndex: 2,
                isCircular: false,
                direction: 'right',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: false,
                contents: [
                  {
                    active: false,
                    index: 0,
                    value: 'a',
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: false,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: false,
                  },
                  {
                    active: false,
                    index: 1,
                    value: 'c',
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: true,
                    hasBeenActiveBefore: false,
                  },
                  {
                    active: true,
                    index: 2,
                    value: 'b',
                    isFirst: false,
                    isLast: true,
                    hasNext: false,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                ],
              },
              {
                type: 'MOVED',
                value: 'c',
                index: {
                  from: 2,
                  to: 1,
                },
                time: new Date(),
              }
            );
          });

          test('move to last, should do nothing', () => {
            const { activeContent, subscriber } = setup({ active: 'b' });

            activeContent.moveByIndexByPredicate(
              2,
              ({ value, index }) => value === 'c' && index === 2,
              { mode: 'at' }
            );

            expect(subscriber).toHaveBeenCalledTimes(0);
          });
        });

        test('when no predicate matches do nothing', () => {
          const { activeContent, subscriber } = setup({ active: 'b' });

          activeContent.moveByIndexByPredicate(
            0,
            ({ value }) => value === 'z',
            { mode: 'at' }
          );

          expect(subscriber).toHaveBeenCalledTimes(0);
        });
      });

      describe('mode before', () => {
        describe('moving first item', () => {
          test('move to before first should do nothing', () => {
            const { activeContent, subscriber } = setup({ active: 'b' });

            activeContent.moveByIndexByPredicate(
              0,
              ({ value, index }) => value === 'a' && index === 0,
              { mode: 'before' }
            );

            expect(subscriber).toHaveBeenCalledTimes(0);
          });

          test('move to before middle should do nothing', () => {
            const { activeContent, subscriber } = setup({ active: 'b' });

            activeContent.moveByIndexByPredicate(
              0,
              ({ value, index }) => value === 'b' && index === 1,
              { mode: 'before' }
            );

            expect(subscriber).toHaveBeenCalledTimes(0);
          });

          test('move to before last', () => {
            const { activeContent, subscriber } = setup({ active: 'b' });

            activeContent.moveByIndexByPredicate(
              0,
              ({ value, index }) => value === 'c' && index === 2,
              { mode: 'before' }
            );

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(
              subscriber,
              {
                active: ['b'],
                activeContents: [activeContent.contents[0]],
                activeIndexes: [0],
                lastActivated: 'b',
                lastActivatedContent: activeContent.contents[0],
                lastActivatedIndex: 0,
                isCircular: false,
                direction: 'right',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: false,
                contents: [
                  {
                    active: true,
                    index: 0,
                    value: 'b',
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: false,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: false,
                    index: 1,
                    value: 'a',
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: true,
                    isPrevious: false,
                    hasBeenActiveBefore: false,
                  },
                  {
                    active: false,
                    index: 2,
                    value: 'c',
                    isFirst: false,
                    isLast: true,
                    hasNext: false,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: false,
                  },
                ],
              },
              {
                type: 'MOVED',
                value: 'a',
                index: {
                  from: 0,
                  to: 1,
                },
                time: new Date(),
              }
            );
          });
        });

        describe('moving middle item', () => {
          test('move to before first', () => {
            const { activeContent, subscriber } = setup({ active: 'b' });

            activeContent.moveByIndexByPredicate(
              1,
              ({ value, index }) => value === 'a' && index === 0,
              { mode: 'before' }
            );

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(
              subscriber,
              {
                active: ['b'],
                activeContents: [activeContent.contents[0]],
                activeIndexes: [0],
                lastActivated: 'b',
                lastActivatedContent: activeContent.contents[0],
                lastActivatedIndex: 0,
                isCircular: false,
                direction: 'right',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: false,
                contents: [
                  {
                    active: true,
                    index: 0,
                    value: 'b',
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: false,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: false,
                    index: 1,
                    value: 'a',
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: true,
                    isPrevious: false,
                    hasBeenActiveBefore: false,
                  },
                  {
                    active: false,
                    index: 2,
                    value: 'c',
                    isFirst: false,
                    isLast: true,
                    hasNext: false,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: false,
                  },
                ],
              },
              {
                type: 'MOVED',
                value: 'b',
                index: {
                  from: 1,
                  to: 0,
                },
                time: new Date(),
              }
            );
          });

          test('move to before middle', () => {
            const { activeContent, subscriber } = setup({ active: 'b' });

            activeContent.moveByIndexByPredicate(
              1,
              ({ value, index }) => value === 'b' && index === 1,
              { mode: 'before' }
            );

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(
              subscriber,
              {
                active: ['b'],
                activeContents: [activeContent.contents[0]],
                activeIndexes: [0],
                lastActivated: 'b',
                lastActivatedContent: activeContent.contents[0],
                lastActivatedIndex: 0,
                isCircular: false,
                direction: 'right',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: false,
                contents: [
                  {
                    active: true,
                    index: 0,
                    value: 'b',
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: false,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: false,
                    index: 1,
                    value: 'a',
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: true,
                    isPrevious: false,
                    hasBeenActiveBefore: false,
                  },
                  {
                    active: false,
                    index: 2,
                    value: 'c',
                    isFirst: false,
                    isLast: true,
                    hasNext: false,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: false,
                  },
                ],
              },
              {
                type: 'MOVED',
                value: 'b',
                index: {
                  from: 1,
                  to: 0,
                },
                time: new Date(),
              }
            );
          });

          test('move to before last, should do nothing', () => {
            const { activeContent, subscriber } = setup({ active: 'b' });

            activeContent.moveByIndexByPredicate(
              1,
              ({ value, index }) => value === 'c' && index === 2,
              { mode: 'before' }
            );

            expect(subscriber).toHaveBeenCalledTimes(0);
          });
        });

        describe('moving last item', () => {
          test('move to before first', () => {
            const { activeContent, subscriber } = setup({ active: 'b' });

            activeContent.moveByIndexByPredicate(
              2,
              ({ value, index }) => value === 'a' && index === 0,
              { mode: 'before' }
            );

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(
              subscriber,
              {
                active: ['b'],
                activeContents: [activeContent.contents[2]],
                activeIndexes: [2],
                lastActivated: 'b',
                lastActivatedContent: activeContent.contents[2],
                lastActivatedIndex: 2,
                isCircular: false,
                direction: 'right',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: false,
                contents: [
                  {
                    active: false,
                    index: 0,
                    value: 'c',
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: false,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: false,
                  },
                  {
                    active: false,
                    index: 1,
                    value: 'a',
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: true,
                    hasBeenActiveBefore: false,
                  },
                  {
                    active: true,
                    index: 2,
                    value: 'b',
                    isFirst: false,
                    isLast: true,
                    hasNext: false,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                ],
              },
              {
                type: 'MOVED',
                value: 'c',
                index: {
                  from: 2,
                  to: 0,
                },
                time: new Date(),
              }
            );
          });

          test('move to before middle', () => {
            const { activeContent, subscriber } = setup({ active: 'b' });

            activeContent.moveByIndexByPredicate(
              2,
              ({ value, index }) => value === 'b' && index === 1,
              { mode: 'before' }
            );

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(
              subscriber,
              {
                active: ['b'],
                activeContents: [activeContent.contents[2]],
                activeIndexes: [2],
                lastActivated: 'b',
                lastActivatedContent: activeContent.contents[2],
                lastActivatedIndex: 2,
                isCircular: false,
                direction: 'right',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: false,
                contents: [
                  {
                    active: false,
                    index: 0,
                    value: 'c',
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: false,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: false,
                  },
                  {
                    active: false,
                    index: 1,
                    value: 'a',
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: true,
                    hasBeenActiveBefore: false,
                  },
                  {
                    active: true,
                    index: 2,
                    value: 'b',
                    isFirst: false,
                    isLast: true,
                    hasNext: false,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                ],
              },
              {
                type: 'MOVED',
                value: 'c',
                index: {
                  from: 2,
                  to: 0,
                },
                time: new Date(),
              }
            );
          });

          test('move to before last', () => {
            const { activeContent, subscriber } = setup({ active: 'b' });

            activeContent.moveByIndexByPredicate(
              2,
              ({ value, index }) => value === 'c' && index === 2,
              { mode: 'before' }
            );

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(
              subscriber,
              {
                active: ['b'],
                activeContents: [activeContent.contents[2]],
                activeIndexes: [2],
                lastActivated: 'b',
                lastActivatedContent: activeContent.contents[2],
                lastActivatedIndex: 2,
                isCircular: false,
                direction: 'right',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: false,
                contents: [
                  {
                    active: false,
                    index: 0,
                    value: 'a',
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: false,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: false,
                  },
                  {
                    active: false,
                    index: 1,
                    value: 'c',
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: true,
                    hasBeenActiveBefore: false,
                  },
                  {
                    active: true,
                    index: 2,
                    value: 'b',
                    isFirst: false,
                    isLast: true,
                    hasNext: false,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                ],
              },
              {
                type: 'MOVED',
                value: 'c',
                index: {
                  from: 2,
                  to: 1,
                },
                time: new Date(),
              }
            );
          });
        });

        test('when no predicate matches do nothing', () => {
          const { activeContent, subscriber } = setup({ active: 'b' });

          activeContent.moveByIndexByPredicate(
            0,
            ({ value }) => value === 'z',
            { mode: 'before' }
          );

          expect(subscriber).toHaveBeenCalledTimes(0);
        });
      });

      describe('mode after', () => {
        describe('moving first item', () => {
          test('move to after first', () => {
            const { activeContent, subscriber } = setup({ active: 'b' });

            activeContent.moveByIndexByPredicate(
              0,
              ({ value, index }) => value === 'a' && index === 0,
              { mode: 'after' }
            );

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(
              subscriber,
              {
                active: ['b'],
                activeContents: [activeContent.contents[0]],
                activeIndexes: [0],
                lastActivated: 'b',
                lastActivatedContent: activeContent.contents[0],
                lastActivatedIndex: 0,
                isCircular: false,
                direction: 'right',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: false,
                contents: [
                  {
                    active: true,
                    index: 0,
                    value: 'b',
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: false,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: false,
                    index: 1,
                    value: 'a',
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: true,
                    isPrevious: false,
                    hasBeenActiveBefore: false,
                  },
                  {
                    active: false,
                    index: 2,
                    value: 'c',
                    isFirst: false,
                    isLast: true,
                    hasNext: false,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: false,
                  },
                ],
              },
              {
                type: 'MOVED',
                value: 'a',
                index: {
                  from: 0,
                  to: 1,
                },
                time: new Date(),
              }
            );
          });

          test('move to after middle', () => {
            const { activeContent, subscriber } = setup({ active: 'b' });

            activeContent.moveByIndexByPredicate(
              0,
              ({ value, index }) => value === 'b' && index === 1,
              { mode: 'after' }
            );

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(
              subscriber,
              {
                active: ['b'],
                activeContents: [activeContent.contents[0]],
                activeIndexes: [0],
                lastActivated: 'b',
                lastActivatedContent: activeContent.contents[0],
                lastActivatedIndex: 0,
                isCircular: false,
                direction: 'right',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: false,
                contents: [
                  {
                    active: true,
                    index: 0,
                    value: 'b',
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: false,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: false,
                    index: 1,
                    value: 'c',
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: true,
                    isPrevious: false,
                    hasBeenActiveBefore: false,
                  },
                  {
                    active: false,
                    index: 2,
                    value: 'a',
                    isFirst: false,
                    isLast: true,
                    hasNext: false,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: false,
                  },
                ],
              },
              {
                type: 'MOVED',
                value: 'a',
                index: {
                  from: 0,
                  to: 2,
                },
                time: new Date(),
              }
            );
          });

          test('move to after last', () => {
            const { activeContent, subscriber } = setup({ active: 'b' });

            activeContent.moveByIndexByPredicate(
              0,
              ({ value, index }) => value === 'c' && index === 2,
              { mode: 'after' }
            );

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(
              subscriber,
              {
                active: ['b'],
                activeContents: [activeContent.contents[0]],
                activeIndexes: [0],
                lastActivated: 'b',
                lastActivatedContent: activeContent.contents[0],
                lastActivatedIndex: 0,
                isCircular: false,
                direction: 'right',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: false,
                contents: [
                  {
                    active: true,
                    index: 0,
                    value: 'b',
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: false,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                  {
                    active: false,
                    index: 1,
                    value: 'c',
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: true,
                    isPrevious: false,
                    hasBeenActiveBefore: false,
                  },
                  {
                    active: false,
                    index: 2,
                    value: 'a',
                    isFirst: false,
                    isLast: true,
                    hasNext: false,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: false,
                  },
                ],
              },
              {
                type: 'MOVED',
                value: 'a',
                index: {
                  from: 0,
                  to: 2,
                },
                time: new Date(),
              }
            );
          });
        });

        describe('moving middle item', () => {
          test('move to after first should do nothing', () => {
            const { activeContent, subscriber } = setup({ active: 'b' });

            activeContent.moveByIndexByPredicate(
              1,
              ({ value, index }) => value === 'a' && index === 0,
              { mode: 'after' }
            );

            expect(subscriber).toHaveBeenCalledTimes(0);
          });

          test('move to after middle', () => {
            const { activeContent, subscriber } = setup({ active: 'b' });

            activeContent.moveByIndexByPredicate(
              1,
              ({ value, index }) => value === 'b' && index === 1,
              { mode: 'after' }
            );

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(
              subscriber,
              {
                active: ['b'],
                activeContents: [activeContent.contents[2]],
                activeIndexes: [2],
                lastActivated: 'b',
                lastActivatedContent: activeContent.contents[2],
                lastActivatedIndex: 2,
                isCircular: false,
                direction: 'right',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: false,
                contents: [
                  {
                    active: false,
                    index: 0,
                    value: 'a',
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: false,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: false,
                  },
                  {
                    active: false,
                    index: 1,
                    value: 'c',
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: true,
                    hasBeenActiveBefore: false,
                  },
                  {
                    active: true,
                    index: 2,
                    value: 'b',
                    isFirst: false,
                    isLast: true,
                    hasNext: false,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                ],
              },
              {
                type: 'MOVED',
                value: 'b',
                index: {
                  from: 1,
                  to: 2,
                },
                time: new Date(),
              }
            );
          });

          test('move to after last', () => {
            const { activeContent, subscriber } = setup({ active: 'b' });

            activeContent.moveByIndexByPredicate(
              1,
              ({ value, index }) => value === 'c' && index === 2,
              { mode: 'after' }
            );

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(
              subscriber,
              {
                active: ['b'],
                activeContents: [activeContent.contents[2]],
                activeIndexes: [2],
                lastActivated: 'b',
                lastActivatedContent: activeContent.contents[2],
                lastActivatedIndex: 2,
                isCircular: false,
                direction: 'right',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: false,
                contents: [
                  {
                    active: false,
                    index: 0,
                    value: 'a',
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: false,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: false,
                  },
                  {
                    active: false,
                    index: 1,
                    value: 'c',
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: true,
                    hasBeenActiveBefore: false,
                  },
                  {
                    active: true,
                    index: 2,
                    value: 'b',
                    isFirst: false,
                    isLast: true,
                    hasNext: false,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                ],
              },
              {
                type: 'MOVED',
                value: 'b',
                index: {
                  from: 1,
                  to: 2,
                },
                time: new Date(),
              }
            );
          });
        });

        describe('moving last item', () => {
          test('move to after first', () => {
            const { activeContent, subscriber } = setup({ active: 'b' });

            activeContent.moveByIndexByPredicate(
              2,
              ({ value, index }) => value === 'a' && index === 0,
              { mode: 'after' }
            );

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(
              subscriber,
              {
                active: ['b'],
                activeContents: [activeContent.contents[2]],
                activeIndexes: [2],
                lastActivated: 'b',
                lastActivatedContent: activeContent.contents[2],
                lastActivatedIndex: 2,
                isCircular: false,
                direction: 'right',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: false,
                contents: [
                  {
                    active: false,
                    index: 0,
                    value: 'a',
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: false,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: false,
                  },
                  {
                    active: false,
                    index: 1,
                    value: 'c',
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: true,
                    hasBeenActiveBefore: false,
                  },
                  {
                    active: true,
                    index: 2,
                    value: 'b',
                    isFirst: false,
                    isLast: true,
                    hasNext: false,
                    hasPrevious: true,
                    isNext: false,
                    isPrevious: false,
                    hasBeenActiveBefore: true,
                  },
                ],
              },
              {
                type: 'MOVED',
                value: 'c',
                index: {
                  from: 2,
                  to: 1,
                },
                time: new Date(),
              }
            );
          });

          test('move to after middle should do nothing', () => {
            const { activeContent, subscriber } = setup({ active: 'b' });

            activeContent.moveByIndexByPredicate(
              2,
              ({ value, index }) => value === 'b' && index === 1,
              { mode: 'after' }
            );

            expect(subscriber).toHaveBeenCalledTimes(0);
          });

          test('move to after last should do nothing', () => {
            const { activeContent, subscriber } = setup({ active: 'b' });

            activeContent.moveByIndexByPredicate(
              2,
              ({ value, index }) => value === 'c' && index === 2,
              { mode: 'after' }
            );

            expect(subscriber).toHaveBeenCalledTimes(0);
          });
        });

        test('when no predicate matches do nothing', () => {
          const { activeContent, subscriber } = setup({ active: 'b' });

          activeContent.moveByIndexByPredicate(
            0,
            ({ value }) => value === 'z',
            { mode: 'after' }
          );

          expect(subscriber).toHaveBeenCalledTimes(0);
        });
      });
    });

    describe('moveByPredicate', () => {
      test('when no mode is provided assume at', () => {
        const { activeContent, subscriber } = setup({ active: 'b' });

        activeContent.moveByPredicate(
          'a',
          ({ value, index }) => value === 'b' && index === 1
        );

        expect(subscriber).toHaveBeenCalledTimes(1);

        assertLastSubscriber(
          subscriber,
          {
            active: ['b'],
            activeContents: [activeContent.contents[0]],
            activeIndexes: [0],
            lastActivated: 'b',
            lastActivatedContent: activeContent.contents[0],
            lastActivatedIndex: 0,
            isCircular: false,
            direction: 'right',
            maxActivationLimit: 1,
            maxActivationLimitBehavior: 'circular',
            history: [],
            hasActiveChangedAtLeastOnce: false,
            contents: [
              {
                active: true,
                index: 0,
                value: 'b',
                isFirst: true,
                isLast: false,
                hasNext: true,
                hasPrevious: false,
                isNext: false,
                isPrevious: false,
                hasBeenActiveBefore: true,
              },
              {
                active: false,
                index: 1,
                value: 'a',
                isFirst: false,
                isLast: false,
                hasNext: true,
                hasPrevious: true,
                isNext: true,
                isPrevious: false,
                hasBeenActiveBefore: false,
              },
              {
                active: false,
                index: 2,
                value: 'c',
                isFirst: false,
                isLast: true,
                hasNext: false,
                hasPrevious: true,
                isNext: false,
                isPrevious: false,
                hasBeenActiveBefore: false,
              },
            ],
          },
          {
            type: 'MOVED',
            value: 'a',
            index: {
              from: 0,
              to: 1,
            },
            time: new Date(),
          }
        );
      });

      describe('mode at', () => {
        test('when predicate matches perform move', () => {
          const { activeContent, subscriber } = setup({ active: 'b' });

          activeContent.moveByPredicate(
            'a',
            ({ value, index }) => value === 'b' && index === 1,
            { mode: 'at' }
          );

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['b'],
              activeContents: [activeContent.contents[0]],
              activeIndexes: [0],
              lastActivated: 'b',
              lastActivatedContent: activeContent.contents[0],
              lastActivatedIndex: 0,
              isCircular: false,
              direction: 'right',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              contents: [
                {
                  active: true,
                  index: 0,
                  value: 'b',
                  isFirst: true,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: false,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: false,
                  index: 1,
                  value: 'a',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: true,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 2,
                  value: 'c',
                  isFirst: false,
                  isLast: true,
                  hasNext: false,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
              ],
            },
            {
              type: 'MOVED',
              value: 'a',
              index: {
                from: 0,
                to: 1,
              },
              time: new Date(),
            }
          );
        });

        test('when no predicate matches do nothing', () => {
          const { activeContent, subscriber } = setup({ active: 'b' });

          activeContent.moveByPredicate('a', ({ value }) => value === 'z', {
            mode: 'at',
          });

          expect(subscriber).toHaveBeenCalledTimes(0);
        });

        test('when item is not found throw error', () => {
          const { activeContent } = setup({ active: 'b' });

          expect(() =>
            activeContent.moveByPredicate('y', ({ value }) => value === 'z', {
              mode: 'at',
            })
          ).toThrowError(
            'uiloos > ActiveList > getIndex > index cannot be found, item is not in contents array'
          );

          expect(() => {
            activeContent.moveByPredicate('y', ({ value }) => value === 'z', {
              mode: 'at',
            })
          }).toThrowError(
            ActiveListItemNotFoundError
          );

        });
      });

      describe('mode before', () => {
        test('when predicate matches perform move', () => {
          const { activeContent, subscriber } = setup({ active: 'b' });

          activeContent.moveByPredicate(
            'a',
            ({ value, index }) => value === 'c' && index === 2,
            { mode: 'before' }
          );

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['b'],
              activeContents: [activeContent.contents[0]],
              activeIndexes: [0],
              lastActivated: 'b',
              lastActivatedContent: activeContent.contents[0],
              lastActivatedIndex: 0,
              isCircular: false,
              direction: 'right',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              contents: [
                {
                  active: true,
                  index: 0,
                  value: 'b',
                  isFirst: true,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: false,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: false,
                  index: 1,
                  value: 'a',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: true,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 2,
                  value: 'c',
                  isFirst: false,
                  isLast: true,
                  hasNext: false,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
              ],
            },
            {
              type: 'MOVED',
              value: 'a',
              index: {
                from: 0,
                to: 1,
              },
              time: new Date(),
            }
          );
        });

        test('when no predicate matches do nothing', () => {
          const { activeContent, subscriber } = setup({ active: 'b' });

          activeContent.moveByPredicate('a', ({ value }) => value === 'z', {
            mode: 'before',
          });

          expect(subscriber).toHaveBeenCalledTimes(0);
        });

        test('when item is not found throw error', () => {
          const { activeContent } = setup({ active: 'b' });

          expect(() =>
            activeContent.moveByPredicate('y', ({ value }) => value === 'z', {
              mode: 'before',
            })
          ).toThrowError(
            'uiloos > ActiveList > getIndex > index cannot be found, item is not in contents array'
          );

          expect(() => {
            activeContent.moveByPredicate('y', ({ value }) => value === 'z', {
              mode: 'before',
            })
          }).toThrowError(
            ActiveListItemNotFoundError
          );
        });
      });

      describe('mode after', () => {
        test('when predicate matches perform move', () => {
          const { activeContent, subscriber } = setup({ active: 'b' });

          activeContent.moveByPredicate(
            'a',
            ({ value, index }) => value === 'a' && index === 0,
            { mode: 'after' }
          );

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['b'],
              activeContents: [activeContent.contents[0]],
              activeIndexes: [0],
              lastActivated: 'b',
              lastActivatedContent: activeContent.contents[0],
              lastActivatedIndex: 0,
              isCircular: false,
              direction: 'right',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              contents: [
                {
                  active: true,
                  index: 0,
                  value: 'b',
                  isFirst: true,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: false,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: false,
                  index: 1,
                  value: 'a',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: true,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 2,
                  value: 'c',
                  isFirst: false,
                  isLast: true,
                  hasNext: false,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
              ],
            },
            {
              type: 'MOVED',
              value: 'a',
              index: {
                from: 0,
                to: 1,
              },
              time: new Date(),
            }
          );
        });

        test('when no predicate matches do nothing', () => {
          const { activeContent, subscriber } = setup({ active: 'b' });

          activeContent.moveByPredicate('a', ({ value }) => value === 'z', {
            mode: 'after',
          });

          expect(subscriber).toHaveBeenCalledTimes(0);
        });

        test('when item is not found throw error', () => {
          const { activeContent } = setup({ active: 'b' });

          expect(() =>
            activeContent.moveByPredicate('y', ({ value }) => value === 'z', {
              mode: 'after',
            })
          ).toThrowError(
            'uiloos > ActiveList > getIndex > index cannot be found, item is not in contents array'
          );

          expect(() => {
            activeContent.moveByPredicate('y', ({ value }) => value === 'z', {
              mode: 'after',
            })
          }).toThrowError(
            ActiveListItemNotFoundError
          );
        });
      });
    });

    describe('ActiveListContent methods', () => {
      test('moveToIndex', () => {
        const { activeContent, subscriber } = setup({ active: 'a' });

        // Move a beyond c
        activeContent.contents[0].moveToIndex(2);

        expect(subscriber).toHaveBeenCalledTimes(1);

        assertLastSubscriber(
          subscriber,
          {
            active: ['a'],
            activeContents: [activeContent.contents[2]],
            activeIndexes: [2],
            lastActivated: 'a',
            lastActivatedContent: activeContent.contents[2],
            lastActivatedIndex: 2,
            isCircular: false,
            direction: 'right',
            maxActivationLimit: 1,
            maxActivationLimitBehavior: 'circular',
            history: [],
            hasActiveChangedAtLeastOnce: false,
            contents: [
              {
                active: false,
                index: 0,
                value: 'b',
                isFirst: true,
                isLast: false,
                hasNext: true,
                hasPrevious: false,
                isNext: false,
                isPrevious: false,
                hasBeenActiveBefore: false,
              },
              {
                active: false,
                index: 1,
                value: 'c',
                isFirst: false,
                isLast: false,
                hasNext: true,
                hasPrevious: true,
                isNext: false,
                isPrevious: true,
                hasBeenActiveBefore: false,
              },
              {
                active: true,
                index: 2,
                value: 'a',
                isFirst: false,
                isLast: true,
                hasNext: false,
                hasPrevious: true,
                isNext: false,
                isPrevious: false,
                hasBeenActiveBefore: true,
              },
            ],
          },
          {
            type: 'MOVED',
            value: 'a',
            index: {
              from: 0,
              to: 2,
            },
            time: new Date(),
          }
        );
      });

      describe('moveToPredicate', () => {
        test('when no mode is given assume at', () => {
          const { activeContent, subscriber } = setup({ active: 'b' });

          activeContent.contents[0].moveToPredicate(
            ({ value, index }) => value === 'b' && index === 1
          );

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['b'],
              activeContents: [activeContent.contents[0]],
              activeIndexes: [0],
              lastActivated: 'b',
              lastActivatedContent: activeContent.contents[0],
              lastActivatedIndex: 0,
              isCircular: false,
              direction: 'right',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              contents: [
                {
                  active: true,
                  index: 0,
                  value: 'b',
                  isFirst: true,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: false,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: false,
                  index: 1,
                  value: 'a',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: true,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 2,
                  value: 'c',
                  isFirst: false,
                  isLast: true,
                  hasNext: false,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
              ],
            },
            {
              type: 'MOVED',
              value: 'a',
              index: {
                from: 0,
                to: 1,
              },
              time: new Date(),
            }
          );
        });

        test('mode at', () => {
          const { activeContent, subscriber } = setup({ active: 'b' });

          activeContent.contents[0].moveToPredicate(
            ({ value, index }) => value === 'b' && index === 1,
            { mode: 'at' }
          );

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['b'],
              activeContents: [activeContent.contents[0]],
              activeIndexes: [0],
              lastActivated: 'b',
              lastActivatedContent: activeContent.contents[0],
              lastActivatedIndex: 0,
              isCircular: false,
              direction: 'right',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              contents: [
                {
                  active: true,
                  index: 0,
                  value: 'b',
                  isFirst: true,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: false,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: false,
                  index: 1,
                  value: 'a',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: true,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 2,
                  value: 'c',
                  isFirst: false,
                  isLast: true,
                  hasNext: false,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
              ],
            },
            {
              type: 'MOVED',
              value: 'a',
              index: {
                from: 0,
                to: 1,
              },
              time: new Date(),
            }
          );
        });

        test('mode before', () => {
          const { activeContent, subscriber } = setup({ active: 'b' });

          activeContent.contents[0].moveToPredicate(
            ({ value, index }) => value === 'c' && index === 2,
            { mode: 'before' }
          );

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['b'],
              activeContents: [activeContent.contents[0]],
              activeIndexes: [0],
              lastActivated: 'b',
              lastActivatedContent: activeContent.contents[0],
              lastActivatedIndex: 0,
              isCircular: false,
              direction: 'right',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              contents: [
                {
                  active: true,
                  index: 0,
                  value: 'b',
                  isFirst: true,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: false,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: false,
                  index: 1,
                  value: 'a',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: true,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 2,
                  value: 'c',
                  isFirst: false,
                  isLast: true,
                  hasNext: false,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
              ],
            },
            {
              type: 'MOVED',
              value: 'a',
              index: {
                from: 0,
                to: 1,
              },
              time: new Date(),
            }
          );
        });

        test('mode after', () => {
          const { activeContent, subscriber } = setup({ active: 'a' });

          // Move a beyond c
          activeContent.contents[0].moveToPredicate(
            ({ value, index }) => value === 'c' && index === 2,
            { mode: 'after' }
          );

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['a'],
              activeContents: [activeContent.contents[2]],
              activeIndexes: [2],
              lastActivated: 'a',
              lastActivatedContent: activeContent.contents[2],
              lastActivatedIndex: 2,
              isCircular: false,
              direction: 'right',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              contents: [
                {
                  active: false,
                  index: 0,
                  value: 'b',
                  isFirst: true,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: false,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 1,
                  value: 'c',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: true,
                  hasBeenActiveBefore: false,
                },
                {
                  active: true,
                  index: 2,
                  value: 'a',
                  isFirst: false,
                  isLast: true,
                  hasNext: false,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
              ],
            },
            {
              type: 'MOVED',
              value: 'a',
              index: {
                from: 0,
                to: 2,
              },
              time: new Date(),
            }
          );
        });
      });

      describe('moveToFirst', () => {
        test('moving from the active index should not affect it', () => {
          const { activeContent, subscriber } = setup({ active: 'a' });

          // Move c before a
          activeContent.contents[2].moveToFirst();

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['a'],
              activeContents: [activeContent.contents[1]],
              activeIndexes: [1],
              lastActivated: 'a',
              lastActivatedContent: activeContent.contents[1],
              lastActivatedIndex: 1,
              isCircular: false,
              direction: 'right',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              contents: [
                {
                  active: false,
                  index: 0,
                  value: 'c',
                  isFirst: true,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: false,
                  isNext: false,
                  isPrevious: true,
                  hasBeenActiveBefore: false,
                },
                {
                  active: true,
                  index: 1,
                  value: 'a',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: false,
                  index: 2,
                  value: 'b',
                  isFirst: false,
                  isLast: true,
                  hasNext: false,
                  hasPrevious: true,
                  isNext: true,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
              ],
            },
            {
              type: 'MOVED',
              value: 'c',
              index: {
                from: 2,
                to: 0,
              },
              time: new Date(),
            }
          );
        });

        test('moving to the active index should not affect it', () => {
          const { activeContent, subscriber } = setup({ active: 'b' });

          // Move b before a
          activeContent.contents[1].moveToFirst();

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['b'],
              activeContents: [activeContent.contents[0]],
              activeIndexes: [0],
              lastActivated: 'b',
              lastActivatedContent: activeContent.contents[0],
              lastActivatedIndex: 0,
              isCircular: false,
              direction: 'right',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              contents: [
                {
                  active: true,
                  index: 0,
                  value: 'b',
                  isFirst: true,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: false,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
                {
                  active: false,
                  index: 1,
                  value: 'a',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: true,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 2,
                  value: 'c',
                  isFirst: false,
                  isLast: true,
                  hasNext: false,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
              ],
            },
            {
              type: 'MOVED',
              value: 'b',
              index: {
                from: 1,
                to: 0,
              },
              time: new Date(),
            }
          );
        });
      });

      describe('moveToLast', () => {
        test('moving from the active index should not affect it', () => {
          const { activeContent, subscriber } = setup({ active: 'a' });

          // Move a beyond c
          activeContent.contents[0].moveToLast();

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['a'],
              activeContents: [activeContent.contents[2]],
              activeIndexes: [2],
              lastActivated: 'a',
              lastActivatedContent: activeContent.contents[2],
              lastActivatedIndex: 2,
              isCircular: false,
              direction: 'right',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              contents: [
                {
                  active: false,
                  index: 0,
                  value: 'b',
                  isFirst: true,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: false,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 1,
                  value: 'c',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: true,
                  hasBeenActiveBefore: false,
                },
                {
                  active: true,
                  index: 2,
                  value: 'a',
                  isFirst: false,
                  isLast: true,
                  hasNext: false,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
              ],
            },
            {
              type: 'MOVED',
              value: 'a',
              index: {
                from: 0,
                to: 2,
              },
              time: new Date(),
            }
          );
        });

        test('moving to the active index should not affect it', () => {
          const { activeContent, subscriber } = setup({ active: 'b' });

          // Move b beyond c
          activeContent.contents[1].moveToLast();

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['b'],
              activeContents: [activeContent.contents[2]],
              activeIndexes: [2],
              lastActivated: 'b',
              lastActivatedContent: activeContent.contents[2],
              lastActivatedIndex: 2,
              isCircular: false,
              direction: 'right',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              contents: [
                {
                  active: false,
                  index: 0,
                  value: 'a',
                  isFirst: true,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: false,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: false,
                },
                {
                  active: false,
                  index: 1,
                  value: 'c',
                  isFirst: false,
                  isLast: false,
                  hasNext: true,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: true,
                  hasBeenActiveBefore: false,
                },
                {
                  active: true,
                  index: 2,
                  value: 'b',
                  isFirst: false,
                  isLast: true,
                  hasNext: false,
                  hasPrevious: true,
                  isNext: false,
                  isPrevious: false,
                  hasBeenActiveBefore: true,
                },
              ],
            },
            {
              type: 'MOVED',
              value: 'b',
              index: {
                from: 1,
                to: 2,
              },
              time: new Date(),
            }
          );
        });
      });
    });
  });

  describe('autoplay', () => {
    describe('duration errors', () => {
      test('cannot be less than zero', () => {
        expect(() => {
          setup({ autoplay: { duration: -1 }, activeIndexes: 0 });
        }).toThrowError(
          'uiloos > ActiveList > autoplay > duration cannot be negative or zero'
        );

        expect(() => {
          setup({ autoplay: { duration: -1 }, activeIndexes: 0 });
        }).toThrowError(
          ActiveListAutoplayDurationError
        );
      });

      test('cannot be zero', () => {
        expect(() => {
          setup({ autoplay: { duration: 0 }, activeIndexes: 0 });
        }).toThrowError(
          'uiloos > ActiveList > autoplay > duration cannot be negative or zero'
        );

        expect(() => {
          setup({ autoplay: { duration: 0 }, activeIndexes: 0 });
        }).toThrowError(
          ActiveListAutoplayDurationError
        );
      });
    });

    test('that autoplay does not start when there is no active content', () => {
      jest.useFakeTimers();

      const { activeContent } = setup({
        active: [],
        maxActivationLimit: 1,
        autoplay: { duration: 200 },
        isCircular: false,
      });

      jest.advanceTimersByTime(200);
      expect(activeContent.active).toEqual([]);

      jest.advanceTimersByTime(200);
      expect(activeContent.active).toEqual([]);

      jest.advanceTimersByTime(200);
      expect(activeContent.active).toEqual([]);

      // Even calling play should have no effect
      activeContent.play();

      jest.advanceTimersByTime(200);
      expect(activeContent.active).toEqual([]);

      jest.advanceTimersByTime(200);
      expect(activeContent.active).toEqual([]);

      jest.advanceTimersByTime(200);
      expect(activeContent.active).toEqual([]);
    });

    test('that autoplay stops when there is no more active content', () => {
      jest.useFakeTimers();

      const { activeContent } = setup({
        active: ['a'],
        maxActivationLimit: 1,
        autoplay: { duration: 200 },
        isCircular: false,
      });

      expect(activeContent.active).toEqual(['a']);

      jest.advanceTimersByTime(200);
      expect(activeContent.active).toEqual(['b']);

      // Now deactivate all content
      activeContent.deactivateByIndex(1);

      // Nothing should become active no matter what
      jest.advanceTimersByTime(200);
      expect(activeContent.active).toEqual([]);

      jest.advanceTimersByTime(200);
      expect(activeContent.active).toEqual([]);

      jest.advanceTimersByTime(200);
      expect(activeContent.active).toEqual([]);
    });

    describe('effect of maxActivationLimit', () => {
      test('when maxActivationLimit is 1', () => {
        jest.useFakeTimers();

        const { activeContent } = setup({
          maxActivationLimit: 1,
          active: ['a'],
          autoplay: { duration: 200 },
          isCircular: false,
        });

        expect(activeContent.active).toEqual(['a']);

        jest.advanceTimersByTime(200);
        expect(activeContent.active).toEqual(['b']);

        jest.advanceTimersByTime(200);
        expect(activeContent.active).toEqual(['c']);
      });

      test('when maxActivationLimit is N', () => {
        jest.useFakeTimers();

        const { activeContent } = setup({
          maxActivationLimit: 2,
          active: ['a'],
          autoplay: { duration: 200 },
          isCircular: false,
        });

        expect(activeContent.active).toEqual(['a']);

        jest.advanceTimersByTime(200);
        expect(activeContent.active).toEqual(['a', 'b']);

        jest.advanceTimersByTime(200);
        expect(activeContent.active).toEqual(['b', 'c']);
      });

      test('when maxActivationLimit is false', () => {
        jest.useFakeTimers();

        const { activeContent } = setup({
          maxActivationLimit: false,
          active: ['a'],
          autoplay: { duration: 200 },
          isCircular: false,
        });

        expect(activeContent.active).toEqual(['a']);

        jest.advanceTimersByTime(200);
        expect(activeContent.active).toEqual(['a', 'b']);

        jest.advanceTimersByTime(200);
        expect(activeContent.active).toEqual(['a', 'b', 'c']);
      });
    });

    describe('end of content behavior', () => {
      test('goes to the next item after duration and wraps around correctly when circular', () => {
        jest.useFakeTimers();

        const { activeContent } = setup({
          autoplay: { duration: 200 },
          isCircular: true,
          activeIndexes: 0,
        });

        expect(activeContent.active).toEqual(['a']);

        jest.advanceTimersByTime(200);
        expect(activeContent.active).toEqual(['b']);

        jest.advanceTimersByTime(200);
        expect(activeContent.active).toEqual(['c']);

        jest.advanceTimersByTime(200);
        expect(activeContent.active).toEqual(['a']);
      });

      test('stops the autoplay at the last item when not circular', () => {
        jest.useFakeTimers();

        const { activeContent } = setup({
          autoplay: { duration: 200 },
          isCircular: false,
          activeIndexes: 0,
        });

        expect(activeContent.active).toEqual(['a']);

        jest.advanceTimersByTime(200);
        expect(activeContent.active).toEqual(['b']);

        jest.advanceTimersByTime(200);
        expect(activeContent.active).toEqual(['c']);

        jest.advanceTimersByTime(200);
        expect(activeContent.active).toEqual(['c']);
      });
    });

    describe('user calling configureAutoplay', () => {
      test('that autoplay can be activated after the component has started', () => {
        jest.useFakeTimers();

        const { activeContent } = setup({
          autoplay: undefined,
          isCircular: false,
          activeIndexes: 0,
        });

        jest.advanceTimersByTime(200);

        expect(activeContent.active).toEqual(['a']);

        activeContent.configureAutoplay({ duration: 200 });

        jest.advanceTimersByTime(200);

        expect(activeContent.active).toEqual(['b']);
      });

      test('that autoplay can be deactivated by the user', () => {
        jest.useFakeTimers();

        const { activeContent } = setup({
          autoplay: { duration: 200 },
          isCircular: true,
          activeIndexes: 0,
        });

        expect(activeContent.active).toEqual(['a']);

        jest.advanceTimersByTime(200);
        expect(activeContent.active).toEqual(['b']);

        // Stop the autoplay
        activeContent.configureAutoplay(null);

        // Should stay on 'b'
        jest.advanceTimersByTime(200);
        expect(activeContent.active).toEqual(['b']);
      });
    });

    test('user interaction should stop the autoplay when stopsOnUserInteraction is true on activation', () => {
      jest.useFakeTimers();

      const { activeContent } = setup({
        autoplay: { duration: 200, stopsOnUserInteraction: true },
        isCircular: true,
        activeIndexes: 0,
      });

      expect(activeContent.active).toEqual(['a']);

      jest.advanceTimersByTime(200);
      expect(activeContent.active).toEqual(['b']);

      activeContent.activateNext({ isUserInteraction: true });
      expect(activeContent.active).toEqual(['c']);

      jest.advanceTimersByTime(200);
      expect(activeContent.active).toEqual(['c']);
    });

    test('user interaction should stop the autoplay when stopsOnUserInteraction is true on deactivation', () => {
      jest.useFakeTimers();

      const { activeContent } = setup({
        autoplay: { duration: 200, stopsOnUserInteraction: true },
        isCircular: true,
        activeIndexes: 0,
      });

      expect(activeContent.active).toEqual(['a']);

      jest.advanceTimersByTime(200);
      expect(activeContent.active).toEqual(['b']);

      activeContent.deactivateByIndex(1, { isUserInteraction: true });
      expect(activeContent.active).toEqual([]);

      jest.advanceTimersByTime(200);
      expect(activeContent.active).toEqual([]);
    });

    test('when user interacts it should debounce when stopsOnUserInteraction is false', () => {
      jest.useFakeTimers();

      const { activeContent } = setup({
        autoplay: { duration: 200 },
        isCircular: true,
        activeIndexes: 0,
      });

      // The active content should be 'a' at the start
      expect(activeContent.active).toEqual(['a']);

      // After 200 milliseconds it should become 'b'
      jest.advanceTimersByTime(200);
      expect(activeContent.active).toEqual(['b']);

      // We move the timer to just before it skips and trigger
      // a user action, it should move to 'c' but debounce the autoplay
      jest.advanceTimersByTime(199);
      activeContent.activateNext({ isUserInteraction: true });
      expect(activeContent.active).toEqual(['c']);

      // The autoplay should now not trigger because it has been debounced
      jest.advanceTimersByTime(1);
      expect(activeContent.active).toEqual(['c']);

      // The autoplay should still not have been triggered
      jest.advanceTimersByTime(198);
      expect(activeContent.active).toEqual(['c']);

      // The autoplay now be triggered
      jest.advanceTimersByTime(1);
      expect(activeContent.active).toEqual(['a']);

      // A double debounce should work as well
      jest.advanceTimersByTime(199);
      activeContent.activateNext({ isUserInteraction: true });
      expect(activeContent.active).toEqual(['b']);

      // Trigger double debounce
      jest.advanceTimersByTime(199);
      activeContent.activateNext({ isUserInteraction: true });
      expect(activeContent.active).toEqual(['c']);
    });

    test('that the duration can be a function instead of just a number', () => {
      jest.useFakeTimers();

      const { activeContent } = setup({
        autoplay: {
          duration: (data) => {
            expect(data.index).toBeDefined();
            expect(data.value).toBeDefined();
            
            expect(data.content).toBeDefined();
            expect(data.content).toBeInstanceOf(ActiveListContent);
            
            expect(data.activeList).toBeDefined();


            expect(data.activeList).toBeInstanceOf(ActiveList);
            return (data.index + 1) * 100;
          },
          stopsOnUserInteraction: false,
        },
        isCircular: true,
        activeIndexes: 0,
      });

      expect(activeContent.active).toEqual(['a']);

      jest.advanceTimersByTime(100);
      expect(activeContent.active).toEqual(['b']);

      jest.advanceTimersByTime(200);
      expect(activeContent.active).toEqual(['c']);

      jest.advanceTimersByTime(300);
      expect(activeContent.active).toEqual(['a']);
    });

    test('that autoplay stops when the contents are cleared', () => {
      jest.useFakeTimers();

      const { activeContent } = setup({
        autoplay: {
          duration: ({ index }) => (index + 1) * 100,
          stopsOnUserInteraction: false,
        },
        isCircular: true,
        activeIndexes: 0,
      });

      expect(activeContent.active).toEqual(['a']);

      jest.advanceTimersByTime(100);
      expect(activeContent.active).toEqual(['b']);

      // Now remove all content in between an duration's
      activeContent.remove('a');
      activeContent.remove('b');
      activeContent.remove('c');

      // Now check if after the duration the state.active has
      // been set to [].
      jest.advanceTimersByTime(200);
      expect(activeContent.active).toEqual([]);
    });

    test('that the autoplay can be paused and continued', () => {
      jest.useFakeTimers();

      const { activeContent } = setup({
        autoplay: { duration: 200 },
        isCircular: false,
        activeIndexes: 0,
      });

      // It should start with 'a' and be playing
      expect(activeContent.active).toEqual(['a']);
      expect(activeContent.isPlaying()).toBe(true);

      // After 200 seconds it should be on 'b'
      jest.advanceTimersByTime(200);
      expect(activeContent.active).toEqual(['b']);

      // Now we advance the time to the half way point
      // between 'b' and 'c'.
      expect(activeContent.isPlaying()).toBe(true);
      jest.advanceTimersByTime(100);
      expect(activeContent.isPlaying()).toBe(true);

      // Now pause it at the half way.
      activeContent.pause();
      expect(activeContent.isPlaying()).toBe(false);

      // When paused advancing the time should do nothing.
      jest.advanceTimersByTime(100);
      expect(activeContent.active).toEqual(['b']);
      expect(activeContent.isPlaying()).toBe(false);

      // Even when advancing a huge amount of seconds, it should
      // stay paused no matter what.
      jest.advanceTimersByTime(10000);
      expect(activeContent.active).toEqual(['b']);
      expect(activeContent.isPlaying()).toBe(false);

      // Now press play, after 100 milliseconds it should have
      // continued.
      activeContent.play();
      expect(activeContent.isPlaying()).toBe(true);

      // After 80 milliseconds b should still be active though
      jest.advanceTimersByTime(80);
      expect(activeContent.active).toEqual(['b']);

      // Finally after 20 milliseconds it should be 'c'
      jest.advanceTimersByTime(20);
      expect(activeContent.active).toEqual(['c']);

      // It has reached the end and is no longer playing.
      expect(activeContent.isPlaying()).toBe(false);
    });

    test('that the autoplay can be stopped and continued', () => {
      jest.useFakeTimers();

      const { activeContent } = setup({
        autoplay: { duration: 200 },
        isCircular: false,
        activeIndexes: 0,
      });

      // It should start with 'a' and be playing
      expect(activeContent.active).toEqual(['a']);
      expect(activeContent.isPlaying()).toBe(true);

      // After 200 seconds it should be on 'b'
      jest.advanceTimersByTime(200);
      expect(activeContent.active).toEqual(['b']);

      // Now we advance the time to the half way point
      // between 'b' and 'c'.
      expect(activeContent.isPlaying()).toBe(true);
      jest.advanceTimersByTime(100);
      expect(activeContent.isPlaying()).toBe(true);

      // Now pause it at the half way, this should be forgotten
      // because stop is not the same as pause.
      activeContent.stop();
      expect(activeContent.isPlaying()).toBe(false);

      // When stopped advancing the time should do nothing.
      jest.advanceTimersByTime(100);
      expect(activeContent.active).toEqual(['b']);
      expect(activeContent.isPlaying()).toBe(false);

      // Even when advancing a huge amount of seconds, it should
      // stay stopped no matter what.
      jest.advanceTimersByTime(10000);
      expect(activeContent.active).toEqual(['b']);
      expect(activeContent.isPlaying()).toBe(false);

      // Now press play, after 100 milliseconds it should have
      // continued.
      activeContent.play();
      expect(activeContent.isPlaying()).toBe(true);

      // After 100 milliseconds b should still be inactive because
      // stopping is not the same as pausing.
      jest.advanceTimersByTime(100);
      expect(activeContent.active).toEqual(['b']);

      // Finally after 100 milliseconds it should be 'c', because
      // that is the time it takes after a stop 100 + 100 = 200.
      jest.advanceTimersByTime(100);
      expect(activeContent.active).toEqual(['c']);

      // It has reached the end and is no longer playing.
      expect(activeContent.isPlaying()).toBe(false);
    });
  });

  describe('cooldown', () => {
    describe('cooldown errors on initialize', () => {
      test('cannot be less than zero', () => {
        expect(() => {
          setup({ cooldown: -1, activeIndexes: 0 });
        }).toThrowError(
          'uiloos > ActiveList > cooldown > duration cannot be negative or zero'
        );

        expect(() => {
          setup({ cooldown: -1, activeIndexes: 0 });
        }).toThrowError(
          ActiveListCooldownDurationError
        );
      });

      test('cannot be zero', () => {
        expect(() => {
          setup({ cooldown: 0, activeIndexes: 0 });
        }).toThrowError(
          'uiloos > ActiveList > cooldown > duration cannot be negative or zero'
        );

        expect(() => {
          setup({ cooldown: 0, activeIndexes: 0 });
        }).toThrowError(
          ActiveListCooldownDurationError
        );
      });
    });

    describe('activation cooldown', () => {
      describe('cooldown errors on activate', () => {
        test('cannot be less than zero', () => {
          const { activeContent } = setup({ cooldown: 600, activeIndexes: 0 });

          expect(() => {
            activeContent.activateByIndex(1, {
              isUserInteraction: true,
              cooldown: -1,
            });
          }).toThrowError(
            'uiloos > ActiveList > cooldown > duration cannot be negative or zero'
          );

          // It still has performed the action unfortunately, and the ActiveList is now invalid.
          expect(activeContent.lastActivatedIndex).toBe(1);

          expect(() => {
            activeContent.activateByIndex(0, {
              isUserInteraction: true,
              cooldown: -1,
            });
          }).toThrowError(
            ActiveListCooldownDurationError
          );

          // It still has performed the action unfortunately, and the ActiveList is now invalid.
          expect(activeContent.lastActivatedIndex).toBe(0);
        });

        test('cannot be zero', () => {
          const { activeContent } = setup({ cooldown: 600, activeIndexes: 0 });

          expect(() => {
            activeContent.activateByIndex(1, {
              isUserInteraction: true,
              cooldown: 0,
            });
          }).toThrowError(
            'uiloos > ActiveList > cooldown > duration cannot be negative or zero'
          );

          // It still has performed the action unfortunately, and the ActiveList is now invalid.
          expect(activeContent.lastActivatedIndex).toBe(1);

          expect(() => {
            activeContent.activateByIndex(0, {
              isUserInteraction: true,
              cooldown: 0,
            });
          }).toThrowError(
            ActiveListCooldownDurationError
          );

          // It still has performed the action unfortunately, and the ActiveList is now invalid.
          expect(activeContent.lastActivatedIndex).toBe(0);
        });
      });

      test('a cooldown is ignored when isUserInteraction is false', () => {
        let epoch = 0;
        Date.now = jest.fn(() => epoch);

        const { activeContent } = setup({
          cooldown: 5000,
          maxActivationLimit: false,
          activeIndexes: [],
        });
        expect(activeContent.active).toEqual([]);

        // Set the cooldown by calling activateByIndex
        activeContent.activateByIndex(0);
        expect(activeContent.active).toEqual(['a']);

        // This call should ignore it the cooldown due to isUserInteraction being false.
        activeContent.activateByIndex(1, { isUserInteraction: false });
        expect(activeContent.active).toEqual(['a', 'b']);

        // This call should ignore it the cooldown due to isUserInteraction being false.
        activeContent.deactivateByIndex(0, { isUserInteraction: false });
        expect(activeContent.active).toEqual(['b']);

        // This call should ignore it the cooldown due to isUserInteraction being false.
        activeContent.activateByIndex(2, { isUserInteraction: false });
        expect(activeContent.active).toEqual(['b', 'c']);
      });

      test('a cooldown from the config', () => {
        let epoch = 0;
        Date.now = jest.fn(() => epoch);

        const { activeContent } = setup({ cooldown: 5000, activeIndexes: [] });
        expect(activeContent.active).toEqual([]);

        // Set the cooldown by calling activateByIndex
        activeContent.activateByIndex(0);
        expect(activeContent.active).toEqual(['a']);

        // Should still be 'a'
        activeContent.activateByIndex(1);
        expect(activeContent.active).toEqual(['a']);

        // Should still be 'a'
        epoch = 4999;
        activeContent.activateByIndex(1);
        expect(activeContent.active).toEqual(['a']);

        // Should still be 'a'
        activeContent.deactivateByIndex(0);
        expect(activeContent.active).toEqual(['a']);

        // Should still be 'a'
        epoch = 5000;
        activeContent.activateByIndex(1);
        expect(activeContent.active).toEqual(['a']);

        // Now it should be 'b' after 5000 milliseconds
        epoch = 5001;
        activeContent.activateByIndex(1);
        expect(activeContent.active).toEqual(['b']);
      });

      test('a cooldown from options', () => {
        let epoch = 0;
        Date.now = jest.fn(() => epoch);

        const { activeContent } = setup({ activeIndexes: [] });
        expect(activeContent.active).toEqual([]);

        // Activate 'a' and set a cooldown to 5000
        activeContent.activateByIndex(0, {
          isUserInteraction: true,
          cooldown: 5000,
        });
        expect(activeContent.active).toEqual(['a']);

        // Should still be ['a']
        epoch = 4999;
        activeContent.activateByIndex(1, {
          isUserInteraction: true,
          // In essence this cooldown is ignored, because it is never set
          cooldown: () => 100,
        });
        expect(activeContent.active).toEqual(['a']);

        // Should still be ['a']
        activeContent.deactivateByIndex(0, {
          isUserInteraction: true,
          // In essence this cooldown is ignored, because it is never set
          cooldown: () => 100,
        });
        expect(activeContent.active).toEqual(['a']);

        // Should still be ['a']
        epoch = 5000;
        activeContent.activateByIndex(2, {
          isUserInteraction: true,
          // In essence this cooldown is ignored, because it is never set
          cooldown: 100,
        });
        expect(activeContent.active).toEqual(['a']);

        // Now it should become 'b' after 5001 milliseconds
        epoch = 5001;
        activeContent.activateByIndex(1, {
          isUserInteraction: true,
          cooldown: 5000,
        });
        expect(activeContent.active).toEqual(['b']);
      });

      test('that the cooldown from the ActivationOptions has precedence over the cooldown from the config', () => {
        let epoch = 0;
        Date.now = jest.fn(() => epoch);

        // This cooldown of 5000 should be ignored, because it is
        // from the initialize
        const { activeContent } = setup({ cooldown: 5000, activeIndexes: [] });
        expect(activeContent.active).toEqual([]);

        epoch = 1;

        // Now activate it
        activeContent.activateByIndex(0, {
          isUserInteraction: true,
          cooldown: 10000,
        });
        expect(activeContent.active).toEqual(['a']);

        // Should not allow the activation
        epoch = 10000;
        activeContent.activateByIndex(1, {
          isUserInteraction: true,
          cooldown: 100, // In essence this cooldown is ignored, because it is never set
        });
        expect(activeContent.active).toEqual(['a']);

        // Should not allow the deactivation
        activeContent.deactivateByIndex(0, {
          isUserInteraction: true,
          cooldown: 100, // In essence this cooldown is ignored, because it is never set
        });
        expect(activeContent.active).toEqual(['a']);

        // Should not allow the activation
        epoch = 10001;
        activeContent.activateByIndex(1, {
          isUserInteraction: true,
          cooldown: 100, // In essence this cooldown is ignored, because it is never set
        });
        expect(activeContent.active).toEqual(['a']);

        // Now it should allow the activation after 10002 milliseconds
        epoch = 10002;
        activeContent.activateByIndex(1, {
          isUserInteraction: true,
          cooldown: 10000,
        });
        expect(activeContent.active).toEqual(['b']);
      });

      test('that the cooldown can be a function instead of just a number', () => {
        let epoch = 0;
        Date.now = jest.fn(() => epoch);

        const { activeContent } = setup({
          cooldown: (data) => {
            expect(data.index).toBeDefined();
            
            expect(data.content).toBeDefined();
            expect(data.content).toBeInstanceOf(ActiveListContent);
            
            expect(data.value).toBeDefined();

            expect(data.activeList).toBeDefined();
            expect(data.activeList).toBeInstanceOf(ActiveList);
            return 5000;
          },
          activeIndexes: [],
        });
        expect(activeContent.active).toEqual([]);

        // Set the cooldown by calling activateByIndex
        activeContent.activateByIndex(0);
        expect(activeContent.active).toEqual(['a']);

        // Should still be 'a'
        activeContent.activateByIndex(1);
        expect(activeContent.active).toEqual(['a']);

        // Should still be 'a'
        epoch = 4999;
        activeContent.activateByIndex(1);
        expect(activeContent.active).toEqual(['a']);

        // Should still be 'a'
        activeContent.deactivateByIndex(0);
        expect(activeContent.active).toEqual(['a']);

        // Should still be 'a'
        epoch = 5000;
        activeContent.activateByIndex(1);
        expect(activeContent.active).toEqual(['a']);

        // Now it should be 'b' after 5000 milliseconds
        epoch = 5001;
        activeContent.activateByIndex(1);
        expect(activeContent.active).toEqual(['b']);
      });
    });

    describe('deactivation cooldown', () => {
      describe('cooldown errors on deactivate', () => {
        test('cannot be less than zero', () => {
          const { activeContent } = setup({ cooldown: 600, activeIndexes: [0, 1], maxActivationLimit: 3 });

          expect(() => {
            activeContent.deactivateByIndex(0, {
              isUserInteraction: true,
              cooldown: -1,
            });
          }).toThrowError(
            'uiloos > ActiveList > cooldown > duration cannot be negative or zero'
          );

          // It still has performed the action unfortunately, and the ActiveList is now invalid.
          expect(activeContent.activeIndexes).toEqual([1]);

          expect(() => {
            activeContent.deactivateByIndex(1, {
              isUserInteraction: true,
              cooldown: -1,
            });
          }).toThrowError(
            ActiveListCooldownDurationError
          );

          // It still has performed the action unfortunately, and the ActiveList is now invalid.
          expect(activeContent.activeIndexes).toEqual([]);
        });

        test('cannot be zero', () => {
          const { activeContent } = setup({ cooldown: 600, activeIndexes: [0, 1], maxActivationLimit: 3 });

          expect(() => {
            activeContent.deactivateByIndex(0, {
              isUserInteraction: true,
              cooldown: 0,
            });
          }).toThrowError(
            'uiloos > ActiveList > cooldown > duration cannot be negative or zero'
          );

          // It still has performed the action unfortunately, and the ActiveList is now invalid.
          expect(activeContent.activeIndexes).toEqual([1]);

          expect(() => {
            activeContent.deactivateByIndex(1, {
              isUserInteraction: true,
              cooldown: 0,
            });
          }).toThrowError(
            ActiveListCooldownDurationError
          );

          // It still has performed the action unfortunately, and the ActiveList is now invalid.
          expect(activeContent.activeIndexes).toEqual([]);
        });
      });

      test('a cooldown is ignored when isUserInteraction is false', () => {
        let epoch = 0;
        Date.now = jest.fn(() => epoch);

        const { activeContent } = setup({
          cooldown: 5000,
          maxActivationLimit: false,
          activeIndexes: [0, 1, 2],
        });
        expect(activeContent.active).toEqual(['a', 'b', 'c']);

        // Set the cooldown by calling deactivateByIndex
        activeContent.deactivateByIndex(0);
        expect(activeContent.active).toEqual(['b', 'c']);

        // This call should ignore it the cooldown due to isUserInteraction being false.
        activeContent.activateByIndex(0, { isUserInteraction: false });
        expect(activeContent.active).toEqual(['b', 'c', 'a']);

        // This call should ignore it the cooldown due to isUserInteraction being false.
        activeContent.deactivateByIndex(1, { isUserInteraction: false });
        expect(activeContent.active).toEqual(['c', 'a']);

        // This call should ignore it the cooldown due to isUserInteraction being false.
        activeContent.deactivateByIndex(2, { isUserInteraction: false });
        expect(activeContent.active).toEqual(['a']);
      });

      test('a cooldown from the config', () => {
        let epoch = 0;
        Date.now = jest.fn(() => epoch);

        const { activeContent } = setup({
          cooldown: 5000,
          maxActivationLimit: false,
          activeIndexes: [0, 1, 2],
        });
        expect(activeContent.active).toEqual(['a', 'b', 'c']);

        // Should now remove 'a' and set a cooldown for 5000
        activeContent.deactivateByIndex(0);
        expect(activeContent.active).toEqual(['b', 'c']);

        // Should still be ['b', 'c']
        epoch = 4999;
        activeContent.deactivateByIndex(1);
        expect(activeContent.active).toEqual(['b', 'c']);

        // Should still be ['b', 'c']
        epoch = 5000;
        activeContent.deactivateByIndex(2);
        expect(activeContent.active).toEqual(['b', 'c']);

        // Should still be ['b', 'c']
        activeContent.activateByIndex(0);
        expect(activeContent.active).toEqual(['b', 'c']);

        // Now it should be ['b'] after 5000 milliseconds
        epoch = 5001;
        activeContent.deactivateByIndex(2);
        expect(activeContent.active).toEqual(['b']);
      });

      test('a cooldown from options', () => {
        let epoch = 0;
        Date.now = jest.fn(() => epoch);

        const { activeContent } = setup({
          maxActivationLimit: false,
          activeIndexes: [0, 1, 2],
        });
        expect(activeContent.active).toEqual(['a', 'b', 'c']);

        // Deactivate 'a' and set a cooldown to 5000
        activeContent.deactivateByIndex(0, {
          isUserInteraction: true,
          cooldown: 5000,
        });
        expect(activeContent.active).toEqual(['b', 'c']);

        // Should still be ['b', 'c']
        epoch = 4999;
        activeContent.deactivateByIndex(1, {
          isUserInteraction: true,
          // In essence this cooldown is ignored, because it is never set
          cooldown: () => 100,
        });
        expect(activeContent.active).toEqual(['b', 'c']);

        // Should still be ['b', 'c']
        epoch = 5000;
        activeContent.deactivateByIndex(1, {
          isUserInteraction: true,
          // In essence this cooldown is ignored, because it is never set
          cooldown: 100,
        });
        expect(activeContent.active).toEqual(['b', 'c']);

        // Should still be ['b', 'c']
        activeContent.activateByIndex(0, {
          isUserInteraction: true,
          // In essence this cooldown is ignored, because it is never set
          cooldown: 100,
        });
        expect(activeContent.active).toEqual(['b', 'c']);

        // Now it should become 'a' after 5001 milliseconds
        epoch = 5001;
        activeContent.deactivateByIndex(1, {
          isUserInteraction: true,
          cooldown: 5000,
        });
        expect(activeContent.active).toEqual(['c']);
      });

      test('that the cooldown from the ActivationOptions has precedence over the cooldown from the config', () => {
        let epoch = 0;
        Date.now = jest.fn(() => epoch);

        // This cooldown of 5000 should be ignored, because it is
        // from the initialize
        const { activeContent } = setup({
          cooldown: 5000,
          maxActivationLimit: false,
          activeIndexes: [0, 1, 2],
        });
        expect(activeContent.active).toEqual(['a', 'b', 'c']);

        epoch = 1;

        // Now deactivate it
        activeContent.deactivateByIndex(0, {
          isUserInteraction: true,
          cooldown: 10000,
        });
        expect(activeContent.active).toEqual(['b', 'c']);

        // Should not allow the deactivation
        epoch = 10000;
        activeContent.deactivateByIndex(1, {
          isUserInteraction: true,
          cooldown: 100, // In essence this cooldown is ignored, because it is never set
        });
        expect(activeContent.active).toEqual(['b', 'c']);

        // Should not allow the deactivation
        epoch = 10001;
        activeContent.deactivateByIndex(1, {
          isUserInteraction: true,
          cooldown: 100, // In essence this cooldown is ignored, because it is never set
        });
        expect(activeContent.active).toEqual(['b', 'c']);

        activeContent.activateByIndex(0, {
          isUserInteraction: true,
          cooldown: 100, // In essence this cooldown is ignored, because it is never set
        });
        expect(activeContent.active).toEqual(['b', 'c']);

        // Now it should allow the deactivation after 10002 milliseconds
        epoch = 10002;
        activeContent.deactivateByIndex(1, {
          isUserInteraction: true,
          cooldown: 10000,
        });
        expect(activeContent.active).toEqual(['c']);
      });

      test('that the cooldown can be a function instead of just a number', () => {
        let epoch = 0;
        Date.now = jest.fn(() => epoch);

        const { activeContent } = setup({
          cooldown: (data) => {
            expect(data.index).toBeDefined();
            
            expect(data.content).toBeDefined();
            expect(data.content).toBeInstanceOf(ActiveListContent);
            
            expect(data.value).toBeDefined();

            expect(data.activeList).toBeDefined();
            expect(data.activeList).toBeInstanceOf(ActiveList);
            return 5000;
          },
          maxActivationLimit: false,
          activeIndexes: [0, 1, 2],
        });
        expect(activeContent.active).toEqual(['a', 'b', 'c']);

        // Set the cooldown by calling deactivateByIndex
        activeContent.deactivateByIndex(0);
        expect(activeContent.active).toEqual(['b', 'c']);

        // Should still be ['b', 'c']
        epoch = 4999;
        activeContent.deactivateByIndex(1);
        expect(activeContent.active).toEqual(['b', 'c']);

        activeContent.activateByIndex(0);
        expect(activeContent.active).toEqual(['b', 'c']);

        // Should still be ['b', 'c']
        epoch = 5000;
        activeContent.deactivateByIndex(1);
        expect(activeContent.active).toEqual(['b', 'c']);

        // Now it should be ['c'] after 5000 milliseconds
        epoch = 5001;
        activeContent.deactivateByIndex(1);
        expect(activeContent.active).toEqual(['c']);
      });
    });
  });

  describe('history', () => {
    test('that a correct history is kept for all events', () => {
      const { activeContent } = setup({
        keepHistoryFor: 100,
        activeIndexes: 0,
      });

      expect(activeContent.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
          indexes: [0],
          values: ['a'],
        }),
      ]);

      activeContent.activateByIndex(1);
      expect(activeContent.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
          indexes: [0],
          values: ['a'],
        }),
        expect.objectContaining({ type: 'ACTIVATED', index: 1, value: 'b' }),
      ]);

      activeContent.removeByIndex(0);
      expect(activeContent.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
          indexes: [0],
          values: ['a'],
        }),
        expect.objectContaining({ type: 'ACTIVATED', index: 1, value: 'b' }),
        expect.objectContaining({ type: 'REMOVED', index: 0, value: 'a' }),
      ]);

      // Sanity check
      expect(activeContent.contents.map((c) => c.value)).toEqual(['b', 'c']);

      activeContent.removeByPredicate(() => true);
      expect(activeContent.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
          indexes: [0],
          values: ['a'],
        }),
        expect.objectContaining({ type: 'ACTIVATED', index: 1, value: 'b' }),
        expect.objectContaining({ type: 'REMOVED', index: 0, value: 'a' }),
        expect.objectContaining({
          type: 'REMOVED_MULTIPLE',
          indexes: [0, 1],
          values: ['b', 'c'],
        }),
      ]);

      activeContent.insertAtIndex('a', 0);
      activeContent.activateByIndex(0);

      expect(activeContent.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
          indexes: [0],
          values: ['a'],
        }),
        expect.objectContaining({ type: 'ACTIVATED', index: 1, value: 'b' }),
        expect.objectContaining({ type: 'REMOVED', index: 0, value: 'a' }),
        expect.objectContaining({
          type: 'REMOVED_MULTIPLE',
          indexes: [0, 1],
          values: ['b', 'c'],
        }),
        expect.objectContaining({ type: 'INSERTED', index: 0, value: 'a' }),
        expect.objectContaining({ type: 'ACTIVATED', index: 0, value: 'a' }),
      ]);

      activeContent.insertAtIndex('b', 1);
      activeContent.insertAtIndex('c', 2);

      expect(activeContent.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
          indexes: [0],
          values: ['a'],
        }),
        expect.objectContaining({ type: 'ACTIVATED', index: 1, value: 'b' }),
        expect.objectContaining({ type: 'REMOVED', index: 0, value: 'a' }),
        expect.objectContaining({
          type: 'REMOVED_MULTIPLE',
          indexes: [0, 1],
          values: ['b', 'c'],
        }),
        expect.objectContaining({ type: 'INSERTED', index: 0, value: 'a' }),
        expect.objectContaining({ type: 'ACTIVATED', index: 0, value: 'a' }),
        expect.objectContaining({ type: 'INSERTED', index: 1, value: 'b' }),
        expect.objectContaining({ type: 'INSERTED', index: 2, value: 'c' }),
      ]);

      // Sanity check
      expect(activeContent.contents.map((c) => c.value)).toEqual([
        'a',
        'b',
        'c',
      ]);

      activeContent.swapByIndex(0, 2);
      expect(activeContent.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
          indexes: [0],
          values: ['a'],
        }),
        expect.objectContaining({ type: 'ACTIVATED', index: 1, value: 'b' }),
        expect.objectContaining({
          type: 'REMOVED',
          index: 0,
          value: 'a',
        }),
        expect.objectContaining({
          type: 'REMOVED_MULTIPLE',
          indexes: [0, 1],
          values: ['b', 'c'],
        }),
        expect.objectContaining({ type: 'INSERTED', index: 0, value: 'a' }),
        expect.objectContaining({ type: 'ACTIVATED', index: 0, value: 'a' }),
        expect.objectContaining({ type: 'INSERTED', index: 1, value: 'b' }),
        expect.objectContaining({ type: 'INSERTED', index: 2, value: 'c' }),
        expect.objectContaining({
          type: 'SWAPPED',
          index: { a: 0, b: 2 },
          value: { a: 'a', b: 'c' },
        }),
      ]);

      activeContent.moveByIndex(2, 0);
      expect(activeContent.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
          indexes: [0],
          values: ['a'],
        }),
        expect.objectContaining({ type: 'ACTIVATED', index: 1, value: 'b' }),
        expect.objectContaining({
          type: 'REMOVED',
          index: 0,
          value: 'a',
        }),
        expect.objectContaining({
          type: 'REMOVED_MULTIPLE',
          indexes: [0, 1],
          values: ['b', 'c'],
        }),
        expect.objectContaining({ type: 'INSERTED', index: 0, value: 'a' }),
        expect.objectContaining({ type: 'ACTIVATED', index: 0, value: 'a' }),
        expect.objectContaining({ type: 'INSERTED', index: 1, value: 'b' }),
        expect.objectContaining({ type: 'INSERTED', index: 2, value: 'c' }),
        expect.objectContaining({
          type: 'SWAPPED',
          index: { a: 0, b: 2 },
          value: { a: 'a', b: 'c' },
        }),
        expect.objectContaining({
          type: 'MOVED',
          index: {
            from: 2,
            to: 0,
          },
          value: 'a',
        }),
      ]);

      activeContent.deactivateByIndex(0);
      expect(activeContent.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
          indexes: [0],
          values: ['a'],
        }),
        expect.objectContaining({ type: 'ACTIVATED', index: 1, value: 'b' }),
        expect.objectContaining({
          type: 'REMOVED',
          index: 0,
          value: 'a',
        }),
        expect.objectContaining({
          type: 'REMOVED_MULTIPLE',
          indexes: [0, 1],
          values: ['b', 'c'],
        }),
        expect.objectContaining({ type: 'INSERTED', index: 0, value: 'a' }),
        expect.objectContaining({ type: 'ACTIVATED', index: 0, value: 'a' }),
        expect.objectContaining({ type: 'INSERTED', index: 1, value: 'b' }),
        expect.objectContaining({ type: 'INSERTED', index: 2, value: 'c' }),
        expect.objectContaining({
          type: 'SWAPPED',
          index: { a: 0, b: 2 },
          value: { a: 'a', b: 'c' },
        }),
        expect.objectContaining({
          type: 'MOVED',
          index: {
            from: 2,
            to: 0,
          },
          value: 'a',
        }),
        expect.objectContaining({
          type: 'DEACTIVATED',
          index: 0,
          value: 'a',
        }),
      ]);
    });

    test('that a history is kept for a maximum number of events', () => {
      const { activeContent } = setup({ keepHistoryFor: 3, activeIndexes: 0 });

      expect(activeContent.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
          indexes: [0],
          values: ['a'],
        }),
      ]);

      activeContent.activateByIndex(1);
      expect(activeContent.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
          indexes: [0],
          values: ['a'],
        }),
        expect.objectContaining({ type: 'ACTIVATED', index: 1, value: 'b' }),
      ]);

      activeContent.activateByIndex(2);
      expect(activeContent.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
          indexes: [0],
          values: ['a'],
        }),
        expect.objectContaining({ type: 'ACTIVATED', index: 1, value: 'b' }),
        expect.objectContaining({ type: 'ACTIVATED', index: 2, value: 'c' }),
      ]);

      activeContent.activateByIndex(0);
      expect(activeContent.history).toEqual([
        expect.objectContaining({ type: 'ACTIVATED', index: 1, value: 'b' }),
        expect.objectContaining({ type: 'ACTIVATED', index: 2, value: 'c' }),
        expect.objectContaining({ type: 'ACTIVATED', index: 0, value: 'a' }),
      ]);
    });

    test('that initialize resets the history', () => {
      const { activeContent } = setup({ keepHistoryFor: 4, activeIndexes: 0 });

      expect(activeContent.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
          indexes: [0],
          values: ['a'],
        }),
      ]);

      activeContent.activateByIndex(1);
      expect(activeContent.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
          indexes: [0],
          values: ['a'],
        }),
        expect.objectContaining({ type: 'ACTIVATED', index: 1, value: 'b' }),
      ]);

      activeContent.removeByIndex(0);
      expect(activeContent.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
          indexes: [0],
          values: ['a'],
        }),
        expect.objectContaining({ type: 'ACTIVATED', index: 1, value: 'b' }),
        expect.objectContaining({ type: 'REMOVED', index: 0, value: 'a' }),
      ]);

      // Now reset the history, not that if `keepHistoryFor` is zero
      // the `history` array would be empty
      activeContent.initialize({ contents: [], keepHistoryFor: 1 });
      expect(activeContent.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
          indexes: [],
          values: [],
        }),
      ]);
    });
  });

  describe('subscribers', () => {
    test('multiple subscribers', () => {
      const { activeContent, subscriber } = setup({ activeIndexes: 0 });

      const secondSubscriber = jest.fn();
      const removeSecondSubscriber = activeContent.subscribe(secondSubscriber);

      const thirdSubscriber = jest.fn();
      activeContent.subscribe(thirdSubscriber);

      activeContent.activateByIndex(1);

      expect(subscriber).toHaveBeenCalledTimes(1);
      expect(secondSubscriber).toHaveBeenCalledTimes(1);
      expect(thirdSubscriber).toHaveBeenCalledTimes(1);

      removeSecondSubscriber();

      activeContent.activateByIndex(0);

      expect(subscriber).toHaveBeenCalledTimes(2);
      expect(secondSubscriber).toHaveBeenCalledTimes(1);
      expect(thirdSubscriber).toHaveBeenCalledTimes(2);

      activeContent.unsubscribe(thirdSubscriber);

      activeContent.activateByIndex(2);

      expect(subscriber).toHaveBeenCalledTimes(3);
      expect(secondSubscriber).toHaveBeenCalledTimes(1);
      expect(thirdSubscriber).toHaveBeenCalledTimes(2);
    });
  });
});

type ActiveListSansContents<T> = Pick<
  ActiveList<T>,
  | 'maxActivationLimit'
  | 'maxActivationLimitBehavior'
  | 'active'
  | 'activeContents'
  | 'activeIndexes'
  | 'isCircular'
  | 'lastActivated'
  | 'lastActivatedContent'
  | 'lastActivatedIndex'
  | 'hasActiveChangedAtLeastOnce'
  | 'direction'
  | 'history'
>;

type TestState<T> = ActiveListSansContents<T> & {
  contents: TestContent<T>[];
};

type TestContent<T> = Pick<
  ActiveListContent<T>,
  | 'active'
  | 'index'
  | 'value'
  | 'isFirst'
  | 'isLast'
  | 'hasNext'
  | 'hasPrevious'
  | 'isNext'
  | 'isPrevious'
  | 'hasBeenActiveBefore'
>;

function assertState(state: ActiveList<string>, expected: TestState<string>) {
  const callAsTestState: TestState<string> = {
    maxActivationLimit: state.maxActivationLimit,
    maxActivationLimitBehavior: state.maxActivationLimitBehavior,
    active: state.active,
    activeIndexes: state.activeIndexes,
    activeContents: state.activeContents,
    isCircular: state.isCircular,
    lastActivatedContent: state.lastActivatedContent,
    lastActivatedIndex: state.lastActivatedIndex,
    lastActivated: state.lastActivated,
    hasActiveChangedAtLeastOnce: state.hasActiveChangedAtLeastOnce,
    direction: state.direction,
    history: state.history,
    contents: state.contents.map((content) => {
      const contentAsTestContent: TestContent<string> = {
        active: content.active,
        index: content.index,
        value: content.value,
        isFirst: content.isFirst,
        isLast: content.isLast,
        hasNext: content.hasNext,
        hasPrevious: content.hasPrevious,
        isNext: content.isNext,
        isPrevious: content.isPrevious,
        hasBeenActiveBefore: content.hasBeenActiveBefore,
      };

      return contentAsTestContent;
    }),
  };

  expect(callAsTestState).toEqual(expected);
}

function assertLastSubscriber(
  subscriber: jest.Mock<ActiveList<string>, any>,
  expectedState: TestState<string>,
  expectedEvent: ActiveListEvent<string>
) {
  const lastCall = subscriber.mock.calls[subscriber.mock.calls.length - 1];
  const state: ActiveList<string> = lastCall[0];
  const event: ActiveListEvent<string> = lastCall[1];

  assertState(state, expectedState);

  const eventCopy = { ...event };
  // @ts-ignore Just delete it
  delete eventCopy.time;

  const expectedEventCopy = { ...expectedEvent };
  // @ts-ignore Just delete it
  delete expectedEventCopy.time;

  expect(eventCopy).toEqual(expectedEventCopy);
}
