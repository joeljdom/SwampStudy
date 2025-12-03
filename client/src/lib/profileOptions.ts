export const CLASS_OPTIONS = [
  'MAC2311', 'MAC2312', 'MAC2313', 'MAC1105', 'MAC1140', 'MGF1106', 'MGF1107', 'STA2023', 'STA3032',
  'CHM1025', 'CHM2045', 'CHM2045L', 'CHM2046', 'CHM2046L', 'CHM2210', 'CHM2211', 'CHM2210L', 'CHM2211L',
  'PHY2048', 'PHY2048L', 'PHY2049', 'PHY2049L', 'PHY2053', 'PHY2053L',
  'BSC2005', 'BSC2010', 'BSC2010L', 'BSC2011', 'BSC2011L',
  'MCB2000', 'MCB3020',
  'COP3502', 'COP3503', 'CDA3101', 'COT3100', 'EEL3111C', 'EGN3353C', 'EGS1006', 'EGN2020',
  'GEB2011', 'ECO2013', 'ECO2023', 'MAN3025', 'MAR3023', 'ACG2021', 'ACG2071',
  'PSY2012', 'POS2041', 'AMH2020', 'ENC1101',
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
