import { describe, expect, it } from 'vitest'
import type { RequestGroup } from '../models'
import {
  assertGroupsAreAcyclic,
  collectRequestIds,
  wouldCreateGroupCycle,
} from '../requestGroups'

describe('collectRequestIds', () => {
  it('collects requests from nested groups without duplicates', () => {
    const child: RequestGroup = {
      id: 'child',
      name: 'Child group',
      children: [
        { kind: 'request', id: 'request-2' },
        { kind: 'request', id: 'request-1' },
      ],
    }
    const parent: RequestGroup = {
      id: 'parent',
      name: 'Parent group',
      children: [
        { kind: 'request', id: 'request-1' },
        { kind: 'group', id: 'child' },
      ],
    }

    expect(collectRequestIds(parent, [parent, child])).toEqual(['request-1', 'request-2'])
  })

  it('rejects direct and indirect cycles', () => {
    const first: RequestGroup = {
      id: 'first',
      name: 'First group',
      children: [{ kind: 'group', id: 'second' }],
    }
    const second: RequestGroup = {
      id: 'second',
      name: 'Second group',
      children: [{ kind: 'group', id: 'first' }],
    }

    expect(() => assertGroupsAreAcyclic([first, second])).toThrow('forma un ciclo')
    expect(wouldCreateGroupCycle('first', 'second', [first, second])).toBe(true)
    expect(wouldCreateGroupCycle('first', 'first', [first, second])).toBe(true)
  })
})
