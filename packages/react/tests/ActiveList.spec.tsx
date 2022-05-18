import React from 'react';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event'
import { activateLicense } from '@uiloos/core';

import {
  ActiveList,
} from '../src/ActiveList/ActiveList';

test('ActiveList component', () => {
  activateLicense("fake-100", { logLicenseActivated: false });

  render(
    <ActiveList active="a" contents={['a', 'b', 'c']}>
      {(activeContent) => (
        <ul>
          {activeContent.contents.map((content) => (
            <li key={content.value} onClick={() => content.activate()}>
              {content.value} {content.isActive ? 'active' : 'inactive'}
            </li>
          ))}
        </ul>
      )}
    </ActiveList>
  );

  screen.getByText('a active');
  screen.getByText('b inactive');
  screen.getByText('c inactive');

  userEvent.click(screen.getByText('c inactive'));

  screen.getByText('a inactive');
  screen.getByText('b inactive');
  screen.getByText('c active');
});
