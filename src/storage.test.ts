import { describe, expect, it } from 'vitest'
import { MAX_LENGTH, parseTodos } from './storage.ts'

describe('parseTodos', () => {
  it('null や空文字なら空配列', () => {
    expect(parseTodos(null)).toEqual([])
    expect(parseTodos('')).toEqual([])
  })

  it('JSON として壊れていても落ちずに空配列', () => {
    expect(parseTodos('{壊れたJSON')).toEqual([])
  })

  it('配列でない JSON なら空配列', () => {
    expect(parseTodos('"文字列"')).toEqual([])
    expect(parseTodos('{"a":1}')).toEqual([])
    expect(parseTodos('null')).toEqual([])
  })

  it('正常な 1 件をそのまま読める', () => {
    const raw = JSON.stringify([{ id: 'abc', text: '牛乳を買う', done: true, createdAt: 123 }])
    expect(parseTodos(raw)).toEqual([{ id: 'abc', text: '牛乳を買う', done: true, createdAt: 123 }])
  })

  it('壊れた要素だけを捨てて、正常な要素は残す', () => {
    const raw = JSON.stringify([
      { id: 'a', text: '残る 1', done: false, createdAt: 1 },
      null, // オブジェクトでない
      'ただの文字列', // オブジェクトでない
      { done: true }, // text が無い
      { text: '   ' }, // 空白のみ
      { text: 42 }, // text が文字列でない
      { id: 'b', text: '残る 2', done: true, createdAt: 2 },
    ])

    expect(parseTodos(raw).map((t) => t.text)).toEqual(['残る 1', '残る 2'])
  })

  it('id と createdAt が欠けていれば補う', () => {
    const parsed = parseTodos(JSON.stringify([{ text: 'id なし' }]))

    expect(parsed).toHaveLength(1)
    expect(typeof parsed[0].id).toBe('string')
    expect(parsed[0].id).not.toBe('')
    expect(typeof parsed[0].createdAt).toBe('number')
  })

  it('done は真偽値に正規化する', () => {
    const raw = JSON.stringify([
      { text: 'a', done: 'yes' },
      { text: 'b', done: 1 },
      { text: 'c', done: true },
      { text: 'd' },
    ])

    expect(parseTodos(raw).map((t) => t.done)).toEqual([false, false, true, false])
  })

  it('長すぎる text は上限で切る', () => {
    const long = 'あ'.repeat(MAX_LENGTH + 50)
    const parsed = parseTodos(JSON.stringify([{ text: long }]))

    expect(parsed[0].text).toHaveLength(MAX_LENGTH)
  })

  it('補った id は要素ごとに異なる', () => {
    const raw = JSON.stringify([{ text: 'a' }, { text: 'b' }, { text: 'c' }])
    const ids = parseTodos(raw).map((t) => t.id)

    expect(new Set(ids).size).toBe(3)
  })
})
