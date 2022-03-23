import {} from 'jasmine';

import { render, screen, fireEvent } from '@testing-library/angular';

import { ActiveContentComponent } from './ActiveContent.component';
import { ActiveContentDirective } from './ActiveContent.directive';

it('ActiveContent component', async () => {
  await render(
    `<uiloos-active-content [config]="{ active: 'a', contents: ['a', 'b', 'c']}">
      <ul *uiloosActiveContent="let activeContent">
        <li *ngFor="let content of activeContent.contents" (click)="content.activate()">
          {{content.value}} {{content.active ? 'active' : 'inactive'}}
        </li>
      </ul>
    </uiloos-active-content>
  `,
    {
      declarations: [ActiveContentComponent, ActiveContentDirective],
    }
  );

  screen.getByText('a active');
  screen.getByText('b inactive');
  screen.getByText('c inactive');

  await fireEvent.click(screen.getByText('c inactive'));

  screen.getByText('a inactive');
  screen.getByText('b inactive');
  screen.getByText('c active');
});
