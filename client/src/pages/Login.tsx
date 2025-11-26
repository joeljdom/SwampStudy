import React, { useState } from 'react'

type Props = {
  // onAuth(username, firstTime?) — firstTime=true when a new signup just occurred
  onAuth: (username: string, firstTime?: boolean) => void
}

export default function Login({ onAuth }: Props) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!username.trim() || !password.trim()) return

    try {
      const res = await fetch(`/api/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password: password.trim() })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Something went wrong')
        return
      }
      // If we just signed up, treat this as first-time and route to profile creation
      if (mode === 'signup') {
        onAuth(data.username, true)
      } else {
        onAuth(data.username)
      }
    } catch (err) {
      setError('Network error')
    }
  }

  return (
    <div className="login-root">
      <img src="/gatorwelcome.png" alt="Swamp Study Logo" width={200} style={{ display: 'block', margin: '0 auto 10px' }} />
      <h1>🐊 Swamp Study</h1>
      <div className="tabs">
        <button className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setError('') }}>Log In</button>
        <button className={mode === 'signup' ? 'active' : ''} onClick={() => { setMode('signup'); setError('') }}>Sign Up</button>
      </div>

      <form onSubmit={submit}>
        <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" required />
        <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" required />
        <div className="error">{error}</div>
        <button className="btn" type="submit">{mode === 'login' ? 'Log In' : 'Sign Up'}</button>
      </form>
    </div>
  )
}
