import { createElement } from 'react'
import { anyScopeRegex, ignoreCapture, rule } from './utils'

export const br = rule('br', {
  match:  anyScopeRegex(/^ {2,}\n/),
  parse:  ignoreCapture,
  render: (_node, _output, state) => {
    return createElement('br', {key: state.key})
  },
})
