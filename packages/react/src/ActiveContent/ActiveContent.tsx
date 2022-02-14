import React, { useEffect, useState, ReactNode } from 'react';

import {
  ActiveContent as ActiveContentCore,
  ActiveContentConfig,
} from '@automata.dev/core';

export function useActiveContent<T>(
  config: ActiveContentConfig<T>
): ActiveContentCore<T> {
  const [_counter, setCounter] = useState(0);
  const [activeContent] = useState(() => new ActiveContentCore<T>(config));

  useEffect(() => {
    const unsubsribe = activeContent.subscribe(() => {
      setCounter((value) => value + 1);
    });

    return () => {
      unsubsribe();
    }
  }, []);

  return activeContent;
}

type Props<T> = ActiveContentConfig<T> & {
  children: (activeContent: ActiveContentCore<T>) => ReactNode;
};

export function ActiveContent<T>({ children, ...rest }: Props<T>): JSX.Element {
  const activeContent = useActiveContent(rest);

  return <>{children(activeContent)}</>;
}
