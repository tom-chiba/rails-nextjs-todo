import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Home from './page'

vi.mock('next/image', () => ({
  default: (props: React.ComponentProps<'img'>) => <img {...props} />,
}))

describe('Home', () => {
  it('見出しが表示される', () => {
    render(<Home />)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
      'To get started, edit the page.tsx file.',
    )
  })

  it('TemplatesとLearningのリンクが存在する', () => {
    render(<Home />)
    expect(screen.getByRole('link', { name: 'Templates' })).toBeDefined()
    expect(screen.getByRole('link', { name: 'Learning' })).toBeDefined()
  })
})
