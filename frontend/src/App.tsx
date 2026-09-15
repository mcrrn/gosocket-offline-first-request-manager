import { useEffect, useMemo, useState } from 'react'
import { GroupManager } from './components/GroupManager'
import { RequestDetail } from './components/RequestDetail'
import { RequestForm, type NewRequestValues } from './components/RequestForm'
import { RequestList } from './components/RequestList'
import type { GroupChild, LocalRequest, OfflineStore } from './domain/models'
import { ReverseTextRequestProcessor, TextRequestProcessor, UppercaseRequestProcessor } from './domain/requestProcessor'
import { RequestProcessorRegistry } from './domain/requestProcessorRegistry'
import { requestApiFromEnvironment } from './services/requestApi'
import { synchronizePendingRequests } from './services/synchronizer'
import { LocalStorageOfflineStoreRepository } from './storage/offlineStoreRepository'

const processors = new RequestProcessorRegistry({
  text: new TextRequestProcessor(),
  uppercase: new UppercaseRequestProcessor(),
  reverse: new ReverseTextRequestProcessor(),
})

function App() {
  const repository = useMemo(() => new LocalStorageOfflineStoreRepository(), [])
  const api = useMemo(() => requestApiFromEnvironment(), [])
  const [store, setStore] = useState<OfflineStore>(() => repository.load())
  const [selectedRequest, setSelectedRequest] = useState<LocalRequest | null>(null)
  const [isSynchronizing, setIsSynchronizing] = useState(false)
  const [message, setMessage] = useState('')

  const pendingCount = store.requests.filter((request) => request.status === 'Pending').length

  useEffect(() => {
    repository.save(store)
  }, [repository, store])

  function createRequest(values: NewRequestValues) {
    if (!values.name) return

    const request: LocalRequest = {
      id: crypto.randomUUID(),
      name: values.name,
      type: values.type,
      payload: values.payload,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    }

    setStore((current) => ({ ...current, requests: [request, ...current.requests] }))
  }

  function createGroup(name: string, selectedChildren: string[]) {
    const children: GroupChild[] = selectedChildren.map((value) => {
      const [kind, id] = value.split(':')
      return kind === 'request' ? { kind: 'request', id } : { kind: 'group', id }
    })

    setStore((current) => ({
      ...current,
      groups: [{ id: crypto.randomUUID(), name, children }, ...current.groups],
    }))
  }

  async function synchronize(ids: string[]) {
    const requests = store.requests.filter((request) => ids.includes(request.id))
    const pendingRequests = requests.filter((request) => request.status === 'Pending')
    if (pendingRequests.length === 0) {
      setMessage('No hay solicitudes pendientes para enviar.')
      return
    }

    setIsSynchronizing(true)
    const result = await synchronizePendingRequests(requests, processors, api)
    const synchronizedById = new Map(result.requests.map((request) => [request.id, request]))

    setStore((current) => ({
      ...current,
      requests: current.requests.map((request) => synchronizedById.get(request.id) ?? request),
    }))
    setSelectedRequest((current) => current === null ? null : synchronizedById.get(current.id) ?? current)
    setMessage(`${pendingRequests.length} solicitud(es): ${result.processed} enviada(s), ${result.failed} fallida(s), ${result.pending} pendiente(s).`)
    setIsSynchronizing(false)
  }

  return (
    <main>
      <header>
        <h1>Gestor de solicitudes</h1>
        <p>Las solicitudes se guardan localmente antes de enviarse.</p>
      </header>

      <RequestForm onCreate={createRequest} />
      <GroupManager
        requests={store.requests}
        groups={store.groups}
        disabled={isSynchronizing}
        onCreate={createGroup}
        onSynchronize={synchronize}
      />

      <section>
        <h2>Solicitudes</h2>
        <p>{pendingCount} pendiente(s) de envío.</p>
        <button
          type="button"
          onClick={() => synchronize(store.requests.map((request) => request.id))}
          disabled={isSynchronizing || pendingCount === 0}
        >
          {isSynchronizing ? 'Enviando...' : 'Enviar pendientes'}
        </button>

        {message && <p role="status">{message}</p>}

        <RequestList
          requests={store.requests}
          disabled={isSynchronizing}
          onSelect={setSelectedRequest}
          onSynchronize={(id) => synchronize([id])}
        />
      </section>

      {selectedRequest && <RequestDetail request={selectedRequest} onClose={() => setSelectedRequest(null)} />}
    </main>
  )
}

export default App
