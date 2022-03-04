import React from 'react';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event'

import {
  ActiveContent,
} from '../src/ActiveContent/ActiveContent';

test('ActiveContent component', () => {
  render(
    <ActiveContent active="a" contents={['a', 'b', 'c']}>
      {(activeContent) => (
        <ul>
          {activeContent.contents.map((content) => (
            <li key={content.value} onClick={() => content.activate()}>
              {content.value} {content.active ? 'active' : 'inactive'}
            </li>
          ))}
        </ul>
      )}
    </ActiveContent>
  );

  screen.getByText('a active');
  screen.getByText('b inactive');
  screen.getByText('c inactive');

  userEvent.click(screen.getByText('c inactive'));

  screen.getByText('a inactive');
  screen.getByText('b inactive');
  screen.getByText('c active');
});
