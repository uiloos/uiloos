import { ActiveContent } from '../src/ActiveContent/ActiveContent';
import { Content } from '../src/ActiveContent/Content';
import { ActiveContentConfig } from '../src/ActiveContent/types';

type TestConfig = Omit<ActiveContentConfig<string>, 'subscriber' | 'contents'>;

describe('ActiveContent', () => {
  function setup(
    config: TestConfig = { isCircular: false, autoplay: undefined },
    contents = ['a', 'b', 'c']
  ) {
    
    const activeContent = new ActiveContent(
      {
        contents,
        ...config,
      },
      );
      
  const subscriber = jest.fn();
    activeContent.setSubscriber(subscriber);

    return { subscriber, contents, activeContent };
  }

  describe('initialize', () => {
    test('with initial active element', () => {
      const { activeContent, subscriber } = setup({ active: 'b' });

      assertLastSubscriber(subscriber, {
        active: 'b',
        activeContent: activeContent.contents[1],
        activeIndex: 1,
        isCircular: false,
        autoplay: false,
        direction: 'right',
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
            wasActiveBeforeLast: false,
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
            wasActiveBeforeLast: false,
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
            wasActiveBeforeLast: false,
          },
        ],
      });

      expect(activeContent.active).toBe('b');

      expect(subscriber).toHaveBeenCalledTimes(1);
    });

    test('with initial active index', () => {
      const { activeContent, subscriber } = setup({ activeIndex: 2 });

      assertLastSubscriber(subscriber, {
        active: 'c',
        activeContent: activeContent.contents[2],
        activeIndex: 2,
        isCircular: false,
        autoplay: false,
        direction: 'right',
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
            wasActiveBeforeLast: false,
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
            wasActiveBeforeLast: false,
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
            wasActiveBeforeLast: false,
          },
        ],
      });

      expect(activeContent.active).toBe('c');

      expect(subscriber).toHaveBeenCalledTimes(1);
    });

    test('that without any activator that first item is activated', () => {
      const { activeContent, subscriber } = setup();

      assertLastSubscriber(subscriber, {
        active: 'a',
        activeContent: activeContent.contents[0],
        activeIndex: 0,
        isCircular: false,
        autoplay: false,
        direction: 'right',
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
            wasActiveBeforeLast: false,
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
            wasActiveBeforeLast: false,
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
            wasActiveBeforeLast: false,
          },
        ],
      });

      expect(activeContent.active).toBe('a');

      expect(subscriber).toHaveBeenCalledTimes(1);
    });

    test('that without any content nothing is activated', () => {
      const { activeContent, subscriber } = setup(undefined, []);

      assertLastSubscriber(subscriber, {
        active: null,
        activeContent: null,
        activeIndex: -1,
        isCircular: false,
        autoplay: false,
        direction: 'right',
        history: [],
        hasActiveChangedAtLeastOnce: false,
        contents: [],
      });

      expect(activeContent.active).toBe(null);

      expect(subscriber).toHaveBeenCalledTimes(1);
    });

    describe('reset behavior', () => {
      test('that initialize can reset the ActiveContent', () => {
        const { activeContent, subscriber } = setup({ activeIndex: 2 });

        expect(activeContent.contents.map((v) => v.value)).toEqual([
          'a',
          'b',
          'c',
        ]);

        const contents = ['d', 'e', 'f', 'g'];

        activeContent.initialize({ contents });

        assertLastSubscriber(subscriber, {
          active: 'd',
          activeContent: activeContent.contents[0],
          activeIndex: 0,
          isCircular: false,
          autoplay: false,
          direction: 'right',
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
            },
          ],
        });
      });

      test('that initialize can reset the ActiveContent and make it empty', () => {
        const { activeContent, subscriber } = setup();
        activeContent.initialize({ contents: [] });

        assertLastSubscriber(subscriber, {
          active: null,
          activeContent: null,
          activeIndex: -1,
          isCircular: false,
          autoplay: false,
          direction: 'right',
          history: [],
          hasActiveChangedAtLeastOnce: false,
          contents: [],
        });
      });
    });
  });

  describe('activation of elements', () => {
    describe('activateByIndex', () => {
      describe('when it throws out of bounds', () => {
        test('throws out of bounds when index is to large', () => {
          const { activeContent, subscriber } = setup();

          expect(() => {
            activeContent.activateByIndex(4);
          }).toThrowError(
            'automata > ActiveContent.activateByIndex > could not activate: index out of bounds'
          );

          // Once for initialize
          expect(subscriber).toHaveBeenCalledTimes(1);

          expect(activeContent.active).toBe('a');
        });

        test('throws out of bounds when index is less than zero', () => {
          const { activeContent, subscriber } = setup();

          expect(() => {
            activeContent.activateByIndex(-1);
          }).toThrowError(
            'automata > ActiveContent.activateByIndex > could not activate: index out of bounds'
          );

          // Once for initialize
          expect(subscriber).toHaveBeenCalledTimes(1);

          expect(activeContent.active).toBe('a');
        });
      });

      test('that when moving to the same index it does nothing', () => {
        const { activeContent, subscriber } = setup({ activeIndex: 2 });

        activeContent.activateByIndex(2);

        // Once for initialize
        expect(subscriber).toHaveBeenCalledTimes(1);
      });

      describe('motion', () => {
        describe('when circular', () => {
          test('moving right', () => {
            const { activeContent, subscriber } = setup({
              activeIndex: 0,
              isCircular: true,
            });

            // Initialize calls it the first time
            expect(subscriber).toHaveBeenCalledTimes(1);

            activeContent.activateByIndex(1);

            expect(subscriber).toHaveBeenCalledTimes(2);
            assertLastSubscriber(subscriber, {
              active: 'b',
              activeContent: activeContent.contents[1],
              activeIndex: 1,
              autoplay: false,
              direction: 'right',
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
                  wasActiveBeforeLast: true,
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
                  wasActiveBeforeLast: false,
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
                  wasActiveBeforeLast: false,
                },
              ],
            });

            activeContent.activateByIndex(2);

            expect(subscriber).toHaveBeenCalledTimes(3);
            assertLastSubscriber(subscriber, {
              active: 'c',
              activeContent: activeContent.contents[2],
              activeIndex: 2,
              autoplay: false,
              direction: 'right',
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
                  wasActiveBeforeLast: false,
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
                  wasActiveBeforeLast: true,
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
                  wasActiveBeforeLast: false,
                },
              ],
            });

            activeContent.activateByIndex(0);

            expect(subscriber).toHaveBeenCalledTimes(4);
            assertLastSubscriber(subscriber, {
              active: 'a',
              activeContent: activeContent.contents[0],
              activeIndex: 0,
              autoplay: false,
              direction: 'right',
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
                  wasActiveBeforeLast: false,
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
                  wasActiveBeforeLast: false,
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
                  wasActiveBeforeLast: true,
                },
              ],
            });
          });

          test('moving left', () => {
            const { activeContent, subscriber } = setup({
              activeIndex: 2,
              isCircular: true,
            });

            // Initialize calls it the first time
            expect(subscriber).toHaveBeenCalledTimes(1);

            activeContent.activateByIndex(1);

            expect(subscriber).toHaveBeenCalledTimes(2);
            assertLastSubscriber(subscriber, {
              active: 'b',
              activeContent: activeContent.contents[1],
              activeIndex: 1,
              autoplay: false,
              direction: 'left',
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
                  wasActiveBeforeLast: false,
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
                  wasActiveBeforeLast: false,
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
                  wasActiveBeforeLast: true,
                },
              ],
            });

            activeContent.activateByIndex(0);

            expect(subscriber).toHaveBeenCalledTimes(3);
            assertLastSubscriber(subscriber, {
              active: 'a',
              activeContent: activeContent.contents[0],
              activeIndex: 0,
              autoplay: false,
              direction: 'left',
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
                  wasActiveBeforeLast: false,
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
                  wasActiveBeforeLast: true,
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
                  wasActiveBeforeLast: false,
                },
              ],
            });

            activeContent.activateByIndex(2);

            expect(subscriber).toHaveBeenCalledTimes(4);
            assertLastSubscriber(subscriber, {
              active: 'c',
              activeContent: activeContent.contents[2],
              activeIndex: 2,
              autoplay: false,
              direction: 'left',
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
                  wasActiveBeforeLast: true,
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
                  wasActiveBeforeLast: false,
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
                  wasActiveBeforeLast: false,
                },
              ],
            });
          });
        });

        describe('when straight', () => {
          test('moving right', () => {
            const { activeContent, subscriber } = setup({ activeIndex: 0 });

            // Initialize calls it the first time
            expect(subscriber).toHaveBeenCalledTimes(1);

            activeContent.activateByIndex(1);

            expect(subscriber).toHaveBeenCalledTimes(2);
            assertLastSubscriber(subscriber, {
              active: 'b',
              activeContent: activeContent.contents[1],
              activeIndex: 1,
              autoplay: false,
              direction: 'right',
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
                  wasActiveBeforeLast: true,
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
                  wasActiveBeforeLast: false,
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
                  wasActiveBeforeLast: false,
                },
              ],
            });

            activeContent.activateByIndex(2);

            expect(subscriber).toHaveBeenCalledTimes(3);
            assertLastSubscriber(subscriber, {
              active: 'c',
              activeContent: activeContent.contents[2],
              activeIndex: 2,
              autoplay: false,
              direction: 'right',
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
                  wasActiveBeforeLast: false,
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
                  wasActiveBeforeLast: true,
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
                  wasActiveBeforeLast: false,
                },
              ],
            });
          });

          test('moving left', () => {
            const { activeContent, subscriber } = setup({ activeIndex: 2 });

            // Initialize calls it the first time
            expect(subscriber).toHaveBeenCalledTimes(1);

            activeContent.activateByIndex(1);

            expect(subscriber).toHaveBeenCalledTimes(2);
            assertLastSubscriber(subscriber, {
              active: 'b',
              activeContent: activeContent.contents[1],
              activeIndex: 1,
              autoplay: false,
              direction: 'left',
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
                  wasActiveBeforeLast: false,
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
                  wasActiveBeforeLast: false,
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
                  wasActiveBeforeLast: true,
                },
              ],
            });

            activeContent.activateByIndex(0);

            expect(subscriber).toHaveBeenCalledTimes(3);
            assertLastSubscriber(subscriber, {
              active: 'a',
              activeContent: activeContent.contents[0],
              activeIndex: 0,
              autoplay: false,
              direction: 'left',
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
                  wasActiveBeforeLast: false,
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
                  wasActiveBeforeLast: true,
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
                  wasActiveBeforeLast: false,
                },
              ],
            });
          });
        });

        describe('when having custom directions', () => {
          test('moving down', () => {
            const { activeContent, subscriber } = setup({
              activeIndex: 0,
              directions: { next: 'down', previous: 'up' },
            });

            // Initialize calls it the first time
            expect(subscriber).toHaveBeenCalledTimes(1);

            activeContent.activateByIndex(1);

            expect(subscriber).toHaveBeenCalledTimes(2);
            expect(subscriber.mock.calls[1][0]).toMatchObject({
              direction: 'down',
            });

            activeContent.activateByIndex(2);

            expect(subscriber).toHaveBeenCalledTimes(3);
            expect(subscriber.mock.calls[2][0]).toMatchObject({
              direction: 'down',
            });
          });

          test('moving up', () => {
            const { activeContent, subscriber } = setup({
              activeIndex: 2,
              directions: { next: 'down', previous: 'up' },
            });

            // Initialize calls it the first time
            expect(subscriber).toHaveBeenCalledTimes(1);

            activeContent.activateByIndex(1);

            expect(subscriber).toHaveBeenCalledTimes(2);
            expect(subscriber.mock.calls[1][0]).toMatchObject({
              direction: 'up',
            });

            activeContent.activateByIndex(0);

            expect(subscriber).toHaveBeenCalledTimes(3);
            expect(subscriber.mock.calls[2][0]).toMatchObject({
              direction: 'up',
            });
          });
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

      test('activate on item after removal', () => {
        const { activeContent } = setup();

        jest.spyOn(activeContent, 'activateByIndex');

        activeContent.shift();

        activeContent.contents[1].activate({ isUserInteraction: false });

        expect(activeContent.activateByIndex).toHaveBeenCalledTimes(2);
        expect(activeContent.activateByIndex).toHaveBeenLastCalledWith(1, {
          isUserInteraction: false,
        });

        expect(activeContent.active).toBe('c');
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
          'automata > ActiveContent.getIndex could not get index for item. Item not in contents array'
        );

        expect(activeContent.activateByIndex).toHaveBeenCalledTimes(0);
      });
    });

    describe('activateByPredicate', () => {
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

    describe('next', () => {
      test('activates the next content.', () => {
        const { activeContent } = setup();

        jest.spyOn(activeContent, 'activateByIndex');

        activeContent.next({ isUserInteraction: true });

        expect(activeContent.activateByIndex).toHaveBeenCalledTimes(1);
        expect(activeContent.activateByIndex).toHaveBeenCalledWith(1, {
          isUserInteraction: true,
        });
      });

      describe('when moving beyond the last index ', () => {
        test('when isCircular is true it should go to first', () => {
          const { activeContent } = setup({
            activeIndex: 2,
            isCircular: true,
          });

          jest.spyOn(activeContent, 'activateByIndex');

          activeContent.next();

          expect(activeContent.activateByIndex).toHaveBeenCalledTimes(1);
          expect(activeContent.activateByIndex).toHaveBeenCalledWith(
            0,
            undefined
          );
        });

        test('when isCircular is false it should do nothing', () => {
          const { activeContent } = setup({
            activeIndex: 2,
            isCircular: false,
          });

          jest.spyOn(activeContent, 'activateByIndex');

          activeContent.next();

          expect(activeContent.activateByIndex).toHaveBeenCalledTimes(1);
          expect(activeContent.activateByIndex).toHaveBeenCalledWith(
            2,
            undefined
          );
        });
      });
    });

    describe('previous', () => {
      test('activates the previous content', () => {
        const { activeContent } = setup({ activeIndex: 2 });

        jest.spyOn(activeContent, 'activateByIndex');

        activeContent.previous({ isUserInteraction: true });

        expect(activeContent.activateByIndex).toHaveBeenCalledTimes(1);
        expect(activeContent.activateByIndex).toHaveBeenCalledWith(1, {
          isUserInteraction: true,
        });
      });

      describe('when beyond the first index', () => {
        test('when isCircular is true it should go to last', () => {
          const { activeContent } = setup({
            activeIndex: 0,
            isCircular: true,
          });

          jest.spyOn(activeContent, 'activateByIndex');

          activeContent.previous();

          expect(activeContent.activateByIndex).toHaveBeenCalledTimes(1);
          expect(activeContent.activateByIndex).toHaveBeenCalledWith(
            2,
            undefined
          );
        });

        test('when false it should do nothing', () => {
          const { activeContent } = setup({
            activeIndex: 0,
            isCircular: false,
          });

          jest.spyOn(activeContent, 'activateByIndex');

          activeContent.previous();

          expect(activeContent.activateByIndex).toHaveBeenCalledTimes(1);
          expect(activeContent.activateByIndex).toHaveBeenCalledWith(
            0,
            undefined
          );
        });
      });
    });

    describe('first', () => {
      test('should activate the first content in the sequence.', () => {
        const { activeContent } = setup({ activeIndex: 1 });

        jest.spyOn(activeContent, 'activateByIndex');

        activeContent.first({
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

        activeContent.first({
          isUserInteraction: false,
        });

        expect(activeContent.activateByIndex).toHaveBeenCalledTimes(0);
      });
    });

    describe('last', () => {
      test('should activate the last content in the sequence.', () => {
        const { activeContent } = setup({ activeIndex: 1 });

        jest.spyOn(activeContent, 'activateByIndex');

        activeContent.last({
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

        activeContent.last({
          isUserInteraction: false,
        });

        expect(activeContent.activateByIndex).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe('insertion of elements', () => {
    describe('when it throws out of bounds', () => {
      test('throws out of bounds when index is to large', () => {
        const { activeContent } = setup();

        expect(() => {
          activeContent.insertAtIndex('d', 4);
        }).toThrowError(
          'automata > ActiveContent.insertAtIndex > could not insert: index out of bounds'
        );
      });

      test('throws out of bounds when index is less than zero', () => {
        const { activeContent } = setup();

        expect(() => {
          activeContent.insertAtIndex('d', -1);
        }).toThrowError(
          'automata > ActiveContent.insertAtIndex > could not insert: index out of bounds'
        );
      });
    });

    test('inserting the first element should also activate it', () => {
      const { activeContent, subscriber } = setup({}, []);

      activeContent.unshift('z');

      // Once for initialize
      expect(subscriber).toHaveBeenCalledTimes(2);

      assertLastSubscriber(subscriber, {
        active: 'z',
        activeContent: activeContent.contents[0],
        activeIndex: 0,
        isCircular: false,
        autoplay: false,
        direction: 'right',
        history: [],
        hasActiveChangedAtLeastOnce: true,
        contents: [
          {
            active: true,
            index: 0,
            value: 'z',
            isFirst: true,
            isLast: true,
            hasNext: false,
            hasPrevious: false,
            isNext: false,
            isPrevious: false,
            hasBeenActiveBefore: true,
            wasActiveBeforeLast: false,
          },
        ],
      });
    });

    test('inserting at the start', () => {
      const { activeContent, subscriber } = setup({ activeIndex: 0 });

      activeContent.unshift('d');

      // Once for initialize
      expect(subscriber).toHaveBeenCalledTimes(2);

      assertLastSubscriber(subscriber, {
        active: 'a',
        activeContent: activeContent.contents[1],
        activeIndex: 1,
        isCircular: false,
        autoplay: false,
        direction: 'right',
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
            wasActiveBeforeLast: false,
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
            wasActiveBeforeLast: false,
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
            wasActiveBeforeLast: false,
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
            wasActiveBeforeLast: false,
          },
        ],
      });
    });

    test('inserting in the middle', () => {
      const { activeContent, subscriber } = setup({ activeIndex: 0 });

      activeContent.insertAtIndex('d', 1);

      // Once for initialize
      expect(subscriber).toHaveBeenCalledTimes(2);

      assertLastSubscriber(subscriber, {
        active: 'a',
        activeContent: activeContent.contents[0],
        activeIndex: 0,
        isCircular: false,
        autoplay: false,
        direction: 'right',
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
            wasActiveBeforeLast: false,
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
            wasActiveBeforeLast: false,
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
            wasActiveBeforeLast: false,
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
            wasActiveBeforeLast: false,
          },
        ],
      });
    });

    test('inserting at the end', () => {
      const { activeContent, subscriber } = setup({ activeIndex: 0 });

      activeContent.push('d');

      // Once for initialize
      expect(subscriber).toHaveBeenCalledTimes(2);

      assertLastSubscriber(subscriber, {
        active: 'a',
        activeContent: activeContent.contents[0],
        activeIndex: 0,
        isCircular: false,
        autoplay: false,
        direction: 'right',
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
            wasActiveBeforeLast: false,
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
            wasActiveBeforeLast: false,
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
            wasActiveBeforeLast: false,
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
            wasActiveBeforeLast: false,
          },
        ],
      });
    });

    describe('inserting with predicate', () => {
      test('insertAtPredicate', () => {
        const { activeContent, subscriber } = setup({ activeIndex: 0 });

        activeContent.insertAtPredicate('d', (item) => item === 'b');

        // Once for initialize
        expect(subscriber).toHaveBeenCalledTimes(2);

        assertLastSubscriber(subscriber, {
          active: 'a',
          activeContent: activeContent.contents[0],
          activeIndex: 0,
          isCircular: false,
          autoplay: false,
          direction: 'right',
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
            },
          ],
        });
      });

      test('when no predicate matches do nothing', () => {
        const { activeContent, subscriber } = setup({ activeIndex: 0 });

        activeContent.insertAtPredicate('z', (item) => item === 'y');

        // Once for initialize
        expect(subscriber).toHaveBeenCalledTimes(1);
      });

      describe('insertBeforePredicate', () => {
        test('when first item returns true add at start and not at -1', () => {
          const { activeContent, subscriber } = setup({ activeIndex: 0 });

          activeContent.insertBeforePredicate('d', (item) => item === 'a');

          // Once for initialize
          expect(subscriber).toHaveBeenCalledTimes(2);

          assertLastSubscriber(subscriber, {
            active: 'a',
            activeContent: activeContent.contents[1],
            activeIndex: 1,
            isCircular: false,
            autoplay: false,
            direction: 'right',
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
                wasActiveBeforeLast: false,
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
                wasActiveBeforeLast: false,
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
                wasActiveBeforeLast: false,
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
                wasActiveBeforeLast: false,
              },
            ],
          });
        });

        test('when item returns true insert before predicate', () => {
          const { activeContent, subscriber } = setup({ activeIndex: 0 });

          activeContent.insertBeforePredicate('d', (item) => item === 'b');

          // Once for initialize
          expect(subscriber).toHaveBeenCalledTimes(2);

          assertLastSubscriber(subscriber, {
            active: 'a',
            activeContent: activeContent.contents[1],
            activeIndex: 1,
            isCircular: false,
            autoplay: false,
            direction: 'right',
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
                wasActiveBeforeLast: false,
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
                wasActiveBeforeLast: false,
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
                wasActiveBeforeLast: false,
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
                wasActiveBeforeLast: false,
              },
            ],
          });
        });
      });

      describe('insertAfterPredicate', () => {
        test('when last item returns true add at end and not after', () => {
          const { activeContent, subscriber } = setup({ activeIndex: 0 });

          activeContent.insertAfterPredicate('d', (item) => item === 'c');

          // Once for initialize
          expect(subscriber).toHaveBeenCalledTimes(2);

          assertLastSubscriber(subscriber, {
            active: 'a',
            activeContent: activeContent.contents[0],
            activeIndex: 0,
            isCircular: false,
            autoplay: false,
            direction: 'right',
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
                wasActiveBeforeLast: false,
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
                wasActiveBeforeLast: false,
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
                wasActiveBeforeLast: false,
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
                wasActiveBeforeLast: false,
              },
            ],
          });
        });

        test('when item returns true insert after predicate', () => {
          const { activeContent, subscriber } = setup({ activeIndex: 0 });

          activeContent.insertAfterPredicate('d', (item) => item === 'b');

          // Once for initialize
          expect(subscriber).toHaveBeenCalledTimes(2);

          assertLastSubscriber(subscriber, {
            active: 'a',
            activeContent: activeContent.contents[0],
            activeIndex: 0,
            isCircular: false,
            autoplay: false,
            direction: 'right',
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
                wasActiveBeforeLast: false,
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
                wasActiveBeforeLast: false,
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
                wasActiveBeforeLast: false,
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
                wasActiveBeforeLast: false,
              },
            ],
          });
        });
      });
    });

    describe('all methods pass along the ActionOptions', () => {
      test('push', () => {
        const { activeContent } = setup({ activeIndex: 0 });

        jest.spyOn(activeContent, 'insertAtIndex');

        activeContent.push('d', { cooldown: 1337, isUserInteraction: false });

        expect(activeContent.insertAtIndex).toBeCalledTimes(1);
        expect(activeContent.insertAtIndex).toBeCalledWith('d', 3, {
          cooldown: 1337,
          isUserInteraction: false,
        });
      });

      test('unshift', () => {
        const { activeContent } = setup({ activeIndex: 0 });

        jest.spyOn(activeContent, 'insertAtIndex');

        activeContent.unshift('d', {
          cooldown: 1337,
          isUserInteraction: false,
        });

        expect(activeContent.insertAtIndex).toBeCalledTimes(1);
        expect(activeContent.insertAtIndex).toBeCalledWith('d', 0, {
          cooldown: 1337,
          isUserInteraction: false,
        });
      });

      test('insertAtPredicate', () => {
        const { activeContent } = setup({ activeIndex: 0 });

        jest.spyOn(activeContent, 'insertAtIndex');

        activeContent.insertAtPredicate('d', () => true, {
          cooldown: 1337,
          isUserInteraction: false,
        });

        expect(activeContent.insertAtIndex).toBeCalledTimes(1);
        expect(activeContent.insertAtIndex).toBeCalledWith('d', 0, {
          cooldown: 1337,
          isUserInteraction: false,
        });
      });

      test('insertBeforePredicate', () => {
        const { activeContent } = setup({ activeIndex: 0 });

        jest.spyOn(activeContent, 'insertAtIndex');

        activeContent.insertBeforePredicate('d', () => true, {
          cooldown: 1337,
          isUserInteraction: false,
        });

        expect(activeContent.insertAtIndex).toBeCalledTimes(1);
        expect(activeContent.insertAtIndex).toBeCalledWith('d', 0, {
          cooldown: 1337,
          isUserInteraction: false,
        });
      });

      test('insertAfterPredicate', () => {
        const { activeContent } = setup({ activeIndex: 0 });

        jest.spyOn(activeContent, 'insertAtIndex');

        activeContent.insertAfterPredicate('d', () => true, {
          cooldown: 1337,
          isUserInteraction: false,
        });

        expect(activeContent.insertAtIndex).toBeCalledTimes(1);
        expect(activeContent.insertAtIndex).toBeCalledWith('d', 1, {
          cooldown: 1337,
          isUserInteraction: false,
        });
      });
    });
  });

  describe('removal of elements', () => {
    describe('when it throws out of bounds', () => {
      test('throws out of bounds when index is to large', () => {
        const { activeContent } = setup();

        expect(() => {
          activeContent.removeByIndex(4);
        }).toThrowError(
          'automata > ActiveContent.removeByIndex > could not remove: index out of bounds'
        );
      });

      test('throws out of bounds when index is less than zero', () => {
        const { activeContent } = setup();

        expect(() => {
          activeContent.removeByIndex(-1);
        }).toThrowError(
          'automata > ActiveContent.removeByIndex > could not remove: index out of bounds'
        );
      });
    });

    test('removing last item', () => {
      const { activeContent, subscriber } = setup({ activeIndex: 0 }, ['a']);

      activeContent.shift();

      // Once for initialize
      expect(subscriber).toHaveBeenCalledTimes(2);

      assertLastSubscriber(subscriber, {
        active: null,
        activeContent: null,
        activeIndex: -1,
        isCircular: false,
        autoplay: false,
        direction: 'right',
        history: [],
        hasActiveChangedAtLeastOnce: true,
        contents: [],
      });
    });

    describe('removing single inactive element', () => {
      test('removing from the start', () => {
        const { activeContent, subscriber } = setup({ activeIndex: 1 });

        const removedValue = activeContent.shift();

        // Once for initialize
        expect(subscriber).toHaveBeenCalledTimes(2);

        assertLastSubscriber(subscriber, {
          active: 'b',
          activeContent: activeContent.contents[0],
          activeIndex: 0,
          isCircular: false,
          autoplay: false,
          direction: 'right',
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
            },
          ],
        });

        expect(removedValue).toBe('a');
      });

      test('removing from the middle', () => {
        const { activeContent, subscriber } = setup({ activeIndex: 0 });

        const removedValue = activeContent.removeByIndex(1);

        // Once for initialize
        expect(subscriber).toHaveBeenCalledTimes(2);

        assertLastSubscriber(subscriber, {
          active: 'a',
          activeContent: activeContent.contents[0],
          activeIndex: 0,
          isCircular: false,
          autoplay: false,
          direction: 'right',
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
            },
          ],
        });

        expect(removedValue).toBe('b');
      });

      test('removing from the end', () => {
        const { activeContent, subscriber } = setup({ activeIndex: 0 });

        const removedValue = activeContent.pop();

        // Once for initialize
        expect(subscriber).toHaveBeenCalledTimes(2);

        assertLastSubscriber(subscriber, {
          active: 'a',
          activeContent: activeContent.contents[0],
          activeIndex: 0,
          isCircular: false,
          autoplay: false,
          direction: 'right',
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
            },
          ],
        });

        expect(removedValue).toBe('c');
      });
    });

    describe('removing single active element', () => {
      test('removing from the start', () => {
        const { activeContent, subscriber } = setup({ activeIndex: 0 });

        const removedValue = activeContent.shift();

        // Once for initialize
        expect(subscriber).toHaveBeenCalledTimes(2);

        assertLastSubscriber(subscriber, {
          active: 'b',
          activeContent: activeContent.contents[0],
          activeIndex: 0,
          isCircular: false,
          autoplay: false,
          direction: 'right',
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
            },
          ],
        });

        expect(removedValue).toBe('a');
      });

      test('removing from the middle', () => {
        const { activeContent, subscriber } = setup({ activeIndex: 1 });

        const removedValue = activeContent.removeByIndex(1);

        // Once for initialize
        expect(subscriber).toHaveBeenCalledTimes(2);

        assertLastSubscriber(subscriber, {
          active: 'a',
          activeContent: activeContent.contents[0],
          activeIndex: 0,
          isCircular: false,
          autoplay: false,
          direction: 'left',
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
            },
          ],
        });

        expect(removedValue).toBe('b');
      });

      test('removing from the end', () => {
        const { activeContent, subscriber } = setup({ activeIndex: 2 });

        const removedValue = activeContent.pop();

        // Once for initialize
        expect(subscriber).toHaveBeenCalledTimes(2);

        assertLastSubscriber(subscriber, {
          active: 'b',
          activeContent: activeContent.contents[1],
          activeIndex: 1,
          isCircular: false,
          autoplay: false,
          direction: 'left',
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
            },
          ],
        });

        expect(removedValue).toBe('c');
      });
    });

    describe('removing with predicate', () => {
      test('all removal', () => {
        const { activeContent, subscriber } = setup({ activeIndex: 0 });

        const removed = activeContent.removeByPredicate(() => true);

        // Once for initialize
        expect(subscriber).toHaveBeenCalledTimes(2);

        assertLastSubscriber(subscriber, {
          active: null,
          activeContent: null,
          activeIndex: -1,
          isCircular: false,
          autoplay: false,
          direction: 'right',
          history: [],
          hasActiveChangedAtLeastOnce: true,
          contents: [],
        });

        expect(removed).toEqual(['a', 'b', 'c']);
      });

      describe('predicate matches one element', () => {
        describe('removing inactive element', () => {
          test('start removal', () => {
            const { activeContent, subscriber } = setup({ activeIndex: 1 });

            const removed = activeContent.removeByPredicate(
              (item) => item === 'a'
            );

            // Once for initialize
            expect(subscriber).toHaveBeenCalledTimes(2);

            assertLastSubscriber(subscriber, {
              active: 'b',
              activeContent: activeContent.contents[0],
              activeIndex: 0,
              isCircular: false,
              autoplay: false,
              direction: 'right',
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
                  wasActiveBeforeLast: false,
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
                  wasActiveBeforeLast: false,
                },
              ],
            });

            expect(removed).toEqual(['a']);
          });

          test('middle removal', () => {
            const { activeContent, subscriber } = setup({ activeIndex: 0 });

            const removed = activeContent.removeByPredicate(
              (item) => item === 'b'
            );

            // Once for initialize
            expect(subscriber).toHaveBeenCalledTimes(2);

            assertLastSubscriber(subscriber, {
              active: 'a',
              activeContent: activeContent.contents[0],
              activeIndex: 0,
              isCircular: false,
              autoplay: false,
              direction: 'right',
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
                  wasActiveBeforeLast: false,
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
                  wasActiveBeforeLast: false,
                },
              ],
            });

            expect(removed).toEqual(['b']);
          });

          test('end removal', () => {
            const { activeContent, subscriber } = setup({ activeIndex: 0 });

            const removed = activeContent.removeByPredicate(
              (item) => item === 'c'
            );

            // Once for initialize
            expect(subscriber).toHaveBeenCalledTimes(2);

            assertLastSubscriber(subscriber, {
              active: 'a',
              activeContent: activeContent.contents[0],
              activeIndex: 0,
              isCircular: false,
              autoplay: false,
              direction: 'right',
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
                  wasActiveBeforeLast: false,
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
                  wasActiveBeforeLast: false,
                },
              ],
            });

            expect(removed).toEqual(['c']);
          });
        });

        describe('removing active element', () => {
          test('start removal', () => {
            const { activeContent, subscriber } = setup({ activeIndex: 0 });

            const removed = activeContent.removeByPredicate(
              (item) => item === 'a'
            );

            // Once for initialize
            expect(subscriber).toHaveBeenCalledTimes(2);

            assertLastSubscriber(subscriber, {
              active: 'b',
              activeContent: activeContent.contents[0],
              activeIndex: 0,
              isCircular: false,
              autoplay: false,
              direction: 'right',
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
                  wasActiveBeforeLast: false,
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
                  wasActiveBeforeLast: false,
                },
              ],
            });

            expect(removed).toEqual(['a']);
          });

          test('middle removal', () => {
            const { activeContent, subscriber } = setup({ activeIndex: 1 });

            const removed = activeContent.removeByPredicate(
              (item) => item === 'b'
            );

            // Once for initialize
            expect(subscriber).toHaveBeenCalledTimes(2);

            assertLastSubscriber(subscriber, {
              active: 'a',
              activeContent: activeContent.contents[0],
              activeIndex: 0,
              isCircular: false,
              autoplay: false,
              direction: 'left',
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
                  wasActiveBeforeLast: false,
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
                  wasActiveBeforeLast: false,
                },
              ],
            });

            expect(removed).toEqual(['b']);
          });

          test('end removal', () => {
            const { activeContent, subscriber } = setup({ activeIndex: 2 });

            const removed = activeContent.removeByPredicate(
              (item) => item === 'c'
            );

            // Once for initialize
            expect(subscriber).toHaveBeenCalledTimes(2);

            assertLastSubscriber(subscriber, {
              active: 'b',
              activeContent: activeContent.contents[1],
              activeIndex: 1,
              isCircular: false,
              autoplay: false,
              direction: 'left',
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
                  wasActiveBeforeLast: false,
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
                  wasActiveBeforeLast: false,
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
            const { activeContent, subscriber } = setup({ activeIndex: 2 });

            const removed = activeContent.removeByPredicate(
              (item) => item === 'a' || item === 'b'
            );

            // Once for initialize
            expect(subscriber).toHaveBeenCalledTimes(2);

            assertLastSubscriber(subscriber, {
              active: 'c',
              activeContent: activeContent.contents[0],
              activeIndex: 0,
              isCircular: false,
              autoplay: false,
              direction: 'right',
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
                  wasActiveBeforeLast: false,
                },
              ],
            });

            expect(removed).toEqual(['a', 'b']);
          });

          test('middle removal #0', () => {
            const { activeContent, subscriber } = setup({ activeIndex: 0 }, [
              'a',
              'b',
              'c',
              'd',
            ]);

            const removed = activeContent.removeByPredicate(
              (item) => item === 'b' || item === 'c'
            );

            // Once for initialize
            expect(subscriber).toHaveBeenCalledTimes(2);

            assertLastSubscriber(subscriber, {
              active: 'a',
              activeContent: activeContent.contents[0],
              activeIndex: 0,
              isCircular: false,
              autoplay: false,
              direction: 'right',
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
                  wasActiveBeforeLast: false,
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
                  wasActiveBeforeLast: false,
                },
              ],
            });

            expect(removed).toEqual(['b', 'c']);
          });

          test('middle removal #3', () => {
            const { activeContent, subscriber } = setup({ activeIndex: 3 }, [
              'a',
              'b',
              'c',
              'd',
            ]);

            const removed = activeContent.removeByPredicate(
              (item) => item === 'b' || item === 'c'
            );

            // Once for initialize
            expect(subscriber).toHaveBeenCalledTimes(2);

            assertLastSubscriber(subscriber, {
              active: 'd',
              activeContent: activeContent.contents[1],
              activeIndex: 1,
              isCircular: false,
              autoplay: false,
              direction: 'right',
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
                  wasActiveBeforeLast: false,
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
                  wasActiveBeforeLast: false,
                },
              ],
            });

            expect(removed).toEqual(['b', 'c']);
          });

          test('middle with holes removal #0', () => {
            const { activeContent, subscriber } = setup({ activeIndex: 0 }, [
              'a',
              'b',
              'c',
              'd',
              'e',
            ]);

            const removed = activeContent.removeByPredicate(
              (item) => item === 'b' || item === 'd'
            );

            // Once for initialize
            expect(subscriber).toHaveBeenCalledTimes(2);

            assertLastSubscriber(subscriber, {
              active: 'a',
              activeContent: activeContent.contents[0],
              activeIndex: 0,
              isCircular: false,
              autoplay: false,
              direction: 'right',
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
                  wasActiveBeforeLast: false,
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
                  wasActiveBeforeLast: false,
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
                  wasActiveBeforeLast: false,
                },
              ],
            });

            expect(removed).toEqual(['b', 'd']);
          });

          test('middle with holes removal #2', () => {
            const { activeContent, subscriber } = setup({ activeIndex: 2 }, [
              'a',
              'b',
              'c',
              'd',
              'e',
            ]);

            const removed = activeContent.removeByPredicate(
              (item) => item === 'b' || item === 'd'
            );

            // Once for initialize
            expect(subscriber).toHaveBeenCalledTimes(2);

            assertLastSubscriber(subscriber, {
              active: 'c',
              activeContent: activeContent.contents[1],
              activeIndex: 1,
              isCircular: false,
              autoplay: false,
              direction: 'right',
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
                  wasActiveBeforeLast: false,
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
                  wasActiveBeforeLast: false,
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
                  wasActiveBeforeLast: false,
                },
              ],
            });

            expect(removed).toEqual(['b', 'd']);
          });

          test('middle with holes removal #4', () => {
            const { activeContent, subscriber } = setup({ activeIndex: 4 }, [
              'a',
              'b',
              'c',
              'd',
              'e',
            ]);

            const removed = activeContent.removeByPredicate(
              (item) => item === 'b' || item === 'd'
            );

            // Once for initialize
            expect(subscriber).toHaveBeenCalledTimes(2);

            assertLastSubscriber(subscriber, {
              active: 'e',
              activeContent: activeContent.contents[2],
              activeIndex: 2,
              isCircular: false,
              autoplay: false,
              direction: 'right',
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
                  wasActiveBeforeLast: false,
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
                  wasActiveBeforeLast: false,
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
                  wasActiveBeforeLast: false,
                },
              ],
            });

            expect(removed).toEqual(['b', 'd']);
          });

          test('end removal', () => {
            const { activeContent, subscriber } = setup({ activeIndex: 0 });

            const removed = activeContent.removeByPredicate(
              (item, index) => index > 0
            );

            // Once for initialize
            expect(subscriber).toHaveBeenCalledTimes(2);

            assertLastSubscriber(subscriber, {
              active: 'a',
              activeContent: activeContent.contents[0],
              activeIndex: 0,
              isCircular: false,
              autoplay: false,
              direction: 'right',
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
                  wasActiveBeforeLast: false,
                },
              ],
            });

            expect(removed).toEqual(['b', 'c']);
          });
        });

        describe('removing active elements', () => {
          test('start removal #0', () => {
            const { activeContent, subscriber } = setup({ activeIndex: 0 });

            const removed = activeContent.removeByPredicate(
              (item) => item === 'a' || item === 'b'
            );

            // Once for initialize
            expect(subscriber).toHaveBeenCalledTimes(2);

            assertLastSubscriber(subscriber, {
              active: 'c',
              activeContent: activeContent.contents[0],
              activeIndex: 0,
              isCircular: false,
              autoplay: false,
              direction: 'right',
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
                  wasActiveBeforeLast: false,
                },
              ],
            });

            expect(removed).toEqual(['a', 'b']);
          });

          test('start removal #1', () => {
            const { activeContent, subscriber } = setup({ activeIndex: 1 });

            const removed = activeContent.removeByPredicate(
              (item) => item === 'a' || item === 'b'
            );

            // Once for initialize
            expect(subscriber).toHaveBeenCalledTimes(2);

            assertLastSubscriber(subscriber, {
              active: 'c',
              activeContent: activeContent.contents[0],
              activeIndex: 0,
              isCircular: false,
              autoplay: false,
              direction: 'right',
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
                  wasActiveBeforeLast: false,
                },
              ],
            });

            expect(removed).toEqual(['a', 'b']);
          });

          test('middle removal #1', () => {
            const { activeContent, subscriber } = setup({ activeIndex: 1 }, [
              'a',
              'b',
              'c',
              'd',
            ]);

            const removed = activeContent.removeByPredicate(
              (item) => item === 'b' || item === 'c'
            );

            // Once for initialize
            expect(subscriber).toHaveBeenCalledTimes(2);

            assertLastSubscriber(subscriber, {
              active: 'a',
              activeContent: activeContent.contents[0],
              activeIndex: 0,
              isCircular: false,
              autoplay: false,
              direction: 'left',
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
                  wasActiveBeforeLast: false,
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
                  wasActiveBeforeLast: false,
                },
              ],
            });

            expect(removed).toEqual(['b', 'c']);
          });

          test('middle removal #2', () => {
            const { activeContent, subscriber } = setup({ activeIndex: 2 }, [
              'a',
              'b',
              'c',
              'd',
            ]);

            const removed = activeContent.removeByPredicate(
              (item) => item === 'b' || item === 'c'
            );

            // Once for initialize
            expect(subscriber).toHaveBeenCalledTimes(2);

            assertLastSubscriber(subscriber, {
              active: 'a',
              activeContent: activeContent.contents[0],
              activeIndex: 0,
              isCircular: false,
              autoplay: false,
              direction: 'left',
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
                  wasActiveBeforeLast: false,
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
                  wasActiveBeforeLast: false,
                },
              ],
            });

            expect(removed).toEqual(['b', 'c']);
          });

          test('middle with holes removal #1', () => {
            const { activeContent, subscriber } = setup({ activeIndex: 1 }, [
              'a',
              'b',
              'c',
              'd',
              'e',
            ]);

            const removed = activeContent.removeByPredicate(
              (item) => item === 'b' || item === 'd'
            );

            // Once for initialize
            expect(subscriber).toHaveBeenCalledTimes(2);

            assertLastSubscriber(subscriber, {
              active: 'a',
              activeContent: activeContent.contents[0],
              activeIndex: 0,
              isCircular: false,
              autoplay: false,
              direction: 'left',
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
                  wasActiveBeforeLast: false,
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
                  wasActiveBeforeLast: false,
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
                  wasActiveBeforeLast: false,
                },
              ],
            });

            expect(removed).toEqual(['b', 'd']);
          });

          test('middle with holes removal #3', () => {
            const { activeContent, subscriber } = setup({ activeIndex: 3 }, [
              'a',
              'b',
              'c',
              'd',
              'e',
            ]);

            const removed = activeContent.removeByPredicate(
              (item) => item === 'b' || item === 'd'
            );

            // Once for initialize
            expect(subscriber).toHaveBeenCalledTimes(2);

            assertLastSubscriber(subscriber, {
              active: 'c',
              activeContent: activeContent.contents[1],
              activeIndex: 1,
              isCircular: false,
              autoplay: false,
              direction: 'left',
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
                  wasActiveBeforeLast: false,
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
                  wasActiveBeforeLast: false,
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
                  wasActiveBeforeLast: false,
                },
              ],
            });

            expect(removed).toEqual(['b', 'd']);
          });

          test('end removal', () => {
            const { activeContent, subscriber } = setup({ activeIndex: 2 });

            const removed = activeContent.removeByPredicate(
              (item, index) => index > 0
            );

            // Once for initialize
            expect(subscriber).toHaveBeenCalledTimes(2);

            assertLastSubscriber(subscriber, {
              active: 'a',
              activeContent: activeContent.contents[0],
              activeIndex: 0,
              isCircular: false,
              autoplay: false,
              direction: 'left',
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
                  wasActiveBeforeLast: false,
                },
              ],
            });

            expect(removed).toEqual(['b', 'c']);
          });
        });
      });

      test('when no predicate matches do nothing', () => {
        const { activeContent, subscriber } = setup({ activeIndex: 0 });

        const removed = activeContent.removeByPredicate((item) => item === 'y');

        // Once for initialize
        expect(subscriber).toHaveBeenCalledTimes(1);

        expect(removed).toEqual([]);
      });

      test('when content is already empty do nothing', () => {
        const { activeContent, subscriber } = setup({}, []);

        const removed = activeContent.removeByPredicate((item) => item === 'y');

        // Once for initialize
        expect(subscriber).toHaveBeenCalledTimes(1);

        expect(activeContent.hasActiveChangedAtLeastOnce).toBe(false);

        expect(removed).toEqual([]);
      });
    });

    describe('all methods pass along activationOptions', () => {
      test('removeByIndex', () => {
        const { activeContent } = setup({ activeIndex: 0 });

        jest.spyOn(activeContent, 'previous');

        activeContent.removeByIndex(0, {
          cooldown: 1337,
          isUserInteraction: false,
        });

        expect(activeContent.previous).toBeCalledTimes(1);
        expect(activeContent.previous).toBeCalledWith({
          cooldown: 1337,
          isUserInteraction: false,
        });
      });

      test('remove', () => {
        const { activeContent } = setup({ activeIndex: 0 });

        jest.spyOn(activeContent, 'previous');

        activeContent.remove('a', {
          cooldown: 1337,
          isUserInteraction: false,
        });

        expect(activeContent.previous).toBeCalledTimes(1);
        expect(activeContent.previous).toBeCalledWith({
          cooldown: 1337,
          isUserInteraction: false,
        });
      });

      test('pop', () => {
        const { activeContent } = setup({ activeIndex: 2 });

        jest.spyOn(activeContent, 'previous');

        activeContent.pop({ cooldown: 1337, isUserInteraction: false });

        expect(activeContent.previous).toBeCalledTimes(1);
        expect(activeContent.previous).toBeCalledWith({
          cooldown: 1337,
          isUserInteraction: false,
        });
      });

      test('shift', () => {
        const { activeContent } = setup({ activeIndex: 0 });

        jest.spyOn(activeContent, 'previous');

        activeContent.shift({ cooldown: 1337, isUserInteraction: false });

        expect(activeContent.previous).toBeCalledTimes(1);
        expect(activeContent.previous).toBeCalledWith({
          cooldown: 1337,
          isUserInteraction: false,
        });
      });

      test('removeByPredicate', () => {
        const { activeContent } = setup({ activeIndex: 0 });

        jest.spyOn(activeContent, 'previous');

        activeContent.removeByPredicate((item) => item === 'a', {
          cooldown: 1337,
          isUserInteraction: false,
        });

        expect(activeContent.previous).toBeCalledTimes(1);
        expect(activeContent.previous).toBeCalledWith({
          cooldown: 1337,
          isUserInteraction: false,
        });
      });
    });

    test('empty on pop returns undefined', () => {
      const { activeContent, subscriber } = setup({}, []);

      const removed = activeContent.pop();

      // Once for initialize
      expect(subscriber).toHaveBeenCalledTimes(1);

      assertLastSubscriber(subscriber, {
        active: null,
        activeContent: null,
        activeIndex: -1,
        isCircular: false,
        autoplay: false,
        direction: 'right',
        history: [],
        hasActiveChangedAtLeastOnce: false,
        contents: [],
      });

      expect(removed).toBe(undefined);
    });

    test('empty on shift returns undefined', () => {
      const { activeContent, subscriber } = setup({}, []);

      const removed = activeContent.shift();

      // Once for initialize
      expect(subscriber).toHaveBeenCalledTimes(1);

      assertLastSubscriber(subscriber, {
        active: null,
        activeContent: null,
        activeIndex: -1,
        isCircular: false,
        autoplay: false,
        direction: 'right',
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

  describe('swapping of elements', () => {
    describe('swapByIndex', () => {
      describe('when it throws out of bounds', () => {
        describe('when it throws out of bounds for index a', () => {
          test('throws out of bounds when index is to large', () => {
            const { activeContent } = setup();

            expect(() => {
              activeContent.swapByIndex(4, 0);
            }).toThrowError(
              'automata > ActiveContent.swapByIndex > could not swap: index a out of bounds'
            );
          });

          test('throws out of bounds when index is less than zero', () => {
            const { activeContent } = setup();

            expect(() => {
              activeContent.swapByIndex(-1, 0);
            }).toThrowError(
              'automata > ActiveContent.swapByIndex > could not swap: index a out of bounds'
            );
          });
        });

        describe('when it throws out of bounds for index b', () => {
          test('throws out of bounds when index is to large', () => {
            const { activeContent } = setup();

            expect(() => {
              activeContent.swapByIndex(0, 4);
            }).toThrowError(
              'automata > ActiveContent.swapByIndex > could not swap: index b out of bounds'
            );
          });

          test('throws out of bounds when index is less than zero', () => {
            const { activeContent } = setup();

            expect(() => {
              activeContent.swapByIndex(0, -1);
            }).toThrowError(
              'automata > ActiveContent.swapByIndex > could not swap: index b out of bounds'
            );
          });
        });
      });

      test('swapping from the active index should not affect it', () => {
        const { activeContent, subscriber } = setup({ active: 'b' });

        // Swap b with c
        activeContent.swapByIndex(1, 2);

        expect(subscriber).toHaveBeenCalledTimes(2);

        assertLastSubscriber(subscriber, {
          active: 'b',
          activeContent: activeContent.contents[2],
          activeIndex: 2,
          isCircular: false,
          autoplay: false,
          direction: 'right',
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
            },
          ],
        });
      });

      test('swapping to the active index should not affect it', () => {
        const { activeContent, subscriber } = setup({ active: 'b' });

        // Swap c with b
        activeContent.swapByIndex(2, 1);

        expect(subscriber).toHaveBeenCalledTimes(2);

        assertLastSubscriber(subscriber, {
          active: 'b',
          activeContent: activeContent.contents[2],
          activeIndex: 2,
          isCircular: false,
          autoplay: false,
          direction: 'right',
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
            },
          ],
        });
      });

      test('swapping non active index should not affect the active index', () => {
        const { activeContent, subscriber } = setup({ active: 'b' });

        // Swap a with c
        activeContent.swapByIndex(0, 2);

        expect(subscriber).toHaveBeenCalledTimes(2);

        assertLastSubscriber(subscriber, {
          active: 'b',
          activeContent: activeContent.contents[1],
          activeIndex: 1,
          isCircular: false,
          autoplay: false,
          direction: 'right',
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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

        expect(subscriber).toHaveBeenCalledTimes(2);

        assertLastSubscriber(subscriber, {
          active: 'b',
          activeContent: activeContent.contents[1],
          activeIndex: 1,
          isCircular: true,
          autoplay: false,
          direction: 'right',
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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

        // Once for initialize
        expect(subscriber).toHaveBeenCalledTimes(1);
      });
    });

    test('swap', () => {
      const { activeContent, subscriber } = setup({ active: 'b' });

      // Swap b with c
      activeContent.swap('b', 'c');

      expect(subscriber).toHaveBeenCalledTimes(2);

      assertLastSubscriber(subscriber, {
        active: 'b',
        activeContent: activeContent.contents[2],
        activeIndex: 2,
        isCircular: false,
        autoplay: false,
        direction: 'right',
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
            wasActiveBeforeLast: false,
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
            wasActiveBeforeLast: false,
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
            wasActiveBeforeLast: false,
          },
        ],
      });
    });

    describe('Content methods', () => {
      test('swapWith', () => {
        const { activeContent, subscriber } = setup({ active: 'b' });

        // Swap b with c
        activeContent.contents[1].swapWith('c');

        expect(subscriber).toHaveBeenCalledTimes(2);

        assertLastSubscriber(subscriber, {
          active: 'b',
          activeContent: activeContent.contents[2],
          activeIndex: 2,
          isCircular: false,
          autoplay: false,
          direction: 'right',
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
            },
          ],
        });
      });

      test('swapWithByIndex', () => {
        const { activeContent, subscriber } = setup({ active: 'b' });

        // Swap b with c
        activeContent.contents[1].swapWithByIndex(2);

        expect(subscriber).toHaveBeenCalledTimes(2);

        assertLastSubscriber(subscriber, {
          active: 'b',
          activeContent: activeContent.contents[2],
          activeIndex: 2,
          isCircular: false,
          autoplay: false,
          direction: 'right',
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
            },
          ],
        });
      });

      test('swapWithNext', () => {
        const { activeContent, subscriber } = setup({ active: 'b' });

        // Swap b with c
        activeContent.contents[1].swapWithNext();

        expect(subscriber).toHaveBeenCalledTimes(2);

        assertLastSubscriber(subscriber, {
          active: 'b',
          activeContent: activeContent.contents[2],
          activeIndex: 2,
          isCircular: false,
          autoplay: false,
          direction: 'right',
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
            },
          ],
        });
      });

      test('swapWithPrevious', () => {
        const { activeContent, subscriber } = setup({ active: 'b' });

        // Swap b with a
        activeContent.contents[1].swapWithPrevious();

        expect(subscriber).toHaveBeenCalledTimes(2);

        assertLastSubscriber(subscriber, {
          active: 'b',
          activeContent: activeContent.contents[0],
          activeIndex: 0,
          isCircular: false,
          autoplay: false,
          direction: 'right',
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
            const { activeContent } = setup();

            expect(() => {
              activeContent.moveByIndex(4, 0);
            }).toThrowError(
              'automata > ActiveContent.moveByIndex > could not swap: index "from" out of bounds'
            );
          });

          test('throws out of bounds when index is less than zero', () => {
            const { activeContent } = setup();

            expect(() => {
              activeContent.moveByIndex(-1, 0);
            }).toThrowError(
              'automata > ActiveContent.moveByIndex > could not swap: index "from" out of bounds'
            );
          });
        });

        describe('when it throws out of bounds for index "too"', () => {
          test('throws out of bounds when index is to large', () => {
            const { activeContent } = setup();

            expect(() => {
              activeContent.moveByIndex(0, 4);
            }).toThrowError(
              'automata > ActiveContent.moveByIndex > could not swap: index "to" out of bounds'
            );
          });

          test('throws out of bounds when index is less than zero', () => {
            const { activeContent } = setup();

            expect(() => {
              activeContent.moveByIndex(0, -1);
            }).toThrowError(
              'automata > ActiveContent.moveByIndex > could not swap: index "to" out of bounds'
            );
          });
        });
      });

      test('moving from before the activeIndex to beyond the activeIndex', () => {
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

        expect(subscriber).toHaveBeenCalledTimes(2);

        assertLastSubscriber(subscriber, {
          active: 'D',
          activeContent: activeContent.contents[2],
          activeIndex: 2,
          isCircular: false,
          autoplay: false,
          direction: 'right',
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
            },
          ],
        });
      });

      test('moving from before the active index to directly onto the activeIndex', () => {
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

        expect(subscriber).toHaveBeenCalledTimes(2);

        assertLastSubscriber(subscriber, {
          active: 'D',
          activeContent: activeContent.contents[2],
          activeIndex: 2,
          isCircular: false,
          autoplay: false,
          direction: 'right',
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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

        expect(subscriber).toHaveBeenCalledTimes(2);

        assertLastSubscriber(subscriber, {
          active: 'D',
          activeContent: activeContent.contents[2],
          activeIndex: 2,
          isCircular: false,
          autoplay: false,
          direction: 'right',
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
            },
          ],
        });
      });

      test('moving from beyond the activeIndex to before the active index', () => {
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

        expect(subscriber).toHaveBeenCalledTimes(2);

        assertLastSubscriber(subscriber, {
          active: 'D',
          activeContent: activeContent.contents[4],
          activeIndex: 4,
          isCircular: false,
          autoplay: false,
          direction: 'right',
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
            },
          ],
        });
      });

      test('moving from beyond the activeIndex to directly onto the active index', () => {
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

        expect(subscriber).toHaveBeenCalledTimes(2);

        assertLastSubscriber(subscriber, {
          active: 'D',
          activeContent: activeContent.contents[4],
          activeIndex: 4,
          isCircular: false,
          autoplay: false,
          direction: 'right',
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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

        expect(subscriber).toHaveBeenCalledTimes(2);

        assertLastSubscriber(subscriber, {
          active: 'D',
          activeContent: activeContent.contents[4],
          activeIndex: 4,
          isCircular: false,
          autoplay: false,
          direction: 'right',
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
            },
          ],
        });
      });

      test('moving from beyond the activeIndex to beyond the active index', () => {
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

        expect(subscriber).toHaveBeenCalledTimes(2);

        assertLastSubscriber(subscriber, {
          active: 'D',
          activeContent: activeContent.contents[3],
          activeIndex: 3,
          isCircular: false,
          autoplay: false,
          direction: 'right',
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
            },
          ],
        });
      });

      test('moving from before the activeIndex to before the active index', () => {
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

        expect(subscriber).toHaveBeenCalledTimes(2);

        assertLastSubscriber(subscriber, {
          active: 'D',
          activeContent: activeContent.contents[3],
          activeIndex: 3,
          isCircular: false,
          autoplay: false,
          direction: 'right',
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
            },
          ],
        });
      });

      test('moving from active to beyond active', () => {
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

        expect(subscriber).toHaveBeenCalledTimes(2);

        assertLastSubscriber(subscriber, {
          active: 'D',
          activeContent: activeContent.contents[4],
          activeIndex: 4,
          isCircular: false,
          autoplay: false,
          direction: 'right',
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
            },
          ],
        });
      });

      test('moving from active to before active', () => {
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

        expect(subscriber).toHaveBeenCalledTimes(2);

        assertLastSubscriber(subscriber, {
          active: 'D',
          activeContent: activeContent.contents[2],
          activeIndex: 2,
          isCircular: false,
          autoplay: false,
          direction: 'right',
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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

        expect(subscriber).toHaveBeenCalledTimes(2);

        assertLastSubscriber(subscriber, {
          active: 'D',
          activeContent: activeContent.contents[0],
          activeIndex: 0,
          isCircular: false,
          autoplay: false,
          direction: 'right',
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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

        expect(subscriber).toHaveBeenCalledTimes(2);

        assertLastSubscriber(subscriber, {
          active: 'D',
          activeContent: activeContent.contents[6],
          activeIndex: 6,
          isCircular: false,
          autoplay: false,
          direction: 'right',
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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

        expect(subscriber).toHaveBeenCalledTimes(2);

        assertLastSubscriber(subscriber, {
          active: 'b',
          activeContent: activeContent.contents[0],
          activeIndex: 0,
          isCircular: true,
          autoplay: false,
          direction: 'right',
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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

        expect(subscriber).toHaveBeenCalledTimes(1);
      });
    });

    test('move', () => {
      const { activeContent, subscriber } = setup({ active: 'a' });

      // Move a beyond c
      activeContent.move('a', 2);

      expect(subscriber).toHaveBeenCalledTimes(2);

      assertLastSubscriber(subscriber, {
        active: 'a',
        activeContent: activeContent.contents[2],
        activeIndex: 2,
        isCircular: false,
        autoplay: false,
        direction: 'right',
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
            wasActiveBeforeLast: false,
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
            wasActiveBeforeLast: false,
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
            wasActiveBeforeLast: false,
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

          // Once for initialize
          expect(subscriber).toHaveBeenCalledTimes(1);
        });

        test('move to middle', () => {
          const { activeContent, subscriber } = setup({ active: 'b' });

          activeContent.moveByIndexAtPredicate(
            0,
            (item, index) => item === 'b' && index === 1
          );

          expect(subscriber).toHaveBeenCalledTimes(2);

          assertLastSubscriber(subscriber, {
            active: 'b',
            activeContent: activeContent.contents[0],
            activeIndex: 0,
            isCircular: false,
            autoplay: false,
            direction: 'right',
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
                wasActiveBeforeLast: false,
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
                wasActiveBeforeLast: false,
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
                wasActiveBeforeLast: false,
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

          expect(subscriber).toHaveBeenCalledTimes(2);

          assertLastSubscriber(subscriber, {
            active: 'b',
            activeContent: activeContent.contents[0],
            activeIndex: 0,
            isCircular: false,
            autoplay: false,
            direction: 'right',
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
                wasActiveBeforeLast: false,
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
                wasActiveBeforeLast: false,
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
                wasActiveBeforeLast: false,
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

          expect(subscriber).toHaveBeenCalledTimes(2);

          assertLastSubscriber(subscriber, {
            active: 'b',
            activeContent: activeContent.contents[0],
            activeIndex: 0,
            isCircular: false,
            autoplay: false,
            direction: 'right',
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
                wasActiveBeforeLast: false,
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
                wasActiveBeforeLast: false,
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
                wasActiveBeforeLast: false,
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

          // Once for initialize
          expect(subscriber).toHaveBeenCalledTimes(1);
        });

        test('move to last', () => {
          const { activeContent, subscriber } = setup({ active: 'b' });

          activeContent.moveByIndexAtPredicate(
            1,
            (item, index) => item === 'c' && index === 2
          );

          // Once for initialize
          expect(subscriber).toHaveBeenCalledTimes(2);

          assertLastSubscriber(subscriber, {
            active: 'b',
            activeContent: activeContent.contents[2],
            activeIndex: 2,
            isCircular: false,
            autoplay: false,
            direction: 'right',
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
                wasActiveBeforeLast: false,
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
                wasActiveBeforeLast: false,
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
                wasActiveBeforeLast: false,
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

          expect(subscriber).toHaveBeenCalledTimes(2);

          assertLastSubscriber(subscriber, {
            active: 'b',
            activeContent: activeContent.contents[2],
            activeIndex: 2,
            isCircular: false,
            autoplay: false,
            direction: 'right',
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
                wasActiveBeforeLast: false,
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
                wasActiveBeforeLast: false,
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
                wasActiveBeforeLast: false,
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

          expect(subscriber).toHaveBeenCalledTimes(2);

          assertLastSubscriber(subscriber, {
            active: 'b',
            activeContent: activeContent.contents[2],
            activeIndex: 2,
            isCircular: false,
            autoplay: false,
            direction: 'right',
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
                wasActiveBeforeLast: false,
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
                wasActiveBeforeLast: false,
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
                wasActiveBeforeLast: false,
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

          // Once for initialize
          expect(subscriber).toHaveBeenCalledTimes(1);
        });
      });

      test('when no predicate matches do nothing', () => {
        const { activeContent, subscriber } = setup({ active: 'b' });

        activeContent.moveByIndexAtPredicate(0, (item) => item === 'z');

        // Once for initialize
        expect(subscriber).toHaveBeenCalledTimes(1);
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

          // Once for initialize
          expect(subscriber).toHaveBeenCalledTimes(1);
        });

        test('move to before middle should do nothing', () => {
          const { activeContent, subscriber } = setup({ active: 'b' });

          activeContent.moveByIndexBeforePredicate(
            0,
            (item, index) => item === 'b' && index === 1
          );

          // Once for initialize
          expect(subscriber).toHaveBeenCalledTimes(1);
        });

        test('move to before last', () => {
          const { activeContent, subscriber } = setup({ active: 'b' });

          activeContent.moveByIndexBeforePredicate(
            0,
            (item, index) => item === 'c' && index === 2
          );

          expect(subscriber).toHaveBeenCalledTimes(2);

          assertLastSubscriber(subscriber, {
            active: 'b',
            activeContent: activeContent.contents[0],
            activeIndex: 0,
            isCircular: false,
            autoplay: false,
            direction: 'right',
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
                wasActiveBeforeLast: false,
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
                wasActiveBeforeLast: false,
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
                wasActiveBeforeLast: false,
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

          expect(subscriber).toHaveBeenCalledTimes(2);

          assertLastSubscriber(subscriber, {
            active: 'b',
            activeContent: activeContent.contents[0],
            activeIndex: 0,
            isCircular: false,
            autoplay: false,
            direction: 'right',
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
                wasActiveBeforeLast: false,
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
                wasActiveBeforeLast: false,
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
                wasActiveBeforeLast: false,
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

          expect(subscriber).toHaveBeenCalledTimes(2);

          assertLastSubscriber(subscriber, {
            active: 'b',
            activeContent: activeContent.contents[0],
            activeIndex: 0,
            isCircular: false,
            autoplay: false,
            direction: 'right',
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
                wasActiveBeforeLast: false,
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
                wasActiveBeforeLast: false,
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
                wasActiveBeforeLast: false,
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

          // Once for initialize
          expect(subscriber).toHaveBeenCalledTimes(1);
        });
      });

      describe('moving last item', () => {
        test('move to before first', () => {
          const { activeContent, subscriber } = setup({ active: 'b' });

          activeContent.moveByIndexBeforePredicate(
            2,
            (item, index) => item === 'a' && index === 0
          );

          expect(subscriber).toHaveBeenCalledTimes(2);

          assertLastSubscriber(subscriber, {
            active: 'b',
            activeContent: activeContent.contents[2],
            activeIndex: 2,
            isCircular: false,
            autoplay: false,
            direction: 'right',
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
                wasActiveBeforeLast: false,
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
                wasActiveBeforeLast: false,
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
                wasActiveBeforeLast: false,
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

          expect(subscriber).toHaveBeenCalledTimes(2);

          assertLastSubscriber(subscriber, {
            active: 'b',
            activeContent: activeContent.contents[2],
            activeIndex: 2,
            isCircular: false,
            autoplay: false,
            direction: 'right',
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
                wasActiveBeforeLast: false,
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
                wasActiveBeforeLast: false,
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
                wasActiveBeforeLast: false,
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

          expect(subscriber).toHaveBeenCalledTimes(2);

          assertLastSubscriber(subscriber, {
            active: 'b',
            activeContent: activeContent.contents[2],
            activeIndex: 2,
            isCircular: false,
            autoplay: false,
            direction: 'right',
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
                wasActiveBeforeLast: false,
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
                wasActiveBeforeLast: false,
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
                wasActiveBeforeLast: false,
              },
            ],
          });
        });
      });

      test('when no predicate matches do nothing', () => {
        const { activeContent, subscriber } = setup({ active: 'b' });

        activeContent.moveByIndexBeforePredicate(0, (item) => item === 'z');

        // Once for initialize
        expect(subscriber).toHaveBeenCalledTimes(1);
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

          expect(subscriber).toHaveBeenCalledTimes(2);

          assertLastSubscriber(subscriber, {
            active: 'b',
            activeContent: activeContent.contents[0],
            activeIndex: 0,
            isCircular: false,
            autoplay: false,
            direction: 'right',
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
                wasActiveBeforeLast: false,
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
                wasActiveBeforeLast: false,
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
                wasActiveBeforeLast: false,
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

          expect(subscriber).toHaveBeenCalledTimes(2);

          assertLastSubscriber(subscriber, {
            active: 'b',
            activeContent: activeContent.contents[0],
            activeIndex: 0,
            isCircular: false,
            autoplay: false,
            direction: 'right',
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
                wasActiveBeforeLast: false,
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
                wasActiveBeforeLast: false,
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
                wasActiveBeforeLast: false,
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

          expect(subscriber).toHaveBeenCalledTimes(2);

          assertLastSubscriber(subscriber, {
            active: 'b',
            activeContent: activeContent.contents[0],
            activeIndex: 0,
            isCircular: false,
            autoplay: false,
            direction: 'right',
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
                wasActiveBeforeLast: false,
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
                wasActiveBeforeLast: false,
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
                wasActiveBeforeLast: false,
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

          // Once for initialize
          expect(subscriber).toHaveBeenCalledTimes(1);
        });

        test('move to after middle', () => {
          const { activeContent, subscriber } = setup({ active: 'b' });

          activeContent.moveByIndexAfterPredicate(
            1,
            (item, index) => item === 'b' && index === 1
          );

          expect(subscriber).toHaveBeenCalledTimes(2);

          assertLastSubscriber(subscriber, {
            active: 'b',
            activeContent: activeContent.contents[2],
            activeIndex: 2,
            isCircular: false,
            autoplay: false,
            direction: 'right',
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
                wasActiveBeforeLast: false,
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
                wasActiveBeforeLast: false,
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
                wasActiveBeforeLast: false,
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

          expect(subscriber).toHaveBeenCalledTimes(2);

          assertLastSubscriber(subscriber, {
            active: 'b',
            activeContent: activeContent.contents[2],
            activeIndex: 2,
            isCircular: false,
            autoplay: false,
            direction: 'right',
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
                wasActiveBeforeLast: false,
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
                wasActiveBeforeLast: false,
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
                wasActiveBeforeLast: false,
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

          expect(subscriber).toHaveBeenCalledTimes(2);

          assertLastSubscriber(subscriber, {
            active: 'b',
            activeContent: activeContent.contents[2],
            activeIndex: 2,
            isCircular: false,
            autoplay: false,
            direction: 'right',
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
                wasActiveBeforeLast: false,
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
                wasActiveBeforeLast: false,
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
                wasActiveBeforeLast: false,
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

          // Once for initialize
          expect(subscriber).toHaveBeenCalledTimes(1);
        });

        test('move to after last should do nothing', () => {
          const { activeContent, subscriber } = setup({ active: 'b' });

          activeContent.moveByIndexAfterPredicate(
            2,
            (item, index) => item === 'c' && index === 2
          );

          // Once for initialize
          expect(subscriber).toHaveBeenCalledTimes(1);
        });
      });

      test('when no predicate matches do nothing', () => {
        const { activeContent, subscriber } = setup({ active: 'b' });

        activeContent.moveByIndexAfterPredicate(0, (item) => item === 'z');

        // Once for initialize
        expect(subscriber).toHaveBeenCalledTimes(1);
      });
    });

    describe('moveAtPredicate', () => {
      test('when predicate matches perform move', () => {
        const { activeContent, subscriber } = setup({ active: 'b' });

        activeContent.moveAtPredicate(
          'a',
          (item, index) => item === 'b' && index === 1
        );

        expect(subscriber).toHaveBeenCalledTimes(2);

        assertLastSubscriber(subscriber, {
          active: 'b',
          activeContent: activeContent.contents[0],
          activeIndex: 0,
          isCircular: false,
          autoplay: false,
          direction: 'right',
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
            },
          ],
        });
      });

      test('when no predicate matches do nothing', () => {
        const { activeContent, subscriber } = setup({ active: 'b' });

        activeContent.moveAtPredicate('a', (item) => item === 'z');

        // Once for initialize
        expect(subscriber).toHaveBeenCalledTimes(1);
      });

      test('when item is not found throw error', () => {
        const { activeContent } = setup({ active: 'b' });

        expect(() =>
          activeContent.moveAtPredicate('y', (item) => item === 'z')
        ).toThrowError(
          'automata > ActiveContent.getIndex could not get index for item. Item not in contents array'
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

        expect(subscriber).toHaveBeenCalledTimes(2);

        assertLastSubscriber(subscriber, {
          active: 'b',
          activeContent: activeContent.contents[0],
          activeIndex: 0,
          isCircular: false,
          autoplay: false,
          direction: 'right',
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
            },
          ],
        });
      });

      test('when no predicate matches do nothing', () => {
        const { activeContent, subscriber } = setup({ active: 'b' });

        activeContent.moveBeforePredicate('a', (item) => item === 'z');

        // Once for initialize
        expect(subscriber).toHaveBeenCalledTimes(1);
      });

      test('when item is not found throw error', () => {
        const { activeContent } = setup({ active: 'b' });

        expect(() =>
          activeContent.moveBeforePredicate('y', (item) => item === 'z')
        ).toThrowError(
          'automata > ActiveContent.getIndex could not get index for item. Item not in contents array'
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

        expect(subscriber).toHaveBeenCalledTimes(2);

        assertLastSubscriber(subscriber, {
          active: 'b',
          activeContent: activeContent.contents[0],
          activeIndex: 0,
          isCircular: false,
          autoplay: false,
          direction: 'right',
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
            },
          ],
        });
      });

      test('when no predicate matches do nothing', () => {
        const { activeContent, subscriber } = setup({ active: 'b' });

        activeContent.moveAfterPredicate('a', (item) => item === 'z');

        // Once for initialize
        expect(subscriber).toHaveBeenCalledTimes(1);
      });

      test('when item is not found throw error', () => {
        const { activeContent } = setup({ active: 'b' });

        expect(() =>
          activeContent.moveAfterPredicate('y', (item) => item === 'z')
        ).toThrowError(
          'automata > ActiveContent.getIndex could not get index for item. Item not in contents array'
        );
      });
    });

    describe('Content methods', () => {
      test('moveToIndex', () => {
        const { activeContent, subscriber } = setup({ active: 'a' });

        // Move a beyond c
        activeContent.contents[0].moveToIndex(2);

        expect(subscriber).toHaveBeenCalledTimes(2);

        assertLastSubscriber(subscriber, {
          active: 'a',
          activeContent: activeContent.contents[2],
          activeIndex: 2,
          isCircular: false,
          autoplay: false,
          direction: 'right',
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
            },
          ],
        });
      });

      test('moveToAtPredicate', () => {
        const { activeContent, subscriber } = setup({ active: 'b' });

        activeContent.contents[0].moveToAtPredicate(
          (item, index) => item === 'b' && index === 1
        );

        expect(subscriber).toHaveBeenCalledTimes(2);

        assertLastSubscriber(subscriber, {
          active: 'b',
          activeContent: activeContent.contents[0],
          activeIndex: 0,
          isCircular: false,
          autoplay: false,
          direction: 'right',
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
            },
          ],
        });
      });

      test('moveToBeforePredicate', () => {
        const { activeContent, subscriber } = setup({ active: 'b' });

        activeContent.contents[0].moveToBeforePredicate(
          (item, index) => item === 'c' && index === 2
        );

        expect(subscriber).toHaveBeenCalledTimes(2);

        assertLastSubscriber(subscriber, {
          active: 'b',
          activeContent: activeContent.contents[0],
          activeIndex: 0,
          isCircular: false,
          autoplay: false,
          direction: 'right',
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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

        expect(subscriber).toHaveBeenCalledTimes(2);

        assertLastSubscriber(subscriber, {
          active: 'a',
          activeContent: activeContent.contents[2],
          activeIndex: 2,
          isCircular: false,
          autoplay: false,
          direction: 'right',
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
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
              wasActiveBeforeLast: false,
            },
          ],
        });
      });

      describe('moveToFirst', () => {
        test('moving from the active index should not affect it', () => {
          const { activeContent, subscriber } = setup({ active: 'a' });

          // Move c before a
          activeContent.contents[2].moveToFirst();

          expect(subscriber).toHaveBeenCalledTimes(2);

          assertLastSubscriber(subscriber, {
            active: 'a',
            activeContent: activeContent.contents[1],
            activeIndex: 1,
            isCircular: false,
            autoplay: false,
            direction: 'right',
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
                wasActiveBeforeLast: false,
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
                wasActiveBeforeLast: false,
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
                wasActiveBeforeLast: false,
              },
            ],
          });
        });

        test('moving to the active index should not affect it', () => {
          const { activeContent, subscriber } = setup({ active: 'b' });

          // Move b before a
          activeContent.contents[1].moveToFirst();

          expect(subscriber).toHaveBeenCalledTimes(2);

          assertLastSubscriber(subscriber, {
            active: 'b',
            activeContent: activeContent.contents[0],
            activeIndex: 0,
            isCircular: false,
            autoplay: false,
            direction: 'right',
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
                wasActiveBeforeLast: false,
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
                wasActiveBeforeLast: false,
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
                wasActiveBeforeLast: false,
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

          expect(subscriber).toHaveBeenCalledTimes(2);

          assertLastSubscriber(subscriber, {
            active: 'a',
            activeContent: activeContent.contents[2],
            activeIndex: 2,
            isCircular: false,
            autoplay: false,
            direction: 'right',
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
                wasActiveBeforeLast: false,
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
                wasActiveBeforeLast: false,
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
                wasActiveBeforeLast: false,
              },
            ],
          });
        });

        test('moving to the active index should not affect it', () => {
          const { activeContent, subscriber } = setup({ active: 'b' });

          // Move b beyond c
          activeContent.contents[1].moveToLast();

          expect(subscriber).toHaveBeenCalledTimes(2);

          assertLastSubscriber(subscriber, {
            active: 'b',
            activeContent: activeContent.contents[2],
            activeIndex: 2,
            isCircular: false,
            autoplay: false,
            direction: 'right',
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
                wasActiveBeforeLast: false,
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
                wasActiveBeforeLast: false,
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
                wasActiveBeforeLast: false,
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
          'automata > ActiveContent.autoplay interval cannot be negative or zero'
        );
      });

      test('cannot be zero', () => {
        const autoplay = { interval: 0 };

        expect(() => {
          setup({ autoplay });
        }).toThrowError(
          'automata > ActiveContent.autoplay interval cannot be negative or zero'
        );
      });
    });

    describe('end of content behavior', () => {
      test('goes to the next item after interval and wraps around correctly', () => {
        jest.useFakeTimers();

        const autoplay = { interval: 200 };
        const { activeContent } = setup({ autoplay, isCircular: true });

        expect(activeContent.active).toBe('a');

        jest.advanceTimersByTime(200);
        expect(activeContent.active).toBe('b');

        jest.advanceTimersByTime(200);
        expect(activeContent.active).toBe('c');

        jest.advanceTimersByTime(200);
        expect(activeContent.active).toBe('a');
      });

      test('stops the interval at the last item when isCircular is false', () => {
        jest.useFakeTimers();

        const autoplay = { interval: 200 };
        const { activeContent } = setup({ autoplay, isCircular: false });

        expect(activeContent.active).toBe('a');

        jest.advanceTimersByTime(200);
        expect(activeContent.active).toBe('b');

        jest.advanceTimersByTime(200);
        expect(activeContent.active).toBe('c');

        jest.advanceTimersByTime(200);
        expect(activeContent.active).toBe('c');
      });
    });

    describe('user calling autoplay', () => {
      test('that autoplay can be activated after the component has started', () => {
        jest.useFakeTimers();

        const autoplay = { interval: 200 };
        const { activeContent } = setup({
          autoplay: undefined,
          isCircular: false,
        });

        jest.advanceTimersByTime(200);

        expect(activeContent.active).toBe('a');

        activeContent.autoplay = autoplay;

        jest.advanceTimersByTime(200);

        expect(activeContent.active).toBe('b');
      });

      test('that autoplay can be deactivated by the user', () => {
        jest.useFakeTimers();

        const autoplay = { interval: 200 };
        const { activeContent } = setup({ autoplay, isCircular: true });

        expect(activeContent.active).toBe('a');

        jest.advanceTimersByTime(200);
        expect(activeContent.active).toBe('b');

        activeContent.autoplay = false;
        jest.advanceTimersByTime(200);
        expect(activeContent.active).toBe('b');
      });
    });

    test('user interaction should stop the autoplay when stopsOnUserInteraction is true', () => {
      jest.useFakeTimers();

      const autoplay = { interval: 200, stopsOnUserInteraction: true };
      const { activeContent } = setup({ autoplay, isCircular: true });

      expect(activeContent.active).toBe('a');

      jest.advanceTimersByTime(200);
      expect(activeContent.active).toBe('b');

      activeContent.next({ isUserInteraction: true });
      expect(activeContent.active).toBe('c');

      jest.advanceTimersByTime(200);
      expect(activeContent.active).toBe('c');
    });

    test('when user interacts it should debounce when stopsOnUserInteraction is false', () => {
      jest.useFakeTimers();

      const autoplay = { interval: 200 };
      const { activeContent } = setup({ autoplay, isCircular: true });

      // The active content should be 'a' at the start
      expect(activeContent.active).toBe('a');

      // After 200 milliseconds it should become 'b'
      jest.advanceTimersByTime(200);
      expect(activeContent.active).toBe('b');

      // We move the timer to just before it skips and trigger
      // a user action, it should move to 'c' but debounce the autoplay
      jest.advanceTimersByTime(199);
      activeContent.next({ isUserInteraction: true });
      expect(activeContent.active).toBe('c');

      // The autoplay should now not trigger because it has been debounced
      jest.advanceTimersByTime(1);
      expect(activeContent.active).toBe('c');

      // The autoplay should still not have been triggered
      jest.advanceTimersByTime(198);
      expect(activeContent.active).toBe('c');

      // The autoplay now be triggered
      jest.advanceTimersByTime(1);
      expect(activeContent.active).toBe('a');

      // A double debounce should work as well
      jest.advanceTimersByTime(199);
      activeContent.next({ isUserInteraction: true });
      expect(activeContent.active).toBe('b');

      // Trigger double debounce
      jest.advanceTimersByTime(199);
      activeContent.next({ isUserInteraction: true });
      expect(activeContent.active).toBe('c');
    });

    test('that the interval can be a function instead of just a number', () => {
      jest.useFakeTimers();

      const autoplay = {
        interval: (_item: string, index: number) => (index + 1) * 100,
        stopsOnUserInteraction: false,
      };
      const { activeContent } = setup({ autoplay, isCircular: true });

      expect(activeContent.active).toBe('a');

      jest.advanceTimersByTime(100);
      expect(activeContent.active).toBe('b');

      jest.advanceTimersByTime(200);
      expect(activeContent.active).toBe('c');

      jest.advanceTimersByTime(300);
      expect(activeContent.active).toBe('a');
    });

    test('that autoplay stops when the contents are cleared', () => {
      jest.useFakeTimers();

      const autoplay = {
        interval: (_item: string, index: number) => (index + 1) * 100,
        stopsOnUserInteraction: false,
      };
      const { activeContent } = setup({ autoplay, isCircular: true });

      expect(activeContent.active).toBe('a');

      jest.advanceTimersByTime(100);
      expect(activeContent.active).toBe('b');

      // Now remove all content in between an interval
      activeContent.remove('a');
      activeContent.remove('b');
      activeContent.remove('c');

      // Now check if after the interval the state.active has
      // been set to null.
      jest.advanceTimersByTime(200);
      expect(activeContent.active).toBe(null);
    });
  });

  describe('activation cooldown', () => {
    describe('cooldown errors on activate', () => {
      test('cannot be less than zero', () => {
        const { activeContent } = setup({ cooldown: 600 });

        expect(() => {
          activeContent.activateByIndex(1, {
            isUserInteraction: true,
            cooldown: -1,
          });
        }).toThrowError('automata > cooldown cannot be negative or zero');
      });

      test('cannot be zero', () => {
        const { activeContent } = setup({ cooldown: 600 });

        expect(() => {
          activeContent.activateByIndex(1, {
            isUserInteraction: true,
            cooldown: 0,
          });
        }).toThrowError('automata > cooldown cannot be negative or zero');
      });
    });

    describe('cooldown errors on initialize', () => {
      test('cannot be less than zero', () => {
        expect(() => {
          setup({ cooldown: -1 });
        }).toThrowError('automata > cooldown cannot be negative or zero');
      });

      test('cannot be zero', () => {
        expect(() => {
          setup({ cooldown: 0 });
        }).toThrowError('automata > cooldown cannot be negative or zero');
      });
    });

    test('a cooldown is ignored when isUserInteraction is false', () => {
      let epoch = 0;
      Date.now = jest.fn(() => epoch);

      const { activeContent } = setup({ cooldown: 5000 });

      expect(activeContent.active).toBe('a');

      activeContent.activateByIndex(1, { isUserInteraction: false });
      expect(activeContent.active).toBe('b');
    });

    test('a cooldown from the config', () => {
      let epoch = 0;
      Date.now = jest.fn(() => epoch);

      const { activeContent } = setup({ cooldown: 5000 });

      expect(activeContent.active).toBe('a');

      // Should still be 'a'
      activeContent.activateByIndex(1);
      expect(activeContent.active).toBe('a');

      // Should still be 'a'
      epoch = 4999;
      activeContent.activateByIndex(1);
      expect(activeContent.active).toBe('a');

      // Should still be 'a'
      epoch = 5000;
      activeContent.activateByIndex(1);
      expect(activeContent.active).toBe('a');

      // Now it should be 'b' after 5000 milliseconds
      epoch = 5001;
      activeContent.activateByIndex(1);
      expect(activeContent.active).toBe('b');
    });

    test('a cooldown from options', () => {
      let epoch = 0;
      Date.now = jest.fn(() => epoch);

      const { activeContent } = setup();

      expect(activeContent.active).toBe('a');

      // Should still be 'a'
      activeContent.activateByIndex(1, {
        isUserInteraction: true,
        cooldown: 5000,
      });
      expect(activeContent.active).toBe('a');

      // Should still be 'a'
      epoch = 4999;
      activeContent.activateByIndex(1, {
        isUserInteraction: true,
        cooldown: () => 5000,
      });
      expect(activeContent.active).toBe('a');

      // Should still be 'a'
      epoch = 5000;
      activeContent.activateByIndex(1, {
        isUserInteraction: true,
        cooldown: 5000,
      });
      expect(activeContent.active).toBe('a');

      // Now it should be 'b' after 5000 milliseconds
      epoch = 5001;
      activeContent.activateByIndex(1, {
        isUserInteraction: true,
        cooldown: 5000,
      });
      expect(activeContent.active).toBe('b');

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
      expect(activeContent.active).toBe('b');

      activeContent.activateByIndex(2, {
        isUserInteraction: true,
        cooldown: 5000,
      });
      expect(activeContent.active).toBe('c');
    });

    test('that the cooldown from the ActivationOptions has precedence over the cooldown from the config', () => {
      let epoch = 0;
      Date.now = jest.fn(() => epoch);

      // This cooldown of 5000 should be ignored.
      const { activeContent } = setup({ cooldown: 5000 });

      expect(activeContent.active).toBe('a');

      // Should still be 'a'
      activeContent.activateByIndex(1, {
        isUserInteraction: true,
        cooldown: 10000,
      });
      expect(activeContent.active).toBe('a');

      // Should still be 'a'
      epoch = 9999;
      activeContent.activateByIndex(1, {
        isUserInteraction: true,
        cooldown: 10000,
      });
      expect(activeContent.active).toBe('a');

      // Should still be 'a'
      epoch = 10000;
      activeContent.activateByIndex(1, {
        isUserInteraction: true,
        cooldown: 10000,
      });
      expect(activeContent.active).toBe('a');

      // Now it should be 'b' after 5000 milliseconds
      epoch = 10001;
      activeContent.activateByIndex(1, {
        isUserInteraction: true,
        cooldown: 10000,
      });
      expect(activeContent.active).toBe('b');
    });

    test('that the cooldown can be a function instead of just a number', () => {
      let epoch = 0;
      Date.now = jest.fn(() => epoch);

      const { activeContent } = setup({ cooldown: () => 5000 });

      expect(activeContent.active).toBe('a');

      // Should still be 'a'
      activeContent.activateByIndex(1);
      expect(activeContent.active).toBe('a');

      // Should still be 'a'
      epoch = 4999;
      activeContent.activateByIndex(1);
      expect(activeContent.active).toBe('a');

      // Should still be 'a'
      epoch = 5000;
      activeContent.activateByIndex(1);
      expect(activeContent.active).toBe('a');

      // Now it should be 'b' after 5000 milliseconds
      epoch = 5001;
      activeContent.activateByIndex(1);
      expect(activeContent.active).toBe('b');
    });
  });

  describe('history', () => {
    test('that a correct history is kept for all actions', () => {
      const { activeContent } = setup({ keepHistoryFor: 100 });

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
    });

    test('that a history is kept for a maximum number of items', () => {
      const { activeContent } = setup({ keepHistoryFor: 3 });

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
      const { activeContent } = setup({ keepHistoryFor: 4 });

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
});

type ActiveContentSansContents<T> = Pick<
  ActiveContent<T>,
  | 'active'
  | 'isCircular'
  | 'autoplay'
  | 'activeContent'
  | 'activeIndex'
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
  | 'wasActiveBeforeLast'
>;

function assertLastSubscriber(
  subscriber: jest.Mock<ActiveContent<string>, any>,
  expected: TestState<string>
) {
  const lastCall = subscriber.mock.calls[subscriber.mock.calls.length - 1];
  const call: ActiveContent<string> = lastCall[0];

  const callAsTestState: TestState<string> = {
    active: call.active,
    isCircular: call.isCircular,
    autoplay: call.autoplay,
    activeContent: call.activeContent,
    activeIndex: call.activeIndex,
    hasActiveChangedAtLeastOnce: call.hasActiveChangedAtLeastOnce,
    direction: call.direction,
    history: call.history,
    contents: call.contents.map((content) => {
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
        wasActiveBeforeLast: content.wasActiveBeforeLast,
      };

      return contentAsTestContent;
    }),
  };

  expect(callAsTestState).toEqual(expected);
}
