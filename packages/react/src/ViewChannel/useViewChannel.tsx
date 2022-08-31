import { useEffect, useState } from 'react';

import { ViewChannel } from '@uiloos/core';

/**
 * A hook which when given a ViewChannel from @uiloos/core subscribes 
 * to that ViewChannel. This way each time the ViewChannel is changed 
 * your component re-renders.
 *
 * @param {ViewChannel<T, R>} viewChannel The ViewChannel to subscribe to.
 * @returns An instance of the ViewChannel from @uiloos/core
 * 
 * @since 1.0.0
 */
export function useViewChannel<T, R>(
  viewChannel: ViewChannel<T, R>
): ViewChannel<T, R> {
  const [_counter, setCounter] = useState(0);
  
  useEffect(() => {
    const unsubscribe = viewChannel.subscribe(() => {
      setCounter((value) => value + 1);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return viewChannel;
}
