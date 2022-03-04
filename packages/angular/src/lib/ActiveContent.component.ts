import {
  Component,
  ContentChild,
  OnInit,
  TemplateRef,
  Input,
} from '@angular/core';
import { ActiveContentDirective } from './ActiveContent.directive';
import { ActiveContent, ActiveContentConfig } from '@automata.dev/core';

/**
 * A component which wraps the ActiveContent from @automata.dev/core.
 *  
 * @alias aut-active-content
 */
@Component({
  selector: 'aut-active-content',
  template: `
    <ng-container
      *ngTemplateOutlet="
        autActiveContent;
        context: { $implicit: activeContent }
      "
    ></ng-container>
  `,
})
export class ActiveContentComponent<T> implements OnInit {
  @ContentChild(ActiveContentDirective, { read: TemplateRef })
  private autActiveContent: any;

  /**
   * The initial configuration of the ActiveContent.
   */
  @Input()
  config!: ActiveContentConfig<T>;

  activeContent!: ActiveContent<T>;

  ngOnInit(): void {
    this.activeContent = new ActiveContent(this.config);;
  }
}
