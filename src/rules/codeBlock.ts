import { createElement } from 'react'
import { blockRegex, rule } from './utils'

export const codeBlock = rule('codeBlock', {
  match: blockRegex(/^(?:    [^\n]+\n*)+(?:\n *)+\n/),
  parse: (capture) => {
    const content = capture[0].replace(/^    /gm, '').replace(/\n+$/, '')
    return {
      lang: undefined,
      content,
    }
  },
  render: (node, _output, state) => {
    const className = node.lang ? `markdown-code-${node.lang}` : undefined

    return createElement('pre', {key: state.key}, 
      createElement('code', {className}, node.content),
    )
  },
})
