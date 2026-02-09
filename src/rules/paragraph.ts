import { createElement } from 'react'
import { blockRegex, parseInline, rule } from './utils'

export const paragraph = rule('paragraph', {
  match: blockRegex(/^((?:[^\n]|\n(?! *\n))+)(?:\n *)+\n/),
  parse: (capture, parse, state) => ({
    content: parseInline(capture, parse, state),
  }),
  render: (node, render, state) => {
    return createElement('p', {key: state.key}, 
      render(node.content),
    )
  },
})
