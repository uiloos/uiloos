import { render, fireEvent } from '@testing-library/vue';
import { activateLicense } from '@uiloos/core';
import { test } from 'vitest';

import ActiveList from '../src/ActiveList/ActiveList';

test('ActiveList component', async () => {
  activateLicense("fake-100", { logLicenseActivated: false });

  const { getByText } = render(ActiveList, {
    props: {
      config: {
        active: 'a',
        contents: ['a', 'b', 'c'],
      },
    },
    slots: {
      default: `
        <template v-slot="{ activeList }">
          <ul>
            <li v-for="content in activeList.contents" @click="content.activate()">
              {{content.value}} {{content.isActive ? 'active' : 'inactive'}}
            </li>
          </ul>
        </template>
      `,
    },
  });

  getByText('a active');
  getByText('b inactive');
  getByText('c inactive');

  await fireEvent.click(getByText('c inactive'));

  getByText('a inactive');
  getByText('b inactive');
  getByText('c active');
});
