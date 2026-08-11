import { describe, expect, it } from 'vitest'
import { parserFor, serializerFor } from './parser'
import * as rules from './rules'
import { escapeText } from './rules/utils'
import { SerializeNode } from './types'

const parse = parserFor(rules as any)
const serialize = serializerFor(rules as any)

// Strips the trailing \n\n that parserFor adds before returning to make
// serialize(parse(x)) === x assertions simpler.
function roundTrip(source: string) {
  return serialize(parse(source) as any)
}

// ---- escapeText ----------------------------------------------------------------

describe('escapeText', () => {
  it('leaves plain text unchanged', () => {
    expect(escapeText('hello world')).toBe('hello world')
  })

  it('escapes backslash first', () => {
    expect(escapeText('a\\b')).toBe('a\\\\b')
  })

  it('escapes bold markers', () => {
    expect(escapeText('**bold**')).toBe('\\*\\*bold\\*\\*')
  })

  it('escapes underscore', () => {
    expect(escapeText('_italic_')).toBe('\\_italic\\_')
  })

  it('escapes left curly brace', () => {
    expect(escapeText('{@ref foo}')).toBe('\\{@ref foo\\}')
  })

  it('preserves unicode and alphanumerics', () => {
    expect(escapeText('héllo 42 wörld')).toBe('héllo 42 wörld')
  })
})

// ---- serialize node shapes -------------------------------------------------------

describe('serialize node shapes', () => {
  it('text node', () => {
    const node: SerializeNode = {type: 'text', content: 'hello'}
    expect(serialize(node)).toBe('hello')
  })

  it('paragraph node', () => {
    const node: SerializeNode = {
      type:    'paragraph',
      content: [{type: 'text', content: 'hello'}],
    }
    expect(serialize(node)).toBe('hello\n\n')
  })

  it('heading level 1', () => {
    const node: SerializeNode = {
      type:    'heading',
      level:   1,
      content: [{type: 'text', content: 'Title'}],
    }
    expect(serialize(node)).toBe('# Title\n\n')
  })

  it('heading level 2', () => {
    const node: SerializeNode = {
      type:    'heading',
      level:   2,
      content: [{type: 'text', content: 'Sub'}],
    }
    expect(serialize(node)).toBe('## Sub\n\n')
  })

  it('strong node', () => {
    const node: SerializeNode = {
      type:    'strong',
      content: [{type: 'text', content: 'bold'}],
    }
    expect(serialize(node)).toBe('**bold**')
  })

  it('em node', () => {
    const node: SerializeNode = {
      type:    'em',
      content: [{type: 'text', content: 'italic'}],
    }
    expect(serialize(node)).toBe('_italic_')
  })

  it('nested strong > em', () => {
    const node: SerializeNode = {
      type:    'strong',
      content: [{type: 'em', content: [{type: 'text', content: 'both'}]}],
    }
    expect(serialize(node)).toBe('**_both_**')
  })

  it('unordered list', () => {
    const node: SerializeNode = {
      type:    'list',
      ordered: false,
      items:   [
        {type: 'list-item', content: [{type: 'text', content: 'foo'}]},
        {type: 'list-item', content: [{type: 'text', content: 'bar'}]},
      ],
    }
    expect(serialize(node)).toBe('- foo\n- bar\n\n')
  })

  it('ordered list', () => {
    const node: SerializeNode = {
      type:    'list',
      ordered: true,
      items:   [
        {type: 'list-item', content: [{type: 'text', content: 'first'}]},
        {type: 'list-item', content: [{type: 'text', content: 'second'}]},
      ],
    }
    expect(serialize(node)).toBe('1. first\n2. second\n\n')
  })

  it('newline node', () => {
    const node: SerializeNode = {type: 'newline'}
    expect(serialize(node)).toBe('\n')
  })
})

// ---- serialize(parse(text)) round-trips ----------------------------------------

describe('serialize(parse(text)) round-trips', () => {
  it('plain paragraph', () => {
    expect(roundTrip('Hello world\n\n')).toBe('Hello world\n\n')
  })

  it('bold inline', () => {
    expect(roundTrip('Hello **world**\n\n')).toBe('Hello **world**\n\n')
  })

  it('em inline', () => {
    expect(roundTrip('Hello _world_\n\n')).toBe('Hello _world_\n\n')
  })

  it('heading h1', () => {
    expect(roundTrip('# Title\n\n')).toBe('# Title\n\n')
  })

  it('heading h2', () => {
    expect(roundTrip('## Sub\n\n')).toBe('## Sub\n\n')
  })

  it('unordered list', () => {
    expect(roundTrip('- one\n- two\n\n')).toBe('- one\n- two\n\n')
  })

  it('ordered list', () => {
    expect(roundTrip('1. first\n2. second\n\n')).toBe('1. first\n2. second\n\n')
  })

  it('multiple blocks', () => {
    const src = '# Heading\n\nParagraph text\n\n'
    expect(roundTrip(src)).toBe(src)
  })

  it('escapes special chars in text', () => {
    const src = 'Price is \\*\\*not bold\\*\\*\n\n'
    const result = roundTrip(src)
    // parse then serialize should keep the escaped content intact
    expect(result).toContain('\\*')
  })
})

// ---- AST identity: parse(serialize(ast)) === ast --------------------------------

describe('parse(serialize(ast)) reproduces same structure', () => {
  function astRoundTrip(nodes: SerializeNode[]) {
    const text = serialize(nodes)
    return parse(text) as any[]
  }

  it('paragraph', () => {
    const ast: SerializeNode[] = [{
      type:    'paragraph',
      content: [{type: 'text', content: 'hello'}],
    }]
    const reparsed = astRoundTrip(ast)
    expect(reparsed[0].$rule.type).toBe('paragraph')
    expect((reparsed[0].content as any[])[0].content).toBe('hello')
  })

  it('heading', () => {
    const ast: SerializeNode[] = [{
      type:    'heading',
      level:   2,
      content: [{type: 'text', content: 'My Heading'}],
    }]
    const reparsed = astRoundTrip(ast)
    expect(reparsed[0].$rule.type).toBe('heading')
    expect(reparsed[0].level).toBe(2)
  })

  it('bold in paragraph', () => {
    const ast: SerializeNode[] = [{
      type:    'paragraph',
      content: [
        {type: 'text',   content: 'Say '},
        {type: 'strong', content: [{type: 'text', content: 'hello'}]},
      ],
    }]
    const reparsed = astRoundTrip(ast)
    const paraContent = reparsed[0].content as any[]
    const boldNode = paraContent.find((n: any) => n.$rule?.type === 'strong')
    expect(boldNode).toBeDefined()
  })

  it('unordered list', () => {
    const ast: SerializeNode[] = [{
      type:    'list',
      ordered: false,
      items:   [
        {type: 'list-item', content: [{type: 'text', content: 'alpha'}]},
        {type: 'list-item', content: [{type: 'text', content: 'beta'}]},
      ],
    }]
    const reparsed = astRoundTrip(ast)
    expect(reparsed[0].$rule.type).toBe('list')
    expect(reparsed[0].items).toHaveLength(2)
  })
})
