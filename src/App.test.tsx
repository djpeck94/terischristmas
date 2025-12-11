import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the landing content', () => {
    render(<App />)
    expect(screen.getByAltText(/Teri's Christmas Present logo/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Puzzle 1 of 3/i).length).toBeGreaterThan(0)
  })
})
