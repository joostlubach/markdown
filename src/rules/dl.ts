import { createElement } from 'react'
import { blockRegex, parseInline, rule } from './utils'

// Matches a full definition list block. A block consists of one or more items,
// each being a term line followed by one or more definition lines (`: `).
// Items may be separated by blank lines.
const DL_R = /^(?:[^\n:][^\n]*\n(?:: [^\n]*(?:\n|$))+\n*)+/

// Extracts individual term + definitions groups from a matched DL block.
const DL_ITEM_R = /([^\n:][^\n]*)\n((?:: [^\n]*(?:\n|$))+)/gm

// Extracts the text of each definition line within a definitions block.
const DL_DEF_R = /: ([^\n]*)/gm

export const dl = rule('dl', {
  match: blockRegex(DL_R),
  parse: (capture, parse, state) => {
    const items: Array<{ term: ReturnType<typeof parseInline>, definitions: ReturnType<typeof parseInline>[] }> = []

    DL_ITEM_R.lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = DL_ITEM_R.exec(capture[0])) !== null) {
      const term = parseInline(match[1], parse, state)
      const definitions: ReturnType<typeof parseInline>[] = []

      DL_DEF_R.lastIndex = 0
      let defMatch: RegExpExecArray | null
      while ((defMatch = DL_DEF_R.exec(match[2])) !== null) {
        definitions.push(parseInline(defMatch[1], parse, state))
      }

      items.push({term, definitions})
    }

    return {items}
  },
  render: (node, render, state) => {
    const children = node.items.flatMap((item, i) => [
      createElement('dt', {key: `dt-${i}`}, render(item.term)),
      ...item.definitions.map((def, j) =>
        createElement('dd', {key: `dd-${i}-${j}`}, render(def)),
      ),
    ])

    return createElement('dl', {key: state.key}, children)
  },
})
