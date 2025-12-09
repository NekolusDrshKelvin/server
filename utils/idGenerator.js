export function generateId(prefix, lastId) {
  if (!lastId) return `${prefix}0001`;
  const num = parseInt(lastId.slice(prefix.length)) + 1;
  return prefix + num.toString().padStart(4, "0");
}
