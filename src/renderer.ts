import { isArray } from 'lodash'
import { createElement, type ReactNode } from 'react'
import type * as rules from './rules'
import { type NestedRenderer, type RenderElement, type RendererMap, type RendererState, type RenderNode } from './types'

export function render(node: RenderNode, options: RenderOptions = {}) {
  const state: RendererState = {
    key:       0,
    renderers: options.renderers,
  }

  function inner(node: RenderNode | string | undefined): ReactNode {
    if (node == null) { return null }
    if (isArray(node)) {
      return node.map(inner)
    }

    try {
      if (typeof node === 'string') {
        return node
      }
      if (node.$rule == null) {
        console.warn('No rule found for node', node)
        return null
      }

      const ruleType = node.$rule.type as keyof typeof rules
      const render = options.renderers?.[ruleType] ?? node.$rule.render ?? defaultRender
      return render(node, inner, state)
    } finally {
      state.key += 1
    }
  }
  return inner(node)
}

function defaultRender(node: RenderNode, render: NestedRenderer, state: RendererState): ReactNode {
  const inner = (element: RenderElement): ReactNode => {
    if (element.content == null) { return null }

    const content = typeof element.content !== 'string'
      ? render(element.content)
      : element.content
    return createElement(
      element.$rule.type,
      {key: state.key},
      content,
    )
  }
  return isArray(node) ? node.map(inner) : inner(node)
}

export interface RenderOptions {
  renderers?: RendererMap
}