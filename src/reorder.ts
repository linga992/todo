/**
 * draggedId の要素を targetId の位置へ移動した新しい配列を返す。
 *
 * 動かす必要がないときは元の配列をそのまま返す。ドラッグ中は dragover が大量に
 * 飛んでくるので、参照が同じなら React が再レンダリングを省いてくれる。
 */
export function moveItem<T extends { id: string }>(
  items: T[],
  draggedId: string,
  targetId: string,
): T[] {
  if (draggedId === targetId) return items

  const from = items.findIndex((item) => item.id === draggedId)
  const to = items.findIndex((item) => item.id === targetId)
  if (from === -1 || to === -1) return items

  const next = items.slice()
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return next
}
