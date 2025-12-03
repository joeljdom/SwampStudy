import React, { useState, useEffect } from 'react'

type Props = {
  username: string
  onBack: () => void
  goHome: () => void
  onMessageClick?: (friendUsername: string) => void
  onViewCalendar?: (friendUsername: string) => void
}

type ProfileData = {
  classes: string[]
  studyPreference: string
  academicYear: string
  studyGoal: string
  studyFrequency: string
}

type Friend = {
  username: string
  profile: ProfileData | null
}

export default function Friends({ username, onBack, goHome, onMessageClick, onViewCalendar }: Props) {
  const [friendsList, setFriendsList] = useState<Friend[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadFriends()
  }, [username])

  async function loadFriends() {
    setLoading(true)
    setError(null)
    try {
      // Fetch friends list
      const friendsRes = await fetch(`/api/relationships/friends/${encodeURIComponent(username)}`)
      if (!friendsRes.ok) throw new Error('Failed to load friends')
      const friendsData = await friendsRes.json()

      // Fetch all profiles
      const profilesRes = await fetch('/api/profiles')
      if (!profilesRes.ok) throw new Error('Failed to load profiles')
      const profiles = await profilesRes.json()

      // Build friends list with profiles
      const friends: Friend[] = (friendsData.friends || []).map((friendUsername: string) => ({
        username: friendUsername,
        profile: profiles[friendUsername] || null
      }))

      setFriendsList(friends)
    } catch (err: any) {
      setError(err.message || 'Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="banner">
        <img src="/gatorbanner.png" alt="Swamp Study" onClick={goHome} />
        <button className="banner-home-btn" onClick={goHome}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          Home
        </button>
      </div>
      <h2>Study Friends</h2>
      <button className="btn" onClick={onBack} style={{ marginBottom: 16 }}>← Back</button>

      {loading && <p>Loading friends...</p>}
      {error && <div className="error">{error}</div>}

      {!loading && !error && friendsList.length === 0 && (
        <div className="card">
          <p>No study friends yet. Start by finding matches to add friends!</p>
        </div>
      )}

      {!loading && !error && friendsList.length > 0 && (
        <div>
          <p style={{ marginBottom: 16 }}>
            You have <strong>{friendsList.length}</strong> study friend{friendsList.length !== 1 ? 's' : ''}.
          </p>
          {friendsList.map((friend) => (
            <div key={friend.username} className="card" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: '0 0 12px 0' }}>{friend.username}</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {onViewCalendar && (
                    <button
                      className="btn"
                      onClick={() => onViewCalendar(friend.username)}
                      style={{ padding: '6px 12px', fontSize: '14px' }}
                    >
                      📅 View Calendar
                    </button>
                  )}
                  {onMessageClick && (
                    <button
                      className="btn"
                      onClick={() => onMessageClick(friend.username)}
                      style={{ padding: '6px 12px', fontSize: '14px' }}
                    >
                      💬 Message
                    </button>
                  )}
                </div>
              </div>
              
              {friend.profile ? (
                <>
                  <p style={{ margin: '4px 0' }}>
                    <strong>Classes:</strong> {friend.profile.classes.join(', ') || 'None listed'}
                  </p>
                  <p style={{ margin: '4px 0' }}>
                    <strong>Academic Year:</strong> {friend.profile.academicYear}
                  </p>
                  <p style={{ margin: '4px 0' }}>
                    <strong>Study Preference:</strong> {friend.profile.studyPreference}
                  </p>
                  <p style={{ margin: '4px 0' }}>
                    <strong>Study Goal:</strong> {friend.profile.studyGoal}
                  </p>
                  <p style={{ margin: '4px 0' }}>
                    <strong>Study Frequency:</strong> {friend.profile.studyFrequency}
                  </p>
                </>
              ) : (
                <p style={{ color: '#666', fontStyle: 'italic' }}>No profile information available</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
