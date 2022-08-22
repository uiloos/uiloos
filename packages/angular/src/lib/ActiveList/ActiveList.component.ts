import {
  Component,
  ContentChild,
  OnInit,
  TemplateRef,
  Input,
} from '@angular/core';
import { ActiveListDirective } from './ActiveList.directive';
import { ActiveList, ActiveListConfig } from '@uiloos/core';

/**
 * A component which wraps the ActiveList from @uiloos/core.
 *  
 * @alias uiloos-active-list
 */
@Component({
  selector: 'uiloos-active-list',
  template: `
    <ng-container
      *ngTemplateOutlet="
        uiloosActiveList;
        context: { $implicit: activeList }
      "
    ></ng-container>
  `,
})
export class ActiveListComponent<T> implements OnInit {
  @ContentChild(ActiveListDirective, { read: TemplateRef })
  private uiloosActiveList: any;

  /**
   * The initial configuration of the ActiveList.
   */
  @Input()
  config!: ActiveListConfig<T>;

  activeList!: ActiveList<T>;

  ngOnInit(): void {
    this.activeList = new ActiveList(this.config);;
  }
}
