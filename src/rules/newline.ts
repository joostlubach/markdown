import { blockRegex, ignoreCapture, rule } from './utils'

export const newline = rule('newline', {
  match:  blockRegex(/^(?:\n *)*\n/),
  parse:  ignoreCapture,
  render: () => '\n',
})
