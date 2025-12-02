import React, { useState, useEffect } from 'react'
import Login from './pages/Login'
import Home from './pages/Home'
import Calendar from './pages/Calendar'
import Profile from './pages/Profile'
import Matches from './pages/Matches'
import Notifications from './pages/Notifications'
import Friends from './pages/Friends'
import DMs from './pages/DMs'
import AdminDashboard from './pages/AdminDashboard'
import AdminUserDetail from './pages/AdminUserDetail'

type Page = 'home' | 'calendar' | 'login' | 'profile' | 'matches' | 'notifications' | 'friends' | 'dms' | 'admin-dashboard' | 'admin-user-detail'

type UserData = {
  username: string
  role: 'user' | 'admin'
}

export default function App() {
  const [user, setUser] = useState<UserData | null>(null)
  const [page, setPage] = useState<Page>('login')
  const [dmsFriend, setDmsFriend] = useState<string | null>(null)
  const [selectedAdminUser, setSelectedAdminUser] = useState<string | null>(null)

  useEffect(() => {
    const u = localStorage.getItem('swamp_user')
    const r = localStorage.getItem('swamp_role') || 'user'
    if (u) {
      setUser({ username: u, role: r as 'user' | 'admin' })
      // If this stored user is an admin, default to the admin dashboard after reload.
      setPage(r === 'admin' ? 'admin-dashboard' : 'home')
    } else {
      setPage('login')
    }
  }, [])

  // onAuth may be called with firstTime=true when a new user signs up
  const handleLogin = (username: string, firstTime?: boolean, role: string = 'user') => {
    localStorage.setItem('swamp_user', username)
    localStorage.setItem('swamp_role', role)
    const userData: UserData = { username, role: role as 'user' | 'admin' }
    setUser(userData)
    setPage(firstTime ? 'profile' : role === 'admin' ? 'admin-dashboard' : 'home')
  }

  const handleLogout = () => {
    localStorage.removeItem('swamp_user')
    localStorage.removeItem('swamp_role')
    setUser(null)
    setPage('login')
  }

  const goHome = () => setPage('home')

  const handleMessageFriend = (friendUsername: string) => {
    setDmsFriend(friendUsername)
    setPage('dms')
  }

  if (!user && page === 'login') return <Login onAuth={handleLogin} />

  if (page === 'calendar') return <Calendar username={user!.username} onBack={goHome} goHome={goHome} />

  if (page === 'profile') return <Profile username={user!.username} onDone={goHome} goHome={goHome} />

  if (page === 'matches') return <Matches username={user!.username} onBack={goHome} goHome={goHome} />

  if (page === 'notifications') return <Notifications username={user!.username} onBack={goHome} goHome={goHome} />

  if (page === 'friends') return <Friends username={user!.username} onBack={goHome} goHome={goHome} onMessageClick={handleMessageFriend} />

  if (page === 'dms') return <DMs username={user!.username} onBack={goHome} goHome={goHome} initialFriend={dmsFriend || undefined} />

  if (page === 'admin-dashboard') return <AdminDashboard username={user!.username} onLogout={handleLogout} onViewUser={(targetUsername) => {
    setSelectedAdminUser(targetUsername)
    setPage('admin-user-detail')
  }} />

  if (page === 'admin-user-detail' && selectedAdminUser) return <AdminUserDetail adminUsername={user!.username} targetUsername={selectedAdminUser} onBack={() => setPage('admin-dashboard')} />

  // Default: render Home for regular users, AdminDashboard for admins (if no specific page is set)
  return <Home username={user!.username} onLogout={handleLogout} onNavigate={(p) => setPage(p)} onEditProfile={() => setPage('profile')} onViewMatches={() => setPage('matches')} onViewNotifications={() => setPage('notifications')} onViewFriends={() => setPage('friends')} onViewDMs={() => setPage('dms')} />
}
