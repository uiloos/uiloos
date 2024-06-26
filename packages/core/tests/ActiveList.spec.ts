import {
  expect,
  jest,
  test,
  describe,
  beforeEach,
  afterEach,
} from '@jest/globals';

import {
  ActiveList,
  ActiveListConfig,
  ActiveListEvent,
  ActiveListContent,
  ActiveListIndexOutOfBoundsError,
  ActiveListActivationLimitReachedError,
  ActiveListCooldownDurationError,
  ActiveListAutoPlayDurationError,
  ActiveListItemNotFoundError,
  ActiveListEventType,
  createActiveListSubscriber,
  CreateActiveListSubscriberConfig,
} from '../src/ActiveList';

import { licenseChecker } from '../src/license';

import { UnsubscribeFunction } from '../src/generic/types';

type TestConfig = Omit<ActiveListConfig<string>, 'contents'>;

describe('ActiveList', () => {
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

  function setup(
    config: TestConfig = {
      isCircular: false,
      autoPlay: undefined,
      maxActivationLimit: 1,
      maxActivationLimitBehavior: 'circular',
      keepHistoryFor: 0,
    },
    contents = ['a', 'b', 'c']
  ) {
    const activeList = new ActiveList({
      contents,
      ...config,
    });

    const subscriber = jest.fn();
    unsubscribe = activeList.subscribe(subscriber);

    return { subscriber, contents, activeList };
  }

  describe('constructor', () => {
    test('without a config it should be empty', () => {
      const activeList: ActiveList<string> = new ActiveList();

      const subscriber = jest.fn();
      unsubscribe = activeList.subscribe(subscriber);

      assertState(activeList, {
        active: [],
        activeContents: [],
        activeIndexes: [],
        lastActivated: null,
        lastActivatedContent: null,
        lastActivatedIndex: -1,
        lastDeactivated: null,
        lastDeactivatedContent: null,
        lastDeactivatedIndex: -1,
        isCircular: false,
        direction: 'right',
        oppositeDirection: 'left',
        maxActivationLimit: 1,
        maxActivationLimitBehavior: 'circular',
        history: [],
        hasActiveChangedAtLeastOnce: false,
        autoPlay: {
          isPlaying: false,
          hasBeenStoppedBefore: false,
          duration: 0,
        },
        cooldown: {
          isActive: false,
          duration: 0,
        },
        contents: [],
      });

      expect(subscriber).toHaveBeenCalledTimes(0);
    });

    test('with initial subscriber', () => {
      const subscriber = jest.fn();
      const activeList = new ActiveList(
        { contents: ['a', 'b', 'c'], activeIndexes: 1 },
        subscriber
      );

      unsubscribe = () => {
        activeList.unsubscribe(subscriber);
      };

      assertState(activeList, {
        active: ['b'],
        activeContents: [activeList.contents[1]],
        activeIndexes: [1],
        lastActivated: 'b',
        lastActivatedContent: activeList.contents[1],
        lastActivatedIndex: 1,
        lastDeactivated: null,
        lastDeactivatedContent: null,
        lastDeactivatedIndex: -1,
        isCircular: false,
        direction: 'right',
        oppositeDirection: 'left',
        maxActivationLimit: 1,
        maxActivationLimitBehavior: 'circular',
        history: [],
        hasActiveChangedAtLeastOnce: false,
        autoPlay: {
          isPlaying: false,
          hasBeenStoppedBefore: false,
          duration: 0,
        },
        cooldown: {
          isActive: false,
          duration: 0,
        },
        contents: [
          {
            isActive: false,
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
            isActive: true,
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
            isActive: false,
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
        activeList,
        expect.objectContaining({
          type: 'INITIALIZED',
          indexes: [1],
          values: ['b'],
        })
      );
    });

    test('without config but with initial subscriber', () => {
      const subscriber = jest.fn();
      const activeList: ActiveList<string> = new ActiveList(
        undefined,
        subscriber
      );

      unsubscribe = () => {
        activeList.unsubscribe(subscriber);
      };

      assertState(activeList, {
        active: [],
        activeContents: [],
        activeIndexes: [],
        lastActivated: null,
        lastActivatedContent: null,
        lastActivatedIndex: -1,
        lastDeactivated: null,
        lastDeactivatedContent: null,
        lastDeactivatedIndex: -1,
        isCircular: false,
        direction: 'right',
        oppositeDirection: 'left',
        maxActivationLimit: 1,
        maxActivationLimitBehavior: 'circular',
        history: [],
        hasActiveChangedAtLeastOnce: false,
        autoPlay: {
          isPlaying: false,
          hasBeenStoppedBefore: false,
          duration: 0,
        },
        cooldown: {
          isActive: false,
          duration: 0,
        },
        contents: [],
      });

      expect(subscriber).toHaveBeenCalledTimes(1);
      expect(subscriber).toHaveBeenCalledWith(
        activeList,
        expect.objectContaining({
          type: 'INITIALIZED',
          indexes: [],
          values: [],
        })
      );
    });

    test('that it throws error when activation limit is reached', () => {
      expect(() => {
        new ActiveList({
          contents: ['a', 'b', 'c'],
          activeIndexes: [0, 2],
          maxActivationLimit: 1,
          maxActivationLimitBehavior: 'error',
        });
      }).toThrowError(
        `uiloos > ActiveList > activateByIndex > activation limit reached`
      );

      expect(() => {
        new ActiveList({
          contents: ['a', 'b', 'c'],
          activeIndexes: [0, 2],
          maxActivationLimit: 1,
          maxActivationLimitBehavior: 'error',
        });
      }).toThrowError(ActiveListActivationLimitReachedError);
    });
  });

  describe('initialize', () => {
    test('with initial active element', () => {
      const { activeList, subscriber } = setup({ active: 'b' });

      assertState(activeList, {
        active: ['b'],
        activeContents: [activeList.contents[1]],
        activeIndexes: [1],
        lastActivated: 'b',
        lastActivatedContent: activeList.contents[1],
        lastActivatedIndex: 1,
        lastDeactivated: null,
        lastDeactivatedContent: null,
        lastDeactivatedIndex: -1,
        isCircular: false,
        direction: 'right',
        oppositeDirection: 'left',
        maxActivationLimit: 1,
        maxActivationLimitBehavior: 'circular',
        history: [],
        hasActiveChangedAtLeastOnce: false,
        autoPlay: {
          isPlaying: false,
          hasBeenStoppedBefore: false,
          duration: 0,
        },
        cooldown: {
          isActive: false,
          duration: 0,
        },
        contents: [
          {
            isActive: false,
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
            isActive: true,
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
            isActive: false,
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
      const { activeList, subscriber } = setup({
        active: ['a', 'b'],
        maxActivationLimit: false,
      });

      assertState(activeList, {
        active: ['a', 'b'],
        activeContents: [activeList.contents[0], activeList.contents[1]],
        activeIndexes: [0, 1],
        lastActivated: 'b',
        lastActivatedContent: activeList.contents[1],
        lastActivatedIndex: 1,
        lastDeactivated: null,
        lastDeactivatedContent: null,
        lastDeactivatedIndex: -1,
        isCircular: false,
        direction: 'right',
        oppositeDirection: 'left',
        maxActivationLimit: false,
        maxActivationLimitBehavior: 'circular',
        history: [],
        hasActiveChangedAtLeastOnce: false,
        autoPlay: {
          isPlaying: false,
          hasBeenStoppedBefore: false,
          duration: 0,
        },
        cooldown: {
          isActive: false,
          duration: 0,
        },
        contents: [
          {
            isActive: true,
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
            isActive: true,
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
            isActive: false,
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
      const { activeList, subscriber } = setup({
        active: ['b', 'a'],
        maxActivationLimit: false,
      });

      assertState(activeList, {
        active: ['b', 'a'],
        activeContents: [activeList.contents[1], activeList.contents[0]],
        activeIndexes: [1, 0],
        lastActivated: 'a',
        lastActivatedContent: activeList.contents[0],
        lastActivatedIndex: 0,
        lastDeactivated: null,
        lastDeactivatedContent: null,
        lastDeactivatedIndex: -1,
        isCircular: false,
        direction: 'right',
        oppositeDirection: 'left',
        maxActivationLimit: false,
        maxActivationLimitBehavior: 'circular',
        history: [],
        hasActiveChangedAtLeastOnce: false,
        autoPlay: {
          isPlaying: false,
          hasBeenStoppedBefore: false,
          duration: 0,
        },
        cooldown: {
          isActive: false,
          duration: 0,
        },
        contents: [
          {
            isActive: true,
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
            isActive: true,
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
            isActive: false,
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
      const { activeList, subscriber } = setup({ activeIndexes: 2 });

      assertState(activeList, {
        active: ['c'],
        activeContents: [activeList.contents[2]],
        activeIndexes: [2],
        lastActivated: 'c',
        lastActivatedContent: activeList.contents[2],
        lastActivatedIndex: 2,
        lastDeactivated: null,
        lastDeactivatedContent: null,
        lastDeactivatedIndex: -1,
        isCircular: false,
        direction: 'right',
        oppositeDirection: 'left',
        maxActivationLimit: 1,
        maxActivationLimitBehavior: 'circular',
        history: [],
        hasActiveChangedAtLeastOnce: false,
        autoPlay: {
          isPlaying: false,
          hasBeenStoppedBefore: false,
          duration: 0,
        },
        cooldown: {
          isActive: false,
          duration: 0,
        },
        contents: [
          {
            isActive: false,
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
            isActive: false,
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
            isActive: true,
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
      const { activeList, subscriber } = setup({
        activeIndexes: [0, 2],
        maxActivationLimit: false,
      });

      assertState(activeList, {
        active: ['a', 'c'],
        activeContents: [activeList.contents[0], activeList.contents[2]],
        activeIndexes: [0, 2],
        lastActivated: 'c',
        lastActivatedContent: activeList.contents[2],
        lastActivatedIndex: 2,
        lastDeactivated: null,
        lastDeactivatedContent: null,
        lastDeactivatedIndex: -1,
        isCircular: false,
        direction: 'right',
        oppositeDirection: 'left',
        maxActivationLimit: false,
        maxActivationLimitBehavior: 'circular',
        history: [],
        hasActiveChangedAtLeastOnce: false,
        autoPlay: {
          isPlaying: false,
          hasBeenStoppedBefore: false,
          duration: 0,
        },
        cooldown: {
          isActive: false,
          duration: 0,
        },
        contents: [
          {
            isActive: true,
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
            isActive: false,
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
            isActive: true,
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
      const { activeList, subscriber } = setup({
        activeIndexes: [2, 0],
        maxActivationLimit: false,
      });

      assertState(activeList, {
        active: ['c', 'a'],
        activeContents: [activeList.contents[2], activeList.contents[0]],
        activeIndexes: [2, 0],
        lastActivated: 'a',
        lastActivatedContent: activeList.contents[0],
        lastActivatedIndex: 0,
        lastDeactivated: null,
        lastDeactivatedContent: null,
        lastDeactivatedIndex: -1,
        isCircular: false,
        direction: 'right',
        oppositeDirection: 'left',
        maxActivationLimit: false,
        maxActivationLimitBehavior: 'circular',
        history: [],
        hasActiveChangedAtLeastOnce: false,
        autoPlay: {
          isPlaying: false,
          hasBeenStoppedBefore: false,
          duration: 0,
        },
        cooldown: {
          isActive: false,
          duration: 0,
        },
        contents: [
          {
            isActive: true,
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
            isActive: false,
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
            isActive: true,
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
      const { activeList, subscriber } = setup({});

      assertState(activeList, {
        active: [],
        activeContents: [],
        activeIndexes: [],
        lastActivated: null,
        lastActivatedContent: null,
        lastActivatedIndex: -1,
        lastDeactivated: null,
        lastDeactivatedContent: null,
        lastDeactivatedIndex: -1,
        isCircular: false,
        direction: 'right',
        oppositeDirection: 'left',
        maxActivationLimit: 1,
        maxActivationLimitBehavior: 'circular',
        history: [],
        hasActiveChangedAtLeastOnce: false,
        autoPlay: {
          isPlaying: false,
          hasBeenStoppedBefore: false,
          duration: 0,
        },
        cooldown: {
          isActive: false,
          duration: 0,
        },
        contents: [
          {
            isActive: false,
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
            isActive: false,
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
            isActive: false,
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
      const { activeList, subscriber } = setup({}, []);

      assertState(activeList, {
        active: [],
        activeContents: [],
        activeIndexes: [],
        lastActivated: null,
        lastActivatedContent: null,
        lastActivatedIndex: -1,
        lastDeactivated: null,
        lastDeactivatedContent: null,
        lastDeactivatedIndex: -1,
        isCircular: false,
        direction: 'right',
        oppositeDirection: 'left',
        maxActivationLimit: 1,
        maxActivationLimitBehavior: 'circular',
        history: [],
        hasActiveChangedAtLeastOnce: false,
        autoPlay: {
          isPlaying: false,
          hasBeenStoppedBefore: false,
          duration: 0,
        },
        cooldown: {
          isActive: false,
          duration: 0,
        },
        contents: [],
      });

      expect(subscriber).toHaveBeenCalledTimes(0);
    });

    test('that it throws error when activation limit is reached', () => {
      const activeList = new ActiveList();

      expect(() => {
        activeList.initialize({
          contents: ['a', 'b', 'c'],
          activeIndexes: [0, 2],
          maxActivationLimit: 1,
          maxActivationLimitBehavior: 'error',
        });
      }).toThrowError(
        `uiloos > ActiveList > activateByIndex > activation limit reached`
      );

      expect(() => {
        activeList.initialize({
          contents: ['a', 'b', 'c'],
          activeIndexes: [0, 2],
          maxActivationLimit: 1,
          maxActivationLimitBehavior: 'error',
        });
      }).toThrowError(ActiveListActivationLimitReachedError);
    });

    describe('reset behavior', () => {
      test('that initialize can reset the ActiveList', () => {
        const { activeList, subscriber } = setup({
          activeIndexes: 2,
          cooldown: 1000,
          autoPlay: { duration: 1000 },
        });

        expect(activeList.contents.map((v) => v.value)).toEqual([
          'a',
          'b',
          'c',
        ]);

        // autoPlay should be reset when initialized
        expect(activeList.autoPlay).toEqual({
          isPlaying: true,
          duration: 1000,
          hasBeenStoppedBefore: false,
        });

        activeList.stop();

        expect(activeList.autoPlay).toEqual({
          isPlaying: false,
          duration: 0,
          hasBeenStoppedBefore: true,
        });

        // Trigger cooldown
        activeList.activateByIndex(0);

        // `cooldown` should be reset when initialized
        expect(activeList.cooldown).toEqual({ isActive: true, duration: 1000 });

        // `lastDeactivated` and co should also be reset when initialized
        expect(activeList.lastDeactivated).toBe('c');
        expect(activeList.lastDeactivatedIndex).toBe(2);
        expect(activeList.lastDeactivatedContent).toBe(activeList.contents[2]);

        const result = activeList.initialize({
          contents: ['d', 'e', 'f', 'g'],
          activeIndexes: 0,
        });

        assertLastSubscriber(
          subscriber,
          {
            active: ['d'],
            activeContents: [activeList.contents[0]],
            activeIndexes: [0],
            lastActivated: 'd',
            lastActivatedContent: activeList.contents[0],
            lastActivatedIndex: 0,
            lastDeactivated: null,
            lastDeactivatedContent: null,
            lastDeactivatedIndex: -1,
            isCircular: false,
            direction: 'right',
            oppositeDirection: 'left',
            maxActivationLimit: 1,
            maxActivationLimitBehavior: 'circular',
            history: [],
            hasActiveChangedAtLeastOnce: false,
            autoPlay: {
              isPlaying: false,
              hasBeenStoppedBefore: false,
              duration: 0,
            },
            cooldown: {
              isActive: false,
              duration: 0,
            },
            contents: [
              {
                isActive: true,
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
                isActive: false,
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
                isActive: false,
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
                isActive: false,
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
        const { activeList, subscriber } = setup();
        activeList.initialize({ contents: [] });

        assertLastSubscriber(
          subscriber,
          {
            active: [],
            activeContents: [],
            activeIndexes: [],
            lastActivated: null,
            lastActivatedContent: null,
            lastActivatedIndex: -1,
            lastDeactivated: null,
            lastDeactivatedContent: null,
            lastDeactivatedIndex: -1,
            isCircular: false,
            direction: 'right',
            oppositeDirection: 'left',
            maxActivationLimit: 1,
            maxActivationLimitBehavior: 'circular',
            history: [],
            hasActiveChangedAtLeastOnce: false,
            autoPlay: {
              isPlaying: false,
              hasBeenStoppedBefore: false,
              duration: 0,
            },
            cooldown: {
              isActive: false,
              duration: 0,
            },
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
        const { activeList, subscriber } = setup(
          { isCircular: true, activeIndexes: 0 },
          ['a']
        );

        assertState(activeList, {
          active: ['a'],
          activeContents: [activeList.contents[0]],
          activeIndexes: [0],
          lastActivated: 'a',
          lastActivatedContent: activeList.contents[0],
          lastActivatedIndex: 0,
          lastDeactivated: null,
          lastDeactivatedContent: null,
          lastDeactivatedIndex: -1,
          isCircular: true,
          direction: 'right',
          oppositeDirection: 'left',
          maxActivationLimit: 1,
          maxActivationLimitBehavior: 'circular',
          history: [],
          hasActiveChangedAtLeastOnce: false,
          autoPlay: {
            isPlaying: false,
            hasBeenStoppedBefore: false,
            duration: 0,
          },
          cooldown: {
            isActive: false,
            duration: 0,
          },
          contents: [
            {
              isActive: true,
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
        const { activeList, subscriber } = setup(
          { isCircular: false, activeIndexes: 0 },
          ['a']
        );

        assertState(activeList, {
          active: ['a'],
          activeContents: [activeList.contents[0]],
          activeIndexes: [0],
          lastActivated: 'a',
          lastActivatedContent: activeList.contents[0],
          lastActivatedIndex: 0,
          lastDeactivated: null,
          lastDeactivatedContent: null,
          lastDeactivatedIndex: -1,
          isCircular: false,
          direction: 'right',
          oppositeDirection: 'left',
          maxActivationLimit: 1,
          maxActivationLimitBehavior: 'circular',
          history: [],
          hasActiveChangedAtLeastOnce: false,
          autoPlay: {
            isPlaying: false,
            hasBeenStoppedBefore: false,
            duration: 0,
          },
          cooldown: {
            isActive: false,
            duration: 0,
          },
          contents: [
            {
              isActive: true,
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
          const { activeList, subscriber } = setup({});

          expect(() => {
            activeList.activateByIndex(4);
          }).toThrowError(
            `uiloos > ActiveList > activateByIndex > "index" is out of bounds`
          );

          expect(() => {
            activeList.activateByIndex(4);
          }).toThrowError(ActiveListIndexOutOfBoundsError);

          expect(() => {
            activeList.activateByIndex(3);
          }).toThrowError(
            `uiloos > ActiveList > activateByIndex > "index" is out of bounds`
          );

          expect(() => {
            activeList.activateByIndex(3);
          }).toThrowError(ActiveListIndexOutOfBoundsError);

          expect(subscriber).toHaveBeenCalledTimes(0);

          expect(activeList.active).toEqual([]);
        });

        test('throws out of bounds when index is less than zero', () => {
          const { activeList, subscriber } = setup({});

          expect(() => {
            activeList.activateByIndex(-1);
          }).toThrowError(
            `uiloos > ActiveList > activateByIndex > "index" is out of bounds`
          );

          expect(() => {
            activeList.activateByIndex(-1);
          }).toThrowError(ActiveListIndexOutOfBoundsError);

          expect(subscriber).toHaveBeenCalledTimes(0);

          expect(activeList.active).toEqual([]);
        });
      });

      test('that when activating an already active index that it does nothing', () => {
        const { activeList, subscriber } = setup({ activeIndexes: 2 });

        activeList.activateByIndex(2);

        expect(subscriber).toHaveBeenCalledTimes(0);
      });

      describe('when maxActivationLimit is N', () => {
        test("when behavior is 'circular' once the limit is reached, the first one in is the first one out", () => {
          const { activeList, subscriber } = setup({
            activeIndexes: 0,
            maxActivationLimit: 2,
            maxActivationLimitBehavior: 'circular',
          });

          activeList.activateByIndex(1);

          expect(subscriber).toHaveBeenCalledTimes(1);
          assertLastSubscriber(
            subscriber,
            {
              active: ['a', 'b'],
              activeContents: [activeList.contents[0], activeList.contents[1]],
              activeIndexes: [0, 1],
              lastActivated: 'b',
              lastActivatedContent: activeList.contents[1],
              lastActivatedIndex: 1,
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: 2,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: true,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              isCircular: false,
              contents: [
                {
                  isActive: true,
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
                  isActive: true,
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
                  isActive: false,
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
              deactivatedIndex: -1,
              deactivatedValue: null,
              time: new Date(),
            }
          );

          activeList.activateByIndex(2);

          expect(subscriber).toHaveBeenCalledTimes(2);
          assertLastSubscriber(
            subscriber,
            {
              active: ['b', 'c'],
              activeContents: [activeList.contents[1], activeList.contents[2]],
              activeIndexes: [1, 2],
              lastActivated: 'c',
              lastActivatedContent: activeList.contents[2],
              lastActivatedIndex: 2,
              lastDeactivated: 'a',
              lastDeactivatedContent: activeList.contents[0],
              lastDeactivatedIndex: 0,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: 2,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: true,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              isCircular: false,
              contents: [
                {
                  isActive: false,
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
                  isActive: true,
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
                  isActive: true,
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
              deactivatedIndex: 0,
              deactivatedValue: 'a',
              time: new Date(),
            }
          );

          activeList.activateByIndex(0);

          expect(subscriber).toHaveBeenCalledTimes(3);
          assertLastSubscriber(
            subscriber,
            {
              active: ['c', 'a'],
              activeContents: [activeList.contents[2], activeList.contents[0]],
              activeIndexes: [2, 0],
              lastActivated: 'a',
              lastActivatedContent: activeList.contents[0],
              lastActivatedIndex: 0,
              lastDeactivated: 'b',
              lastDeactivatedContent: activeList.contents[1],
              lastDeactivatedIndex: 1,
              direction: 'left',
              oppositeDirection: 'right',
              maxActivationLimit: 2,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: true,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              isCircular: false,
              contents: [
                {
                  isActive: true,
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
                  isActive: false,
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
                  isActive: true,
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
              deactivatedIndex: 1,
              deactivatedValue: 'b',
              time: new Date(),
            }
          );
        });

        test("when behavior is 'ignore' once the limit is reached items should no longer be added, but no errors are thrown", () => {
          const { activeList, subscriber } = setup({
            activeIndexes: 0,
            maxActivationLimit: 2,
            maxActivationLimitBehavior: 'ignore',
          });

          activeList.activateByIndex(1);

          expect(subscriber).toHaveBeenCalledTimes(1);
          assertLastSubscriber(
            subscriber,
            {
              active: ['a', 'b'],
              activeContents: [activeList.contents[0], activeList.contents[1]],
              activeIndexes: [0, 1],
              lastActivated: 'b',
              lastActivatedContent: activeList.contents[1],
              lastActivatedIndex: 1,
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: 2,
              maxActivationLimitBehavior: 'ignore',
              history: [],
              hasActiveChangedAtLeastOnce: true,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              isCircular: false,
              contents: [
                {
                  isActive: true,
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
                  isActive: true,
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
                  isActive: false,
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
              deactivatedIndex: -1,
              deactivatedValue: null,
              time: new Date(),
            }
          );

          // Nothing should happen once the limit is reached
          activeList.activateByIndex(2);
          expect(subscriber).toHaveBeenCalledTimes(1);

          // Nothing should happen once the limit is reached
          activeList.activateByIndex(0);
          expect(subscriber).toHaveBeenCalledTimes(1);

          // Now deactivate an active index
          activeList.deactivateByIndex(0);
          expect(subscriber).toHaveBeenCalledTimes(2);

          // This should now be allowed
          activeList.activateByIndex(2);
          expect(subscriber).toHaveBeenCalledTimes(3);
        });

        test("when behavior is 'error' once the limit is reached and error should be thrown", () => {
          const { activeList, subscriber } = setup({
            activeIndexes: 0,
            maxActivationLimit: 2,
            maxActivationLimitBehavior: 'error',
          });

          activeList.activateByIndex(1);

          expect(subscriber).toHaveBeenCalledTimes(1);
          assertLastSubscriber(
            subscriber,
            {
              active: ['a', 'b'],
              activeContents: [activeList.contents[0], activeList.contents[1]],
              activeIndexes: [0, 1],
              lastActivated: 'b',
              lastActivatedContent: activeList.contents[1],
              lastActivatedIndex: 1,
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: 2,
              maxActivationLimitBehavior: 'error',
              history: [],
              hasActiveChangedAtLeastOnce: true,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              isCircular: false,
              contents: [
                {
                  isActive: true,
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
                  isActive: true,
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
                  isActive: false,
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
              deactivatedIndex: -1,
              deactivatedValue: null,
              time: new Date(),
            }
          );

          expect(() => {
            activeList.activateByIndex(2);
          }).toThrowError(
            'uiloos > ActiveList > activateByIndex > activation limit reached'
          );

          expect(() => {
            activeList.activateByIndex(2);
          }).toThrowError(ActiveListActivationLimitReachedError);

          // Now deactivate an active index
          activeList.deactivateByIndex(0);
          expect(subscriber).toHaveBeenCalledTimes(2);

          // This should now be allowed
          activeList.activateByIndex(2);
          expect(subscriber).toHaveBeenCalledTimes(3);
        });

        test('edge case that the deactivatedIndex and deactivatedValue are only set when it has actually changed', () => {
          const { activeList, subscriber } = setup({
            activeIndexes: 0,
            maxActivationLimit: 2,
            maxActivationLimitBehavior: 'circular',
          });

          // That 'a' was deactivated should be remembered
          activeList.deactivateByIndex(0);

          // But 'a' should not be the deactivatedIndex nor the deactivatedValue
          activeList.activateByIndex(1);

          expect(subscriber).toHaveBeenCalledTimes(2);
          assertLastSubscriber(
            subscriber,
            {
              active: ['b'],
              activeContents: [activeList.contents[1]],
              activeIndexes: [1],
              lastActivated: 'b',
              lastActivatedContent: activeList.contents[1],
              lastActivatedIndex: 1,
              lastDeactivated: 'a',
              lastDeactivatedContent: activeList.contents[0],
              lastDeactivatedIndex: 0,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: 2,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: true,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              isCircular: false,
              contents: [
                {
                  isActive: false,
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
                  isActive: true,
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
                  isActive: false,
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
              deactivatedIndex: -1,
              deactivatedValue: null,
              time: new Date(),
            }
          );
        });
      });

      describe('motion when maxActivationLimit is N', () => {
        test('moving right', () => {
          const { activeList, subscriber } = setup({
            activeIndexes: 0,
            maxActivationLimit: 1,
          });

          activeList.activateByIndex(1);

          expect(subscriber).toHaveBeenCalledTimes(1);
          assertLastSubscriber(
            subscriber,
            {
              active: ['b'],
              activeContents: [activeList.contents[1]],
              activeIndexes: [1],
              lastActivated: 'b',
              lastActivatedContent: activeList.contents[1],
              lastActivatedIndex: 1,
              lastDeactivated: 'a',
              lastDeactivatedContent: activeList.contents[0],
              lastDeactivatedIndex: 0,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: true,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              isCircular: false,
              contents: [
                {
                  isActive: false,
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
                  isActive: true,
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
                  isActive: false,
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
              deactivatedIndex: 0,
              deactivatedValue: 'a',
              time: new Date(),
            }
          );

          activeList.activateByIndex(2);

          expect(subscriber).toHaveBeenCalledTimes(2);
          assertLastSubscriber(
            subscriber,
            {
              active: ['c'],
              activeContents: [activeList.contents[2]],
              activeIndexes: [2],
              lastActivated: 'c',
              lastActivatedContent: activeList.contents[2],
              lastActivatedIndex: 2,
              lastDeactivated: 'b',
              lastDeactivatedContent: activeList.contents[1],
              lastDeactivatedIndex: 1,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: true,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              isCircular: false,
              contents: [
                {
                  isActive: false,
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
                  isActive: false,
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
                  isActive: true,
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
              deactivatedIndex: 1,
              deactivatedValue: 'b',
              time: new Date(),
            }
          );
        });

        test('moving left', () => {
          const { activeList, subscriber } = setup({ activeIndexes: 2 });

          activeList.activateByIndex(1);

          expect(subscriber).toHaveBeenCalledTimes(1);
          assertLastSubscriber(
            subscriber,
            {
              active: ['b'],
              activeContents: [activeList.contents[1]],
              activeIndexes: [1],
              lastActivated: 'b',
              lastActivatedContent: activeList.contents[1],
              lastActivatedIndex: 1,
              lastDeactivated: 'c',
              lastDeactivatedContent: activeList.contents[2],
              lastDeactivatedIndex: 2,
              direction: 'left',
              oppositeDirection: 'right',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: true,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              isCircular: false,
              contents: [
                {
                  isActive: false,
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
                  isActive: true,
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
                  isActive: false,
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
              deactivatedIndex: 2,
              deactivatedValue: 'c',
              time: new Date(),
            }
          );

          activeList.activateByIndex(0);

          expect(subscriber).toHaveBeenCalledTimes(2);
          assertLastSubscriber(
            subscriber,
            {
              active: ['a'],
              activeContents: [activeList.contents[0]],
              activeIndexes: [0],
              lastActivated: 'a',
              lastActivatedContent: activeList.contents[0],
              lastActivatedIndex: 0,
              lastDeactivated: 'b',
              lastDeactivatedContent: activeList.contents[1],
              lastDeactivatedIndex: 1,
              direction: 'left',
              oppositeDirection: 'right',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: true,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              isCircular: false,
              contents: [
                {
                  isActive: true,
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
                  isActive: false,
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
                  isActive: false,
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
              deactivatedIndex: 1,
              deactivatedValue: 'b',
              time: new Date(),
            }
          );
        });
      });

      describe('motion when maxActivationLimit is false', () => {
        describe('when circular', () => {
          test('moving right', () => {
            const { activeList, subscriber } = setup({
              maxActivationLimit: false,
              activeIndexes: 1,
              isCircular: true,
            });

            activeList.activateByIndex(2);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(
              subscriber,
              {
                active: ['b', 'c'],
                activeContents: [
                  activeList.contents[1],
                  activeList.contents[2],
                ],
                activeIndexes: [1, 2],
                lastActivated: 'c',
                lastActivatedContent: activeList.contents[2],
                lastActivatedIndex: 2,
                lastDeactivated: null,
                lastDeactivatedContent: null,
                lastDeactivatedIndex: -1,
                direction: 'right',
                oppositeDirection: 'left',
                maxActivationLimit: false,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                isCircular: true,
                contents: [
                  {
                    isActive: false,
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
                    isActive: true,
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
                    isActive: true,
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
                deactivatedIndex: -1,
                deactivatedValue: null,
                time: new Date(),
              }
            );

            activeList.activateByIndex(0);

            expect(subscriber).toHaveBeenCalledTimes(2);
            assertLastSubscriber(
              subscriber,
              {
                active: ['b', 'c', 'a'],
                activeContents: [
                  activeList.contents[1],
                  activeList.contents[2],
                  activeList.contents[0],
                ],
                activeIndexes: [1, 2, 0],
                lastActivated: 'a',
                lastActivatedContent: activeList.contents[0],
                lastActivatedIndex: 0,
                lastDeactivated: null,
                lastDeactivatedContent: null,
                lastDeactivatedIndex: -1,
                direction: 'right',
                oppositeDirection: 'left',
                maxActivationLimit: false,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                isCircular: true,
                contents: [
                  {
                    isActive: true,
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
                    isActive: true,
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
                    isActive: true,
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
                deactivatedIndex: -1,
                deactivatedValue: null,
                time: new Date(),
              }
            );
          });

          test('moving left', () => {
            const { activeList, subscriber } = setup({
              maxActivationLimit: false,
              activeIndexes: 1,
              isCircular: true,
            });

            activeList.activateByIndex(0);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(
              subscriber,
              {
                active: ['b', 'a'],
                activeContents: [
                  activeList.contents[1],
                  activeList.contents[0],
                ],
                activeIndexes: [1, 0],
                lastActivated: 'a',
                lastActivatedContent: activeList.contents[0],
                lastActivatedIndex: 0,
                lastDeactivated: null,
                lastDeactivatedContent: null,
                lastDeactivatedIndex: -1,
                direction: 'left',
                oppositeDirection: 'right',
                maxActivationLimit: false,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                isCircular: true,
                contents: [
                  {
                    isActive: true,
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
                    isActive: true,
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
                    isActive: false,
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
                deactivatedIndex: -1,
                deactivatedValue: null,
                time: new Date(),
              }
            );

            activeList.activateByIndex(2);

            expect(subscriber).toHaveBeenCalledTimes(2);
            assertLastSubscriber(
              subscriber,
              {
                active: ['b', 'a', 'c'],
                activeContents: [
                  activeList.contents[1],
                  activeList.contents[0],
                  activeList.contents[2],
                ],
                activeIndexes: [1, 0, 2],
                lastActivated: 'c',
                lastActivatedContent: activeList.contents[2],
                lastActivatedIndex: 2,
                lastDeactivated: null,
                lastDeactivatedContent: null,
                lastDeactivatedIndex: -1,
                direction: 'left',
                oppositeDirection: 'right',
                maxActivationLimit: false,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                isCircular: true,
                contents: [
                  {
                    isActive: true,
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
                    isActive: true,
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
                    isActive: true,
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
                deactivatedIndex: -1,
                deactivatedValue: null,
                time: new Date(),
              }
            );
          });

          test('when closest means jumping right', () => {
            const { activeList, subscriber } = setup(
              {
                maxActivationLimit: false,
                activeIndexes: [1, 2],
                isCircular: true,
              },
              //0    1    2    3    4
              ['a', 'b', 'c', 'd', 'e']
            );

            activeList.activateByIndex(4);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(
              subscriber,
              {
                active: ['b', 'c', 'e'],
                activeContents: [
                  activeList.contents[1],
                  activeList.contents[2],
                  activeList.contents[4],
                ],
                activeIndexes: [1, 2, 4],
                lastActivated: 'e',
                lastActivatedContent: activeList.contents[4],
                lastActivatedIndex: 4,
                lastDeactivated: null,
                lastDeactivatedContent: null,
                lastDeactivatedIndex: -1,
                direction: 'right',
                oppositeDirection: 'left',
                maxActivationLimit: false,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                isCircular: true,
                contents: [
                  {
                    isActive: false,
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
                    isActive: true,
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
                    isActive: true,
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
                    isActive: false,
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
                    isActive: true,
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
                deactivatedIndex: -1,
                deactivatedValue: null,
                time: new Date(),
              }
            );
          });

          test('when closest means jumping left', () => {
            const { activeList, subscriber } = setup(
              {
                maxActivationLimit: false,
                activeIndexes: [3, 2],
                isCircular: true,
              },
              //0    1    2    3    4
              ['a', 'b', 'c', 'd', 'e']
            );

            activeList.activateByIndex(0);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(
              subscriber,
              {
                active: ['d', 'c', 'a'],
                activeContents: [
                  activeList.contents[3],
                  activeList.contents[2],
                  activeList.contents[0],
                ],
                activeIndexes: [3, 2, 0],
                lastActivated: 'a',
                lastActivatedContent: activeList.contents[0],
                lastActivatedIndex: 0,
                lastDeactivated: null,
                lastDeactivatedContent: null,
                lastDeactivatedIndex: -1,
                direction: 'left',
                oppositeDirection: 'right',
                maxActivationLimit: false,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                isCircular: true,
                contents: [
                  {
                    isActive: true,
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
                    isActive: false,
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
                    isActive: true,
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
                    isActive: true,
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
                    isActive: false,
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
                deactivatedIndex: -1,
                deactivatedValue: null,
                time: new Date(),
              }
            );
          });

          test('when closest means jumping before start', () => {
            const { activeList, subscriber } = setup(
              {
                maxActivationLimit: false,
                activeIndexes: [2, 1],
                isCircular: true,
              },
              //0    1    2    3    4
              ['a', 'b', 'c', 'd', 'e']
            );

            activeList.activateByIndex(4);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(
              subscriber,
              {
                active: ['c', 'b', 'e'],
                activeContents: [
                  activeList.contents[2],
                  activeList.contents[1],
                  activeList.contents[4],
                ],
                activeIndexes: [2, 1, 4],
                lastActivated: 'e',
                lastActivatedContent: activeList.contents[4],
                lastActivatedIndex: 4,
                lastDeactivated: null,
                lastDeactivatedContent: null,
                lastDeactivatedIndex: -1,
                direction: 'left',
                oppositeDirection: 'right',
                maxActivationLimit: false,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                isCircular: true,
                contents: [
                  {
                    isActive: false,
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
                    isActive: true,
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
                    isActive: true,
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
                    isActive: false,
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
                    isActive: true,
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
                deactivatedIndex: -1,
                deactivatedValue: null,
                time: new Date(),
              }
            );
          });

          test('when closest means jumping after end', () => {
            const { activeList, subscriber } = setup(
              {
                maxActivationLimit: false,
                activeIndexes: [2, 3],
                isCircular: true,
              },
              //0    1    2    3    4
              ['a', 'b', 'c', 'd', 'e']
            );

            activeList.activateByIndex(0);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(
              subscriber,
              {
                active: ['c', 'd', 'a'],
                activeContents: [
                  activeList.contents[2],
                  activeList.contents[3],
                  activeList.contents[0],
                ],
                activeIndexes: [2, 3, 0],
                lastActivated: 'a',
                lastActivatedContent: activeList.contents[0],
                lastActivatedIndex: 0,
                lastDeactivated: null,
                lastDeactivatedContent: null,
                lastDeactivatedIndex: -1,
                direction: 'right',
                oppositeDirection: 'left',
                maxActivationLimit: false,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                isCircular: true,
                contents: [
                  {
                    isActive: true,
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
                    isActive: false,
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
                    isActive: true,
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
                    isActive: true,
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
                    isActive: false,
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
                deactivatedIndex: -1,
                deactivatedValue: null,
                time: new Date(),
              }
            );
          });

          test('when tied it should always jump right', () => {
            const { activeList, subscriber } = setup(
              {
                maxActivationLimit: false,
                activeIndexes: 0,
                isCircular: true,
              },
              //0    1
              ['a', 'b']
            );

            activeList.activateByIndex(1);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(
              subscriber,
              {
                active: ['a', 'b'],
                activeContents: [
                  activeList.contents[0],
                  activeList.contents[1],
                ],
                activeIndexes: [0, 1],
                lastActivated: 'b',
                lastActivatedContent: activeList.contents[1],
                lastActivatedIndex: 1,
                lastDeactivated: null,
                lastDeactivatedContent: null,
                lastDeactivatedIndex: -1,
                direction: 'right',
                oppositeDirection: 'left',
                maxActivationLimit: false,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                isCircular: true,
                contents: [
                  {
                    isActive: true,
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
                    isActive: true,
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
                deactivatedIndex: -1,
                deactivatedValue: null,
                time: new Date(),
              }
            );
          });

          test('when tied it should always jump right even when moving over edge', () => {
            const { activeList, subscriber } = setup(
              {
                maxActivationLimit: false,
                activeIndexes: 1,
                isCircular: true,
              },
              //0    1
              ['a', 'b']
            );

            activeList.activateByIndex(0);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(
              subscriber,
              {
                active: ['b', 'a'],
                activeContents: [
                  activeList.contents[1],
                  activeList.contents[0],
                ],
                activeIndexes: [1, 0],
                lastActivated: 'a',
                lastActivatedContent: activeList.contents[0],
                lastActivatedIndex: 0,
                lastDeactivated: null,
                lastDeactivatedContent: null,
                lastDeactivatedIndex: -1,
                direction: 'right',
                oppositeDirection: 'left',
                maxActivationLimit: false,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                isCircular: true,
                contents: [
                  {
                    isActive: true,
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
                    isActive: true,
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
                deactivatedIndex: -1,
                deactivatedValue: null,
                time: new Date(),
              }
            );
          });
        });

        describe('when straight', () => {
          test('moving right', () => {
            const { activeList, subscriber } = setup({
              maxActivationLimit: false,
              activeIndexes: 0,
            });

            activeList.activateByIndex(1);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(
              subscriber,
              {
                active: ['a', 'b'],
                activeContents: [
                  activeList.contents[0],
                  activeList.contents[1],
                ],
                activeIndexes: [0, 1],
                lastActivated: 'b',
                lastActivatedContent: activeList.contents[1],
                lastActivatedIndex: 1,
                lastDeactivated: null,
                lastDeactivatedContent: null,
                lastDeactivatedIndex: -1,
                direction: 'right',
                oppositeDirection: 'left',
                maxActivationLimit: false,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                isCircular: false,
                contents: [
                  {
                    isActive: true,
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
                    isActive: true,
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
                    isActive: false,
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
                deactivatedIndex: -1,
                deactivatedValue: null,
                time: new Date(),
              }
            );

            activeList.activateByIndex(2);

            expect(subscriber).toHaveBeenCalledTimes(2);
            assertLastSubscriber(
              subscriber,
              {
                active: ['a', 'b', 'c'],
                activeContents: [
                  activeList.contents[0],
                  activeList.contents[1],
                  activeList.contents[2],
                ],
                activeIndexes: [0, 1, 2],
                lastActivated: 'c',
                lastActivatedContent: activeList.contents[2],
                lastActivatedIndex: 2,
                lastDeactivated: null,
                lastDeactivatedContent: null,
                lastDeactivatedIndex: -1,
                direction: 'right',
                oppositeDirection: 'left',
                maxActivationLimit: false,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                isCircular: false,
                contents: [
                  {
                    isActive: true,
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
                    isActive: true,
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
                    isActive: true,
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
                deactivatedIndex: -1,
                deactivatedValue: null,
                time: new Date(),
              }
            );
          });

          test('moving left', () => {
            const { activeList, subscriber } = setup({
              maxActivationLimit: false,
              activeIndexes: 2,
            });

            activeList.activateByIndex(1);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(
              subscriber,
              {
                active: ['c', 'b'],
                activeContents: [
                  activeList.contents[2],
                  activeList.contents[1],
                ],
                activeIndexes: [2, 1],
                lastActivated: 'b',
                lastActivatedContent: activeList.contents[1],
                lastActivatedIndex: 1,
                lastDeactivated: null,
                lastDeactivatedContent: null,
                lastDeactivatedIndex: -1,
                direction: 'left',
                oppositeDirection: 'right',
                maxActivationLimit: false,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                isCircular: false,
                contents: [
                  {
                    isActive: false,
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
                    isActive: true,
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
                    isActive: true,
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
                deactivatedIndex: -1,
                deactivatedValue: null,
                time: new Date(),
              }
            );

            activeList.activateByIndex(0);

            expect(subscriber).toHaveBeenCalledTimes(2);
            assertLastSubscriber(
              subscriber,
              {
                active: ['c', 'b', 'a'],
                activeContents: [
                  activeList.contents[2],
                  activeList.contents[1],
                  activeList.contents[0],
                ],
                activeIndexes: [2, 1, 0],
                lastActivated: 'a',
                lastActivatedContent: activeList.contents[0],
                lastActivatedIndex: 0,
                lastDeactivated: null,
                lastDeactivatedContent: null,
                lastDeactivatedIndex: -1,
                direction: 'left',
                oppositeDirection: 'right',
                maxActivationLimit: false,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                isCircular: false,
                contents: [
                  {
                    isActive: true,
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
                    isActive: true,
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
                    isActive: true,
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
                deactivatedIndex: -1,
                deactivatedValue: null,
                time: new Date(),
              }
            );
          });
        });
      });

      describe('when having custom directions', () => {
        test('moving down', () => {
          const { activeList, subscriber } = setup({
            activeIndexes: 0,
            maxActivationLimit: 1,
            directions: { next: 'down', previous: 'up' },
          });

          activeList.activateByIndex(1);

          expect(subscriber).toHaveBeenCalledTimes(1);
          assertLastSubscriber(
            subscriber,
            {
              active: ['b'],
              activeContents: [activeList.contents[1]],
              activeIndexes: [1],
              lastActivated: 'b',
              lastActivatedContent: activeList.contents[1],
              lastActivatedIndex: 1,
              lastDeactivated: 'a',
              lastDeactivatedContent: activeList.contents[0],
              lastDeactivatedIndex: 0,
              direction: 'down',
              oppositeDirection: 'up',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: true,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              isCircular: false,
              contents: [
                {
                  isActive: false,
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
                  isActive: true,
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
                  isActive: false,
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
              deactivatedIndex: 0,
              deactivatedValue: 'a',
              time: new Date(),
            }
          );
        });

        test('moving up', () => {
          const { activeList, subscriber } = setup({
            activeIndexes: 2,
            directions: { next: 'down', previous: 'up' },
          });

          activeList.activateByIndex(1);

          expect(subscriber).toHaveBeenCalledTimes(1);
          assertLastSubscriber(
            subscriber,
            {
              active: ['b'],
              activeContents: [activeList.contents[1]],
              activeIndexes: [1],
              lastActivated: 'b',
              lastActivatedContent: activeList.contents[1],
              lastActivatedIndex: 1,
              lastDeactivated: 'c',
              lastDeactivatedContent: activeList.contents[2],
              lastDeactivatedIndex: 2,
              direction: 'up',
              oppositeDirection: 'down',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: true,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              isCircular: false,
              contents: [
                {
                  isActive: false,
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
                  isActive: true,
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
                  isActive: false,
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
              deactivatedIndex: 2,
              deactivatedValue: 'c',
              time: new Date(),
            }
          );
        });
      });

      test('that it sets a cooldown', () => {
        const { activeList, subscriber } = setup({
          activeIndexes: 0,
          cooldown: 1000,
        });

        activeList.activateByIndex(2);

        expect(activeList.cooldown).toEqual({ isActive: true, duration: 1000 });

        expect(subscriber).toHaveBeenCalledTimes(2);
        assertEvents(subscriber, ['ACTIVATED', 'COOLDOWN_STARTED']);
      });
    });

    describe('activate', () => {
      test('activate content by identity', () => {
        const { activeList, contents } = setup();

        jest.spyOn(activeList, 'activateByIndex');

        activeList.activate(contents[1], {
          isUserInteraction: true,
        });

        expect(activeList.activateByIndex).toHaveBeenCalledTimes(1);
        expect(activeList.activateByIndex).toHaveBeenCalledWith(1, {
          isUserInteraction: true,
        });
      });

      test('throws item not found', () => {
        const { activeList } = setup();

        jest.spyOn(activeList, 'activateByIndex');

        expect(() => {
          activeList.activate('d');
        }).toThrowError(
          'uiloos > ActiveList > getIndex > index cannot be found, item is not in contents array'
        );

        expect(() => {
          activeList.activate('d');
        }).toThrowError(ActiveListItemNotFoundError);

        expect(activeList.activateByIndex).toHaveBeenCalledTimes(0);
      });
    });

    describe('activateByPredicate', () => {
      test('when multiple items match only last one is active when maxActivationLimit is 1', () => {
        // The two 'a's will match the predicate
        const { activeList, subscriber } = setup(
          { maxActivationLimit: 1, activeIndexes: 0 },
          ['b', 'a', 'a', 'z']
        );

        activeList.activateByPredicate(
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
            active: ['a'],
            activeContents: [activeList.contents[2]],
            activeIndexes: [2],
            // Since both a's got activated the second one is the last activated
            lastActivated: 'a',
            lastActivatedContent: activeList.contents[2],
            lastActivatedIndex: 2,
            // Since both a's got activated the first one is the previously activated
            lastDeactivated: 'a',
            lastDeactivatedContent: activeList.contents[1],
            lastDeactivatedIndex: 1,
            direction: 'right',
            oppositeDirection: 'left',
            maxActivationLimit: 1,
            maxActivationLimitBehavior: 'circular',
            history: [],
            hasActiveChangedAtLeastOnce: true,
            autoPlay: {
              isPlaying: false,
              hasBeenStoppedBefore: false,
              duration: 0,
            },
            cooldown: {
              isActive: false,
              duration: 0,
            },
            isCircular: false,
            contents: [
              {
                isActive: false,
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
                isActive: false,
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
                isActive: true,
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
                isActive: false,
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
            indexes: [2],
            values: ['a'],
            deactivatedIndexes: [0],
            deactivatedValues: ['b'],
            time: new Date(),
          }
        );
      });

      describe('when maxActivationLimit is false', () => {
        test('when multiple items match all items are activated', () => {
          // The two 'a's will match the predicate
          const { activeList, subscriber } = setup(
            { maxActivationLimit: false },
            ['b', 'a', 'a', 'z']
          );

          activeList.activateByPredicate(
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
              active: ['a', 'a'],
              activeContents: [activeList.contents[1], activeList.contents[2]],
              activeIndexes: [1, 2],
              // Since both a's got activated the second one is the last activated
              lastActivated: 'a',
              lastActivatedContent: activeList.contents[2],
              lastActivatedIndex: 2,
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: false,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: true,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              isCircular: false,
              contents: [
                {
                  isActive: false,
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
                  isActive: true,
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
                  isActive: true,
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
                  isActive: false,
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
              deactivatedIndexes: [],
              deactivatedValues: [],
              time: new Date(),
            }
          );
        });

        test('when all matching items are already active it does nothing', () => {
          // The two 'a's will match the predicate
          const { activeList, subscriber } = setup(
            { maxActivationLimit: false, activeIndexes: [1, 2] },
            ['b', 'a', 'a', 'z']
          );

          activeList.activateByPredicate(
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

          assertState(activeList, {
            active: ['a', 'a'],
            activeContents: [activeList.contents[1], activeList.contents[2]],
            activeIndexes: [1, 2],
            lastActivated: 'a',
            lastActivatedContent: activeList.contents[2],
            lastActivatedIndex: 2,
            lastDeactivated: null,
            lastDeactivatedContent: null,
            lastDeactivatedIndex: -1,
            direction: 'right',
            oppositeDirection: 'left',
            maxActivationLimit: false,
            maxActivationLimitBehavior: 'circular',
            history: [],
            hasActiveChangedAtLeastOnce: false,
            autoPlay: {
              isPlaying: false,
              hasBeenStoppedBefore: false,
              duration: 0,
            },
            cooldown: {
              isActive: false,
              duration: 0,
            },
            isCircular: false,
            contents: [
              {
                isActive: false,
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
                isActive: true,
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
                isActive: true,
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
                isActive: false,
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

          expect(subscriber).toHaveBeenCalledTimes(0);
        });

        test('when no items match they should remain as they were', () => {
          // The two 'a's will match the predicate
          const { activeList, subscriber } = setup(
            { maxActivationLimit: false, activeIndexes: [0, 1, 3] },
            ['b', 'a', 'a', 'z']
          );

          activeList.activateByPredicate(
            (data) => {
              expect(data.index).toBeDefined();
              expect(data.value).toBeDefined();

              expect(data.content).toBeDefined();
              expect(data.content).toBeInstanceOf(ActiveListContent);

              expect(data.activeList).toBeDefined();

              expect(data.activeList).toBeInstanceOf(ActiveList);
              return data.value === 'x';
            },
            {
              isUserInteraction: true,
            }
          );

          assertState(activeList, {
            active: ['b', 'a', 'z'],
            activeContents: [
              activeList.contents[0],
              activeList.contents[1],
              activeList.contents[3],
            ],
            activeIndexes: [0, 1, 3],
            lastActivated: 'z',
            lastActivatedContent: activeList.contents[3],
            lastActivatedIndex: 3,
            lastDeactivated: null,
            lastDeactivatedContent: null,
            lastDeactivatedIndex: -1,
            direction: 'right',
            oppositeDirection: 'left',
            maxActivationLimit: false,
            maxActivationLimitBehavior: 'circular',
            history: [],
            hasActiveChangedAtLeastOnce: false,
            autoPlay: {
              isPlaying: false,
              hasBeenStoppedBefore: false,
              duration: 0,
            },
            cooldown: {
              isActive: false,
              duration: 0,
            },
            isCircular: false,
            contents: [
              {
                isActive: true,
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
                isActive: true,
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
                isActive: false,
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
                isActive: true,
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

          expect(subscriber).toHaveBeenCalledTimes(0);
        });
      });

      describe('when maxActivationLimit is N', () => {
        describe('when maxActivationLimitBehavior is "circular" FIFO rules apply', () => {
          test('when limit is not exceeded matches should just be activated', () => {
            // The two 'a's will match the predicate
            const { activeList, subscriber } = setup(
              { maxActivationLimit: 2 },
              ['b', 'a', 'a', 'z']
            );

            activeList.activateByPredicate((data) => {
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
                  activeList.contents[1],
                  activeList.contents[2],
                ],
                activeIndexes: [1, 2],
                // Since both a's got activated the second one is the last activated
                lastActivated: 'a',
                lastActivatedContent: activeList.contents[2],
                lastActivatedIndex: 2,
                lastDeactivated: null,
                lastDeactivatedContent: null,
                lastDeactivatedIndex: -1,
                direction: 'right',
                oppositeDirection: 'left',
                maxActivationLimit: 2,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                isCircular: false,
                contents: [
                  {
                    isActive: false,
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
                    isActive: true,
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
                    isActive: true,
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
                    isActive: false,
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
                deactivatedIndexes: [],
                deactivatedValues: [],
                time: new Date(),
              }
            );
          });

          test('when limit is exceeded and there are to many matches it should FIFO between matches', () => {
            // The three 'a's will match the predicate
            const { activeList, subscriber } = setup(
              { maxActivationLimit: 2 },
              ['b', 'a', 'a', 'a', 'z']
            );

            activeList.activateByPredicate((data) => {
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
                  activeList.contents[2],
                  activeList.contents[3],
                ],
                activeIndexes: [2, 3],
                // Since the last two a's got activated the third one is the last activated
                lastActivated: 'a',
                lastActivatedContent: activeList.contents[3],
                lastActivatedIndex: 3,
                // The first 'a' was deactivated this sequence, but it should not be reported.
                lastDeactivated: 'a',
                lastDeactivatedContent: activeList.contents[1],
                lastDeactivatedIndex: 1,
                direction: 'right',
                oppositeDirection: 'left',
                maxActivationLimit: 2,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                isCircular: false,
                contents: [
                  {
                    isActive: false,
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
                    isActive: false,
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
                    isActive: true,
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
                    isActive: true,
                    value: 'a',
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
                    isActive: false,
                    value: 'z',
                    index: 4,
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
                indexes: [2, 3],
                values: ['a', 'a'],
                deactivatedIndexes: [],
                deactivatedValues: [],
                time: new Date(),
              }
            );
          });

          test('when limit is exceeded the first to FIFO is the item that is already active', () => {
            // The three 'a's will match the predicate
            const { activeList, subscriber } = setup(
              {
                activeIndexes: [0],
                maxActivationLimit: 2,
              },
              ['b', 'a', 'a', 'a', 'z']
            );

            activeList.activateByPredicate((data) => {
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
                  activeList.contents[2],
                  activeList.contents[3],
                ],
                activeIndexes: [2, 3],
                // Since all three  a's got activated the third one is the last activated
                lastActivated: 'a',
                lastActivatedContent: activeList.contents[3],
                lastActivatedIndex: 3,
                // The first 'a' was deactivated this sequence, but it should not be reported.
                lastDeactivated: 'a',
                lastDeactivatedContent: activeList.contents[1],
                lastDeactivatedIndex: 1,
                direction: 'right',
                oppositeDirection: 'left',
                maxActivationLimit: 2,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                isCircular: false,
                contents: [
                  {
                    isActive: false,
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
                    isActive: false,
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
                    isActive: true,
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
                    isActive: true,
                    value: 'a',
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
                    isActive: false,
                    value: 'z',
                    index: 4,
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
                indexes: [2, 3],
                values: ['a', 'a'],
                deactivatedIndexes: [0],
                deactivatedValues: ['b'],
                time: new Date(),
              }
            );
          });

          test('when limit is exceeded the first to FIFO is the items that is already active', () => {
            // The three 'a's will match the predicate
            const { activeList, subscriber } = setup(
              {
                activeIndexes: [0, 4],
                maxActivationLimit: 2,
              },
              ['b', 'a', 'a', 'a', 'z']
            );

            activeList.activateByPredicate((data) => {
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
                  activeList.contents[2],
                  activeList.contents[3],
                ],
                activeIndexes: [2, 3],
                // Since all three a's got activated the third one is the last activated
                lastActivated: 'a',
                lastActivatedContent: activeList.contents[3],
                lastActivatedIndex: 3,
                // The first 'a' was deactivated this sequence, but it should not be reported.
                lastDeactivated: 'a',
                lastDeactivatedContent: activeList.contents[1],
                lastDeactivatedIndex: 1,
                direction: 'right',
                oppositeDirection: 'left',
                maxActivationLimit: 2,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                isCircular: false,
                contents: [
                  {
                    isActive: false,
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
                    isActive: false,
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
                    isActive: true,
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
                    isActive: true,
                    value: 'a',
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
                    isActive: false,
                    value: 'z',
                    index: 4,
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
                type: 'ACTIVATED_MULTIPLE',
                indexes: [2, 3],
                values: ['a', 'a'],
                deactivatedIndexes: [0, 4],
                deactivatedValues: ['b', 'z'],
                time: new Date(),
              }
            );
          });
        });

        describe('when maxActivationLimitBehavior is "ignore"', () => {
          test('when limit is not exceeded matches should be activated', () => {
            // The two 'a's will match the predicate
            const { activeList, subscriber } = setup(
              { maxActivationLimit: 2, maxActivationLimitBehavior: 'ignore' },
              ['b', 'a', 'a', 'z']
            );

            activeList.activateByPredicate((data) => {
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
                  activeList.contents[1],
                  activeList.contents[2],
                ],
                activeIndexes: [1, 2],
                // Since both a's got activated the second one is the last activated
                lastActivated: 'a',
                lastActivatedContent: activeList.contents[2],
                lastActivatedIndex: 2,
                lastDeactivated: null,
                lastDeactivatedContent: null,
                lastDeactivatedIndex: -1,
                direction: 'right',
                oppositeDirection: 'left',
                maxActivationLimit: 2,
                maxActivationLimitBehavior: 'ignore',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                isCircular: false,
                contents: [
                  {
                    isActive: false,
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
                    isActive: true,
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
                    isActive: true,
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
                    isActive: false,
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
                deactivatedIndexes: [],
                deactivatedValues: [],
                time: new Date(),
              }
            );
          });

          test('when limit is exceeded it should ignore next matches', () => {
            // The three 'a's will match the predicate
            const { activeList, subscriber } = setup(
              { maxActivationLimit: 2, maxActivationLimitBehavior: 'ignore' },
              ['b', 'a', 'a', 'a', 'z']
            );

            activeList.activateByPredicate((data) => {
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
                  activeList.contents[1],
                  activeList.contents[2],
                ],
                activeIndexes: [1, 2],
                // Since the first two a's got activated the second one is the last activated
                lastActivated: 'a',
                lastActivatedContent: activeList.contents[2],
                lastActivatedIndex: 2,
                // Nothing was ever deactivated
                lastDeactivated: null,
                lastDeactivatedContent: null,
                lastDeactivatedIndex: -1,
                direction: 'right',
                oppositeDirection: 'left',
                maxActivationLimit: 2,
                maxActivationLimitBehavior: 'ignore',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                isCircular: false,
                contents: [
                  {
                    isActive: false,
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
                    isActive: true,
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
                    isActive: true,
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
                    isActive: false,
                    value: 'a',
                    index: 3,
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: true,
                    isPrevious: false,
                    hasBeenActiveBefore: false,
                  },
                  {
                    isActive: false,
                    value: 'z',
                    index: 4,
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
                type: 'ACTIVATED_MULTIPLE',
                indexes: [1, 2],
                values: ['a', 'a'],
                deactivatedIndexes: [],
                deactivatedValues: [],
                time: new Date(),
              }
            );
          });

          test('when limit is exceeded it may never deactivate items that are already active and ignores subsequent matches', () => {
            // The three 'a's will match the predicate
            const { activeList, subscriber } = setup(
              {
                maxActivationLimit: 2,
                maxActivationLimitBehavior: 'ignore',
                activeIndexes: [0],
              },
              ['b', 'a', 'a', 'a', 'z']
            );

            activeList.activateByPredicate((data) => {
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
                active: ['b', 'a'],
                activeContents: [
                  activeList.contents[0],
                  activeList.contents[1],
                ],
                activeIndexes: [0, 1],
                // Since the only the first a got activated it is the lastActivated
                lastActivated: 'a',
                lastActivatedContent: activeList.contents[1],
                lastActivatedIndex: 1,
                // Nothing was deactivated
                lastDeactivated: null,
                lastDeactivatedContent: null,
                lastDeactivatedIndex: -1,
                direction: 'right',
                oppositeDirection: 'left',
                maxActivationLimit: 2,
                maxActivationLimitBehavior: 'ignore',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                isCircular: false,
                contents: [
                  {
                    isActive: true,
                    value: 'b',
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
                    isActive: true,
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
                    isActive: false,
                    value: 'a',
                    index: 2,
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: true,
                    isPrevious: false,
                    hasBeenActiveBefore: false,
                  },
                  {
                    isActive: false,
                    value: 'a',
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
                    isActive: false,
                    value: 'z',
                    index: 4,
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
                type: 'ACTIVATED_MULTIPLE',
                indexes: [1],
                values: ['a'],
                deactivatedIndexes: [],
                deactivatedValues: [],
                time: new Date(),
              }
            );
          });

          test('when limit is already exceeded it may never deactivate items and will ignore the matches', () => {
            // The three 'a's will match the predicate
            const { activeList, subscriber } = setup(
              {
                maxActivationLimit: 2,
                maxActivationLimitBehavior: 'ignore',
                activeIndexes: [0, 4],
              },
              ['b', 'a', 'a', 'a', 'z']
            );

            activeList.activateByPredicate((data) => {
              expect(data.index).toBeDefined();
              expect(data.value).toBeDefined();

              expect(data.content).toBeDefined();
              expect(data.content).toBeInstanceOf(ActiveListContent);

              expect(data.activeList).toBeDefined();

              expect(data.activeList).toBeInstanceOf(ActiveList);
              return data.value === 'a';
            });

            expect(subscriber).toHaveBeenCalledTimes(0);

            assertState(activeList, {
              active: ['b', 'z'],
              activeContents: [activeList.contents[0], activeList.contents[4]],
              activeIndexes: [0, 4],
              // Since nothing happened it should not activate anything.
              lastActivated: 'z',
              lastActivatedContent: activeList.contents[4],
              lastActivatedIndex: 4,
              // Nothing was deactivated
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: 2,
              maxActivationLimitBehavior: 'ignore',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              isCircular: false,
              contents: [
                {
                  isActive: true,
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
                  isActive: false,
                  value: 'a',
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
                  isActive: false,
                  value: 'a',
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
                  isActive: false,
                  value: 'a',
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
                  isActive: true,
                  value: 'z',
                  index: 4,
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

        describe('when maxActivationLimitBehavior is "error"', () => {
          test('when limit is not exceeded matches should be activated', () => {
            // The two 'a's will match the predicate
            const { activeList, subscriber } = setup(
              { maxActivationLimit: 2, maxActivationLimitBehavior: 'error' },
              ['b', 'a', 'a', 'z']
            );

            activeList.activateByPredicate((data) => {
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
                  activeList.contents[1],
                  activeList.contents[2],
                ],
                activeIndexes: [1, 2],
                // Since both a's got activated the second one is the last activated
                lastActivated: 'a',
                lastActivatedContent: activeList.contents[2],
                lastActivatedIndex: 2,
                lastDeactivated: null,
                lastDeactivatedContent: null,
                lastDeactivatedIndex: -1,
                direction: 'right',
                oppositeDirection: 'left',
                maxActivationLimit: 2,
                maxActivationLimitBehavior: 'error',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                isCircular: false,
                contents: [
                  {
                    isActive: false,
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
                    isActive: true,
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
                    isActive: true,
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
                    isActive: false,
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
                deactivatedIndexes: [],
                deactivatedValues: [],
                time: new Date(),
              }
            );
          });

          test('when limit is exceeded it should ignore next matches but throw error, but also send an event', () => {
            // The three 'a's will match the predicate
            const { activeList, subscriber } = setup(
              {
                maxActivationLimit: 2,
                maxActivationLimitBehavior: 'error',
              },
              ['b', 'a', 'a', 'a', 'z']
            );

            expect(() => {
              activeList.activateByPredicate((data) => {
                expect(data.index).toBeDefined();
                expect(data.value).toBeDefined();

                expect(data.content).toBeDefined();
                expect(data.content).toBeInstanceOf(ActiveListContent);

                expect(data.activeList).toBeDefined();

                expect(data.activeList).toBeInstanceOf(ActiveList);
                return data.value === 'a';
              });
            }).toThrowError(ActiveListActivationLimitReachedError);

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(
              subscriber,
              {
                active: ['a', 'a'],
                activeContents: [
                  activeList.contents[1],
                  activeList.contents[2],
                ],
                activeIndexes: [1, 2],
                // Since the first two a's got activated the second one is the last activated
                lastActivated: 'a',
                lastActivatedContent: activeList.contents[2],
                lastActivatedIndex: 2,
                // Nothing was ever deactivated
                lastDeactivated: null,
                lastDeactivatedContent: null,
                lastDeactivatedIndex: -1,
                direction: 'right',
                oppositeDirection: 'left',
                maxActivationLimit: 2,
                maxActivationLimitBehavior: 'error',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                isCircular: false,
                contents: [
                  {
                    isActive: false,
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
                    isActive: true,
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
                    isActive: true,
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
                    isActive: false,
                    value: 'a',
                    index: 3,
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: true,
                    isPrevious: false,
                    hasBeenActiveBefore: false,
                  },
                  {
                    isActive: false,
                    value: 'z',
                    index: 4,
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
                type: 'ACTIVATED_MULTIPLE',
                indexes: [1, 2],
                values: ['a', 'a'],
                deactivatedIndexes: [],
                deactivatedValues: [],
                time: new Date(),
              }
            );
          });

          test('when limit is exceeded it may never deactivate items that are already active and ignores subsequent matches', () => {
            // The three 'a's will match the predicate
            const { activeList, subscriber } = setup(
              {
                maxActivationLimit: 2,
                maxActivationLimitBehavior: 'error',
                activeIndexes: [0],
              },
              ['b', 'a', 'a', 'a', 'z']
            );

            expect(() => {
              activeList.activateByPredicate((data) => {
                expect(data.index).toBeDefined();
                expect(data.value).toBeDefined();

                expect(data.content).toBeDefined();
                expect(data.content).toBeInstanceOf(ActiveListContent);

                expect(data.activeList).toBeDefined();

                expect(data.activeList).toBeInstanceOf(ActiveList);
                return data.value === 'a';
              });
            }).toThrowError(ActiveListActivationLimitReachedError);

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(
              subscriber,
              {
                active: ['b', 'a'],
                activeContents: [
                  activeList.contents[0],
                  activeList.contents[1],
                ],
                activeIndexes: [0, 1],
                // Since the only the first a got activated it is the lastActivated
                lastActivated: 'a',
                lastActivatedContent: activeList.contents[1],
                lastActivatedIndex: 1,
                // Nothing was deactivated
                lastDeactivated: null,
                lastDeactivatedContent: null,
                lastDeactivatedIndex: -1,
                direction: 'right',
                oppositeDirection: 'left',
                maxActivationLimit: 2,
                maxActivationLimitBehavior: 'error',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                isCircular: false,
                contents: [
                  {
                    isActive: true,
                    value: 'b',
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
                    isActive: true,
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
                    isActive: false,
                    value: 'a',
                    index: 2,
                    isFirst: false,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: true,
                    isPrevious: false,
                    hasBeenActiveBefore: false,
                  },
                  {
                    isActive: false,
                    value: 'a',
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
                    isActive: false,
                    value: 'z',
                    index: 4,
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
                type: 'ACTIVATED_MULTIPLE',
                indexes: [1],
                values: ['a'],
                deactivatedIndexes: [],
                deactivatedValues: [],
                time: new Date(),
              }
            );
          });

          test('when limit is already exceeded it may never deactivate items and will ignore the matches', () => {
            // The three 'a's will match the predicate
            const { activeList, subscriber } = setup(
              {
                maxActivationLimit: 2,
                maxActivationLimitBehavior: 'error',
                activeIndexes: [0, 4],
              },
              ['b', 'a', 'a', 'a', 'z']
            );

            expect(() => {
              activeList.activateByPredicate((data) => {
                expect(data.index).toBeDefined();
                expect(data.value).toBeDefined();

                expect(data.content).toBeDefined();
                expect(data.content).toBeInstanceOf(ActiveListContent);

                expect(data.activeList).toBeDefined();

                expect(data.activeList).toBeInstanceOf(ActiveList);
                return data.value === 'a';
              });
            }).toThrowError(ActiveListActivationLimitReachedError);

            expect(subscriber).toHaveBeenCalledTimes(0);

            assertState(activeList, {
              active: ['b', 'z'],
              activeContents: [activeList.contents[0], activeList.contents[4]],
              activeIndexes: [0, 4],
              // Since nothing happened it should not activate anything.
              lastActivated: 'z',
              lastActivatedContent: activeList.contents[4],
              lastActivatedIndex: 4,
              // Nothing was deactivated
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: 2,
              maxActivationLimitBehavior: 'error',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              isCircular: false,
              contents: [
                {
                  isActive: true,
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
                  isActive: false,
                  value: 'a',
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
                  isActive: false,
                  value: 'a',
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
                  isActive: false,
                  value: 'a',
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
                  isActive: true,
                  value: 'z',
                  index: 4,
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

      test('that it sets a cooldown', () => {
        const { activeList, subscriber } = setup({
          activeIndexes: 0,
          cooldown: 1000,
        });

        activeList.activateByPredicate(() => true);

        expect(activeList.cooldown).toEqual({ isActive: true, duration: 1000 });

        expect(subscriber).toHaveBeenCalledTimes(2);
        assertEvents(subscriber, ['ACTIVATED_MULTIPLE', 'COOLDOWN_STARTED']);
      });

      test('that when a cooldown is active that it early exists', () => {
        const { activeList, subscriber } = setup({
          activeIndexes: 0,
          cooldown: 1000,
        });

        activeList.deactivateByIndex(0);

        expect(activeList.cooldown).toEqual({ isActive: true, duration: 1000 });

        expect(subscriber).toHaveBeenCalledTimes(2);
        assertEvents(subscriber, ['DEACTIVATED', 'COOLDOWN_STARTED']);

        activeList.activateByPredicate(() => true);

        expect(subscriber).toHaveBeenCalledTimes(2);
      });
    });

    describe('activateNext', () => {
      test('activates the next content.', () => {
        const { activeList } = setup({ activeIndexes: 0 });

        jest.spyOn(activeList, 'activateByIndex');

        activeList.activateNext({ isUserInteraction: true });

        expect(activeList.activateByIndex).toHaveBeenCalledTimes(1);
        expect(activeList.activateByIndex).toHaveBeenCalledWith(1, {
          isUserInteraction: true,
        });
      });

      test('activates first element when content is empty.', () => {
        const { activeList } = setup({ activeIndexes: [] });

        jest.spyOn(activeList, 'activateByIndex');

        activeList.activateNext({ isUserInteraction: true });

        expect(activeList.activateByIndex).toHaveBeenCalledTimes(1);
        expect(activeList.activateByIndex).toHaveBeenCalledWith(0, {
          isUserInteraction: true,
        });
      });

      test('activates nothing when content is empty.', () => {
        const { activeList } = setup({}, []);

        jest.spyOn(activeList, 'activateByIndex');

        activeList.activateNext({ isUserInteraction: true });

        expect(activeList.activateByIndex).toHaveBeenCalledTimes(0);
      });

      describe('when moving beyond the last index ', () => {
        test('when isCircular is true it should go to first', () => {
          const { activeList } = setup({
            activeIndexes: 2,
            isCircular: true,
          });

          jest.spyOn(activeList, 'activateByIndex');

          activeList.activateNext();

          expect(activeList.activateByIndex).toHaveBeenCalledTimes(1);
          expect(activeList.activateByIndex).toHaveBeenCalledWith(0, undefined);
        });

        test('when isCircular is false it should do nothing', () => {
          const { activeList } = setup({
            activeIndexes: 2,
            isCircular: false,
          });

          jest.spyOn(activeList, 'activateByIndex');

          activeList.activateNext();

          expect(activeList.activateByIndex).toHaveBeenCalledTimes(1);
          expect(activeList.activateByIndex).toHaveBeenCalledWith(2, undefined);
        });
      });
    });

    describe('activatePrevious', () => {
      test('activates the previous content', () => {
        const { activeList } = setup({ activeIndexes: 2 });

        jest.spyOn(activeList, 'activateByIndex');

        activeList.activatePrevious({ isUserInteraction: true });

        expect(activeList.activateByIndex).toHaveBeenCalledTimes(1);
        expect(activeList.activateByIndex).toHaveBeenCalledWith(1, {
          isUserInteraction: true,
        });
      });

      test('activates first element when content is empty.', () => {
        const { activeList } = setup({ activeIndexes: [] });

        jest.spyOn(activeList, 'activateByIndex');

        activeList.activatePrevious({ isUserInteraction: true });

        expect(activeList.activateByIndex).toHaveBeenCalledTimes(1);
        expect(activeList.activateByIndex).toHaveBeenCalledWith(0, {
          isUserInteraction: true,
        });
      });

      test('activates nothing when content is empty.', () => {
        const { activeList } = setup({}, []);

        jest.spyOn(activeList, 'activateByIndex');

        activeList.activatePrevious({ isUserInteraction: true });

        expect(activeList.activateByIndex).toHaveBeenCalledTimes(0);
      });

      describe('when beyond the first index', () => {
        test('when isCircular is true it should go to last', () => {
          const { activeList } = setup({
            activeIndexes: 0,
            isCircular: true,
          });

          jest.spyOn(activeList, 'activateByIndex');

          activeList.activatePrevious();

          expect(activeList.activateByIndex).toHaveBeenCalledTimes(1);
          expect(activeList.activateByIndex).toHaveBeenCalledWith(2, undefined);
        });

        test('when false it should do nothing', () => {
          const { activeList } = setup({
            activeIndexes: 0,
            isCircular: false,
          });

          jest.spyOn(activeList, 'activateByIndex');

          activeList.activatePrevious();

          expect(activeList.activateByIndex).toHaveBeenCalledTimes(1);
          expect(activeList.activateByIndex).toHaveBeenCalledWith(0, undefined);
        });
      });
    });

    describe('activateFirst', () => {
      test('should activate the first content in the sequence.', () => {
        const { activeList } = setup({ activeIndexes: 1 });

        jest.spyOn(activeList, 'activateByIndex');

        activeList.activateFirst({
          isUserInteraction: false,
        });

        expect(activeList.activateByIndex).toHaveBeenCalledTimes(1);
        expect(activeList.activateByIndex).toHaveBeenCalledWith(0, {
          isUserInteraction: false,
        });
      });

      test('should do nothing when there is no content to activate', () => {
        const { activeList } = setup({}, []);

        jest.spyOn(activeList, 'activateByIndex');

        activeList.activateFirst({
          isUserInteraction: false,
        });

        expect(activeList.activateByIndex).toHaveBeenCalledTimes(0);
      });
    });

    describe('activateLast', () => {
      test('should activate the last content in the sequence.', () => {
        const { activeList } = setup({ activeIndexes: 1 });

        jest.spyOn(activeList, 'activateByIndex');

        activeList.activateLast({
          isUserInteraction: false,
        });

        expect(activeList.activateByIndex).toHaveBeenCalledTimes(1);
        expect(activeList.activateByIndex).toHaveBeenCalledWith(2, {
          isUserInteraction: false,
        });
      });

      test('should do nothing when there is no content to activate', () => {
        const { activeList } = setup({}, []);

        jest.spyOn(activeList, 'activateByIndex');

        activeList.activateLast({
          isUserInteraction: false,
        });

        expect(activeList.activateByIndex).toHaveBeenCalledTimes(0);
      });
    });

    describe('ActiveListContent methods', () => {
      test('activate on content', () => {
        const { activeList } = setup();

        jest.spyOn(activeList, 'activateByIndex');

        activeList.contents[1].activate({ isUserInteraction: false });

        expect(activeList.activateByIndex).toHaveBeenCalledTimes(1);
        expect(activeList.activateByIndex).toHaveBeenCalledWith(1, {
          isUserInteraction: false,
        });
      });

      test('activate on content after removal should work because the indexes should be fixed', () => {
        const { activeList } = setup({ activeIndexes: 0 });

        jest.spyOn(activeList, 'activateByIndex');

        activeList.shift();

        activeList.contents[1].activate({ isUserInteraction: false });

        expect(activeList.activateByIndex).toHaveBeenCalledTimes(1);
        expect(activeList.activateByIndex).toHaveBeenLastCalledWith(1, {
          isUserInteraction: false,
        });

        expect(activeList.active).toEqual(['c']);
      });
    });
  });

  describe('deactivation of elements', () => {
    describe('deactivateByIndex', () => {
      describe('when it throws out of bounds', () => {
        test('throws out of bounds when index is to large', () => {
          const { activeList, subscriber } = setup({});

          expect(() => {
            activeList.deactivateByIndex(4);
          }).toThrowError(
            `uiloos > ActiveList > deactivateByIndex > "index" is out of bounds`
          );

          expect(() => {
            activeList.deactivateByIndex(4);
          }).toThrowError(ActiveListIndexOutOfBoundsError);

          expect(() => {
            activeList.deactivateByIndex(3);
          }).toThrowError(
            `uiloos > ActiveList > deactivateByIndex > "index" is out of bounds`
          );

          expect(() => {
            activeList.deactivateByIndex(3);
          }).toThrowError(ActiveListIndexOutOfBoundsError);

          expect(subscriber).toHaveBeenCalledTimes(0);

          expect(activeList.active).toEqual([]);
        });

        test('throws out of bounds when index is less than zero', () => {
          const { activeList, subscriber } = setup();

          expect(() => {
            activeList.deactivateByIndex(-1);
          }).toThrowError(
            `uiloos > ActiveList > deactivateByIndex > "index" is out of bounds`
          );

          expect(() => {
            activeList.deactivateByIndex(-1);
          }).toThrowError(ActiveListIndexOutOfBoundsError);

          expect(subscriber).toHaveBeenCalledTimes(0);

          expect(activeList.active).toEqual([]);
        });
      });

      test('that when deactivating an already inactive index that it does nothing', () => {
        const { activeList, subscriber } = setup({ activeIndexes: 0 });

        activeList.deactivateByIndex(2);

        expect(subscriber).toHaveBeenCalledTimes(0);
      });

      test('deactivated last active item reset behavior', () => {
        const { activeList, subscriber } = setup({
          activeIndexes: 0,
          maxActivationLimit: 1,
          isCircular: true,
        });

        activeList.deactivateByIndex(0);

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
            lastDeactivated: 'a',
            lastDeactivatedContent: activeList.contents[0],
            lastDeactivatedIndex: 0,
            direction: 'right',
            oppositeDirection: 'left',
            maxActivationLimit: 1,
            maxActivationLimitBehavior: 'circular',
            history: [],
            hasActiveChangedAtLeastOnce: true,
            autoPlay: {
              isPlaying: false,
              hasBeenStoppedBefore: false,
              duration: 0,
            },
            cooldown: {
              isActive: false,
              duration: 0,
            },
            isCircular: true,
            contents: [
              {
                isActive: false,
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
                isActive: false,
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
                isActive: false,
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

      test('deactivated last active item reset behavior with custom direction', () => {
        const { activeList, subscriber } = setup({
          activeIndexes: 0,
          maxActivationLimit: 1,
          isCircular: true,
          directions: { next: 'down', previous: 'up' },
        });

        activeList.deactivateByIndex(0);

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
            lastDeactivated: 'a',
            lastDeactivatedContent: activeList.contents[0],
            lastDeactivatedIndex: 0,
            direction: 'down',
            oppositeDirection: 'up',
            maxActivationLimit: 1,
            maxActivationLimitBehavior: 'circular',
            history: [],
            hasActiveChangedAtLeastOnce: true,
            autoPlay: {
              isPlaying: false,
              hasBeenStoppedBefore: false,
              duration: 0,
            },
            cooldown: {
              isActive: false,
              duration: 0,
            },
            isCircular: true,
            contents: [
              {
                isActive: false,
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
                isActive: false,
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
                isActive: false,
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
            const { activeList, subscriber } = setup({
              activeIndexes: [0, 2, 1],
              maxActivationLimit: false,
              isCircular: true,
            });

            activeList.deactivateByIndex(1);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(
              subscriber,
              {
                active: ['a', 'c'],
                activeContents: [
                  activeList.contents[0],
                  activeList.contents[2],
                ],
                activeIndexes: [0, 2],
                lastActivated: 'c',
                lastActivatedContent: activeList.contents[2],
                lastActivatedIndex: 2,
                lastDeactivated: 'b',
                lastDeactivatedContent: activeList.contents[1],
                lastDeactivatedIndex: 1,
                direction: 'right',
                oppositeDirection: 'left',
                maxActivationLimit: false,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                isCircular: true,
                contents: [
                  {
                    isActive: true,
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
                    isActive: false,
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
                    isActive: true,
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
            const { activeList, subscriber } = setup({
              activeIndexes: [0, 1, 2],
              maxActivationLimit: false,
              isCircular: true,
            });

            activeList.deactivateByIndex(1);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(
              subscriber,
              {
                active: ['a', 'c'],
                activeContents: [
                  activeList.contents[0],
                  activeList.contents[2],
                ],
                activeIndexes: [0, 2],
                lastActivated: 'c',
                lastActivatedContent: activeList.contents[2],
                lastActivatedIndex: 2,
                lastDeactivated: 'b',
                lastDeactivatedContent: activeList.contents[1],
                lastDeactivatedIndex: 1,
                direction: 'right',
                oppositeDirection: 'left',
                maxActivationLimit: false,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                isCircular: true,
                contents: [
                  {
                    isActive: true,
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
                    isActive: false,
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
                    isActive: true,
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
            const { activeList, subscriber } = setup({
              activeIndexes: [2, 0, 1],
              maxActivationLimit: false,
              isCircular: true,
            });

            activeList.deactivateByIndex(1);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(
              subscriber,
              {
                active: ['c', 'a'],
                activeContents: [
                  activeList.contents[2],
                  activeList.contents[0],
                ],
                activeIndexes: [2, 0],
                lastActivated: 'a',
                lastActivatedContent: activeList.contents[0],
                lastActivatedIndex: 0,
                lastDeactivated: 'b',
                lastDeactivatedContent: activeList.contents[1],
                lastDeactivatedIndex: 1,
                direction: 'left',
                oppositeDirection: 'right',
                maxActivationLimit: false,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                isCircular: true,
                contents: [
                  {
                    isActive: true,
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
                    isActive: false,
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
                    isActive: true,
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
            const { activeList, subscriber } = setup({
              activeIndexes: [2, 1, 0],
              maxActivationLimit: false,
              isCircular: true,
            });

            activeList.deactivateByIndex(1);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(
              subscriber,
              {
                active: ['c', 'a'],
                activeContents: [
                  activeList.contents[2],
                  activeList.contents[0],
                ],
                activeIndexes: [2, 0],
                lastActivated: 'a',
                lastActivatedContent: activeList.contents[0],
                lastActivatedIndex: 0,
                lastDeactivated: 'b',
                lastDeactivatedContent: activeList.contents[1],
                lastDeactivatedIndex: 1,
                direction: 'left',
                oppositeDirection: 'right',
                maxActivationLimit: false,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                isCircular: true,
                contents: [
                  {
                    isActive: true,
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
                    isActive: false,
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
                    isActive: true,
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
            const { activeList, subscriber } = setup({
              activeIndexes: [1, 0, 2],
              maxActivationLimit: false,
              isCircular: true,
            });

            activeList.deactivateByIndex(2);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(
              subscriber,
              {
                active: ['b', 'a'],
                activeContents: [
                  activeList.contents[1],
                  activeList.contents[0],
                ],
                activeIndexes: [1, 0],
                lastActivated: 'a',
                lastActivatedContent: activeList.contents[0],
                lastActivatedIndex: 0,
                lastDeactivated: 'c',
                lastDeactivatedContent: activeList.contents[2],
                lastDeactivatedIndex: 2,
                direction: 'right',
                oppositeDirection: 'left',
                maxActivationLimit: false,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                isCircular: true,
                contents: [
                  {
                    isActive: true,
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
                    isActive: true,
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
                    isActive: false,
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
            const { activeList, subscriber } = setup({
              activeIndexes: [1, 2, 0],
              maxActivationLimit: false,
              isCircular: true,
            });

            activeList.deactivateByIndex(0);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(
              subscriber,
              {
                active: ['b', 'c'],
                activeContents: [
                  activeList.contents[1],
                  activeList.contents[2],
                ],
                activeIndexes: [1, 2],
                lastActivated: 'c',
                lastActivatedContent: activeList.contents[2],
                lastActivatedIndex: 2,
                lastDeactivated: 'a',
                lastDeactivatedContent: activeList.contents[0],
                lastDeactivatedIndex: 0,
                direction: 'left',
                oppositeDirection: 'right',
                maxActivationLimit: false,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                isCircular: true,
                contents: [
                  {
                    isActive: false,
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
                    isActive: true,
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
                    isActive: true,
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
            const { activeList, subscriber } = setup({
              activeIndexes: [0, 2, 1],
              maxActivationLimit: false,
              isCircular: false,
            });

            activeList.deactivateByIndex(1);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(
              subscriber,
              {
                active: ['a', 'c'],
                activeContents: [
                  activeList.contents[0],
                  activeList.contents[2],
                ],
                activeIndexes: [0, 2],
                lastActivated: 'c',
                lastActivatedContent: activeList.contents[2],
                lastActivatedIndex: 2,
                lastDeactivated: 'b',
                lastDeactivatedContent: activeList.contents[1],
                lastDeactivatedIndex: 1,
                direction: 'right',
                oppositeDirection: 'left',
                maxActivationLimit: false,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                isCircular: false,
                contents: [
                  {
                    isActive: true,
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
                    isActive: false,
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
                    isActive: true,
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
            const { activeList, subscriber } = setup({
              activeIndexes: [0, 1, 2],
              maxActivationLimit: false,
              isCircular: false,
            });

            activeList.deactivateByIndex(1);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(
              subscriber,
              {
                active: ['a', 'c'],
                activeContents: [
                  activeList.contents[0],
                  activeList.contents[2],
                ],
                activeIndexes: [0, 2],
                lastActivated: 'c',
                lastActivatedContent: activeList.contents[2],
                lastActivatedIndex: 2,
                lastDeactivated: 'b',
                lastDeactivatedContent: activeList.contents[1],
                lastDeactivatedIndex: 1,
                direction: 'right',
                oppositeDirection: 'left',
                maxActivationLimit: false,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                isCircular: false,
                contents: [
                  {
                    isActive: true,
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
                    isActive: false,
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
                    isActive: true,
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
            const { activeList, subscriber } = setup({
              activeIndexes: [2, 0, 1],
              maxActivationLimit: false,
              isCircular: false,
            });

            activeList.deactivateByIndex(1);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(
              subscriber,
              {
                active: ['c', 'a'],
                activeContents: [
                  activeList.contents[2],
                  activeList.contents[0],
                ],
                activeIndexes: [2, 0],
                lastActivated: 'a',
                lastActivatedContent: activeList.contents[0],
                lastActivatedIndex: 0,
                lastDeactivated: 'b',
                lastDeactivatedContent: activeList.contents[1],
                lastDeactivatedIndex: 1,
                direction: 'left',
                oppositeDirection: 'right',
                maxActivationLimit: false,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                isCircular: false,
                contents: [
                  {
                    isActive: true,
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
                    isActive: false,
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
                    isActive: true,
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
            const { activeList, subscriber } = setup({
              activeIndexes: [2, 1, 0],
              maxActivationLimit: false,
              isCircular: false,
            });

            activeList.deactivateByIndex(1);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(
              subscriber,
              {
                active: ['c', 'a'],
                activeContents: [
                  activeList.contents[2],
                  activeList.contents[0],
                ],
                activeIndexes: [2, 0],
                lastActivated: 'a',
                lastActivatedContent: activeList.contents[0],
                lastActivatedIndex: 0,
                lastDeactivated: 'b',
                lastDeactivatedContent: activeList.contents[1],
                lastDeactivatedIndex: 1,
                direction: 'left',
                oppositeDirection: 'right',
                maxActivationLimit: false,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                isCircular: false,
                contents: [
                  {
                    isActive: true,
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
                    isActive: false,
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
                    isActive: true,
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
            const { activeList, subscriber } = setup({
              activeIndexes: [1, 0, 2],
              maxActivationLimit: false,
              isCircular: false,
            });

            activeList.deactivateByIndex(2);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(
              subscriber,
              {
                active: ['b', 'a'],
                activeContents: [
                  activeList.contents[1],
                  activeList.contents[0],
                ],
                activeIndexes: [1, 0],
                lastActivated: 'a',
                lastActivatedContent: activeList.contents[0],
                lastActivatedIndex: 0,
                lastDeactivated: 'c',
                lastDeactivatedContent: activeList.contents[2],
                lastDeactivatedIndex: 2,
                direction: 'left',
                oppositeDirection: 'right',
                maxActivationLimit: false,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                isCircular: false,
                contents: [
                  {
                    isActive: true,
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
                    isActive: true,
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
                    isActive: false,
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
            const { activeList, subscriber } = setup({
              activeIndexes: [1, 2, 0],
              maxActivationLimit: false,
              isCircular: false,
            });

            activeList.deactivateByIndex(0);

            expect(subscriber).toHaveBeenCalledTimes(1);
            assertLastSubscriber(
              subscriber,
              {
                active: ['b', 'c'],
                activeContents: [
                  activeList.contents[1],
                  activeList.contents[2],
                ],
                activeIndexes: [1, 2],
                lastActivated: 'c',
                lastActivatedContent: activeList.contents[2],
                lastActivatedIndex: 2,
                lastDeactivated: 'a',
                lastDeactivatedContent: activeList.contents[0],
                lastDeactivatedIndex: 0,
                direction: 'right',
                oppositeDirection: 'left',
                maxActivationLimit: false,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                isCircular: false,
                contents: [
                  {
                    isActive: false,
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
                    isActive: true,
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
                    isActive: true,
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

      test('that it sets a cooldown', () => {
        const { activeList, subscriber } = setup({
          activeIndexes: 0,
          cooldown: 1000,
        });

        activeList.deactivateByIndex(0);

        expect(activeList.cooldown).toEqual({ isActive: true, duration: 1000 });

        expect(subscriber).toHaveBeenCalledTimes(2);
        assertEvents(subscriber, ['DEACTIVATED', 'COOLDOWN_STARTED']);
      });
    });

    describe('deactivate', () => {
      test('deactivate content by identity', () => {
        const { activeList, contents } = setup();

        jest.spyOn(activeList, 'deactivateByIndex');

        activeList.deactivate(contents[1], {
          isUserInteraction: true,
        });

        expect(activeList.deactivateByIndex).toHaveBeenCalledTimes(1);
        expect(activeList.deactivateByIndex).toHaveBeenCalledWith(1, {
          isUserInteraction: true,
        });
      });

      test('throws item not found', () => {
        const { activeList } = setup();

        jest.spyOn(activeList, 'deactivateByIndex');

        expect(() => {
          activeList.deactivate('d');
        }).toThrowError(
          'uiloos > ActiveList > getIndex > index cannot be found, item is not in contents array'
        );

        expect(() => {
          activeList.deactivate('d');
        }).toThrowError(ActiveListItemNotFoundError);

        expect(activeList.deactivateByIndex).toHaveBeenCalledTimes(0);
      });
    });

    describe('deactivateByPredicate', () => {
      test('when multiple items match they should all be deactivated', () => {
        // The two 'a's will match the predicate
        const { activeList, subscriber } = setup(
          {
            activeIndexes: [0, 1, 2, 3],
            maxActivationLimit: false,
          },
          ['b', 'a', 'a', 'z']
        );

        activeList.deactivateByPredicate(
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
            activeContents: [activeList.contents[0], activeList.contents[3]],
            activeIndexes: [0, 3],
            lastActivated: 'z',
            lastActivatedContent: activeList.contents[3],
            lastActivatedIndex: 3,
            lastDeactivated: 'a',
            lastDeactivatedContent: activeList.contents[2],
            lastDeactivatedIndex: 2,
            direction: 'right',
            oppositeDirection: 'left',
            maxActivationLimit: false,
            maxActivationLimitBehavior: 'circular',
            history: [],
            hasActiveChangedAtLeastOnce: true,
            autoPlay: {
              isPlaying: false,
              hasBeenStoppedBefore: false,
              duration: 0,
            },
            cooldown: {
              isActive: false,
              duration: 0,
            },
            isCircular: false,
            contents: [
              {
                isActive: true,
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
                isActive: false,
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
                isActive: false,
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
                isActive: true,
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

      test('when all matching items are already deactivated it does nothing', () => {
        // The two 'a's will match the predicate
        const { activeList, subscriber } = setup(
          { maxActivationLimit: false, activeIndexes: [1, 2] },
          ['b', 'a', 'a', 'z']
        );

        activeList.deactivateByPredicate(
          (data) => {
            expect(data.index).toBeDefined();
            expect(data.value).toBeDefined();

            expect(data.content).toBeDefined();
            expect(data.content).toBeInstanceOf(ActiveListContent);

            expect(data.activeList).toBeDefined();

            expect(data.activeList).toBeInstanceOf(ActiveList);
            return data.value === 'b' || data.value === 'z';
          },
          {
            isUserInteraction: true,
          }
        );

        assertState(activeList, {
          active: ['a', 'a'],
          activeContents: [activeList.contents[1], activeList.contents[2]],
          activeIndexes: [1, 2],
          lastActivated: 'a',
          lastActivatedContent: activeList.contents[2],
          lastActivatedIndex: 2,
          lastDeactivated: null,
          lastDeactivatedContent: null,
          lastDeactivatedIndex: -1,
          direction: 'right',
          oppositeDirection: 'left',
          maxActivationLimit: false,
          maxActivationLimitBehavior: 'circular',
          history: [],
          hasActiveChangedAtLeastOnce: false,
          autoPlay: {
            isPlaying: false,
            hasBeenStoppedBefore: false,
            duration: 0,
          },
          cooldown: {
            isActive: false,
            duration: 0,
          },
          isCircular: false,
          contents: [
            {
              isActive: false,
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
              isActive: true,
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
              isActive: true,
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
              isActive: false,
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

        expect(subscriber).toHaveBeenCalledTimes(0);
      });

      test('when no items match they should remain as they were', () => {
        // The two 'a's will match the predicate
        const { activeList, subscriber } = setup(
          {
            activeIndexes: [0, 1, 3],
            maxActivationLimit: false,
          },
          ['b', 'a', 'a', 'z']
        );

        activeList.deactivateByPredicate((data) => {
          expect(data.index).toBeDefined();
          expect(data.value).toBeDefined();

          expect(data.content).toBeDefined();
          expect(data.content).toBeInstanceOf(ActiveListContent);

          expect(data.activeList).toBeDefined();

          expect(data.activeList).toBeInstanceOf(ActiveList);
          return data.value === 'c';
        });

        assertState(activeList, {
          active: ['b', 'a', 'z'],
          activeContents: [
            activeList.contents[0],
            activeList.contents[1],
            activeList.contents[3],
          ],
          activeIndexes: [0, 1, 3],
          lastActivated: 'z',
          lastActivatedContent: activeList.contents[3],
          lastActivatedIndex: 3,
          lastDeactivated: null,
          lastDeactivatedContent: null,
          lastDeactivatedIndex: -1,
          direction: 'right',
          oppositeDirection: 'left',
          maxActivationLimit: false,
          maxActivationLimitBehavior: 'circular',
          history: [],
          hasActiveChangedAtLeastOnce: false,
          autoPlay: {
            isPlaying: false,
            hasBeenStoppedBefore: false,
            duration: 0,
          },
          cooldown: {
            isActive: false,
            duration: 0,
          },
          isCircular: false,
          contents: [
            {
              isActive: true,
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
              isActive: true,
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
              isActive: false,
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
              isActive: true,
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

        expect(subscriber).toHaveBeenCalledTimes(0);
      });

      test('that it sets a cooldown', () => {
        const { activeList, subscriber } = setup({
          activeIndexes: 0,
          cooldown: 1000,
        });

        activeList.deactivateByPredicate(() => true);

        expect(activeList.cooldown).toEqual({ isActive: true, duration: 1000 });

        expect(subscriber).toHaveBeenCalledTimes(2);
        assertEvents(subscriber, ['DEACTIVATED_MULTIPLE', 'COOLDOWN_STARTED']);
      });

      test('that when a cooldown is active that it early exists', () => {
        const { activeList, subscriber } = setup({
          activeIndexes: 1,
          cooldown: 1000,
        });

        activeList.activateByIndex(0);

        expect(activeList.cooldown).toEqual({ isActive: true, duration: 1000 });

        expect(subscriber).toHaveBeenCalledTimes(2);
        assertEvents(subscriber, ['ACTIVATED', 'COOLDOWN_STARTED']);

        activeList.deactivateByPredicate(() => true);

        expect(subscriber).toHaveBeenCalledTimes(2);
      });
    });

    describe('ActiveListContent methods', () => {
      test('deactivate on content', () => {
        const { activeList } = setup();

        jest.spyOn(activeList, 'deactivateByIndex');

        activeList.contents[1].deactivate({ isUserInteraction: false });

        expect(activeList.deactivateByIndex).toHaveBeenCalledTimes(1);
        expect(activeList.deactivateByIndex).toHaveBeenCalledWith(1, {
          isUserInteraction: false,
        });
      });

      test('deactivate on content after removal should work because the indexes should be fixed', () => {
        const { activeList } = setup();

        jest.spyOn(activeList, 'deactivateByIndex');

        // 'a' is active, by unshifting 'b' becomes active.
        activeList.shift();

        // 'b' is now on the 0th index, deactivating it should make nothing active.
        activeList.contents[0].deactivate({ isUserInteraction: false });

        expect(activeList.deactivateByIndex).toHaveBeenCalledTimes(1);
        expect(activeList.deactivateByIndex).toHaveBeenLastCalledWith(0, {
          isUserInteraction: false,
        });

        expect(activeList.active).toEqual([]);
      });
    });
  });

  describe('toggling of elements', () => {
    describe('toggleByIndex', () => {
      describe('when it throws out of bounds', () => {
        test('throws out of bounds when index is to large', () => {
          const { activeList, subscriber } = setup({});

          expect(() => {
            activeList.toggleByIndex(4);
          }).toThrowError(
            `uiloos > ActiveList > toggleByIndex > "index" is out of bounds`
          );

          expect(() => {
            activeList.toggleByIndex(4);
          }).toThrowError(ActiveListIndexOutOfBoundsError);

          expect(() => {
            activeList.toggleByIndex(3);
          }).toThrowError(
            `uiloos > ActiveList > toggleByIndex > "index" is out of bounds`
          );

          expect(() => {
            activeList.toggleByIndex(3);
          }).toThrowError(ActiveListIndexOutOfBoundsError);

          expect(subscriber).toHaveBeenCalledTimes(0);

          expect(activeList.active).toEqual([]);
        });

        test('throws out of bounds when index is less than zero', () => {
          const { activeList, subscriber } = setup({});

          expect(() => {
            activeList.toggleByIndex(-1);
          }).toThrowError(
            `uiloos > ActiveList > toggleByIndex > "index" is out of bounds`
          );

          expect(() => {
            activeList.toggleByIndex(-1);
          }).toThrowError(ActiveListIndexOutOfBoundsError);

          expect(subscriber).toHaveBeenCalledTimes(0);

          expect(activeList.active).toEqual([]);
        });
      });

      test('toggling by index scenario', () => {
        const { activeList } = setup({ activeIndexes: 0 });

        jest.spyOn(activeList, 'activateByIndex');
        jest.spyOn(activeList, 'deactivateByIndex');

        activeList.toggleByIndex(0, { isUserInteraction: false });

        expect(activeList.deactivateByIndex).toHaveBeenCalledTimes(1);
        expect(activeList.deactivateByIndex).toHaveBeenCalledWith(0, {
          isUserInteraction: false,
        });

        activeList.toggleByIndex(0, { isUserInteraction: false });

        expect(activeList.activateByIndex).toHaveBeenCalledTimes(1);
        expect(activeList.activateByIndex).toHaveBeenCalledWith(0, {
          isUserInteraction: false,
        });

        activeList.toggleByIndex(0, { isUserInteraction: true });

        expect(activeList.deactivateByIndex).toHaveBeenCalledTimes(2);
        expect(activeList.deactivateByIndex).toHaveBeenCalledWith(0, {
          isUserInteraction: true,
        });

        activeList.toggleByIndex(0, { isUserInteraction: true });

        expect(activeList.activateByIndex).toHaveBeenCalledTimes(2);
        expect(activeList.activateByIndex).toHaveBeenCalledWith(0, {
          isUserInteraction: true,
        });
      });
    });

    describe('toggle', () => {
      test('toggle by identity scenario', () => {
        const { activeList } = setup({ activeIndexes: 0 });

        jest.spyOn(activeList, 'activateByIndex');
        jest.spyOn(activeList, 'deactivateByIndex');

        activeList.toggle('a', { isUserInteraction: false });

        expect(activeList.deactivateByIndex).toHaveBeenCalledTimes(1);
        expect(activeList.deactivateByIndex).toHaveBeenCalledWith(0, {
          isUserInteraction: false,
        });

        activeList.toggle('a', { isUserInteraction: false });

        expect(activeList.activateByIndex).toHaveBeenCalledTimes(1);
        expect(activeList.activateByIndex).toHaveBeenCalledWith(0, {
          isUserInteraction: false,
        });

        activeList.toggle('a', { isUserInteraction: true });

        expect(activeList.deactivateByIndex).toHaveBeenCalledTimes(2);
        expect(activeList.deactivateByIndex).toHaveBeenCalledWith(0, {
          isUserInteraction: true,
        });

        activeList.toggle('a', { isUserInteraction: true });

        expect(activeList.activateByIndex).toHaveBeenCalledTimes(2);
        expect(activeList.activateByIndex).toHaveBeenCalledWith(0, {
          isUserInteraction: true,
        });
      });

      test('throws item not found', () => {
        const { activeList } = setup();

        jest.spyOn(activeList, 'activateByIndex');

        expect(() => {
          activeList.toggle('d');
        }).toThrowError(
          'uiloos > ActiveList > getIndex > index cannot be found, item is not in contents array'
        );

        expect(() => {
          activeList.toggle('d');
        }).toThrowError(ActiveListItemNotFoundError);

        expect(activeList.activateByIndex).toHaveBeenCalledTimes(0);
      });
    });

    describe('ActiveListContent methods', () => {
      test('toggle on content which starts as active', () => {
        const { activeList } = setup({ activeIndexes: 0 });

        jest.spyOn(activeList, 'activateByIndex');
        jest.spyOn(activeList, 'deactivateByIndex');

        activeList.contents[0].toggle({ isUserInteraction: false });

        expect(activeList.deactivateByIndex).toHaveBeenCalledTimes(1);
        expect(activeList.deactivateByIndex).toHaveBeenCalledWith(0, {
          isUserInteraction: false,
        });

        activeList.contents[0].toggle({ isUserInteraction: false });

        expect(activeList.activateByIndex).toHaveBeenCalledTimes(1);
        expect(activeList.activateByIndex).toHaveBeenCalledWith(0, {
          isUserInteraction: false,
        });

        activeList.contents[0].toggle({ isUserInteraction: true });

        expect(activeList.deactivateByIndex).toHaveBeenCalledTimes(2);
        expect(activeList.deactivateByIndex).toHaveBeenCalledWith(0, {
          isUserInteraction: true,
        });

        activeList.contents[0].toggle({ isUserInteraction: true });

        expect(activeList.activateByIndex).toHaveBeenCalledTimes(2);
        expect(activeList.activateByIndex).toHaveBeenCalledWith(0, {
          isUserInteraction: true,
        });
      });

      test('toggle on content which starts as inactive', () => {
        const { activeList } = setup({ activeIndexes: [] });

        jest.spyOn(activeList, 'activateByIndex');
        jest.spyOn(activeList, 'deactivateByIndex');

        activeList.contents[0].toggle({ isUserInteraction: false });

        expect(activeList.activateByIndex).toHaveBeenCalledTimes(1);
        expect(activeList.activateByIndex).toHaveBeenCalledWith(0, {
          isUserInteraction: false,
        });

        activeList.contents[0].toggle({ isUserInteraction: false });

        expect(activeList.deactivateByIndex).toHaveBeenCalledTimes(1);
        expect(activeList.deactivateByIndex).toHaveBeenCalledWith(0, {
          isUserInteraction: false,
        });

        activeList.contents[0].toggle({ isUserInteraction: true });

        expect(activeList.activateByIndex).toHaveBeenCalledTimes(2);
        expect(activeList.activateByIndex).toHaveBeenCalledWith(0, {
          isUserInteraction: true,
        });

        activeList.contents[0].toggle({ isUserInteraction: true });

        expect(activeList.deactivateByIndex).toHaveBeenCalledTimes(2);
        expect(activeList.deactivateByIndex).toHaveBeenCalledWith(0, {
          isUserInteraction: true,
        });
      });
    });
  });

  describe('insertion of elements', () => {
    describe('when it throws out of bounds', () => {
      test('throws out of bounds when index is to large', () => {
        const { activeList, subscriber } = setup();

        expect(() => {
          activeList.insertAtIndex('d', 4);
        }).toThrowError(
          `uiloos > ActiveList > insertAtIndex > "index" is out of bounds`
        );

        expect(() => {
          activeList.insertAtIndex('d', 4);
        }).toThrowError(ActiveListIndexOutOfBoundsError);

        expect(subscriber).toHaveBeenCalledTimes(0);
      });

      test('throws out of bounds when index is less than zero', () => {
        const { activeList, subscriber } = setup();

        expect(() => {
          activeList.insertAtIndex('d', -1);
        }).toThrowError(
          `uiloos > ActiveList > insertAtIndex > "index" is out of bounds`
        );

        expect(() => {
          activeList.insertAtIndex('d', -1);
        }).toThrowError(ActiveListIndexOutOfBoundsError);

        expect(subscriber).toHaveBeenCalledTimes(0);
      });
    });

    test('inserting the first element should not activate it', () => {
      const { activeList, subscriber } = setup({}, []);

      activeList.unshift('z');

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
          lastDeactivated: null,
          lastDeactivatedContent: null,
          lastDeactivatedIndex: -1,
          isCircular: false,
          direction: 'right',
          oppositeDirection: 'left',
          maxActivationLimit: 1,
          maxActivationLimitBehavior: 'circular',
          history: [],
          hasActiveChangedAtLeastOnce: false,
          autoPlay: {
            isPlaying: false,
            hasBeenStoppedBefore: false,
            duration: 0,
          },
          cooldown: {
            isActive: false,
            duration: 0,
          },
          contents: [
            {
              isActive: false,
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
        const { activeList, subscriber } = setup({ activeIndexes: 0 });

        activeList.unshift('d');

        expect(subscriber).toHaveBeenCalledTimes(1);

        assertLastSubscriber(
          subscriber,
          {
            active: ['a'],
            activeContents: [activeList.contents[1]],
            activeIndexes: [1],
            lastActivated: 'a',
            lastActivatedContent: activeList.contents[1],
            lastActivatedIndex: 1,
            lastDeactivated: null,
            lastDeactivatedContent: null,
            lastDeactivatedIndex: -1,
            isCircular: false,
            direction: 'right',
            oppositeDirection: 'left',
            maxActivationLimit: 1,
            maxActivationLimitBehavior: 'circular',
            history: [],
            hasActiveChangedAtLeastOnce: false,
            autoPlay: {
              isPlaying: false,
              hasBeenStoppedBefore: false,
              duration: 0,
            },
            cooldown: {
              isActive: false,
              duration: 0,
            },
            contents: [
              {
                isActive: false,
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
                isActive: true,
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
                isActive: false,
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
                isActive: false,
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
        const { activeList, subscriber } = setup({ activeIndexes: 0 });

        activeList.insertAtIndex('d', 1);

        expect(subscriber).toHaveBeenCalledTimes(1);

        assertLastSubscriber(
          subscriber,
          {
            active: ['a'],
            activeContents: [activeList.contents[0]],
            activeIndexes: [0],
            lastActivated: 'a',
            lastActivatedContent: activeList.contents[0],
            lastActivatedIndex: 0,
            lastDeactivated: null,
            lastDeactivatedContent: null,
            lastDeactivatedIndex: -1,
            isCircular: false,
            direction: 'right',
            oppositeDirection: 'left',
            maxActivationLimit: 1,
            maxActivationLimitBehavior: 'circular',
            history: [],
            hasActiveChangedAtLeastOnce: false,
            autoPlay: {
              isPlaying: false,
              hasBeenStoppedBefore: false,
              duration: 0,
            },
            cooldown: {
              isActive: false,
              duration: 0,
            },
            contents: [
              {
                isActive: true,
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
                isActive: false,
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
                isActive: false,
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
                isActive: false,
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
        const { activeList, subscriber } = setup({ activeIndexes: 0 });

        activeList.push('d');

        expect(subscriber).toHaveBeenCalledTimes(1);

        assertLastSubscriber(
          subscriber,
          {
            active: ['a'],
            activeContents: [activeList.contents[0]],
            activeIndexes: [0],
            lastActivated: 'a',
            lastActivatedContent: activeList.contents[0],
            lastActivatedIndex: 0,
            lastDeactivated: null,
            lastDeactivatedContent: null,
            lastDeactivatedIndex: -1,
            isCircular: false,
            direction: 'right',
            oppositeDirection: 'left',
            maxActivationLimit: 1,
            maxActivationLimitBehavior: 'circular',
            history: [],
            hasActiveChangedAtLeastOnce: false,
            autoPlay: {
              isPlaying: false,
              hasBeenStoppedBefore: false,
              duration: 0,
            },
            cooldown: {
              isActive: false,
              duration: 0,
            },
            contents: [
              {
                isActive: true,
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
                isActive: false,
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
                isActive: false,
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
                isActive: false,
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
        const { activeList, subscriber } = setup({
          activeIndexes: [0, 1, 2],
          maxActivationLimit: false,
        });

        activeList.unshift('d');

        expect(subscriber).toHaveBeenCalledTimes(1);

        assertLastSubscriber(
          subscriber,
          {
            active: ['a', 'b', 'c'],
            activeContents: [
              activeList.contents[1],
              activeList.contents[2],
              activeList.contents[3],
            ],
            activeIndexes: [1, 2, 3],
            lastActivated: 'c',
            lastActivatedContent: activeList.contents[3],
            lastActivatedIndex: 3,
            lastDeactivated: null,
            lastDeactivatedContent: null,
            lastDeactivatedIndex: -1,
            isCircular: false,
            direction: 'right',
            oppositeDirection: 'left',
            maxActivationLimit: false,
            maxActivationLimitBehavior: 'circular',
            history: [],
            hasActiveChangedAtLeastOnce: false,
            autoPlay: {
              isPlaying: false,
              hasBeenStoppedBefore: false,
              duration: 0,
            },
            cooldown: {
              isActive: false,
              duration: 0,
            },
            contents: [
              {
                isActive: false,
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
                isActive: true,
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
                isActive: true,
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
                isActive: true,
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
        const { activeList, subscriber } = setup({
          activeIndexes: [0, 1, 2],
          maxActivationLimit: false,
        });

        activeList.insertAtIndex('d', 1);

        expect(subscriber).toHaveBeenCalledTimes(1);

        assertLastSubscriber(
          subscriber,
          {
            active: ['a', 'b', 'c'],
            activeContents: [
              activeList.contents[0],
              activeList.contents[2],
              activeList.contents[3],
            ],
            activeIndexes: [0, 2, 3],
            lastActivated: 'c',
            lastActivatedContent: activeList.contents[3],
            lastActivatedIndex: 3,
            lastDeactivated: null,
            lastDeactivatedContent: null,
            lastDeactivatedIndex: -1,
            isCircular: false,
            direction: 'right',
            oppositeDirection: 'left',
            maxActivationLimit: false,
            maxActivationLimitBehavior: 'circular',
            history: [],
            hasActiveChangedAtLeastOnce: false,
            autoPlay: {
              isPlaying: false,
              hasBeenStoppedBefore: false,
              duration: 0,
            },
            cooldown: {
              isActive: false,
              duration: 0,
            },
            contents: [
              {
                isActive: true,
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
                isActive: false,
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
                isActive: true,
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
                isActive: true,
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
        const { activeList, subscriber } = setup({
          activeIndexes: [0, 1, 2],
          maxActivationLimit: false,
        });

        activeList.push('d');

        expect(subscriber).toHaveBeenCalledTimes(1);

        assertLastSubscriber(
          subscriber,
          {
            active: ['a', 'b', 'c'],
            activeContents: [
              activeList.contents[0],
              activeList.contents[1],
              activeList.contents[2],
            ],
            activeIndexes: [0, 1, 2],
            lastActivated: 'c',
            lastActivatedContent: activeList.contents[2],
            lastActivatedIndex: 2,
            lastDeactivated: null,
            lastDeactivatedContent: null,
            lastDeactivatedIndex: -1,
            isCircular: false,
            direction: 'right',
            oppositeDirection: 'left',
            maxActivationLimit: false,
            maxActivationLimitBehavior: 'circular',
            history: [],
            hasActiveChangedAtLeastOnce: false,
            autoPlay: {
              isPlaying: false,
              hasBeenStoppedBefore: false,
              duration: 0,
            },
            cooldown: {
              isActive: false,
              duration: 0,
            },
            contents: [
              {
                isActive: true,
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
                isActive: true,
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
                isActive: true,
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
                isActive: false,
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

    test('insertAtIndex', () => {
      // test return only as `insertAtIndex` is used many times in other tests
      const { activeList } = setup({}, []);

      const result = activeList.insertAtIndex('d', 0);

      expect(result).toEqual({
        activeList,
        isActive: false,
        index: 0,
        value: 'd',
        isFirst: true,
        isLast: true,
        hasNext: false,
        hasPrevious: false,
        isNext: false,
        isPrevious: false,
        hasBeenActiveBefore: false,
      });
    });

    test('push', () => {
      // test return only as `push` is used many times in other tests
      const { activeList } = setup({}, []);

      const result = activeList.push('d');

      expect(result).toEqual({
        activeList,
        isActive: false,
        index: 0,
        value: 'd',
        isFirst: true,
        isLast: true,
        hasNext: false,
        hasPrevious: false,
        isNext: false,
        isPrevious: false,
        hasBeenActiveBefore: false,
      });
    });

    test('unshift', () => {
      // test return only as `unshift` is used many times in other tests

      const { activeList } = setup({}, []);

      const result = activeList.unshift('d');

      expect(result).toEqual({
        activeList,
        isActive: false,
        index: 0,
        value: 'd',
        isFirst: true,
        isLast: true,
        hasNext: false,
        hasPrevious: false,
        isNext: false,
        isPrevious: false,
        hasBeenActiveBefore: false,
      });
    });

    describe('insertByPredicate', () => {
      test('when no predicate matches do nothing', () => {
        const { activeList, subscriber } = setup({ activeIndexes: 1 });

        const result = activeList.insertByPredicate(
          'z',
          ({ value }) => value === 'y',
          {
            mode: 'at',
          }
        );

        expect(subscriber).toHaveBeenCalledTimes(0);

        expect(result).toBe(null);

        assertState(activeList, {
          active: ['b'],
          activeContents: [activeList.contents[1]],
          activeIndexes: [1],
          lastActivated: 'b',
          lastActivatedContent: activeList.contents[1],
          lastActivatedIndex: 1,
          lastDeactivated: null,
          lastDeactivatedContent: null,
          lastDeactivatedIndex: -1,
          isCircular: false,
          direction: 'right',
          oppositeDirection: 'left',
          maxActivationLimit: 1,
          maxActivationLimitBehavior: 'circular',
          history: [],
          hasActiveChangedAtLeastOnce: false,
          autoPlay: {
            isPlaying: false,
            hasBeenStoppedBefore: false,
            duration: 0,
          },
          cooldown: {
            isActive: false,
            duration: 0,
          },
          contents: [
            {
              isActive: false,
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
              isActive: true,
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
              isActive: false,
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
      });

      test('when no mode is provided assume at', () => {
        const { activeList, subscriber } = setup({ activeIndexes: 0 });

        const result = activeList.insertByPredicate(
          'd',
          ({ value }) => value === 'b'
        );

        expect(result).toEqual({
          activeList,
          isActive: false,
          index: 1,
          value: 'd',
          isFirst: false,
          isLast: false,
          hasNext: true,
          hasPrevious: true,
          isNext: true,
          isPrevious: false,
          hasBeenActiveBefore: false,
        });

        expect(subscriber).toHaveBeenCalledTimes(1);

        assertLastSubscriber(
          subscriber,
          {
            active: ['a'],
            activeContents: [activeList.contents[0]],
            activeIndexes: [0],
            lastActivated: 'a',
            lastActivatedContent: activeList.contents[0],
            lastActivatedIndex: 0,
            lastDeactivated: null,
            lastDeactivatedContent: null,
            lastDeactivatedIndex: -1,
            isCircular: false,
            direction: 'right',
            oppositeDirection: 'left',

            maxActivationLimit: 1,
            maxActivationLimitBehavior: 'circular',
            history: [],
            hasActiveChangedAtLeastOnce: false,
            autoPlay: {
              isPlaying: false,
              hasBeenStoppedBefore: false,
              duration: 0,
            },
            cooldown: {
              isActive: false,
              duration: 0,
            },
            contents: [
              {
                isActive: true,
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
                isActive: false,
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
                isActive: false,
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
                isActive: false,
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
        const { activeList, subscriber } = setup({ activeIndexes: 0 });

        activeList.insertByPredicate('d', ({ value }) => value === 'b', {
          mode: 'at',
        });

        expect(subscriber).toHaveBeenCalledTimes(1);

        assertLastSubscriber(
          subscriber,
          {
            active: ['a'],
            activeContents: [activeList.contents[0]],
            activeIndexes: [0],
            lastActivated: 'a',
            lastActivatedContent: activeList.contents[0],
            lastActivatedIndex: 0,
            lastDeactivated: null,
            lastDeactivatedContent: null,
            lastDeactivatedIndex: -1,
            isCircular: false,
            direction: 'right',
            oppositeDirection: 'left',

            maxActivationLimit: 1,
            maxActivationLimitBehavior: 'circular',
            history: [],
            hasActiveChangedAtLeastOnce: false,
            autoPlay: {
              isPlaying: false,
              hasBeenStoppedBefore: false,
              duration: 0,
            },
            cooldown: {
              isActive: false,
              duration: 0,
            },
            contents: [
              {
                isActive: true,
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
                isActive: false,
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
                isActive: false,
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
                isActive: false,
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
          const { activeList, subscriber } = setup({ activeIndexes: 0 });

          activeList.insertByPredicate('d', ({ value }) => value === 'a', {
            mode: 'before',
          });

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['a'],
              activeContents: [activeList.contents[1]],
              activeIndexes: [1],
              lastActivated: 'a',
              lastActivatedContent: activeList.contents[1],
              lastActivatedIndex: 1,
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              isCircular: false,
              direction: 'right',
              oppositeDirection: 'left',

              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              contents: [
                {
                  isActive: false,
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
                  isActive: true,
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
                  isActive: false,
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
                  isActive: false,
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
          const { activeList, subscriber } = setup({ activeIndexes: 0 });

          activeList.insertByPredicate('d', ({ value }) => value === 'b', {
            mode: 'before',
          });

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['a'],
              activeContents: [activeList.contents[1]],
              activeIndexes: [1],
              lastActivated: 'a',
              lastActivatedContent: activeList.contents[1],
              lastActivatedIndex: 1,
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              isCircular: false,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              contents: [
                {
                  isActive: false,
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
                  isActive: true,
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
                  isActive: false,
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
                  isActive: false,
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
          const { activeList, subscriber } = setup({ activeIndexes: 0 });

          activeList.insertByPredicate('d', ({ value }) => value === 'c', {
            mode: 'after',
          });

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['a'],
              activeContents: [activeList.contents[0]],
              activeIndexes: [0],
              lastActivated: 'a',
              lastActivatedContent: activeList.contents[0],
              lastActivatedIndex: 0,
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              isCircular: false,
              direction: 'right',
              oppositeDirection: 'left',

              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              contents: [
                {
                  isActive: true,
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
                  isActive: false,
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
                  isActive: false,
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
                  isActive: false,
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
          const { activeList, subscriber } = setup({ activeIndexes: 0 });

          activeList.insertByPredicate('d', ({ value }) => value === 'b', {
            mode: 'after',
          });

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['a'],
              activeContents: [activeList.contents[0]],
              activeIndexes: [0],
              lastActivated: 'a',
              lastActivatedContent: activeList.contents[0],
              lastActivatedIndex: 0,
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              isCircular: false,
              direction: 'right',
              oppositeDirection: 'left',

              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              contents: [
                {
                  isActive: true,
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
                  isActive: false,
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
                  isActive: false,
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
                  isActive: false,
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
          const { activeList, subscriber } = setup();

          expect(() => {
            activeList.removeByIndex(4);
          }).toThrowError(
            `uiloos > ActiveList > removeByIndex > "index" is out of bounds`
          );

          expect(() => {
            activeList.removeByIndex(4);
          }).toThrowError(ActiveListIndexOutOfBoundsError);

          expect(() => {
            activeList.removeByIndex(3);
          }).toThrowError(
            `uiloos > ActiveList > removeByIndex > "index" is out of bounds`
          );

          expect(() => {
            activeList.removeByIndex(3);
          }).toThrowError(ActiveListIndexOutOfBoundsError);

          expect(subscriber).toHaveBeenCalledTimes(0);
        });

        test('throws out of bounds when index is less than zero', () => {
          const { activeList, subscriber } = setup();

          expect(() => {
            activeList.removeByIndex(-1);
          }).toThrowError(
            `uiloos > ActiveList > removeByIndex > "index" is out of bounds`
          );

          expect(() => {
            activeList.removeByIndex(-1);
          }).toThrowError(ActiveListIndexOutOfBoundsError);

          expect(subscriber).toHaveBeenCalledTimes(0);
        });
      });

      describe('remove', () => {
        test('removes content by identity', () => {
          const { activeList, subscriber } = setup({ activeIndexes: 0 }, ['a']);

          const removed = activeList.remove('a');

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
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              isCircular: false,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: true,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              contents: [],
            },
            {
              type: 'REMOVED',
              value: 'a',
              index: 0,
              time: new Date(),
            }
          );

          expect(removed).toBe('a');
        });

        test('throws item not found', () => {
          const { activeList } = setup();

          jest.spyOn(activeList, 'deactivateByIndex');

          expect(() => {
            activeList.remove('d');
          }).toThrowError(
            'uiloos > ActiveList > getIndex > index cannot be found, item is not in contents array'
          );

          expect(() => {
            activeList.remove('d');
          }).toThrowError(ActiveListItemNotFoundError);

          expect(activeList.deactivateByIndex).toHaveBeenCalledTimes(0);
        });
      });

      describe('pop', () => {
        test('pop removes last item', () => {
          const { activeList, subscriber } = setup({ activeIndexes: 0 }, ['a']);

          const removed = activeList.pop();

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
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              isCircular: false,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: true,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              contents: [],
            },
            {
              type: 'REMOVED',
              value: 'a',
              index: 0,
              time: new Date(),
            }
          );

          expect(removed).toBe('a');
        });

        test('empty on pop returns undefined', () => {
          const { activeList, subscriber } = setup({}, []);

          const removed = activeList.pop();

          expect(subscriber).toHaveBeenCalledTimes(0);

          assertState(activeList, {
            active: [],
            activeContents: [],
            activeIndexes: [],
            lastActivated: null,
            lastActivatedContent: null,
            lastActivatedIndex: -1,
            lastDeactivated: null,
            lastDeactivatedContent: null,
            lastDeactivatedIndex: -1,
            isCircular: false,
            direction: 'right',
            oppositeDirection: 'left',
            maxActivationLimit: 1,
            maxActivationLimitBehavior: 'circular',
            history: [],
            hasActiveChangedAtLeastOnce: false,
            autoPlay: {
              isPlaying: false,
              hasBeenStoppedBefore: false,
              duration: 0,
            },
            cooldown: {
              isActive: false,
              duration: 0,
            },
            contents: [],
          });

          expect(removed).toBe(undefined);
        });
      });

      describe('shift', () => {
        test('shift removes first item', () => {
          const { activeList, subscriber } = setup({ activeIndexes: 0 }, ['a']);

          const removed = activeList.shift();

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
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              isCircular: false,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: true,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              contents: [],
            },
            {
              type: 'REMOVED',
              value: 'a',
              index: 0,
              time: new Date(),
            }
          );

          expect(removed).toBe('a');
        });

        test('empty on shift returns undefined', () => {
          const { activeList, subscriber } = setup({}, []);

          const removed = activeList.shift();

          expect(subscriber).toHaveBeenCalledTimes(0);

          assertState(activeList, {
            active: [],
            activeContents: [],
            activeIndexes: [],
            lastActivated: null,
            lastActivatedContent: null,
            lastActivatedIndex: -1,
            lastDeactivated: null,
            lastDeactivatedContent: null,
            lastDeactivatedIndex: -1,
            isCircular: false,
            direction: 'right',
            oppositeDirection: 'left',
            maxActivationLimit: 1,
            maxActivationLimitBehavior: 'circular',
            history: [],
            hasActiveChangedAtLeastOnce: false,
            autoPlay: {
              isPlaying: false,
              hasBeenStoppedBefore: false,
              duration: 0,
            },
            cooldown: {
              isActive: false,
              duration: 0,
            },
            contents: [],
          });

          expect(removed).toBe(undefined);
        });
      });

      describe('removal when maxActivationLimit is 1', () => {
        describe('removing single inactive element', () => {
          test('removing from the start', () => {
            const { activeList, subscriber } = setup({ activeIndexes: 1 });

            const removedValue = activeList.shift();

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(
              subscriber,
              {
                active: ['b'],
                activeContents: [activeList.contents[0]],
                activeIndexes: [0],
                lastActivated: 'b',
                lastActivatedContent: activeList.contents[0],
                lastActivatedIndex: 0,
                lastDeactivated: null,
                lastDeactivatedContent: null,
                lastDeactivatedIndex: -1,
                isCircular: false,
                direction: 'right',
                oppositeDirection: 'left',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: false,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                contents: [
                  {
                    isActive: true,
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
                    isActive: false,
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
            const { activeList, subscriber } = setup({ activeIndexes: 0 });

            const removedValue = activeList.removeByIndex(1);

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(
              subscriber,
              {
                active: ['a'],
                activeContents: [activeList.contents[0]],
                activeIndexes: [0],
                lastActivated: 'a',
                lastActivatedContent: activeList.contents[0],
                lastActivatedIndex: 0,
                lastDeactivated: null,
                lastDeactivatedContent: null,
                lastDeactivatedIndex: -1,
                isCircular: false,
                direction: 'right',
                oppositeDirection: 'left',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: false,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                contents: [
                  {
                    isActive: true,
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
                    isActive: false,
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
            const { activeList, subscriber } = setup({ activeIndexes: 0 });

            const removedValue = activeList.pop();

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(
              subscriber,
              {
                active: ['a'],
                activeContents: [activeList.contents[0]],
                activeIndexes: [0],
                lastActivated: 'a',
                lastActivatedContent: activeList.contents[0],
                lastActivatedIndex: 0,
                lastDeactivated: null,
                lastDeactivatedContent: null,
                lastDeactivatedIndex: -1,
                isCircular: false,
                direction: 'right',
                oppositeDirection: 'left',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: false,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                contents: [
                  {
                    isActive: true,
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
                    isActive: false,
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
            const { activeList, subscriber } = setup({ activeIndexes: 0 });

            const removedValue = activeList.shift();

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
                lastDeactivated: null,
                lastDeactivatedContent: null,
                lastDeactivatedIndex: -1,
                isCircular: false,
                direction: 'right',
                oppositeDirection: 'left',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                contents: [
                  {
                    isActive: false,
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
                    isActive: false,
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
            const { activeList, subscriber } = setup({ activeIndexes: 1 });

            const removedValue = activeList.removeByIndex(1);

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
                lastDeactivated: null,
                lastDeactivatedContent: null,
                lastDeactivatedIndex: -1,
                isCircular: false,
                direction: 'right',
                oppositeDirection: 'left',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                contents: [
                  {
                    isActive: false,
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
                    isActive: false,
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
            const { activeList, subscriber } = setup({ activeIndexes: 2 });

            const removedValue = activeList.pop();

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
                lastDeactivated: null,
                lastDeactivatedContent: null,
                lastDeactivatedIndex: -1,
                isCircular: false,
                direction: 'right',
                oppositeDirection: 'left',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: true,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                contents: [
                  {
                    isActive: false,
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
                    isActive: false,
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
          const { activeList, subscriber } = setup({
            activeIndexes: [0, 1, 2],
            maxActivationLimit: false,
          });

          const removedValue = activeList.shift();

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['b', 'c'],
              activeContents: [activeList.contents[0], activeList.contents[1]],
              activeIndexes: [0, 1],
              lastActivated: 'c',
              lastActivatedContent: activeList.contents[1],
              lastActivatedIndex: 1,
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              isCircular: false,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: false,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: true,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              contents: [
                {
                  isActive: true,
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
                  isActive: true,
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
          const { activeList, subscriber } = setup({
            activeIndexes: [0, 1, 2],
            maxActivationLimit: false,
          });

          const removedValue = activeList.removeByIndex(1);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['a', 'c'],
              activeContents: [activeList.contents[0], activeList.contents[1]],
              activeIndexes: [0, 1],
              lastActivated: 'c',
              lastActivatedContent: activeList.contents[1],
              lastActivatedIndex: 1,
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              isCircular: false,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: false,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: true,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              contents: [
                {
                  isActive: true,
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
                  isActive: true,
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
          const { activeList, subscriber } = setup({
            activeIndexes: [0, 1, 2],
            maxActivationLimit: false,
          });

          const removedValue = activeList.pop();

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['a', 'b'],
              activeContents: [activeList.contents[0], activeList.contents[1]],
              activeIndexes: [0, 1],
              lastActivated: 'b',
              lastActivatedContent: activeList.contents[1],
              lastActivatedIndex: 1,
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              isCircular: false,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: false,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: true,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              contents: [
                {
                  isActive: true,
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
                  isActive: true,
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

      describe('ActiveListContent methods', () => {
        test('remove on content', () => {
          const { activeList } = setup();

          jest.spyOn(activeList, 'removeByIndex');

          const result = activeList.contents[1].remove();

          expect(result).toBe('b');

          expect(activeList.removeByIndex).toHaveBeenCalledTimes(1);
          expect(activeList.removeByIndex).toHaveBeenCalledWith(1);
        });

        test('remove on content after another removal', () => {
          const { activeList } = setup();

          jest.spyOn(activeList, 'removeByIndex');

          activeList.shift();

          const result = activeList.contents[0].remove();

          expect(result).toBe('b');

          expect(activeList.removeByIndex).toHaveBeenCalledTimes(2);
          expect(activeList.removeByIndex).toHaveBeenLastCalledWith(0);

          expect(activeList.contents.map((c) => c.value)).toEqual(['c']);
        });
      });

      test('removal of lastDeactivated should reset the lastDeactivated', () => {
        const { activeList, subscriber } = setup({ activeIndexes: 0 }, ['a']);

        activeList.deactivateByIndex(0);

        expect(activeList.lastDeactivatedIndex).toBe(0);

        activeList.shift();

        expect(subscriber).toHaveBeenCalledTimes(2);

        assertLastSubscriber(
          subscriber,
          {
            active: [],
            activeContents: [],
            activeIndexes: [],
            lastActivated: null,
            lastActivatedContent: null,
            lastActivatedIndex: -1,
            lastDeactivated: null,
            lastDeactivatedContent: null,
            lastDeactivatedIndex: -1,
            isCircular: false,
            direction: 'right',
            oppositeDirection: 'left',
            maxActivationLimit: 1,
            maxActivationLimitBehavior: 'circular',
            history: [],
            hasActiveChangedAtLeastOnce: true,
            autoPlay: {
              isPlaying: false,
              hasBeenStoppedBefore: false,
              duration: 0,
            },
            cooldown: {
              isActive: false,
              duration: 0,
            },
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
    });

    describe('removing with predicate', () => {
      describe('when maxActivationLimit is 1', () => {
        test('all removal', () => {
          const { activeList, subscriber } = setup({ activeIndexes: 0 });

          const removed = activeList.removeByPredicate(() => true);

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
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              isCircular: false,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: true,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
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
              const { activeList, subscriber } = setup({ activeIndexes: 1 });

              const removed = activeList.removeByPredicate(
                ({ value }) => value === 'a'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(
                subscriber,
                {
                  active: ['b'],
                  activeContents: [activeList.contents[0]],
                  activeIndexes: [0],
                  lastActivated: 'b',
                  lastActivatedContent: activeList.contents[0],
                  lastActivatedIndex: 0,
                  lastDeactivated: null,
                  lastDeactivatedContent: null,
                  lastDeactivatedIndex: -1,
                  isCircular: false,
                  direction: 'right',
                  oppositeDirection: 'left',
                  maxActivationLimit: 1,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: false,
                  autoPlay: {
                    isPlaying: false,
                    hasBeenStoppedBefore: false,
                    duration: 0,
                  },
                  cooldown: {
                    isActive: false,
                    duration: 0,
                  },
                  contents: [
                    {
                      isActive: true,
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
                      isActive: false,
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
              const { activeList, subscriber } = setup({ activeIndexes: 0 });

              const removed = activeList.removeByPredicate(
                ({ value }) => value === 'b'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(
                subscriber,
                {
                  active: ['a'],
                  activeContents: [activeList.contents[0]],
                  activeIndexes: [0],
                  lastActivated: 'a',
                  lastActivatedContent: activeList.contents[0],
                  lastActivatedIndex: 0,
                  lastDeactivated: null,
                  lastDeactivatedContent: null,
                  lastDeactivatedIndex: -1,
                  isCircular: false,
                  direction: 'right',
                  oppositeDirection: 'left',
                  maxActivationLimit: 1,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: false,
                  autoPlay: {
                    isPlaying: false,
                    hasBeenStoppedBefore: false,
                    duration: 0,
                  },
                  cooldown: {
                    isActive: false,
                    duration: 0,
                  },
                  contents: [
                    {
                      isActive: true,
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
                      isActive: false,
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
              const { activeList, subscriber } = setup({ activeIndexes: 0 });

              const removed = activeList.removeByPredicate(
                ({ value }) => value === 'c'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(
                subscriber,
                {
                  active: ['a'],
                  activeContents: [activeList.contents[0]],
                  activeIndexes: [0],
                  lastActivated: 'a',
                  lastActivatedContent: activeList.contents[0],
                  lastActivatedIndex: 0,
                  lastDeactivated: null,
                  lastDeactivatedContent: null,
                  lastDeactivatedIndex: -1,
                  isCircular: false,
                  direction: 'right',
                  oppositeDirection: 'left',
                  maxActivationLimit: 1,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: false,
                  autoPlay: {
                    isPlaying: false,
                    hasBeenStoppedBefore: false,
                    duration: 0,
                  },
                  cooldown: {
                    isActive: false,
                    duration: 0,
                  },
                  contents: [
                    {
                      isActive: true,
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
                      isActive: false,
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
              const { activeList, subscriber } = setup({ activeIndexes: 0 });

              const removed = activeList.removeByPredicate(
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
                  lastDeactivated: null,
                  lastDeactivatedContent: null,
                  lastDeactivatedIndex: -1,
                  isCircular: false,
                  direction: 'right',
                  oppositeDirection: 'left',
                  maxActivationLimit: 1,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: true,
                  autoPlay: {
                    isPlaying: false,
                    hasBeenStoppedBefore: false,
                    duration: 0,
                  },
                  cooldown: {
                    isActive: false,
                    duration: 0,
                  },
                  contents: [
                    {
                      isActive: false,
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
                      isActive: false,
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
              const { activeList, subscriber } = setup({ activeIndexes: 1 });

              const removed = activeList.removeByPredicate(
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
                  lastDeactivated: null,
                  lastDeactivatedContent: null,
                  lastDeactivatedIndex: -1,
                  isCircular: false,
                  direction: 'right',
                  oppositeDirection: 'left',
                  maxActivationLimit: 1,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: true,
                  autoPlay: {
                    isPlaying: false,
                    hasBeenStoppedBefore: false,
                    duration: 0,
                  },
                  cooldown: {
                    isActive: false,
                    duration: 0,
                  },
                  contents: [
                    {
                      isActive: false,
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
                      isActive: false,
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
              const { activeList, subscriber } = setup({ activeIndexes: 2 });

              const removed = activeList.removeByPredicate(
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
                  lastDeactivated: null,
                  lastDeactivatedContent: null,
                  lastDeactivatedIndex: -1,
                  isCircular: false,
                  direction: 'right',
                  oppositeDirection: 'left',
                  maxActivationLimit: 1,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: true,
                  autoPlay: {
                    isPlaying: false,
                    hasBeenStoppedBefore: false,
                    duration: 0,
                  },
                  cooldown: {
                    isActive: false,
                    duration: 0,
                  },
                  contents: [
                    {
                      isActive: false,
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
                      isActive: false,
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
              const { activeList, subscriber } = setup({ activeIndexes: 2 });

              const removed = activeList.removeByPredicate(
                ({ value }) => value === 'a' || value === 'b'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(
                subscriber,
                {
                  active: ['c'],
                  activeContents: [activeList.contents[0]],
                  activeIndexes: [0],
                  lastActivated: 'c',
                  lastActivatedContent: activeList.contents[0],
                  lastActivatedIndex: 0,
                  lastDeactivated: null,
                  lastDeactivatedContent: null,
                  lastDeactivatedIndex: -1,
                  isCircular: false,
                  direction: 'right',
                  oppositeDirection: 'left',
                  maxActivationLimit: 1,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: false,
                  autoPlay: {
                    isPlaying: false,
                    hasBeenStoppedBefore: false,
                    duration: 0,
                  },
                  cooldown: {
                    isActive: false,
                    duration: 0,
                  },
                  contents: [
                    {
                      isActive: true,
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
              const { activeList, subscriber } = setup({ activeIndexes: 0 }, [
                'a',
                'b',
                'c',
                'd',
              ]);

              const removed = activeList.removeByPredicate(
                ({ value }) => value === 'b' || value === 'c'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(
                subscriber,
                {
                  active: ['a'],
                  activeContents: [activeList.contents[0]],
                  activeIndexes: [0],
                  lastActivated: 'a',
                  lastActivatedContent: activeList.contents[0],
                  lastActivatedIndex: 0,
                  lastDeactivated: null,
                  lastDeactivatedContent: null,
                  lastDeactivatedIndex: -1,
                  isCircular: false,
                  direction: 'right',
                  oppositeDirection: 'left',
                  maxActivationLimit: 1,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: false,
                  autoPlay: {
                    isPlaying: false,
                    hasBeenStoppedBefore: false,
                    duration: 0,
                  },
                  cooldown: {
                    isActive: false,
                    duration: 0,
                  },
                  contents: [
                    {
                      isActive: true,
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
                      isActive: false,
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
              const { activeList, subscriber } = setup({ activeIndexes: 3 }, [
                'a',
                'b',
                'c',
                'd',
              ]);

              const removed = activeList.removeByPredicate(
                ({ value }) => value === 'b' || value === 'c'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(
                subscriber,
                {
                  active: ['d'],
                  activeContents: [activeList.contents[1]],
                  activeIndexes: [1],
                  lastActivated: 'd',
                  lastActivatedContent: activeList.contents[1],
                  lastActivatedIndex: 1,
                  lastDeactivated: null,
                  lastDeactivatedContent: null,
                  lastDeactivatedIndex: -1,
                  isCircular: false,
                  direction: 'right',
                  oppositeDirection: 'left',
                  maxActivationLimit: 1,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: false,
                  autoPlay: {
                    isPlaying: false,
                    hasBeenStoppedBefore: false,
                    duration: 0,
                  },
                  cooldown: {
                    isActive: false,
                    duration: 0,
                  },
                  contents: [
                    {
                      isActive: false,
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
                      isActive: true,
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
              const { activeList, subscriber } = setup({ activeIndexes: 0 }, [
                'a',
                'b',
                'c',
                'd',
                'e',
              ]);

              const removed = activeList.removeByPredicate(
                ({ value }) => value === 'b' || value === 'd'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(
                subscriber,
                {
                  active: ['a'],
                  activeContents: [activeList.contents[0]],
                  activeIndexes: [0],
                  lastActivated: 'a',
                  lastActivatedContent: activeList.contents[0],
                  lastActivatedIndex: 0,
                  lastDeactivated: null,
                  lastDeactivatedContent: null,
                  lastDeactivatedIndex: -1,
                  isCircular: false,
                  direction: 'right',
                  oppositeDirection: 'left',
                  maxActivationLimit: 1,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: false,
                  autoPlay: {
                    isPlaying: false,
                    hasBeenStoppedBefore: false,
                    duration: 0,
                  },
                  cooldown: {
                    isActive: false,
                    duration: 0,
                  },
                  contents: [
                    {
                      isActive: true,
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
                      isActive: false,
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
                      isActive: false,
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
              const { activeList, subscriber } = setup({ activeIndexes: 2 }, [
                'a',
                'b',
                'c',
                'd',
                'e',
              ]);

              const removed = activeList.removeByPredicate(
                ({ value }) => value === 'b' || value === 'd'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(
                subscriber,
                {
                  active: ['c'],
                  activeContents: [activeList.contents[1]],
                  activeIndexes: [1],
                  lastActivated: 'c',
                  lastActivatedContent: activeList.contents[1],
                  lastActivatedIndex: 1,
                  lastDeactivated: null,
                  lastDeactivatedContent: null,
                  lastDeactivatedIndex: -1,
                  isCircular: false,
                  direction: 'right',
                  oppositeDirection: 'left',
                  maxActivationLimit: 1,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: false,
                  autoPlay: {
                    isPlaying: false,
                    hasBeenStoppedBefore: false,
                    duration: 0,
                  },
                  cooldown: {
                    isActive: false,
                    duration: 0,
                  },
                  contents: [
                    {
                      isActive: false,
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
                      isActive: true,
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
                      isActive: false,
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
              const { activeList, subscriber } = setup({ activeIndexes: 4 }, [
                'a',
                'b',
                'c',
                'd',
                'e',
              ]);

              const removed = activeList.removeByPredicate(
                ({ value }) => value === 'b' || value === 'd'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(
                subscriber,
                {
                  active: ['e'],
                  activeContents: [activeList.contents[2]],
                  activeIndexes: [2],
                  lastActivated: 'e',
                  lastActivatedContent: activeList.contents[2],
                  lastActivatedIndex: 2,
                  lastDeactivated: null,
                  lastDeactivatedContent: null,
                  lastDeactivatedIndex: -1,
                  isCircular: false,
                  direction: 'right',
                  oppositeDirection: 'left',
                  maxActivationLimit: 1,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: false,
                  autoPlay: {
                    isPlaying: false,
                    hasBeenStoppedBefore: false,
                    duration: 0,
                  },
                  cooldown: {
                    isActive: false,
                    duration: 0,
                  },
                  contents: [
                    {
                      isActive: false,
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
                      isActive: false,
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
                      isActive: true,
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
              const { activeList, subscriber } = setup({ activeIndexes: 0 });

              const removed = activeList.removeByPredicate(
                ({ index }) => index > 0
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(
                subscriber,
                {
                  active: ['a'],
                  activeContents: [activeList.contents[0]],
                  activeIndexes: [0],
                  lastActivated: 'a',
                  lastActivatedContent: activeList.contents[0],
                  lastActivatedIndex: 0,
                  lastDeactivated: null,
                  lastDeactivatedContent: null,
                  lastDeactivatedIndex: -1,
                  isCircular: false,
                  direction: 'right',
                  oppositeDirection: 'left',
                  maxActivationLimit: 1,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: false,
                  autoPlay: {
                    isPlaying: false,
                    hasBeenStoppedBefore: false,
                    duration: 0,
                  },
                  cooldown: {
                    isActive: false,
                    duration: 0,
                  },
                  contents: [
                    {
                      isActive: true,
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
              const { activeList, subscriber } = setup({ activeIndexes: 0 });

              const removed = activeList.removeByPredicate(
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
                  lastDeactivated: null,
                  lastDeactivatedContent: null,
                  lastDeactivatedIndex: -1,
                  isCircular: false,
                  direction: 'right',
                  oppositeDirection: 'left',
                  maxActivationLimit: 1,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: true,
                  autoPlay: {
                    isPlaying: false,
                    hasBeenStoppedBefore: false,
                    duration: 0,
                  },
                  cooldown: {
                    isActive: false,
                    duration: 0,
                  },
                  contents: [
                    {
                      isActive: false,
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
              const { activeList, subscriber } = setup({ activeIndexes: 1 });

              const removed = activeList.removeByPredicate(
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
                  lastDeactivated: null,
                  lastDeactivatedContent: null,
                  lastDeactivatedIndex: -1,
                  isCircular: false,
                  direction: 'right',
                  oppositeDirection: 'left',
                  maxActivationLimit: 1,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: true,
                  autoPlay: {
                    isPlaying: false,
                    hasBeenStoppedBefore: false,
                    duration: 0,
                  },
                  cooldown: {
                    isActive: false,
                    duration: 0,
                  },
                  contents: [
                    {
                      isActive: false,
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
              const { activeList, subscriber } = setup({ activeIndexes: 1 }, [
                'a',
                'b',
                'c',
                'd',
              ]);

              const removed = activeList.removeByPredicate(
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
                  lastDeactivated: null,
                  lastDeactivatedContent: null,
                  lastDeactivatedIndex: -1,
                  isCircular: false,
                  direction: 'right',
                  oppositeDirection: 'left',
                  maxActivationLimit: 1,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: true,
                  autoPlay: {
                    isPlaying: false,
                    hasBeenStoppedBefore: false,
                    duration: 0,
                  },
                  cooldown: {
                    isActive: false,
                    duration: 0,
                  },
                  contents: [
                    {
                      isActive: false,
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
                      isActive: false,
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
              const { activeList, subscriber } = setup({ activeIndexes: 2 }, [
                'a',
                'b',
                'c',
                'd',
              ]);

              const removed = activeList.removeByPredicate(
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
                  lastDeactivated: null,
                  lastDeactivatedContent: null,
                  lastDeactivatedIndex: -1,
                  isCircular: false,
                  direction: 'right',
                  oppositeDirection: 'left',
                  maxActivationLimit: 1,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: true,
                  autoPlay: {
                    isPlaying: false,
                    hasBeenStoppedBefore: false,
                    duration: 0,
                  },
                  cooldown: {
                    isActive: false,
                    duration: 0,
                  },
                  contents: [
                    {
                      isActive: false,
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
                      isActive: false,
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
              const { activeList, subscriber } = setup({ activeIndexes: 1 }, [
                'a',
                'b',
                'c',
                'd',
                'e',
              ]);

              const removed = activeList.removeByPredicate(
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
                  lastDeactivated: null,
                  lastDeactivatedContent: null,
                  lastDeactivatedIndex: -1,
                  isCircular: false,
                  direction: 'right',
                  oppositeDirection: 'left',
                  maxActivationLimit: 1,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: true,
                  autoPlay: {
                    isPlaying: false,
                    hasBeenStoppedBefore: false,
                    duration: 0,
                  },
                  cooldown: {
                    isActive: false,
                    duration: 0,
                  },
                  contents: [
                    {
                      isActive: false,
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
                      isActive: false,
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
                      isActive: false,
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
              const { activeList, subscriber } = setup({ activeIndexes: 3 }, [
                'a',
                'b',
                'c',
                'd',
                'e',
              ]);

              const removed = activeList.removeByPredicate(
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
                  lastDeactivated: null,
                  lastDeactivatedContent: null,
                  lastDeactivatedIndex: -1,
                  isCircular: false,
                  direction: 'right',
                  oppositeDirection: 'left',
                  maxActivationLimit: 1,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: true,
                  autoPlay: {
                    isPlaying: false,
                    hasBeenStoppedBefore: false,
                    duration: 0,
                  },
                  cooldown: {
                    isActive: false,
                    duration: 0,
                  },
                  contents: [
                    {
                      isActive: false,
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
                      isActive: false,
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
                      isActive: false,
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
              const { activeList, subscriber } = setup({ activeIndexes: 2 });

              const removed = activeList.removeByPredicate(
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
                  lastDeactivated: null,
                  lastDeactivatedContent: null,
                  lastDeactivatedIndex: -1,
                  isCircular: false,
                  direction: 'right',
                  oppositeDirection: 'left',
                  maxActivationLimit: 1,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: true,
                  autoPlay: {
                    isPlaying: false,
                    hasBeenStoppedBefore: false,
                    duration: 0,
                  },
                  cooldown: {
                    isActive: false,
                    duration: 0,
                  },
                  contents: [
                    {
                      isActive: false,
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
          const { activeList, subscriber } = setup({ activeIndexes: 1 });

          const removed = activeList.removeByPredicate(
            ({ value }) => value === 'y'
          );

          expect(subscriber).toHaveBeenCalledTimes(0);

          expect(removed).toEqual([]);

          assertState(activeList, {
            active: ['b'],
            activeContents: [activeList.contents[1]],
            activeIndexes: [1],
            lastActivated: 'b',
            lastActivatedContent: activeList.contents[1],
            lastActivatedIndex: 1,
            lastDeactivated: null,
            lastDeactivatedContent: null,
            lastDeactivatedIndex: -1,
            isCircular: false,
            direction: 'right',
            oppositeDirection: 'left',
            maxActivationLimit: 1,
            maxActivationLimitBehavior: 'circular',
            history: [],
            hasActiveChangedAtLeastOnce: false,
            autoPlay: {
              isPlaying: false,
              hasBeenStoppedBefore: false,
              duration: 0,
            },
            cooldown: {
              isActive: false,
              duration: 0,
            },
            contents: [
              {
                isActive: false,
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
                isActive: true,
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
                isActive: false,
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
        });

        test('when content is already empty do nothing', () => {
          const { activeList, subscriber } = setup({}, []);

          const removed = activeList.removeByPredicate(
            ({ value }) => value === 'y'
          );

          expect(subscriber).toHaveBeenCalledTimes(0);

          expect(activeList.hasActiveChangedAtLeastOnce).toBe(false);

          expect(removed).toEqual([]);

          assertState(activeList, {
            active: [],
            activeContents: [],
            activeIndexes: [],
            lastActivated: null,
            lastActivatedContent: null,
            lastActivatedIndex: -1,
            lastDeactivated: null,
            lastDeactivatedContent: null,
            lastDeactivatedIndex: -1,
            isCircular: false,
            direction: 'right',
            oppositeDirection: 'left',
            maxActivationLimit: 1,
            maxActivationLimitBehavior: 'circular',
            history: [],
            hasActiveChangedAtLeastOnce: false,
            autoPlay: {
              isPlaying: false,
              hasBeenStoppedBefore: false,
              duration: 0,
            },
            cooldown: {
              isActive: false,
              duration: 0,
            },
            contents: [],
          });
        });
      });

      describe('when maxActivationLimit is false', () => {
        test('all removal', () => {
          const { activeList, subscriber } = setup({
            maxActivationLimit: false,
            activeIndexes: [0, 1, 2],
          });

          const removed = activeList.removeByPredicate(() => true);

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
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              isCircular: false,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: false,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: true,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
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
              const { activeList, subscriber } = setup({
                maxActivationLimit: false,
                activeIndexes: [],
              });

              const removed = activeList.removeByPredicate(
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
                  lastDeactivated: null,
                  lastDeactivatedContent: null,
                  lastDeactivatedIndex: -1,
                  isCircular: false,
                  direction: 'right',
                  oppositeDirection: 'left',
                  maxActivationLimit: false,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: false,
                  autoPlay: {
                    isPlaying: false,
                    hasBeenStoppedBefore: false,
                    duration: 0,
                  },
                  cooldown: {
                    isActive: false,
                    duration: 0,
                  },
                  contents: [
                    {
                      isActive: false,
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
                      isActive: false,
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
              const { activeList, subscriber } = setup({
                maxActivationLimit: false,
                activeIndexes: [],
              });

              const removed = activeList.removeByPredicate(
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
                  lastDeactivated: null,
                  lastDeactivatedContent: null,
                  lastDeactivatedIndex: -1,
                  isCircular: false,
                  direction: 'right',
                  oppositeDirection: 'left',
                  maxActivationLimit: false,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: false,
                  autoPlay: {
                    isPlaying: false,
                    hasBeenStoppedBefore: false,
                    duration: 0,
                  },
                  cooldown: {
                    isActive: false,
                    duration: 0,
                  },
                  contents: [
                    {
                      isActive: false,
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
                      isActive: false,
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
              const { activeList, subscriber } = setup({
                maxActivationLimit: false,
                activeIndexes: [],
              });

              const removed = activeList.removeByPredicate(
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
                  lastDeactivated: null,
                  lastDeactivatedContent: null,
                  lastDeactivatedIndex: -1,
                  isCircular: false,
                  direction: 'right',
                  oppositeDirection: 'left',
                  maxActivationLimit: false,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: false,
                  autoPlay: {
                    isPlaying: false,
                    hasBeenStoppedBefore: false,
                    duration: 0,
                  },
                  cooldown: {
                    isActive: false,
                    duration: 0,
                  },
                  contents: [
                    {
                      isActive: false,
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
                      isActive: false,
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
              const { activeList, subscriber } = setup({
                maxActivationLimit: false,
                activeIndexes: [0, 1, 2],
              });

              const removed = activeList.removeByPredicate(
                ({ value }) => value === 'a'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(
                subscriber,
                {
                  active: ['b', 'c'],
                  activeContents: [
                    activeList.contents[0],
                    activeList.contents[1],
                  ],
                  activeIndexes: [0, 1],
                  lastActivated: 'c',
                  lastActivatedContent: activeList.contents[1],
                  lastActivatedIndex: 1,
                  lastDeactivated: null,
                  lastDeactivatedContent: null,
                  lastDeactivatedIndex: -1,
                  isCircular: false,
                  direction: 'right',
                  oppositeDirection: 'left',
                  maxActivationLimit: false,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: true,
                  autoPlay: {
                    isPlaying: false,
                    hasBeenStoppedBefore: false,
                    duration: 0,
                  },
                  cooldown: {
                    isActive: false,
                    duration: 0,
                  },
                  contents: [
                    {
                      isActive: true,
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
                      isActive: true,
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
              const { activeList, subscriber } = setup({
                maxActivationLimit: false,
                activeIndexes: [0, 1, 2],
              });

              const removed = activeList.removeByPredicate(
                ({ value }) => value === 'b'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(
                subscriber,
                {
                  active: ['a', 'c'],
                  activeContents: [
                    activeList.contents[0],
                    activeList.contents[1],
                  ],
                  activeIndexes: [0, 1],
                  lastActivated: 'c',
                  lastActivatedContent: activeList.contents[1],
                  lastActivatedIndex: 1,
                  lastDeactivated: null,
                  lastDeactivatedContent: null,
                  lastDeactivatedIndex: -1,
                  isCircular: false,
                  direction: 'right',
                  oppositeDirection: 'left',
                  maxActivationLimit: false,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: true,
                  autoPlay: {
                    isPlaying: false,
                    hasBeenStoppedBefore: false,
                    duration: 0,
                  },
                  cooldown: {
                    isActive: false,
                    duration: 0,
                  },
                  contents: [
                    {
                      isActive: true,
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
                      isActive: true,
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
              const { activeList, subscriber } = setup({
                maxActivationLimit: false,
                activeIndexes: [0, 1, 2],
              });

              const removed = activeList.removeByPredicate(
                ({ value }) => value === 'c'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(
                subscriber,
                {
                  active: ['a', 'b'],
                  activeContents: [
                    activeList.contents[0],
                    activeList.contents[1],
                  ],
                  activeIndexes: [0, 1],
                  lastActivated: 'b',
                  lastActivatedContent: activeList.contents[1],
                  lastActivatedIndex: 1,
                  lastDeactivated: null,
                  lastDeactivatedContent: null,
                  lastDeactivatedIndex: -1,
                  isCircular: false,
                  direction: 'right',
                  oppositeDirection: 'left',
                  maxActivationLimit: false,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: true,
                  autoPlay: {
                    isPlaying: false,
                    hasBeenStoppedBefore: false,
                    duration: 0,
                  },
                  cooldown: {
                    isActive: false,
                    duration: 0,
                  },
                  contents: [
                    {
                      isActive: true,
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
                      isActive: true,
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
              const { activeList, subscriber } = setup({
                maxActivationLimit: false,
                activeIndexes: [],
              });

              const removed = activeList.removeByPredicate(
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
                  lastDeactivated: null,
                  lastDeactivatedContent: null,
                  lastDeactivatedIndex: -1,
                  isCircular: false,
                  direction: 'right',
                  oppositeDirection: 'left',
                  maxActivationLimit: false,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: false,
                  autoPlay: {
                    isPlaying: false,
                    hasBeenStoppedBefore: false,
                    duration: 0,
                  },
                  cooldown: {
                    isActive: false,
                    duration: 0,
                  },
                  contents: [
                    {
                      isActive: false,
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
              const { activeList, subscriber } = setup(
                { maxActivationLimit: false, activeIndexes: [] },
                ['a', 'b', 'c', 'd']
              );

              const removed = activeList.removeByPredicate(
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
                  lastDeactivated: null,
                  lastDeactivatedContent: null,
                  lastDeactivatedIndex: -1,
                  isCircular: false,
                  direction: 'right',
                  oppositeDirection: 'left',
                  maxActivationLimit: false,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: false,
                  autoPlay: {
                    isPlaying: false,
                    hasBeenStoppedBefore: false,
                    duration: 0,
                  },
                  cooldown: {
                    isActive: false,
                    duration: 0,
                  },
                  contents: [
                    {
                      isActive: false,
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
                      isActive: false,
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
              const { activeList, subscriber } = setup(
                { maxActivationLimit: false, activeIndexes: [] },
                ['a', 'b', 'c', 'd', 'e']
              );

              const removed = activeList.removeByPredicate(
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
                  lastDeactivated: null,
                  lastDeactivatedContent: null,
                  lastDeactivatedIndex: -1,
                  isCircular: false,
                  direction: 'right',
                  oppositeDirection: 'left',
                  maxActivationLimit: false,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: false,
                  autoPlay: {
                    isPlaying: false,
                    hasBeenStoppedBefore: false,
                    duration: 0,
                  },
                  cooldown: {
                    isActive: false,
                    duration: 0,
                  },
                  contents: [
                    {
                      isActive: false,
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
                      isActive: false,
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
                      isActive: false,
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
              const { activeList, subscriber } = setup({
                maxActivationLimit: false,
                activeIndexes: [],
              });

              const removed = activeList.removeByPredicate(
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
                  lastDeactivated: null,
                  lastDeactivatedContent: null,
                  lastDeactivatedIndex: -1,
                  isCircular: false,
                  direction: 'right',
                  oppositeDirection: 'left',
                  maxActivationLimit: false,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: false,
                  autoPlay: {
                    isPlaying: false,
                    hasBeenStoppedBefore: false,
                    duration: 0,
                  },
                  cooldown: {
                    isActive: false,
                    duration: 0,
                  },
                  contents: [
                    {
                      isActive: false,
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
              const { activeList, subscriber } = setup({
                maxActivationLimit: false,
                activeIndexes: [0, 2],
              });

              const removed = activeList.removeByPredicate(
                ({ value }) => value === 'a' || value === 'b'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(
                subscriber,
                {
                  active: ['c'],
                  activeContents: [activeList.contents[0]],
                  activeIndexes: [0],
                  lastActivated: 'c',
                  lastActivatedContent: activeList.contents[0],
                  lastActivatedIndex: 0,
                  lastDeactivated: null,
                  lastDeactivatedContent: null,
                  lastDeactivatedIndex: -1,
                  isCircular: false,
                  direction: 'right',
                  oppositeDirection: 'left',
                  maxActivationLimit: false,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: true,
                  autoPlay: {
                    isPlaying: false,
                    hasBeenStoppedBefore: false,
                    duration: 0,
                  },
                  cooldown: {
                    isActive: false,
                    duration: 0,
                  },
                  contents: [
                    {
                      isActive: true,
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
              const { activeList, subscriber } = setup({
                maxActivationLimit: false,
                activeIndexes: [0, 1],
              });

              const removed = activeList.removeByPredicate(
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
                  lastDeactivated: null,
                  lastDeactivatedContent: null,
                  lastDeactivatedIndex: -1,
                  isCircular: false,
                  direction: 'right',
                  oppositeDirection: 'left',
                  maxActivationLimit: false,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: true,
                  autoPlay: {
                    isPlaying: false,
                    hasBeenStoppedBefore: false,
                    duration: 0,
                  },
                  cooldown: {
                    isActive: false,
                    duration: 0,
                  },
                  contents: [
                    {
                      isActive: false,
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
              const { activeList, subscriber } = setup(
                { maxActivationLimit: false, activeIndexes: [0, 1] },
                ['a', 'b', 'c', 'd']
              );

              const removed = activeList.removeByPredicate(
                ({ value }) => value === 'b' || value === 'c'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(
                subscriber,
                {
                  active: ['a'],
                  activeContents: [activeList.contents[0]],
                  activeIndexes: [0],
                  lastActivated: 'a',
                  lastActivatedContent: activeList.contents[0],
                  lastActivatedIndex: 0,
                  lastDeactivated: null,
                  lastDeactivatedContent: null,
                  lastDeactivatedIndex: -1,
                  isCircular: false,
                  direction: 'right',
                  oppositeDirection: 'left',
                  maxActivationLimit: false,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: true,
                  autoPlay: {
                    isPlaying: false,
                    hasBeenStoppedBefore: false,
                    duration: 0,
                  },
                  cooldown: {
                    isActive: false,
                    duration: 0,
                  },
                  contents: [
                    {
                      isActive: true,
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
                      isActive: false,
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
              const { activeList, subscriber } = setup(
                { maxActivationLimit: false, activeIndexes: [2, 3] },
                ['a', 'b', 'c', 'd']
              );

              const removed = activeList.removeByPredicate(
                ({ value }) => value === 'b' || value === 'c'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(
                subscriber,
                {
                  active: ['d'],
                  activeContents: [activeList.contents[1]],
                  activeIndexes: [1],
                  lastActivated: 'd',
                  lastActivatedContent: activeList.contents[1],
                  lastActivatedIndex: 1,
                  lastDeactivated: null,
                  lastDeactivatedContent: null,
                  lastDeactivatedIndex: -1,
                  isCircular: false,
                  direction: 'right',
                  oppositeDirection: 'left',
                  maxActivationLimit: false,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: true,
                  autoPlay: {
                    isPlaying: false,
                    hasBeenStoppedBefore: false,
                    duration: 0,
                  },
                  cooldown: {
                    isActive: false,
                    duration: 0,
                  },
                  contents: [
                    {
                      isActive: false,
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
                      isActive: true,
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
              const { activeList, subscriber } = setup(
                { maxActivationLimit: false, activeIndexes: [0, 1, 2] },
                ['a', 'b', 'c', 'd', 'e']
              );

              const removed = activeList.removeByPredicate(
                ({ value }) => value === 'b' || value === 'd'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(
                subscriber,
                {
                  active: ['a', 'c'],
                  activeContents: [
                    activeList.contents[0],
                    activeList.contents[1],
                  ],
                  activeIndexes: [0, 1],
                  lastActivated: 'c',
                  lastActivatedContent: activeList.contents[1],
                  lastActivatedIndex: 1,
                  lastDeactivated: null,
                  lastDeactivatedContent: null,
                  lastDeactivatedIndex: -1,
                  isCircular: false,
                  direction: 'right',
                  oppositeDirection: 'left',
                  maxActivationLimit: false,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: true,
                  autoPlay: {
                    isPlaying: false,
                    hasBeenStoppedBefore: false,
                    duration: 0,
                  },
                  cooldown: {
                    isActive: false,
                    duration: 0,
                  },
                  contents: [
                    {
                      isActive: true,
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
                      isActive: true,
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
                      isActive: false,
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
              const { activeList, subscriber } = setup(
                { maxActivationLimit: false, activeIndexes: [2, 3, 4] },
                ['a', 'b', 'c', 'd', 'e']
              );

              const removed = activeList.removeByPredicate(
                ({ value }) => value === 'b' || value === 'd'
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(
                subscriber,
                {
                  active: ['c', 'e'],
                  activeContents: [
                    activeList.contents[1],
                    activeList.contents[2],
                  ],
                  activeIndexes: [1, 2],
                  lastActivated: 'e',
                  lastActivatedContent: activeList.contents[2],
                  lastActivatedIndex: 2,
                  lastDeactivated: null,
                  lastDeactivatedContent: null,
                  lastDeactivatedIndex: -1,
                  isCircular: false,
                  direction: 'right',
                  oppositeDirection: 'left',
                  maxActivationLimit: false,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: true,
                  autoPlay: {
                    isPlaying: false,
                    hasBeenStoppedBefore: false,
                    duration: 0,
                  },
                  cooldown: {
                    isActive: false,
                    duration: 0,
                  },
                  contents: [
                    {
                      isActive: false,
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
                      isActive: true,
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
                      isActive: true,
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
              const { activeList, subscriber } = setup({
                maxActivationLimit: false,
                activeIndexes: [0, 1, 2],
              });

              const removed = activeList.removeByPredicate(
                ({ index }) => index > 0
              );

              expect(subscriber).toHaveBeenCalledTimes(1);

              assertLastSubscriber(
                subscriber,
                {
                  active: ['a'],
                  activeContents: [activeList.contents[0]],
                  activeIndexes: [0],
                  lastActivated: 'a',
                  lastActivatedContent: activeList.contents[0],
                  lastActivatedIndex: 0,
                  lastDeactivated: null,
                  lastDeactivatedContent: null,
                  lastDeactivatedIndex: -1,
                  isCircular: false,
                  direction: 'right',
                  oppositeDirection: 'left',
                  maxActivationLimit: false,
                  maxActivationLimitBehavior: 'circular',
                  history: [],
                  hasActiveChangedAtLeastOnce: true,
                  autoPlay: {
                    isPlaying: false,
                    hasBeenStoppedBefore: false,
                    duration: 0,
                  },
                  cooldown: {
                    isActive: false,
                    duration: 0,
                  },
                  contents: [
                    {
                      isActive: true,
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
          const { activeList, subscriber } = setup({
            maxActivationLimit: false,
            activeIndexes: [0, 1, 2],
          });

          const removed = activeList.removeByPredicate(
            ({ value }) => value === 'y'
          );

          expect(subscriber).toHaveBeenCalledTimes(0);

          expect(removed).toEqual([]);
        });

        test('when content is already empty do nothing', () => {
          const { activeList, subscriber } = setup(
            { maxActivationLimit: false },
            []
          );

          const removed = activeList.removeByPredicate(
            ({ value }) => value === 'y'
          );

          expect(subscriber).toHaveBeenCalledTimes(0);

          expect(activeList.hasActiveChangedAtLeastOnce).toBe(false);

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
            const { activeList, subscriber } = setup();

            expect(() => {
              activeList.swapByIndex(4, 0);
            }).toThrowError(
              `uiloos > ActiveList > swapByIndex > "a" is out of bounds`
            );

            expect(() => {
              activeList.swapByIndex(4, 0);
            }).toThrowError(ActiveListIndexOutOfBoundsError);

            expect(() => {
              activeList.swapByIndex(3, 0);
            }).toThrowError(
              `uiloos > ActiveList > swapByIndex > "a" is out of bounds`
            );

            expect(() => {
              activeList.swapByIndex(3, 0);
            }).toThrowError(ActiveListIndexOutOfBoundsError);

            expect(subscriber).toHaveBeenCalledTimes(0);
          });

          test('throws out of bounds when index is less than zero', () => {
            const { activeList, subscriber } = setup();

            expect(() => {
              activeList.swapByIndex(-1, 0);
            }).toThrowError(
              `uiloos > ActiveList > swapByIndex > "a" is out of bounds`
            );

            expect(() => {
              activeList.swapByIndex(-1, 0);
            }).toThrowError(ActiveListIndexOutOfBoundsError);

            expect(subscriber).toHaveBeenCalledTimes(0);
          });
        });

        describe('when it throws out of bounds for index b', () => {
          test('throws out of bounds when index is to large', () => {
            const { activeList, subscriber } = setup();

            expect(() => {
              activeList.swapByIndex(0, 4);
            }).toThrowError(
              `uiloos > ActiveList > swapByIndex > "b" is out of bounds`
            );

            expect(() => {
              activeList.swapByIndex(0, 4);
            }).toThrowError(ActiveListIndexOutOfBoundsError);

            expect(() => {
              activeList.swapByIndex(0, 3);
            }).toThrowError(
              `uiloos > ActiveList > swapByIndex > "b" is out of bounds`
            );

            expect(() => {
              activeList.swapByIndex(0, 3);
            }).toThrowError(ActiveListIndexOutOfBoundsError);

            expect(subscriber).toHaveBeenCalledTimes(0);
          });

          test('throws out of bounds when index is less than zero', () => {
            const { activeList, subscriber } = setup();

            expect(() => {
              activeList.swapByIndex(0, -1);
            }).toThrowError(
              `uiloos > ActiveList > swapByIndex > "b" is out of bounds`
            );

            expect(() => {
              activeList.swapByIndex(0, -1);
            }).toThrowError(ActiveListIndexOutOfBoundsError);

            expect(subscriber).toHaveBeenCalledTimes(0);
          });
        });
      });

      describe('limit is 1', () => {
        test('swapping from the active index should not affect it', () => {
          const { activeList, subscriber } = setup({ active: 'b' });

          // Swap b with c
          activeList.swapByIndex(1, 2);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['b'],
              activeContents: [activeList.contents[2]],
              activeIndexes: [2],
              lastActivated: 'b',
              lastActivatedContent: activeList.contents[2],
              lastActivatedIndex: 2,
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              isCircular: false,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              contents: [
                {
                  isActive: false,
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
                  isActive: false,
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
                  isActive: true,
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
          const { activeList, subscriber } = setup({ active: 'b' });

          // Swap c with b
          activeList.swapByIndex(2, 1);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['b'],
              activeContents: [activeList.contents[2]],
              activeIndexes: [2],
              lastActivated: 'b',
              lastActivatedContent: activeList.contents[2],
              lastActivatedIndex: 2,
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              isCircular: false,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              contents: [
                {
                  isActive: false,
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
                  isActive: false,
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
                  isActive: true,
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
          const { activeList, subscriber } = setup({ active: 'b' });

          // Swap a with c
          activeList.swapByIndex(0, 2);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['b'],
              activeContents: [activeList.contents[1]],
              activeIndexes: [1],
              lastActivated: 'b',
              lastActivatedContent: activeList.contents[1],
              lastActivatedIndex: 1,
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              isCircular: false,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              contents: [
                {
                  isActive: false,
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
                  isActive: true,
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
                  isActive: false,
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
          const { activeList, subscriber } = setup({
            active: 'b',
            isCircular: true,
          });

          // Swap a with c
          activeList.swapByIndex(0, 2);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['b'],
              activeContents: [activeList.contents[1]],
              activeIndexes: [1],
              lastActivated: 'b',
              lastActivatedContent: activeList.contents[1],
              lastActivatedIndex: 1,
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              isCircular: true,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              contents: [
                {
                  isActive: false,
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
                  isActive: true,
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
                  isActive: false,
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
          const { activeList, subscriber } = setup({
            active: 'b',
            isCircular: true,
          });

          activeList.swapByIndex(1, 1);

          expect(subscriber).toHaveBeenCalledTimes(0);
        });
      });

      describe('limit is false', () => {
        test('swapping from the active index should not affect it', () => {
          const { activeList, subscriber } = setup({
            maxActivationLimit: false,
            active: ['a', 'b'],
          });

          // Swap b with c
          activeList.swapByIndex(1, 2);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['a', 'b'],
              activeContents: [activeList.contents[0], activeList.contents[2]],
              activeIndexes: [0, 2],
              lastActivated: 'b',
              lastActivatedContent: activeList.contents[2],
              lastActivatedIndex: 2,
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              isCircular: false,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: false,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              contents: [
                {
                  isActive: true,
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
                  isActive: false,
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
                  isActive: true,
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
          const { activeList, subscriber } = setup({
            maxActivationLimit: false,
            active: ['b', 'a'],
          });

          // Swap c with b
          activeList.swapByIndex(2, 1);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['b', 'a'],
              activeContents: [activeList.contents[2], activeList.contents[0]],
              activeIndexes: [2, 0],
              lastActivated: 'a',
              lastActivatedContent: activeList.contents[0],
              lastActivatedIndex: 0,
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              isCircular: false,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: false,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              contents: [
                {
                  isActive: true,
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
                  isActive: false,
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
                  isActive: true,
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
          const { activeList, subscriber } = setup(
            { maxActivationLimit: false, active: ['b', 'c'] },
            ['a', 'b', 'c', 'd']
          );

          // Swap a with d
          activeList.swapByIndex(0, 3);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['b', 'c'],
              activeContents: [activeList.contents[1], activeList.contents[2]],
              activeIndexes: [1, 2],
              lastActivated: 'c',
              lastActivatedContent: activeList.contents[2],
              lastActivatedIndex: 2,
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              isCircular: false,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: false,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              contents: [
                {
                  isActive: false,
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
                  isActive: true,
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
                  isActive: true,
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
                  isActive: false,
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
          const { activeList, subscriber } = setup({
            maxActivationLimit: false,
            active: ['a', 'b', 'c'],
            isCircular: true,
          });

          // Swap a with c
          activeList.swapByIndex(0, 2);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['a', 'b', 'c'],
              activeContents: [
                activeList.contents[2],
                activeList.contents[1],
                activeList.contents[0],
              ],
              activeIndexes: [2, 1, 0],
              lastActivated: 'c',
              lastActivatedContent: activeList.contents[0],
              lastActivatedIndex: 0,
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              isCircular: true,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: false,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              contents: [
                {
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
          const { activeList, subscriber } = setup({
            maxActivationLimit: false,
            active: 'b',
            isCircular: true,
          });

          activeList.swapByIndex(1, 1);

          expect(subscriber).toHaveBeenCalledTimes(0);
        });
      });
    });

    test('swap', () => {
      const { activeList, subscriber } = setup({ active: 'b' });

      // Swap b with c
      activeList.swap('b', 'c');

      expect(subscriber).toHaveBeenCalledTimes(1);

      assertLastSubscriber(
        subscriber,
        {
          active: ['b'],
          activeContents: [activeList.contents[2]],
          activeIndexes: [2],
          lastActivated: 'b',
          lastActivatedContent: activeList.contents[2],
          lastActivatedIndex: 2,
          lastDeactivated: null,
          lastDeactivatedContent: null,
          lastDeactivatedIndex: -1,
          isCircular: false,
          direction: 'right',
          oppositeDirection: 'left',
          maxActivationLimit: 1,
          maxActivationLimitBehavior: 'circular',
          history: [],
          hasActiveChangedAtLeastOnce: false,
          autoPlay: {
            isPlaying: false,
            hasBeenStoppedBefore: false,
            duration: 0,
          },
          cooldown: {
            isActive: false,
            duration: 0,
          },
          contents: [
            {
              isActive: false,
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
              isActive: false,
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
              isActive: true,
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
        const { activeList, subscriber } = setup({ active: 'b' });

        // Swap b with c
        activeList.contents[1].swapWith('c');

        expect(subscriber).toHaveBeenCalledTimes(1);

        assertLastSubscriber(
          subscriber,
          {
            active: ['b'],
            activeContents: [activeList.contents[2]],
            activeIndexes: [2],
            lastActivated: 'b',
            lastActivatedContent: activeList.contents[2],
            lastActivatedIndex: 2,
            lastDeactivated: null,
            lastDeactivatedContent: null,
            lastDeactivatedIndex: -1,
            isCircular: false,
            direction: 'right',
            oppositeDirection: 'left',
            maxActivationLimit: 1,
            maxActivationLimitBehavior: 'circular',
            history: [],
            hasActiveChangedAtLeastOnce: false,
            autoPlay: {
              isPlaying: false,
              hasBeenStoppedBefore: false,
              duration: 0,
            },
            cooldown: {
              isActive: false,
              duration: 0,
            },
            contents: [
              {
                isActive: false,
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
                isActive: false,
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
                isActive: true,
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
        const { activeList, subscriber } = setup({ active: 'b' });

        // Swap b with c
        activeList.contents[1].swapWithByIndex(2);

        expect(subscriber).toHaveBeenCalledTimes(1);

        assertLastSubscriber(
          subscriber,
          {
            active: ['b'],
            activeContents: [activeList.contents[2]],
            activeIndexes: [2],
            lastActivated: 'b',
            lastActivatedContent: activeList.contents[2],
            lastActivatedIndex: 2,
            lastDeactivated: null,
            lastDeactivatedContent: null,
            lastDeactivatedIndex: -1,
            isCircular: false,
            direction: 'right',
            oppositeDirection: 'left',
            maxActivationLimit: 1,
            maxActivationLimitBehavior: 'circular',
            history: [],
            hasActiveChangedAtLeastOnce: false,
            autoPlay: {
              isPlaying: false,
              hasBeenStoppedBefore: false,
              duration: 0,
            },
            cooldown: {
              isActive: false,
              duration: 0,
            },
            contents: [
              {
                isActive: false,
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
                isActive: false,
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
                isActive: true,
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

      describe('swapWithNext', () => {
        describe('when isCircular is false', () => {
          test('swapping from the start', () => {
            const { activeList, subscriber } = setup({
              active: 'b',
              isCircular: false,
            });

            // Swap a with b
            activeList.contents[0].swapWithNext();

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(
              subscriber,
              {
                active: ['b'],
                activeContents: [activeList.contents[0]],
                activeIndexes: [0],
                lastActivated: 'b',
                lastActivatedContent: activeList.contents[0],
                lastActivatedIndex: 0,
                lastDeactivated: null,
                lastDeactivatedContent: null,
                lastDeactivatedIndex: -1,
                isCircular: false,
                direction: 'right',
                oppositeDirection: 'left',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: false,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                contents: [
                  {
                    isActive: true,
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
                    isActive: false,
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
                    isActive: false,
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
                  a: 'a',
                  b: 'b',
                },
                index: {
                  a: 0,
                  b: 1,
                },
                time: new Date(),
              }
            );
          });

          test('swapping in the middle', () => {
            const { activeList, subscriber } = setup({
              active: 'b',
              isCircular: false,
            });

            // Swap b with c
            activeList.contents[1].swapWithNext();

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(
              subscriber,
              {
                active: ['b'],
                activeContents: [activeList.contents[2]],
                activeIndexes: [2],
                lastActivated: 'b',
                lastActivatedContent: activeList.contents[2],
                lastActivatedIndex: 2,
                lastDeactivated: null,
                lastDeactivatedContent: null,
                lastDeactivatedIndex: -1,
                isCircular: false,
                direction: 'right',
                oppositeDirection: 'left',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: false,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                contents: [
                  {
                    isActive: false,
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
                    isActive: false,
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
                    isActive: true,
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

          test('swapping at the end', () => {
            const { activeList, subscriber } = setup({
              active: 'b',
              isCircular: false,
            });

            // Swap c with out of bounds
            activeList.contents[2].swapWithNext();

            expect(subscriber).toHaveBeenCalledTimes(0);
          });
        });

        describe('when isCircular is true', () => {
          test('swapping from the start', () => {
            const { activeList, subscriber } = setup({
              active: 'b',
              isCircular: true,
            });

            // Swap a with b
            activeList.contents[0].swapWithNext();

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(
              subscriber,
              {
                active: ['b'],
                activeContents: [activeList.contents[0]],
                activeIndexes: [0],
                lastActivated: 'b',
                lastActivatedContent: activeList.contents[0],
                lastActivatedIndex: 0,
                lastDeactivated: null,
                lastDeactivatedContent: null,
                lastDeactivatedIndex: -1,
                isCircular: true,
                direction: 'right',
                oppositeDirection: 'left',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: false,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                contents: [
                  {
                    isActive: true,
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
                    isActive: false,
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
                    isActive: false,
                    index: 2,
                    value: 'c',
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
                type: 'SWAPPED',
                value: {
                  a: 'a',
                  b: 'b',
                },
                index: {
                  a: 0,
                  b: 1,
                },
                time: new Date(),
              }
            );
          });

          test('swapping in the middle', () => {
            const { activeList, subscriber } = setup({
              active: 'b',
              isCircular: true,
            });

            // Swap b with c
            activeList.contents[1].swapWithNext();

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(
              subscriber,
              {
                active: ['b'],
                activeContents: [activeList.contents[2]],
                activeIndexes: [2],
                lastActivated: 'b',
                lastActivatedContent: activeList.contents[2],
                lastActivatedIndex: 2,
                lastDeactivated: null,
                lastDeactivatedContent: null,
                lastDeactivatedIndex: -1,
                isCircular: true,
                direction: 'right',
                oppositeDirection: 'left',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: false,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                contents: [
                  {
                    isActive: false,
                    index: 0,
                    value: 'a',
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: true,
                    isPrevious: false,
                    hasBeenActiveBefore: false,
                  },
                  {
                    isActive: false,
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
                    isActive: true,
                    index: 2,
                    value: 'b',
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

          test('swapping at the end', () => {
            const { activeList, subscriber } = setup({
              active: 'b',
              isCircular: true,
            });

            // Swap c with a
            activeList.contents[2].swapWithNext();

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(
              subscriber,
              {
                active: ['b'],
                activeContents: [activeList.contents[1]],
                activeIndexes: [1],
                lastActivated: 'b',
                lastActivatedContent: activeList.contents[1],
                lastActivatedIndex: 1,
                lastDeactivated: null,
                lastDeactivatedContent: null,
                lastDeactivatedIndex: -1,
                isCircular: true,
                direction: 'right',
                oppositeDirection: 'left',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: false,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                contents: [
                  {
                    isActive: false,
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
                    isActive: true,
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
                    isActive: false,
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
                  a: 'c',
                  b: 'a',
                },
                index: {
                  a: 2,
                  b: 0,
                },
                time: new Date(),
              }
            );
          });
        });
      });

      describe('swapWithPrevious', () => {
        describe('when isCircular is false', () => {
          test('swapping from the start', () => {
            const { activeList, subscriber } = setup({
              active: 'b',
              isCircular: false,
            });

            // Swap a with out of bounds
            activeList.contents[0].swapWithPrevious();

            expect(subscriber).toHaveBeenCalledTimes(0);
          });

          test('swapping in the middle', () => {
            const { activeList, subscriber } = setup({
              active: 'b',
              isCircular: false,
            });

            // Swap b with a
            activeList.contents[1].swapWithPrevious();

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(
              subscriber,
              {
                active: ['b'],
                activeContents: [activeList.contents[0]],
                activeIndexes: [0],
                lastActivated: 'b',
                lastActivatedContent: activeList.contents[0],
                lastActivatedIndex: 0,
                lastDeactivated: null,
                lastDeactivatedContent: null,
                lastDeactivatedIndex: -1,
                isCircular: false,
                direction: 'right',
                oppositeDirection: 'left',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: false,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                contents: [
                  {
                    isActive: true,
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
                    isActive: false,
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
                    isActive: false,
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

          test('swapping at the end', () => {
            const { activeList, subscriber } = setup({
              active: 'b',
              isCircular: false,
            });

            // Swap c with b
            activeList.contents[2].swapWithPrevious();

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(
              subscriber,
              {
                active: ['b'],
                activeContents: [activeList.contents[2]],
                activeIndexes: [2],
                lastActivated: 'b',
                lastActivatedContent: activeList.contents[2],
                lastActivatedIndex: 2,
                lastDeactivated: null,
                lastDeactivatedContent: null,
                lastDeactivatedIndex: -1,
                isCircular: false,
                direction: 'right',
                oppositeDirection: 'left',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: false,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },

                contents: [
                  {
                    isActive: false,
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
                    isActive: false,
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
                    isActive: true,
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
        });

        describe('when isCircular is true', () => {
          test('swapping from the start', () => {
            const { activeList, subscriber } = setup({
              active: 'b',
              isCircular: true,
            });

            // Swap a with c
            activeList.contents[0].swapWithPrevious();

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(
              subscriber,
              {
                active: ['b'],
                activeContents: [activeList.contents[1]],
                activeIndexes: [1],
                lastActivated: 'b',
                lastActivatedContent: activeList.contents[1],
                lastActivatedIndex: 1,
                lastDeactivated: null,
                lastDeactivatedContent: null,
                lastDeactivatedIndex: -1,
                isCircular: true,
                direction: 'right',
                oppositeDirection: 'left',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: false,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                contents: [
                  {
                    isActive: false,
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
                    isActive: true,
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
                    isActive: false,
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

          test('swapping in the middle', () => {
            const { activeList, subscriber } = setup({
              active: 'b',
              isCircular: true,
            });

            // Swap b with a
            activeList.contents[1].swapWithPrevious();

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(
              subscriber,
              {
                active: ['b'],
                activeContents: [activeList.contents[0]],
                activeIndexes: [0],
                lastActivated: 'b',
                lastActivatedContent: activeList.contents[0],
                lastActivatedIndex: 0,
                lastDeactivated: null,
                lastDeactivatedContent: null,
                lastDeactivatedIndex: -1,
                isCircular: true,
                direction: 'right',
                oppositeDirection: 'left',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: false,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                contents: [
                  {
                    isActive: true,
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
                    isActive: false,
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
                    isActive: false,
                    index: 2,
                    value: 'c',
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

          test('swapping at the end', () => {
            const { activeList, subscriber } = setup({
              active: 'b',
              isCircular: true,
            });

            // Swap c with b
            activeList.contents[2].swapWithPrevious();

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(
              subscriber,
              {
                active: ['b'],
                activeContents: [activeList.contents[2]],
                activeIndexes: [2],
                lastActivated: 'b',
                lastActivatedContent: activeList.contents[2],
                lastActivatedIndex: 2,
                lastDeactivated: null,
                lastDeactivatedContent: null,
                lastDeactivatedIndex: -1,
                isCircular: true,
                direction: 'right',
                oppositeDirection: 'left',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: false,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                contents: [
                  {
                    isActive: false,
                    index: 0,
                    value: 'a',
                    isFirst: true,
                    isLast: false,
                    hasNext: true,
                    hasPrevious: true,
                    isNext: true,
                    isPrevious: false,
                    hasBeenActiveBefore: false,
                  },
                  {
                    isActive: false,
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
                    isActive: true,
                    index: 2,
                    value: 'b',
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
        });
      });
    });
  });

  describe('moving of elements', () => {
    describe('moveByIndex', () => {
      describe('when it throws out of bounds', () => {
        describe('when it throws out of bounds for index "from"', () => {
          test('throws out of bounds when index is to large', () => {
            const { activeList, subscriber } = setup();

            expect(() => {
              activeList.moveByIndex(4, 0);
            }).toThrowError(
              `uiloos > ActiveList > moveByIndex > "from" is out of bounds`
            );

            expect(() => {
              activeList.moveByIndex(4, 0);
            }).toThrowError(ActiveListIndexOutOfBoundsError);

            expect(() => {
              activeList.moveByIndex(3, 0);
            }).toThrowError(
              `uiloos > ActiveList > moveByIndex > "from" is out of bounds`
            );

            expect(() => {
              activeList.moveByIndex(3, 0);
            }).toThrowError(ActiveListIndexOutOfBoundsError);

            expect(subscriber).toHaveBeenCalledTimes(0);
          });

          test('throws out of bounds when index is less than zero', () => {
            const { activeList, subscriber } = setup();

            expect(() => {
              activeList.moveByIndex(-1, 0);
            }).toThrowError(
              `uiloos > ActiveList > moveByIndex > "from" is out of bounds`
            );

            expect(() => {
              activeList.moveByIndex(-1, 0);
            }).toThrowError(ActiveListIndexOutOfBoundsError);

            expect(subscriber).toHaveBeenCalledTimes(0);
          });
        });

        describe('when it throws out of bounds for index "too"', () => {
          test('throws out of bounds when index is to large', () => {
            const { activeList, subscriber } = setup();

            expect(() => {
              activeList.moveByIndex(0, 4);
            }).toThrowError(
              `uiloos > ActiveList > moveByIndex > "to" is out of bounds`
            );

            expect(() => {
              activeList.moveByIndex(0, 4);
            }).toThrowError(ActiveListIndexOutOfBoundsError);

            expect(() => {
              activeList.moveByIndex(0, 3);
            }).toThrowError(
              `uiloos > ActiveList > moveByIndex > "to" is out of bounds`
            );

            expect(() => {
              activeList.moveByIndex(0, 3);
            }).toThrowError(ActiveListIndexOutOfBoundsError);

            expect(subscriber).toHaveBeenCalledTimes(0);
          });

          test('throws out of bounds when index is less than zero', () => {
            const { activeList, subscriber } = setup();

            expect(() => {
              activeList.moveByIndex(0, -1);
            }).toThrowError(
              `uiloos > ActiveList > moveByIndex > "to" is out of bounds`
            );

            expect(() => {
              activeList.moveByIndex(0, -1);
            }).toThrowError(ActiveListIndexOutOfBoundsError);

            expect(subscriber).toHaveBeenCalledTimes(0);
          });
        });
      });

      describe('when maxActivationLimit is 1', () => {
        test('moving from before the lastActivatedIndex to beyond the lastActivatedIndex', () => {
          const { activeList, subscriber } = setup(
            {
              active: 'D',
            },
            ['a', 'b', 'c', 'D', 'e', 'f', 'g']
          );

          // Move b after e
          activeList.moveByIndex(1, 4);

          const expected = ['a', 'c', 'D', 'e', 'b', 'f', 'g'];
          expect(activeList.contents.map((c) => c.value)).toEqual(expected);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['D'],
              activeContents: [activeList.contents[2]],
              activeIndexes: [2],
              lastActivated: 'D',
              lastActivatedContent: activeList.contents[2],
              lastActivatedIndex: 2,
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              isCircular: false,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              contents: [
                {
                  isActive: false,
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
                  isActive: false,
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
                  isActive: true,
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
                  isActive: false,
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
                  isActive: false,
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
                  isActive: false,
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
                  isActive: false,
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
          const { activeList, subscriber } = setup(
            {
              active: 'D',
            },
            ['a', 'b', 'c', 'D', 'e', 'f', 'g']
          );

          // Move c onto D
          activeList.moveByIndex(2, 3);

          const expected = ['a', 'b', 'D', 'c', 'e', 'f', 'g'];
          expect(activeList.contents.map((c) => c.value)).toEqual(expected);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['D'],
              activeContents: [activeList.contents[2]],
              activeIndexes: [2],
              lastActivated: 'D',
              lastActivatedContent: activeList.contents[2],
              lastActivatedIndex: 2,
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              isCircular: false,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              contents: [
                {
                  isActive: false,
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
                  isActive: false,
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
                  isActive: true,
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
                  isActive: false,
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
                  isActive: false,
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
                  isActive: false,
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
                  isActive: false,
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
          const { activeList, subscriber } = setup(
            {
              active: 'D',
            },
            ['a', 'b', 'c', 'D', 'e', 'f', 'g']
          );

          // Move a after g
          activeList.moveByIndex(0, 6);

          const expected = ['b', 'c', 'D', 'e', 'f', 'g', 'a'];
          expect(activeList.contents.map((c) => c.value)).toEqual(expected);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['D'],
              activeContents: [activeList.contents[2]],
              activeIndexes: [2],
              lastActivated: 'D',
              lastActivatedContent: activeList.contents[2],
              lastActivatedIndex: 2,
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              isCircular: false,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              contents: [
                {
                  isActive: false,
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
                  isActive: false,
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
                  isActive: true,
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
                  isActive: false,
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
                  isActive: false,
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
                  isActive: false,
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
                  isActive: false,
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
          const { activeList, subscriber } = setup(
            {
              active: 'D',
            },
            ['a', 'b', 'c', 'D', 'e', 'f', 'g']
          );

          // Move e before b
          activeList.moveByIndex(4, 1);

          const expected = ['a', 'e', 'b', 'c', 'D', 'f', 'g'];
          expect(activeList.contents.map((c) => c.value)).toEqual(expected);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['D'],
              activeContents: [activeList.contents[4]],
              activeIndexes: [4],
              lastActivated: 'D',
              lastActivatedContent: activeList.contents[4],
              lastActivatedIndex: 4,
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              isCircular: false,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              contents: [
                {
                  isActive: false,
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
                  isActive: false,
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
                  isActive: false,
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
                  isActive: false,
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
                  isActive: true,
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
                  isActive: false,
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
                  isActive: false,
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
          const { activeList, subscriber } = setup(
            {
              active: 'D',
            },
            ['a', 'b', 'c', 'D', 'e', 'f', 'g']
          );

          // Move e unto D
          activeList.moveByIndex(4, 3);

          const expected = ['a', 'b', 'c', 'e', 'D', 'f', 'g'];
          expect(activeList.contents.map((c) => c.value)).toEqual(expected);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['D'],
              activeContents: [activeList.contents[4]],
              activeIndexes: [4],
              lastActivated: 'D',
              lastActivatedContent: activeList.contents[4],
              lastActivatedIndex: 4,
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              isCircular: false,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              contents: [
                {
                  isActive: false,
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
                  isActive: false,
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
                  isActive: false,
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
                  isActive: false,
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
                  isActive: true,
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
                  isActive: false,
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
                  isActive: false,
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
          const { activeList, subscriber } = setup(
            {
              active: 'D',
            },
            ['a', 'b', 'c', 'D', 'e', 'f', 'g']
          );

          // Move g before a
          activeList.moveByIndex(6, 0);

          const expected = ['g', 'a', 'b', 'c', 'D', 'e', 'f'];
          expect(activeList.contents.map((c) => c.value)).toEqual(expected);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['D'],
              activeContents: [activeList.contents[4]],
              activeIndexes: [4],
              lastActivated: 'D',
              lastActivatedContent: activeList.contents[4],
              lastActivatedIndex: 4,
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              isCircular: false,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              contents: [
                {
                  isActive: false,
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
                  isActive: false,
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
                  isActive: false,
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
                  isActive: false,
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
                  isActive: true,
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
                  isActive: false,
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
                  isActive: false,
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
          const { activeList, subscriber } = setup(
            {
              active: 'D',
            },
            ['a', 'b', 'c', 'D', 'e', 'f', 'g']
          );

          // Move e after f
          activeList.moveByIndex(4, 5);

          const expected = ['a', 'b', 'c', 'D', 'f', 'e', 'g'];
          expect(activeList.contents.map((c) => c.value)).toEqual(expected);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['D'],
              activeContents: [activeList.contents[3]],
              activeIndexes: [3],
              lastActivated: 'D',
              lastActivatedContent: activeList.contents[3],
              lastActivatedIndex: 3,
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              isCircular: false,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              contents: [
                {
                  isActive: false,
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
                  isActive: false,
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
                  isActive: false,
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
                  isActive: true,
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
                  isActive: false,
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
                  isActive: false,
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
                  isActive: false,
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
          const { activeList, subscriber } = setup(
            {
              active: 'D',
            },
            ['a', 'b', 'c', 'D', 'e', 'f', 'g']
          );

          // Move c before b
          activeList.moveByIndex(2, 1);

          const expected = ['a', 'c', 'b', 'D', 'e', 'f', 'g'];
          expect(activeList.contents.map((c) => c.value)).toEqual(expected);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['D'],
              activeContents: [activeList.contents[3]],
              activeIndexes: [3],
              lastActivated: 'D',
              lastActivatedContent: activeList.contents[3],
              lastActivatedIndex: 3,
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              isCircular: false,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              contents: [
                {
                  isActive: false,
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
                  isActive: false,
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
                  isActive: false,
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
                  isActive: true,
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
                  isActive: false,
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
                  isActive: false,
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
                  isActive: false,
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
          const { activeList, subscriber } = setup(
            {
              active: 'D',
            },
            ['a', 'b', 'c', 'D', 'e', 'f', 'g']
          );

          // Move D after e
          activeList.moveByIndex(3, 4);

          const expected = ['a', 'b', 'c', 'e', 'D', 'f', 'g'];
          expect(activeList.contents.map((c) => c.value)).toEqual(expected);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['D'],
              activeContents: [activeList.contents[4]],
              activeIndexes: [4],
              lastActivated: 'D',
              lastActivatedContent: activeList.contents[4],
              lastActivatedIndex: 4,
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              isCircular: false,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              contents: [
                {
                  isActive: false,
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
                  isActive: false,
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
                  isActive: false,
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
                  isActive: false,
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
                  isActive: true,
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
                  isActive: false,
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
                  isActive: false,
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
          const { activeList, subscriber } = setup(
            {
              active: 'D',
            },
            ['a', 'b', 'c', 'D', 'e', 'f', 'g']
          );

          // Move D before c
          activeList.moveByIndex(3, 2);

          const expected = ['a', 'b', 'D', 'c', 'e', 'f', 'g'];
          expect(activeList.contents.map((c) => c.value)).toEqual(expected);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['D'],
              activeContents: [activeList.contents[2]],
              activeIndexes: [2],
              lastActivated: 'D',
              lastActivatedContent: activeList.contents[2],
              lastActivatedIndex: 2,
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              isCircular: false,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              contents: [
                {
                  isActive: false,
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
                  isActive: false,
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
                  isActive: true,
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
                  isActive: false,
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
                  isActive: false,
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
                  isActive: false,
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
                  isActive: false,
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
          const { activeList, subscriber } = setup(
            {
              active: 'D',
            },
            ['a', 'b', 'c', 'D', 'e', 'f', 'g']
          );

          // Move D before a
          activeList.moveByIndex(3, 0);

          const expected = ['D', 'a', 'b', 'c', 'e', 'f', 'g'];
          expect(activeList.contents.map((c) => c.value)).toEqual(expected);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['D'],
              activeContents: [activeList.contents[0]],
              activeIndexes: [0],
              lastActivated: 'D',
              lastActivatedContent: activeList.contents[0],
              lastActivatedIndex: 0,
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              isCircular: false,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              contents: [
                {
                  isActive: true,
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
                  isActive: false,
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
                  isActive: false,
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
                  isActive: false,
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
                  isActive: false,
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
                  isActive: false,
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
                  isActive: false,
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
          const { activeList, subscriber } = setup(
            {
              active: 'D',
            },
            ['a', 'b', 'c', 'D', 'e', 'f', 'g']
          );

          // Move D before a
          activeList.moveByIndex(3, 6);

          const expected = ['a', 'b', 'c', 'e', 'f', 'g', 'D'];
          expect(activeList.contents.map((c) => c.value)).toEqual(expected);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['D'],
              activeContents: [activeList.contents[6]],
              activeIndexes: [6],
              lastActivated: 'D',
              lastActivatedContent: activeList.contents[6],
              lastActivatedIndex: 6,
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              isCircular: false,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              contents: [
                {
                  isActive: false,
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
                  isActive: false,
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
                  isActive: false,
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
                  isActive: false,
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
                  isActive: false,
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
                  isActive: false,
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
                  isActive: true,
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
          const { activeList, subscriber } = setup({
            active: 'b',
            isCircular: true,
          });

          // Move a beyond c
          activeList.moveByIndex(0, 2);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['b'],
              activeContents: [activeList.contents[0]],
              activeIndexes: [0],
              lastActivated: 'b',
              lastActivatedContent: activeList.contents[0],
              lastActivatedIndex: 0,
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              isCircular: true,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              contents: [
                {
                  isActive: true,
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
                  isActive: false,
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
                  isActive: false,
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
          const { activeList, subscriber } = setup({
            active: 'b',
          });

          // Move a beyond c
          activeList.moveByIndex(1, 1);

          expect(subscriber).toHaveBeenCalledTimes(0);
        });
      });

      describe('when maxActivationLimit is false', () => {
        test('when all items are active they should all still be active after the move', () => {
          const { activeList, subscriber } = setup(
            {
              maxActivationLimit: false,
              active: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
            },
            ['a', 'b', 'c', 'd', 'e', 'f', 'g']
          );

          // Move b after e
          activeList.moveByIndex(1, 4);

          const expected = ['a', 'c', 'd', 'e', 'b', 'f', 'g'];
          expect(activeList.contents.map((c) => c.value)).toEqual(expected);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
              activeContents: [
                activeList.contents[0],
                activeList.contents[4],
                activeList.contents[1],
                activeList.contents[2],
                activeList.contents[3],
                activeList.contents[5],
                activeList.contents[6],
              ],
              activeIndexes: [0, 4, 1, 2, 3, 5, 6],
              lastActivated: 'g',
              lastActivatedContent: activeList.contents[6],
              lastActivatedIndex: 6,
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              isCircular: false,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: false,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              contents: [
                {
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
          const { activeList, subscriber } = setup(
            {
              maxActivationLimit: false,
              active: ['a', 'b', 'c', 'e', 'f', 'g', 'D'],
            },
            ['a', 'b', 'c', 'D', 'e', 'f', 'g']
          );

          // Move b after e
          activeList.moveByIndex(1, 4);

          const expected = ['a', 'c', 'D', 'e', 'b', 'f', 'g'];
          expect(activeList.contents.map((c) => c.value)).toEqual(expected);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['a', 'b', 'c', 'e', 'f', 'g', 'D'],
              activeContents: [
                activeList.contents[0],
                activeList.contents[4],
                activeList.contents[1],
                activeList.contents[3],
                activeList.contents[5],
                activeList.contents[6],
                activeList.contents[2],
              ],
              activeIndexes: [0, 4, 1, 3, 5, 6, 2],
              lastActivated: 'D',
              lastActivatedContent: activeList.contents[2],
              lastActivatedIndex: 2,
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              isCircular: false,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: false,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              contents: [
                {
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
          const { activeList, subscriber } = setup(
            {
              maxActivationLimit: false,
              active: ['b', 'e', 'f', 'a', 'c', 'g', 'D'],
            },
            ['a', 'b', 'c', 'D', 'e', 'f', 'g']
          );

          // Move c onto D
          activeList.moveByIndex(2, 3);

          const expected = ['a', 'b', 'D', 'c', 'e', 'f', 'g'];
          expect(activeList.contents.map((c) => c.value)).toEqual(expected);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['b', 'e', 'f', 'a', 'c', 'g', 'D'],
              activeContents: [
                activeList.contents[1],
                activeList.contents[4],
                activeList.contents[5],
                activeList.contents[0],
                activeList.contents[3],
                activeList.contents[6],
                activeList.contents[2],
              ],
              activeIndexes: [1, 4, 5, 0, 3, 6, 2],
              lastActivated: 'D',
              lastActivatedContent: activeList.contents[2],
              lastActivatedIndex: 2,
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              isCircular: false,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: false,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              contents: [
                {
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
          const { activeList, subscriber } = setup(
            {
              maxActivationLimit: false,
              active: ['g', 'f', 'e', 'c', 'b', 'a', 'D'],
            },
            ['a', 'b', 'c', 'D', 'e', 'f', 'g']
          );

          // Move a after g
          activeList.moveByIndex(0, 6);

          const expected = ['b', 'c', 'D', 'e', 'f', 'g', 'a'];
          expect(activeList.contents.map((c) => c.value)).toEqual(expected);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['g', 'f', 'e', 'c', 'b', 'a', 'D'],
              activeContents: [
                activeList.contents[5],
                activeList.contents[4],
                activeList.contents[3],
                activeList.contents[1],
                activeList.contents[0],
                activeList.contents[6],
                activeList.contents[2],
              ],
              activeIndexes: [5, 4, 3, 1, 0, 6, 2],
              lastActivated: 'D',
              lastActivatedContent: activeList.contents[2],
              lastActivatedIndex: 2,
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              isCircular: false,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: false,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              contents: [
                {
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
          const { activeList, subscriber } = setup(
            {
              maxActivationLimit: false,
              active: ['b', 'a', 'c', 'e', 'f', 'g', 'D'],
            },
            ['a', 'b', 'c', 'D', 'e', 'f', 'g']
          );

          // Move e before b
          activeList.moveByIndex(4, 1);

          const expected = ['a', 'e', 'b', 'c', 'D', 'f', 'g'];
          expect(activeList.contents.map((c) => c.value)).toEqual(expected);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['b', 'a', 'c', 'e', 'f', 'g', 'D'],
              activeContents: [
                activeList.contents[2],
                activeList.contents[0],
                activeList.contents[3],
                activeList.contents[1],
                activeList.contents[5],
                activeList.contents[6],
                activeList.contents[4],
              ],
              activeIndexes: [2, 0, 3, 1, 5, 6, 4],
              lastActivated: 'D',
              lastActivatedContent: activeList.contents[4],
              lastActivatedIndex: 4,
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              isCircular: false,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: false,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              contents: [
                {
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
          const { activeList, subscriber } = setup(
            {
              maxActivationLimit: false,
              active: ['e', 'f', 'g', 'a', 'b', 'c', 'D'],
            },
            ['a', 'b', 'c', 'D', 'e', 'f', 'g']
          );

          // Move e unto D
          activeList.moveByIndex(4, 3);

          const expected = ['a', 'b', 'c', 'e', 'D', 'f', 'g'];
          expect(activeList.contents.map((c) => c.value)).toEqual(expected);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['e', 'f', 'g', 'a', 'b', 'c', 'D'],
              activeContents: [
                activeList.contents[3],
                activeList.contents[5],
                activeList.contents[6],
                activeList.contents[0],
                activeList.contents[1],
                activeList.contents[2],
                activeList.contents[4],
              ],
              activeIndexes: [3, 5, 6, 0, 1, 2, 4],
              lastActivated: 'D',
              lastActivatedContent: activeList.contents[4],
              lastActivatedIndex: 4,
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              isCircular: false,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: false,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              contents: [
                {
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
          const { activeList, subscriber } = setup(
            {
              maxActivationLimit: false,
              active: ['c', 'f', 'b', 'a', 'g', 'e', 'D'],
            },
            ['a', 'b', 'c', 'D', 'e', 'f', 'g']
          );

          // Move g before a
          activeList.moveByIndex(6, 0);

          const expected = ['g', 'a', 'b', 'c', 'D', 'e', 'f'];
          expect(activeList.contents.map((c) => c.value)).toEqual(expected);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['c', 'f', 'b', 'a', 'g', 'e', 'D'],
              activeContents: [
                activeList.contents[3],
                activeList.contents[6],
                activeList.contents[2],
                activeList.contents[1],
                activeList.contents[0],
                activeList.contents[5],
                activeList.contents[4],
              ],
              activeIndexes: [3, 6, 2, 1, 0, 5, 4],
              lastActivated: 'D',
              lastActivatedContent: activeList.contents[4],
              lastActivatedIndex: 4,
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              isCircular: false,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: false,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              contents: [
                {
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
          const { activeList, subscriber } = setup(
            {
              maxActivationLimit: false,
              active: ['a', 'f', 'e', 'b', 'c', 'g', 'D'],
            },
            ['a', 'b', 'c', 'D', 'e', 'f', 'g']
          );

          // Move e after f
          activeList.moveByIndex(4, 5);

          const expected = ['a', 'b', 'c', 'D', 'f', 'e', 'g'];
          expect(activeList.contents.map((c) => c.value)).toEqual(expected);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['a', 'f', 'e', 'b', 'c', 'g', 'D'],
              activeContents: [
                activeList.contents[0],
                activeList.contents[4],
                activeList.contents[5],
                activeList.contents[1],
                activeList.contents[2],
                activeList.contents[6],
                activeList.contents[3],
              ],
              activeIndexes: [0, 4, 5, 1, 2, 6, 3],
              lastActivated: 'D',
              lastActivatedContent: activeList.contents[3],
              lastActivatedIndex: 3,
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              isCircular: false,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: false,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              contents: [
                {
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
          const { activeList, subscriber } = setup(
            {
              maxActivationLimit: false,
              active: ['g', 'a', 'b', 'e', 'f', 'c', 'D'],
            },
            ['a', 'b', 'c', 'D', 'e', 'f', 'g']
          );

          // Move c before b
          activeList.moveByIndex(2, 1);

          const expected = ['a', 'c', 'b', 'D', 'e', 'f', 'g'];
          expect(activeList.contents.map((c) => c.value)).toEqual(expected);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['g', 'a', 'b', 'e', 'f', 'c', 'D'],
              activeContents: [
                activeList.contents[6],
                activeList.contents[0],
                activeList.contents[2],
                activeList.contents[4],
                activeList.contents[5],
                activeList.contents[1],
                activeList.contents[3],
              ],
              activeIndexes: [6, 0, 2, 4, 5, 1, 3],
              lastActivated: 'D',
              lastActivatedContent: activeList.contents[3],
              lastActivatedIndex: 3,
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              isCircular: false,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: false,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              contents: [
                {
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
          const { activeList, subscriber } = setup(
            {
              maxActivationLimit: false,
              active: ['f', 'b', 'a', 'c', 'e', 'g', 'D'],
            },
            ['a', 'b', 'c', 'D', 'e', 'f', 'g']
          );

          // Move D after e
          activeList.moveByIndex(3, 4);

          const expected = ['a', 'b', 'c', 'e', 'D', 'f', 'g'];
          expect(activeList.contents.map((c) => c.value)).toEqual(expected);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['f', 'b', 'a', 'c', 'e', 'g', 'D'],
              activeContents: [
                activeList.contents[5],
                activeList.contents[1],
                activeList.contents[0],
                activeList.contents[2],
                activeList.contents[3],
                activeList.contents[6],
                activeList.contents[4],
              ],
              activeIndexes: [5, 1, 0, 2, 3, 6, 4],
              lastActivated: 'D',
              lastActivatedContent: activeList.contents[4],
              lastActivatedIndex: 4,
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              isCircular: false,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: false,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              contents: [
                {
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
          const { activeList, subscriber } = setup(
            {
              maxActivationLimit: false,
              active: ['e', 'a', 'g', 'f', 'b', 'c', 'D'],
            },
            ['a', 'b', 'c', 'D', 'e', 'f', 'g']
          );

          // Move D before c
          activeList.moveByIndex(3, 2);

          const expected = ['a', 'b', 'D', 'c', 'e', 'f', 'g'];
          expect(activeList.contents.map((c) => c.value)).toEqual(expected);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['e', 'a', 'g', 'f', 'b', 'c', 'D'],
              activeContents: [
                activeList.contents[4],
                activeList.contents[0],
                activeList.contents[6],
                activeList.contents[5],
                activeList.contents[1],
                activeList.contents[3],
                activeList.contents[2],
              ],
              activeIndexes: [4, 0, 6, 5, 1, 3, 2],
              lastActivated: 'D',
              lastActivatedContent: activeList.contents[2],
              lastActivatedIndex: 2,
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              isCircular: false,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: false,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              contents: [
                {
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
          const { activeList, subscriber } = setup(
            {
              maxActivationLimit: false,
              active: ['a', 'b', 'c', 'e', 'f', 'g', 'D'],
            },
            ['a', 'b', 'c', 'D', 'e', 'f', 'g']
          );

          // Move D before a
          activeList.moveByIndex(3, 0);

          const expected = ['D', 'a', 'b', 'c', 'e', 'f', 'g'];
          expect(activeList.contents.map((c) => c.value)).toEqual(expected);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['a', 'b', 'c', 'e', 'f', 'g', 'D'],
              activeContents: [
                activeList.contents[1],
                activeList.contents[2],
                activeList.contents[3],
                activeList.contents[4],
                activeList.contents[5],
                activeList.contents[6],
                activeList.contents[0],
              ],
              activeIndexes: [1, 2, 3, 4, 5, 6, 0],
              lastActivated: 'D',
              lastActivatedContent: activeList.contents[0],
              lastActivatedIndex: 0,
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              isCircular: false,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: false,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              contents: [
                {
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
          const { activeList, subscriber } = setup(
            {
              maxActivationLimit: false,
              active: ['a', 'g', 'e', 'c', 'f', 'b', 'D'],
            },
            ['a', 'b', 'c', 'D', 'e', 'f', 'g']
          );

          // Move D after g
          activeList.moveByIndex(3, 6);

          const expected = ['a', 'b', 'c', 'e', 'f', 'g', 'D'];
          expect(activeList.contents.map((c) => c.value)).toEqual(expected);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['a', 'g', 'e', 'c', 'f', 'b', 'D'],
              activeContents: [
                activeList.contents[0],
                activeList.contents[5],
                activeList.contents[3],
                activeList.contents[2],
                activeList.contents[4],
                activeList.contents[1],
                activeList.contents[6],
              ],
              activeIndexes: [0, 5, 3, 2, 4, 1, 6],
              lastActivated: 'D',
              lastActivatedContent: activeList.contents[6],
              lastActivatedIndex: 6,
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              isCircular: false,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: false,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              contents: [
                {
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
          const { activeList, subscriber } = setup({
            maxActivationLimit: false,
            active: ['a', 'c', 'b'],
            isCircular: true,
          });

          // Move a beyond c
          activeList.moveByIndex(0, 2);

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['a', 'c', 'b'],
              activeContents: [
                activeList.contents[2],
                activeList.contents[1],
                activeList.contents[0],
              ],
              activeIndexes: [2, 1, 0],
              lastActivated: 'b',
              lastActivatedContent: activeList.contents[0],
              lastActivatedIndex: 0,
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              isCircular: true,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: false,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              contents: [
                {
                  isActive: true,
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
                  isActive: true,
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
                  isActive: true,
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
          const { activeList, subscriber } = setup({
            maxActivationLimit: false,
            active: 'b',
          });

          // Move a beyond c
          activeList.moveByIndex(1, 1);

          expect(subscriber).toHaveBeenCalledTimes(0);
        });
      });
    });

    test('move', () => {
      const { activeList, subscriber } = setup({ active: 'a' });

      // Move a beyond c
      activeList.move('a', 2);

      expect(subscriber).toHaveBeenCalledTimes(1);

      assertLastSubscriber(
        subscriber,
        {
          active: ['a'],
          activeContents: [activeList.contents[2]],
          activeIndexes: [2],
          lastActivated: 'a',
          lastActivatedContent: activeList.contents[2],
          lastActivatedIndex: 2,
          lastDeactivated: null,
          lastDeactivatedContent: null,
          lastDeactivatedIndex: -1,
          isCircular: false,
          direction: 'right',
          oppositeDirection: 'left',
          maxActivationLimit: 1,
          maxActivationLimitBehavior: 'circular',
          history: [],
          hasActiveChangedAtLeastOnce: false,
          autoPlay: {
            isPlaying: false,
            hasBeenStoppedBefore: false,
            duration: 0,
          },
          cooldown: {
            isActive: false,
            duration: 0,
          },
          contents: [
            {
              isActive: false,
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
              isActive: false,
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
              isActive: true,
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
        const { activeList, subscriber } = setup({ active: 'b' });

        activeList.moveByIndexByPredicate(
          0,
          ({ value, index }) => value === 'b' && index === 1
        );

        expect(subscriber).toHaveBeenCalledTimes(1);

        assertLastSubscriber(
          subscriber,
          {
            active: ['b'],
            activeContents: [activeList.contents[0]],
            activeIndexes: [0],
            lastActivated: 'b',
            lastActivatedContent: activeList.contents[0],
            lastActivatedIndex: 0,
            lastDeactivated: null,
            lastDeactivatedContent: null,
            lastDeactivatedIndex: -1,
            isCircular: false,
            direction: 'right',
            oppositeDirection: 'left',
            maxActivationLimit: 1,
            maxActivationLimitBehavior: 'circular',
            history: [],
            hasActiveChangedAtLeastOnce: false,
            autoPlay: {
              isPlaying: false,
              hasBeenStoppedBefore: false,
              duration: 0,
            },
            cooldown: {
              isActive: false,
              duration: 0,
            },
            contents: [
              {
                isActive: true,
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
                isActive: false,
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
                isActive: false,
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
            const { activeList, subscriber } = setup({ active: 'b' });

            activeList.moveByIndexByPredicate(
              0,
              ({ value, index }) => value === 'a' && index === 0,
              { mode: 'at' }
            );

            expect(subscriber).toHaveBeenCalledTimes(0);

            assertState(activeList, {
              active: ['b'],
              activeContents: [activeList.contents[1]],
              activeIndexes: [1],
              lastActivated: 'b',
              lastActivatedContent: activeList.contents[1],
              lastActivatedIndex: 1,
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              isCircular: false,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              contents: [
                {
                  isActive: false,
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
                  isActive: true,
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
                  isActive: false,
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
          });

          test('move to middle', () => {
            const { activeList, subscriber } = setup({ active: 'b' });

            activeList.moveByIndexByPredicate(
              0,
              ({ value, index }) => value === 'b' && index === 1,
              { mode: 'at' }
            );

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(
              subscriber,
              {
                active: ['b'],
                activeContents: [activeList.contents[0]],
                activeIndexes: [0],
                lastActivated: 'b',
                lastActivatedContent: activeList.contents[0],
                lastActivatedIndex: 0,
                lastDeactivated: null,
                lastDeactivatedContent: null,
                lastDeactivatedIndex: -1,
                isCircular: false,
                direction: 'right',
                oppositeDirection: 'left',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: false,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                contents: [
                  {
                    isActive: true,
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
                    isActive: false,
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
                    isActive: false,
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
            const { activeList, subscriber } = setup({ active: 'b' });

            activeList.moveByIndexByPredicate(
              0,
              ({ value, index }) => value === 'c' && index === 2,
              { mode: 'at' }
            );

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(
              subscriber,
              {
                active: ['b'],
                activeContents: [activeList.contents[0]],
                activeIndexes: [0],
                lastActivated: 'b',
                lastActivatedContent: activeList.contents[0],
                lastActivatedIndex: 0,
                lastDeactivated: null,
                lastDeactivatedContent: null,
                lastDeactivatedIndex: -1,
                isCircular: false,
                direction: 'right',
                oppositeDirection: 'left',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: false,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                contents: [
                  {
                    isActive: true,
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
                    isActive: false,
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
                    isActive: false,
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
            const { activeList, subscriber } = setup({ active: 'b' });

            activeList.moveByIndexByPredicate(
              1,
              ({ value, index }) => value === 'a' && index === 0,
              { mode: 'at' }
            );

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(
              subscriber,
              {
                active: ['b'],
                activeContents: [activeList.contents[0]],
                activeIndexes: [0],
                lastActivated: 'b',
                lastActivatedContent: activeList.contents[0],
                lastActivatedIndex: 0,
                lastDeactivated: null,
                lastDeactivatedContent: null,
                lastDeactivatedIndex: -1,
                isCircular: false,
                direction: 'right',
                oppositeDirection: 'left',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: false,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                contents: [
                  {
                    isActive: true,
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
                    isActive: false,
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
                    isActive: false,
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
            const { activeList, subscriber } = setup({ active: 'b' });

            activeList.moveByIndexByPredicate(
              1,
              ({ value, index }) => value === 'b' && index === 1,
              { mode: 'at' }
            );

            expect(subscriber).toHaveBeenCalledTimes(0);
          });

          test('move to last', () => {
            const { activeList, subscriber } = setup({ active: 'b' });

            activeList.moveByIndexByPredicate(
              1,
              ({ value, index }) => value === 'c' && index === 2,
              { mode: 'at' }
            );

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(
              subscriber,
              {
                active: ['b'],
                activeContents: [activeList.contents[2]],
                activeIndexes: [2],
                lastActivated: 'b',
                lastActivatedContent: activeList.contents[2],
                lastActivatedIndex: 2,
                lastDeactivated: null,
                lastDeactivatedContent: null,
                lastDeactivatedIndex: -1,
                isCircular: false,
                direction: 'right',
                oppositeDirection: 'left',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: false,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                contents: [
                  {
                    isActive: false,
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
                    isActive: false,
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
                    isActive: true,
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
            const { activeList, subscriber } = setup({ active: 'b' });

            activeList.moveByIndexByPredicate(
              2,
              ({ value, index }) => value === 'a' && index === 0,
              { mode: 'at' }
            );

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(
              subscriber,
              {
                active: ['b'],
                activeContents: [activeList.contents[2]],
                activeIndexes: [2],
                lastActivated: 'b',
                lastActivatedContent: activeList.contents[2],
                lastActivatedIndex: 2,
                lastDeactivated: null,
                lastDeactivatedContent: null,
                lastDeactivatedIndex: -1,
                isCircular: false,
                direction: 'right',
                oppositeDirection: 'left',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: false,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                contents: [
                  {
                    isActive: false,
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
                    isActive: false,
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
                    isActive: true,
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
            const { activeList, subscriber } = setup({ active: 'b' });

            activeList.moveByIndexByPredicate(
              2,
              ({ value, index }) => value === 'b' && index === 1,
              { mode: 'at' }
            );

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(
              subscriber,
              {
                active: ['b'],
                activeContents: [activeList.contents[2]],
                activeIndexes: [2],
                lastActivated: 'b',
                lastActivatedContent: activeList.contents[2],
                lastActivatedIndex: 2,
                lastDeactivated: null,
                lastDeactivatedContent: null,
                lastDeactivatedIndex: -1,
                isCircular: false,
                direction: 'right',
                oppositeDirection: 'left',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: false,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                contents: [
                  {
                    isActive: false,
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
                    isActive: false,
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
                    isActive: true,
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
            const { activeList, subscriber } = setup({ active: 'b' });

            activeList.moveByIndexByPredicate(
              2,
              ({ value, index }) => value === 'c' && index === 2,
              { mode: 'at' }
            );

            expect(subscriber).toHaveBeenCalledTimes(0);
          });
        });

        test('when no predicate matches do nothing', () => {
          const { activeList, subscriber } = setup({ active: 'b' });

          activeList.moveByIndexByPredicate(0, ({ value }) => value === 'z', {
            mode: 'at',
          });

          expect(subscriber).toHaveBeenCalledTimes(0);

          assertState(activeList, {
            active: ['b'],
            activeContents: [activeList.contents[1]],
            activeIndexes: [1],
            lastActivated: 'b',
            lastActivatedContent: activeList.contents[1],
            lastActivatedIndex: 1,
            lastDeactivated: null,
            lastDeactivatedContent: null,
            lastDeactivatedIndex: -1,
            isCircular: false,
            direction: 'right',
            oppositeDirection: 'left',
            maxActivationLimit: 1,
            maxActivationLimitBehavior: 'circular',
            history: [],
            hasActiveChangedAtLeastOnce: false,
            autoPlay: {
              isPlaying: false,
              hasBeenStoppedBefore: false,
              duration: 0,
            },
            cooldown: {
              isActive: false,
              duration: 0,
            },
            contents: [
              {
                isActive: false,
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
                isActive: true,
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
                isActive: false,
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
        });
      });

      describe('mode before', () => {
        describe('moving first item', () => {
          test('move to before first should do nothing', () => {
            const { activeList, subscriber } = setup({ active: 'b' });

            activeList.moveByIndexByPredicate(
              0,
              ({ value, index }) => value === 'a' && index === 0,
              { mode: 'before' }
            );

            expect(subscriber).toHaveBeenCalledTimes(0);
          });

          test('move to before middle should do nothing', () => {
            const { activeList, subscriber } = setup({ active: 'b' });

            activeList.moveByIndexByPredicate(
              0,
              ({ value, index }) => value === 'b' && index === 1,
              { mode: 'before' }
            );

            expect(subscriber).toHaveBeenCalledTimes(0);
          });

          test('move to before last', () => {
            const { activeList, subscriber } = setup({ active: 'b' });

            activeList.moveByIndexByPredicate(
              0,
              ({ value, index }) => value === 'c' && index === 2,
              { mode: 'before' }
            );

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(
              subscriber,
              {
                active: ['b'],
                activeContents: [activeList.contents[0]],
                activeIndexes: [0],
                lastActivated: 'b',
                lastActivatedContent: activeList.contents[0],
                lastActivatedIndex: 0,
                lastDeactivated: null,
                lastDeactivatedContent: null,
                lastDeactivatedIndex: -1,
                isCircular: false,
                direction: 'right',
                oppositeDirection: 'left',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: false,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                contents: [
                  {
                    isActive: true,
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
                    isActive: false,
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
                    isActive: false,
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
            const { activeList, subscriber } = setup({ active: 'b' });

            activeList.moveByIndexByPredicate(
              1,
              ({ value, index }) => value === 'a' && index === 0,
              { mode: 'before' }
            );

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(
              subscriber,
              {
                active: ['b'],
                activeContents: [activeList.contents[0]],
                activeIndexes: [0],
                lastActivated: 'b',
                lastActivatedContent: activeList.contents[0],
                lastActivatedIndex: 0,
                lastDeactivated: null,
                lastDeactivatedContent: null,
                lastDeactivatedIndex: -1,
                isCircular: false,
                direction: 'right',
                oppositeDirection: 'left',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: false,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                contents: [
                  {
                    isActive: true,
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
                    isActive: false,
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
                    isActive: false,
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
            const { activeList, subscriber } = setup({ active: 'b' });

            activeList.moveByIndexByPredicate(
              1,
              ({ value, index }) => value === 'b' && index === 1,
              { mode: 'before' }
            );

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(
              subscriber,
              {
                active: ['b'],
                activeContents: [activeList.contents[0]],
                activeIndexes: [0],
                lastActivated: 'b',
                lastActivatedContent: activeList.contents[0],
                lastActivatedIndex: 0,
                lastDeactivated: null,
                lastDeactivatedContent: null,
                lastDeactivatedIndex: -1,
                isCircular: false,
                direction: 'right',
                oppositeDirection: 'left',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: false,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                contents: [
                  {
                    isActive: true,
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
                    isActive: false,
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
                    isActive: false,
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
            const { activeList, subscriber } = setup({ active: 'b' });

            activeList.moveByIndexByPredicate(
              1,
              ({ value, index }) => value === 'c' && index === 2,
              { mode: 'before' }
            );

            expect(subscriber).toHaveBeenCalledTimes(0);
          });
        });

        describe('moving last item', () => {
          test('move to before first', () => {
            const { activeList, subscriber } = setup({ active: 'b' });

            activeList.moveByIndexByPredicate(
              2,
              ({ value, index }) => value === 'a' && index === 0,
              { mode: 'before' }
            );

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(
              subscriber,
              {
                active: ['b'],
                activeContents: [activeList.contents[2]],
                activeIndexes: [2],
                lastActivated: 'b',
                lastActivatedContent: activeList.contents[2],
                lastActivatedIndex: 2,
                lastDeactivated: null,
                lastDeactivatedContent: null,
                lastDeactivatedIndex: -1,
                isCircular: false,
                direction: 'right',
                oppositeDirection: 'left',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: false,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                contents: [
                  {
                    isActive: false,
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
                    isActive: false,
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
                    isActive: true,
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
            const { activeList, subscriber } = setup({ active: 'b' });

            activeList.moveByIndexByPredicate(
              2,
              ({ value, index }) => value === 'b' && index === 1,
              { mode: 'before' }
            );

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(
              subscriber,
              {
                active: ['b'],
                activeContents: [activeList.contents[2]],
                activeIndexes: [2],
                lastActivated: 'b',
                lastActivatedContent: activeList.contents[2],
                lastActivatedIndex: 2,
                lastDeactivated: null,
                lastDeactivatedContent: null,
                lastDeactivatedIndex: -1,
                isCircular: false,
                direction: 'right',
                oppositeDirection: 'left',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: false,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                contents: [
                  {
                    isActive: false,
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
                    isActive: false,
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
                    isActive: true,
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
            const { activeList, subscriber } = setup({ active: 'b' });

            activeList.moveByIndexByPredicate(
              2,
              ({ value, index }) => value === 'c' && index === 2,
              { mode: 'before' }
            );

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(
              subscriber,
              {
                active: ['b'],
                activeContents: [activeList.contents[2]],
                activeIndexes: [2],
                lastActivated: 'b',
                lastActivatedContent: activeList.contents[2],
                lastActivatedIndex: 2,
                lastDeactivated: null,
                lastDeactivatedContent: null,
                lastDeactivatedIndex: -1,
                isCircular: false,
                direction: 'right',
                oppositeDirection: 'left',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: false,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                contents: [
                  {
                    isActive: false,
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
                    isActive: false,
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
                    isActive: true,
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
          const { activeList, subscriber } = setup({ active: 'b' });

          activeList.moveByIndexByPredicate(0, ({ value }) => value === 'z', {
            mode: 'before',
          });

          expect(subscriber).toHaveBeenCalledTimes(0);

          assertState(activeList, {
            active: ['b'],
            activeContents: [activeList.contents[1]],
            activeIndexes: [1],
            lastActivated: 'b',
            lastActivatedContent: activeList.contents[1],
            lastActivatedIndex: 1,
            lastDeactivated: null,
            lastDeactivatedContent: null,
            lastDeactivatedIndex: -1,
            isCircular: false,
            direction: 'right',
            oppositeDirection: 'left',
            maxActivationLimit: 1,
            maxActivationLimitBehavior: 'circular',
            history: [],
            hasActiveChangedAtLeastOnce: false,
            autoPlay: {
              isPlaying: false,
              hasBeenStoppedBefore: false,
              duration: 0,
            },
            cooldown: {
              isActive: false,
              duration: 0,
            },
            contents: [
              {
                isActive: false,
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
                isActive: true,
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
                isActive: false,
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
        });
      });

      describe('mode after', () => {
        describe('moving first item', () => {
          test('move to after first', () => {
            const { activeList, subscriber } = setup({ active: 'b' });

            activeList.moveByIndexByPredicate(
              0,
              ({ value, index }) => value === 'a' && index === 0,
              { mode: 'after' }
            );

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(
              subscriber,
              {
                active: ['b'],
                activeContents: [activeList.contents[0]],
                activeIndexes: [0],
                lastActivated: 'b',
                lastActivatedContent: activeList.contents[0],
                lastActivatedIndex: 0,
                lastDeactivated: null,
                lastDeactivatedContent: null,
                lastDeactivatedIndex: -1,
                isCircular: false,
                direction: 'right',
                oppositeDirection: 'left',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: false,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                contents: [
                  {
                    isActive: true,
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
                    isActive: false,
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
                    isActive: false,
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
            const { activeList, subscriber } = setup({ active: 'b' });

            activeList.moveByIndexByPredicate(
              0,
              ({ value, index }) => value === 'b' && index === 1,
              { mode: 'after' }
            );

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(
              subscriber,
              {
                active: ['b'],
                activeContents: [activeList.contents[0]],
                activeIndexes: [0],
                lastActivated: 'b',
                lastActivatedContent: activeList.contents[0],
                lastActivatedIndex: 0,
                lastDeactivated: null,
                lastDeactivatedContent: null,
                lastDeactivatedIndex: -1,
                isCircular: false,
                direction: 'right',
                oppositeDirection: 'left',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: false,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                contents: [
                  {
                    isActive: true,
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
                    isActive: false,
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
                    isActive: false,
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
            const { activeList, subscriber } = setup({ active: 'b' });

            activeList.moveByIndexByPredicate(
              0,
              ({ value, index }) => value === 'c' && index === 2,
              { mode: 'after' }
            );

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(
              subscriber,
              {
                active: ['b'],
                activeContents: [activeList.contents[0]],
                activeIndexes: [0],
                lastActivated: 'b',
                lastActivatedContent: activeList.contents[0],
                lastActivatedIndex: 0,
                lastDeactivated: null,
                lastDeactivatedContent: null,
                lastDeactivatedIndex: -1,
                isCircular: false,
                direction: 'right',
                oppositeDirection: 'left',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: false,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                contents: [
                  {
                    isActive: true,
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
                    isActive: false,
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
                    isActive: false,
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
            const { activeList, subscriber } = setup({ active: 'b' });

            activeList.moveByIndexByPredicate(
              1,
              ({ value, index }) => value === 'a' && index === 0,
              { mode: 'after' }
            );

            expect(subscriber).toHaveBeenCalledTimes(0);
          });

          test('move to after middle', () => {
            const { activeList, subscriber } = setup({ active: 'b' });

            activeList.moveByIndexByPredicate(
              1,
              ({ value, index }) => value === 'b' && index === 1,
              { mode: 'after' }
            );

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(
              subscriber,
              {
                active: ['b'],
                activeContents: [activeList.contents[2]],
                activeIndexes: [2],
                lastActivated: 'b',
                lastActivatedContent: activeList.contents[2],
                lastActivatedIndex: 2,
                lastDeactivated: null,
                lastDeactivatedContent: null,
                lastDeactivatedIndex: -1,
                isCircular: false,
                direction: 'right',
                oppositeDirection: 'left',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: false,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                contents: [
                  {
                    isActive: false,
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
                    isActive: false,
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
                    isActive: true,
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
            const { activeList, subscriber } = setup({ active: 'b' });

            activeList.moveByIndexByPredicate(
              1,
              ({ value, index }) => value === 'c' && index === 2,
              { mode: 'after' }
            );

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(
              subscriber,
              {
                active: ['b'],
                activeContents: [activeList.contents[2]],
                activeIndexes: [2],
                lastActivated: 'b',
                lastActivatedContent: activeList.contents[2],
                lastActivatedIndex: 2,
                lastDeactivated: null,
                lastDeactivatedContent: null,
                lastDeactivatedIndex: -1,
                isCircular: false,
                direction: 'right',
                oppositeDirection: 'left',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: false,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                contents: [
                  {
                    isActive: false,
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
                    isActive: false,
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
                    isActive: true,
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
            const { activeList, subscriber } = setup({ active: 'b' });

            activeList.moveByIndexByPredicate(
              2,
              ({ value, index }) => value === 'a' && index === 0,
              { mode: 'after' }
            );

            expect(subscriber).toHaveBeenCalledTimes(1);

            assertLastSubscriber(
              subscriber,
              {
                active: ['b'],
                activeContents: [activeList.contents[2]],
                activeIndexes: [2],
                lastActivated: 'b',
                lastActivatedContent: activeList.contents[2],
                lastActivatedIndex: 2,
                lastDeactivated: null,
                lastDeactivatedContent: null,
                lastDeactivatedIndex: -1,
                isCircular: false,
                direction: 'right',
                oppositeDirection: 'left',
                maxActivationLimit: 1,
                maxActivationLimitBehavior: 'circular',
                history: [],
                hasActiveChangedAtLeastOnce: false,
                autoPlay: {
                  isPlaying: false,
                  hasBeenStoppedBefore: false,
                  duration: 0,
                },
                cooldown: {
                  isActive: false,
                  duration: 0,
                },
                contents: [
                  {
                    isActive: false,
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
                    isActive: false,
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
                    isActive: true,
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
            const { activeList, subscriber } = setup({ active: 'b' });

            activeList.moveByIndexByPredicate(
              2,
              ({ value, index }) => value === 'b' && index === 1,
              { mode: 'after' }
            );

            expect(subscriber).toHaveBeenCalledTimes(0);
          });

          test('move to after last should do nothing', () => {
            const { activeList, subscriber } = setup({ active: 'b' });

            activeList.moveByIndexByPredicate(
              2,
              ({ value, index }) => value === 'c' && index === 2,
              { mode: 'after' }
            );

            expect(subscriber).toHaveBeenCalledTimes(0);
          });
        });

        test('when no predicate matches do nothing', () => {
          const { activeList, subscriber } = setup({ active: 'b' });

          activeList.moveByIndexByPredicate(0, ({ value }) => value === 'z', {
            mode: 'after',
          });

          expect(subscriber).toHaveBeenCalledTimes(0);

          assertState(activeList, {
            active: ['b'],
            activeContents: [activeList.contents[1]],
            activeIndexes: [1],
            lastActivated: 'b',
            lastActivatedContent: activeList.contents[1],
            lastActivatedIndex: 1,
            lastDeactivated: null,
            lastDeactivatedContent: null,
            lastDeactivatedIndex: -1,
            isCircular: false,
            direction: 'right',
            oppositeDirection: 'left',
            maxActivationLimit: 1,
            maxActivationLimitBehavior: 'circular',
            history: [],
            hasActiveChangedAtLeastOnce: false,
            autoPlay: {
              isPlaying: false,
              hasBeenStoppedBefore: false,
              duration: 0,
            },
            cooldown: {
              isActive: false,
              duration: 0,
            },
            contents: [
              {
                isActive: false,
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
                isActive: true,
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
                isActive: false,
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
        });
      });
    });

    describe('moveByPredicate', () => {
      test('when no mode is provided assume at', () => {
        const { activeList, subscriber } = setup({ active: 'b' });

        activeList.moveByPredicate(
          'a',
          ({ value, index }) => value === 'b' && index === 1
        );

        expect(subscriber).toHaveBeenCalledTimes(1);

        assertLastSubscriber(
          subscriber,
          {
            active: ['b'],
            activeContents: [activeList.contents[0]],
            activeIndexes: [0],
            lastActivated: 'b',
            lastActivatedContent: activeList.contents[0],
            lastActivatedIndex: 0,
            lastDeactivated: null,
            lastDeactivatedContent: null,
            lastDeactivatedIndex: -1,
            isCircular: false,
            direction: 'right',
            oppositeDirection: 'left',
            maxActivationLimit: 1,
            maxActivationLimitBehavior: 'circular',
            history: [],
            hasActiveChangedAtLeastOnce: false,
            autoPlay: {
              isPlaying: false,
              hasBeenStoppedBefore: false,
              duration: 0,
            },
            cooldown: {
              isActive: false,
              duration: 0,
            },
            contents: [
              {
                isActive: true,
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
                isActive: false,
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
                isActive: false,
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
          const { activeList, subscriber } = setup({ active: 'b' });

          activeList.moveByPredicate(
            'a',
            ({ value, index }) => value === 'b' && index === 1,
            { mode: 'at' }
          );

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['b'],
              activeContents: [activeList.contents[0]],
              activeIndexes: [0],
              lastActivated: 'b',
              lastActivatedContent: activeList.contents[0],
              lastActivatedIndex: 0,
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              isCircular: false,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              contents: [
                {
                  isActive: true,
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
                  isActive: false,
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
                  isActive: false,
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
          const { activeList, subscriber } = setup({ active: 'b' });

          activeList.moveByPredicate('a', ({ value }) => value === 'z', {
            mode: 'at',
          });

          expect(subscriber).toHaveBeenCalledTimes(0);
        });

        test('when item is not found throw error', () => {
          const { activeList } = setup({ active: 'b' });

          expect(() =>
            activeList.moveByPredicate('y', ({ value }) => value === 'z', {
              mode: 'at',
            })
          ).toThrowError(
            'uiloos > ActiveList > getIndex > index cannot be found, item is not in contents array'
          );

          expect(() => {
            activeList.moveByPredicate('y', ({ value }) => value === 'z', {
              mode: 'at',
            });
          }).toThrowError(ActiveListItemNotFoundError);
        });
      });

      describe('mode before', () => {
        test('when predicate matches perform move', () => {
          const { activeList, subscriber } = setup({ active: 'b' });

          activeList.moveByPredicate(
            'a',
            ({ value, index }) => value === 'c' && index === 2,
            { mode: 'before' }
          );

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['b'],
              activeContents: [activeList.contents[0]],
              activeIndexes: [0],
              lastActivated: 'b',
              lastActivatedContent: activeList.contents[0],
              lastActivatedIndex: 0,
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              isCircular: false,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              contents: [
                {
                  isActive: true,
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
                  isActive: false,
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
                  isActive: false,
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
          const { activeList, subscriber } = setup({ active: 'b' });

          activeList.moveByPredicate('a', ({ value }) => value === 'z', {
            mode: 'before',
          });

          expect(subscriber).toHaveBeenCalledTimes(0);
        });

        test('when item is not found throw error', () => {
          const { activeList } = setup({ active: 'b' });

          expect(() =>
            activeList.moveByPredicate('y', ({ value }) => value === 'z', {
              mode: 'before',
            })
          ).toThrowError(
            'uiloos > ActiveList > getIndex > index cannot be found, item is not in contents array'
          );

          expect(() => {
            activeList.moveByPredicate('y', ({ value }) => value === 'z', {
              mode: 'before',
            });
          }).toThrowError(ActiveListItemNotFoundError);
        });
      });

      describe('mode after', () => {
        test('when predicate matches perform move', () => {
          const { activeList, subscriber } = setup({ active: 'b' });

          activeList.moveByPredicate(
            'a',
            ({ value, index }) => value === 'a' && index === 0,
            { mode: 'after' }
          );

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['b'],
              activeContents: [activeList.contents[0]],
              activeIndexes: [0],
              lastActivated: 'b',
              lastActivatedContent: activeList.contents[0],
              lastActivatedIndex: 0,
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              isCircular: false,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              contents: [
                {
                  isActive: true,
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
                  isActive: false,
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
                  isActive: false,
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
          const { activeList, subscriber } = setup({ active: 'b' });

          activeList.moveByPredicate('a', ({ value }) => value === 'z', {
            mode: 'after',
          });

          expect(subscriber).toHaveBeenCalledTimes(0);
        });

        test('when item is not found throw error', () => {
          const { activeList } = setup({ active: 'b' });

          expect(() =>
            activeList.moveByPredicate('y', ({ value }) => value === 'z', {
              mode: 'after',
            })
          ).toThrowError(
            'uiloos > ActiveList > getIndex > index cannot be found, item is not in contents array'
          );

          expect(() => {
            activeList.moveByPredicate('y', ({ value }) => value === 'z', {
              mode: 'after',
            });
          }).toThrowError(ActiveListItemNotFoundError);
        });
      });
    });

    describe('ActiveListContent methods', () => {
      test('moveToIndex', () => {
        const { activeList, subscriber } = setup({ active: 'a' });

        // Move a beyond c
        activeList.contents[0].moveToIndex(2);

        expect(subscriber).toHaveBeenCalledTimes(1);

        assertLastSubscriber(
          subscriber,
          {
            active: ['a'],
            activeContents: [activeList.contents[2]],
            activeIndexes: [2],
            lastActivated: 'a',
            lastActivatedContent: activeList.contents[2],
            lastActivatedIndex: 2,
            lastDeactivated: null,
            lastDeactivatedContent: null,
            lastDeactivatedIndex: -1,
            isCircular: false,
            direction: 'right',
            oppositeDirection: 'left',
            maxActivationLimit: 1,
            maxActivationLimitBehavior: 'circular',
            history: [],
            hasActiveChangedAtLeastOnce: false,
            autoPlay: {
              isPlaying: false,
              hasBeenStoppedBefore: false,
              duration: 0,
            },
            cooldown: {
              isActive: false,
              duration: 0,
            },
            contents: [
              {
                isActive: false,
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
                isActive: false,
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
                isActive: true,
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
          const { activeList, subscriber } = setup({ active: 'b' });

          activeList.contents[0].moveToPredicate(
            ({ value, index }) => value === 'b' && index === 1
          );

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['b'],
              activeContents: [activeList.contents[0]],
              activeIndexes: [0],
              lastActivated: 'b',
              lastActivatedContent: activeList.contents[0],
              lastActivatedIndex: 0,
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              isCircular: false,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              contents: [
                {
                  isActive: true,
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
                  isActive: false,
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
                  isActive: false,
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
          const { activeList, subscriber } = setup({ active: 'b' });

          activeList.contents[0].moveToPredicate(
            ({ value, index }) => value === 'b' && index === 1,
            { mode: 'at' }
          );

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['b'],
              activeContents: [activeList.contents[0]],
              activeIndexes: [0],
              lastActivated: 'b',
              lastActivatedContent: activeList.contents[0],
              lastActivatedIndex: 0,
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              isCircular: false,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              contents: [
                {
                  isActive: true,
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
                  isActive: false,
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
                  isActive: false,
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
          const { activeList, subscriber } = setup({ active: 'b' });

          activeList.contents[0].moveToPredicate(
            ({ value, index }) => value === 'c' && index === 2,
            { mode: 'before' }
          );

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['b'],
              activeContents: [activeList.contents[0]],
              activeIndexes: [0],
              lastActivated: 'b',
              lastActivatedContent: activeList.contents[0],
              lastActivatedIndex: 0,
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              isCircular: false,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              contents: [
                {
                  isActive: true,
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
                  isActive: false,
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
                  isActive: false,
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
          const { activeList, subscriber } = setup({ active: 'a' });

          // Move a beyond c
          activeList.contents[0].moveToPredicate(
            ({ value, index }) => value === 'c' && index === 2,
            { mode: 'after' }
          );

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['a'],
              activeContents: [activeList.contents[2]],
              activeIndexes: [2],
              lastActivated: 'a',
              lastActivatedContent: activeList.contents[2],
              lastActivatedIndex: 2,
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              isCircular: false,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              contents: [
                {
                  isActive: false,
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
                  isActive: false,
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
                  isActive: true,
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
          const { activeList, subscriber } = setup({ active: 'a' });

          // Move c before a
          activeList.contents[2].moveToFirst();

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['a'],
              activeContents: [activeList.contents[1]],
              activeIndexes: [1],
              lastActivated: 'a',
              lastActivatedContent: activeList.contents[1],
              lastActivatedIndex: 1,
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              isCircular: false,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              contents: [
                {
                  isActive: false,
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
                  isActive: true,
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
                  isActive: false,
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
          const { activeList, subscriber } = setup({ active: 'b' });

          // Move b before a
          activeList.contents[1].moveToFirst();

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['b'],
              activeContents: [activeList.contents[0]],
              activeIndexes: [0],
              lastActivated: 'b',
              lastActivatedContent: activeList.contents[0],
              lastActivatedIndex: 0,
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              isCircular: false,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              contents: [
                {
                  isActive: true,
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
                  isActive: false,
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
                  isActive: false,
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
          const { activeList, subscriber } = setup({ active: 'a' });

          // Move a beyond c
          activeList.contents[0].moveToLast();

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['a'],
              activeContents: [activeList.contents[2]],
              activeIndexes: [2],
              lastActivated: 'a',
              lastActivatedContent: activeList.contents[2],
              lastActivatedIndex: 2,
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              isCircular: false,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              contents: [
                {
                  isActive: false,
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
                  isActive: false,
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
                  isActive: true,
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
          const { activeList, subscriber } = setup({ active: 'b' });

          // Move b beyond c
          activeList.contents[1].moveToLast();

          expect(subscriber).toHaveBeenCalledTimes(1);

          assertLastSubscriber(
            subscriber,
            {
              active: ['b'],
              activeContents: [activeList.contents[2]],
              activeIndexes: [2],
              lastActivated: 'b',
              lastActivatedContent: activeList.contents[2],
              lastActivatedIndex: 2,
              lastDeactivated: null,
              lastDeactivatedContent: null,
              lastDeactivatedIndex: -1,
              isCircular: false,
              direction: 'right',
              oppositeDirection: 'left',
              maxActivationLimit: 1,
              maxActivationLimitBehavior: 'circular',
              history: [],
              hasActiveChangedAtLeastOnce: false,
              autoPlay: {
                isPlaying: false,
                hasBeenStoppedBefore: false,
                duration: 0,
              },
              cooldown: {
                isActive: false,
                duration: 0,
              },
              contents: [
                {
                  isActive: false,
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
                  isActive: false,
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
                  isActive: true,
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

  describe('autoPlay', () => {
    describe('duration errors', () => {
      test('cannot be less than zero', () => {
        expect(() => {
          setup({ autoPlay: { duration: -1 }, activeIndexes: 0 });
        }).toThrowError(
          'uiloos > ActiveList > autoPlay > duration cannot be negative or zero'
        );

        expect(() => {
          setup({ autoPlay: { duration: -1 }, activeIndexes: 0 });
        }).toThrowError(ActiveListAutoPlayDurationError);
      });

      test('cannot be zero', () => {
        expect(() => {
          setup({ autoPlay: { duration: 0 }, activeIndexes: 0 });
        }).toThrowError(
          'uiloos > ActiveList > autoPlay > duration cannot be negative or zero'
        );

        expect(() => {
          setup({ autoPlay: { duration: 0 }, activeIndexes: 0 });
        }).toThrowError(ActiveListAutoPlayDurationError);
      });
    });

    test('that autoPlay does not start when there is no active content', () => {
      jest.useFakeTimers();

      const { activeList, subscriber } = setup({
        active: [],
        maxActivationLimit: 1,
        autoPlay: { duration: 200 },
        isCircular: false,
      });

      expect(subscriber).toBeCalledTimes(0);

      jest.advanceTimersByTime(200);

      expect(activeList.active).toEqual([]);
      expect(activeList.autoPlay).toEqual({
        isPlaying: false,
        hasBeenStoppedBefore: false,
        duration: 0,
      });
      expect(subscriber).toBeCalledTimes(0);

      jest.advanceTimersByTime(200);

      expect(activeList.active).toEqual([]);
      expect(activeList.autoPlay).toEqual({
        isPlaying: false,
        hasBeenStoppedBefore: false,
        duration: 0,
      });
      expect(subscriber).toBeCalledTimes(0);

      jest.advanceTimersByTime(200);

      expect(activeList.active).toEqual([]);
      expect(activeList.autoPlay).toEqual({
        isPlaying: false,
        hasBeenStoppedBefore: false,
        duration: 0,
      });
      expect(subscriber).toBeCalledTimes(0);

      // Even calling play should have no effect
      activeList.play();

      expect(activeList.active).toEqual([]);
      expect(activeList.autoPlay).toEqual({
        isPlaying: false,
        hasBeenStoppedBefore: false,
        duration: 0,
      });
      expect(subscriber).toBeCalledTimes(0);

      jest.advanceTimersByTime(200);

      expect(activeList.active).toEqual([]);
      expect(activeList.autoPlay).toEqual({
        isPlaying: false,
        hasBeenStoppedBefore: false,
        duration: 0,
      });
      expect(subscriber).toBeCalledTimes(0);

      jest.advanceTimersByTime(200);

      expect(activeList.active).toEqual([]);
      expect(activeList.autoPlay).toEqual({
        isPlaying: false,
        hasBeenStoppedBefore: false,
        duration: 0,
      });
      expect(subscriber).toBeCalledTimes(0);

      jest.advanceTimersByTime(200);

      expect(activeList.active).toEqual([]);
      expect(activeList.autoPlay).toEqual({
        isPlaying: false,
        hasBeenStoppedBefore: false,
        duration: 0,
      });
      expect(subscriber).toBeCalledTimes(0);
    });

    describe('effect of maxActivationLimit', () => {
      test('when maxActivationLimit is 1', () => {
        jest.useFakeTimers();

        const { activeList, subscriber } = setup({
          maxActivationLimit: 1,
          active: ['a'],
          autoPlay: { duration: 200 },
          isCircular: false,
        });

        expect(activeList.active).toEqual(['a']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: true,
          duration: 200,
          hasBeenStoppedBefore: false,
        });
        expect(subscriber).toBeCalledTimes(0);

        jest.advanceTimersByTime(200);

        expect(activeList.active).toEqual(['b']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: true,
          duration: 200,
          hasBeenStoppedBefore: false,
        });
        assertEvents(subscriber, ['ACTIVATED']);

        jest.advanceTimersByTime(200);

        expect(activeList.active).toEqual(['c']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: false,
          hasBeenStoppedBefore: true,
          duration: 0,
        });
        assertEvents(subscriber, [
          'ACTIVATED',
          'AUTO_PLAY_STOPPED',
          'ACTIVATED',
        ]);
      });

      test('when maxActivationLimit is N', () => {
        jest.useFakeTimers();

        const { activeList, subscriber } = setup({
          maxActivationLimit: 2,
          active: ['a'],
          autoPlay: { duration: 200 },
          isCircular: false,
        });

        expect(activeList.active).toEqual(['a']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: true,
          duration: 200,
          hasBeenStoppedBefore: false,
        });
        expect(subscriber).toBeCalledTimes(0);

        jest.advanceTimersByTime(200);

        expect(activeList.active).toEqual(['a', 'b']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: true,
          duration: 200,
          hasBeenStoppedBefore: false,
        });
        assertEvents(subscriber, ['ACTIVATED']);

        jest.advanceTimersByTime(200);

        expect(activeList.active).toEqual(['b', 'c']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: false,
          hasBeenStoppedBefore: true,
          duration: 0,
        });
        assertEvents(subscriber, [
          'ACTIVATED',
          'AUTO_PLAY_STOPPED',
          'ACTIVATED',
        ]);
      });

      test('when maxActivationLimit is false', () => {
        jest.useFakeTimers();

        const { activeList, subscriber } = setup({
          maxActivationLimit: false,
          active: ['a'],
          autoPlay: { duration: 200 },
          isCircular: false,
        });

        expect(activeList.active).toEqual(['a']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: true,
          duration: 200,
          hasBeenStoppedBefore: false,
        });
        expect(subscriber).toBeCalledTimes(0);

        jest.advanceTimersByTime(200);

        expect(activeList.active).toEqual(['a', 'b']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: true,
          duration: 200,
          hasBeenStoppedBefore: false,
        });
        assertEvents(subscriber, ['ACTIVATED']);

        jest.advanceTimersByTime(200);

        expect(activeList.active).toEqual(['a', 'b', 'c']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: false,
          hasBeenStoppedBefore: true,
          duration: 0,
        });
        assertEvents(subscriber, [
          'ACTIVATED',
          'AUTO_PLAY_STOPPED',
          'ACTIVATED',
        ]);
      });
    });

    describe('end of content behavior', () => {
      test('goes to the next item after duration and wraps around correctly when circular', () => {
        jest.useFakeTimers();

        const { activeList, subscriber } = setup({
          autoPlay: { duration: 200 },
          isCircular: true,
          activeIndexes: 0,
        });

        expect(activeList.active).toEqual(['a']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: true,
          duration: 200,
          hasBeenStoppedBefore: false,
        });
        expect(subscriber).toBeCalledTimes(0);

        jest.advanceTimersByTime(200);

        expect(activeList.active).toEqual(['b']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: true,
          duration: 200,
          hasBeenStoppedBefore: false,
        });
        assertEvents(subscriber, ['ACTIVATED']);

        jest.advanceTimersByTime(200);

        expect(activeList.active).toEqual(['c']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: true,
          duration: 200,
          hasBeenStoppedBefore: false,
        });
        assertEvents(subscriber, ['ACTIVATED', 'ACTIVATED']);

        jest.advanceTimersByTime(200);

        expect(activeList.active).toEqual(['a']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: true,
          duration: 200,
          hasBeenStoppedBefore: false,
        });
        assertEvents(subscriber, ['ACTIVATED', 'ACTIVATED', 'ACTIVATED']);
      });

      test('stops the autoPlay at the last item when not circular', () => {
        jest.useFakeTimers();

        const { activeList, subscriber } = setup({
          autoPlay: { duration: 200 },
          isCircular: false,
          activeIndexes: 0,
        });

        expect(activeList.active).toEqual(['a']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: true,
          duration: 200,
          hasBeenStoppedBefore: false,
        });
        expect(subscriber).toBeCalledTimes(0);

        jest.advanceTimersByTime(200);

        expect(activeList.active).toEqual(['b']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: true,
          duration: 200,
          hasBeenStoppedBefore: false,
        });
        assertEvents(subscriber, ['ACTIVATED']);

        jest.advanceTimersByTime(200);

        expect(activeList.active).toEqual(['c']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: false,
          hasBeenStoppedBefore: true,
          duration: 0,
        });
        assertEvents(subscriber, [
          'ACTIVATED',
          'AUTO_PLAY_STOPPED',
          'ACTIVATED',
        ]);

        jest.advanceTimersByTime(200);

        expect(activeList.active).toEqual(['c']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: false,
          hasBeenStoppedBefore: true,
          duration: 0,
        });
        assertEvents(subscriber, [
          'ACTIVATED',
          'AUTO_PLAY_STOPPED',
          'ACTIVATED',
        ]);
      });
    });

    describe('user calling configureAutoPlay', () => {
      test('that autoPlay can be activated after the component has started', () => {
        jest.useFakeTimers();

        const { activeList, subscriber } = setup({
          autoPlay: undefined,
          isCircular: false,
          activeIndexes: 0,
        });

        expect(activeList.autoPlay).toEqual({
          isPlaying: false,
          hasBeenStoppedBefore: false,
          duration: 0,
        });
        expect(subscriber).toBeCalledTimes(0);

        // Should do nothing
        jest.advanceTimersByTime(200);

        expect(activeList.active).toEqual(['a']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: false,
          hasBeenStoppedBefore: false,
          duration: 0,
        });
        expect(subscriber).toBeCalledTimes(0);

        activeList.configureAutoPlay({ duration: 200 });

        expect(activeList.autoPlay).toEqual({
          isPlaying: true,
          duration: 200,
          hasBeenStoppedBefore: false,
        });
        assertEvents(subscriber, ['AUTO_PLAY_PLAYING']);

        jest.advanceTimersByTime(200);

        expect(activeList.active).toEqual(['b']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: true,
          duration: 200,
          hasBeenStoppedBefore: false,
        });
        assertEvents(subscriber, ['AUTO_PLAY_PLAYING', 'ACTIVATED']);
      });

      test('that autoPlay can be stopped / reset by the user by callling it with null', () => {
        jest.useFakeTimers();

        const { activeList, subscriber } = setup({
          autoPlay: { duration: 200 },
          isCircular: true,
          activeIndexes: 0,
        });

        expect(activeList.active).toEqual(['a']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: true,
          duration: 200,
          hasBeenStoppedBefore: false,
        });
        expect(subscriber).toBeCalledTimes(0);

        jest.advanceTimersByTime(200);

        expect(activeList.active).toEqual(['b']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: true,
          duration: 200,
          hasBeenStoppedBefore: false,
        });
        assertEvents(subscriber, ['ACTIVATED']);

        // Stop the autoPlay
        activeList.configureAutoPlay(null);

        expect(activeList.active).toEqual(['b']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: false,
          hasBeenStoppedBefore: true,
          duration: 0,
        });
        assertEvents(subscriber, ['ACTIVATED', 'AUTO_PLAY_STOPPED']);

        // Should stay on 'b'
        jest.advanceTimersByTime(200);

        expect(activeList.active).toEqual(['b']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: false,
          hasBeenStoppedBefore: true,
          duration: 0,
        });
        assertEvents(subscriber, ['ACTIVATED', 'AUTO_PLAY_STOPPED']);
      });
    });

    describe('stopsOnUserInteraction', () => {
      test('stop the autoPlay when stopsOnUserInteraction is true on activation, and isUserInteraction is true', () => {
        jest.useFakeTimers();

        const { activeList, subscriber } = setup({
          autoPlay: { duration: 200, stopsOnUserInteraction: true },
          isCircular: true,
          activeIndexes: 0,
        });

        expect(activeList.active).toEqual(['a']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: true,
          duration: 200,
          hasBeenStoppedBefore: false,
        });
        expect(subscriber).toBeCalledTimes(0);

        jest.advanceTimersByTime(200);

        expect(activeList.active).toEqual(['b']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: true,
          duration: 200,
          hasBeenStoppedBefore: false,
        });
        assertEvents(subscriber, ['ACTIVATED']);

        activeList.activateNext({ isUserInteraction: true });

        expect(activeList.active).toEqual(['c']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: false,
          hasBeenStoppedBefore: true,
          duration: 0,
        });
        assertEvents(subscriber, [
          'ACTIVATED',
          'AUTO_PLAY_STOPPED',
          'ACTIVATED',
        ]);

        // Should have no effect
        jest.advanceTimersByTime(200);

        expect(activeList.active).toEqual(['c']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: false,
          hasBeenStoppedBefore: true,
          duration: 0,
        });
        assertEvents(subscriber, [
          'ACTIVATED',
          'AUTO_PLAY_STOPPED',
          'ACTIVATED',
        ]);
      });

      test('stop the autoPlay when stopsOnUserInteraction is true on activation, and isUserInteraction is undefined', () => {
        jest.useFakeTimers();

        const { activeList, subscriber } = setup({
          autoPlay: { duration: 200, stopsOnUserInteraction: true },
          isCircular: true,
          activeIndexes: 0,
        });

        expect(activeList.active).toEqual(['a']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: true,
          duration: 200,
          hasBeenStoppedBefore: false,
        });
        expect(subscriber).toBeCalledTimes(0);

        jest.advanceTimersByTime(200);

        expect(activeList.active).toEqual(['b']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: true,
          duration: 200,
          hasBeenStoppedBefore: false,
        });
        assertEvents(subscriber, ['ACTIVATED']);

        // The `undefined` should default to `true`.
        activeList.activateNext({ isUserInteraction: undefined });

        expect(activeList.active).toEqual(['c']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: false,
          hasBeenStoppedBefore: true,
          duration: 0,
        });
        assertEvents(subscriber, [
          'ACTIVATED',
          'AUTO_PLAY_STOPPED',
          'ACTIVATED',
        ]);

        // Should have no effect
        jest.advanceTimersByTime(200);

        expect(activeList.active).toEqual(['c']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: false,
          hasBeenStoppedBefore: true,
          duration: 0,
        });
        assertEvents(subscriber, [
          'ACTIVATED',
          'AUTO_PLAY_STOPPED',
          'ACTIVATED',
        ]);
      });

      test('stop the autoPlay when stopsOnUserInteraction is true on activation, and isUserInteraction is undefined, via the cooldown', () => {
        jest.useFakeTimers();

        const { activeList, subscriber } = setup({
          autoPlay: { duration: 200, stopsOnUserInteraction: true },
          isCircular: true,
          activeIndexes: 0,
        });

        expect(activeList.active).toEqual(['a']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: true,
          duration: 200,
          hasBeenStoppedBefore: false,
        });
        expect(subscriber).toBeCalledTimes(0);

        jest.advanceTimersByTime(200);

        expect(activeList.active).toEqual(['b']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: true,
          duration: 200,
          hasBeenStoppedBefore: false,
        });
        assertEvents(subscriber, ['ACTIVATED']);

        // The `undefined` for isUserInteraction should default to `true`.
        activeList.activateNext({ cooldown: 1000 });

        expect(activeList.active).toEqual(['c']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: false,
          hasBeenStoppedBefore: true,
          duration: 0,
        });
        expect(activeList.cooldown).toEqual({ isActive: true, duration: 1000 });
        assertEvents(subscriber, [
          'ACTIVATED',
          'AUTO_PLAY_STOPPED',
          'ACTIVATED',
          'COOLDOWN_STARTED',
        ]);

        // Should have no effect
        jest.advanceTimersByTime(200);

        expect(activeList.active).toEqual(['c']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: false,
          hasBeenStoppedBefore: true,
          duration: 0,
        });
        assertEvents(subscriber, [
          'ACTIVATED',
          'AUTO_PLAY_STOPPED',
          'ACTIVATED',
          'COOLDOWN_STARTED',
        ]);
        expect(activeList.cooldown).toEqual({ isActive: true, duration: 1000 });
      });

      test('stop the autoPlay when stopsOnUserInteraction is true on deactivation, and isUserInteraction is true', () => {
        jest.useFakeTimers();

        const { activeList, subscriber } = setup({
          autoPlay: { duration: 200, stopsOnUserInteraction: true },
          isCircular: true,
          activeIndexes: 0,
          maxActivationLimit: false,
        });

        expect(activeList.active).toEqual(['a']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: true,
          duration: 200,
          hasBeenStoppedBefore: false,
        });
        expect(subscriber).toHaveBeenCalledTimes(0);

        jest.advanceTimersByTime(200);

        expect(activeList.active).toEqual(['a', 'b']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: true,
          duration: 200,
          hasBeenStoppedBefore: false,
        });
        assertEvents(subscriber, ['ACTIVATED']);

        activeList.deactivateByIndex(1, { isUserInteraction: true });

        expect(activeList.active).toEqual(['a']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: false,
          hasBeenStoppedBefore: true,
          duration: 0,
        });
        assertEvents(subscriber, [
          'ACTIVATED',
          'AUTO_PLAY_STOPPED',
          'DEACTIVATED',
        ]);

        // Should have no effect
        jest.advanceTimersByTime(200);

        expect(activeList.active).toEqual(['a']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: false,
          hasBeenStoppedBefore: true,
          duration: 0,
        });
        assertEvents(subscriber, [
          'ACTIVATED',
          'AUTO_PLAY_STOPPED',
          'DEACTIVATED',
        ]);
      });

      test('stop the autoPlay when stopsOnUserInteraction is true on deactivation, and isUserInteraction is undefined', () => {
        jest.useFakeTimers();

        const { activeList, subscriber } = setup({
          autoPlay: { duration: 200, stopsOnUserInteraction: true },
          isCircular: true,
          activeIndexes: 0,
          maxActivationLimit: false,
        });

        expect(activeList.active).toEqual(['a']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: true,
          duration: 200,
          hasBeenStoppedBefore: false,
        });
        expect(subscriber).toHaveBeenCalledTimes(0);

        jest.advanceTimersByTime(200);

        expect(activeList.active).toEqual(['a', 'b']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: true,
          duration: 200,
          hasBeenStoppedBefore: false,
        });
        assertEvents(subscriber, ['ACTIVATED']);

        // The `undefined` should default to `true`.
        activeList.deactivateByIndex(1, { isUserInteraction: undefined });

        expect(activeList.active).toEqual(['a']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: false,
          hasBeenStoppedBefore: true,
          duration: 0,
        });
        assertEvents(subscriber, [
          'ACTIVATED',
          'AUTO_PLAY_STOPPED',
          'DEACTIVATED',
        ]);

        // Should have no effect
        jest.advanceTimersByTime(200);

        expect(activeList.active).toEqual(['a']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: false,
          hasBeenStoppedBefore: true,
          duration: 0,
        });
        assertEvents(subscriber, [
          'ACTIVATED',
          'AUTO_PLAY_STOPPED',
          'DEACTIVATED',
        ]);
      });

      test('stop the autoPlay when stopsOnUserInteraction is true on deactivation, and isUserInteraction is undefined, via the cooldown', () => {
        jest.useFakeTimers();

        const { activeList, subscriber } = setup({
          autoPlay: { duration: 200, stopsOnUserInteraction: true },
          isCircular: true,
          activeIndexes: 0,
          maxActivationLimit: false,
        });

        expect(activeList.active).toEqual(['a']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: true,
          duration: 200,
          hasBeenStoppedBefore: false,
        });
        expect(subscriber).toHaveBeenCalledTimes(0);

        jest.advanceTimersByTime(200);

        expect(activeList.active).toEqual(['a', 'b']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: true,
          duration: 200,
          hasBeenStoppedBefore: false,
        });
        assertEvents(subscriber, ['ACTIVATED']);

        // The `undefined` for isUserInteraction should default to `true`.
        activeList.deactivateByIndex(1, { cooldown: 1000 });

        expect(activeList.active).toEqual(['a']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: false,
          hasBeenStoppedBefore: true,
          duration: 0,
        });
        expect(activeList.cooldown).toEqual({ isActive: true, duration: 1000 });
        assertEvents(subscriber, [
          'ACTIVATED',
          'AUTO_PLAY_STOPPED',
          'DEACTIVATED',
          'COOLDOWN_STARTED',
        ]);

        // Should have no effect
        jest.advanceTimersByTime(200);

        expect(activeList.active).toEqual(['a']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: false,
          hasBeenStoppedBefore: true,
          duration: 0,
        });
        expect(activeList.cooldown).toEqual({ isActive: true, duration: 1000 });
        assertEvents(subscriber, [
          'ACTIVATED',
          'AUTO_PLAY_STOPPED',
          'DEACTIVATED',
          'COOLDOWN_STARTED',
        ]);
      });

      test('when user interacts it should debounce when stopsOnUserInteraction is false', () => {
        jest.useFakeTimers();

        const { activeList, subscriber } = setup({
          autoPlay: { duration: 200 },
          isCircular: true,
          activeIndexes: 0,
        });

        // The active content should be 'a' at the start
        expect(activeList.active).toEqual(['a']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: true,
          duration: 200,
          hasBeenStoppedBefore: false,
        });
        expect(subscriber).toBeCalledTimes(0);

        // After 200 milliseconds it should become 'b'
        jest.advanceTimersByTime(200);

        expect(activeList.active).toEqual(['b']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: true,
          duration: 200,
          hasBeenStoppedBefore: false,
        });
        assertEvents(subscriber, ['ACTIVATED']);

        // We move the timer to just before it skips and trigger
        // a user action, it should move to 'c' but debounce the autoPlay
        jest.advanceTimersByTime(199);

        activeList.activateNext({ isUserInteraction: true });

        expect(activeList.active).toEqual(['c']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: true,
          duration: 200,
          hasBeenStoppedBefore: false,
        });
        assertEvents(subscriber, ['ACTIVATED', 'ACTIVATED']);

        // The autoPlay should now not trigger because it has been debounced
        jest.advanceTimersByTime(1);

        expect(activeList.active).toEqual(['c']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: true,
          duration: 200,
          hasBeenStoppedBefore: false,
        });
        assertEvents(subscriber, ['ACTIVATED', 'ACTIVATED']);

        // The autoPlay should still not have been triggered
        jest.advanceTimersByTime(198);

        expect(activeList.active).toEqual(['c']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: true,
          duration: 200,
          hasBeenStoppedBefore: false,
        });
        assertEvents(subscriber, ['ACTIVATED', 'ACTIVATED']);

        // The autoPlay now be triggered
        jest.advanceTimersByTime(1);

        expect(activeList.active).toEqual(['a']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: true,
          duration: 200,
          hasBeenStoppedBefore: false,
        });
        assertEvents(subscriber, ['ACTIVATED', 'ACTIVATED', 'ACTIVATED']);

        // A double debounce should work as well
        jest.advanceTimersByTime(199);
        activeList.activateNext({ isUserInteraction: true });

        expect(activeList.active).toEqual(['b']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: true,
          duration: 200,
          hasBeenStoppedBefore: false,
        });
        assertEvents(subscriber, [
          'ACTIVATED',
          'ACTIVATED',
          'ACTIVATED',
          'ACTIVATED',
        ]);

        // Trigger double debounce
        jest.advanceTimersByTime(199);
        activeList.activateNext({ isUserInteraction: true });

        expect(activeList.active).toEqual(['c']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: true,
          duration: 200,
          hasBeenStoppedBefore: false,
        });
        assertEvents(subscriber, [
          'ACTIVATED',
          'ACTIVATED',
          'ACTIVATED',
          'ACTIVATED',
          'ACTIVATED',
        ]);
      });
    });

    describe('automatically stops when', () => {
      test('that autoPlay stops when the contents are cleared via remove', () => {
        jest.useFakeTimers();

        const { activeList, subscriber } = setup({
          autoPlay: {
            duration: 200,
            stopsOnUserInteraction: false,
          },
          isCircular: true,
          activeIndexes: 0,
        });

        expect(activeList.active).toEqual(['a']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: true,
          duration: 200,
          hasBeenStoppedBefore: false,
        });
        expect(subscriber).toBeCalledTimes(0);

        jest.advanceTimersByTime(200);

        expect(activeList.active).toEqual(['b']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: true,
          duration: 200,
          hasBeenStoppedBefore: false,
        });
        assertEvents(subscriber, ['ACTIVATED']);

        // Now remove all content in between an duration's
        activeList.remove('a');
        activeList.remove('b');
        activeList.remove('c');

        expect(activeList.active).toEqual([]);
        expect(activeList.autoPlay).toEqual({
          isPlaying: false,
          hasBeenStoppedBefore: true,
          duration: 0,
        });
        assertEvents(subscriber, [
          'ACTIVATED',
          'REMOVED',
          'REMOVED',
          'AUTO_PLAY_STOPPED',
          'REMOVED',
        ]);

        // Now check if after the duration the state.active stays [].
        jest.advanceTimersByTime(200);

        expect(activeList.active).toEqual([]);
        expect(activeList.autoPlay).toEqual({
          isPlaying: false,
          hasBeenStoppedBefore: true,
          duration: 0,
        });
        assertEvents(subscriber, [
          'ACTIVATED',
          'REMOVED',
          'REMOVED',
          'AUTO_PLAY_STOPPED',
          'REMOVED',
        ]);
      });

      test('that autoPlay stops when the contents are cleared via removeByPredicate', () => {
        jest.useFakeTimers();

        const { activeList, subscriber } = setup({
          autoPlay: {
            duration: 200,
            stopsOnUserInteraction: false,
          },
          isCircular: true,
          activeIndexes: 0,
        });

        expect(activeList.active).toEqual(['a']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: true,
          duration: 200,
          hasBeenStoppedBefore: false,
        });
        expect(subscriber).toBeCalledTimes(0);

        jest.advanceTimersByTime(200);

        expect(activeList.active).toEqual(['b']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: true,
          duration: 200,
          hasBeenStoppedBefore: false,
        });
        assertEvents(subscriber, ['ACTIVATED']);

        // Now remove all content in between the duration
        activeList.removeByPredicate(() => true);

        expect(activeList.active).toEqual([]);
        expect(activeList.autoPlay).toEqual({
          isPlaying: false,
          hasBeenStoppedBefore: true,
          duration: 0,
        });
        assertEvents(subscriber, [
          'ACTIVATED',
          'AUTO_PLAY_STOPPED',
          'REMOVED_MULTIPLE',
        ]);

        // Now check if after the duration the state.active stays [].
        jest.advanceTimersByTime(200);

        expect(activeList.active).toEqual([]);
        expect(activeList.autoPlay).toEqual({
          isPlaying: false,
          hasBeenStoppedBefore: true,
          duration: 0,
        });
        assertEvents(subscriber, [
          'ACTIVATED',
          'AUTO_PLAY_STOPPED',
          'REMOVED_MULTIPLE',
        ]);
      });

      test('that autoPlay stops when there is no more active content via deactivateByIndex', () => {
        jest.useFakeTimers();

        const { activeList, subscriber } = setup({
          active: ['a'],
          maxActivationLimit: 1,
          autoPlay: { duration: 200 },
          isCircular: false,
        });

        expect(activeList.active).toEqual(['a']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: true,
          duration: 200,
          hasBeenStoppedBefore: false,
        });
        expect(subscriber).toBeCalledTimes(0);

        jest.advanceTimersByTime(200);

        expect(activeList.active).toEqual(['b']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: true,
          duration: 200,
          hasBeenStoppedBefore: false,
        });
        assertEvents(subscriber, ['ACTIVATED']);

        // Now deactivate all content
        activeList.deactivateByIndex(1);

        expect(activeList.active).toEqual([]);
        expect(activeList.autoPlay).toEqual({
          isPlaying: false,
          hasBeenStoppedBefore: true,
          duration: 0,
        });
        assertEvents(subscriber, [
          'ACTIVATED',
          'AUTO_PLAY_STOPPED',
          'DEACTIVATED',
        ]);

        // Nothing should become active no matter what
        jest.advanceTimersByTime(200);

        expect(activeList.active).toEqual([]);
        expect(activeList.autoPlay).toEqual({
          isPlaying: false,
          hasBeenStoppedBefore: true,
          duration: 0,
        });
        assertEvents(subscriber, [
          'ACTIVATED',
          'AUTO_PLAY_STOPPED',
          'DEACTIVATED',
        ]);

        jest.advanceTimersByTime(200);

        expect(activeList.active).toEqual([]);
        expect(activeList.autoPlay).toEqual({
          isPlaying: false,
          hasBeenStoppedBefore: true,
          duration: 0,
        });
        assertEvents(subscriber, [
          'ACTIVATED',
          'AUTO_PLAY_STOPPED',
          'DEACTIVATED',
        ]);

        jest.advanceTimersByTime(200);

        expect(activeList.active).toEqual([]);
        expect(activeList.autoPlay).toEqual({
          isPlaying: false,
          hasBeenStoppedBefore: true,
          duration: 0,
        });
        assertEvents(subscriber, [
          'ACTIVATED',
          'AUTO_PLAY_STOPPED',
          'DEACTIVATED',
        ]);
      });

      test('that autoPlay stops when there is no more active content via deactivateByPredicate', () => {
        jest.useFakeTimers();

        const { activeList, subscriber } = setup({
          active: ['a'],
          maxActivationLimit: 1,
          autoPlay: { duration: 200 },
          isCircular: false,
        });

        expect(activeList.active).toEqual(['a']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: true,
          duration: 200,
          hasBeenStoppedBefore: false,
        });
        expect(subscriber).toBeCalledTimes(0);

        jest.advanceTimersByTime(200);

        expect(activeList.active).toEqual(['b']);
        expect(activeList.autoPlay).toEqual({
          isPlaying: true,
          duration: 200,
          hasBeenStoppedBefore: false,
        });
        assertEvents(subscriber, ['ACTIVATED']);

        // Now deactivate all content
        activeList.deactivateByPredicate(() => true);

        expect(activeList.active).toEqual([]);
        expect(activeList.autoPlay).toEqual({
          isPlaying: false,
          hasBeenStoppedBefore: true,
          duration: 0,
        });
        // Once for 'b', Once for deactivate, once for stop
        expect(subscriber).toBeCalledTimes(3);
        assertEvents(subscriber, [
          'ACTIVATED',
          'AUTO_PLAY_STOPPED',
          'DEACTIVATED_MULTIPLE',
        ]);

        // Nothing should become active no matter what
        jest.advanceTimersByTime(200);

        expect(activeList.active).toEqual([]);
        expect(activeList.autoPlay).toEqual({
          isPlaying: false,
          hasBeenStoppedBefore: true,
          duration: 0,
        });
        assertEvents(subscriber, [
          'ACTIVATED',
          'AUTO_PLAY_STOPPED',
          'DEACTIVATED_MULTIPLE',
        ]);

        jest.advanceTimersByTime(200);

        expect(activeList.active).toEqual([]);
        expect(activeList.autoPlay).toEqual({
          isPlaying: false,
          hasBeenStoppedBefore: true,
          duration: 0,
        });
        assertEvents(subscriber, [
          'ACTIVATED',
          'AUTO_PLAY_STOPPED',
          'DEACTIVATED_MULTIPLE',
        ]);

        jest.advanceTimersByTime(200);

        expect(activeList.active).toEqual([]);
        expect(activeList.autoPlay).toEqual({
          isPlaying: false,
          hasBeenStoppedBefore: true,
          duration: 0,
        });
        assertEvents(subscriber, [
          'ACTIVATED',
          'AUTO_PLAY_STOPPED',
          'DEACTIVATED_MULTIPLE',
        ]);
      });
    });

    test('that the duration can be a function instead of just a number', () => {
      jest.useFakeTimers();

      const { activeList, subscriber } = setup({
        autoPlay: {
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

      expect(activeList.active).toEqual(['a']);
      expect(activeList.autoPlay).toEqual({
        isPlaying: true,
        duration: 100,
        hasBeenStoppedBefore: false,
      });
      expect(subscriber).toBeCalledTimes(0);

      jest.advanceTimersByTime(100);

      expect(activeList.active).toEqual(['b']);
      expect(activeList.autoPlay).toEqual({
        isPlaying: true,
        duration: 200,
        hasBeenStoppedBefore: false,
      });
      assertEvents(subscriber, ['ACTIVATED']);

      jest.advanceTimersByTime(200);

      expect(activeList.active).toEqual(['c']);
      expect(activeList.autoPlay).toEqual({
        isPlaying: true,
        duration: 300,
        hasBeenStoppedBefore: false,
      });
      assertEvents(subscriber, ['ACTIVATED', 'ACTIVATED']);

      jest.advanceTimersByTime(300);

      expect(activeList.active).toEqual(['a']);
      expect(activeList.autoPlay).toEqual({
        isPlaying: true,
        duration: 100,
        hasBeenStoppedBefore: false,
      });
      assertEvents(subscriber, ['ACTIVATED', 'ACTIVATED', 'ACTIVATED']);
    });

    test('that the autoPlay can be paused and continued', () => {
      jest.useFakeTimers();

      const { activeList, subscriber } = setup({
        autoPlay: { duration: 200 },
        isCircular: false,
        activeIndexes: 0,
      });

      // It should start with 'a' and be playing
      expect(activeList.active).toEqual(['a']);
      expect(activeList.autoPlay).toEqual({
        isPlaying: true,
        duration: 200,
        hasBeenStoppedBefore: false,
      });
      expect(subscriber).toBeCalledTimes(0);

      // After 200 seconds it should be on 'b'
      jest.advanceTimersByTime(200);

      expect(activeList.active).toEqual(['b']);
      expect(activeList.autoPlay).toEqual({
        isPlaying: true,
        duration: 200,
        hasBeenStoppedBefore: false,
      });
      assertEvents(subscriber, ['ACTIVATED']);

      // Now we advance the time to the half way point
      // between 'b' and 'c'.
      jest.advanceTimersByTime(100);

      expect(activeList.active).toEqual(['b']);
      expect(activeList.autoPlay).toEqual({
        isPlaying: true,
        duration: 200,
        hasBeenStoppedBefore: false,
      });
      assertEvents(subscriber, ['ACTIVATED']);

      // Now pause it at the half way.
      activeList.pause();

      expect(activeList.active).toEqual(['b']);
      expect(activeList.autoPlay).toEqual({
        isPlaying: false,
        hasBeenStoppedBefore: false,
        duration: 200,
      });
      assertEvents(subscriber, ['ACTIVATED', 'AUTO_PLAY_PAUSED']);

      // When paused advancing the time should do nothing.
      jest.advanceTimersByTime(100);

      expect(activeList.active).toEqual(['b']);
      expect(activeList.autoPlay).toEqual({
        isPlaying: false,
        hasBeenStoppedBefore: false,
        duration: 200,
      });
      assertEvents(subscriber, ['ACTIVATED', 'AUTO_PLAY_PAUSED']);

      // Even when advancing a huge amount of seconds, it should
      // stay paused no matter what.
      jest.advanceTimersByTime(10000);

      expect(activeList.active).toEqual(['b']);
      expect(activeList.autoPlay).toEqual({
        isPlaying: false,
        hasBeenStoppedBefore: false,
        duration: 200,
      });
      assertEvents(subscriber, ['ACTIVATED', 'AUTO_PLAY_PAUSED']);

      // Now press play, after 100 milliseconds it should have
      // continued.
      activeList.play();

      expect(activeList.active).toEqual(['b']);
      expect(activeList.autoPlay).toEqual({
        isPlaying: true,
        duration: 200,
        hasBeenStoppedBefore: false,
      });
      assertEvents(subscriber, [
        'ACTIVATED',
        'AUTO_PLAY_PAUSED',
        'AUTO_PLAY_PLAYING',
      ]);

      // After 80 milliseconds b should still be active though
      jest.advanceTimersByTime(80);

      expect(activeList.active).toEqual(['b']);
      expect(activeList.autoPlay).toEqual({
        isPlaying: true,
        duration: 200,
        hasBeenStoppedBefore: false,
      });
      assertEvents(subscriber, [
        'ACTIVATED',
        'AUTO_PLAY_PAUSED',
        'AUTO_PLAY_PLAYING',
      ]);

      // Finally after 20 milliseconds it should be 'c'
      jest.advanceTimersByTime(20);

      expect(activeList.active).toEqual(['c']);
      expect(activeList.autoPlay).toEqual({
        isPlaying: false,
        hasBeenStoppedBefore: true,
        duration: 0,
      });
      assertEvents(subscriber, [
        'ACTIVATED',
        'AUTO_PLAY_PAUSED',
        'AUTO_PLAY_PLAYING',
        'AUTO_PLAY_STOPPED',
        'ACTIVATED',
      ]);
    });

    test('that the autoPlay can be paused and continued multiple times', () => {
      jest.useFakeTimers();

      const { activeList, subscriber } = setup({
        autoPlay: { duration: 200 },
        isCircular: true,
        activeIndexes: 0,
      });

      // It should start with 'a' and be playing
      expect(activeList.active).toEqual(['a']);
      expect(activeList.autoPlay).toEqual({
        isPlaying: true,
        duration: 200,
        hasBeenStoppedBefore: false,
      });
      expect(subscriber).toBeCalledTimes(0);

      // After 200 seconds it should be on 'b'
      jest.advanceTimersByTime(200);

      expect(activeList.active).toEqual(['b']);
      expect(activeList.autoPlay).toEqual({
        isPlaying: true,
        duration: 200,
        hasBeenStoppedBefore: false,
      });
      assertEvents(subscriber, ['ACTIVATED']);

      // Now we advance the time to the half way point
      // between 'b' and 'c'.
      jest.advanceTimersByTime(100);

      expect(activeList.active).toEqual(['b']);
      expect(activeList.autoPlay).toEqual({
        isPlaying: true,
        duration: 200,
        hasBeenStoppedBefore: false,
      });
      assertEvents(subscriber, ['ACTIVATED']);

      // Now pause it at the half way.
      activeList.pause();

      expect(activeList.active).toEqual(['b']);
      expect(activeList.autoPlay).toEqual({
        isPlaying: false,
        hasBeenStoppedBefore: false,
        duration: 200,
      });
      assertEvents(subscriber, ['ACTIVATED', 'AUTO_PLAY_PAUSED']);

      // Should have no effect
      jest.advanceTimersByTime(10000);

      expect(activeList.active).toEqual(['b']);
      expect(activeList.autoPlay).toEqual({
        isPlaying: false,
        hasBeenStoppedBefore: false,
        duration: 200,
      });
      assertEvents(subscriber, ['ACTIVATED', 'AUTO_PLAY_PAUSED']);

      // Now press play, after 100 milliseconds it should have
      // continued.
      activeList.play();

      expect(activeList.active).toEqual(['b']);
      expect(activeList.autoPlay).toEqual({
        isPlaying: true,
        duration: 200,
        hasBeenStoppedBefore: false,
      });
      assertEvents(subscriber, [
        'ACTIVATED',
        'AUTO_PLAY_PAUSED',
        'AUTO_PLAY_PLAYING',
      ]);

      // After 100 milliseconds it should be 'c'
      jest.advanceTimersByTime(100);

      expect(activeList.active).toEqual(['c']);
      expect(activeList.autoPlay).toEqual({
        isPlaying: true,
        hasBeenStoppedBefore: false,
        duration: 200,
      });
      assertEvents(subscriber, [
        'ACTIVATED',
        'AUTO_PLAY_PAUSED',
        'AUTO_PLAY_PLAYING',
        'ACTIVATED',
      ]);

      // Now we advance the time to the quarter way point
      // between 'c' and 'a'.
      jest.advanceTimersByTime(50);

      // Now pause it at the quarter way point.
      activeList.pause();

      // Should have no effect
      jest.advanceTimersByTime(10000);

      expect(activeList.active).toEqual(['c']);
      expect(activeList.autoPlay).toEqual({
        isPlaying: false,
        hasBeenStoppedBefore: false,
        duration: 200,
      });
      assertEvents(subscriber, [
        'ACTIVATED',
        'AUTO_PLAY_PAUSED',
        'AUTO_PLAY_PLAYING',
        'ACTIVATED',
        'AUTO_PLAY_PAUSED',
      ]);

      // Now start playing again.
      activeList.play();

      // After 149 seconds it should still be on on 'c'
      jest.advanceTimersByTime(149);

      expect(activeList.active).toEqual(['c']);
      expect(activeList.autoPlay).toEqual({
        isPlaying: true,
        hasBeenStoppedBefore: false,
        duration: 200,
      });
      assertEvents(subscriber, [
        'ACTIVATED',
        'AUTO_PLAY_PAUSED',
        'AUTO_PLAY_PLAYING',
        'ACTIVATED',
        'AUTO_PLAY_PAUSED',
        'AUTO_PLAY_PLAYING',
      ]);

      // Now kick it over to a.
      jest.advanceTimersByTime(1);

      expect(activeList.active).toEqual(['a']);
      expect(activeList.autoPlay).toEqual({
        isPlaying: true,
        duration: 200,
        hasBeenStoppedBefore: false,
      });
      assertEvents(subscriber, [
        'ACTIVATED',
        'AUTO_PLAY_PAUSED',
        'AUTO_PLAY_PLAYING',
        'ACTIVATED',
        'AUTO_PLAY_PAUSED',
        'AUTO_PLAY_PLAYING',
        'ACTIVATED',
      ]);
    });

    test('that it is not possible to pause when already paused', () => {
      jest.useFakeTimers();

      const { activeList, subscriber } = setup({
        autoPlay: { duration: 200 },
        isCircular: false,
        activeIndexes: 0,
      });

      // It should start with 'a' and be playing
      expect(activeList.active).toEqual(['a']);
      expect(activeList.autoPlay).toEqual({
        isPlaying: true,
        duration: 200,
        hasBeenStoppedBefore: false,
      });
      expect(subscriber).toBeCalledTimes(0);

      // After 200 seconds it should be on 'b'
      jest.advanceTimersByTime(200);

      expect(activeList.active).toEqual(['b']);
      expect(activeList.autoPlay).toEqual({
        isPlaying: true,
        duration: 200,
        hasBeenStoppedBefore: false,
      });
      assertEvents(subscriber, ['ACTIVATED']);

      // Now we advance the time to the half way point
      // between 'b' and 'c'.
      jest.advanceTimersByTime(100);

      expect(activeList.active).toEqual(['b']);
      expect(activeList.autoPlay).toEqual({
        isPlaying: true,
        duration: 200,
        hasBeenStoppedBefore: false,
      });
      assertEvents(subscriber, ['ACTIVATED']);

      // Now pause it at the half way.
      activeList.pause();

      expect(activeList.active).toEqual(['b']);
      expect(activeList.autoPlay).toEqual({
        isPlaying: false,
        hasBeenStoppedBefore: false,
        duration: 200,
      });
      assertEvents(subscriber, ['ACTIVATED', 'AUTO_PLAY_PAUSED']);

      // Now advance the timer by a huge margin, and pause again, this
      // second pause should be ignored
      jest.advanceTimersByTime(10000);
      activeList.pause(); // <--- this pause should be ignored

      expect(activeList.active).toEqual(['b']);
      expect(activeList.autoPlay).toEqual({
        isPlaying: false,
        hasBeenStoppedBefore: false,
        duration: 200,
      });
      assertEvents(subscriber, ['ACTIVATED', 'AUTO_PLAY_PAUSED']);

      // Now press play, after 200 milliseconds it should have
      // continued.
      activeList.play();

      expect(activeList.active).toEqual(['b']);
      expect(activeList.autoPlay).toEqual({
        isPlaying: true,
        duration: 200,
        hasBeenStoppedBefore: false,
      });
      assertEvents(subscriber, [
        'ACTIVATED',
        'AUTO_PLAY_PAUSED',
        'AUTO_PLAY_PLAYING',
      ]);

      // After 99 milliseconds b should still be active though
      jest.advanceTimersByTime(99);

      expect(activeList.active).toEqual(['b']);
      expect(activeList.autoPlay).toEqual({
        isPlaying: true,
        duration: 200,
        hasBeenStoppedBefore: false,
      });
      assertEvents(subscriber, [
        'ACTIVATED',
        'AUTO_PLAY_PAUSED',
        'AUTO_PLAY_PLAYING',
      ]);

      // Finally after 1 milliseconds it should be 'c'
      jest.advanceTimersByTime(1);
      expect(activeList.active).toEqual(['c']);
      expect(activeList.autoPlay).toEqual({
        isPlaying: false,
        hasBeenStoppedBefore: true,
        duration: 0,
      });
      assertEvents(subscriber, [
        'ACTIVATED',
        'AUTO_PLAY_PAUSED',
        'AUTO_PLAY_PLAYING',
        'AUTO_PLAY_STOPPED',
        'ACTIVATED',
      ]);
    });

    test('that it is possible to pause when never playing', () => {
      jest.useFakeTimers();

      const { activeList, subscriber } = setup({
        isCircular: false,
        activeIndexes: 0,
      });

      // It should start with 'a' and not be playing
      expect(activeList.active).toEqual(['a']);
      expect(activeList.autoPlay).toEqual({
        isPlaying: false,
        duration: 0,
        hasBeenStoppedBefore: false,
      });
      expect(subscriber).toBeCalledTimes(0);

      // Should do nothing
      activeList.pause();

      expect(activeList.active).toEqual(['a']);
      expect(activeList.autoPlay).toEqual({
        isPlaying: false,
        duration: 0,
        hasBeenStoppedBefore: false,
      });
      assertEvents(subscriber, []);
    });

    test('that the autoPlay can be stopped and restarted', () => {
      jest.useFakeTimers();

      const { activeList, subscriber } = setup({
        autoPlay: { duration: 200 },
        isCircular: false,
        activeIndexes: 0,
      });

      // It should start with 'a' and be playing
      expect(activeList.active).toEqual(['a']);
      expect(activeList.autoPlay).toEqual({
        isPlaying: true,
        duration: 200,
        hasBeenStoppedBefore: false,
      });
      expect(subscriber).toBeCalledTimes(0);

      // After 200 seconds it should be on 'b'
      jest.advanceTimersByTime(200);

      expect(activeList.active).toEqual(['b']);
      expect(activeList.autoPlay).toEqual({
        isPlaying: true,
        duration: 200,
        hasBeenStoppedBefore: false,
      });
      assertEvents(subscriber, ['ACTIVATED']);

      // Now we advance the time to the half way point
      // between 'b' and 'c'.
      jest.advanceTimersByTime(100);

      expect(activeList.active).toEqual(['b']);
      expect(activeList.autoPlay).toEqual({
        isPlaying: true,
        duration: 200,
        hasBeenStoppedBefore: false,
      });
      assertEvents(subscriber, ['ACTIVATED']);

      // Now stop it at the half way, this should be forgotten
      // because stop is not the same as pause.
      activeList.stop();

      expect(activeList.active).toEqual(['b']);
      expect(activeList.autoPlay).toEqual({
        isPlaying: false,
        hasBeenStoppedBefore: true,
        duration: 0,
      });
      assertEvents(subscriber, ['ACTIVATED', 'AUTO_PLAY_STOPPED']);

      // When stopped advancing the time should do nothing.
      jest.advanceTimersByTime(100);

      expect(activeList.active).toEqual(['b']);
      expect(activeList.autoPlay).toEqual({
        isPlaying: false,
        hasBeenStoppedBefore: true,
        duration: 0,
      });
      assertEvents(subscriber, ['ACTIVATED', 'AUTO_PLAY_STOPPED']);

      // Even when advancing a huge amount of seconds, it should
      // stay stopped no matter what.
      jest.advanceTimersByTime(10000);

      expect(activeList.active).toEqual(['b']);
      expect(activeList.autoPlay).toEqual({
        isPlaying: false,
        hasBeenStoppedBefore: true,
        duration: 0,
      });
      assertEvents(subscriber, ['ACTIVATED', 'AUTO_PLAY_STOPPED']);

      // Now press play, after 100 milliseconds it should have
      // continued.
      activeList.play();

      expect(activeList.active).toEqual(['b']);
      expect(activeList.autoPlay).toEqual({
        isPlaying: true,
        duration: 200,
        hasBeenStoppedBefore: true,
      });
      assertEvents(subscriber, [
        'ACTIVATED',
        'AUTO_PLAY_STOPPED',
        'AUTO_PLAY_PLAYING',
      ]);

      // After 100 milliseconds b should still be inactive because
      // stopping is not the same as pausing.
      jest.advanceTimersByTime(100);

      expect(activeList.active).toEqual(['b']);
      expect(activeList.autoPlay).toEqual({
        isPlaying: true,
        duration: 200,
        hasBeenStoppedBefore: true,
      });
      assertEvents(subscriber, [
        'ACTIVATED',
        'AUTO_PLAY_STOPPED',
        'AUTO_PLAY_PLAYING',
      ]);

      // Finally after 100 milliseconds it should be 'c', because
      // that is the time it takes after a stop 100 + 100 = 200.
      jest.advanceTimersByTime(100);

      expect(activeList.active).toEqual(['c']);
      expect(activeList.autoPlay).toEqual({
        isPlaying: false,
        hasBeenStoppedBefore: true,
        duration: 0,
      });

      assertEvents(subscriber, [
        'ACTIVATED',
        'AUTO_PLAY_STOPPED',
        'AUTO_PLAY_PLAYING',
        'AUTO_PLAY_STOPPED',
        'ACTIVATED',
      ]);
    });

    test('that it is not possible to stop when already stopped', () => {
      jest.useFakeTimers();

      const { activeList, subscriber } = setup({
        autoPlay: { duration: 200 },
        isCircular: false,
        activeIndexes: 0,
      });

      // It should start with 'a' and be playing
      expect(activeList.active).toEqual(['a']);
      expect(activeList.autoPlay).toEqual({
        isPlaying: true,
        duration: 200,
        hasBeenStoppedBefore: false,
      });
      expect(subscriber).toBeCalledTimes(0);

      activeList.stop();

      expect(activeList.active).toEqual(['a']);
      expect(activeList.autoPlay).toEqual({
        isPlaying: false,
        hasBeenStoppedBefore: true,
        duration: 0,
      });
      assertEvents(subscriber, ['AUTO_PLAY_STOPPED']);

      // This stop should be ignored
      activeList.stop();

      expect(activeList.active).toEqual(['a']);
      expect(activeList.autoPlay).toEqual({
        isPlaying: false,
        hasBeenStoppedBefore: true,
        duration: 0,
      });
      assertEvents(subscriber, ['AUTO_PLAY_STOPPED']);
    });

    test('that it is not possible to stop when never playing', () => {
      jest.useFakeTimers();

      const { activeList, subscriber } = setup({
        isCircular: false,
        activeIndexes: 0,
      });

      // It should start with 'a' and be stopped
      expect(activeList.active).toEqual(['a']);
      expect(activeList.autoPlay).toEqual({
        isPlaying: false,
        duration: 0,
        hasBeenStoppedBefore: false,
      });
      expect(subscriber).toBeCalledTimes(0);

      // Should do nothing
      activeList.stop();

      expect(activeList.active).toEqual(['a']);
      expect(activeList.autoPlay).toEqual({
        isPlaying: false,
        hasBeenStoppedBefore: false,
        duration: 0,
      });
      assertEvents(subscriber, []);
    });

    test('that it is possible to pause first then stop', () => {
      jest.useFakeTimers();

      const { activeList, subscriber } = setup({
        autoPlay: { duration: 200 },
        isCircular: false,
        activeIndexes: 0,
      });

      // It should start with 'a' and be playing
      expect(activeList.active).toEqual(['a']);
      expect(activeList.autoPlay).toEqual({
        isPlaying: true,
        duration: 200,
        hasBeenStoppedBefore: false,
      });
      expect(subscriber).toBeCalledTimes(0);

      activeList.pause();

      expect(activeList.active).toEqual(['a']);
      expect(activeList.autoPlay).toEqual({
        isPlaying: false,
        hasBeenStoppedBefore: false,
        duration: 200,
      });
      assertEvents(subscriber, ['AUTO_PLAY_PAUSED']);

      activeList.stop();

      expect(activeList.active).toEqual(['a']);
      expect(activeList.autoPlay).toEqual({
        isPlaying: false,
        hasBeenStoppedBefore: true,
        duration: 0,
      });
      assertEvents(subscriber, ['AUTO_PLAY_PAUSED', 'AUTO_PLAY_STOPPED']);
    });
  });

  describe('cooldown', () => {
    describe('errors', () => {
      describe('cooldown errors on initialize', () => {
        test('cannot be less than zero', () => {
          expect(() => {
            setup({ cooldown: -1, activeIndexes: 0 });
          }).toThrowError(
            'uiloos > ActiveList > cooldown > duration cannot be negative or zero'
          );

          expect(() => {
            setup({ cooldown: -1, activeIndexes: 0 });
          }).toThrowError(ActiveListCooldownDurationError);
        });

        test('cannot be zero', () => {
          expect(() => {
            setup({ cooldown: 0, activeIndexes: 0 });
          }).toThrowError(
            'uiloos > ActiveList > cooldown > duration cannot be negative or zero'
          );

          expect(() => {
            setup({ cooldown: 0, activeIndexes: 0 });
          }).toThrowError(ActiveListCooldownDurationError);
        });
      });

      describe('cooldown errors on activateByIndex', () => {
        test('cannot be less than zero', () => {
          const { activeList } = setup({ cooldown: 600, activeIndexes: 0 });

          expect(() => {
            activeList.activateByIndex(1, {
              isUserInteraction: true,
              cooldown: -1,
            });
          }).toThrowError(
            'uiloos > ActiveList > cooldown > duration cannot be negative or zero'
          );

          // It still has performed the action unfortunately, and the ActiveList is now invalid.
          expect(activeList.lastActivatedIndex).toBe(1);

          expect(() => {
            activeList.activateByIndex(0, {
              isUserInteraction: true,
              cooldown: -1,
            });
          }).toThrowError(ActiveListCooldownDurationError);

          // It still has performed the action unfortunately, and the ActiveList is now invalid.
          expect(activeList.lastActivatedIndex).toBe(0);
        });

        test('cannot be zero', () => {
          const { activeList } = setup({ cooldown: 600, activeIndexes: 0 });

          expect(() => {
            activeList.activateByIndex(1, {
              isUserInteraction: true,
              cooldown: 0,
            });
          }).toThrowError(
            'uiloos > ActiveList > cooldown > duration cannot be negative or zero'
          );

          // It still has performed the action unfortunately, and the ActiveList is now invalid.
          expect(activeList.lastActivatedIndex).toBe(1);

          expect(() => {
            activeList.activateByIndex(0, {
              isUserInteraction: true,
              cooldown: 0,
            });
          }).toThrowError(ActiveListCooldownDurationError);

          // It still has performed the action unfortunately, and the ActiveList is now invalid.
          expect(activeList.lastActivatedIndex).toBe(0);
        });
      });

      describe('cooldown errors on activateByPredicate', () => {
        test('cannot be less than zero', () => {
          const { activeList } = setup({
            cooldown: 600,
            activeIndexes: [],
            maxActivationLimit: 3,
          });

          expect(() => {
            activeList.activateByPredicate(() => true, {
              isUserInteraction: true,
              cooldown: -1,
            });
          }).toThrowError(
            'uiloos > ActiveList > cooldown > duration cannot be negative or zero'
          );

          // It still has performed the action unfortunately, and the ActiveList is now invalid.
          expect(activeList.activeIndexes).toEqual([0, 1, 2]);

          // DeAtivate one so something can be deactivated
          activeList.deactivateByIndex(0, { isUserInteraction: false });

          expect(() => {
            activeList.activateByPredicate(() => true, {
              isUserInteraction: true,
              cooldown: -1,
            });
          }).toThrowError(ActiveListCooldownDurationError);

          // It still has performed the action unfortunately, and the ActiveList is now invalid.
          expect(activeList.activeIndexes).toEqual([1, 2, 0]);
        });

        test('cannot be zero', () => {
          const { activeList } = setup({
            cooldown: 600,
            activeIndexes: [],
            maxActivationLimit: 3,
          });

          expect(() => {
            activeList.activateByPredicate(() => true, {
              isUserInteraction: true,
              cooldown: 0,
            });
          }).toThrowError(
            'uiloos > ActiveList > cooldown > duration cannot be negative or zero'
          );

          // It still has performed the action unfortunately, and the ActiveList is now invalid.
          expect(activeList.activeIndexes).toEqual([0, 1, 2]);

          // Deactivate one so something can be deactivated
          activeList.deactivateByIndex(0, { isUserInteraction: false });

          expect(() => {
            activeList.activateByPredicate(() => true, {
              isUserInteraction: true,
              cooldown: 0,
            });
          }).toThrowError(ActiveListCooldownDurationError);

          // It still has performed the action unfortunately, and the ActiveList is now invalid.
          expect(activeList.activeIndexes).toEqual([1, 2, 0]);
        });
      });

      describe('cooldown errors on deactivateByIndex', () => {
        test('cannot be less than zero', () => {
          const { activeList } = setup({
            cooldown: 600,
            activeIndexes: [0, 1],
            maxActivationLimit: 3,
          });

          expect(() => {
            activeList.deactivateByIndex(0, {
              isUserInteraction: true,
              cooldown: -1,
            });
          }).toThrowError(
            'uiloos > ActiveList > cooldown > duration cannot be negative or zero'
          );

          // It still has performed the action unfortunately, and the ActiveList is now invalid.
          expect(activeList.activeIndexes).toEqual([1]);

          expect(() => {
            activeList.deactivateByIndex(1, {
              isUserInteraction: true,
              cooldown: -1,
            });
          }).toThrowError(ActiveListCooldownDurationError);

          // It still has performed the action unfortunately, and the ActiveList is now invalid.
          expect(activeList.activeIndexes).toEqual([]);
        });

        test('cannot be zero', () => {
          const { activeList } = setup({
            cooldown: 600,
            activeIndexes: [0, 1],
            maxActivationLimit: 3,
          });

          expect(() => {
            activeList.deactivateByIndex(0, {
              isUserInteraction: true,
              cooldown: 0,
            });
          }).toThrowError(
            'uiloos > ActiveList > cooldown > duration cannot be negative or zero'
          );

          // It still has performed the action unfortunately, and the ActiveList is now invalid.
          expect(activeList.activeIndexes).toEqual([1]);

          expect(() => {
            activeList.deactivateByIndex(1, {
              isUserInteraction: true,
              cooldown: 0,
            });
          }).toThrowError(ActiveListCooldownDurationError);

          // It still has performed the action unfortunately, and the ActiveList is now invalid.
          expect(activeList.activeIndexes).toEqual([]);
        });
      });

      describe('cooldown errors on deactivateByPredicate', () => {
        test('cannot be less than zero', () => {
          const { activeList } = setup({
            cooldown: 600,
            activeIndexes: [0, 1],
            maxActivationLimit: 3,
          });

          expect(() => {
            activeList.deactivateByPredicate(() => true, {
              isUserInteraction: true,
              cooldown: -1,
            });
          }).toThrowError(
            'uiloos > ActiveList > cooldown > duration cannot be negative or zero'
          );

          // It still has performed the action unfortunately, and the ActiveList is now invalid.
          expect(activeList.activeIndexes).toEqual([]);

          // Activate one so something can be deactivated
          activeList.activateByIndex(0, { isUserInteraction: false });

          expect(() => {
            activeList.deactivateByPredicate(() => true, {
              isUserInteraction: true,
              cooldown: -1,
            });
          }).toThrowError(ActiveListCooldownDurationError);

          // It still has performed the action unfortunately, and the ActiveList is now invalid.
          expect(activeList.activeIndexes).toEqual([]);
        });

        test('cannot be zero', () => {
          const { activeList } = setup({
            cooldown: 600,
            activeIndexes: [0, 1],
            maxActivationLimit: 3,
          });

          expect(() => {
            activeList.deactivateByPredicate(() => true, {
              isUserInteraction: true,
              cooldown: 0,
            });
          }).toThrowError(
            'uiloos > ActiveList > cooldown > duration cannot be negative or zero'
          );

          // It still has performed the action unfortunately, and the ActiveList is now invalid.
          expect(activeList.activeIndexes).toEqual([]);

          // Activate one so something can be deactivated
          activeList.activateByIndex(0, { isUserInteraction: false });

          expect(() => {
            activeList.deactivateByPredicate(() => true, {
              isUserInteraction: true,
              cooldown: 0,
            });
          }).toThrowError(ActiveListCooldownDurationError);

          // It still has performed the action unfortunately, and the ActiveList is now invalid.
          expect(activeList.activeIndexes).toEqual([]);
        });
      });
    });

    test('a cooldown is ignored when isUserInteraction is false', () => {
      jest.useFakeTimers();

      const { activeList, subscriber } = setup({
        cooldown: 5000,
        maxActivationLimit: false,
        activeIndexes: [],
      });

      expect(activeList.active).toEqual([]);
      expect(activeList.cooldown).toEqual({ isActive: false, duration: 0 });
      assertEvents(subscriber, []);

      // Set the cooldown by calling activateByIndex
      activeList.activateByIndex(0);

      expect(activeList.active).toEqual(['a']);
      expect(activeList.cooldown).toEqual({ isActive: true, duration: 5000 });
      assertEvents(subscriber, ['ACTIVATED', 'COOLDOWN_STARTED']);

      // This call should ignore it the cooldown due to isUserInteraction being false.
      activeList.activateByIndex(1, { isUserInteraction: false });

      expect(activeList.active).toEqual(['a', 'b']);
      expect(activeList.cooldown).toEqual({ isActive: true, duration: 5000 });
      assertEvents(subscriber, ['ACTIVATED', 'COOLDOWN_STARTED', 'ACTIVATED']);

      // This call should ignore it the cooldown due to isUserInteraction being false.
      activeList.deactivateByIndex(0, { isUserInteraction: false });

      expect(activeList.active).toEqual(['b']);
      expect(activeList.cooldown).toEqual({ isActive: true, duration: 5000 });
      assertEvents(subscriber, [
        'ACTIVATED',
        'COOLDOWN_STARTED',
        'ACTIVATED',
        'DEACTIVATED',
      ]);

      // This call should ignore it the cooldown due to isUserInteraction being false.
      activeList.activateByIndex(2, { isUserInteraction: false });

      expect(activeList.active).toEqual(['b', 'c']);
      expect(activeList.cooldown).toEqual({ isActive: true, duration: 5000 });
      assertEvents(subscriber, [
        'ACTIVATED',
        'COOLDOWN_STARTED',
        'ACTIVATED',
        'DEACTIVATED',
        'ACTIVATED',
      ]);
    });

    test('a cooldown from the config', () => {
      jest.useFakeTimers();

      const { activeList, subscriber } = setup({
        cooldown: 5000,
        activeIndexes: [],
      });

      expect(activeList.active).toEqual([]);
      expect(activeList.cooldown).toEqual({ isActive: false, duration: 0 });
      assertEvents(subscriber, []);

      // Set the cooldown by calling activateByIndex
      activeList.activateByIndex(0);

      expect(activeList.active).toEqual(['a']);
      expect(activeList.cooldown).toEqual({ isActive: true, duration: 5000 });
      assertEvents(subscriber, ['ACTIVATED', 'COOLDOWN_STARTED']);

      // Should stay on 'a'
      activeList.activateByIndex(1);

      expect(activeList.active).toEqual(['a']);
      expect(activeList.cooldown).toEqual({ isActive: true, duration: 5000 });
      assertEvents(subscriber, ['ACTIVATED', 'COOLDOWN_STARTED']);

      // Should stay on 'a'
      jest.advanceTimersByTime(4999);
      activeList.activateByIndex(1);

      expect(activeList.active).toEqual(['a']);
      expect(activeList.cooldown).toEqual({ isActive: true, duration: 5000 });
      assertEvents(subscriber, ['ACTIVATED', 'COOLDOWN_STARTED']);

      // Now it should be able to go to 'b' after 5000 milliseconds
      jest.advanceTimersByTime(1);
      expect(activeList.cooldown).toEqual({ isActive: false, duration: 0 });
      assertEvents(subscriber, [
        'ACTIVATED',
        'COOLDOWN_STARTED',
        'COOLDOWN_ENDED',
      ]);

      activeList.activateByIndex(1);
      expect(activeList.active).toEqual(['b']);
      expect(activeList.cooldown).toEqual({ isActive: true, duration: 5000 });
      assertEvents(subscriber, [
        'ACTIVATED',
        'COOLDOWN_STARTED',
        'COOLDOWN_ENDED',
        'ACTIVATED',
        'COOLDOWN_STARTED',
      ]);
    });

    test('a cooldown from options', () => {
      jest.useFakeTimers();

      const { activeList, subscriber } = setup({ activeIndexes: [] });

      expect(activeList.active).toEqual([]);
      expect(activeList.cooldown).toEqual({ isActive: false, duration: 0 });
      assertEvents(subscriber, []);

      // Activate 'a' and set a cooldown to 5000
      activeList.activateByIndex(0, {
        isUserInteraction: true,
        cooldown: 5000,
      });

      expect(activeList.active).toEqual(['a']);
      expect(activeList.cooldown).toEqual({ isActive: true, duration: 5000 });
      assertEvents(subscriber, ['ACTIVATED', 'COOLDOWN_STARTED']);

      jest.advanceTimersByTime(4999);

      // Should still be ['a']
      activeList.activateByIndex(1, {
        isUserInteraction: true,
        // In essence this cooldown is ignored, because it is never set
        cooldown: () => 100,
      });

      expect(activeList.active).toEqual(['a']);
      expect(activeList.cooldown).toEqual({ isActive: true, duration: 5000 });
      assertEvents(subscriber, ['ACTIVATED', 'COOLDOWN_STARTED']);

      // Should still be ['a']
      activeList.deactivateByIndex(0, {
        isUserInteraction: true,
        // In essence this cooldown is ignored, because it is never set
        cooldown: () => 100,
      });

      expect(activeList.active).toEqual(['a']);
      expect(activeList.cooldown).toEqual({ isActive: true, duration: 5000 });
      assertEvents(subscriber, ['ACTIVATED', 'COOLDOWN_STARTED']);

      // Now it can go to 'b' after 5000 milliseconds
      jest.advanceTimersByTime(1);

      expect(activeList.cooldown).toEqual({ isActive: false, duration: 0 });
      assertEvents(subscriber, [
        'ACTIVATED',
        'COOLDOWN_STARTED',
        'COOLDOWN_ENDED',
      ]);

      activeList.activateByIndex(1, {
        isUserInteraction: true,
        cooldown: 5000,
      });

      expect(activeList.active).toEqual(['b']);
      expect(activeList.cooldown).toEqual({ isActive: true, duration: 5000 });
      assertEvents(subscriber, [
        'ACTIVATED',
        'COOLDOWN_STARTED',
        'COOLDOWN_ENDED',
        'ACTIVATED',
        'COOLDOWN_STARTED',
      ]);
    });

    test('that the cooldown from the ActivationOptions has precedence over the cooldown from the config', () => {
      jest.useFakeTimers();

      // This cooldown of 5000 should be ignored, because it is
      // from the initialize
      const { activeList, subscriber } = setup({
        cooldown: 5000,
        activeIndexes: [],
      });

      expect(activeList.active).toEqual([]);
      expect(activeList.cooldown).toEqual({ isActive: false, duration: 0 });
      assertEvents(subscriber, []);

      // This cooldown of 10000 should trump the one of 5000
      activeList.activateByIndex(0, {
        isUserInteraction: true,
        cooldown: 10000,
      });

      expect(activeList.active).toEqual(['a']);
      expect(activeList.cooldown).toEqual({
        isActive: true,
        duration: 10000,
      });
      assertEvents(subscriber, ['ACTIVATED', 'COOLDOWN_STARTED']);
    });

    test('that the cooldown can be a function instead of just a number', () => {
      jest.useFakeTimers();

      expect.assertions(14);

      const { activeList, subscriber } = setup({
        cooldown: (data) => {
          expect(data.index).toBe(0);

          expect(data.content).toBeDefined();
          expect(data.content).toBeInstanceOf(ActiveListContent);

          expect(data.value).toBe('a');

          expect(data.activeList).toBeDefined();
          expect(data.activeList).toBeInstanceOf(ActiveList);
          return 1234;
        },
        activeIndexes: [],
      });

      expect(activeList.active).toEqual([]);
      expect(activeList.cooldown).toEqual({ isActive: false, duration: 0 });
      assertEvents(subscriber, []);

      // Set the cooldown by calling activateByIndex
      activeList.activateByIndex(0);

      expect(activeList.active).toEqual(['a']);
      expect(activeList.cooldown).toEqual({ isActive: true, duration: 1234 });
      assertEvents(subscriber, ['ACTIVATED', 'COOLDOWN_STARTED']);
    });

    test('that when isUserInteraction is undefined it is treated as true', () => {
      jest.useFakeTimers();

      const { activeList, subscriber } = setup({ activeIndexes: [] });

      expect(activeList.active).toEqual([]);
      expect(activeList.cooldown).toEqual({ isActive: false, duration: 0 });
      assertEvents(subscriber, []);

      // Activate 'a' and set a cooldown to 5000
      activeList.activateByIndex(0, {
        cooldown: 5000,
      });

      expect(activeList.active).toEqual(['a']);
      expect(activeList.cooldown).toEqual({ isActive: true, duration: 5000 });
      assertEvents(subscriber, ['ACTIVATED', 'COOLDOWN_STARTED']);

      jest.advanceTimersByTime(4999);

      // Should still be ['a']
      activeList.activateByIndex(1, {
        // In essence this cooldown is ignored, because it is never set
        cooldown: () => 100,
      });

      expect(activeList.active).toEqual(['a']);
      expect(activeList.cooldown).toEqual({ isActive: true, duration: 5000 });
      assertEvents(subscriber, ['ACTIVATED', 'COOLDOWN_STARTED']);

      // Should still be ['a']
      activeList.deactivateByIndex(0, {
        // In essence this cooldown is ignored, because it is never set
        cooldown: () => 100,
      });

      expect(activeList.active).toEqual(['a']);
      expect(activeList.cooldown).toEqual({ isActive: true, duration: 5000 });
      assertEvents(subscriber, ['ACTIVATED', 'COOLDOWN_STARTED']);

      // Now it can go to 'b' after 5000 milliseconds
      jest.advanceTimersByTime(1);

      expect(activeList.cooldown).toEqual({ isActive: false, duration: 0 });
      assertEvents(subscriber, [
        'ACTIVATED',
        'COOLDOWN_STARTED',
        'COOLDOWN_ENDED',
      ]);

      activeList.activateByIndex(1, {
        cooldown: 5000,
      });

      expect(activeList.active).toEqual(['b']);
      expect(activeList.cooldown).toEqual({ isActive: true, duration: 5000 });
      assertEvents(subscriber, [
        'ACTIVATED',
        'COOLDOWN_STARTED',
        'COOLDOWN_ENDED',
        'ACTIVATED',
        'COOLDOWN_STARTED',
      ]);
    });
  });

  describe('history', () => {
    test('that a correct history is kept for all events', () => {
      jest.useFakeTimers();

      const { activeList } = setup({
        keepHistoryFor: 100,
        activeIndexes: 0,
      });

      expect(activeList.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
          indexes: [0],
          values: ['a'],
        }),
      ]);

      activeList.activateByIndex(1);
      expect(activeList.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
          indexes: [0],
          values: ['a'],
        }),
        expect.objectContaining({ type: 'ACTIVATED', index: 1, value: 'b' }),
      ]);

      activeList.removeByIndex(0);
      expect(activeList.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
          indexes: [0],
          values: ['a'],
        }),
        expect.objectContaining({ type: 'ACTIVATED', index: 1, value: 'b' }),
        expect.objectContaining({ type: 'REMOVED', index: 0, value: 'a' }),
      ]);

      // Sanity check
      expect(activeList.contents.map((c) => c.value)).toEqual(['b', 'c']);

      activeList.removeByPredicate(() => true);
      expect(activeList.history).toEqual([
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

      activeList.insertAtIndex('a', 0);
      activeList.activateByIndex(0);

      expect(activeList.history).toEqual([
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

      activeList.insertAtIndex('b', 1);
      activeList.insertAtIndex('c', 2);

      expect(activeList.history).toEqual([
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
      expect(activeList.contents.map((c) => c.value)).toEqual(['a', 'b', 'c']);

      activeList.swapByIndex(0, 2);
      expect(activeList.history).toEqual([
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

      activeList.moveByIndex(2, 0);
      expect(activeList.history).toEqual([
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

      activeList.deactivateByIndex(0);
      expect(activeList.history).toEqual([
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

      activeList.activateByPredicate(() => true);
      expect(activeList.history).toEqual([
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
        expect.objectContaining({
          type: 'ACTIVATED_MULTIPLE',
          indexes: [2],
          values: ['b'],
          deactivatedIndexes: [],
          deactivatedValues: [],
        }),
      ]);

      activeList.configureAutoPlay({ duration: 1000 });
      expect(activeList.history).toEqual([
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
        expect.objectContaining({
          type: 'ACTIVATED_MULTIPLE',
          indexes: [2],
          values: ['b'],
          deactivatedIndexes: [],
          deactivatedValues: [],
        }),
        expect.objectContaining({
          type: 'AUTO_PLAY_PLAYING',
        }),
      ]);

      activeList.pause();
      expect(activeList.history).toEqual([
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
        expect.objectContaining({
          type: 'ACTIVATED_MULTIPLE',
          indexes: [2],
          values: ['b'],
          deactivatedIndexes: [],
          deactivatedValues: [],
        }),
        expect.objectContaining({
          type: 'AUTO_PLAY_PLAYING',
        }),
        expect.objectContaining({
          type: 'AUTO_PLAY_PAUSED',
        }),
      ]);

      activeList.stop();
      expect(activeList.history).toEqual([
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
        expect.objectContaining({
          type: 'ACTIVATED_MULTIPLE',
          indexes: [2],
          values: ['b'],
          deactivatedIndexes: [],
          deactivatedValues: [],
        }),
        expect.objectContaining({
          type: 'AUTO_PLAY_PLAYING',
        }),
        expect.objectContaining({
          type: 'AUTO_PLAY_PAUSED',
        }),
        expect.objectContaining({
          type: 'AUTO_PLAY_STOPPED',
        }),
      ]);

      activeList.activateByIndex(0, { cooldown: 1, isUserInteraction: true });
      expect(activeList.history).toEqual([
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
        expect.objectContaining({
          type: 'ACTIVATED_MULTIPLE',
          indexes: [2],
          values: ['b'],
          deactivatedIndexes: [],
          deactivatedValues: [],
        }),
        expect.objectContaining({
          type: 'AUTO_PLAY_PLAYING',
        }),
        expect.objectContaining({
          type: 'AUTO_PLAY_PAUSED',
        }),
        expect.objectContaining({
          type: 'AUTO_PLAY_STOPPED',
        }),
        expect.objectContaining({ type: 'ACTIVATED', index: 0, value: 'a' }),
        expect.objectContaining({
          type: 'COOLDOWN_STARTED',
        }),
      ]);

      jest.advanceTimersByTime(1);

      expect(activeList.history).toEqual([
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
        expect.objectContaining({
          type: 'ACTIVATED_MULTIPLE',
          indexes: [2],
          values: ['b'],
          deactivatedIndexes: [],
          deactivatedValues: [],
        }),
        expect.objectContaining({
          type: 'AUTO_PLAY_PLAYING',
        }),
        expect.objectContaining({
          type: 'AUTO_PLAY_PAUSED',
        }),
        expect.objectContaining({
          type: 'AUTO_PLAY_STOPPED',
        }),
        expect.objectContaining({ type: 'ACTIVATED', index: 0, value: 'a' }),
        expect.objectContaining({
          type: 'COOLDOWN_STARTED',
        }),
        expect.objectContaining({
          type: 'COOLDOWN_ENDED',
        }),
      ]);

      activeList.deactivateByPredicate(() => true);

      expect(activeList.history).toEqual([
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
        expect.objectContaining({
          type: 'ACTIVATED_MULTIPLE',
          indexes: [2],
          values: ['b'],
          deactivatedIndexes: [],
          deactivatedValues: [],
        }),
        expect.objectContaining({
          type: 'AUTO_PLAY_PLAYING',
        }),
        expect.objectContaining({
          type: 'AUTO_PLAY_PAUSED',
        }),
        expect.objectContaining({
          type: 'AUTO_PLAY_STOPPED',
        }),
        expect.objectContaining({ type: 'ACTIVATED', index: 0, value: 'a' }),
        expect.objectContaining({
          type: 'COOLDOWN_STARTED',
        }),
        expect.objectContaining({
          type: 'COOLDOWN_ENDED',
        }),
        expect.objectContaining({
          type: 'AUTO_PLAY_STOPPED',
        }),
        expect.objectContaining({
          type: 'DEACTIVATED_MULTIPLE',
          indexes: [0],
          values: ['a'],
        }),
      ]);
    });

    test('that a history is kept for a maximum number of events', () => {
      const { activeList } = setup({ keepHistoryFor: 3, activeIndexes: 0 });

      expect(activeList.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
          indexes: [0],
          values: ['a'],
        }),
      ]);

      activeList.activateByIndex(1);
      expect(activeList.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
          indexes: [0],
          values: ['a'],
        }),
        expect.objectContaining({ type: 'ACTIVATED', index: 1, value: 'b' }),
      ]);

      activeList.activateByIndex(2);
      expect(activeList.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
          indexes: [0],
          values: ['a'],
        }),
        expect.objectContaining({ type: 'ACTIVATED', index: 1, value: 'b' }),
        expect.objectContaining({ type: 'ACTIVATED', index: 2, value: 'c' }),
      ]);

      activeList.activateByIndex(0);
      expect(activeList.history).toEqual([
        expect.objectContaining({ type: 'ACTIVATED', index: 1, value: 'b' }),
        expect.objectContaining({ type: 'ACTIVATED', index: 2, value: 'c' }),
        expect.objectContaining({ type: 'ACTIVATED', index: 0, value: 'a' }),
      ]);
    });

    test('that initialize resets the history', () => {
      const { activeList } = setup({ keepHistoryFor: 4, activeIndexes: 0 });

      expect(activeList.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
          indexes: [0],
          values: ['a'],
        }),
      ]);

      activeList.activateByIndex(1);
      expect(activeList.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
          indexes: [0],
          values: ['a'],
        }),
        expect.objectContaining({ type: 'ACTIVATED', index: 1, value: 'b' }),
      ]);

      activeList.removeByIndex(0);
      expect(activeList.history).toEqual([
        expect.objectContaining({
          type: 'INITIALIZED',
          indexes: [0],
          values: ['a'],
        }),
        expect.objectContaining({ type: 'ACTIVATED', index: 1, value: 'b' }),
        expect.objectContaining({ type: 'REMOVED', index: 0, value: 'a' }),
      ]);

      // Now reset the history, note that if `keepHistoryFor` is zero
      // the `history` array would be empty
      activeList.initialize({ contents: [], keepHistoryFor: 1 });
      expect(activeList.history).toEqual([
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
      const { activeList, subscriber } = setup({ activeIndexes: 0 });

      const secondSubscriber = jest.fn();
      const removeSecondSubscriber = activeList.subscribe(secondSubscriber);

      const thirdSubscriber = jest.fn();
      activeList.subscribe(thirdSubscriber);

      activeList.activateByIndex(1);

      expect(subscriber).toHaveBeenCalledTimes(1);
      expect(secondSubscriber).toHaveBeenCalledTimes(1);
      expect(thirdSubscriber).toHaveBeenCalledTimes(1);

      removeSecondSubscriber();

      activeList.activateByIndex(0);

      expect(subscriber).toHaveBeenCalledTimes(2);
      expect(secondSubscriber).toHaveBeenCalledTimes(1);
      expect(thirdSubscriber).toHaveBeenCalledTimes(2);

      activeList.unsubscribe(thirdSubscriber);

      activeList.activateByIndex(2);

      expect(subscriber).toHaveBeenCalledTimes(3);
      expect(secondSubscriber).toHaveBeenCalledTimes(1);
      expect(thirdSubscriber).toHaveBeenCalledTimes(2);
    });

    test('unsubscribeAll', () => {
      const { activeList, subscriber } = setup({ activeIndexes: 0 });

      const secondSubscriber = jest.fn();
      activeList.subscribe(secondSubscriber);

      const thirdSubscriber = jest.fn();
      activeList.subscribe(thirdSubscriber);

      // All three should be informed of this
      activeList.activateByIndex(1);

      expect(subscriber).toHaveBeenCalledTimes(1);
      expect(secondSubscriber).toHaveBeenCalledTimes(1);
      expect(thirdSubscriber).toHaveBeenCalledTimes(1);

      activeList.unsubscribeAll();

      // no one should be informed after the unsubscribe all
      activeList.activateByIndex(0);

      expect(subscriber).toHaveBeenCalledTimes(1);
      expect(secondSubscriber).toHaveBeenCalledTimes(1);
      expect(thirdSubscriber).toHaveBeenCalledTimes(1);

      // Test if a new subscriber can still be added after the clear.
      const newSubscriber = jest.fn();
      activeList.subscribe(newSubscriber);

      // Only new one should be informed
      activeList.activateByIndex(2);

      // New one should be informed
      expect(newSubscriber).toHaveBeenCalledTimes(1);

      // Still not informed
      expect(subscriber).toHaveBeenCalledTimes(1);
      expect(secondSubscriber).toHaveBeenCalledTimes(1);
      expect(thirdSubscriber).toHaveBeenCalledTimes(1);
    });
  });

  describe('createActiveListSubscriber', () => {
    test('that all methods are called correctly', () => {
      jest.useFakeTimers();

      const config: CreateActiveListSubscriberConfig<string> = {
        onMoved: jest.fn(),
        onInserted: jest.fn(),
        onInitialized: jest.fn(),
        onCooldownStarted: jest.fn(),
        onCooldownEnded: jest.fn(),
        onAutoPlayStopped: jest.fn(),
        onAutoPlayPlaying: jest.fn(),
        onAutoPlayPaused: jest.fn(),
        onActivatedMultiple: jest.fn(),
        onActivated: jest.fn(),
        onDeactivatedMultiple: jest.fn(),
        onDeactivated: jest.fn(),
        onSwapped: jest.fn(),
        onRemoved: jest.fn(),
        onRemovedMultiple: jest.fn(),
      };

      const subscriber = createActiveListSubscriber<string>(config);

      const activeList = new ActiveList(
        {
          contents: ['a', 'b', 'c'],
          activeIndexes: 0,
        },
        subscriber
      );

      expect(config.onInitialized).toBeCalledTimes(1);
      expect(config.onInitialized).lastCalledWith(
        expect.objectContaining({
          type: 'INITIALIZED',
          indexes: [0],
          values: ['a'],
        }),
        activeList
      );

      activeList.activateByIndex(1);
      expect(config.onActivated).toBeCalledTimes(1);
      expect(config.onActivated).lastCalledWith(
        expect.objectContaining({ type: 'ACTIVATED', index: 1, value: 'b' }),
        activeList
      );

      activeList.removeByIndex(0);
      expect(config.onRemoved).toBeCalledTimes(1);
      expect(config.onRemoved).lastCalledWith(
        expect.objectContaining({ type: 'REMOVED', index: 0, value: 'a' }),
        activeList
      );

      activeList.removeByPredicate(() => true);
      expect(config.onRemovedMultiple).toBeCalledTimes(1);
      expect(config.onRemovedMultiple).lastCalledWith(
        expect.objectContaining({
          type: 'REMOVED_MULTIPLE',
          indexes: [0, 1],
          values: ['b', 'c'],
        }),
        activeList
      );

      activeList.insertAtIndex('a', 0);
      expect(config.onInserted).toBeCalledTimes(1);
      expect(config.onInserted).lastCalledWith(
        expect.objectContaining({ type: 'INSERTED', index: 0, value: 'a' }),
        activeList
      );

      activeList.activateByIndex(0);
      expect(config.onActivated).toBeCalledTimes(2);

      activeList.insertAtIndex('b', 1);
      expect(config.onInserted).toBeCalledTimes(2);
      activeList.insertAtIndex('c', 2);
      expect(config.onInserted).toBeCalledTimes(3);

      activeList.swapByIndex(0, 2);
      expect(config.onSwapped).toBeCalledTimes(1);
      expect(config.onSwapped).lastCalledWith(
        expect.objectContaining({
          type: 'SWAPPED',
          index: { a: 0, b: 2 },
          value: { a: 'a', b: 'c' },
        }),
        activeList
      );

      activeList.moveByIndex(2, 0);
      expect(config.onMoved).toBeCalledTimes(1);
      expect(config.onMoved).lastCalledWith(
        expect.objectContaining({
          type: 'MOVED',
          index: {
            from: 2,
            to: 0,
          },
          value: 'a',
        }),
        activeList
      );

      activeList.deactivateByIndex(0);
      expect(config.onDeactivated).toBeCalledTimes(1);
      expect(config.onDeactivated).lastCalledWith(
        expect.objectContaining({
          type: 'DEACTIVATED',
          index: 0,
          value: 'a',
        }),
        activeList
      );

      activeList.activateByIndex(0);
      expect(config.onActivated).toBeCalledTimes(3);

      activeList.deactivateByPredicate(() => true);
      expect(config.onDeactivatedMultiple).toBeCalledTimes(1);
      expect(config.onDeactivatedMultiple).lastCalledWith(
        expect.objectContaining({
          type: 'DEACTIVATED_MULTIPLE',
          indexes: [0],
          values: ['a'],
        }),
        activeList
      );

      activeList.activateByPredicate(() => true);
      expect(config.onActivatedMultiple).toBeCalledTimes(1);
      expect(config.onActivatedMultiple).lastCalledWith(
        expect.objectContaining({
          type: 'ACTIVATED_MULTIPLE',
          indexes: [2],
          values: ['b'],
          deactivatedIndexes: [],
          deactivatedValues: [],
        }),
        activeList
      );

      activeList.configureAutoPlay({ duration: 1000 });
      expect(config.onAutoPlayPlaying).toBeCalledTimes(1);
      expect(config.onAutoPlayPlaying).lastCalledWith(
        expect.objectContaining({ type: 'AUTO_PLAY_PLAYING' }),
        activeList
      );

      activeList.pause();
      expect(config.onAutoPlayPaused).toBeCalledTimes(1);
      expect(config.onAutoPlayPaused).lastCalledWith(
        expect.objectContaining({ type: 'AUTO_PLAY_PAUSED' }),
        activeList
      );

      activeList.stop();
      expect(config.onAutoPlayStopped).toBeCalledTimes(1);
      expect(config.onAutoPlayStopped).lastCalledWith(
        expect.objectContaining({ type: 'AUTO_PLAY_STOPPED' }),
        activeList
      );

      // Trigger cooldown
      activeList.activateByIndex(0, { cooldown: 1, isUserInteraction: true });
      expect(config.onCooldownStarted).toBeCalledTimes(1);
      expect(config.onCooldownStarted).lastCalledWith(
        expect.objectContaining({ type: 'COOLDOWN_STARTED' }),
        activeList
      );

      // Trigger cooldown ended
      jest.advanceTimersByTime(1);
      expect(config.onCooldownEnded).toBeCalledTimes(1);
      expect(config.onCooldownEnded).lastCalledWith(
        expect.objectContaining({ type: 'COOLDOWN_ENDED' }),
        activeList
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

        const subscriber = createActiveListSubscriber<string>({ debug: true });

        new ActiveList({}, subscriber);

        expect(console.warn).toHaveBeenCalledTimes(1);
        expect(console.warn).toHaveBeenCalledWith(
          "uiloos > createActiveListSubscriber event 'INITIALIZED' was fired but 'onInitialized' method is not implemented, this might not be correct."
        );
      });

      test('that it does not log a warning when debug is false', () => {
        jest.spyOn(console, 'warn').mockImplementation(() => undefined);

        const subscriber = createActiveListSubscriber<string>({ debug: false });

        new ActiveList({}, subscriber);

        expect(console.warn).toHaveBeenCalledTimes(0);
      });

      test('that it does not log a warning when debug is undefined', () => {
        jest.spyOn(console, 'warn').mockImplementation(() => undefined);

        const subscriber = createActiveListSubscriber<string>({});

        new ActiveList({}, subscriber);

        expect(console.warn).toHaveBeenCalledTimes(0);
      });
    });

    test('that created subscribers can be unsubscribed', () => {
      jest.useFakeTimers();

      const config: CreateActiveListSubscriberConfig<string> = {
        onActivated: jest.fn(),
      };

      const subscriber = createActiveListSubscriber<string>(config);

      const activeList = new ActiveList(
        {
          contents: ['a', 'b', 'c'],
          activeIndexes: 0,
        },
        subscriber
      );

      activeList.activateByIndex(1);
      expect(config.onActivated).toBeCalledTimes(1);

      activeList.unsubscribe(subscriber);

      // Should be unsubscribed and therefore still 1 and not 2
      activeList.activateByIndex(2);
      expect(config.onActivated).toBeCalledTimes(1);
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
  | 'lastDeactivated'
  | 'lastDeactivatedContent'
  | 'lastDeactivatedIndex'
  | 'hasActiveChangedAtLeastOnce'
  | 'autoPlay'
  | 'cooldown'
  | 'direction'
  | 'oppositeDirection'
  | 'history'
>;

type TestState<T> = ActiveListSansContents<T> & {
  contents: TestContent<T>[];
};

type TestContent<T> = Pick<
  ActiveListContent<T>,
  | 'isActive'
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
    lastDeactivatedContent: state.lastDeactivatedContent,
    lastDeactivatedIndex: state.lastDeactivatedIndex,
    lastDeactivated: state.lastDeactivated,
    hasActiveChangedAtLeastOnce: state.hasActiveChangedAtLeastOnce,
    autoPlay: {
      isPlaying: state.autoPlay.isPlaying,
      duration: state.autoPlay.duration,
      hasBeenStoppedBefore: state.autoPlay.hasBeenStoppedBefore,
    },
    cooldown: {
      isActive: state.cooldown.isActive,
      duration: state.cooldown.duration,
    },
    direction: state.direction,
    oppositeDirection: state.oppositeDirection,
    history: state.history,
    contents: state.contents.map((content) => {
      const contentAsTestContent: TestContent<string> = {
        isActive: content.isActive,
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
  subscriber: jest.Mock,
  expectedState: TestState<string>,
  expectedEvent: ActiveListEvent<string>
) {
  const lastCall = subscriber.mock.calls[subscriber.mock.calls.length - 1];
  const state = lastCall[0] as ActiveList<string>;
  const event = lastCall[1] as ActiveListEvent<string>;

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
  expectedEvents: ActiveListEventType[]
) {
  const events: ActiveListEventType[] = subscriber.mock.calls.map((call) => {
    const event = call[1] as ActiveListEvent<string>;
    return event.type;
  });

  expect(events).toEqual(expectedEvents);

  expect(subscriber).toBeCalledTimes(expectedEvents.length);
}
