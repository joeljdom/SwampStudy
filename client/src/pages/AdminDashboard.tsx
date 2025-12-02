import React, { useState, useEffect } from 'react'

type Props = {
  username: string
  onLogout: () => void
  onViewUser: (username: string) => void
}

type UserProfile = {
  _id?: string
  username: string
  role: string
  profile?: {
    classes: string[]
    studyPreference: string
    academicYear: string
    studyGoal: string[]
    studyFrequency: string
  }
}

export default function AdminDashboard({ username, onLogout, onViewUser }: Props) {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadUsers()
  }, [username])

  async function loadUsers() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(username)}`)
      if (!res.ok) throw new Error('Failed to load users')
      const data = await res.json()
      setUsers(data || [])
      setFilteredUsers(data || [])
    } catch (err: any) {
      setError(err.message || 'Network error')
    } finally {
      setLoading(false)
    }
  }

  async function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const query = e.target.value
    setSearchQuery(query)

    if (!query.trim()) {
      setFilteredUsers(users)
      return
    }

    setLoading(true)
    try {
      const res = await fetch(
        `/api/admin/search/${encodeURIComponent(username)}?q=${encodeURIComponent(query)}`
      )
      if (!res.ok) throw new Error('Search failed')
      const data = await res.json()
      setFilteredUsers(data || [])
    } catch (err: any) {
      setError(err.message || 'Search failed')
      setFilteredUsers([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="banner">
        <img src="/gatorbanner.png" alt="Swamp Study" />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1>Admin Dashboard</h1>
        <button className="btn" onClick={onLogout}>Log out</button>
      </div>

      {error && <div className="error">{error}</div>}

      {/* Search Bar */}
      <div style={{ marginBottom: 24 }}>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search by username or class..."
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            boxSizing: 'border-box'
          }}
        />
      </div>

      {loading && <p>Loading users...</p>}

      {!loading && filteredUsers.length === 0 && (
        <div className="card">
          <p>{searchQuery ? 'No users found matching your search.' : 'No users available.'}</p>
        </div>
      )}

      {!loading && filteredUsers.length > 0 && (
        <div>
          <p style={{ marginBottom: 16 }}>
            <strong>{filteredUsers.length}</strong> user{filteredUsers.length !== 1 ? 's' : ''} found
          </p>
          {filteredUsers.map((user) => (
            <div key={user.username} className="card" style={{ marginBottom: 16, cursor: 'pointer' }} onClick={() => onViewUser(user.username)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h3 style={{ margin: '0 0 8px 0' }}>{user.username}</h3>
                  {user.profile ? (
                    <>
                      <p style={{ margin: '4px 0' }}>
                        <strong>Classes:</strong> {user.profile.classes.join(', ') || 'None'}
                      </p>
                      <p style={{ margin: '4px 0' }}>
                        <strong>Study Preference:</strong> {user.profile.studyPreference}
                      </p>
                      <p style={{ margin: '4px 0' }}>
                        <strong>Academic Year:</strong> {user.profile.academicYear}
                      </p>
                      <p style={{ margin: '4px 0' }}>
                        <strong>Study Goal:</strong> {Array.isArray(user.profile.studyGoal) ? user.profile.studyGoal.join(', ') : user.profile.studyGoal || 'Unknown'}
                      </p>
                      <p style={{ margin: '4px 0' }}>
                        <strong>Study Frequency:</strong> {user.profile.studyFrequency}
                      </p>
                    </>
                  ) : (
                    <p style={{ color: '#666', fontStyle: 'italic' }}>No profile data</p>
                  )}
                </div>
                <button className="btn" style={{ padding: '8px 16px' }}>View Details →</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
