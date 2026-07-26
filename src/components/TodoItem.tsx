import type { Todo } from '../types.ts'
import EditField from './EditField.tsx'

type Props = {
  todo: Todo
  editing: boolean
  reorderable: boolean
  dragging: boolean
  onToggle: (id: string) => void
  onStartEdit: (id: string) => void
  onCommitEdit: (id: string, text: string) => void
  onCancelEdit: () => void
  onRemove: (id: string) => void
  onDragStart: (id: string) => void
  onDragOver: (id: string) => void
  onDragEnd: () => void
}

export default function TodoItem({
  todo,
  editing,
  reorderable,
  dragging,
  onToggle,
  onStartEdit,
  onCommitEdit,
  onCancelEdit,
  onRemove,
  onDragStart,
  onDragOver,
  onDragEnd,
}: Props) {
  const className = ['item', todo.done && 'is-done', dragging && 'is-dragging']
    .filter(Boolean)
    .join(' ')

  return (
    <li
      className={className}
      draggable={reorderable && !editing}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', todo.id)
        onDragStart(todo.id)
      }}
      onDragOver={(e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        onDragOver(todo.id)
      }}
      onDrop={(e) => e.preventDefault()}
      onDragEnd={onDragEnd}
    >
      <input
        className="check"
        type="checkbox"
        checked={todo.done}
        aria-label={todo.done ? '未完了に戻す' : '完了にする'}
        onChange={() => onToggle(todo.id)}
      />

      {editing ? (
        <EditField
          initialText={todo.text}
          onCommit={(text) => onCommitEdit(todo.id, text)}
          onCancel={onCancelEdit}
        />
      ) : (
        <>
          {/* JSX に埋め込んだ文字列は React が自動でエスケープするので、
              バニラ版で textContent を使っていたのと同じく HTML は解釈されない。 */}
          <span
            className="text"
            title="ダブルクリックで編集"
            onDoubleClick={() => onStartEdit(todo.id)}
          >
            {todo.text}
          </span>
          <button className="icon-btn" type="button" onClick={() => onStartEdit(todo.id)}>
            編集
          </button>
          <button
            className="icon-btn icon-btn-danger"
            type="button"
            onClick={() => onRemove(todo.id)}
          >
            削除
          </button>
        </>
      )}
    </li>
  )
}
