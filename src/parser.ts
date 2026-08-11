import { isArray } from 'lodash'
import { objectEntries } from 'ytil'
import {
  Capture,
  NestedSerializer,
  ParserState,
  RenderElement,
  RenderNode,
  Rule,
  Rules,
  SerializeNode,
} from './types'

export function parserFor(rules: Rules, options: ParserOptions = {}) {
  const orderedRules = getOrderedRules(rules)
  const {inline = false, callback} = options

  let state: ParserState
  function inner(source: string): RenderElement[] {
    const result: RenderElement[] = []
    while (source.length > 0) {
      const [type, rule, capture] = findBestRule(orderedRules, source, state)

      if (type == null || rule == null || capture == null) {
        console.warn("No applicable rule found for source:", source)
        return []
      }
      if (capture.index > 0) {
        throw new Error(`Rule match must start at index 0, but got index ${capture.index}`)
      }

      const parsed = rule.parse(capture, inner, state) as RenderNode
      if (isArray(parsed)) {
        for (const element of parsed) {
          element.$rule = rule
        }
      } else {
        parsed.$rule = rule
      }
      if (isArray(parsed)) {
        parsed.forEach(element => callback?.(type, element))
        result.push(...parsed)
      } else {
        callback?.(type, parsed)
        result.push(parsed)
      }

      state.prevCapture = capture
      source = source.slice(capture[0].length)
    }

    return result
  }

  return function parse(source: string) {
    state = {
      inline:      inline,
      list:        false,
      prevCapture: null,
      footnotes:   {},
    }
    return inline ? inner(source) : inner(`${source}\n\n`)
  }
}

function getOrderedRules(rules: Rules): Array<[string, Rule]> {
  return objectEntries(rules).sort((a, b) => {
    const orderA = a[1].order
    const orderB = b[1].order
    if (orderA !== orderB) {
      return orderA - orderB
    }

    const qualityA = a[1].quality ? 0 : 1
    const qualityB = b[1].quality ? 0 : 1
    return qualityA - qualityB
  })
}

function findBestRule(
  orderedRules: Array<[string, Rule]>,
  source: string,
  state: ParserState,
): [string | null, Rule | null, Capture | null] {
  let prevQuality: number = 0

  for (const [index, [type, rule]] of orderedRules.entries()) {
    const capture = rule.match(source, state)
    if (capture == null) { continue }

    if (prevQuality > 0 && rule.quality != null) {
      const quality = rule.quality(capture, state)
      if (quality <= prevQuality) { continue }
    }

    // If the next rule has the same order, we need to also consider it
    // to compare the qualities. Unless of course it doesn't match.
    const nextRule = orderedRules[index + 1]?.[1]
    if (nextRule != null && nextRule.order === rule.order && nextRule.quality != null) {
      continue
    }

    return [type, rule, capture]
  }

  return [null, null, null]
}

export function preprocess(source: string): string {
  return source
    .replace(CR_NEWLINE_R, "\n")
    .replace(FORMFEED_R, "")
    .replace(TAB_R, "    ")
}

const CR_NEWLINE_R = /\r\n?/g
const TAB_R = /\t/g
const FORMFEED_R = /\f/g

export interface ParserOptions {
  inline?: boolean
  callback?: (type: string, element: RenderElement) => void
}

/**
 * Builds a serialize function from a rules map. The returned function converts
 * an AST (as SerializeNode[] or a single SerializeNode / RenderElement) back
 * to the source text that would parse to an equivalent AST.
 *
 * Rules opt in by providing a `serialize` function. Rules without one are
 * skipped (empty string emitted) with a console warning.
 */
export function serializerFor(rules: Rules) {
  // Index by rule.type (= key in the rules record) for O(1) lookup.
  const byType: Record<string, Rule> = {}
  for (const [name, rule] of objectEntries(rules)) {
    byType[name] = rule
  }

  const serializeArray: NestedSerializer = (nodes) => nodes.map(serializeNode).join('')

  function serializeNode(node: SerializeNode | RenderElement): string {
    const type: string | undefined = (node as any).type ?? (node as any).$rule?.type
    const rule = type != null ? byType[type] : undefined
    if (rule?.serialize == null) {
      if (type != null) { console.warn(`No serialize fn for node type "${type}"`) }
      return ''
    }
    return rule.serialize(node as any, serializeArray)
  }

  return function serialize(input: SerializeNode | SerializeNode[] | RenderElement | RenderElement[]): string {
    if (isArray(input)) { return serializeArray(input as SerializeNode[]) }
    return serializeNode(input as SerializeNode)
  }
}