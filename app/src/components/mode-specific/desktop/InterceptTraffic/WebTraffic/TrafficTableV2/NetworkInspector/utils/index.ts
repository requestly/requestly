export function getColumnKey(dataIndex: string | string[], defaultKey?: string): string | null {
  if (dataIndex) {
    return Array.isArray(dataIndex) ? dataIndex.join(".") : dataIndex;
  }

  return defaultKey;
}
