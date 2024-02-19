import { onMounted, onUnmounted, Ref, shallowRef, triggerRef } from 'vue';

import {
  DateGallery as DateGalleryCore,
  DateGalleryConfig,
  UnsubscribeFunction
} from '@uiloos/core';

/**
 * A composable which returns an DateGallery from @uiloos/core 
 * which is configured by the config parameter. 
 * 
 * What the composable does is register itself to the DateGallery for 
 * changes, when a change is detected it makes sure that the component
 * using the composable is re-rendered.
 * 
 * @param {DateGalleryConfig<T>} config The initial configuration of the DateGallery.
 * @returns An instance of the DateGallery from @uiloos/core
 * 
 * @since 1.6.0
 */
export function useDateGallery<T>(
  config: DateGalleryConfig<T>
): Ref<DateGalleryCore<T>> {
  const dateGallery = shallowRef(new DateGalleryCore<T>(config)) as unknown as Ref<DateGalleryCore<T>>;

  let subscriber: UnsubscribeFunction;

  onMounted(() => {
    subscriber = dateGallery.value.subscribe(() => {
      triggerRef(dateGallery);
    });
  });

  onUnmounted(() => {
    subscriber();
  })

  return dateGallery;
}