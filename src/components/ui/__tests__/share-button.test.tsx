import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ShareButton } from '@/components/ui/share-button'
import en from '@/lib/i18n/dictionaries/en'

const labels = {
  copied: en.settings.social.copied,
  failed: en.settings.social.failed,
}

function renderButton() {
  render(
    <ShareButton
      title={en.settings.social.shareTitle}
      text={en.settings.social.shareText}
      url="https://habits.example"
      labels={labels}
    >
      {en.settings.social.share}
    </ShareButton>,
  )
  return screen.getByRole('button', { name: en.settings.social.share })
}

function stubNavigator(overrides: Partial<Navigator>) {
  Object.entries(overrides).forEach(([key, value]) => {
    Object.defineProperty(navigator, key, { configurable: true, value })
  })
}

describe('ShareButton', () => {
  afterEach(() => {
    // @ts-expect-error — remove the stubs between tests.
    delete navigator.share
    stubNavigator({
      clipboard: undefined as unknown as Navigator['clipboard'],
    })
  })

  it('uses the platform share sheet when available', async () => {
    const share = jest.fn().mockResolvedValue(undefined)
    stubNavigator({ share })

    await userEvent.click(renderButton())

    expect(share).toHaveBeenCalledWith({
      title: en.settings.social.shareTitle,
      text: en.settings.social.shareText,
      url: 'https://habits.example',
    })
    expect(screen.queryByText(labels.copied)).not.toBeInTheDocument()
  })

  it('falls back to the clipboard where sharing is unavailable', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined)
    stubNavigator({
      clipboard: { writeText } as unknown as Navigator['clipboard'],
    })

    await userEvent.click(renderButton())

    expect(writeText).toHaveBeenCalledWith(`${en.settings.social.shareText} https://habits.example`)
    expect(await screen.findByText(labels.copied)).toBeInTheDocument()
  })

  it('falls back to the clipboard when the share sheet fails', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined)
    stubNavigator({
      share: jest.fn().mockRejectedValue(new Error('dismissed')),
      clipboard: { writeText } as unknown as Navigator['clipboard'],
    })

    await userEvent.click(renderButton())

    expect(await screen.findByText(labels.copied)).toBeInTheDocument()
  })

  it('says so when neither route works', async () => {
    stubNavigator({
      clipboard: {
        writeText: jest.fn().mockRejectedValue(new Error('denied')),
      } as unknown as Navigator['clipboard'],
    })

    await userEvent.click(renderButton())

    expect(await screen.findByText(labels.failed)).toBeInTheDocument()
  })
})
