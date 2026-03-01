import { inlineRegex, rule } from './utils'

export const footnoteRef = rule('footnote-ref', {
  match: inlineRegex(
    /^\[\^([-_a-z][-_a-z0-9]*)\]/i,
  ),
  parse: (capture) => {
    return {
      seq: capture[1],
    }
  },
  render: (node, output, state) => {
    return state.renderers?.footnote?.(node.seq) ?? `<super>${node.seq}</super>`
  },
})