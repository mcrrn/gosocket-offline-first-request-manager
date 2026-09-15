import type { LocalRequest } from '../domain/models'
import type { RequestProcessorRegistry } from '../domain/requestProcessorRegistry'
import type { RequestApi } from './requestApi'

export interface SynchronizationSummary {
  requests: LocalRequest[]
  processed: number
  failed: number
  pending: number
}

export async function synchronizePendingRequests(
  requests: LocalRequest[],
  processors: RequestProcessorRegistry,
  api: RequestApi,
): Promise<SynchronizationSummary> {
  const synchronized = await Promise.all(
    requests.map((request) => synchronizeRequest(request, processors, api)),
  )

  return {
    requests: synchronized,
    processed: synchronized.filter((request) => request.status === 'Processed').length,
    failed: synchronized.filter((request) => request.status === 'Failed').length,
    pending: synchronized.filter((request) => request.status === 'Pending').length,
  }
}

async function synchronizeRequest(
  request: LocalRequest,
  processors: RequestProcessorRegistry,
  api: RequestApi,
): Promise<LocalRequest> {
  if (request.status !== 'Pending') return request

  let processedPayload: string
  try {
    processedPayload = processors.get(request.type).process(request.payload)
  } catch (error) {
    return {
      ...request,
      status: 'Failed',
      errorMessage: error instanceof Error ? error.message : 'No se pudo procesar la solicitud.',
    }
  }

  const result = await api.register({
    id: request.id,
    name: request.name,
    payload: processedPayload,
    createdAt: request.createdAt,
  })

  if (result.kind === 'received') {
    return { ...request, status: 'Processed', processedPayload, errorMessage: undefined }
  }
  if (result.kind === 'rejected') {
    return { ...request, status: 'Failed', processedPayload, errorMessage: result.message }
  }
  return { ...request, processedPayload, errorMessage: result.message }
}
