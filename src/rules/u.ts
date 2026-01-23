import { inlineRegex, parseInline, rule } from './utils'

export const u = rule('u', {
  match:   inlineRegex(/^__((?:\\[\s\S]|[^\\])+?)__(?!_)/),
  quality: (capture) => {
    // precedence by length, loses all ties
    return capture[0].length
  },
  parse: parseInline,
})
