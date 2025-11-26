import React, { useState } from 'react'

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
  const [studyGoal, setStudyGoal] = useState<string>(STUDY_GOALS[0].value)
  const [studyFrequency, setStudyFrequency] = useState<string>(STUDY_FREQUENCIES[0].value)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submitProfile() {
    setError(null)
    if (selectedClasses.length === 0) {
      setError('Please select at least one class')
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
          studyGoal,
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

  return (
    <div className="container">
      <div className="banner"><img src="/gatorbanner.png" alt="Swamp Study" /></div>
      <h2>Create your profile</h2>
      <p>Username: <strong>{username}</strong></p>

      <div className="card">
        <label><strong>Classes (multi-select)</strong></label>
        <div style={{ marginTop: 8 }}>
          <div style={{ border: '1px solid #ccc', borderRadius: 8, padding: 8, maxWidth: 320 }}>
            {CLASS_OPTIONS.map(c => (
              <label key={c} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <input
                  type="checkbox"
                  checked={selectedClasses.includes(c)}
                  onChange={e => {
                    if (e.target.checked) setSelectedClasses(prev => [...prev, c])
                    else setSelectedClasses(prev => prev.filter(x => x !== c))
                  }}
                />
                <span>{c}</span>
              </label>
            ))}
          </div>
        </div>

        <label style={{ marginTop: 24 }}><strong>Academic year</strong></label>
        <select value={academicYear} onChange={e => setAcademicYear(e.target.value)} style={{ display: 'block', marginTop: 8, marginBottom: 12 }}>
          {ACADEMIC_YEARS.map(y => <option key={y.value} value={y.value}>{y.label}</option>)}
        </select>

        <label style={{ marginTop: 24 }}><strong>Study goal</strong></label>
        <select value={studyGoal} onChange={e => setStudyGoal(e.target.value)} style={{ display: 'block', marginTop: 8, marginBottom: 12 }}>
          {STUDY_GOALS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
        </select>

        <label style={{ marginTop: 24 }}><strong>Study frequency</strong></label>
        <select value={studyFrequency} onChange={e => setStudyFrequency(e.target.value)} style={{ display: 'block', marginTop: 8, marginBottom: 12 }}>
          {STUDY_FREQUENCIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>

        <label style={{ marginTop: 24 }}><strong>Study preference</strong></label>
        <select value={studyPref} onChange={e => setStudyPref(e.target.value)} style={{ display: 'block', marginTop: 8, marginBottom: 12 }}>
          {STUDY_PREFERENCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>

        {error && <div className="error" style={{ marginTop: 10 }}>{error}</div>}

        <div style={{ marginTop: 16 }}>
          <button className="btn" onClick={submitProfile} disabled={loading}>{loading ? 'Saving...' : 'Save Profile'}</button>
        </div>
      </div>
    </div>
  )
}
