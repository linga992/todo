import { useState } from 'react'
import { MAX_LENGTH } from '../storage.ts'

type Props = {
  onAdd: (text: string) => void
}

export default function NewTodoForm({ onAdd }: Props) {
  const [text, setText] = useState('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!text.trim()) return
    onAdd(text)
    setText('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    // 日本語入力では Enter が変換の確定に使われる。そのときの keydown は
    // isComposing が true になるので、送信せず IME に処理を任せる。
    // これを見ないと、変換途中の文字列がタスクとして登録されてしまう。
    if (e.key !== 'Enter' || e.nativeEvent.isComposing) return
    e.preventDefault()
    // required の検証を通すため submit() ではなく requestSubmit() を使う。
    e.currentTarget.form?.requestSubmit()
  }

  return (
    <form className="new-form" onSubmit={handleSubmit} autoComplete="off">
      <input
        className="new-input"
        type="text"
        value={text}
        placeholder="やることを入力して Enter"
        maxLength={MAX_LENGTH}
        aria-label="新しいタスク"
        required
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button className="btn btn-primary" type="submit">
        追加
      </button>
    </form>
  )
}
