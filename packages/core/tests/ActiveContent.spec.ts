import { ActiveContent } from '../src/ActiveContent/ActiveContent';
import { Content } from '../src/ActiveContent/Content';
import {
  ActiveContentConfig,
  UnsubscribeFunction,
} from '../src/ActiveContent/types';

type TestConfig = Omit<ActiveContentConfig<string>, 'subscriber' | 'contents'>;

describe('ActiveContent limit 1', () => {
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
    },
    contents = ['a', 'b', 'c']
  ) {
    const activeContent = new ActiveContent({
      contents,
      ...config,
    });

    const subscriber = jest.fn();
    unsubscribe = activeContent.subscribe(subscriber);

    return { subscriber, contents, activeContent };
  }

  describe('initialize', () => {
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
      test('that initialize can reset the ActiveContent', () => {
        const { activeContent, subscriber } = setup({ activeIndexes: 2 });

        expect(activeContent.contents.map((v) => v.value)).toEqual([
          'a',
          'b',
          'c',
        ]);

        const contents = ['d', 'e', 'f', 'g'];

        activeContent.initialize({ contents, activeIndexes: 0 });

        assertLastSubscriber(subscriber, {
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
        });
      });

      test('that initialize can reset the ActiveContent and make it empty', () => {
        const { activeContent, subscriber } = setup();
        activeContent.initialize({ contents: [] });

        assertLastSubscriber(subscriber, {
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
            'uiloos > ActiveContent.activateByIndex > could not activate: index out of bounds'
          );

          expect(subscriber).toHaveBeenCalledTimes(0);

          expect(activeContent.active).toEqual([]);
        });

        test('throws out of bounds when index is less than zero', () => {
          const { activeContent, subscriber } = setup({});

          expect(() => {
            activeContent.activateByIndex(-1);
          }).toThrowError(
            'uiloos > ActiveContent.activateByIndex > could not activate: index out of bounds'
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
            assertLastSubscriber(subscriber, {
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
            });

            activeContent.activateByIndex(2);

            expect(subscriber).toHaveBeenCalledTimes(2);
            assertLastSubscriber(subscriber, {
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
            });

            activeContent.activateByIndex(0);

            expect(subscriber).toHaveBeenCalledTimes(3);
            assertLastSubscriber(subscriber, {
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
            });
          });

          test('moving left', () => {
            const { activeContent, subscriber } = setup({
              activeIndexes: 2,
              isCircular: true,
            });

            activeContent.activateByIndex(1);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(subscriber, {
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
            });

            activeContent.activateByIndex(0);

            expect(subscriber).toHaveBeenCalledTimes(2);
            assertLastSubscriber(subscriber, {
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
            });

            activeContent.activateByIndex(2);

            expect(subscriber).toHaveBeenCalledTimes(3);
            assertLastSubscriber(subscriber, {
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
            });
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
            assertLastSubscriber(subscriber, {
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
            });
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
            assertLastSubscriber(subscriber, {
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
            });
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
            assertLastSubscriber(subscriber, {
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
            });
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
            assertLastSubscriber(subscriber, {
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
            });
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
            assertLastSubscriber(subscriber, {
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
            });
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
            assertLastSubscriber(subscriber, {
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
            });
          });
        });

        describe('when straight', () => {
          test('moving right', () => {
            const { activeContent, subscriber } = setup({ activeIndexes: 0 });

            activeContent.activateByIndex(1);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(subscriber, {
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
            });

            activeContent.activateByIndex(2);

            expect(subscriber).toHaveBeenCalledTimes(2);
            assertLastSubscriber(subscriber, {
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
            });
          });

          test('moving left', () => {
            const { activeContent, subscriber } = setup({ activeIndexes: 2 });

            activeContent.activateByIndex(1);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(subscriber, {
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
            });

            activeContent.activateByIndex(0);

            expect(subscriber).toHaveBeenCalledTimes(2);
            assertLastSubscriber(subscriber, {
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
            });
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
            assertLastSubscriber(subscriber, {
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
            });

            activeContent.activateByIndex(0);

            expect(subscriber).toHaveBeenCalledTimes(2);
            assertLastSubscriber(subscriber, {
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
            });
          });

          test('moving left', () => {
            const { activeContent, subscriber } = setup({
              maxActivationLimit: false,
              activeIndexes: 1,
              isCircular: true,
            });

            activeContent.activateByIndex(0);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(subscriber, {
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
            });

            activeContent.activateByIndex(2);

            expect(subscriber).toHaveBeenCalledTimes(2);
            assertLastSubscriber(subscriber, {
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
            });
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
            assertLastSubscriber(subscriber, {
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
            });
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
            assertLastSubscriber(subscriber, {
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
            });
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
            assertLastSubscriber(subscriber, {
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
            });
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
            assertLastSubscriber(subscriber, {
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
            });
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
            assertLastSubscriber(subscriber, {
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
            });
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
            assertLastSubscriber(subscriber, {
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
            });
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
            assertLastSubscriber(subscriber, {
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
            });

            activeContent.activateByIndex(2);

            expect(subscriber).toHaveBeenCalledTimes(2);
            assertLastSubscriber(subscriber, {
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
            });
          });

          test('moving left', () => {
            const { activeContent, subscriber } = setup({
              maxActivationLimit: false,
              activeIndexes: 2,
            });

            activeContent.activateByIndex(1);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(subscriber, {
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
            });

            activeContent.activateByIndex(0);

            expect(subscriber).toHaveBeenCalledTimes(2);
            assertLastSubscriber(subscriber, {
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
            });
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
          assertLastSubscriber(subscriber, {
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
          });

          activeContent.activateByIndex(2);

          expect(subscriber).toHaveBeenCalledTimes(2);
          assertLastSubscriber(subscriber, {
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
          });

          activeContent.activateByIndex(0);

          expect(subscriber).toHaveBeenCalledTimes(3);
          assertLastSubscriber(subscriber, {
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
          });
        });

        test("when behavior is 'ignore' once the limit is reached items should no longer be added, but no errors are thrown", () => {
          const { activeContent, subscriber } = setup({
            activeIndexes: 0,
            maxActivationLimit: 2,
            maxActivationLimitBehavior: 'ignore',
          });

          activeContent.activateByIndex(1);

          expect(subscriber).toHaveBeenCalledTimes(1);
          assertLastSubscriber(subscriber, {
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
          });

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
          assertLastSubscriber(subscriber, {
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
          });

          expect(() => {
            activeContent.activateByIndex(2);
          }).toThrowError(
            'uiloos > ActiveContent.activateByIndex > could not activate: limit is reached'
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

        expect(activeContent.activateByIndex).toHaveBeenCalledTimes(2);
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
          'uiloos > ActiveContent.getIndex could not get index for item. Item not in contents array'
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

        jest.spyOn(activeContent, 'activateByIndex');

        activeContent.activateByPredicate((item) => item === 'a', {
          isUserInteraction: true,
        });

        expect(activeContent.activateByIndex).toHaveBeenCalledTimes(2);

        expect(subscriber).toHaveBeenCalledTimes(2);
        assertLastSubscriber(subscriber, {
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
        });
      });

      test('when multiple items match all items are activated when maxActivationLimit is false', () => {
        // The two 'a's will match the predicate
        const { activeContent, subscriber } = setup(
          { maxActivationLimit: false },
          ['b', 'a', 'a', 'z']
        );

        jest.spyOn(activeContent, 'activateByIndex');

        activeContent.activateByPredicate((item) => item === 'a', {
          isUserInteraction: true,
        });

        expect(activeContent.activateByIndex).toHaveBeenCalledTimes(2);

        expect(subscriber).toHaveBeenCalledTimes(2);
        assertLastSubscriber(subscriber, {
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
        });
      });

      test('when multiple items match all items are activated when maxActivationLimit is N', () => {
        // The two 'a's will match the predicate
        const { activeContent, subscriber } = setup({ maxActivationLimit: 2 }, [
          'b',
          'a',
          'a',
          'z',
        ]);

        jest.spyOn(activeContent, 'activateByIndex');

        activeContent.activateByPredicate((item) => item === 'a', {
          isUserInteraction: true,
        });

        expect(activeContent.activateByIndex).toHaveBeenCalledTimes(2);

        expect(subscriber).toHaveBeenCalledTimes(2);
        assertLastSubscriber(subscriber, {
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
        });
      });

      test('predicate based on item', () => {
        const { activeContent } = setup();

        jest.spyOn(activeContent, 'activateByIndex');

        activeContent.activateByPredicate((item) => item === 'c', {
          isUserInteraction: true,
        });

        expect(activeContent.activateByIndex).toHaveBeenCalledTimes(1);
        expect(activeContent.activateByIndex).toHaveBeenCalledWith(2, {
          isUserInteraction: true,
        });
      });

      test('predicate based on index', () => {
        const { activeContent } = setup();

        jest.spyOn(activeContent, 'activateByIndex');

        activeContent.activateByPredicate((item, index) => index === 2, {
          isUserInteraction: true,
        });

        expect(activeContent.activateByIndex).toHaveBeenCalledTimes(1);
        expect(activeContent.activateByIndex).toHaveBeenCalledWith(2, {
          isUserInteraction: true,
        });
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
            'uiloos > ActiveContent.deactivateByIndex > could not deactivate: index out of bounds'
          );

          expect(subscriber).toHaveBeenCalledTimes(0);

          expect(activeContent.active).toEqual([]);
        });

        test('throws out of bounds when index is less than zero', () => {
          const { activeContent, subscriber } = setup();

          expect(() => {
            activeContent.deactivateByIndex(-1);
          }).toThrowError(
            'uiloos > ActiveContent.deactivateByIndex > could not deactivate: index out of bounds'
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
        assertLastSubscriber(subscriber, {
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
        });
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
            assertLastSubscriber(subscriber, {
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
            });
          });

          test('moving right when not removing current lastActivatedIndex', () => {
            const { activeContent, subscriber } = setup({
              activeIndexes: [0, 1, 2],
              maxActivationLimit: false,
              isCircular: true,
            });

            activeContent.deactivateByIndex(1);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(subscriber, {
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
            });
          });

          test('moving left when removing current lastActivatedIndex', () => {
            const { activeContent, subscriber } = setup({
              activeIndexes: [2, 0, 1],
              maxActivationLimit: false,
              isCircular: true,
            });

            activeContent.deactivateByIndex(1);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(subscriber, {
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
            });
          });

          test('moving left when not removing current lastActivatedIndex', () => {
            const { activeContent, subscriber } = setup({
              activeIndexes: [2, 1, 0],
              maxActivationLimit: false,
              isCircular: true,
            });

            activeContent.deactivateByIndex(1);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(subscriber, {
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
            });
          });

          test('end to first should move right', () => {
            const { activeContent, subscriber } = setup({
              activeIndexes: [1, 0, 2],
              maxActivationLimit: false,
              isCircular: true,
            });

            activeContent.deactivateByIndex(2);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(subscriber, {
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
            });
          });

          test('first to last should move left', () => {
            const { activeContent, subscriber } = setup({
              activeIndexes: [1, 2, 0],
              maxActivationLimit: false,
              isCircular: true,
            });

            activeContent.deactivateByIndex(0);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(subscriber, {
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
            });
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
            assertLastSubscriber(subscriber, {
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
            });
          });

          test('moving right when not removing current lastActivatedIndex', () => {
            const { activeContent, subscriber } = setup({
              activeIndexes: [0, 1, 2],
              maxActivationLimit: false,
              isCircular: false,
            });

            activeContent.deactivateByIndex(1);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(subscriber, {
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
            });
          });

          test('moving left when removing current lastActivatedIndex', () => {
            const { activeContent, subscriber } = setup({
              activeIndexes: [2, 0, 1],
              maxActivationLimit: false,
              isCircular: false,
            });

            activeContent.deactivateByIndex(1);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(subscriber, {
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
            });
          });

          test('moving left when not removing current lastActivatedIndex', () => {
            const { activeContent, subscriber } = setup({
              activeIndexes: [2, 1, 0],
              maxActivationLimit: false,
              isCircular: false,
            });

            activeContent.deactivateByIndex(1);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(subscriber, {
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
            });
          });

          test('end to first should move left', () => {
            const { activeContent, subscriber } = setup({
              activeIndexes: [1, 0, 2],
              maxActivationLimit: false,
              isCircular: false,
            });

            activeContent.deactivateByIndex(2);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(subscriber, {
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
            });
          });

          test('first to last should move right', () => {
            const { activeContent, subscriber } = setup({
              activeIndexes: [1, 2, 0],
              maxActivationLimit: false,
              isCircular: false,
            });

            activeContent.deactivateByIndex(0);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(subscriber, {
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
            });
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
          'uiloos > ActiveContent.getIndex could not get index for item. Item not in contents array'
        );

        expect(activeContent.deactivateByIndex).toHaveBeenCalledTimes(0);
      });
    });

    describe('activateByPredicate', () => {
      test('when multiple items match they should all be removed', () => {
        // The two 'a's will match the predicate
        const { activeContent, subscriber } = setup(
          {
            activeIndexes: [0, 1, 2, 3],
            maxActivationLimit: false,
          },
          ['b', 'a', 'a', 'z']
        );

        jest.spyOn(activeContent, 'deactivateByIndex');

        activeContent.deactivateByPredicate((item) => item === 'a', {
          isUserInteraction: true,
        });

        expect(activeContent.deactivateByIndex).toHaveBeenCalledTimes(2);

        expect(subscriber).toHaveBeenCalledTimes(2);
        assertLastSubscriber(subscriber, {
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
        });
      });

      test('predicate based on item', () => {
        const { activeContent } = setup();

        jest.spyOn(activeContent, 'deactivateByIndex');

        activeContent.deactivateByPredicate((item) => item === 'c', {
          isUserInteraction: true,
        });

        expect(activeContent.deactivateByIndex).toHaveBeenCalledTimes(1);
        expect(activeContent.deactivateByIndex).toHaveBeenCalledWith(2, {
          isUserInteraction: true,
        });
      });

      test('predicate based on index', () => {
        const { activeContent } = setup();

        jest.spyOn(activeContent, 'deactivateByIndex');

        activeContent.deactivateByPredicate((item, index) => index === 2, {
          isUserInteraction: true,
        });

        expect(activeContent.deactivateByIndex).toHaveBeenCalledTimes(1);
        expect(activeContent.deactivateByIndex).toHaveBeenCalledWith(2, {
          isUserInteraction: true,
        });
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
          'uiloos > ActiveContent.insertAtIndex > could not insert: index out of bounds'
        );

        expect(subscriber).toHaveBeenCalledTimes(0);
      });

      test('throws out of bounds when index is less than zero', () => {
        const { activeContent, subscriber } = setup();

        expect(() => {
          activeContent.insertAtIndex('d', -1);
        }).toThrowError(
          'uiloos > ActiveContent.insertAtIndex > could not insert: index out of bounds'
        );

        expect(subscriber).toHaveBeenCalledTimes(0);
      });
    });

    test('inserting the first element should not activate it', () => {
      const { activeContent, subscriber } = setup(
        {},
        []
      );

      activeContent.unshift('z');

      expect(subscriber).toHaveBeenCalledTimes(1);

      assertLastSubscriber(subscriber, {
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
      });
    });

    describe('inserting when maxActivationLimit is 1', () => {
      test('inserting at the start', () => {
        const { activeContent, subscriber } = setup({ activeIndexes: 0 });

        activeContent.unshift('d');

        expect(subscriber).toHaveBeenCalledTimes(1);

        assertLastSubscriber(subscriber, {
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
        });
      });

      test('inserting in the middle', () => {
        const { activeContent, subscriber } = setup({ activeIndexes: 0 });

        activeContent.insertAtIndex('d', 1);

        expect(subscriber).toHaveBeenCalledTimes(1);

        assertLastSubscriber(subscriber, {
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
        });
      });

      test('inserting at the end', () => {
        const { activeContent, subscriber } = setup({ activeIndexes: 0 });

        activeContent.push('d');

        expect(subscriber).toHaveBeenCalledTimes(1);

        assertLastSubscriber(subscriber, {
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
        });
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

        assertLastSubscriber(subscriber, {
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
        });
      });

      test('inserting in the middle', () => {
        const { activeContent, subscriber } = setup({
          activeIndexes: [0, 1, 2],
          maxActivationLimit: false,
        });

        activeContent.insertAtIndex('d', 1);

        expect(subscriber).toHaveBeenCalledTimes(1);

        assertLastSubscriber(subscriber, {
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
        });
      });

      test('inserting at the end', () => {
        const { activeContent, subscriber } = setup({
          activeIndexes: [0, 1, 2],
          maxActivationLimit: false,
        });

        activeContent.push('d');

        expect(subscriber).toHaveBeenCalledTimes(1);

        assertLastSubscriber(subscriber, {
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
        });
      });
    });

    describe('inserting with predicate', () => {
      test('insertAtPredicate', () => {
        const { activeContent, subscriber } = setup({ activeIndexes: 0 });

        activeContent.insertAtPredicate('d', (item) => item === 'b');

        expect(subscriber).toHaveBeenCalledTimes(1);

        assertLastSubscriber(subscriber, {
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
        });
      });

      test('when no predicate matches do nothing', () => {
        const { activeContent, subscriber } = setup({ activeIndexes: 0 });

        activeContent.insertAtPredicate('z', (item) => item === 'y');

        expect(subscriber).toHaveBeenCalledTimes(0);
      });

      describe('insertBeforePredicate', () => {
        test('when first item returns true add at start and not at -1', () => {
          const { activeContent, subscriber } = setup({ activeIndexes: 0 });

          activeContent.insertBeforePredicate('d', (item) => item === 'a');

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(subscriber, {
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
          });
        });

        test('when item returns true insert before predicate', () => {
          const { activeContent, subscriber } = setup({ activeIndexes: 0 });

          activeContent.insertBeforePredicate('d', (item) => item === 'b');

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(subscriber, {
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
          });
        });
      });

      describe('insertAfterPredicate', () => {
        test('when last item returns true add at end and not after', () => {
          const { activeContent, subscriber } = setup({ activeIndexes: 0 });

          activeContent.insertAfterPredicate('d', (item) => item === 'c');

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(subscriber, {
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
          });
        });

        test('when item returns true insert after predicate', () => {
          const { activeContent, subscriber } = setup({ activeIndexes: 0 });

          activeContent.insertAfterPredicate('d', (item) => item === 'b');

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(subscriber, {
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
          });
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
            'uiloos > ActiveContent.removeByIndex > could not remove: index out of bounds'
          );

          expect(subscriber).toHaveBeenCalledTimes(0);
        });

        test('throws out of bounds when index is less than zero', () => {
          const { activeContent, subscriber } = setup();

          expect(() => {
            activeContent.removeByIndex(-1);
          }).toThrowError(
            'uiloos > ActiveContent.removeByIndex > could not remove: index out of bounds'
          );

          expect(subscriber).toHaveBeenCalledTimes(0);
        });
      });

      test('removing last item', () => {
        const { activeContent, subscriber } = setup({ activeIndexes: 0 }, [
          'a',
        ]);

        activeContent.shift();

        expect(subscriber).toHaveBeenCalledTimes(1);

        assertLastSubscriber(subscriber, {
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
        });
      });

      describe('removal when maxActivationLimit is 1', () => {
        describe('removing single inactive element', () => {
          test('removing from the start', () => {
            const { activeContent, subscriber } = setup({ activeIndexes: 1 });

            const removedValue = activeContent.shift();

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(subscriber, {
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
            });

            expect(removedValue).toBe('a');
          });

          test('removing from the middle', () => {
            const { activeContent, subscriber } = setup({ activeIndexes: 0 });

            const removedValue = activeContent.removeByIndex(1);

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(subscriber, {
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
            });

            expect(removedValue).toBe('b');
          });

          test('removing from the end', () => {
            const { activeContent, subscriber } = setup({ activeIndexes: 0 });

            const removedValue = activeContent.pop();

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(subscriber, {
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
            });

            expect(removedValue).toBe('c');
          });
        });

        describe('removing single active element', () => {
          test('removing from the start', () => {
            const { activeContent, subscriber } = setup({ activeIndexes: 0 });

            const removedValue = activeContent.shift();

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(subscriber, {
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
            });

            expect(removedValue).toBe('a');
          });

          test('removing from the middle', () => {
            const { activeContent, subscriber } = setup({ activeIndexes: 1 });

            const removedValue = activeContent.removeByIndex(1);

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(subscriber, {
              active: ['a'],
              activeContents: [activeContent.contents[0]],
              activeIndexes: [0],
              lastActivated: 'a',
              lastActivatedContent: activeContent.contents[0],
              lastActivatedIndex: 0,
              isCircular: false,
              direction: 'left',
              maxActivationLimit: 1,
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

            expect(removedValue).toBe('b');
          });

          test('removing from the end', () => {
            const { activeContent, subscriber } = setup({ activeIndexes: 2 });

            const removedValue = activeContent.pop();

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(subscriber, {
              active: ['b'],
              activeContents: [activeContent.contents[1]],
              activeIndexes: [1],
              lastActivated: 'b',
              lastActivatedContent: activeContent.contents[1],
              lastActivatedIndex: 1,
              isCircular: false,
              direction: 'left',
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
                  isPrevious: true,
                  hasBeenActiveBefore: false,
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
            });

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

          assertLastSubscriber(subscriber, {
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
          });

          expect(removedValue).toBe('a');
        });

        test('removing from the middle', () => {
          const { activeContent, subscriber } = setup({
            activeIndexes: [0, 1, 2],
            maxActivationLimit: false,
          });

          const removedValue = activeContent.removeByIndex(1);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(subscriber, {
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
          });

          expect(removedValue).toBe('b');
        });

        test('removing from the end', () => {
          const { activeContent, subscriber } = setup({
            activeIndexes: [0, 1, 2],
            maxActivationLimit: false,
          });

          const removedValue = activeContent.pop();

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(subscriber, {
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
          });

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

        activeContent.contents[1].remove({ isUserInteraction: false });

        expect(activeContent.removeByIndex).toHaveBeenCalledTimes(1);
        expect(activeContent.removeByIndex).toHaveBeenCalledWith(1, {
          isUserInteraction: false,
        });
      });

      test('remove on item after another removal', () => {
        const { activeContent } = setup();

        jest.spyOn(activeContent, 'removeByIndex');

        activeContent.shift();

        activeContent.contents[0].remove({ isUserInteraction: false });

        expect(activeContent.removeByIndex).toHaveBeenCalledTimes(2);
        expect(activeContent.removeByIndex).toHaveBeenLastCalledWith(0, {
          isUserInteraction: false,
        });

        expect(activeContent.contents.map((c) => c.value)).toEqual(['c']);
      });
    });

    describe('removing with predicate', () => {
      describe('when maxActivationLimit is 1', () => {
        test('all removal', () => {
          const { activeContent, subscriber } = setup({ activeIndexes: 0 });

          const removed = activeContent.removeByPredicate(() => true);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(subscriber, {
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
          });

          expect(removed).toEqual(['a', 'b', 'c']);
        });

        describe('predicate matches one element', () => {
          describe('removing inactive element', () => {
            test('start removal', () => {
              const { activeContent, subscriber } = setup({ activeIndexes: 1 });

              const removed = activeContent.removeByPredicate(
                (item) => item === 'a'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(subscriber, {
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
              });

              expect(removed).toEqual(['a']);
            });

            test('middle removal', () => {
              const { activeContent, subscriber } = setup({ activeIndexes: 0 });

              const removed = activeContent.removeByPredicate(
                (item) => item === 'b'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(subscriber, {
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
              });

              expect(removed).toEqual(['b']);
            });

            test('end removal', () => {
              const { activeContent, subscriber } = setup({ activeIndexes: 0 });

              const removed = activeContent.removeByPredicate(
                (item) => item === 'c'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(subscriber, {
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
              });

              expect(removed).toEqual(['c']);
            });
          });

          describe('removing active element', () => {
            test('start removal', () => {
              const { activeContent, subscriber } = setup({ activeIndexes: 0 });

              const removed = activeContent.removeByPredicate(
                (item) => item === 'a'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(subscriber, {
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
              });

              expect(removed).toEqual(['a']);
            });

            test('middle removal', () => {
              const { activeContent, subscriber } = setup({ activeIndexes: 1 });

              const removed = activeContent.removeByPredicate(
                (item) => item === 'b'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(subscriber, {
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
              });

              expect(removed).toEqual(['b']);
            });

            test('end removal', () => {
              const { activeContent, subscriber } = setup({ activeIndexes: 2 });

              const removed = activeContent.removeByPredicate(
                (item) => item === 'c'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(subscriber, {
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
              });

              expect(removed).toEqual(['c']);
            });
          });
        });

        describe('predicate matches multiple element', () => {
          describe('removing inactive elements', () => {
            test('start removal', () => {
              const { activeContent, subscriber } = setup({ activeIndexes: 2 });

              const removed = activeContent.removeByPredicate(
                (item) => item === 'a' || item === 'b'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(subscriber, {
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
              });

              expect(removed).toEqual(['a', 'b']);
            });

            test('middle removal #0', () => {
              const { activeContent, subscriber } = setup(
                { activeIndexes: 0 },
                ['a', 'b', 'c', 'd']
              );

              const removed = activeContent.removeByPredicate(
                (item) => item === 'b' || item === 'c'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(subscriber, {
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
              });

              expect(removed).toEqual(['b', 'c']);
            });

            test('middle removal #3', () => {
              const { activeContent, subscriber } = setup(
                { activeIndexes: 3 },
                ['a', 'b', 'c', 'd']
              );

              const removed = activeContent.removeByPredicate(
                (item) => item === 'b' || item === 'c'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(subscriber, {
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
              });

              expect(removed).toEqual(['b', 'c']);
            });

            test('middle with holes removal #0', () => {
              const { activeContent, subscriber } = setup(
                { activeIndexes: 0 },
                ['a', 'b', 'c', 'd', 'e']
              );

              const removed = activeContent.removeByPredicate(
                (item) => item === 'b' || item === 'd'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(subscriber, {
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
              });

              expect(removed).toEqual(['b', 'd']);
            });

            test('middle with holes removal #2', () => {
              const { activeContent, subscriber } = setup(
                { activeIndexes: 2 },
                ['a', 'b', 'c', 'd', 'e']
              );

              const removed = activeContent.removeByPredicate(
                (item) => item === 'b' || item === 'd'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(subscriber, {
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
              });

              expect(removed).toEqual(['b', 'd']);
            });

            test('middle with holes removal #4', () => {
              const { activeContent, subscriber } = setup(
                { activeIndexes: 4 },
                ['a', 'b', 'c', 'd', 'e']
              );

              const removed = activeContent.removeByPredicate(
                (item) => item === 'b' || item === 'd'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(subscriber, {
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
              });

              expect(removed).toEqual(['b', 'd']);
            });

            test('end removal', () => {
              const { activeContent, subscriber } = setup({ activeIndexes: 0 });

              const removed = activeContent.removeByPredicate(
                (item, index) => index > 0
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(subscriber, {
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
              });

              expect(removed).toEqual(['b', 'c']);
            });
          });

          describe('removing active elements', () => {
            test('start removal #0', () => {
              const { activeContent, subscriber } = setup({ activeIndexes: 0 });

              const removed = activeContent.removeByPredicate(
                (item) => item === 'a' || item === 'b'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(subscriber, {
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
              });

              expect(removed).toEqual(['a', 'b']);
            });

            test('start removal #1', () => {
              const { activeContent, subscriber } = setup({ activeIndexes: 1 });

              const removed = activeContent.removeByPredicate(
                (item) => item === 'a' || item === 'b'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(subscriber, {
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
              });

              expect(removed).toEqual(['a', 'b']);
            });

            test('middle removal #1', () => {
              const { activeContent, subscriber } = setup(
                { activeIndexes: 1 },
                ['a', 'b', 'c', 'd']
              );

              const removed = activeContent.removeByPredicate(
                (item) => item === 'b' || item === 'c'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(subscriber, {
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
              });

              expect(removed).toEqual(['b', 'c']);
            });

            test('middle removal #2', () => {
              const { activeContent, subscriber } = setup(
                { activeIndexes: 2 },
                ['a', 'b', 'c', 'd']
              );

              const removed = activeContent.removeByPredicate(
                (item) => item === 'b' || item === 'c'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(subscriber, {
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
              });

              expect(removed).toEqual(['b', 'c']);
            });

            test('middle with holes removal #1', () => {
              const { activeContent, subscriber } = setup(
                { activeIndexes: 1 },
                ['a', 'b', 'c', 'd', 'e']
              );

              const removed = activeContent.removeByPredicate(
                (item) => item === 'b' || item === 'd'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(subscriber, {
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
              });

              expect(removed).toEqual(['b', 'd']);
            });

            test('middle with holes removal #3', () => {
              const { activeContent, subscriber } = setup(
                { activeIndexes: 3 },
                ['a', 'b', 'c', 'd', 'e']
              );

              const removed = activeContent.removeByPredicate(
                (item) => item === 'b' || item === 'd'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(subscriber, {
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
              });

              expect(removed).toEqual(['b', 'd']);
            });

            test('end removal', () => {
              const { activeContent, subscriber } = setup({ activeIndexes: 2 });

              const removed = activeContent.removeByPredicate(
                (item, index) => index > 0
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(subscriber, {
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
              });

              expect(removed).toEqual(['b', 'c']);
            });
          });
        });

        test('when no predicate matches do nothing', () => {
          const { activeContent, subscriber } = setup({ activeIndexes: 0 });

          const removed = activeContent.removeByPredicate(
            (item) => item === 'y'
          );

          expect(subscriber).toHaveBeenCalledTimes(0);

          expect(removed).toEqual([]);
        });

        test('when content is already empty do nothing', () => {
          const { activeContent, subscriber } = setup({}, []);

          const removed = activeContent.removeByPredicate(
            (item) => item === 'y'
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

          assertLastSubscriber(subscriber, {
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
          });

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
                (item) => item === 'a'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(subscriber, {
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
              });

              expect(removed).toEqual(['a']);
            });

            test('middle removal', () => {
              const { activeContent, subscriber } = setup({
                maxActivationLimit: false,
                activeIndexes: [],
              });

              const removed = activeContent.removeByPredicate(
                (item) => item === 'b'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(subscriber, {
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
              });

              expect(removed).toEqual(['b']);
            });

            test('end removal', () => {
              const { activeContent, subscriber } = setup({
                maxActivationLimit: false,
                activeIndexes: [],
              });

              const removed = activeContent.removeByPredicate(
                (item) => item === 'c'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(subscriber, {
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
              });

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
                (item) => item === 'a'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(subscriber, {
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
              });

              expect(removed).toEqual(['a']);
            });

            test('middle removal', () => {
              const { activeContent, subscriber } = setup({
                maxActivationLimit: false,
                activeIndexes: [0, 1, 2],
              });

              const removed = activeContent.removeByPredicate(
                (item) => item === 'b'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(subscriber, {
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
              });

              expect(removed).toEqual(['b']);
            });

            test('end removal', () => {
              const { activeContent, subscriber } = setup({
                maxActivationLimit: false,
                activeIndexes: [0, 1, 2],
              });

              const removed = activeContent.removeByPredicate(
                (item) => item === 'c'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(subscriber, {
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
              });

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
                (item) => item === 'a' || item === 'b'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(subscriber, {
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
              });

              expect(removed).toEqual(['a', 'b']);
            });

            test('middle removal', () => {
              const { activeContent, subscriber } = setup(
                { maxActivationLimit: false, activeIndexes: [] },
                ['a', 'b', 'c', 'd']
              );

              const removed = activeContent.removeByPredicate(
                (item) => item === 'b' || item === 'c'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(subscriber, {
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
              });

              expect(removed).toEqual(['b', 'c']);
            });

            test('middle with holes removal', () => {
              const { activeContent, subscriber } = setup(
                { maxActivationLimit: false, activeIndexes: [] },
                ['a', 'b', 'c', 'd', 'e']
              );

              const removed = activeContent.removeByPredicate(
                (item) => item === 'b' || item === 'd'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(subscriber, {
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
              });

              expect(removed).toEqual(['b', 'd']);
            });

            test('end removal', () => {
              const { activeContent, subscriber } = setup({
                maxActivationLimit: false,
                activeIndexes: [],
              });

              const removed = activeContent.removeByPredicate(
                (item, index) => index > 0
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(subscriber, {
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
              });

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
                (item) => item === 'a' || item === 'b'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(subscriber, {
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
              });

              expect(removed).toEqual(['a', 'b']);
            });

            test('start removal #1', () => {
              const { activeContent, subscriber } = setup({
                maxActivationLimit: false,
                activeIndexes: [0, 1],
              });

              const removed = activeContent.removeByPredicate(
                (item) => item === 'a' || item === 'b'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(subscriber, {
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
              });

              expect(removed).toEqual(['a', 'b']);
            });

            test('middle removal #0', () => {
              const { activeContent, subscriber } = setup(
                { maxActivationLimit: false, activeIndexes: [0, 1] },
                ['a', 'b', 'c', 'd']
              );

              const removed = activeContent.removeByPredicate(
                (item) => item === 'b' || item === 'c'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(subscriber, {
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
              });

              expect(removed).toEqual(['b', 'c']);
            });

            test('middle removal #1', () => {
              const { activeContent, subscriber } = setup(
                { maxActivationLimit: false, activeIndexes: [2, 3] },
                ['a', 'b', 'c', 'd']
              );

              const removed = activeContent.removeByPredicate(
                (item) => item === 'b' || item === 'c'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(subscriber, {
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
              });

              expect(removed).toEqual(['b', 'c']);
            });

            test('middle with holes removal #0', () => {
              const { activeContent, subscriber } = setup(
                { maxActivationLimit: false, activeIndexes: [0, 1, 2] },
                ['a', 'b', 'c', 'd', 'e']
              );

              const removed = activeContent.removeByPredicate(
                (item) => item === 'b' || item === 'd'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(subscriber, {
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
              });

              expect(removed).toEqual(['b', 'd']);
            });

            test('middle with holes removal #1', () => {
              const { activeContent, subscriber } = setup(
                { maxActivationLimit: false, activeIndexes: [2, 3, 4] },
                ['a', 'b', 'c', 'd', 'e']
              );

              const removed = activeContent.removeByPredicate(
                (item) => item === 'b' || item === 'd'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(subscriber, {
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
              });

              expect(removed).toEqual(['b', 'd']);
            });

            test('end removal', () => {
              const { activeContent, subscriber } = setup({
                maxActivationLimit: false,
                activeIndexes: [0, 1, 2],
              });

              const removed = activeContent.removeByPredicate(
                (item, index) => index > 0
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(subscriber, {
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
              });

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
            (item) => item === 'y'
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
            (item) => item === 'y'
          );

          expect(subscriber).toHaveBeenCalledTimes(0);

          expect(activeContent.hasActiveChangedAtLeastOnce).toBe(false);

          expect(removed).toEqual([]);
        });
      });
    });

    describe('all methods pass along activationOptions', () => {
      test('removeByIndex', () => {
        const { activeContent } = setup({ activeIndexes: 0 });

        jest.spyOn(activeContent, 'activatePrevious');

        activeContent.removeByIndex(0, {
          cooldown: 1337,
          isUserInteraction: false,
        });

        expect(activeContent.activatePrevious).toBeCalledTimes(1);
        expect(activeContent.activatePrevious).toBeCalledWith({
          cooldown: 1337,
          isUserInteraction: false,
        });
      });

      test('remove', () => {
        const { activeContent } = setup({ activeIndexes: 0 });

        jest.spyOn(activeContent, 'activatePrevious');

        activeContent.remove('a', {
          cooldown: 1337,
          isUserInteraction: false,
        });

        expect(activeContent.activatePrevious).toBeCalledTimes(1);
        expect(activeContent.activatePrevious).toBeCalledWith({
          cooldown: 1337,
          isUserInteraction: false,
        });
      });

      test('pop', () => {
        const { activeContent } = setup({ activeIndexes: 2 });

        jest.spyOn(activeContent, 'activatePrevious');

        activeContent.pop({ cooldown: 1337, isUserInteraction: false });

        expect(activeContent.activatePrevious).toBeCalledTimes(1);
        expect(activeContent.activatePrevious).toBeCalledWith({
          cooldown: 1337,
          isUserInteraction: false,
        });
      });

      test('shift', () => {
        const { activeContent } = setup({ activeIndexes: 0 });

        jest.spyOn(activeContent, 'activatePrevious');

        activeContent.shift({ cooldown: 1337, isUserInteraction: false });

        expect(activeContent.activatePrevious).toBeCalledTimes(1);
        expect(activeContent.activatePrevious).toBeCalledWith({
          cooldown: 1337,
          isUserInteraction: false,
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
              'uiloos > ActiveContent.swapByIndex > could not swap: index a out of bounds'
            );

            expect(subscriber).toHaveBeenCalledTimes(0);
          });

          test('throws out of bounds when index is less than zero', () => {
            const { activeContent, subscriber } = setup();

            expect(() => {
              activeContent.swapByIndex(-1, 0);
            }).toThrowError(
              'uiloos > ActiveContent.swapByIndex > could not swap: index a out of bounds'
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
              'uiloos > ActiveContent.swapByIndex > could not swap: index b out of bounds'
            );

            expect(subscriber).toHaveBeenCalledTimes(0);
          });

          test('throws out of bounds when index is less than zero', () => {
            const { activeContent, subscriber } = setup();

            expect(() => {
              activeContent.swapByIndex(0, -1);
            }).toThrowError(
              'uiloos > ActiveContent.swapByIndex > could not swap: index b out of bounds'
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

          assertLastSubscriber(subscriber, {
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
          });
        });

        test('swapping to the active index should not affect it', () => {
          const { activeContent, subscriber } = setup({ active: 'b' });

          // Swap c with b
          activeContent.swapByIndex(2, 1);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(subscriber, {
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
          });
        });

        test('swapping non active index should not affect the active index', () => {
          const { activeContent, subscriber } = setup({ active: 'b' });

          // Swap a with c
          activeContent.swapByIndex(0, 2);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(subscriber, {
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
          });
        });

        test('swapping when circular should fix previous and next', () => {
          const { activeContent, subscriber } = setup({
            active: 'b',
            isCircular: true,
          });

          // Swap a with c
          activeContent.swapByIndex(0, 2);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(subscriber, {
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
          });
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

          assertLastSubscriber(subscriber, {
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
          });
        });

        test('swapping to the active index should not affect it', () => {
          const { activeContent, subscriber } = setup({
            maxActivationLimit: false,
            active: ['b', 'a'],
          });

          // Swap c with b
          activeContent.swapByIndex(2, 1);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(subscriber, {
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
          });
        });

        test('swapping non active index should not affect the active index', () => {
          const { activeContent, subscriber } = setup(
            { maxActivationLimit: false, active: ['b', 'c'] },
            ['a', 'b', 'c', 'd']
          );

          // Swap a with d
          activeContent.swapByIndex(0, 3);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(subscriber, {
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
          });
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

          assertLastSubscriber(subscriber, {
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
          });
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

      assertLastSubscriber(subscriber, {
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
      });
    });

    describe('Content methods', () => {
      test('swapWith', () => {
        const { activeContent, subscriber } = setup({ active: 'b' });

        // Swap b with c
        activeContent.contents[1].swapWith('c');

        expect(subscriber).toHaveBeenCalledTimes(1);

        assertLastSubscriber(subscriber, {
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
        });
      });

      test('swapWithByIndex', () => {
        const { activeContent, subscriber } = setup({ active: 'b' });

        // Swap b with c
        activeContent.contents[1].swapWithByIndex(2);

        expect(subscriber).toHaveBeenCalledTimes(1);

        assertLastSubscriber(subscriber, {
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
        });
      });

      test('swapWithNext', () => {
        const { activeContent, subscriber } = setup({ active: 'b' });

        // Swap b with c
        activeContent.contents[1].swapWithNext();

        expect(subscriber).toHaveBeenCalledTimes(1);

        assertLastSubscriber(subscriber, {
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
        });
      });

      test('swapWithPrevious', () => {
        const { activeContent, subscriber } = setup({ active: 'b' });

        // Swap b with a
        activeContent.contents[1].swapWithPrevious();

        expect(subscriber).toHaveBeenCalledTimes(1);

        assertLastSubscriber(subscriber, {
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
        });
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
              'uiloos > ActiveContent.moveByIndex > could not swap: index "from" out of bounds'
            );

            expect(subscriber).toHaveBeenCalledTimes(0);
          });

          test('throws out of bounds when index is less than zero', () => {
            const { activeContent, subscriber } = setup();

            expect(() => {
              activeContent.moveByIndex(-1, 0);
            }).toThrowError(
              'uiloos > ActiveContent.moveByIndex > could not swap: index "from" out of bounds'
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
              'uiloos > ActiveContent.moveByIndex > could not swap: index "to" out of bounds'
            );

            expect(subscriber).toHaveBeenCalledTimes(0);
          });

          test('throws out of bounds when index is less than zero', () => {
            const { activeContent, subscriber } = setup();

            expect(() => {
              activeContent.moveByIndex(0, -1);
            }).toThrowError(
              'uiloos > ActiveContent.moveByIndex > could not swap: index "to" out of bounds'
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

          assertLastSubscriber(subscriber, {
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
          });
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

          assertLastSubscriber(subscriber, {
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
          });
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

          assertLastSubscriber(subscriber, {
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
          });
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

          assertLastSubscriber(subscriber, {
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
          });
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

          assertLastSubscriber(subscriber, {
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
          });
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

          assertLastSubscriber(subscriber, {
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
          });
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

          assertLastSubscriber(subscriber, {
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
          });
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

          assertLastSubscriber(subscriber, {
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
          });
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

          assertLastSubscriber(subscriber, {
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
          });
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

          assertLastSubscriber(subscriber, {
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
          });
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

          assertLastSubscriber(subscriber, {
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
          });
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

          assertLastSubscriber(subscriber, {
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
          });
        });

        test('moving when circular should fix previous and next', () => {
          const { activeContent, subscriber } = setup({
            active: 'b',
            isCircular: true,
          });

          // Move a beyond c
          activeContent.moveByIndex(0, 2);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(subscriber, {
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
          });
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

          assertLastSubscriber(subscriber, {
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
          });
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

          assertLastSubscriber(subscriber, {
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
          });
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

          assertLastSubscriber(subscriber, {
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
          });
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

          assertLastSubscriber(subscriber, {
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
          });
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

          assertLastSubscriber(subscriber, {
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
          });
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

          assertLastSubscriber(subscriber, {
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
          });
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

          assertLastSubscriber(subscriber, {
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
          });
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

          assertLastSubscriber(subscriber, {
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
          });
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

          assertLastSubscriber(subscriber, {
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
          });
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

          assertLastSubscriber(subscriber, {
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
          });
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

          assertLastSubscriber(subscriber, {
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
          });
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

          assertLastSubscriber(subscriber, {
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
          });
        });

        test('moving from lastActivatedIndex to last', () => {
          const { activeContent, subscriber } = setup(
            {
              maxActivationLimit: false,
              active: ['a', 'g', 'e', 'c', 'f', 'b', 'D'],
            },
            ['a', 'b', 'c', 'D', 'e', 'f', 'g']
          );

          // Move D before a
          activeContent.moveByIndex(3, 6);

          const expected = ['a', 'b', 'c', 'e', 'f', 'g', 'D'];
          expect(activeContent.contents.map((c) => c.value)).toEqual(expected);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(subscriber, {
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
          });
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

          assertLastSubscriber(subscriber, {
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
          });
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

      assertLastSubscriber(subscriber, {
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
      });
    });

    describe('moveByIndexAtPredicate', () => {
      describe('moving first item', () => {
        test('move to first should do nothing', () => {
          const { activeContent, subscriber } = setup({ active: 'b' });

          activeContent.moveByIndexAtPredicate(
            0,
            (item, index) => item === 'a' && index === 0
          );

          expect(subscriber).toHaveBeenCalledTimes(0);
        });

        test('move to middle', () => {
          const { activeContent, subscriber } = setup({ active: 'b' });

          activeContent.moveByIndexAtPredicate(
            0,
            (item, index) => item === 'b' && index === 1
          );

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(subscriber, {
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
          });
        });

        test('move to last', () => {
          const { activeContent, subscriber } = setup({ active: 'b' });

          activeContent.moveByIndexAtPredicate(
            0,
            (item, index) => item === 'c' && index === 2
          );

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(subscriber, {
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
          });
        });
      });

      describe('moving middle item', () => {
        test('move to first', () => {
          const { activeContent, subscriber } = setup({ active: 'b' });

          activeContent.moveByIndexAtPredicate(
            1,
            (item, index) => item === 'a' && index === 0
          );

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(subscriber, {
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
          });
        });

        test('move to middle, should do nothing', () => {
          const { activeContent, subscriber } = setup({ active: 'b' });

          activeContent.moveByIndexAtPredicate(
            1,
            (item, index) => item === 'b' && index === 1
          );

          expect(subscriber).toHaveBeenCalledTimes(0);
        });

        test('move to last', () => {
          const { activeContent, subscriber } = setup({ active: 'b' });

          activeContent.moveByIndexAtPredicate(
            1,
            (item, index) => item === 'c' && index === 2
          );

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(subscriber, {
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
          });
        });
      });

      describe('moving last item', () => {
        test('move to first', () => {
          const { activeContent, subscriber } = setup({ active: 'b' });

          activeContent.moveByIndexAtPredicate(
            2,
            (item, index) => item === 'a' && index === 0
          );

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(subscriber, {
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
          });
        });

        test('move to middle', () => {
          const { activeContent, subscriber } = setup({ active: 'b' });

          activeContent.moveByIndexAtPredicate(
            2,
            (item, index) => item === 'b' && index === 1
          );

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(subscriber, {
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
          });
        });

        test('move to last, should do nothing', () => {
          const { activeContent, subscriber } = setup({ active: 'b' });

          activeContent.moveByIndexAtPredicate(
            2,
            (item, index) => item === 'c' && index === 2
          );

          expect(subscriber).toHaveBeenCalledTimes(0);
        });
      });

      test('when no predicate matches do nothing', () => {
        const { activeContent, subscriber } = setup({ active: 'b' });

        activeContent.moveByIndexAtPredicate(0, (item) => item === 'z');

        expect(subscriber).toHaveBeenCalledTimes(0);
      });
    });

    describe('moveByIndexBeforePredicate', () => {
      describe('moving first item', () => {
        test('move to before first should do nothing', () => {
          const { activeContent, subscriber } = setup({ active: 'b' });

          activeContent.moveByIndexBeforePredicate(
            0,
            (item, index) => item === 'a' && index === 0
          );

          expect(subscriber).toHaveBeenCalledTimes(0);
        });

        test('move to before middle should do nothing', () => {
          const { activeContent, subscriber } = setup({ active: 'b' });

          activeContent.moveByIndexBeforePredicate(
            0,
            (item, index) => item === 'b' && index === 1
          );

          expect(subscriber).toHaveBeenCalledTimes(0);
        });

        test('move to before last', () => {
          const { activeContent, subscriber } = setup({ active: 'b' });

          activeContent.moveByIndexBeforePredicate(
            0,
            (item, index) => item === 'c' && index === 2
          );

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(subscriber, {
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
          });
        });
      });

      describe('moving middle item', () => {
        test('move to before first', () => {
          const { activeContent, subscriber } = setup({ active: 'b' });

          activeContent.moveByIndexBeforePredicate(
            1,
            (item, index) => item === 'a' && index === 0
          );

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(subscriber, {
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
          });
        });

        test('move to before middle', () => {
          const { activeContent, subscriber } = setup({ active: 'b' });

          activeContent.moveByIndexBeforePredicate(
            1,
            (item, index) => item === 'b' && index === 1
          );

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(subscriber, {
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
          });
        });

        test('move to before last, should do nothing', () => {
          const { activeContent, subscriber } = setup({ active: 'b' });

          activeContent.moveByIndexBeforePredicate(
            1,
            (item, index) => item === 'c' && index === 2
          );

          expect(subscriber).toHaveBeenCalledTimes(0);
        });
      });

      describe('moving last item', () => {
        test('move to before first', () => {
          const { activeContent, subscriber } = setup({ active: 'b' });

          activeContent.moveByIndexBeforePredicate(
            2,
            (item, index) => item === 'a' && index === 0
          );

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(subscriber, {
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
          });
        });

        test('move to before middle', () => {
          const { activeContent, subscriber } = setup({ active: 'b' });

          activeContent.moveByIndexBeforePredicate(
            2,
            (item, index) => item === 'b' && index === 1
          );

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(subscriber, {
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
          });
        });

        test('move to before last', () => {
          const { activeContent, subscriber } = setup({ active: 'b' });

          activeContent.moveByIndexBeforePredicate(
            2,
            (item, index) => item === 'c' && index === 2
          );

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(subscriber, {
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
          });
        });
      });

      test('when no predicate matches do nothing', () => {
        const { activeContent, subscriber } = setup({ active: 'b' });

        activeContent.moveByIndexBeforePredicate(0, (item) => item === 'z');

        expect(subscriber).toHaveBeenCalledTimes(0);
      });
    });

    describe('moveByIndexAfterPredicate', () => {
      describe('moving first item', () => {
        test('move to after first', () => {
          const { activeContent, subscriber } = setup({ active: 'b' });

          activeContent.moveByIndexAfterPredicate(
            0,
            (item, index) => item === 'a' && index === 0
          );

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(subscriber, {
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
          });
        });

        test('move to after middle', () => {
          const { activeContent, subscriber } = setup({ active: 'b' });

          activeContent.moveByIndexAfterPredicate(
            0,
            (item, index) => item === 'b' && index === 1
          );

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(subscriber, {
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
          });
        });

        test('move to after last', () => {
          const { activeContent, subscriber } = setup({ active: 'b' });

          activeContent.moveByIndexAfterPredicate(
            0,
            (item, index) => item === 'c' && index === 2
          );

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(subscriber, {
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
          });
        });
      });

      describe('moving middle item', () => {
        test('move to after first should do nothing', () => {
          const { activeContent, subscriber } = setup({ active: 'b' });

          activeContent.moveByIndexAfterPredicate(
            1,
            (item, index) => item === 'a' && index === 0
          );

          expect(subscriber).toHaveBeenCalledTimes(0);
        });

        test('move to after middle', () => {
          const { activeContent, subscriber } = setup({ active: 'b' });

          activeContent.moveByIndexAfterPredicate(
            1,
            (item, index) => item === 'b' && index === 1
          );

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(subscriber, {
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
          });
        });

        test('move to after last', () => {
          const { activeContent, subscriber } = setup({ active: 'b' });

          activeContent.moveByIndexAfterPredicate(
            1,
            (item, index) => item === 'c' && index === 2
          );

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(subscriber, {
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
          });
        });
      });

      describe('moving last item', () => {
        test('move to after first', () => {
          const { activeContent, subscriber } = setup({ active: 'b' });

          activeContent.moveByIndexAfterPredicate(
            2,
            (item, index) => item === 'a' && index === 0
          );

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(subscriber, {
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
          });
        });

        test('move to after middle should do nothing', () => {
          const { activeContent, subscriber } = setup({ active: 'b' });

          activeContent.moveByIndexAfterPredicate(
            2,
            (item, index) => item === 'b' && index === 1
          );

          expect(subscriber).toHaveBeenCalledTimes(0);
        });

        test('move to after last should do nothing', () => {
          const { activeContent, subscriber } = setup({ active: 'b' });

          activeContent.moveByIndexAfterPredicate(
            2,
            (item, index) => item === 'c' && index === 2
          );

          expect(subscriber).toHaveBeenCalledTimes(0);
        });
      });

      test('when no predicate matches do nothing', () => {
        const { activeContent, subscriber } = setup({ active: 'b' });

        activeContent.moveByIndexAfterPredicate(0, (item) => item === 'z');

        expect(subscriber).toHaveBeenCalledTimes(0);
      });
    });

    describe('moveAtPredicate', () => {
      test('when predicate matches perform move', () => {
        const { activeContent, subscriber } = setup({ active: 'b' });

        activeContent.moveAtPredicate(
          'a',
          (item, index) => item === 'b' && index === 1
        );

        expect(subscriber).toHaveBeenCalledTimes(1);

        assertLastSubscriber(subscriber, {
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
        });
      });

      test('when no predicate matches do nothing', () => {
        const { activeContent, subscriber } = setup({ active: 'b' });

        activeContent.moveAtPredicate('a', (item) => item === 'z');

        expect(subscriber).toHaveBeenCalledTimes(0);
      });

      test('when item is not found throw error', () => {
        const { activeContent } = setup({ active: 'b' });

        expect(() =>
          activeContent.moveAtPredicate('y', (item) => item === 'z')
        ).toThrowError(
          'uiloos > ActiveContent.getIndex could not get index for item. Item not in contents array'
        );
      });
    });

    describe('moveBeforePredicate', () => {
      test('when predicate matches perform move', () => {
        const { activeContent, subscriber } = setup({ active: 'b' });

        activeContent.moveBeforePredicate(
          'a',
          (item, index) => item === 'c' && index === 2
        );

        expect(subscriber).toHaveBeenCalledTimes(1);

        assertLastSubscriber(subscriber, {
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
        });
      });

      test('when no predicate matches do nothing', () => {
        const { activeContent, subscriber } = setup({ active: 'b' });

        activeContent.moveBeforePredicate('a', (item) => item === 'z');

        expect(subscriber).toHaveBeenCalledTimes(0);
      });

      test('when item is not found throw error', () => {
        const { activeContent } = setup({ active: 'b' });

        expect(() =>
          activeContent.moveBeforePredicate('y', (item) => item === 'z')
        ).toThrowError(
          'uiloos > ActiveContent.getIndex could not get index for item. Item not in contents array'
        );
      });
    });

    describe('moveAfterPredicate', () => {
      test('when predicate matches perform move', () => {
        const { activeContent, subscriber } = setup({ active: 'b' });

        activeContent.moveAfterPredicate(
          'a',
          (item, index) => item === 'a' && index === 0
        );

        expect(subscriber).toHaveBeenCalledTimes(1);

        assertLastSubscriber(subscriber, {
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
        });
      });

      test('when no predicate matches do nothing', () => {
        const { activeContent, subscriber } = setup({ active: 'b' });

        activeContent.moveAfterPredicate('a', (item) => item === 'z');

        expect(subscriber).toHaveBeenCalledTimes(0);
      });

      test('when item is not found throw error', () => {
        const { activeContent } = setup({ active: 'b' });

        expect(() =>
          activeContent.moveAfterPredicate('y', (item) => item === 'z')
        ).toThrowError(
          'uiloos > ActiveContent.getIndex could not get index for item. Item not in contents array'
        );
      });
    });

    describe('Content methods', () => {
      test('moveToIndex', () => {
        const { activeContent, subscriber } = setup({ active: 'a' });

        // Move a beyond c
        activeContent.contents[0].moveToIndex(2);

        expect(subscriber).toHaveBeenCalledTimes(1);

        assertLastSubscriber(subscriber, {
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
        });
      });

      test('moveToAtPredicate', () => {
        const { activeContent, subscriber } = setup({ active: 'b' });

        activeContent.contents[0].moveToAtPredicate(
          (item, index) => item === 'b' && index === 1
        );

        expect(subscriber).toHaveBeenCalledTimes(1);

        assertLastSubscriber(subscriber, {
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
        });
      });

      test('moveToBeforePredicate', () => {
        const { activeContent, subscriber } = setup({ active: 'b' });

        activeContent.contents[0].moveToBeforePredicate(
          (item, index) => item === 'c' && index === 2
        );

        expect(subscriber).toHaveBeenCalledTimes(1);

        assertLastSubscriber(subscriber, {
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
        });
      });

      test('moveToAfterPredicate', () => {
        const { activeContent, subscriber } = setup({ active: 'a' });

        // Move a beyond c
        activeContent.contents[0].moveToAfterPredicate(
          (item, index) => item === 'c' && index === 2
        );

        expect(subscriber).toHaveBeenCalledTimes(1);

        assertLastSubscriber(subscriber, {
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
        });
      });

      describe('moveToFirst', () => {
        test('moving from the active index should not affect it', () => {
          const { activeContent, subscriber } = setup({ active: 'a' });

          // Move c before a
          activeContent.contents[2].moveToFirst();

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(subscriber, {
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
          });
        });

        test('moving to the active index should not affect it', () => {
          const { activeContent, subscriber } = setup({ active: 'b' });

          // Move b before a
          activeContent.contents[1].moveToFirst();

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(subscriber, {
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
          });
        });
      });

      describe('moveToLast', () => {
        test('moving from the active index should not affect it', () => {
          const { activeContent, subscriber } = setup({ active: 'a' });

          // Move a beyond c
          activeContent.contents[0].moveToLast();

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(subscriber, {
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
          });
        });

        test('moving to the active index should not affect it', () => {
          const { activeContent, subscriber } = setup({ active: 'b' });

          // Move b beyond c
          activeContent.contents[1].moveToLast();

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(subscriber, {
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
          });
        });
      });
    });
  });

  describe('autoplay', () => {
    describe('interval errors', () => {
      test('cannot be less than zero', () => {
        const autoplay = { interval: -1 };

        expect(() => {
          setup({ autoplay });
        }).toThrowError(
          'uiloos > ActiveContent.autoplay interval cannot be negative or zero'
        );
      });

      test('cannot be zero', () => {
        const autoplay = { interval: 0 };

        expect(() => {
          setup({ autoplay });
        }).toThrowError(
          'uiloos > ActiveContent.autoplay interval cannot be negative or zero'
        );
      });
    });

    describe('effect of maxActivationLimit', () => {
      test('when maxActivationLimit is 1', () => {
        jest.useFakeTimers();

        const autoplay = { interval: 200 };
        const { activeContent } = setup({
          active: [],
          maxActivationLimit: 1,
          autoplay,
          isCircular: false,
        });

        expect(activeContent.active).toEqual([]);

        jest.advanceTimersByTime(200);
        expect(activeContent.active).toEqual(['a']);

        jest.advanceTimersByTime(200);
        expect(activeContent.active).toEqual(['b']);

        jest.advanceTimersByTime(200);
        expect(activeContent.active).toEqual(['c']);
      });

      test('when maxActivationLimit is N', () => {
        jest.useFakeTimers();

        const autoplay = { interval: 200 };
        const { activeContent } = setup({
          maxActivationLimit: 2,
          autoplay,
          isCircular: false,
        });

        expect(activeContent.active).toEqual([]);

        jest.advanceTimersByTime(200);
        expect(activeContent.active).toEqual(['a']);

        jest.advanceTimersByTime(200);
        expect(activeContent.active).toEqual(['a', 'b']);

        jest.advanceTimersByTime(200);
        expect(activeContent.active).toEqual(['b', 'c']);
      });

      test('when maxActivationLimit is false', () => {
        jest.useFakeTimers();

        const autoplay = { interval: 200 };
        const { activeContent } = setup({
          maxActivationLimit: false,
          autoplay,
          isCircular: false,
        });

        expect(activeContent.active).toEqual([]);

        jest.advanceTimersByTime(200);
        expect(activeContent.active).toEqual(['a']);

        jest.advanceTimersByTime(200);
        expect(activeContent.active).toEqual(['a', 'b']);

        jest.advanceTimersByTime(200);
        expect(activeContent.active).toEqual(['a', 'b', 'c']);
      });
    });

    describe('end of content behavior', () => {
      test('goes to the next item after interval and wraps around correctly when circular', () => {
        jest.useFakeTimers();

        const autoplay = { interval: 200 };
        const { activeContent } = setup({
          autoplay,
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

      test('stops the interval at the last item when not circular', () => {
        jest.useFakeTimers();

        const autoplay = { interval: 200 };
        const { activeContent } = setup({
          autoplay,
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

        activeContent.configureAutoplay({ interval: 200 });

        jest.advanceTimersByTime(200);

        expect(activeContent.active).toEqual(['b']);
      });

      test('that autoplay can be deactivated by the user', () => {
        jest.useFakeTimers();

        const autoplay = { interval: 200 };
        const { activeContent } = setup({
          autoplay,
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

      const autoplay = { interval: 200, stopsOnUserInteraction: true };
      const { activeContent } = setup({
        autoplay,
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

      const autoplay = { interval: 200, stopsOnUserInteraction: true };
      const { activeContent } = setup({
        autoplay,
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

      const autoplay = { interval: 200 };
      const { activeContent } = setup({
        autoplay,
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

    test('that the interval can be a function instead of just a number', () => {
      jest.useFakeTimers();

      const autoplay = {
        interval: (_item: string, index: number) => (index + 1) * 100,
        stopsOnUserInteraction: false,
      };
      const { activeContent } = setup({
        autoplay,
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

      const autoplay = {
        interval: (_item: string, index: number) => (index + 1) * 100,
        stopsOnUserInteraction: false,
      };
      const { activeContent } = setup({
        autoplay,
        isCircular: true,
        activeIndexes: 0,
      });

      expect(activeContent.active).toEqual(['a']);

      jest.advanceTimersByTime(100);
      expect(activeContent.active).toEqual(['b']);

      // Now remove all content in between an interval
      activeContent.remove('a');
      activeContent.remove('b');
      activeContent.remove('c');

      // Now check if after the interval the state.active has
      // been set to [].
      jest.advanceTimersByTime(200);
      expect(activeContent.active).toEqual([]);
    });

    test('that the autoplay can be paused and continued', () => {
      jest.useFakeTimers();

      const autoplay = { interval: 200 };
      const { activeContent } = setup({
        autoplay,
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

      const autoplay = { interval: 200 };
      const { activeContent } = setup({
        autoplay,
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
        }).toThrowError('uiloos > cooldown cannot be negative or zero');
      });

      test('cannot be zero', () => {
        expect(() => {
          setup({ cooldown: 0, activeIndexes: 0 });
        }).toThrowError('uiloos > cooldown cannot be negative or zero');
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
          }).toThrowError('uiloos > cooldown cannot be negative or zero');
        });

        test('cannot be zero', () => {
          const { activeContent } = setup({ cooldown: 600, activeIndexes: 0 });

          expect(() => {
            activeContent.activateByIndex(1, {
              isUserInteraction: true,
              cooldown: 0,
            });
          }).toThrowError('uiloos > cooldown cannot be negative or zero');
        });
      });

      test('a cooldown is ignored when isUserInteraction is false', () => {
        let epoch = 0;
        Date.now = jest.fn(() => epoch);

        const { activeContent } = setup({ cooldown: 5000, activeIndexes: 0 });

        expect(activeContent.active).toEqual(['a']);

        activeContent.activateByIndex(1, { isUserInteraction: false });
        expect(activeContent.active).toEqual(['b']);
      });

      test('a cooldown from the config', () => {
        let epoch = 0;
        Date.now = jest.fn(() => epoch);

        const { activeContent } = setup({ cooldown: 5000, activeIndexes: 0 });

        expect(activeContent.active).toEqual(['a']);

        // Should still be 'a'
        activeContent.activateByIndex(1);
        expect(activeContent.active).toEqual(['a']);

        // Should still be 'a'
        epoch = 4999;
        activeContent.activateByIndex(1);
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

        const { activeContent } = setup({ activeIndexes: 0 });

        expect(activeContent.active).toEqual(['a']);

        // Should still be 'a'
        activeContent.activateByIndex(1, {
          isUserInteraction: true,
          cooldown: 5000,
        });
        expect(activeContent.active).toEqual(['a']);

        // Should still be 'a'
        epoch = 4999;
        activeContent.activateByIndex(1, {
          isUserInteraction: true,
          cooldown: () => 5000,
        });
        expect(activeContent.active).toEqual(['a']);

        // Should still be 'a'
        epoch = 5000;
        activeContent.activateByIndex(1, {
          isUserInteraction: true,
          cooldown: 5000,
        });
        expect(activeContent.active).toEqual(['a']);

        // Now it should be 'b' after 5000 milliseconds
        epoch = 5001;
        activeContent.activateByIndex(1, {
          isUserInteraction: true,
          cooldown: 5000,
        });
        expect(activeContent.active).toEqual(['b']);

        // TODO: I question if this behavior is expected with multiple items.
        // Now we trigger two cooldown's, one with 10000 and one with
        // 5000, the one with 10000 should not pass. The one with 5000
        // should. This is because cooldown's do not interfere with
        // each other, a cooldown is not REMEMBERED.

        // Now it should be 'b' after 10000 milliseconds
        epoch = 15000;
        activeContent.activateByIndex(2, {
          isUserInteraction: true,
          cooldown: 10000,
        });
        expect(activeContent.active).toEqual(['b']);

        activeContent.activateByIndex(2, {
          isUserInteraction: true,
          cooldown: 5000,
        });
        expect(activeContent.active).toEqual(['c']);
      });

      test('that the cooldown from the ActionOptions has precedence over the cooldown from the config', () => {
        let epoch = 0;
        Date.now = jest.fn(() => epoch);

        // This cooldown of 5000 should be ignored.
        const { activeContent } = setup({ cooldown: 5000, activeIndexes: 0 });

        expect(activeContent.active).toEqual(['a']);

        // Should still be 'a'
        activeContent.activateByIndex(1, {
          isUserInteraction: true,
          cooldown: 10000,
        });
        expect(activeContent.active).toEqual(['a']);

        // Should still be 'a'
        epoch = 9999;
        activeContent.activateByIndex(1, {
          isUserInteraction: true,
          cooldown: 10000,
        });
        expect(activeContent.active).toEqual(['a']);

        // Should still be 'a'
        epoch = 10000;
        activeContent.activateByIndex(1, {
          isUserInteraction: true,
          cooldown: 10000,
        });
        expect(activeContent.active).toEqual(['a']);

        // Now it should be 'b' after 5000 milliseconds
        epoch = 10001;
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
          cooldown: () => 5000,
          activeIndexes: 0,
        });

        expect(activeContent.active).toEqual(['a']);

        // Should still be 'a'
        activeContent.activateByIndex(1);
        expect(activeContent.active).toEqual(['a']);

        // Should still be 'a'
        epoch = 4999;
        activeContent.activateByIndex(1);
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
          const { activeContent } = setup({ cooldown: 600, activeIndexes: 0 });

          expect(() => {
            activeContent.deactivateByIndex(0, {
              isUserInteraction: true,
              cooldown: -1,
            });
          }).toThrowError('uiloos > cooldown cannot be negative or zero');
        });

        test('cannot be zero', () => {
          const { activeContent } = setup({ cooldown: 600, activeIndexes: 0 });

          expect(() => {
            activeContent.deactivateByIndex(0, {
              isUserInteraction: true,
              cooldown: 0,
            });
          }).toThrowError('uiloos > cooldown cannot be negative or zero');
        });
      });

      test('a cooldown is ignored when isUserInteraction is false', () => {
        let epoch = 0;
        Date.now = jest.fn(() => epoch);

        const { activeContent } = setup({ cooldown: 5000, activeIndexes: 0 });

        expect(activeContent.active).toEqual(['a']);

        activeContent.deactivateByIndex(0, { isUserInteraction: false });
        expect(activeContent.active).toEqual([]);
      });

      test('a cooldown from the config', () => {
        let epoch = 0;
        Date.now = jest.fn(() => epoch);

        const { activeContent } = setup({ cooldown: 5000, activeIndexes: 0 });

        expect(activeContent.active).toEqual(['a']);

        // Should still be 'a'
        activeContent.deactivateByIndex(0);
        expect(activeContent.active).toEqual(['a']);

        // Should still be 'a'
        epoch = 4999;
        activeContent.deactivateByIndex(0);
        expect(activeContent.active).toEqual(['a']);

        // Should still be 'a'
        epoch = 5000;
        activeContent.deactivateByIndex(0);
        expect(activeContent.active).toEqual(['a']);

        // Now it should be empty after 5000 milliseconds
        epoch = 5001;
        activeContent.deactivateByIndex(0);
        expect(activeContent.active).toEqual([]);
      });

      test('a cooldown from options', () => {
        let epoch = 0;
        Date.now = jest.fn(() => epoch);

        const { activeContent } = setup({ activeIndexes: 0 });

        expect(activeContent.active).toEqual(['a']);

        // Should still be 'a'
        activeContent.deactivateByIndex(0, {
          isUserInteraction: true,
          cooldown: 5000,
        });
        expect(activeContent.active).toEqual(['a']);

        // Should still be 'a'
        epoch = 4999;
        activeContent.deactivateByIndex(0, {
          isUserInteraction: true,
          cooldown: () => 5000,
        });
        expect(activeContent.active).toEqual(['a']);

        // Should still be 'a'
        epoch = 5000;
        activeContent.deactivateByIndex(0, {
          isUserInteraction: true,
          cooldown: 5000,
        });
        expect(activeContent.active).toEqual(['a']);

        // Now it should be empty after 5000 milliseconds
        epoch = 5001;
        activeContent.deactivateByIndex(0, {
          isUserInteraction: true,
          cooldown: 5000,
        });
        expect(activeContent.active).toEqual([]);

        // TODO: I question if this behavior is expected with multiple items.
        // Now we trigger two cooldown's, one with 10000 and one with
        // 5000, the one with 10000 should not pass. The one with 5000
        // should. This is because cooldown's do not interfere with
        // each other, a cooldown is not REMEMBERED.

        activeContent.activateByIndex(0);
        expect(activeContent.active).toEqual(['a']);

        // Now it should be 'b' after 10000 milliseconds
        epoch = 15000;
        activeContent.deactivateByIndex(0, {
          isUserInteraction: true,
          cooldown: 10000,
        });
        expect(activeContent.active).toEqual(['a']);

        activeContent.deactivateByIndex(0, {
          isUserInteraction: true,
          cooldown: 5000,
        });
        expect(activeContent.active).toEqual([]);
      });

      test('that the cooldown from the ActionOptions has precedence over the cooldown from the config', () => {
        let epoch = 0;
        Date.now = jest.fn(() => epoch);

        // This cooldown of 5000 should be ignored.
        const { activeContent } = setup({ cooldown: 5000, activeIndexes: 0 });

        expect(activeContent.active).toEqual(['a']);

        // Should still be 'a'
        activeContent.deactivateByIndex(0, {
          isUserInteraction: true,
          cooldown: 10000,
        });
        expect(activeContent.active).toEqual(['a']);

        // Should still be 'a'
        epoch = 9999;
        activeContent.deactivateByIndex(0, {
          isUserInteraction: true,
          cooldown: 10000,
        });
        expect(activeContent.active).toEqual(['a']);

        // Should still be 'a'
        epoch = 10000;
        activeContent.deactivateByIndex(0, {
          isUserInteraction: true,
          cooldown: 10000,
        });
        expect(activeContent.active).toEqual(['a']);

        // Now it should be empty after 5000 milliseconds
        epoch = 10001;
        activeContent.deactivateByIndex(0, {
          isUserInteraction: true,
          cooldown: 10000,
        });
        expect(activeContent.active).toEqual([]);
      });

      test('that the cooldown can be a function instead of just a number', () => {
        let epoch = 0;
        Date.now = jest.fn(() => epoch);

        const { activeContent } = setup({
          cooldown: () => 5000,
          activeIndexes: 0,
        });

        expect(activeContent.active).toEqual(['a']);

        // Should still be 'a'
        activeContent.deactivateByIndex(0);
        expect(activeContent.active).toEqual(['a']);

        // Should still be 'a'
        epoch = 4999;
        activeContent.deactivateByIndex(0);
        expect(activeContent.active).toEqual(['a']);

        // Should still be 'a'
        epoch = 5000;
        activeContent.deactivateByIndex(0);
        expect(activeContent.active).toEqual(['a']);

        // Now it should be empty after 5000 milliseconds
        epoch = 5001;
        activeContent.deactivateByIndex(0);
        expect(activeContent.active).toEqual([]);
      });
    });
  });

  describe('history', () => {
    test('that a correct history is kept for all actions', () => {
      const { activeContent } = setup({
        keepHistoryFor: 100,
        activeIndexes: 0,
      });

      expect(activeContent.history).toEqual([
        expect.objectContaining({ action: 'INSERTED', index: 0, value: 'a' }),
        expect.objectContaining({ action: 'INSERTED', index: 1, value: 'b' }),
        expect.objectContaining({ action: 'INSERTED', index: 2, value: 'c' }),
        expect.objectContaining({ action: 'ACTIVATED', index: 0, value: 'a' }),
      ]);

      activeContent.activateByIndex(1);
      expect(activeContent.history).toEqual([
        expect.objectContaining({ action: 'INSERTED', index: 0, value: 'a' }),
        expect.objectContaining({ action: 'INSERTED', index: 1, value: 'b' }),
        expect.objectContaining({ action: 'INSERTED', index: 2, value: 'c' }),
        expect.objectContaining({ action: 'ACTIVATED', index: 0, value: 'a' }),
        expect.objectContaining({ action: 'ACTIVATED', index: 1, value: 'b' }),
      ]);

      activeContent.removeByIndex(0);
      expect(activeContent.history).toEqual([
        expect.objectContaining({ action: 'INSERTED', index: 0, value: 'a' }),
        expect.objectContaining({ action: 'INSERTED', index: 1, value: 'b' }),
        expect.objectContaining({ action: 'INSERTED', index: 2, value: 'c' }),
        expect.objectContaining({ action: 'ACTIVATED', index: 0, value: 'a' }),
        expect.objectContaining({ action: 'ACTIVATED', index: 1, value: 'b' }),
        expect.objectContaining({ action: 'REMOVED', index: 0, value: 'a' }),
      ]);

      // Sanity check
      expect(activeContent.contents.map((c) => c.value)).toEqual(['b', 'c']);

      activeContent.removeByPredicate(() => true);
      expect(activeContent.history).toEqual([
        expect.objectContaining({ action: 'INSERTED', index: 0, value: 'a' }),
        expect.objectContaining({ action: 'INSERTED', index: 1, value: 'b' }),
        expect.objectContaining({ action: 'INSERTED', index: 2, value: 'c' }),
        expect.objectContaining({ action: 'ACTIVATED', index: 0, value: 'a' }),
        expect.objectContaining({ action: 'ACTIVATED', index: 1, value: 'b' }),
        expect.objectContaining({ action: 'REMOVED', index: 0, value: 'a' }),
        expect.objectContaining({ action: 'REMOVED', index: 0, value: 'b' }),
        expect.objectContaining({ action: 'REMOVED', index: 0, value: 'c' }),
      ]);

      activeContent.insertAtIndex('a', 0);
      activeContent.activateByIndex(0);

      expect(activeContent.history).toEqual([
        expect.objectContaining({ action: 'INSERTED', index: 0, value: 'a' }),
        expect.objectContaining({ action: 'INSERTED', index: 1, value: 'b' }),
        expect.objectContaining({ action: 'INSERTED', index: 2, value: 'c' }),
        expect.objectContaining({ action: 'ACTIVATED', index: 0, value: 'a' }),
        expect.objectContaining({ action: 'ACTIVATED', index: 1, value: 'b' }),
        expect.objectContaining({ action: 'REMOVED', index: 0, value: 'a' }),
        expect.objectContaining({ action: 'REMOVED', index: 0, value: 'b' }),
        expect.objectContaining({ action: 'REMOVED', index: 0, value: 'c' }),
        expect.objectContaining({ action: 'INSERTED', index: 0, value: 'a' }),
        expect.objectContaining({ action: 'ACTIVATED', index: 0, value: 'a' }),
      ]);

      activeContent.insertAtIndex('b', 1);
      activeContent.insertAtIndex('c', 2);

      expect(activeContent.history).toEqual([
        expect.objectContaining({ action: 'INSERTED', index: 0, value: 'a' }),
        expect.objectContaining({ action: 'INSERTED', index: 1, value: 'b' }),
        expect.objectContaining({ action: 'INSERTED', index: 2, value: 'c' }),
        expect.objectContaining({ action: 'ACTIVATED', index: 0, value: 'a' }),
        expect.objectContaining({ action: 'ACTIVATED', index: 1, value: 'b' }),
        expect.objectContaining({ action: 'REMOVED', index: 0, value: 'a' }),
        expect.objectContaining({ action: 'REMOVED', index: 0, value: 'b' }),
        expect.objectContaining({ action: 'REMOVED', index: 0, value: 'c' }),
        expect.objectContaining({ action: 'INSERTED', index: 0, value: 'a' }),
        expect.objectContaining({ action: 'ACTIVATED', index: 0, value: 'a' }),
        expect.objectContaining({ action: 'INSERTED', index: 1, value: 'b' }),
        expect.objectContaining({ action: 'INSERTED', index: 2, value: 'c' }),
      ]);

      // Sanity check
      expect(activeContent.contents.map((c) => c.value)).toEqual([
        'a',
        'b',
        'c',
      ]);

      activeContent.swapByIndex(0, 2);
      expect(activeContent.history).toEqual([
        expect.objectContaining({ action: 'INSERTED', index: 0, value: 'a' }),
        expect.objectContaining({ action: 'INSERTED', index: 1, value: 'b' }),
        expect.objectContaining({ action: 'INSERTED', index: 2, value: 'c' }),
        expect.objectContaining({ action: 'ACTIVATED', index: 0, value: 'a' }),
        expect.objectContaining({ action: 'ACTIVATED', index: 1, value: 'b' }),
        expect.objectContaining({
          action: 'REMOVED',
          index: 0,
          value: 'a',
        }),
        expect.objectContaining({ action: 'REMOVED', index: 0, value: 'b' }),
        expect.objectContaining({ action: 'REMOVED', index: 0, value: 'c' }),
        expect.objectContaining({ action: 'INSERTED', index: 0, value: 'a' }),
        expect.objectContaining({ action: 'ACTIVATED', index: 0, value: 'a' }),
        expect.objectContaining({ action: 'INSERTED', index: 1, value: 'b' }),
        expect.objectContaining({ action: 'INSERTED', index: 2, value: 'c' }),
        expect.objectContaining({
          action: 'SWAPPED',
          index: { a: 0, b: 2 },
          value: { a: 'a', b: 'c' },
        }),
      ]);

      activeContent.moveByIndex(2, 0);
      expect(activeContent.history).toEqual([
        expect.objectContaining({ action: 'INSERTED', index: 0, value: 'a' }),
        expect.objectContaining({ action: 'INSERTED', index: 1, value: 'b' }),
        expect.objectContaining({ action: 'INSERTED', index: 2, value: 'c' }),
        expect.objectContaining({ action: 'ACTIVATED', index: 0, value: 'a' }),
        expect.objectContaining({ action: 'ACTIVATED', index: 1, value: 'b' }),
        expect.objectContaining({
          action: 'REMOVED',
          index: 0,
          value: 'a',
        }),
        expect.objectContaining({ action: 'REMOVED', index: 0, value: 'b' }),
        expect.objectContaining({ action: 'REMOVED', index: 0, value: 'c' }),
        expect.objectContaining({ action: 'INSERTED', index: 0, value: 'a' }),
        expect.objectContaining({ action: 'ACTIVATED', index: 0, value: 'a' }),
        expect.objectContaining({ action: 'INSERTED', index: 1, value: 'b' }),
        expect.objectContaining({ action: 'INSERTED', index: 2, value: 'c' }),
        expect.objectContaining({
          action: 'SWAPPED',
          index: { a: 0, b: 2 },
          value: { a: 'a', b: 'c' },
        }),
        expect.objectContaining({
          action: 'MOVED',
          index: {
            from: 2,
            to: 0,
          },
          value: 'a',
        }),
      ]);

      activeContent.deactivateByIndex(0);
      expect(activeContent.history).toEqual([
        expect.objectContaining({ action: 'INSERTED', index: 0, value: 'a' }),
        expect.objectContaining({ action: 'INSERTED', index: 1, value: 'b' }),
        expect.objectContaining({ action: 'INSERTED', index: 2, value: 'c' }),
        expect.objectContaining({ action: 'ACTIVATED', index: 0, value: 'a' }),
        expect.objectContaining({ action: 'ACTIVATED', index: 1, value: 'b' }),
        expect.objectContaining({
          action: 'REMOVED',
          index: 0,
          value: 'a',
        }),
        expect.objectContaining({ action: 'REMOVED', index: 0, value: 'b' }),
        expect.objectContaining({ action: 'REMOVED', index: 0, value: 'c' }),
        expect.objectContaining({ action: 'INSERTED', index: 0, value: 'a' }),
        expect.objectContaining({ action: 'ACTIVATED', index: 0, value: 'a' }),
        expect.objectContaining({ action: 'INSERTED', index: 1, value: 'b' }),
        expect.objectContaining({ action: 'INSERTED', index: 2, value: 'c' }),
        expect.objectContaining({
          action: 'SWAPPED',
          index: { a: 0, b: 2 },
          value: { a: 'a', b: 'c' },
        }),
        expect.objectContaining({
          action: 'MOVED',
          index: {
            from: 2,
            to: 0,
          },
          value: 'a',
        }),
        expect.objectContaining({
          action: 'DEACTIVATED',
          index: 0,
          value: 'a',
        }),
      ]);
    });

    test('that a history is kept for a maximum number of items', () => {
      const { activeContent } = setup({ keepHistoryFor: 3, activeIndexes: 0 });

      expect(activeContent.history).toEqual([
        expect.objectContaining({ action: 'INSERTED', index: 1, value: 'b' }),
        expect.objectContaining({ action: 'INSERTED', index: 2, value: 'c' }),
        expect.objectContaining({ action: 'ACTIVATED', index: 0, value: 'a' }),
      ]);

      activeContent.activateByIndex(1);
      expect(activeContent.history).toEqual([
        expect.objectContaining({ action: 'INSERTED', index: 2, value: 'c' }),
        expect.objectContaining({ action: 'ACTIVATED', index: 0, value: 'a' }),
        expect.objectContaining({ action: 'ACTIVATED', index: 1, value: 'b' }),
      ]);

      activeContent.activateByIndex(2);
      expect(activeContent.history).toEqual([
        expect.objectContaining({ action: 'ACTIVATED', index: 0, value: 'a' }),
        expect.objectContaining({ action: 'ACTIVATED', index: 1, value: 'b' }),
        expect.objectContaining({ action: 'ACTIVATED', index: 2, value: 'c' }),
      ]);
    });

    test('that initialize resets the history', () => {
      const { activeContent } = setup({ keepHistoryFor: 4, activeIndexes: 0 });

      expect(activeContent.history).toEqual([
        expect.objectContaining({ action: 'INSERTED', index: 0, value: 'a' }),
        expect.objectContaining({ action: 'INSERTED', index: 1, value: 'b' }),
        expect.objectContaining({ action: 'INSERTED', index: 2, value: 'c' }),
        expect.objectContaining({ action: 'ACTIVATED', index: 0, value: 'a' }),
      ]);

      activeContent.initialize({ contents: [] });

      expect(activeContent.history).toEqual([]);
    });
  });

  describe('subscribers', () => {
    test('multiple subscribers', () => {
      const { activeContent, subscriber } = setup({ activeIndexes: 0 });

      const secondSubscriber = jest.fn();
      const removeSecondSubscriber = activeContent.subscribe(secondSubscriber);

      const thirdSubscriber = jest.fn();
      const removeThirdSubscriber = activeContent.subscribe(thirdSubscriber);

      activeContent.activateByIndex(1);

      expect(subscriber).toHaveBeenCalledTimes(1);
      expect(secondSubscriber).toHaveBeenCalledTimes(1);
      expect(thirdSubscriber).toHaveBeenCalledTimes(1);

      removeSecondSubscriber();

      activeContent.activateByIndex(0);

      expect(subscriber).toHaveBeenCalledTimes(2);
      expect(secondSubscriber).toHaveBeenCalledTimes(1);
      expect(thirdSubscriber).toHaveBeenCalledTimes(2);

      removeThirdSubscriber();

      activeContent.activateByIndex(2);

      expect(subscriber).toHaveBeenCalledTimes(3);
      expect(secondSubscriber).toHaveBeenCalledTimes(1);
      expect(thirdSubscriber).toHaveBeenCalledTimes(2);
    });
  });
});

type ActiveContentSansContents<T> = Pick<
  ActiveContent<T>,
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

type TestState<T> = ActiveContentSansContents<T> & {
  contents: TestContent<T>[];
};

type TestContent<T> = Pick<
  Content<T>,
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

function assertState(
  state: ActiveContent<string>,
  expected: TestState<string>
) {
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
  subscriber: jest.Mock<ActiveContent<string>, any>,
  expected: TestState<string>
) {
  const lastCall = subscriber.mock.calls[subscriber.mock.calls.length - 1];
  const call: ActiveContent<string> = lastCall[0];

  assertState(call, expected);
}
