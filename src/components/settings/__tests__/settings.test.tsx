import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ChoiceGroup } from '@/components/settings/choice-group'
import { NotificationSettings } from '@/components/settings/notification-settings'
import { PreferenceSwitch } from '@/components/settings/preference-switch'
import { RateAppButton } from '@/components/settings/rate-app-button'
import { SettingsRow, SettingsSection } from '@/components/settings/settings-section'
import { defaultPreferences } from '@/lib/notifications'
import en from '@/lib/i18n/dictionaries/en'
import { LOCALE_LABELS, LOCALES } from '@/lib/i18n/config'
import { THEMES } from '@/lib/theme'

describe('SettingsSection', () => {
  it('groups rows under a labelled section', () => {
    render(
      <SettingsSection
        id="appearance"
        title={en.settings.appearance.title}
        description={en.settings.appearance.description}
      >
        <SettingsRow label="Row one" description="First" />
        <SettingsRow label="Row two" control={<span>Control</span>} />
      </SettingsSection>,
    )

    const section = screen.getByRole('region', { name: en.settings.appearance.title })
    expect(within(section).getByText('Row one')).toBeInTheDocument()
    expect(within(section).getByText('Control')).toBeInTheDocument()
    expect(screen.getByText(en.settings.appearance.description)).toBeInTheDocument()
  })

  it('renders a row as a link when given an href', () => {
    render(<SettingsRow label={en.settings.feedback.title} href="mailto:hi@example.com" external />)

    const link = screen.getByRole('link', { name: new RegExp(en.settings.feedback.title) })
    expect(link).toHaveAttribute('href', 'mailto:hi@example.com')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', expect.stringContaining('noreferrer'))
  })

  it('marks a disabled row for assistive tech', () => {
    render(<SettingsRow label="Off limits" disabled />)

    expect(screen.getByText('Off limits').closest('[aria-disabled]')).toHaveAttribute(
      'aria-disabled',
      'true',
    )
  })
})

describe('ChoiceGroup', () => {
  it('exposes the options as a radio group', () => {
    render(
      <ChoiceGroup
        label={en.settings.appearance.title}
        value="system"
        onSelect={jest.fn().mockResolvedValue(undefined)}
        options={THEMES.map((theme) => ({ value: theme, label: en.settings.appearance[theme] }))}
      />,
    )

    expect(
      screen.getByRole('radiogroup', { name: en.settings.appearance.title }),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('radio')).toHaveLength(3)
    expect(screen.getByRole('radio', { name: en.settings.appearance.system })).toBeChecked()
  })

  it('selects optimistically and calls the action', async () => {
    const onSelect = jest.fn().mockResolvedValue(undefined)
    render(
      <ChoiceGroup
        label={en.settings.appearance.title}
        value="system"
        onSelect={onSelect}
        options={THEMES.map((theme) => ({ value: theme, label: en.settings.appearance[theme] }))}
      />,
    )

    await userEvent.click(screen.getByRole('radio', { name: en.settings.appearance.dark }))

    expect(onSelect).toHaveBeenCalledWith('dark')
  })

  it('ignores a click on the current value', async () => {
    const onSelect = jest.fn().mockResolvedValue(undefined)
    render(
      <ChoiceGroup
        label={en.settings.language.title}
        value="en"
        onSelect={onSelect}
        options={LOCALES.map((locale) => ({ value: locale, label: LOCALE_LABELS[locale] }))}
      />,
    )

    await userEvent.click(screen.getByRole('radio', { name: LOCALE_LABELS.en }))

    expect(onSelect).not.toHaveBeenCalled()
  })

  it('keeps the UI usable when saving fails', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
    const onSelect = jest.fn().mockRejectedValue(new Error('offline'))
    render(
      <ChoiceGroup
        label={en.settings.language.title}
        value="en"
        onSelect={onSelect}
        options={LOCALES.map((locale) => ({ value: locale, label: LOCALE_LABELS[locale] }))}
      />,
    )

    await userEvent.click(screen.getByRole('radio', { name: LOCALE_LABELS.es }))

    // The optimistic pick reverts to the persisted value once the action fails.
    await waitFor(() => expect(screen.getByRole('radio', { name: LOCALE_LABELS.en })).toBeChecked())
    consoleError.mockRestore()
  })
})

describe('NotificationSettings', () => {
  const labels = {
    master: en.settings.notifications.master,
    description: en.settings.notifications.description,
    disabledHint: en.settings.notifications.disabledHint,
    types: {
      dailyReminder: {
        label: en.settings.notifications.dailyReminder,
        description: en.settings.notifications.dailyReminderBody,
      },
      streakAlert: {
        label: en.settings.notifications.streakAlert,
        description: en.settings.notifications.streakAlertBody,
      },
      weeklyReport: {
        label: en.settings.notifications.weeklyReport,
        description: en.settings.notifications.weeklyReportBody,
      },
    },
  }

  function renderSettings(preferences = defaultPreferences()) {
    const onToggleAll = jest.fn().mockResolvedValue(preferences)
    const onToggleType = jest.fn().mockResolvedValue(preferences)
    render(
      <NotificationSettings
        preferences={preferences}
        labels={labels}
        onToggleAll={onToggleAll}
        onToggleType={onToggleType}
      />,
    )
    return { onToggleAll, onToggleType }
  }

  it('renders the master switch and one switch per type', () => {
    renderSettings()

    expect(screen.getAllByRole('switch')).toHaveLength(4)
    expect(screen.getByRole('switch', { name: labels.master })).toBeChecked()
    expect(
      screen.getByRole('switch', { name: en.settings.notifications.weeklyReport }),
    ).not.toBeChecked()
  })

  it('saves a type toggle', async () => {
    const { onToggleType } = renderSettings()

    await userEvent.click(
      screen.getByRole('switch', { name: en.settings.notifications.streakAlert }),
    )

    expect(onToggleType).toHaveBeenCalledWith('streakAlert', false)
  })

  it('disables the types when notifications are off', () => {
    renderSettings({ enabled: false, types: defaultPreferences().types })

    expect(
      screen.getByRole('switch', { name: en.settings.notifications.dailyReminder }),
    ).toBeDisabled()
    expect(screen.getByText(labels.disabledHint)).toBeInTheDocument()
  })

  it('disables the types as soon as the master switch is turned off', async () => {
    // Hold the action open: the optimistic state is what the user sees until
    // the server answers and the page re-renders with fresh props.
    let finish!: () => void
    const inFlight = new Promise<void>((resolve) => {
      finish = resolve
    })
    const onToggleAll = jest.fn().mockReturnValue(inFlight)
    render(
      <NotificationSettings
        preferences={defaultPreferences()}
        labels={labels}
        onToggleAll={onToggleAll}
        onToggleType={jest.fn().mockResolvedValue(undefined)}
      />,
    )

    await userEvent.click(screen.getByRole('switch', { name: labels.master }))

    expect(onToggleAll).toHaveBeenCalledWith(false)
    await waitFor(() =>
      expect(
        screen.getByRole('switch', { name: en.settings.notifications.dailyReminder }),
      ).toBeDisabled(),
    )

    finish()
    await waitFor(() => expect(screen.getByRole('switch', { name: labels.master })).toBeChecked())
  })
})

describe('PreferenceSwitch', () => {
  it('flips optimistically and persists', async () => {
    const onChange = jest.fn().mockResolvedValue(true)
    render(
      <PreferenceSwitch
        label={en.settings.general.reduceMotion}
        checked={false}
        onChange={onChange}
      />,
    )

    await userEvent.click(screen.getByRole('switch'))

    expect(onChange).toHaveBeenCalledWith(true)
  })
})

describe('RateAppButton', () => {
  const labels = { action: en.settings.rating.action, unavailable: en.settings.rating.unavailable }

  it('opens the store listing when one is configured', async () => {
    const open = jest.fn()
    Object.defineProperty(window, 'open', { configurable: true, value: open })

    render(<RateAppButton storeUrl="https://store.example/app" labels={labels} />)
    await userEvent.click(screen.getByRole('button', { name: labels.action }))

    expect(open).toHaveBeenCalledWith('https://store.example/app', '_blank', 'noopener,noreferrer')
  })

  it('explains itself when no listing exists yet', async () => {
    render(<RateAppButton labels={labels} />)

    expect(screen.queryByText(labels.unavailable)).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: labels.action }))

    expect(screen.getByText(labels.unavailable)).toBeInTheDocument()
  })
})
