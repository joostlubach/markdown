import { createElement } from 'react'
import { blockRegex, ignoreCapture, rule } from './utils'

export const hr = rule('hr', {
  match:  blockRegex(/^( *[-*_]){3,} *(?:\n *)+\n/),
  parse:  ignoreCapture,
  render: (_node, _output, state) => {
    return createElement('hr', {key: state.key, 'aria-hidden': true})
  },
})
