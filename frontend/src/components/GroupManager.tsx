import type { FormEvent } from 'react'
import { useState } from 'react'
import type { LocalRequest, RequestGroup } from '../domain/models'
import { collectRequestIds } from '../domain/requestGroups'

interface GroupManagerProps {
  requests: LocalRequest[]
  groups: RequestGroup[]
  disabled: boolean
  onCreate(name: string, childValues: string[]): void
  onSynchronize(ids: string[]): void
}

export function GroupManager({ requests, groups, disabled, onCreate, onSynchronize }: GroupManagerProps) {
  const [selectedChildren, setSelectedChildren] = useState<Set<string>>(new Set())

  function toggle(value: string) {
    setSelectedChildren((current) => {
      const next = new Set(current)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const name = String(new FormData(form).get('name') ?? '').trim()
    if (!name || selectedChildren.size === 0) return

    onCreate(name, [...selectedChildren])
    setSelectedChildren(new Set())
    form.reset()
  }

  return (
    <section>
      <h2>Agrupaciones</h2>

      <form onSubmit={handleSubmit}>
        <p>
          <label htmlFor="group-name">Nombre del grupo</label>
          <input id="group-name" name="name" required />
        </p>

        <fieldset>
          <legend>Contenido</legend>
          {requests.map((request) => (
            <label key={request.id}>
              <input type="checkbox" checked={selectedChildren.has(`request:${request.id}`)} onChange={() => toggle(`request:${request.id}`)} />
              Solicitud: {request.name}
            </label>
          ))}
          {groups.map((group) => (
            <label key={group.id}>
              <input type="checkbox" checked={selectedChildren.has(`group:${group.id}`)} onChange={() => toggle(`group:${group.id}`)} />
              Grupo: {group.name}
            </label>
          ))}
        </fieldset>

        <button type="submit" disabled={selectedChildren.size === 0}>Crear grupo</button>
      </form>

      <ul>
        {groups.map((group) => {
          const requestIds = collectRequestIds(group, groups)
          return (
            <li key={group.id}>
              {group.name} ({requestIds.length} solicitudes)
              {' '}
              <button type="button" disabled={disabled || requestIds.length === 0} onClick={() => onSynchronize(requestIds)}>
                Enviar grupo
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
