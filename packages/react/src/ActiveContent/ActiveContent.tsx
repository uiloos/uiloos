import React, { ReactNode } from 'react';

import {
  ActiveContent as ActiveContentCore,
  ActiveContentConfig,
} from '@uiloos/core';
import { useActiveContent } from './useActiveContent';

/**
 * The properties for the ActiveContent React component.
 * 
 * It has all properties the ActiveContentConfig has, plus a 
 * `children` property which is a render function which is given the
 * current ActiveContent state to render.
 */
export type ActiveContentProps<T> = ActiveContentConfig<T> & {

  /**
   * A render function which accepts an ActiveContent from @uiloos/core
   * as a parameter.
   * 
   * @param {ActiveContentCore<T>} activeContent The ActiveContent from @uiloos/core
   */
  children(activeContent: ActiveContentCore<T>): ReactNode;
};

/**
 * A component which wraps the ActiveContent from @uiloos/core.
 * 
 * @param {ActiveContentProps<T>} props The properties of the ActiveContent component.
 * @returns A component which wraps the ActiveContent from @uiloos/core.
 */
export function ActiveContent<T>(props: ActiveContentProps<T>): JSX.Element {
  const activeContent = useActiveContent(props);

  return <>{props.children(activeContent)}</>;
}
