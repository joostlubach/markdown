import { createElement } from 'react'
import { inlineRegex, rule } from './utils'

const LINK_INSIDE = "(?:\\[[^\\]]*\\]|[^\\[\\]]|\\](?=[^\\[]*\\]))*"
const LINK_HREF_AND_TITLE =
  "\\s*<?((?:\\([^)]*\\)|[^\\s\\\\]|\\\\.)*?)>?(?:\\s+['\"]([\\s\\S]*?)['\"])?\\s*"

function sanitizeUrl(url?: string | null) {
  if (url == null) {
    return null
  }
  try {
    const prot = new URL(url, 'https://localhost').protocol
    if (
      prot.indexOf('javascript:') === 0 ||
      prot.indexOf('vbscript:') === 0 ||
      prot.indexOf('data:') === 0
    ) {
      return null
    }
  } catch {
    return null
  }
  return url
}

function unescapeUrl(rawUrlString: string): string {
  return rawUrlString.replace(/\\([^0-9A-Za-z\s])/g, '$1')
}

export const image = rule('image', {
  match: inlineRegex(
    new RegExp(
      "^!\\[(" +
        LINK_INSIDE +
        ")\\]\\(" +
        LINK_HREF_AND_TITLE +
        "\\)",
    ),
  ),
  parse: (capture) => {
    return {
      alt:    capture[1],
      target: unescapeUrl(capture[2]),
      title:  capture[3],
    }
  },
  render: (node, _output, state) => {
    return createElement('img', {
      key:   state.key,
      src:   sanitizeUrl(node.target) || undefined,
      alt:   node.alt,
      title: node.title,
    })
  },
})
