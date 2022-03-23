import { useEffect, useState } from 'react';

import {
  ActiveContent,
  ActiveContentConfig,
} from '@uiloos/core';

/**
 * A hook which returns an ActiveContent from @uiloos/core which
 * is configured by the config parameter. 
 * 
 * What the hook does is register itself to the ActiveContent for 
 * changes, when a change is detected it makes sure that the component
 * using the hook is re-rendered.
 * 
 * @param {ActiveContentConfig<T>} config  The initial configuration of the ActiveContent.
 * @returns An instance of the ActiveContent from @uiloos/core
 */
export function useActiveContent<T>(
  config: ActiveContentConfig<T>
): ActiveContent<T> {
  const [_counter, setCounter] = useState(0);
  const [activeContent] = useState(() => new ActiveContent<T>(config));

  useEffect(() => {
    const unsubscribe = activeContent.subscribe(() => {
      setCounter((value) => value + 1);
    });

    return () => {
      unsubscribe();
    }
  }, []);

  return activeContent;
}