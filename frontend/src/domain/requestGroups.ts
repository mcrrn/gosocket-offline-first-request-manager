import type { RequestGroup } from './models'

export function assertGroupsAreAcyclic(groups: RequestGroup[]): void {
  const groupsById = new Map(groups.map((item) => [item.id, item]))
  const visiting = new Set<string>()
  const visited = new Set<string>()

  const visit = (groupId: string): void => {
    if (visiting.has(groupId)) {
      throw new Error(`La agrupación '${groupId}' forma un ciclo.`)
    }
    if (visited.has(groupId)) return

    visiting.add(groupId)
    const group = groupsById.get(groupId)
    if (group) {
      for (const child of group.children) {
        if (child.kind === 'group') visit(child.id)
      }
    }
    visiting.delete(groupId)
    visited.add(groupId)
  }

  for (const group of groups) visit(group.id)
}

export function wouldCreateGroupCycle(
  parentGroupId: string,
  childGroupId: string,
  groups: RequestGroup[],
): boolean {
  if (parentGroupId === childGroupId) return true

  const groupsById = new Map(groups.map((item) => [item.id, item]))
  const visited = new Set<string>()
  const reachesParent = (groupId: string): boolean => {
    if (groupId === parentGroupId) return true
    if (visited.has(groupId)) return false
    visited.add(groupId)

    const group = groupsById.get(groupId)
    return group?.children.some(
      (child) => child.kind === 'group' && reachesParent(child.id),
    ) ?? false
  }

  return reachesParent(childGroupId)
}

export function collectRequestIds(group: RequestGroup, groups: RequestGroup[]): string[] {
  assertGroupsAreAcyclic(groups)
  const groupsById = new Map(groups.map((item) => [item.id, item]))
  const visitedGroups = new Set<string>()
  const requestIds = new Set<string>()

  const visit = (current: RequestGroup): void => {
    if (visitedGroups.has(current.id)) return
    visitedGroups.add(current.id)

    for (const child of current.children) {
      if (child.kind === 'request') {
        requestIds.add(child.id)
        continue
      }

      const nestedGroup = groupsById.get(child.id)
      if (nestedGroup) visit(nestedGroup)
    }
  }

  visit(group)
  return [...requestIds]
}
