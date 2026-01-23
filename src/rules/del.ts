import { inlineRegex, parseInline, rule } from './utils'

export const del = rule('del', {
  match: inlineRegex(/^~~(?=\S)((?:\\[\s\S]|~(?!~)|[^\s~\\]|\s(?!~~))+?)~~/),
  parse: (capture, parse, state) => ({
    content: parseInline(capture, parse, state),
  }),
})
