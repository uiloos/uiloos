import { useEffect, useState } from 'react';

import {
  ActiveList,
  ActiveListConfig,
} from '@uiloos/core';

/**
 * A hook which returns an ActiveList from @uiloos/core which
 * is configured by the config parameter.
 * 
 * What the hook does is register itself to the ActiveList for 
 * changes, when a change is detected it makes sure that the component
 * using the hook is re-rendered.
 * 
 * @param {ActiveListConfig<T>} config The initial configuration of the ActiveList.
 * @returns An instance of the ActiveList from @uiloos/core
 * 
 * @since 1.0.0
 */
export function useActiveList<T>(
  config: ActiveListConfig<T>
): ActiveList<T> {
  const [_counter, setCounter] = useState(0);
  const [activeContent] = useState(() => new ActiveList<T>(config));

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