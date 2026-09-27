import { useState } from 'react'
import { PASSCODE_HASH, hashPasscode } from '../config/access'

// Full-page passcode gate shown before the app. Calls onUnlock with the
// passcode's fingerprint once the right code is entered.
export default function LockScreen({ onUnlock }) {
  const [code, setCode] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState(false)
  const [checking, setChecking] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!code.trim() || checking) return
    setChecking(true)
    const hash = await hashPasscode(code)
    setChecking(false)
    if (hash === PASSCODE_HASH) {
      onUnlock(hash)
    } else {
      setError(true)
    }
  }

  return (
    <main className="lock">
      <form className="lock-card" onSubmit={submit}>
        <img src="/apalsa-logo.png" alt="APALSA" className="lock-logo" />
        <h1>UVA Law Course Scheduler</h1>
        <p className="lock-sub">
          This scheduler is for UVA Law students. Enter the passcode shared by APALSA
          to continue.
        </p>

        <label className="lock-field">
          <span className="sr-only">Passcode</span>
          <input
            type={show ? 'text' : 'password'}
            value={code}
            onChange={(e) => {
              setCode(e.target.value)
              setError(false)
            }}
            placeholder="Passcode"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            autoFocus
            aria-invalid={error}
            aria-describedby={error ? 'lock-error' : undefined}
          />
          <button
            type="button"
            className="lock-show"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? 'Hide passcode' : 'Show passcode'}
          >
            {show ? 'Hide' : 'Show'}
          </button>
        </label>

        {error && (
          <p id="lock-error" className="lock-error" role="alert">
            That passcode isn&rsquo;t right. Ask APALSA for the current code.
          </p>
        )}

        <button type="submit" className="lock-submit" disabled={!code.trim() || checking}>
          Unlock
        </button>

        <p className="lock-help">
          Don&rsquo;t have the passcode? Email Diann at{' '}
          <a href="mailto:wzu2ub@virginia.edu">wzu2ub@virginia.edu</a>
        </p>
      </form>
    </main>
  )
}
