import type { Metadata } from 'next'

import {
  setLocaleAction,
  setReduceMotionAction,
  setThemeAction,
  setWeekStartAction,
} from '@/app/settings/actions'
import { SignOutButton } from '@/components/auth/sign-out-button'
import { BellIcon, MailIcon, ShareIcon, StarIcon } from '@/components/icons'
import { BottomNav } from '@/components/layout/bottom-nav'
import { ScreenHeader } from '@/components/layout/screen-header'
import { ChoiceGroup } from '@/components/settings/choice-group'
import { NotificationSection } from '@/components/settings/notification-section'
import { PreferenceSwitch } from '@/components/settings/preference-switch'
import { RateAppButton } from '@/components/settings/rate-app-button'
import { SettingsRow, SettingsSection } from '@/components/settings/settings-section'
import { ShareButton } from '@/components/ui/share-button'
import { WEEK_STARTS, type WeekStart } from '@/lib/general-settings'
import { LOCALE_LABELS, LOCALES, type Locale } from '@/lib/i18n/config'
import { getI18n, getScreenSettings } from '@/lib/server-settings'
import { getSessionUser } from '@/lib/session'
import { THEMES, type Theme } from '@/lib/theme'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n()
  return { title: t.settings.title }
}
export const dynamic = 'force-dynamic'

const THEME_ICONS: Record<Theme, string> = {
  system: '🖥️',
  light: '☀️',
  dark: '🌙',
}

export default async function SettingsPage() {
  const [user, { locale, t, theme, general }] = await Promise.all([
    getSessionUser(),
    getScreenSettings(),
  ])

  const storeUrl = process.env.NEXT_PUBLIC_APP_STORE_URL
  const feedbackEmail = process.env.NEXT_PUBLIC_FEEDBACK_EMAIL ?? 'feedback@habit.app'
  const feedbackHref = `mailto:${feedbackEmail}?subject=${encodeURIComponent('Habit Tracker feedback')}`

  return (
    <>
      <main className="app-shell app-shell-nav gap-6 px-5 pt-8">
        <ScreenHeader title={t.settings.title} subtitle={t.settings.subtitle} />

        <SettingsSection
          id="settings-appearance"
          title={t.settings.appearance.title}
          description={t.settings.appearance.description}
        >
          <SettingsRow label={t.settings.appearance.title}>
            <ChoiceGroup<Theme>
              label={t.settings.appearance.title}
              value={theme}
              onSelect={setThemeAction}
              options={THEMES.map((option) => ({
                value: option,
                label: t.settings.appearance[option],
                icon: THEME_ICONS[option],
              }))}
            />
          </SettingsRow>
        </SettingsSection>

        <SettingsSection
          id="settings-language"
          title={t.settings.language.title}
          description={t.settings.language.description}
        >
          <SettingsRow label={t.settings.language.title}>
            <ChoiceGroup<Locale>
              label={t.settings.language.title}
              value={locale}
              onSelect={setLocaleAction}
              options={LOCALES.map((option) => ({
                value: option,
                label: LOCALE_LABELS[option],
              }))}
            />
          </SettingsRow>
        </SettingsSection>

        <SettingsSection id="settings-notifications" title={t.settings.notifications.title}>
          <NotificationSection
            labels={{
              master: t.settings.notifications.master,
              description: t.settings.notifications.description,
              disabledHint: t.settings.notifications.disabledHint,
              types: {
                dailyReminder: {
                  label: t.settings.notifications.dailyReminder,
                  description: t.settings.notifications.dailyReminderBody,
                },
                streakAlert: {
                  label: t.settings.notifications.streakAlert,
                  description: t.settings.notifications.streakAlertBody,
                },
                weeklyReport: {
                  label: t.settings.notifications.weeklyReport,
                  description: t.settings.notifications.weeklyReportBody,
                },
              },
            }}
          />
        </SettingsSection>

        <SettingsSection id="settings-social" title={t.settings.social.title}>
          <SettingsRow
            icon={<ShareIcon className="h-5 w-5" />}
            label={t.settings.social.share}
            description={t.settings.social.shareBody}
          >
            <ShareButton
              size="sm"
              variant="ghost"
              className="w-full border border-sand-200 shadow-none"
              title={t.settings.social.shareTitle}
              text={t.settings.social.shareText}
              labels={{
                copied: t.settings.social.copied,
                failed: t.settings.social.failed,
              }}
            >
              {t.settings.social.share}
            </ShareButton>
          </SettingsRow>

          <SettingsRow
            icon={<StarIcon className="h-5 w-5" />}
            label={t.settings.rating.title}
            description={t.settings.rating.body}
            control={
              <RateAppButton
                storeUrl={storeUrl}
                labels={{
                  action: t.settings.rating.action,
                  unavailable: t.settings.rating.unavailable,
                }}
              />
            }
          />

          <SettingsRow
            icon={<MailIcon className="h-5 w-5" />}
            label={t.settings.feedback.title}
            description={t.settings.feedback.body}
            href={feedbackHref}
            control={
              <span className="font-semibold text-brand-600 text-xs">
                {t.settings.feedback.action}
              </span>
            }
          />
        </SettingsSection>

        <SettingsSection
          id="settings-general"
          title={t.settings.general.title}
          description={t.settings.general.description}
        >
          <SettingsRow label={t.settings.general.weekStart}>
            <ChoiceGroup<WeekStart>
              label={t.settings.general.weekStart}
              value={general.weekStart}
              onSelect={setWeekStartAction}
              options={WEEK_STARTS.map((option) => ({
                value: option,
                label: option === 'monday' ? t.settings.general.monday : t.settings.general.sunday,
              }))}
            />
          </SettingsRow>

          <SettingsRow
            icon={<BellIcon className="h-5 w-5" />}
            label={t.settings.general.reduceMotion}
            description={t.settings.general.reduceMotionBody}
            control={
              <PreferenceSwitch
                label={t.settings.general.reduceMotion}
                checked={general.reduceMotion}
                onChange={setReduceMotionAction}
              />
            }
          />

          {/* Local mode has no session to end. */}
          {user && (
            <SettingsRow
              label={t.settings.general.signOut}
              description={user.email ?? undefined}
              control={<SignOutButton label={t.settings.general.signOut} />}
            />
          )}
        </SettingsSection>
      </main>

      <BottomNav labels={t.nav} />
    </>
  )
}
