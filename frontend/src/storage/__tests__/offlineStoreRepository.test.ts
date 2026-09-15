import { describe, expect, it } from 'vitest'
import type { OfflineStore } from '../../domain/models'
import { LocalStorageOfflineStoreRepository } from '../offlineStoreRepository'

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>()

  get length(): number {
    return this.values.size
  }

  clear(): void {
    this.values.clear()
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null
  }

  key(index: number): string | null {
    return [...this.values.keys()][index] ?? null
  }

  removeItem(key: string): void {
    this.values.delete(key)
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value)
  }
}

describe('LocalStorageOfflineStoreRepository', () => {
  it('persists and restores requests and groups', () => {
    const storage = new MemoryStorage()
    const repository = new LocalStorageOfflineStoreRepository(storage)
    const store: OfflineStore = {
      requests: [{
        id: 'request-1',
        name: 'First request',
        type: 'text',
        payload: 'content',
        status: 'Pending',
        createdAt: '2026-09-15T00:00:00.000Z',
      }],
      groups: [{
        id: 'group-1',
        name: 'Main group',
        children: [{ kind: 'request', id: 'request-1' }],
      }],
    }

    repository.save(store)

    expect(repository.load()).toEqual(store)
  })

  it('returns an empty store when no valid local data exists', () => {
    const storage = new MemoryStorage()
    storage.setItem('gosocket.offline-requests.v1', '{not json')

    expect(new LocalStorageOfflineStoreRepository(storage).load()).toEqual({
      requests: [],
      groups: [],
    })
  })
})
