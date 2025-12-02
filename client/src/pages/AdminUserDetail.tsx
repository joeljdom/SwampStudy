import React, { useState, useEffect } from 'react'

type Props = {
  adminUsername: string
  targetUsername: string
  onBack: () => void
}

type UserDetails = {
  username: string
  profile: {
    classes: string[]
    studyPreference: string
    academicYear: string
    studyGoal: string[]
    studyFrequency: string
  }
  friends: string[]
  calendar: Record<string, string>
}

export default function AdminUserDetail({ adminUsername, targetUsername, onBack }: Props) {
  const [details, setDetails] = useState<UserDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [editedProfile, setEditedProfile] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadUserDetails()
  }, [adminUsername, targetUsername])

  async function loadUserDetails() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/admin/user/${encodeURIComponent(adminUsername)}/${encodeURIComponent(targetUsername)}`
      )
      if (!res.ok) throw new Error('Failed to load user details')
      const data = await res.json()
      setDetails(data)
      setEditedProfile(data.profile)
    } catch (err: any) {
      setError(err.message || 'Network error')
    } finally {
      setLoading(false)
    }
  }

  async function saveProfile() {
    if (!editedProfile) return
    setSaving(true)
    try {
      const res = await fetch(
        `/api/admin/user/${encodeURIComponent(adminUsername)}/${encodeURIComponent(targetUsername)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editedProfile)
        }
      )
      if (!res.ok) throw new Error('Failed to save profile')
      setDetails(details ? { ...details, profile: editedProfile } : null)
      setEditMode(false)
      alert('Profile updated successfully!')
    } catch (err: any) {
      setError(err.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="container"><p>Loading user details...</p></div>
  if (error) return <div className="container"><div className="error">{error}</div></div>
  if (!details) return <div className="container"><p>User not found</p></div>

  return (
    <div className="container">
      <div className="banner">
        <img src="/gatorbanner.png" alt="Swamp Study" />
      </div>

      <button className="btn" onClick={onBack} style={{ marginBottom: 16 }}>← Back to Dashboard</button>

      <h2>{targetUsername}</h2>

      {/* Profile Section */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>Profile Information</h3>
          <button
            className="btn"
            onClick={() => setEditMode(!editMode)}
            style={{ padding: '6px 12px', fontSize: '14px' }}
          >
            {editMode ? '✕ Cancel' : '✏️ Edit'}
          </button>
        </div>

        {!editMode ? (
          <>
            <p><strong>Classes:</strong> {details.profile?.classes?.join(', ') || 'None'}</p>
            <p><strong>Study Preference:</strong> {details.profile?.studyPreference || 'Unknown'}</p>
            <p><strong>Academic Year:</strong> {details.profile?.academicYear || 'Unknown'}</p>
            <p><strong>Study Goal:</strong> {Array.isArray(details.profile?.studyGoal) ? details.profile.studyGoal.join(', ') : 'Unknown'}</p>
            <p><strong>Study Frequency:</strong> {details.profile?.studyFrequency || 'Unknown'}</p>
          </>
        ) : (
          <>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>Classes (comma-separated)</label>
              <input
                type="text"
                value={editedProfile?.classes?.join(', ') || ''}
                onChange={(e) => setEditedProfile({
                  ...editedProfile,
                  classes: e.target.value.split(',').map(c => c.trim()).filter(c => c)
                })}
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>Study Preference</label>
              <input
                type="text"
                value={editedProfile?.studyPreference || ''}
                onChange={(e) => setEditedProfile({
                  ...editedProfile,
                  studyPreference: e.target.value
                })}
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>Academic Year</label>
              <input
                type="text"
                value={editedProfile?.academicYear || ''}
                onChange={(e) => setEditedProfile({
                  ...editedProfile,
                  academicYear: e.target.value
                })}
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>Study Frequency</label>
              <input
                type="text"
                value={editedProfile?.studyFrequency || ''}
                onChange={(e) => setEditedProfile({
                  ...editedProfile,
                  studyFrequency: e.target.value
                })}
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              />
            </div>
            <button
              className="btn"
              onClick={saveProfile}
              disabled={saving}
              style={{ padding: '8px 16px' }}
            >
              {saving ? 'Saving...' : '✓ Save Changes'}
            </button>
          </>
        )}
      </div>

      {/* Friends Section */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3>Study Friends ({details.friends?.length || 0})</h3>
        {details.friends && details.friends.length > 0 ? (
          <ul style={{ paddingLeft: 20 }}>
            {details.friends.map((friend) => (
              <li key={friend}>{friend}</li>
            ))}
          </ul>
        ) : (
          <p style={{ color: '#666', fontStyle: 'italic' }}>No friends yet</p>
        )}
      </div>

      {/* Calendar Section */}
      <div className="card">
        <h3>Availability Calendar</h3>
        {details.calendar && Object.keys(details.calendar).length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Date</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(details.calendar).map(([date, status]) => (
                  <tr key={date} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '8px' }}>{date}</td>
                    <td style={{ padding: '8px' }}>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: status === 'available' ? '#d4edda' : '#f8d7da',
                          color: status === 'available' ? '#155724' : '#721c24'
                        }}
                      >
                        {status === 'available' ? '✓ Available' : '✕ Unavailable'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: '#666', fontStyle: 'italic' }}>No calendar data</p>
        )}
      </div>
    </div>
  )
}
