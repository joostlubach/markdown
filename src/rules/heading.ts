import { createElement } from 'react'
import { blockRegex, parseInline, rule } from './utils'

export const heading = rule('heading', {
  match: blockRegex(/^ *(#{1,6})([^\n]+?)#* *(?:\n *)+\n/),
  parse: (capture, parse, state) => {
    return {
      level:   capture[1].length,
      content: parseInline(capture[2].trim(), parse, state),
    }
  },
  render: (node, output, state) => {
    return createElement('h' + node.level, {key: state.key}, output(node.content))
  },
})
