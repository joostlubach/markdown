import { inlineRegex, parseInline, rule } from './utils'

export const strong = rule('strong', {
  match:   inlineRegex(/^\*\*((?:\\[\s\S]|[^\\])+?)\*\*(?!\*)/),
  quality: (capture) => {
    // precedence by length, wins ties vs `u`:
    return capture[0].length + 0.1
  },
  parse: (capture, parse, state) => ({
    content: parseInline(capture, parse, state),
  }),
})
