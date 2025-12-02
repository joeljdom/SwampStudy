import React from 'react'

type Props = {
  username: string
  onLogout: () => void
  onNavigate: (page: 'calendar' | 'home') => void
  onEditProfile: () => void
  onViewMatches: () => void
  onViewNotifications: () => void
  onViewFriends: () => void
  onViewDMs: () => void
}

export default function Home({ username, onLogout, onNavigate, onEditProfile, onViewMatches, onViewNotifications, onViewFriends, onViewDMs }: Props) {
  return (
    <div>
      <div className="banner">
        <img src="/gatorbanner.png" alt="Swamp Study Header" onClick={() => {}} style={{ cursor: 'default' }} />
      </div>

      <div className="container">
        <div className="row" style={{ alignItems: 'center' }}>
          <div>
            <h1>Welcome back, <span id="user">{username}</span></h1>
            <p style={{ margin: '6px 0 0', color: '#555' }}>Swamp Study helps you find study partners, manage availability, and organize study goals.</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn" onClick={onLogout} style={{ background: 'white', color: 'var(--uf-blue)', border: '1px solid rgba(0,0,0,0.06)' }}>Log out</button>
          </div>
        </div>

        <div className="card">
          <h2 style={{ marginTop: 0, color: 'var(--uf-blue)' }}>Quick Actions</h2>
          <p style={{ color: '#444' }}>Get started quickly with the most common tasks below.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginTop: 12 }}>
            <div style={{ padding: 12, borderRadius: 10, background: '#fff' }}>
              <h3 style={{ margin: '0 0 8px' }}>Availability</h3>
              <p style={{ margin: 0, color: '#666' }}>Set when you're free and coordinate sessions with classmates.</p>
              <button className="btn" style={{ marginTop: 12 }} onClick={() => onNavigate('calendar')}>View Calendar</button>
            </div>

            <div style={{ padding: 12, borderRadius: 10, background: '#fff' }}>
              <h3 style={{ margin: '0 0 8px' }}>Profile</h3>
              <p style={{ margin: 0, color: '#666' }}>Update your classes, study goals, and preferences so others can find you.</p>
              <button className="btn" style={{ marginTop: 12 }} onClick={onEditProfile}>Edit Profile</button>
            </div>

            <div style={{ padding: 12, borderRadius: 10, background: '#fff' }}>
              <h3 style={{ margin: '0 0 8px' }}>Find Partners</h3>
              <p style={{ margin: 0, color: '#666' }}>Search for study partners and form study groups based on class and goals.</p>
              <button className="btn" style={{ marginTop: 12 }} onClick={onViewMatches}>Find Study Partners</button>
            </div>

            <div style={{ padding: 12, borderRadius: 10, background: '#fff' }}>
              <h3 style={{ margin: '0 0 8px' }}>Messages & Friends</h3>
              <p style={{ margin: 0, color: '#666' }}>View friend requests, message classmates, and keep track of study groups.</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button className="btn" onClick={onViewNotifications}>Friend Requests</button>
                <button className="btn" onClick={onViewFriends}>Study Friends</button>
                <button className="btn" onClick={onViewDMs}>Messages</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
