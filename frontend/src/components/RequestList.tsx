import type { LocalRequest } from '../domain/models'
import { requestTypeLabel } from '../domain/requestTypes'

interface RequestListProps {
  requests: LocalRequest[]
  disabled: boolean
  onSelect(request: LocalRequest): void
  onSynchronize(id: string): void
}

export function RequestList({ requests, disabled, onSelect, onSynchronize }: RequestListProps) {
  if (requests.length === 0) return <p>No hay solicitudes guardadas.</p>

  return (
    <ul>
      {requests.map((request) => (
        <li className="request-item" key={request.id}>
          <strong>{request.name}</strong>
          {' · '}
          {requestTypeLabel(request.type)}
          {' · '}
          <Status status={request.status} />
          {' '}
          <button className="compact-button" type="button" onClick={() => onSelect(request)}>
            Ver detalle
          </button>
          <button
            className="compact-button"
            type="button"
            onClick={() => onSynchronize(request.id)}
            disabled={disabled || request.status !== 'Pending'}
          >
            Enviar
          </button>
        </li>
      ))}
    </ul>
  )
}

export function Status({ status }: { status: LocalRequest['status'] }) {
  const labels = { Pending: 'Pendiente', Processed: 'Enviada', Failed: 'Fallida' }
  return <span className={`status status-${status.toLowerCase()}`}>{labels[status]}</span>
}
