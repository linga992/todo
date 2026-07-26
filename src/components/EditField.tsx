import { useEffect, useRef, useState } from 'react'
import { MAX_LENGTH } from '../storage.ts'

type Props = {
  initialText: string
  onCommit: (text: string) => void
  onCancel: () => void
}

/**
 * 編集中だけマウントされる入力欄。
 *
 * 編集を始めるたびに新しくマウントされるので、useState の初期値がそのまま
 * 「編集開始時の文字列」になる。useEffect で下書きを同期する必要がない。
 */
export default function EditField({ initialText, onCommit, onCancel }: Props) {
  const [draft, setDraft] = useState(initialText)
  const inputRef = useRef<HTMLInputElement>(null)

  // 確定と取り消しは一度だけ。Enter / Esc の直後に blur が来ても二重に処理しない。
  const settled = useRef(false)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  function commit() {
    if (settled.current) return
    settled.current = true
    onCommit(draft)
  }

  function cancel() {
    if (settled.current) return
    settled.current = true
    onCancel()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    // 変換中の Enter は確定、Esc は変換の取り消し。どちらも IME に任せる。
    if (e.nativeEvent.isComposing) return

    if (e.key === 'Enter') {
      e.preventDefault()
      commit()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      cancel()
    }
  }

  return (
    <input
      ref={inputRef}
      className="edit-input"
      type="text"
      value={draft}
      maxLength={MAX_LENGTH}
      aria-label="タスクを編集"
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={handleKeyDown}
    />
  )
}
