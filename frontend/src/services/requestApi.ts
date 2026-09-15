export interface RegisterRequestPayload {
  id: string
  name: string
  payload: string
  createdAt: string
}

export type RegisterRequestResult =
  | { kind: 'received' }
  | { kind: 'rejected'; message: string }
  | { kind: 'retryable-error'; message: string }

export interface RequestApi {
  register(request: RegisterRequestPayload): Promise<RegisterRequestResult>
}

export class HttpRequestApi implements RequestApi {
  private readonly baseUrl: string
  private readonly fetcher: typeof fetch

  constructor(
    baseUrl: string,
    fetcher: typeof fetch = fetch,
  ) {
    this.baseUrl = baseUrl.replace(/\/$/, '')
    this.fetcher = fetcher
  }

  async register(request: RegisterRequestPayload): Promise<RegisterRequestResult> {
    try {
      const response = await this.fetcher(`${this.baseUrl}/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      })

      if (response.status === 200 || response.status === 201) return { kind: 'received' }
      const message = await responseMessage(response)
      if (response.status >= 400 && response.status < 500) {
        return { kind: 'rejected', message }
      }
      return { kind: 'retryable-error', message }
    } catch {
      return { kind: 'retryable-error', message: 'No fue posible conectar con el servidor.' }
    }
  }
}

export function requestApiFromEnvironment(): HttpRequestApi {
  const baseUrl = import.meta.env.VITE_API_BASE_URL
  if (!baseUrl) throw new Error('Falta definir VITE_API_BASE_URL.')
  return new HttpRequestApi(baseUrl)
}

async function responseMessage(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json()
    if (typeof body === 'object' && body !== null && 'error' in body && typeof body.error === 'string') {
      return body.error
    }
  } catch {
    return `El servidor respondió ${response.status}.`
  }
  return `El servidor respondió ${response.status}.`
}
