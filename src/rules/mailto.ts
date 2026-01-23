import { inlineRegex, rule } from './utils'

const AUTOLINK_MAILTO_CHECK_R = /mailto:/i

export const mailto = rule('mailto', {
  match: inlineRegex(/^<([^ >]+@[^ >]+)>/),
  parse: (capture) => {
    const address = capture[1]
    let target = capture[1]

    // Check for a `mailto:` already existing in the link:
    if (!AUTOLINK_MAILTO_CHECK_R.test(target)) {
      target = 'mailto:' + target
    }

    return {
      type:    'link',
      content: [
        {
          type:    'text',
          content: address,
        },
      ],
      target,
    }
  },
})
