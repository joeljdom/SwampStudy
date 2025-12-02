export const CLASS_OPTIONS = [
  'PHY2049',
  'PHY2048',
  'PHY2050',
  'Other'
]

export const STUDY_PREFERENCES = [
  { value: 'long', label: 'Long uninterrupted blocks' },
  { value: 'frequent', label: 'Frequent breaks' }
]

export const ACADEMIC_YEARS = [
  { value: 'freshman', label: 'Freshman' },
  { value: 'sophomore', label: 'Sophomore' },
  { value: 'junior', label: 'Junior' },
  { value: 'senior', label: 'Senior' },
  { value: 'graduate', label: 'Graduate' }
]

export const STUDY_GOALS = [
  { value: 'exam', label: 'Studying for upcoming exam' },
  { value: 'homework', label: 'Working on homework' },
  { value: 'review', label: 'General review' }
]

export const STUDY_FREQUENCIES = [
  { value: 'once', label: 'Once per week' },
  { value: 'before-exams', label: 'Only before exams' },
  { value: 'daily', label: 'Daily' },
  { value: 'other', label: 'Other' }
]

// Re-export types if needed later
export type Option = { value: string; label: string }
