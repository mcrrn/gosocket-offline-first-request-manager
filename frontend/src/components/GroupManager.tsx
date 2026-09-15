import type { FormEvent, ReactNode } from 'react'
import { useState } from 'react'
import type { LocalRequest, RequestGroup } from '../domain/models'
import { collectRequestIds, wouldCreateGroupCycle } from '../domain/requestGroups'

interface GroupManagerProps {
  requests: LocalRequest[]
  groups: RequestGroup[]
  disabled: boolean
  onCreate(name: string, childValues: string[]): void
  onUpdate(id: string, name: string, childValues: string[]): void
  onDelete(id: string): void
  onSynchronize(ids: string[]): void
}

export function GroupManager({ requests, groups, disabled, onCreate, onUpdate, onDelete, onSynchronize }: GroupManagerProps) {
  const [selectedChildren, setSelectedChildren] = useState<Set<string>>(new Set())
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null)
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)

  const editingGroup = groups.find((group) => group.id === editingGroupId)
  const selectedGroup = groups.find((group) => group.id === selectedGroupId)
  const referencedGroupIds = new Set(groups.flatMap((group) => group.children
    .filter((child) => child.kind === 'group')
    .map((child) => child.id)))
  const rootGroups = groups.filter((group) => !referencedGroupIds.has(group.id))

  function toggle(value: string) {
    setSelectedChildren((current) => {
      const next = new Set(current)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })
  }

  function startEditing(group: RequestGroup) {
    setEditingGroupId(group.id)
    setSelectedChildren(new Set(group.children.map((child) => `${child.kind}:${child.id}`)))
  }

  function cancelEditing() {
    setEditingGroupId(null)
    setSelectedChildren(new Set())
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const name = String(new FormData(form).get('name') ?? '').trim()
    if (!name || selectedChildren.size === 0) return

    if (editingGroupId) onUpdate(editingGroupId, name, [...selectedChildren])
    else onCreate(name, [...selectedChildren])
    cancelEditing()
    form.reset()
  }

  function availableGroups() {
    return groups.filter((group) => group.id !== editingGroupId &&
      (!editingGroupId || !wouldCreateGroupCycle(editingGroupId, group.id, groups)))
  }

  function confirmDelete(group: RequestGroup) {
    if (window.confirm(`¿Eliminar el grupo "${group.name}"?`)) onDelete(group.id)
    if (editingGroupId === group.id) cancelEditing()
    if (selectedGroupId === group.id) setSelectedGroupId(null)
  }

  return (
    <section>
      <h2>Agrupaciones</h2>

      <form className="group-form" onSubmit={handleSubmit}>
        <p>
          <label htmlFor="group-name">{editingGroup ? 'Nombre del grupo' : 'Nombre del nuevo grupo'}</label>
          <input id="group-name" name="name" defaultValue={editingGroup?.name ?? ''} key={editingGroupId ?? 'new'} required />
        </p>

        <fieldset>
          <legend>Contenido</legend>
          {requests.map((request) => (
            <label key={request.id}>
              <input type="checkbox" checked={selectedChildren.has(`request:${request.id}`)} onChange={() => toggle(`request:${request.id}`)} />
              Solicitud: {request.name}
            </label>
          ))}
          {availableGroups().map((group) => (
            <label key={group.id}>
              <input type="checkbox" checked={selectedChildren.has(`group:${group.id}`)} onChange={() => toggle(`group:${group.id}`)} />
              Grupo: {group.name}
            </label>
          ))}
        </fieldset>

        <button type="submit" disabled={selectedChildren.size === 0}>{editingGroup ? 'Guardar cambios' : 'Crear grupo'}</button>
        {editingGroup && <button className="secondary-button" type="button" onClick={cancelEditing}>Cancelar</button>}
      </form>

      {groups.length > 0 && (
        <ul className="group-tree">
          {(rootGroups.length > 0 ? rootGroups : groups).map((group) => renderGroup(group, 0, new Set()))}
        </ul>
      )}

      {selectedGroup && (
        <div className="group-detail" aria-label="Detalle del grupo">
          <div className="group-detail-header">
            <div>
              <strong>{selectedGroup.name}</strong>
              <span>{formatQuantity(collectRequestIds(selectedGroup, groups).length, 'solicitud contenida', 'solicitudes contenidas')}</span>
            </div>
            <button className="compact-button" type="button" onClick={() => setSelectedGroupId(null)}>Cerrar</button>
          </div>
          <ul>
            {collectRequestIds(selectedGroup, groups).map((requestId) => {
              const request = requests.find((item) => item.id === requestId)
              return request ? <li key={request.id}>{request.name}</li> : null
            })}
          </ul>
        </div>
      )}
    </section>
  )

  function renderGroup(group: RequestGroup, depth: number, trail: Set<string>): ReactNode {
    if (trail.has(group.id)) return null
    const nextTrail = new Set(trail).add(group.id)
    const requestIds = collectRequestIds(group, groups)
    const nestedGroups = group.children
      .filter((child) => child.kind === 'group')
      .map((child) => groups.find((item) => item.id === child.id))
      .filter((item): item is RequestGroup => item !== undefined)

    return (
      <li className="group-tree-item" key={group.id} style={{ marginLeft: `${depth * 18}px` }}>
        <div className="group-row">
          <div>
            <strong>{group.name}</strong>
            <span>{requestIds.length} solicitud{requestIds.length === 1 ? '' : 'es'}</span>
          </div>
          <div className="group-actions">
            <button className="compact-button" type="button" disabled={disabled || requestIds.length === 0} onClick={() => onSynchronize(requestIds)}>Enviar grupo</button>
            <button className="compact-button" type="button" onClick={() => setSelectedGroupId(group.id)}>Ver detalle</button>
            <button className="compact-button" type="button" disabled={disabled} onClick={() => startEditing(group)}>Editar</button>
            <button className="compact-button danger-button" type="button" disabled={disabled} onClick={() => confirmDelete(group)}>Eliminar</button>
          </div>
        </div>
        {nestedGroups.length > 0 && <ul>{nestedGroups.map((nestedGroup) => renderGroup(nestedGroup, depth + 1, nextTrail))}</ul>}
      </li>
    )
  }

  function formatQuantity(count: number, singular: string, plural: string): string {
    return `${count} ${count === 1 ? singular : plural}`
  }
}
