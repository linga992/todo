import { describe, expect, it } from 'vitest'
import { moveItem } from './reorder.ts'

const items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }]
const ids = (list: { id: string }[]) => list.map((item) => item.id)

describe('moveItem', () => {
  it('前から後ろへ動かす', () => {
    expect(ids(moveItem(items, 'a', 'c'))).toEqual(['b', 'c', 'a', 'd'])
  })

  it('後ろから前へ動かす', () => {
    expect(ids(moveItem(items, 'd', 'b'))).toEqual(['a', 'd', 'b', 'c'])
  })

  it('隣同士の入れ替え', () => {
    expect(ids(moveItem(items, 'a', 'b'))).toEqual(['b', 'a', 'c', 'd'])
  })

  it('元の配列は書き換えない', () => {
    moveItem(items, 'a', 'd')
    expect(ids(items)).toEqual(['a', 'b', 'c', 'd'])
  })

  it('同じ id なら同一参照を返す（React の再レンダリングを省くため）', () => {
    expect(moveItem(items, 'a', 'a')).toBe(items)
  })

  it('存在しない id なら同一参照を返す', () => {
    expect(moveItem(items, 'x', 'b')).toBe(items)
    expect(moveItem(items, 'a', 'x')).toBe(items)
  })

  it('要素数は変わらない', () => {
    expect(moveItem(items, 'b', 'd')).toHaveLength(items.length)
  })
})
