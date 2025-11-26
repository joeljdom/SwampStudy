import React from 'react'

type Props = {
  username: string
  onLogout: () => void
  onNavigate: (page: 'calendar' | 'home') => void
  onEditProfile: () => void
  onViewMatches: () => void
}

export default function Home({ username, onLogout, onNavigate, onEditProfile, onViewMatches }: Props) {
  return (
    <div>
      <div className="banner">
        <img src="/gatorbanner.png" alt="Swamp Study Header" />
      </div>

      <div className="container">
        <div className="row">
          <h1>Welcome, <span id="user">{username}</span> 👋</h1>
          <button className="btn" onClick={onLogout}>Log out</button>
        </div>

        <div className="card">
          <p>Welcome to <strong>Swamp Study</strong>! You're now logged in and connected to our backend system.</p>
          <p>Your account info is saved in our local database (<code>users.json</code>).</p>
          <button className="btn" style={{ marginTop: 16, display: 'inline-block' }} onClick={() => onNavigate('calendar')}>📅 View Calendar</button>
          <button className="btn" style={{ marginTop: 16, marginLeft: 12, display: 'inline-block' }} onClick={onEditProfile}>✏️ Edit Profile</button>
          <button className="btn" style={{ marginTop: 16, marginLeft: 12, display: 'inline-block' }} onClick={onViewMatches}>🤝 Find Study Partners</button>
        </div>
      </div>
    </div>
  )
}
