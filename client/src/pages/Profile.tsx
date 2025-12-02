import React, { useState, useEffect } from 'react'

type Props = {
  username: string
  onDone: () => void
}


const CLASS_OPTIONS = [
  'PHY2049',
  'PHY2048',
  'PHY2050',
  'Other'
]

const STUDY_PREFERENCES = [
  { value: 'long', label: 'Long uninterrupted blocks' },
  { value: 'frequent', label: 'Frequent breaks' }
]

const ACADEMIC_YEARS = [
  { value: 'freshman', label: 'Freshman' },
  { value: 'sophomore', label: 'Sophomore' },
  { value: 'junior', label: 'Junior' },
  { value: 'senior', label: 'Senior' },
  { value: 'graduate', label: 'Graduate' }
]

const STUDY_GOALS = [
  { value: 'exam', label: 'Studying for upcoming exam' },
  { value: 'homework', label: 'Working on homework' },
  { value: 'review', label: 'General review' }
]

const STUDY_FREQUENCIES = [
  { value: 'once', label: 'Once per week' },
  { value: 'before-exams', label: 'Only before exams' },
  { value: 'daily', label: 'Daily' },
  { value: 'other', label: 'Other' }
]

export default function Profile({ username, onDone }: Props) {
  const [selectedClasses, setSelectedClasses] = useState<string[]>([])
  const [studyPref, setStudyPref] = useState<string>(STUDY_PREFERENCES[0].value)
  const [academicYear, setAcademicYear] = useState<string>(ACADEMIC_YEARS[0].value)
  const [studyGoals, setStudyGoals] = useState<string[]>([])
  const [studyFrequency, setStudyFrequency] = useState<string>(STUDY_FREQUENCIES[0].value)
  const [loading, setLoading] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load existing profile data
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch(`/api/profile/${encodeURIComponent(username)}`)
        if (res.ok) {
          const profile = await res.json()
          if (profile) {
            // Load existing data
            if (profile.classes && Array.isArray(profile.classes)) {
              setSelectedClasses(profile.classes)
            }
            if (profile.studyPreference) {
              setStudyPref(profile.studyPreference)
            }
            if (profile.academicYear) {
              setAcademicYear(profile.academicYear)
            }
            // Handle studyGoal as array or single value (backward compatibility)
            if (profile.studyGoal) {
              if (Array.isArray(profile.studyGoal)) {
                setStudyGoals(profile.studyGoal)
              } else {
                setStudyGoals([profile.studyGoal])
              }
            }
            if (profile.studyFrequency) {
              setStudyFrequency(profile.studyFrequency)
            }
          }
        }
      } catch (err) {
        console.error('Failed to load profile:', err)
      } finally {
        setLoadingProfile(false)
      }
    }
    loadProfile()
  }, [username])

  async function submitProfile() {
    setError(null)
    if (selectedClasses.length === 0) {
      setError('Please select at least one class')
      return
    }
    if (studyGoals.length === 0) {
      setError('Please select at least one study goal')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/profile/${encodeURIComponent(username)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classes: selectedClasses,
          studyPreference: studyPref,
          academicYear,
          studyGoal: studyGoals,
          studyFrequency
        })
      })

      const contentType = res.headers.get('content-type') || ''
      if (!contentType.includes('application/json')) {
        const text = await res.text()
        console.error('Unexpected non-JSON response from /api/profile:', text)
        throw new Error('Server returned unexpected response (not JSON). Is the backend running?')
      }

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      onDone()
    } catch (err: any) {
      setError(err.message || 'Network error')
    } finally {
      setLoading(false)
    }
  }

  function toggleStudyGoal(value: string) {
    setStudyGoals(prev => 
      prev.includes(value) 
        ? prev.filter(g => g !== value)
        : [...prev, value]
    )
  }

  if (loadingProfile) {
    return (
      <div className="container">
        <div className="banner"><img src="/gatorbanner.png" alt="Swamp Study" /></div>
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="banner"><img src="/gatorbanner.png" alt="Swamp Study" /></div>
      <h2>Create your profile</h2>
      <p>Username: <strong>{username}</strong></p>

      <div className="card">
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', marginBottom: 12, fontSize: '16px', fontWeight: 600, color: '#0021A5' }}>
            Classes (select all that apply)
          </label>
          <div style={{ 
            border: '2px solid #e5ecff', 
            borderRadius: 12, 
            padding: 16, 
            backgroundColor: '#fafbff',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 12
          }}>
            {CLASS_OPTIONS.map(c => (
              <label 
                key={c} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 10, 
                  padding: '10px 12px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: selectedClasses.includes(c) ? '#e5ecff' : 'transparent',
                  border: selectedClasses.includes(c) ? '2px solid #0021A5' : '2px solid transparent'
                }}
                onMouseEnter={(e) => {
                  if (!selectedClasses.includes(c)) {
                    e.currentTarget.style.backgroundColor = '#f0f6ff'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!selectedClasses.includes(c)) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedClasses.includes(c)}
                  onChange={e => {
                    if (e.target.checked) setSelectedClasses(prev => [...prev, c])
                    else setSelectedClasses(prev => prev.filter(x => x !== c))
                  }}
                  style={{ 
                    width: 18, 
                    height: 18, 
                    cursor: 'pointer',
                    accentColor: '#0021A5'
                  }}
                />
                <span style={{ fontSize: '15px', userSelect: 'none' }}>{c}</span>
              </label>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', marginBottom: 12, fontSize: '16px', fontWeight: 600, color: '#0021A5' }}>
            Academic year
          </label>
          <select 
            value={academicYear} 
            onChange={e => setAcademicYear(e.target.value)} 
            style={{ 
              width: '100%',
              maxWidth: 400,
              padding: '12px 16px', 
              border: '2px solid #e5ecff',
              borderRadius: 8,
              fontSize: '15px',
              backgroundColor: '#fafbff',
              cursor: 'pointer',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#0021A5'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#e5ecff'}
          >
            {ACADEMIC_YEARS.map(y => <option key={y.value} value={y.value}>{y.label}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', marginBottom: 12, fontSize: '16px', fontWeight: 600, color: '#0021A5' }}>
            Study goals (select all that apply)
          </label>
          <div style={{ 
            border: '2px solid #e5ecff', 
            borderRadius: 12, 
            padding: 16, 
            backgroundColor: '#fafbff',
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}>
            {STUDY_GOALS.map(g => (
              <label 
                key={g.value}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 12, 
                  padding: '14px 16px',
                  borderRadius: 10,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: studyGoals.includes(g.value) ? '#e5ecff' : 'transparent',
                  border: studyGoals.includes(g.value) ? '2px solid #0021A5' : '2px solid transparent'
                }}
                onMouseEnter={(e) => {
                  if (!studyGoals.includes(g.value)) {
                    e.currentTarget.style.backgroundColor = '#f0f6ff'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!studyGoals.includes(g.value)) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
              >
                <input
                  type="checkbox"
                  checked={studyGoals.includes(g.value)}
                  onChange={() => toggleStudyGoal(g.value)}
                  style={{ 
                    width: 20, 
                    height: 20, 
                    cursor: 'pointer',
                    accentColor: '#0021A5',
                    flexShrink: 0
                  }}
                />
                <span style={{ fontSize: '15px', userSelect: 'none', lineHeight: 1.4 }}>{g.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', marginBottom: 12, fontSize: '16px', fontWeight: 600, color: '#0021A5' }}>
            Study frequency
          </label>
          <select 
            value={studyFrequency} 
            onChange={e => setStudyFrequency(e.target.value)} 
            style={{ 
              width: '100%',
              maxWidth: 400,
              padding: '12px 16px', 
              border: '2px solid #e5ecff',
              borderRadius: 8,
              fontSize: '15px',
              backgroundColor: '#fafbff',
              cursor: 'pointer',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#0021A5'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#e5ecff'}
          >
            {STUDY_FREQUENCIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', marginBottom: 12, fontSize: '16px', fontWeight: 600, color: '#0021A5' }}>
            Study preference
          </label>
          <select 
            value={studyPref} 
            onChange={e => setStudyPref(e.target.value)} 
            style={{ 
              width: '100%',
              maxWidth: 400,
              padding: '12px 16px', 
              border: '2px solid #e5ecff',
              borderRadius: 8,
              fontSize: '15px',
              backgroundColor: '#fafbff',
              cursor: 'pointer',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#0021A5'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#e5ecff'}
          >
            {STUDY_PREFERENCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        {error && (
          <div style={{ 
            marginTop: 16, 
            padding: '12px 16px', 
            backgroundColor: '#ffe5e5', 
            border: '2px solid #ff4444',
            borderRadius: 8,
            color: '#cc0000',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
          <button 
            className="btn" 
            onClick={submitProfile} 
            disabled={loading || loadingProfile}
            style={{
              flex: 1,
              maxWidth: 300,
              padding: '14px 24px',
              fontSize: '16px',
              fontWeight: 600,
              backgroundColor: loading ? '#999' : '#0021A5',
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  )
}
