import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { CheckBox } from '@/components/ui/check-box'
import { Switch } from '@/components/ui/switch'

describe('Switch', () => {
  it('starts from defaultChecked and reports changes', async () => {
    const onCheckedChange = jest.fn()
    render(
      <Switch name="remindersEnabled" label="Get reminders" onCheckedChange={onCheckedChange} />,
    )

    const toggle = screen.getByRole('switch', { name: 'Get reminders' })
    expect(toggle).not.toBeChecked()

    await userEvent.click(toggle)

    expect(toggle).toBeChecked()
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it('submits its state through a hidden input', async () => {
    const { container } = render(<Switch name="remindersEnabled" label="Get reminders" />)
    const hidden = () => container.querySelector('input[name="remindersEnabled"]')

    expect(hidden()).toHaveValue('off')

    await userEvent.click(screen.getByRole('switch'))

    expect(hidden()).toHaveValue('on')
  })
})

describe('CheckBox', () => {
  it('toggles and reports its state', async () => {
    const onCheckedChange = jest.fn()
    render(<CheckBox name="goalEnabled" label="Set a goal" onCheckedChange={onCheckedChange} />)

    const box = screen.getByRole('checkbox', { name: 'Set a goal' })
    await userEvent.click(box)

    expect(box).toBeChecked()
    expect(onCheckedChange).toHaveBeenCalledWith(true)

    await userEvent.click(box)
    expect(box).not.toBeChecked()
    expect(onCheckedChange).toHaveBeenLastCalledWith(false)
  })

  it('can start checked', () => {
    render(<CheckBox name="repeatAll" label="Repeat every day" defaultChecked />)
    expect(screen.getByRole('checkbox', { name: 'Repeat every day' })).toBeChecked()
  })
})
