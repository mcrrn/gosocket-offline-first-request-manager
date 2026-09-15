import { describe, expect, it } from 'vitest'
import type { LocalRequest } from '../../domain/models'
import { UppercaseRequestProcessor } from '../../domain/requestProcessor'
import { RequestProcessorRegistry } from '../../domain/requestProcessorRegistry'
import type { RegisterRequestPayload, RequestApi } from '../requestApi'
import { synchronizePendingRequests } from '../synchronizer'

const processors = new RequestProcessorRegistry({
  uppercase: new UppercaseRequestProcessor(),
})

function request(id: string, type = 'uppercase'): LocalRequest {
  return {
    id,
    name: 'A request',
    type,
    payload: 'hello',
    status: 'Pending',
    createdAt: '2026-09-15T00:00:00.000Z',
  }
}

describe('synchronizePendingRequests', () => {
  it('processes locally and sends no local type to the api', async () => {
    const received: RegisterRequestPayload[] = []
    const api: RequestApi = {
      async register(payload) {
        received.push(payload)
        return { kind: 'received' }
      },
    }

    const result = await synchronizePendingRequests([request('1')], processors, api)

    expect(received).toEqual([{
      id: '1',
      name: 'A request',
      payload: 'HELLO',
      createdAt: '2026-09-15T00:00:00.000Z',
    }])
    expect(result.requests[0]).toMatchObject({ status: 'Processed', processedPayload: 'HELLO' })
  })

  it('keeps retryable failures pending and marks rejected requests as failed', async () => {
    const api: RequestApi = {
      async register(payload) {
        return payload.id === 'retry'
          ? { kind: 'retryable-error', message: 'Server unavailable' }
          : { kind: 'rejected', message: 'Invalid request' }
      },
    }

    const result = await synchronizePendingRequests([request('retry'), request('rejected')], processors, api)

    expect(result.requests[0]).toMatchObject({ status: 'Pending', errorMessage: 'Server unavailable' })
    expect(result.requests[1]).toMatchObject({ status: 'Failed', errorMessage: 'Invalid request' })
  })

  it('marks a request as failed when its local processor does not exist', async () => {
    const api: RequestApi = { async register() { return { kind: 'received' } } }

    const result = await synchronizePendingRequests([request('1', 'unknown')], processors, api)

    expect(result.requests[0]).toMatchObject({ status: 'Failed' })
  })
})
