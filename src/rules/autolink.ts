import { inlineRegex, rule } from './utils'

export const autolink = rule('autolink', {
  match: inlineRegex(/^<([^: >]+:\/[^ >]+)>/),
  parse: (capture) => {
    return {
      type:    'link',
      content: [
        {
          type:    'text',
          content: capture[1],
        },
      ],
      target: capture[1],
    }
  },
})
