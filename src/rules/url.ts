import { createElement } from 'react'
import { inlineRegex, rule } from './utils'

export const url = rule('url', {
  match: inlineRegex(/^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/),
  parse: (capture) => {
    return {
      type:    'link',
      content: capture[1],
      target:  capture[1],
      title:   undefined,
    }
  },
  render: (node, output, state) => {
    const {content, target, title} = node
    return createElement('a', {key: state.key, href: target, title}, output(content))
  },
})
