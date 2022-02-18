import {
  Component,
  ContentChild,
  OnInit,
  TemplateRef,
  Input,
} from '@angular/core';
import { ActiveContentDirective } from './ActiveContent.directive';
import { ActiveContent, ActiveContentConfig } from '@automata.dev/core';

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
  autActiveContent: any;

  @Input()
  config!: ActiveContentConfig<T>;

  activeContent!: ActiveContent<T>;

  ngOnInit(): void {
    this.activeContent = new ActiveContent(this.config);;
  }
}
