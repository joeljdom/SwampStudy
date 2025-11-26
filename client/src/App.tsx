import React, { useState, useEffect } from 'react'
import Login from './pages/Login'
import Home from './pages/Home'
import Calendar from './pages/Calendar'
import Profile from './pages/Profile'
import Matches from './pages/Matches'

type Page = 'home' | 'calendar' | 'login' | 'profile' | 'matches'

export default function App() {
  const [user, setUser] = useState<string | null>(null)
  const [page, setPage] = useState<Page>('login')

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

  if (!user && page === 'login') return <Login onAuth={handleLogin} />

  if (page === 'calendar') return <Calendar username={user!} onBack={() => setPage('home')} />

  if (page === 'profile') return <Profile username={user!} onDone={() => setPage('home')} />

  if (page === 'matches') return <Matches username={user!} onBack={() => setPage('home')} />

  return <Home username={user!} onLogout={handleLogout} onNavigate={(p: Exclude<Page, 'login'|'profile'|'matches'>) => setPage(p)} onEditProfile={() => setPage('profile')} onViewMatches={() => setPage('matches')} />
}
