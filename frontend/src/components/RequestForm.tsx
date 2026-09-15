import type { FormEvent } from 'react'
import { requestTypes } from '../domain/requestTypes'

export interface NewRequestValues {
  name: string
  type: string
  payload: string
}

interface RequestFormProps {
  onCreate(values: NewRequestValues): void
}

export function RequestForm({ onCreate }: RequestFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)

    onCreate({
      name: String(data.get('name') ?? '').trim(),
      type: String(data.get('type') ?? 'text'),
      payload: String(data.get('payload') ?? ''),
    })

    form.reset()
  }

  return (
    <section>
      <h2>Nueva solicitud</h2>

      <form onSubmit={handleSubmit}>
        <p>
          <label htmlFor="request-name">Nombre</label>
          <input id="request-name" name="name" required />
        </p>

        <p>
          <label htmlFor="request-type">Procesamiento</label>
          <select id="request-type" name="type" defaultValue="text">
            {requestTypes.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </p>

        <p>
          <label htmlFor="request-payload">Payload</label>
          <textarea id="request-payload" name="payload" rows={4} required />
        </p>

        <button type="submit">Guardar</button>
      </form>
    </section>
  )
}
