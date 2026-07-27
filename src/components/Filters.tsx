import type { Filter } from '../types.ts'

const OPTIONS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'すべて' },
  { value: 'active', label: '未完了' },
  { value: 'done', label: '完了' },
]

type Props = {
  value: Filter
  onChange: (filter: Filter) => void
  onClearDone: () => void
  clearDoneDisabled: boolean
}

export default function Filters({ value, onChange, onClearDone, clearDoneDisabled }: Props) {
  return (
    <div className="toolbar">
      <div className="filters" role="group" aria-label="表示の絞り込み">
        {OPTIONS.map((option) => (
          <button
            key={option.value}
            className={option.value === value ? 'filter is-active' : 'filter'}
            type="button"
            aria-pressed={option.value === value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <button
        className="btn btn-ghost"
        type="button"
        disabled={clearDoneDisabled}
        onClick={onClearDone}
      >
        完了を削除
      </button>
    </div>
  )
}
