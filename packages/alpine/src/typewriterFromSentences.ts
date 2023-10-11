import {
  TypewriterFromSentencesConfig,
  typewriterFromSentences as tfs,
} from '@uiloos/core';
import { subscribe } from './subscribe';

/**
 * The configuration for the typewriterFromSentences Alpine.js component.
 *
 * It has all properties the TypewriterFromSentencesConfig has from core, plus an
 * optional `alpine` configuration object which allows you to set the
 * name for the exposed Typewriter.
 *
 * @since 1.4.0
 */
export type AlpineTypewriterFromSentencesConfig =
  TypewriterFromSentencesConfig & {
    /**
     * Additional alpine only configuration for the Typewriter.
     *
     * @since 1.4.0
     */
    alpine?: {
      /**
       * The method name you want to expose the `Typewriter` under.
       *
       * Useful when having more than one typewriter animation on the
       * page, so you can distinguish between them more easily.
       *
       * Say for example you set it to `"home"`: in the HTML you now use
       * `home().text`.
       *
       * Defaults to 'typewriter'.
       *
       * @since 1.4.0
       */
      name?: string;
    };
  };

/**
 * A function which you can use to register a `data` to Alpine.js to
 * create Typewriter instances from within HTML.
 *
 * @example
 * A. Three sentences
 *
 * This example creates a typewriter that writes out three
 * sentences.
 *
 * First register typewriterFromSentences to alpine:
 *
 * ```js
 * import Alpine from 'alpinejs';
 * import { typewriterFromSentences } from '@uiloos/alpine';
 *
 * Alpine.data('typewriter', typewriterFromSentences);
 *
 * Alpine.start();
 * ```
 *
 * Now you can use the typewriter in your HTML like this:
 *
 * ```html
 *  <span
 *    x-data="typewriter({
 *      sentences: [
 *        'Hello world',
 *        'Hello music',
 *        'Hello sunshine'
 *      ],
 *    })"
 *    x-text="typewriter().text"
 *  ></span>
 * ```
 *
 * @param {AlpineTypewriterFromSentencesConfig} config The initial configuration for the Typewriter
 * @returns An Alpine.js data component
 * @since 1.4.0
 */
export function typewriterFromSentences(
  config: AlpineTypewriterFromSentencesConfig
) {
  const typewriter = tfs(config);

  const name = config.alpine?.name ?? 'typewriter';

  return subscribe(name, typewriter)();
}
