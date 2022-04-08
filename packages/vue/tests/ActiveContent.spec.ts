import { render, fireEvent } from '@testing-library/vue';
import { test, expect } from 'vitest';

import ActiveContent from '../src/ActiveContent/ActiveContent';

test('ActiveContent component', async () => {
  const { getByText } = render(ActiveContent, {
    props: {
      config: {
        active: 'a',
        contents: ['a', 'b', 'c'],
      },
    },
    slots: {
      default: `
        <template v-slot="{ activeContent }">
          <ul>
            <li v-for="content in activeContent.contents" @click="content.activate()">
              {{content.value}} {{content.active ? 'active' : 'inactive'}}
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
