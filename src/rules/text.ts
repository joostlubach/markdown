import { anyScopeRegex, rule } from './utils'

export const text = rule('text', {
  // Here we look for anything followed by non-symbols,
  // double newlines, or double-space-newlines
  // We break on any symbol characters so that this grammar
  // is easy to extend without needing to modify this regex
  match: anyScopeRegex(
    /^[\s\S]+?(?=[^0-9A-Za-z\s\u00c0-\uffff]|\n\n| {2,}\n|\w+:\S|$)/,
  ),
  parse: (capture) => {
    return {
      content: capture[0],
    }
  },
  render: node => {
    return node.content
  },
})