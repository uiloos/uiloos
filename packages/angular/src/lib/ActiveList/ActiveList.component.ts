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
 * 
 * @since 1.0.0
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
  /**
   * An reference to the ActiveListDirective.
   * 
   * @since 1.0.0
   */
  @ContentChild(ActiveListDirective, { read: TemplateRef })
  public uiloosActiveList: any;

  /**
   * An `@Input` for the initial configuration of the ActiveList.
   * 
   * @since 1.0.0
   */
  @Input()
  public config!: ActiveListConfig<T>;

   /**
   * The exposed ActiveList.
   * 
   * @since 1.0.0
   */
  public activeList!: ActiveList<T>;

  ngOnInit(): void {
    this.activeList = new ActiveList(this.config);;
  }
}
