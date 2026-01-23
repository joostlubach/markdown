import { createElement } from 'react'
import { inlineRegex, rule } from './utils'

export const em = rule('em', {
  match: inlineRegex(
    new RegExp(
      // only match _s surrounding words.
      "^\\b_" +
        "((?:__|\\\\[\\s\\S]|[^\\\\_])+?)_" +
        "\\b" +
        // Or match *s:
        "|" +
        // Only match *s that are followed by a non-space:
        "^\\*(?=\\S)(" +
        // Match at least one of:
        "(?:" +
        //  - `**`: so that bolds inside italics don't close the italics
        "\\*\\*|" +
        //  - escape sequence: so escaped *s don't close us
        "\\\\[\\s\\S]|" +
        //  - whitespace: followed by a non-* (we don't want ' *' to close an italics--it might start a list)
        "\\s+(?:\\\\[\\s\\S]|[^\\s\\*\\\\]|\\*\\*)|" +
        //  - non-whitespace, non-*, non-backslash characters
        "[^\\s\\*\\\\]" +
        ")+?" +
        // followed by a non-space, non-* then *
        ")\\*(?!\\*)",
    ),
  ),
  quality: (capture) => {
    // precedence by length, `em` wins ties:
    return capture[0].length + 0.2
  },
  parse: (capture, parse) => {
    return {
      content: parse(capture[2] || capture[1]),
    }
  },
  render: (element, render, state) => {
    return createElement(
      'em', 
      {key: state.key}, 
      render(element.content),
    )
  },
})