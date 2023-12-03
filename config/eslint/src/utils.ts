export function toArray<T>(data: T) {
  return Array.isArray(data) ? data : [data];
}
