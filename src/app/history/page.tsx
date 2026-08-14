import type { Metadata } from 'next'

import { HistoryPanels, type HistoryTab } from '@/components/history/history-panels'
import { BottomNav } from '@/components/layout/bottom-nav'
import { ScreenHeader } from '@/components/layout/screen-header'
import { FilterChips } from '@/components/ui/filter-chips'
import { TabPanel, Tabs } from '@/components/ui/tabs'
import { getI18n, getScreenSettings } from '@/lib/server-settings'
import { parseStatisticsPeriod, STATISTICS_PERIODS, type StatisticsPeriod } from '@/lib/statistics'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()
  return { title: t.history.title }
}

export const dynamic = 'force-dynamic'

const TABS = ['statistics', 'habits', 'achievements'] as const

export function parseHistoryTab(value: string | undefined): HistoryTab {
  return TABS.find((tab) => tab === value) ?? 'statistics'
}

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; period?: string }>
}) {
  const [{ locale, t, weekStartsOn }, { tab, period }] = await Promise.all([
    getScreenSettings(),
    searchParams,
  ])

  const activeTab = parseHistoryTab(tab)
  const activePeriod = parseStatisticsPeriod(period)

  const periodLabel: Record<StatisticsPeriod, string> = {
    'this-week': t.history.statistics.periodThisWeek,
    'last-week': t.history.statistics.periodLastWeek,
    'last-4-weeks': t.history.statistics.periodLast4Weeks,
    'all-time': t.history.statistics.periodAllTime,
  }

  return (
    <>
      <main className="app-shell app-shell-nav gap-5 px-5 pt-8">
        <ScreenHeader title={t.history.title} subtitle={t.history.subtitle} />

        <Tabs
          items={[
            {
              id: 'statistics',
              label: t.history.tabStatistics,
              href: '/history?tab=statistics',
            },
            { id: 'habits', label: t.history.tabHabits, href: '/history?tab=habits' },
            {
              id: 'achievements',
              label: t.history.tabAchievements,
              href: '/history?tab=achievements',
            },
          ]}
          activeId={activeTab}
          label={t.history.tabsLabel}
          panelId="history-panel"
        />

        {activeTab === 'statistics' && (
          <FilterChips
            label={t.history.statistics.filterLabel}
            activeId={activePeriod}
            items={STATISTICS_PERIODS.map((option) => ({
              id: option,
              label: periodLabel[option],
              href: `/history?tab=statistics&period=${option}`,
            }))}
          />
        )}

        <TabPanel id="history-panel" labelledBy={`tab-${activeTab}`}>
          {/* Habits come from the browser store, so the panels are client-side. */}
          <HistoryPanels
            tab={activeTab}
            period={activePeriod}
            periodLabel={periodLabel[activePeriod]}
            locale={locale}
            weekStartsOn={weekStartsOn}
            t={t}
          />
        </TabPanel>
      </main>

      <BottomNav labels={t.nav} />
    </>
  )
}
