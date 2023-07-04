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
 * @example
 * A. Simple example
 * 
 * The example below creates a list with three items: 
 * a, b and c of which only one item can be active. 
 * Clicking an item makes it active.
 * 
 * ```jsx
 * <ActiveList 
 *   active="a" 
 *   contents={['a', 'b', 'c']}
 * >
 *   {(activeContent) => (
 *     <ul>
 *       {activeContent.contents.map((content) => (
 *         <li 
 *           key={content.value} 
 *           onClick={() => content.activate()}
 *         >
 *           {content.value} 
 *           {content.isActive ? 'active' : 'inactive'}
 *         </li>
 *       ))}
 *     </ul>
 *   )}
 * </ActiveList>
 * ```
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
