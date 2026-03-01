// The order here matters
import { keepOrder } from './utils'

// Block level elements.
export * from './heading'
export * from './list'
export * from './blockQuote'
export * from './codeBlock'
export * from './fence'
export * from './hr'
export * from './newline'
export * from './paragraph'

// Inline level elements.
export * from './escape'
export * from './autolink'
export * from './mailto'
export * from './url'
export * from './footnotes'
export * from './link'
export * from './image'

// Style modifiers.
export * from './em'
keepOrder()
export * from './strong'
keepOrder()
export * from './u'

export * from './del'
export * from './inlineCode'

// Line breaks.
export * from './br'

// Text goes last.
export * from './text'