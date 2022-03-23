import { ActiveContent as ActiveContentCore } from '@uiloos/core';
import { renderHook, act } from '@testing-library/react-hooks';

import {
  useActiveContent,
} from '../src/ActiveContent/useActiveContent';

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

