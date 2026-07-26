import { useEffect, useState } from 'react'
import type { Filter, Todo } from './types.ts'
import { MAX_LENGTH, STORAGE_KEY, loadTodos, newId, parseTodos, saveTodos } from './storage.ts'
import { moveItem } from './reorder.ts'
import NewTodoForm from './components/NewTodoForm.tsx'
import Filters from './components/Filters.tsx'
import TodoList from './components/TodoList.tsx'

const EMPTY_MESSAGE: Record<Filter, string> = {
  all: 'まだタスクがありません。上の入力欄から追加してください。',
  active: '未完了のタスクはありません。',
  done: '完了したタスクはまだありません。',
}

export default function App() {
  // loadTodos を呼ばずに関数のまま渡す。こうすると初回レンダー時だけ実行される。
  const [todos, setTodos] = useState<Todo[]>(loadTodos)
  const [filter, setFilter] = useState<Filter>('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)

  useEffect(() => {
    saveTodos(todos)
  }, [todos])

  // 同じアプリを別タブでも開いている場合に表示を合わせる。
  // storage イベントは書き込んだタブ自身には飛ばないので、保存と往復しない。
  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key !== STORAGE_KEY) return
      setTodos(parseTodos(e.newValue))
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  function addTodo(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return
    setTodos((prev) => [
      ...prev,
      {
        id: newId(),
        text: trimmed.slice(0, MAX_LENGTH),
        done: false,
        createdAt: Date.now(),
      },
    ])
  }

  function toggleTodo(id: string) {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  }

  function removeTodo(id: string) {
    setTodos((prev) => prev.filter((t) => t.id !== id))
  }

  function commitEdit(id: string, text: string) {
    setEditingId(null)
    const trimmed = text.trim()
    // 中身を空にして確定したら削除扱い。バニラ版と同じ挙動。
    if (!trimmed) {
      removeTodo(id)
      return
    }
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, text: trimmed.slice(0, MAX_LENGTH) } : t)),
    )
  }

  function clearDone() {
    const count = todos.filter((t) => t.done).length
    if (count === 0) return
    if (!window.confirm(`完了済みの ${count} 件を削除します。よろしいですか？`)) return
    setTodos((prev) => prev.filter((t) => !t.done))
  }

  function handleDragOver(overId: string) {
    if (!draggingId) return
    setTodos((prev) => moveItem(prev, draggingId, overId))
  }

  const visible =
    filter === 'active'
      ? todos.filter((t) => !t.done)
      : filter === 'done'
        ? todos.filter((t) => t.done)
        : todos

  const remaining = todos.filter((t) => !t.done).length

  // 絞り込み中は隠れた行との前後関係が決まらないので並べ替えを無効化する。
  const reorderable = filter === 'all' && todos.length > 1

  return (
    <main className="app">
      <header className="app-header">
        <h1 className="title">TODO</h1>
        <p className="summary">
          {todos.length > 0 && `残り ${remaining} 件 / 全 ${todos.length} 件`}
        </p>
      </header>

      <NewTodoForm onAdd={addTodo} />

      <Filters
        value={filter}
        onChange={setFilter}
        onClearDone={clearDone}
        clearDoneDisabled={remaining === todos.length}
      />

      <TodoList
        todos={visible}
        editingId={editingId}
        draggingId={draggingId}
        reorderable={reorderable}
        onToggle={toggleTodo}
        onStartEdit={setEditingId}
        onCommitEdit={commitEdit}
        onCancelEdit={() => setEditingId(null)}
        onRemove={removeTodo}
        onDragStart={setDraggingId}
        onDragOver={handleDragOver}
        onDragEnd={() => setDraggingId(null)}
      />

      {visible.length === 0 && <p className="empty">{EMPTY_MESSAGE[filter]}</p>}

      <footer className="app-footer">
        <p>ダブルクリックで編集 ・ ドラッグで並べ替え（「すべて」表示のとき）</p>
        <p>データはこのブラウザ内（localStorage）に保存されます。</p>
      </footer>
    </main>
  )
}
