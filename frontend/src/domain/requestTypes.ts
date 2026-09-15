export const requestTypes = [
  { value: 'text', label: 'Texto limpio' },
  { value: 'uppercase', label: 'Mayúsculas' },
  { value: 'reverse', label: 'Texto invertido' },
]

export function requestTypeLabel(type: string): string {
  return requestTypes.find((item) => item.value === type)?.label ?? type
}
