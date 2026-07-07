/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import type { OpenAIAggregatorConfig } from '../types'

export const CHANNEL_TYPE_OPENAI_AGGREGATOR = 59

export const OPENAI_AGGREGATOR_PLACEHOLDER = JSON.stringify(
  {
    upstreams: [
      {
        base_url: 'https://api-a.example.com',
        key: 'sk-a',
      },
      {
        base_url: 'https://api-b.example.com',
        key: 'sk-b',
      },
    ],
  },
  null,
  2
)

export type OpenAIAggregatorValidationError = {
  message: string
  upstreamIndex?: number
}

export function parseOpenAIAggregatorConfig(
  value: string | undefined
): OpenAIAggregatorConfig | undefined {
  if (!value?.trim()) return undefined
  return JSON.parse(value) as OpenAIAggregatorConfig
}

export function stringifyOpenAIAggregatorConfig(
  config: OpenAIAggregatorConfig
): string {
  return JSON.stringify(config, null, 2)
}

export function validateOpenAIAggregatorConfig(
  config: OpenAIAggregatorConfig | undefined
): OpenAIAggregatorValidationError | undefined {
  if (!config) {
    return { message: 'OpenAI aggregator upstream settings are required' }
  }

  if (!Array.isArray(config.upstreams) || config.upstreams.length === 0) {
    return {
      message: 'OpenAI aggregator requires at least one upstream',
    }
  }

  for (let i = 0; i < config.upstreams.length; i += 1) {
    const upstream = config.upstreams[i]
    const baseUrl = String(upstream?.base_url || '').trim()
    const key = String(upstream?.key || '').trim()
    if (!baseUrl) {
      return {
        message: 'Each OpenAI aggregator upstream requires a base URL',
        upstreamIndex: i,
      }
    }
    try {
      const parsedUrl = new URL(baseUrl)
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        return {
          message: 'OpenAI aggregator upstream base URLs must use http or https',
          upstreamIndex: i,
        }
      }
    } catch {
      return {
        message: 'OpenAI aggregator upstream base URLs must be full URLs',
        upstreamIndex: i,
      }
    }
    if (!key) {
      return {
        message: 'Each OpenAI aggregator upstream requires an API key',
        upstreamIndex: i,
      }
    }
  }

  return undefined
}