import {
  Directive
} from '@angular/core';

/**
 * A directive which makes it possible to set a variable which 
 * binds the the ActiveList from within an angular template.
 * 
 * @since 1.0.0
 * 
 * @example
 * 
 * A. Simple example
 * 
 * Uses the "<uiloos-active-list />" component together with the
 * "*uiloosActiveList" directive to create  a list with three items:
 *  a, b and c of which only one item can be active. Clicking an 
 * item makes it active.
 * 
 * ```html
 * <uiloos-active-list 
 *   [config]="{ 
 *     active: 'a', 
 *     contents: ['a', 'b', 'c']
 *   }"
 * >
 *   <ul *uiloosActiveList="let activeList">
 *     <li
 *       *ngFor="let content of activeList.contents"
 *       (click)="content.activate()"
 *     >
 *       {{content.value}} 
 *       {{content.isActive ? 'active' : 'inactive'}}
 *     </li>
 *   </ul>
 * </uiloos-active-list>
 * ```
 */
@Directive({
  selector: '[uiloosActiveList]',
})
export class ActiveListDirective {
  constructor() {}
}

