import type { Todo } from '../types.ts'
import TodoItem from './TodoItem.tsx'

type Props = {
  todos: Todo[]
  editingId: string | null
  draggingId: string | null
  reorderable: boolean
  onToggle: (id: string) => void
  onStartEdit: (id: string) => void
  onCommitEdit: (id: string, text: string) => void
  onCancelEdit: () => void
  onRemove: (id: string) => void
  onDragStart: (id: string) => void
  onDragOver: (id: string) => void
  onDragEnd: () => void
}

export default function TodoList({ todos, editingId, draggingId, ...handlers }: Props) {
  return (
    <ul className="list">
      {todos.map((todo) => (
        // key に id を渡すのが並べ替えの前提。これがあると React は要素を作り直さず
        // 既存の DOM ノードを移動するので、ドラッグ操作が途中で切れない。
        <TodoItem
          key={todo.id}
          todo={todo}
          editing={todo.id === editingId}
          dragging={todo.id === draggingId}
          {...handlers}
        />
      ))}
    </ul>
  )
}
