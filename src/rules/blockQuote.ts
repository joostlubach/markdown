import { createElement } from 'react'
import { blockRegex, rule } from './utils'

export const blockQuote = rule('blockQuote', {
  match: blockRegex(/^( *>[^\n]+(\n[^\n]+)*\n*)+\n{2,}/),
  parse: (capture, parse, state) => {
    const content = capture[0].replace(/^ *> ?/gm, '')
    return {
      content: parse(content),
    }
  },
  render: (node, render, state) => {
    return createElement('blockquote', {key: state.key}, render(node.content))
  },
})
