export type RequestStatus = 'Pending' | 'Processed' | 'Failed'

export interface LocalRequest {
  id: string
  name: string
  type: string
  payload: string
  status: RequestStatus
  createdAt: string
  processedPayload?: string
  errorMessage?: string
}

export type GroupChild =
  | { kind: 'request'; id: string }
  | { kind: 'group'; id: string }

export interface RequestGroup {
  id: string
  name: string
  children: GroupChild[]
}
