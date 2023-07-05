import type { ViewChannel } from '@uiloos/core';
import { readable, type Readable } from 'svelte/store';

/**
 * Creates a store containing the provided ViewChannel from 
 * @uiloos/core, and subscribes to that ViewChannel. This way each 
 * time the ViewChannel is changed your component re-renders.
 *
 * @param {ViewChannel<T, R>} viewChannel The ViewChannel to subscribe to.
 * @returns A Readable<ViewChannel<T, R>>
 * 
 * @since 1.3.0
 */
export function createViewChannelStore<T, R>(
  viewChannel: ViewChannel<T, R>
): Readable<ViewChannel<T, R>> {
  const viewChannelReadable = readable(viewChannel, (_set, update) => {
    const unsubscribe = viewChannel.subscribe(() => {
      update(() => {
        return viewChannel;
      });
    });

    return () => {
      unsubscribe();
    };
  });

  return viewChannelReadable;
}
