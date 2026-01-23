import { blockRegex, rule } from './utils'

export const fence = rule('fence', {
  match: blockRegex(
    /^ *(`{3,}|~{3,}) *(?:(\S+) *)?\n([\s\S]+?)\n?\1 *(?:\n *)+\n/,
  ),
  parse: (capture) => {
    return {
      type:    'codeBlock',
      lang:    capture[2] || undefined,
      content: capture[3],
    }
  },
})
