import { createElement } from 'react'
import { inlineRegex, rule } from './utils'

const INLINE_CODE_ESCAPE_BACKTICKS_R = / (`+) /g

export const inlineCode = rule('inlineCode', {
  match: inlineRegex(/^(`+)([\s\S]*?[^`])\1(?!`)/),
  parse: (capture) => {
    return {
      content: capture[2].replace(INLINE_CODE_ESCAPE_BACKTICKS_R, '$1'),
    }
  },
  render: (node, _output, state) => {
    return createElement('code', {key: state.key}, node.content)
  },
})
