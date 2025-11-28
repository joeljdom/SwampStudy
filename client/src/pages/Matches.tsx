import React, { useState, useEffect } from 'react'

type Props = {
  username: string
  onBack: () => void
}

type ProfileData = {
  classes: string[]
  studyPreference: string
  academicYear: string
  studyGoal: string
  studyFrequency: string
}

type Match = {
  username: string
  profile: ProfileData
  sharedClasses: string[]
  compatibilityScore: number
  commonFields: {
    studyPreference: boolean
    academicYear: boolean
    studyGoal: boolean
    studyFrequency: boolean
  }
}

export default function Matches({ username, onBack }: Props) {
  const [matches, setMatches] = useState<Match[]>([])
  const [friends, setFriends] = useState<string[]>([])
  const [pending, setPending] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<ProfileData | null>(null)

  useEffect(() => {
    async function loadMatches() {
      setLoading(true)
      setError(null)
      try {
        // Fetch current user's profile
        const userRes = await fetch(`/api/profile/${encodeURIComponent(username)}`)
        if (!userRes.ok) throw new Error('Failed to load your profile')
        const currentProfile = await userRes.json()
        setUserProfile(currentProfile)

        // Fetch all profiles
        const allRes = await fetch('/api/profiles')
        if (!allRes.ok) throw new Error('Failed to load profiles')
        const allProfiles = await allRes.json()

        // Fetch friends and pending
        const friendsRes = await fetch(`/api/relationships/friends/${encodeURIComponent(username)}`)
        const friendsData = friendsRes.ok ? await friendsRes.json() : { friends: [] }
        setFriends(friendsData.friends || [])

        const pendingRes = await fetch(`/api/relationships/pending/${encodeURIComponent(username)}`)
        const pendingData = pendingRes.ok ? await pendingRes.json() : { pending: [] }
        setPending(pendingData.pending || [])

        // Calculate matches (excluding friends and pending requests sent by user)
        const matchList = calculateMatches(username, currentProfile, allProfiles, friendsData.friends || [])
        setMatches(matchList)
      } catch (err: any) {
        setError(err.message || 'Network error')
      } finally {
        setLoading(false)
      }
    }
    loadMatches()
  }, [username])

  function calculateMatches(
    currentUser: string,
    currentProfile: ProfileData,
    allProfiles: Record<string, ProfileData>,
    currentFriends: string[]
  ): Match[] {
    const matchList: Match[] = []

    for (const [otherUsername, otherProfile] of Object.entries(allProfiles)) {
      if (otherUsername === currentUser) continue
      if (currentFriends.includes(otherUsername)) continue

      // Find shared classes
      const sharedClasses = currentProfile.classes.filter(c =>
        otherProfile.classes.includes(c)
      )

      // If no shared classes, skip this user
      if (sharedClasses.length === 0) continue

      // Calculate compatibility score based on matching fields
      let score = 0
      const commonFields = {
        studyPreference: false,
        academicYear: false,
        studyGoal: false,
        studyFrequency: false
      }

      if (currentProfile.studyPreference === otherProfile.studyPreference) {
        score += 1
        commonFields.studyPreference = true
      }
      if (currentProfile.academicYear === otherProfile.academicYear) {
        score += 1
        commonFields.academicYear = true
      }
      if (currentProfile.studyGoal === otherProfile.studyGoal) {
        score += 1
        commonFields.studyGoal = true
      }
      if (currentProfile.studyFrequency === otherProfile.studyFrequency) {
        score += 1
        commonFields.studyFrequency = true
      }

      matchList.push({
        username: otherUsername,
        profile: otherProfile,
        sharedClasses,
        compatibilityScore: score,
        commonFields
      })
    }

    // Sort by compatibility score (descending) then by shared classes count (descending)
    return matchList.sort((a, b) => {
      if (b.compatibilityScore !== a.compatibilityScore) {
        return b.compatibilityScore - a.compatibilityScore
      }
      return b.sharedClasses.length - a.sharedClasses.length
    })
  }

  async function handleAddMatch(matchUsername: string) {
    try {
      const res = await fetch('/api/relationships/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: username, to: matchUsername })
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to send request')
      }
      // Remove from matches
      setMatches(matches.filter(m => m.username !== matchUsername))
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    }
  }

  return (
    <div className="container">
      <div className="banner"><img src="/gatorbanner.png" alt="Swamp Study" /></div>
      <h2>Study Matches</h2>
      <button className="btn" onClick={onBack} style={{ marginBottom: 16 }}>← Back</button>

      {loading && <p>Loading matches...</p>}
      {error && <div className="error">{error}</div>}

      {!loading && !error && matches.length === 0 && (
        <div className="card">
          <p>No matches found. Complete your profile to find study partners!</p>
        </div>
      )}

      {!loading && !error && matches.length > 0 && (
        <div>
          <p style={{ marginBottom: 16 }}>
            Found <strong>{matches.length}</strong> study partner{matches.length !== 1 ? 's' : ''} with shared classes.
          </p>
          {matches.map((match, idx) => (
            <div key={match.username} className="card" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 8px 0' }}>{match.username}</h3>
                  <p style={{ margin: '4px 0' }}>
                    <strong>Shared Classes:</strong> {match.sharedClasses.join(', ')}
                  </p>
                  <p style={{ margin: '4px 0' }}>
                    <strong>Academic Year:</strong> {match.profile.academicYear}
                  </p>
                  <p style={{ margin: '4px 0' }}>
                    <strong>Study Preference:</strong> {match.profile.studyPreference}
                  </p>
                  <p style={{ margin: '4px 0' }}>
                    <strong>Study Goal:</strong> {match.profile.studyGoal}
                  </p>
                  <p style={{ margin: '4px 0' }}>
                    <strong>Study Frequency:</strong> {match.profile.studyFrequency}
                  </p>
                </div>
                <div style={{ textAlign: 'right', minWidth: 140 }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c7be5', marginBottom: 12 }}>
                    {match.compatibilityScore}/4
                  </div>
                  <p style={{ margin: '4px 0', fontSize: '12px', marginBottom: 12 }}>Compatibility</p>
                  <div style={{ marginBottom: 12, fontSize: '12px' }}>
                    {match.commonFields.studyPreference && <p style={{ margin: '2px 0' }}>✓ Study Preference</p>}
                    {match.commonFields.academicYear && <p style={{ margin: '2px 0' }}>✓ Academic Year</p>}
                    {match.commonFields.studyGoal && <p style={{ margin: '2px 0' }}>✓ Study Goal</p>}
                    {match.commonFields.studyFrequency && <p style={{ margin: '2px 0' }}>✓ Study Frequency</p>}
                  </div>
                  <button
                    className="btn"
                    style={{ width: '100%', padding: '8px 12px', fontSize: '14px' }}
                    onClick={() => handleAddMatch(match.username)}
                  >
                    + Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
