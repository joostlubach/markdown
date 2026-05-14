import { type ReactNode } from 'react'
import type * as rules from './rules'

export type Attr = string | number | boolean | null | undefined

export type Rules = Record<string, Rule<any>>

export interface Rule<E extends Element = Element> {
  type: string
  order: number
  match: MatchFunction
  quality?: (match: Capture, state: ParserState) => number

  parse: ParseFn<E>
  render?: RenderFn<E>
}

export type ParseFn<E extends Element> = (capture: Capture, parse: NestedParser, state: ParserState) => E | Array<E>
export type RenderFn<E extends Element> = (element: E, render: NestedRenderer, state: RendererState) => ReactNode

export type NestedParser = (source: string) => RenderNode
export type ParserOutput<E extends Element> = E | E[]
export type NestedRenderer = (node: RenderNode | string | undefined) => ReactNode

export type Element = Record<string, unknown> & {content?: Node | string}
export type Node<E extends Element = Element> = E | E[]

export type RenderElement<E extends Element = Element> = Omit<E, 'content'> & {
  $rule: Rule<E>
  content?: RenderNode | string
}
export type RenderNode<E extends Element = Element> = RenderElement<E> | RenderElement<E>[]

export type elementOf<R extends Rule<any>> = R extends Rule<infer E> ? E : never

export interface Capture {
  [index: number]: string
  index: number
  length: number
  input: string
}

export interface ParserState {
  inline: boolean
  list: boolean
  prevCapture: Capture | null
  footnotes: Record<string, string>
}

export interface RendererState {
  key: number
  renderers?: RendererMap

  [key: string]: unknown
}

export type RendererMap = Partial<Record<keyof typeof rules, RenderFn<any>>> & {
  footnote?: (seq: string) => ReactNode
}

export interface MatchFunction {
  (source: string, state: ParserState): Capture | null | undefined
  regex?: RegExp
} 