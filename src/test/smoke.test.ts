import { describe, it, expect } from 'vitest'

describe('Smoke Test', () => {
  it('should pass', () => {
    expect(true).toBe(true)
  })

  it('should have jest-dom matchers available', () => {
    const div = document.createElement('div')
    document.body.appendChild(div)
    expect(div).toBeInTheDocument()
    document.body.removeChild(div)
  })
})
