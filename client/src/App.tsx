import React, { useState, useEffect } from 'react'
import Login from './pages/Login'
import Home from './pages/Home'
import Calendar from './pages/Calendar'
import Profile from './pages/Profile'
import Matches from './pages/Matches'
import Notifications from './pages/Notifications'
import Friends from './pages/Friends'
import DMs from './pages/DMs'

type Page = 'home' | 'calendar' | 'login' | 'profile' | 'matches' | 'notifications' | 'friends' | 'dms'

export default function App() {
  const [user, setUser] = useState<string | null>(null)
  const [page, setPage] = useState<Page>('login')
  const [dmsFriend, setDmsFriend] = useState<string | null>(null)

  useEffect(() => {
    const u = localStorage.getItem('swamp_user')
    setUser(u)
    setPage(u ? 'home' : 'login')
  }, [])

  // onAuth may be called with firstTime=true when a new user signs up
  const handleLogin = (username: string, firstTime?: boolean) => {
    localStorage.setItem('swamp_user', username)
    setUser(username)
    setPage(firstTime ? 'profile' : 'home')
  }

  const handleLogout = () => {
    localStorage.removeItem('swamp_user')
    setUser(null)
    setPage('login')
  }

  const goHome = () => setPage('home')

  const handleMessageFriend = (friendUsername: string) => {
    setDmsFriend(friendUsername)
    setPage('dms')
  }

  if (!user && page === 'login') return <Login onAuth={handleLogin} />

  if (page === 'calendar') return <Calendar username={user!} onBack={goHome} goHome={goHome} />

  if (page === 'profile') return <Profile username={user!} onDone={goHome} goHome={goHome} />

  if (page === 'matches') return <Matches username={user!} onBack={goHome} goHome={goHome} />

  if (page === 'notifications') return <Notifications username={user!} onBack={goHome} goHome={goHome} />

  if (page === 'friends') return <Friends username={user!} onBack={goHome} goHome={goHome} onMessageClick={handleMessageFriend} />

  if (page === 'dms') return <DMs username={user!} onBack={goHome} goHome={goHome} initialFriend={dmsFriend || undefined} />

  return <Home username={user!} onLogout={handleLogout} onNavigate={(p: Exclude<Page, 'login'|'profile'|'matches'|'notifications'|'friends'|'dms'>) => setPage(p)} onEditProfile={() => setPage('profile')} onViewMatches={() => setPage('matches')} onViewNotifications={() => setPage('notifications')} onViewFriends={() => setPage('friends')} onViewDMs={() => setPage('dms')} />
}
