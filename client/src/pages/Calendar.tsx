import React, { useEffect, useMemo, useState } from 'react'

type Props = {
  username: string
  onBack: () => void
  goHome: () => void
}

function getEasternNow() {
  const now = new Date()
  return new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
}

export default function Calendar({ username, onBack, goHome }: Props) {
  const [current, setCurrent] = useState<Date>(() => getEasternNow())
  const [availability, setAvailability] = useState<Record<string, string>>({})
  const [modalDate, setModalDate] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/availability/${username}`)
        if (res.ok) {
          const data = await res.json()
          setAvailability(data)
        }
      } catch (err) {
        console.error('Failed to load availability', err)
      }
    }
    load()
  }, [username])

  const year = current.getFullYear()
  const month = current.getMonth()

  const monthTitle = useMemo(() => {
    return current.toLocaleString('en-US', { month: 'long', year: 'numeric' })
  }, [current])

  function changeMonth(delta: number) {
    const next = new Date(year, month + delta, 1)
    setCurrent(next)
  }

  function formatDate(d: Date) {
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${d.getFullYear()}-${m}-${day}`
  }

  function buildCalendarGrid() {
    const firstDay = new Date(year, month, 1).getDay() // 0-6
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const weeks: Array<Array<number | null>> = []
    let week: Array<number | null> = []

    for (let i = 0; i < firstDay; i++) week.push(null)
    for (let day = 1; day <= daysInMonth; day++) {
      week.push(day)
      if (week.length === 7) { weeks.push(week); week = [] }
    }
    while (week.length < 7 && week.length > 0) week.push(null)
    if (week.length) weeks.push(week)
    return weeks
  }

  const weeks = useMemo(buildCalendarGrid, [month, year])

  async function saveAvailability(date: string, status: string) {
    try {
      const res = await fetch(`/api/availability/${username}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, status })
      })
      if (!res.ok) throw new Error('Failed to save')
      const data = await res.json()
      setAvailability({ ...data.availability })
      closeModal()
    } catch (err) {
      console.error(err)
      alert('Failed to save availability')
    }
  }

  function openModalFor(day: number | null) {
    if (!day) return
    const d = new Date(year, month, day)
    setModalDate(formatDate(d))
  }

  function closeModal() { setModalDate(null) }

  function handleLogout() {
    localStorage.removeItem('swamp_user')
    window.location.reload()
  }

  const todayStr = getEasternNow().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/New_York' })

  return (
    <div>
      <div className="banner">
        <img src="/gatorbanner.png" alt="Swamp Study Header" onClick={goHome} />
        <button className="banner-home-btn" onClick={goHome}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          Home
        </button>
      </div>

      <div className="container">
        <div className="header">
          <h1>📅 Calendar</h1>
          <div className="nav-buttons">
            <button className="btn btn-secondary" onClick={onBack}>Home</button>
            <button className="btn" onClick={handleLogout}>Log out</button>
          </div>
        </div>

        <div className="current-date">Today (Eastern Time): {todayStr}</div>

        <div className="calendar-nav">
          <button className="nav-arrow" onClick={() => changeMonth(-1)}>←</button>
          <div className="month-year-title">{monthTitle}</div>
          <button className="nav-arrow" onClick={() => changeMonth(1)}>→</button>
        </div>

        <div className="legend">
          <div className="legend-item"><div className="legend-color" style={{ background: 'var(--available)' }}></div><span>Available</span></div>
          <div className="legend-item"><div className="legend-color" style={{ background: 'var(--unavailable)' }}></div><span>Unavailable</span></div>
          <div className="legend-item"><div className="legend-color" style={{ background: 'var(--neutral)' }}></div><span>Not Set</span></div>
        </div>

        <div className="calendar-container">
          <div className="month-card">
            <table className="calendar-table">
              <thead>
                <tr>
                  {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <th key={d}>{d}</th>)}
                </tr>
              </thead>
              <tbody>
                {weeks.map((week, i) => (
                  <tr key={i}>
                    {week.map((day, j) => {
                      if (!day) return (<td key={j}><div className="date-cell empty" /></td>)
                      const d = new Date(year, month, day)
                      const dateStr = formatDate(d)
                      const status = availability[dateStr]
                      const cls = ['date-cell', status === 'available' ? 'available' : null, status === 'unavailable' ? 'unavailable' : null].filter(Boolean).join(' ')
                      return (
                        <td key={j}>
                          <button className={cls} onClick={() => openModalFor(day)}>{day}</button>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalDate && (
        <div className="modal show" onClick={(e) => {
          if (e.target === e.currentTarget) closeModal()
        }}>
          <div className="modal-content">
            <h3>{new Date(modalDate + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</h3>
            <p>Select availability status for this date:</p>
            <div className="modal-buttons">
              <button className="modal-btn available" onClick={() => saveAvailability(modalDate, 'available')}>
                ✓ Available
              </button>
              <button className="modal-btn unavailable" onClick={() => saveAvailability(modalDate, 'unavailable')}>
                ✗ Unavailable
              </button>
              <button className="modal-btn cancel" onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

