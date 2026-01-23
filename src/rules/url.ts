import { inlineRegex, rule } from './utils'

export const url = rule('url', {
  match: inlineRegex(/^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/),
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
      title:  undefined,
    }
  },
})
