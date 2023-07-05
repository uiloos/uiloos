import { ActiveList, type ActiveListConfig } from '@uiloos/core';
import { readable, type Readable } from 'svelte/store';

/**
 * Creates a store containing an ActiveList from @uiloos/core which is
 * configured by the config parameter.
 *
 * What the function does is create the ActiveList and register itself 
 * to the ActiveList for changes, when a change is detected it makes 
 * sure that the component using the store is re-rendered.
 *
 * @param {ActiveListConfig<T>} config The initial configuration of the ActiveList.
 * @returns A Readable<ActiveList<T>>
 *
 * @since 1.3.0
 */
export function createActiveListStore<T>(config: ActiveListConfig<T>): Readable<ActiveList<T>> {
  const activeList = new ActiveList(config);

  const activeListReadable = readable(activeList, (_set, update) => {
    const unsubscribe = activeList.subscribe(() => {
      update(() => {
        return activeList;
      });
    });

    return () => {
      unsubscribe();
    };
  });

  return activeListReadable;
}
