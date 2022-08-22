import {} from 'jasmine';

import { render, screen, fireEvent } from '@testing-library/angular';

import { ActiveListComponent } from './ActiveList.component';
import { ActiveListDirective } from './ActiveList.directive';

import { licenseChecker } from '@uiloos/core'

it('ActiveList component', async () => {
  licenseChecker.activateLicense("fake-100", { logLicenseActivated: false });

  await render(
    `<uiloos-active-list [config]="{ active: 'a', contents: ['a', 'b', 'c']}">
      <ul *uiloosActiveList="let activeList">
        <li *ngFor="let content of activeList.contents" (click)="content.activate()">
          {{content.value}} {{content.isActive ? 'active' : 'inactive'}}
        </li>
      </ul>
    </uiloos-active-list>
  `,
    {
      declarations: [ActiveListComponent, ActiveListDirective],
    }
  );

  screen.getByText('a active');
  screen.getByText('b inactive');
  screen.getByText('c inactive');

  await fireEvent.click(screen.getByText('c inactive'));

  screen.getByText('a inactive');
  screen.getByText('b inactive');
  screen.getByText('c active');

  expect(screen.getByText('c active')).toBeInstanceOf(HTMLElement);
});
