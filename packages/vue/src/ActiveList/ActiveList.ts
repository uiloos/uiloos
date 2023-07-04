import { ActiveListConfig } from '@uiloos/core';
import { useActiveList } from './useActiveList';
import { defineComponent } from 'vue';

/**
 * A component which wraps the ActiveList from @uiloos/core.
 * 
 * @param {ActiveListConfig<T>} config The properties of the ActiveList component.
 * @returns A component which wraps the ActiveList from @uiloos/core.
 * @since 1.0.0
 * 
 * @example
 * A. Simple example
 * 
 * The example below creates a list with three items: 
 * a, b and c of which only one item can be active. 
 * Clicking an item makes it active.
 * 
 * Note: If you plan on using the ActiveList component
 * the vue configuration called "runtimeCompiler" must
 * be set to "true' since it uses templates.
 * 
 * ```vue
 * <template>
 *   <ActiveList 
 *     :config="{ 
 *       active: 'a', 
 *       contents: ['a', 'b', 'c'] 
 *     }"
 *   >
 *     <template v-slot="{ activeList }">
 *       <ul>
 *         <li 
 *            v-for="content in activeList.contents" 
 *            @click="content.activate()"
 *         >
 *           {{ content.value }} 
 *           {{ content.isActive ? "active" : "inactive" }}
 *         </li>
 *       </ul>
 *     </template>
 *   </ActiveList>
 * </template>
 * ```
 */
const ActiveList = defineComponent({
  name: 'ActiveList',
  props: {
    config: { type: Object as () => ActiveListConfig<unknown>, required: true },
  },
  setup(props) {
    const activeList = useActiveList(props.config);
    return { activeList };
  },
  template: `<slot :activeList="activeList"/>`,
});

export default ActiveList;