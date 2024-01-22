import { DateGallery, type DateGalleryConfig } from '@uiloos/core';
import { readable, type Readable } from 'svelte/store';

/**
 * Creates a store containing an DateGallery from @uiloos/core which is
 * configured by the config parameter.
 *
 * What the function does is create the DateGallery and register itself 
 * to the DateGallery for changes, when a change is detected it makes 
 * sure that the component using the store is re-rendered.
 *
 * @param {DateGalleryConfig<T>} config The initial configuration of the DateGallery.
 * @returns A Readable<DateGallery<T>>
 *
 * @since 1.6.0
 */
export function createDateGalleryStore<T>(config: DateGalleryConfig<T>): Readable<DateGallery<T>> {
  const dateGallery = new DateGallery(config);

  const dateGalleryReadable = readable(dateGallery, (_set, update) => {
    const unsubscribe = dateGallery.subscribe(() => {
      update(() => {
        return dateGallery;
      });
    });

    return () => {
      unsubscribe();
    };
  });

  return dateGalleryReadable;
}
