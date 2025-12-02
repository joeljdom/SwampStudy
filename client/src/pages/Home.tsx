import React from 'react'

type Props = {
  username: string
  onLogout: () => void
  onNavigate: (page: 'calendar' | 'home') => void
  onEditProfile: () => void
  onViewMatches: () => void
  onViewNotifications: () => void
  onViewFriends: () => void
}

export default function Home({ username, onLogout, onNavigate, onEditProfile, onViewMatches, onViewNotifications, onViewFriends }: Props) {
  return (
    <div>
      <div className="banner">
        <img src="/gatorbanner.png" alt="Swamp Study Header" onClick={() => {}} style={{ cursor: 'default' }} />
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
          <button className="btn" style={{ marginTop: 16, marginLeft: 12, display: 'inline-block' }} onClick={onViewNotifications}>🔔 Friend Requests</button>
          <button className="btn" style={{ marginTop: 16, marginLeft: 12, display: 'inline-block' }} onClick={onViewFriends}>👥 Study Friends</button>
        </div>
      </div>
    </div>
  )
}
