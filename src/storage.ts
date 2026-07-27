import type { Todo } from './types.ts'

/** バニラ版と同じキー・同じ形式。既存のタスクをそのまま読み込めるよう変えていない。 */
export const STORAGE_KEY = 'todo-app.items.v1'

export const MAX_LENGTH = 200

let idCounter = 0

export function newId(): string {
  idCounter += 1
  return `${Date.now().toString(36)}-${idCounter.toString(36)}`
}

/**
 * 保存文字列を Todo の配列にする。
 *
 * localStorage の中身は手で書き換えられるし、将来の形式変更でも壊れうる。
 * 1 件でも壊れていたら全部捨てる、という作りだとタスクを丸ごと失うので、
 * 1 件ずつ検証して通ったものだけを返す。
 *
 * localStorage に触らない純関数なので、そのままテストできる。
 */
export function parseTodos(raw: string | null): Todo[] {
  if (!raw) return []

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return []
  }
  if (!Array.isArray(parsed)) return []

  const todos: Todo[] = []
  for (const entry of parsed) {
    if (typeof entry !== 'object' || entry === null) continue
    const item = entry as Record<string, unknown>
    if (typeof item.text !== 'string' || item.text.trim() === '') continue

    todos.push({
      id: typeof item.id === 'string' ? item.id : newId(),
      text: item.text.slice(0, MAX_LENGTH),
      done: item.done === true,
      createdAt: typeof item.createdAt === 'number' ? item.createdAt : Date.now(),
    })
  }
  return todos
}

export function loadTodos(): Todo[] {
  try {
    return parseTodos(localStorage.getItem(STORAGE_KEY))
  } catch (err) {
    // プライベートモードなどで localStorage 自体が触れないことがある。
    console.warn('保存データを読み込めませんでした:', err)
    return []
  }
}

export function saveTodos(todos: Todo[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  } catch (err) {
    console.warn('保存に失敗しました:', err)
  }
}
