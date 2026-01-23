import {
  Capture,
  Element,
  MatchFunction,
  NestedParser,
  ParserState,
  RenderNode,
  Rule,
} from '../types'

export let currentOrder = 0

export function keepOrder() {
  currentOrder -= 1
}

export function rule<E extends Element>(type: string, input: RuleInput<E>): Rule<E> {
  const rule = input as Rule<E>
  rule.type = type
  rule.order ??= currentOrder++
  return rule
}
type RuleInput<E extends Element> = Omit<Rule<E>, 'type' | 'order'> & {order?: number}

export function inlineRegex(regex: RegExp): MatchFunction {
  const match: MatchFunction = (
    source: string,
    state: ParserState,
  ): Capture | null | undefined => {
    return state.inline ? regex.exec(source) : null
  }
  match.regex = regex

  return match
}

export function blockRegex(regex: RegExp): MatchFunction {
  const match: MatchFunction = (source, state) => {
    return state.inline ? null : regex.exec(source)
  }
  match.regex = regex
  return match
}

export function anyScopeRegex(regex: RegExp): MatchFunction {
  const match: MatchFunction = (source, _state) => {
    return regex.exec(source)
  }
  match.regex = regex
  return match
}

export function parseInline(capture: Capture | string, parse: NestedParser, state: ParserState): RenderNode {
  const wasInline = state.inline
  state.inline = true
  try {
    const content = typeof capture === 'string' ? capture : capture[1]
    return parse(content)
  } finally {
    state.inline = wasInline
  }
}

export function parseBlock(capture: Capture | string, parse: NestedParser, state: ParserState): RenderNode {
  const wasInline = state.inline
  state.inline = false
  try {
    const content = typeof capture === 'string' ? capture : capture[1]
    return parse(content + "\n\n")
  } finally {
    state.inline = wasInline
  }
}

export function ignoreCapture() {
  return {}
}