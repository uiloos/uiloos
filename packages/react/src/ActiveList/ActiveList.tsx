import React, { ReactNode } from 'react';

import {
  ActiveList as ActiveListCore,
  ActiveListConfig,
} from '@uiloos/core';
import { useActiveList } from './useActiveList';


/**
 * The properties for the ActiveList React component.
 * 
 * It has all properties the ActiveListConfig has, plus a 
 * `children` property which is a render function which is given the
 * current ActiveList state to render.
 * 
 * @since 1.0.0
 */
export type ActiveListProps<T> = ActiveListConfig<T> & {

  /**
   * A render function which accepts an ActiveList from @uiloos/core
   * as a parameter.
   * 
   * @param {ActiveListCore<T>} activeContent The ActiveList from @uiloos/core
   * 
   * @since 1.0.0
   */
  children(activeContent: ActiveListCore<T>): ReactNode;
};

/**
 * A component which wraps the ActiveList from @uiloos/core.
 * 
 * @param {ActiveListProps<T>} props The properties of the ActiveList component.
 * @returns A component which wraps the ActiveList from @uiloos/core.
 * 
 * @since 1.0.0
 */
export function ActiveList<T>(props: ActiveListProps<T>): JSX.Element {
  const activeContent = useActiveList(props);

  return <>{props.children(activeContent)}</>;
}
