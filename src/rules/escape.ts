import { inlineRegex, rule } from './utils'

export const escape = rule('escape', {
  // We don't allow escaping numbers, letters, or spaces here so that
  // backslashes used in plain text still get rendered. But allowing
  // escaping anything else provides a very flexible escape mechanism,
  // regardless of how this grammar is extended.
  match: inlineRegex(/^\\([^0-9A-Za-z\s])/),
  parse: (capture) => {
    return {
      type:    'text',
      content: capture[1],
    }
  },
})
