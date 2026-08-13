import { render, screen } from '@testing-library/react'

import { TabPanel, Tabs } from '@/components/ui/tabs'
import en from '@/lib/i18n/dictionaries/en'

const items = [
  {
    id: 'statistics',
    label: en.history.tabStatistics,
    href: '/history?tab=statistics',
  },
  { id: 'habits', label: en.history.tabHabits, href: '/history?tab=habits' },
  {
    id: 'achievements',
    label: en.history.tabAchievements,
    href: '/history?tab=achievements',
  },
]

function renderTabs(activeId = 'statistics') {
  render(
    <>
      <Tabs items={items} activeId={activeId} label={en.history.tabsLabel} panelId="panel" />
      <TabPanel id="panel" labelledBy={`tab-${activeId}`}>
        content
      </TabPanel>
    </>,
  )
}

describe('Tabs', () => {
  it('renders one tab per section inside a labelled tablist', () => {
    renderTabs()

    expect(screen.getByRole('tablist', { name: en.history.tabsLabel })).toBeInTheDocument()
    expect(screen.getAllByRole('tab')).toHaveLength(3)
  })

  it('marks exactly one tab as selected', () => {
    renderTabs('habits')

    expect(screen.getByRole('tab', { name: en.history.tabHabits })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByRole('tab', { name: en.history.tabStatistics })).toHaveAttribute(
      'aria-selected',
      'false',
    )
  })

  it('gives the selected tab a distinct style', () => {
    renderTabs('achievements')

    const selected = screen.getByRole('tab', {
      name: en.history.tabAchievements,
    })
    expect(selected.className).toContain('bg-surface')
  })

  it('navigates by URL so a section can be shared', () => {
    renderTabs()

    expect(screen.getByRole('tab', { name: en.history.tabHabits })).toHaveAttribute(
      'href',
      '/history?tab=habits',
    )
  })

  it('wires every tab to the panel it controls', () => {
    renderTabs('habits')

    screen.getAllByRole('tab').forEach((tab) => {
      expect(tab).toHaveAttribute('aria-controls', 'panel')
    })
    expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', 'tab-habits')
  })
})
