import {
  isValidEmail,
  isValidPhoneNumber,
  formatPhoneNumber,
  parseTimeString,
  isWorkingDay,
  sanitizeInput,
} from '../utils'

describe('Utils', () => {
  describe('isValidEmail', () => {
    it('should validate correct email', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('patient@clinic.com')).toBe(true)
    })

    it('should reject invalid email', () => {
      expect(isValidEmail('invalid')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
    })
  })

  describe('isValidPhoneNumber', () => {
    it('should validate correct phone numbers', () => {
      expect(isValidPhoneNumber('5551234567')).toBe(true)
      expect(isValidPhoneNumber('+1-555-123-4567')).toBe(true)
      expect(isValidPhoneNumber('15551234567')).toBe(true)
    })

    it('should reject invalid phone numbers', () => {
      expect(isValidPhoneNumber('123')).toBe(false)
      expect(isValidPhoneNumber('abcdefghijk')).toBe(false)
    })
  })

  describe('formatPhoneNumber', () => {
    it('should format phone numbers correctly', () => {
      expect(formatPhoneNumber('5551234567')).toBe('+15551234567')
    })
  })

  describe('parseTimeString', () => {
    it('should parse time strings correctly', () => {
      const result = parseTimeString('09:30')
      expect(result.hours).toBe(9)
      expect(result.minutes).toBe(30)
    })

    it('should handle different formats', () => {
      const result = parseTimeString('23:59')
      expect(result.hours).toBe(23)
      expect(result.minutes).toBe(59)
    })
  })

  describe('isWorkingDay', () => {
    it('should identify working days correctly', () => {
      const workingDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

      // Monday is working day
      const monday = new Date('2024-01-08')
      expect(isWorkingDay(monday, workingDays)).toBe(true)

      // Sunday is not working day
      const sunday = new Date('2024-01-07')
      expect(isWorkingDay(sunday, workingDays)).toBe(false)
    })
  })

  describe('sanitizeInput', () => {
    it('should sanitize input correctly', () => {
      expect(sanitizeInput('  hello  ')).toBe('hello')
      expect(sanitizeInput('hello<script>alert("xss")</script>')).toBe('hello')
      expect(sanitizeInput('a'.repeat(600))).toHaveLength(500)
    })
  })
})
