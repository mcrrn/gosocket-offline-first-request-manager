import type { OfflineStore } from '../domain/models'
import { assertGroupsAreAcyclic } from '../domain/requestGroups'

export interface OfflineStoreRepository {
  load(): OfflineStore
  save(store: OfflineStore): void
}

export class LocalStorageOfflineStoreRepository implements OfflineStoreRepository {
  private readonly storage: Storage
  private readonly storageKey: string

  constructor(
    storage: Storage = localStorage,
    storageKey = 'gosocket.offline-requests.v1',
  ) {
    this.storage = storage
    this.storageKey = storageKey
  }

  load(): OfflineStore {
    const storedValue = this.storage.getItem(this.storageKey)
    if (storedValue === null) return emptyStore()

    try {
      const store = JSON.parse(storedValue) as Partial<OfflineStore>
      if (!Array.isArray(store.requests) || !Array.isArray(store.groups)) return emptyStore()
      assertGroupsAreAcyclic(store.groups)
      return { requests: store.requests, groups: store.groups }
    } catch {
      return emptyStore()
    }
  }

  save(store: OfflineStore): void {
    assertGroupsAreAcyclic(store.groups)
    this.storage.setItem(this.storageKey, JSON.stringify(store))
  }
}

function emptyStore(): OfflineStore {
  return { requests: [], groups: [] }
}
