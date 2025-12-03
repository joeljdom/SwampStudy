import React, { useState, useEffect } from 'react'
import { CLASS_OPTIONS, STUDY_PREFERENCES, ACADEMIC_YEARS, STUDY_GOALS, STUDY_FREQUENCIES } from '../lib/profileOptions'

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
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Load user details failed:', res.status, errData)
        throw new Error(errData.error || 'Failed to load user details')
      }
      const data = await res.json()
      console.log('Loaded user details:', data)
      setDetails(data)
      setEditedProfile({
        classes: Array.isArray(data.profile?.classes) ? data.profile.classes : [],
        studyPreference: data.profile?.studyPreference || STUDY_PREFERENCES[0].value,
        academicYear: data.profile?.academicYear || ACADEMIC_YEARS[0].value,
        studyGoal: Array.isArray(data.profile?.studyGoal) ? data.profile.studyGoal : (data.profile?.studyGoal ? [data.profile.studyGoal] : []),
        studyFrequency: data.profile?.studyFrequency || STUDY_FREQUENCIES[0].value
      })
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
              <label style={{ display: 'block', marginBottom: 12, fontSize: '16px', fontWeight: 600, color: '#0021A5' }}>
                Classes (select all that apply)
              </label>
              <div style={{ 
                border: '2px solid #e5ecff', 
                borderRadius: 12, 
                padding: 12, 
                backgroundColor: '#fafbff',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: 10
              }}>
                {CLASS_OPTIONS.map(c => (
                  <label key={c} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, cursor: 'pointer', backgroundColor: editedProfile?.classes?.includes(c) ? '#e5ecff' : 'transparent', border: editedProfile?.classes?.includes(c) ? '2px solid #0021A5' : '2px solid transparent' }}>
                    <input type="checkbox" checked={editedProfile?.classes?.includes(c)} onChange={(e) => {
                      const checked = e.target.checked
                      setEditedProfile((prev: any) => {
                        const prevClasses = prev?.classes || []
                        return { ...prev, classes: checked ? [...prevClasses, c] : prevClasses.filter((x: string) => x !== c) }
                      })
                    }} style={{ width: 18, height: 18, accentColor: '#0021A5' }} />
                    <span style={{ fontSize: 14 }}>{c}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>Academic year</label>
              <select value={editedProfile?.academicYear || ''} onChange={(e) => setEditedProfile({ ...editedProfile, academicYear: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: 8, border: '2px solid #e5ecff', backgroundColor:'#fafbff' }}>
                {ACADEMIC_YEARS.map(y => <option key={y.value} value={y.value}>{y.label}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 12, fontSize: '16px', fontWeight: 600, color: '#0021A5' }}>
                Study goals (select all that apply)
              </label>
              <div style={{ border: '2px solid #e5ecff', borderRadius: 12, padding: 12, backgroundColor: '#fafbff', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {STUDY_GOALS.map(g => (
                  <label key={g.value} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, cursor: 'pointer', backgroundColor: editedProfile?.studyGoal?.includes(g.value) ? '#e5ecff' : 'transparent', border: editedProfile?.studyGoal?.includes(g.value) ? '2px solid #0021A5' : '2px solid transparent' }}>
                    <input type="checkbox" checked={editedProfile?.studyGoal?.includes(g.value)} onChange={() => {
                      setEditedProfile((prev: any) => {
                        const prevGoals = prev?.studyGoal || []
                        return { ...prev, studyGoal: prevGoals.includes(g.value) ? prevGoals.filter((x: string) => x !== g.value) : [...prevGoals, g.value] }
                      })
                    }} style={{ width: 18, height: 18, accentColor: '#0021A5' }} />
                    <span style={{ fontSize: 15 }}>{g.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>Study Frequency</label>
              <select value={editedProfile?.studyFrequency || ''} onChange={(e) => setEditedProfile({ ...editedProfile, studyFrequency: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: 8, border: '2px solid #e5ecff', backgroundColor:'#fafbff' }}>
                {STUDY_FREQUENCIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>Study Preference</label>
              <select value={editedProfile?.studyPreference || ''} onChange={(e) => setEditedProfile({ ...editedProfile, studyPreference: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: 8, border: '2px solid #e5ecff', backgroundColor:'#fafbff' }}>
                {STUDY_PREFERENCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            <div style={{ marginTop: 8 }}>
              <button className="btn" onClick={saveProfile} disabled={saving} style={{ padding: '10px 16px' }}>{saving ? 'Saving...' : '✓ Save Changes'}</button>
            </div>
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
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 600, color: 'var(--uf-blue)' }}>Date</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 600, color: 'var(--uf-blue)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(details.calendar).sort(([a], [b]) => a.localeCompare(b)).map(([date, status]) => (
                  <tr key={date} style={{ borderBottom: '1px solid #e5ecff' }}>
                    <td style={{ padding: '10px 8px' }}>{new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td style={{ padding: '10px 8px' }}>
                      <span
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: 500,
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
          <p style={{ color: '#666', fontStyle: 'italic', marginTop: 8 }}>No availability data set</p>
        )}
      </div>
    </div>
  )
}
