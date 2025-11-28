import React, { useState, useEffect } from 'react'

type Props = {
  username: string
  onBack: () => void
}

export default function Notifications({ username, onBack }: Props) {
  const [pending, setPending] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPending()
  }, [username])

  async function loadPending() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/relationships/pending/${encodeURIComponent(username)}`)
      if (!res.ok) throw new Error('Failed to load notifications')
      const data = await res.json()
      setPending(data.pending || [])
    } catch (err: any) {
      setError(err.message || 'Network error')
    } finally {
      setLoading(false)
    }
  }

  async function handleAccept(fromUser: string) {
    try {
      const res = await fetch('/api/relationships/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: fromUser, to: username })
      })
      if (!res.ok) throw new Error('Failed to accept request')
      // Remove from pending
      setPending(pending.filter(u => u !== fromUser))
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    }
  }

  async function handleDeny(fromUser: string) {
    try {
      const res = await fetch('/api/relationships/deny', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: fromUser, to: username })
      })
      if (!res.ok) throw new Error('Failed to deny request')
      // Remove from pending
      setPending(pending.filter(u => u !== fromUser))
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    }
  }

  return (
    <div className="container">
      <div className="banner"><img src="/gatorbanner.png" alt="Swamp Study" /></div>
      <h2>Friend Requests</h2>
      <button className="btn" onClick={onBack} style={{ marginBottom: 16 }}>← Back</button>

      {loading && <p>Loading requests...</p>}
      {error && <div className="error">{error}</div>}

      {!loading && !error && pending.length === 0 && (
        <div className="card">
          <p>No pending friend requests. Check back later!</p>
        </div>
      )}

      {!loading && !error && pending.length > 0 && (
        <div>
          <p style={{ marginBottom: 16 }}>
            You have <strong>{pending.length}</strong> pending request{pending.length !== 1 ? 's' : ''}.
          </p>
          {pending.map((fromUser) => (
            <div key={fromUser} className="card" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '0 0 8px 0' }}>{fromUser}</h3>
                <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>wants to study together</p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn"
                  style={{ padding: '8px 16px', backgroundColor: '#28a745' }}
                  onClick={() => handleAccept(fromUser)}
                >
                  ✓ Accept
                </button>
                <button
                  className="btn"
                  style={{ padding: '8px 16px', backgroundColor: '#dc3545' }}
                  onClick={() => handleDeny(fromUser)}
                >
                  ✕ Deny
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
