import React from 'react';
import { ActiveContent as ActiveContentCore } from '@automata.dev/core';
import { renderHook, act } from '@testing-library/react-hooks';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event'

import {
  ActiveContent,
  useActiveContent,
} from '../src/ActiveContent/ActiveContent';

test('useActiveContent hook', () => {
  const { result } = renderHook(() =>
    useActiveContent({
      active: 'a',
      contents: ['a', 'b', 'c'],
    })
  );

  expect(result.current instanceof ActiveContentCore).toBe(true);

  expect(result.current.active).toBe('a');

  act(() => {
    result.current.activate('b');
  });

  expect(result.current.active).toBe('b');
});

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
