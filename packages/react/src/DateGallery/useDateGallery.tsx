import { useEffect, useState } from 'react';

import {
  DateGallery,
  DateGalleryConfig,
} from '@uiloos/core';

/**
 * A hook which returns a DateGallery from @uiloos/core which
 * is configured by the config parameter.
 * 
 * What the hook does is register itself to the DateGallery for 
 * changes, when a change is detected it makes sure that the component
 * using the hook is re-rendered.
 * 
 * @param {DateGalleryConfig<T>} config The initial configuration of the DateGallery.
 * @returns An instance of the DateGallery from @uiloos/core
 * 
 * @since 1.6.0
 */
export function useDateGallery<T>(
  config: DateGalleryConfig<T>
): DateGallery<T> {
  const [_counter, setCounter] = useState(0);
  const [dateGallery] = useState(() => new DateGallery<T>(config));

  useEffect(() => {
    const unsubscribe = dateGallery.subscribe(() => {
      setCounter((value) => value + 1);
    });

    return () => {
      unsubscribe();
    }
  }, []);

  return dateGallery;
}