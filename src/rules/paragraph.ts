import { createElement } from 'react'
import { blockRegex, parseInline, rule } from './utils'

export const paragraph = rule('paragraph', {
  match:  blockRegex(/^((?:[^\n]|\n(?! *\n))+)(?:\n *)+\n/),
  parse:  parseInline,
  render: (node, render, state) => {
    return createElement('div', {key: state.key, className: 'paragraph'}, 
      render(node.content),
    )
  },
})
