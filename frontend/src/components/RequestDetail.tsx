import type { LocalRequest } from '../domain/models'
import { requestTypeLabel } from '../domain/requestTypes'
import { Status } from './RequestList'

interface RequestDetailProps {
  request: LocalRequest
  onClose(): void
}

export function RequestDetail({ request, onClose }: RequestDetailProps) {
  return (
    <section aria-label="Detalle de solicitud">
      <h2>Detalle</h2>
      <p><strong>Nombre:</strong> {request.name}</p>
      <p><strong>Estado:</strong> <Status status={request.status} /></p>
      <p><strong>Tipo local:</strong> {requestTypeLabel(request.type)}</p>
      <p><strong>Payload original:</strong> {request.payload}</p>
      {request.processedPayload !== undefined && (
        <p><strong>Payload procesado:</strong> {request.processedPayload}</p>
      )}
      {request.errorMessage && (
        <p><strong>Información de sincronización:</strong> {request.errorMessage}</p>
      )}
      <button type="button" onClick={onClose}>Cerrar detalle</button>
    </section>
  )
}
