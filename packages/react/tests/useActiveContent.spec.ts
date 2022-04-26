import { ActiveList as ActiveListCore } from '@uiloos/core';
import { renderHook, act } from '@testing-library/react-hooks';

import {
  useActiveList,
} from '../src/ActiveList/useActiveList';

test('useActiveList hook', () => {
  const { result } = renderHook(() =>
    useActiveList({
      active: 'a',
      contents: ['a', 'b', 'c'],
    })
  );

  expect(result.current instanceof ActiveListCore).toBe(true);

  expect(result.current.active).toEqual(['a']);

  act(() => {
    result.current.activate('b');
  });

  expect(result.current.active).toEqual(['b']);
});

